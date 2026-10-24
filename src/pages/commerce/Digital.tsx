import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BellIcon, FileIcon, PlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { Order, Product } from '../../types/commerce';
import { useCommerce } from '../../contexts/CommerceContext';
import { usePlan } from '../../contexts/PlanContext';
import { planAtLeast, plans } from '../../data/plans';
import { CHECKOUT_PLAN } from '../../utils/commerce/linkIssues';
import { checkDownload } from '../../utils/commerce/ops';
import { formatBytes, STORAGE_LIMIT_BYTES } from '../../utils/commerce/catalog';
import { formatNgn, formatTimestamp } from '../../utils/format';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { InlineAlert } from '../../components/ui/InlineAlert';
import { UpgradeButton } from '../../components/ui/UpgradeButton';
import { Dialog } from '../../components/ui/Dialog';
import { ProductEditor } from '../../components/commerce/ProductEditor';
import { ProductStatusBadge, SampleTag } from '../../components/commerce/StatusBadges';
import { Card } from '../../components/ui/layout/Card';
import { Section } from '../../components/ui/layout/Section';
import { KeyLookup } from '../../components/commerce/KeyLookup';

const fileBadge = {
  processing: <Badge tone="neutral">Uploading</Badge>,
  scanning: <Badge tone="info">Scanning</Badge>,
  ready: <Badge tone="success">Ready</Badge>,
  failed: <Badge tone="danger">Failed</Badge>
};

const accessCopy = { revoked: 'Revoked (refunded)', limit: 'Limit reached', expired: 'Expired', not_ready: 'File not ready', pending: 'Awaiting payment' } as const;

export function Digital() {
  const { data } = useCommerce();
  const plan = usePlan();
  const [params, setParams] = useSearchParams();
  const [notify, setNotify] = useState<Product | null>(null);
  const allowed = planAtLeast(plan.id, CHECKOUT_PLAN);

  const digital = data.products.filter((p) => p.kind === 'digital' && p.status !== 'archived');
  const editId = params.get('edit');
  const creating = params.get('new') === '1';
  const used = digital.reduce((s, p) => s + (p.digital?.versions.reduce((a, v) => a + v.sizeBytes, 0) ?? 0), 0);
  const usedPct = Math.min(100, used / STORAGE_LIMIT_BYTES * 100);

  const buyers = (p: Product): Order[] => data.orders.filter((o) => o.items.some((i) => i.productId === p.id) && o.paymentStatus !== 'pending' && o.paymentStatus !== 'cancelled');

  const access = useMemo(
    () =>
    data.orders.
    filter((o) => o.downloadToken).
    flatMap((o) =>
    o.items.
    filter((i) => i.kind === 'digital').
    map((i) => {
      const product = data.products.find((p) => p.id === i.productId);
      const check = product ? checkDownload(o, product) : null;
      const usedCount = o.downloads.filter((d) => d.productId === i.productId).length;
      return { key: `${o.id}-${i.productId}`, order: o, item: i, product, check, usedCount };
    })
    ),
    [data.orders, data.products]
  );

  return (
    <>
      <PageHeader
        title="Digital products"
        description="Sell files with secure, expiring download links."
        actions={
        <Button leadingIcon={PlusIcon} onClick={() => setParams({ new: '1' })}>
            Add digital product
          </Button>
        } />
      
      {!allowed &&
      <InlineAlert tone="info" title={`Selling files is on ${plans[CHECKOUT_PLAN].name}`} className="mt-6" action={<UpgradeButton plan={CHECKOUT_PLAN} feature="Selling digital files" />}>
          You can set products up now; page blocks can’t publish them on {plan.name}.
        </InlineAlert>
      }

      {digital.length === 0 ?
      <div className="mt-8 rounded-lg border border-line bg-raised">
          <EmptyState icon={FileIcon} title="No digital products yet" description="E-books, presets, patterns, templates or courses — upload once and every buyer gets their own link." action={<Button leadingIcon={PlusIcon} onClick={() => setParams({ new: '1' })}>Add digital product</Button>} />
        </div> :

      <div className="mt-8 grid items-start gap-8 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <Card
          id="digital-files"
          emphasis="primary"
          title="Files for sale"
          description={`${digital.length} ${digital.length === 1 ? 'product' : 'products'}`}
          body="flush"
          footer={
          <div>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-label font-semibold text-fg">Storage</p>
                  <p className="text-caption tabular-nums text-fg-subtle">
                    {formatBytes(used)} of {formatBytes(STORAGE_LIMIT_BYTES)}
                  </p>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sunken" role="progressbar" aria-label="Storage used" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(usedPct)}>
                  <div className={usedPct > 85 ? 'h-full bg-warning' : 'h-full bg-action'} style={{ width: `${Math.max(usedPct, 1)}%` }} />
                </div>
                <p className="mt-2 text-caption text-fg-subtle">Includes old versions. Bandwidth isn’t metered in this prototype.</p>
              </div>
          }>
          
            <ul className="flex flex-col divide-y divide-line">
              {digital.map((p) => {
              const asset = p.digital!;
              const sold = buyers(p).length;
              return (
                <li key={p.id} className="grid grid-cols-[3rem_minmax(0,1fr)] items-start gap-x-4 gap-y-3 px-5 py-4 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:items-center md:px-6">
                    <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-sunken text-fg-muted">
                      <FileIcon size={20} strokeWidth={2.25} />
                    </span>
                    <div className="min-w-0">
                      <button type="button" onClick={() => setParams({ edit: p.id })} className="flex items-center gap-2 text-left text-label font-semibold text-fg hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                        {p.name}
                        {p.sample && <SampleTag />}
                      </button>
                      <p className="text-caption text-fg-subtle">
                        {asset.fileName ? `${asset.fileName} · ${formatBytes(asset.sizeBytes)} · v${asset.version}` : 'No file yet'}
                      </p>
                      <p className="text-caption text-fg-subtle">
                        {[asset.downloadLimit ? `${asset.downloadLimit} downloads` : 'Unlimited downloads', asset.expiryDays ? `${asset.expiryDays}-day link` : 'No expiry', `${sold} sold`].join(' · ')}
                      </p>
                    </div>
                    <div className="col-span-2 flex flex-col gap-2 sm:col-span-1 sm:items-end">
                      <span className="text-label font-semibold tabular-nums text-fg">{p.priceNgn !== null ? formatNgn(p.priceNgn) : '—'}</span>
                      <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                        <ProductStatusBadge product={p} />
                        {fileBadge[asset.status]}
                      </div>
                      {sold > 0 && asset.version > 1 &&
                    <Button size="sm" variant="tertiary" leadingIcon={BellIcon} onClick={() => setNotify(p)}>
                          Tell buyers about v{asset.version}
                        </Button>
                    }
                    </div>
                  </li>);

            })}
            </ul>
          </Card>

          <div className="flex flex-col gap-8">
          <KeyLookup />
          <Section id="access" title="Who has access" description="Each buyer’s link, downloads used and status.">
            {access.length === 0 ?
            <p className="text-label text-fg-muted">No one has bought a file yet.</p> :

            <ul className="flex flex-col divide-y divide-line border-y border-line">
                {access.map((a) => {
                const limit = a.product?.digital?.downloadLimit;
                return (
                  <li key={a.key} className="py-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="min-w-0 truncate text-label font-semibold text-fg">{a.order.customer.name}</p>
                        {a.check?.ok ? <Badge tone="success">Active</Badge> : <Badge tone="neutral">{a.check ? accessCopy[a.check.reason] : 'Product deleted'}</Badge>}
                      </div>
                      <p className="text-caption text-fg-subtle">
                        {a.item.name} · order #{a.order.number} · {formatTimestamp(a.order.createdAt)}
                      </p>
                      <p className="text-caption text-fg-subtle">
                        {a.usedCount}
                        {limit ? ` of ${limit}` : ''} downloads
                        {a.check?.ok && a.check.expiresAt ? ` · expires ${formatTimestamp(a.check.expiresAt)}` : ''}
                      </p>
                    </li>);

              })}
              </ul>
            }
          </Section>
          </div>
        </div>
      }

      <ProductEditor open={creating || !!editId} productId={editId} kind="digital" onClose={() => setParams({})} />

      <Dialog
        open={!!notify}
        onClose={() => setNotify(null)}
        title={`Tell ${notify ? buyers(notify).length : 0} buyers about the update?`}
        description="Their existing download link now gives the new version, within the same download limit."
        footer={
        <>
            <Button variant="secondary" onClick={() => setNotify(null)}>
              Cancel
            </Button>
            <Button
            onClick={() => {
              toast('Update notice previewed', { description: 'Nothing is sent in this prototype.' });
              setNotify(null);
            }}>
            
              Send notice
            </Button>
          </>
        }>
        
        {notify &&
        <p className="rounded-md bg-sunken px-3 py-2.5 text-label text-fg-muted">
            “{notify.name}” has been updated to version {notify.digital?.version}. {notify.digital?.versions[0]?.note || ''} Download it again from your original receipt link.
          </p>
        }
      </Dialog>
    </>);

}