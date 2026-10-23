import React, { useMemo, useState } from 'react';
import type { WorkspacePlan } from '../../types/plan';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { planOrder, plans } from '../../data/plans';
import { monthlyPriceNgn, YEARLY_MONTHS } from '../../data/billing';
import { readBilling } from '../../utils/billing';
import { readCommerce } from '../../utils/commerce/storage';
import { readAnalytics } from '../../utils/analytics/storage';
import { workspaceSpaces, readSpacePage } from '../../utils/spaces';
import { orderMoney } from '../../utils/commerce/money';
import { formatNgn } from '../../utils/format';
import { PageHeader } from '../../components/shell/PageHeader';
import { Segmented } from '../../components/ui/Segmented';
import { Stat, StatGroup } from '../../components/ui/layout/Stat';
import { Card } from '../../components/ui/layout/Card';
import { IllustrativeTag } from '../../components/ui/IllustrativeTag';

type Period = '7' | '30' | '90';
const DAY = 86400000;

interface WsStats {
  id: string;
  name: string;
  plan: WorkspacePlan;
  createdAt: string;
  mrr: number;
  live: boolean;
  gmv: number;
  orders: number;
  fees: number;
  visits: number;
}

/** Super admin → Business reporting: growth, revenue and usage across workspaces, each with its definition (D82). */
export function AdminReporting() {
  const { workspaces } = useWorkspace();
  const [period, setPeriod] = useState<Period>('30');
  const days = Number(period);

  const stats: WsStats[] = useMemo(() => {
    const since = Date.now() - days * DAY;
    return workspaces.map((w) => {
      const billing = readBilling(w.id);
      const price = monthlyPriceNgn[w.plan] ?? 0;
      // Trials pay nothing yet; a pending cancellation still pays until the period ends.
      const ended = billing?.status === 'trialing';
      const mrr = ended ? 0 : billing?.cycle === 'yearly' ? Math.round(price * YEARLY_MONTHS / 12) : price;
      const paid = (readCommerce(w.id)?.orders ?? []).filter((o) => Date.parse(o.createdAt) >= since && o.paymentStatus !== 'pending' && o.paymentStatus !== 'cancelled');
      const views = (readAnalytics(w.id)?.events ?? []).filter((e) => e.type === 'view' && Date.parse(e.at) >= since);
      return {
        id: w.id,
        name: w.name,
        plan: w.plan,
        createdAt: w.createdAt,
        mrr,
        live: workspaceSpaces(w).some((s) => !!readSpacePage(w.id, s.id)?.published),
        gmv: paid.reduce((s, o) => s + orderMoney(o).gross, 0),
        orders: paid.length,
        fees: paid.reduce((s, o) => s + o.kubicuFeeNgn, 0),
        visits: new Set(views.map((v) => v.session)).size
      };
    });
  }, [workspaces, days]);

  const total = (k: 'mrr' | 'gmv' | 'orders' | 'fees' | 'visits') => stats.reduce((s, w) => s + w[k], 0);
  const newWs = stats.filter((w) => Date.now() - Date.parse(w.createdAt) < days * DAY).length;
  const live = stats.filter((w) => w.live).length;
  const paying = stats.filter((w) => w.plan !== 'free').length;
  const top = [...stats].sort((a, b) => b.gmv - a.gmv).slice(0, 5);
  const maxPlan = Math.max(1, ...planOrder.map((p) => stats.filter((w) => w.plan === p).length));

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-10 md:py-12">
      <PageHeader
        title="Business reporting"
        description="Growth, revenue and usage across every workspace on this device. Each figure says exactly what it counts."
        actions={<Segmented<Period> size="sm" ariaLabel="Period" value={period} onChange={setPeriod} options={[{ value: '7', label: '7 days' }, { value: '30', label: '30 days' }, { value: '90', label: '90 days' }]} />} />
      

      <Card emphasis="primary" className="mt-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-caption text-fg-subtle">
                Monthly recurring revenue <IllustrativeTag note="List prices (D105), before VAT and discounts." />
              </p>
              <p className="mt-1 font-display text-[2.5rem] font-semibold leading-none tracking-[-0.025em] tabular-nums text-fg">{formatNgn(total('mrr'))}</p>
              <p className="mt-2 text-label text-fg-muted">
                From {paying} workspace{paying === 1 ? '' : 's'} on a paid plan, of {stats.length}. Trials count as ₦0.
              </p>
            </div>
          </div>
          <StatGroup columns={4} divided>
            <Stat label={`Sold through KUBICU · ${days} days`} value={formatNgn(total('gmv'))} hint={`${total('orders')} paid orders`} />
            <Stat label="KUBICU fees earned" value={formatNgn(total('fees'))} hint="Test mode" />
            <Stat label="New workspaces" value={newWs} hint={`${live} with a live page`} />
            <Stat label="Visits" value={total('visits').toLocaleString('en-NG')} hint="Sessions on public pages" />
          </StatGroup>
        </div>
      </Card>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <Card title="Plan mix" description="Workspaces on each plan today">
          <ul className="flex flex-col gap-3">
            {planOrder.map((p) => {
              const n = stats.filter((w) => w.plan === p).length;
              return (
                <li key={p} className="grid grid-cols-[6rem_minmax(0,1fr)_2rem] items-center gap-3 text-label">
                  <span className="text-fg">{plans[p].name}</span>
                  <span className="h-2 overflow-hidden rounded-full bg-sunken" aria-hidden>
                    <span className="block h-full rounded-full bg-action" style={{ width: `${n / maxPlan * 100}%` }} />
                  </span>
                  <span className="text-right tabular-nums text-fg-muted">{n}</span>
                </li>);

            })}
          </ul>
        </Card>

        <Card title="Top sellers" description={`By amount sold in the last ${days} days`} body="flush">
          {top.every((w) => w.gmv === 0) ?
          <p className="px-5 py-6 text-label text-fg-muted md:px-6">No paid orders in this period.</p> :

          <table className="w-full text-label">
              <caption className="sr-only">Top sellers by amount sold</caption>
              <thead>
                <tr className="text-caption text-fg-subtle">
                  <th scope="col" className="px-5 py-3 text-left font-medium md:px-6">Workspace</th>
                  <th scope="col" className="px-3 py-3 text-right font-medium">Orders</th>
                  <th scope="col" className="px-5 py-3 text-right font-medium md:px-6">Sold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line border-t border-line">
                {top.
              filter((w) => w.gmv > 0).
              map((w) =>
              <tr key={w.id}>
                      <th scope="row" className="px-5 py-3 text-left font-semibold text-fg md:px-6">
                        {w.name}
                        <span className="block text-caption font-normal text-fg-subtle">{plans[w.plan].name}</span>
                      </th>
                      <td className="px-3 py-3 text-right tabular-nums text-fg-muted">{w.orders}</td>
                      <td className="px-5 py-3 text-right font-semibold tabular-nums text-fg md:px-6">{formatNgn(w.gmv)}</td>
                    </tr>
              )}
              </tbody>
            </table>
          }
        </Card>
      </div>

      <section aria-labelledby="rep-defs" className="mt-10 border-t border-line pt-8">
        <h2 id="rep-defs" className="text-heading font-semibold text-fg">
          Definitions
        </h2>
        <dl className="mt-4 grid gap-x-10 gap-y-4 text-label md:grid-cols-2">
          {[
          ['Monthly recurring revenue', 'Each active paid workspace’s plan list price per month. Yearly plans are divided by 12. Trials and Enterprise (quoted) count as ₦0; plans set to cancel still count until they end.'],
          ['Sold through KUBICU', 'What customers paid for orders placed in the period, including delivery and after discounts. Pending and cancelled orders are excluded; refunds are not subtracted.'],
          ['KUBICU fees earned', 'The platform fee on those orders. Example rates (D40) — no real money moves in the prototype.'],
          ['Visits', 'Distinct visitor sessions (30 minutes) on public pages. Owner previews and template examples aren’t counted (D61).'],
          ['New workspaces', 'Workspaces created in the period. “Live page” means at least one space is published.'],
          ['Scope', 'Every workspace stored on this device. Production reporting will read the platform database and refresh hourly.']].
          map(([term, def]) =>
          <div key={term}>
              <dt className="font-semibold text-fg">{term}</dt>
              <dd className="mt-0.5 text-fg-muted">{def}</dd>
            </div>
          )}
        </dl>
      </section>
    </div>);

}