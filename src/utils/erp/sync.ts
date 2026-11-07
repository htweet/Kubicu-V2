import type { CommerceData } from '../../types/commerce';
import type { ErpRun, ErpState } from '../../types/erp';
import { MAIN_BRANCH, locationName, stockAt } from '../commerce/branches';
import { moveStock } from '../commerce/ops';
import { addBatch } from '../commerce/batches';
import { isPaidOrder } from '../commerce/salesReport';
import { uid } from '../id';

/**
 * Inventory/ERP sync (D440). The ERP is the source of truth for stock: on each sync, every product line with a SKU
 * and a mapped location is set to the ERP's count. Paid orders go the other way as sales orders.
 * The ERP is simulated: its counts are the current count plus a small, repeatable difference per sync.
 */

export function emptyErp(): ErpState {
  return { provider: null, server: '', company: '', connectedAt: null, warehouses: {}, pushOrders: true, auto: true, sentOrders: {}, runs: [] };
}

export interface ErpLine {
  productId: string;
  variantId: string;
  sku: string;
  name: string;
  location: string;
  locationName: string;
  warehouse: string;
  kubicu: number;
  erp: number;
}

const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

/** Simulated ERP count: about a third of lines differ by a few units. */
function erpCount(kubicu: number, sku: string, warehouse: string, round: number): number {
  const h = hash(`${sku}|${warehouse}|${round}`);
  if (h % 3 !== 0) return kubicu;
  return Math.max(0, kubicu + ((h >> 3) % 9) - 4);
}

/** Every line the sync covers, and the SKUs it can't match. */
export function previewPull(data: CommerceData, s: ErpState): { lines: ErpLine[]; changed: ErpLine[]; unmatched: string[] } {
  const round = s.runs.length;
  const mapped = Object.entries(s.warehouses).filter(([, code]) => code.trim());
  const lines: ErpLine[] = [];
  const unmatched: string[] = [];
  data.products
    .filter((p) => p.kind === 'physical' && p.trackStock && !p.sample && p.status !== 'archived')
    .forEach((p) =>
      p.variants.forEach((v) => {
        const sku = v.sku.trim();
        if (!sku) return void unmatched.push(p.name);
        mapped.forEach(([loc, code]) => {
          if (loc !== MAIN_BRANCH && !(data.branches ?? []).some((b) => b.id === loc)) return;
          const kubicu = stockAt(v, loc);
          lines.push({ productId: p.id, variantId: v.id, sku, name: p.name, location: loc, locationName: locationName(data, loc), warehouse: code.trim(), kubicu, erp: erpCount(kubicu, sku, code.trim(), round) });
        });
      }),
    );
  return { lines, changed: lines.filter((l) => l.erp !== l.kubicu), unmatched };
}

export function ordersToSend(data: CommerceData, s: ErpState) {
  if (!s.pushOrders || !s.connectedAt) return [];
  return data.orders.filter((o) => !o.sample && isPaidOrder(o) && o.items.some((i) => i.kind === 'physical') && o.createdAt >= (s.connectedAt as string) && !s.sentOrders[o.id]);
}

/** Applies the ERP's counts as corrections (recorded in stock history) and marks orders as sent. */
export function runErpSync(data: CommerceData, s: ErpState, trigger: ErpRun['trigger'], providerName: string): { data: CommerceData; state: ErpState; run: ErpRun } {
  const { changed, unmatched } = previewPull(data, s);
  let next = data;
  let unitsIn = 0;
  let unitsOut = 0;
  let batchesIn = 0;
  const round = s.runs.length + 1;
  changed.forEach((l) => {
    const delta = l.erp - l.kubicu;
    if (delta > 0) unitsIn += delta;
    else unitsOut += delta;
    next = moveStock(next, l.productId, l.variantId, delta, 'correction', `Synced from ${providerName} · ${l.warehouse}`, undefined, l.location === MAIN_BRANCH ? undefined : l.location);
    // Batches (D476): items already tracked by batch get the ERP's lot for units it added. The lot code and expiry are
    // simulated — a real ERP sends them with each stock line.
    const v = next.products.find((p) => p.id === l.productId)?.variants.find((x) => x.id === l.variantId);
    if (delta > 0 && v?.batches?.length) {
      const days = 90 + (hash(`${l.sku}|${round}`) % 90);
      const expires = new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
      next = { ...next, products: next.products.map((p) => (p.id === l.productId ? { ...p, variants: p.variants.map((x) => (x.id === l.variantId ? addBatch(x, `${l.warehouse}-${round}`, expires, delta, l.location) : x)) } : p)) };
      batchesIn += 1;
    }
  });
  const at = new Date().toISOString();
  const orders = ordersToSend(data, s);
  const sentOrders = { ...s.sentOrders };
  orders.forEach((o) => (sentOrders[o.id] = at));
  const run: ErpRun = { id: uid('erp'), at, trigger, updated: changed.length, unitsIn, unitsOut, ordersSent: orders.length, unmatched: unmatched.length, batchesIn };
  return { data: next, state: { ...s, sentOrders, runs: [run, ...s.runs].slice(0, 20) }, run };
}

export function erpErrors(server: string, company: string): { server?: string; company?: string } {
  const e: { server?: string; company?: string } = {};
  if (!/^https:\/\/[^\s]+\.[^\s]+/.test(server.trim()) && !/^https:\/\/[^\s]+:\d+/.test(server.trim())) e.server = 'Must start with https://';
  if (!company.trim()) e.company = 'Required';
  return e;
}
