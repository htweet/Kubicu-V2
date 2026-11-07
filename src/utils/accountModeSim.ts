import type { AccountAction, AccountResult, AccountSimulation } from '../types/accountMode';
import { SAMPLE_RATE_LIMIT_SECONDS, SAMPLE_STEP_UP_LOCK_MINUTES, STEP_UP_WINDOW_MINUTES } from '../data/accountModeSamples';

/**
 * Simulated server for account mode (D529). ENGINEERING REPLACES THIS FILE with the API client:
 * keep the `simulate` signature (action → AccountResult) and the screens need no changes.
 * No network calls are made here.
 */

const DELAY_MS = 700;
let stepUpVerifiedAt = 0;

/** Called when the "Confirm it's you" code is accepted. */
export function markStepUpVerified(): void {
  stepUpVerifiedAt = Date.now();
}

function stepUpFresh(): boolean {
  return Date.now() - stepUpVerifiedAt < STEP_UP_WINDOW_MINUTES * 60_000;
}

/** Actions that act on one workspace (lost access applies). */
const workspaceScoped: AccountAction[] = ['team.load', 'member.update', 'member.remove', 'member.leave', 'invite.create', 'invite.cancel', 'ownership.transfer', 'workspace.archive', 'settings.save', 'policy.save', 'audit.load', 'credits.load', 'runs.load', 'run.start', 'run.cancel', 'approval.decide'];
const refusable: AccountAction[] = ['member.update', 'member.remove', 'ownership.transfer', 'workspace.archive', 'settings.save', 'policy.save'];
const conflictable: AccountAction[] = ['member.update', 'member.remove', 'invite.cancel'];

interface SimOptions<T> {
  data?: T;
  /** The server needs a recent sign-in for this action. */
  stepUp?: boolean;
  /** The server's wording when it refuses this action. */
  refusal?: string;
  /** The code typed on the step-up screen. */
  code?: string;
}

function outcome<T>(action: AccountAction, sim: AccountSimulation, opts: SimOptions<T>): AccountResult<T> {
  if (sim === 'offline') return { ok: false, code: 'offline' };
  if (sim === 'serverDown') return { ok: false, code: 'server_unavailable' };
  if (sim === 'rateLimited' && action !== 'stepUp.verify') return { ok: false, code: 'rate_limited', retryAfterSeconds: SAMPLE_RATE_LIMIT_SECONDS };
  if (sim === 'sessionEnded' && !action.startsWith('stepUp')) return { ok: false, code: 'session_ended' };
  if (sim === 'lostAccess' && workspaceScoped.includes(action)) return { ok: false, code: 'lost_access' };

  if (action === 'stepUp.send' && sim === 'stepUpRateLimited') return { ok: false, code: 'rate_limited', retryAfterSeconds: SAMPLE_STEP_UP_LOCK_MINUTES * 60 };
  // Prototype: 000000 stands for a wrong or expired code.
  if (action === 'stepUp.verify' && opts.code === '000000') return { ok: false, code: 'refused' };
  if (opts.stepUp && (sim === 'stepUpRequired' || sim === 'stepUpRateLimited') && !stepUpFresh()) return { ok: false, code: 'step_up_required' };

  if (sim === 'noSeats' && (action === 'invite.create' || action === 'invite.accept')) return { ok: false, code: 'no_seats' };
  if (sim === 'refused' && refusable.includes(action)) return { ok: false, code: 'refused', message: opts.refusal };
  if (sim === 'conflict' && conflictable.includes(action)) return { ok: false, code: 'conflict' };
  // Batch 2 (D549)
  if (action === 'run.start' && sim === 'queueFull') return { ok: false, code: 'queue_full' };
  if (action === 'run.start' && sim === 'aiOff') return { ok: false, code: 'ai_off' };
  if (action === 'approval.decide' && sim === 'approvalExpired') return { ok: false, code: 'approval_expired' };
  if (action === 'approval.decide' && sim === 'approvalDecidedElsewhere') return { ok: false, code: 'already_decided' };
  return { ok: true, data: opts.data as T };
}

/** Ask the simulated server to run an action. Resolves after a short delay so in-progress states are visible. */
export function simulate<T = undefined>(action: AccountAction, sim: AccountSimulation, opts: SimOptions<T> = {}): Promise<AccountResult<T>> {
  return new Promise((resolve) => window.setTimeout(() => resolve(outcome(action, sim, opts)), DELAY_MS));
}
