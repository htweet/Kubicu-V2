import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { TrendingUpIcon } from 'lucide-react';
import { KbShape } from './KbShape';
import { insightBars, insightSources } from '../../../data/marketingHome';

const ease = [0.23, 1, 0.32, 1] as const;

/** Analytics card: visits grow in, sources fill (D260). Labelled as sample data. */
export function InsightsVisual() {
  const reduce = useReducedMotion();
  return (
    <div className="relative mx-auto max-w-[540px]" aria-hidden>
      <KbShape kind="asterisk" color="rgb(var(--kb-pink))" size={72} motion="spin" className="absolute -right-4 -top-8 z-20" />
      <KbShape kind="arch" color="rgb(var(--kb-lime))" size={80} motion="sway" className="absolute -bottom-8 -left-6 z-0" />

      <div className="relative z-10 rounded-[32px] bg-[rgb(247_243_234)] p-6 text-[rgb(20_20_18)] shadow-3 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[12px] font-semibold text-[rgb(104_100_92)]">Visits · last 30 days</p>
            <p className="kb-display mt-1 text-[44px] leading-none">4,812</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-[rgb(var(--kb-lime))] px-3 py-1 text-[12px] font-bold text-[rgb(var(--kb-forest))]">
            <TrendingUpIcon size={13} /> +18%
          </span>
        </div>
        <div className="mt-6 flex h-36 items-end gap-1.5 sm:gap-2">
          {insightBars.map((h, i) =>
          <motion.span
            key={i}
            className="flex-1 origin-bottom rounded-t-lg"
            style={{ height: `${h}%`, backgroundColor: i === insightBars.length - 1 ? 'rgb(var(--kb-forest))' : 'rgb(var(--kb-cobalt) / 0.75)' }}
            initial={reduce ? false : { scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.15 + i * 0.04, ease }} />

          )}
        </div>
        <ul className="mt-6 flex flex-col gap-3 border-t border-[rgb(224_217_202)] pt-5">
          {insightSources.map((s, i) =>
          <li key={s.name} className="grid grid-cols-[88px_minmax(0,1fr)_40px] items-center gap-3 text-[13px] font-semibold">
              <span>{s.name}</span>
              <span className="h-2.5 overflow-hidden rounded-full bg-[rgb(238_233_221)]">
                <motion.span
                className="block h-full origin-left rounded-full bg-[rgb(var(--kb-forest))]"
                style={{ width: `${s.share}%` }}
                initial={reduce ? false : { scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.6 + i * 0.05, ease }} />
              
              </span>
              <span className="text-right text-[rgb(70_68_62)]">{s.share}%</span>
            </li>
          )}
        </ul>
        <p className="mt-5 text-[11px] text-[rgb(104_100_92)]">Sample data from a fictional page</p>
      </div>
    </div>);

}