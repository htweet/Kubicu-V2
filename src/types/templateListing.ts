import type { PageDocument } from './page';

/** Creator-made templates sold in the marketplace after KUBICU review (D70). Test mode. */

export type ListingStatus = 'in_review' | 'changes_requested' | 'listed' | 'rejected' | 'unlisted';
export type TemplateLicence = 'standard' | 'extended';

export interface ListingEvent {
  id: string;
  at: string;
  label: string;
  by: 'creator' | 'staff';
}

export interface TemplateReview {
  id: string;
  workspaceId: string;
  buyerName: string;
  stars: number;
  text: string;
  at: string;
}

export interface TemplateListing {
  id: string;
  /** Selling workspace and the credit shown to buyers. */
  workspaceId: string;
  creatorName: string;
  sourceSpaceId: string;
  name: string;
  category: string;
  region: string;
  description: string;
  /** 0 = free. */
  priceNgn: number;
  licence: TemplateLicence;
  /** D128: a whole page template, or a theme (look only: colours, fonts, buttons, background). Missing = page. */
  kind?: 'page' | 'theme';
  status: ListingStatus;
  /** What buyers get now (null until first approval). */
  listedDoc: PageDocument | null;
  listedVersion: number;
  /** Version waiting for review (first submission or an update). */
  pendingDoc: PageDocument | null;
  pendingVersion: number | null;
  /** Staff note for changes requested or rejection. */
  reviewNote: string | null;
  submittedAt: string;
  listedAt: string | null;
  events: ListingEvent[];
  reviews: TemplateReview[];
  sample?: boolean;
}

export interface TemplateSale {
  id: string;
  listingId: string;
  buyerWorkspaceId: string;
  buyerName: string;
  priceNgn: number;
  creatorShareNgn: number;
  /** Version the buyer received; they keep it when the creator updates the template. */
  version: number;
  doc: PageDocument;
  at: string;
  refundedAt: string | null;
  sample?: boolean;
}

export interface TemplatePayout {
  id: string;
  workspaceId: string;
  amountNgn: number;
  bankName: string;
  accountLast4: string;
  at: string;
  sample?: boolean;
}

export interface TemplateStore {
  listings: TemplateListing[];
  sales: TemplateSale[];
  payouts: TemplatePayout[];
  /** Payout account per selling workspace. */
  accounts: Record<string, { bankName: string; accountNumber: string; accountName: string }>;
  seeded: boolean;
}
