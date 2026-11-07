import type { DealRoomSettings, Block } from '../types/page';
import type { CommerceData, Order, Product } from '../types/commerce';
import type { ValidationIssue } from './validation';
import { refundOrder } from './commerce/ops';
import { canSell, priceRange, totalStock } from './commerce/catalog';
import { orderMoney } from './commerce/money';
import { formatSchedule } from './schedule';
import { formatNgn } from './format';

/**
 * DealRooms (D54). Every number shown comes from real orders and stock — nothing seeded or padded.
 * Limited drop: a set number of units until the deadline. Group goal: buyers pay now; if the goal
 * isn't reached by the deadline, every order is refunded in full automatically.
 */

export type RoomState = 'scheduled' | 'live' | 'goal_reached' | 'sold_out' | 'ended_success' | 'ended_missed';

export const roomStateLabel: Record<RoomState, string> = {
  scheduled: 'Opens soon',
  live: 'Live',
  goal_reached: 'Goal reached',
  sold_out: 'Sold out',
  ended_success: 'Ended',
  ended_missed: 'Goal missed',
};

export const roomTypeLabel = { drop: 'Limited drop', goal: 'Group goal' } as const;

/** Orders that count towards the room: placed from its link, paid, not cancelled or refunded. */
export function roomOrders(data: CommerceData | null, handle: string): Order[] {
  return (data?.orders ?? []).filter(
    (o) => o.sourceHandle === handle && o.status !== 'cancelled' && (o.paymentStatus === 'paid' || o.paymentStatus === 'partially_refunded'),
  );
}

function units(orders: Order[], productId: string): number {
  return orders.reduce((t, o) => t + o.items.filter((i) => i.productId === productId).reduce((s, i) => s + i.qty, 0), 0);
}

export interface RoomProgress {
  state: RoomState;
  /** Buyers (group goal) or units sold (drop). */
  count: number;
  /** Goal size or units available. */
  target: number;
  remaining: number;
  deadline: string | null;
  product: Product | undefined;
  unitPriceNgn: number | null;
  normalPriceNgn: number | null;
}

export function roomProgress(room: DealRoomSettings, handle: string, data: CommerceData | null, now = Date.now()): RoomProgress {
  const product = data?.products.find((p) => p.id === room.productId);
  const settled = data?.settledRooms?.[handle];
  const orders = roomOrders(data, handle);
  const normal = product ? (priceRange(product)?.[0] ?? null) : null;
  const unitPriceNgn = room.priceNgn ?? normal;
  const endedAt = room.endedAt ?? null;
  const deadline = room.deadline;
  const over = (endedAt && Date.parse(endedAt) <= now) || (deadline && Date.parse(deadline) <= now);

  if (room.type === 'goal') {
    const buyers = new Set(orders.map((o) => o.customer.phone.replace(/\D/g, '') || o.id)).size;
    const count = settled?.outcome === 'missed' ? settled.refunded : buyers;
    const target = Math.max(1, room.goal ?? 1);
    let state: RoomState = 'live';
    if (room.opensAt && Date.parse(room.opensAt) > now) state = 'scheduled';
    else if (over) state = settled?.outcome === 'missed' || count < target ? 'ended_missed' : 'ended_success';
    else if (count >= target) state = 'goal_reached';
    return { state, count, target, remaining: Math.max(0, target - count), deadline, product, unitPriceNgn, normalPriceNgn: normal };
  }

  const sold = units(orders, room.productId);
  const stock = product && product.trackStock ? totalStock(product) : Infinity;
  const target = Math.max(1, room.seats ?? 1);
  const left = Math.max(0, Math.min(target - sold, stock));
  let state: RoomState = 'live';
  if (room.opensAt && Date.parse(room.opensAt) > now) state = 'scheduled';
  else if (over) state = 'ended_success';
  else if (left <= 0 || (product && !canSell(product))) state = 'sold_out';
  return { state, count: sold, target, remaining: left, deadline, product, unitPriceNgn, normalPriceNgn: normal };
}

export function canJoin(p: RoomProgress): boolean {
  return p.state === 'live' || p.state === 'goal_reached';
}

/** Plain-language terms shown above the buy button. */
export function roomTerms(room: DealRoomSettings, p: RoomProgress): string[] {
  const out: string[] = [];
  const by = p.deadline ? formatSchedule(p.deadline) : 'the deadline';
  if (room.type === 'goal') {
    out.push(`You pay now. If ${p.target} people haven’t joined by ${by}, you’re refunded in full automatically.`);
    out.push('Orders are packed and sent once the goal is reached.');
  } else {
    out.push(`Only ${p.target} available at this price, until ${by} or until they’re gone.`);
  }
  out.push(`Limit ${room.perPersonLimit} per person.`);
  out.push(room.referralReward ? `After you join you get your own link. ${room.referralReward}` : 'After you join you get your own link to share.');
  if (p.unitPriceNgn !== null && p.normalPriceNgn !== null && p.unitPriceNgn < p.normalPriceNgn) out.push(`Room price ${formatNgn(p.unitPriceNgn)} (usually ${formatNgn(p.normalPriceNgn)}).`);
  return out;
}

/**
 * Settles a group goal: once the goal is reached, held orders are released for fulfilment;
 * after a missed deadline, every held order is refunded in full and restocked.
 */
export function settleRoom(data: CommerceData, room: DealRoomSettings, handle: string, now = Date.now()): CommerceData {
  if (room.type !== 'goal' || data.settledRooms?.[handle]) return data;
  const p = roomProgress(room, handle, data, now);
  const held = data.orders.filter((o) => o.sourceHandle === handle && o.held && o.status !== 'cancelled');
  if (p.count >= p.target && held.length) {
    const ids = new Set(held.map((o) => o.id));
    const at = new Date(now).toISOString();
    return {
      ...data,
      orders: data.orders.map((o) => (ids.has(o.id) ? { ...o, held: false, events: [{ id: `ev_goal_${o.id}`, at, kind: 'note' as const, label: 'Group goal reached — ready to fulfil' }, ...o.events] } : o)),
      ...(p.state === 'ended_success' ? { settledRooms: { ...data.settledRooms, [handle]: { at, outcome: 'reached' as const, refunded: 0 } } } : {}),
    };
  }
  if (p.state === 'ended_missed') {
    let next = data;
    const buyers = p.count;
    held.forEach((o) => {
      const refundable = orderMoney(o).gross - orderMoney(o).refunded;
      if (o.paymentStatus === 'paid' || o.paymentStatus === 'partially_refunded') next = refundOrder(next, o.id, refundable, 'Group goal missed — automatic full refund', true);
      // KUBICU waives its fee on missed-goal refunds; the provider fee stays (D55).
      next = { ...next, orders: next.orders.map((x) => (x.id === o.id ? { ...x, held: false, kubicuFeeNgn: 0, status: 'refunded' as const, events: [{ id: `ev_miss_${o.id}`, at: new Date(now).toISOString(), kind: 'refund' as const, label: 'Group goal missed — refunded in full automatically' }, ...x.events] } : x)) };
    });
    return { ...next, settledRooms: { ...next.settledRooms, [handle]: { at: new Date(now).toISOString(), outcome: 'missed', refunded: buyers } } };
  }
  return data;
}

export interface Referrer {
  code: string;
  name: string;
  joined: number;
}

/** Buyers whose personal link brought others into the room, most first. */
export function roomReferrers(data: CommerceData | null, handle: string): Referrer[] {
  const orders = roomOrders(data, handle);
  const owners = new Map<string, string>();
  orders.forEach((o) => o.referralCode && owners.set(o.referralCode, o.customer.name));
  const counts = new Map<string, number>();
  orders.forEach((o) => o.referredBy && counts.set(o.referredBy, (counts.get(o.referredBy) ?? 0) + 1));
  return Array.from(counts.entries())
    .map(([code, joined]) => ({ code, joined, name: owners.get(code) ?? 'A buyer' }))
    .sort((a, b) => b.joined - a.joined);
}

/** First name of whoever owns a share code in this room, if it's real. */
export function referrerName(data: CommerceData | null, handle: string, code: string | null): string | null {
  if (!code) return null;
  const o = roomOrders(data, handle).find((x) => x.referralCode === code.trim().toUpperCase());
  return o ? o.customer.name.split(/\s+/)[0] : null;
}

/**
 * Fees on a missed group goal (D55, recommended policy): buyers always get 100% back. The KUBICU
 * fee is waived on those orders; the provider's processing fee is usually not returned on refunds,
 * so it stays a cost to the seller. Rates are illustrative until a provider is confirmed.
 */
export function missedGoalFeeImpact(orders: Order[]): { refundNgn: number; providerFeesNgn: number } {
  return orders.reduce((t, o) => ({ refundNgn: t.refundNgn + orderMoney(o).gross, providerFeesNgn: t.providerFeesNgn + o.providerFeeNgn }), { refundNgn: 0, providerFeesNgn: 0 });
}

export interface DealRoomCheckout {
  productId: string;
  priceNgn: number | null;
  held: boolean;
  /** Units one person may still buy, before checking their earlier orders. */
  perPersonLimit: number;
  /** Units left in the room (drop) — Infinity for goals. */
  remaining: number;
  open: boolean;
  notice: string;
  handle: string;
}

/** What checkout needs to know about a room. */
export function dealRoomCheckout(room: DealRoomSettings, handle: string, data: CommerceData): DealRoomCheckout {
  const p = roomProgress(room, handle, data);
  return {
    productId: room.productId,
    priceNgn: room.priceNgn,
    held: room.type === 'goal' && p.count < p.target,
    perPersonLimit: room.perPersonLimit,
    remaining: room.type === 'drop' ? p.remaining : Infinity,
    open: canJoin(p),
    notice:
      room.type === 'goal'
        ? p.count < p.target
          ? `You pay now. If ${p.target} people haven’t joined by ${p.deadline ? formatSchedule(p.deadline) : 'the deadline'}, you’ll be refunded in full automatically.`
          : 'The goal has been reached — your order will be packed and sent.'
        : `Room price, limited to ${p.target} in total.`,
    handle,
  };
}

/** Units this phone number has already bought from the room. */
export function unitsBoughtBy(data: CommerceData, handle: string, phone: string, productId: string): number {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return 0;
  return units(roomOrders(data, handle).filter((o) => o.customer.phone.replace(/\D/g, '') === digits), productId);
}

/** Pre-publish checks for a DealRoom. */
export function dealRoomIssues(room: DealRoomSettings, blocks: Block[], data: CommerceData | null, joined: number, now = Date.now()): ValidationIssue[] {
  const out: ValidationIssue[] = [];
  const push = (id: string, severity: ValidationIssue['severity'], message: string) => out.push({ id: `room:${id}`, blockId: null, severity, message });
  const product = data?.products.find((p) => p.id === room.productId);
  if (!product) push('product', 'error', 'Choose the product this room sells.');
  else if (product.status !== 'active') push('product', 'error', `“${product.name}” is ${product.status} in Commerce. Make it active to open the room.`);
  else if (room.type === 'drop' && product.trackStock && room.seats !== null && totalStock(product) < room.seats && joined === 0)
    push('stock', 'warning', `You have ${totalStock(product)} in stock but offer ${room.seats}. The room sells out when stock runs out.`);
  if (product && (room.priceNgn ?? priceRange(product)?.[0] ?? null) === null) push('price', 'error', 'Set a room price — the product has no price.');
  if (!room.deadline) push('deadline', 'error', 'Set a deadline.');
  else if (Date.parse(room.deadline) <= now && joined === 0) push('deadline', 'error', 'The deadline has already passed.');
  if (room.opensAt && room.deadline && Date.parse(room.deadline) <= Date.parse(room.opensAt)) push('order', 'error', 'The deadline is before the room opens.');
  if (room.type === 'goal' && (!room.goal || room.goal < 2)) push('goal', 'error', 'A group goal needs at least 2 buyers.');
  if (room.type === 'drop' && (!room.seats || room.seats < 1)) push('seats', 'error', 'How many are available in this drop?');
  if (room.perPersonLimit < 1) push('limit', 'error', 'Allow at least 1 per person.');
  void blocks;
  return out;
}
