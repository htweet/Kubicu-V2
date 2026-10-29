import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowDownRightIcon, ArrowUpRightIcon, DownloadIcon, PrinterIcon } from 'lucide-react';
import { useCommerce } from '../../contexts/CommerceContext';
import { useOps } from '../../contexts/OpsContext';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useEditor } from '../../contexts/EditorContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useT } from '../../contexts/LocaleContext';
import { useMoney } from '../../hooks/useMoney';
import { useServiceOs } from '../../hooks/useServiceOs';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { Segmented } from '../../components/ui/Segmented';
import { Switch } from '../../components/ui/Switch';
import { Badge } from '../../components/ui/Badge';
import { DataTable, type DataColumn } from '../../components/ui/DataTable';
import { IllustrativeTag } from '../../components/ui/IllustrativeTag';
import { Card } from '../../components/ui/layout/Card';
import { PageStack, Section } from '../../components/ui/layout/Section';
import { Stat, StatGroup } from '../../components/ui/layout/Stat';
import { IncomeChart } from '../../components/commerce/reports/IncomeChart';
import { BarList } from '../../components/commerce/reports/BarList';
import { MoneyStillToCome } from '../../components/commerce/reports/MoneyStillToCome';
import { AccountingExportButton } from '../../components/commerce/reports/AccountingExportButton';
import { byIncomeType, byMethod, byProduct, incomeEntries, incomeLabels, incomeSeries, isPaidOrder, methodLabels, summarise, vatSummary, type IncomeEntry, type ReportRange } from '../../utils/commerce/salesReport';
import { printSalesSummary } from '../../utils/commerce/salesReportPrint';
import { shopSettingsOf, vatRateLabel } from '../../utils/commerce/shopSettings';
import { change, inRange as eventsInRange, sources } from '../../utils/analytics/aggregate';
import { sourceLabels } from '../../utils/analytics/track';
import { activeExtraSpaces, readSpacePage } from '../../utils/spaces';
import { downloadCsv, toCsv } from '../../utils/csv';
import { formatNgn, formatTimestamp } from '../../utils/format';
import { cn } from '../../utils/cn';

type Period = '7' | '30' | '90' | 'custom' | 'all';

const pct = (n: number) => `${Math.round(n * 100)}%`;
const dayKey = (t: number) => new Date(t).toISOString().slice(0, 10);

/** Sales report (D227): everything paid in, where it came from, and what you keep. */
export function Reports() {
  const { data } = useCommerce();
  const ops = useOps().data;
  const { data: analytics } = useAnalytics();
  const { state } = useEditor();
  const { current } = useWorkspace();
  const { t: tr } = useT();
  const money = useMoney(current.id).data;
  const sos = useServiceOs(current.id).data;
  const [period, setPeriod] = useState<Period>('30');
  const [from, setFrom] = useState(() => dayKey(Date.now() - 13 * 86400000));
  const [to, setTo] = useState(() => dayKey(Date.now()));
  const [compare, setCompare] = useState(true);
  const [handle, setHandle] = useState('all');

  const mainHandle = state.published?.handle ?? state.site.handle;
  const spaceOptions = useMemo(
    () => [
    { value: 'all', label: 'All spaces' },
    { value: mainHandle, label: `Main page · ${mainHandle}` },
    ...activeExtraSpaces(current).
    map((s) => readSpacePage(current.id, s.id)?.published?.handle ?? readSpacePage(current.id, s.id)?.draft.handle).
    filter((h): h is string => !!h && h !== mainHandle).
    map((h) => ({ value: h, label: h }))],

    [current, mainHandle]
  );
  const space = handle === 'all' ? null : handle;

  const ranges = useMemo((): {current: ReportRange;previous: ReportRange | null;} => {
    const now = Date.now();
    if (period === 'all') return { current: { from: 0, to: now + 1 }, previous: null };
    if (period === 'custom') {
      const a = Date.parse(from);
      const b = Date.parse(to) + 86400000;
      const span = Math.max(86400000, b - a);
      return { current: { from: a, to: a + span }, previous: { from: a - span, to: a } };
    }
    const d = Number(period) * 86400000;
    return { current: { from: now - d, to: now + 1 }, previous: { from: now - 2 * d, to: now - d } };
  }, [period, from, to]);

  const inputs = useMemo(
    () => ({
      orders: data.orders,
      subscriptions: data.subscriptions ?? [],
      giftCards: data.giftCards ?? [],
      bookings: ops.bookings,
      invoices: sos.invoices,
      linkPayments: money.links.flatMap((l) => l.payments.map((p) => ({ ...p, linkTitle: l.title })))
    }),
    [data.orders, data.subscriptions, data.giftCards, ops.bookings, sos.invoices, money.links]
  );

  const periodOrders = (r: ReportRange) => data.orders.filter((o) => isPaidOrder(o) && Date.parse(o.createdAt) >= r.from && Date.parse(o.createdAt) < r.to && (!space || o.sourceHandle === space));
  const entries = useMemo(() => incomeEntries(inputs, ranges.current, space), [inputs, ranges, space]);
  const orders = useMemo(() => periodOrders(ranges.current), [data.orders, ranges, space]); // eslint-disable-line react-hooks/exhaustive-deps
  const summary = useMemo(() => summarise(entries, data.orders, orders, ranges.current), [entries, data.orders, orders, ranges]);

  // “All time” starts at the first money in, so the chart isn’t years of empty days.
  const chartRange = useMemo((): ReportRange => {
    if (period !== 'all') return ranges.current;
    const first = entries.length ? Math.min(...entries.map((e) => Date.parse(e.at))) : Date.now() - 29 * 86400000;
    return { from: first, to: ranges.current.to };
  }, [period, ranges, entries]);

  const prev = useMemo(() => {
    if (!ranges.previous) return null;
    const e = incomeEntries(inputs, ranges.previous, space);
    return { entries: e, summary: summarise(e, data.orders, periodOrders(ranges.previous), ranges.previous) };
  }, [inputs, ranges, space, data.orders]); // eslint-disable-line react-hooks/exhaustive-deps
  const showCompare = compare && !!prev;

  const series = incomeSeries(entries, chartRange);
  const prevSeries = prev && ranges.previous ? incomeSeries(prev.entries, ranges.previous) : [];
  const chart = series.map((d, i) => ({ label: d.label, value: d.value, previous: prevSeries[i]?.value ?? 0 }));
  const best = series.reduce((b, d) => d.value > b.value ? d : b, { label: '', value: 0, key: '' });

  const income = byIncomeType(entries);
  const methods = byMethod(entries);
  const products = byProduct(orders);
  const vatOn = shopSettingsOf(data).tax.enabled;
  const vat = vatSummary(entries);
  const sample = entries.some((e) => e.sample);

  // Visitor sources come from Analytics: sales recorded against the visit that led to them.
  const sourceRows = useMemo(() => {
    const ev = eventsInRange(analytics.events, period === 'all' ? { from: 0, to: Date.now() + 1 } : ranges.current, { handle: space });
    const revenue = new Map<string, number>();
    ev.filter((e) => e.type === 'order_paid' || e.type === 'ticket_paid').forEach((e) => revenue.set(e.source, (revenue.get(e.source) ?? 0) + (e.valueNgn ?? 0)));
    return sources(ev).map((s) => ({ ...s, revenue: revenue.get(s.id) ?? 0 }));
  }, [analytics.events, ranges, period, space]);

  const rangeText = period === 'all' ? 'All time' : period === 'custom' ? `${from} – ${to}` : `Last ${period} days`;
  const spaceText = spaceOptions.find((o) => o.value === handle)?.label ?? 'All spaces';

  const delta = (c: number, p: number | undefined, invert = false) => {
    if (!showCompare || p === undefined) return null;
    const ch = change(c, p);
    if (ch === null) return <span className="text-caption text-fg-subtle">{tr('new this period')}</span>;
    const good = invert ? ch <= 0 : ch >= 0;
    const Icon = ch >= 0 ? ArrowUpRightIcon : ArrowDownRightIcon;
    return (
      <span className={cn('inline-flex items-center gap-0.5 text-caption font-semibold', good ? 'text-success' : 'text-danger')}>
        <Icon size={13} aria-hidden />
        {ch >= 0 ? '+' : ''}
        {Math.round(ch * 100)}%<span className="sr-only"> {tr('vs previous period')}</span>
      </span>);

  };

  const exportCsv = () =>
  downloadCsv(
    `kubicu-sales-${period === 'custom' ? `${from}_${to}` : period}.csv`,
    toCsv(
      ['date', 'type', 'reference', 'customer', 'method', 'paid', 'fees', 'refunded', 'you_receive', 'vat', 'sample'],
      entries.map((e) => [e.at, incomeLabels[e.type].label, e.ref, e.customer, e.method ? methodLabels[e.method] : '', e.paid, e.fees, e.refunded, e.net, e.vat, e.sample ? 'yes' : ''])
    )
  );

  const exportPdf = () => {
    const ok = printSalesSummary({ business: current.name, rangeText, spaceText, summary, income, methods, products, vat: vatOn || vat.total > 0 ? vat : null, sample });
    if (!ok) toast.error(tr('Your browser blocked the print window'), { description: tr('Allow pop-ups for KUBICU and try again.') });
  };

  const columns: DataColumn<IncomeEntry>[] = [
  { key: 'd', header: 'Date', sortValue: (e) => Date.parse(e.at), render: (e) => <span className="text-fg-muted">{formatTimestamp(e.at)}</span> },
  {
    key: 't',
    header: 'What',
    render: (e) =>
    <span className="flex min-w-0 flex-col">
          <span className="truncate font-medium text-fg">
            {e.ref}
            {e.sample && <span className="ml-2 text-caption font-normal text-fg-subtle">{tr('Sample')}</span>}
          </span>
          <span className="truncate text-caption text-fg-subtle">
            {tr(incomeLabels[e.type].label)}
            {e.customer ? ` · ${e.customer}` : ''}
          </span>
        </span>

  },
  { key: 'm', header: 'Method', hideOnMobile: true, render: (e) => <span className="text-fg-muted">{e.method ? tr(methodLabels[e.method]) : '—'}</span> },
  { key: 'f', header: 'Fees', align: 'right', hideOnMobile: true, render: (e) => e.fees ? <span className="text-fg-muted">−{formatNgn(e.fees)}</span> : <span className="text-fg-subtle">—</span> },
  { key: 'r', header: 'Refunded', align: 'right', hideOnMobile: true, render: (e) => e.refunded ? <span className="text-fg-muted">−{formatNgn(e.refunded)}</span> : <span className="text-fg-subtle">—</span> },
  { key: 'net', header: 'You receive', align: 'right', sortValue: (e) => e.net, render: (e) => <span className="font-semibold">{formatNgn(e.net)}</span> }];


  return (
    <>
      <PageHeader
        title="Sales report"
        description="All money paid in — shop, bookings, invoices, payment links and memberships. Fees and refunds are always shown on their own lines."
        actions={
        <div className="flex flex-wrap gap-2">
            <Button variant="secondary" leadingIcon={PrinterIcon} onClick={exportPdf} disabled={entries.length === 0}>
              PDF summary
            </Button>
            <Button variant="secondary" leadingIcon={DownloadIcon} onClick={exportCsv} disabled={entries.length === 0}>
              Export CSV
            </Button>
            <AccountingExportButton entries={entries} fileTag={period === 'custom' ? `${from}_${to}` : period} rangeText={rangeText} />
          </div>
        } />
      
      <PageStack>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex min-w-0 flex-wrap items-end gap-3">
            <div className="-mx-1 max-w-full overflow-x-auto overflow-y-hidden px-1">
            <Segmented<Period>
                ariaLabel="Period"
                value={period}
                onChange={setPeriod}
                options={[
                { value: '7', label: '7 days' },
                { value: '30', label: '30 days' },
                { value: '90', label: '90 days' },
                { value: 'custom', label: 'Custom' },
                { value: 'all', label: 'All time' }]
                } />
              
            </div>
            {period === 'custom' &&
            <div className="flex items-center gap-2">
                <label className="sr-only" htmlFor="sr-from">{tr('From')}</label>
                <input id="sr-from" type="date" value={from} max={to} onChange={(e) => e.target.value && setFrom(e.target.value)} className="h-9 rounded-md border border-line bg-raised px-2.5 text-label text-fg" />
                <span className="text-caption text-fg-subtle">{tr('to')}</span>
                <label className="sr-only" htmlFor="sr-to">{tr('To')}</label>
                <input id="sr-to" type="date" value={to} min={from} max={dayKey(Date.now())} onChange={(e) => e.target.value && setTo(e.target.value)} className="h-9 rounded-md border border-line bg-raised px-2.5 text-label text-fg" />
              </div>
            }
            <div className="min-w-[200px]">
              <label htmlFor="sr-space" className="sr-only">{tr('Space')}</label>
              <select id="sr-space" value={handle} onChange={(e) => setHandle(e.target.value)} className="h-9 w-full rounded-md border border-line bg-raised px-2.5 text-label text-fg">
                {spaceOptions.map((o) =>
                <option key={o.value} value={o.value}>{tr(o.label)}</option>
                )}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {sample && <Badge tone="neutral">{tr('Includes sample data')}</Badge>}
            {prev &&
            <div className="w-52">
                <Switch id="sr-compare" label="Compare to previous period" checked={compare} onChange={setCompare} />
              </div>
            }
          </div>
        </div>
        {space && <p className="-mt-3 text-caption text-fg-subtle">{tr('Invoices, payment links and gift cards don’t belong to a space, so they’re left out while one is chosen.')}</p>}

        <Card
          id="net"
          emphasis="primary"
          title="You receive"
          description={`${tr(rangeText)} · ${tr('test mode')}`}
          footer={
          <p className="flex items-center gap-1.5 text-caption text-fg-subtle">
              {tr('Fees are itemised for shop orders; other income is shown as received. Provider rate is illustrative.')}
              <IllustrativeTag note="Provider 1.5% + ₦100 (waived under ₦2,500, capped ₦2,000) until a payment partner is chosen. KUBICU fees are confirmed (D105)." />
            </p>
          }>
          
          <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-[2.5rem] font-semibold leading-none tracking-[-0.03em] tabular-nums text-fg">{formatNgn(summary.received)}</p>
                <p className="mt-2">{delta(summary.received, prev?.summary.received)}</p>
              </div>
              <dl className="flex flex-col divide-y divide-line border-t border-line">
                {([['Customers paid', summary.paid], ['Fees', -summary.fees], ['Refunds', -summary.refunded]] as [string, number][]).map(([label, v]) =>
                <div key={label} className="flex items-baseline justify-between gap-3 py-2.5">
                    <dt className="text-label text-fg-muted">{tr(label)}</dt>
                    <dd className="text-label tabular-nums text-fg">{v < 0 ? `−${formatNgn(-v)}` : formatNgn(v)}</dd>
                  </div>
                )}
              </dl>
              <StatGroup columns={3} divided>
                <Stat label="Paid orders" value={summary.orders} hint={delta(summary.orders, prev?.summary.orders)} />
                <Stat label="Average order" value={summary.aov ? formatNgn(summary.aov) : '—'} hint={delta(summary.aov, prev?.summary.aov)} />
                <Stat label="Repeat customers" value={summary.orders ? pct(summary.repeatRate) : '—'} hint={showCompare && prev ? `${tr('was')} ${prev.summary.orders ? pct(prev.summary.repeatRate) : '—'}` : undefined} />
              </StatGroup>
            </div>
            <IncomeChart
              data={chart}
              compare={showCompare}
              summary={entries.length === 0 ? tr('No money in during this period.') : `${tr('Money received over time')}${best.value > 0 ? ` — ${tr('best')} ${best.label}: ${formatNgn(best.value)}` : ''}${showCompare ? `. ${tr('Dashed line: previous period.')}` : '.'}`} />
            
          </div>
        </Card>

        <div className="grid items-start gap-6 lg:grid-cols-2">
          <Card id="income" title="Where the money came from" description="After fees and refunds.">
            <BarList
              empty={tr('No income in this period.')}
              rows={income.map((i) => ({ key: i.id, label: tr(incomeLabels[i.id].label), value: i.amount, valueText: formatNgn(i.amount), meta: tr(i.count === 1 ? '{n} payment' : '{n} payments', { n: i.count }) }))} />
            
          </Card>
          <Card id="methods" title="Payment methods" description="What customers paid with, before fees.">
            <BarList
              empty={tr('No payments in this period.')}
              rows={methods.map((m) => ({ key: m.id, label: tr(methodLabels[m.id]), value: m.amount, valueText: formatNgn(m.amount), meta: summary.paid ? pct(m.amount / summary.paid) : undefined }))} />
            
          </Card>
          <Card id="products" title="Products" description="By revenue, refunded orders left out.">
            <BarList
              empty={tr('No product sales in this period.')}
              rows={products.slice(0, 8).map((p) => ({ key: p.name, label: p.name, value: p.revenue, valueText: formatNgn(p.revenue), meta: tr('{n} sold', { n: p.qty }) }))} />
            
            {products.length > 8 && <p className="mt-4 text-caption text-fg-subtle">{tr('{n} more in the CSV export.', { n: products.length - 8 })}</p>}
          </Card>
          <Card id="customers" title="New and returning customers" description="Shop orders. Returning means they’d paid you before this period, matched by phone or email.">
            {summary.orders === 0 ?
            <p className="text-label text-fg-muted">{tr('No paid orders in this period.')}</p> :

            <StatGroup columns={2}>
                <Stat label="New" value={summary.newCustomers} hint={`${formatNgn(summary.newRevenue)} ${tr('spent')}`} />
                <Stat label="Returning" value={summary.returningCustomers} hint={`${formatNgn(summary.returningRevenue)} ${tr('spent')}`} />
              </StatGroup>
            }
          </Card>
        </div>

        <Section id="sources" title="Where buyers came from" description="From Analytics: visits by source and how many went on to buy, book or sign up. Only sales made in a recorded visit are counted here.">
          {sourceRows.length === 0 ?
          <p className="text-label text-fg-muted">
              {tr('No recorded visits in this period.')}{' '}
              <Link to="/app/analytics" className="font-medium text-action hover:underline">{tr('Open Analytics')}</Link>
            </p> :

          <div className="overflow-x-auto rounded-md border border-line">
              <table className="w-full min-w-[520px] text-label">
                <caption className="sr-only">{tr('Sales by visitor source')}</caption>
                <thead className="bg-sunken text-left text-caption text-fg-subtle">
                  <tr>
                    <th scope="col" className="px-4 py-2.5 font-medium">{tr('Source')}</th>
                    <th scope="col" className="px-4 py-2.5 text-right font-medium">{tr('Visits')}</th>
                    <th scope="col" className="px-4 py-2.5 text-right font-medium">{tr('Converted')}</th>
                    <th scope="col" className="px-4 py-2.5 text-right font-medium">{tr('Rate')}</th>
                    <th scope="col" className="px-4 py-2.5 text-right font-medium">{tr('Sales')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {sourceRows.map((s) =>
                <tr key={s.id}>
                      <th scope="row" className="px-4 py-2.5 text-left font-medium text-fg">{tr(sourceLabels[s.id])}</th>
                      <td className="px-4 py-2.5 text-right tabular-nums text-fg-muted">{s.visits}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-fg-muted">{s.conversions}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-fg">{pct(s.rate)}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-fg">{s.revenue ? formatNgn(s.revenue) : '—'}</td>
                    </tr>
                )}
                </tbody>
              </table>
            </div>
          }
        </Section>

        {(vatOn || vat.total > 0) &&
        <Card id="vat" title="VAT collected" description="VAT inside or added to sales in this period, from Commerce settings → Tax." footer={<p className="text-caption text-fg-subtle">{tr('For your records — check with your accountant before filing.')}</p>}>
            <StatGroup columns={3}>
              <Stat label="VAT collected" value={formatNgn(vat.total)} hint={tr(vat.count === 1 ? 'On {n} sale' : 'On {n} sales', { n: vat.count })} />
              <Stat label="Current rate" value={vatOn ? vatRateLabel(shopSettingsOf(data).tax.ratePct) : tr('Off')} hint={vatOn ? tr(shopSettingsOf(data).tax.inclusive ? 'Included in prices' : 'Added at checkout') : undefined} />
              <Stat label="Sales before VAT" value={formatNgn(Math.max(0, summary.paid - vat.total))} />
            </StatGroup>
          </Card>
        }

        <MoneyStillToCome data={data} links={money.links} range={period === 'all' ? { from: 0, to: Date.now() + 1 } : ranges.current} />

        <Section id="tx" title="Transactions" description="Every payment in the period, with fees and refunds in their own columns.">
          <DataTable caption="Transactions" rows={entries} columns={columns} emptyTitle="Nothing paid in this period" emptyDescription="Try a longer period or another space." />
        </Section>
      </PageStack>
    </>);

}