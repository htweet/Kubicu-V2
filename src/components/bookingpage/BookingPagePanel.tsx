import React, { useMemo } from 'react';
import { CalendarCheckIcon, MessageCircleIcon } from 'lucide-react';
import type { BookingPageSettings, PageTheme } from '../../types/page';
import { usePageOpsContext } from '../../contexts/PageOpsContext';
import { useNow } from '../../hooks/useNow';
import { bookingPageServices, lookaheadDays, nextFreeSlot, slotWhen, validWhatsapp } from '../../utils/bookingPage';
import { durationLabel } from '../../utils/ops/slots';
import { formatNgn, whatsappLink } from '../../utils/format';
import { waNumber } from '../../utils/businessWhatsApp';
import { buttonStyle, cardStyle, fontsFor, mix } from '../blocks/pageStyle';

interface BookingPagePanelProps {
  settings: BookingPageSettings;
  /** The page name, used in the WhatsApp message. */
  pageName: string;
  theme: PageTheme;
  mode: 'live' | 'edit';
}

/**
 * Booking page header (D184): the chosen services, each with its next free time and a button that
 * opens the normal booking sheet. With no free times it offers the waitlist or WhatsApp — never a dead end.
 */
export function BookingPagePanel({ settings, pageName, theme, mode }: BookingPagePanelProps) {
  const { data, actions } = usePageOpsContext();
  const now = useNow(60_000);
  const services = bookingPageServices(settings, data);
  // Recomputed each minute; slots honour hours, notice, buffers and existing bookings.
  const next = useMemo(
    () => new Map(services.map((s) => [s.id, data ? nextFreeSlot(s, data.availability, data.bookings, now) : null])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [services.map((s) => s.id).join(','), data?.availability, data?.bookings, Math.floor(now / 60_000)],
  );
  const muted = { color: theme.mutedText };
  const display = { fontFamily: fontsFor(theme).display, color: theme.text };
  const allFull = services.length > 0 && services.every((s) => !next.get(s.id));
  const waPhone = waNumber(settings.whatsapp);
  const wa = waPhone && validWhatsapp(waPhone) ? whatsappLink(waPhone, `Hi! I found ${pageName} and I’d like to book. Do you have any times?`) : '';
  const waitlistHref = settings.waitlistBlockId ? `#b-${settings.waitlistBlockId}` : '';
  const live = mode === 'live' && !!actions;
  const btn = 'inline-flex min-h-[44px] shrink-0 items-center justify-center px-4 text-[14px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  if (!services.length) {
    return mode === 'edit' ? (
      <section aria-label="Booking page" className="mb-4 flex flex-col gap-1.5 p-5" style={cardStyle(theme)}>
        <p className="text-[16px] font-semibold" style={display}>
          No services to show yet
        </p>
        <p className="text-[14px]" style={muted}>
          Choose services in Page settings → Booking page. Only services switched on in Bookings appear.
        </p>
      </section>
    ) : null;
  }

  const fallback = (wa || waitlistHref) && (
    <div className="flex flex-wrap gap-2">
      {waitlistHref && (
        <a href={mode === 'live' ? waitlistHref : undefined} className={btn} style={buttonStyle(theme, allFull ? 'featured' : 'default')}>
          Join the waitlist
        </a>
      )}
      {wa && (
        <a href={mode === 'live' ? wa : undefined} target="_blank" rel="noopener noreferrer" className={`${btn} gap-2`} style={buttonStyle(theme, allFull && !waitlistHref ? 'featured' : 'default')}>
          <MessageCircleIcon size={16} aria-hidden /> Message on WhatsApp
        </a>
      )}
    </div>
  );

  return (
    <section aria-labelledby="bp-heading" className="mb-4 flex flex-col gap-4 p-5" style={cardStyle(theme)}>
      <div className="flex flex-col gap-1">
        <h2 id="bp-heading" className="text-[22px] font-semibold leading-tight tracking-[-0.01em]" style={display}>
          {settings.intro.trim() || 'Book an appointment'}
        </h2>
        <p className="text-[14px]" style={muted}>
          Times shown in {data?.availability.timeZone.replace(/_/g, ' ') ?? 'local time'}. You’ll get a confirmation straight away.
        </p>
      </div>

      <ul className="flex flex-col">
        {services.map((s, i) => {
          const slot = next.get(s.id) ?? null;
          const meta = [durationLabel(s.durationMin), s.priceNgn !== null ? formatNgn(s.priceNgn) : 'Price on request', s.depositNgn ? `${formatNgn(s.depositNgn)} deposit` : null, s.location === 'online' ? 'Online' : null].filter(Boolean).join(' · ');
          return (
            <li key={s.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between" style={i ? { borderTop: `1px solid ${mix(theme.text, 12)}` } : undefined}>
              <div className="min-w-0">
                <h3 className="text-[16px] font-semibold leading-snug" style={{ color: theme.text }}>
                  {s.name}
                </h3>
                <p className="mt-0.5 text-[13.5px]" style={muted}>
                  {meta}
                </p>
                <p className="mt-1.5 flex items-center gap-1.5 text-[13.5px] font-medium" style={{ color: theme.text }}>
                  <CalendarCheckIcon size={14} aria-hidden />
                  {slot && data ? `Next free: ${slotWhen(slot, data.availability)}` : `Fully booked for the next ${data ? lookaheadDays(data.availability) : 30} days`}
                </p>
              </div>
              {slot ? (
                live ? (
                  <button type="button" onClick={() => actions!.openBooking(s.id)} className={btn} style={buttonStyle(theme, 'featured')} aria-label={`Choose a time for ${s.name}`}>
                    Choose a time
                  </button>
                ) : (
                  <span className={btn} style={buttonStyle(theme, 'featured')}>
                    Choose a time
                  </span>
                )
              ) : (
                <span className="text-[13.5px] font-medium sm:text-right" style={muted}>
                  No times free
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {allFull ? (
        <div className="flex flex-col gap-3 rounded-[inherit] p-4" style={{ background: mix(theme.text, 6) }}>
          <p role="status" className="text-[15px] font-semibold" style={{ color: theme.text }}>
            No free times right now
          </p>
          <p className="text-[14px]" style={muted}>
            {wa || waitlistHref ? 'Join the waitlist to hear when new times open, or message us and we’ll try to fit you in.' : 'Please check back soon — new times open regularly.'}
          </p>
          {fallback}
        </div>
      ) : (
        fallback && (
          <div className="flex flex-col gap-2 pt-1">
            <p className="text-[13.5px]" style={muted}>
              Can’t find a time that suits you?
            </p>
            {fallback}
          </div>
        )
      )}
    </section>
  );
}
