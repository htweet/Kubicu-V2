import React from 'react';
import { CalendarIcon, MapPinIcon, TicketIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { PageChip } from './BlockTitle';
import { PageAction } from './PageAction';
import { buttonRadius, buttonStyle, cardStyle, fontsFor, mix } from './pageStyle';
import { eventState, formatEventDate, formatEventTime } from '../../utils/eventTime';
import { formatNgn } from '../../utils/format';
import { useNow } from '../../hooks/useNow';

export function EventBlock({ block, theme, mode }: BlockProps<'event'>) {
  const c = block.content;
  const now = useNow(30_000);
  if (!c.title && !c.startsAt) {
    return mode === 'edit' ? <BlockPlaceholder icon={TicketIcon} title="Event details needed" hint="Name, date, venue and ticket link" theme={theme} tall /> : null;
  }
  const state = eventState(c.startsAt, c.endsAt, now);
  const ended = state === 'ended';
  const allTiersGone = c.tiers.length > 0 && c.tiers.every((t) => t.soldOut);
  const soldOut = c.soldOut || allTiersGone;

  return (
    <article className="overflow-hidden" style={cardStyle(theme)}>
      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-[22px] font-medium leading-tight" style={{ fontFamily: fontsFor(theme).display, color: theme.text }}>
            {c.title || 'Untitled event'}
          </h2>
          {ended ? <PageChip theme={theme} tone="muted">Event ended</PageChip> : state === 'live' ? <PageChip theme={theme} tone="strong">Happening now</PageChip> : soldOut ? <PageChip theme={theme}>Sold out</PageChip> : null}
        </div>
        <dl className="flex flex-col gap-2.5 text-[14px]" style={{ color: theme.text }}>
          {c.startsAt &&
          <div className="flex items-start gap-2.5">
              <dt className="sr-only">When</dt>
              <CalendarIcon size={16} className="mt-0.5 shrink-0" style={{ color: theme.mutedText }} aria-hidden />
              <dd>
                {formatEventDate(c.startsAt, c.timeZone)}
                <span className="block text-[13px]" style={{ color: theme.mutedText }}>
                  {formatEventTime(c.startsAt, c.timeZone)}
                  {c.endsAt && ` – ${formatEventTime(c.endsAt, c.timeZone)}`}
                </span>
              </dd>
            </div>
          }
          {(c.venue || c.address) &&
          <div className="flex items-start gap-2.5">
              <dt className="sr-only">Where</dt>
              <MapPinIcon size={16} className="mt-0.5 shrink-0" style={{ color: theme.mutedText }} aria-hidden />
              <dd>
                {c.venue}
                {c.address && <span className="block text-[13px]" style={{ color: theme.mutedText }}>{c.address}</span>}
              </dd>
            </div>
          }
        </dl>
        {c.tiers.length > 0 && !ended &&
        <ul className="flex flex-col">
            {c.tiers.map((t) =>
          <li key={t.id} className="flex items-center justify-between gap-3 py-2.5" style={{ borderTop: `1px solid ${mix(theme.text, 9)}` }}>
                <span className="min-w-0">
                  <span className="block text-[14px] font-medium" style={{ color: theme.text, textDecoration: t.soldOut ? 'line-through' : undefined }}>{t.name}</span>
                  {t.note && <span className="block text-[12px]" style={{ color: theme.mutedText }}>{t.note}</span>}
                </span>
                <span className="shrink-0 text-[14px] font-semibold tabular-nums" style={{ color: t.soldOut ? theme.mutedText : theme.text }}>
                  {t.soldOut ? 'Sold out' : t.priceNgn === null ? 'TBC' : t.priceNgn === 0 ? 'Free' : formatNgn(t.priceNgn)}
                </span>
              </li>
          )}
          </ul>
        }
        {ended ?
        <p className="text-[13px]" style={{ color: theme.mutedText }}>This event has finished. Thanks to everyone who came.</p> :
        soldOut ?
        <span className="flex h-12 items-center justify-center text-[14px] font-medium" style={{ color: theme.mutedText, borderRadius: buttonRadius(theme), border: `1px dashed ${mix(theme.text, 22)}` }}>
            Tickets sold out
          </span> :

        <PageAction mode={mode} href={c.ticketUrl} className="flex h-12 w-full items-center justify-center gap-2 text-[15px] font-semibold" style={buttonStyle(theme, 'featured')}>
            <TicketIcon size={17} aria-hidden />
            {c.ctaLabel || 'Get tickets'}
          </PageAction>
        }
      </div>
    </article>);

}