import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRightIcon } from 'lucide-react';
import { creatorTypes } from '../../../data/creatorsPage';
import { findExampleById } from '../../../data/examples';
import { ExamplePhone } from '../ExamplePhone';
import { cn } from '../../../utils/cn';

/** Creator types as tabs; each shows the real template it maps to and what that page leads with (D273). */
export function CreatorTypePicker() {
  const [active, setActive] = useState(creatorTypes[0].id);
  const reduce = useReducedMotion();
  const tabs = useRef<Record<string, HTMLButtonElement | null>>({});
  const type = creatorTypes.find((t) => t.id === active) ?? creatorTypes[0];
  const example = findExampleById(type.example);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const step = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = creatorTypes[(i + step + creatorTypes.length) % creatorTypes.length];
    setActive(next.id);
    tabs.current[next.id]?.focus();
  };

  return (
    <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
      <div role="tablist" aria-label="Kind of creator" aria-orientation="vertical" className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-0 lg:overflow-visible lg:pb-0">
        {creatorTypes.map((t, i) => {
          const on = t.id === active;
          return (
            <button
              key={t.id}
              ref={(el) => tabs.current[t.id] = el}
              type="button"
              role="tab"
              id={`ct-tab-${t.id}`}
              aria-selected={on}
              aria-controls="ct-panel"
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(t.id)}
              onKeyDown={(e) => onKey(e, i)}
              className={cn(
                'shrink-0 whitespace-nowrap rounded-full px-4 py-2.5 text-[15px] font-bold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                'lg:flex lg:items-center lg:justify-between lg:rounded-none lg:border-b lg:border-line lg:px-0 lg:py-5 lg:text-[clamp(22px,2.2vw,30px)] lg:font-extrabold lg:tracking-[-0.02em]',
                on ? 'bg-[rgb(20_20_18)] text-white lg:bg-transparent lg:text-fg' : 'bg-[rgb(238_233_221)] text-[rgb(70_68_62)] hover:text-fg lg:bg-transparent lg:text-fg-subtle'
              )}>
              
              {t.label}
              <ArrowRightIcon size={22} aria-hidden className={cn('hidden transition-[opacity,transform] duration-200 ease-out lg:block', on ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0')} />
            </button>);

        })}
      </div>

      <div id="ct-panel" role="tabpanel" aria-labelledby={`ct-tab-${type.id}`} className="rounded-[32px] bg-[rgb(246_243_236)] p-6 md:p-10">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={type.id}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="grid items-center gap-8 sm:grid-cols-[auto_minmax(0,1fr)]">
            
            {example && <ExamplePhone doc={example.doc} width={210} className="mx-auto" />}
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-fg-subtle">The page leads with</p>
              <p className="mt-2 text-[20px] font-bold leading-snug text-fg md:text-[22px]">{type.leads}</p>
              <ol className="mt-6 flex flex-col">
                {type.blocks.map((b, i) =>
                <li key={b} className="flex items-baseline gap-3 border-t border-[rgb(226_220_206)] py-2.5 text-[15px] text-fg last:border-b">
                    <span className="w-5 shrink-0 tabular-nums text-fg-subtle">{i + 1}</span>
                    {b}
                  </li>
                )}
              </ol>
              {example &&
              <Link
                to={`/templates/${example.id}`}
                className="mt-6 inline-flex h-11 items-center gap-1.5 rounded-full bg-[rgb(20_20_18)] px-5 text-[14px] font-bold text-white transition-transform duration-150 ease-out hover:scale-[1.03] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2">
                
                  See {example.name} <ArrowRightIcon size={15} aria-hidden />
                </Link>
              }
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>);

}