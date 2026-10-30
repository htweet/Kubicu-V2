import React from 'react';
import { CheckIcon, MinusIcon, XIcon, ClockIcon } from 'lucide-react';
import type { AutomationRun } from '../../types/ops';
import { cn } from '../../utils/cn';
import { useT } from '../../contexts/LocaleContext';

const icon = { done: CheckIcon, skipped: MinusIcon, failed: XIcon, waiting: ClockIcon };

export function RunSteps({ run }: {run: AutomationRun;}) {
  const { t } = useT();
  const statusWord = { done: 'Done', skipped: 'Skipped', failed: 'Failed', waiting: 'Waiting' } as const;
  return (
    <ol className="mt-3 flex flex-col gap-2">
      {run.steps.map((s, i) => {
        const Icon = icon[s.status];
        return (
          <li key={i} className="flex items-start gap-2.5">
            <span
              aria-hidden
              className={cn(
                'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                s.status === 'done' ? 'bg-success-soft text-success' : s.status === 'failed' ? 'bg-danger-soft text-danger' : 'bg-sunken text-fg-subtle'
              )}>
              
              <Icon size={11} strokeWidth={3} />
            </span>
            <div className="min-w-0">
              <p className="text-label font-medium text-fg">
                <span className="sr-only">{t(statusWord[s.status])}: </span>
                {t(s.label)}
              </p>
              <p className="text-caption text-fg-muted">{t(s.detail)}</p>
            </div>
          </li>);

      })}
    </ol>);

}