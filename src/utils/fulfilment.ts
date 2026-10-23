import type { Order } from '../types/commerce';
import type { Delivery, DeliveryStatus, FailReason, FulfilmentData, Rider } from '../types/fulfilment';
import { deliveryAreas, deliveryPartners, SIMULATED_RIDERS } from '../data/deliveryPartners';
import { dispatchBlocked } from './commerce/deposit';
import { uid } from './id';

/** Local Fulfilment (D96) store and rules. The courier side is simulated and labelled. */

export const FULFILMENT_APP_ID = 'local-fulfilment';
const key = (workspaceId: string) => `kubicu.fulfilment.${workspaceId}`;
export const FULFILMENT_EVENT = 'kubicu:fulfilment';
/** Wrong codes allowed before the handover is stopped and must be retried (example figure). */
export const MAX_CODE_ATTEMPTS = 3;

export const emptyFulfilment = (): FulfilmentData => ({ deliveries: [], pickupAddress: '', pickupPhone: '', riders: [] });

export function readFulfilment(workspaceId: string): FulfilmentData {
  try {
    const raw = window.localStorage.getItem(key(workspaceId));
    if (raw) return { ...emptyFulfilment(), ...(JSON.parse(raw) as Partial<FulfilmentData>) };
  } catch {

    /* fresh store */}
  return emptyFulfilment();
}

export function writeFulfilment(workspaceId: string, data: FulfilmentData): void {
  try {
    window.localStorage.setItem(key(workspaceId), JSON.stringify(data));
  } catch {

    /* storage full — lasts for this visit */}
  window.dispatchEvent(new CustomEvent(FULFILMENT_EVENT));
}

// ——— Labels ———

export const deliveryLabels: Record<DeliveryStatus, string> = {
  booked: 'Booked · finding a rider',
  assigned: 'Rider on the way to you',
  picked_up: 'Out for delivery',
  delivered: 'Delivered',
  failed: 'Delivery failed',
  cancelled: 'Cancelled'
};

export const deliveryTones: Record<DeliveryStatus, 'neutral' | 'info' | 'warning' | 'danger' | 'success'> = {
  booked: 'neutral',
  assigned: 'info',
  picked_up: 'info',
  delivered: 'success',
  failed: 'danger',
  cancelled: 'neutral'
};

export const failLabels: Record<FailReason, string> = {
  unreachable: 'Customer couldn’t be reached',
  wrong_address: 'Address wrong or not found',
  refused: 'Customer refused the order',
  wrong_code: 'Too many wrong delivery codes',
  other: 'Something else'
};

export const isActive = (d: Delivery) => d.status === 'booked' || d.status === 'assigned' || d.status === 'picked_up';
export const activeFor = (data: FulfilmentData, orderId: string) => data.deliveries.find((d) => d.orderId === orderId && isActive(d)) ?? null;

// ——— Which orders can be booked ———

export function readyOrders(orders: Order[], data: FulfilmentData): Order[] {
  return orders.
  filter(
    (o) =>
    o.fulfilment.method === 'delivery' && (
    // Pay on delivery orders go out before they're paid (D112).
    o.pod && !o.pod.collected ?
    o.status === 'new' || o.status === 'packing' :
    (o.status === 'paid' || o.status === 'packing') && (o.paymentStatus === 'paid' || o.paymentStatus === 'partially_refunded')) &&
    !dispatchBlocked(o) &&
    !activeFor(data, o.id) &&
    !data.deliveries.some((d) => d.orderId === o.id && d.status === 'delivered')
  ).
  sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

// ——— Quotes from partners (simulated) ———

export interface PartnerQuote {
  partnerId: string;
  name: string;
  tagline: string;
  feeNgn: number;
  eta: string;
  available: boolean;
  note?: string;
  own?: boolean;
}

export function areaFor(address: string) {
  const a = address.toLowerCase();
  return deliveryAreas.find((x) => x.keywords.some((k) => a.includes(k))) ?? null;
}

export function quotesFor(address: string, now = new Date()): PartnerQuote[] {
  const area = areaFor(address);
  const afterCutoff = now.getHours() >= 14;
  return deliveryPartners.map((p) => {
    if (p.own) return { partnerId: p.id, name: p.name, tagline: p.tagline, feeNgn: 0, eta: 'When your rider delivers', available: true, own: true };
    if (area?.outOfRange) return { partnerId: p.id, name: p.name, tagline: p.tagline, feeNgn: 0, eta: '—', available: false, note: `Doesn’t deliver to ${area.label} yet` };
    const feeNgn = p.baseNgn + (area?.extraNgn ?? 0);
    const eta = p.sameDay && !afterCutoff ? 'Today, by 7pm' : 'Tomorrow, by 6pm';
    return { partnerId: p.id, name: p.name, tagline: p.tagline, feeNgn, eta, available: true, note: area ? area.label : 'Lagos Mainland' };
  });
}

// ——— Lifecycle ———

const ev = (label: string) => ({ id: uid('dev'), at: new Date().toISOString(), label });
const patch = (data: FulfilmentData, id: string, fn: (d: Delivery) => Delivery): FulfilmentData => ({ ...data, deliveries: data.deliveries.map((d) => d.id === id ? fn(d) : d) });

export function book(data: FulfilmentData, o: Order, q: PartnerQuote, pickupAt: string, escrow: boolean, rider?: Rider): {data: FulfilmentData;delivery: Delivery;} {
  const code = String(1000 + Math.floor(Math.random() * 9000));
  const delivery: Delivery = {
    id: uid('dlv'),
    orderId: o.id,
    orderNumber: String(o.number),
    customerName: o.customer.name || 'Customer',
    customerPhone: o.customer.phone,
    address: o.fulfilment.address ?? '',
    partnerId: q.partnerId,
    partnerName: q.name,
    feeNgn: q.feeNgn,
    etaLabel: q.eta,
    pickupAt,
    status: rider ? 'assigned' : 'booked',
    rider,
    code,
    codeAttempts: 0,
    escrow,
    createdAt: new Date().toISOString(),
    events: [
    ...(rider ? [ev(`${rider.name} assigned`)] : []),
    ev(`Booked with ${q.name}${q.feeNgn ? ` · ₦${q.feeNgn.toLocaleString('en-NG')}` : ''} — delivery code texted to the customer`)]

  };
  return { data: { ...data, deliveries: [delivery, ...data.deliveries] }, delivery };
}

/** Prototype: the partner assigns a rider. */
export function assignRider(data: FulfilmentData, id: string): FulfilmentData {
  return patch(data, id, (d) => {
    if (d.status !== 'booked') return d;
    const rider = SIMULATED_RIDERS[Math.floor(Math.random() * SIMULATED_RIDERS.length)];
    return { ...d, status: 'assigned', rider, events: [ev(`${rider.name} assigned · ${rider.vehicle}`), ...d.events] };
  });
}

export function pickedUp(data: FulfilmentData, id: string): FulfilmentData {
  return patch(data, id, (d) => d.status === 'assigned' ? { ...d, status: 'picked_up', events: [ev('Picked up from you — on the way to the customer'), ...d.events] } : d);
}

export type CodeResult = {ok: true;data: FulfilmentData;} | {ok: false;data: FulfilmentData;left: number;};

export function enterCode(data: FulfilmentData, id: string, code: string): CodeResult {
  const d = data.deliveries.find((x) => x.id === id);
  if (!d || d.status !== 'picked_up') return { ok: false, data, left: 0 };
  if (code.trim() === d.code) {
    return { ok: true, data: patch(data, id, (x) => ({ ...x, status: 'delivered', events: [ev('Handed over — customer’s delivery code matched'), ...x.events] })) };
  }
  const attempts = d.codeAttempts + 1;
  const left = MAX_CODE_ATTEMPTS - attempts;
  const next = patch(data, id, (x) =>
  left <= 0 ?
  { ...x, codeAttempts: attempts, status: 'failed', failReason: 'wrong_code', events: [ev('Stopped after 3 wrong delivery codes — order returned to you'), ...x.events] } :
  { ...x, codeAttempts: attempts, events: [ev(`Wrong delivery code (${left} ${left === 1 ? 'try' : 'tries'} left)`), ...x.events] }
  );
  return { ok: false, data: next, left: Math.max(0, left) };
}

export function fail(data: FulfilmentData, id: string, reason: FailReason, note: string): FulfilmentData {
  return patch(data, id, (d) => isActive(d) ? { ...d, status: 'failed', failReason: reason, failNote: note.trim() || undefined, events: [ev(`Failed — ${failLabels[reason]}${note.trim() ? `: ${note.trim()}` : ''}`), ...d.events] } : d);
}

export function cancel(data: FulfilmentData, id: string): FulfilmentData {
  return patch(data, id, (d) => d.status === 'booked' || d.status === 'assigned' ? { ...d, status: 'cancelled', events: [ev('Cancelled before pickup — no fee charged'), ...d.events] } : d);
}

export function defaultPickup(): string {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return d.toISOString();
}