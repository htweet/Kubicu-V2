import React, { useState } from 'react';
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, StarIcon, XIcon } from 'lucide-react';
import type { Product } from '../../../types/commerce';
import { MAX_FEATURED } from '../../../utils/commerce/storefront';
import { formatNgn } from '../../../utils/format';
import { IconButton } from '../../ui/IconButton';
import { Button } from '../../ui/Button';
import { MediaImage } from '../../media/MediaImage';
import { announce } from '../../../utils/announce';

interface FeaturedPickerProps {
  products: Product[];
  value: string[];
  disabled?: boolean;
  onChange: (ids: string[]) => void;
}

/** Pin up to 8 products to the top of the shop, in order (D98). */
export function FeaturedPicker({ products, value, disabled, onChange }: FeaturedPickerProps) {
  const [adding, setAdding] = useState(false);
  const byId = new Map(products.map((p) => [p.id, p]));
  const pinned = value.filter((id) => byId.has(id));
  const rest = products.filter((p) => !pinned.includes(p.id));
  const full = pinned.length >= MAX_FEATURED;

  const move = (i: number, dir: -1 | 1) => {
    const next = [...pinned];
    const j = i + dir;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    announce(`Moved ${byId.get(pinned[i])?.name ?? 'product'} ${dir < 0 ? 'up' : 'down'} — ${j + 1} of ${pinned.length}`);
  };

  return (
    <div className="flex flex-col gap-3">
      {pinned.length === 0 ?
      <p className="rounded-md border border-dashed border-line-strong px-4 py-5 text-center text-caption text-fg-muted">No featured products. The shop shows in-stock products first, in the order you added them.</p> :

      <ol className="divide-y divide-line rounded-md border border-line">
          {pinned.map((id, i) => {
          const p = byId.get(id) as Product;
          return (
            <li key={id} className="flex items-center gap-3 px-3 py-2">
                <span className="w-5 shrink-0 text-center text-caption font-semibold tabular-nums text-fg-subtle">{i + 1}</span>
                {p.images[0] ? <MediaImage src={p.images[0].url} alt="" className="h-9 w-9 shrink-0 rounded-sm object-cover" /> : <span className="h-9 w-9 shrink-0 rounded-sm bg-sunken" aria-hidden />}
                <span className="min-w-0 flex-1 truncate text-label text-fg">{p.name}</span>
                <span className="flex shrink-0 items-center">
                  <IconButton size="sm" icon={ArrowUpIcon} label={`Move ${p.name} up`} disabled={disabled || i === 0} onClick={() => move(i, -1)} />
                  <IconButton size="sm" icon={ArrowDownIcon} label={`Move ${p.name} down`} disabled={disabled || i === pinned.length - 1} onClick={() => move(i, 1)} />
                  <IconButton size="sm" icon={XIcon} label={`Remove ${p.name} from featured`} disabled={disabled} onClick={() => onChange(pinned.filter((x) => x !== id))} />
                </span>
              </li>);

        })}
        </ol>
      }

      {adding ?
      <div className="flex flex-col gap-2">
          <ul className="max-h-56 divide-y divide-line overflow-y-auto rounded-md border border-line" aria-label="Products you can feature">
            {rest.length === 0 && <li className="px-3 py-3 text-caption text-fg-muted">Every shop product is already featured.</li>}
            {rest.map((p) =>
          <li key={p.id}>
                <button
              type="button"
              disabled={full}
              onClick={() => {
                onChange([...pinned, p.id]);
                announce(`Featured ${p.name}`);
              }}
              className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-sunken focus-visible:bg-sunken focus-visible:outline-none disabled:opacity-50">
              
                  <StarIcon size={14} aria-hidden className="shrink-0 text-fg-subtle" />
                  <span className="min-w-0 flex-1 truncate text-label text-fg">{p.name}</span>
                  <span className="shrink-0 text-caption tabular-nums text-fg-muted">{p.priceNgn ? formatNgn(p.priceNgn) : '—'}</span>
                </button>
              </li>
          )}
          </ul>
          <Button size="sm" variant="tertiary" className="self-start" onClick={() => setAdding(false)}>
            Done
          </Button>
        </div> :

      <Button size="sm" variant="secondary" leadingIcon={PlusIcon} className="self-start" disabled={disabled || full || products.length === 0} onClick={() => setAdding(true)}>
          {full ? `Up to ${MAX_FEATURED} featured` : 'Feature a product'}
        </Button>
      }
    </div>);

}