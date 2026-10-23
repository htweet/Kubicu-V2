import React, { useMemo, useState } from 'react';
import { InboxIcon, PartyPopperIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useCommerce } from '../contexts/CommerceContext';
import { useOps } from '../contexts/OpsContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
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

  const atStake = open.reduce((s, o) => s + (o.valueNgn ?? 0), 0);
  const payments = open.filter((o) => o.group === 'payments');
  const people = open.filter((o) => o.group === 'customers' || o.group === 'bookings');
  const withAmount = open.filter((o) => o.valueNgn !== null).length;

  const counts = (g: OpportunityGroup) => (view === 'open' ? open : hidden).filter((o) => o.group === g).length;
  const filterOptions: {value: Filter;label: string;}[] = [
  { value: 'all', label: 'All' },
  ...(Object.keys(groupLabels) as OpportunityGroup[]).map((g) => ({ value: g, label: `${groupLabels[g]}${counts(g) ? ` ${counts(g)}` : ''}` }))];


  const hiddenNote = (id: string) => state.dismissed[id] ? 'handled' : `snoozed until ${new Date(state.snoozed[id]).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}`;

  return (
    <div className="w-full">
      <PageHeader
        title="Opportunities"
        description="Money and customers that are one small step from coming back. Everything here comes from your real orders, bookings and contacts." />
      

      <PageStack>
        <Card emphasis="primary">
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-caption text-fg-subtle">Still on the table</p>
              <p className="mt-1 font-display text-[2.25rem] font-semibold leading-none tracking-[-0.025em] tabular-nums text-fg md:text-[2.75rem]">{formatNgn(atStake)}</p>
              <p className="mt-2 max-w-xl text-label text-fg-muted">
                {open.length === 0 ?
                'Nothing waiting right now.' :
                `Across ${withAmount} item${withAmount === 1 ? '' : 's'} with a known amount — unpaid checkouts, failed renewals, deposits and missed bookings. Leads and follow-ups have no amount, but they’re often worth the most.`}
              </p>
            </div>
            <StatGroup columns={3} divided>
              <Stat label="Payments to recover" value={payments.length} hint={payments.length ? formatNgn(payments.reduce((s, o) => s + (o.valueNgn ?? 0), 0)) : 'All paid up'} />
              <Stat label="People to get back to" value={people.length} hint="Leads, follow-ups and bookings" />
              <Stat label="Handled or snoozed" value={hidden.length} hint="Come back when a snooze ends" />
            </StatGroup>
          </div>
        </Card>

        <section aria-labelledby="opp-list-title" className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <h2 id="opp-list-title" className="text-heading font-semibold text-fg">
              {view === 'open' ? 'Waiting for you' : 'Handled and snoozed'}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="scroll-quiet -mx-1 max-w-full overflow-x-auto overflow-y-hidden px-1">
                <Segmented size="sm" ariaLabel="Show" value={filter} options={filterOptions} onChange={setFilter} />
              </div>
              <Segmented
                size="sm"
                ariaLabel="List"
                value={view}
                options={[
                { value: 'open', label: `Open ${open.length}` },
                { value: 'hidden', label: `Hidden ${hidden.length}` }]
                }
                onChange={setView} />
              
            </div>
          </div>

          <Card body="flush">
            {list.length === 0 ?
            view === 'open' && open.length === 0 ?
            <EmptyState icon={PartyPopperIcon} title="You’re all caught up" description="New unpaid checkouts, failed renewals, no-shows and unanswered leads will appear here." /> :

            <EmptyState icon={InboxIcon} title="Nothing in this view" description={view === 'open' ? 'Try another filter.' : 'Items you mark as handled or snooze appear here.'} /> :


            <ul aria-labelledby="opp-list-title" className="flex flex-col divide-y divide-line">
                {list.map((o) =>
              <OpportunityRow
                key={o.id}
                item={o}
                hiddenNote={view === 'hidden' ? hiddenNote(o.id) : undefined}
                onSnooze={(days) => {
                  snooze(o.id, days);
                  toast('Snoozed', { description: days === 1 ? 'It’ll come back tomorrow.' : 'It’ll come back next week.', action: { label: 'Undo', onClick: () => restore(o.id) } });
                }}
                onDismiss={() => {
                  dismiss(o.id);
                  toast('Marked as handled', { action: { label: 'Undo', onClick: () => restore(o.id) } });
                }}
                onRestore={() => restore(o.id)} />

              )}
              </ul>
            }
          </Card>
          <p className="text-caption text-fg-subtle">“Message” opens WhatsApp with a suggested note you can edit before sending. Nothing is sent automatically.</p>
        </section>
      </PageStack>
    </div>);

}