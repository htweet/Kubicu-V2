import React from 'react';
import { useCommerce } from '../../contexts/CommerceContext';
import { canSell } from '../../utils/commerce/catalog';
import { formatNgn } from '../../utils/format';
import { Badge } from '../ui/Badge';

/** What a preview extension would do, using the workspace's real data (D67). */
export function ExtensionPreview({ id }: {id: string;}) {
  const { data } = useCommerce();

  if (id === 'whatsapp-catalogue') {
    const rows = data.products.
    filter((p) => p.status !== 'archived').
    map((p) => {
      const reason = p.status !== 'active' ? 'Draft' : !p.priceNgn ? 'No price' : !p.images.length ? 'No photo' : !canSell(p) ? 'Sold out — hidden' : null;
      return { p, reason };
    });
    return (
      <PreviewList title={`${rows.filter((r) => !r.reason).length} of ${rows.length} products would sync`} empty="Add products in Commerce to see what would sync.">
        {rows.map(({ p, reason }) =>
        <li key={p.id} className="flex items-center justify-between gap-3 py-2 text-label">
            <span className="min-w-0 truncate text-fg">{p.name}</span>
            {reason ? <Badge tone="neutral">{reason}</Badge> : <Badge tone="success">{p.priceNgn ? formatNgn(p.priceNgn) : 'Syncs'}</Badge>}
          </li>
        )}
      </PreviewList>);

  }

  if (id === 'review-requests') {
    const delivered = data.orders.filter((o) => o.status === 'completed');
    return (
      <PreviewList title={`${delivered.length} delivered order${delivered.length === 1 ? '' : 's'} would get a request`} empty="When orders are delivered, customers who’d be asked show here.">
        {delivered.slice(0, 8).map((o) =>
        <li key={o.id} className="flex items-center justify-between gap-3 py-2 text-label">
            <span className="min-w-0 truncate text-fg">{o.customer.name}</span>
            <span className="shrink-0 text-caption text-fg-subtle">Order #{o.number}</span>
          </li>
        )}
      </PreviewList>);

  }

  return null;
}

function PreviewList({ title, empty, children }: {title: string;empty: string;children: React.ReactNode;}) {
  const has = React.Children.count(children) > 0;
  return (
    <section className="flex flex-col gap-1 rounded-lg border border-line p-4">
      <h3 className="text-label font-semibold text-fg">Preview: {title}</h3>
      {has ? <ul className="divide-y divide-line">{children}</ul> : <p className="text-caption text-fg-muted">{empty}</p>}
    </section>);

}