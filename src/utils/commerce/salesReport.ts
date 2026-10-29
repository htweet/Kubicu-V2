import type { GiftCard, Order } from '../../types/commerce';
import { orderRef } from './shopSettings';
import type { Subscription } from '../../types/subscriptions';
import type { Booking } from '../../types/ops';
import type { Invoice } from '../../types/serviceOs';
import type { LinkPayment } from '../../types/money';
import { orderMoney } from './money';

/** Sales report maths (D227). Pure: every screen number and both exports come from here. */

export interface ReportRange {
  from: number;
  to: number;
}

export type IncomeType = 'shop' | 'gift_cards' | 'bookings' | 'invoices' | 'links' | 'memberships';

export const incomeLabels: Record<IncomeType, {label: string;hint: string;}> = {
  shop: { label: 'Shop orders', hint: 'Paid orders, incl. delivery and tickets' },
  gift_cards: { label: 'Gift cards sold', hint: 'Bought at checkout; spent later as orders' },
  bookings: { label: 'Booking deposits & balances', hint: 'Cancelled bookings left out' },
  invoices: { label: 'Invoices paid', hint: 'Quotes & jobs' },
  links: { label: 'Payment links', hint: 'After refunds' },
  memberships: { label: 'Memberships', hint: 'Subscription payments that aren’t box orders' }
};

export type MethodId = 'card' | 'transfer' | 'own_account' | 'ussd' | 'pod' | 'instalments';

export const methodLabels: Record<MethodId, string> = {
  card: 'Card',
  transfer: 'Transfer account',
  own_account: 'Transfer to your account',
  ussd: 'USSD',
  pod: 'Pay on delivery',
  instalments: 'Instalments'
};

/** One dated piece of money in. Orders keep their fees; everything else is shown as received. */
export interface IncomeEntry {
  id: string;
  at: string;
  type: IncomeType;
  ref: string;
  customer: string;
  paid: number;
  fees: number;
  refunded: number;
  net: number;
  vat: number;
  method: MethodId | null;
  sample: boolean;
}

export interface ReportInputs {
  orders: Order[];
  subscriptions: Subscription[];
  giftCards: GiftCard[];
  bookings: Booking[];
  invoices: Invoice[];
  linkPayments: (LinkPayment & {linkTitle: string;})[];
}

export const isPaidOrder = (o: Order) => o.paymentStatus !== 'pending' && o.paymentStatus !== 'cancelled';

export function orderMethod(o: Order): MethodId {
  if (o.pod) return 'pod';
  if (o.instalments) return 'instalments';
  if (o.transferAccount) return 'transfer';
  if (o.bankTransfer) return 'own_account';
  if (/ussd/i.test(o.paymentNote ?? '')) return 'ussd';
  return 'card';
}

// payBy 'account' = one-time transfer account; 'transfer' = the seller's own bank details (D224).
const linkMethod = (p: LinkPayment): MethodId => p.payBy === 'account' ? 'transfer' : p.payBy === 'transfer' ? 'own_account' : p.payBy === 'ussd' ? 'ussd' : 'card';

const inRange = (iso: string | undefined, r: ReportRange) => {
  if (!iso) return false;
  const t = Date.parse(iso);
  return t >= r.from && t < r.to;
};

/** Every piece of money in for the range. `handle` limits to one space; links, invoices and gift cards have no space. */
export function incomeEntries(inp: ReportInputs, r: ReportRange, handle: string | null): IncomeEntry[] {
  const raw: Omit<IncomeEntry, 'id'>[] = [];
  const out = { push: (e: Omit<IncomeEntry, 'id'>) => raw.push(e) };
  const spaceOk = (h?: string) => !handle || h === handle;
  const soldByOrder = new Map<string, number>();
  inp.giftCards.filter((g) => g.source === 'sold' && g.orderId).forEach((g) => soldByOrder.set(g.orderId as string, (soldByOrder.get(g.orderId as string) ?? 0) + g.initialNgn));

  inp.orders.forEach((o) => {
    if (!isPaidOrder(o) || !inRange(o.createdAt, r) || !spaceOk(o.sourceHandle)) return;
    const m = orderMoney(o);
    const gift = Math.min(soldByOrder.get(o.id) ?? 0, m.gross);
    const base = { at: o.createdAt, ref: orderRef(o), customer: o.customer.name, method: orderMethod(o), sample: !!o.sample };
    out.push({ ...base, type: 'shop', paid: m.gross - gift, fees: m.providerFee + m.kubicuFee, refunded: m.refunded, net: m.net - gift, vat: m.vat });
    if (gift > 0) out.push({ ...base, type: 'gift_cards', paid: gift, fees: 0, refunded: 0, net: gift, vat: 0 });
  });

  inp.bookings.forEach((b) => {
    if (b.status === 'cancelled' || !spaceOk(b.sourceHandle)) return;
    const created = b.events[0]?.at ?? b.start;
    const base = { type: 'bookings' as const, ref: b.ref, customer: b.customer.name, fees: 0, refunded: 0, vat: 0, method: 'card' as const, sample: !!b.sample };
    if (b.depositPaidNgn > 0 && inRange(created, r)) out.push({ ...base, at: created, paid: b.depositPaidNgn, net: b.depositPaidNgn });
    if (b.balancePaidNgn && b.balancePaidAt && inRange(b.balancePaidAt, r)) out.push({ ...base, at: b.balancePaidAt, paid: b.balancePaidNgn, net: b.balancePaidNgn, method: b.balancePaidHow === 'online' ? 'card' : null });
  });

  if (!handle) {
    inp.invoices.
    filter((i) => i.status !== 'void').
    forEach((i) =>
    i.payments.filter((p) => inRange(p.at, r)).forEach((p) => out.push({ at: p.at, type: 'invoices', ref: i.number, customer: p.payerName || i.client.name, paid: p.amountNgn, fees: 0, refunded: 0, net: p.amountNgn, vat: 0, method: null, sample: false }))
    );
    inp.linkPayments.
    filter((p) => inRange(p.at, r)).
    forEach((p) => {
      const refunded = p.refundedNgn ?? 0;
      out.push({ at: p.at, type: 'links', ref: p.receipt || p.linkTitle, customer: p.payerName, paid: p.amountNgn, fees: 0, refunded, net: p.amountNgn - refunded, vat: p.vatNgn ?? 0, method: linkMethod(p), sample: !!p.sample });
    });
  }

  inp.subscriptions.forEach((s) => {
    if (!spaceOk(s.sourceHandle)) return;
    s.payments.
    filter((p) => p.status === 'paid' && !p.orderId && inRange(p.at, r)).
    forEach((p) => out.push({ at: p.at, type: 'memberships', ref: p.label, customer: s.customer.name, paid: p.amountNgn, fees: 0, refunded: 0, net: p.amountNgn, vat: 0, method: 'card', sample: !!s.sample }));
  });

  return raw.sort((a, b) => Date.parse(b.at) - Date.parse(a.at)).map((e, i) => ({ ...e, id: `${e.type}:${e.ref}:${e.at}:${i}` }));
}

export interface Summary {
  received: number;
  paid: number;
  fees: number;
  refunded: number;
  orders: number;
  aov: number;
  /** Share of this period's order customers who had paid before. */
  repeatRate: number;
  newCustomers: number;
  returningCustomers: number;
  newRevenue: number;
  returningRevenue: number;
}

const customerKey = (o: Order) => o.customer.phone.replace(/\D/g, '').slice(-10) || o.customer.email.trim().toLowerCase() || o.customer.name.trim().toLowerCase();

export function summarise(entries: IncomeEntry[], allOrders: Order[], periodOrders: Order[], r: ReportRange): Summary {
  const shop = entries.filter((e) => e.type === 'shop');
  const before = new Set(allOrders.filter((o) => isPaidOrder(o) && Date.parse(o.createdAt) < r.from).map(customerKey));
  const firstSeen = new Map<string, boolean>();
  let newRevenue = 0;
  let returningRevenue = 0;
  periodOrders.forEach((o) => {
    const k = customerKey(o);
    const returning = before.has(k);
    firstSeen.set(k, returning);
    if (returning) returningRevenue += orderMoney(o).gross;else
    newRevenue += orderMoney(o).gross;
  });
  const returningCustomers = Array.from(firstSeen.values()).filter(Boolean).length;
  const shopPaid = shop.reduce((t, e) => t + e.paid, 0);
  return {
    received: entries.reduce((t, e) => t + e.net, 0),
    paid: entries.reduce((t, e) => t + e.paid, 0),
    fees: entries.reduce((t, e) => t + e.fees, 0),
    refunded: entries.reduce((t, e) => t + e.refunded, 0),
    orders: shop.length,
    aov: shop.length ? Math.round(shopPaid / shop.length) : 0,
    repeatRate: firstSeen.size ? returningCustomers / firstSeen.size : 0,
    newCustomers: firstSeen.size - returningCustomers,
    returningCustomers,
    newRevenue,
    returningRevenue
  };
}

export function byIncomeType(entries: IncomeEntry[]): {id: IncomeType;amount: number;count: number;}[] {
  return (Object.keys(incomeLabels) as IncomeType[]).
  map((id) => {
    const list = entries.filter((e) => e.type === id);
    return { id, amount: list.reduce((t, e) => t + e.net, 0), count: list.length };
  }).
  filter((r) => r.count > 0);
}

export function byMethod(entries: IncomeEntry[]): {id: MethodId;amount: number;count: number;}[] {
  const map = new Map<MethodId, {amount: number;count: number;}>();
  entries.forEach((e) => {
    if (!e.method) return;
    const cur = map.get(e.method) ?? { amount: 0, count: 0 };
    map.set(e.method, { amount: cur.amount + e.paid, count: cur.count + 1 });
  });
  return Array.from(map.entries()).map(([id, v]) => ({ id, ...v })).sort((a, b) => b.amount - a.amount);
}

export function byProduct(orders: Order[]): {name: string;qty: number;revenue: number;}[] {
  const map = new Map<string, {name: string;qty: number;revenue: number;}>();
  orders.
  filter((o) => o.paymentStatus !== 'refunded').
  forEach((o) =>
  o.items.forEach((i) => {
    const cur = map.get(i.productId) ?? { name: i.name, qty: 0, revenue: 0 };
    map.set(i.productId, { ...cur, qty: cur.qty + i.qty, revenue: cur.revenue + i.unitPriceNgn * i.qty });
  })
  );
  return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
}

/** Money in per day (or per month for long ranges), oldest first. */
export function incomeSeries(entries: IncomeEntry[], r: ReportRange): {key: string;label: string;value: number;}[] {
  const days = Math.max(1, Math.round((r.to - r.from) / 86400000));
  const monthly = days > 92;
  const keyOf = (t: number) => {
    const d = new Date(t);
    return monthly ? `${d.getFullYear()}-${d.getMonth()}` : d.toDateString();
  };
  const buckets = new Map<string, {label: string;value: number;}>();
  if (monthly) {
    const d = new Date(r.from);
    d.setDate(1);
    while (d.getTime() < r.to) {
      buckets.set(keyOf(d.getTime()), { label: d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' }), value: 0 });
      d.setMonth(d.getMonth() + 1);
    }
  } else {
    for (let i = 0; i < days; i++) {
      const d = new Date(r.from + i * 86400000);
      buckets.set(keyOf(d.getTime()), { label: days > 14 ? `${d.getDate()}/${d.getMonth() + 1}` : d.toLocaleDateString(undefined, { weekday: 'short' }), value: 0 });
    }
  }
  entries.forEach((e) => {
    const b = buckets.get(keyOf(Date.parse(e.at)));
    if (b) b.value += e.net;
  });
  return Array.from(buckets.entries()).map(([key, v]) => ({ key, ...v }));
}

export function vatSummary(entries: IncomeEntry[]): {total: number;count: number;} {
  const list = entries.filter((e) => e.vat > 0);
  return { total: list.reduce((t, e) => t + e.vat, 0), count: list.length };
}