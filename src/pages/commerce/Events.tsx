import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { CalendarIcon, MapPinIcon, MoreHorizontalIcon, PauseIcon, PlayIcon, PlusIcon, ScanLineIcon, TicketIcon, UsersIcon, VideoIcon, XCircleIcon } from 'lucide-react';
import type { CommerceEvent } from '../../types/commerce';
import { useCommerce } from '../../contexts/CommerceContext';
import { cancelEventAndRefund, eventDisplay, eventDisplayLabel, eventPhase, eventRevenue, eventSold, eventTotalSeats, eventsOf, ordersForEvent, upsertEvent, type EventDisplay } from '../../utils/commerce/tickets';
import { formatEventDate, formatEventTime } from '../../utils/eventTime';
import { formatNgn } from '../../utils/format';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import { Badge, type BadgeTone } from '../../components/ui/Badge';
import { Segmented } from '../../components/ui/Segmented';
import { Menu } from '../../components/ui/Menu';
import { EmptyState } from '../../components/ui/EmptyState';
import { Dialog } from '../../components/ui/Dialog';
import { TextArea } from '../../components/ui/TextArea';
import { SampleTag } from '../../components/commerce/StatusBadges';
import { EventEditor } from '../../components/commerce/EventEditor';
import { Stat, StatGroup } from '../../components/ui/layout/Stat';

type Tab = 'upcoming' | 'live' | 'past' | 'drafts';

const tone: Record<EventDisplay, BadgeTone> = { draft: 'neutral', on_sale: 'success', paused: 'warning', cancelled: 'danger', sold_out: 'info', past: 'neutral', not_yet: 'info' };

function tabOf(ev: CommerceEvent, now: number): Tab {
  if (ev.status === 'draft') return 'drafts';
  const phase = eventPhase(ev, now);
  if (ev.status === 'cancelled' || phase === 'past') return 'past';
  return phase === 'live' ? 'live' : 'upcoming';
}

/** Commerce → Events: events with ticket types, seats and revenue (D73). */
export function Events() {
  const { data, apply } = useCommerce();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('upcoming');
  const [cancelling, setCancelling] = useState<CommerceEvent | null>(null);
  const [reason, setReason] = useState('');
  const now = Date.now();

  const target = params.get('new') ? 'new' : params.get('edit');
  const events = eventsOf(data);
  const counts = useMemo(() => {
    const c: Record<Tab, number> = { upcoming: 0, live: 0, past: 0, drafts: 0 };
    events.forEach((e) => c[tabOf(e, now)]++);
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]);
  const shown = events.filter((e) => tabOf(e, now) === tab).sort((a, b) => tab === 'past' ? Date.parse(b.startsAt) - Date.parse(a.startsAt) : Date.parse(a.startsAt) - Date.parse(b.startsAt));

  const upcomingSold = events.filter((e) => tabOf(e, now) === 'upcoming' || tabOf(e, now) === 'live').reduce((s, e) => s + eventSold(data, e), 0);
  const revenue = events.reduce((s, e) => s + eventRevenue(data, e), 0);

  const setStatus = (ev: CommerceEvent, status: CommerceEvent['status']) => {
    if (apply((d) => upsertEvent(d, { ...ev, status }))) toast.success(status === 'paused' ? `Sales paused for ${ev.name}` : `${ev.name} is on sale`);
  };

  const confirmCancel = () => {
    if (!cancelling) return;
    let refunded = 0;
    const ok = apply((d) => {
      const r = cancelEventAndRefund(d, cancelling.id, reason.trim());
      refunded = r.refunded;
      return r.data;
    });
    if (ok) toast.success(`${cancelling.name} cancelled`, { description: refunded ? `${refunded} order${refunded === 1 ? '' : 's'} refunded in full (test mode).` : 'No paid orders needed refunding.' });
    setCancelling(null);
    setReason('');
  };

  const newButton =
  <Button leadingIcon={PlusIcon} onClick={() => setParams({ new: '1' })}>
      New event
    </Button>;


  return (
    <>
      <PageHeader title="Events" description="Sell tickets with real seat limits. Link an event from an Event block on any page — orders, refunds and reports work like any sale." actions={newButton} />

      {events.length === 0 ?
      <div className="mt-8 rounded-lg border border-line bg-raised">
          <EmptyState icon={TicketIcon} title="No events yet" description="A pop-up, workshop, show or class. Set ticket types and seats, then link it from your page." action={newButton} />
        </div> :

      <>
          <StatGroup columns={3} className="mt-8 items-end border-b border-line pb-6">
            <Stat primary label="Tickets sold for coming events" value={upcomingSold} hint={`${counts.upcoming + counts.live} event${counts.upcoming + counts.live === 1 ? '' : 's'} on the calendar`} />
            <Stat label="Ticket revenue, all time" value={formatNgn(revenue)} />
            <Stat label="Drafts" value={counts.drafts} />
          </StatGroup>

          <div className="mt-8 max-w-full overflow-x-auto overflow-y-hidden">
            <Segmented<Tab>
            ariaLabel="Show events"
            value={tab}
            onChange={setTab}
            options={[
            { value: 'upcoming', label: `Upcoming · ${counts.upcoming}` },
            { value: 'live', label: `Happening now · ${counts.live}` },
            { value: 'past', label: `Past · ${counts.past}` },
            { value: 'drafts', label: `Drafts · ${counts.drafts}` }]
            } />
          
          </div>

          {shown.length === 0 ?
        <p className="mt-6 rounded-lg border border-dashed border-line-strong px-5 py-8 text-center text-label text-fg-muted">Nothing here right now.</p> :

        <ul className="mt-4 flex flex-col divide-y divide-line rounded-lg border border-line bg-raised">
              {shown.map((ev) => {
            const display = eventDisplay(data, ev, now);
            const sold = eventSold(data, ev);
            const total = eventTotalSeats(ev);
            const pct = total ? Math.min(100, Math.round(sold / total * 100)) : 0;
            const d = new Date(ev.startsAt);
            const canCancel = ev.status !== 'cancelled' && eventPhase(ev, now) !== 'past';
            return (
              <li key={ev.id} className="flex items-center gap-4 px-4 py-4 sm:px-5">
                    <span aria-hidden className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-md border border-line bg-sunken leading-none">
                      <span className="text-[11px] font-semibold uppercase text-fg-subtle">{d.toLocaleDateString('en-GB', { month: 'short' })}</span>
                      <span className="mt-1 text-[20px] font-semibold tabular-nums text-fg">{d.getDate()}</span>
                    </span>
                    <button type="button" onClick={() => ev.status === 'draft' ? setParams({ edit: ev.id }) : navigate(`/app/commerce/events/${ev.id}/guests`)} className="min-w-0 flex-1 rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-label font-semibold text-fg">{ev.name || 'Untitled event'}</span>
                        {ev.sample && <SampleTag />}
                        {ev.series && <Badge tone="neutral">Repeats</Badge>}
                        {ev.seating && <Badge tone="neutral">Seated</Badge>}
                      </span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-caption text-fg-subtle">
                        <span className="inline-flex items-center gap-1">
                          <CalendarIcon size={12} aria-hidden />
                          {formatEventDate(ev.startsAt, ev.timeZone)} · {formatEventTime(ev.startsAt, ev.timeZone)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          {ev.online ? <VideoIcon size={12} aria-hidden /> : <MapPinIcon size={12} aria-hidden />}
                          {ev.online ? 'Online' : ev.venue || 'No venue'}
                        </span>
                      </span>
                    </button>
                    <div className="hidden w-44 shrink-0 md:block">
                      <div className="flex items-baseline justify-between text-caption">
                        <span className="tabular-nums text-fg">
                          <span className="font-semibold">{sold}</span> <span className="text-fg-subtle">of {total}</span>
                        </span>
                        <span className="tabular-nums text-fg-subtle">{formatNgn(eventRevenue(data, ev))}</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-sunken" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={sold} aria-label={`${sold} of ${total} seats sold`}>
                        <div className="h-full rounded-full bg-action" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <Badge tone={tone[display]} dot className="hidden shrink-0 sm:inline-flex">
                      {eventDisplayLabel[display]}
                    </Badge>
                    <Menu
                  align="end"
                  items={[
                  { id: 'guests', label: 'Guest list', icon: UsersIcon, onSelect: () => navigate(`/app/commerce/events/${ev.id}/guests`) },
                  ...(ev.status !== 'cancelled' && ev.status !== 'draft' ? [{ id: 'checkin', label: 'Check in guests', icon: ScanLineIcon, onSelect: () => navigate(`/app/commerce/events/${ev.id}/check-in`) }] : []),
                  { id: 'edit', label: 'Edit event', icon: TicketIcon, onSelect: () => setParams({ edit: ev.id }) },
                  ...(ev.status === 'on_sale' && canCancel ? [{ id: 'pause', label: 'Pause sales', icon: PauseIcon, onSelect: () => setStatus(ev, 'paused') }] : []),
                  ...((ev.status === 'paused' || ev.status === 'draft') && canCancel ? [{ id: 'resume', label: 'Put on sale', icon: PlayIcon, onSelect: () => setStatus(ev, 'on_sale') }] : []),
                  ...(canCancel ? [{ id: 'cancel', label: 'Cancel event…', icon: XCircleIcon, destructive: true, onSelect: () => setCancelling(ev) }] : [])]
                  }
                  trigger={(props) => <IconButton {...props} size="sm" icon={MoreHorizontalIcon} label={`More actions for ${ev.name}`} />} />
                
                  </li>);

          })}
            </ul>
        }
        </>
      }

      <EventEditor target={target} onClose={() => setParams({})} />

      <Dialog
        open={!!cancelling}
        onClose={() => setCancelling(null)}
        title={`Cancel ${cancelling?.name ?? 'event'}?`}
        description="Ticket sales stop and every paid ticket order is refunded in full. Unpaid orders are cancelled and all tickets stop working."
        footer={
        <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCancelling(null)}>
              Keep event
            </Button>
            <Button variant="destructive" onClick={confirmCancel}>
              Cancel and refund everyone
            </Button>
          </div>
        }>
        
        {cancelling &&
        <div className="flex flex-col gap-4">
            <p className="text-label text-fg">
              <span className="font-semibold tabular-nums">{ordersForEvent(data, cancelling).filter((o) => o.status !== 'cancelled' && o.status !== 'refunded').length}</span> orders ·{' '}
              <span className="font-semibold tabular-nums">{eventSold(data, cancelling)}</span> tickets · <span className="font-semibold tabular-nums">{formatNgn(eventRevenue(data, cancelling))}</span> to refund
            </p>
            <TextArea id="ev-cancel-reason" label="Reason guests will see" optional rows={2} value={reason} placeholder="e.g. The venue flooded. We’re so sorry." onChange={(e) => setReason(e.target.value)} />
            <div className="rounded-md border border-line bg-sunken px-3.5 py-3 text-caption text-fg-muted">
              <p className="font-semibold text-fg">Message preview</p>
              <p className="mt-1">
                “{cancelling.name} on {formatEventDate(cancelling.startsAt, cancelling.timeZone)} has been cancelled.{reason.trim() ? ` ${reason.trim()}` : ''} Your payment is being refunded in full and should arrive in 3–5 working days.”
              </p>
              <p className="mt-1.5 text-fg-subtle">Preview only — messages aren’t sent in the prototype.</p>
            </div>
          </div>
        }
      </Dialog>
    </>);

}