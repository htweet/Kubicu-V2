import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRightIcon, CheckIcon, RefreshCwIcon } from 'lucide-react';
import type { Product } from '../../../types/commerce';
import { useCommerce } from '../../../contexts/CommerceContext';
import { usePlan } from '../../../contexts/PlanContext';
import { useT } from '../../../contexts/LocaleContext';
import { planAtLeast, plans } from '../../../data/plans';
import { CHECKOUT_PLAN } from '../../../utils/commerce/linkIssues';
import { displayStatus, priceRange, totalStock } from '../../../utils/commerce/catalog';
import { formatNgn } from '../../../utils/format';
import { Field } from '../../ui/Field';
import { Segmented } from '../../ui/Segmented';
import { SelectInput } from '../../ui/SelectInput';
import { PlanLock } from '../../ui/PlanLock';
import { cn } from '../../../utils/cn';
import { MediaImage } from '../../media/MediaImage';

type Translate = (text: string, vars?: Record<string, string | number>) => string;
const asIs: Translate = (text, vars) => (vars ? Object.entries(vars).reduce((s, [k, v]) => s.split(`{${k}}`).join(String(v)), text) : text);

interface SourceSwitchProps {
  id: string;
  value: 'manual' | 'catalog';
  onChange: (v: 'manual' | 'catalog') => void;
  /** Short label for "something you already set up in KUBICU", e.g. "My services". Pass English; it's translated here. */
  catalogLabel?: string;
  /** Short label for "details you have elsewhere", e.g. "External link". */
  manualLabel?: string;
  /** One sentence under the switch explaining the chosen option. */
  catalogHint?: string;
  manualHint?: string;
}

/**
 * Where a block's details come from: something already set up in KUBICU (kept in sync), or
 * details the person already has elsewhere and enters here (D38, wording D215).
 */
export function SourceSwitch({
  id,
  value,
  onChange,
  catalogLabel = 'My products',
  manualLabel = 'Enter details',
  catalogHint = 'Pick a product you’ve added in Commerce. Name, price, photo and stock stay in sync.',
  manualHint = 'Not in Commerce? Enter the name, price and photo here, and choose where the button goes.',
}: SourceSwitchProps) {
  const { t: tr } = useT();
  return (
    <Field id={id} label={tr('Use')}>
      <Segmented
        ariaLabel={tr('Where the details come from')}
        fullWidth
        value={value}
        onChange={onChange}
        options={[
          { value: 'catalog', label: tr(catalogLabel) },
          { value: 'manual', label: tr(manualLabel) },
        ]}
      />
      <p className="mt-1.5 text-caption text-fg-muted">{value === 'catalog' ? tr(catalogHint) : tr(manualHint)}</p>
    </Field>
  );
}

export function useCheckoutAllowed() {
  const plan = usePlan();
  return { allowed: planAtLeast(plan.id, CHECKOUT_PLAN), needed: plans[CHECKOUT_PLAN].name };
}

const statusText: Record<ReturnType<typeof displayStatus>, string> = { active: 'Active', draft: 'Draft', archived: 'Archived', sold_out: 'Sold out' };

/** "₦12,000 · 4 in stock · Active". Pass the editor's translator to get it in the screen language. */
export function productSummary(p: Product, tr: Translate = asIs): string {
  const range = priceRange(p);
  const price = range ? (range[0] === range[1] ? formatNgn(range[0]) : `${formatNgn(range[0])}–${formatNgn(range[1])}`) : tr('No price');
  const stock = p.kind === 'digital' ? tr('Digital') : p.trackStock ? tr('{n} in stock', { n: totalStock(p) }) : tr('Not tracked');
  return `${price} · ${stock} · ${tr(statusText[displayStatus(p)])}`;
}

/** Shown under a linked item: what's synced and where to change it. */
export function SyncedNote({ product }: { product: Product }) {
  const { t: tr } = useT();
  return (
    <div className="flex items-start gap-3 rounded-md border border-line bg-sunken px-3 py-2.5">
      <RefreshCwIcon size={15} className="mt-0.5 shrink-0 text-success" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-label font-semibold text-fg">{tr('Synced with Commerce')}</p>
        <p className="text-caption text-fg-muted">
          {productSummary(product, tr)}. {tr('Name, price, photo and stock update here automatically.')}
        </p>
        <Link to={`/app/commerce/products?edit=${product.id}`} className="mt-1 inline-flex items-center gap-1 text-caption font-semibold text-action hover:underline">
          {tr('Edit in Commerce')} <ArrowUpRightIcon size={12} aria-hidden />
        </Link>
      </div>
    </div>
  );
}

export function NoProductsNote({ kind = 'physical' }: { kind?: 'physical' | 'digital' }) {
  const { t: tr } = useT();
  return (
    <div className="rounded-md border border-dashed border-line-strong px-3 py-3">
      <p className="text-label font-semibold text-fg">{kind === 'digital' ? tr('No digital products yet') : tr('No products in Commerce yet')}</p>
      <p className="mt-0.5 text-caption text-fg-muted">{tr('Add one in Commerce, then pick it here.')}</p>
      <Link to={kind === 'digital' ? '/app/commerce/digital?new=1' : '/app/commerce/products?new=1'} className="mt-1.5 inline-flex items-center gap-1 text-caption font-semibold text-action hover:underline">
        {tr('Add a product')} <ArrowUpRightIcon size={12} aria-hidden />
      </Link>
    </div>
  );
}

export function ProductSelect({ id, value, onChange, kind }: { id: string; value: string | undefined; onChange: (id: string) => void; kind: 'physical' | 'digital' }) {
  const { t: tr } = useT();
  const { data } = useCommerce();
  const options = data.products.filter((p) => p.kind === kind && p.status !== 'archived');
  if (options.length === 0) return <NoProductsNote kind={kind} />;
  return (
    <SelectInput
      id={id}
      label={kind === 'digital' ? tr('Digital product') : tr('Product')}
      value={value ?? ''}
      onChange={onChange}
      options={[{ value: '', label: tr('Choose…') }, ...options.map((p) => ({ value: p.id, label: p.status === 'draft' ? `${p.name} (${tr('draft')})` : p.name }))]}
    />
  );
}

/** Multi-select list of products for the grid, keeping the visitor-facing order. */
export function ProductPicker({ selected, onChange }: { selected: string[]; onChange: (ids: string[]) => void }) {
  const { t: tr } = useT();
  const { data } = useCommerce();
  const options = data.products.filter((p) => p.kind === 'physical' && p.status !== 'archived');
  if (options.length === 0) return <NoProductsNote />;
  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter((s) => s !== id) : selected.length >= 12 ? selected : [...selected, id]);
  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="mb-1.5 text-label font-medium text-fg">
        {tr('Products')} <span className="font-normal text-fg-subtle">· {tr('{n} of 12', { n: selected.length })}</span>
      </legend>
      {options.map((p) => {
        const on = selected.includes(p.id);
        return (
          <button
            key={p.id}
            type="button"
            role="checkbox"
            aria-checked={on}
            onClick={() => toggle(p.id)}
            className={cn(
              'flex items-center gap-3 rounded-md border px-2.5 py-2 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
              on ? 'border-select bg-action-soft' : 'border-line hover:bg-sunken',
            )}
          >
            <span className={cn('flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border', on ? 'border-action bg-action text-action-fg' : 'border-line-strong bg-field')}>
              {on && <CheckIcon size={11} strokeWidth={3} aria-hidden />}
            </span>
            {p.images[0] ? <MediaImage src={p.images[0].url} alt="" className="h-8 w-8 shrink-0 rounded-sm object-cover" /> : <span aria-hidden className="h-8 w-8 shrink-0 rounded-sm bg-sunken" />}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-label font-medium text-fg">{p.name}</span>
              <span className="block truncate text-caption text-fg-subtle">{productSummary(p, tr)}</span>
            </span>
            {on && <span className="text-caption font-semibold tabular-nums text-action">{selected.indexOf(p.id) + 1}</span>}
          </button>
        );
      })}
    </fieldset>
  );
}

/** Order-action segmented control that locks Checkout below the required plan. Option labels arrive already translated. */
export function OrderActionField<T extends string>({
  id,
  value,
  onChange,
  options,
}: {
  id: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  const { t: tr } = useT();
  const { allowed, needed } = useCheckoutAllowed();
  const hasCheckout = options.some((o) => o.value === 'checkout');
  return (
    <Field id={id} label={tr('When someone taps the button')} trailing={hasCheckout && !allowed ? <PlanLock kind="plan">{tr('Checkout')} · {needed}</PlanLock> : undefined}>
      <Segmented ariaLabel={tr('Order action')} fullWidth value={value} onChange={onChange} options={options.map((o) => ({ ...o, label: tr(o.label) }))} />
    </Field>
  );
}
