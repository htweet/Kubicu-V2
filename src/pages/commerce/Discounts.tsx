import React, { useMemo, useState } from 'react';
import { ChevronDownIcon, PlusIcon, SparklesIcon, TagIcon, UsersIcon } from 'lucide-react';
import type { Discount, DiscountKind } from '../../types/commerce';
import { useCommerce } from '../../contexts/CommerceContext';
import { usePlan } from '../../contexts/PlanContext';
import { planAtLeast, plans } from '../../data/plans';
import { CHECKOUT_PLAN } from '../../utils/commerce/linkIssues';
import { discountKindLabel, discountOrders, discountStatus, discountStatusLabel, valueLabel, type DiscountStatus } from '../../utils/commerce/discounts';
import { formatNgn, formatTimestamp } from '../../utils/format';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge, type BadgeTone } from '../../components/ui/Badge';
import { Menu } from '../../components/ui/Menu';
import { DataTable, type DataColumn } from '../../components/ui/DataTable';
import { EmptyState } from '../../components/ui/EmptyState';
import { InlineAlert } from '../../components/ui/InlineAlert';
import { UpgradeButton } from '../../components/ui/UpgradeButton';
import { DiscountEditor } from '../../components/commerce/DiscountEditor';
import { SampleTag } from '../../components/commerce/StatusBadges';
import { Card } from '../../components/ui/layout/Card';
import { List } from '../../components/ui/layout/ListRow';
import { Stat, StatGroup } from '../../components/ui/layout/Stat';
import { useT } from '../../contexts/LocaleContext';

const statusTone: Record<DiscountStatus, BadgeTone> = { active: 'success', scheduled: 'info', expired: 'neutral', used_up: 'neutral', paused: 'warning' };
const kindIcon = { code: TagIcon, automatic: SparklesIcon, referral: UsersIcon };

interface Row extends Discount {
  status: DiscountStatus;
  uses: number;
  totalNgn: number;
}

export function Discounts() {
  const { data } = useCommerce();
  const plan = usePlan();
  const { t: tr } = useT();
  const valueText = (v: Discount['value']) =>
  v.type === 'percent' ? tr('{v} off', { v: `${v.percent}%` }) : v.type === 'fixed' ? tr('{v} off', { v: formatNgn(v.amountNgn) }) : tr('Free delivery');
  const [target, setTarget] = useState<{discount: Discount;} | {kind: DiscountKind;} | null>(null);
  const checkoutAllowed = planAtLeast(plan.id, CHECKOUT_PLAN);

  const rows: Row[] = useMemo(
    () =>
    data.discounts.map((d) => {
      const orders = discountOrders(data, d.id);
      return { ...d, status: discountStatus(d, data), uses: orders.length, totalNgn: orders.reduce((t, o) => t + o.discountNgn, 0) };
    }),
    [data]
  );
  const live = rows.filter((r) => r.status === 'active');
  const given = rows.reduce((t, r) => t + r.totalNgn, 0);
  const referrals = rows.filter((r) => r.kind === 'referral').sort((a, b) => b.uses - a.uses);

  const newMenu =
  <Menu
    align="end"
    items={[
    { id: 'code', label: 'Discount code', icon: TagIcon, onSelect: () => setTarget({ kind: 'code' }) },
    { id: 'automatic', label: 'Automatic offer', icon: SparklesIcon, onSelect: () => setTarget({ kind: 'automatic' }) },
    { id: 'referral', label: 'Referral code', icon: UsersIcon, onSelect: () => setTarget({ kind: 'referral' }) }]
    }
    trigger={(props) =>
    <Button {...props} leadingIcon={PlusIcon} trailingIcon={ChevronDownIcon}>
          {tr('New discount')}
        </Button>
    } />;



  const columns: DataColumn<Row>[] = [
  {
    key: 'name',
    header: 'Discount',
    sortValue: (r) => r.code || r.title,
    render: (r) => {
      const Icon = kindIcon[r.kind];
      return (
        <button type="button" onClick={() => setTarget({ discount: r })} className="flex min-w-0 items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sunken text-fg-muted">
              <Icon size={15} aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-2">
                <span className={r.code ? 'font-mono font-semibold text-fg' : 'font-semibold text-fg'}>{r.code || r.title}</span>
                {r.sample && <SampleTag />}
              </span>
              <span className="block truncate text-caption text-fg-subtle">{r.code ? r.title : tr(discountKindLabel[r.kind])}{r.referrerName ? ` · ${r.referrerName}` : ''}</span>
            </span>
          </button>);

    }
  },
  { key: 'value', header: 'Value', hideOnMobile: true, render: (r) => <span className="text-fg-muted">{valueText(r.value)}{r.minSubtotalNgn ? ` ${tr('over {amount}', { amount: formatNgn(r.minSubtotalNgn) })}` : ''}</span> },
  { key: 'status', header: 'Status', sortValue: (r) => r.status, render: (r) => <Badge tone={statusTone[r.status]} dot>{discountStatusLabel[r.status]}</Badge> },
  { key: 'ends', header: 'Ends', hideOnMobile: true, sortValue: (r) => r.endsAt ? Date.parse(r.endsAt) : Infinity, render: (r) => <span className="text-fg-muted">{r.endsAt ? formatTimestamp(r.endsAt) : tr('No end')}</span> },
  { key: 'uses', header: 'Uses', align: 'right', sortValue: (r) => r.uses, render: (r) => <span className="tabular-nums">{r.uses}{r.usageLimit !== null ? <span className="text-fg-subtle"> / {r.usageLimit}</span> : null}</span> },
  { key: 'total', header: 'Discounted', align: 'right', sortValue: (r) => r.totalNgn, render: (r) => <span className="tabular-nums text-fg-muted">{r.totalNgn ? `−${formatNgn(r.totalNgn)}` : '—'}</span> }];


  return (
    <>
      <PageHeader title="Discounts" description="Codes, automatic offers and referral codes. One discount per order — customers always get whichever saves them more." actions={newMenu} />

      {!checkoutAllowed &&
      <InlineAlert tone="info" title={tr('Discounts apply at checkout, which is on {plan}', { plan: plans[CHECKOUT_PLAN].name })} className="mt-6" action={<UpgradeButton plan={CHECKOUT_PLAN} feature="Checkout with discounts" />}>
          {tr('You can set up codes now. WhatsApp orders on {plan} don’t apply them automatically.', { plan: plan.name })}
        </InlineAlert>
      }

      {rows.length === 0 ?
      <EmptyState framed className="mt-8" icon={TagIcon} title="No discounts yet" description="Create a code to share for a sale, an automatic offer for big orders, or a personal code for someone who sends you customers." action={newMenu} /> :

      <>
          <StatGroup columns={3} className="mt-8 items-end border-b border-line pb-6">
            <Stat primary label="Discounts given" value={formatNgn(given)} />
            <Stat label="Active now" value={live.length} />
            <Stat label="Orders with a discount" value={rows.reduce((t, r) => t + r.uses, 0)} />
          </StatGroup>

          <div className="mt-8 grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
            <DataTable caption="Discounts" rows={rows} columns={columns} filterText={(r) => `${r.code} ${r.title} ${r.referrerName ?? ''}`} filterPlaceholder="Search codes" emptyTitle="No discounts match" />
            <Card
            id="referrers"
            title="Top referrers"
            footer={<p className="text-caption text-fg-subtle">{tr('Rewards are notes for you to honour. KUBICU doesn’t pay anything out.')}</p>}>
            
              {referrals.length === 0 ?
            <p className="text-caption text-fg-muted">{tr('Give a regular customer their own code. Each order they send shows up here.')}</p> :

            <List ordered label={tr('Top referrers')} className="-my-2.5">
                  {referrals.slice(0, 5).map((r) =>
              <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
                      <span className="min-w-0">
                        <span className="block truncate text-label font-medium text-fg">{r.referrerName}</span>
                        <span className="block truncate text-caption text-fg-subtle">{r.rewardNote || r.code}</span>
                      </span>
                      <span className="shrink-0 text-label font-semibold tabular-nums text-fg">
                        {r.uses} <span className="font-normal text-fg-subtle">{tr(r.uses === 1 ? 'order' : 'orders')}</span>
                      </span>
                    </li>
              )}
                </List>
            }
            </Card>
          </div>
        </>
      }

      <DiscountEditor target={target} onClose={() => setTarget(null)} />
    </>);

}