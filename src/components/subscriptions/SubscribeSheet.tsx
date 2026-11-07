import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangleIcon, ArrowLeftIcon, Loader2Icon, ShieldCheckIcon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import type { WorkspacePlan } from '../../types/plan';
import type { OrderCustomer } from '../../types/commerce';
import type { Subscription } from '../../types/subscriptions';
import type { PageCommerce } from '../../hooks/usePageCommerce';
import { PageOverlay } from '../blocks/PageOverlay';
import { cardStyle, mix } from '../blocks/pageStyle';
import { CheckoutHeading, PrimaryButton, SecondaryButton, SheetActions, StepDots, TestModeNote, ThemedField } from '../checkout/checkoutUi';
import { dueToday, intervalWord, renewalTerms, startSubscription, type SignupOutcome } from '../../utils/commerce/subscriptions';
import { isValidEmail, isValidPhone } from '../../utils/validation';
import { formatNgn } from '../../utils/format';
import { phonePlaceholder } from '../../utils/phone';
import { useTrack } from '../../contexts/TrackContext';

type Step = 'details' | 'delivery' | 'pay' | 'bank' | 'working' | 'problem';

interface Props {
  theme: PageTheme;
  commerce: PageCommerce;
  planId: string | null;
  handle: string;
  ownerPlan: WorkspacePlan;
  onClose: () => void;
  onSubscribed: (customer: OrderCustomer, planName: string, consent: boolean) => void;
  /** Where to go after joining. Defaults to the subscriber portal. */
  returnTo?: string;
}

const outcomes: { id: SignupOutcome; label: string }[] = [
  { id: 'success', label: 'Card works' },
  { id: 'bank', label: 'Bank asks me to confirm' },
  { id: 'declined', label: 'Card is declined' },
];

/** Visitor sign-up for a membership or product box (D69). Test mode. */
export function SubscribeSheet({ theme, commerce, planId, handle, ownerPlan, onClose, onSubscribed, returnTo }: Props) {
  const navigate = useNavigate();
  const track = useTrack();
  const [step, setStep] = useState<Step>('details');
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '' });
  const [consent, setConsent] = useState(false);
  const [method, setMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [zoneId, setZoneId] = useState('');
  const [address, setAddress] = useState('');
  const [outcome, setOutcome] = useState<SignupOutcome>('success');
  const [agree, setAgree] = useState(false);
  const [problem, setProblem] = useState('');
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!planId) return;
    setStep('details');
    setProblem('');
    setTried(false);
    setAgree(false);
  }, [planId]);

  const data = commerce.data;
  const plan = data?.subPlans.find((p) => p.id === planId);
  if (!data || !plan) return null;

  const f = data.fulfilment;
  const isBox = plan.kind === 'box';
  const canDeliver = f.deliveryEnabled && f.zones.length > 0;
  const effectiveMethod: 'delivery' | 'pickup' = !canDeliver ? 'pickup' : !f.pickupEnabled ? 'delivery' : method;
  const zone = f.zones.find((z) => z.id === zoneId);
  const deliveryFee = isBox && effectiveMethod === 'delivery' ? zone?.feeNgn ?? 0 : 0;
  const steps: Step[] = isBox ? ['details', 'delivery', 'pay'] : ['details', 'pay'];
  const muted = { color: theme.mutedText };
  const errors = {
    name: !customer.name.trim() ? 'Enter your name' : '',
    phone: !isValidPhone(customer.phone) ? `Enter a phone number, e.g. ${phonePlaceholder()}` : '',
    email: !isValidEmail(customer.email) ? 'Enter an email for your receipts' : '',
  };
  const deliveryErrors = {
    zone: effectiveMethod === 'delivery' && !zone ? 'Choose where to deliver' : '',
    address: effectiveMethod === 'delivery' && address.trim().length < 6 ? 'Enter the delivery address' : '',
  };
  const today = dueToday(plan, deliveryFee);

  const finish = (o: SignupOutcome) => {
    setStep('working');
    window.setTimeout(() => {
      let result: ReturnType<typeof startSubscription> | null = null;
      const delivery: Subscription['delivery'] = isBox
        ? effectiveMethod === 'delivery' && zone
          ? { method: 'delivery', zoneId: zone.id, zoneName: zone.name, address: address.trim(), feeNgn: zone.feeNgn }
          : { method: 'pickup', address: f.pickupAddress, feeNgn: 0 }
        : null;
      const ok = commerce.apply((d) => {
        result = startSubscription(d, {
          planId: plan.id,
          customer: { name: customer.name.trim(), phone: customer.phone.trim(), email: customer.email.trim() },
          delivery,
          outcome: o,
          card: { brand: 'Visa', last4: o === 'bank' ? '3220' : '4242' },
          sourceHandle: handle,
          wsPlan: ownerPlan,
        });
        return result.ok ? result.data : d;
      });
      const r = result as ReturnType<typeof startSubscription> | null;
      if (!ok || !r) {
        setProblem('Something went wrong. Nothing was charged.');
        setStep('problem');
        return;
      }
      if (!r.ok) {
        setProblem(r.message);
        setStep('problem');
        return;
      }
      track('subscribe_started', { label: plan.name, valueNgn: today || undefined });
      onSubscribed(r.sub.customer, plan.name, consent);
      onClose();
      navigate(returnTo ?? `/p/${handle}/subscription/${r.sub.token}?welcome=1`);
    }, 1100);
  };

  const body = () => {
    if (step === 'working')
      return (
        <div className="flex flex-col items-center gap-3 py-12 text-center" role="status">
          <Loader2Icon size={28} className="animate-spin" aria-hidden />
          <p className="text-[16px] font-medium">{today ? 'Taking your test payment…' : 'Starting your trial…'}</p>
        </div>
      );
    if (step === 'problem')
      return (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-2 py-4 text-center" role="alert">
            <AlertTriangleIcon size={28} aria-hidden />
            <p className="text-[18px] font-medium">Couldn’t start your subscription</p>
            <p className="max-w-xs text-[13.5px]" style={muted}>
              {problem}
            </p>
          </div>
          <SheetActions theme={theme}>
            <PrimaryButton theme={theme} onClick={() => setStep('pay')}>
              Try again
            </PrimaryButton>
          </SheetActions>
        </div>
      );
    if (step === 'bank')
      return (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <ShieldCheckIcon size={30} aria-hidden />
            <CheckoutHeading theme={theme} sub="Your bank wants to confirm you’re happy for this card to be charged again in future. In real life this opens your bank’s app or sends a code.">
              Confirm with your bank
            </CheckoutHeading>
          </div>
          <SheetActions theme={theme}>
            <PrimaryButton theme={theme} onClick={() => finish('bank')}>
              I’ve confirmed in my bank app
            </PrimaryButton>
            <SecondaryButton theme={theme} onClick={() => setStep('pay')}>
              Cancel
            </SecondaryButton>
          </SheetActions>
        </div>
      );
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
            setStep(isBox ? 'delivery' : 'pay');
          }}
        >
          <CheckoutHeading theme={theme} sub={`${formatNgn(plan.priceNgn)} every ${intervalWord[plan.interval]}${plan.trialDays ? ` (Free for first ${plan.trialDays === 1 ? 'day' : `${plan.trialDays} days`})` : ''}${plan.setupFeeNgn ? ` · ${formatNgn(plan.setupFeeNgn)} setup` : ''}`}>
            {plan.name}
          </CheckoutHeading>
          <ThemedField theme={theme} label="Full name" autoComplete="name" value={customer.name} error={tried ? errors.name || undefined : undefined} onChange={(name) => setCustomer((c) => ({ ...c, name }))} />
          <ThemedField theme={theme} label="Phone (WhatsApp preferred)" type="tel" inputMode="tel" autoComplete="tel" value={customer.phone} error={tried ? errors.phone || undefined : undefined} onChange={(phone) => setCustomer((c) => ({ ...c, phone }))} />
          <ThemedField theme={theme} label="Email" type="email" inputMode="email" autoComplete="email" value={customer.email} error={tried ? errors.email || undefined : undefined} onChange={(email) => setCustomer((c) => ({ ...c, email }))} />
          <label className="flex items-start gap-2 text-[12.5px]" style={muted}>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" style={{ accentColor: theme.text }} />
            Send me occasional updates and offers (optional). Receipts and renewal reminders are sent either way.
          </label>
          <SheetActions theme={theme}>
            <PrimaryButton theme={theme} type="submit">
              Continue
            </PrimaryButton>
          </SheetActions>
        </form>
      );
    if (step === 'delivery')
      return (
        <form
          className="flex flex-col gap-4"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            setTried(true);
            if (Object.values(deliveryErrors).some(Boolean)) return;
            setTried(false);
            setStep('pay');
          }}
        >
          <CheckoutHeading theme={theme} sub={`Your box arrives every ${intervalWord[plan.interval]}.`}>
            Getting your box
          </CheckoutHeading>
          {canDeliver && f.pickupEnabled && (
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Delivery or pickup">
              {(['delivery', 'pickup'] as const).map((m) => (
                <button key={m} type="button" role="radio" aria-checked={effectiveMethod === m} onClick={() => setMethod(m)} className="h-11 text-[14px] font-medium" style={{ ...cardStyle(theme), border: `1.5px solid ${effectiveMethod === m ? theme.text : mix(theme.text, 12)}` }}>
                  {m === 'delivery' ? 'Delivery' : 'Pickup'}
                </button>
              ))}
            </div>
          )}
          {effectiveMethod === 'delivery' ? (
            <>
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-1 text-[13px] font-medium">Area</legend>
                {f.zones.map((z) => (
                  <label key={z.id} className="flex items-center gap-3 p-3 text-[14px]" style={{ ...cardStyle(theme), border: `1.5px solid ${zoneId === z.id ? theme.text : mix(theme.text, 12)}` }}>
                    <input type="radio" name="sub-zone" checked={zoneId === z.id} onChange={() => setZoneId(z.id)} style={{ accentColor: theme.text }} />
                    <span className="flex-1">
                      {z.name}
                      <span className="block text-[12px]" style={muted}>
                        {z.eta}
                      </span>
                    </span>
                    <span className="tabular-nums">{formatNgn(z.feeNgn)}</span>
                  </label>
                ))}
                {tried && deliveryErrors.zone && <p className="text-[12.5px] font-medium">{deliveryErrors.zone}</p>}
              </fieldset>
              <ThemedField theme={theme} label="Delivery address" autoComplete="street-address" value={address} error={tried ? deliveryErrors.address || undefined : undefined} onChange={setAddress} />
            </>
          ) : (
            <p className="p-4 text-[14px]" style={cardStyle(theme)}>
              Pick up from {f.pickupAddress || 'the seller'}
              {f.pickupHours && <span className="block text-[12.5px]" style={muted}>{f.pickupHours}</span>}
            </p>
          )}
          <SheetActions theme={theme}>
            <PrimaryButton theme={theme} type="submit">
              Continue
            </PrimaryButton>
          </SheetActions>
        </form>
      );
    // pay
    return (
      <div className="flex flex-col gap-4">
        <CheckoutHeading theme={theme}>Review and pay</CheckoutHeading>
        <dl className="flex flex-col gap-2 p-4 text-[14px]" style={cardStyle(theme)}>
          <div className="flex justify-between gap-3">
            <dt style={muted}>{plan.name}</dt>
            <dd className="text-right tabular-nums">
              {formatNgn(plan.priceNgn)} / {intervalWord[plan.interval]}
            </dd>
          </div>
          {deliveryFee > 0 && (
            <div className="flex justify-between gap-3">
              <dt style={muted}>Delivery each {intervalWord[plan.interval]}</dt>
              <dd className="text-right tabular-nums">{formatNgn(deliveryFee)}</dd>
            </div>
          )}
          {plan.setupFeeNgn > 0 && (
            <div className="flex justify-between gap-3">
              <dt style={muted}>Setup fee (once)</dt>
              <dd className="text-right tabular-nums">{formatNgn(plan.setupFeeNgn)}</dd>
            </div>
          )}
          {plan.trialDays > 0 && (
            <div className="flex justify-between gap-3">
              <dt style={muted}>Free trial</dt>
              <dd className="text-right">{plan.trialDays} days</dd>
            </div>
          )}
          <div className="flex justify-between gap-3 border-t pt-2" style={{ borderColor: mix(theme.text, 12) }}>
            <dt className="font-semibold">Pay today</dt>
            <dd className="text-right font-semibold tabular-nums">{formatNgn(today)}</dd>
          </div>
        </dl>
        <p className="text-[13px] leading-relaxed" style={{ color: theme.text }}>
          {renewalTerms(plan, deliveryFee)}
        </p>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-[13px] font-semibold">Test card — choose what happens</legend>
          {outcomes.map((o) => (
            <label key={o.id} className="flex items-center gap-3 p-3 text-[14px]" style={{ ...cardStyle(theme), border: `1.5px solid ${outcome === o.id ? theme.text : mix(theme.text, 12)}` }}>
              <input type="radio" name="sub-outcome" checked={outcome === o.id} onChange={() => setOutcome(o.id)} style={{ accentColor: theme.text }} />
              {o.label}
            </label>
          ))}
        </fieldset>
        <label className="flex items-start gap-2 text-[13px]" style={{ color: theme.text }}>
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5" style={{ accentColor: theme.text }} />
          I agree to be charged {formatNgn(plan.priceNgn + deliveryFee)} every {intervalWord[plan.interval]} until I cancel.
        </label>
        <TestModeNote theme={theme} />
        <SheetActions theme={theme}>
          <PrimaryButton theme={theme} disabled={!agree} onClick={() => (outcome === 'bank' ? setStep('bank') : finish(outcome))}>
            {today ? `Pay ${formatNgn(today)} and subscribe` : 'Start free trial'}
          </PrimaryButton>
        </SheetActions>
      </div>
    );
  };

  return (
    <PageOverlay open={!!planId} onClose={onClose} theme={theme} label={`Subscribe to ${plan.name}`}>
      <div className="flex flex-1 flex-col gap-4 px-5 pb-2 pt-5">
        {steps.includes(step) && (
          <div className="flex items-center gap-3 pr-12">
            {step !== 'details' && (
              <button type="button" aria-label="Back" onClick={() => setStep(steps[steps.indexOf(step) - 1])} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: theme.surface }}>
                <ArrowLeftIcon size={16} aria-hidden />
              </button>
            )}
            <div className="flex-1">
              <StepDots theme={theme} step={steps.indexOf(step) + 1} total={steps.length} />
            </div>
          </div>
        )}
        {body()}
      </div>
    </PageOverlay>
  );
}
