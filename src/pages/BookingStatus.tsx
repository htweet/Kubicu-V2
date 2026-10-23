import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon, CalendarCheck2Icon, CalendarXIcon, MessageCircleIcon } from 'lucide-react';
import { useResolvedPage, sellerPhone } from '../hooks/useResolvedPage';
import { usePageOps } from '../hooks/usePageOps';
import { PageSurface } from '../components/blocks/PageSurface';
import { cardStyle, mix } from '../components/blocks/pageStyle';
import { CheckoutHeading, PrimaryButton, SecondaryButton, TestModeNote } from '../components/checkout/checkoutUi';
import { SlotPicker } from '../components/booking/SlotPicker';
import { cancelBooking, rescheduleBooking } from '../utils/ops/ops';
import { dayLabel, durationLabel, timeLabel } from '../utils/ops/slots';
import { formatNgn, whatsappLink } from '../utils/format';
import { bookingBalance, payBookingBalance } from '../utils/ops/balance';
import { readMoney, recordStagePayment, writeMoney } from '../utils/money/store';
import { Unavailable } from './PublicPage';

/** The customer’s booking confirmation, with reschedule and cancel under the shown policy. */
export function BookingStatus() {
  const { handle = '', bookingId = '' } = useParams();
  const page = useResolvedPage(handle);
  const ops = usePageOps(page?.workspaceId ?? null, !!page?.isOwn);
  const [mode, setMode] = useState<'view' | 'reschedule' | 'cancel' | 'balance'>('view');
  const [newStart, setNewStart] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [cardOutcome, setCardOutcome] = useState<'success' | 'declined'>('success');
  const [paying, setPaying] = useState(false);

  const booking = ops.data?.bookings.find((b) => b.id === bookingId);
  if (!page) return <Unavailable handle={handle} />;
  if (!booking || !ops.data) return <Unavailable handle={handle} title="We can’t find that booking" body="The link may be incomplete. Contact the business with your booking reference." />;

  const t = page.doc.theme;
  const muted = { color: t.mutedText };
  const a = ops.data.availability;
  const tz = a.timeZone;
  const service = ops.data.services.find((s) => s.id === booking.serviceId);
  const start = Date.parse(booking.start);
  const upcoming = start > Date.now() && (booking.status === 'confirmed' || booking.status === 'pending_deposit');
  const freeWindow = start - Date.now() >= a.cancelHours * 3600000;
  const phone = sellerPhone(page.doc);
  const bal = bookingBalance(booking, service);

  const payBalance = () => {
    setPaying(true);
    window.setTimeout(() => {
      setPaying(false);
      if (cardOutcome === 'declined') return setError('Your card was declined (test). Nothing was charged.');
      const ok = ops.apply((d) => payBookingBalance(d, booking.id, 'online'));
      if (!ok) return setError('Couldn’t take the payment. Please try again.');
      if (page.workspaceId) {
        const res = recordStagePayment(readMoney(page.workspaceId), 'bookings', { type: 'booking', id: booking.id }, `Balance · ${booking.serviceName} · ${booking.customer.name}`, bal.amount);
        writeMoney(page.workspaceId, res.data);
      }
      setError('');
      setMode('view');
    }, 1000);
  };

  const reschedule = () => {
    if (!service || newStart === null) return;
    let msg: string | undefined;
    const ok = ops.apply((d) => {
      const r = rescheduleBooking(d, booking.id, newStart, service, 'customer');
      msg = r.message;
      return r.data;
    });
    if (ok && !msg) {
      setMode('view');
      setError('');
    } else setError(msg ?? 'Couldn’t reschedule.');
  };

  return (
    <div className="min-h-screen w-full" style={{ background: t.background }}>
      <PageSurface theme={t}>
        <main className="flex flex-col gap-5 py-6">
          <Link to={`/p/${handle}`} className="inline-flex items-center gap-1.5 self-start text-[14px] font-medium" style={muted}>
            <ArrowLeftIcon size={15} aria-hidden /> Back to {page.doc.title}
          </Link>
          {booking.status === 'cancelled' ? <CalendarXIcon size={30} aria-hidden /> : <CalendarCheck2Icon size={30} aria-hidden />}
          <CheckoutHeading
            level={1}
            theme={t}
            sub={
            booking.status === 'cancelled' ?
            'This booking was cancelled.' :
            upcoming ?
            `A confirmation has been sent to ${booking.customer.email || booking.customer.phone} (preview only in this prototype).` :
            'This booking is in the past.'
            }>
            
            {booking.status === 'cancelled' ? 'Booking cancelled' : 'You’re booked in'}
          </CheckoutHeading>
          <TestModeNote theme={t} />

          <dl className="flex flex-col gap-2 p-5 text-[14px]" style={cardStyle(t)}>
            <div className="flex justify-between gap-3">
              <dt style={muted}>Reference</dt>
              <dd className="font-mono font-semibold">{booking.ref}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt style={muted}>Service</dt>
              <dd className="text-right font-medium">{booking.serviceName}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt style={muted}>When</dt>
              <dd className="text-right font-medium">
                {dayLabel(start, tz)}, {timeLabel(start, tz)}
                <span className="block text-[12px] font-normal" style={muted}>
                  {service ? durationLabel(service.durationMin) : ''} · {tz.replace('_', ' ')}
                </span>
              </dd>
            </div>
            {booking.depositPaidNgn > 0 &&
            <div className="flex justify-between gap-3 border-t pt-2" style={{ borderColor: mix(t.text, 12) }}>
                <dt style={muted}>Booking fee paid</dt>
                <dd className="tabular-nums">{formatNgn(booking.depositPaidNgn)}</dd>
              </div>
            }
            {bal.state !== 'none' && booking.status !== 'cancelled' &&
            <div className="flex justify-between gap-3">
                <dt style={muted}>{bal.state === 'paid' ? 'Balance paid' : bal.state === 'at_appointment' ? 'Pay at the appointment' : 'Balance'}</dt>
                <dd className="text-right tabular-nums">
                  {formatNgn(bal.amount)}
                  {bal.dueAt && bal.state !== 'paid' &&
                <span className="block text-[12px]" style={muted}>
                      Due by {dayLabel(bal.dueAt, tz)}, {timeLabel(bal.dueAt, tz)}
                    </span>
                }
                </dd>
              </div>
            }
          </dl>

          {upcoming && mode === 'view' && (bal.state === 'due' || bal.state === 'overdue' || bal.state === 'upcoming') &&
          <PrimaryButton theme={t} onClick={() => setMode('balance')}>
              Pay the balance · {formatNgn(bal.amount)}
            </PrimaryButton>
          }

          {mode === 'balance' &&
          <section aria-labelledby="bs-balance" className="flex flex-col gap-4 p-5" style={cardStyle(t)}>
              <h2 id="bs-balance" className="text-[15px] font-semibold">
                Pay {formatNgn(bal.amount)} for {booking.serviceName}
              </h2>
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-1 text-[13px] font-medium">Test card</legend>
                {(['success', 'declined'] as const).map((o) =>
              <label key={o} className="flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2.5 text-[14px]" style={{ border: `1px solid ${mix(t.text, cardOutcome === o ? 40 : 14)}` }}>
                    <input type="radio" name="balance-card" checked={cardOutcome === o} onChange={() => setCardOutcome(o)} />
                    {o === 'success' ? '4242 4242 4242 4242 — payment works' : '4000 0000 0000 0002 — declined'}
                  </label>
              )}
              </fieldset>
              {error &&
            <p className="text-[13px] font-semibold" role="alert">
                  {error}
                </p>
            }
              <PrimaryButton theme={t} disabled={paying} onClick={payBalance}>
                {paying ? 'Paying…' : `Pay ${formatNgn(bal.amount)}`}
              </PrimaryButton>
              <SecondaryButton theme={t} onClick={() => (setMode('view'), setError(''))}>
                Back
              </SecondaryButton>
            </section>
          }

          {upcoming && mode === 'view' &&
          <div className="flex flex-col gap-2">
              <p className="text-[12.5px]" style={muted}>
                {freeWindow ? `Free to change until ${a.cancelHours} hours before.` : `It’s within ${a.cancelHours} hours, so changes may lose your deposit.`} {a.policy}
              </p>
              <PrimaryButton theme={t} onClick={() => setMode('reschedule')}>
                Reschedule
              </PrimaryButton>
              <SecondaryButton theme={t} onClick={() => setMode('cancel')}>
                Cancel booking
              </SecondaryButton>
            </div>
          }

          {mode === 'reschedule' && service &&
          <section className="flex flex-col gap-4" aria-label="Pick a new time">
              <SlotPicker theme={t} service={service} availability={a} bookings={ops.data.bookings} value={newStart} onChange={setNewStart} ignoreId={booking.id} />
              {error &&
            <p className="text-[13px] font-semibold" role="alert">
                  {error}
                </p>
            }
              <PrimaryButton theme={t} disabled={newStart === null} onClick={reschedule}>
                Move my booking
              </PrimaryButton>
              <SecondaryButton theme={t} onClick={() => setMode('view')}>
                Keep the current time
              </SecondaryButton>
            </section>
          }

          {mode === 'cancel' &&
          <section className="flex flex-col gap-3 p-4" style={cardStyle(t)} aria-label="Cancel booking">
              <p className="text-[15px] font-semibold">Cancel this booking?</p>
              <p className="text-[13.5px]" style={muted}>
                {booking.depositPaidNgn > 0 ?
              freeWindow ?
              `Your ${formatNgn(booking.depositPaidNgn)} deposit will be refunded.` :
              `It’s within ${a.cancelHours} hours, so under the policy the ${formatNgn(booking.depositPaidNgn)} deposit isn’t refunded.` :
              'Nothing was paid, so there’s nothing to refund.'}
                {bal.state === 'paid' && ` The ${formatNgn(booking.balancePaidNgn ?? 0)} balance you paid is refunded in full.`}
              </p>
              <PrimaryButton
              theme={t}
              onClick={() => {
                if (ops.apply((d) => cancelBooking(d, booking.id, 'customer', ''))) setMode('view');
              }}>
              
                Yes, cancel it
              </PrimaryButton>
              <SecondaryButton theme={t} onClick={() => setMode('view')}>
                Keep my booking
              </SecondaryButton>
            </section>
          }

          {phone &&
          <a href={whatsappLink(phone, `Hi! About my booking ${booking.ref}…`)} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center justify-center gap-2 text-[15px] font-semibold" style={{ ...cardStyle(t), borderRadius: 999 }}>
              <MessageCircleIcon size={17} aria-hidden /> Message the business
            </a>
          }
        </main>
      </PageSurface>
    </div>);

}