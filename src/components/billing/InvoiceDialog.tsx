import React from 'react';
import { toast } from 'sonner';
import { PrinterIcon } from 'lucide-react';
import type { Invoice } from '../../types/billing';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { kubicuBillingEntity } from '../../data/billing';
import { formatDate } from '../../utils/billing';
import { formatNgn } from '../../utils/format';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const money = (n: number) => n < 0 ? `−${formatNgn(-n)}` : formatNgn(n);

/** Printable invoice with VAT line and a test-mode watermark (D65). */
export function InvoiceDialog({ invoice, onClose }: {invoice: Invoice | null;onClose: () => void;}) {
  const { current } = useWorkspace();

  const print = () => {
    if (!invoice) return;
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
<div class="grid"><div><strong>From</strong><br/>${esc(kubicuBillingEntity.name)}<br/>${esc(kubicuBillingEntity.address)}<br/>${esc(kubicuBillingEntity.taxId)}</div>
<div><strong>Bill to</strong><br/>${esc(current.name)}<br/>Owner: ${esc(current.ownerName)}</div></div>
<table>${rows}<tr><td>Subtotal</td><td class="r">${formatNgn(invoice.subtotalNgn)}</td></tr><tr><td>VAT 7.5% (example)</td><td class="r">${formatNgn(invoice.vatNgn)}</td></tr><tr class="tot"><td>Total</td><td class="r">${formatNgn(invoice.totalNgn)}</td></tr></table>
<p class="muted">${invoice.cardLast4 ? `Card •••• ${invoice.cardLast4}` : 'No card'}${invoice.note ? ` · ${esc(invoice.note)}` : ''}</p>
<p class="muted">Prototype invoice — not a tax document. No real payment was taken.</p>
<script>window.onload=function(){setTimeout(function(){window.print()},200)}</script></body></html>`);
    w.document.close();
  };

  return (
    <Dialog
      open={!!invoice}
      onClose={onClose}
      title={invoice ? `Invoice ${invoice.number}` : 'Invoice'}
      description={invoice ? `Issued ${formatDate(invoice.issuedAt)}` : undefined}
      footer={
      <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button leadingIcon={PrinterIcon} onClick={print}>
            Print or save PDF
          </Button>
        </>
      }>
      
      {invoice &&
      <div className="relative flex flex-col gap-4 overflow-hidden">
          <span aria-hidden className="pointer-events-none absolute inset-x-0 top-1/3 -rotate-12 select-none text-center font-display text-[56px] font-bold text-danger opacity-[0.07]">
            TEST MODE
          </span>
          <div className="flex flex-wrap items-start justify-between gap-4 text-caption">
            <div>
              <p className="font-semibold text-fg">{kubicuBillingEntity.name}</p>
              <p className="text-fg-muted">{kubicuBillingEntity.address}</p>
              <p className="text-fg-muted">{kubicuBillingEntity.taxId}</p>
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
            {invoice.lines.map((l) =>
          <div key={l.label} className="flex justify-between gap-4">
                <dt className="text-fg-muted">{l.label}</dt>
                <dd className="shrink-0 tabular-nums text-fg">{money(l.amountNgn)}</dd>
              </div>
          )}
            <div className="flex justify-between gap-4 border-t border-line pt-2">
              <dt className="text-fg-muted">Subtotal</dt>
              <dd className="tabular-nums text-fg">{formatNgn(invoice.subtotalNgn)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-fg-muted">VAT 7.5% (example)</dt>
              <dd className="tabular-nums text-fg">{formatNgn(invoice.vatNgn)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="font-semibold text-fg">Total</dt>
              <dd className="font-display text-heading font-semibold tabular-nums text-fg">{formatNgn(invoice.totalNgn)}</dd>
            </div>
          </dl>
          <p className="text-caption text-fg-subtle">
            {invoice.cardLast4 ? `Card •••• ${invoice.cardLast4}` : 'No card on file'}
            {invoice.note ? ` · ${invoice.note}` : ''}
            {invoice.sample ? ' · Sample' : ''}
          </p>
        </div>
      }
    </Dialog>);

}