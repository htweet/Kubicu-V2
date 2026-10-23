export type Role = 'owner' | 'admin' | 'editor' | 'sales' | 'viewer';

export type Permission =
'pages.edit' |
'pages.publish' |
'spaces.manage' |
'media.manage' |
'products.edit' |
'prices.edit' |
'orders.manage' |
'orders.refund' |
'tickets.checkin' |
'discounts.manage' |
'commerce.settings' |
'bookings.manage' |
'contacts.manage' |
'automations.manage' |
'analytics.view' |
'domains.manage' |
'team.manage' |
'approvals.review' |
'extensions.manage' |
'billing.manage' |
'ownership.transfer' |
'workspace.delete';

export interface Member {
  id: string;
  name: string;
  /** Email or phone used to invite them. */
  contact: string;
  role: Role;
  /** Spaces they can edit; null = every space (D57). */
  spaceIds: string[] | null;
  joinedAt: string;
  lastActiveAt: string | null;
  sample?: boolean;
}

export type InviteStatus = 'pending' | 'accepted' | 'cancelled';

export interface Invite {
  id: string;
  token: string;
  contact: string;
  role: Role;
  spaceIds: string[] | null;
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
  status: InviteStatus;
  sample?: boolean;
}

export type ActivityArea = 'team' | 'pages' | 'commerce' | 'bookings' | 'audience' | 'settings';

export interface ActivityEntry {
  id: string;
  at: string;
  actor: string;
  area: ActivityArea;
  text: string;
  /** In-app link to what changed. */
  href?: string;
}

export type ReviewStatus = 'pending' | 'approved' | 'changes' | 'withdrawn';

/** An Editor's request to publish a space, reviewed by an Owner or Admin (D58). */
export interface ReviewRequest {
  id: string;
  spaceId: string;
  spaceName: string;
  handle: string;
  /** The exact site sent for review; approving publishes this. Updated if the Editor keeps editing. */
  doc: import('./page').PageDocument;
  /** Live version when the request was made, for the side-by-side. */
  live: import('./page').PageDocument | null;
  requestedBy: string;
  requestedById: string;
  note: string;
  /** Requested go-live time; null = as soon as it's approved. */
  scheduleAt: string | null;
  createdAt: string;
  updatedAt: string;
  status: ReviewStatus;
  comment?: string;
  decidedBy?: string;
  decidedAt?: string;
}

/** In-app notification for one member. */
export interface Notice {
  id: string;
  at: string;
  memberId: string;
  text: string;
  href?: string;
  seen: boolean;
}

export interface TeamData {
  members: Member[];
  invites: Invite[];
  approvalsOn: boolean;
  reviews: ReviewRequest[];
  notices: Notice[];
  /** Sales can refund up to this much without an Admin (D57). */
  salesRefundLimitNgn: number;
  activity: ActivityEntry[];
  sampleSeeded: boolean;
}