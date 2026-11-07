import React from 'react';
import type { AiRun } from '../../../types/aiRuns';
import { useT } from '../../../contexts/LocaleContext';
import { formatRelative } from '../../../utils/format';
import { AI_RUN_MAX_STEPS } from '../../../data/aiRunSamples';
import { Badge } from '../../ui/Badge';
import { runStatusMeta } from './runStatus';

/** One row in the Runs tab (D549). */
export function RunRow({ run, onOpen }: { run: AiRun; onOpen: () => void }) {
  const { t: tr } = useT();
  const meta = runStatusMeta[run.status];
  const detail =
    run.status === 'queued'
      ? run.queueAhead
        ? tr('{n} ahead of you', { n: run.queueAhead })
        : tr('Next in the queue')
      : run.status === 'running'
        ? tr('Step {n} of {max}', { n: run.steps.length, max: AI_RUN_MAX_STEPS })
        : tr('Credits used: {n}', { n: run.creditsUsed });
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full flex-col gap-1.5 px-5 py-3.5 text-left transition-colors duration-150 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus sm:flex-row sm:items-center sm:gap-4 md:px-6"
      >
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="truncate text-label font-semibold text-fg">{run.automationName}</span>
            <Badge tone={meta.tone} dot>
              {tr(meta.label)}
            </Badge>
          </span>
          <span className="mt-0.5 block truncate text-caption text-fg-subtle">
            {tr('Started by {name}', { name: run.startedBy.id === 'me' ? tr('you') : run.startedBy.name })} · {formatRelative(run.startedAt)}
          </span>
        </span>
        <span className="shrink-0 text-caption text-fg-muted">{detail}</span>
      </button>
    </li>
  );
}
