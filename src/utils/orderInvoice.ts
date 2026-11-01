import type { Order, ShopSettings } from '../types/commerce';
import type { CountryCode } from '../types/country';
import { orderMoney } from './commerce/money';
import { orderRef, taxNumberLabels, vatRateLabel } from './commerce/shopSettings';
import { activeCountry, countryInfo } from './country';
import { formatNgn, formatTimestamp } from './format';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * How the invoice is worded for whose tax it carries (D462). EXAMPLE wording for an accountant to confirm:
 * - tax charged → "Tax invoice", the tax country's name for VAT, and the seller's number registered in that country;
 * - buyer in another country with no tax charged → "Invoice" with an export note (no home VAT; import tax may be due there);
 * - no tax at home → plain "Invoice".
 */
export function invoiceWording(order: Order, tax?: ShopSettings['tax'], homeTin?: string) {
  const home = activeCountry();
  const vat = order.vat && order.vat.amountNgn > 0 ? order.vat : null;
  const taxCountry: CountryCode = vat?.country ?? home;
  const buyerCountry = order.fulfilment.country;
  const regNumber = vat ? taxCountry === home ? homeTin?.trim() ?? '' : tax?.sellsTo?.[taxCountry]?.taxNumber.trim() ?? '' : '';
  return {
    title: vat ? 'Tax invoice' : 'Invoice',
    taxLine: vat ? `${taxCountry === home ? '' : `${countryInfo(taxCountry).name} `}VAT` : 'VAT',
    regLine: vat && regNumber ? `${taxNumberLabels[taxCountry].label} (${countryInfo(taxCountry).name}): ${regNumber}` : '',
    exportNote: !vat && buyerCountry && buyerCountry !== home ? `Export to ${countryInfo(buyerCountry).name} — no ${countryInfo(home).name} VAT charged. Import duties and taxes may be due in ${countryInfo(buyerCountry).name}.` : ''
  };
}

/**
 * Opens a printable invoice for one order (Order invoices extension, D67). Returns false if blocked.
 * Business details and VAT come from Commerce settings (D222) when they're set; wording follows whose tax it is (D462).
 */
export function printOrderInvoice(order: Order, business: string, details?: ShopSettings['business'], tax?: ShopSettings['tax']): boolean {
  const w = window.open('', '_blank', 'width=800,height=900');
  if (!w) return false;
  const m = orderMoney(order);
  const ref = orderRef(order);
  const name = details?.tradingName.trim() || business;
  const words = invoiceWording(order, tax, details?.tin);
  const rows = order.items.
  map((i) => `<tr><td>${esc(i.name)}${i.variantLabel ? ` <span class="m">(${esc(i.variantLabel)})</span>` : ''}</td><td class="r">${i.qty}</td><td class="r">${formatNgn(i.unitPriceNgn)}</td><td class="r">${formatNgn(i.unitPriceNgn * i.qty)}</td></tr>`).
  join('');
  const extra = [
  order.discountNgn ? `<tr><td colspan="3">Discount${order.discount?.code ? ` (${esc(order.discount.code)})` : ''}</td><td class="r">−${formatNgn(order.discountNgn)}</td></tr>` : '',
  order.deliveryNgn ? `<tr><td colspan="3">Delivery${order.fulfilment.zoneName ? ` — ${esc(order.fulfilment.zoneName)}` : ''}</td><td class="r">${formatNgn(order.deliveryNgn)}</td></tr>` : '',
  m.vat && !m.vatInclusive ? `<tr><td colspan="3">${esc(words.taxLine)} (${vatRateLabel(m.vatRatePct)})</td><td class="r">${formatNgn(m.vat)}</td></tr>` : ''].
  join('');
  const vatNote = m.vat && m.vatInclusive ? `<tr><td colspan="3" class="m">Includes ${esc(words.taxLine)} (${vatRateLabel(m.vatRatePct)})</td><td class="r m">${formatNgn(m.vat)}</td></tr>` : '';
  // The home TIN is shown in the tax registration line when this invoice carries home tax, so it isn't repeated here.
  const showTin = details?.tin.trim() && !words.regLine.includes(details.tin.trim());
  const idLine = details ? [details.regNumber.trim(), showTin && `TIN ${details.tin.trim()}`].filter(Boolean).join(' · ') : '';
  const contact = details ? [details.address.trim(), details.phone.trim(), details.email.trim()].filter(Boolean).join(' · ') : '';
  const logo = details?.logoUrl && /^https?:/.test(details.logoUrl) ? `<img src="${esc(details.logoUrl)}" alt="" style="height:48px;margin-bottom:8px"/>` : '';
  w.document.write(`<!doctype html><html><head><title>${esc(words.title)} ${esc(ref)}</title><style>
body{font-family:Inter,Arial,sans-serif;color:#111;margin:40px}h1{font-size:22px;margin:0}h2{font-size:16px;margin:16px 0 0}.m{color:#666;font-size:13px}
table{width:100%;border-collapse:collapse;margin-top:24px;font-size:14px}th{text-align:left;font-size:12px;color:#666;border-bottom:1px solid #ccc;padding:6px 0}td{padding:8px 0;border-bottom:1px solid #eee}.r{text-align:right}
.t td{font-weight:700;border:0;font-size:16px}
</style></head><body>
${logo}<h1>${esc(name)}</h1>${contact ? `<p class="m">${esc(contact)}</p>` : ''}${idLine ? `<p class="m">${esc(idLine)}</p>` : ''}${words.regLine ? `<p class="m">${esc(words.regLine)}</p>` : ''}
<h2>${esc(words.title)}</h2><p class="m">Order ${esc(ref)} · ${formatTimestamp(order.createdAt)}</p>
<p><strong>Bill to</strong><br/>${esc(order.customer.name)}<br/><span class="m">${esc(order.customer.phone)} ${esc(order.customer.email)}</span>${order.buyerAddress ? `<br/><span class="m">${esc(order.buyerAddress)}</span>` : ''}</p>
<table><tr><th>Item</th><th class="r">Qty</th><th class="r">Price</th><th class="r">Amount</th></tr>${rows}${extra}
<tr class="t"><td colspan="3">Total</td><td class="r">${formatNgn(m.gross)}</td></tr>${vatNote}</table>
${words.exportNote ? `<p class="m">${esc(words.exportNote)}</p>` : ''}
<p class="m">Payment: ${esc(order.paymentStatus.replace('_', ' '))}.${details?.receiptFooter.trim() ? ` ${esc(details.receiptFooter.trim())}` : ''}</p>
<p class="m">Made with KUBICU (prototype — test mode). Invoice wording is an example to check with an accountant.</p>
<script>window.onload=function(){setTimeout(function(){window.print()},200)}</script></body></html>`);
  w.document.close();
  return true;
}