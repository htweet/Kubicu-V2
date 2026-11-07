import type { ProductVariant, StockBatch } from '../../types/commerce';
import { uid } from '../id';
import { figure, onOpsSettings } from '../opsSettings';
import { MAIN_BRANCH, stockAt } from './branches';

/**
 * Batches, lots and expiry dates (D476). Optional per delivery: a variant's `batches` cover some or all of its stock,
 * the rest is unbatched. Selling uses FEFO — the batch that expires soonest goes first — and never takes from an
 * expired batch while other stock is available. Expired units stay counted until they're written off.
 *
 * Each batch sits at one location (D478): `branchId` missing means the main shop. A location's batches never add up
 * to more than that location's stock; transfers carry batches with them.
 */
export let EXPIRY_WARN_DAYS = 30;
onOpsSettings(() => {
  EXPIRY_WARN_DAYS = figure('stock.expiryWarnDays');
});

const DAY = 86_400_000;
export const todayIso = () => new Date().toISOString().slice(0, 10);
const isExpired = (b: StockBatch, today: string) => !!b.expiresOn && b.expiresOn < today;
const locOf = (b: StockBatch) => b.branchId ?? MAIN_BRANCH;
const norm = (loc?: string) => loc ?? MAIN_BRANCH;

/** Soonest expiry first; batches without a date after them. */
export const sortBatches = (list: StockBatch[]) => [...list].sort((a, b) => (a.expiresOn ?? '9999').localeCompare(b.expiresOn ?? '9999') || a.receivedAt.localeCompare(b.receivedAt));

/** Batches at one location, or every batch when no location is given. */
export const batchesAt = (v: ProductVariant, loc?: string) => (loc === undefined ? v.batches ?? [] : (v.batches ?? []).filter((b) => locOf(b) === loc));

export const batchedQty = (v: ProductVariant, loc?: string) => batchesAt(v, loc).reduce((s, b) => s + b.qty, 0);

/** Adds a received batch at a location (main shop by default). Same code, expiry and location tops up the existing one. */
export function addBatch(v: ProductVariant, code: string, expiresOn: string | null, qty: number, loc?: string): ProductVariant {
  if (qty <= 0 || (!code.trim() && !expiresOn)) return v;
  const where = norm(loc);
  const list = v.batches ?? [];
  const same = list.find((b) => b.code === code.trim() && b.expiresOn === expiresOn && locOf(b) === where);
  const fresh: StockBatch = { id: uid('lot'), code: code.trim(), expiresOn, qty, receivedAt: new Date().toISOString(), ...(where === MAIN_BRANCH ? {} : { branchId: where }) };
  const next = same ? list.map((b) => (b === same ? { ...b, qty: b.qty + qty } : b)) : [...list, fresh];
  return { ...v, batches: sortBatches(next) };
}

/**
 * Takes up to `n` units from one location's batches in FEFO order: a chosen batch first, then unexpired dated batches,
 * then undated ones, then that location's unbatched stock, then expired batches. Returns what's left and what was taken.
 * `v` is the variant BEFORE the change.
 */
function takeFefo(v: ProductVariant, loc: string, n: number, batchId: string | undefined, today: string) {
  const taken: StockBatch[] = [];
  let left = n;
  const take = (list: StockBatch[], pick: (b: StockBatch) => boolean) =>
    list.map((b) => {
      if (left <= 0 || locOf(b) !== loc || !pick(b)) return b;
      const used = Math.min(b.qty, left);
      left -= used;
      if (used > 0) taken.push({ ...b, qty: used });
      return { ...b, qty: b.qty - used };
    });
  let list = sortBatches(v.batches ?? []);
  if (batchId) list = take(list, (b) => b.id === batchId);
  list = take(list, (b) => !!b.expiresOn && !isExpired(b, today));
  list = take(list, (b) => !b.expiresOn);
  const unbatched = Math.max(0, stockAt(v, loc) - batchedQty(v, loc));
  left = Math.max(0, left - unbatched);
  list = take(list, (b) => isExpired(b, today));
  return { remaining: list.filter((b) => b.qty > 0), taken };
}

/** Takes `n` units out of a location's batches after a sale or write-off. Call with the variant BEFORE the change. */
export function consumeBatches(v: ProductVariant, n: number, batchId?: string, loc?: string, today = todayIso()): StockBatch[] | undefined {
  if (!v.batches?.length || n <= 0) return v.batches;
  return takeFefo(v, norm(loc), n, batchId, today).remaining;
}

/** Carries batches along with a transfer between locations, soonest-expiring first. Call with the variant BEFORE the move. */
export function moveBatches(v: ProductVariant, from: string, to: string, qty: number, today = todayIso()): StockBatch[] | undefined {
  if (!v.batches?.length || qty <= 0 || from === to) return v.batches;
  const { remaining, taken } = takeFefo(v, from, qty, undefined, today);
  let list = remaining;
  taken.forEach((t) => {
    const same = list.find((b) => b.code === t.code && b.expiresOn === t.expiresOn && locOf(b) === to);
    const moved: StockBatch = { ...t, id: uid('lot'), branchId: to === MAIN_BRANCH ? undefined : to };
    list = same ? list.map((b) => (b === same ? { ...b, qty: b.qty + t.qty } : b)) : [...list, moved];
  });
  return sortBatches(list);
}

/** Keeps each location's batch total within that location's stock after a recount or correction. Trims latest-expiring first. */
export function fitBatches(v: ProductVariant): StockBatch[] | undefined {
  if (!v.batches?.length) return v.batches;
  const locs = [...new Set(v.batches.map(locOf))];
  let list = sortBatches(v.batches);
  locs.forEach((loc) => {
    let over = batchedQty({ ...v, batches: list }, loc) - stockAt(v, loc);
    if (over <= 0) return;
    list = [...list].reverse().map((b) => {
      if (over <= 0 || locOf(b) !== loc) return b;
      const cut = Math.min(b.qty, over);
      over -= cut;
      return { ...b, qty: b.qty - cut };
    }).reverse();
  });
  return sortBatches(list.filter((b) => b.qty > 0));
}

export interface ExpiryState {
  expiredQty: number;
  expiredBatches: StockBatch[];
  /** The soonest unexpired dated batch, when it's within the warning window. */
  soon: StockBatch | null;
  /** The soonest unexpired expiry date at all. */
  next: StockBatch | null;
}

/** Expiry for one location, or across every location when none is given. */
export function expiryState(v: ProductVariant, loc?: string, today = todayIso()): ExpiryState {
  const list = sortBatches(batchesAt(v, loc));
  const expiredBatches = list.filter((b) => isExpired(b, today));
  const next = list.find((b) => b.expiresOn && !isExpired(b, today)) ?? null;
  const limit = new Date(Date.parse(today) + EXPIRY_WARN_DAYS * DAY).toISOString().slice(0, 10);
  return { expiredQty: expiredBatches.reduce((s, b) => s + b.qty, 0), expiredBatches, soon: next && next.expiresOn && next.expiresOn <= limit ? next : null, next };
}

export const formatExpiry = (iso: string) => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${iso}T12:00:00`));
