import React from 'react';
import { CalendarXIcon, PauseCircleIcon, TicketIcon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import { useCatalog } from '../../contexts/CatalogContext';
import { useNow } from '../../hooks/useNow';
import { eventDisplay, findEvent } from '../../utils/commerce/tickets';
import { cardStyle, fontsFor } from '../blocks/pageStyle';

/**
 * The one line an Event space visitor must not miss (D178): cancelled, paused or sold out.
 * Nothing shows while tickets are on sale, before sales open, or after the event — the page's own blocks cover those.
 */
export function EventSpaceNotice({ eventId, theme }: { eventId: string; theme: PageTheme }) {
  const data = useCatalog();
  const now = useNow(30_000);
  const ev = findEvent(data, eventId);
  if (!ev) return null;
  const display = eventDisplay(data, ev, now);

  const notice =
    display === 'cancelled'
      ? { icon: CalendarXIcon, title: `${ev.name} has been cancelled`, body: 'Everyone who bought a ticket has been refunded in full to the way they paid. You don’t need to do anything.' }
      : display === 'paused'
        ? { icon: PauseCircleIcon, title: 'Ticket sales are paused', body: 'Tickets you already have are still valid. Check back soon, or leave your email below to hear when sales reopen.' }
        : display === 'sold_out'
          ? { icon: TicketIcon, title: 'Sold out', body: 'Every seat is taken. Leave your email below and we’ll tell you if seats free up.' }
          : null;
  if (!notice) return null;
  const Icon = notice.icon;

  return (
    <div role="status" className="mb-4 flex items-start gap-3 p-4" style={cardStyle(theme)}>
      <Icon size={20} aria-hidden className="mt-0.5 shrink-0" style={{ color: theme.text }} />
      <div className="min-w-0">
        <p className="text-[16px] font-semibold leading-snug" style={{ fontFamily: fontsFor(theme).display, color: theme.text }}>
          {notice.title}
        </p>
        <p className="mt-1 text-[14px] leading-relaxed" style={{ color: theme.mutedText }}>
          {notice.body}
        </p>
      </div>
    </div>
  );
}
