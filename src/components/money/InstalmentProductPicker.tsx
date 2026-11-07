import React from 'react';
import { Link } from 'react-router-dom';
import { PackageIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '../../types/commerce';
import { useCommerce } from '../../contexts/CommerceContext';
import { useT } from '../../contexts/LocaleContext';
import { upsertProduct } from '../../utils/commerce/ops';
import { INSTALMENT_MIN_NGN } from '../../utils/commerce/payOptions';
import { formatNgn } from '../../utils/format';
import { MediaImage } from '../media/MediaImage';
import { Switch } from '../ui/Switch';

/** Why a product can't be paid in parts, or null when it can. */
function blocker(p: Product): string | null {
  if (p.madeToOrder) return 'Takes a deposit instead (Made to order)';
  if (p.bundle) return `Sold with ${p.bundle.partnerName}`;
  return null;
}

/**
 * Commerce → Payments → Instalments: switch "Pay in instalments" on per product right here,
 * the same setting as Product → Stock & options (D112). Physical, non-archived products only.
 */
export function InstalmentProductPicker({ disabled }: { disabled: boolean }) {
  const { data, apply } = useCommerce();
  const { t: tr } = useT();
  const products = data.products.filter((p) => p.kind === 'physical' && !p.giftCard && p.status !== 'archived');

  if (products.length === 0) {
    return (
      <p className="text-caption text-fg-muted">
        {tr('You have no physical products yet.')}{' '}
        <Link to="/app/commerce/products" className="font-medium text-fg underline underline-offset-2">
          {tr('Add a product')}
        </Link>
      </p>
    );
  }

  const toggle = (p: Product, on: boolean) => {
    const next: Product = { ...p, instalments: on ? p.instalments ?? { parts: 3, every: 'month', ship: 'last' } : undefined, updatedAt: new Date().toISOString() };
    if (apply((d) => upsertProduct(d, next))) toast.success(on ? `${p.name} can be paid in parts` : `${p.name} is pay-in-full only`, { description: on ? '3 monthly parts, sent after the last one. Change this in the product’s Stock & options.' : undefined });
  };

  return (
    <fieldset>
      <legend className="text-label font-medium text-fg">{tr('Products that can be paid in parts')}</legend>
      <ul className="mt-2 max-h-80 divide-y divide-line overflow-y-auto rounded-md border border-line">
        {products.map((p) => {
          const why = blocker(p);
          const low = (p.priceNgn ?? 0) < INSTALMENT_MIN_NGN;
          const img = p.images[0];
          return (
            <li key={p.id} className="flex items-center gap-3 px-3 py-2.5">
              <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-line bg-sunken">
                {img ? <MediaImage src={img.url} alt="" className="h-full w-full object-cover" /> : <PackageIcon size={15} className="text-fg-subtle" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-label font-medium text-fg">
                  {p.name}
                  {p.status === 'draft' && <span className="ml-1.5 text-caption font-normal text-fg-subtle">· {tr('Draft')}</span>}
                </span>
                <span className="block truncate text-caption text-fg-subtle">
                  {why ? tr(why) : p.instalments ? tr('{n} parts, {every}', { n: p.instalments.parts, every: p.instalments.every === 'month' ? tr('monthly') : p.instalments.every === 'week' ? tr('weekly') : tr('every 2 weeks') }) : p.priceNgn !== null ? formatNgn(p.priceNgn) : tr('No price')}
                  {!why && low ? ` · ${tr('counts towards carts of {amount}+', { amount: formatNgn(INSTALMENT_MIN_NGN) })}` : ''}
                </span>
              </span>
              <Switch id={`inst-p-${p.id}`} label={`Pay ${p.name} in instalments`} hideLabel checked={!!p.instalments} disabled={disabled || !!why} onChange={(v) => toggle(p, v)} />
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
