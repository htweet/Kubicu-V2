/** Proof-of-Work (D91): reviews that can only come from real records, and a timeline of delivered work. */

export type ProofSourceKind = 'order' | 'booking' | 'job';

/** The real record a review or work entry is matched to. */
export interface ProofSource {
  kind: ProofSourceKind;
  id: string;
  /** e.g. "Order #1042", "Bridal makeup · 12 Oct". */
  label: string;
  /** ISO date the work was delivered or the order completed. */
  date: string;
}

export interface ReviewRequest {
  id: string;
  token: string;
  source: ProofSource;
  customerName: string;
  phone: string;
  createdAt: string;
  reviewId?: string;
  sample?: boolean;
}

export type HideReason = 'personal' | 'abusive' | 'unrelated' | 'other';

export interface ProofReview {
  id: string;
  requestId: string;
  source: ProofSource;
  /** 1–5 */
  rating: number;
  text: string;
  /** Name as the reviewer chose to show it. */
  displayName: string;
  /** The reviewer agreed to show the words on the page. Ratings always count. */
  permission: boolean;
  hidden: boolean;
  hiddenReason?: HideReason;
  reply?: string;
  createdAt: string;
  sample?: boolean;
}

export interface WorkItem {
  id: string;
  title: string;
  /** YYYY-MM-DD delivered */
  date: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  /** Null = the business's own entry, shown without a "matched" label. */
  source: ProofSource | null;
  /** Only named when the client agreed. */
  clientName: string;
  published: boolean;
  createdAt: string;
  sample?: boolean;
}

export interface ProofData {
  requests: ReviewRequest[];
  reviews: ProofReview[];
  work: WorkItem[];
  seeded: boolean;
}