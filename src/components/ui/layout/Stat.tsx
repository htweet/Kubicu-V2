import React from 'react';
import { cn } from '../../../utils/cn';
import { useT } from '../../../contexts/LocaleContext';

interface StatProps {
  label: React.ReactNode;
  value: React.ReactNode;
  /** Context under the value: a change, a period, a basis. */
  hint?: React.ReactNode;
  /** One stat per group may lead; the rest stay quiet (D75). */
  primary?: boolean;
}

/** Label above value, never the other way round. Values are tabular so columns line up. */
export function Stat({ label, value, hint, primary }: StatProps) {
  const { t } = useT();
  if (typeof label === 'string') label = t(label);
  if (typeof hint === 'string') hint = t(hint);
  return (
    <div className="min-w-0">
      <dt className="text-caption text-fg-subtle">{label}</dt>
      <dd className={cn('mt-1 tabular-nums text-fg', primary ? 'text-[1.75rem] font-semibold leading-none tracking-[-0.02em]' : 'text-heading font-semibold')}>{value}</dd>
      {hint && <dd className="mt-1 text-caption text-fg-subtle">{hint}</dd>}
    </div>);

}

/**
 * A row of stats on shared baselines. `divided` adds a hairline above (used under a lead figure).
 */
export function StatGroup({ columns = 3, divided, className, children }: {columns?: 2 | 3 | 4;divided?: boolean;className?: string;children: React.ReactNode;}) {
  const cols = { 2: 'grid-cols-2', 3: 'grid-cols-2 sm:grid-cols-3', 4: 'grid-cols-2 md:grid-cols-4' }[columns];
  return <dl className={cn('grid gap-x-6 gap-y-4', cols, divided && 'border-t border-line pt-4', className)}>{children}</dl>;
}