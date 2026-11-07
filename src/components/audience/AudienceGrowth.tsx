import React, { useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Contact } from '../../types/ops';
import { Segmented } from '../ui/Segmented';
import { Stat, StatGroup } from '../ui/layout/Stat';
import { useT } from '../../contexts/LocaleContext';

type Range = '30' | '90' | '365';
const DAY = 86_400_000;

interface AudienceGrowthProps {
  contacts: Contact[];
  subscribed: number;
  openTasks: number;
  /** Shown beside the headline (e.g. duplicates to review). */
  action?: React.ReactNode;
}

/**
 * Audience overview (D272): total contacts leads, with growth over the chosen period and the previous one for
 * comparison. Counted from each contact's added date, so deleted contacts aren't in the history.
 */
export function AudienceGrowth({ contacts, subscribed, openTasks, action }: AudienceGrowthProps) {
  const { t: tr } = useT();
  const [range, setRange] = useState<Range>('30');
  const days = Number(range);

  const { points, added, previous, newSubscribed } = useMemo(() => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    const end = now.getTime();
    const start = end - days * DAY;
    const times = contacts.map((c) => Date.parse(c.createdAt)).filter((n) => !Number.isNaN(n)).sort((a, b) => a - b);
    let i = 0;
    let running = 0;
    const pts: { label: string; total: number }[] = [];
    // Weekly points for a year, daily otherwise — keeps the line readable.
    const step = days > 90 ? 7 : 1;
    for (let d = days - 1; d >= 0; d -= step) {
      const dayEnd = end - d * DAY;
      while (i < times.length && times[i] <= dayEnd) {
        running += 1;
        i += 1;
      }
      pts.push({ label: new Date(dayEnd).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }), total: running });
    }
    const inRange = (t: number, from: number, to: number) => t > from && t <= to;
    return {
      points: pts,
      added: times.filter((t) => inRange(t, start, end)).length,
      previous: times.filter((t) => inRange(t, start - days * DAY, start)).length,
      newSubscribed: contacts.filter((c) => c.consent === 'subscribed' && inRange(Date.parse(c.createdAt), start, end)).length,
    };
  }, [contacts, days]);

  const change = previous === 0 ? null : Math.round(((added - previous) / previous) * 100);
  const periodLabel = range === '365' ? tr('the last 12 months') : tr('the last {n} days', { n: days });
  const summary =
    added === 0
      ? tr('No new contacts in {p}.', { p: periodLabel })
      : tr('{n} new in {p}', { n: added, p: periodLabel }) + (change === null ? (previous === 0 ? ` · ${tr('none in the period before')}` : '') : ` · ${change >= 0 ? '+' : ''}${change}% ${tr('vs the period before')}`);

  return (
    <section aria-labelledby="aud-growth" className="mt-8 border-b border-line pb-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 id="aud-growth" className="text-caption text-fg-subtle">
            {tr('Contacts')}
          </h2>
          <p className="mt-1 text-[2.5rem] font-semibold leading-none tracking-[-0.02em] tabular-nums text-fg">{contacts.length.toLocaleString()}</p>
          <p className="mt-2 text-label text-fg-muted">{summary}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {action}
          <Segmented<Range>
            ariaLabel="Growth period"
            value={range}
            onChange={setRange}
            options={[
              { value: '30', label: '30 days' },
              { value: '90', label: '90 days' },
              { value: '365', label: '12 months' },
            ]}
          />
        </div>
      </div>

      <figure className="mt-4">
        <div className="h-40 w-full" aria-hidden>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 6, right: 6, bottom: 0, left: -18 }}>
              <CartesianGrid vertical={false} stroke="rgb(var(--border-subtle))" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={24} tick={{ fill: 'rgb(var(--text-muted))', fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fill: 'rgb(var(--text-muted))', fontSize: 12 }} />
              <Tooltip
                cursor={{ stroke: 'rgb(var(--border-strong))' }}
                formatter={(v: number) => [`${v} contacts`, 'Total']}
                contentStyle={{ background: 'rgb(var(--overlay))', border: '1px solid rgb(var(--border-subtle))', borderRadius: 8, color: 'rgb(var(--text-primary))', fontSize: 12 }}
              />
              <Area type="monotone" dataKey="total" stroke="rgb(var(--action))" strokeWidth={2} fill="rgb(var(--action))" fillOpacity={0.12} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <figcaption className="sr-only">
          {tr('Total contacts over {p}: from {a} to {b}.', { p: periodLabel, a: points[0]?.total ?? 0, b: points[points.length - 1]?.total ?? 0 })}
        </figcaption>
      </figure>

      <StatGroup columns={3} divided className="mt-4">
        <Stat label="New subscribers" value={newSubscribed} hint={periodLabel} />
        <Stat label="Can receive marketing" value={subscribed} hint={contacts.length ? tr('{n}% of contacts', { n: Math.round((subscribed / contacts.length) * 100) }) : undefined} />
        <Stat label="Open follow-ups" value={openTasks} />
      </StatGroup>
    </section>
  );
}
