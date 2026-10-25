import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, LockIcon, SendIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { KycCase, KycStepId } from '../../types/kyc';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useCan } from '../../contexts/TeamContext';
import { useMoney } from '../../hooks/useMoney';
import { nameMatchOf } from '../../utils/money/store';
import { entityInfo, kycEditable, readyToSubmit, statusLabels, statusTones, stepDone, stepErrors, stepLabels, stepsFor, verifiedName, withEvent } from '../../utils/money/kyc';
import { announce } from '../../utils/announce';
import { useT } from '../../contexts/LocaleContext';
import { PageHeader } from '../../components/shell/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { InlineAlert } from '../../components/ui/InlineAlert';
import { PartnerNote } from '../../components/money/PartnerNote';
import { BankAccountDialog } from '../../components/money/BankAccountDialog';
import { KycStepper } from '../../components/kyc/KycStepper';
import { KycSummary } from '../../components/kyc/KycSummary';
import { KycStatusPanel } from '../../components/kyc/KycStatusPanel';
import { TypeStep } from '../../components/kyc/steps/TypeStep';
import { IdentityStep } from '../../components/kyc/steps/IdentityStep';
import { AddressStep } from '../../components/kyc/steps/AddressStep';
import { BusinessStep } from '../../components/kyc/steps/BusinessStep';
import { PeopleStep } from '../../components/kyc/steps/PeopleStep';
import { PayoutStep } from '../../components/kyc/steps/PayoutStep';
import { DeclarationsStep } from '../../components/kyc/steps/DeclarationsStep';

/**
 * Commerce → Verification (D93): full KYC for individuals and KYB for registered businesses.
 * Payouts stay off until KUBICU staff approve the case in Super admin.
 */
export function Verification() {
  const { current } = useWorkspace();
  const { t: tr } = useT();
  const { data, update } = useMoney(current.id);
  const perm = useCan('payouts.manage');
  const k = data.kyc;
  const editable = perm.allowed && kycEditable(k);
  const steps = stepsFor(k.entity);
  const banks = useMemo(() => data.banks.map((b) => ({ ...b, nameMatch: nameMatchOf(b.accountName, verifiedName(k)) })), [data.banks, k]);
  const flagged = k.status === 'needs_info' ? k.requests.map((r) => r.step) : [];

  const [step, setStep] = useState<KycStepId>(() => k.status === 'needs_info' && k.requests[0] ? k.requests[0].step : readyToSubmit(k, banks) ?? 'review');
  const [tried, setTried] = useState<Set<KycStepId>>(new Set());
  const [bankOpen, setBankOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // If the business type changes, keep the current step valid.
  useEffect(() => {
    if (!steps.includes(step)) setStep('type');
  }, [steps, step]);

  const set = (fn: (c: KycCase) => KycCase) =>
  update((d) => {
    const next = fn(d.kyc);
    return { ...d, kyc: next.status === 'not_started' ? withEvent({ ...next, status: 'in_progress' }, 'Started verification') : next };
  });

  const errors = tried.has(step) ? stepErrors(k, step, banks) : {};
  const idx = steps.indexOf(step);

  const go = (s: KycStepId) => {
    setStep(s);
    window.requestAnimationFrame(() => {
      cardRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
      cardRef.current?.querySelector<HTMLElement>('h2')?.focus();
    });
  };

  const next = () => {
    const errs = stepErrors(k, step, banks);
    if (Object.keys(errs).length) {
      setTried((t) => new Set(t).add(step));
      const n = Object.keys(errs).length;
      announce(tr(n === 1 ? '{n} thing to fix on {step}' : '{n} things to fix on {step}', { n, step: tr(stepLabels[step].label) }), 'assertive');
      window.requestAnimationFrame(() => cardRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], [role="alert"]')?.focus());
      return;
    }
    go(steps[Math.min(steps.length - 1, idx + 1)]);
  };

  const submit = () => {
    const missing = readyToSubmit(k, banks);
    if (missing) {
      setTried((t) => new Set(t).add(missing));
      toast.error(tr('Finish “{step}” first', { step: tr(stepLabels[missing].label) }));
      return go(missing);
    }
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      const resend = k.status === 'needs_info' || k.attempts > 0;
      set((c) => withEvent({ ...c, status: 'in_review', submittedAt: new Date().toISOString(), attempts: c.attempts + 1, requests: [], note: null }, resend ? 'Sent changes for review' : 'Sent for review'));
      toast.success(tr('Sent for review'), { description: tr('Most reviews finish within one business day. Sales keep arriving meanwhile.') });
    }, 1100);
  };

  const restart = () => {
    set((c) => withEvent({ ...c, status: 'in_progress', note: c.note }, 'Started fixing after the decision'));
    setTried(new Set());
    go('type');
  };

  const showStatus = k.status === 'in_review' || k.status === 'approved' || k.status === 'rejected';
  const stepProps = { k, set, errors, disabled: !editable };

  return (
    <>
      <PageHeader
        title="Verification"
        description="Confirm who you are and who owns the business. Payouts turn on once KUBICU approves it — sales arrive in your wallet either way."
        actions={<Badge tone={statusTones[k.status]} dot>{tr(statusLabels[k.status])}</Badge>} />
      
      <PartnerNote className="mt-6">{tr('Checks run through our licensed partner’s identity service (simulated). KUBICU keeps the results, not your documents.')}</PartnerNote>

      {!perm.allowed &&
      <InlineAlert className="mt-4" tone="info" title="Only the Owner can verify the business">
          {perm.reason}
        </InlineAlert>
      }

      {k.status === 'needs_info' &&
      <InlineAlert className="mt-4" tone="warning" title="KUBICU asked for a few changes">
          <ul className="mt-1 flex flex-col gap-1.5">
            {k.requests.map((r, i) =>
          <li key={i} className="flex flex-wrap items-baseline gap-x-2">
                <button type="button" className="font-semibold text-fg underline underline-offset-2" onClick={() => go(r.step)}>
                  {tr(stepLabels[r.step].label)}
                </button>
                <span>“{r.message}”</span>
              </li>
          )}
          </ul>
        </InlineAlert>
      }

      {showStatus ?
      <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex flex-col gap-6">
            <KycStatusPanel k={k} canEdit={perm.allowed} onRestart={restart} />
            <section aria-labelledby="kyc-sent-title" className="rounded-lg border border-line bg-raised p-5 md:p-6">
              <h2 id="kyc-sent-title" className="mb-5 text-label font-semibold text-fg">
                {tr('What you sent')}
              </h2>
              <KycSummary k={k} banks={banks} />
            </section>
          </div>
          <LimitsAside entity={k.entity} />
        </div> :

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
          <div className="lg:sticky lg:top-6">
            <KycStepper steps={steps} current={step} done={(s) => stepDone(k, s, banks)} flagged={flagged} locked={(s) => s !== 'type' && !k.entity} onSelect={go} />
          </div>

          <div ref={cardRef} className="scroll-mt-6 rounded-lg border border-line bg-raised">
            <header className="border-b border-line px-5 py-4 md:px-6">
              <h2 tabIndex={-1} className="text-heading font-semibold text-fg focus:outline-none">
                {tr(stepLabels[step].label)}
              </h2>
              <p className="mt-0.5 text-caption text-fg-subtle">
                {step === 'review' ? tr('Check everything once more. You can’t edit while it’s being reviewed.') : step === 'type' ? tr('This decides which checks apply.') : `${tr(stepLabels[step].hint)}. ${tr('Saved as you type.')}`}
              </p>
            </header>

            <div className="px-5 py-6 md:px-6">
              {step === 'type' && <TypeStep {...stepProps} />}
              {step === 'identity' && <IdentityStep {...stepProps} />}
              {step === 'address' && <AddressStep {...stepProps} />}
              {step === 'business' && <BusinessStep {...stepProps} />}
              {step === 'people' && <PeopleStep {...stepProps} />}
              {step === 'payout' && <PayoutStep {...stepProps} banks={banks} onAddBank={() => setBankOpen(true)} />}
              {step === 'declarations' && <DeclarationsStep {...stepProps} />}
              {step === 'review' &&
            <>
                  {readyToSubmit(k, banks) &&
              <InlineAlert className="mb-5" tone="warning" title="A few steps aren’t finished">
                      {tr('Steps marked without a tick still need details.')}
                    </InlineAlert>
              }
                  <KycSummary k={k} banks={banks} onEdit={editable ? go : undefined} flagged={flagged} />
                </>
            }
            </div>

            <footer className="sticky bottom-0 flex items-center justify-between gap-3 rounded-b-lg border-t border-line bg-raised/95 px-5 py-3.5 backdrop-blur md:px-6">
              <Button variant="tertiary" leadingIcon={ArrowLeftIcon} onClick={() => go(steps[Math.max(0, idx - 1)])} disabled={idx === 0}>
                Back
              </Button>
              {!editable ?
            <span className="inline-flex items-center gap-1.5 text-caption text-fg-subtle">
                  <LockIcon size={13} aria-hidden /> {tr('View only')}
                </span> :
            step === 'review' ?
            <Button leadingIcon={SendIcon} onClick={submit} loading={submitting}>
                  {submitting ? 'Running checks…' : k.status === 'needs_info' ? 'Send changes' : 'Send for review'}
                </Button> :

            <Button trailingIcon={ArrowRightIcon} onClick={next}>
                  {idx === steps.length - 2 ? 'Review' : 'Save and continue'}
                </Button>
            }
            </footer>
          </div>
        </div>
      }

      <BankAccountDialog open={bankOpen} onClose={() => setBankOpen(false)} data={data} update={update} businessName={verifiedName(k) || current.name} />
    </>);

}

function LimitsAside({ entity }: {entity: KycCase['entity'];}) {
  const { t: tr } = useT();
  return (
    <aside aria-labelledby="kyc-limits-title" className="rounded-lg border border-line bg-raised p-5 md:p-6">
      <h2 id="kyc-limits-title" className="text-label font-semibold text-fg">
        {tr('What verification unlocks')}
      </h2>
      <dl className="mt-4 flex flex-col divide-y divide-line">
        {(['individual', 'company'] as const).map((e) =>
        <div key={e} className="flex items-baseline justify-between gap-3 py-2.5 first:pt-0">
            <dt className="text-caption text-fg-muted">{tr(e === 'individual' ? 'Individuals' : 'Registered businesses')}</dt>
            <dd className="text-right text-caption font-medium text-fg">{tr(e === 'individual' ? '₦2m a day · ₦10m balance' : '₦20m a day · no balance limit')}</dd>
          </div>
        )}
      </dl>
      {entity && <p className="mt-3 text-caption text-fg-subtle">{tr('You applied as: {type}.', { type: tr(entityInfo[entity].short) })}</p>}
      <p className="mt-3 text-caption text-fg-subtle">{tr('Example figures — final limits depend on the payment partner.')}</p>
    </aside>);

}