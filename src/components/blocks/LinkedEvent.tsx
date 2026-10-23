import React from 'react';
import { CalendarIcon, LinkIcon, MapPinIcon, TicketIcon, VideoIcon } from 'lucide-react';
import type { PageTheme, RenderMode } from '../../types/page';
import type { CommerceData, CommerceEvent } from '../../types/commerce';
import { BlockPlaceholder } from './BlockPlaceholder';
import { PageChip } from './BlockTitle';
import { CheckoutButton } from './CheckoutButton';
import { MediaImage } from '../media/MediaImage';
import { buttonRadius, buttonStyle, cardStyle, fontsFor, mix } from './pageStyle';
import { formatEventDate, formatEventTime } from '../../utils/eventTime';
import { formatNgn } from '../../utils/format';
import { useNow } from '../../hooks/useNow';
import { LOW_SEATS_AT, availableForEvent, availableOfType, eventDisplay, eventPhase, eventProduct, holderId, ticketTypeState } from '../../utils/commerce/tickets';
import { useTrack } from '../../contexts/TrackContext';

interface Props {
  event: CommerceEvent | undefined;
  data: CommerceData | null;
  theme: PageTheme;
  mode: RenderMode;
  ctaLabel: string;
}

const shortDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

/** Event block reading live from Commerce → Events: real seats, sales windows and checkout (D73). */
export function LinkedEvent({ event: ev, data, theme, mode, ctaLabel }: Props) {
  const now = useNow(30_000);
  const track = useTrack();
  if (!ev || ev.status === 'draft' || ev.status === 'cancelled') {
    if (mode !== 'edit') return null;
    return (
      <BlockPlaceholder
        icon={LinkIcon}
        title={!ev ? 'Choose an event' : ev.status === 'draft' ? `“${ev.name || 'Untitled event'}” is a draft` : `“${ev.name}” was cancelled`}
        hint={!ev ? 'Pick one from Commerce → Events in the inspector.' : 'Visitors won’t see this block until the event is on sale.'}
        theme={theme}
        tall />);


  }
  const product = eventProduct(data, ev);
  // Seats held by other people mid-checkout count as taken; this visitor's own hold doesn't (D73a).
  const me = mode === 'edit' ? undefined : holderId();
  const display = eventDisplay(data, ev, now, me);
  const phase = eventPhase(ev, now);
  const left = availableForEvent(data, ev, now, me);
  const onSale = ev.ticketTypes.filter((t) => ticketTypeState(data, ev, t, now, me) === 'on_sale');
  const pick = (cart: {add: (p: string, v?: string) => void;}, variantId?: string) => {
    if (mode !== 'edit') track('ticket_select', { label: ev.name });
    cart.add(product?.id ?? '', variantId);
  };
  const muted = { color: theme.mutedText };

  const chip =
  display === 'past' ?
  <PageChip theme={theme} tone="muted">Event ended</PageChip> :
  phase === 'live' ?
  <PageChip theme={theme} tone="strong">Happening now</PageChip> :
  display === 'sold_out' ?
  <PageChip theme={theme}>Sold out</PageChip> :
  left > 0 && left <= LOW_SEATS_AT && display === 'on_sale' ?
  <PageChip theme={theme} tone="strong">Only {left} left</PageChip> :
  null;

  return (
    <article className="overflow-hidden" style={cardStyle(theme)}>
      {ev.imageUrl && <MediaImage src={ev.imageUrl} alt="" loading="lazy" className="aspect-[16/9] w-full object-cover" />}
      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-[22px] font-medium leading-tight" style={{ fontFamily: fontsFor(theme).display, color: theme.text }}>
            {ev.name}
          </h2>
          {chip}
        </div>
        <dl className="flex flex-col gap-2.5 text-[14px]" style={{ color: theme.text }}>
          <div className="flex items-start gap-2.5">
            <dt className="sr-only">When</dt>
            <CalendarIcon size={16} className="mt-0.5 shrink-0" style={muted} aria-hidden />
            <dd>
              {formatEventDate(ev.startsAt, ev.timeZone)}
              <span className="block text-[13px]" style={muted}>
                {formatEventTime(ev.startsAt, ev.timeZone)}
                {ev.endsAt && ` – ${formatEventTime(ev.endsAt, ev.timeZone)}`}
              </span>
            </dd>
          </div>
          {(ev.online || ev.venue || ev.address) &&
          <div className="flex items-start gap-2.5">
              <dt className="sr-only">Where</dt>
              {ev.online ? <VideoIcon size={16} className="mt-0.5 shrink-0" style={muted} aria-hidden /> : <MapPinIcon size={16} className="mt-0.5 shrink-0" style={muted} aria-hidden />}
              <dd>
                {ev.online ? 'Online — link sent with your ticket' : ev.venue}
                {!ev.online && ev.address &&
              <span className="block text-[13px]" style={muted}>
                    {ev.address}
                  </span>
              }
              </dd>
            </div>
          }
        </dl>
        {ev.description &&
        <p className="text-[14px] leading-relaxed" style={muted}>
            {ev.description}
          </p>
        }

        {display !== 'past' && ev.ticketTypes.length > 0 &&
        <ul className="flex flex-col" aria-label="Tickets">
            {ev.ticketTypes.map((tt) => {
            const state = ticketTypeState(data, ev, tt, now, me);
            const seats = Math.min(availableOfType(data, ev, tt, now, me), left);
            const sellable = state === 'on_sale' && ev.status === 'on_sale';
            const status =
            state === 'sold_out' ?
            'Sold out' :
            state === 'closed' ?
            'Sales closed' :
            state === 'not_yet' ?
            `On sale ${shortDate(tt.salesStart as string)}` :
            ev.status === 'paused' ?
            'Paused' :
            null;
            const sub = [tt.note, sellable && tt.salesEnd ? `Until ${shortDate(tt.salesEnd)}` : null, sellable && seats <= LOW_SEATS_AT ? `${seats} left` : null].filter(Boolean).join(' · ');
            return (
              <li key={tt.id} className="flex items-center gap-3 py-3" style={{ borderTop: `1px solid ${mix(theme.text, 9)}` }}>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14.5px] font-medium" style={{ color: sellable ? theme.text : theme.mutedText, textDecoration: state === 'sold_out' ? 'line-through' : undefined }}>
                      {tt.name}
                    </span>
                    {sub &&
                  <span className="block text-[12px]" style={muted}>
                        {sub}
                      </span>
                  }
                  </span>
                  <span className="shrink-0 text-right text-[14px] font-semibold tabular-nums" style={{ color: sellable ? theme.text : theme.mutedText }}>
                    {status ?? (tt.priceNgn === 0 ? 'Free' : formatNgn(tt.priceNgn))}
                  </span>
                  {sellable && product && onSale.length > 1 &&
                <CheckoutButton
                  mode={mode}
                  showIcon={false}
                  onAdd={(cart) => pick(cart, tt.id)}
                  ariaLabel={`Add ${tt.name} ticket`}
                  className="flex h-9 shrink-0 items-center px-3.5 text-[13px] font-semibold"
                  style={buttonStyle(theme, 'default')}>
                  
                      Add
                    </CheckoutButton>
                }
                </li>);

          })}
          </ul>
        }

        {display === 'past' ?
        <p className="text-[13px]" style={muted}>
            This event has finished. Thanks to everyone who came.
          </p> :
        onSale.length > 0 && product && ev.status === 'on_sale' ?
        <CheckoutButton
          mode={mode}
          showIcon={false}
          onAdd={(cart) => pick(cart, onSale.length === 1 ? onSale[0].id : undefined)}
          className="flex h-12 w-full items-center justify-center gap-2 text-[15px] font-semibold"
          style={buttonStyle(theme, 'featured')}>
          
            <TicketIcon size={17} aria-hidden />
            {ctaLabel || (onSale.every((t) => t.priceNgn === 0) ? 'Register free' : 'Get tickets')}
          </CheckoutButton> :

        <span className="flex h-12 items-center justify-center text-[14px] font-medium" style={{ color: theme.mutedText, borderRadius: buttonRadius(theme), border: `1px dashed ${mix(theme.text, 22)}` }}>
            {display === 'sold_out' ? 'Tickets sold out' : display === 'paused' ? 'Ticket sales are paused' : 'Tickets aren’t on sale yet'}
          </span>
        }
        {display !== 'past' && ev.refundPolicy &&
        <p className="text-[11.5px] leading-snug" style={muted}>
            {ev.refundPolicy}
          </p>
        }
      </div>
    </article>);

}