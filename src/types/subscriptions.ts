import type { OrderCustomer } from './commerce';

/** Customer subscriptions sold by a workspace (D69). Test mode; stored with Commerce data. */

export type SubPlanKind = 'membership' | 'box';
export type SubInterval = 'week' | 'month' | 'year';

/** What subscribers may do themselves in the portal. */
export interface SubRules {
  pause: boolean;
  /** Longest pause, in billing cycles. */
  maxPauseCycles: number;
  skip: boolean;
  switchPlan: boolean;
  /** Off = cancelling needs `noticeDays` before the next charge. */
  cancelAnyTime: boolean;
  noticeDays: number;
}

export interface SubBoxItem {
  productId: string;
  variantId: string;
  qty: number;
}

export interface SubPlan {
  id: string;
  kind: SubPlanKind;
  name: string;
  description: string;
  /** One benefit per line. */
  benefits: string;
  priceNgn: number;
  interval: SubInterval;
  trialDays: number;
  setupFeeNgn: number;
  /** Most subscribers at once; null = no limit. */
  memberCap: number | null;
  /** Product box contents, delivered as an order each cycle. */
  items: SubBoxItem[];
  rules: SubRules;
  status: 'active' | 'archived';
  createdAt: string;
  sample?: boolean;
}

export type SubStatus = 'trialing' | 'active' | 'paused' | 'past_due' | 'cancelling' | 'ended';

export interface SubPayment {
  id: string;
  at: string;
  label: string;
  amountNgn: number;
  status: 'paid' | 'failed' | 'refunded';
  /** Product box order created by this payment. */
  orderId?: string;
}

export interface SubEvent {
  id: string;
  at: string;
  label: string;
  by: 'customer' | 'seller' | 'automatic';
}

export interface Subscription {
  id: string;
  /** Secret part of the subscriber's portal link. */
  token: string;
  planId: string;
  /** Plan switch waiting for the next renewal. */
  pendingPlanId: string | null;
  customer: OrderCustomer;
  /** Box delivery (or pickup) chosen at sign-up. */
  delivery: {method: 'delivery' | 'pickup';zoneId?: string;zoneName?: string;address?: string;feeNgn: number;} | null;
  status: SubStatus;
  startedAt: string;
  trialEndsAt: string | null;
  /** Next charge date (end of the paid or trial period). */
  periodEnd: string;
  /** Set while paused; charges resume on this date (= periodEnd). */
  pausedUntil: string | null;
  /** The charge date the pause pushed back, used when resuming early. */
  pausedFrom?: string | null;
  cancelReason: string | null;
  endedAt: string | null;
  /** First failed attempt of the current renewal. */
  failedAt: string | null;
  retries: number;
  graceEndsAt: string | null;
  card: {brand: 'Visa' | 'Mastercard' | 'Verve';last4: string;};
  payments: SubPayment[];
  events: SubEvent[];
  sourceHandle?: string;
  sample?: boolean;
}