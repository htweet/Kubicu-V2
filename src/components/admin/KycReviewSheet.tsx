import React, { useEffect, useState } from 'react';
import { AlertTriangleIcon, CheckIcon, MessageSquareWarningIcon, XIcon } from 'lucide-react';
import type { MoneyData } from '../../types/money';
import type { KycRequest, KycStepId } from '../../types/kyc';
import { entityInfo, kycRisks, stepLabels, stepsFor, verifiedName } from '../../utils/money/kyc';
import { nameMatchOf, tierInfo } from '../../utils/money/store';
import { formatRelative, formatTimestamp } from '../../utils/format';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { TextArea } from '../ui/TextArea';
import { KycSummary } from '../kyc/KycSummary';
import { ConsentCheck } from '../kyc/ConsentCheck';
import { ReasonDialog } from './ReasonDialog';

interface KycReviewSheetProps {
  open: boolean;
  onClose: () => void;
  workspace: string;
  money: MoneyData | null;
  onApprove: (note: string) => void;
  onRequest: (requests: KycRequest[], summary: string) => void;
  onReject: (reason: string) => void;
}

/** Staff review of one verification case (D93): every check, document and person, then approve, ask for changes or reject. */
export function KycReviewSheet({ open, onClose, workspace, money, onApprove, onRequest, onReject }: KycReviewSheetProps) {
  const [mode, setMode] = useState<'view' | 'request'>('view');
  const [dialog, setDialog] = useState<'approve' | 'reject' | null>(null);
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
  const tier = k.entity ? tierInfo[entityInfo[k.entity].tier] : null;

  const requests = Object.entries(picked).map(([step, message]) => ({ step: step as KycStepId, message: message.trim() }));
  const requestError = !requests.length ? 'Choose at least one step.' : requests.some((r) => r.message.length < 8) ? 'Write what needs to change for each step you picked.' : '';

  const sendRequest = () => {
    setTried(true);
    if (requestError) return;
    onRequest(requests, requests.map((r) => `${stepLabels[r.step].label}: ${r.message}`).join(' · '));
  };

  return (
    <>
      <Sheet
        open={open}
        onClose={onClose}
        side="right"
        size="lg"
        height="full"
        title={`${workspace} · verification`}
        description={`${k.entity ? entityInfo[k.entity].label : 'Unknown type'} · submission ${k.attempts}${k.submittedAt ? ` · sent ${formatRelative(k.submittedAt)}` : ''}`}
        footer={
        mode === 'view' ?
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
              <Button variant="tertiary" leadingIcon={XIcon} onClick={() => setDialog('reject')}>
                Reject
              </Button>
              <span className="flex gap-2">
                <Button variant="secondary" leadingIcon={MessageSquareWarningIcon} onClick={() => setMode('request')}>
                  Ask for changes
                </Button>
                <Button leadingIcon={CheckIcon} onClick={() => setDialog('approve')}>
                  Approve
                </Button>
              </span>
            </div> :

        <div className="flex w-full items-center justify-end gap-2">
              <Button variant="secondary" onClick={() => setMode('view')}>
                Back
              </Button>
              <Button onClick={sendRequest}>Send request</Button>
            </div>

        }>
        
        {mode === 'view' ?
        <div className="flex flex-col gap-6">
            {risks.length > 0 ?
          <section aria-labelledby="kyc-risks" className="rounded-md bg-warning-soft px-4 py-3">
                <h3 id="kyc-risks" className="flex items-center gap-2 text-label font-semibold text-warning">
                  <AlertTriangleIcon size={15} aria-hidden /> Look closely at
                </h3>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {risks.map((r) =>
              <li key={r}>
                      <Badge tone="warning">{r}</Badge>
                    </li>
              )}
                </ul>
              </section> :

          <p className="rounded-md bg-success-soft px-4 py-3 text-label text-success">Every automated check matched. Still compare the ID photo with the selfie and the documents with the details.</p>
          }
            {tier &&
          <p className="text-caption text-fg-muted">
                Approving sets <span className="font-semibold text-fg">{tier.label}</span> — payouts up to {tier.dailyPayoutNgn.toLocaleString('en-NG')} a day.
              </p>
          }
            <KycSummary k={k} banks={banks} />
            {k.history.length > 0 &&
          <section aria-labelledby="kyc-hist" className="border-t border-line pt-5">
                <h3 id="kyc-hist" className="text-label font-semibold text-fg">
                  History
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
            <p className="text-label text-fg-muted">Pick the steps the owner needs to fix. They see your words exactly as written, and only those steps unlock for editing.</p>
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
                  label={<span className="font-medium">{stepLabels[s].label}</span>} />
                
                  {on &&
                <div className="ml-9 mt-3">
                      <TextArea id={`req-msg-${s}`} label="What needs to change" rows={2} value={picked[s]} onChange={(e) => setPicked((p) => ({ ...p, [s]: e.target.value }))} placeholder="e.g. The proof of address is older than 3 months. Upload a recent one." />
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
        title="Approve verification"
        description="Payouts turn on straight away. Your note is kept in the audit log."
        confirmLabel="Approve" />
      
      <ReasonDialog
        open={dialog === 'reject'}
        onClose={() => setDialog(null)}
        onConfirm={(r) => {
          setDialog(null);
          onReject(r);
        }}
        title="Reject verification"
        description="The owner sees your reason word for word and can fix it and send again. Payouts stay off."
        confirmLabel="Reject"
        destructive />
      
    </>);

}