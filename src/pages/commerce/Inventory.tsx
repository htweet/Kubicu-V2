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

interface StockRow {
  id: string;
  product: Product;
  variant: ProductVariant;
}

type View = 'all' | 'low' | 'out';

export function Inventory() {
  const { data } = useCommerce();
  const [params, setParams] = useSearchParams();
  const [view, setView] = useState<View>('all');
  const [adjust, setAdjust] = useState<{product: Product;variantId: string;} | null>(null);
  const productFilter = params.get('product') ?? 'all';

  const tracked = data.products.filter((p) => p.kind === 'physical' && p.trackStock && p.status !== 'archived');
  const rows = useMemo<StockRow[]>(
    () =>
    tracked.
    flatMap((p) => p.variants.map((v) => ({ id: v.id, product: p, variant: v }))).
    filter((r) => productFilter === 'all' ? true : r.product.id === productFilter).
    filter((r) => view === 'out' ? r.variant.stock <= 0 : view === 'low' ? r.variant.stock > 0 && r.variant.stock <= r.product.lowStockAt : true),
    [tracked, view, productFilter]
  );

  const movements = data.movements.filter((m) => productFilter === 'all' || m.productId === productFilter).slice(0, 40);
  const productName = (id: string) => data.products.find((p) => p.id === id)?.name ?? 'Deleted product';
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
            <span className="block text-caption text-fg-subtle">{Object.keys(r.variant.options).length ? variantLabel(r.variant) : 'Single item'}</span>
          </span>
          {r.product.sample && <SampleTag />}
        </span>

  },
  { key: 'sku', header: 'SKU', hideOnMobile: true, render: (r) => <span className="font-mono text-caption text-fg-muted">{r.variant.sku}</span> },
  {
    key: 'stock',
    header: 'On hand',
    align: 'right',
    sortValue: (r) => r.variant.stock,
    render: (r) =>
    <span className={cn('font-semibold', r.variant.stock <= 0 ? 'text-danger' : r.variant.stock <= r.product.lowStockAt ? 'text-warning' : 'text-fg')}>{r.variant.stock}</span>

  },
  {
    key: 'state',
    header: 'Status',
    hideOnMobile: true,
    render: (r) =>
    r.variant.stock <= 0 ? <Badge tone="danger">Out of stock</Badge> : r.variant.stock <= r.product.lowStockAt ? <Badge tone="warning">Low · alert at {r.product.lowStockAt}</Badge> : <Badge tone="success">In stock</Badge>
  },
  {
    key: 'adjust',
    header: '',
    align: 'right',
    render: (r) =>
    <Button size="sm" variant="secondary" onClick={() => setAdjust({ product: r.product, variantId: r.variant.id })}>
          Adjust
        </Button>

  }];


  return (
    <>
      <PageHeader title="Inventory" description="Stock for every variant. Orders reserve stock automatically and cancellations put it back." />

      {tracked.length === 0 ?
      <div className="mt-8 rounded-lg border border-line bg-raised">
          <EmptyState icon={PackageIcon} title="No stock to track yet" description="Products with “Track stock” switched on appear here." action={<Link to="/app/commerce/products?new=1" className="text-label font-semibold text-action hover:underline">Add a product</Link>} />
        </div> :

      <div className="mt-6 grid gap-10 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <section aria-label="Stock levels">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
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
          </section>

          <section aria-labelledby="moves-heading">
            <h2 id="moves-heading" className="text-heading font-semibold text-fg">
              Stock history
            </h2>
            <p className="mt-0.5 text-caption text-fg-subtle">Who changed what, when and why.</p>
            {movements.length === 0 ?
          <p className="mt-4 text-label text-fg-muted">No stock changes yet.</p> :

          <ol className="mt-4 flex flex-col divide-y divide-line border-y border-line">
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
                        {stockReasonLabels[m.reason]}
                        {m.orderNumber ? ` · order #${m.orderNumber}` : ''}
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
              </ol>
          }
          </section>
        </div>
      }

      <AdjustStockDialog product={adjust?.product ?? null} variantId={adjust?.variantId} onClose={() => setAdjust(null)} />
    </>);

}