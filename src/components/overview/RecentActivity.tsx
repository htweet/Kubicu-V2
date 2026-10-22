import React from 'react';
import { BarChart3Icon, HistoryIcon, SendIcon, CameraIcon } from 'lucide-react';
import { useEditor } from '../../contexts/EditorContext';
import { formatRelative } from '../../utils/format';
import { PlanLock } from '../ui/PlanLock';

/** Real publishing history, plus an honest slot where analytics will go. */
export function RecentActivity() {
  const { state } = useEditor();
  const recent = state.versions.slice(0, 4);

  return (
    <div className="grid gap-10 md:grid-cols-2 md:gap-12">
      <section aria-labelledby="history-heading">
        <h2 id="history-heading" className="flex items-center gap-2 text-heading font-semibold text-fg">
          <HistoryIcon size={18} strokeWidth={2.25} className="text-fg-subtle" aria-hidden />
          Recent changes
        </h2>
        {recent.length === 0 ?
        <p className="mt-4 text-label text-fg-muted">Nothing published yet. Each publish and saved snapshot will appear here.</p> :

        <ol className="relative mt-5 flex flex-col gap-5 pl-7">
            <span aria-hidden className="absolute bottom-2 left-[9px] top-2 w-px bg-line" />
            {recent.map((v) => {
            const Icon = v.kind === 'published' ? SendIcon : CameraIcon;
            return (
              <li key={v.id} className="relative">
                  <span
                  aria-hidden
                  className={
                  v.kind === 'published' ?
                  'absolute -left-7 top-0 flex h-[19px] w-[19px] items-center justify-center rounded-full bg-success-soft text-success' :
                  'absolute -left-7 top-0 flex h-[19px] w-[19px] items-center justify-center rounded-full bg-sunken text-fg-subtle'
                  }>
                  
                    <Icon size={10} strokeWidth={2.5} />
                  </span>
                  <p className="text-label font-semibold text-fg">
                    {v.kind === 'published' ? `Published ${v.label}` : v.label}
                  </p>
                  <p className="mt-0.5 text-caption text-fg-subtle">
                    {formatRelative(v.createdAt)}
                    {v.note ? ` · ${v.note}` : ''}
                  </p>
                </li>);

          })}
          </ol>
        }
      </section>

      <section aria-labelledby="visits-heading">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="visits-heading" className="flex items-center gap-2 text-heading font-semibold text-fg">
            <BarChart3Icon size={18} strokeWidth={2.25} className="text-fg-subtle" aria-hidden />
            Visitor activity
          </h2>
          <PlanLock kind="planned">Analytics · Batch 5</PlanLock>
        </div>
        <div className="mt-5 flex h-36 flex-col justify-end rounded-md border border-dashed border-line-strong px-4 pb-3">
          <p className="mb-auto pt-4 text-label text-fg-muted">No numbers yet — we won’t show invented ones.</p>
          <div aria-hidden className="flex items-end justify-between border-t border-line pt-2 text-meta text-fg-subtle">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>
        <p className="mt-3 text-caption text-fg-subtle">Views, taps on each block and where visitors came from will appear here.</p>
      </section>
    </div>);

}