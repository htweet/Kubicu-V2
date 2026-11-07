/** Creator sponsorship marketplace (D441). Briefs are shared across workspaces in this browser. */
export type SponsorPlatform = 'instagram' | 'tiktok' | 'youtube' | 'x' | 'whatsapp' | 'podcast';

export type DeliverableStatus = 'todo' | 'submitted' | 'changes' | 'approved';

export interface Deliverable {
  id: string;
  label: string;
  status: DeliverableStatus;
  link?: string;
  /** Brand's note when asking for changes. */
  note?: string;
  submittedAt?: string;
  approvedAt?: string;
}

export type ApplicationStatus = 'applied' | 'accepted' | 'declined' | 'withdrawn' | 'completed';

export interface SponsorApplication {
  id: string;
  creatorWorkspaceId: string;
  creatorName: string;
  handle: string;
  audience: string;
  pitch: string;
  rateNgn: number;
  status: ApplicationStatus;
  appliedAt: string;
  acceptedAt?: string;
  /** Tracked link for the brand's results (accepted only). */
  trackingCode?: string;
  deliverables: Deliverable[];
  /** Held when accepted; released a share at a time as deliverables are approved. */
  heldNgn: number;
  releasedNgn: number;
  /** A problem either side reported (D453). Held money is frozen until KUBICU decides. */
  dispute?: SponsorDispute;
}

export type DisputeOutcome = 'creator' | 'brand' | 'split';

export interface SponsorDispute {
  by: 'brand' | 'creator';
  reason: string;
  note: string;
  openedAt: string;
  /** The other side's answer. */
  reply?: string;
  /** Files either side added while it's open (D463). Names only in the prototype — nothing is uploaded. */
  evidence?: { id: string; by: 'brand' | 'creator'; name: string; at: string }[];
  outcome?: DisputeOutcome;
  /** Paid to the creator / returned to the brand when decided. */
  toCreatorNgn?: number;
  toBrandNgn?: number;
  decidedAt?: string;
  /** Staff note shown word for word to both sides (D454). */
  decisionNote?: string;
  decidedBy?: string;
  /** One appeal against the decision, decided by a different staff member (D464). */
  appeal?: {
    by: 'brand' | 'creator';
    reason: string;
    at: string;
    result?: 'upheld' | 'changed';
    note?: string;
    decidedBy?: string;
    decidedAt?: string;
  };
}

export interface SponsorBrief {
  id: string;
  brandWorkspaceId: string;
  brandName: string;
  title: string;
  description: string;
  category: string;
  platforms: SponsorPlatform[];
  deliverables: string[];
  /** Budget per creator. */
  budgetNgn: number;
  slots: number;
  applyBy: string;
  /** 'review': waiting for KUBICU staff before creators can see it; 'rejected': not allowed, with `reviewNote` (D459). */
  status: 'open' | 'closed' | 'review' | 'rejected';
  reviewNote?: string;
  reviewedAt?: string;
  createdAt: string;
  sample?: boolean;
  applications: SponsorApplication[];
}
