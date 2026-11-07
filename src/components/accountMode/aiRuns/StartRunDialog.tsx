import React, { useEffect, useState } from 'react';
import type { AccountFailure } from '../../../types/accountMode';
import type { Automation } from '../../../types/ops';
import { useT } from '../../../contexts/LocaleContext';
import { usePlan } from '../../../contexts/PlanContext';
import { planOrder } from '../../../data/plans';
import { SAMPLE_RUN_ESTIMATE } from '../../../data/aiRunSamples';
import { Dialog } from '../../ui/Dialog';
import { Button } from '../../ui/Button';
import { SelectInput } from '../../ui/SelectInput';
import { InlineAlert } from '../../ui/InlineAlert';
import { UpgradeButton } from '../../ui/UpgradeButton';
import { AccountStateAlert, isScreenFailure } from '../../account/AccountStates';
import { AiCreditMeterAccount, useAccountCredits } from '../AiCreditsAccount';
import type { AiRunsState } from './useAiRuns';

interface StartRunDialogProps {
  open: boolean;
  onClose: () => void;
  automations: Automation[];
  state: AiRunsState;
  onStarted: () => void;
  onScreenFailure: (f: AccountFailure) => void;
}

/** Start-run confirm (D549): credit estimate, then queued. Limits and switched-off AI are refused here. */
export function StartRunDialog({ open, onClose, automations, state, onStarted, onScreenFailure }: StartRunDialogProps) {
  const { t: tr } = useT();
  const plan = usePlan();
  const credits = useAccountCredits();
  const [automationId, setAutomationId] = useState('');
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<AccountFailure | null>(null);
  const estimate = SAMPLE_RUN_ESTIMATE;
  const notEnough = estimate > credits.available;
  const next = planOrder[planOrder.indexOf(plan.id) + 1];

  useEffect(() => {
    if (!open) return;
    setAutomationId(automations[0]?.id ?? '');
    setFailure(null);
    setBusy(false);
  }, [open, automations]);

  const start = async () => {
    const a = automations.find((x) => x.id === automationId);
    if (!a) return;
    setBusy(true);
    setFailure(null);
    const r = await state.start(a.id, a.name, estimate);
    setBusy(false);
    if (r.ok) {
      onStarted();
      return;
    }
    if (isScreenFailure(r.code)) {
      onClose();
      onScreenFailure(r);
      return;
    }
    setFailure(r);
  };

  return (
    <Dialog
      open={open}
      onClose={() => !busy && onClose()}
      title={tr('Start an AI run')}
      description={tr('This needs up to {n} credits; {m} are left this month.', { n: estimate, m: credits.available })}
      footer={
        <>
          <Button variant="secondary" disabled={busy} onClick={onClose}>
            {tr('Cancel')}
          </Button>
          <Button loading={busy} disabled={!automationId || notEnough || failure?.code === 'ai_off'} onClick={() => void start()}>
            {busy ? tr('Starting…') : tr('Start run')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {failure?.code === 'queue_full' ? (
          <InlineAlert tone="warning" title={tr('The queue is full')}>
            {tr('Your plan runs {a} at once and queues up to {q}. Try again when one finishes. Nothing was charged.', { a: state.limits.atOnce, q: state.limits.queue })}
          </InlineAlert>
        ) : failure?.code === 'ai_off' ? (
          <InlineAlert tone="warning" title={tr('AI is temporarily switched off')}>
            {tr('Nothing was charged. Try again later.')}
          </InlineAlert>
        ) : failure ? (
          <AccountStateAlert failure={failure} onRetry={() => void start()} />
        ) : null}
        {automations.length === 0 ? (
          <p className="text-label text-fg-muted">{tr('Create an automation first, then run it here.')}</p>
        ) : (
          <SelectInput id="ai-run-automation" label={tr('Automation')} value={automationId} onChange={setAutomationId} options={automations.map((a) => ({ value: a.id, label: a.name }))} />
        )}
        <AiCreditMeterAccount cost={estimate} />
        {notEnough && !next && <p className="text-caption text-fg-muted">{tr('Credits refill at the start of next month.')}</p>}
        {notEnough && next && <UpgradeButton plan={next} feature="More AI credits" />}
        <p className="text-caption text-fg-subtle">
          {tr('Runs wait in a queue and work in the background. Each run stops after {m} minutes or {s} steps. Unused credits come back when it finishes.', { m: 15, s: 25 })}
        </p>
      </div>
    </Dialog>
  );
}
