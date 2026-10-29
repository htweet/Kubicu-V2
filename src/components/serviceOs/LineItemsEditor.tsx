import React from 'react';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import type { DocVat, LineItem } from '../../types/serviceOs';
import { blankItem, lineTotal, vatSplit } from '../../utils/serviceOs';
import { vatRateLabel } from '../../utils/commerce/shopSettings';
import { formatNgn } from '../../utils/format';
import { currencySymbol } from '../../utils/currency';
import { fieldControlClass } from '../ui/Field';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { cn } from '../../utils/cn';

interface Props {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  readOnly?: boolean;
  /** Extra rows under the total, e.g. deposit or amount paid. */
  footer?: React.ReactNode;
  /** VAT copied onto the quote or invoice (D257). */
  vat?: DocVat;
}

const grouped = new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 });

/** Priced lines for quotes and invoices: what, how many, price each, line total (D89). */
export function LineItemsEditor({ items, onChange, readOnly, footer, vat }: Props) {
  const split = vatSplit(items, vat);
  const set = (id: string, patch: Partial<LineItem>) => onChange(items.map((i) => i.id === id ? { ...i, ...patch } : i));

  return (
    <div className="flex flex-col">
      <div className="hidden grid-cols-[minmax(0,1fr)_64px_120px_100px_32px] gap-2 border-b border-line pb-2 text-caption font-medium text-fg-subtle sm:grid">
        <span>Item</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Price each</span>
        <span className="text-right">Total</span>
        <span />
      </div>
      <ul className="flex flex-col divide-y divide-line">
        {items.map((item, i) =>
        readOnly ?
        <li key={item.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 py-2.5 sm:grid-cols-[minmax(0,1fr)_64px_120px_100px_32px] sm:gap-2">
              <span className="text-label text-fg">{item.label}</span>
              <span className="hidden text-right text-label tabular-nums text-fg-muted sm:block">{item.qty}</span>
              <span className="hidden text-right text-label tabular-nums text-fg-muted sm:block">{formatNgn(item.unitNgn)}</span>
              <span className="text-right text-label font-medium tabular-nums text-fg">{formatNgn(lineTotal(item))}</span>
              <span className="text-caption text-fg-subtle sm:hidden">
                {item.qty} × {formatNgn(item.unitNgn)}
              </span>
            </li> :

        <li key={item.id} className="grid grid-cols-[minmax(0,1fr)_32px] gap-2 py-2.5 sm:grid-cols-[minmax(0,1fr)_64px_120px_100px_32px] sm:items-center">
              <input aria-label={`Item ${i + 1}`} value={item.label} placeholder="e.g. Bridal makeup with trial" maxLength={80} onChange={(e) => set(item.id, { label: e.target.value })} className={cn(fieldControlClass, 'h-9 text-label')} />
              <IconButton icon={Trash2Icon} label={`Remove item ${i + 1}`} size="sm" disabled={items.length === 1} onClick={() => onChange(items.filter((x) => x.id !== item.id))} className="sm:order-last" />
              <div className="col-span-2 grid grid-cols-3 gap-2 sm:col-span-3 sm:grid-cols-[64px_120px_100px]">
                <input
              aria-label={`Quantity for item ${i + 1}`}
              inputMode="numeric"
              value={item.qty}
              onChange={(e) => set(item.id, { qty: Math.min(999, Number(e.target.value.replace(/[^0-9]/g, '')) || 0) })}
              className={cn(fieldControlClass, 'h-9 text-right text-label tabular-nums')} />
            
                <div className="relative">
                  <span aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-label text-fg-subtle">
                    {currencySymbol()}
                  </span>
                  <input
                aria-label={`Price each for item ${i + 1}`}
                inputMode="numeric"
                value={item.unitNgn ? grouped.format(item.unitNgn) : ''}
                placeholder="0"
                onChange={(e) => set(item.id, { unitNgn: Number(e.target.value.replace(/[^0-9]/g, '').slice(0, 10)) || 0 })}
                className={cn(fieldControlClass, 'h-9 text-right text-label tabular-nums')}
                style={{ paddingLeft: `calc(1rem + ${currencySymbol().length}ch)` }} />
              
                </div>
                <span className="flex h-9 items-center justify-end text-label font-medium tabular-nums text-fg">{formatNgn(lineTotal(item))}</span>
              </div>
            </li>

        )}
      </ul>
      {!readOnly &&
      <Button variant="tertiary" size="sm" leadingIcon={PlusIcon} disabled={items.length >= 20} onClick={() => onChange([...items, blankItem()])} className="mt-1 self-start">
          Add item
        </Button>
      }
      <dl className="mt-3 flex flex-col gap-1.5 border-t border-line pt-3">
        {split.vat > 0 && vat &&
        <>
            {!vat.inclusive && <TotalRow label="Subtotal" value={formatNgn(split.subtotal)} />}
            <TotalRow label={vat.inclusive ? `Includes VAT (${vatRateLabel(vat.ratePct)})` : `VAT (${vatRateLabel(vat.ratePct)})`} value={formatNgn(split.vat)} />
          </>
        }
        <div className="flex items-baseline justify-between">
          <dt className="text-label font-semibold text-fg">Total</dt>
          <dd className="text-heading font-semibold tabular-nums text-fg">{formatNgn(split.total)}</dd>
        </div>
        {footer}
      </dl>
    </div>);

}

export function TotalRow({ label, value, tone = 'muted' }: {label: string;value: string;tone?: 'muted' | 'strong';}) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className={cn('text-label', tone === 'strong' ? 'font-semibold text-fg' : 'text-fg-muted')}>{label}</dt>
      <dd className={cn('text-label tabular-nums', tone === 'strong' ? 'font-semibold text-fg' : 'text-fg-muted')}>{value}</dd>
    </div>);

}