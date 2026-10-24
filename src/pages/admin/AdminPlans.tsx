import React from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon, MinusIcon } from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useAdminStore } from '../../utils/admin/store';
import { planOrder, plans } from '../../data/plans';
import { planMatrix, type PlanCell } from '../../data/planMatrix';
import { monthlyPriceNgn, GRACE_DAYS, TRIAL_DAYS, VAT_RATE } from '../../data/billing';
import { pageLimits } from '../../utils/sitePages';
import { aiCredits } from '../../data/aiLimits';
import { kubicuRateByPlan } from '../../utils/commerce/money';
import { formatNgn, formatRelative } from '../../utils/format';
import { PageHeader } from '../../components/shell/PageHeader';
import { Card } from '../../components/ui/layout/Card';
import { Badge } from '../../components/ui/Badge';

const statusTone = { live: 'success', preview: 'info', planned: 'neutral' } as const;
const statusLabel = { live: 'Live', preview: 'Preview', planned: 'Planned' } as const;

function Cell({ v }: {v: PlanCell;}) {
  if (v === true) return <CheckIcon size={15} className="mx-auto text-success" aria-label="Included" />;
  if (v === false) return <MinusIcon size={15} className="mx-auto text-fg-subtle" aria-label="Not included" />;
  return <span className="text-caption text-fg">{v}</span>;
}

/** Super admin → Plans & entitlements (D130): the catalogue, what each plan includes, and overrides given to workspaces. Read-only. */
export function AdminPlans() {
  const { workspaces } = useWorkspace();
  const [store] = useAdminStore();
  const overrides = store.audit.filter((e) => e.area === 'tenants' && e.action.startsWith('Changed plan')).slice(0, 10);
  const th = 'px-3 py-2.5 text-left text-caption font-semibold text-fg-subtle';
  const td = 'px-3 py-3 text-label tabular-nums';

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-10 md:py-12">
      <PageHeader title="Plans & entitlements" description="Prices, limits and features ship with a release, so this screen is read-only — a typo here can’t change every customer’s bill. Give one workspace a different plan from Users & tenants." />

      <Card id="catalogue" title="Plan catalogue" description="Launch prices and limits confirmed in D105." body="flush" emphasis="primary" className="mt-8">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <caption className="sr-only">Plan catalogue</caption>
            <thead className="border-b border-line">
              <tr>
                <th scope="col" className={`${th} pl-5 md:pl-6`}>Plan</th>
                <th scope="col" className={`${th} text-right`}>Monthly</th>
                <th scope="col" className={`${th} text-right`}>Pages per space</th>
                <th scope="col" className={`${th} text-right`}>AI credits / month</th>
                <th scope="col" className={`${th} text-right`}>KUBICU fee on sales</th>
                <th scope="col" className={`${th} pr-5 text-right md:pr-6`}>Workspaces here</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {planOrder.map((p) =>
              <tr key={p}>
                  <th scope="row" className={`${td} pl-5 text-left font-semibold text-fg md:pl-6`}>
                    {plans[p].name}
                    <span className="block text-caption font-normal text-fg-subtle">{plans[p].intendedFor}</span>
                  </th>
                  <td className={`${td} text-right text-fg`}>{monthlyPriceNgn[p] === null ? 'Talk to us' : monthlyPriceNgn[p] === 0 ? 'Free' : formatNgn(monthlyPriceNgn[p] as number)}</td>
                  <td className={`${td} text-right text-fg-muted`}>{pageLimits[p]}</td>
                  <td className={`${td} text-right text-fg-muted`}>{aiCredits[p].toLocaleString()}</td>
                  <td className={`${td} text-right text-fg-muted`}>{(kubicuRateByPlan[p] * 100).toLocaleString(undefined, { maximumFractionDigits: 1 })}%</td>
                  <td className={`${td} pr-5 text-right text-fg md:pr-6`}>{workspaces.filter((w) => w.plan === p).length}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card id="matrix" title="What each plan includes" description="The same list the public Pricing page uses. Open an area to see its rows." body="flush">
          <div className="divide-y divide-line">
            {planMatrix.map((g, gi) =>
            <details key={g.area} open={gi === 0} className="group">
                <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-3.5 text-label font-semibold text-fg hover:bg-sunken md:px-6">
                  {g.area}
                  <span className="text-caption font-normal text-fg-subtle">{g.rows.length} features</span>
                </summary>
                <div className="overflow-x-auto pb-2">
                  <table className="w-full min-w-[640px]">
                    <caption className="sr-only">{g.area} features by plan</caption>
                    <thead>
                      <tr>
                        <th scope="col" className={`${th} pl-5 md:pl-6`}>Feature</th>
                        {planOrder.map((p) =>
                      <th key={p} scope="col" className={`${th} text-center`}>
                            {plans[p].name}
                          </th>
                      )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {g.rows.map((r) =>
                    <tr key={r.label}>
                          <th scope="row" className="px-3 py-2.5 pl-5 text-left text-label font-normal text-fg md:pl-6">
                            <span className="flex flex-wrap items-center gap-1.5">
                              {r.label}
                              {r.status !== 'live' && <Badge tone={statusTone[r.status]}>{statusLabel[r.status]}</Badge>}
                            </span>
                            {r.note && <span className="block text-caption text-fg-subtle">{r.note}</span>}
                          </th>
                          {planOrder.map((p) =>
                      <td key={p} className="px-3 py-2.5 text-center">
                              <Cell v={r.values[p]} />
                            </td>
                      )}
                        </tr>
                    )}
                    </tbody>
                  </table>
                </div>
              </details>
            )}
          </div>
        </Card>

        <div className="flex flex-col gap-8">
          <Card id="rules" title="Billing rules">
            <dl className="divide-y divide-line">
              {[
              ['Free trial', `${TRIAL_DAYS} days of Pro, once per workspace, no card`],
              ['Failed renewal', `${GRACE_DAYS}-day grace period, then Free`],
              ['Yearly billing', '12 months for the price of 10'],
              ['VAT on plan invoices', `${(VAT_RATE * 100).toFixed(1)}%`],
              ['Downgrades', 'At renewal; nothing is ever deleted']].
              map(([k, v]) =>
              <div key={k} className="flex justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
                  <dt className="text-label text-fg-muted">{k}</dt>
                  <dd className="text-right text-label font-medium text-fg">{v}</dd>
                </div>
              )}
            </dl>
          </Card>

          <Card id="overrides" title="Recent plan overrides" description="Plans staff changed by hand. No charge or refund is made." actions={<Link to="/admin/tenants" className="text-label font-medium text-action hover:underline">Users & tenants</Link>} body="flush">
            {overrides.length === 0 ?
            <p className="px-5 py-5 text-label text-fg-muted md:px-6">No overrides yet.</p> :

            <ul className="divide-y divide-line">
                {overrides.map((e) =>
              <li key={e.id} className="px-5 py-3 md:px-6">
                    <p className="text-label font-medium text-fg">
                      {e.target} <span className="font-normal text-fg-muted">· {e.action.replace('Changed plan ', '')}</span>
                    </p>
                    <p className="mt-0.5 text-caption text-fg-subtle">
                      “{e.reason}” · {e.actor.split(' ·')[0]} · {formatRelative(e.at)}
                    </p>
                  </li>
              )}
              </ul>
            }
          </Card>
        </div>
      </div>
    </div>);

}