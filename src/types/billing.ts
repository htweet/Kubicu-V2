import type { WorkspacePlan } from './plan';

export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due';
export type InvoiceStatus = 'paid' | 'failed' | 'refunded';
export type CardOutcome = 'success' | 'declined' | 'challenge' | 'expired';

export interface PaymentCard {
  brand: 'Visa' | 'Mastercard' | 'Verve';
  last4: string;
  /** "MM/YY" */
  expiry: string;
  holder: string;
}

export interface InvoiceLine {
  label: string;
  amountNgn: number;
}

export interface Invoice {
  id: string;
  number: string;
  issuedAt: string;
  status: InvoiceStatus;
  lines: InvoiceLine[];
  subtotalNgn: number;
  vatNgn: number;
  totalNgn: number;
  cardLast4: string | null;
  /** e.g. "Paid on retry", "Renewal failed: card declined". */
  note?: string;
  sample?: boolean;
}

export type BillingEventKind = 'plan' | 'payment' | 'card';

/** One dated line in the subscription history (D68). */
export interface BillingEvent {
  id: string;
  at: string;
  kind: BillingEventKind;
  /** Short headline, e.g. "Upgraded to Business". */
  text: string;
  /** Supporting detail, e.g. "Charged ₦9,140 after ₦4,200 unused Pro time". */
  detail?: string;
  /** Member name, or "Automatic" for renewals and grace-period changes. */
  actor: string;
  invoiceId?: string;
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
  sample?: boolean;
}

/** One workspace's subscription (D65). Stored in the browser; test mode only. */
export interface BillingData {
  cycle: BillingCycle;
  /** Null on Free. */
  periodStart: string | null;
  periodEnd: string | null;
  status: SubscriptionStatus;
  /** Downgrade or cancellation waiting for the renewal date. */
  pendingPlan: WorkspacePlan | null;
  pendingCycle: BillingCycle | null;
  cancelReason: string | null;
  trial: {endsAt: string;previousPlan: WorkspacePlan;} | null;
  trialUsed: boolean;
  graceEndsAt: string | null;
  /** Card that failed, so a retry with the same card fails again when renewals are set to fail. */
  failedCardLast4: string | null;
  card: PaymentCard | null;
  invoices: Invoice[];
  /** Newest first (D68). */
  history: BillingEvent[];
  sampleSeeded: boolean;
}