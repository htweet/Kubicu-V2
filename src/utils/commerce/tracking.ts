import type { CommerceData, Order, OrderTracking, TrackingCarrier, TrackingMilestone } from '../../types/commerce';
import type { Delivery, FulfilmentData } from '../../types/fulfilment';
import { failLabels } from '../fulfilment';
import { dispatchBlocked } from './deposit';
import { uid } from '../id';

/**
 * Order tracking, paid → delivered (D144).
 * One view built from the order, its KUBICU delivery (if any) and the seller's own updates,
 * shared by the buyer's order page, the seller's order panel, the Orders list and notifications.
 * Text is returned as { t, v } so each surface translates it in its own language.
 */

export interface Msg {
  t: string;
  v?: Record<string, string | number>;
}

export type StageKey = 'confirmed' | 'preparing' | 'handed' | 'on_the_way' | 'delivered' | 'ready' | 'collected';
export type StageState = 'done' | 'current' | 'upcoming' | 'problem';
export type TrackHealth = 'on_track' | 'at_risk' | 'late' | 'problem' | 'waiting' | 'done' | 'cancelled';

export interface StageView {
  key: StageKey;
  label: string;
  at?: string;
  state: StageState;
}

export interface FeedItem {
  id: string;
  at: string;
  /** Translatable text; `raw` is the seller's own words and is never translated. */
  text: Msg | null;
  raw?: string;
  location?: string;
  source: 'order' | 'courier' | 'seller';
}

export interface TrackingView {
  applies: boolean;
  pickup: boolean;
  stages: StageView[];
  health: TrackHealth;
  headline: Msg;
  detail: Msg | null;
  promisedBy: string | null;
  promiseSource: 'seller' | 'courier' | 'estimate' | null;
  doneAt?: string;
  /** Delivered/collected after the promise. */
  wasLate: boolean;
  lastUpdateAt: string;
  delivery: Delivery | null;
  carrier?: TrackingCarrier;
  feed: FeedItem[];
  /** Seller-facing reasons behind at-risk / late / problem. */
  signals: Msg[];
}

const HOUR = 3600000;
const DAY = 24 * HOUR;
/** Example figures: hours before an order "at risk", and silence before "no update". */
export const AT_RISK_HOURS = 24;
export const STALE_HOURS = 48;
export const RIDER_WAIT_HOURS = 2;
export const ON_ROAD_HOURS = 6;

export function dayLabel(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function promiseLabel(iso: string): string {
  const d = new Date(iso);
  const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;
  return hasTime ? `${dayLabel(iso)}, ${timeLabel(iso)}` : dayLabel(iso);
}

const at = (base: Date, days: number, hour: number) => {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

/** Read "1–3 days", "2 working days", "same day", "tomorrow" from the seller's delivery time text. */
export function daysFromEta(text: string | undefined): number | null {
  if (!text) return null;
  const s = text.toLowerCase();
  if (/same[- ]day|today/.test(s)) return 0;
  if (/tomorrow|next[- ]day/.test(s)) return 1;
  const range = s.match(/(\d+)\s*(?:–|-|to)\s*(\d+)/);
  if (range) return Number(range[2]);
  const one = s.match(/(\d+)\s*(?:working\s*|business\s*)?day/);
  if (one) return Number(one[1]);
  const week = s.match(/(\d+)\s*week/);
  if (week) return Number(week[1]) * 7;
  return null;
}

function courierPromise(d: Delivery): string | null {
  const base = new Date(d.createdAt);
  if (/^today/i.test(d.etaLabel)) return at(base, 0, 19);
  if (/^tomorrow/i.test(d.etaLabel)) return at(base, 1, 18);
  return null;
}

const evAt = (o: Order, kind: Order['events'][number]['kind']) => o.events.filter((e) => e.kind === kind).map((e) => e.at).sort()[0];

function confirmedAt(o: Order): string {
  return evAt(o, 'paid') ?? (o.pod ? evAt(o, 'placed') ?? o.createdAt : o.createdAt);
}

/** Latest KUBICU delivery for an order (active first, else the most recent). */
export function deliveryFor(f: FulfilmentData | null, orderId: string): Delivery | null {
  if (!f) return null;
  const all = f.deliveries.filter((d) => d.orderId === orderId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return all.find((d) => d.status === 'booked' || d.status === 'assigned' || d.status === 'picked_up') ?? all[0] ?? null;
}

function courierEventAt(d: Delivery | null, test: (label: string) => boolean): string | undefined {
  return d?.events.filter((e) => test(e.label)).map((e) => e.at).sort()[0];
}

export function promiseFor(o: Order, d: Delivery | null): {at: string | null;source: TrackingView['promiseSource'];} {
  if (o.tracking?.promisedBy) return { at: o.tracking.promisedBy, source: 'seller' };
  if (d) {
    const c = courierPromise(d);
    if (c) return { at: c, source: 'courier' };
  }
  if (o.balance && !o.balance.paidAt) return { at: null, source: null };
  const base = new Date(confirmedAt(o));
  const pickup = o.fulfilment.method === 'pickup';
  const days = daysFromEta(o.fulfilment.eta) ?? (pickup ? 2 : 3);
  return { at: at(base, days, 18), source: 'estimate' };
}

export function buildTracking(o: Order, f: FulfilmentData | null, now = Date.now()): TrackingView {
  const pickup = o.fulfilment.method === 'pickup';
  const applies = o.fulfilment.method === 'delivery' || pickup;
  const d = pickup ? null : deliveryFor(f, o.id);
  const tracking: OrderTracking = o.tracking ?? { updates: [] };
  const promise = promiseFor(o, d);
  const outUpdate = tracking.updates.filter((u) => u.milestone === 'out_for_delivery').map((u) => u.at).sort()[0];
  const transitUpdate = tracking.updates.filter((u) => u.milestone === 'in_transit').map((u) => u.at).sort()[0];
  const pickedAt = courierEventAt(d, (l) => /^Picked up/.test(l));
  const shippedAt = evAt(o, 'shipped') ?? evAt(o, 'ready');
  const completedAt = evAt(o, 'completed') ?? courierEventAt(d, (l) => /^Handed over/.test(l));
  const cancelled = o.status === 'cancelled' || o.status === 'refunded';
  const done = o.status === 'completed' || d?.status === 'delivered';

  // How far it has got (index into the stage list).
  let reached = -1;
  if (o.status !== 'new' || o.pod) reached = 0;
  if (o.status === 'packing') reached = 1;
  if (!pickup) {
    if (o.status === 'out_for_delivery') reached = tracking.carrier && !outUpdate && !d ? 2 : 3;
    if (d?.status === 'picked_up') reached = Math.max(reached, 3);
    if (tracking.carrier && transitUpdate) reached = Math.max(reached, 2);
    if (outUpdate) reached = Math.max(reached, 3);
  } else if (o.status === 'out_for_delivery') reached = 2;
  if (done) reached = pickup ? 3 : 4;
  if (o.status === 'new' && !o.pod) reached = -1;

  const deliveryFailed = !!d && d.status === 'failed' && !done;
  const podFail = o.pod && !o.pod.collected ? o.pod.failed?.[o.pod.failed.length - 1] : undefined;
  const disputeOpen = !!o.dispute && o.dispute.status === 'needs_response';
  const problem = !cancelled && !done && (deliveryFailed || !!podFail || disputeOpen);

  const defs: {key: StageKey;label: string;at?: string;}[] = pickup ?
  [
  { key: 'confirmed', label: 'Order confirmed', at: reached >= 0 ? confirmedAt(o) : undefined },
  { key: 'preparing', label: 'Being prepared', at: evAt(o, 'packing') },
  { key: 'ready', label: 'Ready to collect', at: shippedAt },
  { key: 'collected', label: 'Collected', at: completedAt }] :

  [
  { key: 'confirmed', label: 'Order confirmed', at: reached >= 0 ? confirmedAt(o) : undefined },
  { key: 'preparing', label: 'Being prepared', at: evAt(o, 'packing') },
  { key: 'handed', label: 'With the courier', at: pickedAt ?? transitUpdate ?? shippedAt },
  { key: 'on_the_way', label: 'Out for delivery', at: outUpdate ?? pickedAt ?? (tracking.carrier ? undefined : shippedAt) },
  { key: 'delivered', label: 'Delivered', at: completedAt }];

  const stages: StageView[] = defs.map((s, i) => ({
    ...s,
    at: i <= reached ? s.at : undefined,
    state: i <= reached ? 'done' : i === reached + 1 && !cancelled ? problem ? 'problem' : 'current' : 'upcoming'
  }));

  // ——— Health and signals ———
  const signals: Msg[] = [];
  const promiseMs = promise.at ? new Date(promise.at).getTime() : null;
  const doneAt = done ? completedAt : undefined;
  const wasLate = !!(doneAt && promiseMs && new Date(doneAt).getTime() > promiseMs + HOUR);
  const allTimes = [o.createdAt, ...o.events.filter((e) => e.kind !== 'note').map((e) => e.at), ...(d?.events.map((e) => e.at) ?? []), ...tracking.updates.map((u) => u.at)];
  const lastUpdateAt = allTimes.sort().slice(-1)[0];
  let health: TrackHealth = 'on_track';
  const waiting = o.status === 'new' && !o.pod ? 'payment' : o.held ? 'goal' : dispatchBlocked(o) ? 'balance' : null;

  if (cancelled) health = 'cancelled';else
  if (done) {
    health = 'done';
    if (wasLate && promise.at) signals.push({ t: 'Delivered after the promised date ({date}).', v: { date: promiseLabel(promise.at) } });
  } else if (waiting) health = 'waiting';else
  if (problem) {
    health = 'problem';
    if (deliveryFailed && d) signals.push({ t: 'Delivery failed: {reason}. Book another try or contact the customer.', v: { reason: failLabels[d.failReason ?? 'other'] } });
    if (podFail) signals.push({ t: 'Pay-on-delivery attempt didn’t go through on {date}.', v: { date: dayLabel(podFail.at) } });
    if (disputeOpen) signals.push({ t: 'The customer opened a payment dispute.' });
  } else if (promiseMs && now > promiseMs) {
    health = 'late';
    signals.push({ t: 'Promised by {date} — {n} late.', v: { date: promiseLabel(promise.at!), n: ago(now - promiseMs) } });
  } else {
    if (promiseMs && promiseMs - now < AT_RISK_HOURS * HOUR && reached < (pickup ? 2 : 2)) {
      health = 'at_risk';
      signals.push({ t: 'Due {date} and not with the courier yet.', v: { date: promiseLabel(promise.at!) } });
    }
    if (d && d.status === 'booked' && now - new Date(d.pickupAt).getTime() > RIDER_WAIT_HOURS * HOUR) {
      health = 'at_risk';
      signals.push({ t: 'No rider assigned {n} after the pickup time.', v: { n: ago(now - new Date(d.pickupAt).getTime()) } });
    }
    if (d && d.status === 'picked_up' && pickedAt && now - new Date(pickedAt).getTime() > ON_ROAD_HOURS * HOUR) {
      health = 'at_risk';
      signals.push({ t: 'On the road for {n} without a handover.', v: { n: ago(now - new Date(pickedAt).getTime()) } });
    }
    if (now - new Date(lastUpdateAt).getTime() > STALE_HOURS * HOUR) {
      health = 'at_risk';
      signals.push({ t: 'No update for {n}. A quick note keeps the customer from worrying.', v: { n: ago(now - new Date(lastUpdateAt).getTime()) } });
    }
  }

  // ——— Headline for the buyer ———
  const promiseText = promise.at ? promiseLabel(promise.at) : '';
  let headline: Msg = { t: 'Order confirmed' };
  let detail: Msg | null = promise.at ? { t: 'Expected by {date}.', v: { date: promiseText } } : null;
  if (cancelled) {
    headline = { t: o.status === 'refunded' ? 'Order refunded' : 'Order cancelled' };
    detail = null;
  } else if (done) {
    headline = { t: pickup ? 'Collected {date}' : 'Delivered {date}', v: { date: doneAt ? dayLabel(doneAt) : '' } };
    detail = null;
  } else if (waiting === 'payment') {
    headline = { t: 'Waiting for payment confirmation' };
    detail = { t: 'Tracking starts once the payment provider confirms.' };
  } else if (waiting === 'goal') {
    headline = { t: 'Waiting for the group goal' };
    detail = { t: 'Your order is prepared once the goal is reached.' };
  } else if (waiting === 'balance') {
    headline = { t: 'Being made for you' };
    detail = { t: 'It’s sent out once the balance is paid.' };
  } else if (deliveryFailed && d) {
    headline = { t: 'Delivery didn’t go through' };
    detail = { t: '{reason}. The seller will contact you to arrange another try.', v: { reason: failLabels[d.failReason ?? 'other'] } };
  } else if (podFail) {
    headline = { t: 'We missed you' };
    detail = { t: 'The delivery attempt on {date} didn’t go through. The seller will call to arrange another.', v: { date: dayLabel(podFail.at) } };
  } else if (pickup) {
    headline = reached >= 2 ? { t: 'Ready to collect' } : reached >= 1 ? { t: 'Being prepared' } : { t: 'Order confirmed' };
    if (reached >= 2) detail = { t: 'Bring your order number when you collect.' };
  } else if (reached >= 3) {
    headline = { t: 'Out for delivery' };
    detail = d?.rider ? { t: '{rider} is bringing it. Expected by {date}.', v: { rider: d.rider.name.split(' ')[0], date: promiseText } } : promise.at ? { t: 'Arriving by {date}.', v: { date: promiseText } } : null;
  } else if (reached >= 2) {
    headline = { t: 'With the courier' };
    detail = tracking.carrier ? { t: 'Shipped with {carrier}. Expected by {date}.', v: { carrier: tracking.carrier.name, date: promiseText } } : detail;
  } else if (d && (d.status === 'booked' || d.status === 'assigned')) {
    headline = { t: 'A rider is collecting your order' };
    detail = { t: 'Pickup from the seller around {time}. Expected by {date}.', v: { time: timeLabel(d.pickupAt), date: promiseText } };
  } else if (reached >= 1) {
    headline = { t: 'Being prepared' };
  }
  if (health === 'late' && promise.at) detail = { t: 'Running later than expected — it was due {date}. The seller has been alerted.', v: { date: promiseText } };

  return {
    applies,
    pickup,
    stages,
    health,
    headline,
    detail,
    promisedBy: promise.at,
    promiseSource: promise.source,
    doneAt,
    wasLate,
    lastUpdateAt,
    delivery: d,
    carrier: tracking.carrier,
    feed: buyerFeed(o, d, tracking, pickup),
    signals
  };
}

function ago(ms: number): string {
  if (ms < HOUR) return `${Math.max(1, Math.round(ms / 60000))} min`;
  if (ms < DAY) return `${Math.round(ms / HOUR)} h`;
  const days = Math.round(ms / DAY);
  return `${days} day${days === 1 ? '' : 's'}`;
}

/** What the customer sees: no private notes, no fees, no internal wording. */
function buyerFeed(o: Order, d: Delivery | null, t: OrderTracking, pickup: boolean): FeedItem[] {
  const out: FeedItem[] = [];
  const orderText: Partial<Record<Order['events'][number]['kind'], string>> = {
    placed: 'Order placed',
    paid: 'Payment confirmed',
    packing: 'Being prepared',
    shipped: pickup ? 'Ready to collect' : 'Sent out',
    ready: 'Ready to collect',
    completed: pickup ? 'Collected' : 'Delivered',
    cancelled: 'Order cancelled',
    refund: 'Refund issued'
  };
  for (const e of o.events) {
    const text = orderText[e.kind];
    if (text) out.push({ id: e.id, at: e.at, text: { t: text }, source: 'order' });
  }
  for (const e of d?.events ?? []) {
    const l = e.label;
    let text: Msg | null = null;
    if (/^Booked/.test(l)) text = { t: 'Courier booked with {partner}', v: { partner: d!.partnerName } };else
    if (/assigned/.test(l) && d?.rider) text = { t: '{rider} is your rider', v: { rider: l.split(' assigned')[0] } };else
    if (/^Picked up/.test(l)) text = { t: 'Picked up — on its way to you' };else
    if (/^Handed over/.test(l)) text = { t: 'Handed over — delivery code confirmed' };else
    if (/^Failed|^Stopped/.test(l)) text = { t: 'Delivery attempt didn’t go through' };else
    if (/^Cancelled/.test(l)) text = { t: 'Courier booking cancelled' };
    if (text) out.push({ id: e.id, at: e.at, text, source: 'courier' });
  }
  for (const u of t.updates) out.push({ id: u.id, at: u.at, text: null, raw: u.label, location: u.location, source: 'seller' });
  for (const f of o.pod?.failed ?? []) out.push({ id: `podf-${f.at}`, at: f.at, text: { t: 'Delivery attempt didn’t go through' }, source: 'courier' });
  return out.sort((a, b) => b.at.localeCompare(a.at));
}

// ——— Seller actions ———

const patchTracking = (data: CommerceData, orderId: string, fn: (t: OrderTracking, o: Order) => Partial<Order> & {tracking: OrderTracking;}): CommerceData => ({
  ...data,
  orders: data.orders.map((o) => o.id === orderId ? { ...o, ...fn(o.tracking ?? { updates: [] }, o) } : o)
});

export function setPromise(data: CommerceData, orderId: string, iso: string | null): CommerceData {
  return patchTracking(data, orderId, (t, o) => ({
    tracking: { ...t, promisedBy: iso ?? undefined },
    events: [{ id: uid('oev'), at: new Date().toISOString(), kind: 'tracking', label: iso ? `Delivery promised by ${promiseLabel(iso)}` : 'Promise date cleared — back to the estimate' }, ...o.events]
  }));
}

export function setCarrier(data: CommerceData, orderId: string, carrier: TrackingCarrier | null): CommerceData {
  return patchTracking(data, orderId, (t, o) => ({
    tracking: { ...t, carrier: carrier ?? undefined },
    events: [{ id: uid('oev'), at: new Date().toISOString(), kind: 'tracking', label: carrier ? `Shipping with ${carrier.name}${carrier.trackingNumber ? ` · ${carrier.trackingNumber}` : ''}` : 'Courier details removed' }, ...o.events]
  }));
}

export const milestoneLabels: Record<TrackingMilestone, string> = {
  update: 'General update',
  in_transit: 'In transit',
  out_for_delivery: 'Out for delivery today',
  attempted: 'Delivery attempted'
};

export function postTrackingUpdate(data: CommerceData, orderId: string, u: {label: string;location?: string;milestone: TrackingMilestone;}): CommerceData {
  const now = new Date().toISOString();
  return patchTracking(data, orderId, (t, o) => ({
    tracking: { ...t, updates: [...t.updates, { id: uid('trk'), at: now, label: u.label.trim(), location: u.location?.trim() || undefined, milestone: u.milestone }] },
    events: [{ id: uid('oev'), at: now, kind: 'tracking', label: `Customer update · ${milestoneLabels[u.milestone]}: ${u.label.trim()}${u.location?.trim() ? ` (${u.location.trim()})` : ''}` }, ...o.events]
  }));
}

export function isTrackingUrl(s: string): boolean {
  try {
    const u = new URL(s.trim());
    return u.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Orders that need the seller's attention for delivery (late, at risk or a problem). */
export function needsTrackingAttention(v: TrackingView): boolean {
  return v.applies && (v.health === 'late' || v.health === 'at_risk' || v.health === 'problem');
}

export const healthLabels: Record<TrackHealth, string> = {
  on_track: 'On track',
  at_risk: 'At risk',
  late: 'Running late',
  problem: 'Needs action',
  waiting: 'Waiting',
  done: 'Done',
  cancelled: 'Cancelled'
};

export const healthTones: Record<TrackHealth, 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = {
  on_track: 'success',
  at_risk: 'warning',
  late: 'danger',
  problem: 'danger',
  waiting: 'neutral',
  done: 'success',
  cancelled: 'neutral'
};