import React from 'react';
import { assistantSample } from '../../data/assistantSample';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

interface AssistantExampleDialogProps {
  open: boolean;
  onClose: () => void;
}

/** A worked example conversation, so people know what to expect before they start (D211e). */
export function AssistantExampleDialog({ open, onClose }: AssistantExampleDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title="How a conversation goes" description={`Sample: ${assistantSample.business}. Fictional business.`} footer={<Button onClick={onClose}>Got it</Button>}>
      <ol className="flex flex-col gap-2.5">
        {assistantSample.turns.map((t, i) => (
          <li key={i} className={cn('flex flex-col gap-1', t.who === 'owner' ? 'items-end' : 'items-start')}>
            <p className={cn('max-w-[85%] whitespace-pre-line rounded-lg px-3 py-2 text-label', t.who === 'owner' ? 'bg-action text-action-fg' : 'bg-sunken text-fg')}>
              <span className="sr-only">{t.who === 'owner' ? 'Owner: ' : 'Assistant: '}</span>
              {t.text}
            </p>
            {t.note && <p className="max-w-[85%] text-caption text-fg-subtle">{t.note}</p>}
          </li>
        ))}
      </ol>
      <div className="mt-5 border-t border-line pt-4">
        <p className="text-label font-semibold text-fg">What it ends with</p>
        <ul className="mt-1.5 flex flex-col gap-1">
          {assistantSample.outcome.map((o) => (
            <li key={o} className="text-label text-fg-muted">
              · {o}
            </li>
          ))}
        </ul>
      </div>
    </Dialog>
  );
}
