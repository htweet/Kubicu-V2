import React from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowUpRightIcon, QrCodeIcon, ScanLineIcon, UsersIcon } from 'lucide-react';
import { useEditor } from '../../../contexts/EditorContext';
import { useCommerce } from '../../../contexts/CommerceContext';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import { Badge } from '../../ui/Badge';
import { SelectInput } from '../../ui/SelectInput';
import { eventDisplay, eventDisplayLabel, eventPhase, eventsOf, findEvent } from '../../../utils/commerce/tickets';
import { eventPhaseLabels, eventSpaceLinks, eventSpacePhase, eventSpaceTotals, phasedSummary } from '../../../utils/eventSpace';
import { qrHref } from '../../../utils/domains/links';
import { formatEventDate } from '../../../utils/eventTime';
import { formatNgn } from '../../../utils/format';

const linkClass = 'inline-flex min-h-[44px] items-center gap-1.5 rounded-sm text-caption font-semibold text-action hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus';

/** The Event space's linked event (D178): what's sold, where to manage it, and changing the event before any sale. */
export function EventSpaceSettingsPanel() {
  const { state, actions } = useEditor();
  const { data } = useCommerce();
  const { current, currentSpace } = useWorkspace();
  const s = state.site.eventSpace;
  if (!s) return null;

  const ev = findEvent(data, s.eventId);
  const totals = ev ? eventSpaceTotals(data, ev) : null;
  const phase = eventSpacePhase(ev);
  const display = ev ? eventDisplay(data, ev) : null;
  const sold = totals ? totals.sold > 0 : false;
  const taken = new Set(eventSpaceLinks(current).filter((l) => l.spaceId !== currentSpace.id).map((l) => l.eventId));
  const options = eventsOf(data).filter((e) => e.id === s.eventId || e.status !== 'cancelled' && eventPhase(e) !== 'past' && !taken.has(e.id));

  const relink = (eventId: string) => {
    if (!eventId || eventId === s.eventId) return;
    actions.transformDocument((doc) => ({
      ...doc,
      eventSpace: { eventId },
      // Event and countdown blocks that followed the old event follow the new one.
      blocks: doc.blocks.map((b) => {
        if (b.type === 'event' && b.content.source === 'catalog' && b.content.eventId === s.eventId) return { ...b, content: { ...b.content, eventId } };
        if (b.type === 'countdown' && ev && b.content.target === ev.startsAt) return { ...b, content: { ...b.content, target: findEvent(data, eventId)?.startsAt ?? b.content.target } };
        return b;
      })
    }));
    toast('Linked event changed', { description: 'Ticket and countdown blocks now follow the new event.', action: { label: 'Undo', onClick: () => actions.undo() } });
  };

  return (
    <section aria-labelledby="eventspace-heading" className="flex flex-col gap-4 border-b border-line pb-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 id="eventspace-heading" className="text-label font-semibold text-fg">
            Event
          </h3>
          <p className="mt-0.5 truncate text-caption text-fg-subtle">{phasedSummary(state.site, data)}</p>
        </div>
        <Badge tone={phase === 'live' ? 'success' : phase === 'before' ? 'info' : 'neutral'} dot>
          {eventPhaseLabels[phase]} now
        </Badge>
      </div>

      {!ev ?
      <p className="rounded-md border border-danger/40 px-3 py-2.5 text-caption text-fg">The linked event was deleted from Commerce. Pick another event below to publish this page.</p> :

      <>
          <div>
            <p className="text-label font-medium text-fg">{ev.name || 'Untitled event'}</p>
            <p className="text-caption text-fg-muted">
              {formatEventDate(ev.startsAt, ev.timeZone)} · {ev.online ? 'Online' : ev.venue || 'No venue yet'} · {display ? eventDisplayLabel[display] : ''}
            </p>
          </div>
          {totals &&
        <dl className="grid grid-cols-3 gap-2 rounded-md bg-sunken p-3">
              <div>
                <dt className="text-caption text-fg-subtle">Sold</dt>
                <dd className="text-label font-semibold tabular-nums text-fg">
                  {totals.sold} <span className="font-normal text-fg-subtle">of {totals.total}</span>
                </dd>
              </div>
              <div>
                <dt className="text-caption text-fg-subtle">Seats left</dt>
                <dd className="text-label font-semibold tabular-nums text-fg">{totals.left}</dd>
              </div>
              <div>
                <dt className="text-caption text-fg-subtle">Revenue</dt>
                <dd className="text-label font-semibold tabular-nums text-fg">{formatNgn(totals.revenueNgn)}</dd>
              </div>
            </dl>
        }
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <Link to={`/app/commerce/events?edit=${ev.id}`} className={linkClass}>
              Edit event <ArrowUpRightIcon size={12} aria-hidden />
            </Link>
            <Link to={`/app/commerce/events/${ev.id}/guests`} className={linkClass}>
              <UsersIcon size={13} aria-hidden /> Guest list
            </Link>
            <Link to={`/app/commerce/events/${ev.id}/check-in`} className={linkClass}>
              <ScanLineIcon size={13} aria-hidden /> Door check-in
            </Link>
            <Link to={qrHref({ spaceId: currentSpace.id, path: '' }, `${ev.name} tickets`)} className={linkClass}>
              <QrCodeIcon size={13} aria-hidden /> QR code for this page
            </Link>
          </div>
        </>
      }

      {sold ?
      <p className="text-caption text-fg-subtle">Tickets have been sold, so this page stays linked to {ev?.name}. To move people to another date, cancel the event in Commerce — everyone is refunded.</p> :

      <SelectInput
        id="eventspace-link"
        label="Linked event"
        value={s.eventId}
        onChange={relink}
        hint="Change it any time before the first ticket is sold. One event, one page."
        options={options.map((e) => ({ value: e.id, label: `${e.name || 'Untitled event'} · ${formatEventDate(e.startsAt, e.timeZone)}` }))} />

      }
      <p className="text-caption text-fg-subtle">The page switches between Before, During and After at the event’s own start and end times. Pick which blocks show in each under a block’s Visibility.</p>
    </section>);

}