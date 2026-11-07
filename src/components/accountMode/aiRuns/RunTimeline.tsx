import React from 'react';
import { CheckIcon, ClockIcon, Loader2Icon, MinusIcon, ShieldQuestionIcon, WrenchIcon, XIcon } from 'lucide-react';
import type { AiApproval, AiRun } from '../../../types/aiRuns';
import { useT } from '../../../contexts/LocaleContext';
import { formatTimestamp } from '../../../utils/format';
import { cn } from '../../../utils/cn';
import { ApprovalCard } from './ApprovalCard';
import type { AiRunsState } from './useAiRuns';

const icon = { done: CheckIcon, running: Loader2Icon, waiting: ClockIcon, failed: XIcon, skipped: MinusIcon };
const statusWord = { done: 'Done', running: 'In progress', waiting: 'Waiting', failed: 'Failed', skipped: 'Skipped' } as const;

/** Live step-by-step timeline for one run (D549). Extends the RunSteps look; approval steps embed the card. */
export function RunTimeline({ run, approvals, state }: { run: AiRun; approvals: AiApproval[]; state: AiRunsState }) {
  const { t: tr } = useT();
  const live = run.status === 'running' || run.status === 'queued' || run.status === 'cancelling';
  if (run.steps.length === 0) {
    return <p className="text-label text-fg-muted">{run.status === 'queued' ? tr('Steps appear here once the run starts.') : tr('No steps were recorded.')}</p>;
  }
  return (
    <ol className="flex flex-col gap-3" aria-live={live ? 'polite' : undefined} aria-label={tr('Run steps')}>
      {run.steps.map((s) => {
        const Icon = s.kind === 'approval' && s.status === 'waiting' ? ShieldQuestionIcon : icon[s.status];
        const approval = s.approvalId ? approvals.find((a) => a.id === s.approvalId) : undefined;
        return (
          <li key={s.id} className="flex items-start gap-2.5">
            <span
              aria-hidden
              className={cn(
                'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                s.status === 'done' ? 'bg-success-soft text-success' : s.status === 'failed' ? 'bg-danger-soft text-danger' : s.status === 'waiting' ? 'bg-warning-soft text-warning' : 'bg-sunken text-fg-subtle',
              )}
            >
              <Icon size={11} strokeWidth={3} className={s.status === 'running' ? 'animate-spin motion-reduce:animate-none' : undefined} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-label font-medium text-fg">
                <span className="sr-only">{tr(statusWord[s.status])}: </span>
                {tr(s.summary)}
              </p>
              <p className="flex items-center gap-1.5 text-caption text-fg-subtle">
                {s.kind === 'tool' && (
                  <>
                    <WrenchIcon size={11} aria-hidden />
                    {tr('Action in your workspace')} ·{' '}
                  </>
                )}
                {s.at ? formatTimestamp(s.at) : ''}
              </p>
              {approval && approval.status === 'pending' && <ApprovalCard approval={approval} state={state} className="mt-2" />}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
