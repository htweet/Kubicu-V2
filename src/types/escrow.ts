/**
 * Escrow lifecycle (D94). The money is held by our licensed payment partner (to be chosen);
 * KUBICU records the case, the evidence and the instruction to release or refund.
 */

/**
 * awaiting_goal — DealRoom group goal not decided yet
 * held          — paid, waiting for the seller to deliver
 * delivered     — seller marked delivered; buyer's inspection window is running
 * disputed      — buyer reported a problem; money is reserved; seller has 48 hours to reply
 * escalated     — passed to KUBICU staff to decide
 * closed        — released, refunded or partly refunded
 */
export type EscrowStage = 'awaiting_goal' | 'held' | 'delivered' | 'disputed' | 'escalated' | 'closed';

export type EscrowKind = 'order' | 'goal';

export type EscrowActor = 'buyer' | 'seller' | 'staff' | 'system';

export type EscrowIssue = 'not_received' | 'not_as_described' | 'damaged' | 'incomplete' | 'other';

export type EscrowOutcome = 'released' | 'refunded' | 'partial';

export type ReleaseReason = 'buyer_confirmed' | 'window_ended' | 'goal_reached' | 'dispute_withdrawn' | 'staff' | 'goal_missed' | 'seller_refund' | 'delivery_code';

export interface EscrowFile {
  id: string;
  /** Prototype: only the file name is kept — nothing is uploaded. */
  name: string;
  at: string;
}

export interface EscrowEvent {
  id: string;
  at: string;
  by: EscrowActor;
  label: string;
}

export interface SellerResponse {
  at: string;
  kind: 'full_refund' | 'partial' | 'contest';
  partialNgn?: number;
  text: string;
  evidence: EscrowFile[];
}

export interface StaffDecision {
  at: string;
  by: string;
  outcome: 'release' | 'refund' | 'partial';
  partialNgn?: number;
  /** Shown word for word to buyer and seller. */
  note: string;
}

export interface EscrowDispute {
  id: string;
  openedAt: string;
  issue: EscrowIssue;
  details: string;
  wants: 'full' | 'partial';
  partialNgn?: number;
  evidence: EscrowFile[];
  respondBy: string;
  response?: SellerResponse;
  escalatedAt?: string;
  escalatedBy?: EscrowActor;
  escalationNote?: string;
  decision?: StaffDecision;
}

export interface EscrowCase {
  id: string;
  orderId: string;
  orderNumber: number;
  kind: EscrowKind;
  stage: EscrowStage;
  buyerName: string;
  buyerPhone: string;
  /** What the buyer paid for the order. */
  grossNgn: number;
  /** What's held for the seller after fees. */
  netNgn: number;
  heldAt: string;
  inspectionDays: number;
  deliveredAt?: string;
  deliveryNote?: string;
  proof: EscrowFile[];
  inspectUntil?: string;
  closedAt?: string;
  outcome?: EscrowOutcome;
  releaseReason?: ReleaseReason;
  refundedNgn?: number;
  dispute?: EscrowDispute;
  events: EscrowEvent[];
}
