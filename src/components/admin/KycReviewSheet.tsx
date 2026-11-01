import React, { useEffect, useState } from 'react';
import { AlertTriangleIcon, CheckIcon, MessageSquareWarningIcon, ShieldOffIcon, XIcon } from 'lucide-react';
import type { MoneyData } from '../../types/money';
import type { KycRequest, KycStepId } from '../../types/kyc';
import { entityInfo, kycRisks, kycRules, statusLabels, statusTones, stepLabels, stepsFor, verifiedName } from '../../utils/money/kyc';
import { nameMatchOf, tierDailyIn, tierInfo } from '../../utils/money/store';
import { countryInfo } from '../../utils/country';
import { formatMoney } from '../../utils/currency';
import { formatRelative, formatTimestamp } from '../../utils/format';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { TextArea } from '../ui/TextArea';
import { KycSummary } from '../kyc/KycSummary';
import { ConsentCheck } from '../kyc/ConsentCheck';
import { ReasonDialog } from './ReasonDialog';
import { useT } from '../../contexts/LocaleContext';

interface KycReviewSheetProps {
  open: boolean;
  onClose: () => void;
  workspace: string;
  money: MoneyData | null;
  onApprove: (note: string) => void;
  onRequest: (requests: KycRequest[], summary: string) => void;
  onReject: (reason: string) => void;
  /** Platform leads only (D252). */
  canWithdraw?: boolean;
  onWithdraw?: (reason: string) => void;
  /** D254: the public verified tick for this workspace. */
  tick?: {platformOn: boolean;hidden: {reason: string;at: string;by: string;} | null;};
  onTick?: (show: boolean, reason: string) => void;
}

/**
 * Staff review of one verification case (D93): every check, document and person, then approve, ask for changes or reject.
 * Decided cases open read-only with their decision and history (D252); a Platform lead can withdraw an approval.
 */
export function KycReviewSheet({ open, onClose, workspace, money, onApprove, onRequest, onReject, canWithdraw = false, onWithdraw, tick, onTick }: KycReviewSheetProps) {
  // Staff wording follows the console language (D491); what's sent to the owner and the case history stay as recorded.
  const { t } = useT();
  const [mode, setMode] = useState<'view' | 'request'>('view');
  const [dialog, setDialog] = useState<'approve' | 'reject' | 'withdraw' | 'tickOff' | 'tickOn' | null>(null);
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMode('view');
    setPicked({});
    setTried(false);
  }, [open]);

  if (!money) return null;
  const k = money.kyc;
  const banks = money.banks.map((b) => ({ ...b, nameMatch: nameMatchOf(b.accountName, verifiedName(k)) }));
  const risks = kycRisks(k);
  const steps = stepsFor(k.entity).filter((s) => s !== 'review' && s !== 'type');
  // Staff review any country's case; labels, registry and limits follow the case's country, not the console's (D431).
  const caseCountry = countryInfo(k.country);
  const caseRules = kycRules(k.country);
  const tierId = k.entity ? entityInfo[k.entity].tier : null;
  const tier = tierId !== null ? tierInfo[tierId] : null;
  const dailyLimit = tierId !== null ? formatMoney(tierDailyIn(tierId, k.country), caseCountry.currency) : '';
  const entityLabel = k.entity ? t(caseRules.entities[k.entity].label) : t('Unknown type');
  const staffStep = (s: KycStepId) => s === 'business' ? `${caseRules.registry.short} — ${t(stepLabels[s].label)}` : t(stepLabels[s].label);
  const stepLabel = (s: KycStepId) => s === 'business' ? `${caseRules.registry.short} — ${stepLabels[s].label}` : stepLabels[s].label;
  const waiting = k.status === 'in_review';
  const withdrawn = k.status === 'rejected' && k.history[k.history.length - 1]?.label === 'Approval withdrawn';
  const lapsesAt = k.status === 'approved' && k.decidedAt ? new Date(Date.parse(k.decidedAt) + 365 * 86_400_000).toISOString() : null;

  const requests = Object.entries(picked).map(([step, message]) => ({ step: step as KycStepId, message: message.trim() }));
  const requestError = !requests.length ? t('Choose at least one step.') : requests.some((r) => r.message.length < 8) ? t('Write what needs to change for each step you picked.') : '';

  const sendRequest = () => {
    setTried(true);
    if (requestError) return;
    onRequest(requests, requests.map((r) => `${stepLabel(r.step)}: ${r.message}`).join(' · '));
  };

  return (
    <>
      <Sheet
        open={open}
        onClose={onClose}
        side="right"
        size="lg"
        height="full"
        bodyClassName="px-5 py-5 md:px-6 md:py-6"
        title={`${workspace} · ${t('Verification')}`}
        description={[t(caseCountry.name), entityLabel, t('Submission: {n}', { n: k.attempts }), k.submittedAt ? t('Sent {when}', { when: formatRelative(k.submittedAt) }) : ''].filter(Boolean).join(' · ')}
        footer={
        !waiting ?
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
              {k.status === 'approved' && onWithdraw ?
          canWithdraw ?
          <Button variant="tertiary" leadingIcon={ShieldOffIcon} onClick={() => setDialog('withdraw')}>
                    {t('Withdraw approval…')}
                  </Button> :

          <span className="text-caption text-fg-subtle">{t('Only a Platform lead can withdraw an approval.')}</span> :


          <span />
          }
              <Button variant="secondary" onClick={onClose}>
                {t('Close')}
              </Button>
            </div> :
        mode === 'view' ?
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
              <Button variant="tertiary" leadingIcon={XIcon} onClick={() => setDialog('reject')}>
                {t('Reject')}
              </Button>
              <span className="flex gap-2">
                <Button variant="secondary" leadingIcon={MessageSquareWarningIcon} onClick={() => setMode('request')}>
                  {t('Ask for changes')}
                </Button>
                <Button leadingIcon={CheckIcon} onClick={() => setDialog('approve')}>
                  {t('Approve')}
                </Button>
              </span>
            </div> :

        <div className="flex w-full items-center justify-end gap-2">
              <Button variant="secondary" onClick={() => setMode('view')}>
                {t('Back')}
              </Button>
              <Button onClick={sendRequest}>{t('Send request')}</Button>
            </div>

        }>
        
        {mode === 'view' ?
        <div className="flex flex-col gap-6">
            {!waiting &&
          <section aria-labelledby="kyc-decision" className="rounded-md border border-line bg-sunken px-4 py-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 id="kyc-decision" className="text-label font-semibold text-fg">
                    {t('Decision')}
                  </h3>
                  <Badge tone={statusTones[k.status]}>{t(withdrawn ? 'Approval withdrawn' : statusLabels[k.status])}</Badge>
                </div>
                <dl className="mt-2.5 grid gap-x-6 gap-y-1.5 text-caption sm:grid-cols-[auto_1fr]">
                  {k.decidedAt &&
              <>
                      <dt className="text-fg-muted">{t('Decided')}</dt>
                      <dd className="text-fg">
                        {formatTimestamp(k.decidedAt)}
                        {k.decidedBy ? ` · ${k.decidedBy}` : ''}
                      </dd>
                    </>
              }
                  {k.status === 'approved' && tier &&
              <>
                      <dt className="text-fg-muted">{t('Payouts')}</dt>
                      <dd className="text-fg">{t('{tier} · up to {amount} a day', { tier: t(tier.label), amount: dailyLimit })}</dd>
                    </>
              }
                  {lapsesAt &&
              <>
                      <dt className="text-fg-muted">{t('Lapses')}</dt>
                      <dd className="text-fg">{t('{date} — the owner re-verifies after a year', { date: formatTimestamp(lapsesAt) })}</dd>
                    </>
              }
                  {k.note &&
              <>
                      <dt className="text-fg-muted">{t(k.status === 'approved' ? 'Note' : 'Reason shown to owner')}</dt>
                      <dd className="text-fg">{k.note}</dd>
                    </>
              }
                  {k.status === 'approved' && tick &&
              <>
                      <dt className="text-fg-muted">{t('Verified tick')}</dt>
                      <dd className="flex flex-wrap items-center gap-x-3 gap-y-1 text-fg">
                        <span>{!tick.platformOn ? t('Hidden for everyone (Feature flags)') : tick.hidden ? `${t('Hidden by {name}', { name: tick.hidden.by })} — “${tick.hidden.reason}”` : t('Showing on their pages')}</span>
                        {onTick && tick.platformOn &&
                  <button type="button" onClick={() => setDialog(tick.hidden ? 'tickOn' : 'tickOff')} className="font-semibold text-fg underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                            {t(tick.hidden ? 'Show again…' : 'Hide tick…')}
                          </button>
                  }
                      </dd>
                    </>
              }
                  {k.status === 'needs_info' && k.requests.length > 0 &&
              <>
                      <dt className="text-fg-muted">{t('Asked to fix')}</dt>
                      <dd className="text-fg">{k.requests.map((r) => `${staffStep(r.step)}: ${r.message}`).join(' · ')}</dd>
                    </>
              }
                </dl>
              </section>
          }
            {risks.length > 0 ?
          <section aria-labelledby="kyc-risks" className="rounded-md border border-warning/40 bg-warning-soft px-4 py-3.5">
                <h3 id="kyc-risks" className="flex items-center gap-2 text-label font-semibold text-fg">
                  <AlertTriangleIcon size={16} aria-hidden className="shrink-0 text-warning" /> {t('Look closely at')}
                </h3>
                <ul className="mt-2.5 flex flex-wrap gap-1.5 pl-6">
                  {risks.map((r) =>
              <li key={r}>
                      <Badge tone="warning">{t(r)}</Badge>
                    </li>
              )}
                </ul>
              </section> :

          <p className="rounded-md border border-success/40 bg-success-soft px-4 py-3.5 text-label text-fg">{t('Every automated check matched. Still compare the ID photo with the selfie and the documents with the details.')}</p>
          }
            {tier && waiting &&
          <div className="flex flex-col gap-0.5 rounded-md bg-sunken px-4 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                <span className="text-caption text-fg-muted">{t('If you approve')}</span>
                <span className="text-label text-fg">
                  <span className="font-semibold">{t(tier.label)}</span> · {t('payouts up to {amount} a day', { amount: dailyLimit })}
                </span>
              </div>
          }
            <KycSummary k={k} banks={banks} />
            {k.history.length > 0 &&
          <section aria-labelledby="kyc-hist" className="border-t border-line pt-5">
                <h3 id="kyc-hist" className="text-label font-semibold text-fg">
                  {t('History')}
                </h3>
                <ol className="mt-3 flex flex-col gap-2">
                  {k.history.map((e, i) =>
              <li key={`${e.at}-${i}`} className="flex items-baseline justify-between gap-3 text-caption">
                      <span className="text-fg">
                        {e.label}
                        {e.by ? <span className="text-fg-subtle"> · {e.by}</span> : null}
                      </span>
                      <span className="shrink-0 tabular-nums text-fg-subtle">{formatTimestamp(e.at)}</span>
                    </li>
              )}
                </ol>
              </section>
          }
          </div> :

        <div className="flex flex-col gap-5">
            <p className="text-label text-fg-muted">
              {t('Checking against the rules for {country}: {checks}.', { country: t(caseCountry.name), checks: [caseRules.primary.label, caseRules.secondary?.label, caseRules.registry.short].filter(Boolean).join(', ') })}
            </p>
            <p className="text-label text-fg-muted">{t('Pick the steps the owner needs to fix. They see your words exactly as written, and only those steps unlock for editing.')}</p>
            {steps.map((s) => {
            const on = s in picked;
            return (
              <div key={s} className="rounded-md border border-line p-4">
                  <ConsentCheck
                  id={`req-${s}`}
                  checked={on}
                  onChange={(v) =>
                  setPicked((p) => {
                    const nextP = { ...p };
                    if (v) nextP[s] = '';else
                    delete nextP[s];
                    return nextP;
                  })
                  }
                  label={<span className="font-medium">{staffStep(s)}</span>} />
                
                  {on &&
                <div className="ml-9 mt-3">
                      <TextArea id={`req-msg-${s}`} label={t('What needs to change')} rows={2} value={picked[s]} onChange={(e) => setPicked((p) => ({ ...p, [s]: e.target.value }))} placeholder={t('e.g. The proof of address is older than 3 months. Upload a recent one.')} />
                    </div>
                }
                </div>);

          })}
            {tried && requestError &&
          <p className="text-caption font-medium text-danger" role="alert">
                {requestError}
              </p>
          }
          </div>
        }
      </Sheet>
      <ReasonDialog
        open={dialog === 'approve'}
        onClose={() => setDialog(null)}
        onConfirm={(r) => {
          setDialog(null);
          onApprove(r);
        }}
        title={t('Approve verification')}
        description={t('Payouts turn on straight away. Your note is kept in the audit log.')}
        confirmLabel={t('Approve')} />
      
      <ReasonDialog
        open={dialog === 'reject'}
        onClose={() => setDialog(null)}
        onConfirm={(r) => {
          setDialog(null);
          onReject(r);
        }}
        title={t('Reject verification')}
        description={t('The owner sees your reason word for word and can fix it and send again. Payouts stay off.')}
        confirmLabel={t('Reject')}
        destructive />
      
      <ReasonDialog
        open={dialog === 'withdraw'}
        onClose={() => setDialog(null)}
        onConfirm={(r) => {
          setDialog(null);
          onWithdraw?.(r);
        }}
        title={t('Withdraw this approval')}
        description={t('Use this when something is found after approval — a fake document, fraud reports or a mismatch. Payouts drop to unverified limits straight away (sales still arrive), Starter payouts stop, and the owner sees your reason word for word and can send verification again. Recorded in the audit log.')}
        confirmLabel={t('Withdraw approval')}
        destructive />
      
      <ReasonDialog
        open={dialog === 'tickOff' || dialog === 'tickOn'}
        onClose={() => setDialog(null)}
        onConfirm={(r) => {
          const show = dialog === 'tickOn';
          setDialog(null);
          onTick?.(show, r);
        }}
        title={t(dialog === 'tickOn' ? 'Show the verified tick again' : 'Hide the verified tick')}
        description={t(
          dialog === 'tickOn' ?
          'The tick returns to their Profile, Brand header and Verified badge straight away.' :
          'Use this for a name that misleads buyers or an impersonation report while you look into it. Verification, payouts and the Trust Passport score stay as they are. The owner sees that KUBICU hid the seal.'
        )}
        confirmLabel={t(dialog === 'tickOn' ? 'Show tick' : 'Hide tick')}
        destructive={dialog === 'tickOff'} />
      
    </>);

}