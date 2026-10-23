import React from 'react';
import { CheckIcon } from 'lucide-react';
import { roadmapBatches, roadmapItems, type RoadmapStatus } from '../../data/roadmap';
import { InfoHero } from '../../components/legal/InfoHero';
import { cn } from '../../utils/cn';

const statusLabel: Record<RoadmapStatus, string> = { live: 'Live', preview: 'Preview', planned: 'Planned' };
const statusTone: Record<RoadmapStatus, string> = { live: 'text-success', preview: 'text-warning', planned: 'text-fg-muted' };
const dotTone: Record<RoadmapStatus, string> = { live: 'bg-success', preview: 'bg-warning', planned: 'bg-fg-subtle' };

export function Roadmap() {
  const done = roadmapBatches.filter((b) => b.done).length;
  return (
    <>
      <InfoHero crumb="Product" title="Roadmap" intro="What works today, what’s in preview (simulated or partial), and what’s planned. Updated whenever something ships." />

      <div className="mx-auto w-full max-w-6xl px-5 py-14 md:px-8">
        <section aria-labelledby="batches-h">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="batches-h" className="text-heading font-semibold text-fg">
              Design batches
            </h2>
            <p className="text-caption text-fg-subtle">
              {done} of {roadmapBatches.length} complete
            </p>
          </div>
          <ol className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {roadmapBatches.map((b) =>
            <li key={b.batch} className={cn('rounded-xl border px-3 py-3', b.done ? 'border-transparent bg-raised' : 'border-line')}>
                <span className="flex items-center gap-1.5 text-caption text-fg-subtle">
                  {b.done && <CheckIcon size={12} strokeWidth={3} className="text-success" aria-hidden />}
                  Batch {b.batch}
                </span>
                <span className="mt-1 block text-label font-semibold text-fg">{b.name}</span>
              </li>
            )}
          </ol>
        </section>

        <div className="mt-6 flex flex-wrap gap-4 text-caption text-fg-muted" aria-label="Legend">
          {(Object.keys(statusLabel) as RoadmapStatus[]).map((s) =>
          <span key={s} className="inline-flex items-center gap-1.5">
              <span aria-hidden className={cn('h-2 w-2 rounded-full', dotTone[s])} />
              {statusLabel[s]}
            </span>
          )}
        </div>

        <div className="mt-12 grid gap-x-12 gap-y-12 lg:grid-cols-2">
          {roadmapItems.map((g) =>
          <section key={g.area} aria-labelledby={`rm-${g.area}`}>
              <h2 id={`rm-${g.area}`} className="font-display text-[22px] font-semibold tracking-[-0.015em] text-fg">
                {g.area}
              </h2>
              <ul className="mt-4 divide-y divide-line border-y border-line">
                {g.items.map((it) =>
              <li key={it.name} className="flex items-start justify-between gap-4 py-4">
                    <div>
                      <p className="text-label font-medium text-fg">{it.name}</p>
                      {it.note && <p className="mt-0.5 text-caption text-fg-subtle">{it.note}</p>}
                    </div>
                    <span className={cn('inline-flex shrink-0 items-center gap-1.5 text-caption font-semibold', statusTone[it.status])}>
                      <span aria-hidden className={cn('h-1.5 w-1.5 rounded-full', dotTone[it.status])} />
                      {statusLabel[it.status]}
                    </span>
                  </li>
              )}
              </ul>
            </section>
          )}
        </div>
      </div>
    </>);

}