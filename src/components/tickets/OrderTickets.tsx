import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarIcon, ChevronRightIcon, MapPinIcon, TicketIcon } from 'lucide-react';
import type { CommerceData, IssuedTicket } from '../../types/commerce';
import type { PageTheme } from '../../types/page';
import { cardStyle, mix } from '../blocks/pageStyle';
import { findEvent } from '../../utils/commerce/tickets';
import { formatEventDate, formatEventTime } from '../../utils/eventTime';

interface Props {
  theme: PageTheme;
  tickets: IssuedTicket[];
  data: CommerceData | null;
  handle: string;
}

/** The tickets on an order, grouped by event, each opening its own QR ticket page (D73, D74). */
export function OrderTickets({ theme: t, tickets, data, handle }: Props) {
  const muted = { color: t.mutedText };
  const byEvent = tickets.reduce<Record<string, IssuedTicket[]>>((acc, tk) => {
    (acc[tk.eventId] ??= []).push(tk);
    return acc;
  }, {});

  return (
    <>
      {Object.entries(byEvent).map(([eventId, list]) => {
        const ev = findEvent(data, eventId);
        return (
          <section key={eventId} className="flex flex-col p-5" style={cardStyle(t)} aria-label={`Tickets for ${ev?.name ?? 'the event'}`}>
            <div className="flex items-start gap-3">
              <TicketIcon size={18} className="mt-0.5 shrink-0" aria-hidden />
              <div className="min-w-0">
                <p className="text-[15px] font-semibold">
                  {list.length} ticket{list.length === 1 ? '' : 's'} · {ev?.name ?? 'Event'}
                </p>
                {ev && (
                  <p className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[13px]" style={muted}>
                    <span className="inline-flex items-center gap-1">
                      <CalendarIcon size={12} aria-hidden /> {formatEventDate(ev.startsAt, ev.timeZone)} · {formatEventTime(ev.startsAt, ev.timeZone)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPinIcon size={12} aria-hidden /> {ev.online ? 'Online' : ev.venue}
                    </span>
                  </p>
                )}
              </div>
            </div>
            <ul className="mt-4 flex flex-col" role="list">
              {list.map((tk) => {
                const voided = tk.status === 'void' || ev?.status === 'cancelled';
                return (
                  <li key={tk.id} style={{ borderTop: `1px solid ${mix(t.text, 10)}` }}>
                    <Link to={`/p/${handle}/ticket/${tk.id}`} className="flex items-center justify-between gap-3 py-3">
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] font-medium">{tk.guestName}</span>
                      <span className="block text-[12.5px]" style={muted}>
                        {tk.typeName}
                        {tk.seat ? ` · ${tk.seat}` : ''}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block font-mono text-[15px] font-semibold tracking-wide" style={{ textDecoration: voided ? 'line-through' : undefined, color: voided ? t.mutedText : t.text }}>
                        {tk.code}
                      </span>
                      <span className="block text-[11.5px]" style={muted}>
                        {voided ? 'No longer valid' : tk.checkedInAt ? 'Checked in' : 'Open QR ticket'}
                      </span>
                    </span>
                    <ChevronRightIcon size={16} className="shrink-0" style={muted} aria-hidden />
                    </Link>
                  </li>
                );
              })}
            </ul>
            {ev?.refundPolicy && (
              <p className="pt-3 text-[12px] leading-snug" style={{ ...muted, borderTop: `1px solid ${mix(t.text, 10)}` }}>
                {ev.refundPolicy}
              </p>
            )}
          </section>
        );
      })}
    </>
  );
}
