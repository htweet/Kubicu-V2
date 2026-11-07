import type { CommerceData, CommerceEvent, IssuedTicket, Order } from '../types/commerce';
import { kubicuFee, providerFee } from '../utils/commerce/money';
import { upsertEvent } from '../utils/commerce/tickets';

const DAY = 86400_000;
export const SAMPLE_EVENT_ID = 'sev_trunk';
const SAMPLE_EVENT_PRODUCT = 'sp_trunk_tickets';

export function sampleEvent(): CommerceEvent {
  const start = new Date(Date.now() + 12 * DAY);
  start.setHours(16, 0, 0, 0);
  const at = new Date(Date.now() - 20 * DAY).toISOString();
  return {
    id: SAMPLE_EVENT_ID,
    name: 'Adaeze Atelier Trunk Show',
    description: 'Try on the autumn collection before it goes online, meet the makers and get fitted on the spot. Light bites and zobo on arrival.',
    imageUrl: '',
    startsAt: start.toISOString(),
    endsAt: new Date(start.getTime() + 4 * 3600_000).toISOString(),
    timeZone: 'Africa/Lagos',
    online: false,
    venue: 'Adaeze Atelier studio',
    address: 'Victoria Island, Lagos (sample address)',
    capacity: 60,
    refundPolicy: 'Refunds up to 48 hours before the event. After that, tickets can’t be refunded but can be passed to a friend.',
    status: 'on_sale',
    productId: SAMPLE_EVENT_PRODUCT,
    ticketTypes: [
      { id: 'stt_general', name: 'General', priceNgn: 15000, quantity: 45, salesStart: null, salesEnd: null, minPerOrder: 1, maxPerOrder: 10, note: 'Entry, drinks and a fitting slot' },
      { id: 'stt_vip', name: 'VIP', priceNgn: 35000, quantity: 15, salesStart: null, salesEnd: null, minPerOrder: 1, maxPerOrder: 4, note: 'Early entry, styling session and a gift' },
    ],
    createdAt: at,
    updatedAt: at,
    sample: true,
  };
}

const buyers: { name: string; phone: string; type: 'stt_general' | 'stt_vip'; qty: number; days: number }[] = [
  { name: 'Kemi Bello', phone: '+234 803 000 2201', type: 'stt_general', qty: 10, days: 9 },
  { name: 'Ifeoma Nwosu', phone: '+234 805 000 2202', type: 'stt_general', qty: 12, days: 6 },
  { name: 'Bisi Oyelaran', phone: '+234 806 000 2203', type: 'stt_general', qty: 10, days: 3 },
  { name: 'Halima Yusuf', phone: '+234 809 000 2204', type: 'stt_vip', qty: 5, days: 4 },
  { name: 'Ngozi Okeke', phone: '+234 802 000 2205', type: 'stt_vip', qty: 3, days: 1 },
];

/** Adds the labelled sample event with 40 of 60 seats sold (D73). Skipped if it's already there. */
export function withSampleEvent(data: CommerceData): CommerceData {
  if ((data.events ?? []).some((e) => e.id === SAMPLE_EVENT_ID)) return data;
  const ev = sampleEvent();
  let next = upsertEvent(data, ev);
  let number = Math.max(next.nextOrderNumber, 1101);
  let codeSeq = 0;
  const orders: Order[] = buyers.map((b, i) => {
    const tt = ev.ticketTypes.find((t) => t.id === b.type)!;
    const createdAt = new Date(Date.now() - b.days * DAY).toISOString();
    const gross = tt.priceNgn * b.qty;
    const tickets: IssuedTicket[] = Array.from({ length: b.qty }, (_, n) => ({
      id: `stk_${i}_${n}`,
      code: `KUB-S${String(++codeSeq).padStart(3, '0')}`,
      eventId: ev.id,
      ticketTypeId: tt.id,
      typeName: tt.name,
      guestName: n === 0 ? b.name : `${b.name.split(' ')[0]}’s guest ${n}`,
      status: 'valid',
    }));
    const num = number++;
    return {
      id: `so_evt_${i}`,
      number: num,
      createdAt,
      customer: { name: b.name, phone: b.phone, email: `${b.name.split(' ')[0].toLowerCase()}@example.com` },
      items: [{ productId: ev.productId, variantId: tt.id, name: ev.name, variantLabel: tt.name, unitPriceNgn: tt.priceNgn, qty: b.qty, imageUrl: '', kind: 'ticket' }],
      fulfilment: { method: 'tickets' },
      subtotalNgn: gross,
      discountNgn: 0,
      deliveryNgn: 0,
      providerFeeNgn: providerFee(gross),
      kubicuFeeNgn: kubicuFee(gross, 'pro'),
      status: 'completed',
      paymentStatus: 'paid',
      refunds: [],
      events: [
        { id: `sev_${i}_c`, at: createdAt, kind: 'completed', label: 'Tickets issued' },
        { id: `sev_${i}_p`, at: createdAt, kind: 'paid', label: 'Payment confirmed by provider (test mode)' },
        { id: `sev_${i}_o`, at: createdAt, kind: 'placed', label: 'Order placed on your page' },
      ],
      downloads: [],
      note: '',
      sample: true,
      tickets,
    };
  });
  // Take the sold seats off each ticket type.
  next = {
    ...next,
    products: next.products.map((p) =>
      p.id !== ev.productId ? p : { ...p, variants: p.variants.map((v) => ({ ...v, stock: v.stock - buyers.filter((b) => b.type === v.id).reduce((s, b) => s + b.qty, 0) })) },
    ),
    orders: [...orders, ...next.orders].sort((a, b) => b.number - a.number),
    nextOrderNumber: number,
  };
  return next;
}
