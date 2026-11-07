import type { AdminStore, Coupon } from '../types/admin';
import type { WorkspacePlan } from '../types/plan';
import type { BillingCycle, InvoiceLine } from '../types/billing';
import { monthlyPriceNgn } from '../data/billing';
import { aiCredits } from '../data/aiLimits';
import { readAdminStore } from './admin/store';

/** A coupon never takes more than this share off a charge, even stacked with yearly savings. Example figure (D135). */
export const COUPON_MAX_SHARE = 0.5;
/** Account-credit grants above this need a second staff member. Example figure (D135). */
export const GRANT_APPROVAL_NGN = 50000;
/** AI-credit grants above this need a second staff member. Example figure (D135). */
export const GRANT_APPROVAL_AI = 500;

/** Monthly price in ₦ after any approved catalogue change (D135). Null = quoted (Enterprise). */
export function monthlyPrice(plan: WorkspacePlan, store: AdminStore = readAdminStore()): number | null {
  const o = store.planOverrides?.[plan];
  return o ? o.monthlyNgn : monthlyPriceNgn[plan];
}

/** Monthly AI credits a plan includes after any approved catalogue change (D135). */
export function aiAllowance(plan: WorkspacePlan, store: AdminStore = readAdminStore()): number {
  return store.planOverrides?.[plan]?.aiCredits ?? aiCredits[plan];
}

const thisMonth = () => new Date().toISOString().slice(0, 7);

/** Extra AI credits staff gave this workspace this month. */
export function aiBonus(workspaceId: string, store: AdminStore = readAdminStore()): number {
  return (store.grants ?? []).filter((g) => g.workspaceId === workspaceId && g.kind === 'ai' && g.at.slice(0, 7) === thisMonth()).reduce((s, g) => s + g.amount, 0);
}

/** Account credit staff gave this workspace, before anything was used. */
export function creditGranted(workspaceId: string, store: AdminStore = readAdminStore()): number {
  return (store.grants ?? []).filter((g) => g.workspaceId === workspaceId && g.kind === 'account').reduce((s, g) => s + g.amount, 0);
}

export function creditAvailable(workspaceId: string, usedNgn: number | undefined, store: AdminStore = readAdminStore()): number {
  return Math.max(0, creditGranted(workspaceId, store) - (usedNgn ?? 0));
}

/** Checks a code against the plan and cycle being bought. */
export function checkCoupon(code: string, plan: WorkspacePlan, store: AdminStore = readAdminStore(), now = Date.now()): { coupon: Coupon } | { error: string } {
  const c = (store.coupons ?? []).find((x) => x.code.toUpperCase() === code.trim().toUpperCase());
  if (!c || !c.active) return { error: 'That code isn’t valid. Check the spelling.' };
  if (c.expiresAt && Date.parse(c.expiresAt) < now) return { error: 'That code has expired.' };
  if (c.maxUses !== null && c.uses >= c.maxUses) return { error: 'That code has been used up.' };
  if (!c.plans.includes(plan)) return { error: 'That code doesn’t apply to this plan.' };
  return { coupon: c };
}

export function couponLabel(c: Pick<Coupon, 'kind' | 'value' | 'duration'>): string {
  const off = c.kind === 'percent' ? `${c.value}% off` : `₦${c.value.toLocaleString('en-NG')} off`;
  return `${off} ${c.duration === 'every' ? 'every payment' : 'the first payment'}`;
}

export interface Adjusted {
  lines: InvoiceLine[];
  creditUsed: number;
  couponOff: number;
}

/**
 * Applies a coupon, then account credit, to invoice lines (D135).
 * The coupon is capped at COUPON_MAX_SHARE of the charge; credit is used before the card.
 */
export function adjustLines(lines: InvoiceLine[], opts: { coupon?: Pick<Coupon, 'code' | 'kind' | 'value'> | null; credit?: number }): Adjusted {
  const base = Math.max(0, lines.reduce((s, l) => s + l.amountNgn, 0));
  const out = [...lines];
  let couponOff = 0;
  if (opts.coupon && base > 0) {
    const raw = opts.coupon.kind === 'percent' ? Math.round((base * opts.coupon.value) / 100) : opts.coupon.value;
    couponOff = Math.min(raw, Math.floor(base * COUPON_MAX_SHARE));
    if (couponOff > 0) out.push({ label: `Code ${opts.coupon.code}`, amountNgn: -couponOff });
  }
  let creditUsed = 0;
  const afterCoupon = base - couponOff;
  if (opts.credit && opts.credit > 0 && afterCoupon > 0) {
    creditUsed = Math.min(opts.credit, afterCoupon);
    out.push({ label: 'Account credit from KUBICU', amountNgn: -creditUsed });
  }
  return { lines: out, creditUsed, couponOff };
}

export const cycleWord = (c: BillingCycle) => (c === 'yearly' ? 'year' : 'month');
