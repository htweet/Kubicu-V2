import React, { useEffect, useState } from 'react';
import type { AccountFailure } from '../../../types/accountMode';
import type { AiRun } from '../../../types/aiRuns';
import { useT } from '../../../contexts/LocaleContext';
import { formatTimestamp } from '../../../utils/format';
import { AI_RUN_MAX_MINUTES, AI_RUN_MAX_STEPS } from '../../../data/aiRunSamples';
import { Sheet } from '../../ui/Sheet';
import { Dialog } from '../../ui/Dialog';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { AccountStateAlert, isScreenFailure, toastSaved } from '../../account/AccountStates';
import { RunTimeline } from './RunTimeline';
import { RunEndSummary } from './RunEndSummary';
import { runStatusMeta } from './runStatus';
import type { AiRunsState } from './useAiRuns';

const TICK_MS = 3500;

/** One run: status, limits, live timeline, approval card, end summary and cancel (D549). */
export function RunDetailSheet({ run, state, onClose, onScreenFailure }: { run: AiRun | null; state: AiRunsState; onClose: () => void; onScreenFailure: (f: AccountFailure) => void }) {
  const { t: tr } = useT();
  const [confirming, setConfirming] = useState(false);
  const [failure, setFailure] = useState<AccountFailure | null>(null);
  const runId = run?.id;
  const running = run?.status === 'running';

  // Prototype: the sample run moves on while its sheet is open. Engineering replaces this with the live feed.
  useEffect(() => {
    if (!runId || !running) return;
    const t = window.setInterval(() => state.advance(runId), TICK_MS);
    return () => window.clearInterval(t);
  }, [runId, running, state.advance]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setFailure(null);
    setConfirming(false);
  }, [runId]);

  if (!run) return <Sheet open={false} onClose={onClose} title="" side="right">{null}</Sheet>;

  const meta = runStatusMeta[run.status];
  const ended = state.isEnded(run.status);
  const mayCancel = run.startedBy.id === 'me' || state.can('workflows.admin').allowed;
  const cancellable = run.status === 'queued' || run.status === 'running' || run.status === 'waiting_approval';
  const minutes = Math.max(0, Math.round(((run.endedAt ? Date.parse(run.endedAt) : Date.now()) - Date.parse(run.startedAt)) / 60_000));
  const doneActions = run.steps.filter((s) => s.kind === 'tool' && s.status === 'done');

  const cancel = async () => {
    setConfirming(false);
    setFailure(null);
    const r = await state.cancel(run.id);
    if (r.ok) return toastSaved(tr, tr('Run cancelled.'));
    if (r.code === 'cancelled') return;
    if (isScreenFailure(r.code)) {
      onClose();
      onScreenFailure(r);
      return;
    }
    setFailure(r);
  };

  return (
    <>
      <Sheet
        open
        onClose={onClose}
        side="right"
        size="lg"
        title={run.automationName}
        description={`${tr('Started {when}', { when: formatTimestamp(run.startedAt) })} · ${tr('by {name}', { name: run.startedBy.id === 'me' ? tr('you') : run.startedBy.name })}`}
        footer={
          cancellable ? (
            mayCancel ? (
              <Button variant="secondary" onClick={() => setConfirming(true)}>
                {tr('Cancel run')}
              </Button>
            ) : (
              <p className="text-caption text-fg-muted">{tr(state.can('workflows.admin').reason)}</p>
            )
          ) : (
            <Button variant="secondary" onClick={onClose}>
              {tr('Close')}
            </Button>
          )
        }
      >
        <div className="flex flex-col gap-5 p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <Badge tone={meta.tone} dot>
              {tr(meta.label)}
            </Badge>
            <span className="text-caption text-fg-muted">
              {run.status === 'queued'
                ? run.queueAhead
                  ? tr('{n} ahead of you', { n: run.queueAhead })
                  : tr('Next in the queue')
                : `${tr('Step {n} of {max}', { n: run.steps.length, max: AI_RUN_MAX_STEPS })} · ${tr('{m} min of {max}', { m: minutes, max: AI_RUN_MAX_MINUTES })}`}
            </span>
            <span className="text-caption text-fg-muted">
              {ended ? tr('Credits charged: {n}', { n: run.creditsUsed }) : tr('Credits used: {n} of up to {max}', { n: run.creditsUsed, max: run.creditsEstimate })}
            </span>
          </div>
          {run.status === 'cancelling' && <p className="text-label text-fg-muted" role="status">{tr('Cancelling… Steps already carried out won’t be undone.')}</p>}
          {failure && <AccountStateAlert failure={failure} onRetry={() => void cancel()} />}
          {ended && <RunEndSummary run={run} />}
          <section aria-labelledby="run-steps-heading">
            <h3 id="run-steps-heading" className="mb-3 text-label font-semibold text-fg">
              {tr('Steps')}
            </h3>
            <RunTimeline run={run} approvals={state.approvals} state={state} />
          </section>
          <p className="text-caption text-fg-subtle">{tr('Illustrative run. Steps, names and figures are examples until engineering connects the run store.')}</p>
        </div>
      </Sheet>

      <Dialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title={tr('Cancel this run?')}
        description={tr('The run stops after its current step. Anything waiting for approval is withdrawn.')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirming(false)}>
              {tr('Keep running')}
            </Button>
            <Button variant="destructive" onClick={() => void cancel()}>
              {tr('Cancel run')}
            </Button>
          </>
        }
      >
        {doneActions.length > 0 ? (
          <div className="text-label text-fg">
            <p className="font-medium">{tr('These were already carried out and won’t be undone:')}</p>
            <ul className="mt-1.5 list-disc pl-5 text-fg-muted">
              {doneActions.map((s) => (
                <li key={s.id}>{tr(s.summary)}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-label text-fg-muted">{tr('Nothing has been carried out in your workspace yet.')}</p>
        )}
      </Dialog>
    </>
  );
}
