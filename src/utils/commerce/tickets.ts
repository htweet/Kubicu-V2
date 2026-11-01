import type { CartLine, CommerceData, CommerceEvent, IssuedTicket, Order, OrderItem, Product, TicketHold, TicketType } from '../../types/commerce';
import { uid } from '../id';
import { figure, onOpsSettings } from '../opsSettings';
import { cancelOrder, refundOrder } from './ops';
import { refundableNgn } from './money';
import { findSeat, seatsIssue, syncSeatQuantities } from './seating';

/** Example figures (D73). */
export let MAX_TICKET_TYPES = 8;
export let LOW_SEATS_AT = 10;
onOpsSettings(() => {
  MAX_TICKET_TYPES = figure('events.maxTicketTypes');
  LOW_SEATS_AT = figure('events.lowSeatsAt');
});

export type TicketTypeState = 'on_sale' | 'not_yet' | 'closed' | 'sold_out';
export type EventPhase = 'upcoming' | 'live' | 'past';

export const eventsOf = (data: CommerceData | null | undefined): CommerceEvent[] => data?.events ?? [];
export const findEvent = (data: CommerceData | null | undefined, id: string | undefined | null) => id ? eventsOf(data).find((e) => e.id === id) : undefined;
export const eventProduct = (data: CommerceData | null | undefined, ev: CommerceEvent): Product | undefined => data?.products.find((p) => p.id === ev.productId);

export function eventPhase(ev: CommerceEvent, now = Date.now()): EventPhase {
  const start = Date.parse(ev.startsAt);
  const end = ev.endsAt ? Date.parse(ev.endsAt) : start + 4 * 3600_000;
  if (now >= end) return 'past';
  if (now >= start) return 'live';
  return 'upcoming';
}

/** Seats already sold of one type (quantity minus seats left). */
export function soldOfType(product: Product | undefined, tt: TicketType): number {
  const v = product?.variants.find((x) => x.id === tt.id);
  return v ? Math.max(0, tt.quantity - v.stock) : 0;
}

export function seatsLeftOfType(product: Product | undefined, tt: TicketType): number {
  return product?.variants.find((x) => x.id === tt.id)?.stock ?? 0;
}

export function eventSold(data: CommerceData | null | undefined, ev: CommerceEvent): number {
  const p = eventProduct(data, ev);
  return ev.ticketTypes.reduce((s, tt) => s + soldOfType(p, tt), 0);
}

export function eventTotalSeats(ev: CommerceEvent): number {
  const sum = ev.ticketTypes.reduce((s, t) => s + t.quantity, 0);
  return ev.capacity !== null ? Math.min(ev.capacity, sum) : sum;
}

/** Seats left across the whole event, respecting both the capacity and each type's quantity. */
export function eventSeatsLeft(data: CommerceData | null | undefined, ev: CommerceEvent): number {
  return Math.max(0, eventTotalSeats(ev) - eventSold(data, ev));
}

export function eventRevenue(data: CommerceData, ev: CommerceEvent): number {
  return data.orders.
  filter((o) => o.paymentStatus !== 'pending' && o.paymentStatus !== 'cancelled' && o.items.some((i) => i.productId === ev.productId)).
  reduce((s, o) => s + o.items.filter((i) => i.productId === ev.productId).reduce((t, i) => t + i.unitPriceNgn * i.qty, 0), 0);
}

/* ---------- Seat holds during checkout (D73a) ---------- */

/** Example figure: how long seats stay reserved once a buyer starts checkout. */
export let HOLD_MINUTES = 10;
const HOLDER_KEY = 'kubicu.ticketHolder';

/** A random per-tab id for this browser's checkout. Never personal data. */
export function holderId(): string {
  try {
    const existing = window.sessionStorage.getItem(HOLDER_KEY);
    if (existing) return existing;
    const id = `h_${uid()}`;
    window.sessionStorage.setItem(HOLDER_KEY, id);
    return id;
  } catch {
    return 'h_local';
  }
}

/** Holds still running, optionally ignoring one holder's own. */
export function activeHolds(data: CommerceData | null | undefined, now = Date.now(), except?: string): TicketHold[] {
  return (data?.ticketHolds ?? []).filter((h) => Date.parse(h.expiresAt) > now && h.holder !== except);
}

const heldOfType = (data: CommerceData | null | undefined, variantId: string, now: number, except?: string) =>
activeHolds(data, now, except).reduce((s, h) => s + (h.variantId === variantId ? h.qty : 0), 0);
const heldOfEvent = (data: CommerceData | null | undefined, eventId: string, now: number, except?: string) =>
activeHolds(data, now, except).reduce((s, h) => s + (h.eventId === eventId ? h.qty : 0), 0);

/** Seats of one type a buyer can take now: left minus other buyers' holds. */
export function availableOfType(data: CommerceData | null | undefined, ev: CommerceEvent, tt: TicketType, now = Date.now(), except?: string): number {
  return Math.max(0, seatsLeftOfType(eventProduct(data, ev), tt) - heldOfType(data, tt.id, now, except));
}

/** Seats across the event a buyer can take now, respecting capacity and other buyers' holds. */
export function availableForEvent(data: CommerceData | null | undefined, ev: CommerceEvent, now = Date.now(), except?: string): number {
  return Math.max(0, eventSeatsLeft(data, ev) - heldOfEvent(data, ev.id, now, except));
}

/** Seats currently reserved by people in checkout, for the owner's view. */
export const eventHeld = (data: CommerceData | null | undefined, ev: CommerceEvent, now = Date.now()) => heldOfEvent(data, ev.id, now);

/* ---------- Stock holds during checkout (D255) ---------- */

/** Example figure: how long stock-tracked items stay kept for a buyer once they press Checkout. */
export let STOCK_HOLD_MINUTES = 15;

// Both hold times are example figures staff can change in Figures & names (D466).
onOpsSettings(() => {
  HOLD_MINUTES = figure('checkout.seatHoldMinutes');
  STOCK_HOLD_MINUTES = figure('checkout.stockHoldMinutes');
});

/** Units of a variant other buyers are holding in checkout right now. */
export function heldByOthers(data: CommerceData | null | undefined, variantId: string, holder?: string, now = Date.now()): number {
  return heldOfType(data, variantId, now, holder);
}

/** Stock this buyer can take now: stock minus what other people are holding in checkout. */
export function stockFree(data: CommerceData | null | undefined, variant: {id: string;stock: number;}, holder?: string, now = Date.now()): number {
  return Math.max(0, variant.stock - heldByOthers(data, variant.id, holder, now));
}

/** A physical, stock-tracked, non-pre-order product: the only kind stock holds apply to. */
export function stockHoldable(product: Product | undefined): product is Product {
  return !!product && product.kind === 'physical' && product.trackStock && !product.preorder && !product.giftCard;
}

/** Plain words for a line that other buyers' holds have blocked. */
export function stockHeldMessage(name: string, free: number): string {
  return free === 0 ? `The last ${name} ${name.endsWith('s') ? 'are' : 'is'} in someone else’s checkout — try again in a few minutes` : `Only ${free} of ${name} free right now — others are in checkout`;
}

/** The holder's earliest running expiry, if any. */
export function holdExpiry(data: CommerceData | null | undefined, holder: string, now = Date.now()): string | null {
  const mine = (data?.ticketHolds ?? []).filter((h) => h.holder === holder && Date.parse(h.expiresAt) > now);
  if (!mine.length) return null;
  return mine.map((h) => h.expiresAt).sort()[0];
}

export function releaseHolds(data: CommerceData, holder: string, now = Date.now()): CommerceData {
  const holds = (data.ticketHolds ?? []).filter((h) => h.holder !== holder && Date.parse(h.expiresAt) > now);
  return { ...data, ticketHolds: holds };
}

/**
 * Reserves the ticket lines for this holder. Re-starting checkout keeps the original expiry,
 * so the timer can't be extended by going back and forth. Returns an issue when seats aren't there.
 */
export function placeHolds(
data: CommerceData,
holder: string,
lines: Pick<CartLine, 'productId' | 'variantId' | 'qty' | 'seats'>[],
now = Date.now(),
/** Also hold stock-tracked physical items (D255) — off when the shop allows backorders or turned holds off. */
holdStock = false)
: {data: CommerceData;issue: string;expiresAt: string | null;} {
  const product = (id: string) => data.products.find((p) => p.id === id);
  const ticketLines = lines.filter((l) => product(l.productId)?.kind === 'ticket');
  const stockLines = holdStock ? lines.filter((l) => stockHoldable(product(l.productId))) : [];
  if (!ticketLines.length && !stockLines.length) return { data: releaseHolds(data, holder, now), issue: '', expiresAt: null };
  for (const l of ticketLines) {
    const issue = ticketLineIssue(data, l, now, holder);
    if (issue) return { data, issue, expiresAt: null };
  }
  const cap = orderCapacityIssue(data, ticketLines, holder, now);
  if (cap) return { data, issue: cap, expiresAt: null };
  for (const l of stockLines) {
    const p = product(l.productId) as Product;
    const v = p.variants.find((x) => x.id === l.variantId);
    if (!v) return { data, issue: `${p.name} is no longer available`, expiresAt: null };
    const free = stockFree(data, v, holder, now);
    if (free < l.qty) return { data, issue: stockHeldMessage(p.name, free), expiresAt: null };
  }
  // Seats keep their shorter hold when tickets are in the cart; otherwise stock gets its own window.
  const minutes = ticketLines.length ? HOLD_MINUTES : STOCK_HOLD_MINUTES;
  const expiresAt = holdExpiry(data, holder, now) ?? new Date(now + minutes * 60_000).toISOString();
  const base = releaseHolds(data, holder, now);
  const holds: TicketHold[] = [
  ...ticketLines.map((l) => ({ id: uid(), holder, eventId: product(l.productId)?.eventId ?? '', productId: l.productId, variantId: l.variantId, qty: l.qty, expiresAt, seats: l.seats?.length ? l.seats : undefined })),
  ...stockLines.map((l) => ({ id: uid(), holder, eventId: '', productId: l.productId, variantId: l.variantId, qty: l.qty, expiresAt, kind: 'stock' as const }))];

  return { data: { ...base, ticketHolds: [...(base.ticketHolds ?? []), ...holds] }, issue: '', expiresAt };
}

/**
 * "Need more time?" (WCAG 2.2.1, D76): pushes this holder's running holds back by HOLD_MINUTES.
 * Works only while the holds are still running — the seats are then still reserved for this buyer.
 */
export function extendHolds(data: CommerceData, holder: string, now = Date.now(), minutes = HOLD_MINUTES): {data: CommerceData;expiresAt: string | null;} {
  const current = holdExpiry(data, holder, now);
  if (!current) return { data, expiresAt: null };
  const expiresAt = new Date(Date.parse(current) + minutes * 60_000).toISOString();
  return {
    data: { ...data, ticketHolds: (data.ticketHolds ?? []).map((h) => h.holder === holder && Date.parse(h.expiresAt) > now ? { ...h, expiresAt } : h) },
    expiresAt
  };
}

export function ticketTypeState(data: CommerceData | null | undefined, ev: CommerceEvent, tt: TicketType, now = Date.now(), except?: string): TicketTypeState {
  if (tt.salesEnd && Date.parse(tt.salesEnd) <= now) return 'closed';
  if (tt.salesStart && Date.parse(tt.salesStart) > now) return 'not_yet';
  if (availableOfType(data, ev, tt, now, except) <= 0 || availableForEvent(data, ev, now, except) <= 0) return 'sold_out';
  return 'on_sale';
}

/** Whether the event as a whole is taking orders right now. */
export function eventSelling(data: CommerceData | null | undefined, ev: CommerceEvent, now = Date.now(), except?: string): boolean {
  if (ev.status !== 'on_sale' || eventPhase(ev, now) === 'past') return false;
  return ev.ticketTypes.some((tt) => ticketTypeState(data, ev, tt, now, except) === 'on_sale');
}

export type EventDisplay = 'draft' | 'on_sale' | 'paused' | 'cancelled' | 'sold_out' | 'past' | 'not_yet';

export function eventDisplay(data: CommerceData | null | undefined, ev: CommerceEvent, now = Date.now(), except?: string): EventDisplay {
  if (ev.status === 'cancelled') return 'cancelled';
  if (eventPhase(ev, now) === 'past') return 'past';
  if (ev.status === 'draft') return 'draft';
  if (ev.status === 'paused') return 'paused';
  if (availableForEvent(data, ev, now, except) <= 0) return 'sold_out';
  if (!eventSelling(data, ev, now, except)) return ev.ticketTypes.some((t) => ticketTypeState(data, ev, t, now, except) === 'not_yet') ? 'not_yet' : 'sold_out';
  return 'on_sale';
}

export const eventDisplayLabel: Record<EventDisplay, string> = {
  draft: 'Draft',
  on_sale: 'On sale',
  paused: 'Sales paused',
  cancelled: 'Cancelled',
  sold_out: 'Sold out',
  past: 'Ended',
  not_yet: 'Sales not open'
};

/** Why a ticket line can't be bought, or '' when it can. */
export function ticketLineIssue(data: CommerceData | null | undefined, line: Pick<CartLine, 'productId' | 'variantId' | 'qty' | 'seats'>, now = Date.now(), holder?: string): string {
  const product = data?.products.find((p) => p.id === line.productId);
  if (!product || product.kind !== 'ticket') return '';
  const ev = findEvent(data, product.eventId);
  const tt = ev?.ticketTypes.find((t) => t.id === line.variantId);
  if (!ev || !tt) return 'These tickets are no longer available';
  if (ev.status === 'cancelled') return 'This event was cancelled';
  if (eventPhase(ev, now) === 'past') return 'This event has ended';
  if (ev.status !== 'on_sale') return 'Ticket sales are paused';
  const state = ticketTypeState(data, ev, tt, now, holder);
  if (state === 'closed') return `${tt.name} sales have closed`;
  if (state === 'not_yet') return `${tt.name} goes on sale ${new Date(tt.salesStart as string).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
  const left = Math.min(availableOfType(data, ev, tt, now, holder), availableForEvent(data, ev, now, holder));
  if (left <= 0) {
    // Seats physically left but all reserved by people mid-checkout.
    return Math.min(seatsLeftOfType(product, tt), eventSeatsLeft(data, ev)) > 0 ? 'The last seats are held by people checking out — try again in a few minutes' : 'Those tickets just sold out';
  }
  if (line.qty > left) return `Only ${left} ${tt.name} left`;
  if (line.qty > tt.maxPerOrder) return `Up to ${tt.maxPerOrder} ${tt.name} per order`;
  if (line.qty < tt.minPerOrder) return `At least ${tt.minPerOrder} ${tt.name} per order`;
  // Seated tickets: the exact seats must still be free (D113).
  return seatsIssue(data, ev, tt.id, line.seats, line.qty, now, holder);
}

/** Checks the event capacity across every ticket type in one order. */
export function orderCapacityIssue(data: CommerceData, lines: Pick<CartLine, 'productId' | 'qty'>[], holder?: string, now = Date.now()): string {
  for (const ev of eventsOf(data)) {
    const want = lines.filter((l) => l.productId === ev.productId).reduce((s, l) => s + l.qty, 0);
    if (want === 0) continue;
    const left = availableForEvent(data, ev, now, holder);
    if (want > left) return left === 0 ? `${ev.name} just sold out` : `Only ${left} seat${left === 1 ? '' : 's'} left for ${ev.name}`;
  }
  return '';
}

function ticketCode(taken: Set<string>): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (let i = 0; i < 50; i++) {
    let s = '';
    for (let j = 0; j < 4; j++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
    const code = `KUB-${s}`;
    if (!taken.has(code)) return code;
  }
  return `KUB-${Date.now().toString(36).toUpperCase().slice(-5)}`;
}

export function allTickets(data: CommerceData): IssuedTicket[] {
  return data.orders.flatMap((o) => o.tickets ?? []);
}

/** One admission per seat. Guest names are optional and default to the buyer. */
export function issueTickets(data: CommerceData, items: OrderItem[], buyerName: string, guestNames?: Record<string, string[]>): IssuedTicket[] {
  const taken = new Set(allTickets(data).map((t) => t.code));
  const out: IssuedTicket[] = [];
  items.
  filter((i) => i.kind === 'ticket').
  forEach((i) => {
    const product = data.products.find((p) => p.id === i.productId);
    const ev = findEvent(data, product?.eventId);
    const tt = ev?.ticketTypes.find((t) => t.id === i.variantId);
    if (!ev) return;
    for (let n = 0; n < i.qty; n++) {
      const code = ticketCode(taken);
      taken.add(code);
      const seat = i.seats?.[n] ? findSeat(ev, i.seats[n]) : undefined;
      out.push({ id: uid('tkt'), code, eventId: ev.id, ticketTypeId: i.variantId, typeName: tt?.name ?? i.variantLabel, guestName: guestNames?.[i.variantId]?.[n]?.trim() || buyerName, status: 'valid', seatId: seat?.id, seat: seat?.label });
    }
  });
  return out;
}

export function blankTicketType(name = ''): TicketType {
  return { id: uid('tt'), name, priceNgn: 0, quantity: 50, salesStart: null, salesEnd: null, minPerOrder: 1, maxPerOrder: 10, note: '' };
}

export function blankEvent(): CommerceEvent {
  const start = new Date(Date.now() + 14 * 86400_000);
  start.setHours(18, 0, 0, 0);
  const end = new Date(start.getTime() + 3 * 3600_000);
  const at = new Date().toISOString();
  return {
    id: uid('evt'),
    name: '',
    description: '',
    imageUrl: '',
    startsAt: start.toISOString(),
    endsAt: end.toISOString(),
    timeZone: 'Africa/Lagos',
    online: false,
    venue: '',
    address: '',
    capacity: null,
    refundPolicy: 'Refunds up to 48 hours before the event. After that, tickets can’t be refunded.',
    status: 'draft',
    productId: uid('prd'),
    ticketTypes: [blankTicketType('General admission')],
    createdAt: at,
    updatedAt: at
  };
}

/** Saves an event and keeps its ticket product in step: one variant per type, seats left = quantity − sold. */
export function upsertEvent(data: CommerceData, input: CommerceEvent): CommerceData {
  const ev = syncSeatQuantities(input);
  const at = new Date().toISOString();
  const prevProduct = data.products.find((p) => p.id === ev.productId);
  const prevEvent = findEvent(data, ev.id);
  const variants = ev.ticketTypes.map((tt) => {
    const prevTt = prevEvent?.ticketTypes.find((t) => t.id === tt.id);
    const sold = prevTt ? soldOfType(prevProduct, prevTt) : 0;
    return { id: tt.id, sku: `TKT-${tt.id.slice(-4).toUpperCase()}`, options: { Ticket: tt.name || 'Ticket' }, priceNgn: tt.priceNgn, stock: Math.max(0, tt.quantity - sold) };
  });
  const product: Product = {
    id: ev.productId,
    name: ev.name || 'Untitled event',
    description: ev.description,
    status: ev.status === 'on_sale' ? 'active' : ev.status === 'cancelled' ? 'archived' : 'draft',
    kind: 'ticket',
    priceNgn: null,
    compareAtNgn: null,
    images: ev.imageUrl ? [{ id: `${ev.id}-img`, url: ev.imageUrl, alt: ev.name }] : [],
    options: [{ id: `${ev.id}-opt`, name: 'Ticket', values: ev.ticketTypes.map((t) => t.name || 'Ticket') }],
    variants,
    collectionIds: [],
    trackStock: true,
    lowStockAt: LOW_SEATS_AT,
    weightKg: null,
    eventId: ev.id,
    sample: ev.sample,
    createdAt: prevProduct?.createdAt ?? at,
    updatedAt: at
  };
  const saved = { ...ev, updatedAt: at };
  const events = eventsOf(data);
  return {
    ...data,
    events: prevEvent ? events.map((e) => e.id === ev.id ? saved : e) : [saved, ...events],
    products: prevProduct ? data.products.map((p) => p.id === product.id ? product : p) : [product, ...data.products]
  };
}

/** Removes an event that has never sold a ticket. */
export function deleteEvent(data: CommerceData, eventId: string): CommerceData {
  const ev = findEvent(data, eventId);
  if (!ev) return data;
  return { ...data, events: eventsOf(data).filter((e) => e.id !== eventId), products: data.products.filter((p) => p.id !== ev.productId) };
}

/** What a QR encodes: a prefix so other codes are recognised as “not a ticket”. */
export const TICKET_QR_PREFIX = 'KUBICU-TICKET:';
export const ticketQrValue = (code: string) => `${TICKET_QR_PREFIX}${code}`;

/** Reads a scanned value or typed code into a ticket code, e.g. “kub 7k2q” → “KUB-7K2Q”. */
export function parseTicketCode(raw: string): string | null {
  const v = raw.trim().toUpperCase().replace(TICKET_QR_PREFIX, '').replace(/\s+/g, '');
  const m = v.match(/^KUB-?([A-Z0-9]{3,6})$/);
  return m ? `KUB-${m[1]}` : null;
}

export interface TicketRef {
  ticket: IssuedTicket;
  order: Order;
}

export function findTicket(data: CommerceData | null | undefined, by: {id?: string;code?: string;}): TicketRef | undefined {
  for (const order of data?.orders ?? []) {
    const ticket = (order.tickets ?? []).find((t) => by.id ? t.id === by.id : t.code === by.code);
    if (ticket) return { ticket, order };
  }
  return undefined;
}

export type TicketStatus = 'valid' | 'checked_in' | 'void' | 'pending';

/** Door-facing state of one ticket. Refunded, cancelled or unpaid orders can't admit anyone. */
export function ticketStatus(ref: TicketRef, ev?: CommerceEvent): TicketStatus {
  if (ref.ticket.status === 'void' || ev?.status === 'cancelled' || ref.order.status === 'cancelled' || ref.order.paymentStatus === 'refunded') return 'void';
  if (ref.order.paymentStatus === 'pending') return 'pending';
  return ref.ticket.checkedInAt ? 'checked_in' : 'valid';
}

export const ticketStatusLabel: Record<TicketStatus, string> = { valid: 'Not checked in', checked_in: 'Checked in', void: 'Refunded / void', pending: 'Payment pending' };

export type ScanOutcome =
{kind: 'admitted';ref: TicketRef;} |
{kind: 'already';ref: TicketRef;} |
{kind: 'void';ref: TicketRef;} |
{kind: 'pending';ref: TicketRef;} |
{kind: 'wrong_event';ref: TicketRef;otherEvent: string;} |
{kind: 'unknown';code: string;};

/** What happens when a ticket is scanned at this event's door (D74). Admits valid tickets. */
export function scanTicket(data: CommerceData, eventId: string, raw: string, by: string, door?: string, at?: string): {data: CommerceData;outcome: ScanOutcome;} {
  const code = parseTicketCode(raw);
  const ref = code ? findTicket(data, { code }) : undefined;
  if (!ref) return { data, outcome: { kind: 'unknown', code: code ?? raw.trim().slice(0, 24) } };
  if (ref.ticket.eventId !== eventId) return { data, outcome: { kind: 'wrong_event', ref, otherEvent: findEvent(data, ref.ticket.eventId)?.name ?? 'another event' } };
  const status = ticketStatus(ref, findEvent(data, eventId));
  if (status === 'void') return { data, outcome: { kind: 'void', ref } };
  if (status === 'pending') return { data, outcome: { kind: 'pending', ref } };
  if (status === 'checked_in') return { data, outcome: { kind: 'already', ref } };
  const next = setCheckedIn(data, ref.ticket.id, by, door, at);
  return { data: next, outcome: { kind: 'admitted', ref: findTicket(next, { id: ref.ticket.id })! } };
}

export function setCheckedIn(data: CommerceData, ticketId: string, by: string | null, door?: string, at = new Date().toISOString()): CommerceData {
  return {
    ...data,
    orders: data.orders.map((o) =>
    o.tickets?.some((t) => t.id === ticketId) ?
    {
      ...o,
      tickets: o.tickets.map((t) =>
      t.id === ticketId ? by ? { ...t, checkedInAt: at, checkedInBy: by, checkedInDoor: door } : { ...t, checkedInAt: undefined, checkedInBy: undefined, checkedInDoor: undefined } : t
      )
    } :
    o
    )
  };
}

/** Latest check-ins at every door, newest first. */
export function recentCheckIns(data: CommerceData, eventId: string, limit = 6): TicketRef[] {
  return eventTickets(data, eventId).
  filter((r) => r.ticket.checkedInAt).
  sort((a, b) => Date.parse(b.ticket.checkedInAt!) - Date.parse(a.ticket.checkedInAt!)).
  slice(0, limit);
}

/** Check-ins per door name, for the doors panel. */
export function checkInsByDoor(data: CommerceData, eventId: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of eventTickets(data, eventId)) if (r.ticket.checkedInAt) out[r.ticket.checkedInDoor || 'No door named'] = (out[r.ticket.checkedInDoor || 'No door named'] ?? 0) + 1;
  return out;
}

export function eventTickets(data: CommerceData, eventId: string): TicketRef[] {
  return data.orders.flatMap((order) => (order.tickets ?? []).filter((t) => t.eventId === eventId).map((ticket) => ({ ticket, order })));
}

export function checkedInCount(data: CommerceData, ev: CommerceEvent): number {
  return eventTickets(data, ev.id).filter((r) => ticketStatus(r, ev) === 'checked_in').length;
}

/** A free ticket added by the seller: a ₦0 order so seats, the guest list and check-in stay consistent. */
export function addCompTicket(data: CommerceData, eventId: string, typeId: string, guest: {name: string;phone: string;email: string;}, qty = 1): {data: CommerceData;order?: Order;error?: string;} {
  const ev = findEvent(data, eventId);
  const tt = ev?.ticketTypes.find((t) => t.id === typeId);
  const product = ev ? eventProduct(data, ev) : undefined;
  if (!ev || !tt || !product) return { data, error: 'That ticket type no longer exists.' };
  const left = Math.min(seatsLeftOfType(product, tt), eventSeatsLeft(data, ev));
  if (left < qty) return { data, error: left === 0 ? `No ${tt.name} seats left.` : `Only ${left} ${tt.name} seat${left === 1 ? '' : 's'} left.` };
  const at = new Date().toISOString();
  const items: OrderItem[] = [{ productId: product.id, variantId: tt.id, name: ev.name, variantLabel: tt.name, unitPriceNgn: 0, qty, imageUrl: ev.imageUrl, kind: 'ticket' }];
  const tickets = issueTickets(data, items, guest.name).map((t) => ({ ...t, comp: true }));
  const order: Order = {
    id: uid('ord'),
    number: data.nextOrderNumber,
    createdAt: at,
    customer: guest,
    items,
    fulfilment: { method: 'tickets' },
    subtotalNgn: 0,
    discountNgn: 0,
    deliveryNgn: 0,
    providerFeeNgn: 0,
    kubicuFeeNgn: 0,
    status: 'completed',
    paymentStatus: 'paid',
    refunds: [],
    events: [{ id: uid('ev'), at, kind: 'completed', label: `Complimentary ticket${qty === 1 ? '' : 's'} added by the seller` }],
    downloads: [],
    note: 'Complimentary',
    tickets
  };
  const next: CommerceData = {
    ...data,
    orders: [order, ...data.orders],
    nextOrderNumber: data.nextOrderNumber + 1,
    products: data.products.map((p) => p.id === product.id ? { ...p, variants: p.variants.map((v) => v.id === tt.id ? { ...v, stock: v.stock - qty } : v) } : p)
  };
  return { data: next, order };
}

/** A calendar file for the event, for “Add to calendar”. */
export function eventIcs(ev: CommerceEvent, url: string): string {
  const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const end = ev.endsAt ?? new Date(Date.parse(ev.startsAt) + 3 * 3600_000).toISOString();
  const text = (s: string) => s.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
  return [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'PRODID:-//KUBICU//Tickets//EN',
  'BEGIN:VEVENT',
  `UID:${ev.id}@kubicu`,
  `DTSTAMP:${stamp(new Date().toISOString())}`,
  `DTSTART:${stamp(ev.startsAt)}`,
  `DTEND:${stamp(end)}`,
  `SUMMARY:${text(ev.name)}`,
  `LOCATION:${text(ev.online ? 'Online' : [ev.venue, ev.address].filter(Boolean).join(', '))}`,
  `DESCRIPTION:${text(`Your ticket: ${url}`)}`,
  'END:VEVENT',
  'END:VCALENDAR'].
  join('\r\n');
}

export const ordersForEvent = (data: CommerceData, ev: CommerceEvent) => data.orders.filter((o) => o.items.some((i) => i.productId === ev.productId));

/** Cancels the event and refunds every ticket order in full; unpaid orders are cancelled. */
export function cancelEventAndRefund(data: CommerceData, eventId: string, reason: string): {data: CommerceData;refunded: number;} {
  const ev = findEvent(data, eventId);
  if (!ev) return { data, refunded: 0 };
  let next = upsertEvent(data, { ...ev, status: 'cancelled', cancelledAt: new Date().toISOString() });
  let refunded = 0;
  ordersForEvent(next, ev).forEach((o) => {
    if (o.status === 'cancelled' || o.status === 'refunded') return;
    if (o.paymentStatus === 'pending') next = cancelOrder(next, o.id, reason || 'Event cancelled', true);else
    if (refundableNgn(o) > 0) {
      next = refundOrder(next, o.id, refundableNgn(o), reason || 'Event cancelled', true);
      refunded++;
    }
  });
  return { data: next, refunded };
}