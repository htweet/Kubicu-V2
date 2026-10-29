import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { SearchIcon } from 'lucide-react';

const contacts = [
{ name: 'Amaka Eze', source: 'Newsletter · Instagram link', consent: 'Subscribed', tags: ['regular'] },
{ name: 'Tunde Bello', source: 'Booking · WhatsApp link', consent: 'Updates only', tags: ['braids'] },
{ name: 'Zainab Musa', source: 'Order · Stall QR', consent: 'Subscribed', tags: ['wholesale', 'abuja'] },
{ name: 'Kelechi Obi', source: 'Enquiry form', consent: 'Updates only', tags: [] }];


const ease = [0.23, 1, 0.32, 1] as const;

/** Hero visual for the Audience Manager page (D268): a believable contacts view, labelled as sample. */
export function AudienceDashboardSample() {
  const reduce = useReducedMotion();
  return (
    <figure className="relative mx-auto w-full max-w-[560px]">
      <div className="rounded-[28px] bg-white p-4 text-[rgb(20_20_18)] shadow-3 md:p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[16px] font-extrabold">Audience</p>
          <span className="rounded-full bg-[rgb(238_233_221)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em]">Sample data</span>
        </div>
        <div className="mt-3 flex h-10 items-center gap-2 rounded-full bg-[rgb(246_243_236)] px-3 text-[13px] text-[rgb(104_100_92)]">
          <SearchIcon size={14} aria-hidden /> Search name, phone or tag
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5 text-[12px] font-semibold">
          {['Subscribed', 'From Instagram', 'Tag: regular'].map((f, i) =>
          <span key={f} className={i === 0 ? 'rounded-full bg-[rgb(20_20_18)] px-2.5 py-1 text-white' : 'rounded-full bg-[rgb(238_233_221)] px-2.5 py-1'}>
              {f}
            </span>
          )}
        </div>
        <ul className="mt-3 flex flex-col">
          {contacts.map((c, i) =>
          <motion.li
            key={c.name}
            className="grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3 border-t border-[rgb(238_233_221)] py-3"
            initial={reduce ? false : { opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.26, delay: 0.3 + i * 0.05, ease }}>
            
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgb(var(--kb-peach))] text-[12px] font-extrabold text-[rgb(var(--kb-clay))]">
                {c.name.
              split(' ').
              map((p) => p[0]).
              join('')}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-bold">{c.name}</span>
                <span className="block truncate text-[12px] text-[rgb(90_86_78)]">{c.source}</span>
              </span>
              <span className={c.consent === 'Subscribed' ? 'rounded-full bg-[rgb(var(--kb-lime))] px-2 py-0.5 text-[11px] font-bold text-[rgb(var(--kb-forest))]' : 'rounded-full bg-[rgb(238_233_221)] px-2 py-0.5 text-[11px] font-bold'}>
                {c.consent}
              </span>
            </motion.li>
          )}
        </ul>
      </div>
      <motion.div
        className="absolute -bottom-6 -left-3 z-10 w-[230px] rounded-[20px] bg-[rgb(var(--kb-clay))] p-4 text-white shadow-3 sm:-left-8"
        initial={reduce ? false : { opacity: 0, y: 12, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.28, delay: 0.6, ease }}>
        
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] opacity-80">Where they came from · 30 days</p>
        <ul className="mt-2 flex flex-col gap-1.5 text-[13px]">
          {[
          ['Instagram link', 42],
          ['Stall QR', 27],
          ['WhatsApp link', 19]].
          map(([l, n]) =>
          <li key={l as string} className="flex justify-between">
              <span>{l}</span>
              <span className="font-bold tabular-nums">{n}</span>
            </li>
          )}
        </ul>
      </motion.div>
      <figcaption className="sr-only">Sample contacts list with sources, consent and tags. People and figures are fictional.</figcaption>
    </figure>);

}