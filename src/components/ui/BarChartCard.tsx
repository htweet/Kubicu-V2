import React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BarChart3Icon, AlertTriangleIcon } from 'lucide-react';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';
import { Button } from './Button';

export interface ChartPoint {
  label: string;
  value: number;
}

interface BarChartCardProps {
  title: string;
  /** Period and unit, e.g. "Last 7 days · taps". Always shown. */
  context: string;
  data: ChartPoint[];
  /** Plain-language summary read by screen readers and shown under the chart. */
  summary: string;
  unit: string;
  state?: 'ready' | 'loading' | 'empty' | 'error';
  onRetry?: () => void;
  footnote?: React.ReactNode;
}

/** A chart that answers one question, labels its period and units, and has a text alternative. */
export function BarChartCard({ title, context, data, summary, unit, state = 'ready', onRetry, footnote }: BarChartCardProps) {
  return (
    <figure className="flex flex-col gap-3 rounded-md border border-line bg-raised p-4" aria-label={title}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="text-label font-semibold text-fg">{title}</h4>
        <span className="text-caption text-fg-subtle">{context}</span>
      </div>
      <div className="h-48">
        {state === 'loading' && <Skeleton className="h-full w-full" />}
        {state === 'empty' && <EmptyState icon={BarChart3Icon} title="No data for this period" description="Share your page to start seeing activity." />}
        {state === 'error' && (
          <EmptyState
            icon={AlertTriangleIcon}
            title="Couldn’t load this chart"
            description="Your data is safe. Try again in a moment."
            action={onRetry ? <Button size="sm" variant="secondary" onClick={onRetry}>Try again</Button> : undefined}
          />
        )}
        {state === 'ready' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -16 }} aria-hidden>
              <CartesianGrid vertical={false} stroke="rgb(var(--border-subtle))" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: 'rgb(var(--text-muted))', fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fill: 'rgb(var(--text-muted))', fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: 'rgb(var(--sunken))' }}
                formatter={(v: number) => [`${v} ${unit}`, '']}
                separator=""
                contentStyle={{
                  background: 'rgb(var(--overlay))',
                  border: '1px solid rgb(var(--border-subtle))',
                  borderRadius: 8,
                  color: 'rgb(var(--text-primary))',
                  fontSize: 12,
                }}
              />
              <Bar dataKey="value" fill="rgb(var(--action))" radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      {state === 'ready' && <figcaption className="text-caption text-fg-muted">{summary}</figcaption>}
      {footnote}
    </figure>
  );
}
