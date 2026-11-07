import type { Role } from './team';

/**
 * Account mode (D529): the shapes the real server returns, used by the presentational states.
 * Engineering replaces `utils/accountModeSim.ts` with the API client; these types stay.
 */

/** Which outcome the Controls panel asks the simulated server to return. Mirrors the union in App.tsx. */
export type AccountSimulation =
  | 'normal'
  | 'stepUpRequired'
  | 'stepUpRateLimited'
  | 'offline'
  | 'serverDown'
  | 'rateLimited'
  | 'lostAccess'
  | 'sessionEnded'
  | 'noSeats'
  | 'refused'
  | 'conflict'
  | 'logUnverified'
  | 'unsettledCharges'
  | 'empty'
  // Batch 2 — AI runs and approvals (D549)
  | 'queueFull'
  | 'aiOff'
  | 'approvalExpired'
  | 'approvalDecidedElsewhere'
  | 'ownRequest'
  | 'runFailed'
  | 'runTimedOut';

export type AccountErrorCode =
  | 'step_up_required'
  | 'offline'
  | 'server_unavailable'
  | 'rate_limited'
  | 'lost_access'
  | 'session_ended'
  | 'no_seats'
  | 'refused'
  | 'conflict'
  | 'cancelled'
  // Batch 2 (D549)
  | 'queue_full'
  | 'ai_off'
  | 'approval_expired'
  | 'already_decided';

export type AccountFailure = { ok: false; code: AccountErrorCode; message?: string; retryAfterSeconds?: number };
export type AccountResult<T = undefined> = { ok: true; data: T } | AccountFailure;

export type AccountAction =
  | 'team.load'
  | 'member.update'
  | 'member.remove'
  | 'member.leave'
  | 'invite.create'
  | 'invite.cancel'
  | 'invite.accept'
  | 'ownership.transfer'
  | 'workspace.create'
  | 'workspace.archive'
  | 'settings.save'
  | 'policy.save'
  | 'session.signOutEverywhere'
  | 'audit.load'
  | 'credits.load'
  | 'stepUp.send'
  | 'stepUp.verify'
  // Batch 2 (D549)
  | 'runs.load'
  | 'run.start'
  | 'run.cancel'
  | 'approval.decide';

export interface AccountMember {
  id: string;
  name: string;
  contact: string;
  role: Role;
  /** Space ids they can edit; null = every space. */
  spaceIds: string[] | null;
  branchId: string | null;
  joinedAt: string;
}

export interface AccountInvite {
  id: string;
  contact: string;
  role: Role;
  expiresAt: string;
  /** Returned once at creation, never again (stored scrambled on the server). */
  link?: string;
}

export interface AuditEvent {
  id: string;
  action: string;
  /** Internal actor id from the server; resolved to a name from the member list. 'system' = Kubicu. */
  actorId: string;
  target: string;
  at: string;
}

export interface AuditPage {
  events: AuditEvent[];
  hasOlder: boolean;
  chainIntact: boolean;
}

export interface AiCreditFigures {
  allowance: number;
  committed: number;
  held: number;
  available: number;
  unsettledCharges: number;
  unsettledCredits: number;
}

export interface TeamPolicies {
  adminsCanPayOut: boolean;
  salesRefundLimit: number;
  publishingNeedsReview: boolean;
  separationOfDuties: boolean;
}
