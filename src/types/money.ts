/**
 * Money layer (D92): how a sale gets paid, the KUBICU wallet, payouts and payment links.
 * Balances are held by a licensed payment partner (to be chosen) — KUBICU shows and instructs them.
 * Everything is simulated and stored per workspace in the browser.
 */

import type { KycCase } from './kyc';
import type { EscrowCase } from './escrow';

/** How the money from a sale reaches the seller. More methods can be added later. */
export type PayMethod = 'direct' | 'wallet' | 'escrow';

/** Areas of the app that take payments and can override the default method. */
export type PayArea = 'shop' | 'tickets' | 'bookings' | 'quotes' | 'links' | 'dealrooms';

export type EscrowFeePayer = 'seller' | 'buyer' | 'split';

export interface MethodSettings {
  default: PayMethod;
  overrides: Partial<Record<PayArea, PayMethod>>;
  /** Buyers can tick "Protect my payment" at checkout and pay the escrow fee themselves. */
  buyerChoice: boolean;
  escrowFeePayer: EscrowFeePayer;
}

export type LedgerKind = 'sale' | 'link' | 'milestone' | 'escrow_release' | 'refund' | 'fee' | 'payout' | 'payout_returned' | 'commission' | 'topup' | 'purchase' | 'partner_share';

/**
 * pending   — paid, still settling with the partner (becomes available at `availableAt`)
 * available — can be paid out
 * held      — in escrow until delivery is confirmed or the inspection window ends
 * reserved  — frozen while a dispute is open
 */
export type LedgerState = 'pending' | 'available' | 'held' | 'reserved';

export type LedgerRefType = 'order' | 'link' | 'payout' | 'invoice' | 'booking';

export interface LedgerEntry {
  id: string;
  at: string;
  kind: LedgerKind;
  /** Signed: credits positive, debits negative. */
  amountNgn: number;
  state: LedgerState;
  label: string;
  ref?: { type: LedgerRefType; id: string; label?: string };
  /** When a pending or held credit becomes available. */
  availableAt?: string;
  sample?: boolean;
}

export type NameMatch = 'match' | 'close' | 'mismatch';

export interface BankAccount {
  id: string;
  bankName: string;
  /** Only the last four digits are kept on screen. */
  last4: string;
  accountName: string;
  nameMatch: NameMatch;
  addedAt: string;
  /** New accounts can't receive payouts until this time (cool-down). */
  usableAt: string;
  primary: boolean;
  /** A mobile money wallet (M-Pesa, MTN MoMo) instead of a bank account (D355). Missing = bank. */
  kind?: 'bank' | 'mobile_money';
}

export type PayoutStatus = 'processing' | 'on_hold' | 'paid' | 'failed';

export interface Payout {
  id: string;
  amountNgn: number;
  feeNgn: number;
  bankId: string;
  bankLabel: string;
  status: PayoutStatus;
  createdAt: string;
  settledAt: string | null;
  /** Prototype: decided when the payout is made. */
  outcome: 'paid' | 'failed';
  failureReason: string | null;
  /** Prototype: why the bank or wallet sends it back, chosen when testing a returned payout (D433). */
  returnReason?: string;
  /** Staff hold note (Super admin → Payments). */
  holdReason: string | null;
  auto: boolean;
  by: string;
  sample?: boolean;
}

export type AutoPayoutMode = 'off' | 'daily' | 'weekly' | 'threshold';

export interface AutoPayout {
  mode: AutoPayoutMode;
  thresholdNgn: number;
  lastRunAt: string | null;
}

/** Limit level, set when verification (D93) is approved: 2 for individuals, 3 for registered businesses. */
export type KycTier = 0 | 1 | 2 | 3;

export interface Verification {
  tier: KycTier;
  /** A higher tier waiting for KUBICU review. */
  pending: { tier: KycTier; submittedAt: string; detail: string } | null;
  rejectedNote: string | null;
}

export type LinkKind = 'fixed' | 'open' | 'items';
export type LinkStatus = 'active' | 'paused' | 'archived';

export interface LinkItem {
  id: string;
  label: string;
  unitNgn: number;
  /** Buyers can change the quantity up to this many. */
  maxQty: number;
}

export interface LinkPayment {
  id: string;
  at: string;
  amountNgn: number;
  payerName: string;
  payerPhone: string;
  note: string;
  method: PayMethod;
  items?: { label: string; qty: number; unitNgn: number }[];
  receipt: string;
  /** Staged links: which stage this payment covered (D95). */
  stageId?: string;
  /** Fundraisers (D179): the payer agreed to show their first name on the page. Default anonymous. */
  showName?: boolean;
  /** Refunded by the organiser (D179). Refunded money leaves the "raised" total. */
  refundedNgn?: number;
  refundedAt?: string;
  sample?: boolean;
  // ——— D224 standard payment links ———
  payerEmail?: string;
  payerAddress?: string;
  /** Answers to the link's own questions, frozen with their labels. */
  answers?: { label: string; value: string }[];
  /** Processing fee the payer covered on top (included in amountNgn). */
  feeNgn?: number;
  /** VAT in this payment (inside amountNgn). */
  vatNgn?: number;
  /** How they paid. */
  payBy?: 'card' | 'ussd' | 'account' | 'transfer';
  /** Which of the seller's own accounts a transfer went to. */
  transferTo?: { bank: string; account: string; accountName: string };
  refundReason?: string;
}

export type LinkQuestionType = 'text' | 'choice' | 'date';

export interface LinkQuestion {
  id: string;
  label: string;
  type: LinkQuestionType;
  /** Choice questions: one option per entry. */
  options: string[];
  required: boolean;
}

/** A transfer to the seller's own account the payer says they've sent; counted only once confirmed (D224). */
export interface PendingTransfer {
  id: string;
  at: string;
  payment: Omit<LinkPayment, 'id' | 'at' | 'receipt' | 'method'>;
  status: 'waiting' | 'not_received';
}

/** One stage of a staged fixed-amount link, e.g. "Deposit 50%". */
export interface LinkStage {
  id: string;
  label: string;
  pct: number;
}

export interface PaymentLink {
  id: string;
  slug: string;
  title: string;
  description: string;
  kind: LinkKind;
  /** Fixed links. */
  amountNgn: number;
  /** Open links: the least a payer can enter. */
  minNgn: number;
  items: LinkItem[];
  reusable: boolean;
  expiresAt: string | null;
  maxUses: number | null;
  fields: { name: boolean; phone: boolean; note: boolean };
  /** 'default' follows the Payment links area setting. */
  method: PayMethod | 'default';
  status: LinkStatus;
  views: number;
  createdAt: string;
  payments: LinkPayment[];
  /** Fixed links only: pay the amount in stages, one payer, in order (D95). */
  stages?: LinkStage[];
  /** The open link behind a Fundraiser space (D179): fixed wording and the "show my name" choice on the pay page. */
  fundraiser?: { handle: string; organiser: string };
  sample?: boolean;
  // ——— D224 standard payment links (all optional; missing = how links worked before) ———
  /** "Payer chooses": highest amount allowed. */
  maxNgn?: number | null;
  /** "Payer chooses": up to 4 amounts to tap. */
  suggested?: number[];
  imageUrl?: string;
  /** Extra details to collect. Name and phone stay on `fields`. */
  ask?: { email: 'required' | 'optional' | 'off'; address: 'required' | 'optional' | 'off' };
  questions?: LinkQuestion[];
  /** The payer pays the processing fee on top, so the seller receives the full amount. */
  payerCoversFee?: boolean;
  /** Ways to pay on this link; missing = follow Commerce settings. */
  methods?: { card: boolean; transfer: boolean; ussd: boolean };
  /** After paying: a thank-you message, or send the payer to a page (https only). */
  after?: { message: string; redirectUrl: string };
  /** Turn VAT off for this link (e.g. a deposit). */
  noVat?: boolean;
  pendingTransfers?: PendingTransfer[];
}

export interface MoneyData {
  methods: MethodSettings;
  /** Full business verification (D93). Payouts stay off until it's approved. */
  kyc: KycCase;
  ledger: LedgerEntry[];
  banks: BankAccount[];
  payouts: Payout[];
  autoPayout: AutoPayout;
  verification: Verification;
  /** Admins can also make payouts when the Owner allows it. */
  adminsCanPayout: boolean;
  /** Set by KUBICU staff; blocks payouts. */
  frozen: { reason: string; at: string; by: string } | null;
  links: PaymentLink[];
  /** Escrow cases for orders paid into escrow or held for a DealRoom goal (D94). */
  escrow: EscrowCase[];
  /** Commerce orders and refunds already reflected in the ledger. */
  synced: { orders: string[]; refunds: string[] };
  /** When the wallet started taking sales — earlier orders are never back-filled. */
  walletSince: string;
  counters: { receipt: number };
  seeded: boolean;
  /** Demo workspace only: the sample fundraiser's payment link has been added once (D179). */
  sampleFundraiserSeeded?: boolean;
}
