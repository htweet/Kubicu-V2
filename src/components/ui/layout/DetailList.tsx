import React from 'react';
import { cn } from '../../../utils/cn';

export interface DetailItem {
  label: React.ReactNode;
  value: React.ReactNode;
}

/**
 * Label / value pairs for detail panels and sheets. Labels sit in a fixed column on wider
 * panels and stack on narrow ones, so values always start on the same edge (D75).
 */
export function DetailList({ items, className }: { items: DetailItem[]; className?: string }) {
  return (
    <dl className={cn('flex flex-col divide-y divide-line', className)}>
      {items.map((it, i) => (
        <div key={i} className="grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[144px_minmax(0,1fr)] sm:gap-4">
          <dt className="text-caption text-fg-subtle sm:pt-px">{it.label}</dt>
          <dd className="min-w-0 break-words text-label text-fg">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** A titled group inside a sheet or detail panel; groups are separated by 24px and a hairline. */
export function DetailSection({ title, actions, children }: { title: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 border-t border-line pt-6 first:border-t-0 first:pt-0">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-label font-semibold text-fg">{title}</h3>
        {actions}
      </div>
      {children}
    </section>
  );
}
