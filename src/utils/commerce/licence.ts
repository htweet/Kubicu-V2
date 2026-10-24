import type { CommerceData, LicenceKey, Order } from '../../types/commerce';
import { uid } from '../id';

// No 0/O or 1/I so keys read cleanly over the phone or WhatsApp.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function makeKey(prefix: string): string {
  const block = () => Array.from({ length: 4 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('');
  const p = prefix.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  return [p || null, block(), block(), block()].filter(Boolean).join('-');
}

/** Paid orders with digital items whose product issues keys get one key per product, once (D125). */
export function ensureLicenceKeys(data: CommerceData, orderId: string): CommerceData {
  const order = data.orders.find((o) => o.id === orderId);
  if (!order || order.paymentStatus === 'pending' || order.paymentStatus === 'refunded' || order.paymentStatus === 'cancelled') return data;
  const existing = order.licenceKeys ?? [];
  const add: LicenceKey[] = [];
  order.items.
  filter((i) => i.kind === 'digital').
  forEach((i) => {
    const p = data.products.find((x) => x.id === i.productId);
    const cfg = p?.digital?.keys;
    if (!cfg?.enabled || existing.some((k) => k.productId === i.productId) || add.some((k) => k.productId === i.productId)) return;
    add.push({ id: uid('lk'), productId: i.productId, key: makeKey(cfg.prefix), activationsAllowed: cfg.activations * i.qty, activations: 0, status: 'active', issuedAt: new Date().toISOString() });
  });
  if (!add.length) return data;
  return patchOrder(data, orderId, (o) => ({ ...o, licenceKeys: [...existing, ...add] }));
}

export function revokeKey(data: CommerceData, orderId: string, keyId: string): CommerceData {
  return patchOrder(data, orderId, (o) => ({ ...o, licenceKeys: (o.licenceKeys ?? []).map((k) => k.id === keyId ? { ...k, status: 'revoked', revokedAt: new Date().toISOString() } : k) }));
}

/** Revokes the old key and issues a fresh one with the same allowance (e.g. a leaked key). */
export function reissueKey(data: CommerceData, orderId: string, keyId: string): CommerceData {
  const order = data.orders.find((o) => o.id === orderId);
  const old = order?.licenceKeys?.find((k) => k.id === keyId);
  if (!order || !old) return data;
  const prefix = data.products.find((p) => p.id === old.productId)?.digital?.keys?.prefix ?? '';
  const fresh: LicenceKey = { ...old, id: uid('lk'), key: makeKey(prefix), activations: 0, status: 'active', issuedAt: new Date().toISOString(), revokedAt: undefined, replaces: old.id };
  const revoked = revokeKey(data, orderId, keyId);
  return patchOrder(revoked, orderId, (o) => ({ ...o, licenceKeys: [...(o.licenceKeys ?? []), fresh] }));
}

/** Finds which order a key belongs to — for a seller checking a customer's key. */
export function findKey(data: CommerceData, query: string): {order: Order;key: LicenceKey;} | null {
  const q = query.trim().toUpperCase();
  if (q.length < 4) return null;
  for (const order of data.orders) {
    const key = (order.licenceKeys ?? []).find((k) => k.key === q || k.key.replace(/-/g, '') === q.replace(/-/g, ''));
    if (key) return { order, key };
  }
  return null;
}

function patchOrder(data: CommerceData, orderId: string, fn: (o: Order) => Order): CommerceData {
  return { ...data, orders: data.orders.map((o) => o.id === orderId ? fn(o) : o) };
}