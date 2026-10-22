import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon, SparklesIcon } from 'lucide-react';
import type { Booking } from '../../types/ops';
import { useOps } from '../../contexts/OpsContext';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import { Segmented } from '../../components/ui/Segmented';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { BookingDetail, bookingStatusCopy } from '../../components/bookings/BookingDetail';
import { BookingsPlanNote } from '../../components/bookings/BookingsPlanNote';
import { SampleTag } from '../../components/commerce/StatusBadges';
import { addDaysKey, dateKeyInTz, dayLabel, formatInTz, hoursFor, timeLabel, weekdayOfKey, zonedToUtc } from '../../utils/ops/slots';
import { cn } from '../../utils/cn';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useTeam } from '../../contexts/TeamContext';
import { AssigneeChip, MineToggle } from '../../components/team/AssigneeSelect';

type View = 'upcoming' | 'past' | 'week';

export function Schedule() {
  const { data, loadSample } = useOps();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [view, setView] = useState<View>('upcoming');
  const [weekOffset, setWeekOffset] = useState(0);
  const [dayKey, setDayKey] = useState<string | null>(null);
  const wide = useMediaQuery('(min-width: 768px)');
  const tz = data.availability.timeZone;
  const openId = params.get('booking');

  // “Mine”: bookings assigned to the signed-in member (D60).
  const { me } = useTeam();
  const [mine, setMine] = useState(false);
  const mineCount = data.bookings.filter((b) => b.assigneeId === me.id && b.status !== 'cancelled' && Date.parse(b.end) >= Date.now()).length;
  const sorted = useMemo(() => [...data.bookings].filter((b) => !mine || b.assigneeId === me.id).sort((a, b) => Date.parse(a.start) - Date.parse(b.start)), [data.bookings, mine, me.id]);
  const upcoming = sorted.filter((b) => Date.parse(b.end) >= Date.now() && b.status !== 'cancelled');
  const past = sorted.filter((b) => Date.parse(b.end) < Date.now() || b.status === 'cancelled').reverse();

  const open = (id: string) => setParams({ booking: id });

  if (data.services.length === 0 && data.bookings.length === 0) {
    return (
      <>
        <PageHeader title="Bookings" description="Let customers book you from your page, with deposits and reminders." />
        <BookingsPlanNote />
        <div className="mt-8 rounded-lg border border-line bg-raised">
          <EmptyState
            icon={CalendarIcon}
            title="No services yet"
            description="Add what people can book, set your hours, then add a Booking block to your page."
            action={
            <div className="flex flex-wrap justify-center gap-2">
                <Button leadingIcon={PlusIcon} onClick={() => navigate('/app/bookings/services?new=1')}>
                  Add a service
                </Button>
                <Button variant="secondary" leadingIcon={SparklesIcon} onClick={loadSample}>
                  Explore with sample data
                </Button>
              </div>
            } />
          
        </div>
      </>);

  }

  const row = (b: Booking) => {
    const start = Date.parse(b.start);
    return (
      <li key={b.id}>
        <button type="button" onClick={() => open(b.id)} className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors duration-150 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus">
          <span className="w-16 shrink-0">
            <span className="block text-label font-semibold tabular-nums text-fg">{timeLabel(start, tz)}</span>
            <span className="block text-caption text-fg-subtle">{dayLabel(start, tz)}</span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span className="truncate text-label font-semibold text-fg">{b.customer.name}</span>
              {b.sample && <SampleTag />}
            </span>
            <span className="block truncate text-caption text-fg-subtle">
              {b.serviceName} · {b.ref}
            </span>
          </span>
          {b.assigneeId &&
          <span className="hidden sm:inline-flex">
              <AssigneeChip memberId={b.assigneeId} />
            </span>
          }
          <Badge tone={bookingStatusCopy[b.status].tone}>{bookingStatusCopy[b.status].label}</Badge>
        </button>
      </li>);

  };

  // Week view
  const todayKey = dateKeyInTz(Date.now(), tz);
  const monday = addDaysKey(todayKey, -((weekdayOfKey(todayKey) + 6) % 7) + weekOffset * 7);
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDaysKey(monday, i));
  const HOUR_START = 8;
  const HOUR_END = 20;
  const PX_PER_HOUR = 44;

  return (
    <>
      <PageHeader
        title="Schedule"
        description={`${upcoming.length} upcoming · times in ${tz}`}
        actions={
        <Button variant="secondary" leadingIcon={PlusIcon} onClick={() => navigate('/app/bookings/services?new=1')}>
            Add service
          </Button>
        } />
      
      <BookingsPlanNote />
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
        <MineToggle mine={mine} count={mineCount} onChange={setMine} />
        <Segmented<View>
            ariaLabel="View"
            value={view}
            onChange={setView}
            options={[
            { value: 'upcoming', label: 'Upcoming' },
            { value: 'week', label: 'Week' },
            { value: 'past', label: wide ? 'Past & cancelled' : 'Past' }]
            } />
          
        </div>
        {view === 'week' &&
        <div className="flex items-center gap-1">
            <IconButton icon={ChevronLeftIcon} label="Previous week" onClick={() => setWeekOffset((w) => w - 1)} />
            <Button size="sm" variant="tertiary" onClick={() => setWeekOffset(0)} disabled={weekOffset === 0}>
              This week
            </Button>
            <IconButton icon={ChevronRightIcon} label="Next week" onClick={() => setWeekOffset((w) => w + 1)} />
          </div>
        }
      </div>

      {view === 'week' && !wide ?
      // Phones: a swipeable strip of days above that day's agenda, instead of the 7-column grid.
      (() => {
        const selectedKey = dayKey && weekDays.includes(dayKey) ? dayKey : weekDays.includes(todayKey) ? todayKey : weekDays[0];
        const hours = hoursFor(selectedKey, data.availability);
        const items = data.bookings.
        filter((b) => b.status !== 'cancelled' && dateKeyInTz(Date.parse(b.start), tz) === selectedKey).
        sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
        return (
          <div className="mt-4">
              <ul role="tablist" aria-label="Day" className="scroll-quiet -mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
                {weekDays.map((k) => {
                const on = k === selectedKey;
                const count = data.bookings.filter((b) => b.status !== 'cancelled' && dateKeyInTz(Date.parse(b.start), tz) === k).length;
                const noon = zonedToUtc(k, '12:00', tz);
                const dow = formatInTz(noon, tz, { weekday: 'short' });
                return (
                  <li key={k} className="shrink-0">
                      <button
                      type="button"
                      role="tab"
                      aria-selected={on}
                      onClick={() => setDayKey(k)}
                      className={cn(
                        'flex h-[64px] w-[56px] flex-col items-center justify-center gap-0.5 rounded-md border text-center transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                        on ? 'border-action bg-action text-action-fg' : 'border-line bg-raised text-fg'
                      )}>
                      
                        <span className={cn('text-meta font-semibold uppercase', on ? 'text-action-fg' : k === todayKey ? 'text-action' : 'text-fg-subtle')}>{dow}</span>
                        <span className="text-label font-semibold tabular-nums">{Number(k.slice(-2))}</span>
                        <span aria-label={`${count} bookings`} className={cn('h-1.5 w-1.5 rounded-full', count ? on ? 'bg-action-fg' : 'bg-action' : 'bg-transparent')} />
                      </button>
                    </li>);

              })}
              </ul>
              <div role="tabpanel" className="mt-4 rounded-lg border border-line bg-raised">
                <p className="border-b border-line px-4 py-3 text-caption text-fg-muted">
                  <span className="font-semibold text-fg">{dayLabel(zonedToUtc(selectedKey, '12:00', tz), tz)}</span> · {hours ? `Open ${hours.open}–${hours.close}` : 'Closed'}
                </p>
                {items.length === 0 ?
              <p className="px-4 py-8 text-center text-label text-fg-muted">{hours ? 'Nothing booked yet.' : 'You’re closed this day.'}</p> :

              <ul className="divide-y divide-line">{items.map(row)}</ul>
              }
              </div>
            </div>);

      })() :
      view === 'week' ?
      <div className="mt-4 overflow-x-auto rounded-lg border border-line bg-raised">
          <div className="grid min-w-[760px]" style={{ gridTemplateColumns: `56px repeat(7, minmax(0, 1fr))` }}>
            <div />
            {weekDays.map((k) =>
          <div key={k} className={cn('border-b border-l border-line px-2 py-2 text-caption font-semibold', k === todayKey ? 'text-action' : 'text-fg-muted')}>
                {dayLabel(zonedToUtc(k, '12:00', tz), tz)}
              </div>
          )}
            <div className="relative" style={{ height: (HOUR_END - HOUR_START) * PX_PER_HOUR }}>
              {Array.from({ length: HOUR_END - HOUR_START }).map((_, i) =>
            <span key={i} className="absolute right-2 text-meta text-fg-subtle" style={{ top: i * PX_PER_HOUR - 6 }}>
                  {((HOUR_START + i) % 12 || 12) + (HOUR_START + i >= 12 ? 'pm' : 'am')}
                </span>
            )}
            </div>
            {weekDays.map((k) => {
            const hours = hoursFor(k, data.availability);
            const dayStart = zonedToUtc(k, `${String(HOUR_START).padStart(2, '0')}:00`, tz);
            const items = data.bookings.filter((b) => b.status !== 'cancelled' && dateKeyInTz(Date.parse(b.start), tz) === k);
            const top = (ms: number) => (ms - dayStart) / 3600000 * PX_PER_HOUR;
            return (
              <div key={k} className="relative border-l border-line" style={{ height: (HOUR_END - HOUR_START) * PX_PER_HOUR }}>
                  {Array.from({ length: HOUR_END - HOUR_START }).map((_, i) =>
                <span key={i} aria-hidden className="absolute inset-x-0 border-t border-line/60" style={{ top: i * PX_PER_HOUR }} />
                )}
                  {hours ?
                <span aria-hidden className="absolute inset-x-0 bg-action-soft/40" style={{ top: Math.max(0, top(zonedToUtc(k, hours.open, tz))), height: Math.max(0, top(zonedToUtc(k, hours.close, tz)) - Math.max(0, top(zonedToUtc(k, hours.open, tz)))) }} /> :

                <span className="absolute inset-x-0 top-2 text-center text-caption text-fg-subtle">Closed</span>
                }
                  {items.map((b) =>
                <button
                  key={b.id}
                  type="button"
                  onClick={() => open(b.id)}
                  className="absolute inset-x-1 overflow-hidden rounded-sm border border-action/30 bg-raised px-1.5 py-1 text-left shadow-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  style={{ top: top(Date.parse(b.start)), height: Math.max(22, top(Date.parse(b.end)) - top(Date.parse(b.start))) }}>
                  
                      <span className="block truncate text-caption font-semibold text-fg">{b.customer.name}</span>
                      <span className="block truncate text-meta text-fg-subtle">{timeLabel(Date.parse(b.start), tz)} · {b.serviceName}</span>
                    </button>
                )}
                </div>);

          })}
          </div>
        </div> :

      <div className="mt-4 rounded-lg border border-line bg-raised">
          {(view === 'upcoming' ? upcoming : past).length === 0 ?
        <p className="px-6 py-10 text-center text-label text-fg-muted">{view === 'upcoming' ? 'No upcoming bookings. Share your page to get some.' : 'Nothing here yet.'}</p> :

        <ul className="divide-y divide-line">{(view === 'upcoming' ? upcoming : past).map(row)}</ul>
        }
        </div>
      }

      <BookingDetail bookingId={openId} onClose={() => setParams({})} />
    </>);

}