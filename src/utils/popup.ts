import type { Block, CampaignPhase, PopupSession, PopupSettings } from '../types/page';
import type { CommerceData, Order, OrderEvent, StallHold } from '../types/commerce';
import type { ValidationIssue } from './validation';
import { blockInPhase, phaseOrder } from './campaign';
import { uid } from './id';

/*
 * Pop-up shop spaces (D183). A place and 1–5 opening sessions; orders from the space are pickup only
 * at the stall for a chosen session. Phases reuse the campaign phase field: Before (opens soon),
 * Open (from the first session until the last ends — including the gaps between), Closed.
 */

export const MAX_POPUP_SESSIONS = 5;

export const popupPhaseLabels: Record<CampaignPhase, string> = { before: 'Before', live: 'Open', ended: 'Closed' };
export const popupPhaseDescriptions: Record<CampaignPhase, string> = {
  before: 'Before the first session — what’s coming, where and when.',
  live: 'From the first session to the last — ordering for pickup, today’s hours.',
  ended: 'After the last session — thank-you and a link to your main shop.'
};

export type PopupState = 'soon' | 'open' | 'between' | 'closed';

export const popupStateLabels: Record<PopupState, string> = { soon: 'Opens soon', open: 'Open now', between: 'Between sessions', closed: 'Closed' };

export function sessionStart(s: PopupSession): number {
  return Date.parse(`${s.date}T${s.from || '00:00'}`);
}

export function sessionEnd(s: PopupSession): number {
  const end = Date.parse(`${s.date}T${s.to || '23:59'}`);
  // A session that runs past midnight ends the next day.
  return end > sessionStart(s) ? end : end + 86400_000;
}

export function sortedSessions(p: PopupSettings): PopupSession[] {
  return [...p.sessions].filter((s) => s.date).sort((a, b) => sessionStart(a) - sessionStart(b));
}

export interface PopupStatus {
  state: PopupState;
  /** The session running now (state 'open'). */
  current?: PopupSession;
  /** The next session to start. */
  next?: PopupSession;
}

export function popupStatus(p: PopupSettings, now = Date.now()): PopupStatus {
  const list = sortedSessions(p);
  if (p.closedAt || !list.length) return { state: 'closed' };
  const current = list.find((s) => sessionStart(s) <= now && now < sessionEnd(s));
  const next = list.find((s) => sessionStart(s) > now);
  if (current) return { state: 'open', current, next };
  if (now < sessionStart(list[0])) return { state: 'soon', next: list[0] };
  if (next) return { state: 'between', next };
  return { state: 'closed' };
}

export function popupPhase(p: PopupSettings, now = Date.now()): CampaignPhase {
  const s = popupStatus(p, now).state;
  return s === 'soon' ? 'before' : s === 'closed' ? 'ended' : 'live';
}

const dayFmt: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' };

export function sessionDay(s: PopupSession): string {
  const d = new Date(`${s.date}T12:00`);
  return Number.isNaN(d.getTime()) ? s.date : d.toLocaleDateString('en-GB', dayFmt);
}

/** "Sat 14 Dec, 10:00–18:00" */
export function sessionWhen(s: PopupSession): string {
  return `${sessionDay(s)}, ${s.from}–${s.to}`;
}

/** Frozen onto the order: "Sat 14 Dec, 10:00–18:00 · Ikoyi Christmas Market". */
export function sessionLabel(s: PopupSession, venue: string): string {
  return venue.trim() ? `${sessionWhen(s)} · ${venue.trim()}` : sessionWhen(s);
}

/** "Opens Sat 14 Dec at 10:00", "Open now · until 18:00", "Next: Sun 15 Dec, 10:00–18:00", "Closed". */
export function popupSummary(p: PopupSettings, now = Date.now()): string {
  const st = popupStatus(p, now);
  if (st.state === 'open' && st.current) return `Open now · until ${st.current.to}`;
  if (st.state === 'soon' && st.next) return `Opens ${sessionDay(st.next)} at ${st.next.from}`;
  if (st.state === 'between' && st.next) return `Next: ${sessionWhen(st.next)}`;
  return p.closedAt ? 'Closed early' : sortedSessions(p).length ? 'Closed — all sessions have ended' : 'No sessions yet';
}

/** Sessions a buyer can still choose for pickup. */
export function bookableSessions(p: PopupSettings, now = Date.now()): PopupSession[] {
  if (p.closedAt) return [];
  return sortedSessions(p).filter((s) => sessionEnd(s) > now);
}

export function popupOrders(data: CommerceData | null | undefined, handle: string): Order[] {
  return (data?.orders ?? []).filter((o) => o.sourceHandle === handle && !!o.popup);
}

const counts = (o: Order) => o.status !== 'cancelled' && o.status !== 'refunded';

/** Units of a product sold through this pop-up (cancelled and fully refunded orders don't count). */
export function stallSold(data: CommerceData | null | undefined, handle: string, productId: string): number {
  return popupOrders(data, handle).
  filter(counts).
  reduce((t, o) => t + o.items.filter((i) => i.productId === productId).reduce((s, i) => s + i.qty, 0), 0);
}

/** Units the stall can still sell, or null when the product has no stall limit. */
export function stallLeft(p: PopupSettings, data: CommerceData | null | undefined, handle: string, productId: string): number | null {
  const limit = p.stallLimits[productId];
  if (limit === undefined || limit === null) return null;
  return Math.max(0, limit - stallSold(data, handle, productId));
}

/** Everything the checkout needs to know about this pop-up. */
export interface PopupCheckout {
  handle: string;
  venue: string;
  address: string;
  payment: PopupSettings['payment'];
  sessions: {id: string;label: string;when: string;}[];
  productIds: string[];
  left: Record<string, number | null>;
  open: boolean;
}

export function popupCheckout(p: PopupSettings, handle: string, data: CommerceData, now = Date.now()): PopupCheckout {
  const sessions = bookableSessions(p, now).map((s) => ({ id: s.id, label: sessionLabel(s, p.venue), when: sessionWhen(s) }));
  const left: Record<string, number | null> = {};
  p.productIds.forEach((id) => left[id] = stallLeft(p, data, handle, id));
  return { handle, venue: p.venue, address: p.address, payment: p.payment, sessions, productIds: p.productIds, left, open: sessions.length > 0 };
}

/** True when every chosen product is used up at the stall (limits) or in stock. */
export function stallSoldOut(p: PopupSettings, data: CommerceData | null | undefined, handle: string): boolean {
  if (!p.productIds.length || !data) return false;
  return p.productIds.every((id) => {
    const left = stallLeft(p, data, handle, id);
    if (left === 0) return true;
    const product = data.products.find((x) => x.id === id);
    if (!product || product.status !== 'active') return true;
    if (!(product.kind === 'physical' && product.trackStock)) return false;
    // Units other pop-ups have set aside aren't available here (D191).
    const total = product.variants.reduce((s, v) => s + Math.max(0, v.stock), 0);
    return total - reservedForStalls(data, id, handle).qty <= 0;
  });
}

/** Mark a pop-up order collected. Pay-at-stall orders are marked paid at the same moment. */
export function markCollected(data: CommerceData, orderId: string, at = new Date().toISOString()): CommerceData {
  return {
    ...data,
    orders: data.orders.map((o) => {
      if (o.id !== orderId || !o.popup || o.popup.collectedAt) return o;
      const events: OrderEvent[] = [{ id: uid('oev'), at, kind: 'completed', label: o.popup.payAtStall && o.paymentStatus === 'pending' ? 'Collected at the stall and paid there' : 'Collected at the stall' }, ...o.events];
      return {
        ...o,
        popup: { ...o.popup, collectedAt: at },
        status: 'completed',
        paymentStatus: o.popup.payAtStall && o.paymentStatus === 'pending' ? 'paid' : o.paymentStatus,
        events
      };
    })
  };
}

export function undoCollected(data: CommerceData, orderId: string): CommerceData {
  return {
    ...data,
    orders: data.orders.map((o) => {
      if (o.id !== orderId || !o.popup?.collectedAt) return o;
      return { ...o, popup: { ...o.popup, collectedAt: undefined }, status: o.popup.payAtStall ? 'new' : 'paid', paymentStatus: o.popup.payAtStall ? 'pending' : o.paymentStatus, events: o.events.slice(1) };
    })
  };
}

export function popupOrdersCsv(orders: Order[]): string {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const rows = [['Order', 'Session', 'Name', 'Phone', 'Items', 'Total (NGN)', 'Payment', 'Collected']];
  orders.forEach((o) =>
  rows.push([
  `#${o.number}`,
  o.popup?.sessionLabel ?? '',
  o.customer.name,
  o.customer.phone,
  o.items.map((i) => `${i.qty} × ${i.name}${i.variantLabel ? ` (${i.variantLabel})` : ''}`).join('; '),
  o.subtotalNgn - o.discountNgn,
  o.popup?.payAtStall && o.paymentStatus === 'pending' ? 'Pay at stall' : o.paymentStatus,
  o.popup?.collectedAt ? new Date(o.popup.collectedAt).toLocaleString('en-GB') : 'Not yet']
  )
  );
  return rows.map((r) => r.map(esc).join(',')).join('\n');
}

// ——— Stock set aside for pop-ups (D191) ———

const activeHold = (h: StallHold, now: number) => Date.parse(h.until) > now;

/** Units still held for a pop-up: its limit minus what it has sold, while it's on. */
export function heldLeft(data: CommerceData, h: StallHold, now = Date.now()): number {
  if (!activeHold(h, now)) return 0;
  return Math.max(0, h.limit - stallSold(data, h.handle, h.productId));
}

/**
 * Units of a product set aside for pop-ups, which other checkouts can't sell. `exceptHandle`
 * is the pop-up doing the selling — its own hold never blocks it.
 */
export function reservedForStalls(data: CommerceData | null | undefined, productId: string, exceptHandle?: string, now = Date.now()): {qty: number;labels: string[];} {
  if (!data?.stallHolds?.length) return { qty: 0, labels: [] };
  let qty = 0;
  const labels: string[] = [];
  data.stallHolds.forEach((h) => {
    if (h.productId !== productId || h.handle === exceptHandle) return;
    const left = heldLeft(data, h, now);
    if (left > 0) {
      qty += left;
      labels.push(h.label);
    }
  });
  return { qty, labels };
}

/** Rewrites this pop-up's holds from its settings; none while it's off, closed or finished. */
export function syncStallHolds(data: CommerceData, handle: string, label: string, p: PopupSettings, now = Date.now()): CommerceData {
  const last = sortedSessions(p).slice(-1)[0];
  const until = last ? new Date(sessionEnd(last)).toISOString() : '';
  const on = !!p.holdStock && !p.closedAt && !!last && sessionEnd(last) > now;
  const mine: StallHold[] = on ?
  p.productIds.filter((id) => typeof p.stallLimits[id] === 'number').map((id) => ({ handle, label, productId: id, limit: p.stallLimits[id], until })) :
  [];
  const others = (data.stallHolds ?? []).filter((h) => h.handle !== handle && activeHold(h, now));
  const before = JSON.stringify((data.stallHolds ?? []).filter((h) => h.handle === handle));
  if (before === JSON.stringify(mine) && others.length === (data.stallHolds ?? []).filter((h) => h.handle !== handle).length) return data;
  return { ...data, stallHolds: [...others, ...mine] };
}

/** Pre-publish checks for a Pop-up shop. */
export function popupIssues(p: PopupSettings, blocks: Block[], data: CommerceData | null, now = Date.now()): ValidationIssue[] {
  const out: ValidationIssue[] = [];
  const push = (id: string, severity: ValidationIssue['severity'], message: string) => out.push({ id: `popup:${id}`, blockId: null, severity, message });
  if (!p.venue.trim()) push('venue', 'error', 'Add where the pop-up is (the venue) in Page settings → Pop-up shop.');
  if (!p.sessions.length) push('sessions', 'error', 'Add at least one opening session.');
  p.sessions.forEach((s, i) => {
    if (!s.date || !s.from || !s.to) push(`session-${s.id}`, 'error', `Session ${i + 1} needs a date, a start and an end time.`);
  });
  if (!p.productIds.length) push('products', 'error', 'Choose at least one product to sell at the stall.');
  const missing = p.productIds.filter((id) => !data?.products.some((x) => x.id === id && x.status === 'active'));
  if (missing.length) push('inactive', 'warning', `${missing.length} chosen product${missing.length === 1 ? ' is' : 's are'} no longer active in Commerce and won’t show.`);
  if (p.sessions.length && popupStatus(p, now).state === 'closed' && !p.closedAt) push('past', 'warning', 'Every session has already ended — visitors will see “Closed”. Add a new session to reopen.');
  phaseOrder.forEach((phase) => {
    if (!blocks.some((b) => !b.visibility.hidden && blockInPhase(b, phase)))
    push(`empty-${phase}`, phase === 'live' ? 'error' : 'warning', `Nothing shows while the pop-up is ${popupPhaseLabels[phase].toLowerCase()}.`);
  });
  return out;
}