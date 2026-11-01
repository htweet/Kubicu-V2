import React from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon, MinusIcon } from 'lucide-react';
import { useAdminStore } from '../../utils/admin/store';
import { planOrder, plans } from '../../data/plans';
import { planMatrix, type PlanCell } from '../../data/planMatrix';
import { GRACE_DAYS, TRIAL_DAYS, VAT_RATE } from '../../data/billing';
import { COUPON_MAX_SHARE, GRANT_APPROVAL_AI, GRANT_APPROVAL_NGN } from '../../utils/planCatalogue';
import { formatNgn, formatRelative } from '../../utils/format';
import { PageHeader } from '../../components/shell/PageHeader';
import { Card } from '../../components/ui/layout/Card';
import { Badge } from '../../components/ui/Badge';
import { ApprovalQueue } from '../../components/admin/ApprovalQueue';
import { PlanCatalogue } from '../../components/admin/plans/PlanCatalogue';
import { WorkspaceBillingTools } from '../../components/admin/plans/WorkspaceBillingTools';
import { CouponsCard } from '../../components/admin/plans/CouponsCard';
import { ExchangeRatesCard } from '../../components/admin/plans/ExchangeRatesCard';

const statusTone = { live: 'success', preview: 'info', planned: 'neutral' } as const;
const statusLabel = { live: 'Live', preview: 'Preview', planned: 'Planned' } as const;

function Cell({ v }: {v: PlanCell;}) {
  if (v === true) return <CheckIcon size={15} className="mx-auto text-success" aria-label="Included" />;
  if (v === false) return <MinusIcon size={15} className="mx-auto text-fg-subtle" aria-label="Not included" />;
  return <span className="text-caption text-fg">{v}</span>;
}

/**
 * Super admin → Plans & entitlements (D130, editing D135): the catalogue with approved changes,
 * trials, account and AI credit, codes, the feature matrix and recent overrides.
 */
export function AdminPlans() {
  const [store] = useAdminStore();
  const overrides = store.audit.filter((e) => e.area === 'tenants' && e.action.startsWith('Changed plan') || e.area === 'plans').slice(0, 10);
  const th = 'px-3 py-2.5 text-left text-caption font-semibold text-fg-subtle';

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-10 md:py-12">
      <PageHeader title="Plans & entitlements" description="Prices and AI allowances, trials, credit and codes. Catalogue changes and large grants wait for a second staff member; everything here is in the audit log." />

      <ApprovalQueue kinds={['plan_change', 'credit_grant']} title="Waiting for a second approval" description="Catalogue changes and large credit grants. You can’t approve your own." />

      <PlanCatalogue />

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-8">
          <WorkspaceBillingTools />

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
        </div>

        <div className="flex min-w-0 flex-col gap-8">
          <ExchangeRatesCard />

          <CouponsCard />

          <Card id="rules" title="Billing rules">
            <dl className="divide-y divide-line">
              {[
              ['Free trial', `${TRIAL_DAYS} days of Pro, once per workspace, no card`],
              ['Failed renewal', `${GRACE_DAYS}-day grace period, then Free`],
              ['Yearly billing', '12 months for the price of 10'],
              ['Codes', `One per payment, at most ${COUPON_MAX_SHARE * 100}% off`],
              ['Second approval for credit over', `${formatNgn(GRANT_APPROVAL_NGN)} or ${GRANT_APPROVAL_AI} AI credits`],
              ['Tax on plan invoices', `NG ${(VAT_RATE * 100).toFixed(1)}% · KE 16% · GH 20% · ZA 15% (examples)`],
              ['Outside Nigeria', 'Naira list at the day’s rate, rounded up; invoice amount held 7 days'],
              ['Downgrades', 'At renewal; nothing is ever deleted']].
              map(([k, v]) =>
              <div key={k} className="flex justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
                  <dt className="text-label text-fg-muted">{k}</dt>
                  <dd className="text-right text-label font-medium text-fg">{v}</dd>
                </div>
              )}
            </dl>
          </Card>

          <Card id="overrides" title="Recent changes" description="Plan swaps, trials, credit, codes and catalogue requests." actions={<Link to="/admin/audit" className="text-label font-medium text-action hover:underline">Audit log</Link>} body="flush">
            {overrides.length === 0 ?
            <p className="px-5 py-5 text-label text-fg-muted md:px-6">Nothing yet.</p> :

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