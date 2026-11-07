import type { KitDetails, KitItem } from './printKit';
import { countryInfo } from '../country';
import { figure, onOpsSettings } from '../opsSettings';

/**
 * Ordering prints from a partner print shop (D114). The print partner is simulated:
 * prices, turnaround and courier times are example figures, and stages move on a timer.
 */

export type OrderableItem = Exclude<KitItem, 'receipt'>;
export type PrintStage = 'paid' | 'printing' | 'dispatched' | 'delivered' | 'cancelled';
export type DeliveryZone = 'pickup' | 'lagos' | 'major' | 'other';
export type PrintPayMethod = 'wallet' | 'card';

export interface PrintOrder {
  id: string;
  ref: string;
  item: OrderableItem;
  quantity: number;
  finish: string;
  details: KitDetails;
  qrLinkName: string;
  qrUrl: string;
  zone: DeliveryZone;
  recipient: { name: string; phone: string; address: string; landmark: string; state: string };
  subtotalNgn: number;
  deliveryNgn: number;
  totalNgn: number;
  payMethod: PrintPayMethod;
  placedAt: string;
  placedBy: string;
  /** Prototype: stages skipped ahead with "Move to next stage". */
  skipped: number;
  cancelledAt?: string;
  refundedTo?: PrintPayMethod;
}

export interface PrintOrdersData {
  orders: PrintOrder[];
}

export const printOrdersKey = (workspaceId: string) => `kubicu.printOrders.${workspaceId}`;
export const emptyPrintOrders = (): PrintOrdersData => ({ orders: [] });

export const PRINT_PARTNER = 'Lagos Print Hub';

/** Quantity → price in naira (example figures). */
export const printPrices: Record<OrderableItem, { qty: number; ngn: number }[]> = {
  card: [
    { qty: 100, ngn: 9000 },
    { qty: 250, ngn: 16000 },
    { qty: 500, ngn: 27000 },
    { qty: 1000, ngn: 45000 },
  ],
  sticker: [
    { qty: 50, ngn: 7500 },
    { qty: 100, ngn: 12000 },
    { qty: 250, ngn: 25000 },
    { qty: 500, ngn: 42000 },
  ],
  insert: [
    { qty: 100, ngn: 10000 },
    { qty: 250, ngn: 20000 },
    { qty: 500, ngn: 35000 },
    { qty: 1000, ngn: 60000 },
  ],
  hangtag: [
    { qty: 100, ngn: 9500 },
    { qty: 250, ngn: 18000 },
    { qty: 500, ngn: 30000 },
    { qty: 1000, ngn: 52000 },
  ],
  voucher: [
    { qty: 25, ngn: 7500 },
    { qty: 50, ngn: 12500 },
    { qty: 100, ngn: 21000 },
    { qty: 250, ngn: 45000 },
  ],
  flyer: [
    { qty: 100, ngn: 15000 },
    { qty: 250, ngn: 30000 },
    { qty: 500, ngn: 50000 },
    { qty: 1000, ngn: 85000 },
  ],
  counter: [
    { qty: 2, ngn: 6000 },
    { qty: 5, ngn: 12500 },
    { qty: 10, ngn: 22000 },
    { qty: 25, ngn: 48000 },
  ],
  stamp: [
    { qty: 100, ngn: 8500 },
    { qty: 250, ngn: 15000 },
    { qty: 500, ngn: 25000 },
    { qty: 1000, ngn: 42000 },
  ],
  label: [
    { qty: 100, ngn: 9000 },
    { qty: 250, ngn: 19000 },
    { qty: 500, ngn: 33000 },
    { qty: 1000, ngn: 58000 },
  ],
};

export const printFinishes: Record<OrderableItem, { id: string; label: string; detail: string; upliftPct: number }[]> = {
  card: [
    { id: 'matte', label: 'Matte 350gsm', detail: 'Clean, no glare — the usual choice', upliftPct: 0 },
    { id: 'gloss', label: 'Gloss 350gsm', detail: 'Brighter colours, shows fingerprints', upliftPct: 15 },
    { id: 'premium', label: 'Premium soft-touch 400gsm', detail: 'Thick, velvety feel', upliftPct: 40 },
  ],
  sticker: [
    { id: 'paper', label: 'Paper, matte', detail: 'For dry packaging and bags', upliftPct: 0 },
    { id: 'vinyl', label: 'Waterproof vinyl', detail: 'Survives fridges, drinks and rain', upliftPct: 35 },
  ],
  insert: [
    { id: 'standard', label: 'White 250gsm', detail: 'Crisp and simple', upliftPct: 0 },
    { id: 'cream', label: 'Cream 300gsm', detail: 'Warm, premium feel', upliftPct: 15 },
    { id: 'kraft', label: 'Brown kraft 300gsm', detail: 'Earthy, handmade look', upliftPct: 25 },
  ],
  hangtag: [
    { id: 'matte', label: 'Matte 400gsm with eyelet', detail: 'Sturdy, with a metal ring in the hole', upliftPct: 0 },
    { id: 'kraft', label: 'Kraft 400gsm with string', detail: 'Natural look, cotton string included', upliftPct: 20 },
  ],
  voucher: [
    { id: 'matte', label: 'Matte 350gsm', detail: 'Writes well with a pen', upliftPct: 0 },
    { id: 'premium', label: 'Soft-touch 400gsm + envelopes', detail: 'Gift-ready, with matching envelopes', upliftPct: 45 },
  ],
  flyer: [
    { id: 'gloss', label: 'Gloss 150gsm', detail: 'Bright photos, the usual flyer finish', upliftPct: 0 },
    { id: 'matte', label: 'Matte 170gsm', detail: 'Softer, no glare', upliftPct: 10 },
  ],
  counter: [
    { id: 'board', label: 'Rigid board with stand', detail: 'Stands on a counter or table', upliftPct: 0 },
    { id: 'acrylic', label: 'Clear acrylic stand', detail: 'Wipe-clean, for restaurants and salons', upliftPct: 60 },
  ],
  stamp: [
    { id: 'matte', label: 'Matte 350gsm', detail: 'Takes stamps and pen without smudging', upliftPct: 0 },
    { id: 'kraft', label: 'Kraft 350gsm', detail: 'Earthy look for food and craft brands', upliftPct: 15 },
  ],
  label: [
    { id: 'paper', label: 'Self-adhesive paper', detail: 'Peel-and-stick, write on with any pen', upliftPct: 0 },
    { id: 'thermal', label: 'Thermal roll, 4 × 6 in', detail: 'For label printers — no ink needed', upliftPct: 10 },
  ],
};

export const deliveryZones: { id: DeliveryZone; label: string; detail: string; ngn: number; days: [number, number] }[] = [
  { id: 'pickup', label: 'Pick up in Ikeja, Lagos', detail: 'From the print shop, after it’s printed', ngn: 0, days: [0, 0] },
  { id: 'lagos', label: 'Delivery within Lagos', detail: '1–2 working days after printing', ngn: 2500, days: [1, 2] },
  { id: 'major', label: 'Abuja, Port Harcourt, Ibadan, Kano', detail: '2–4 working days after printing', ngn: 4500, days: [2, 4] },
  { id: 'other', label: 'Other states', detail: '3–6 working days after printing', ngn: 6000, days: [3, 6] },
];

/** KUBICU's print partner is in Lagos, so prints ship within Nigeria only (D352: shared country table). */
export const nigerianStates = countryInfo('NG').regions;

/** Suggests the delivery zone from the state, so the fee matches where it's going. */
export function zoneForState(state: string): DeliveryZone {
  if (state === 'Lagos') return 'lagos';
  if (['FCT (Abuja)', 'Rivers', 'Oyo', 'Kano'].includes(state)) return 'major';
  return 'other';
}

export let PRINT_DAYS = 2; // working days to print
export let DOUBLE_SIDED_PCT = 30;

// Print time and delivery fees are example figures staff can change in Figures & names (D467).
onOpsSettings(() => {
  PRINT_DAYS = figure('print.days');
  DOUBLE_SIDED_PCT = figure('print.doubleSidedPct');
  (Object.keys(printPrices) as OrderableItem[]).forEach((item) => printPrices[item].forEach((t) => (t.ngn = figure(`print.price.${item}.${t.qty}`))));
  const fee: Partial<Record<DeliveryZone, string>> = { lagos: 'print.lagosNgn', major: 'print.majorNgn', other: 'print.otherNgn' };
  deliveryZones.forEach((z) => {
    const k = fee[z.id];
    if (k) z.ngn = figure(k);
  });
});

/** Double-sided business cards cost DOUBLE_SIDED_PCT more (example figure, adjustable — D468). */
export function quote(item: OrderableItem, qty: number, finishId: string, zone: DeliveryZone, doubleSided = false) {
  const base = printPrices[item].find((p) => p.qty === qty)?.ngn ?? 0;
  const uplift = (printFinishes[item].find((f) => f.id === finishId)?.upliftPct ?? 0) + (doubleSided ? DOUBLE_SIDED_PCT : 0);
  const subtotalNgn = Math.round((base * (100 + uplift)) / 100 / 50) * 50;
  const deliveryNgn = deliveryZones.find((z) => z.id === zone)?.ngn ?? 0;
  return { subtotalNgn, deliveryNgn, totalNgn: subtotalNgn + deliveryNgn, unitNgn: qty ? subtotalNgn / qty : 0 };
}

/** Adds working days (Mon–Fri) to a date. */
export function addWorkingDays(from: Date, days: number): Date {
  const d = new Date(from);
  let left = days;
  while (left > 0) {
    d.setDate(d.getDate() + 1);
    const wd = d.getDay();
    if (wd !== 0 && wd !== 6) left -= 1;
  }
  return d;
}

export function estimateArrival(zone: DeliveryZone, from = new Date()): { earliest: Date; latest: Date } {
  const z = deliveryZones.find((x) => x.id === zone)!;
  const printed = addWorkingDays(from, PRINT_DAYS);
  return { earliest: addWorkingDays(printed, z.days[0]), latest: addWorkingDays(printed, z.days[1]) };
}

const flow: PrintStage[] = ['paid', 'printing', 'dispatched', 'delivered'];
// Simulated timing: printing starts after 1 hour, dispatch after printing, delivery after the courier.
const stageHours = (zone: DeliveryZone): number[] => {
  const z = deliveryZones.find((x) => x.id === zone)!;
  return [0, 1, PRINT_DAYS * 24, PRINT_DAYS * 24 + Math.max(4, z.days[1] * 24)];
};

export function stageOf(o: PrintOrder, now = Date.now()): PrintStage {
  if (o.cancelledAt) return 'cancelled';
  const hours = (now - Date.parse(o.placedAt)) / 3600000;
  const byTime = stageHours(o.zone).filter((h) => hours >= h).length - 1;
  return flow[Math.min(flow.length - 1, Math.max(byTime, 0) + o.skipped)];
}

export function stageIndex(stage: PrintStage): number {
  return flow.indexOf(stage);
}

export const stageLabels: Record<PrintStage, string> = { paid: 'Order received', printing: 'Printing', dispatched: 'On its way', delivered: 'Delivered', cancelled: 'Cancelled' };
export const stageTones: Record<PrintStage, 'neutral' | 'info' | 'warning' | 'success' | 'danger'> = { paid: 'neutral', printing: 'info', dispatched: 'warning', delivered: 'success', cancelled: 'danger' };
export const flowStages = flow;

/** Orders can be cancelled for a full refund until printing starts. */
export const canCancel = (o: PrintOrder, now = Date.now()) => stageOf(o, now) === 'paid';

export function printRef(): string {
  return `PR-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}
