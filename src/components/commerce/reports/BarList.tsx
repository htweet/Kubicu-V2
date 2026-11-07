import React from 'react';

export interface BarRow {
  key: string;
  label: string;
  value: number;
  valueText: string;
  meta?: string;
}

/** Ranked list with a proportional bar under each row (D227). The figure is always written out, not only drawn. */
export function BarList({ rows, empty }: { rows: BarRow[]; empty: string }) {
  if (rows.length === 0) return <p className="text-label text-fg-muted">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ol className="flex flex-col gap-4">
      {rows.map((r) => (
        <li key={r.key}>
          <div className="flex items-baseline justify-between gap-3 text-label">
            <span className="min-w-0 truncate font-medium text-fg">{r.label}</span>
            <span className="shrink-0 tabular-nums text-fg">
              {r.valueText}
              {r.meta && <span className="text-fg-subtle"> · {r.meta}</span>}
            </span>
          </div>
          <div aria-hidden className="mt-1.5 h-1.5 rounded-full bg-sunken">
            <div className="h-full rounded-full bg-action" style={{ width: `${Math.max(2, (r.value / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ol>
  );
}
