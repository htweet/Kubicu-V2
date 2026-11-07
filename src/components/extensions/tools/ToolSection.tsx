import React from 'react';
import { Badge } from '../../ui/Badge';

/** Frame for an installed extension's working tools inside its detail sheet (D232). */
export function ToolSection({ title, simulated, children }: { title: string; simulated?: string; children: React.ReactNode }) {
  return (
    <section aria-label={title} className="flex flex-col gap-4 rounded-lg border border-line p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-label font-semibold text-fg">{title}</h3>
        {simulated && <Badge tone="warning">Preview</Badge>}
      </div>
      {children}
      {simulated && <p className="text-caption text-fg-subtle">{simulated}</p>}
    </section>
  );
}

export function ToolStat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-caption text-fg-muted">{label}</dt>
      <dd className="mt-0.5 text-[20px] font-semibold leading-tight tabular-nums text-fg">{value}</dd>
      {hint && <dd className="text-caption text-fg-subtle">{hint}</dd>}
    </div>
  );
}
