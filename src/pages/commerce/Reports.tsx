import React, { useMemo, useState } from 'react';
import { DownloadIcon } from 'lucide-react';
import type { Order } from '../../types/commerce';
import { useCommerce } from '../../contexts/CommerceContext';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { Segmented } from '../../components/ui/Segmented';
import { DataTable, type DataColumn } from '../../components/ui/DataTable';
import { IllustrativeTag } from '../../components/ui/IllustrativeTag';
import { SampleTag } from '../../components/commerce/StatusBadges';
import { orderMoney } from '../../utils/commerce/money';
import { downloadCsv, toCsv } from '../../utils/csv';
import { formatNgn, formatTimestamp } from '../../utils/format';

type Period = '7' | '30' | '90' | 'all';

/** Sales and fee report. Only orders where payment was confirmed count. */
export function Reports() {
  const { data } = useCommerce();
  const [period, setPeriod] = useState<Period>('30');

  const orders = useMemo(() => {
    const since = period === 'all' ? 0 : Date.now() - Number(period) * 86400000;
    return data.orders.filter((o) => Date.parse(o.createdAt) >= since && o.paymentStatus !== 'pending' && o.paymentStatus !== 'cancelled');
  }, [data.orders, period]);

  const totals = useMemo(
    () =>
    orders.reduce(
      (t, o) => {
        const m = orderMoney(o);
        return { gross: t.gross + m.gross, provider: t.provider + m.providerFee, kubicu: t.kubicu + m.kubicuFee, refunds: t.refunds + m.refunded, net: t.net + m.net, delivery: t.delivery + m.delivery, discount: t.discount + m.discount };
      },
      { gross: 0, provider: 0, kubicu: 0, refunds: 0, net: 0, delivery: 0, discount: 0 }
    ),
    [orders]
  );

  const topProducts = useMemo(() => {
    const map = new Map<string, {name: string;qty: number;revenue: number;}>();
    orders.
    filter((o) => o.paymentStatus !== 'refunded').
    forEach((o) => o.items.forEach((i) => {
      const cur = map.get(i.productId) ?? { name: i.name, qty: 0, revenue: 0 };
      map.set(i.productId, { ...cur, qty: cur.qty + i.qty, revenue: cur.revenue + i.unitPriceNgn * i.qty });
    }));
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [orders]);

  const exportCsv = () =>
  downloadCsv(
    `kubicu-sales-${period}d.csv`,
    toCsv(
      ['order', 'date', 'customer_paid', 'discount', 'discount_code', 'delivery', 'provider_fee', 'kubicu_fee', 'refunded', 'you_receive', 'sample'],
      orders.map((o) => {
        const m = orderMoney(o);
        return [o.number, o.createdAt, m.gross, m.discount, o.discount?.code || o.discount?.label || '', m.delivery, m.providerFee, m.kubicuFee, m.refunded, m.net, o.sample ? 'yes' : ''];
      })
    )
  );

  const columns: DataColumn<Order>[] = [
  { key: 'n', header: 'Order', sortValue: (o) => o.number, render: (o) => <span className="flex items-center gap-2 font-mono">#{o.number}{o.sample && <SampleTag />}</span> },
  { key: 'd', header: 'Date', hideOnMobile: true, sortValue: (o) => Date.parse(o.createdAt), render: (o) => <span className="text-fg-muted">{formatTimestamp(o.createdAt)}</span> },
  { key: 'g', header: 'Paid', align: 'right', sortValue: (o) => orderMoney(o).gross, render: (o) => formatNgn(orderMoney(o).gross) },
  { key: 'f', header: 'Fees', align: 'right', hideOnMobile: true, render: (o) => {const m = orderMoney(o);return <span className="text-fg-muted">−{formatNgn(m.providerFee + m.kubicuFee)}</span>;} },
  { key: 'r', header: 'Refunded', align: 'right', hideOnMobile: true, render: (o) => {const m = orderMoney(o);return m.refunded ? <span className="text-fg-muted">−{formatNgn(m.refunded)}</span> : <span className="text-fg-subtle">—</span>;} },
  { key: 'net', header: 'You receive', align: 'right', sortValue: (o) => orderMoney(o).net, render: (o) => <span className="font-semibold">{formatNgn(orderMoney(o).net)}</span> }];


  const lines: [string, number, boolean?][] = [
  ['Customers paid', totals.gross],
  ['of which delivery', totals.delivery],
  ...(totals.discount > 0 ? [['after discounts given', totals.discount]] as [string, number][] : []),
  ['Provider fees', -totals.provider],
  ['KUBICU fees', -totals.kubicu],
  ['Refunds', -totals.refunds]];


  return (
    <>
      <PageHeader
        title="Sales report"
        description="Paid orders only. Fees and refunds are shown separately — never folded into one number."
        actions={
        <Button variant="secondary" leadingIcon={DownloadIcon} onClick={exportCsv} disabled={orders.length === 0}>
            Export CSV
          </Button>
        } />
      
      <div className="mt-6">
        <Segmented<Period> ariaLabel="Period" value={period} onChange={setPeriod} options={[{ value: '7', label: '7 days' }, { value: '30', label: '30 days' }, { value: '90', label: '90 days' }, { value: 'all', label: 'All time' }]} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section aria-labelledby="net-heading" className="rounded-lg border border-line bg-raised p-6">
          <h2 id="net-heading" className="text-label font-semibold text-fg-muted">
            You receive
          </h2>
          <p className="mt-2 text-[2.5rem] font-semibold leading-none tracking-[-0.03em] tabular-nums text-fg">{formatNgn(totals.net)}</p>
          <p className="mt-2 text-caption text-fg-subtle">From {orders.length} paid order{orders.length === 1 ? '' : 's'} · test mode</p>
          <dl className="mt-6 flex flex-col border-t border-line pt-3">
            {lines.map(([label, value]) =>
            <div key={label} className="flex items-baseline justify-between gap-3 py-1.5">
                <dt className={label.startsWith('of') || label.startsWith('after') ? 'pl-3 text-caption text-fg-subtle' : 'text-label text-fg-muted'}>{label}</dt>
                <dd className="text-label tabular-nums text-fg">{value < 0 ? `−${formatNgn(-value)}` : formatNgn(value)}</dd>
              </div>
            )}
          </dl>
          <p className="mt-3 flex items-center gap-1.5 text-caption text-fg-subtle">
            Fee rates are illustrative <IllustrativeTag note="Provider 1.5% + ₦100 (waived under ₦2,500, capped ₦2,000); KUBICU fee by plan. Not final." />
          </p>
        </section>

        <section aria-labelledby="top-heading" className="rounded-lg border border-line bg-raised p-6">
          <h2 id="top-heading" className="text-label font-semibold text-fg-muted">
            Best sellers
          </h2>
          {topProducts.length === 0 ?
          <p className="mt-4 text-label text-fg-muted">No sales in this period.</p> :

          <ol className="mt-4 flex flex-col gap-3">
              {topProducts.map((p, i) => {
              const pct = p.revenue / topProducts[0].revenue * 100;
              return (
                <li key={p.name}>
                    <div className="flex items-baseline justify-between gap-3 text-label">
                      <span className="min-w-0 truncate font-medium text-fg">
                        <span className="mr-2 tabular-nums text-fg-subtle">{i + 1}</span>
                        {p.name}
                      </span>
                      <span className="shrink-0 tabular-nums text-fg">
                        {formatNgn(p.revenue)} <span className="text-fg-subtle">· {p.qty} sold</span>
                      </span>
                    </div>
                    <div aria-hidden className="mt-1.5 h-1.5 rounded-full bg-sunken">
                      <div className="h-full rounded-full bg-action" style={{ width: `${pct}%` }} />
                    </div>
                  </li>);

            })}
            </ol>
          }
        </section>
      </div>

      <section aria-labelledby="tx-heading" className="mt-10">
        <h2 id="tx-heading" className="text-heading font-semibold text-fg">
          Transactions
        </h2>
        <div className="mt-4">
          <DataTable caption="Transactions" rows={orders} columns={columns} emptyTitle="No paid orders in this period" emptyDescription="Try a longer period." />
        </div>
      </section>
    </>);

}