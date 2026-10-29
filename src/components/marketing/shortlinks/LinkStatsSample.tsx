import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const days = [14, 22, 18, 31, 27, 19, 24, 38, 52, 41, 29, 33, 36, 28];
const devices = [
{ label: 'Phone', pct: 88 },
{ label: 'Computer', pct: 9 },
{ label: 'Tablet', pct: 3 }];

const regions = [
{ label: 'Lagos', pct: 64 },
{ label: 'Abuja', pct: 14 },
{ label: 'Elsewhere', pct: 22 }];


/** Illustrative per-link stats for the Short Links page (D268). Labelled as sample everywhere it shows. */
export function LinkStatsSample() {
  const reduce = useReducedMotion();
  const max = Math.max(...days);
  return (
    <figure className="rounded-[28px] bg-white p-5 text-[rgb(20_20_18)] shadow-3 md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[13px] font-semibold">kub.icu/bisikitchen/s/jollof-tt</p>
        <span className="rounded-full bg-[rgb(238_233_221)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em]">Sample data</span>
      </div>

      <div className="mt-5 grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-4">
        <div>
          <p className="text-[13px] font-semibold text-[rgb(90_86_78)]">Clicks · last 14 days</p>
          <p className="kb-display mt-1 text-[48px] leading-none">412</p>
        </div>
        <dl className="grid gap-2 text-[13px]">
          <div className="flex justify-between gap-2">
            <dt className="text-[rgb(90_86_78)]">Visitors (estimate)</dt>
            <dd className="font-bold tabular-nums">~318</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-[rgb(90_86_78)]">Orders that followed</dt>
            <dd className="font-bold tabular-nums">19</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-[rgb(90_86_78)]">Bots filtered out</dt>
            <dd className="font-bold tabular-nums">27</dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 flex h-28 items-end gap-1.5" aria-hidden>
        {days.map((d, i) =>
        <motion.div
          key={i}
          className="flex-1 origin-bottom rounded-t-md bg-[rgb(var(--kb-forest))]"
          style={{ height: `${d / max * 100}%` }}
          initial={reduce ? false : { scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: i * 0.03, ease: [0.23, 1, 0.32, 1] }} />

        )}
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {[
        { title: 'Device', rows: devices },
        { title: 'Rough region', rows: regions }].
        map((g) =>
        <div key={g.title}>
            <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[rgb(104_100_92)]">{g.title}</p>
            <ul className="mt-2 flex flex-col gap-2">
              {g.rows.map((r) =>
            <li key={r.label} className="text-[13px]">
                  <span className="flex justify-between">
                    <span>{r.label}</span>
                    <span className="font-bold tabular-nums">{r.pct}%</span>
                  </span>
                  <span className="mt-1 block h-1.5 rounded-full bg-[rgb(238_233_221)]">
                    <span className="block h-full rounded-full bg-[rgb(var(--kb-cobalt))]" style={{ width: `${r.pct}%` }} />
                  </span>
                </li>
            )}
            </ul>
          </div>
        )}
      </div>
      <figcaption className="mt-5 text-[12px] text-[rgb(104_100_92)]">Fictional figures for a fictional business. Your own numbers appear in Analytics once people use your links.</figcaption>
    </figure>);

}