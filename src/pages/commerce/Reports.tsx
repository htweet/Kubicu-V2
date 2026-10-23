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
import { Card } from '../../components/ui/layout/Card';
import { PageStack, Section } from '../../components/ui/layout/Section';
import { Stat, StatGroup } from '../../components/ui/layout/Stat';
import { orderMoney } from '../../utils/commerce/money';
import { mrr } from '../../utils/commerce/subscriptions';
import { instalmentsOwed } from '../../utils/commerce/payOptions';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useMoney } from '../../hooks/useMoney';
import { downloadCsv, toCsv } from '../../utils/csv';
import { formatNgn, formatTimestamp } from '../../utils/format';

type Period = '7' | '30' | '90' | 'all';

/** Sales and fee report. Only orders where payment was confirmed count. */
export function Reports() {
  const { data } = useCommerce();
  const { current } = useWorkspace();
  const money = useMoney(current.id).data;
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

  const subPaid = useMemo(() => {
    const since = period === 'all' ? 0 : Date.now() - Number(period) * 86400000;
    return (data.subscriptions ?? []).flatMap((s) => s.payments).filter((p) => p.status === 'paid' && Date.parse(p.at) >= since).reduce((t, p) => t + p.amountNgn, 0);
  }, [data.subscriptions, period]);

  // Staged payments (D95): made-to-order balances and staged payment links.
  const staged = useMemo(() => {
    const since = period === 'all' ? 0 : Date.now() - Number(period) * 86400000;
    const open = data.orders.filter((o) => o.balance && !o.balance.paidAt && o.status !== 'cancelled' && o.status !== 'refunded' && o.paymentStatus !== 'pending' && o.paymentStatus !== 'cancelled');
    const collected = data.orders.filter((o) => o.balance?.paidAt && Date.parse(o.balance.paidAt) >= since).reduce((t, o) => t + (o.balance?.dueNgn ?? 0), 0);
    const linkStages = money.links.flatMap((l) => l.payments).filter((p) => p.stageId && Date.parse(p.at) >= since).reduce((t, p) => t + p.amountNgn, 0);
    return { owed: open.reduce((t, o) => t + (o.balance?.dueNgn ?? 0), 0), owedCount: open.length, collected, linkStages, any: data.orders.some((o) => o.balance) || money.links.some((l) => l.stages?.length) };
  }, [data.orders, money.links, period]);

  // Pay on delivery and instalments (D112).
  const payWays = useMemo(() => {
    const since = period === 'all' ? 0 : Date.now() - Number(period) * 86400000;
    const live = (o: Order) => o.status !== 'cancelled' && o.status !== 'refunded';
    const podOrders = data.orders.filter((o) => o.pod);
    const collected = podOrders.filter((o) => o.pod?.collected && Date.parse(o.pod.collected.at) >= since);
    const awaiting = podOrders.filter((o) => live(o) && !o.pod?.collected);
    const refused = podOrders.filter((o) => o.pod?.failed?.some((f) => f.reason === 'refused' && Date.parse(f.at) >= since)).length;
    const inst = data.orders.filter((o) => o.instalments && live(o) && (o.instalments.status === 'active' || o.instalments.status === 'defaulted'));
    const owed = inst.reduce((t, o) => t + instalmentsOwed(o), 0);
    return {
      any: podOrders.length > 0 || data.orders.some((o) => o.instalments),
      collected: collected.reduce((t, o) => t + (o.pod?.amountNgn ?? 0), 0),
      collectedCount: collected.length,
      awaiting: awaiting.reduce((t, o) => t + (o.pod?.amountNgn ?? 0), 0),
      awaitingCount: awaiting.length,
      refused,
      owed,
      owedCount: inst.length,
      defaulted: inst.filter((o) => o.instalments?.status === 'defaulted').length
    };
  }, [data.orders, period]);

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
      
      <PageStack>
      <Segmented<Period> ariaLabel="Period" value={period} onChange={setPeriod} options={[{ value: '7', label: '7 days' }, { value: '30', label: '30 days' }, { value: '90', label: '90 days' }, { value: 'all', label: 'All time' }]} />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card id="net" emphasis="primary" title="You receive" description={`From ${orders.length} paid order${orders.length === 1 ? '' : 's'} · test mode`} footer={
          <p className="flex items-center gap-1.5 text-caption text-fg-subtle">
            Provider rate is illustrative <IllustrativeTag note="Provider 1.5% + ₦100 (waived under ₦2,500, capped ₦2,000) until a payment partner is chosen. KUBICU fees are confirmed (D105)." />
          </p>
          }>
          <p className="text-[2.5rem] font-semibold leading-none tracking-[-0.03em] tabular-nums text-fg">{formatNgn(totals.net)}</p>
          <dl className="mt-6 flex flex-col divide-y divide-line border-t border-line">
            {lines.map(([label, value]) => {
                const sub = label.startsWith('of') || label.startsWith('after');
                return (
                  <div key={label} className="flex items-baseline justify-between gap-3 py-2.5">
                  <dt className={sub ? 'pl-3 text-caption text-fg-subtle' : 'text-label text-fg-muted'}>{label}</dt>
                  <dd className={sub ? 'text-caption tabular-nums text-fg-muted' : 'text-label tabular-nums text-fg'}>{value < 0 ? `−${formatNgn(-value)}` : formatNgn(value)}</dd>
                </div>);

              })}
          </dl>
        </Card>

        <div className="flex flex-col gap-6">
          {(data.subscriptions ?? []).length > 0 &&
            <Card id="recurring" title="Recurring revenue" description="Product box renewals also count as orders. Memberships are subscription payments only.">
              <StatGroup columns={2}>
                <Stat label="Monthly recurring" value={<>{formatNgn(mrr(data))}<span className="text-label font-normal text-fg-muted"> /mo</span></>} />
                <Stat label="Taken this period" value={formatNgn(subPaid)} />
              </StatGroup>
            </Card>
            }
          {staged.any &&
            <Card id="staged" title="Staged payments" description="Made-to-order balances and payment links paid in stages. Owed is money not yet collected — it isn’t in “You receive”.">
              <StatGroup columns={3}>
                <Stat label="Still owed" value={formatNgn(staged.owed)} hint={`${staged.owedCount} order${staged.owedCount === 1 ? '' : 's'} waiting`} />
                <Stat label="Balances collected" value={formatNgn(staged.collected)} hint="This period" />
                <Stat label="Link stages paid" value={formatNgn(staged.linkStages)} hint="This period" />
              </StatGroup>
            </Card>
            }
          {payWays.any &&
            <Card id="pay-ways" title="Pay on delivery and instalments" description="Cash and door transfers went to you directly. Money still to come isn’t in “You receive”.">
              <StatGroup columns={3}>
                <Stat label="Collected on delivery" value={formatNgn(payWays.collected)} hint={`${payWays.collectedCount} order${payWays.collectedCount === 1 ? '' : 's'} this period${payWays.refused ? ` · ${payWays.refused} refused` : ''}`} />
                <Stat label="Out for collection" value={formatNgn(payWays.awaiting)} hint={`${payWays.awaitingCount} order${payWays.awaitingCount === 1 ? '' : 's'} not yet paid`} />
                <Stat label="Owed in instalments" value={formatNgn(payWays.owed)} hint={`${payWays.owedCount} order${payWays.owedCount === 1 ? '' : 's'}${payWays.defaulted ? ` · ${payWays.defaulted} defaulted` : ''}`} />
              </StatGroup>
            </Card>
            }
          <Card id="top" title="Best sellers" description="By revenue, refunded orders excluded">
          {topProducts.length === 0 ?
              <p className="text-label text-fg-muted">No sales in this period.</p> :

              <ol className="flex flex-col gap-4">
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
          </Card>
        </div>
      </div>

      <Section id="tx" title="Transactions" description="Every paid order in the period, with fees and refunds on their own columns.">
        <DataTable caption="Transactions" rows={orders} columns={columns} emptyTitle="No paid orders in this period" emptyDescription="Try a longer period." />
      </Section>
      </PageStack>
    </>);

}