import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeftIcon, CalendarPlusIcon, CheckCircle2Icon, ClockIcon, CopyIcon, MapPinIcon, MessageCircleIcon, VideoIcon, XCircleIcon } from 'lucide-react';
import { useResolvedPage } from '../hooks/useResolvedPage';
import { usePageCommerce } from '../hooks/usePageCommerce';
import { PageSurface } from '../components/blocks/PageSurface';
import { cardStyle, fontsFor, mix } from '../components/blocks/pageStyle';
import { TestModeNote } from '../components/checkout/checkoutUi';
import { Unavailable } from './PublicPage';
import { eventIcs, findEvent, findTicket, ticketQrValue, ticketStatus } from '../utils/commerce/tickets';
import { formatEventDate, formatEventTime } from '../utils/eventTime';
import { qrSvg, styleOf, svgDataUrl } from '../utils/domains/qr';
import { whatsappLink } from '../utils/format';

/** One guest's ticket: QR, code, event details, calendar and share (D74). */
export function TicketPage() {
  const { handle = '', ticketId = '' } = useParams();
  const page = useResolvedPage(handle);
  const commerce = usePageCommerce(page?.workspaceId ?? null, !!page?.isOwn);
  const ref = findTicket(commerce.data, { id: ticketId });
  const ev = ref ? findEvent(commerce.data, ref.ticket.eventId) : undefined;
  const [qr, setQr] = useState('');

  useEffect(() => {
    if (!ref) return;
    let live = true;
    qrSvg(ticketQrValue(ref.ticket.code), styleOf({ fg: '#111111', bg: '#FFFFFF', centreKind: 'none', ecLevel: 'Q', margin: 3 }, '')).then((svg) => live && setQr(svgDataUrl(svg)));
    return () => {
      live = false;
    };
  }, [ref?.ticket.code]);

  if (!page) return <Unavailable handle={handle} />;
  if (!ref || !ev) return <Unavailable handle={handle} title="We can’t find that ticket" body="The link may be incomplete. Check your order page, or contact the organiser with your order number." />;

  const t = page.doc.theme;
  const muted = { color: t.mutedText };
  const status = ticketStatus(ref, ev);
  const url = window.location.href;
  const place = ev.online ? 'Online' : [ev.venue, ev.address].filter(Boolean).join(', ');

  const addToCalendar = () => {
    const blob = new Blob([eventIcs(ev, url)], { type: 'text/calendar' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${ev.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.ics`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Ticket link copied');
    } catch {
      toast.error('Couldn’t copy — hold the address bar to copy instead');
    }
  };

  const banner =
  status === 'void' ?
  { Icon: XCircleIcon, title: ev.status === 'cancelled' ? 'This event was cancelled' : 'This ticket is no longer valid', body: 'It was refunded or the order was cancelled, so it won’t admit anyone.' } :
  status === 'pending' ?
  { Icon: ClockIcon, title: 'Waiting for payment', body: 'Your QR appears here once the payment provider confirms.' } :
  status === 'checked_in' ?
  { Icon: CheckCircle2Icon, title: 'Checked in', body: `At ${new Date(ref.ticket.checkedInAt as string).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}. Enjoy the event.` } :
  null;

  return (
    <div className="min-h-screen w-full" style={{ background: t.background }}>
      <PageSurface theme={t}>
        <main className="flex flex-col gap-5 py-6">
          <Link to={`/p/${handle}/order/${ref.order.id}`} className="inline-flex items-center gap-1.5 self-start text-[14px] font-medium" style={muted}>
            <ArrowLeftIcon size={15} aria-hidden /> Order #{ref.order.number}
          </Link>

          <article className="overflow-hidden" style={cardStyle(t)} aria-label={`Ticket for ${ref.ticket.guestName}`}>
            <div className="flex flex-col gap-1 p-5">
              <p className="text-[12.5px] font-semibold" style={muted}>
                {ref.ticket.typeName}
                {ref.ticket.comp ? ' · Complimentary' : ''}
              </p>
              <h1 className="text-[24px] font-medium leading-tight" style={{ fontFamily: fontsFor(t).display, color: t.text }}>
                {ev.name}
              </h1>
              {ref.ticket.seat &&
              <p className="mt-1 text-[17px] font-semibold" style={{ color: t.text }}>
                  {ref.ticket.seat}
                </p>
              }
              <p className="text-[15px] font-medium">{ref.ticket.guestName}</p>
            </div>

            <div className="flex flex-col items-center gap-3 px-5 pb-6 pt-1" style={{ borderTop: `1px dashed ${mix(t.text, 18)}` }}>
              {banner ?
              <div className="mt-5 flex w-full flex-col items-center gap-2 rounded-md px-4 py-8 text-center" style={{ background: mix(t.text, 6) }} role="status">
                  <banner.Icon size={28} aria-hidden />
                  <p className="text-[16px] font-semibold">{banner.title}</p>
                  <p className="max-w-xs text-[13px]" style={muted}>
                    {banner.body}
                  </p>
                </div> :

              <div className="mt-5 rounded-lg bg-white p-3">
                  {qr ? <img src={qr} alt={`QR code for ticket ${ref.ticket.code}`} className="h-56 w-56" /> : <div className="h-56 w-56 animate-pulse rounded-md bg-black/5" aria-hidden />}
                </div>
              }
              <p className="font-mono text-[22px] font-semibold tracking-[0.12em]" style={{ textDecoration: status === 'void' ? 'line-through' : undefined }}>
                {ref.ticket.code}
              </p>
              {!banner &&
              <p className="text-center text-[12.5px]" style={muted}>
                  Show this at the door. Turn your screen brightness up.
                </p>
              }
            </div>

            <dl className="flex flex-col gap-3 p-5 text-[14px]" style={{ borderTop: `1px solid ${mix(t.text, 10)}` }}>
              <div>
                <dt className="sr-only">When</dt>
                <dd>
                  <span className="font-semibold">{formatEventDate(ev.startsAt, ev.timeZone)}</span>
                  <span className="block text-[13px]" style={muted}>
                    {formatEventTime(ev.startsAt, ev.timeZone)}
                    {ev.endsAt && ` – ${formatEventTime(ev.endsAt, ev.timeZone)}`}
                  </span>
                </dd>
              </div>
              <div className="flex items-start gap-2">
                <dt className="sr-only">Where</dt>
                {ev.online ? <VideoIcon size={15} className="mt-0.5 shrink-0" style={muted} aria-hidden /> : <MapPinIcon size={15} className="mt-0.5 shrink-0" style={muted} aria-hidden />}
                <dd>
                  {ev.online ? 'Online — the organiser sends the joining link before it starts' : place}
                  {!ev.online && place &&
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`} target="_blank" rel="noopener noreferrer" className="block text-[13px] font-semibold underline underline-offset-2">
                      Open in Maps
                    </a>
                  }
                </dd>
              </div>
            </dl>
          </article>

          {status !== 'void' &&
          <div className="grid grid-cols-3 gap-2">
              <ActionButton theme={t} onClick={addToCalendar} icon={CalendarPlusIcon} label="Calendar" />
              <ActionButton theme={t} onClick={copy} icon={CopyIcon} label="Copy link" />
              <a href={whatsappLink('', `My ticket for ${ev.name}: ${url}`)} target="_blank" rel="noopener noreferrer" className="flex h-14 flex-col items-center justify-center gap-1 text-[12.5px] font-semibold" style={cardStyle(t)}>
                <MessageCircleIcon size={17} aria-hidden /> WhatsApp
              </a>
            </div>
          }

          {ev.refundPolicy &&
          <p className="text-[12px] leading-snug" style={muted}>
              {ev.refundPolicy}
            </p>
          }
          <TestModeNote theme={t} />
        </main>
      </PageSurface>
    </div>);

}

function ActionButton({ theme, onClick, icon: Icon, label }: {theme: Parameters<typeof cardStyle>[0];onClick: () => void;icon: React.ComponentType<{size?: number;'aria-hidden'?: boolean;}>;label: string;}) {
  return (
    <button type="button" onClick={onClick} className="flex h-14 flex-col items-center justify-center gap-1 text-[12.5px] font-semibold" style={cardStyle(theme)}>
      <Icon size={17} aria-hidden /> {label}
    </button>);

}