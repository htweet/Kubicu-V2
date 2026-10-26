import type { CommerceData, GiftCard, Order, Product } from '../../types/commerce';
import type { WorkspacePlan } from '../../types/plan';
import { uid } from '../id';

/** Pre-orders, bulk prices and gift cards (D202). Example limits, logged in the decision register. */

export const MAX_BULK_LEVELS = 4;
/** Gift cards are sold through checkout, so they follow the checkout plan. */
export const GIFT_CARD_PLAN: WorkspacePlan = 'pro';
export const GIFT_CARD_PRODUCT_ID = 'prd_giftcard';
export const DEFAULT_GIFT_AMOUNTS = [5000, 10000, 20000, 50000];

// ——— Bulk prices ———

/** Levels in ascending quantity, keeping only ones that actually lower the price. */
export function bulkLevels(p: Product): {minQty: number;priceNgn: number;}[] {
  return (p.bulkPrices ?? []).filter((b) => b.minQty >= 2 && b.priceNgn > 0).sort((a, b) => a.minQty - b.minQty);
}

/** The price per item for `qty` of this product in one order. Never higher than the normal price. */
export function bulkUnitPrice(p: Product, base: number, qty: number): number {
  const level = bulkLevels(p).
  filter((b) => qty >= b.minQty).
  pop();
  return level ? Math.min(base, level.priceNgn) : base;
}

/** Problems with a product's bulk levels, shown in the editor. */
export function bulkIssues(p: Product): string | null {
  const levels = p.bulkPrices ?? [];
  if (!levels.length) return null;
  if (levels.some((b) => !Number.isFinite(b.minQty) || b.minQty < 2)) return 'Each level starts from 2 items or more.';
  if (levels.some((b) => !b.priceNgn || b.priceNgn <= 0)) return 'Give every level a price.';
  const sorted = [...levels].sort((a, b) => a.minQty - b.minQty);
  if (new Set(sorted.map((b) => b.minQty)).size !== sorted.length) return 'Two levels start from the same quantity.';
  if (p.priceNgn !== null && sorted.some((b) => b.priceNgn >= (p.priceNgn as number))) return 'Bulk prices should be lower than the normal price.';
  if (sorted.some((b, i) => i > 0 && b.priceNgn >= sorted[i - 1].priceNgn)) return 'Each bigger quantity should have a lower price.';
  return null;
}

// ——— Pre-orders ———

export function isPreorder(p: Product | undefined): p is Product & {preorder: NonNullable<Product['preorder']>;} {
  return !!p && p.kind === 'physical' && !!p.preorder;
}

/** Pre-orders still available; null = no limit. */
export function preorderLeft(p: Product): number | null {
  if (!p.preorder || p.preorder.limit === null) return null;
  return Math.max(0, p.preorder.limit - p.preorder.taken);
}

export function shipsByLabel(date: string): string {
  const d = new Date(`${date}T12:00:00`);
  return Number.isNaN(d.getTime()) ? date : d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ——— Gift cards ———

export type GiftCardState = 'active' | 'used' | 'expired' | 'disabled';

export function giftCardState(c: GiftCard, now = Date.now()): GiftCardState {
  if (c.status === 'disabled') return 'disabled';
  if (c.expiresAt && Date.parse(c.expiresAt) <= now) return 'expired';
  if (c.balanceNgn <= 0) return 'used';
  return 'active';
}

export const giftCardStateLabels: Record<GiftCardState, string> = { active: 'Active', used: 'Fully used', expired: 'Expired', disabled: 'Turned off' };

export function normaliseGiftCode(s: string): string {
  return s.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 24);
}

export function makeGiftCode(taken: Set<string>): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part = () => Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
  for (let i = 0; i < 30; i++) {
    const code = `GIFT-${part()}-${part()}`;
    if (!taken.has(code)) return code;
  }
  return `GIFT-${Date.now().toString(36).toUpperCase()}`;
}

export function findGiftCard(data: CommerceData, code: string): GiftCard | undefined {
  const c = normaliseGiftCode(code);
  return c ? (data.giftCards ?? []).find((g) => g.code === c) : undefined;
}

export type GiftCardResolution = {ok: true;card: GiftCard;amountNgn: number;} | {ok: false;message: string;} | null;

/** Checks a code against live data and works out how much of `payableNgn` it covers. */
export function resolveGiftCard(data: CommerceData, code: string, payableNgn: number, cartHasGiftCards: boolean): GiftCardResolution {
  if (!code.trim()) return null;
  if (cartHasGiftCards) return { ok: false, message: 'Gift cards can’t be used to buy other gift cards.' };
  const card = findGiftCard(data, code);
  if (!card) return { ok: false, message: 'We couldn’t find that gift card. Check the code and try again.' };
  const state = giftCardState(card);
  if (state === 'used') return { ok: false, message: 'This gift card has no balance left.' };
  if (state === 'expired') return { ok: false, message: 'This gift card has expired.' };
  if (state === 'disabled') return { ok: false, message: 'This gift card can’t be used. Contact the shop.' };
  return { ok: true, card, amountNgn: Math.max(0, Math.min(card.balanceNgn, payableNgn)) };
}

function newCard(data: CommerceData, taken: Set<string>, fields: Omit<GiftCard, 'id' | 'code' | 'balanceNgn' | 'uses' | 'createdAt' | 'status'>): GiftCard {
  const code = makeGiftCode(taken);
  taken.add(code);
  return { id: uid('gc'), code, balanceNgn: fields.initialNgn, uses: [], status: 'active', createdAt: new Date().toISOString(), ...fields };
}

/** Issues one card per gift card item once an order is paid. Safe to call more than once. */
export function issueGiftCardsForOrder(data: CommerceData, orderId: string): CommerceData {
  const order = data.orders.find((o) => o.id === orderId);
  if (!order || order.paymentStatus !== 'paid') return data;
  const cards = data.giftCards ?? [];
  if (cards.some((c) => c.orderId === order.id)) return data;
  const lines = order.items.filter((i) => data.products.find((p) => p.id === i.productId)?.giftCard);
  if (!lines.length) return data;
  const taken = new Set(cards.map((c) => c.code));
  const issued: GiftCard[] = [];
  lines.forEach((l) => {
    for (let n = 0; n < l.qty; n++)
    issued.push(newCard(data, taken, { initialNgn: l.unitPriceNgn, source: 'sold', orderId: order.id, orderNumber: order.number, buyerName: order.customer.name, recipientName: '', message: '', expiresAt: null }));
  });
  const ev = { id: uid('ev'), kind: 'note' as const, label: `${issued.length} gift card code${issued.length === 1 ? '' : 's'} issued — shown on the buyer’s order page`, at: new Date().toISOString() };
  return { ...data, giftCards: [...issued, ...cards], orders: data.orders.map((o) => o.id === order.id ? { ...o, events: [ev, ...o.events] } : o) };
}

/** A card the seller issues by hand: store credit, a prize, or one sold in person. */
export function issueGiftCard(data: CommerceData, input: {amountNgn: number;recipientName: string;message: string;note: string;expiresAt: string | null;buyerName: string;}): {data: CommerceData;card: GiftCard;} {
  const cards = data.giftCards ?? [];
  const card = newCard(data, new Set(cards.map((c) => c.code)), { initialNgn: input.amountNgn, source: 'issued', buyerName: input.buyerName, recipientName: input.recipientName, message: input.message, note: input.note, expiresAt: input.expiresAt });
  return { data: { ...data, giftCards: [card, ...cards] }, card };
}

export function spendGiftCard(data: CommerceData, code: string, amountNgn: number, order: Pick<Order, 'id' | 'number'>): CommerceData {
  const c = normaliseGiftCode(code);
  return {
    ...data,
    giftCards: (data.giftCards ?? []).map((g) =>
    g.code === c ? { ...g, balanceNgn: Math.max(0, g.balanceNgn - amountNgn), uses: [{ orderId: order.id, orderNumber: order.number, amountNgn, at: new Date().toISOString() }, ...g.uses] } : g
    )
  };
}

export function setGiftCardStatus(data: CommerceData, id: string, status: GiftCard['status']): CommerceData {
  return { ...data, giftCards: (data.giftCards ?? []).map((g) => g.id === id ? { ...g, status } : g) };
}

/** Creates or updates the shop's gift card product with the chosen amounts. */
export function upsertGiftCardProduct(data: CommerceData, amounts: number[], active: boolean): CommerceData {
  const clean = [...new Set(amounts.filter((a) => a > 0))].sort((a, b) => a - b).slice(0, 6);
  const now = new Date().toISOString();
  const prev = data.products.find((p) => p.id === GIFT_CARD_PRODUCT_ID);
  const label = (n: number) => `₦${n.toLocaleString('en-NG')}`;
  const product: Product = {
    id: GIFT_CARD_PRODUCT_ID,
    name: prev?.name ?? 'Gift card',
    description: prev?.description ?? 'A gift card for anything in the shop. The code arrives on your order page as soon as payment is confirmed.',
    status: active ? 'active' : 'draft',
    kind: 'physical',
    priceNgn: clean[0] ?? null,
    compareAtNgn: null,
    images: prev?.images ?? [],
    options: [{ id: 'opt_amount', name: 'Amount', values: clean.map(label) }],
    variants: clean.map((a) => ({ id: `gcv_${a}`, sku: '', options: { Amount: label(a) }, priceNgn: a, stock: 0 })),
    collectionIds: prev?.collectionIds ?? [],
    trackStock: false,
    lowStockAt: 0,
    weightKg: null,
    giftCard: true,
    createdAt: prev?.createdAt ?? now,
    updatedAt: now
  };
  return { ...data, products: prev ? data.products.map((p) => p.id === product.id ? product : p) : [product, ...data.products] };
}