import React from 'react';
import { CircleDashedIcon } from 'lucide-react';
import type { CopilotBrief } from '../../types/copilot';
import { useT } from '../../contexts/LocaleContext';

/**
 * The confirmation moment (D262): what Copilot understood, before anything is generated.
 * D339: labels are translated; values pass through the translator (fixed ones like the page kind, goal, look, layout
 * and section names show drafts where they exist). The name and audience are what the person typed, so they stay as written.
 */
export function CopilotBriefCard({ brief }: {brief: CopilotBrief;}) {
  const { t: tr } = useT();
  const rows: [string, string][] = [
  ['Creating', tr(brief.kindLabel)],
  ['Name', brief.name],
  ['For', brief.audience],
  ['Visitors should', tr(brief.goal)],
  ['Look', tr(brief.look)],
  ['Layout', tr(brief.layout)]];

  return (
    <div className="w-full max-w-[420px] overflow-hidden rounded-2xl border border-line bg-raised text-left">
      <dl className="divide-y divide-line">
        {rows.map(([k, v]) =>
        <div key={k} className="grid grid-cols-[112px_minmax(0,1fr)] gap-3 px-4 py-2.5">
            <dt className="text-caption text-fg-subtle">{tr(k)}</dt>
            <dd className="text-label font-medium text-fg">{v}</dd>
          </div>
        )}
      </dl>
      <div className="border-t border-line px-4 py-3">
        <p className="text-caption text-fg-subtle">{tr('Sections, in order')}</p>
        <ol className="mt-1.5 flex flex-wrap gap-1.5">
          {brief.sections.map((s, i) =>
          <li key={`${s}-${i}`} className="rounded-md bg-sunken px-2 py-1 text-caption font-medium text-fg">
              {i + 1}. {tr(s)}
            </li>
          )}
        </ol>
        <p className="mt-2 text-caption text-fg-muted">{tr(brief.layoutReason)}</p>
      </div>
      {brief.gaps.length > 0 &&
      <div className="border-t border-line bg-sunken/60 px-4 py-3">
          <p className="text-caption font-semibold text-fg">{tr('Left for you to fill in')}</p>
          <ul className="mt-1.5 flex flex-col gap-1">
            {brief.gaps.map((g) =>
          <li key={g} className="flex items-start gap-2 text-caption text-fg-muted">
                <CircleDashedIcon size={12} className="mt-0.5 shrink-0" aria-hidden />
                {tr(g)}
              </li>
          )}
          </ul>
          <p className="mt-2 text-caption text-fg-subtle">{tr('I never make up prices, reviews, hours or policies — these stay marked until you add them.')}</p>
        </div>
      }
    </div>);

}