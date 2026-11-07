import type { Invoice } from '../types/serviceOs';
import type { BankAccount } from '../types/money';
import { balanceOf, formatDay, lineTotal, methodLabels, paidOf, vatSplit } from './serviceOs';
import { vatRateLabel } from './commerce/shopSettings';
import { activeCurrency, currencyInfo } from './currency';
import { formatNgn, formatTimestamp } from './format';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

interface PrintOptions {
  business: string;
  logoUrl?: string;
  bank?: BankAccount;
  payUrl: string;
  accent?: string;
}

/**
 * Printable / save-as-PDF Service OS invoice (D125): letterhead, bill to, items, payments,
 * balance, bank details for transfer and the online pay link. Returns false if pop-ups are blocked.
 */
export function printServiceInvoice(inv: Invoice, o: PrintOptions): boolean {
  const w = window.open('', '_blank', 'width=820,height=960');
  if (!w) return false;
  const accent = o.accent || '#111111';
  const split = vatSplit(inv.items, inv.vat);
  const total = split.total;
  const vatRow = inv.vat && split.vat > 0
    ? `${inv.vat.inclusive ? '' : `<tr><td class="k">Subtotal</td><td class="r">${formatNgn(split.subtotal)}</td></tr>`}<tr><td class="k">${inv.vat.inclusive ? 'Includes VAT' : 'VAT'} (${esc(vatRateLabel(inv.vat.ratePct))})</td><td class="r">${formatNgn(split.vat)}</td></tr>`
    : '';
  const paid = paidOf(inv);
  const balance = balanceOf(inv);
  const open = balance > 0 && inv.status !== 'void';
  const rows = inv.items
    .map((i) => `<tr><td>${esc(i.label)}</td><td class="r">${i.qty}</td><td class="r">${formatNgn(i.unitNgn)}</td><td class="r">${formatNgn(lineTotal(i))}</td></tr>`)
    .join('');
  const pays = inv.payments.map((p) => `<tr><td>${esc(methodLabels[p.method])}</td><td>${formatTimestamp(p.at)}</td><td class="r">${formatNgn(p.amountNgn)}</td></tr>`).join('');
  const status = inv.status === 'void' ? 'VOID' : balance <= 0 ? 'PAID' : paid > 0 ? 'PART PAID' : 'DUE';
  w.document.write(`<!doctype html><html><head><title>${esc(inv.number)} · ${esc(o.business)}</title><style>
*{box-sizing:border-box}body{font-family:Inter,Arial,sans-serif;color:#141414;margin:0;padding:44px;font-size:14px}
.top{display:flex;justify-content:space-between;align-items:flex-start;gap:24px;border-bottom:3px solid ${accent};padding-bottom:20px}
.brand{display:flex;gap:14px;align-items:center}.logo{width:56px;height:56px;border-radius:10px;object-fit:cover}
h1{font-size:22px;margin:0}.m{color:#5c5c5c;font-size:12.5px;line-height:1.5}.big{font-size:28px;font-weight:700;letter-spacing:-.01em}
.stamp{display:inline-block;border:2px solid ${accent};color:${accent};font-weight:700;padding:3px 10px;border-radius:6px;font-size:12px;letter-spacing:.06em}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:24px}
table{width:100%;border-collapse:collapse;margin-top:22px}th{text-align:left;font-size:11.5px;color:#5c5c5c;border-bottom:1px solid #cfcfcf;padding:6px 0;font-weight:600}td{padding:9px 0;border-bottom:1px solid #ececec;vertical-align:top}.r{text-align:right}
.tot td{border:0;padding:5px 0}.tot .k{color:#5c5c5c}.due td{font-weight:700;font-size:16px;border-top:2px solid #141414;padding-top:10px}
.box{border:1px solid #dcdcdc;border-radius:10px;padding:14px}.box h3{margin:0 0 6px;font-size:12px;color:#5c5c5c;font-weight:600}
.foot{margin-top:32px;color:#7a7a7a;font-size:11.5px}
@media print{body{padding:24px}}
</style></head><body>
<div class="top"><div class="brand">${o.logoUrl ? `<img class="logo" src="${esc(o.logoUrl)}" alt=""/>` : ''}<div><h1>${esc(o.business)}</h1><div class="m">Invoice ${esc(inv.number)}</div></div></div>
<div style="text-align:right"><div class="stamp">${status}</div><div class="m" style="margin-top:8px">Issued ${formatTimestamp(inv.createdAt)}<br/>Due ${esc(formatDay(inv.dueDate))}</div></div></div>
<div class="grid"><div><div class="m">Bill to</div><strong>${esc(inv.client.name)}</strong><div class="m">${esc(inv.client.phone)}${inv.client.email ? `<br/>${esc(inv.client.email)}` : ''}</div></div>
<div style="text-align:right"><div class="m">${open ? 'Amount due' : 'Total'}</div><div class="big">${formatNgn(open ? balance : total)}</div></div></div>
<p style="margin:22px 0 0;font-weight:600">${esc(inv.title)}</p>
<table><tr><th>Item</th><th class="r">Qty</th><th class="r">Price</th><th class="r">Amount</th></tr>${rows}</table>
<table class="tot" style="margin-top:6px;width:280px;margin-left:auto">${vatRow}<tr><td class="k">Total</td><td class="r">${formatNgn(total)}</td></tr>${paid ? `<tr><td class="k">Paid</td><td class="r">− ${formatNgn(paid)}</td></tr>` : ''}<tr class="due"><td>Left to pay</td><td class="r">${formatNgn(Math.max(0, balance))}</td></tr></table>
${inv.note ? `<div class="box" style="margin-top:22px"><h3>Payment terms</h3><div style="white-space:pre-line">${esc(inv.note)}</div></div>` : ''}
${pays ? `<table><tr><th>Payment</th><th>Date</th><th class="r">Amount</th></tr>${pays}</table>` : ''}
${open ? `<div class="grid">
<div class="box"><h3>Pay online</h3><div style="word-break:break-all">${esc(o.payUrl)}</div><div class="m">Card or bank transfer. Your receipt is kept automatically.</div></div>
<div class="box"><h3>Or pay by transfer</h3>${o.bank ? `<strong>${esc(o.bank.accountName)}</strong><div>${esc(o.bank.bankName)} · ••••${esc(o.bank.last4)}</div><div class="m">Use <strong>${esc(inv.number)}</strong> as the narration, then send your receipt on WhatsApp.</div>` : `<div class="m">Ask ${esc(o.business)} for their account details.</div>`}</div>
</div>` : ''}
<p class="foot">Made with KUBICU · prototype — test mode. Amounts in ${esc(currencyInfo(activeCurrency()).name)}.</p>
<script>window.onload=function(){setTimeout(function(){window.print()},250)}</script></body></html>`);
  w.document.close();
  return true;
}
