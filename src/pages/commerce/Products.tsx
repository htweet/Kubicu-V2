import React, { useMemo, useState } from 'react';
import { MediaImage } from '../../components/media/MediaImage';
import { useSearchParams } from 'react-router-dom';
import { FolderIcon, PlusIcon, ShoppingBagIcon, UploadIcon } from 'lucide-react';
import type { Product } from '../../types/commerce';
import { useCommerce } from '../../contexts/CommerceContext';
import { usePlan } from '../../contexts/PlanContext';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { Segmented } from '../../components/ui/Segmented';
import { SelectInput } from '../../components/ui/SelectInput';
import { DataTable, type DataColumn } from '../../components/ui/DataTable';
import { EmptyState } from '../../components/ui/EmptyState';
import { InlineAlert } from '../../components/ui/InlineAlert';
import { UpgradeButton } from '../../components/ui/UpgradeButton';
import { ProductEditor } from '../../components/commerce/ProductEditor';
import { CollectionsSheet } from '../../components/commerce/CollectionsSheet';
import { ImportProductsDialog } from '../../components/commerce/ImportProductsDialog';
import { ProductStatusBadge, SampleTag } from '../../components/commerce/StatusBadges';
import { displayStatus, priceRange, totalStock } from '../../utils/commerce/catalog';
import { productLimit, productsRemaining } from '../../utils/commerce/limits';
import { formatNgn } from '../../utils/format';
import { useT } from '../../contexts/LocaleContext';

type StatusFilter = 'all' | 'active' | 'draft' | 'sold_out' | 'archived';

export function Products() {
  const { data } = useCommerce();
  const plan = usePlan();
  const { t: tr } = useT();
  const [params, setParams] = useSearchParams();
  const [status, setStatus] = useState<StatusFilter>('all');
  const [collection, setCollection] = useState('all');
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const remaining = productsRemaining(data, plan.id);
  const atLimit = remaining !== null && remaining <= 0;
  const editId = params.get('edit');
  const creating = params.get('new') === '1' && !atLimit;
  const editorOpen = creating || !!editId;

  const physical = data.products.filter((p) => p.kind === 'physical');
  const rows = useMemo(
    () =>
    physical.filter((p) => {
      const s = displayStatus(p);
      const statusOk = status === 'all' ? s !== 'archived' : s === status;
      const colOk = collection === 'all' || p.collectionIds.includes(collection);
      return statusOk && colOk;
    }),
    [physical, status, collection]
  );

  const open = (id: string | null) => setParams(id ? { edit: id } : { new: '1' });
  const close = () => setParams({});

  const columns: DataColumn<Product>[] = [
  {
    key: 'name',
    header: 'Product',
    sortValue: (p) => p.name.toLowerCase(),
    render: (p) =>
    <button type="button" onClick={() => open(p.id)} className="group flex items-center gap-3 rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          {p.images[0] ?
      <MediaImage src={p.images[0].url} alt="" className="h-11 w-9 shrink-0 rounded-sm object-cover" /> :

      <span aria-hidden className="flex h-11 w-9 shrink-0 items-center justify-center rounded-sm bg-sunken text-fg-subtle">
              <ShoppingBagIcon size={15} />
            </span>
      }
          <span className="min-w-0">
            <span className="flex items-center gap-2">
              <span className="truncate font-semibold text-fg group-hover:underline">{p.name}</span>
              {p.sample && <SampleTag />}
            </span>
            <span className="block text-caption text-fg-subtle">{p.variants.length > 1 ? tr('{n} variants', { n: p.variants.length }) : p.variants[0]?.sku}</span>
          </span>
        </button>

  },
  { key: 'status', header: 'Status', render: (p) => <ProductStatusBadge product={p} /> },
  {
    key: 'price',
    header: 'Price',
    align: 'right',
    sortValue: (p) => priceRange(p)?.[0] ?? -1,
    render: (p) => {
      const r = priceRange(p);
      return r ? r[0] === r[1] ? formatNgn(r[0]) : `${formatNgn(r[0])}–${formatNgn(r[1])}` : <span className="text-fg-subtle">{tr('On request')}</span>;
    }
  },
  {
    key: 'stock',
    header: 'Stock',
    align: 'right',
    hideOnMobile: true,
    sortValue: (p) => p.trackStock ? totalStock(p) : 99999,
    render: (p) => p.trackStock ? totalStock(p) : <span className="text-fg-subtle">{tr('Not tracked')}</span>
  },
  {
    key: 'collections',
    header: 'Collections',
    hideOnMobile: true,
    render: (p) => <span className="text-fg-muted">{p.collectionIds.map((id) => data.collections.find((c) => c.id === id)?.name).filter(Boolean).join(', ') || '—'}</span>
  }];


  return (
    <>
      <PageHeader
        title="Products"
        description="Physical products, their options and stock. Digital files live under Digital."
        actions={
        <>
            <Button variant="tertiary" leadingIcon={FolderIcon} onClick={() => setCollectionsOpen(true)}>
              Collections
            </Button>
            <Button variant="secondary" leadingIcon={UploadIcon} onClick={() => setImportOpen(true)} disabled={atLimit}>
              Import
            </Button>
            <Button leadingIcon={PlusIcon} onClick={() => open(null)} disabled={atLimit}>
              Add product
            </Button>
          </>
        } />
      

      {remaining !== null &&
      <InlineAlert tone={atLimit ? 'warning' : 'info'} title={atLimit ? tr('You’ve reached {limit} products on {plan}', { limit: productLimit(plan.id) ?? 0, plan: plan.name }) : tr('{n} of {limit} products left on {plan}', { n: remaining, limit: productLimit(plan.id) ?? 0, plan: plan.name })} className="mt-6" action={<UpgradeButton plan="creator" feature="Unlimited products" variant={atLimit ? 'primary' : 'secondary'} />}>
          {atLimit ? 'Archive a product or upgrade to Creator for unlimited products.' : 'Limits are being tested and may change.'}
        </InlineAlert>
      }

      {physical.length === 0 ?
      <EmptyState
        framed
        className="mt-8"
        icon={ShoppingBagIcon}
        title="No products yet"
        description="Add your first product, or import a list from a spreadsheet."
        action={
        <div className="flex flex-wrap justify-center gap-2">
                <Button leadingIcon={PlusIcon} onClick={() => open(null)} disabled={atLimit}>
                  Add product
                </Button>
                <Button variant="secondary" leadingIcon={UploadIcon} onClick={() => setImportOpen(true)} disabled={atLimit}>
                  Import CSV
                </Button>
              </div>
        } /> :


      <>
          <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="scroll-quiet -mx-1 overflow-x-auto px-1 pb-1">
              <Segmented<StatusFilter>
              ariaLabel="Filter by status"
              value={status}
              onChange={setStatus}
              options={[
              { value: 'all', label: 'All' },
              { value: 'active', label: 'Active' },
              { value: 'draft', label: 'Draft' },
              { value: 'sold_out', label: 'Sold out' },
              { value: 'archived', label: 'Archived' }]
              } />
            
            </div>
            {data.collections.length > 0 &&
          <div className="md:w-56">
                <SelectInput id="prd-col-filter" label="Collection" value={collection} onChange={setCollection} options={[{ value: 'all', label: 'All collections' }, ...data.collections.map((c) => ({ value: c.id, label: c.name }))]} />
              </div>
          }
          </div>
          <div className="mt-4">
            <DataTable
            caption="Products"
            rows={rows}
            columns={columns}
            filterText={(p) => `${p.name} ${p.variants.map((v) => v.sku).join(' ')}`}
            filterPlaceholder="Search name or SKU"
            emptyTitle="No products match"
            emptyDescription="Try a different status or collection." />
          
          </div>
        </>
      }

      <ProductEditor open={editorOpen} productId={editId} kind="physical" onClose={close} />
      <CollectionsSheet open={collectionsOpen} onClose={() => setCollectionsOpen(false)} />
      <ImportProductsDialog open={importOpen} onClose={() => setImportOpen(false)} remaining={remaining} />
    </>);

}