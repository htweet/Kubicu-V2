import type { CommerceData, DayHours, Order, OrderMessageId, ShopSettings, WeekdayId } from '../../types/commerce';

/**
 * Shop-wide Commerce settings (D222). Every default reproduces the shop as it was before these
 * settings existed, so nothing changes until the seller chooses.
 */
export const VAT_EXAMPLE_PCT = 7.5;

export const weekdays: {id: WeekdayId;label: string;short: string;}[] = [
{ id: 'mon', label: 'Monday', short: 'Mon' },
{ id: 'tue', label: 'Tuesday', short: 'Tue' },
{ id: 'wed', label: 'Wednesday', short: 'Wed' },
{ id: 'thu', label: 'Thursday', short: 'Thu' },
{ id: 'fri', label: 'Friday', short: 'Fri' },
{ id: 'sat', label: 'Saturday', short: 'Sat' },
{ id: 'sun', label: 'Sunday', short: 'Sun' }];


export const orderMessageLabels: Record<OrderMessageId, {label: string;preview: string;}> = {
  confirmed: { label: 'Order confirmed', preview: 'Hi {name}, thanks for your order {order}! We’ve got it and will let you know when it’s on its way.' },
  ready: { label: 'Ready for pickup', preview: 'Hi {name}, order {order} is ready to collect from {address}.' },
  out_for_delivery: { label: 'Out for delivery', preview: 'Hi {name}, order {order} is on its way to you today.' },
  delivered: { label: 'Delivered', preview: 'Hi {name}, order {order} was delivered. We hope you love it!' },
  refunded: { label: 'Refunded', preview: 'Hi {name}, we’ve refunded {amount} on order {order}. It can take a few days to reach your account.' }
};

export function defaultHours(): Record<WeekdayId, DayHours> {
  return weekdays.reduce(
    (m, d) => ({ ...m, [d.id]: { open: d.id !== 'sun', from: '09:00', to: d.id === 'sat' ? '16:00' : '18:00' } }),
    {} as Record<WeekdayId, DayHours>
  );
}

export const defaultShopSettings: ShopSettings = {
  business: { tradingName: '', address: '', regNumber: '', tin: '', phone: '', email: '', logoUrl: '', receiptFooter: '' },
  checkout: { email: 'optional', address: 'off', minOrderNgn: null, termsTick: false, orderNote: false },
  methods: { card: true, transfer: true, transferOwn: true, ussd: true, mobileMoney: true, eft: true },
  tax: { enabled: false, ratePct: VAT_EXAMPLE_PCT, inclusive: true },
  // Stock holds (D255) default on: they only stop two buyers paying for the same last item.
  orders: { prefix: '', lowStockDefault: 2, backorders: false, holdStock: true },
  policy: { set: false, accepts: true, days: 7, condition: 'Unused, with tags and original packaging', returnDelivery: 'buyer', refundAs: 'original', notes: '' },
  status: { paused: false, message: '', backOn: null, pauseLinks: false, hours: null },
  messages: {
    confirmed: { whatsapp: true, email: true },
    ready: { whatsapp: true, email: false },
    out_for_delivery: { whatsapp: true, email: false },
    delivered: { whatsapp: true, email: false },
    refunded: { whatsapp: true, email: true }
  },
  weightUnit: 'kg'
};

/** Saved settings merged over the defaults, section by section. */
export function shopSettingsOf(data: Pick<CommerceData, 'shop'> | null | undefined): ShopSettings {
  const s = data?.shop ?? {};
  const d = defaultShopSettings;
  return {
    business: { ...d.business, ...s.business },
    checkout: { ...d.checkout, ...s.checkout },
    methods: { ...d.methods, ...s.methods },
    tax: { ...d.tax, ...s.tax },
    orders: { ...d.orders, ...s.orders },
    policy: { ...d.policy, ...s.policy },
    status: { ...d.status, ...s.status },
    messages: { ...d.messages, ...s.messages },
    weightUnit: s.weightUnit ?? d.weightUnit
  };
}

/** A tidy prefix: capitals, digits and hyphens, up to 6 characters. */
export function cleanPrefix(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
}

/** "ADA-1042" when a prefix was in force for this order, otherwise "#1042". */
export function orderRef(order: Pick<Order, 'number' | 'numberPrefix'>): string {
  return order.numberPrefix ? `${order.numberPrefix}-${order.number}` : `#${order.number}`;
}

export interface VatResult {
  ratePct: number;
  amountNgn: number;
  inclusive: boolean;
  /** What the buyer pays on top (0 when VAT is included in prices). */
  addedNgn: number;
}

/** VAT on a taxable amount (goods after discount, plus delivery). Null when VAT is off. */
export function vatFor(settings: ShopSettings, taxableNgn: number): VatResult | null {
  if (!settings.tax.enabled || settings.tax.ratePct <= 0 || taxableNgn <= 0) return null;
  const r = settings.tax.ratePct;
  if (settings.tax.inclusive) {
    const amountNgn = Math.round(taxableNgn * r / (100 + r));
    return { ratePct: r, amountNgn, inclusive: true, addedNgn: 0 };
  }
  const amountNgn = Math.round(taxableNgn * r / 100);
  return { ratePct: r, amountNgn, inclusive: false, addedNgn: amountNgn };
}

export function vatRateLabel(ratePct: number): string {
  return `${ratePct.toLocaleString('en-NG', { maximumFractionDigits: 2 })}%`;
}

/** Plain-words returns policy for buyers, from the structured settings. Empty when not set. */
export function returnsSummary(p: ShopSettings['policy']): string {
  if (!p.set) return '';
  if (!p.accepts) return ['All sales are final — no returns or exchanges.', p.notes.trim()].filter(Boolean).join(' ');
  const refund = p.refundAs === 'original' ? 'refunded to how you paid' : p.refundAs === 'credit' ? 'refunded as store credit' : 'exchanged for another item';
  const who = p.returnDelivery === 'seller' ? 'We cover return delivery.' : 'You cover return delivery.';
  const condition = p.condition.trim() ? ` Items must be ${p.condition.trim().replace(/^./, (c) => c.toLowerCase())}.` : '';
  return `Returns within ${p.days} day${p.days === 1 ? '' : 's'} of delivery, ${refund}.${condition} ${who}${p.notes.trim() ? ` ${p.notes.trim()}` : ''}`;
}

const fmtTime = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  if (Number.isNaN(h)) return t;
  const suffix = h >= 12 ? 'pm' : 'am';
  const hr = h % 12 || 12;
  return m ? `${hr}:${String(m).padStart(2, '0')}${suffix}` : `${hr}${suffix}`;
};

/** "Mon–Fri 9am–6pm · Sat 9am–4pm · Sun closed", grouping days with the same hours. */
export function hoursSummary(hours: Record<WeekdayId, DayHours> | null): string {
  if (!hours) return '';
  const label = (d: DayHours) => d.open ? `${fmtTime(d.from)}–${fmtTime(d.to)}` : 'closed';
  const groups: {from: string;to: string;text: string;}[] = [];
  weekdays.forEach((w) => {
    const text = label(hours[w.id]);
    const last = groups[groups.length - 1];
    if (last && last.text === text) last.to = w.short;else
    groups.push({ from: w.short, to: w.short, text });
  });
  return groups.map((g) => `${g.from === g.to ? g.from : `${g.from}–${g.to}`} ${g.text}`).join(' · ');
}

/** Why checkout is closed right now, or '' when it's open. */
export function shopClosedMessage(settings: ShopSettings): string {
  if (!settings.status.paused) return '';
  const back = settings.status.backOn ? ` We’re back on ${new Date(settings.status.backOn).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' })}.` : '';
  return `${settings.status.message.trim() || 'The shop is taking a short break and isn’t taking orders right now.'}${back}`;
}

// Backorders are read by stock checks that don't receive the shop's settings (product cards, pages).
// The page being viewed sets this, like the active currency (D136).
let backordersActive = false;
export function setActiveBackorders(on: boolean | undefined): void {
  backordersActive = !!on;
}
export function backordersOn(): boolean {
  return backordersActive;
}