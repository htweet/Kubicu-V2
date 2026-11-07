import type { WorkspacePlan } from '../types/plan';
import type { AccountInvite, AccountMember, AiCreditFigures, AuditEvent, TeamPolicies } from '../types/accountMode';

/**
 * Account mode sample data (D529). ILLUSTRATIVE ONLY — engineering replaces every value with the live API.
 * Figures marked "server" are copied from the engineering brief (6 Nov 2026) and must not be changed here.
 */

/** Server: seats per plan. Pending invites count as seats. */
export const accountSeats: Record<WorkspacePlan, number> = { free: 1, creator: 1, pro: 1, business: 5, agency: 25, enterprise: 100 };

/** Server: monthly AI credits per plan (calendar month, UTC). */
export const accountAiCredits: Record<WorkspacePlan, number> = { free: 10, creator: 60, pro: 200, business: 500, agency: 1500, enterprise: 5000 };

/** Server: sensitive actions need a sign-in from the last 15 minutes. */
export const STEP_UP_WINDOW_MINUTES = 15;
/** Server: invite links expire after 7 days. */
export const INVITE_EXPIRY_DAYS = 7;
/** Server: the activity log returns 50 events at a time. */
export const AUDIT_PAGE_SIZE = 50;
/** Sample only: smaller pages so "Load older" can be previewed with a short sample list. */
export const SAMPLE_AUDIT_PAGE_SIZE = 6;
/** Sample only: wait shown by "too many tries" on the code step. */
export const SAMPLE_STEP_UP_LOCK_MINUTES = 10;
/** Sample only: wait shown by the shared "rate limited" state. */
export const SAMPLE_RATE_LIMIT_SECONDS = 30;
/** Sample only: most workspaces one person may own (the server sends the real figure). */
export const SAMPLE_OWNED_WORKSPACE_LIMIT = 3;

export const sampleAccountEmail = 'adaeze@adaezeatelier.com';
export const sampleInviterName = 'Adaeze Okafor';
export const sampleInviteWorkspace = 'Adaeze Atelier';

export const sampleAccountMembers: AccountMember[] = [
  { id: 'acc_owner', name: 'Adaeze Okafor', contact: 'adaeze@adaezeatelier.com', role: 'owner', spaceIds: null, branchId: null, joinedAt: '2026-03-02T09:00:00.000Z' },
  { id: 'acc_admin', name: 'Tunde Bakare', contact: 'tunde@adaezeatelier.com', role: 'admin', spaceIds: null, branchId: null, joinedAt: '2026-04-11T10:30:00.000Z' },
  { id: 'acc_editor', name: 'Wanjiru Kamau', contact: '+254 712 345 678', role: 'editor', spaceIds: null, branchId: null, joinedAt: '2026-06-20T14:15:00.000Z' },
  { id: 'acc_sales', name: 'Kofi Mensah', contact: 'kofi@adaezeatelier.com', role: 'sales', spaceIds: null, branchId: null, joinedAt: '2026-09-05T08:45:00.000Z' },
];

export const sampleAccountInvites: AccountInvite[] = [
  { id: 'acc_inv_1', contact: 'zanele@example.com', role: 'viewer', expiresAt: '2026-11-11T09:00:00.000Z' },
];

/** Newest first. Actor ids that match no member show as "Someone no longer in the team"; 'system' shows as Kubicu. */
export const sampleAuditEvents: AuditEvent[] = [
  { id: 'ev_12', action: 'invite.created', actorId: 'acc_owner', target: 'zanele@example.com', at: '2026-11-04T09:00:00.000Z' },
  { id: 'ev_11', action: 'settings.changed', actorId: 'acc_admin', target: 'Sales refund limit', at: '2026-11-03T16:20:00.000Z' },
  { id: 'ev_10', action: 'member.role_changed', actorId: 'acc_owner', target: 'Kofi Mensah', at: '2026-11-02T11:05:00.000Z' },
  { id: 'ev_09', action: 'invite.cancelled', actorId: 'acc_admin', target: 'chidi@example.com', at: '2026-10-30T13:40:00.000Z' },
  { id: 'ev_08', action: 'member.joined', actorId: 'acc_sales', target: 'Kofi Mensah', at: '2026-09-05T08:45:00.000Z' },
  { id: 'ev_07', action: 'member.removed', actorId: 'acc_former', target: 'Musa Bello', at: '2026-08-21T10:00:00.000Z' },
  { id: 'ev_06', action: 'invite.expired', actorId: 'system', target: 'thandi@example.com', at: '2026-08-01T00:00:00.000Z' },
  { id: 'ev_05', action: 'settings.changed', actorId: 'acc_owner', target: 'Publishing needs review', at: '2026-07-14T09:30:00.000Z' },
  { id: 'ev_04', action: 'member.joined', actorId: 'acc_editor', target: 'Wanjiru Kamau', at: '2026-06-20T14:15:00.000Z' },
  { id: 'ev_03', action: 'member.joined', actorId: 'acc_admin', target: 'Tunde Bakare', at: '2026-04-11T10:30:00.000Z' },
  { id: 'ev_02', action: 'workspace.created', actorId: 'acc_owner', target: 'Adaeze Atelier', at: '2026-03-02T09:00:00.000Z' },
  { id: 'ev_01', action: 'ownership.transferred', actorId: 'system', target: 'Adaeze Okafor', at: '2026-03-02T09:00:00.000Z' },
];

/** Plain-language names for audit actions. Unknown actions show their raw id. */
export const auditActionLabels: Record<string, string> = {
  'member.role_changed': 'Changed a role',
  'member.removed': 'Removed someone',
  'member.joined': 'Joined the team',
  'member.left': 'Left the team',
  'invite.created': 'Created an invite',
  'invite.cancelled': 'Cancelled an invite',
  'invite.expired': 'Invite expired',
  'ownership.transferred': 'Transferred ownership',
  'workspace.created': 'Created the workspace',
  'workspace.archived': 'Archived the workspace',
  'settings.changed': 'Changed a setting',
};

/** Sample credit figures for the current month; `allowance` is replaced by accountAiCredits[plan]. */
export const sampleAiCredits: AiCreditFigures = { allowance: 200, committed: 74, held: 12, available: 114, unsettledCharges: 0, unsettledCredits: 0 };
/** Used when the Controls panel previews unsettled charges. */
export const sampleUnsettled = { unsettledCharges: 2, unsettledCredits: 9 };

export const sampleTeamPolicies: TeamPolicies = { adminsCanPayOut: false, salesRefundLimit: 50000, publishingNeedsReview: true, separationOfDuties: false };
