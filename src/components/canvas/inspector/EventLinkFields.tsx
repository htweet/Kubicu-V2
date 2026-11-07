import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRightIcon, RefreshCwIcon } from 'lucide-react';
import { useCommerce } from '../../../contexts/CommerceContext';
import { useT } from '../../../contexts/LocaleContext';
import { SelectInput } from '../../ui/SelectInput';
import { PlanLock } from '../../ui/PlanLock';
import { useCheckoutAllowed } from './CatalogFields';
import { eventDisplay, eventDisplayLabel, eventSeatsLeft, eventSold, eventTotalSeats, eventsOf, findEvent } from '../../../utils/commerce/tickets';
import { formatEventDate } from '../../../utils/eventTime';

interface Props {
  id: string;
  eventId: string | null;
  error?: string;
  onChange: (eventId: string) => void;
}

/** Picks a Commerce event for the Event block and shows what syncs (D73). Translated in D300. */
export function EventLinkFields({ id, eventId, error, onChange }: Props) {
  const { t: tr } = useT();
  const { data } = useCommerce();
  const { allowed, needed } = useCheckoutAllowed();
  const events = eventsOf(data).filter((e) => e.status !== 'cancelled' || e.id === eventId);
  const ev = findEvent(data, eventId);

  if (events.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-line-strong px-3 py-3">
        <p className="text-label font-semibold text-fg">{tr('No events in Commerce yet')}</p>
        <p className="mt-0.5 text-caption text-fg-muted">{tr('Create one with ticket types and seat limits, then pick it here.')}</p>
        <Link to="/app/commerce/events?new=1" className="mt-1.5 inline-flex items-center gap-1 text-caption font-semibold text-action hover:underline">
          {tr('Create an event')} <ArrowUpRightIcon size={12} aria-hidden />
        </Link>
      </div>
    );
  }

  const paid = !!ev?.ticketTypes.some((t) => t.priceNgn > 0);
  return (
    <>
      <SelectInput
        id={id}
        label={tr('Event')}
        value={eventId ?? ''}
        error={error ? tr(error) : undefined}
        onChange={onChange}
        options={[{ value: '', label: tr('Choose…') }, ...events.map((e) => ({ value: e.id, label: `${e.name || tr('Untitled event')} · ${tr(eventDisplayLabel[eventDisplay(data, e)])}` }))]}
      />
      {ev && (
        <div className="flex items-start gap-3 rounded-md border border-line bg-sunken px-3 py-2.5">
          <RefreshCwIcon size={15} className="mt-0.5 shrink-0 text-success" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-label font-semibold text-fg">{tr('Synced with Commerce')}</p>
            <p className="text-caption text-fg-muted">
              {formatEventDate(ev.startsAt, ev.timeZone)} · {tr('{sold} of {total} sold', { sold: eventSold(data, ev), total: eventTotalSeats(ev) })} · {tr('{n} left', { n: eventSeatsLeft(data, ev) })}.{' '}
              {tr('Ticket types, prices, seats and sales dates update here automatically.')}
            </p>
            <Link to={`/app/commerce/events?edit=${ev.id}`} className="mt-1 inline-flex items-center gap-1 text-caption font-semibold text-action hover:underline">
              {tr('Edit in Commerce')} <ArrowUpRightIcon size={12} aria-hidden />
            </Link>
          </div>
        </div>
      )}
      {ev && paid && !allowed && (
        <div className="flex items-center justify-between gap-3 rounded-md border border-line px-3 py-2.5">
          <p className="text-caption text-fg-muted">{tr('Paid tickets need {plan}. Free registration works on every plan.', { plan: needed })}</p>
          <PlanLock kind="plan">{needed}</PlanLock>
        </div>
      )}
    </>
  );
}
