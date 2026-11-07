import type { Branch, CommerceData, Order, ProductVariant } from '../../types/commerce';
import type { WorkspacePlan } from '../../types/plan';
import { uid } from '../id';
import { moveBatches } from './batches';

/**
 * Branches and franchises (D437). The main shop is implicit: it holds whatever stock isn't at a branch.
 * Each variant's `branchStock` lists only the other branches, so editing stock the usual way changes the main shop.
 */
export const MAIN_BRANCH = 'main';
export const BRANCH_PLAN: WorkspacePlan = 'business';
export const MAX_BRANCHES = 20;

export const branchesOf = (data: CommerceData): Branch[] => data.branches ?? [];

/** Units at each location for one variant, main shop first. */
export function stockAt(v: ProductVariant, branchId: string): number {
  const others = v.branchStock ?? {};
  if (branchId !== MAIN_BRANCH) return Math.max(0, others[branchId] ?? 0);
  const elsewhere = Object.values(others).reduce((s, n) => s + Math.max(0, n), 0);
  return Math.max(0, v.stock - elsewhere);
}

export function locationName(data: CommerceData, branchId: string | undefined, mainName = 'Main shop'): string {
  if (!branchId || branchId === MAIN_BRANCH) return mainName;
  return branchesOf(data).find((b) => b.id === branchId)?.name ?? mainName;
}

export function emptyBranch(): Branch {
  return { id: uid('br'), name: '', address: '', hours: '', phone: '', pickup: true, status: 'open', kind: 'owned', createdAt: new Date().toISOString() };
}

export type BranchErrors = Partial<Record<'name' | 'address' | 'operator' | 'royalty', string>>;

export function branchErrors(b: Branch, others: Branch[]): BranchErrors {
  const e: BranchErrors = {};
  const name = b.name.trim();
  if (!name) e.name = 'Give the branch a name';
  else if (name.toLowerCase() === 'main shop' || others.some((o) => o.id !== b.id && o.name.trim().toLowerCase() === name.toLowerCase())) e.name = 'You already have a location with this name';
  if (b.address.trim().length < 6) e.address = 'Add the street address';
  if (b.kind === 'franchise') {
    if (!b.franchise?.operator.trim()) e.operator = 'Who runs this branch?';
    const r = b.franchise?.royaltyPct ?? 0;
    if (!(r >= 0 && r <= 50)) e.royalty = 'Between 0% and 50%';
  }
  return e;
}

export function upsertBranch(data: CommerceData, b: Branch): CommerceData {
  const list = branchesOf(data);
  const clean: Branch = { ...b, name: b.name.trim(), address: b.address.trim(), hours: b.hours.trim(), phone: b.phone.trim(), franchise: b.kind === 'franchise' ? b.franchise : undefined };
  return { ...data, branches: list.some((x) => x.id === b.id) ? list.map((x) => (x.id === b.id ? clean : x)) : [...list, clean] };
}

/** Removing a branch hands its stock back to the main shop; past orders keep their pickup details. */
export function removeBranch(data: CommerceData, id: string): CommerceData {
  return {
    ...data,
    branches: branchesOf(data).filter((b) => b.id !== id),
    products: data.products.map((p) => ({
      ...p,
      variants: p.variants.map((v) => {
        if (!v.branchStock || !(id in v.branchStock)) return v;
        const { [id]: _gone, ...rest } = v.branchStock;
        // The branch's batches go back to the main shop with its stock (D478).
        return { ...v, branchStock: rest, batches: v.batches?.map((b) => (b.branchId === id ? { ...b, branchId: undefined } : b)) };
      }),
    })),
  };
}

/** Units of one variant held at a branch, for a stock change at that location. Total stock is changed by the caller. */
export function shiftBranchStock(v: ProductVariant, branchId: string | undefined, delta: number): ProductVariant {
  if (!branchId || branchId === MAIN_BRANCH || !v.branchStock) return v;
  return { ...v, branchStock: { ...v.branchStock, [branchId]: Math.max(0, (v.branchStock[branchId] ?? 0) + delta) } };
}

export type TransferResult = { ok: true; data: CommerceData } | { ok: false; message: string };

/** Moves units between two locations. Total stock doesn't change; the move is recorded on both sides. */
export function transferStock(data: CommerceData, productId: string, variantId: string, from: string, to: string, qty: number, by: string): TransferResult {
  if (from === to) return { ok: false, message: 'Choose two different locations' };
  if (!Number.isInteger(qty) || qty <= 0) return { ok: false, message: 'Enter a whole number above 0' };
  const product = data.products.find((p) => p.id === productId);
  const variant = product?.variants.find((v) => v.id === variantId);
  if (!product || !variant) return { ok: false, message: 'That product is gone' };
  const available = stockAt(variant, from);
  if (qty > available) return { ok: false, message: `Only ${available} at ${locationName(data, from)}` };
  const at = new Date().toISOString();
  const note = `${locationName(data, from)} → ${locationName(data, to)}`;
  const products = data.products.map((p) =>
    p.id !== productId
      ? p
      : {
          ...p,
          variants: p.variants.map((v) => {
            if (v.id !== variantId) return v;
            const bs = { ...(v.branchStock ?? {}) };
            if (from !== MAIN_BRANCH) bs[from] = Math.max(0, (bs[from] ?? 0) - qty);
            if (to !== MAIN_BRANCH) bs[to] = (bs[to] ?? 0) + qty;
            // Batches travel with the units, soonest-expiring first (D478).
            return { ...v, branchStock: bs, batches: moveBatches(v, from, to, qty) };
          }),
        },
  );
  const out = { id: uid('mv'), productId, variantId, delta: -qty, after: available - qty, reason: 'transfer' as const, note, by, at };
  const inn = { id: uid('mv'), productId, variantId, delta: qty, after: stockAt(variant, to) + qty, reason: 'transfer' as const, note, by, at };
  return { ok: true, data: { ...data, products, movements: [inn, out, ...data.movements].slice(0, 500) } };
}

/** Paid sales picked up at each location, for branch and franchise reports. */
export function salesByLocation(data: CommerceData, sinceIso?: string): Record<string, { orders: number; salesNgn: number }> {
  const out: Record<string, { orders: number; salesNgn: number }> = {};
  data.orders.forEach((o: Order) => {
    if (o.paymentStatus !== 'paid' && o.paymentStatus !== 'partially_refunded') return;
    if (sinceIso && o.createdAt < sinceIso) return;
    const key = o.fulfilment.branchId ?? MAIN_BRANCH;
    const refunded = o.refunds.reduce((s, r) => s + r.amountNgn, 0);
    const net = Math.max(0, o.subtotalNgn - o.discountNgn - refunded);
    out[key] = { orders: (out[key]?.orders ?? 0) + 1, salesNgn: (out[key]?.salesNgn ?? 0) + net };
  });
  return out;
}

export const royaltyFor = (b: Branch, salesNgn: number) => (b.kind === 'franchise' && b.franchise ? Math.round((salesNgn * b.franchise.royaltyPct) / 100) : 0);

/** Open branches buyers can collect from, after the main shop's own pickup. */
export const pickupBranches = (data: CommerceData) => branchesOf(data).filter((b) => b.status === 'open' && b.pickup);
