import type { CopilotDraft } from '../../types/copilot';
import { isExpired, readDraft, saveDraft } from './store';

/**
 * Claiming a Copilot draft (D264). The preview link only lets someone look. Continuing needs the draft's
 * one-time claim code, which only the chat that made it holds: tapping "Continue in KUBICU" in that chat
 * starts a claim on this device. The code never appears in a URL or on screen. In production the chat
 * sends a short-lived signed link instead, and the server checks and spends the code once.
 */

const PENDING = 'kubicu.copilot.claim';
const WELCOME = 'kubicu.copilot.welcome';

/** Example figure: a continue link works for 30 minutes after it's tapped. */
export const CLAIM_MINUTES = 30;

export type ClaimStep = 'choose' | 'signup' | 'verify' | 'setup' | 'signin' | 'workspace';

export interface PendingClaim {
  draftId: string;
  code: string;
  step: ClaimStep;
  name?: string;
  email?: string;
  startedAt: string;
  expiresAt: string;
}

export type ClaimStatus =
{kind: 'none';} |
{kind: 'missing';} |
{kind: 'expired';draft: CopilotDraft | null;reason: 'link' | 'draft';} |
{kind: 'claimed';draft: CopilotDraft;} |
{kind: 'invalid';draft: CopilotDraft;} |
{kind: 'ok';draft: CopilotDraft;pending: PendingClaim;};

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key);else
    localStorage.setItem(key, JSON.stringify(value));
  } catch {

    // Storage blocked: the claim simply has to be started again from the chat.
  }}

/** Called only by the chat that made the draft — it holds the code. */
export function startClaim(draftId: string): boolean {
  const draft = readDraft(draftId);
  if (!draft) return false;
  const existing = read<PendingClaim>(PENDING);
  // Tapping Continue again resumes a claim already under way rather than starting over.
  if (existing && existing.draftId === draftId && new Date(existing.expiresAt).getTime() > Date.now()) return true;
  const now = Date.now();
  write(PENDING, { draftId, code: draft.claimCode, step: 'choose', startedAt: new Date(now).toISOString(), expiresAt: new Date(now + CLAIM_MINUTES * 60_000).toISOString() } satisfies PendingClaim);
  return true;
}

export function readClaim(): PendingClaim | null {
  return read<PendingClaim>(PENDING);
}

export function updateClaim(patch: Partial<PendingClaim>) {
  const p = readClaim();
  if (p) write(PENDING, { ...p, ...patch });
}

export function clearClaim() {
  write(PENDING, null);
}

export function claimStatus(forceExpired: boolean): ClaimStatus {
  const pending = readClaim();
  if (!pending) return { kind: 'none' };
  const draft = readDraft(pending.draftId);
  if (!draft) return { kind: 'missing' };
  if (draft.claimed) return { kind: 'claimed', draft };
  if (isExpired(draft)) return { kind: 'expired', draft, reason: 'draft' };
  if (forceExpired || new Date(pending.expiresAt).getTime() <= Date.now()) return { kind: 'expired', draft, reason: 'link' };
  if (pending.code !== draft.claimCode) return { kind: 'invalid', draft };
  return { kind: 'ok', draft, pending };
}

/** Spends the code: the draft is now a page in a workspace and can't be claimed again. */
export function markClaimed(draftId: string, claimed: NonNullable<CopilotDraft['claimed']>) {
  const draft = readDraft(draftId);
  if (draft) saveDraft({ ...draft, claimed });
  clearClaim();
}

/** The one-time welcome panel shown when the claimed page first opens in the canvas. */
export interface CopilotWelcome {
  pageId: string;
  title: string;
  gaps: string[];
  asSpace: boolean;
}

export function writeCopilotWelcome(w: CopilotWelcome) {
  write(WELCOME, w);
}

export function readCopilotWelcome(pageId: string): CopilotWelcome | null {
  const w = read<CopilotWelcome>(WELCOME);
  return w && w.pageId === pageId ? w : null;
}

export function clearCopilotWelcome() {
  write(WELCOME, null);
}