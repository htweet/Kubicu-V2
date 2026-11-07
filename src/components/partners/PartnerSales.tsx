import React, { useMemo } from 'react';
import type { Order, Product } from '../../types/commerce';
import { orderPartnerShares, shareStatusLabels, shareStatusTones } from '../../utils/commerce/bundles';
import type { PartnerShare } from '../../utils/commerce/bundles';
import { orderMoney } from '../../utils/commerce/money';
import { formatDate, formatNgn } from '../../utils/format';
import { useT } from '../../contexts/LocaleContext';
import { Badge } from '../ui/Badge';

interface PartnerSalesProps {
  partnershipId: string;
  orders: Order[];
  products: Product[];
  leadName: string;
  partnerName: string;
  /** Who's reading: the lead sees both shares, the partner sees theirs first. */
  viewer: 'lead' | 'partner';
}

/** Everything sold together in one partnership, with each share and where it is (D122). */
export function PartnerSales({ partnershipId, orders, products, leadName, partnerName, viewer }: PartnerSalesProps) {
  const { t: tr } = useT();
  const bundles = products.filter((p) => p.bundle?.partnershipId === partnershipId && p.status !== 'archived');
  const rows = useMemo(
    () =>
      orders
        .map((o) => ({ o, share: orderPartnerShares(o).find((s) => s.partnershipId === partnershipId) }))
        .filter((r): r is { o: Order; share: PartnerShare } => !!r.share && r.share.status !== 'pending')
        .sort((a, b) => b.o.createdAt.localeCompare(a.o.createdAt)),
    [orders, partnershipId],
  );
  const theirs = rows.reduce((s, r) => s + r.share.netNgn, 0);
  const sold = rows.reduce((s, r) => s + r.share.grossNgn, 0);
  const waiting = rows.filter((r) => r.share.status === 'held' || r.share.status === 'awaiting_delivery').reduce((s, r) => s + r.share.netNgn, 0);
  const leadKept = rows.reduce((s, r) => s + Math.max(0, orderMoney(r.o).gross - r.share.grossNgn), 0);
  const guest = rows.some((r) => r.share.partnerKind === 'guest');

  const footnote =
    viewer === 'partner'
      ? guest
        ? 'Amounts after your part of the payment fee, the 2% KUBICU fee and any refunds. Refunds come back from each share in proportion.'
        : 'Amounts after your part of the payment fee and any refunds. Refunds come back from each share in proportion.'
      : guest
        ? 'Amounts after their part of the payment fee, the 2% KUBICU fee and any refunds. Refunds come back from each share in proportion.'
        : 'Amounts after their part of the payment fee and any refunds. Refunds come back from each share in proportion.';

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2 text-caption font-medium text-fg-muted">{tr('Sold together')}</p>
        {bundles.length ? (
          <ul className="flex flex-col divide-y divide-line rounded-lg border border-line bg-raised">
            {bundles.map((p) => (
              <li key={p.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
                <span className="min-w-0">
                  <span className="block truncate text-label font-medium text-fg">{p.name}</span>
                  <span className="block truncate text-caption text-fg-muted">{p.bundle?.partnerPart ? `${partnerName}: ${p.bundle.partnerPart}` : tr('With {name}', { name: partnerName })}</span>
                </span>
                <span className="text-right text-caption tabular-nums text-fg-muted">
                  {p.bundle?.split === 'fixed'
                    ? tr('{amount} each to {name}', { amount: formatNgn(p.bundle.partnerFixedNgn ?? 0), name: viewer === 'partner' ? tr('you') : partnerName })
                    : tr('{a}/{b} split', { a: p.bundle?.leadSharePct ?? 0, b: 100 - (p.bundle?.leadSharePct ?? 0) })}
                  {p.status === 'draft' && <span className="block text-fg-subtle">{tr('Draft')}</span>}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-caption text-fg-muted">{viewer === 'lead' ? tr('Nothing set up yet. In Commerce → Products, open a product and turn on “Sold with a partner”.') : tr('{name} hasn’t added anything to sell together yet.', { name: leadName })}</p>
        )}
      </div>

      {rows.length > 0 && (
        <>
          <dl className="grid grid-cols-1 gap-3 border-y border-line py-4 min-[420px]:grid-cols-3 min-[420px]:gap-4">
            <div>
              <dt className="text-caption text-fg-subtle">{viewer === 'partner' ? tr('Your share so far') : tr('{name}’s share', { name: partnerName })}</dt>
              <dd className="mt-0.5 text-heading font-semibold tabular-nums text-fg">{formatNgn(theirs)}</dd>
            </div>
            <div>
              <dt className="text-caption text-fg-subtle">{tr('Waiting on delivery')}</dt>
              <dd className="mt-0.5 text-label font-semibold tabular-nums text-fg">{formatNgn(waiting)}</dd>
            </div>
            <div>
              <dt className="text-caption text-fg-subtle">{viewer === 'lead' ? tr('Your part, incl. delivery') : tr('Customers paid for your part')}</dt>
              <dd className="mt-0.5 text-label font-semibold tabular-nums text-fg">{formatNgn(viewer === 'lead' ? leadKept : sold)}</dd>
            </div>
          </dl>
          <ul className="flex flex-col divide-y divide-line">
            {rows.slice(0, 8).map(({ o, share }) => (
              <li key={o.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 py-3">
                <span className="min-w-0">
                  <span className="block truncate text-label font-medium text-fg">
                    #{o.number} · {o.items.filter((i) => i.bundle?.partnershipId === partnershipId).map((i) => i.name).join(', ')}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-2 text-caption text-fg-muted">
                    {formatDate(o.createdAt)}
                    <Badge tone={shareStatusTones[share.status]}>{tr(shareStatusLabels[share.status])}</Badge>
                  </span>
                </span>
                <span className="text-right">
                  <span className="block text-label font-semibold tabular-nums text-fg">{formatNgn(share.netNgn)}</span>
                  <span className="block text-caption tabular-nums text-fg-subtle">{tr('of {amount}', { amount: formatNgn(share.grossNgn) })}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="text-caption text-fg-subtle">{tr(footnote)}</p>
        </>
      )}
    </div>
  );
}
