import React from 'react';
import type { AiRun } from '../../../types/aiRuns';
import { useT } from '../../../contexts/LocaleContext';
import { InlineAlert } from '../../ui/InlineAlert';

/** What a finished run shows above its timeline (D549). Every end state states the credits charged. */
export function RunEndSummary({ run }: { run: AiRun }) {
  const { t: tr } = useT();
  const credits = tr('Credits charged: {n}', { n: run.creditsUsed });
  const done = run.steps.filter((s) => s.kind === 'tool' && s.status === 'done');
  const doneList = done.length > 0 && (
    <>
      <p className="mt-2 font-medium">{tr('Already carried out:')}</p>
      <ul className="mt-1 list-disc pl-5">
        {done.map((s) => (
          <li key={s.id}>{tr(s.summary)}</li>
        ))}
      </ul>
    </>
  );
  const who = (name?: string, id?: string) => (id === 'me' ? tr('you') : name ?? tr('someone'));

  switch (run.status) {
    case 'succeeded':
      return (
        <InlineAlert tone="success" title={tr('Succeeded')}>
          {run.summary && <p>{tr(run.summary)}</p>}
          {run.outputs && run.outputs.length > 0 && (
            <ul className="mt-1 list-disc pl-5">
              {run.outputs.map((o) => (
                <li key={o}>{tr(o)}</li>
              ))}
            </ul>
          )}
          <p className="mt-2">{credits}</p>
        </InlineAlert>
      );
    case 'failed':
      return (
        <InlineAlert tone="danger" title={tr('Failed')}>
          <p>{tr(run.reason ?? 'The run stopped with an error.')}</p>
          {doneList}
          <p className="mt-2">{credits}</p>
        </InlineAlert>
      );
    case 'timed_out':
      return (
        <InlineAlert tone="danger" title={tr('Timed out')}>
          <p>{tr(run.reason ?? 'It reached the 15-minute or 25-step limit before finishing.')}</p>
          {doneList}
          <p className="mt-2">{credits}</p>
        </InlineAlert>
      );
    case 'cancelled':
      return (
        <InlineAlert tone="info" title={tr('Cancelled by {name}', { name: who(run.endedBy?.name, run.endedBy?.id) })}>
          {doneList || <p>{tr('Nothing had been carried out yet.')}</p>}
          <p className="mt-2">{credits}</p>
        </InlineAlert>
      );
    case 'rejected':
      return (
        <InlineAlert tone="warning" title={tr('Rejected by {name}', { name: who(run.endedBy?.name, run.endedBy?.id) })}>
          {run.comment && <p>“{run.comment}”</p>}
          <p className="mt-1">{tr('The action that needed approval wasn’t carried out.')}</p>
          {doneList}
          <p className="mt-2">{credits}</p>
        </InlineAlert>
      );
    default:
      return null;
  }
}
