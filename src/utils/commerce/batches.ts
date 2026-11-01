import type { ProductVariant, StockBatch } from '../../types/commerce';
import { uid } from '../id';
import { figure, onOpsSettings } from '../opsSettings';

/**
 * Batches, lots and expiry dates (D476). Optional per delivery: a variant's `batches` cover some or all of its stock,
 * the rest is unbatched. Selling uses FEFO — the batch that expires soonest goes first — and never takes from an
 * expired batch while other stock is available. Expired units stay counted until they're written off.
 */
export let EXPIRY_WARN_DAYS = 30;
onOpsSettings(() => {
  EXPIRY_WARN_DAYS = figure('stock.expiryWarnDays');
});

const DAY = 86_400_000;
export const todayIso = () => new Date().toISOString().slice(0, 10);
const isExpired = (b: StockBatch, today: string) => !!b.expiresOn && b.expiresOn < today;

/** Soonest expiry first; batches without a date after them. */
export const sortBatches = (list: StockBatch[]) => [...list].sort((a, b) => (a.expiresOn ?? '9999').localeCompare(b.expiresOn ?? '9999') || a.receivedAt.localeCompare(b.receivedAt));

export const batchedQty = (v: ProductVariant) => (v.batches ?? []).reduce((s, b) => s + b.qty, 0);

/** Adds a received batch. Same code and expiry tops up the existing one. */
export function addBatch(v: ProductVariant, code: string, expiresOn: string | null, qty: number): ProductVariant {
  if (qty <= 0 || !code.trim() && !expiresOn) return v;
  const list = v.batches ?? [];
  const same = list.find((b) => b.code === code.trim() && b.expiresOn === expiresOn);
  const next = same ? list.map((b) => b === same ? { ...b, qty: b.qty + qty } : b) : [...list, { id: uid('lot'), code: code.trim(), expiresOn, qty, receivedAt: new Date().toISOString() }];
  return { ...v, batches: sortBatches(next) };
}

/**
 * Takes `n` units out of the variant's batches after a sale or write-off. With `batchId` the units come from that
 * batch; otherwise FEFO: unexpired batches by expiry, then undated batches, then unbatched stock, then expired batches.
 * Call with the variant's stock BEFORE the change.
 */
export function consumeBatches(v: ProductVariant, n: number, batchId?: string, today = todayIso()): StockBatch[] | undefined {
  if (!v.batches?.length || n <= 0) return v.batches;
  let left = n;
  const take = (list: StockBatch[], pick: (b: StockBatch) => boolean) =>
  list.map((b) => {
    if (left <= 0 || !pick(b)) return b;
    const used = Math.min(b.qty, left);
    left -= used;
    return { ...b, qty: b.qty - used };
  });
  let list = sortBatches(v.batches);
  if (batchId) list = take(list, (b) => b.id === batchId);
  list = take(list, (b) => !!b.expiresOn && !isExpired(b, today));
  list = take(list, (b) => !b.expiresOn);
  const unbatched = Math.max(0, v.stock - batchedQty(v));
  left = Math.max(0, left - unbatched);
  list = take(list, (b) => isExpired(b, today));
  return list.filter((b) => b.qty > 0);
}

/** Keeps batch totals within the stock count after a recount or other correction. Trims the latest-expiring first. */
export function fitBatches(batches: StockBatch[] | undefined, stock: number): StockBatch[] | undefined {
  if (!batches?.length) return batches;
  let over = batches.reduce((s, b) => s + b.qty, 0) - stock;
  if (over <= 0) return batches;
  const list = sortBatches(batches).reverse().map((b) => {
    if (over <= 0) return b;
    const cut = Math.min(b.qty, over);
    over -= cut;
    return { ...b, qty: b.qty - cut };
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

export function expiryState(v: ProductVariant, today = todayIso()): ExpiryState {
  const list = sortBatches(v.batches ?? []);
  const expiredBatches = list.filter((b) => isExpired(b, today));
  const next = list.find((b) => b.expiresOn && !isExpired(b, today)) ?? null;
  const limit = new Date(Date.parse(today) + EXPIRY_WARN_DAYS * DAY).toISOString().slice(0, 10);
  return { expiredQty: expiredBatches.reduce((s, b) => s + b.qty, 0), expiredBatches, soon: next && next.expiresOn && next.expiresOn <= limit ? next : null, next };
}

export const formatExpiry = (iso: string) => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${iso}T12:00:00`));