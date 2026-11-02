import { useT } from '../../contexts/LocaleContext';
import React, { useState } from 'react';
import { ArmchairIcon, CalendarIcon, LinkIcon, MapPinIcon, TicketIcon, VideoIcon } from 'lucide-react';
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
import { useCart } from '../../contexts/CartContext';
import { isSeatedType, repeatLabels, seriesDates } from '../../utils/commerce/seating';
import { SeatPicker } from './SeatPicker';
import { dateLocale } from '../../utils/localeFormat';

interface Props {
  event: CommerceEvent | undefined;
  data: CommerceData | null;
  theme: PageTheme;
  mode: RenderMode;
  ctaLabel: string;
}

const shortDate = (iso: string, locale = 'en-GB') => new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'short' });

/** Event block reading live from Commerce → Events: real seats, sales windows and checkout (D73). Dates follow the visitor's language (D510). */
export function LinkedEvent({ event: linked, data, theme, mode, ctaLabel }: Props) {
  const { t: tr, lang } = useT();
  const loc = dateLocale(lang);
  const now = useNow(30_000);
  const track = useTrack();
  const cart = useCart();
  const [chosenId, setChosenId] = useState<string | null>(null);
  const [seatsOpen, setSeatsOpen] = useState(false);
  // Repeating events (D113): the block offers every upcoming date in the series.
  const dates = linked?.series ? seriesDates(data, linked).filter((e) => e.status !== 'draft' && e.status !== 'cancelled' && eventPhase(e, now) !== 'past') : [];
  const ev = dates.find((e) => e.id === chosenId) ?? (dates.length ? dates.find((e) => e.id === linked?.id) ?? dates[0] : linked);
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
  const seatedOnSale = !!ev.seating && onSale.some((t) => isSeatedType(ev, t.id));
  const openSeats = () => {
    if (mode !== 'edit') track('ticket_select', { label: ev.name });
    setSeatsOpen(true);
  };
  const mySeats = cart && product ? cart.lines.filter((l) => l.productId === product.id).flatMap((l) => l.seats ?? []) : [];

  const chip =
  display === 'past' ?
  <PageChip theme={theme} tone="muted">{tr('Event ended')}</PageChip> :
  phase === 'live' ?
  <PageChip theme={theme} tone="strong">{tr('Happening now')}</PageChip> :
  display === 'sold_out' ?
  <PageChip theme={theme}>{tr('Sold out')}</PageChip> :
  left > 0 && left <= LOW_SEATS_AT && display === 'on_sale' ?
  <PageChip theme={theme} tone="strong">{tr('Left: {n}', { n: left })}</PageChip> :
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
            <dt className="sr-only">{tr('When')}</dt>
            <CalendarIcon size={16} className="mt-0.5 shrink-0" style={muted} aria-hidden />
            <dd>
              {formatEventDate(ev.startsAt, ev.timeZone, loc)}
              <span className="block text-[13px]" style={muted}>
                {formatEventTime(ev.startsAt, ev.timeZone, loc)}
                {ev.endsAt && ` – ${formatEventTime(ev.endsAt, ev.timeZone, loc)}`}
              </span>
            </dd>
          </div>
          {(ev.online || ev.venue || ev.address) &&
          <div className="flex items-start gap-2.5">
              <dt className="sr-only">{tr('Where')}</dt>
              {ev.online ? <VideoIcon size={16} className="mt-0.5 shrink-0" style={muted} aria-hidden /> : <MapPinIcon size={16} className="mt-0.5 shrink-0" style={muted} aria-hidden />}
              <dd>
                {ev.online ? tr('Online — link sent with your ticket') : ev.venue}
                {!ev.online && ev.address &&
              <span className="block text-[13px]" style={muted}>
                    {ev.address}
                  </span>
              }
              </dd>
            </div>
          }
        </dl>
        {dates.length > 1 &&
        <div className="flex flex-col gap-2">
            <p className="text-[13px] font-semibold" style={{ color: theme.text }}>
              {tr('Choose a date')} <span className="font-normal" style={muted}>· {tr(repeatLabels[ev.series?.every ?? 'weekly'])}</span>
            </p>
            <div className="kb-scroll -mx-1 flex gap-2 overflow-x-auto overflow-y-hidden px-1 pb-1" role="group" aria-label={tr('Dates')}>
              {dates.map((d) => {
              const selected = d.id === ev.id;
              const full = availableForEvent(data, d, now, me) <= 0;
              return (
                <button
                  key={d.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setChosenId(d.id)}
                  className="flex shrink-0 flex-col items-start px-3 py-2 text-left"
                  style={{ borderRadius: buttonRadius(theme), background: selected ? theme.accent : 'transparent', color: selected ? theme.accentText : theme.text, border: `1px solid ${selected ? theme.accent : mix(theme.text, 16)}` }}>
                  
                    <span className="whitespace-nowrap text-[13.5px] font-semibold">{new Date(d.startsAt).toLocaleDateString(loc, { weekday: 'short', day: 'numeric', month: 'short', timeZone: d.timeZone })}</span>
                    <span className="whitespace-nowrap text-[11.5px]" style={{ opacity: 0.8 }}>
                      {full ? tr('Sold out') : formatEventTime(d.startsAt, d.timeZone, loc)}
                    </span>
                  </button>);

            })}
            </div>
          </div>
        }
        {ev.description &&
        <p className="text-[14px] leading-relaxed" style={muted}>
            {ev.description}
          </p>
        }

        {display !== 'past' && ev.ticketTypes.length > 0 &&
        <ul className="flex flex-col" aria-label={tr('Tickets')}>
            {ev.ticketTypes.map((tt) => {
            const state = ticketTypeState(data, ev, tt, now, me);
            const seats = Math.min(availableOfType(data, ev, tt, now, me), left);
            const sellable = state === 'on_sale' && ev.status === 'on_sale';
            const status =
            state === 'sold_out' ?
            tr('Sold out') :
            state === 'closed' ?
            tr('Sales closed') :
            state === 'not_yet' ?
            tr('On sale {date}', { date: shortDate(tt.salesStart as string, loc) }) :
            ev.status === 'paused' ?
            tr('Paused') :
            null;
            const sub = [tt.note, sellable && tt.salesEnd ? tr('Until {date}', { date: shortDate(tt.salesEnd, loc) }) : null, sellable && seats <= LOW_SEATS_AT ? tr('Left: {n}', { n: seats }) : null].filter(Boolean).join(' · ');
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
                    {status ?? (tt.priceNgn === 0 ? tr('Free') : formatNgn(tt.priceNgn))}
                  </span>
                  {sellable && product && onSale.length > 1 && !isSeatedType(ev, tt.id) &&
                <CheckoutButton
                  mode={mode}
                  showIcon={false}
                  onAdd={(cart) => pick(cart, tt.id)}
                  ariaLabel={`${tr('Add')}: ${tt.name}`}
                  className="flex h-9 shrink-0 items-center px-3.5 text-[13px] font-semibold"
                  style={buttonStyle(theme, 'default')}>
                  
                      {tr('Add')}
                    </CheckoutButton>
                }
                </li>);

          })}
          </ul>
        }

        {display === 'past' ?
        <p className="text-[13px]" style={muted}>
            {tr('This event has finished. Thanks to everyone who came.')}
          </p> :
        seatedOnSale && product && ev.status === 'on_sale' ?
        <CheckoutButton mode={mode} showIcon={false} onAdd={openSeats} className="flex h-12 w-full items-center justify-center gap-2 text-[15px] font-semibold" style={buttonStyle(theme, 'featured')}>
            <ArmchairIcon size={17} aria-hidden />
            {mySeats.length ? tr('Change seats ({n})', { n: mySeats.length }) : ctaLabel || tr('Choose seats')}
          </CheckoutButton> :
        onSale.length > 0 && product && ev.status === 'on_sale' ?
        <CheckoutButton
          mode={mode}
          showIcon={false}
          onAdd={(cart) => pick(cart, onSale.length === 1 ? onSale[0].id : undefined)}
          className="flex h-12 w-full items-center justify-center gap-2 text-[15px] font-semibold"
          style={buttonStyle(theme, 'featured')}>
          
            <TicketIcon size={17} aria-hidden />
            {tr(ctaLabel || (onSale.every((t) => t.priceNgn === 0) ? 'Register free' : 'Get tickets'))}
          </CheckoutButton> :

        <span className="flex h-12 items-center justify-center text-[14px] font-medium" style={{ color: theme.mutedText, borderRadius: buttonRadius(theme), border: `1px dashed ${mix(theme.text, 22)}` }}>
            {display === 'sold_out' ? tr('Tickets sold out') : display === 'paused' ? tr('Ticket sales are paused') : tr('Tickets aren’t on sale yet')}
          </span>
        }
        {display !== 'past' && ev.refundPolicy &&
        <p className="text-[11.5px] leading-snug" style={muted}>
            {ev.refundPolicy}
          </p>
        }
      </div>
      {seatsOpen && cart && product && me &&
      <SeatPicker
        event={ev}
        data={data}
        theme={theme}
        holder={me}
        initial={mySeats}
        onClose={() => setSeatsOpen(false)}
        onConfirm={(byType) => {
          Object.entries(byType).forEach(([ttId, seats]) => cart.setSeats(product.id, ttId, seats));
          setSeatsOpen(false);
          if (Object.values(byType).some((s) => s.length)) cart.setOpen(true);
        }} />

      }
    </article>);

}