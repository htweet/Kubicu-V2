import type { Order } from '../types/commerce';
import { orderMoney } from './commerce/money';
import { uid } from './id';

/**
 * Creator Collaboration (D103): partners (creators, stylists, resellers) share a tracked link and earn a commission on sales.
 * Commissions are worked out from real orders; paying them out is either from the wallet (verified sellers) or recorded as paid elsewhere.
 */

export const COLLAB_APP_ID = 'collaborations';
export const COLLAB_PLAN = 'pro' as const;
/** Commission only becomes payable once the order is completed, or this many days after payment with no refund or dispute. */
export const COMMISSION_HOLD_DAYS = 7;
export const MAX_RATE = 50;

export type PartnerStatus = 'invited' | 'active' | 'paused' | 'ended';
export type PartnerPlatform = 'instagram' | 'tiktok' | 'whatsapp' | 'youtube' | 'other';

export interface Partner {
  id: string;
  name: string;
  handle: string;
  phone: string;
  platform: PartnerPlatform;
  /** Upper-case code used in the link, e.g. TEMI-STYLES. */
  code: string;
  ratePct: number;
  /** Empty = every product. */
  productIds: string[];
  terms: string;
  status: PartnerStatus;
  invitedAt: string;
  acceptedAt?: string;
  /** Set when paused or ended: orders after this don't earn. */
  stoppedAt?: string;
  sample?: boolean;
  /** Sample partners are credited with a few sample orders so the screen has something to show. */
  sampleOrderIds?: string[];
}

export interface CommissionPayout {
  id: string;
  partnerId: string;
  amountNgn: number;
  orderIds: string[];
  method: 'wallet' | 'outside';
  at: string;
  note: string;
  sample?: boolean;
}

export interface CollabData {
  partners: Partner[];
  payouts: CommissionPayout[];
  sampleSeeded: boolean;
}

export const emptyCollabs = (): CollabData => ({ partners: [], payouts: [], sampleSeeded: false });
export const collabKey = (workspaceId: string) => `kubicu.collabs.${workspaceId}`;

export const platformLabels: Record<PartnerPlatform, string> = { instagram: 'Instagram', tiktok: 'TikTok', whatsapp: 'WhatsApp', youtube: 'YouTube', other: 'Other' };
export const partnerStatusLabels: Record<PartnerStatus, string> = { invited: 'Invited', active: 'Active', paused: 'Paused', ended: 'Ended' };
export const partnerStatusTones: Record<PartnerStatus, 'neutral' | 'info' | 'success' | 'warning'> = { invited: 'info', active: 'success', paused: 'warning', ended: 'neutral' };

export function makePartnerCode(name: string, taken: Set<string>): string {
  const base = name.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 12) || 'PARTNER';
  if (!taken.has(base)) return base;
  for (let i = 2; i < 100; i++) if (!taken.has(`${base}-${i}`)) return `${base}-${i}`;
  return `${base}-${Date.now().toString(36).toUpperCase().slice(-3)}`;
}

export type CommissionState = 'pending' | 'payable' | 'paid' | 'void';

export interface CommissionLine {
  order: Order;
  baseNgn: number;
  commissionNgn: number;
  state: CommissionState;
  reason: string;
}

const DAY = 86_400_000;

/** Orders credited to this partner: placed through their link after they accepted (sample partners use their sample orders). */
export function partnerOrders(p: Partner, orders: Order[]): Order[] {
  if (p.sample && p.sampleOrderIds?.length) return orders.filter((o) => p.sampleOrderIds?.includes(o.id));
  const since = p.acceptedAt ? new Date(p.acceptedAt).getTime() : Infinity;
  const until = p.stoppedAt ? new Date(p.stoppedAt).getTime() : Infinity;
  return orders.filter((o) => {
    const t = new Date(o.createdAt).getTime();
    return o.partnerCode === p.code && t >= since && t <= until;
  });
}

/** Goods value the commission is worked out on: products in scope, after discount and refunds, never delivery. */
function commissionBase(p: Partner, o: Order): number {
  const m = orderMoney(o);
  const inScope = o.items.filter((i) => i.kind !== 'ticket' && (!p.productIds.length || p.productIds.includes(i.productId)));
  const scoped = inScope.reduce((s, i) => s + i.unitPriceNgn * i.qty, 0);
  if (!scoped || !o.subtotalNgn) return 0;
  const share = scoped / o.subtotalNgn;
  const goodsPaid = Math.max(0, m.gross - o.deliveryNgn - m.refunded);
  return Math.round(goodsPaid * share);
}

export function commissionLines(p: Partner, orders: Order[], payouts: CommissionPayout[], now = Date.now()): CommissionLine[] {
  const paidIds = new Set(payouts.filter((x) => x.partnerId === p.id).flatMap((x) => x.orderIds));
  return partnerOrders(p, orders).
  map((o) => {
    const baseNgn = commissionBase(p, o);
    const commissionNgn = Math.round(baseNgn * p.ratePct / 100);
    const paidAt = o.events.find((e) => e.kind === 'paid' || e.kind === 'payment')?.at ?? o.createdAt;
    let state: CommissionState;
    let reason: string;
    if (paidIds.has(o.id)) {
      state = 'paid';
      reason = 'Paid out';
    } else if (o.paymentStatus === 'pending') {
      state = 'pending';
      reason = 'Waiting for payment';
    } else if (o.status === 'cancelled' || o.status === 'refunded' || commissionNgn <= 0) {
      state = 'void';
      reason = 'Refunded or cancelled';
    } else if (o.dispute && (o.dispute.status === 'needs_response' || o.dispute.status === 'under_review')) {
      state = 'pending';
      reason = 'Dispute open';
    } else if (o.status === 'completed' || now - new Date(paidAt).getTime() >= COMMISSION_HOLD_DAYS * DAY) {
      state = 'payable';
      reason = 'Ready to pay';
    } else {
      state = 'pending';
      reason = `Payable ${COMMISSION_HOLD_DAYS} days after payment`;
    }
    return { order: o, baseNgn, commissionNgn, state, reason };
  }).
  sort((a, b) => new Date(b.order.createdAt).getTime() - new Date(a.order.createdAt).getTime());
}

export function partnerTotals(lines: CommissionLine[]) {
  const sum = (s: CommissionState) => lines.filter((l) => l.state === s).reduce((t, l) => t + l.commissionNgn, 0);
  return {
    sales: lines.filter((l) => l.state !== 'void').reduce((t, l) => t + l.baseNgn, 0),
    orders: lines.filter((l) => l.state !== 'void').length,
    pending: sum('pending'),
    payable: sum('payable'),
    paid: sum('paid')
  };
}

export function seedCollabs(d: CollabData, orders: Order[]): CollabData {
  if (d.sampleSeeded) return d;
  const sampleOrders = orders.filter((o) => o.sample && o.paymentStatus !== 'pending' && o.items.some((i) => i.kind !== 'ticket'));
  const ago = (days: number) => new Date(Date.now() - days * DAY).toISOString();
  const temi: Partner = {
    id: uid('ptn'),
    name: 'Temi Adebayo',
    handle: '@temi.styles',
    phone: '+234 803 555 0170',
    platform: 'instagram',
    code: 'TEMI',
    ratePct: 10,
    productIds: [],
    terms: '10% on every sale through your link, paid weekly once the order is delivered.',
    status: 'active',
    invitedAt: ago(40),
    acceptedAt: ago(39),
    sample: true,
    sampleOrderIds: sampleOrders.slice(0, 3).map((o) => o.id)
  };
  const kunle: Partner = {
    id: uid('ptn'),
    name: 'Kunle Okoro',
    handle: '@kunlewears',
    phone: '+234 812 555 0161',
    platform: 'tiktok',
    code: 'KUNLE',
    ratePct: 8,
    productIds: [],
    terms: '8% on sales through your link.',
    status: 'invited',
    invitedAt: ago(2),
    sample: true
  };
  return { ...d, partners: [temi, kunle, ...d.partners], sampleSeeded: true };
}