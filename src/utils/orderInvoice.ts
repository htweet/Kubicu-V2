import type { Order } from '../types/commerce';
import { orderMoney } from './commerce/money';
import { formatNgn, formatTimestamp } from './format';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Opens a printable invoice for one order (Order invoices extension, D67). Returns false if blocked. */
export function printOrderInvoice(order: Order, business: string): boolean {
  const w = window.open('', '_blank', 'width=800,height=900');
  if (!w) return false;
  const m = orderMoney(order);
  const rows = order.items.
  map((i) => `<tr><td>${esc(i.name)}${i.variantLabel ? ` <span class="m">(${esc(i.variantLabel)})</span>` : ''}</td><td class="r">${i.qty}</td><td class="r">${formatNgn(i.unitPriceNgn)}</td><td class="r">${formatNgn(i.unitPriceNgn * i.qty)}</td></tr>`).
  join('');
  const extra = [
  order.discountNgn ? `<tr><td colspan="3">Discount${order.discount?.code ? ` (${esc(order.discount.code)})` : ''}</td><td class="r">−${formatNgn(order.discountNgn)}</td></tr>` : '',
  order.deliveryNgn ? `<tr><td colspan="3">Delivery${order.fulfilment.zoneName ? ` — ${esc(order.fulfilment.zoneName)}` : ''}</td><td class="r">${formatNgn(order.deliveryNgn)}</td></tr>` : ''].
  join('');
  w.document.write(`<!doctype html><html><head><title>Invoice #${order.number}</title><style>
body{font-family:Inter,Arial,sans-serif;color:#111;margin:40px}h1{font-size:22px;margin:0}.m{color:#666;font-size:13px}
table{width:100%;border-collapse:collapse;margin-top:24px;font-size:14px}th{text-align:left;font-size:12px;color:#666;border-bottom:1px solid #ccc;padding:6px 0}td{padding:8px 0;border-bottom:1px solid #eee}.r{text-align:right}
.t td{font-weight:700;border:0;font-size:16px}
</style></head><body>
<h1>${esc(business)}</h1><p class="m">Invoice for order #${order.number} · ${formatTimestamp(order.createdAt)}</p>
<p><strong>Bill to</strong><br/>${esc(order.customer.name)}<br/><span class="m">${esc(order.customer.phone)} ${esc(order.customer.email)}</span></p>
<table><tr><th>Item</th><th class="r">Qty</th><th class="r">Price</th><th class="r">Amount</th></tr>${rows}${extra}
<tr class="t"><td colspan="3">Total</td><td class="r">${formatNgn(m.gross)}</td></tr></table>
<p class="m">Payment: ${esc(order.paymentStatus.replace('_', ' '))}. Made with KUBICU (prototype — test mode).</p>
<script>window.onload=function(){setTimeout(function(){window.print()},200)}</script></body></html>`);
  w.document.close();
  return true;
}