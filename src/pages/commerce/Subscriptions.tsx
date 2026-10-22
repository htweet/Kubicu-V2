import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ChevronDownIcon, FlaskConicalIcon, PackageIcon, PlusIcon, RepeatIcon, UsersIcon } from 'lucide-react';
import type { SubPlan, SubPlanKind, Subscription, SubStatus } from '../../types/subscriptions';
import { useCommerce } from '../../contexts/CommerceContext';
import { useBilling } from '../../contexts/BillingContext';
import { usePlan } from '../../contexts/PlanContext';
import { useTeam } from '../../contexts/TeamContext';
import { planAtLeast, plans } from '../../data/plans';
import { CHECKOUT_PLAN } from '../../utils/commerce/linkIssues';
import { boxShortfall, mrr, nextDueAt, priceLine, runNextNow, seatsTaken, subDate, subStatusLabels } from '../../utils/commerce/subscriptions';
import { formatNgn } from '../../utils/format';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Menu } from '../../components/ui/Menu';
import { Segmented } from '../../components/ui/Segmented';
import { SelectInput } from '../../components/ui/SelectInput';
import { DataTable, type DataColumn } from '../../components/ui/DataTable';
import { EmptyState } from '../../components/ui/EmptyState';
import { InlineAlert } from '../../components/ui/InlineAlert';
import { UpgradeButton } from '../../components/ui/UpgradeButton';
import { SampleTag } from '../../components/commerce/StatusBadges';
import { SubStatusBadge } from '../../components/subscriptions/SubStatusBadge';
import { SubscriberDetail } from '../../components/subscriptions/SubscriberDetail';
import { SubPlanEditor } from '../../components/subscriptions/SubPlanEditor';

type Tab = 'subscribers' | 'plans';
type StatusFilter = 'all' | SubStatus;
const DAY = 86400000;

interface SubRow extends Subscription {
  planName: string;
  next: string | null;
}

/** Commerce → Subscriptions: subscribers, plans and recurring revenue (D69). */
export function Subscriptions() {
  const { data, applySystem } = useCommerce();
  const { renewalOutcome } = useBilling();
  const plan = usePlan();
  const team = useTeam();
  const [tab, setTab] = useState<Tab>('subscribers');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [editing, setEditing] = useState<{plan: SubPlan;} | {kind: SubPlanKind;} | null>(null);
  const allowed = planAtLeast(plan.id, CHECKOUT_PLAN);
  const canPlans = team.can('products.edit');
  const now = Date.now();

  const rows: SubRow[] = useMemo(
    () => data.subscriptions.map((s) => ({ ...s, planName: data.subPlans.find((p) => p.id === s.planId)?.name ?? 'Removed plan', next: nextDueAt(s) })).filter((s) => status === 'all' || s.status === status),
    [data, status]
  );
  const recent = (iso: string | null) => !!iso && now - Date.parse(iso) <= 30 * DAY;
  const stats = {
    mrr: mrr(data),
    paying: data.subscriptions.filter((s) => s.status === 'active' || s.status === 'cancelling' || s.status === 'past_due').length,
    trials: data.subscriptions.filter((s) => s.status === 'trialing').length,
    joined: data.subscriptions.filter((s) => recent(s.startedAt)).length,
    left: data.subscriptions.filter((s) => s.status === 'ended' && recent(s.endedAt)).length,
    failing: data.subscriptions.filter((s) => s.status === 'past_due').length
  };

  const newMenu =
  <Menu
    align="end"
    items={[
    { id: 'membership', label: 'Membership', icon: UsersIcon, onSelect: () => setEditing({ kind: 'membership' }) },
    { id: 'box', label: 'Product box', icon: PackageIcon, onSelect: () => setEditing({ kind: 'box' }) }]
    }
    trigger={(props) =>
    <Button {...props} leadingIcon={PlusIcon} trailingIcon={ChevronDownIcon} disabled={!canPlans.allowed}>
          New plan
        </Button>
    } />;



  const columns: DataColumn<SubRow>[] = [
  {
    key: 'name',
    header: 'Subscriber',
    sortValue: (r) => r.customer.name,
    render: (r) =>
    <button type="button" onClick={() => setOpenId(r.id)} className="min-w-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          <span className="flex items-center gap-2">
            <span className="font-semibold text-fg">{r.customer.name}</span>
            {r.sample && <SampleTag />}
          </span>
          <span className="block truncate text-caption text-fg-subtle">{r.planName}</span>
        </button>

  },
  { key: 'status', header: 'Status', sortValue: (r) => r.status, render: (r) => <SubStatusBadge status={r.status} /> },
  {
    key: 'next',
    header: 'Next',
    hideOnMobile: true,
    sortValue: (r) => r.next ? Date.parse(r.next) : Infinity,
    render: (r) =>
    <span className="text-fg-muted">
          {r.status === 'ended' ? `Ended ${r.endedAt ? subDate(r.endedAt) : ''}` : r.status === 'cancelling' ? `Ends ${subDate(r.periodEnd)}` : r.status === 'past_due' ? `Retry ${r.next ? subDate(r.next) : ''}` : r.next ? subDate(r.next) : '—'}
        </span>

  },
  {
    key: 'paid',
    header: 'Paid so far',
    align: 'right',
    sortValue: (r) => r.payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amountNgn, 0),
    render: (r) => <span className="tabular-nums">{formatNgn(r.payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amountNgn, 0))}</span>
  }];


  const runNow = () => {
    let count = 0;
    applySystem((d) => {
      const r = runNextNow(d, renewalOutcome, plan.id);
      count = r.count;
      return r.data;
    });
    toast(count ? `Ran the next step for ${count} subscription${count === 1 ? '' : 's'}` : 'Nothing to run', { description: count ? `Renewals ${renewalOutcome === 'succeeds' ? 'succeeded' : 'failed'} (Simulate next renewal in the Controls panel). Sample subscribers are left alone.` : 'Sample subscribers are left alone — sign up from your page first.' });
  };

  return (
    <>
      <PageHeader title="Subscriptions" description="Memberships and product boxes your customers pay for every week, month or year. Subscribers manage their own plan from a personal link." actions={newMenu} />

      {!allowed &&
      <InlineAlert tone="info" title={`Taking subscriptions needs ${plans[CHECKOUT_PLAN].name}`} className="mt-6" action={<UpgradeButton plan={CHECKOUT_PLAN} feature="Subscriptions and recurring payments" />}>
          You can set up plans now. The Subscription block can’t be published on {plan.name}.
        </InlineAlert>
      }

      <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-b border-line pb-6">
        <div>
          <dt className="text-caption text-fg-subtle">Monthly recurring revenue</dt>
          <dd className="mt-1 text-[1.75rem] font-semibold leading-none tracking-[-0.02em] tabular-nums text-fg">{formatNgn(stats.mrr)}</dd>
          <dd className="mt-1 text-caption text-fg-subtle">{stats.paying} paying · {stats.trials} on trial</dd>
        </div>
        <div>
          <dt className="text-caption text-fg-subtle">Joined, 30 days</dt>
          <dd className="mt-1 text-heading font-semibold tabular-nums text-fg">{stats.joined}</dd>
        </div>
        <div>
          <dt className="text-caption text-fg-subtle">Left, 30 days</dt>
          <dd className="mt-1 text-heading font-semibold tabular-nums text-fg">{stats.left}</dd>
        </div>
        <div>
          <dt className="text-caption text-fg-subtle">Payments failing</dt>
          <dd className={`mt-1 text-heading font-semibold tabular-nums ${stats.failing ? 'text-danger' : 'text-fg'}`}>{stats.failing}</dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
        <Segmented<Tab>
          ariaLabel="Subscriptions view"
          value={tab}
          onChange={setTab}
          options={[
          { value: 'subscribers', label: `Subscribers (${data.subscriptions.length})` },
          { value: 'plans', label: `Plans (${data.subPlans.length})` }]
          } />
        
        {tab === 'subscribers' && data.subscriptions.length > 0 &&
        <div className="w-full sm:w-[220px]">
            <SelectInput<StatusFilter> id="sub-status" label="Status" value={status} onChange={setStatus} options={[{ value: 'all', label: 'All statuses' }, ...(Object.keys(subStatusLabels) as SubStatus[]).map((s) => ({ value: s, label: subStatusLabels[s] }))]} />
          </div>
        }
      </div>

      <div className="mt-4">
        {tab === 'subscribers' ?
        data.subscriptions.length === 0 ?
        <div className="rounded-lg border border-line bg-raised">
              <EmptyState
            icon={RepeatIcon}
            title="No subscribers yet"
            description={data.subPlans.length ? 'Add a Subscription block to your page in the canvas. Sign-ups appear here.' : 'Create a membership or a product box, then add a Subscription block to your page.'}
            action={data.subPlans.length ? undefined : newMenu} />
          
            </div> :

        <DataTable caption="Subscribers" rows={rows} columns={columns} filterText={(r) => `${r.customer.name} ${r.customer.phone} ${r.customer.email} ${r.planName}`} filterPlaceholder="Search subscribers" emptyTitle="No subscribers match" /> :

        data.subPlans.length === 0 ?
        <div className="rounded-lg border border-line bg-raised">
            <EmptyState icon={RepeatIcon} title="No plans yet" description="A membership for recurring access, or a product box that delivers from your catalogue every cycle." action={newMenu} />
          </div> :

        <ul className="divide-y divide-line rounded-lg border border-line bg-raised">
            {data.subPlans.map((p) => {
            const taken = seatsTaken(data, p.id);
            const short = boxShortfall(data, p);
            return (
              <li key={p.id}>
                  <button type="button" onClick={() => setEditing({ plan: p })} className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3.5 text-left transition-colors duration-150 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sunken text-fg-muted">{p.kind === 'box' ? <PackageIcon size={16} aria-hidden /> : <UsersIcon size={16} aria-hidden />}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="font-semibold text-fg">{p.name}</span>
                        {p.sample && <SampleTag />}
                        {p.status === 'archived' && <Badge tone="neutral">Archived</Badge>}
                      </span>
                      <span className="block text-caption text-fg-subtle">
                        {p.kind === 'box' ? 'Product box' : 'Membership'} · {priceLine(p)}
                        {p.trialDays ? ` · ${p.trialDays}-day trial` : ''}
                        {p.setupFeeNgn ? ` · ${formatNgn(p.setupFeeNgn)} setup` : ''}
                      </span>
                      {short.length > 0 && <span className="block text-caption font-medium text-warning">Not enough stock for the next box: {short.join(', ')}</span>}
                    </span>
                    <span className="text-label tabular-nums text-fg-muted">
                      {taken}
                      {p.memberCap !== null ? ` / ${p.memberCap}` : ''} subscriber{taken === 1 && p.memberCap === null ? '' : 's'}
                    </span>
                  </button>
                </li>);

          })}
          </ul>
        }
      </div>

      <section aria-labelledby="sub-proto" className="mt-10 flex flex-col gap-3 rounded-lg border border-dashed border-line-strong p-4">
        <h2 id="sub-proto" className="flex items-center gap-2 text-label font-semibold text-fg">
          <FlaskConicalIcon size={15} aria-hidden /> Prototype: skip ahead in time
        </h2>
        <p className="text-caption text-fg-muted">
          Renewals, trial ends and retries run by themselves while KUBICU is open. To see the next step now, run it here. Outcomes follow <span className="font-medium text-fg">Simulate next renewal</span> in the Controls panel (now: {renewalOutcome === 'succeeds' ? 'succeeds' : 'fails'}).
        </p>
        <Button size="sm" variant="secondary" className="self-start" onClick={runNow}>
          Run renewals now
        </Button>
      </section>

      <SubscriberDetail subId={openId} onClose={() => setOpenId(null)} />
      <SubPlanEditor target={editing} onClose={() => setEditing(null)} />
    </>);

}