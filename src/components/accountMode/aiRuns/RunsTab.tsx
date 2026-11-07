import React, { useMemo, useState } from 'react';
import { HistoryIcon, Loader2Icon, PlayIcon } from 'lucide-react';
import { useT } from '../../../contexts/LocaleContext';
import { Segmented } from '../../ui/Segmented';
import { Button } from '../../ui/Button';
import { EmptyState } from '../../ui/EmptyState';
import { Card } from '../../ui/layout/Card';
import { List } from '../../ui/layout/ListRow';
import { AccountStateAlert } from '../../account/AccountStates';
import { RunRow } from './RunRow';
import { matchesFilter, type RunFilter } from './runStatus';
import type { AiRunsState } from './useAiRuns';

interface RunsTabProps {
  state: AiRunsState;
  onOpen: (runId: string) => void;
  onStart: () => void;
  /** Today's test and live runs (browser history), shown below so nothing is lost. */
  earlierRuns: React.ReactNode;
}

/** Runs tab (D549): AI runs with status filters and queue position, then earlier runs. */
export function RunsTab({ state, onOpen, onStart, earlierRuns }: RunsTabProps) {
  const { t: tr } = useT();
  const [filter, setFilter] = useState<RunFilter>('all');
  const shown = useMemo(() => state.runs.filter((r) => matchesFilter(r.status, filter)), [state.runs, filter]);
  const canRun = state.can('workflows.run');

  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="ai-runs-heading" className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="ai-runs-heading" className="text-body font-semibold text-fg">
              {tr('AI runs')}
            </h2>
            <p className="mt-1 text-label text-fg-muted">{tr('Your plan runs {a} at once and queues up to {q}.', { a: state.limits.atOnce, q: state.limits.queue })}</p>
          </div>
          <div className="flex flex-col items-start gap-1 sm:items-end">
            <Button leadingIcon={PlayIcon} disabled={!canRun.allowed} onClick={onStart}>
              {tr('Start an AI run')}
            </Button>
            {!canRun.allowed && <p className="text-caption text-fg-muted">{tr(canRun.reason)}</p>}
          </div>
        </div>

        {state.status === 'loading' ? (
          <p className="flex items-center gap-2 py-8 text-label text-fg-muted" role="status">
            <Loader2Icon size={16} className="animate-spin" aria-hidden />
            {tr('Loading runs…')}
          </p>
        ) : state.status === 'error' && state.failure ? (
          <div className="flex flex-col gap-3">
            <p className="text-label font-semibold text-fg">{tr('Couldn’t load runs')}</p>
            <AccountStateAlert failure={state.failure} onRetry={() => void state.load()} />
          </div>
        ) : state.runs.length === 0 ? (
          <EmptyState framed icon={HistoryIcon} title={tr('No AI runs yet')} description={tr('Start one here. Its steps show up live as it works.')} />
        ) : (
          <>
            <div className="-mx-1 overflow-x-auto px-1">
              <Segmented<RunFilter>
                ariaLabel={tr('Show runs')}
                size="sm"
                value={filter}
                onChange={setFilter}
                options={[
                  { value: 'all', label: tr('All') },
                  { value: 'running', label: tr('Running') },
                  { value: 'waiting', label: tr('Waiting for approval') },
                  { value: 'ended', label: tr('Ended') },
                ]}
              />
            </div>
            {shown.length === 0 ? (
              <p className="text-label text-fg-muted">{tr('No runs match this filter.')}</p>
            ) : (
              <Card as="div" body="flush">
                <List label={tr('AI runs')}>
                  {shown.map((r) => (
                    <RunRow key={r.id} run={r} onOpen={() => onOpen(r.id)} />
                  ))}
                </List>
              </Card>
            )}
            <p className="text-caption text-fg-subtle">{tr('Illustrative runs. Names and figures are examples until engineering connects the run store.')}</p>
          </>
        )}
      </section>

      {earlierRuns}
    </div>
  );
}
