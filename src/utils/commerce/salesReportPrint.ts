import { formatNgn } from '../format';
import { incomeLabels, methodLabels, type IncomeType, type MethodId, type Summary } from './salesReport';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export interface PrintableReport {
  business: string;
  rangeText: string;
  spaceText: string;
  summary: Summary;
  income: {id: IncomeType;amount: number;count: number;}[];
  methods: {id: MethodId;amount: number;count: number;}[];
  products: {name: string;qty: number;revenue: number;}[];
  vat: {total: number;count: number;} | null;
  sample: boolean;
}

/** Opens a print window with a one-page summary; the browser saves it as PDF (D227). Returns false if pop-ups are blocked. */
export function printSalesSummary(r: PrintableReport): boolean {
  const w = window.open('', '_blank', 'width=820,height=960');
  if (!w) return false;
  const row = (a: string, b: string, cls = '') => `<tr class="${cls}"><td>${esc(a)}</td><td class="r">${esc(b)}</td></tr>`;
  const s = r.summary;
  w.document.write(`<!doctype html><html><head><title>Sales summary — ${esc(r.business)}</title><style>
body{font-family:Inter,Arial,sans-serif;color:#111;margin:40px;font-size:13px}
h1{font-size:22px;margin:0 0 4px}h2{font-size:14px;margin:28px 0 6px}.muted{color:#555}
table{width:100%;border-collapse:collapse}td{padding:6px 0;border-bottom:1px solid #e5e5e5}.r{text-align:right;font-variant-numeric:tabular-nums}
.big{font-size:30px;font-weight:600;margin:16px 0 0}.tot td{font-weight:600;border-bottom:0}
@page{size:A4;margin:16mm}
</style></head><body>
<h1>Sales summary</h1><p class="muted">${esc(r.business)} · ${esc(r.rangeText)} · ${esc(r.spaceText)}</p>
<p class="big">${formatNgn(s.received)}</p><p class="muted">You receive, after fees and refunds</p>
<table>${row('Customers paid', formatNgn(s.paid))}${row('Fees', `−${formatNgn(s.fees)}`)}${row('Refunds', `−${formatNgn(s.refunded)}`)}${row('You receive', formatNgn(s.received), 'tot')}</table>
<h2>Shop</h2><table>${row('Paid orders', String(s.orders))}${row('Average order', formatNgn(s.aov))}${row('New customers', `${s.newCustomers} · ${formatNgn(s.newRevenue)}`)}${row('Returning customers', `${s.returningCustomers} · ${formatNgn(s.returningRevenue)}`)}</table>
<h2>Where money came from</h2><table>${r.income.map((i) => row(`${incomeLabels[i.id].label} (${i.count})`, formatNgn(i.amount))).join('') || row('No income in this period', '—')}</table>
<h2>Payment methods</h2><table>${r.methods.map((m) => row(`${methodLabels[m.id]} (${m.count})`, formatNgn(m.amount))).join('') || row('None', '—')}</table>
<h2>Top products</h2><table>${r.products.slice(0, 10).map((p) => row(`${p.name} × ${p.qty}`, formatNgn(p.revenue))).join('') || row('No product sales', '—')}</table>
${r.vat ? `<h2>VAT</h2><table>${row(`VAT collected on ${r.vat.count} sale${r.vat.count === 1 ? '' : 's'}`, formatNgn(r.vat.total))}</table><p class="muted">For your records — check with your accountant before filing.</p>` : ''}
<p class="muted" style="margin-top:28px">Test mode — no real money moved.${r.sample ? ' Includes sample data.' : ''} Generated ${esc(new Date().toLocaleString())}.</p>
<script>window.onload=function(){setTimeout(function(){window.print()},200)}</script></body></html>`);
  w.document.close();
  return true;
}