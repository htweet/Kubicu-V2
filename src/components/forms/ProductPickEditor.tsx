import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCwIcon } from 'lucide-react';
import type { FormField, FormProductPick } from '../../types/forms';
import type { Product } from '../../types/commerce';
import { useOptionalCommerce } from '../../contexts/CommerceContext';
import { PRODUCT_PICK_MAX } from '../../utils/forms/fields';
import { formatNgn } from '../../utils/format';
import { TextInput } from '../ui/TextInput';
import { Button } from '../ui/Button';
import { InlineAlert } from '../ui/InlineAlert';

interface ProductPickEditorProps {
  field: FormField;
  onChange: (patch: Partial<FormField>) => void;
}

const toPick = (p: Product): FormProductPick => ({ id: p.id, name: p.name, priceNgn: p.priceNgn ?? 0, imageUrl: p.images[0]?.url ?? '', imageAlt: p.images[0]?.alt ?? p.name });

/**
 * Chooses which Commerce products a Product picker offers (D193). Names and prices are copied
 * into the form so it works on public pages; the editor flags copies that have gone out of date.
 */
export function ProductPickEditor({ field, onChange }: ProductPickEditorProps) {
  const commerce = useOptionalCommerce();
  const catalogue = useMemo(() => (commerce?.data.products ?? []).filter((p) => p.status === 'active' && !p.eventId && p.priceNgn !== null && p.priceNgn > 0), [commerce]);
  const chosen = field.products ?? [];
  const chosenIds = new Set(chosen.map((p) => p.id));

  const stale = chosen.filter((c) => {
    const live = commerce?.data.products.find((p) => p.id === c.id);
    return !live || live.status !== 'active' || (live.priceNgn ?? 0) !== c.priceNgn || live.name !== c.name;
  });

  const toggle = (p: Product) => {
    if (chosenIds.has(p.id)) onChange({ products: chosen.filter((c) => c.id !== p.id) });
    else if (chosen.length < PRODUCT_PICK_MAX) onChange({ products: [...chosen, toPick(p)] });
  };

  const refresh = () => {
    const next = chosen
      .map((c) => commerce?.data.products.find((p) => p.id === c.id && p.status === 'active'))
      .filter((p): p is Product => !!p && p.priceNgn !== null && p.priceNgn > 0)
      .map(toPick);
    onChange({ products: next });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-label font-medium text-fg">Products offered</span>
        <span className="text-caption text-fg-subtle">
          {chosen.length} of {PRODUCT_PICK_MAX}
        </span>
      </div>

      {stale.length > 0 && (
        <InlineAlert tone="warning" title={`${stale.length} product${stale.length === 1 ? ' has' : 's have'} changed in Commerce`}>
          <span className="flex flex-col items-start gap-2">
            <span>The form still shows the old name or price{stale.some((s) => !commerce?.data.products.find((p) => p.id === s.id && p.status === 'active')) ? ', or a product that’s no longer for sale' : ''}.</span>
            <Button size="sm" variant="secondary" leadingIcon={RefreshCwIcon} onClick={refresh}>
              Update from Commerce
            </Button>
          </span>
        </InlineAlert>
      )}

      {catalogue.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line px-4 py-6 text-center text-caption text-fg-muted">
          No active products with a price yet.{' '}
          <Link to="/app/commerce/products" className="font-medium text-fg underline underline-offset-2">
            Add one in Commerce
          </Link>
          .
        </p>
      ) : (
        <ul className="flex max-h-72 flex-col divide-y divide-line overflow-y-auto rounded-lg border border-line">
          {catalogue.map((p) => {
            const on = chosenIds.has(p.id);
            const full = !on && chosen.length >= PRODUCT_PICK_MAX;
            return (
              <li key={p.id}>
                <label className={`flex min-h-[52px] items-center gap-3 px-3 py-2 ${full ? 'opacity-50' : 'cursor-pointer hover:bg-sunken'}`}>
                  <input type="checkbox" checked={on} disabled={full} onChange={() => toggle(p)} className="h-4 w-4 shrink-0 accent-[rgb(var(--action))]" />
                  <span className="h-9 w-9 shrink-0 overflow-hidden rounded bg-sunken">{p.images[0] && <img src={p.images[0].url} alt="" className="h-full w-full object-cover" />}</span>
                  <span className="min-w-0 flex-1 truncate text-label text-fg">{p.name}</span>
                  <span className="shrink-0 text-caption tabular-nums text-fg-muted">{formatNgn(p.priceNgn ?? 0)}</span>
                </label>
              </li>
            );
          })}
        </ul>
      )}

      <TextInput
        id={`pp-max-${field.id}`}
        label="Most of each item per person"
        type="number"
        inputMode="numeric"
        min={1}
        max={99}
        value={field.maxQty ?? 10}
        onChange={(e) => onChange({ maxQty: Math.max(1, Math.min(99, Math.round(Number(e.target.value) || 1))) })}
      />
      <p className="text-caption text-fg-muted">
        Picks don’t reserve stock or create an order — they arrive with the response. To take money for them, add a Payment field and set its amount to “From {field.label || 'this field'}”.
      </p>
    </div>
  );
}
