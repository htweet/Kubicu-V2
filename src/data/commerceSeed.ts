import type { Collection, CommerceData, Order, OrderEvent, Product, StockMovement } from '../types/commerce';
import { kubicuFee, providerFee } from '../utils/commerce/money';
import { sampleDiscounts } from './sampleDiscounts';
import { sampleSubPlans, sampleSubscriptions } from './sampleSubscriptions';
import { withSampleEvent } from './sampleEvents';
import { sampleCourses, sampleEnrolments } from './sampleCourses';
import { withSampleSellModes } from './sampleSellModes';
export { withSampleSellModes };

/** Adds sample courses to workspaces seeded before courses existed (once). */
export function withSampleCourses(data: CommerceData): CommerceData {
  if (data.sampleCoursesSeeded) return data;
  return {
    ...data,
    courses: [...(data.courses ?? []), ...sampleCourses().filter((s) => !(data.courses ?? []).some((c) => c.id === s.id))],
    enrolments: [...(data.enrolments ?? []), ...sampleEnrolments().filter((s) => !(data.enrolments ?? []).some((e) => e.id === s.id))],
    sampleCoursesSeeded: true
  };
}

/**
 * SAMPLE commerce data for exploring the prototype. Every record is flagged `sample`
 * and can be removed with “Clear sample data”. Customers and orders are fictional.
 */

const IMG = {
  twoPiece: "/f4c7271f-cc76-4053-9771-c898db966afb.jpg",
  blouse: "/897f481d-af30-4d86-8e3d-0c44ea17f0e1.jpg",
  trousers: "/9e6a2dd6-fe8c-4011-bc3c-12beb45a6526.jpg"
};

const ago = (hours: number) => new Date(Date.now() - hours * 3600000).toISOString();

const sizes = (prefix: string, values: string[], stock: number[]) =>
values.map((v, i) => ({ id: `${prefix}_${v}`, sku: `${prefix.toUpperCase()}-${v}`, options: { Size: v }, priceNgn: null, stock: stock[i] ?? 0 }));

const sampleProducts = (): Product[] => [
{
  id: 'sp_ife',
  name: 'Ìfé linen two-piece',
  description: 'Wide-leg trousers and a cropped wrap top in breathable cream linen with black piping.',
  status: 'active',
  kind: 'physical',
  priceNgn: 68000,
  compareAtNgn: null,
  images: [{ id: 'im_ife', url: IMG.twoPiece, alt: 'Model wearing the cream Ìfé linen two-piece against a black backdrop' }],
  options: [{ id: 'op_ife', name: 'Size', values: ['8', '10', '12', '14', '16'] }],
  variants: sizes('ife', ['8', '10', '12', '14', '16'], [2, 5, 4, 1, 0]),
  collectionIds: ['sc_harmattan'],
  trackStock: true,
  lowStockAt: 2,
  weightKg: 0.8,
  sample: true,
  createdAt: ago(24 * 20),
  updatedAt: ago(30)
},
{
  id: 'sp_wrap',
  name: 'Voile wrap blouse',
  description: 'Cream cotton voile with black stitching. Ties at the waist.',
  status: 'active',
  kind: 'physical',
  priceNgn: 32000,
  compareAtNgn: 36000,
  images: [{ id: 'im_wrap', url: IMG.blouse, alt: 'Cream cotton voile wrap blouse with black stitching on a hanger' }],
  options: [{ id: 'op_wrap', name: 'Size', values: ['S', 'M', 'L'] }],
  variants: sizes('wrap', ['S', 'M', 'L'], [6, 9, 3]),
  collectionIds: ['sc_harmattan'],
  trackStock: true,
  lowStockAt: 3,
  weightKg: 0.3,
  sample: true,
  createdAt: ago(24 * 18),
  updatedAt: ago(48)
},
{
  id: 'sp_trousers',
  name: 'Black linen trousers',
  description: 'Wide-leg, high-waisted, with deep pockets.',
  status: 'active',
  kind: 'physical',
  priceNgn: 38000,
  compareAtNgn: null,
  images: [{ id: 'im_tr', url: IMG.trousers, alt: 'Folded black wide-leg linen trousers with a cream swatch' }],
  options: [{ id: 'op_tr', name: 'Size', values: ['S', 'M', 'L'] }],
  variants: sizes('tr', ['S', 'M', 'L'], [0, 0, 0]),
  collectionIds: ['sc_harmattan'],
  trackStock: true,
  lowStockAt: 2,
  weightKg: 0.6,
  sample: true,
  createdAt: ago(24 * 18),
  updatedAt: ago(10)
},
{
  id: 'sp_scarf',
  name: 'Adire silk scarf',
  description: 'Hand-dyed indigo adire on silk. One size.',
  status: 'active',
  kind: 'physical',
  priceNgn: 18000,
  compareAtNgn: null,
  images: [],
  options: [],
  variants: [{ id: 'scarf_default', sku: 'ADI-SCARF', options: {}, priceNgn: null, stock: 14 }],
  collectionIds: ['sc_accessories'],
  trackStock: true,
  lowStockAt: 3,
  weightKg: 0.1,
  sample: true,
  createdAt: ago(24 * 12),
  updatedAt: ago(24 * 3)
},
{
  id: 'sp_clutch',
  name: 'Aso-oke clutch',
  description: 'Woven aso-oke with a brass clasp. Coming with the next drop.',
  status: 'draft',
  kind: 'physical',
  priceNgn: 25000,
  compareAtNgn: null,
  images: [],
  options: [],
  variants: [{ id: 'clutch_default', sku: 'ASO-CLUTCH', options: {}, priceNgn: null, stock: 0 }],
  collectionIds: ['sc_accessories'],
  trackStock: true,
  lowStockAt: 2,
  weightKg: 0.3,
  sample: true,
  createdAt: ago(24 * 2),
  updatedAt: ago(24 * 2)
},
{
  id: 'sp_pattern',
  name: 'Wrap blouse sewing pattern',
  description: 'Printable PDF pattern in sizes 6–18 with illustrated steps.',
  status: 'active',
  kind: 'digital',
  priceNgn: 12000,
  compareAtNgn: null,
  images: [],
  options: [],
  variants: [{ id: 'pattern_default', sku: 'PAT-WRAP', options: {}, priceNgn: null, stock: 0 }],
  collectionIds: [],
  trackStock: false,
  lowStockAt: 0,
  weightKg: null,
  digital: {
    fileName: 'wrap-blouse-pattern-v2.pdf',
    sizeBytes: 8_400_000,
    status: 'ready',
    version: 2,
    versions: [
    { version: 2, fileName: 'wrap-blouse-pattern-v2.pdf', sizeBytes: 8_400_000, uploadedAt: ago(24 * 4), note: 'Added size 18 and fixed the sleeve notch.' },
    { version: 1, fileName: 'wrap-blouse-pattern.pdf', sizeBytes: 7_900_000, uploadedAt: ago(24 * 30), note: '' }],

    downloadLimit: 3,
    expiryDays: 30,
    licence: 'For personal sewing only. Please don’t resell or share the file.'
  },
  sample: true,
  createdAt: ago(24 * 30),
  updatedAt: ago(24 * 4)
}];


const sampleCollections: Collection[] = [
{ id: 'sc_harmattan', name: 'Harmattan drop', description: 'Linen and voile for the dry season.', sample: true },
{ id: 'sc_accessories', name: 'Accessories', description: '', sample: true }];


function ev(kind: OrderEvent['kind'], label: string, hours: number): OrderEvent {
  return { id: `ev_${kind}_${hours}_${label.length}`, kind, label, at: ago(hours) };
}

function order(partial: Omit<Order, 'providerFeeNgn' | 'kubicuFeeNgn' | 'discountNgn' | 'downloads' | 'refunds' | 'note' | 'sample' | 'subtotalNgn'> & Partial<Pick<Order, 'refunds' | 'downloads' | 'note'>>): Order {
  const subtotal = partial.items.reduce((s, i) => s + i.unitPriceNgn * i.qty, 0);
  const gross = subtotal + partial.deliveryNgn;
  return {
    refunds: [],
    downloads: [],
    note: '',
    ...partial,
    subtotalNgn: subtotal,
    discountNgn: 0,
    providerFeeNgn: providerFee(gross),
    kubicuFeeNgn: kubicuFee(gross, 'pro'),
    sample: true
  };
}

const item = (productId: string, variantId: string, name: string, variantLabel: string, price: number, qty: number, imageUrl = '', kind: 'physical' | 'digital' = 'physical') => ({
  productId,
  variantId,
  name,
  variantLabel,
  unitPriceNgn: price,
  qty,
  imageUrl,
  kind
});

const sampleOrders = (): Order[] => [
order({
  id: 'so_1008',
  number: 1008,
  createdAt: ago(1),
  customer: { name: 'Temi Adebayo', phone: '+234 802 000 1108', email: 'temi@example.com' },
  items: [item('sp_wrap', 'wrap_M', 'Voile wrap blouse', 'M', 32000, 1, IMG.blouse)],
  fulfilment: { method: 'delivery', zoneId: 'z_island', zoneName: 'Lagos Island', address: '12 Sample Close, Lekki Phase 1', eta: '1–2 days' },
  deliveryNgn: 2500,
  status: 'new',
  paymentStatus: 'pending',
  paymentNote: 'Bank transfer awaiting confirmation',
  events: [ev('payment', 'Bank transfer pending with provider', 1), ev('placed', 'Order placed on your page', 1)]
}),
order({
  id: 'so_1007',
  number: 1007,
  createdAt: ago(5),
  customer: { name: 'Chiamaka Obi', phone: '+234 803 000 1107', email: 'chiamaka@example.com' },
  items: [item('sp_ife', 'ife_12', 'Ìfé linen two-piece', '12', 68000, 1, IMG.twoPiece), item('sp_scarf', 'scarf_default', 'Adire silk scarf', '', 18000, 1)],
  fulfilment: { method: 'delivery', zoneId: 'z_mainland', zoneName: 'Lagos Mainland', address: '4 Example Street, Yaba', eta: '2–3 days' },
  deliveryNgn: 3500,
  status: 'paid',
  paymentStatus: 'paid',
  events: [ev('paid', 'Payment confirmed by provider (test mode)', 5), ev('placed', 'Order placed on your page', 5)]
}),
order({
  id: 'so_1006',
  number: 1006,
  createdAt: ago(26),
  customer: { name: 'Bisi Lawal', phone: '+234 805 000 1106', email: 'bisi@example.com' },
  items: [item('sp_ife', 'ife_10', 'Ìfé linen two-piece', '10', 68000, 1, IMG.twoPiece)],
  fulfilment: { method: 'pickup', address: 'Studio pickup' },
  deliveryNgn: 0,
  status: 'packing',
  paymentStatus: 'paid',
  events: [ev('packing', 'Marked as packing', 20), ev('paid', 'Payment confirmed by provider (test mode)', 26), ev('placed', 'Order placed on your page', 26)]
}),
order({
  id: 'so_1005',
  number: 1005,
  createdAt: ago(50),
  customer: { name: 'Ngozi Eze', phone: '+234 806 000 1105', email: 'ngozi@example.com' },
  items: [item('sp_wrap', 'wrap_S', 'Voile wrap blouse', 'S', 32000, 2, IMG.blouse)],
  fulfilment: { method: 'delivery', zoneId: 'z_outside', zoneName: 'Outside Lagos', address: 'Plot 9 Example Road, Ibadan', eta: '3–5 days' },
  deliveryNgn: 6000,
  status: 'out_for_delivery',
  paymentStatus: 'paid',
  events: [ev('shipped', 'Out for delivery', 20), ev('packing', 'Marked as packing', 40), ev('paid', 'Payment confirmed by provider (test mode)', 50), ev('placed', 'Order placed on your page', 50)]
}),
order({
  id: 'so_1004',
  number: 1004,
  createdAt: ago(72),
  customer: { name: 'Funmi Okafor', phone: '+234 807 000 1104', email: 'funmi@example.com' },
  items: [item('sp_pattern', 'pattern_default', 'Wrap blouse sewing pattern', '', 12000, 1, '', 'digital')],
  fulfilment: { method: 'digital' },
  deliveryNgn: 0,
  status: 'completed',
  paymentStatus: 'paid',
  downloadToken: 'dl_sample1004',
  downloads: [{ id: 'dlr_1', productId: 'sp_pattern', at: ago(71) }],
  events: [ev('download', 'Customer downloaded their file', 71), ev('completed', 'Delivered by download link', 72), ev('paid', 'Payment confirmed by provider (test mode)', 72), ev('placed', 'Order placed on your page', 72)]
}),
{
  ...order({
    id: 'so_1003',
    number: 1003,
    createdAt: ago(24 * 6),
    customer: { name: 'Kemi Bello', phone: '+234 808 000 1103', email: 'kemi@example.com' },
    items: [item('sp_trousers', 'tr_M', 'Black linen trousers', 'M', 38000, 1, IMG.trousers)],
    fulfilment: { method: 'delivery', zoneId: 'z_island', zoneName: 'Lagos Island', address: '7 Sample Avenue, Ikoyi', eta: '1–2 days' },
    deliveryNgn: 2500,
    status: 'completed',
    paymentStatus: 'paid',
    events: [
    ev('dispute', 'Customer opened a dispute with their bank', 24),
    ev('completed', 'Marked as completed', 24 * 4),
    ev('shipped', 'Out for delivery', 24 * 5),
    ev('paid', 'Payment confirmed by provider (test mode)', 24 * 6),
    ev('placed', 'Order placed on your page', 24 * 6)]

  }),
  dispute: {
    id: 'dp_1003',
    reason: 'Customer says the item didn’t arrive',
    amountNgn: 40500,
    openedAt: ago(24),
    respondBy: new Date(Date.now() + 24 * 3600000 * 4).toISOString(),
    status: 'needs_response',
    evidence: [],
    response: ''
  }
},
order({
  id: 'so_1002',
  number: 1002,
  createdAt: ago(24 * 9),
  customer: { name: 'Halima Yusuf', phone: '+234 809 000 1102', email: 'halima@example.com' },
  items: [item('sp_ife', 'ife_14', 'Ìfé linen two-piece', '14', 68000, 1, IMG.twoPiece)],
  fulfilment: { method: 'pickup', address: 'Studio pickup' },
  deliveryNgn: 0,
  status: 'refunded',
  paymentStatus: 'refunded',
  refunds: [{ id: 'rf_1002', amountNgn: 68000, reason: 'Wrong size, no exchange available', restocked: true, at: ago(24 * 7) }],
  events: [ev('refund', 'Refunded in full — ₦68,000 · Wrong size', 24 * 7), ev('paid', 'Payment confirmed by provider (test mode)', 24 * 9), ev('placed', 'Order placed on your page', 24 * 9)]
}),
order({
  id: 'so_1001',
  number: 1001,
  createdAt: ago(24 * 11),
  customer: { name: 'Yemi Ade', phone: '+234 810 000 1101', email: 'yemi@example.com' },
  items: [item('sp_scarf', 'scarf_default', 'Adire silk scarf', '', 18000, 2)],
  fulfilment: { method: 'delivery', zoneId: 'z_mainland', zoneName: 'Lagos Mainland', address: '3 Example Lane, Surulere', eta: '2–3 days' },
  deliveryNgn: 3500,
  status: 'cancelled',
  paymentStatus: 'cancelled',
  events: [ev('cancelled', 'Cancelled — customer asked to cancel', 24 * 11 - 2), ev('placed', 'Order placed on your page', 24 * 11)]
})];


const sampleMovements = (): StockMovement[] => [
{ id: 'smv_1', productId: 'sp_trousers', variantId: 'tr_M', delta: -1, after: 0, reason: 'order', note: 'Reserved by order', by: 'Checkout', at: ago(24 * 6), orderNumber: 1003, sample: true },
{ id: 'smv_2', productId: 'sp_scarf', variantId: 'scarf_default', delta: 10, after: 14, reason: 'received', note: 'New batch from the dyer', by: 'You', at: ago(24 * 3), sample: true },
{ id: 'smv_3', productId: 'sp_ife', variantId: 'ife_14', delta: 1, after: 1, reason: 'returned', note: 'Returned with refund', by: 'You', at: ago(24 * 7), orderNumber: 1002, sample: true },
{ id: 'smv_4', productId: 'sp_wrap', variantId: 'wrap_L', delta: -1, after: 3, reason: 'damaged', note: 'Stain on the hem', by: 'You', at: ago(24 * 2), sample: true }];


/** Sample DealRoom (group goal for the scarf) and campaign links, used by the sample spaces. */
export const SAMPLE_ROOM_HANDLE = 'adaeze-scarf-group';
export const SAMPLE_CAMPAIGN_HANDLE = 'adaeze-eid-sale';

/** Four real (sample) orders that joined the sample group buy, held until the goal is reached. */
export const sampleRoomOrders = (): Order[] =>
[
['Ngozi Eze', '+234 805 000 2101', 30],
['Bisi Lawal', '+234 806 000 2102', 22],
['Ifeoma Nwosu', '+234 807 000 2103', 9],
['Kemi Ojo', '+234 808 000 2104', 3]].
map(([name, phone, hours], i) =>
order({
  id: `so_room_${i + 1}`,
  number: 1009 + i,
  createdAt: ago(hours as number),
  customer: { name: name as string, phone: phone as string, email: '' },
  items: [item('sp_scarf', 'scarf_default', 'Adire silk scarf', '', 14000, 1)],
  fulfilment: { method: 'pickup', address: 'Adaeze Atelier studio, Victoria Island (sample address)' },
  deliveryNgn: 0,
  status: 'paid',
  paymentStatus: 'paid',
  sourceHandle: SAMPLE_ROOM_HANDLE,
  held: true,
  referralCode: `${(name as string).split(' ')[0].toUpperCase()}-S${i + 1}`,
  // Ifeoma and Kemi joined through Ngozi's link.
  referredBy: i >= 2 ? 'NGOZI-S1' : undefined,
  events: [
  ev('note', 'Joined the group buy — held until the goal is reached, refunded automatically if it isn’t', hours as number),
  ev('paid', 'Payment confirmed by provider (test mode)', hours as number),
  ev('placed', 'Order placed on your page', hours as number)]

})
);

/** Merges sample records into a workspace's commerce data. */
export function withSampleData(data: CommerceData): CommerceData {
  return withSampleSellModes(withSampleEvent({
    ...data,
    products: [...data.products, ...sampleProducts()],
    collections: [...data.collections, ...sampleCollections],
    movements: [...data.movements, ...sampleMovements()],
    orders: [...data.orders, ...sampleOrders(), ...sampleRoomOrders()].sort((a, b) => b.number - a.number),
    discounts: [...(data.discounts ?? []), ...sampleDiscounts().filter((s) => !(data.discounts ?? []).some((d) => d.id === s.id))],
    settledRooms: data.settledRooms ?? {},
    subPlans: [...(data.subPlans ?? []), ...sampleSubPlans().filter((s) => !(data.subPlans ?? []).some((p) => p.id === s.id))],
    subscriptions: [...(data.subscriptions ?? []), ...sampleSubscriptions().filter((s) => !(data.subscriptions ?? []).some((x) => x.id === s.id))],
    courses: [...(data.courses ?? []), ...sampleCourses().filter((s) => !(data.courses ?? []).some((c) => c.id === s.id))],
    enrolments: [...(data.enrolments ?? []), ...sampleEnrolments().filter((s) => !(data.enrolments ?? []).some((e) => e.id === s.id))],
    sampleCoursesSeeded: true,
    nextOrderNumber: Math.max(data.nextOrderNumber, 1013),
    storefront: data.storefront?.enabled ? data.storefront : { ...(data.storefront ?? {}), enabled: true, title: 'Shop the collection', intro: 'Made in small runs in Lekki. Delivery across Lagos, pickup from the studio.', showInMenu: true, menuLabel: 'Shop', ordering: 'checkout', whatsappPhone: data.storefront?.whatsappPhone ?? '', hideSoldOut: false },
    fulfilment: data.fulfilment.zones.length ?
    data.fulfilment :
    {
      pickupEnabled: true,
      pickupAddress: 'Adaeze Atelier studio, Victoria Island (sample address)',
      pickupHours: 'Tue–Sat, 10am–6pm',
      deliveryEnabled: true,
      zones: [
      { id: 'z_island', name: 'Lagos Island', feeNgn: 2500, eta: '1–2 days' },
      { id: 'z_mainland', name: 'Lagos Mainland', feeNgn: 3500, eta: '2–3 days' },
      { id: 'z_outside', name: 'Outside Lagos', feeNgn: 6000, eta: '3–5 days' }],

      freeDeliveryOverNgn: 150000
    },
    sampleSeeded: true
  }));
}