import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, BarChart3Icon, HistoryIcon, SendIcon, CameraIcon } from 'lucide-react';
import { useEditor } from '../../contexts/EditorContext';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useCan } from '../../contexts/TeamContext';
import { hasSample, headline, inRange, rangeFor, sources, topLinks, visitsByDay } from '../../utils/analytics/aggregate';
import { sourceLabels } from '../../utils/analytics/track';
import { formatRelative } from '../../utils/format';
import { useT } from '../../contexts/LocaleContext';

/** Real publishing history, plus an honest slot where analytics will go. */
export function RecentActivity() {
  const { t: tr } = useT();
  const { state } = useEditor();
  const recent = state.versions.slice(0, 4);
  const { data } = useAnalytics();
  const canSee = useCan('analytics.view').allowed;
  const r = rangeFor(7);
  const events = inRange(data.events, r.current);
  const week = headline(events);
  const topSource = sources(events)[0];
  const topLink = topLinks(events, week.visits)[0];
  const days = visitsByDay(events, r.current);
  const maxDay = Math.max(1, ...days.map((d) => d.value));
  const sample = hasSample(events);

  return (
    <div className="grid gap-10 md:grid-cols-2 md:gap-12">
      <section aria-labelledby="history-heading">
        <h2 id="history-heading" className="flex items-center gap-2 text-heading font-semibold text-fg">
          <HistoryIcon size={18} strokeWidth={2.25} className="text-fg-subtle" aria-hidden />
          {tr('Recent changes')}
        </h2>
        {recent.length === 0 ?
        <p className="mt-4 text-label text-fg-muted">{tr('Nothing published yet. Each publish and saved snapshot will appear here.')}</p> :

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
                    {v.kind === 'published' ? tr('Published {label}', { label: v.label }) : v.label}
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
            {tr('Visitor activity')}
          </h2>
          {canSee &&
          <Link to="/app/analytics" className="inline-flex items-center gap-1 text-caption font-medium text-fg-muted hover:text-fg">
              {tr('Analytics')} <ArrowRightIcon size={13} aria-hidden />
            </Link>
          }
        </div>
        {!canSee ?
        <p className="mt-4 text-label text-fg-muted">{tr('Your role can’t see analytics.')}</p> :
        week.visits === 0 ?
        <div className="mt-5 rounded-md border border-dashed border-line-strong px-4 py-5">
            <p className="text-label text-fg-muted">{tr('No visits in the last 7 days yet.')}</p>
            <p className="mt-1 text-caption text-fg-subtle">{tr('Share your link — visits, taps and where people came from appear here as they happen.')}</p>
          </div> :

        <>
            <dl className="mt-5 grid grid-cols-3 gap-4">
              <div>
                <dt className="text-caption text-fg-subtle">{tr('Visits · 7 days')}</dt>
                <dd className="text-title font-semibold tabular-nums text-fg">{week.visits.toLocaleString()}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-caption text-fg-subtle">{tr('Top source')}</dt>
                <dd className="truncate text-label font-semibold text-fg">{topSource ? `${tr(sourceLabels[topSource.id])} · ${Math.round(topSource.share * 100)}%` : '—'}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-caption text-fg-subtle">{tr('Top link')}</dt>
                <dd className="truncate text-label font-semibold text-fg">{topLink ? topLink.label : '—'}</dd>
              </div>
            </dl>
            <div aria-hidden className="mt-4 flex h-16 items-end gap-1">
              {days.map((d) =>
            <span key={d.key} className="flex-1 rounded-t-sm bg-action/70" style={{ height: `${Math.max(4, d.value / maxDay * 100)}%` }} title={`${d.label}: ${d.value}`} />
            )}
            </div>
            <p className="mt-2 text-caption text-fg-subtle">
              {tr('Visits per day, last 7 days')}
              {sample ? ` · ${tr('includes sample visits')}` : ''}
            </p>
          </>
        }
      </section>
    </div>);

}