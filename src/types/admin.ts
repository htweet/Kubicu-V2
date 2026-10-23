import type { WorkspacePlan } from './plan';

/** Super-admin operations (D75b). Stored in the browser for the prototype. */

export type FlagId = 'ai_page_setup' | 'storefront';

export interface FlagState {
  /** Kill switch: off means off for everyone, whatever the plans say. */
  on: boolean;
  /** Plans the feature is released to while it's on. */
  plans: WorkspacePlan[];
  updatedAt: string;
}

export type ReportReason = 'scam' | 'counterfeit' | 'hate' | 'adult' | 'impersonation' | 'copyright' | 'other';
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
export type TicketTopic = 'billing' | 'payments' | 'pages' | 'account' | 'other';

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
  area: 'tenants' | 'flags' | 'moderation' | 'support' | 'announcements' | 'pages' | 'orders' | 'data' | 'staff' | 'appeals' | 'payments' | 'escrow';
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
}