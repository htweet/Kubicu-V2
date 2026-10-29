import React from 'react';
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatNgn } from '../../../utils/format';

interface Point {
  label: string;
  value: number;
  previous?: number;
}

const short = (n: number) => n >= 1_000_000 ? `₦${(n / 1_000_000).toFixed(1)}m` : n >= 1000 ? `₦${Math.round(n / 1000)}k` : `₦${n}`;

/** Money received over time, previous period dashed (D227). */
export function IncomeChart({ data, compare, summary }: {data: Point[];compare: boolean;summary: string;}) {
  return (
    <figure className="flex flex-col gap-2">
      <div className="h-64 w-full" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="rgb(var(--border-subtle))" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={18} tick={{ fill: 'rgb(var(--text-muted))', fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} width={52} tickFormatter={short} tick={{ fill: 'rgb(var(--text-muted))', fontSize: 12 }} />
            <Tooltip
              cursor={{ stroke: 'rgb(var(--border-strong))' }}
              formatter={(v: number, name: string) => [formatNgn(v), name === 'previous' ? 'Previous period' : 'This period']}
              contentStyle={{ background: 'rgb(var(--overlay))', border: '1px solid rgb(var(--border-subtle))', borderRadius: 8, color: 'rgb(var(--text-primary))', fontSize: 12 }} />
            
            <Area type="monotone" dataKey="value" stroke="rgb(var(--action))" strokeWidth={2} fill="rgb(var(--action))" fillOpacity={0.12} isAnimationActive={false} />
            {compare && <Line type="monotone" dataKey="previous" stroke="rgb(var(--text-subtle))" strokeWidth={1.5} strokeDasharray="4 4" dot={false} isAnimationActive={false} />}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="text-caption text-fg-muted">{summary}</figcaption>
    </figure>);

}