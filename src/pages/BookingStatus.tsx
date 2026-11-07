import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon, CalendarCheck2Icon, CalendarClockIcon, CalendarXIcon, MessageCircleIcon } from 'lucide-react';
import { useResolvedPage, sellerPhone } from '../hooks/useResolvedPage';
import { usePageOps } from '../hooks/usePageOps';
import { PageSurface } from '../components/blocks/PageSurface';
import { VisitorLanguageRow } from '../components/blocks/VisitorLanguageRow';
import { cardStyle, mix } from '../components/blocks/pageStyle';
import { CheckoutHeading, PrimaryButton, SecondaryButton, TestModeNote } from '../components/checkout/checkoutUi';
import { SlotPicker } from '../components/booking/SlotPicker';
import { cancelBooking, rescheduleBooking, wasDeclined } from '../utils/ops/ops';
import { dayLabel, durationLabel, timeLabel } from '../utils/ops/slots';
import { formatNgn, whatsappLink } from '../utils/format';
import { bookingBalance, payBookingBalance } from '../utils/ops/balance';
import { readMoney, recordStagePayment, writeMoney } from '../utils/money/store';
import { Unavailable } from './PublicPage';
import { useVisitorLang } from '../hooks/useVisitorLang';
import { LocaleProvider, translatorFor } from '../contexts/LocaleContext';
import { meetingApps } from '../utils/ops/meetings';

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
  const [lang, setLang] = useVisitorLang(page?.doc.language);
  const tx = translatorFor(lang);

  const booking = ops.data?.bookings.find((b) => b.id === bookingId);
  if (!page) return <Unavailable handle={handle} />;
  if (!booking || !ops.data) return <Unavailable handle={handle} title={tx('We can’t find that booking')} body={tx('The link may be incomplete. Contact the business with your booking reference.')} />;

  const t = page.doc.theme;
  const muted = { color: t.mutedText };
  const a = ops.data.availability;
  const tz = a.timeZone;
  const service = ops.data.services.find((s) => s.id === booking.serviceId);
  const start = Date.parse(booking.start);
  const upcoming = start > Date.now() && (booking.status === 'confirmed' || booking.status === 'pending_deposit');
  // D256: a request waiting for the business, or one they declined.
  const requested = booking.status === 'requested' && start > Date.now();
  const declined = wasDeclined(booking);
  const declineReason = declined ? booking.events.find((e) => e.label.startsWith('Declined by you'))?.label.split(' — ')[1]?.split(' · ')[0] ?? '' : '';
  const freeWindow = start - Date.now() >= a.cancelHours * 3600000;
  const phone = sellerPhone(page.doc);
  const bal = bookingBalance(booking, service);

  const payBalance = () => {
    setPaying(true);
    window.setTimeout(() => {
      setPaying(false);
      if (cardOutcome === 'declined') return setError(tx('Your card was declined (test). Nothing was charged.'));
      const ok = ops.apply((d) => payBookingBalance(d, booking.id, 'online'));
      if (!ok) return setError(tx('Couldn’t take the payment. Please try again.'));
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
    } else setError(msg ?? tx('Couldn’t reschedule.'));
  };

  return (
    <LocaleProvider lang={lang} setLang={setLang}>
    <div className="min-h-screen w-full" style={{ background: t.background }}>
      <PageSurface theme={t} header={<VisitorLanguageRow theme={t} />}>
        <main className="flex flex-col gap-5 py-6">
          <Link to={`/p/${handle}`} className="inline-flex items-center gap-1.5 self-start text-[14px] font-medium" style={muted}>
            <ArrowLeftIcon size={15} aria-hidden /> {tx('Back to {name}', { name: page.doc.title })}
          </Link>
          {booking.status === 'cancelled' ? <CalendarXIcon size={30} aria-hidden /> : booking.status === 'requested' ? <CalendarClockIcon size={30} aria-hidden /> : <CalendarCheck2Icon size={30} aria-hidden />}
          <CheckoutHeading
            level={1}
            theme={t}
            sub={
              declined
                ? `${tx('The business couldn’t take this booking.')}${declineReason ? ` “${declineReason}”` : ''}${booking.depositPaidNgn ? ` ${tx('Your {amount} deposit is refunded in full.', { amount: formatNgn(booking.depositPaidNgn) })}` : ''}`
                : booking.status === 'cancelled'
                ? tx('This booking was cancelled.')
                : requested
                  ? tx('{name} accepts each booking themselves. Your time is held, and you’ll hear at {to} when they reply (preview only in this prototype).', { name: page.doc.title, to: booking.customer.email || booking.customer.phone })
                  : booking.status === 'requested'
                    ? tx('This request wasn’t answered before the appointment time.')
                    : upcoming
                  ? tx('A confirmation has been sent to {to} (preview only in this prototype).', { to: booking.customer.email || booking.customer.phone })
                  : tx('This booking is in the past.')
            }
          >
            {tx(declined ? 'Request declined' : booking.status === 'cancelled' ? 'Booking cancelled' : booking.status === 'requested' ? 'Request sent' : 'You’re booked in')}
          </CheckoutHeading>
          <TestModeNote theme={t} />

          {booking.meeting && booking.status !== 'cancelled' && upcoming && (
            <section aria-label={tx('How to join')} className="flex flex-col gap-2 p-5 text-[14px]" style={cardStyle(t)}>
              <p className="font-semibold">{tx('Join on {app}', { app: meetingApps[booking.meeting.app].name })}</p>
              <p className="break-all font-mono text-[12.5px]" style={muted}>
                {booking.meeting.url}
              </p>
              {booking.meeting.code && (
                <p className="text-[13px]" style={muted}>
                  {booking.meeting.app === 'zoom' ? tx('Passcode') : tx('Meeting ID')}: {booking.meeting.code}
                </p>
              )}
              <a href={booking.meeting.url} target="_blank" rel="noopener noreferrer" className="mt-1 flex h-12 items-center justify-center gap-2 text-[15px] font-semibold focus-visible:outline-none focus-visible:ring-2" style={{ background: t.accent, color: t.accentText, borderRadius: 999 }}>
                {tx('Join the call')}
              </a>
              <p className="text-[12.5px]" style={muted}>
                {tx('The same link is in your confirmation and reminder. Preview link — it won’t open a real meeting in this prototype.')}
              </p>
            </section>
          )}

          <dl className="flex flex-col gap-2 p-5 text-[14px]" style={cardStyle(t)}>
            <div className="flex justify-between gap-3">
              <dt style={muted}>{tx('Reference')}</dt>
              <dd className="font-mono font-semibold">{booking.ref}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt style={muted}>{tx('Service')}</dt>
              <dd className="text-right font-medium">{booking.serviceName}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt style={muted}>{tx('When')}</dt>
              <dd className="text-right font-medium">
                {dayLabel(start, tz)}, {timeLabel(start, tz)}
                <span className="block text-[12px] font-normal" style={muted}>
                  {service ? durationLabel(service.durationMin) : ''} · {tz.replace('_', ' ')}
                </span>
              </dd>
            </div>
            {booking.depositPaidNgn > 0 && (
              <div className="flex justify-between gap-3 border-t pt-2" style={{ borderColor: mix(t.text, 12) }}>
                <dt style={muted}>{tx('Booking fee paid')}</dt>
                <dd className="tabular-nums">{formatNgn(booking.depositPaidNgn)}</dd>
              </div>
            )}
            {bal.state !== 'none' && booking.status !== 'cancelled' && (
              <div className="flex justify-between gap-3">
                <dt style={muted}>{tx(bal.state === 'paid' ? 'Balance paid' : bal.state === 'at_appointment' ? 'Pay at the appointment' : 'Balance')}</dt>
                <dd className="text-right tabular-nums">
                  {formatNgn(bal.amount)}
                  {bal.dueAt && bal.state !== 'paid' && (
                    <span className="block text-[12px]" style={muted}>
                      {tx('Due by {when}', { when: `${dayLabel(bal.dueAt, tz)}, ${timeLabel(bal.dueAt, tz)}` })}
                    </span>
                  )}
                </dd>
              </div>
            )}
          </dl>

          {upcoming && mode === 'view' && (bal.state === 'due' || bal.state === 'overdue' || bal.state === 'upcoming') && (
            <PrimaryButton theme={t} onClick={() => setMode('balance')}>
              {tx('Pay the balance · {amount}', { amount: formatNgn(bal.amount) })}
            </PrimaryButton>
          )}

          {mode === 'balance' && (
            <section aria-labelledby="bs-balance" className="flex flex-col gap-4 p-5" style={cardStyle(t)}>
              <h2 id="bs-balance" className="text-[15px] font-semibold">
                {tx('Pay {amount} for {service}', { amount: formatNgn(bal.amount), service: booking.serviceName })}
              </h2>
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-1 text-[13px] font-medium">{tx('Test card')}</legend>
                {(['success', 'declined'] as const).map((o) => (
                  <label key={o} className="flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2.5 text-[14px]" style={{ border: `1px solid ${mix(t.text, cardOutcome === o ? 40 : 14)}` }}>
                    <input type="radio" name="balance-card" checked={cardOutcome === o} onChange={() => setCardOutcome(o)} />
                    {o === 'success' ? `4242 4242 4242 4242 — ${tx('payment works')}` : `4000 0000 0000 0002 — ${tx('declined')}`}
                  </label>
                ))}
              </fieldset>
              {error && (
                <p className="text-[13px] font-semibold" role="alert">
                  {error}
                </p>
              )}
              <PrimaryButton theme={t} disabled={paying} onClick={payBalance}>
                {paying ? tx('Paying…') : tx('Pay {amount}', { amount: formatNgn(bal.amount) })}
              </PrimaryButton>
              <SecondaryButton theme={t} onClick={() => (setMode('view'), setError(''))}>
                Back
              </SecondaryButton>
            </section>
          )}

          {upcoming && mode === 'view' && (
            <div className="flex flex-col gap-2">
              <p className="text-[12.5px]" style={muted}>
                {freeWindow ? tx('Free to change until {n} hours before.', { n: a.cancelHours }) : tx('It’s within {n} hours, so changes may lose your deposit.', { n: a.cancelHours })} {a.policy}
              </p>
              <PrimaryButton theme={t} onClick={() => setMode('reschedule')}>
                Reschedule
              </PrimaryButton>
              <SecondaryButton theme={t} onClick={() => setMode('cancel')}>
                Cancel booking
              </SecondaryButton>
            </div>
          )}

          {requested && mode === 'view' && (
            <SecondaryButton theme={t} onClick={() => setMode('cancel')}>
              Withdraw request
            </SecondaryButton>
          )}

          {mode === 'reschedule' && service && (
            <section className="flex flex-col gap-4" aria-label={tx('Pick a new time')}>
              <SlotPicker theme={t} service={service} availability={a} bookings={ops.data.bookings} value={newStart} onChange={setNewStart} ignoreId={booking.id} />
              {error && (
                <p className="text-[13px] font-semibold" role="alert">
                  {error}
                </p>
              )}
              <PrimaryButton theme={t} disabled={newStart === null} onClick={reschedule}>
                Move my booking
              </PrimaryButton>
              <SecondaryButton theme={t} onClick={() => setMode('view')}>
                Keep the current time
              </SecondaryButton>
            </section>
          )}

          {mode === 'cancel' && (
            <section className="flex flex-col gap-3 p-4" style={cardStyle(t)} aria-label={tx('Cancel booking')}>
              <p className="text-[15px] font-semibold">{tx(requested ? 'Withdraw this request?' : 'Cancel this booking?')}</p>
              <p className="text-[13.5px]" style={muted}>
                {booking.depositPaidNgn > 0
                  ? freeWindow || requested
                    ? tx('Your {amount} deposit will be refunded.', { amount: formatNgn(booking.depositPaidNgn) })
                    : tx('It’s within {n} hours, so under the policy the {amount} deposit isn’t refunded.', { n: a.cancelHours, amount: formatNgn(booking.depositPaidNgn) })
                  : tx('Nothing was paid, so there’s nothing to refund.')}
                {bal.state === 'paid' && ` ${tx('The {amount} balance you paid is refunded in full.', { amount: formatNgn(booking.balancePaidNgn ?? 0) })}`}
              </p>
              <PrimaryButton
                theme={t}
                onClick={() => {
                  if (ops.apply((d) => cancelBooking(d, booking.id, 'customer', ''))) setMode('view');
                }}
              >
                Yes, cancel it
              </PrimaryButton>
              <SecondaryButton theme={t} onClick={() => setMode('view')}>
                Keep my booking
              </SecondaryButton>
            </section>
          )}

          {phone && (
            <a href={whatsappLink(phone, `Hi! About my booking ${booking.ref}…`)} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center justify-center gap-2 text-[15px] font-semibold" style={{ ...cardStyle(t), borderRadius: 999 }}>
              <MessageCircleIcon size={17} aria-hidden /> {tx('Message the business')}
            </a>
          )}
        </main>
      </PageSurface>
    </div>
    </LocaleProvider>
  );
}
