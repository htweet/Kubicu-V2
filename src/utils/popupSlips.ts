import type { Order } from '../types/commerce';
import { formatNgn } from './format';

const esc = (v: string) => v.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

/**
 * Printable packing slips for one pop-up session (D191): one slip per order with the buyer, what to
 * pack, what to collect at the stall and a tick box. Three slips per A4 page, cut along the dashes.
 */
export function pickupSlipsHtml(opts: {shop: string;venue: string;sessionWhen: string;orders: Order[];}): string {
  const { shop, venue, sessionWhen, orders } = opts;
  const slips = orders.
  map((o) => {
    const owe = o.popup?.payAtStall && o.paymentStatus === 'pending';
    const total = o.subtotalNgn - o.discountNgn;
    const items = o.items.
    map((i) => `<tr><td class="q">${i.qty}×</td><td>${esc(i.name)}${i.variantLabel ? ` <span class="m">(${esc(i.variantLabel)})</span>` : ''}</td><td class="box"></td></tr>`).
    join('');
    return `<section class="slip">
  <header><div><p class="m">${esc(shop)} · ${esc(venue)}</p><h2>Order #${o.number}</h2></div><p class="when">${esc(sessionWhen)}</p></header>
  <p class="who"><strong>${esc(o.customer.name || 'Customer')}</strong>${o.customer.phone ? ` · ${esc(o.customer.phone)}` : ''}</p>
  <table><thead><tr><th>Qty</th><th>Item</th><th>Packed</th></tr></thead><tbody>${items}</tbody></table>
  <footer><p class="pay">${owe ? `Collect <strong>${esc(formatNgn(total))}</strong> at the stall` : `Paid online · ${esc(formatNgn(total))}`}</p><p class="m">Handed over ☐ &nbsp; Signature ____________</p></footer>
</section>`;
  }).
  join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Pickup slips — ${esc(sessionWhen)}</title>
<style>
@page{size:A4;margin:10mm}
*{box-sizing:border-box}body{margin:0;font:11pt/1.4 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#111}
.slip{height:89mm;padding:6mm 2mm;border-bottom:1px dashed #999;page-break-inside:avoid;display:flex;flex-direction:column;gap:3mm}
.slip:nth-child(3n){page-break-after:always}
header{display:flex;justify-content:space-between;align-items:flex-start;gap:6mm}
h2{margin:0;font-size:16pt}.m{margin:0;color:#555;font-size:9pt}.when{margin:0;font-weight:600;text-align:right}
.who{margin:0}table{width:100%;border-collapse:collapse}th{text-align:left;font-size:8.5pt;color:#555;border-bottom:1px solid #ccc;padding:1mm 0}
td{padding:1.2mm 0;border-bottom:1px solid #eee;vertical-align:top}.q{width:12mm;font-weight:600}.box{width:14mm}
.box::after{content:"";display:inline-block;width:4mm;height:4mm;border:1px solid #333}
footer{margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end;gap:6mm}.pay{margin:0}
.empty{padding:20mm;text-align:center;color:#555}
</style></head><body>${slips || '<p class="empty">No orders for this session.</p>'}</body></html>`;
}

/** Opens the slips in a new tab and starts printing. Returns false if the browser blocked the tab. */
export function printPickupSlips(opts: Parameters<typeof pickupSlipsHtml>[0]): boolean {
  const w = window.open('', '_blank');
  if (!w) return false;
  w.document.open();
  w.document.write(pickupSlipsHtml(opts));
  w.document.close();
  w.focus();
  window.setTimeout(() => w.print(), 300);
  return true;
}