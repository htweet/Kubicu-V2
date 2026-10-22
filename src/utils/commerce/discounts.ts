import type { CommerceData, Discount, DiscountValue, OrderDiscount } from '../../types/commerce';
import { formatNgn } from '../format';

/**
 * Discount rules (D51): one discount per order, and the better one wins. Automatic offers
 * apply without a code; a code the customer types competes with them, and they are told
 * which applied and why.
 */

export type DiscountStatus = 'active' | 'scheduled' | 'expired' | 'used_up' | 'paused';

export const discountStatusLabel: Record<DiscountStatus, string> = {
  active: 'Active',
  scheduled: 'Scheduled',
  expired: 'Expired',
  used_up: 'Used up',
  paused: 'Paused'
};

export const discountKindLabel = { code: 'Code', automatic: 'Automatic', referral: 'Referral' } as const;

/** Orders that used this discount and still count (cancelled orders give the use back). */
export function discountOrders(data: CommerceData, id: string) {
  return data.orders.filter((o) => o.discount?.discountId === id && o.status !== 'cancelled');
}

export function discountStatus(d: Discount, data: CommerceData, now = Date.now()): DiscountStatus {
  if (!d.active) return 'paused';
  if (d.endsAt && Date.parse(d.endsAt) <= now) return 'expired';
  if (d.usageLimit !== null && discountOrders(data, d.id).length >= d.usageLimit) return 'used_up';
  if (d.startsAt && Date.parse(d.startsAt) > now) return 'scheduled';
  return 'active';
}

export function valueLabel(v: DiscountValue): string {
  if (v.type === 'percent') return `${v.percent}% off`;
  if (v.type === 'fixed') return `${formatNgn(v.amountNgn)} off`;
  return 'Free delivery';
}

export function normaliseCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '');
}

export interface DiscountLine {
  productId: string;
  collectionIds: string[];
  amountNgn: number;
}

export interface DiscountContext {
  lines: DiscountLine[];
  subtotalNgn: number;
  /** Delivery fee before discounts; null when the customer hasn't chosen yet. */
  deliveryNgn: number | null;
  phone?: string;
  now?: number;
}

export type Evaluation = {ok: true;amountNgn: number;} | {ok: false;reason: string;};

function eligibleSubtotal(d: Discount, ctx: DiscountContext): number {
  const s = d.appliesTo;
  if (s.scope === 'all') return ctx.subtotalNgn;
  return ctx.lines.
  filter((l) => s.scope === 'products' ? s.productIds.includes(l.productId) : l.collectionIds.some((c) => s.collectionIds.includes(c))).
  reduce((t, l) => t + l.amountNgn, 0);
}

export function evaluate(d: Discount, data: CommerceData, ctx: DiscountContext): Evaluation {
  const status = discountStatus(d, data, ctx.now);
  if (status === 'paused') return { ok: false, reason: 'This code isn’t available right now.' };
  if (status === 'expired') return { ok: false, reason: 'This code has expired.' };
  if (status === 'used_up') return { ok: false, reason: 'This code has been fully used.' };
  if (status === 'scheduled') return { ok: false, reason: 'This code isn’t active yet.' };
  if (d.minSubtotalNgn !== null && ctx.subtotalNgn < d.minSubtotalNgn) {
    return { ok: false, reason: `Spend ${formatNgn(d.minSubtotalNgn - ctx.subtotalNgn)} more to use this (minimum ${formatNgn(d.minSubtotalNgn)}).` };
  }
  const phone = ctx.phone?.replace(/\D/g, '');
  if (d.perCustomerLimit !== null && phone) {
    const used = discountOrders(data, d.id).filter((o) => o.customer.phone.replace(/\D/g, '') === phone).length;
    if (used >= d.perCustomerLimit) return { ok: false, reason: 'You’ve already used this code.' };
  }
  const base = eligibleSubtotal(d, ctx);
  if (d.value.type !== 'free_delivery' && base <= 0) return { ok: false, reason: 'This code doesn’t apply to the items in your cart.' };
  if (d.value.type === 'percent') return { ok: true, amountNgn: Math.round(base * d.value.percent / 100) };
  if (d.value.type === 'fixed') return { ok: true, amountNgn: Math.min(d.value.amountNgn, base) };
  if (ctx.deliveryNgn === 0) return { ok: false, reason: 'Delivery is already free on this order.' };
  return { ok: true, amountNgn: ctx.deliveryNgn ?? 0 };
}

export interface AppliedDiscount {
  discount: Discount;
  amountNgn: number;
}

export interface DiscountResolution {
  applied: AppliedDiscount | null;
  /** Problem with the code the customer typed, if any. */
  codeError?: string;
  /** The typed code worked, but an automatic offer saves more. */
  codeBeaten?: {code: string;amountNgn: number;};
}

export function findByCode(data: CommerceData, code: string): Discount | undefined {
  const c = normaliseCode(code);
  return c ? data.discounts.find((d) => d.kind !== 'automatic' && d.code === c) : undefined;
}

/** Picks the single best discount for this cart. */
export function resolveDiscount(data: CommerceData, ctx: DiscountContext, code: string): DiscountResolution {
  const candidates: AppliedDiscount[] = [];
  data.discounts.
  filter((d) => d.kind === 'automatic').
  forEach((d) => {
    const r = evaluate(d, data, ctx);
    if (r.ok && r.amountNgn > 0) candidates.push({ discount: d, amountNgn: r.amountNgn });
  });
  const bestAuto = candidates.sort((a, b) => b.amountNgn - a.amountNgn)[0] ?? null;

  if (!normaliseCode(code)) return { applied: bestAuto };
  const typed = findByCode(data, code);
  if (!typed) return { applied: bestAuto, codeError: 'We don’t recognise that code. Check the spelling.' };
  const r = evaluate(typed, data, ctx);
  if (!r.ok) return { applied: bestAuto, codeError: r.reason };
  // Free delivery before a delivery option is chosen: keep the code; it applies once delivery is picked.
  if (bestAuto && bestAuto.amountNgn > r.amountNgn) return { applied: bestAuto, codeBeaten: { code: typed.code, amountNgn: r.amountNgn } };
  return { applied: { discount: typed, amountNgn: r.amountNgn } };
}

export function orderDiscountRecord(a: AppliedDiscount): OrderDiscount {
  return { discountId: a.discount.id, kind: a.discount.kind, code: a.discount.code, label: a.discount.title, referrerName: a.discount.referrerName };
}

/** Customer-facing line label, e.g. “EID20 · Eid sale — 20% off”. */
export function discountLineLabel(d: {code: string;title?: string;label?: string;}): string {
  const title = d.title ?? d.label ?? 'Discount';
  return d.code ? `${d.code} · ${title}` : title;
}

export function suggestReferralCode(handle: string, name: string): string {
  const first = name.trim().split(/\s+/)[0] ?? '';
  return normaliseCode(`${handle.slice(0, 4)}-${first}`.replace(/[^a-zA-Z0-9-]/g, '')).slice(0, 20);
}