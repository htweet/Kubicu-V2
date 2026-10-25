import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangleIcon, ArrowLeftIcon, Loader2Icon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import type { PageOps } from '../../hooks/usePageOps';
import { PageOverlay } from '../blocks/PageOverlay';
import { cardStyle, mix } from '../blocks/pageStyle';
import { CheckoutHeading, PrimaryButton, SecondaryButton, SheetActions, StepDots, TestModeNote, ThemedField } from '../checkout/checkoutUi';
import { SlotPicker } from './SlotPicker';
import { StaffPicker } from './StaffPicker';
import { eligibleStaff } from '../../utils/ops/staff';
import { useT } from '../../contexts/LocaleContext';
import { createBooking } from '../../utils/ops/ops';
import { dayLabel, durationLabel, timeLabel, visitorTimeZone } from '../../utils/ops/slots';
import { isValidEmail, isValidPhone } from '../../utils/validation';
import { formatNgn } from '../../utils/format';
import { isNaira } from '../../utils/currency';
import { UssdPay } from '../checkout/UssdPay';
import { useTrack } from '../../contexts/TrackContext';

type Step = 'time' | 'details' | 'confirm' | 'working' | 'problem';

interface BookingSheetProps {
  theme: PageTheme;
  ops: PageOps;
  serviceId: string | null;
  handle: string;
  onClose: () => void;
}

export function BookingSheet({ theme, ops, serviceId, handle, onClose }: BookingSheetProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('time');
  const [start, setStart] = useState<number | null>(null);
  const [staffId, setStaffId] = useState<string | null>(null);
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '' });
  const [intake, setIntake] = useState('');
  const [consent, setConsent] = useState(false);
  const [deposit, setDeposit] = useState<'paid' | 'failed'>('paid');
  const [simulateTaken, setSimulateTaken] = useState(false);
  const [ussd, setUssd] = useState(false);
  const [problem, setProblem] = useState<{kind: 'taken' | 'failed';message: string;} | null>(null);
  const [tried, setTried] = useState(false);
  const track = useTrack();
  const { t } = useT();
  // Booking funnel: a time was chosen (D61).
  useEffect(() => {
    if (step === 'details' && serviceId) track('booking_time', { label: serviceId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(() => {
    if (!serviceId) return;
    setStep('time');
    setStart(null);
    setStaffId(null);
    setProblem(null);
    setTried(false);
  }, [serviceId]);

  const data = ops.data;
  const service = data?.services.find((s) => s.id === serviceId);
  if (!data || !service) return null;
  const a = data.availability;
  const tz = a.timeZone;
  const muted = { color: theme.mutedText };
  const staff = eligibleStaff(service, a);
  const chosen = staff.find((s) => s.memberId === staffId) ?? null;
  const steps: Step[] = ['time', 'details', 'confirm'];
  const errors = {
    name: !customer.name.trim() ? 'Enter your name' : '',
    phone: !isValidPhone(customer.phone) ? 'Enter a phone number, e.g. +234 803 123 4567' : '',
    email: !isValidEmail(customer.email) ? 'Enter an email for your confirmation' : ''
  };

  const book = (byUssd = false) => {
    if (start === null) return;
    setStep('working');
    window.setTimeout(() => {
      let result: ReturnType<typeof createBooking> | null = null;
      const ok = ops.apply((d) => {
        // Prototype: simulate someone else taking the slot moments earlier.
        const base = simulateTaken ?
        { ...d, bookings: [{ id: 'sim_taken', ref: 'SIM', serviceId: service.id, serviceName: service.name, start: new Date(start).toISOString(), end: new Date(start + service.durationMin * 60000).toISOString(), customer: { name: 'Someone else', phone: '', email: '' }, intake: '', status: 'confirmed' as const, depositPaidNgn: 0, priceNgn: null, customerTimeZone: tz, events: [] }, ...d.bookings] } :
        d;
        result = createBooking(base, {
          service,
          start,
          customer: { name: customer.name.trim(), phone: customer.phone.trim(), email: customer.email.trim() },
          intake: intake.trim(),
          depositOutcome: service.depositNgn ? byUssd ? 'paid' : deposit : 'none',
          customerTimeZone: visitorTimeZone(),
          marketingConsent: consent,
          staffId: chosen?.memberId ?? null
        });
        return result.ok ? result.data : d;
      });
      const r = result as ReturnType<typeof createBooking> | null;
      if (!ok || !r) {
        setProblem({ kind: 'failed', message: 'Something went wrong. Nothing was booked or charged.' });
        setStep('problem');
        return;
      }
      if (!r.ok) {
        setProblem({ kind: r.reason, message: r.message });
        if (r.reason === 'taken') setStart(null);
        setSimulateTaken(false);
        setStep('problem');
        return;
      }
      track('booking_confirmed', { label: service.name, valueNgn: r.booking.depositPaidNgn || undefined });
      onClose();
      navigate(`/p/${handle}/booking/${r.booking.id}`);
    }, 1100);
  };

  const body = () => {
    // Deposit by USSD (D136).
    if (ussd && step === 'confirm' && service.depositNgn)
    return (
      <div className="flex flex-1 flex-col gap-4">
          <UssdPay theme={theme} amount={service.depositNgn} onBack={() => setUssd(false)} onPaid={() => (setUssd(false), book(true))} />
        </div>);

    if (step === 'working')
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center" role="status">
          <Loader2Icon size={28} className="animate-spin" aria-hidden />
          <p className="text-[16px] font-medium">{service.depositNgn ? 'Taking your test deposit…' : 'Booking your time…'}</p>
        </div>);

    if (step === 'problem' && problem)
    return (
      <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-2 py-4 text-center" role="alert">
            <AlertTriangleIcon size={28} aria-hidden />
            <p className="text-[18px] font-medium">{problem.kind === 'taken' ? 'That time was just taken' : 'Deposit didn’t go through'}</p>
            <p className="max-w-xs text-[13.5px]" style={muted}>
              {problem.message}
            </p>
          </div>
          <SheetActions theme={theme}>
            <PrimaryButton theme={theme} onClick={() => setStep(problem.kind === 'taken' ? 'time' : 'confirm')}>
              {problem.kind === 'taken' ? 'Pick another time' : 'Try again'}
            </PrimaryButton>
          </SheetActions>
        </div>);

    if (step === 'time')
    return (
      <div className="flex flex-col gap-4">
          <CheckoutHeading theme={theme} sub={`${durationLabel(service.durationMin)} · ${service.priceNgn !== null ? formatNgn(service.priceNgn) : 'Price on request'}${service.depositNgn ? ` · ${formatNgn(service.depositNgn)} deposit to hold it` : ''}`}>
            {service.name}
          </CheckoutHeading>
          {staff.length > 1 && <StaffPicker theme={theme} staff={staff} value={chosen?.memberId ?? null} onChange={(id) => (setStaffId(id), setStart(null))} />}
          <SlotPicker key={chosen?.memberId ?? 'any'} theme={theme} service={service} availability={a} bookings={data.bookings} value={start} onChange={setStart} staffId={chosen?.memberId ?? null} />
          <SheetActions theme={theme}>
            <PrimaryButton theme={theme} disabled={start === null} onClick={() => setStep('details')}>
              Continue
            </PrimaryButton>
          </SheetActions>
        </div>);

    if (step === 'details')
    return (
      <form
        className="flex flex-col gap-4"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          setTried(true);
          if (Object.values(errors).some(Boolean)) return;
          setTried(false);
          setStep('confirm');
        }}>
        
          <CheckoutHeading theme={theme}>Your details</CheckoutHeading>
          <ThemedField theme={theme} label="Full name" autoComplete="name" value={customer.name} error={tried ? errors.name || undefined : undefined} onChange={(name) => setCustomer((c) => ({ ...c, name }))} />
          <ThemedField theme={theme} label="Phone (WhatsApp preferred)" type="tel" inputMode="tel" autoComplete="tel" value={customer.phone} error={tried ? errors.phone || undefined : undefined} onChange={(phone) => setCustomer((c) => ({ ...c, phone }))} />
          <ThemedField theme={theme} label="Email" type="email" inputMode="email" autoComplete="email" value={customer.email} error={tried ? errors.email || undefined : undefined} onChange={(email) => setCustomer((c) => ({ ...c, email }))} />
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium">
              Anything we should know? <span style={{ ...muted, fontWeight: 400 }}>· optional</span>
            </span>
            <textarea value={intake} rows={3} onChange={(e) => setIntake(e.target.value)} className="w-full resize-none px-3.5 py-2.5 text-[14.5px] outline-none focus:ring-2" style={{ background: theme.background, color: theme.text, borderRadius: 10, border: `1px solid ${mix(theme.text, 18)}` }} />
          </label>
          <label className="flex items-start gap-2 text-[12.5px]" style={muted}>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" style={{ accentColor: theme.text }} />
            Send me occasional updates and offers (optional). Booking reminders are sent either way.
          </label>
          <SheetActions theme={theme}>
            <PrimaryButton theme={theme} type="submit">
              Continue
            </PrimaryButton>
          </SheetActions>
        </form>);

    // confirm
    return (
      <div className="flex flex-col gap-4">
        <CheckoutHeading theme={theme}>Confirm your booking</CheckoutHeading>
        <dl className="flex flex-col gap-2 p-4 text-[14px]" style={cardStyle(theme)}>
          <div className="flex justify-between gap-3">
            <dt style={muted}>Service</dt>
            <dd className="text-right font-medium">{service.name}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt style={muted}>When</dt>
            <dd className="text-right font-medium">
              {start !== null && `${dayLabel(start, tz)}, ${timeLabel(start, tz)}`}
              <span className="block text-[12px] font-normal" style={muted}>
                {durationLabel(service.durationMin)} · {tz.replace('_', ' ')}
              </span>
            </dd>
          </div>
          {staff.length > 0 &&
          <div className="flex justify-between gap-3">
              <dt style={muted}>{t('With')}</dt>
              <dd className="text-right font-medium">{chosen ? chosen.name : staff.length === 1 ? staff[0].name : t('Anyone available')}</dd>
            </div>
          }
          <div className="flex justify-between gap-3">
            <dt style={muted}>Where</dt>
            <dd className="text-right font-medium">{service.location === 'online' ? 'Online' : service.location === 'customer' ? 'At your address' : 'In person'}{service.locationNote ? <span className="block text-[12px] font-normal" style={muted}>{service.locationNote}</span> : null}</dd>
          </div>
          <div className="flex justify-between gap-3 border-t pt-2" style={{ borderColor: mix(theme.text, 12) }}>
            <dt style={muted}>Pay now</dt>
            <dd className="text-right font-semibold tabular-nums">{service.depositNgn ? `${formatNgn(service.depositNgn)} deposit` : 'Nothing'}</dd>
          </div>
          {service.priceNgn !== null &&
          <div className="flex justify-between gap-3">
              <dt style={muted}>{service.balanceOnline ? `Online, ${service.balanceHoursBefore ?? 24}h before` : 'At the appointment'}</dt>
              <dd className="text-right tabular-nums">{formatNgn(Math.max(0, service.priceNgn - (service.depositNgn ?? 0)))}</dd>
            </div>
          }
        </dl>
        <p className="text-[12.5px] leading-relaxed" style={muted}>
          <span className="font-semibold" style={{ color: theme.text }}>Policy: </span>
          {a.policy}
        </p>
        {service.depositNgn ?
        <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-[13px] font-semibold">Test deposit — choose what happens</legend>
            {(['paid', 'failed'] as const).map((o) =>
          <label key={o} className="flex items-center gap-3 p-3 text-[14px]" style={{ ...cardStyle(theme), border: `1.5px solid ${deposit === o ? theme.text : mix(theme.text, 12)}` }}>
                <input type="radio" name="dep" checked={deposit === o} onChange={() => setDeposit(o)} style={{ accentColor: theme.text }} />
                {o === 'paid' ? 'Payment succeeds' : 'Payment fails (provider error)'}
              </label>
          )}
          </fieldset> :
        null}
        <label className="flex items-start gap-2 text-[12.5px]" style={muted}>
          <input type="checkbox" checked={simulateTaken} onChange={(e) => setSimulateTaken(e.target.checked)} className="mt-0.5" style={{ accentColor: theme.text }} />
          Prototype: simulate someone else booking this time first
        </label>
        <TestModeNote theme={theme} />
        <SheetActions theme={theme}>
          <PrimaryButton theme={theme} onClick={() => book()}>
            {service.depositNgn ? `Pay ${formatNgn(service.depositNgn)} and book` : 'Book this time'}
          </PrimaryButton>
          {service.depositNgn && isNaira() ?
          <SecondaryButton theme={theme} onClick={() => setUssd(true)}>
              No card? Pay the deposit with USSD
            </SecondaryButton> :
          null}
          <SecondaryButton theme={theme} onClick={() => setStep('time')}>
            Change time
          </SecondaryButton>
        </SheetActions>
      </div>);

  };

  return (
    <PageOverlay open={!!serviceId} onClose={onClose} theme={theme} label={`Book ${service.name}`}>
      <div className="flex flex-1 flex-col gap-4 px-5 pb-2 pt-5">
        {steps.includes(step) &&
        <div className="flex items-center gap-3 pr-12">
            {step !== 'time' &&
          <button type="button" aria-label="Back" onClick={() => setStep(steps[steps.indexOf(step) - 1])} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: theme.surface }}>
                <ArrowLeftIcon size={16} aria-hidden />
              </button>
          }
            <div className="flex-1">
              <StepDots theme={theme} step={steps.indexOf(step) + 1} total={steps.length} />
            </div>
          </div>
        }
        {body()}
      </div>
    </PageOverlay>);

}