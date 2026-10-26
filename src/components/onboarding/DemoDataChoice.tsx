import React, { useId } from 'react';
import { CheckIcon, Clock3Icon } from 'lucide-react';
import { DEMO_DATA_DAYS, demoDataCovers } from '../../utils/demoData';
import { cn } from '../../utils/cn';

interface DemoDataChoiceProps {
  on: boolean;
  onChange: (on: boolean) => void;
}

/** Setup-only choice (D200): start with labelled sample data everywhere, removed after 7 days. */
export function DemoDataChoice({ on, onChange }: DemoDataChoiceProps) {
  const id = useId();
  return (
    <div className={cn('mt-8 rounded-lg border p-4 transition-colors duration-150', on ? 'border-action bg-action-soft' : 'border-line')}>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
        <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
          <input id={id} type="checkbox" checked={on} onChange={(e) => onChange(e.target.checked)} className="peer absolute inset-0 cursor-pointer opacity-0" aria-describedby={`${id}-desc`} />
          <span aria-hidden className={cn('flex h-5 w-5 items-center justify-center rounded-[5px] border peer-focus-visible:ring-2 peer-focus-visible:ring-focus', on ? 'border-action bg-action text-action-fg' : 'border-line-strong bg-raised')}>
            {on && <CheckIcon size={13} strokeWidth={3} />}
          </span>
        </span>
        <span className="min-w-0">
          <span className="block text-label font-semibold text-fg">Start with demo data</span>
          <span id={`${id}-desc`} className="mt-0.5 block text-label text-fg-muted">
            Fill every area with labelled sample records so you can try things before adding your own. Your page above isn’t changed.
          </span>
        </span>
      </label>
      {on &&
      <div className="mt-3 border-t border-line pl-8 pt-3">
          <ul className="flex flex-col gap-1.5">
            {demoDataCovers.map((c) =>
          <li key={c} className="flex gap-2 text-caption text-fg-muted">
                <CheckIcon size={13} className="mt-0.5 shrink-0 text-fg-subtle" aria-hidden />
                {c}
              </li>
          )}
          </ul>
          <p className="mt-3 flex items-start gap-2 text-caption font-medium text-fg">
            <Clock3Icon size={14} className="mt-0.5 shrink-0 text-warning" aria-hidden />
            It’s deleted automatically after {DEMO_DATA_DAYS} days, or remove it sooner in Settings → Business. This is the only time you can add it.
          </p>
        </div>
      }
    </div>);

}