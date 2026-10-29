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

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {

    // Storage full or blocked: the chat keeps working for this visit.
  }}

export function readSession(id: string): CopilotSession | null {
  return read<Record<string, CopilotSession>>(SESSIONS, {})[id] ?? null;
}

export function saveSession(s: CopilotSession) {
  const all = read<Record<string, CopilotSession>>(SESSIONS, {});
  all[s.id] = s;
  write(SESSIONS, all);
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

export function saveDraft(d: CopilotDraft) {
  const all = read<Record<string, CopilotDraft>>(DRAFTS, {});
  all[d.id] = d;
  write(DRAFTS, all);
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