import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowDownRightIcon, ArrowUpRightIcon, PackageIcon } from 'lucide-react';
import type { Product, ProductVariant, StockMovement } from '../../types/commerce';
import { useCommerce } from '../../contexts/CommerceContext';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Segmented } from '../../components/ui/Segmented';
import { SelectInput } from '../../components/ui/SelectInput';
import { DataTable, type DataColumn } from '../../components/ui/DataTable';
import { EmptyState } from '../../components/ui/EmptyState';
import { AdjustStockDialog } from '../../components/commerce/AdjustStockDialog';
import { SampleTag } from '../../components/commerce/StatusBadges';
import { stockReasonLabels } from '../../data/commerceNav';
import { variantLabel } from '../../utils/commerce/catalog';
import { formatTimestamp } from '../../utils/format';
import { cn } from '../../utils/cn';
import { Section } from '../../components/ui/layout/Section';
import { List } from '../../components/ui/layout/ListRow';
import { useT } from '../../contexts/LocaleContext';
import { useTeam } from '../../contexts/TeamContext';
import { MAIN_BRANCH, locationName, stockAt } from '../../utils/commerce/branches';
import { expiryState, formatExpiry } from '../../utils/commerce/batches';
import { InlineAlert } from '../../components/ui/InlineAlert';

interface StockRow {
  id: string;
  product: Product;
  variant: ProductVariant;
}

type View = 'all' | 'low' | 'out';

export function Inventory() {
  const { data } = useCommerce();
  const { t: tr } = useT();
  const [params, setParams] = useSearchParams();
  const [view, setView] = useState<View>('all');
  const [adjust, setAdjust] = useState<{product: Product;variantId: string;mode?: 'damaged';batchId?: string;} | null>(null);
  const productFilter = params.get('product') ?? 'all';
  // A teammate limited to one location sees that location's count only (D475). Adjusting changes the main shop's
  // count, so it's only offered there; stock history covers every location, so it's hidden from branch staff.
  const { myBranchId } = useTeam();
  const qty = (v: ProductVariant) => myBranchId ? stockAt(v, myBranchId) : v.stock;
  const canAdjust = !myBranchId || myBranchId === MAIN_BRANCH;

  const tracked = data.products.filter((p) => p.kind === 'physical' && p.trackStock && p.status !== 'archived');
  const rows = useMemo<StockRow[]>(
    () =>
    tracked.
    flatMap((p) => p.variants.map((v) => ({ id: v.id, product: p, variant: v }))).
    filter((r) => productFilter === 'all' ? true : r.product.id === productFilter).
    filter((r) => view === 'out' ? qty(r.variant) <= 0 : view === 'low' ? qty(r.variant) > 0 && qty(r.variant) <= r.product.lowStockAt : true),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tracked, view, productFilter, myBranchId]
  );

  const allVariants = tracked.flatMap((p) => p.variants.map((v) => ({ p, v })));
  const outCount = allVariants.filter(({ v }) => qty(v) <= 0).length;
  const lowCount = allVariants.filter(({ p, v }) => qty(v) > 0 && qty(v) <= p.lowStockAt).length;
  // Batches and expiry (D476).
  const expiries = new Map(allVariants.map(({ v }) => [v.id, expiryState(v)]));
  const hasBatches = allVariants.some(({ v }) => v.batches?.length);
  const expiredUnits = [...expiries.values()].reduce((s, e) => s + e.expiredQty, 0);
  const soonCount = [...expiries.values()].filter((e) => e.soon).length;
  const movements = data.movements.filter((m) => productFilter === 'all' || m.productId === productFilter).slice(0, 40);
  const productName = (id: string) => data.products.find((p) => p.id === id)?.name ?? tr('Deleted product');
  const variantName = (m: StockMovement) => {
    const v = data.products.find((p) => p.id === m.productId)?.variants.find((x) => x.id === m.variantId);
    return v && Object.keys(v.options).length ? variantLabel(v) : '';
  };

  const columns: DataColumn<StockRow>[] = [
  {
    key: 'product',
    header: 'Item',
    sortValue: (r) => r.product.name.toLowerCase(),
    render: (r) =>
    <span className="flex items-center gap-2">
          <span className="min-w-0">
            <span className="block truncate font-semibold text-fg">{r.product.name}</span>
            <span className="block text-caption text-fg-subtle">{Object.keys(r.variant.options).length ? variantLabel(r.variant) : tr('Single item')}</span>
          </span>
          {r.product.sample && <SampleTag />}
        </span>

  },
  { key: 'sku', header: 'SKU', hideOnMobile: true, render: (r) => <span className="font-mono text-caption text-fg-muted">{r.variant.sku}</span> },
  {
    key: 'stock',
    header: 'On hand',
    align: 'right',
    sortValue: (r) => qty(r.variant),
    render: (r) =>
    <span className={cn('font-semibold', qty(r.variant) <= 0 ? 'text-danger' : qty(r.variant) <= r.product.lowStockAt ? 'text-warning' : 'text-fg')}>{qty(r.variant)}</span>

  },
  {
    key: 'state',
    header: 'Status',
    hideOnMobile: true,
    render: (r) =>
    qty(r.variant) <= 0 ? <Badge tone="danger">Out of stock</Badge> : qty(r.variant) <= r.product.lowStockAt ? <Badge tone="warning">{tr('Low · alert at {n}', { n: r.product.lowStockAt })}</Badge> : <Badge tone="success">In stock</Badge>
  },
  ...(hasBatches ?
  [
  {
    key: 'expiry',
    header: 'Expiry',
    hideOnMobile: true,
    sortValue: (r: StockRow) => expiries.get(r.variant.id)?.next?.expiresOn ?? '9999',
    render: (r: StockRow) => {
      const e = expiries.get(r.variant.id);
      if (!e || !r.variant.batches?.length) return <span className="text-fg-subtle">—</span>;
      return (
        <span className="flex flex-col items-start gap-1">
                  {e.expiredQty > 0 && <Badge tone="danger">{tr('Expired: {n}', { n: e.expiredQty })}</Badge>}
                  {e.soon?.expiresOn ?
          <Badge tone="warning">{tr('Expires {date}', { date: formatExpiry(e.soon.expiresOn) })}</Badge> :
          e.next?.expiresOn ?
          <span className="text-caption text-fg-muted">{tr('Next expiry {date}', { date: formatExpiry(e.next.expiresOn) })}</span> :
          null}
                  <span className="text-caption text-fg-subtle">{tr('Batches: {n}', { n: r.variant.batches.length })}</span>
                </span>);

    }
  } as DataColumn<StockRow>] :

  []),
  {
    key: 'adjust',
    header: '',
    align: 'right',
    render: (r) => {
      const expired = expiries.get(r.variant.id)?.expiredBatches[0];
      return expired && canAdjust ?
      <span className="flex justify-end gap-1.5">
            <Button size="sm" variant="secondary" onClick={() => setAdjust({ product: r.product, variantId: r.variant.id, mode: 'damaged', batchId: expired.id })}>
              {tr('Write off expired')}
            </Button>
            <Button size="sm" variant="tertiary" onClick={() => setAdjust({ product: r.product, variantId: r.variant.id })}>
              Adjust
            </Button>
          </span> :

      <Button size="sm" variant="secondary" disabled={!canAdjust} title={canAdjust ? undefined : tr('Ask the owner to move stock to your location from Branches.')} onClick={() => setAdjust({ product: r.product, variantId: r.variant.id })}>
          Adjust
        </Button>;

    }
  }];


  return (
    <>
      <PageHeader title="Inventory" description="Stock for every variant. Orders reserve stock automatically and cancellations put it back." />
      {myBranchId && <p className="mt-4 text-label text-fg-muted">{tr('Showing {location} only — the location you work at.', { location: locationName(data, myBranchId, tr('Main shop')) })}</p>}
      {(expiredUnits > 0 || soonCount > 0) &&
      <InlineAlert tone={expiredUnits > 0 ? 'danger' : 'warning'} className="mt-6" title={expiredUnits > 0 ? tr('Expired units still counted as stock: {n}', { n: expiredUnits }) : tr('Items with a batch expiring soon: {n}', { n: soonCount })}>
          {expiredUnits > 0 ? tr('Sales never use an expired batch while other stock is left. Write expired units off so your counts are right.') : tr('Sales already use the batch that expires soonest. Consider a discount to sell it in time.')}
        </InlineAlert>
      }

      {tracked.length === 0 ?
      <EmptyState framed className="mt-8" icon={PackageIcon} title="No stock to track yet" description="Products with “Track stock” switched on appear here." action={<Link to="/app/commerce/products?new=1" className="text-label font-semibold text-action hover:underline">{tr('Add a product')}</Link>} /> :

      <div className={cn('mt-8 grid items-start gap-8 xl:gap-10', !myBranchId && 'xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]')}>
          <Section
          id="stock"
          title="Stock levels"
          description={tr('{n} tracked items · {out} out of stock · {low} low', { n: tracked.reduce((s, p) => s + p.variants.length, 0), out: outCount, low: lowCount })}>
          
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <Segmented<View>
              ariaLabel="Filter stock"
              value={view}
              onChange={setView}
              options={[
              { value: 'all', label: 'All' },
              { value: 'low', label: 'Low' },
              { value: 'out', label: 'Out of stock' }]
              } />
            
              <div className="sm:w-56">
                <SelectInput
                id="inv-product"
                label="Product"
                value={productFilter}
                onChange={(v) => setParams(v === 'all' ? {} : { product: v })}
                options={[{ value: 'all', label: 'All products' }, ...tracked.map((p) => ({ value: p.id, label: p.name }))]} />
              
              </div>
            </div>
            <DataTable caption="Stock levels" rows={rows} columns={columns} filterText={(r) => `${r.product.name} ${r.variant.sku}`} filterPlaceholder="Search item or SKU" emptyTitle="Nothing here" emptyDescription="No items match this filter." />
          </Section>

          {!myBranchId &&
        <Section id="moves" title="Stock history" description="Who changed what, when and why.">
            {movements.length === 0 ?
          <p className="text-label text-fg-muted">{tr('No stock changes yet.')}</p> :

          <List ordered ruled label={tr('Stock history')}>
                {movements.map((m) =>
            <li key={m.id} className="flex items-start gap-3 py-3">
                    <span
                aria-hidden
                className={cn('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full', m.delta > 0 ? 'bg-success-soft text-success' : 'bg-sunken text-fg-muted')}>
                
                      {m.delta > 0 ? <ArrowUpRightIcon size={13} strokeWidth={2.5} /> : <ArrowDownRightIcon size={13} strokeWidth={2.5} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-label text-fg">
                        <span className="font-semibold">{productName(m.productId)}</span>
                        {variantName(m) && <span className="text-fg-muted"> · {variantName(m)}</span>}
                      </p>
                      <p className="text-caption text-fg-subtle">
                        {tr(stockReasonLabels[m.reason])}
                        {m.orderNumber ? ` · ${tr('order #{n}', { n: m.orderNumber })}` : ''}
                        {m.note ? ` · ${m.note}` : ''}
                      </p>
                      <p className="text-caption text-fg-subtle">
                        {m.by} · {formatTimestamp(m.at)}
                      </p>
                    </div>
                    <span className="shrink-0 text-right">
                      <span className={cn('block text-label font-semibold tabular-nums', m.delta > 0 ? 'text-success' : 'text-fg')}>
                        {m.delta > 0 ? '+' : '−'}
                        {Math.abs(m.delta)}
                      </span>
                      <span className="block text-caption tabular-nums text-fg-subtle">→ {m.after}</span>
                    </span>
                  </li>
            )}
              </List>
          }
          </Section>
        }
        </div>
      }

      <AdjustStockDialog product={adjust?.product ?? null} variantId={adjust?.variantId} initialMode={adjust?.mode} initialBatchId={adjust?.batchId} onClose={() => setAdjust(null)} />
    </>);

}