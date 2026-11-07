import React, { useMemo } from 'react';
import { CheckCheckIcon, Loader2Icon } from 'lucide-react';
import { useT } from '../../../contexts/LocaleContext';
import { EmptyState } from '../../ui/EmptyState';
import { Button } from '../../ui/Button';
import { AccountStateAlert } from '../../account/AccountStates';
import { ApprovalCard } from './ApprovalCard';
import type { AiRunsState } from './useAiRuns';

/** Approvals inbox (D549): waiting first, then decided, newest first. */
export function ApprovalsTab({ state, onOpenRun }: { state: AiRunsState; onOpenRun: (runId: string) => void }) {
  const { t: tr } = useT();
  const sorted = useMemo(() => [...state.approvals].sort((a, b) => Number(b.status === 'pending') - Number(a.status === 'pending') || Date.parse(b.requestedAt) - Date.parse(a.requestedAt)), [state.approvals]);
  const pending = sorted.filter((a) => a.status === 'pending');
  const decided = sorted.filter((a) => a.status !== 'pending');

  if (state.status === 'loading')
    return (
      <p className="flex items-center gap-2 py-8 text-label text-fg-muted" role="status">
        <Loader2Icon size={16} className="animate-spin" aria-hidden />
        {tr('Loading approvals…')}
      </p>
    );
  if (state.status === 'error' && state.failure) return <AccountStateAlert failure={state.failure} onRetry={() => void state.load()} />;

  const card = (a: (typeof sorted)[number]) => (
    <li key={a.id} className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="truncate text-label font-semibold text-fg">{a.automationName}</span>
        <Button size="sm" variant="tertiary" onClick={() => onOpenRun(a.runId)}>
          {tr('View run')}
        </Button>
      </div>
      <ApprovalCard approval={a} state={state} />
    </li>
  );

  return (
    <div className="flex max-w-3xl flex-col gap-10">
      <section aria-labelledby="ap-waiting">
        <h2 id="ap-waiting" className="text-body font-semibold text-fg">
          {tr('Waiting for a decision')}
        </h2>
        <p className="mt-1 text-label text-fg-muted">{tr('AI runs pause here before sensitive actions. Each card shows exactly what will happen.')}</p>
        {pending.length === 0 ? (
          <EmptyState framed className="mt-4" icon={CheckCheckIcon} title={tr('Nothing waiting')} description={tr('When an AI run needs approval, it appears here.')} />
        ) : (
          <ul className="mt-4 flex flex-col gap-5">{pending.map(card)}</ul>
        )}
      </section>
      {decided.length > 0 && (
        <section aria-labelledby="ap-decided">
          <h2 id="ap-decided" className="text-label font-semibold text-fg">
            {tr('Decided')}
          </h2>
          <ul className="mt-3 flex flex-col gap-5">{decided.map(card)}</ul>
        </section>
      )}
    </div>
  );
}
