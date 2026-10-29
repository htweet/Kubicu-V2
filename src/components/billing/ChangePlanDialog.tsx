import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2Icon, CheckIcon, SparklesIcon } from 'lucide-react';
import type { WorkspacePlan } from '../../types/plan';
import type { BillingCycle } from '../../types/billing';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Segmented } from '../ui/Segmented';
import { InlineAlert } from '../ui/InlineAlert';
import { PaymentStep } from './PaymentStep';
import { ImpactList } from './ImpactList';
import { QuoteTable } from './QuoteTable';
import { useBilling } from '../../contexts/BillingContext';
import { usePlan } from '../../contexts/PlanContext';
import { useTeam } from '../../contexts/TeamContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useDowngradeImpact } from '../../hooks/useDowngradeImpact';
import { planAtLeast, planOrder, plans } from '../../data/plans';
import { planHighlights } from '../../data/planHighlights';
import { TRIAL_DAYS, TRIAL_PLAN } from '../../data/billing';
import { changeKind, formatDate, isPaidPlan, priceFor, yearlySaving } from '../../utils/billing';
import { checkCoupon, couponLabel } from '../../utils/planCatalogue';
import type { Coupon } from '../../types/admin';
import { TextInput } from '../ui/TextInput';
import { formatNaira as formatNgn } from '../../utils/format';
import { cn } from '../../utils/cn';

interface Props {
  open: boolean;
  onClose: () => void;
  /** The thing the user tried to do, when opened from an upgrade button. */
  feature?: string;
  /** Lowest plan that unlocks `feature`. */
  minPlan?: WorkspacePlan;
  /** Jump straight to a plan (e.g. "Switch to yearly"). */
  initial?: {plan: WorkspacePlan;cycle: BillingCycle;};
}

type Step = 'choose' | 'review' | 'pay' | 'done';
const selectable = planOrder.filter((p) => p !== 'enterprise');

/** Compare plans, preview the charge or downgrade impact, and pay by test card (D65). */
export function ChangePlanDialog({ open, onClose, feature, minPlan, initial }: Props) {
  const billing = useBilling();
  const plan = usePlan();
  const { current } = useWorkspace();
  const can = useTeam().can('billing.manage');
  const d = billing.data;
  const trialing = !!d.trial;
  const [cycle, setCycle] = useState<BillingCycle>(d.cycle);
  const [target, setTarget] = useState<WorkspacePlan>(plan.id);
  const [step, setStep] = useState<Step>('choose');
  const [codeOpen, setCodeOpen] = useState(false);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | undefined>();
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const impact = useDowngradeImpact(target);

  useEffect(() => {
    if (!open) return;
    setCycle(initial?.cycle ?? d.cycle);
    setTarget(initial?.plan ?? plan.id);
    setStep(initial ? 'review' : 'choose');
    setCodeOpen(false);
    setCode('');
    setCodeError(undefined);
    setCoupon(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const kind = changeKind(plan.id, d.cycle, target, cycle, trialing);
  // A code chosen for one plan doesn't carry to a plan it doesn't cover (D135).
  const activeCoupon = coupon && coupon.plans.includes(target) ? coupon : null;
  const quote = billing.previewQuote(target, cycle, activeCoupon);
  const applyCode = () => {
    const r = checkCoupon(code, target);
    if ('error' in r) {
      setCodeError(r.error);
      setCoupon(null);
      return;
    }
    setCodeError(undefined);
    setCoupon(r.coupon);
  };
  const trialOffer = !d.trialUsed && plan.id === 'free' && (!minPlan || planAtLeast(TRIAL_PLAN, minPlan));
  const periodEnd = d.periodEnd ? formatDate(d.periodEnd) : 'your renewal date';

  const choose = (p: WorkspacePlan) => {
    setTarget(p);
    setStep('review');
  };

  const confirmDowngrade = () => {
    if (target === 'free') billing.cancelPlan('Downgraded to Free');else
    billing.scheduleChange(target, cycle);
    toast.success(`Changes to ${plans[target].name} on ${periodEnd}`, { description: 'Everything stays as it is until then. You can undo this in Plan & billing.' });
    onClose();
  };

  const title = step === 'done' ? `You’re on ${plans[target].name}` : step === 'choose' ? minPlan ? `Upgrade to ${plans[minPlan].name}` : 'Change plan' : kind === 'downgrade' ? `Move to ${plans[target].name}` : `Upgrade to ${plans[target].name}`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      onTop
      title={title}
      description={
      step === 'choose' ?
      feature && minPlan ?
      <>
              <span className="font-medium text-fg">{feature}</span> needs {plans[minPlan].name} or above. You’re on {plan.name}. Nothing you’ve made is deleted when plans change.
            </> :

      `You’re on ${plan.name}${trialing ? ' (trial)' : ''}. Upgrades start now; downgrades wait until ${periodEnd}.` :

      undefined
      }>
      
      {!can.allowed &&
      <InlineAlert tone="info" title="Only the Owner can change the plan" className="mb-4">
          {can.reason} You can still compare plans.
        </InlineAlert>
      }

      {step === 'choose' &&
      <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Segmented<BillingCycle>
            ariaLabel="Billing cycle"
            size="sm"
            value={cycle}
            onChange={setCycle}
            options={[
            { value: 'monthly', label: 'Monthly' },
            { value: 'yearly', label: 'Yearly · 2 months free' }]
            } />
          
            <span className="text-caption text-fg-subtle">Prices exclude VAT · test mode</span>
          </div>

          {trialOffer &&
        <div className="nm-frame rounded-lg">
            <div className="flex flex-col gap-3 rounded-[calc(0.5rem-1px)] bg-raised p-4 sm:flex-row sm:items-center sm:gap-4 sm:px-5">
              <span aria-hidden className="nm-fill hidden h-8 w-8 shrink-0 items-center justify-center rounded-full sm:flex">
                <SparklesIcon size={16} className="nm-ink" />
              </span>
              <p className="min-w-0 flex-1 text-label text-fg">
                <span className="font-semibold">Try {plans[TRIAL_PLAN].name} free for {TRIAL_DAYS} days.</span> No card needed. You’ll be reminded 3 days before it ends, then go back to Free unless you choose a plan.
              </p>
              <Button
              size="sm"
              disabled={!can.allowed}
              onClick={() => {
                billing.startTrial();
                onClose();
              }}>
              
                Start free trial
              </Button>
            </div>
            </div>
        }

          <ul className="flex flex-col divide-y divide-line rounded-lg border border-line">
            {selectable.map((id) => {
            const p = plans[id];
            const isCurrent = id === plan.id && (cycle === d.cycle || !isPaidPlan(id)) && !trialing;
            const unlocks = !!minPlan && id === minPlan && !planAtLeast(plan.id, minPlan);
            const k = changeKind(plan.id, d.cycle, id, cycle, trialing);
            const price = priceFor(id, cycle);
            return (
              <li key={id} className={cn('grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto_7.5rem] sm:items-center sm:px-5', unlocks && 'bg-action-soft')}>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-body font-semibold text-fg">{p.name}</span>
                      {id === plan.id && <Badge tone="neutral">{trialing ? 'Trial' : 'Current'}</Badge>}
                      {unlocks && <span className="nm-fill nm-ink inline-flex h-5 items-center rounded-full px-2 text-meta font-semibold">Unlocks this</span>}
                    </div>
                    <p className="mt-0.5 text-caption text-fg-muted">{p.intendedFor}</p>
                    <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-caption text-fg-muted">
                      {planHighlights[id].slice(0, 3).map((h) =>
                    <li key={h} className="flex items-center gap-1">
                          <CheckIcon size={12} className="shrink-0 text-fg-subtle" aria-hidden />
                          {h}
                        </li>
                    )}
                    </ul>
                  </div>
                  <div className="text-right sm:min-w-[7.5rem]">
                    <p className="whitespace-nowrap font-display text-heading font-semibold tabular-nums text-fg">
                      {price === 0 ? '₦0' : formatNgn(price)}
                      {price > 0 && <span className="text-caption font-normal text-fg-muted"> /{cycle === 'yearly' ? 'yr' : 'mo'}</span>}
                    </p>
                    {cycle === 'yearly' && price > 0 && <p className="whitespace-nowrap text-caption text-success">Save {formatNgn(yearlySaving(id))}</p>}
                  </div>
                  <div className="col-span-2 sm:col-span-1 sm:text-right">
                    {isCurrent ?
                  <span className="inline-flex items-center gap-1 text-caption font-medium text-fg-subtle">
                        <CheckIcon size={13} aria-hidden /> Your plan
                      </span> :

                  <Button size="sm" variant={unlocks || k === 'upgrade' && !minPlan && id === planOrder[planOrder.indexOf(plan.id) + 1] ? 'primary' : 'secondary'} disabled={!can.allowed || k === 'same'} onClick={() => choose(id)} className="w-full sm:w-auto">
                        {k === 'downgrade' ? 'Downgrade' : trialing && id === plan.id ? 'Keep it' : 'Upgrade'}
                      </Button>
                  }
                  </div>
                </li>);

          })}
            <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div>
                <span className="text-body font-semibold text-fg">{plans.enterprise.name}</span>
                <p className="text-caption text-fg-muted">{plans.enterprise.intendedFor} — custom limits and contracts.</p>
              </div>
              <a href="mailto:sales@kub.icu?subject=Enterprise%20plan" className="inline-flex h-9 items-center justify-center rounded-md border border-line-strong px-3 text-label font-medium text-fg hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                Talk to us
              </a>
            </li>
          </ul>
        </div>
      }

      {step === 'review' && kind === 'downgrade' &&
      <div className="flex flex-col gap-5">
          <p className="text-body text-fg">
            You’ll stay on <span className="font-semibold">{plan.name}</span> until <span className="font-semibold">{periodEnd}</span>, then move to {plans[target].name}
            {target !== 'free' && ` at ${formatNgn(priceFor(target, cycle))}/${cycle === 'yearly' ? 'year' : 'month'} + VAT`}. No refund is due for the time already paid.
          </p>
          <ImpactList items={impact} target={target} />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button variant="tertiary" onClick={() => setStep('choose')}>
              Back
            </Button>
            <Button variant="secondary" disabled={!can.allowed} onClick={confirmDowngrade}>
              Move to {plans[target].name} on {periodEnd}
            </Button>
          </div>
        </div>
      }

      {step === 'review' && kind !== 'downgrade' &&
      <div className="flex flex-col gap-5">
          <QuoteTable quote={quote} />
          <div className="flex flex-col gap-2">
            {activeCoupon ?
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-success-soft px-3 py-2">
                <span className="text-label text-fg">
                  <span className="font-semibold">{activeCoupon.code}</span> · {couponLabel(activeCoupon)}
                </span>
                <button type="button" className="text-caption font-medium text-fg-muted hover:text-fg" onClick={() => (setCoupon(null), setCode(''))}>
                  Remove
                </button>
              </div> :
          codeOpen ?
          <div className="flex items-start gap-2">
                <TextInput id="plan-coupon" label="Code" placeholder="Enter a code" value={code} error={codeError} autoComplete="off" onChange={(e) => (setCode(e.target.value.toUpperCase()), setCodeError(undefined))} onKeyDown={(e) => e.key === 'Enter' && code.trim() && applyCode()} fieldClassName="flex-1 [&>div:first-child]:sr-only" />
                <Button variant="secondary" disabled={!code.trim()} onClick={applyCode}>
                  Apply
                </Button>
              </div> :

          <button type="button" className="self-start text-label font-medium text-action hover:underline" onClick={() => setCodeOpen(true)}>
                Have a code?
              </button>
          }
            {billing.creditLeft > 0 && <p className="text-caption text-fg-muted">You have {formatNgn(billing.creditLeft)} account credit from KUBICU. It’s used before your card.</p>}
          </div>
          <p className="text-caption text-fg-muted">
            Then {formatNgn(quote.renewTotal)} (incl. VAT) every {cycle === 'yearly' ? 'year' : 'month'}, next on {formatDate(quote.renewOn)}. Cancel any time — you keep the plan until the period ends.
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button variant="tertiary" onClick={() => setStep('choose')}>
              Back
            </Button>
            <Button disabled={!can.allowed} onClick={() => setStep('pay')}>
              {quote.total > 0 ? `Continue to pay ${formatNgn(quote.total)}` : 'Continue'}
            </Button>
          </div>
        </div>
      }

      {step === 'pay' &&
      <PaymentStep
        payLabel={quote.total > 0 ? `Pay ${formatNgn(quote.total)}` : 'Confirm'}
        savedCard={d.card}
        defaultHolder={current.ownerName}
        onBack={() => setStep('review')}
        onPaid={(card) => {
          billing.checkout(target, cycle, card, activeCoupon);
          setStep('done');
        }} />

      }

      {step === 'done' &&
      <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircle2Icon size={32} className="text-success" aria-hidden />
          <p className="text-body text-fg">
            {plans[target].name} is on now{feature && minPlan && planAtLeast(target, minPlan) ? ` — ${feature.charAt(0).toLowerCase()}${feature.slice(1)} is unlocked` : ''}.
          </p>
          <p className="text-caption text-fg-muted">{quote.total > 0 ? `Test payment of ${formatNgn(quote.total)} taken. The invoice is in Settings → Plan & billing.` : 'No charge today.'}</p>
          <Button onClick={onClose}>Done</Button>
        </div>
      }
    </Dialog>);

}