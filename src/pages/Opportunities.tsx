import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { InboxIcon, PartyPopperIcon, ShoppingCartIcon } from 'lucide-react';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { anonymousCarts } from '../utils/analytics/anonymousCarts';
import { toast } from 'sonner';
import { useCommerce } from '../contexts/CommerceContext';
import { useOps } from '../contexts/OpsContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useT } from '../contexts/LocaleContext';
import { buildOpportunities, groupLabels, type OpportunityGroup } from '../utils/opportunities';
import { useOpportunityState } from '../hooks/useOpportunityState';
import { useMarketplace } from '../contexts/MarketplaceContext';
import { useServiceOs } from '../hooks/useServiceOs';
import { SERVICE_OS_APP_ID } from '../utils/serviceOs';
import { formatNgn } from '../utils/format';
import { PageHeader } from '../components/shell/PageHeader';
import { PageStack } from '../components/ui/layout/Section';
import { Card } from '../components/ui/layout/Card';
import { Stat, StatGroup } from '../components/ui/layout/Stat';
import { Segmented } from '../components/ui/Segmented';
import { EmptyState } from '../components/ui/EmptyState';
import { OpportunityRow } from '../components/opportunities/OpportunityRow';

type Filter = 'all' | OpportunityGroup;
type View = 'open' | 'hidden';

/** Opportunity Inbox (concept 12, D81): one place for money and customers that need a nudge. */
export function Opportunities() {
  const { t: tr } = useT();
  const commerce = useCommerce().data;
  const ops = useOps().data;
  const { current } = useWorkspace();
  const { state, snooze, dismiss, restore, isHidden } = useOpportunityState(current.id);
  const [filter, setFilter] = useState<Filter>('all');
  const [view, setView] = useState<View>('open');

  const quotesActive = useMarketplace().isActive(SERVICE_OS_APP_ID);
  const serviceOs = useServiceOs(current.id).data;
  const all = useMemo(() => buildOpportunities(commerce, ops, current.name, Date.now(), quotesActive ? serviceOs : null), [commerce, ops, current.name, quotesActive, serviceOs]);
  const open = all.filter((o) => !isHidden(o.id));
  const hidden = all.filter((o) => isHidden(o.id));
  const list = (view === 'open' ? open : hidden).filter((o) => filter === 'all' || o.group === filter);

  const analytics = useAnalytics().data;
  const carts = useMemo(() => anonymousCarts(analytics.events, Date.now()), [analytics.events]);
  const atStake = open.reduce((s, o) => s + (o.valueNgn ?? 0), 0);
  const payments = open.filter((o) => o.group === 'payments');
  const people = open.filter((o) => o.group === 'customers' || o.group === 'bookings');
  const withAmount = open.filter((o) => o.valueNgn !== null).length;

  const counts = (g: OpportunityGroup) => (view === 'open' ? open : hidden).filter((o) => o.group === g).length;
  const filterOptions: {value: Filter;label: string;}[] = [
  { value: 'all', label: tr('All') },
  ...(Object.keys(groupLabels) as OpportunityGroup[]).map((g) => ({ value: g, label: `${tr(groupLabels[g])}${counts(g) ? ` ${counts(g)}` : ''}` }))];


  const hiddenNote = (id: string) =>
  state.dismissed[id] ?
  tr('handled') :
  tr('snoozed until {date}', { date: new Date(state.snoozed[id]).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) });

  return (
    <div className="w-full">
      <PageHeader title={tr('Opportunities')} description={tr('Money and customers that are one small step from coming back. Everything here comes from your real orders, bookings and contacts.')} />

      <PageStack>
        <Card emphasis="primary">
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-caption text-fg-subtle">{tr('Still on the table')}</p>
              <p className="mt-1 font-display text-[2.25rem] font-semibold leading-none tracking-[-0.025em] tabular-nums text-fg md:text-[2.75rem]">{formatNgn(atStake)}</p>
              <p className="mt-2 max-w-xl text-label text-fg-muted">
                {open.length === 0 ?
                tr('Nothing waiting right now.') :
                tr('Across {n} items with a known amount — unpaid checkouts, failed renewals, deposits and missed bookings. Leads and follow-ups have no amount, but they’re often worth the most.', { n: withAmount })}
              </p>
            </div>
            <StatGroup columns={3} divided>
              <Stat label={tr('Payments to recover')} value={payments.length} hint={payments.length ? formatNgn(payments.reduce((s, o) => s + (o.valueNgn ?? 0), 0)) : tr('All paid up')} />
              <Stat label={tr('People to get back to')} value={people.length} hint={tr('Leads, follow-ups and bookings')} />
              <Stat label={tr('Handled or snoozed')} value={hidden.length} hint={tr('Come back when a snooze ends')} />
            </StatGroup>
          </div>
        </Card>

        {carts.count > 0 &&
        <div className="flex flex-col gap-3 rounded-lg border border-line bg-raised px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <ShoppingCartIcon size={18} className="mt-0.5 shrink-0 text-fg-subtle" aria-hidden />
              <div>
                <p className="text-label font-semibold text-fg">
                  {tr('Carts left before checkout this week: {n}', { n: carts.count })}
                  {carts.valueNgn ? ` · ${formatNgn(carts.valueNgn)}` : ''}
                  {carts.sample ? ` (${tr('includes sample visits')})` : ''}
                </p>
                <p className="text-caption text-fg-muted">{tr('No name or number was left, so we can’t show who. Asking for a WhatsApp number earlier — or offering “Order on WhatsApp” — turns more of these into conversations.')}</p>
              </div>
            </div>
            <Link to="/app/commerce/settings#checkout" className="shrink-0 text-caption font-semibold text-action hover:underline">
              {tr('Checkout settings')}
            </Link>
          </div>
        }

        <section aria-labelledby="opp-list-title" className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <h2 id="opp-list-title" className="text-heading font-semibold text-fg">
              {view === 'open' ? tr('Waiting for you') : tr('Handled and snoozed')}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="scroll-quiet -mx-1 max-w-full overflow-x-auto overflow-y-hidden px-1">
                <Segmented size="sm" ariaLabel={tr('Show')} value={filter} options={filterOptions} onChange={setFilter} />
              </div>
              <Segmented
                size="sm"
                ariaLabel={tr('List')}
                value={view}
                options={[
                { value: 'open', label: `${tr('Open')} ${open.length}` },
                { value: 'hidden', label: `${tr('Hidden')} ${hidden.length}` }]
                }
                onChange={setView} />
              
            </div>
          </div>

          <Card body="flush">
            {list.length === 0 ?
            view === 'open' && open.length === 0 ?
            <EmptyState icon={PartyPopperIcon} title={tr('You’re all caught up')} description={tr('New unpaid checkouts, failed renewals, no-shows and unanswered leads will appear here.')} /> :

            <EmptyState icon={InboxIcon} title={tr('Nothing in this view')} description={view === 'open' ? tr('Try another filter.') : tr('Items you mark as handled or snooze appear here.')} /> :


            <ul aria-labelledby="opp-list-title" className="flex flex-col divide-y divide-line">
                {list.map((o) =>
              <OpportunityRow
                key={o.id}
                item={o}
                hiddenNote={view === 'hidden' ? hiddenNote(o.id) : undefined}
                onSnooze={(days) => {
                  snooze(o.id, days);
                  toast(tr('Snoozed'), { description: days === 1 ? tr('It’ll come back tomorrow.') : tr('It’ll come back next week.'), action: { label: tr('Undo'), onClick: () => restore(o.id) } });
                }}
                onDismiss={() => {
                  dismiss(o.id);
                  toast(tr('Marked as handled'), { action: { label: tr('Undo'), onClick: () => restore(o.id) } });
                }}
                onRestore={() => restore(o.id)} />

              )}
              </ul>
            }
          </Card>
          <p className="text-caption text-fg-subtle">{tr('“Message” opens WhatsApp with a suggested note you can edit before sending. Nothing is sent automatically.')}</p>
        </section>
      </PageStack>
    </div>);

}