import React, { useState } from 'react';
import { MinusIcon, PlusIcon, XIcon } from 'lucide-react';
import type { Product, ProductOption } from '../../types/commerce';
import { regenerateVariants, variantLabel } from '../../utils/commerce/catalog';
import { uid } from '../../utils/id';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { TextInput } from '../ui/TextInput';
import { fieldControlClass } from '../ui/Field';
import { cn } from '../../utils/cn';

interface VariantsFieldProps {
  product: Product;
  onChange: (patch: Partial<Product>) => void;
}

const grouped = new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 });

/** Options (e.g. Size, Colour) generate a variant per combination, each with its own SKU, price and stock. */
export function VariantsField({ product, onChange }: VariantsFieldProps) {
  const [valueDrafts, setValueDrafts] = useState<Record<string, string>>({});

  const setOptions = (options: ProductOption[]) => {
    const variants = regenerateVariants({ ...product, options });
    onChange({ options, variants: variants.length ? variants : product.variants.slice(0, 1).map((v) => ({ ...v, options: {} })) });
  };

  const addValue = (opt: ProductOption) => {
    const raw = (valueDrafts[opt.id] ?? '').split(',').map((v) => v.trim()).filter(Boolean);
    if (!raw.length) return;
    const values = Array.from(new Set([...opt.values, ...raw])).slice(0, 12);
    setOptions(product.options.map((o) => o.id === opt.id ? { ...o, values } : o));
    setValueDrafts((d) => ({ ...d, [opt.id]: '' }));
  };

  const updateVariant = (id: string, patch: {sku?: string;priceNgn?: number | null;stock?: number;}) =>
  onChange({ variants: product.variants.map((v) => v.id === id ? { ...v, ...patch } : v) });

  const hasOptions = product.options.length > 0;

  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="mb-1 text-label font-medium text-fg">Options and stock</legend>

      {product.options.map((opt) =>
      <div key={opt.id} className="rounded-md border border-line p-3">
          <div className="flex items-end gap-2">
            <TextInput
            id={`opt-name-${opt.id}`}
            label="Option"
            placeholder="e.g. Size"
            value={opt.name}
            fieldClassName="flex-1"
            onChange={(e) => {
              const name = e.target.value;
              const options = product.options.map((o) => o.id === opt.id ? { ...o, name } : o);
              onChange({ options });
            }}
            onBlur={() => setOptions(product.options)} />
          
            <IconButton icon={XIcon} label={`Remove ${opt.name || 'option'}`} onClick={() => setOptions(product.options.filter((o) => o.id !== opt.id))} />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {opt.values.map((v) =>
          <span key={v} className="inline-flex h-7 items-center gap-1 rounded-full bg-sunken pl-2.5 pr-1 text-caption font-medium text-fg">
                {v}
                <button
              type="button"
              aria-label={`Remove ${v}`}
              onClick={() => setOptions(product.options.map((o) => o.id === opt.id ? { ...o, values: o.values.filter((x) => x !== v) } : o))}
              className="flex h-5 w-5 items-center justify-center rounded-full text-fg-subtle hover:bg-raised hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
              
                  <XIcon size={11} aria-hidden />
                </button>
              </span>
          )}
          </div>
          <div className="mt-2 flex gap-2">
            <label htmlFor={`opt-val-${opt.id}`} className="sr-only">
              Add values to {opt.name || 'option'}
            </label>
            <input
            id={`opt-val-${opt.id}`}
            value={valueDrafts[opt.id] ?? ''}
            placeholder="Add values, separated by commas"
            onChange={(e) => setValueDrafts((d) => ({ ...d, [opt.id]: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addValue(opt);
              }
            }}
            className={cn(fieldControlClass, 'h-9 text-label')} />
          
            <Button size="sm" variant="secondary" className="h-9" onClick={() => addValue(opt)}>
              Add
            </Button>
          </div>
        </div>
      )}

      {product.options.length < 2 &&
      <Button
        variant="secondary"
        size="sm"
        leadingIcon={PlusIcon}
        className="self-start"
        onClick={() => onChange({ options: [...product.options, { id: uid('opt'), name: product.options.length ? 'Colour' : 'Size', values: [] }] })}>
        
          {hasOptions ? 'Add another option' : 'Add options like size or colour'}
        </Button>
      }

      <div className="overflow-x-auto rounded-md border border-line">
        <table className="block w-full text-left md:table">
          <caption className="sr-only">Variants</caption>
          <thead className="hidden bg-sunken md:table-header-group">
            <tr className="text-caption font-semibold text-fg-muted">
              <th scope="col" className="px-3 py-2">{hasOptions ? 'Variant' : 'Item'}</th>
              <th scope="col" className="px-3 py-2">SKU</th>
              <th scope="col" className="px-3 py-2">Price</th>
              {product.trackStock &&
              <th scope="col" className="px-3 py-2 text-right">
                  Stock
                </th>
              }
            </tr>
          </thead>
          <tbody className="block divide-y divide-line md:table-row-group md:divide-y-0">
            {product.variants.map((v) =>
            // Phones: each variant stacks with visible field labels and a stock stepper.
            <tr key={v.id} className="grid grid-cols-2 gap-x-3 gap-y-2 p-3 md:table-row md:border-t md:border-line md:p-0">
                <th scope="row" className="col-span-2 block whitespace-nowrap text-label font-semibold text-fg md:table-cell md:px-3 md:py-2 md:font-medium">
                  {hasOptions ? variantLabel(v) : 'Default'}
                </th>
                <td className="block md:table-cell md:px-3 md:py-1.5">
                  <span aria-hidden className="mb-1 block text-caption text-fg-subtle md:hidden">SKU</span>
                  <input aria-label={`SKU for ${variantLabel(v)}`} value={v.sku} onChange={(e) => updateVariant(v.id, { sku: e.target.value.toUpperCase() })} className={cn(fieldControlClass, 'h-11 w-full font-mono text-caption md:h-8 md:w-32')} />
                </td>
                <td className="block md:table-cell md:px-3 md:py-1.5">
                  <span aria-hidden className="mb-1 block text-caption text-fg-subtle md:hidden">Price</span>
                  <div className="relative w-full md:w-28">
                    <span aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-caption text-fg-subtle">₦</span>
                    <input
                    aria-label={`Price for ${variantLabel(v)}`}
                    inputMode="numeric"
                    value={v.priceNgn === null ? '' : grouped.format(v.priceNgn)}
                    placeholder={product.priceNgn === null ? '—' : grouped.format(product.priceNgn)}
                    onChange={(e) => {
                      const d = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                      updateVariant(v.id, { priceNgn: d === '' ? null : Number(d) });
                    }}
                    className={cn(fieldControlClass, 'h-11 pl-6 text-caption tabular-nums md:h-8')} />
                  
                  </div>
                </td>
                {product.trackStock &&
              <td className="col-span-2 flex items-center justify-between gap-3 md:table-cell md:px-3 md:py-1.5 md:text-right">
                    <span aria-hidden className="text-caption text-fg-subtle md:hidden">Stock</span>
                    <div className="flex items-center gap-1 md:block">
                      <button type="button" aria-label={`One less ${variantLabel(v)}`} disabled={v.stock <= 0} onClick={() => updateVariant(v.id, { stock: Math.max(0, v.stock - 1) })} className="flex h-11 w-11 items-center justify-center rounded-md border border-line-strong text-fg disabled:opacity-40 md:hidden">
                        <MinusIcon size={16} aria-hidden />
                      </button>
                      <input
                    aria-label={`Stock for ${variantLabel(v)}`}
                    inputMode="numeric"
                    value={String(v.stock)}
                    onChange={(e) => updateVariant(v.id, { stock: Number(e.target.value.replace(/[^0-9]/g, '').slice(0, 6) || '0') })}
                    className={cn(fieldControlClass, 'h-11 w-20 text-center text-caption tabular-nums md:ml-auto md:h-8 md:text-right', v.stock === 0 && 'text-danger')} />
                  
                      <button type="button" aria-label={`One more ${variantLabel(v)}`} onClick={() => updateVariant(v.id, { stock: v.stock + 1 })} className="flex h-11 w-11 items-center justify-center rounded-md border border-line-strong text-fg md:hidden">
                        <PlusIcon size={16} aria-hidden />
                      </button>
                    </div>
                  </td>
              }
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {hasOptions && <p className="-mt-2 text-caption text-fg-subtle">Leave a variant’s price blank to use the main price.</p>}
    </fieldset>);

}