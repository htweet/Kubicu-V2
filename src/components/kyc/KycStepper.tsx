import React from 'react';
import { AlertTriangleIcon, CheckIcon } from 'lucide-react';
import type { KycStepId } from '../../types/kyc';
import { stepLabels } from '../../utils/money/kyc';
import { cn } from '../../utils/cn';

interface KycStepperProps {
  steps: KycStepId[];
  current: KycStepId;
  done: (s: KycStepId) => boolean;
  flagged: KycStepId[];
  /** Steps that can't be opened yet (before a business type is chosen). */
  locked: (s: KycStepId) => boolean;
  onSelect: (s: KycStepId) => void;
}

/** Verification steps: a vertical list on desktop, a compact progress strip on phones. */
export function KycStepper({ steps, current, done, flagged, locked, onSelect }: KycStepperProps) {
  const idx = steps.indexOf(current);
  const completed = steps.filter((s) => s !== 'review' && done(s)).length;
  const total = steps.length - 1;

  return (
    <nav aria-label="Verification steps">
      {/* Phones */}
      <div className="lg:hidden">
        <div className="flex items-baseline justify-between gap-2 text-caption">
          <span className="font-semibold text-fg">
            Step {idx + 1} of {steps.length} · {stepLabels[current].label}
          </span>
          <span className="text-fg-subtle">
            {completed} of {total} done
          </span>
        </div>
        <div className="mt-2 flex gap-1" aria-hidden>
          {steps.map((s) =>
          <span key={s} className={cn('h-1.5 flex-1 rounded-full', s === current ? 'bg-action' : flagged.includes(s) ? 'bg-warning' : done(s) ? 'bg-success' : 'bg-sunken')} />
          )}
        </div>
      </div>

      {/* Desktop */}
      <ol className="hidden flex-col lg:flex">
        {steps.map((s, i) => {
          const isDone = s !== 'review' && done(s);
          const isFlagged = flagged.includes(s);
          const isCurrent = s === current;
          const isLocked = locked(s);
          return (
            <li key={s} className="relative">
              {i < steps.length - 1 && <span aria-hidden className={cn('absolute left-[15px] top-9 h-[calc(100%-24px)] w-px', isDone ? 'bg-success' : 'bg-line')} />}
              <button
                type="button"
                disabled={isLocked}
                onClick={() => onSelect(s)}
                aria-current={isCurrent ? 'step' : undefined}
                className={cn(
                  'flex w-full items-start gap-3 rounded-md px-0 py-2 text-left transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                  isLocked ? 'cursor-not-allowed opacity-50' : 'hover:text-fg'
                )}>
                
                <span
                  className={cn(
                    'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-caption font-semibold tabular-nums',
                    isCurrent ? 'border-action bg-action text-action-fg' : isFlagged ? 'border-warning bg-warning-soft text-warning' : isDone ? 'border-success bg-success-soft text-success' : 'border-line bg-raised text-fg-subtle'
                  )}
                  aria-hidden>
                  
                  {isFlagged && !isCurrent ? <AlertTriangleIcon size={14} /> : isDone && !isCurrent ? <CheckIcon size={14} strokeWidth={3} /> : i + 1}
                </span>
                <span className="min-w-0 pt-0.5">
                  <span className={cn('block text-label', isCurrent ? 'font-semibold text-fg' : 'font-medium text-fg-muted')}>{stepLabels[s].label}</span>
                  <span className="block text-caption text-fg-subtle">{isFlagged ? 'Change requested' : stepLabels[s].hint}</span>
                  <span className="sr-only">{isDone ? ' — done' : isFlagged ? ' — needs changes' : ''}</span>
                </span>
              </button>
            </li>);

        })}
      </ol>
    </nav>);

}