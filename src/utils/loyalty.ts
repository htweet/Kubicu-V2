import type { CommerceData, Discount, Order } from '../types/commerce';
import { isPaidOrder } from './commerce/salesReport';
import { uid } from './id';

/**
 * Loyalty points (D232). Nothing is stored separately: points are worked out from paid orders since the
 * extension was installed, minus points already turned into one-time discount codes. Refunds take points back.
 * Example figures: 1 point per ₦100 spent; 500 points = ₦500 off.
 */
export const LOYALTY_EXTENSION_ID = 'loyalty';
export const NGN_PER_POINT = 100;
export const REDEEM_POINTS = 500;
export const REDEEM_NGN = 500;

export const phoneKey = (s: string) => s.replace(/\D/g, '').slice(-10);

/** Points one order earns: what the customer paid for items after discounts and refunds. Delivery and VAT don't earn. */
export function orderPoints(o: Order): number {
  if (!isPaidOrder(o) || o.paymentStatus === 'refunded' || o.status === 'cancelled') return 0;
  const refunded = o.refunds.reduce((s, r) => s + r.amountNgn, 0);
  return Math.max(0, Math.floor((o.subtotalNgn - o.discountNgn - refunded) / NGN_PER_POINT));
}

export interface LoyaltyBalance {
  earned: number;
  spent: number;
  balance: number;
  orders: number;
}

export function loyaltyBalance(data: CommerceData, phone: string, since: string): LoyaltyBalance | null {
  const k = phoneKey(phone);
  if (k.length < 7) return null;
  const from = Date.parse(since);
  const orders = data.orders.filter((o) => phoneKey(o.customer.phone) === k && Date.parse(o.createdAt) >= from);
  const earned = orders.reduce((s, o) => s + orderPoints(o), 0);
  const spent = data.discounts.filter((d) => d.loyalty && phoneKey(d.loyalty.phone) === k).reduce((s, d) => s + (d.loyalty?.points ?? 0), 0);
  return { earned, spent, balance: Math.max(0, earned - spent), orders: orders.filter(isPaidOrder).length };
}

const codeUsed = (data: CommerceData, d: Discount) => data.orders.some((o) => o.discount?.discountId === d.id);

/** A points code this customer made but hasn't used yet — reused instead of spending more points. */
export function unusedLoyaltyCode(data: CommerceData, phone: string): Discount | undefined {
  const k = phoneKey(phone);
  if (k.length < 7) return undefined;
  return data.discounts.find((d) => d.loyalty && d.active && phoneKey(d.loyalty.phone) === k && !codeUsed(data, d));
}

/** Turns 500 points into a single-use ₦500 code in Commerce → Discounts. */
export function redeemPoints(data: CommerceData, phone: string, since: string): {data: CommerceData;code: string;} | null {
  const bal = loyaltyBalance(data, phone, since);
  if (!bal || bal.balance < REDEEM_POINTS) return null;
  const code = `PTS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const discount: Discount = {
    id: uid('disc'),
    kind: 'code',
    code,
    title: `Loyalty points — ₦${REDEEM_NGN} off`,
    value: { type: 'fixed', amountNgn: REDEEM_NGN },
    appliesTo: { scope: 'all' },
    minSubtotalNgn: null,
    startsAt: null,
    endsAt: null,
    usageLimit: 1,
    perCustomerLimit: 1,
    active: true,
    createdAt: new Date().toISOString(),
    loyalty: { phone: phone.trim(), points: REDEEM_POINTS }
  };
  return { data: { ...data, discounts: [discount, ...data.discounts] }, code };
}

/** Everyone with points, for the extension's summary. */
export function loyaltyMembers(data: CommerceData, since: string): {phone: string;name: string;balance: number;}[] {
  const seen = new Map<string, {phone: string;name: string;}>();
  data.orders.forEach((o) => {
    const k = phoneKey(o.customer.phone);
    if (k.length >= 7 && Date.parse(o.createdAt) >= Date.parse(since) && !seen.has(k)) seen.set(k, { phone: o.customer.phone, name: o.customer.name });
  });
  return Array.from(seen.values()).
  map((p) => ({ ...p, balance: loyaltyBalance(data, p.phone, since)?.balance ?? 0 })).
  filter((p) => p.balance > 0).
  sort((a, b) => b.balance - a.balance);
}