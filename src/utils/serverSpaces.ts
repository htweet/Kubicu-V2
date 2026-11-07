import type { PersistedPage, SpaceKind } from '../types/workspace';
import { realAuthEnabled } from './auth/realAuth';
import { api, ApiError } from './auth/session';

/**
 * Server page store (S2; AI-Engine post-m2-review/17). With real sign-in, a browser workspace linked to the account
 * (Account → Workspaces) keeps its pages on the server. The editor is unchanged: the browser copy stays its working
 * copy (so editing works offline), and this module pushes each save to the server with the revision it was based on,
 * and brings in a newer server copy when the editor opens. A save based on an older revision is refused by the server
 * (409) and shown with the editor's own conflict choice. Without real sign-in nothing here runs.
 */

/** What the editor's save hears back from the server. */
export type SyncResult =
  | { kind: 'saved' }
  | { kind: 'conflict'; remote: PersistedPage }
  | { kind: 'offline' }
  | { kind: 'refused'; message: string }
  | { kind: 'error' };

export interface PageSync {
  /** Sends the page saved in the browser. `force` keeps this copy over a newer one on the server (keep mine). */
  push(page: PersistedPage, force: boolean): Promise<SyncResult>;
  /** After a conflict, the owner took the server's copy: later saves build on its revision. */
  adoptRemote(): void;
}

interface SyncMeta {
  serverWorkspaceId: string;
  serverSpaceId: string;
  /** The server revision the browser copy is based on. */
  revision: number;
  /** The browser copy has changes the server has not accepted yet. */
  dirty: boolean;
}

const metaKey = (storageKey: string) => `kubicu.serverSync.v1.${storageKey}`;
const mapKey = (localWorkspaceId: string) => `kubicu.serverSpaces.v1.${localWorkspaceId}`;

function readJson<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function writeJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable: the server copy still holds the page.
  }
}

export const readSyncMeta = (storageKey: string): SyncMeta | null => readJson<SyncMeta>(metaKey(storageKey));
const writeSyncMeta = (storageKey: string, meta: SyncMeta): void => writeJson(metaKey(storageKey), meta);

/** Which server space holds each local space of a workspace (the main space is the server's main space). */
export function serverSpaceIdFor(localWorkspaceId: string, localSpaceId: string): string | null {
  return readJson<Record<string, string>>(mapKey(localWorkspaceId))?.[localSpaceId] ?? null;
}
export function rememberServerSpace(localWorkspaceId: string, localSpaceId: string, serverSpaceId: string): void {
  writeJson(mapKey(localWorkspaceId), { ...(readJson<Record<string, string>>(mapKey(localWorkspaceId)) ?? {}), [localSpaceId]: serverSpaceId });
}

let links: Promise<Map<string, string>> | null = null;
/** The account workspace a browser workspace is linked to (completed primary import), or null. Fetched once. */
export async function serverWorkspaceFor(localWorkspaceId: string): Promise<string | null> {
  if (!realAuthEnabled()) return null;
  links ??= api<{ imports: Array<{ workspaceId: string; legacyWorkspaceId: string; mode: string; status: string }> }>('GET', '/v1/imports')
    .then((r) => new Map(r.imports.filter((i) => i.mode === 'primary' && i.status === 'completed').map((i) => [i.legacyWorkspaceId, i.workspaceId])))
    .catch(() => {
      links = null;
      return new Map<string, string>();
    });
  return (await links).get(localWorkspaceId) ?? null;
}
export const SERVER_LINK_EVENT = 'kubicu:server-link';
/** A workspace was linked to the account, or a link was undone: look the links up again and reconnect the editor. */
export function announceServerLinkChange(): void {
  links = null;
  window.dispatchEvent(new Event(SERVER_LINK_EVENT));
}

interface ServerSpace { id: string; kind: SpaceKind; name: string }
interface ServerPage { space: ServerSpace; revision: number; page: PersistedPage }

const isOffline = (e: unknown): boolean => !(e instanceof ApiError) || e.status === 0 || e.code === 'unavailable';

/**
 * Connects one local space to its server space and brings the browser copy up to date. Returns the sync to give the
 * editor, plus what to do with the browser copy: keep it, take the server's (reload), or show a conflict.
 */
export async function connectSpace(o: {
  localWorkspaceId: string;
  localSpaceId: string;
  isMain: boolean;
  kind: SpaceKind;
  name: string;
  storageKey: string;
  local: PersistedPage;
}): Promise<{ sync: PageSync; outcome: 'kept' | 'created' | 'dirty' | { take: PersistedPage } | { conflict: PersistedPage } } | null> {
  const serverWorkspaceId = await serverWorkspaceFor(o.localWorkspaceId);
  if (!serverWorkspaceId) return null;
  const base = `/v1/workspaces/${serverWorkspaceId}/spaces`;
  let serverSpaceId = serverSpaceIdFor(o.localWorkspaceId, o.localSpaceId);
  let server: ServerPage | null = null;
  if (!serverSpaceId && o.isMain) {
    const list = await api<{ spaces: ServerSpace[] }>('GET', base);
    serverSpaceId = list.spaces.find((s) => s.kind === 'main')?.id ?? null;
  }
  if (serverSpaceId) {
    try {
      server = await api<ServerPage>('GET', `${base}/${serverSpaceId}`);
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 404)) throw e;
      serverSpaceId = null;
    }
  }
  let outcome: 'kept' | 'created' | 'dirty' | { take: PersistedPage } | { conflict: PersistedPage } = 'kept';
  if (!server) {
    // The first time this space reaches the server: the browser copy moves over as it is.
    server = await api<ServerPage>('POST', base, { kind: o.isMain ? 'main' : o.kind, name: o.name.slice(0, 80) || 'My page', page: o.local });
    serverSpaceId = server.space.id;
    writeSyncMeta(o.storageKey, { serverWorkspaceId, serverSpaceId, revision: server.revision, dirty: false });
    outcome = 'created';
  } else {
    const meta = readSyncMeta(o.storageKey);
    if (!meta || meta.serverSpaceId !== serverSpaceId) {
      // First time on this device: the server copy wins.
      writeSyncMeta(o.storageKey, { serverWorkspaceId, serverSpaceId: serverSpaceId!, revision: server.revision, dirty: false });
      outcome = { take: server.page };
    } else if (meta.revision === server.revision) {
      outcome = meta.dirty ? 'dirty' : 'kept';
    } else if (meta.dirty) {
      // Changed here while offline, and somewhere else too: the owner chooses.
      outcome = { conflict: server.page };
    } else {
      writeSyncMeta(o.storageKey, { ...meta, revision: server.revision });
      outcome = { take: server.page };
    }
  }
  rememberServerSpace(o.localWorkspaceId, o.localSpaceId, serverSpaceId!);

  // One push at a time; a save made while one is in flight is sent after it, with the newest copy only. A save that
  // only repeats what the server already has (e.g. right after opening the server's copy) is not sent again.
  const signature = (p: PersistedPage): string => JSON.stringify({ ...p, lastSavedAt: null });
  let latestRevision = readSyncMeta(o.storageKey)!.revision;
  let lastSynced = signature(server.page);
  let inFlight: Promise<SyncResult> | null = null;
  let queued: { page: PersistedPage; force: boolean } | null = null;

  const send = async (page: PersistedPage, force: boolean): Promise<SyncResult> => {
    const meta = readSyncMeta(o.storageKey)!;
    writeSyncMeta(o.storageKey, { ...meta, dirty: true });
    const expected = force ? latestRevision : meta.revision;
    try {
      const r = await api<{ revision: number }>('PATCH', `${base}/${serverSpaceId}/page`, { expectedRevision: expected, page });
      latestRevision = r.revision;
      lastSynced = signature(page);
      writeSyncMeta(o.storageKey, { ...meta, revision: r.revision, dirty: false });
      return { kind: 'saved' };
    } catch (e) {
      const current = e instanceof ApiError && e.status === 409 ? (e.body as { current?: { revision: number; page: PersistedPage } } | undefined)?.current : undefined;
      if (current) {
        latestRevision = current.revision;
        lastSynced = signature(current.page);
        return { kind: 'conflict', remote: current.page };
      }
      if (e instanceof ApiError && (e.status === 403 || e.status === 413 || e.status === 422)) return { kind: 'refused', message: e.detail ?? e.message };
      if (isOffline(e)) return { kind: 'offline' };
      return { kind: 'error' };
    }
  };

  const sync: PageSync = {
    adoptRemote() {
      const meta = readSyncMeta(o.storageKey)!;
      writeSyncMeta(o.storageKey, { ...meta, revision: latestRevision, dirty: false });
    },
    push(page, force) {
      if (!force && !inFlight && signature(page) === lastSynced && !readSyncMeta(o.storageKey)?.dirty) return Promise.resolve({ kind: 'saved' });
      if (inFlight) {
        queued = { page, force: force || queued?.force === true };
        return inFlight.then(() => {
          if (!queued) return { kind: 'saved' } as SyncResult;
          const next = queued;
          queued = null;
          return sync.push(next.page, next.force);
        });
      }
      inFlight = send(page, force).finally(() => {
        inFlight = null;
      });
      return inFlight;
    }
  };
  return { sync, outcome };
}
