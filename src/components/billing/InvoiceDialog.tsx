import React from 'react';
import { toast } from 'sonner';
import { PrinterIcon } from 'lucide-react';
import type { Invoice } from '../../types/billing';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { billingCountryFor } from '../../data/billingCountries';
import { formatDate } from '../../utils/billing';
import { formatMoney, formatNairaAt } from '../../utils/currency';
import { invoiceMoney, invoiceTotals, rateLine } from '../../utils/billingMoney';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Printable invoice with a tax line and a test-mode watermark (D65). Outside Nigeria it's in the workspace country's
 * currency at the rate of the day it was made, shows the naira list price and that rate, and names the local
 * KUBICU entity (D432).
 */
export function InvoiceDialog({ invoice, onClose }: { invoice: Invoice | null; onClose: () => void }) {
  const { current } = useWorkspace();

  if (!invoice) return <Dialog open={false} onClose={onClose} title="Invoice">{null}</Dialog>;

  const money = (n: number) => (n < 0 ? `−${invoiceMoney(invoice, -n)}` : invoiceMoney(invoice, n));
  const totals = invoiceTotals(invoice);
  const fmt = (n: number) => formatMoney(n, totals.code);
  const entity = billingCountryFor(totals.code).entity;
  const fxNote = invoice.fx ? `Price list ${formatNairaAt(invoice.subtotalNgn, 'NGN')} · converted at ${rateLine(invoice.fx.currency, invoice.fx.rate)} on ${formatDate(invoice.fx.date)}` : null;

  const print = () => {
    const w = window.open('', '_blank', 'width=800,height=900');
    if (!w) {
      toast.error('Your browser blocked the print window', { description: 'Allow pop-ups for KUBICU and try again.' });
      return;
    }
    const rows = invoice.lines.map((l) => `<tr><td>${esc(l.label)}</td><td class="r">${money(l.amountNgn)}</td></tr>`).join('');
    w.document.write(`<!doctype html><html><head><title>Invoice ${invoice.number}</title><style>
body{font-family:Inter,Arial,sans-serif;color:#111;margin:40px;position:relative}
h1{font-size:22px;margin:0 0 4px}.muted{color:#555;font-size:13px}
table{width:100%;border-collapse:collapse;margin-top:24px;font-size:14px}td{padding:8px 0;border-bottom:1px solid #ddd}.r{text-align:right}
.tot td{border:0;font-weight:600}.wm{position:fixed;top:40%;left:0;right:0;text-align:center;font-size:96px;color:rgba(200,0,0,.08);transform:rotate(-20deg);font-weight:800}
.grid{display:flex;justify-content:space-between;gap:24px;margin-top:24px;font-size:13px}
</style></head><body><div class="wm">TEST MODE</div>
<h1>Invoice ${invoice.number}</h1><p class="muted">Issued ${formatDate(invoice.issuedAt)} · ${invoice.status.toUpperCase()}</p>
<div class="grid"><div><strong>From</strong><br/>${esc(entity.name)}<br/>${esc(entity.address)}<br/>${esc(entity.taxId)}</div>
<div><strong>Bill to</strong><br/>${esc(current.name)}<br/>Owner: ${esc(current.ownerName)}</div></div>
<table>${rows}<tr><td>Subtotal</td><td class="r">${fmt(totals.subtotal)}</td></tr><tr><td>${esc(totals.taxLabel)}</td><td class="r">${fmt(totals.tax)}</td></tr><tr class="tot"><td>Total</td><td class="r">${fmt(totals.total)}</td></tr></table>
${fxNote ? `<p class="muted">${esc(fxNote)}</p>` : ''}
<p class="muted">${invoice.paidWith ? esc(invoice.paidWith) : invoice.cardLast4 ? `Card •••• ${invoice.cardLast4}` : 'No card'}${invoice.note ? ` · ${esc(invoice.note)}` : ''}</p>
<p class="muted">Prototype invoice — not a tax document. No real payment was taken.</p>
<script>window.onload=function(){setTimeout(function(){window.print()},200)}</script></body></html>`);
    w.document.close();
  };

  return (
    <Dialog
      open={!!invoice}
      onClose={onClose}
      title={`Invoice ${invoice.number}`}
      description={`Issued ${formatDate(invoice.issuedAt)}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button leadingIcon={PrinterIcon} onClick={print}>
            Print or save PDF
          </Button>
        </>
      }
    >
      <div className="relative flex flex-col gap-4 overflow-hidden">
        <span aria-hidden className="pointer-events-none absolute inset-x-0 top-1/3 -rotate-12 select-none text-center font-display text-[56px] font-bold text-danger opacity-[0.07]">
          TEST MODE
        </span>
        <div className="flex flex-wrap items-start justify-between gap-4 text-caption">
          <div>
            <p className="font-semibold text-fg">{entity.name}</p>
            <p className="text-fg-muted">{entity.address}</p>
            <p className="text-fg-muted">{entity.taxId}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-fg">Bill to {current.name}</p>
            <p className="text-fg-muted">Owner: {current.ownerName}</p>
            <div className="mt-1">
              <InvoiceStatusBadge status={invoice.status} />
            </div>
          </div>
        </div>
        <dl className="flex flex-col gap-2 border-t border-line pt-3 text-label">
          {invoice.lines.map((l) => (
            <div key={l.label} className="flex justify-between gap-4">
              <dt className="text-fg-muted">{l.label}</dt>
              <dd className="shrink-0 tabular-nums text-fg">{money(l.amountNgn)}</dd>
            </div>
          ))}
          <div className="flex justify-between gap-4 border-t border-line pt-2">
            <dt className="text-fg-muted">Subtotal</dt>
            <dd className="tabular-nums text-fg">{fmt(totals.subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-fg-muted">{totals.taxLabel}</dt>
            <dd className="tabular-nums text-fg">{fmt(totals.tax)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="font-semibold text-fg">Total</dt>
            <dd className="font-display text-heading font-semibold tabular-nums text-fg">{fmt(totals.total)}</dd>
          </div>
        </dl>
        {fxNote && <p className="text-caption text-fg-muted">{fxNote}. The amount was fixed when this invoice was made.</p>}
        <p className="text-caption text-fg-subtle">
          {invoice.paidWith ? invoice.paidWith : invoice.cardLast4 ? `Card •••• ${invoice.cardLast4}` : 'No card on file'}
          {invoice.note ? ` · ${invoice.note}` : ''}
          {invoice.sample ? ' · Sample' : ''}
        </p>
      </div>
    </Dialog>
  );
}
