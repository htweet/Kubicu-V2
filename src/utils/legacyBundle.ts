/**
 * Browser-workspace bundle for "Bring this workspace to your account" (M2.6, D-UI-2; AI-Engine m2/05).
 *
 * These rules mirror AI-Engine `@kubicu/contracts` legacy.ts exactly (a contract test in AI-Engine runs
 * this file and compares results). The server applies the same rules again and rejects anything that
 * breaks them, so this file only decides what to leave out before upload; it cannot let data through.
 */

export const LEGACY_BUNDLE_FORMAT = 1;
export const LEGACY_BUNDLE_MAX_BYTES = 20 * 1024 * 1024;
export const LEGACY_DEMO_WORKSPACE_ID = 'ws_adaeze';
export const LEGACY_UNDO_DAYS = 7;

export const LEGACY_SNAPSHOT_STORES = [
  'editor.v1', 'library', 'mediaFolders', 'mediaFoldersFiled', 'commerce', 'domains', 'ops', 'analytics', 'team',
  'billing', 'marketplace', 'forms', 'formRate', 'opportunities', 'serviceos', 'kit', 'kit.pending', 'proof', 'money',
  'fulfilment', 'whatsapp', 'voice', 'collabs', 'coach', 'printOrders', 'printKit', 'partnerships', 'ai', 'erp',
  'accounting'
] as const;

/** Stores holding pasted credentials or account secrets: never uploaded. */
export const LEGACY_SECRET_STORES = ['providers', 'developers', 'sso'] as const;

export type LegacyKeyClass = 'snapshot' | 'secret' | 'excluded';

const escape = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function classifyLegacyKey(key: string, legacyWorkspaceId: string): LegacyKeyClass {
  const ws = escape(legacyWorkspaceId);
  for (const store of LEGACY_SECRET_STORES) {
    if (new RegExp(`^kubicu\\.${escape(store)}(\\.|$)`).test(key)) return 'secret';
  }
  if (key === 'kubicu.account' || key === 'kubicu.admin' || key.startsWith('kubicu.staffNotifs')) return 'secret';
  for (const store of LEGACY_SNAPSHOT_STORES) {
    if (new RegExp(`^kubicu\\.${escape(store)}\\.${ws}(~[A-Za-z0-9_-]{1,64})?$`).test(key)) return 'snapshot';
  }
  if (new RegExp(`^kubicu\\.(notifs|assistant)\\.${ws}\\.[A-Za-z0-9_-]{1,64}$`).test(key)) return 'snapshot';
  return 'excluded';
}

/** JSON with object keys sorted at every level (same as the server), so the digest survives re-serialising. */
export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map((v) => (v === undefined ? 'null' : canonicalJson(v))).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).filter(([, v]) => v !== undefined).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

export interface LegacyWorkspaceRecord {
  id: string;
  name: string;
  [key: string]: unknown;
}

export interface LegacyBundle {
  formatVersion: 1;
  legacyWorkspaceId: string;
  exportedAt: string;
  workspace: LegacyWorkspaceRecord;
  entries: Array<{ key: string; valueJson: string }>;
  manifest: Record<string, string>;
  bundleSha256: string;
}

export function legacyBundleDigestInput(b: Pick<LegacyBundle, 'formatVersion' | 'legacyWorkspaceId' | 'workspace' | 'manifest'>): string {
  return canonicalJson([b.formatVersion, b.legacyWorkspaceId, b.workspace, b.manifest]);
}

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Builds a bundle from a storage snapshot ({key: raw string}); pure, so it can be tested outside a browser. */
export async function buildLegacyBundleFrom(storage: Record<string, string>, legacyWorkspaceId: string, now: Date = new Date()): Promise<{ bundle: LegacyBundle; secretKeys: string[] }> {
  const all = JSON.parse(storage['kubicu.workspaces'] ?? '[]') as LegacyWorkspaceRecord[];
  const workspace = Array.isArray(all) ? all.find((w) => w && w.id === legacyWorkspaceId) : undefined;
  if (!workspace) throw new Error('Workspace not found in this browser');
  const keys = Object.keys(storage).sort();
  const entries = keys.filter((k) => classifyLegacyKey(k, legacyWorkspaceId) === 'snapshot').map((key) => ({ key, valueJson: storage[key] ?? '' }));
  // Credentials this workspace keeps in the browser (shown as "re-enter after linking"); never uploaded.
  const secretKeys = keys.filter((k) => classifyLegacyKey(k, legacyWorkspaceId) === 'secret' && LEGACY_SECRET_STORES.some((s) => k.startsWith(`kubicu.${s}`)) && (k.endsWith(`.${legacyWorkspaceId}`) || !/\.ws_/.test(k)));
  const manifest: Record<string, string> = {};
  for (const e of entries) manifest[e.key] = await sha256Hex(e.valueJson);
  const base = { formatVersion: LEGACY_BUNDLE_FORMAT as 1, legacyWorkspaceId, workspace, manifest };
  return { bundle: { ...base, exportedAt: now.toISOString(), entries, bundleSha256: await sha256Hex(legacyBundleDigestInput(base)) }, secretKeys };
}

/** Everything in this browser's localStorage, as raw strings. */
export function readBrowserStorage(): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (k !== null) out[k] = window.localStorage.getItem(k) ?? '';
  }
  return out;
}

/** Human name for a credential store left in the browser. */
export function secretArea(key: string): string {
  if (key.startsWith('kubicu.providers')) return 'Payment and integration keys';
  if (key.startsWith('kubicu.developers')) return 'Developer API keys';
  if (key.startsWith('kubicu.sso')) return 'Single sign-on settings';
  return 'Saved credentials';
}

/** Restores a sealed copy downloaded from the account into this browser (another device). */
export function restoreSealedCopy(sealed: { legacyWorkspaceId: string; workspace: LegacyWorkspaceRecord; entries: Array<{ key: string; valueJson: string }> }): void {
  if (sealed.workspace.id !== sealed.legacyWorkspaceId) throw new Error('Inconsistent copy');
  for (const e of sealed.entries) {
    if (classifyLegacyKey(e.key, sealed.legacyWorkspaceId) !== 'snapshot') continue;
    window.localStorage.setItem(e.key, e.valueJson);
  }
  const list = JSON.parse(window.localStorage.getItem('kubicu.workspaces') ?? '[]') as LegacyWorkspaceRecord[];
  if (!list.some((w) => w.id === sealed.legacyWorkspaceId)) {
    window.localStorage.setItem('kubicu.workspaces', JSON.stringify([...list, { ...sealed.workspace, demoData: null }]));
  }
}
