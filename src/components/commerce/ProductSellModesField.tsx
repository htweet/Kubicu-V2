import React from 'react';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import type { BulkPrice, Product } from '../../types/commerce';
import { Switch } from '../ui/Switch';
import { TextInput } from '../ui/TextInput';
import { SelectInput } from '../ui/SelectInput';
import { CurrencyInput } from '../ui/CurrencyInput';
import { Button } from '../ui/Button';
import { InlineAlert } from '../ui/InlineAlert';
import { MAX_BULK_LEVELS, bulkIssues } from '../../utils/commerce/sellModes';
import { depositPctOptions } from '../../utils/commerce/deposit';
import { formatNgn } from '../../utils/format';

interface ProductSellModesFieldProps {
  product: Product;
  onChange: (patch: Partial<Product>) => void;
  /** Sales members can't change prices (D57). */
  pricesLocked: boolean;
  showErrors: boolean;
}

const inDays = (n: number) => {
  const d = new Date(Date.now() + n * 86400000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Pre-order and bulk price settings on a physical product (D202). */
export function ProductSellModesField({ product, onChange, pricesLocked, showErrors }: ProductSellModesFieldProps) {
  const pre = product.preorder;
  const levels = product.bulkPrices ?? [];
  const issue = bulkIssues(product);
  const setLevel = (i: number, patch: Partial<BulkPrice>) => onChange({ bulkPrices: levels.map((l, n) => n === i ? { ...l, ...patch } : l) });
  const dateError = showErrors && pre && (!pre.shipsBy || pre.shipsBy < inDays(0)) ? 'Choose a date from today onwards' : undefined;

  return (
    <>
      <div className="flex flex-col gap-4 border-t border-border pt-4">
        <Switch
          id="prd-pre"
          label="Take pre-orders"
          description="Sell before stock arrives. Stock isn’t needed or reduced; buyers see the date you expect it and the order says “Pre-order”."
          checked={!!pre}
          disabled={!!product.madeToOrder}
          onChange={(on) => onChange({ preorder: on ? { shipsBy: inDays(21), limit: null, depositPct: null, taken: product.preorder?.taken ?? 0 } : undefined })} />
        
        {product.madeToOrder && <p className="text-caption text-fg-muted">Turn off “Made to order” to take pre-orders instead.</p>}
        {pre &&
        <div className="grid gap-4 sm:grid-cols-3">
            <TextInput id="prd-pre-date" type="date" label="Expected by" value={pre.shipsBy} min={inDays(0)} error={dateError} onChange={(e) => onChange({ preorder: { ...pre, shipsBy: e.target.value } })} />
            <TextInput
            id="prd-pre-limit"
            label="Most pre-orders"
            optional
            inputMode="numeric"
            placeholder="No limit"
            value={pre.limit === null ? '' : String(pre.limit)}
            hint={pre.taken ? `${pre.taken} taken so far` : undefined}
            onChange={(e) => {
              const v = e.target.value.replace(/[^0-9]/g, '').slice(0, 5);
              onChange({ preorder: { ...pre, limit: v === '' ? null : Math.max(pre.taken, Number(v)) } });
            }} />
          
            <SelectInput
            id="prd-pre-pay"
            label="Paid at checkout"
            value={pre.depositPct === null ? 'full' : String(pre.depositPct)}
            onChange={(v) => onChange({ preorder: { ...pre, depositPct: v === 'full' ? null : Number(v) } })}
            options={[{ value: 'full', label: 'Full price' }, ...depositPctOptions.map((p) => ({ value: String(p), label: `${p}% now, rest before sending` }))]} />
          
          </div>
        }
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-4">
        <div>
          <p className="text-label font-medium text-fg">Bulk prices</p>
          <p className="text-caption text-fg-muted">A lower price per item from a quantity, e.g. 6+ at a better price. Applied in the cart, counting every option of this product together. Up to {MAX_BULK_LEVELS} levels.</p>
        </div>
        {levels.length > 0 &&
        <ul className="flex flex-col gap-2">
            {levels.map((l, i) =>
          <li key={i} className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 border-b border-border pb-3 last:border-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] sm:border-0 sm:pb-0">
                <TextInput id={`prd-bulk-q-${i}`} label={`From (items) · level ${i + 1}`} inputMode="numeric" value={l.minQty ? String(l.minQty) : ''} disabled={pricesLocked} onChange={(e) => setLevel(i, { minQty: Number(e.target.value.replace(/[^0-9]/g, '').slice(0, 4) || '0') })} />
                <div className="order-3 col-span-2 sm:order-none sm:col-span-1">
                  <CurrencyInput id={`prd-bulk-p-${i}`} label="Price each" value={l.priceNgn || null} disabled={pricesLocked} onChange={(v) => setLevel(i, { priceNgn: v ?? 0 })} />
                </div>
                <Button variant="tertiary" size="md" aria-label={`Remove level ${i + 1}`} disabled={pricesLocked} onClick={() => onChange({ bulkPrices: levels.filter((_, n) => n !== i) })}>
                  <Trash2Icon size={15} aria-hidden />
                </Button>
              </li>
          )}
          </ul>
        }
        {issue && (showErrors || levels.every((l) => l.minQty && l.priceNgn)) &&
        <InlineAlert tone="warning" title="Check your bulk prices">
            {issue}
          </InlineAlert>
        }
        {!issue && levels.length > 0 && product.priceNgn !== null &&
        <p className="text-caption text-fg-subtle">
            Buyers see: {[`1+ at ${formatNgn(product.priceNgn)}`, ...[...levels].sort((a, b) => a.minQty - b.minQty).map((l) => `${l.minQty}+ at ${formatNgn(l.priceNgn)}`)].join(' · ')}
          </p>
        }
        {levels.length < MAX_BULK_LEVELS &&
        <Button
          variant="secondary"
          size="sm"
          className="self-start"
          leadingIcon={PlusIcon}
          disabled={pricesLocked}
          title={pricesLocked ? 'Only Owners, Admins and Editors can change prices' : undefined}
          onClick={() => {
            const last = [...levels].sort((a, b) => a.minQty - b.minQty).pop();
            onChange({ bulkPrices: [...levels, { minQty: last ? last.minQty * 2 : 6, priceNgn: 0 }] });
          }}>
          
            Add a bulk price
          </Button>
        }
      </div>
    </>);

}