import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownIcon, ArrowUpIcon, CalendarCogIcon, ListChecksIcon, QrCodeIcon } from 'lucide-react';
import type { BookingPageSettings } from '../../../types/page';
import { useEditor } from '../../../contexts/EditorContext';
import { useOps } from '../../../contexts/OpsContext';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import { useNow } from '../../../hooks/useNow';
import { Badge } from '../../ui/Badge';
import { TextInput } from '../../ui/TextInput';
import { MAX_BOOKING_SERVICES, bookingPageServices, nextFreeSlot, slotWhen, validWhatsapp } from '../../../utils/bookingPage';
import { durationLabel } from '../../../utils/ops/slots';
import { qrHref } from '../../../utils/domains/links';
import { cn } from '../../../utils/cn';

const linkClass = 'inline-flex min-h-[44px] items-center gap-1.5 rounded-sm text-caption font-semibold text-action hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus';
const iconBtn = 'inline-flex h-9 w-9 items-center justify-center rounded-sm text-fg-muted hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-40 disabled:hover:bg-transparent';

/** Booking page settings (D184): which services, their order, the heading and the no-times fallback. */
export function BookingPageSettingsPanel() {
  const { state, actions } = useEditor();
  const ops = useOps().data;
  const { currentSpace } = useWorkspace();
  const now = useNow(60_000);
  const s = state.site.bookingPage;
  if (!s) return null;

  const patch = (next: Partial<BookingPageSettings>) => actions.transformDocument((doc) => doc.bookingPage ? { ...doc, bookingPage: { ...doc.bookingPage, ...next } } : doc);
  const shown = bookingPageServices(s, ops);
  const free = shown.filter((sv) => nextFreeSlot(sv, ops.availability, ops.bookings, now)).length;
  const services = ops.services.filter((x) => x.active || s.serviceIds.includes(x.id));
  // Chosen first in page order, then the rest.
  const ordered = [...s.serviceIds.map((id) => services.find((x) => x.id === id)).filter((x): x is NonNullable<typeof x> => !!x), ...services.filter((x) => !s.serviceIds.includes(x.id))];
  const full = s.serviceIds.length >= MAX_BOOKING_SERVICES;
  const waError = s.whatsapp.trim() && !validWhatsapp(s.whatsapp) ? 'Use the full number, e.g. 0803 123 4567.' : undefined;
  const waitlistBlock = s.waitlistBlockId ? state.site.blocks.find((b) => b.id === s.waitlistBlockId) : undefined;

  const move = (id: string, dir: -1 | 1) => {
    const ids = [...s.serviceIds];
    const i = ids.indexOf(id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    patch({ serviceIds: ids });
  };

  return (
    <section aria-labelledby="bp-settings-heading" className="flex flex-col gap-4 border-b border-line pb-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 id="bp-settings-heading" className="text-label font-semibold text-fg">
            Booking page
          </h3>
          <p className="mt-0.5 text-caption text-fg-subtle">
            {shown.length ? `${shown.length} service${shown.length === 1 ? '' : 's'} · ${free} with free times` : 'No services showing'}
          </p>
        </div>
        <Badge tone={!shown.length ? 'warning' : free ? 'success' : 'warning'} dot>
          {!shown.length ? 'Needs services' : free ? 'Taking bookings' : 'Fully booked'}
        </Badge>
      </div>

      <TextInput id="bp-intro" label="Heading" value={s.intro} placeholder="Book an appointment" onChange={(e) => patch({ intro: e.target.value })} />

      <fieldset className="min-w-0">
        <legend className="mb-1.5 text-label font-medium text-fg">
          Services <span className="font-normal tabular-nums text-fg-subtle">· {s.serviceIds.length} of up to {MAX_BOOKING_SERVICES}</span>
        </legend>
        {services.length === 0 ?
        <p className="rounded-md border border-dashed border-line-strong px-3 py-3 text-caption text-fg-muted">
            No services in Bookings yet.{' '}
            <Link to="/app/bookings/services?new=1" className="font-semibold text-action hover:underline">
              Add a service
            </Link>
          </p> :

        <ul className="flex flex-col divide-y divide-line rounded-md border border-line">
            {ordered.map((x) => {
            const on = s.serviceIds.includes(x.id);
            const pos = s.serviceIds.indexOf(x.id);
            const slot = on && x.active ? nextFreeSlot(x, ops.availability, ops.bookings, now) : null;
            return (
              <li key={x.id} className="flex min-h-[48px] items-center gap-1 py-1 pl-3 pr-1">
                  <label className={cn('flex min-w-0 flex-1 cursor-pointer items-center gap-2.5', !on && full && 'cursor-not-allowed opacity-60')}>
                    <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={on}
                    disabled={!on && full}
                    onChange={() => patch({ serviceIds: on ? s.serviceIds.filter((id) => id !== x.id) : [...s.serviceIds, x.id] })} />
                  
                    <span className="min-w-0">
                      <span className="block truncate text-label text-fg">{x.name}</span>
                      <span className="block truncate text-caption text-fg-subtle">
                        {!x.active ? 'Switched off in Bookings — won’t show' : on ? slot ? `Next free: ${slotWhen(slot, ops.availability)}` : 'No free times' : durationLabel(x.durationMin)}
                      </span>
                    </span>
                  </label>
                  {on &&
                <>
                      <button type="button" className={iconBtn} disabled={pos === 0} onClick={() => move(x.id, -1)} aria-label={`Move ${x.name} up`}>
                        <ArrowUpIcon size={15} aria-hidden />
                      </button>
                      <button type="button" className={iconBtn} disabled={pos === s.serviceIds.length - 1} onClick={() => move(x.id, 1)} aria-label={`Move ${x.name} down`}>
                        <ArrowDownIcon size={15} aria-hidden />
                      </button>
                    </>
                }
                </li>);

          })}
          </ul>
        }
        <p className="mt-1.5 text-caption text-fg-subtle">Prices, durations, deposits, hours and cancellation rules come from Bookings — change them there.</p>
      </fieldset>

      <div className="flex flex-col gap-2">
        <h4 className="text-label font-medium text-fg">When there are no free times</h4>
        <TextInput
          id="bp-whatsapp"
          label="WhatsApp number"
          optional
          inputMode="tel"
          value={s.whatsapp}
          placeholder="e.g. 0803 123 4567"
          hint="Offered as “Message on WhatsApp”. Empty = not offered."
          error={waError}
          onChange={(e) => patch({ whatsapp: e.target.value })} />
        
        <p className="text-caption text-fg-muted">
          {waitlistBlock && !waitlistBlock.visibility.hidden ?
          'The “Join the waitlist” button jumps to the waitlist sign-up on this page.' :
          'The waitlist sign-up has been removed or hidden, so only WhatsApp is offered.'}
        </p>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <Link to="/app/bookings/services" className={linkClass}>
          <ListChecksIcon size={13} aria-hidden /> Services
        </Link>
        <Link to="/app/bookings/availability" className={linkClass}>
          <CalendarCogIcon size={13} aria-hidden /> Hours & rules
        </Link>
        <Link to={qrHref({ spaceId: currentSpace.id, path: '' }, `${state.site.title} booking link`)} className={linkClass}>
          <QrCodeIcon size={13} aria-hidden /> QR code for flyers
        </Link>
      </div>
    </section>);

}