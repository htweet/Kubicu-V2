import type { WorkspacePlan } from './plan';

/** Super-admin operations (D75b). Stored in the browser for the prototype. */

export type FlagId = 'ai_page_setup' | 'storefront' | 'verified_tick';

export interface FlagState {
  /** Kill switch: off means off for everyone, whatever the plans say. */
  on: boolean;
  /** Plans the feature is released to while it's on. */
  plans: WorkspacePlan[];
  updatedAt: string;
}

export type ReportReason = 'scam' | 'counterfeit' | 'hate' | 'adult' | 'impersonation' | 'copyright' | 'fundraising' | 'other';
export type ReportStatus = 'open' | 'actioned' | 'dismissed';

export interface PageReport {
  id: string;
  handle: string;
  workspaceId: string | null;
  reason: ReportReason;
  details: string;
  reporterEmail: string;
  createdAt: string;
  status: ReportStatus;
  decision: string | null;
  decidedAt: string | null;
  sample?: boolean;
}

export interface Takedown {
  handle: string;
  reason: string;
  at: string;
}

export interface Suspension {
  reason: string;
  at: string;
}

export type TicketStatus = 'open' | 'waiting' | 'solved';
export type TicketTopic = 'billing' | 'payments' | 'pages' | 'account' | 'legal' | 'other';

export interface TicketMessage {
  id: string;
  by: 'customer' | 'staff';
  name: string;
  text: string;
  at: string;
  /** Staff-only note — never shown to the customer. */
  internal?: boolean;
}

export interface SupportTicket {
  id: string;
  number: number;
  workspaceId: string;
  workspaceName: string;
  from: string;
  topic: TicketTopic;
  subject: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
  sample?: boolean;
}

export type AnnouncementTone = 'info' | 'warning';

export interface Announcement {
  id: string;
  title: string;
  body: string;
  tone: AnnouncementTone;
  audience: 'all' | WorkspacePlan;
  active: boolean;
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  area: 'tenants' | 'flags' | 'moderation' | 'support' | 'announcements' | 'pages' | 'orders' | 'data' | 'staff' | 'appeals' | 'payments' | 'escrow' | 'incidents' | 'approvals' | 'access' | 'extensions' | 'plans' | 'ai' | 'integrations' | 'localisation';
  action: string;
  target: string;
  reason: string;
}

/** A staff-only note on a seller's order (Orders & disputes, D82). Keyed `${workspaceId}:${orderId}`. */
export interface OrderStaffNote {
  id: string;
  at: string;
  by: string;
  text: string;
}

export type DataRequestKind = 'export' | 'delete' | 'correct';
export type DataRequestStatus = 'new' | 'in_progress' | 'completed' | 'refused';

/** A personal-data request handled by staff (Data requests, D82). */
export interface DataRequest {
  id: string;
  kind: DataRequestKind;
  /** Account holder (KUBICU customer) or a visitor asking about a seller's records of them. */
  subject: 'account' | 'visitor';
  name: string;
  email: string;
  /** For visitor requests: the workspace that holds their data. */
  workspaceName: string | null;
  details: string;
  receivedAt: string;
  dueAt: string;
  status: DataRequestStatus;
  /** Checklist ids ticked so far. */
  steps: string[];
  /** Outcome note shown to the requester; required to complete or refuse. */
  outcome: string | null;
  closedAt: string | null;
  sample?: boolean;
}

/** KUBICU staff roles (D83). Each role opens a fixed set of Super-admin areas. */
export type StaffRole = 'lead' | 'trust' | 'support' | 'finance' | 'engineering';
export type StaffStatus = 'active' | 'invited' | 'disabled';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  status: StaffStatus;
  /** Two-step sign-in set up. Staff can't use the console without it. */
  twoStep: boolean;
  lastActiveAt: string | null;
  invitedAt: string;
  /** One-time backup codes for a lost phone (D129). Each works once; resetting two-step clears them. */
  backupCodes?: string[];
}

/** High-risk staff actions wait for a second Platform lead (D129). */
export type ApprovalKind = 'staff_role' | 'staff_disable' | 'staff_reset' | 'workspace_suspend' | 'payout_release' | 'plan_change' | 'credit_grant';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn' | 'expired';

export interface PendingApproval {
  id: string;
  kind: ApprovalKind;
  /** Plain-words description, e.g. "Change Dayo Ajayi: Engineering → Platform lead". */
  summary: string;
  targetId: string;
  targetEmail: string;
  /** New role for role changes. */
  role?: StaffRole;
  /** For workspace suspensions and payout releases. */
  workspaceId?: string;
  payoutId?: string;
  amountNgn?: number;
  /** Plan catalogue changes (D135). */
  plan?: WorkspacePlan;
  priceNgn?: number;
  aiCredits?: number;
  /** Credit grants (D135): account credit in ₦, or AI credits. */
  grantKind?: 'account' | 'ai';
  workspaceName?: string;
  reason: string;
  requestedById: string;
  requestedBy: string;
  requestedAt: string;
  expiresAt: string;
  status: ApprovalStatus;
  decidedBy: string | null;
  decidedAt: string | null;
  decisionNote: string | null;
}

/** A periodic check that every staff member still needs the access they have (D129). */
export interface AccessReview {
  id: string;
  startedAt: string;
  startedBy: string;
  completedAt: string | null;
  /** staffId → keep, or flagged for a change (made separately, with a second lead). */
  decisions: Record<string, 'keep' | 'change'>;
}

export type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved';
export type IncidentImpact = 'minor' | 'major' | 'outage';

export interface IncidentUpdate {
  id: string;
  at: string;
  status: IncidentStatus;
  /** Public — shown on /status word for word. */
  message: string;
  by: string;
}

/** A platform incident shown on the public status page (D129). */
export interface Incident {
  id: string;
  title: string;
  impact: IncidentImpact;
  /** Names from data/platformServices. */
  services: string[];
  status: IncidentStatus;
  startedAt: string;
  resolvedAt: string | null;
  updates: IncidentUpdate[];
  sample?: boolean;
}

export type AppealKind = 'takedown' | 'suspension';
export type AppealStatus = 'open' | 'reversed' | 'upheld';

/** An owner asking KUBICU to reconsider a takedown or suspension (D83). */
export interface Appeal {
  id: string;
  kind: AppealKind;
  /** Page link for takedowns. */
  handle: string | null;
  workspaceId: string;
  workspaceName: string;
  from: string;
  /** The staff reason being appealed, copied at the time of the appeal. */
  originalReason: string;
  /** Staff member who made the original decision — they can't decide the appeal. */
  originalBy: string | null;
  statement: string;
  createdAt: string;
  status: AppealStatus;
  /** Shown to the owner word for word. */
  decision: string | null;
  decidedBy: string | null;
  decidedAt: string | null;
  sample?: boolean;
}

export interface AdminStore {
  staff: StaffMember[];
  appeals: Appeal[];
  flags: Record<FlagId, FlagState>;
  reports: PageReport[];
  takedowns: Takedown[];
  suspended: Record<string, Suspension>;
  tickets: SupportTicket[];
  announcements: Announcement[];
  audit: AuditEntry[];
  orderNotes: Record<string, OrderStaffNote[]>;
  dataRequests: DataRequest[];
  approvals: PendingApproval[];
  accessReviews: AccessReview[];
  incidents: Incident[];
  /** Extension versions KUBICU has pulled platform-wide (D130). Keyed by extension id. */
  extensionPulls: Record<string, ExtensionPull>;
  /** Automatic moderation flags staff marked as fine. Keyed `${handle}:${ruleId}`. */
  autoFlagsCleared: Record<string, {at: string;by: string;reason: string;}>;
  /** Approved catalogue changes (D135). Apply to new sign-ups and at each workspace's next renewal. */
  planOverrides: Partial<Record<WorkspacePlan, PlanOverride>>;
  coupons: Coupon[];
  grants: CreditGrant[];
  /** AI features staff have switched off for everyone (D135). */
  aiOff: Partial<Record<AiFeatureId, {at: string;by: string;reason: string;}>>;
  /** Last "Send test" per outside service (D135). */
  integrationTests: Record<string, IntegrationTest>;
  /** Native-speaker review of drafted phrases (D135). Keyed `${lang}::${english}`. */
  phraseReviews: Record<string, PhraseReview>;
  /** Policy versions staff published (D135). Keyed by legal doc slug, newest first. */
  policyReleases: Record<string, PolicyRelease[]>;
  /** Fundraisers staff paused while reviewing (D179). Keyed by page handle. */
  pausedFundraisers?: Record<string, {reason: string;at: string;by: string;}>;
  /** Verified workspaces whose public tick staff have hidden without withdrawing verification (D254). Keyed by workspace id. */
  verifiedTickOff?: Record<string, {reason: string;at: string;by: string;}>;
  /** Fundraisers started on this device, so staff are told about new ones (D179). */
  fundraisers?: {handle: string;workspaceId: string;workspaceName: string;name: string;goalNgn: number;createdAt: string;}[];
}

export interface PlanOverride {
  monthlyNgn: number;
  aiCredits: number;
  approvedAt: string;
  approvedBy: string;
  requestedBy: string;
  reason: string;
}

export type CouponKind = 'percent' | 'fixed';

/** A code customers enter in the plan-change window (D135). */
export interface Coupon {
  id: string;
  code: string;
  kind: CouponKind;
  /** Percent (1–100) or naira off. */
  value: number;
  /** Plans it can be used on. */
  plans: WorkspacePlan[];
  maxUses: number | null;
  uses: number;
  expiresAt: string | null;
  /** Only the first payment, or every renewal while the plan is kept. */
  duration: 'first' | 'every';
  active: boolean;
  createdAt: string;
  createdBy: string;
  note: string;
  sample?: boolean;
}

/** Account credit (₦, used before the card) or extra AI credits for this month, given by staff (D135). */
export interface CreditGrant {
  id: string;
  workspaceId: string;
  workspaceName: string;
  kind: 'account' | 'ai';
  amount: number;
  reason: string;
  at: string;
  by: string;
}

export type AiFeatureId = 'block_suggest' | 'print_writer' | 'coach';

export interface IntegrationTest {
  at: string;
  ok: boolean;
  message: string;
  by: string;
}

export interface PhraseReview {
  status: 'approved' | 'edited';
  /** The corrected wording when edited. */
  text?: string;
  by: string;
  at: string;
}

export interface PolicyRelease {
  version: string;
  publishedAt: string;
  by: string;
  /** What changed, in plain words — shown to customers. */
  summary: string;
  /** Who must agree again before carrying on. */
  reaccept: 'none' | 'paid' | 'all';
}

export interface ExtensionPull {
  pulledVersion: string;
  /** The version every workspace running the pulled one is moved to. */
  to: string;
  reason: string;
  at: string;
  by: string;
}