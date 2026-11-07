import React from 'react';
import type { FunnelStep } from '../../utils/analytics/aggregate';
import { cn } from '../../utils/cn';
import { useT } from '../../contexts/LocaleContext';

/** Steps as horizontal bars, each with its count and drop from the previous step. */
export function FunnelView({ steps, emptyText }: { steps: FunnelStep[]; emptyText: string }) {
  const { t } = useT();
  const first = steps[0]?.count ?? 0;
  if (first === 0) return <p className="py-6 text-label text-fg-muted">{t(emptyText)}</p>;
  return (
    <ol className="flex flex-col gap-3">
      {steps.map((s, i) => {
        const prev = i ? steps[i - 1].count : s.count;
        const pct = first ? (s.count / first) * 100 : 0;
        const kept = prev ? Math.round((s.count / prev) * 100) : 0;
        return (
          <li key={s.label} className="grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3 sm:grid-cols-[12rem_1fr_7rem]">
            <span className="truncate text-label text-fg">{t(s.label)}</span>
            <span className="h-7 overflow-hidden rounded-sm bg-sunken">
              <span className={cn('block h-full rounded-sm', i === steps.length - 1 ? 'bg-action' : 'bg-action/60')} style={{ width: `${Math.max(pct, s.count ? 2 : 0)}%` }} />
            </span>
            <span className="text-right text-label tabular-nums text-fg">
              {s.count.toLocaleString()}
              {i > 0 && <span className="ml-1.5 text-caption text-fg-subtle">{kept}%</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
