import type { CopilotDraft, CopilotSession } from '../../types/copilot';
import { uid } from '../id';

/**
 * Where Copilot keeps chats and drafts (D262). In the prototype it's this browser's storage; in production
 * drafts, claim codes, expiry and daily limits live on a server (see docs/COPILOT_SPEC.md).
 */

const SESSIONS = 'kubicu.copilot.sessions';
const DRAFTS = 'kubicu.copilot.drafts';
const USAGE = 'kubicu.copilot.usage';
const CURRENT = 'kubicu.copilot.current';
const PINS = 'kubicu.copilot.pins';

/** Fired on this tab whenever chats or pins change, so the sidebar and chat list stay in step. */
export const CHATS_EVENT = 'kubicu:copilot-chats';

function notify() {
  try {
    window.dispatchEvent(new Event(CHATS_EVENT));
  } catch {

    // Not in a browser — nothing to tell.
  }}

/** Example figures: unclaimed drafts last 7 days; 3 drafts and 10 changes a day per phone number or browser. */
export const DRAFT_DAYS = 7;
export const DRAFTS_PER_DAY = 3;
export const CHANGES_PER_DAY = 10;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function tryWrite(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/**
 * Saves, and if the browser's storage is full, clears out what's no longer needed — old chats, expired
 * drafts — then tries again (D265). Returns false only if it still can't save, so the chat can warn.
 */
function write(key: string, value: unknown, keepId?: string): boolean {
  if (tryWrite(key, value)) return true;
  const sessions = key === SESSIONS ? keepCurrent(value as Record<string, CopilotSession>, keepId) : undefined;
  prune(sessions);
  return tryWrite(key, sessions ?? value);
}

function keepCurrent(sessions: Record<string, CopilotSession>, keepId?: string): Record<string, CopilotSession> {
  // Pinned chats are kept too: pinning is a promise the chat won't be cleared out.
  const current = new Set([...Object.values(read<Record<string, string>>(CURRENT, {})), ...read<string[]>(PINS, [])]);
  if (keepId) current.add(keepId);
  return Object.fromEntries(Object.entries(sessions).filter(([id]) => current.has(id)));
}

function prune(sessions?: Record<string, CopilotSession>) {
  const now = Date.now();
  const drafts = read<Record<string, CopilotDraft>>(DRAFTS, {});
  const liveDrafts = Object.fromEntries(Object.entries(drafts).filter(([, d]) => d.claimed || new Date(d.expiresAt).getTime() > now));
  tryWrite(DRAFTS, liveDrafts);
  tryWrite(SESSIONS, sessions ?? keepCurrent(read<Record<string, CopilotSession>>(SESSIONS, {})));
}

export function readSession(id: string): CopilotSession | null {
  return read<Record<string, CopilotSession>>(SESSIONS, {})[id] ?? null;
}

export function saveSession(s: CopilotSession): boolean {
  const all = read<Record<string, CopilotSession>>(SESSIONS, {});
  all[s.id] = s;
  const ok = write(SESSIONS, all, s.id);
  notify();
  return ok;
}

/** Chats someone has actually started (said something in), newest first. */
export function listSessions(channel: CopilotSession['channel']): CopilotSession[] {
  return Object.values(read<Record<string, CopilotSession>>(SESSIONS, {})).
  filter((s) => s.channel === channel && s.messages.some((m) => m.from === 'user')).
  sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/** A short name for a chat: the business name once known, otherwise their first words. */
export function sessionTitle(s: CopilotSession): string {
  const firstWords = s.messages.find((m) => m.from === 'user' && m.text.trim())?.text.trim();
  const title = s.brief?.name || s.answers.name || s.answers.businessText || firstWords || 'New chat';
  return title.length > 60 ? `${title.slice(0, 57).trimEnd()}…` : title;
}

/** Pinned chat ids, most recently pinned first. */
export function pinnedIds(): string[] {
  return read<string[]>(PINS, []);
}

export function togglePin(id: string): boolean {
  const pins = pinnedIds();
  const pinned = pins.includes(id);
  write(PINS, pinned ? pins.filter((p) => p !== id) : [id, ...pins]);
  notify();
  return !pinned;
}

export function deleteSession(id: string) {
  const all = read<Record<string, CopilotSession>>(SESSIONS, {});
  delete all[id];
  write(SESSIONS, all);
  write(PINS, pinnedIds().filter((p) => p !== id));
  const current = read<Record<string, string>>(CURRENT, {});
  write(CURRENT, Object.fromEntries(Object.entries(current).filter(([, v]) => v !== id)));
  notify();
}

/** The chat in progress on this device for a channel, so leaving and coming back continues it. */
export function currentSessionId(channel: CopilotSession['channel']): string | null {
  return read<Record<string, string>>(CURRENT, {})[channel] ?? null;
}

export function setCurrentSession(channel: CopilotSession['channel'], id: string | null) {
  const all = read<Record<string, string>>(CURRENT, {});
  if (id) all[channel] = id;else
  delete all[channel];
  write(CURRENT, all);
}

export function readDraft(id: string): CopilotDraft | null {
  return read<Record<string, CopilotDraft>>(DRAFTS, {})[id] ?? null;
}

export function saveDraft(d: CopilotDraft): boolean {
  const all = read<Record<string, CopilotDraft>>(DRAFTS, {});
  all[d.id] = d;
  return write(DRAFTS, all);
}

export function isExpired(d: CopilotDraft, now = Date.now()): boolean {
  return !d.claimed && new Date(d.expiresAt).getTime() <= now;
}

export function newDraftIds(): {id: string;claimCode: string;expiresAt: string;} {
  const code = Array.from({ length: 3 }, () => Math.random().toString(36).slice(2, 6)).join('');
  return { id: uid('cp'), claimCode: code, expiresAt: new Date(Date.now() + DRAFT_DAYS * 86_400_000).toISOString() };
}

interface Usage {
  day: string;
  counts: Record<string, {drafts: number;changes: number;}>;
}

const today = () => new Date().toISOString().slice(0, 10);

function usageFor(key: string) {
  const u = read<Usage>(USAGE, { day: today(), counts: {} });
  const fresh = u.day === today() ? u : { day: today(), counts: {} };
  return { u: fresh, c: fresh.counts[key] ?? { drafts: 0, changes: 0 } };
}

/** Limits count per WhatsApp number, or per browser on the web. */
export function usageKey(s: Pick<CopilotSession, 'channel' | 'chatPhone'>): string {
  return s.channel === 'whatsapp' && s.chatPhone ? `wa:${s.chatPhone}` : 'web';
}

export function remaining(key: string): {drafts: number;changes: number;} {
  const { c } = usageFor(key);
  return { drafts: Math.max(0, DRAFTS_PER_DAY - c.drafts), changes: Math.max(0, CHANGES_PER_DAY - c.changes) };
}

export function spend(key: string, what: 'drafts' | 'changes') {
  const { u, c } = usageFor(key);
  u.counts[key] = { ...c, [what]: c[what] + 1 };
  write(USAGE, u);
}