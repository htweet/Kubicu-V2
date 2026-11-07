import React from 'react';
import { CheckIcon, Loader2Icon } from 'lucide-react';
import { useT } from '../../contexts/LocaleContext';
import { progressSteps } from '../../utils/copilot/engine';
import { cn } from '../../utils/cn';

/** Generation steps that map to real work — no percentages (D262). `step` past the end means done. Translated in D339. */
export function CopilotProgress({ step, failed }: { step: number; failed?: boolean }) {
  const { t: tr } = useT();
  const steps = progressSteps();
  return (
    <ol className="flex w-full max-w-[360px] flex-col gap-2 rounded-2xl border border-line bg-raised px-4 py-3" aria-live="polite">
      {steps.map((label, i) => {
        const done = i < step;
        const active = i === step && !failed;
        return (
          <li key={label} className={cn('flex items-center gap-2.5 text-label', done ? 'text-fg' : active ? 'font-medium text-fg' : 'text-fg-subtle')}>
            <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full', done ? 'bg-success text-white' : 'border border-line-strong')}>
              {done ? <CheckIcon size={12} strokeWidth={3} aria-hidden /> : active ? <Loader2Icon size={12} className="animate-spin" aria-hidden /> : null}
            </span>
            {tr(label)}
            {active && <span className="sr-only">({tr('in progress')})</span>}
          </li>
        );
      })}
    </ol>
  );
}
