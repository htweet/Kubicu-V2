import type { WorkspacePlan as PlanId } from './plan';

/** Co-branded spaces & partner bundles (D120): two businesses working together. */
export type PartnerKind = 'connected' | 'guest';
export type PartnershipStatus = 'invited' | 'active' | 'ending' | 'ended' | 'declined';
export type TrustLevel = 'new' | 'building' | 'trusted' | 'top';
export type AgreementSide = 'lead' | 'partner';

/** The other business, as the lead sees it. */
export interface PartnerBusiness {
  name: string;
  /** KUBICU handle — connected partners only. */
  handle?: string;
  logo?: string | null;
  verified: boolean;
  trustLevel?: TrustLevel;
  plan?: PlanId;
  category?: string;
  city?: string;
}

export type DeliveryRule = 'each' | 'lead' | 'partner';
export type SupportRule = 'each' | 'lead' | 'partner';

/** The plain-words agreement both sides accept. Any change to the money needs both again. */
export interface Agreement {
  version: number;
  purpose: string;
  /** The lead's share of bundle money, in percent. The partner gets the rest. */
  leadSharePct: number;
  delivery: DeliveryRule;
  support: SupportRule;
  noticeDays: number;
  acceptedBy: Partial<Record<AgreementSide, string>>;
}

export interface PartnershipEvent {
  id: string;
  at: string;
  by: AgreementSide | 'system';
  text: string;
}

/** What a guest partner has set up on their partner page. */
export interface GuestSetup {
  phoneVerifiedAt?: string;
  bank?: { bankName: string; last4: string; accountName: string; bvnLast4: string; verifiedAt: string };
}

export interface Partnership {
  id: string;
  kind: PartnerKind;
  partner: PartnerBusiness;
  /** Person we deal with. */
  contactName: string;
  phone: string;
  /** Secret part of the guest link /partner/:token (also used for connected invites). */
  token: string;
  invitedAt: string;
  /** Invite links last 7 days; resending makes a new one. */
  expiresAt: string;
  acceptedAt?: string;
  status: PartnershipStatus;
  agreement: Agreement;
  /** A proposed change waiting for the other side. */
  pending?: { agreement: Agreement; by: AgreementSide; at: string };
  guest?: GuestSetup;
  /** When "ending": the date the partnership stops. */
  endsAt?: string;
  endReason?: string;
  /** Referral partner this was upgraded from, if any. */
  referralPartnerId?: string;
  events: PartnershipEvent[];
  /** Comments between the two businesses (D121). `spaceId` ties one to a co-branded space. */
  comments?: PartnerComment[];
  sample?: boolean;
}

export interface PartnerComment {
  id: string;
  by: AgreementSide;
  /** Business name at the time of writing. */
  author: string;
  text: string;
  at: string;
  spaceId?: string;
  /** Block the comment is about, in a co-branded space. */
  blockId?: string;
  blockLabel?: string;
  resolvedAt?: string;
}

export interface PartnershipData {
  partnerships: Partnership[];
  sampleSeeded: boolean;
}
