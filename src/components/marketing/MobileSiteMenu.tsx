import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRightIcon, ChevronDownIcon } from 'lucide-react';
import { siteMenu, siteMenuLinks } from '../../data/siteMenu';
import { featureTone, isCurrentLink } from './MegaMenu';
import { cn } from '../../utils/cn';
import { recordMenuLink, recordMenuOpen } from '../../utils/siteMenuUsage';

/** Phone and tablet menu (D268): each group is an accordion of the same items as the desktop panel. */
export function MobileSiteMenu() {
  const [open, setOpen] = useState<string | null>(null);
  const reduce = useReducedMotion();
  const { pathname } = useLocation();

  return (
    <div className="flex flex-col">
      <ul className="flex flex-col">
        {siteMenu.map((g) => {
          const isOpen = open === g.id;
          const tone = featureTone[g.feature.tone];
          return (
            <li key={g.id} className="border-b border-[rgb(238_233_221)] last:border-b-0">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`m-menu-${g.id}`}
                onClick={() => {
                  if (!isOpen) recordMenuOpen(g.id, 'mobile');
                  setOpen(isOpen ? null : g.id);
                }}
                className="flex h-14 w-full items-center justify-between rounded-2xl px-4 text-left text-[18px] font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                
                {g.label}
                <ChevronDownIcon size={20} aria-hidden className={cn('text-[rgb(104_100_92)] transition-transform duration-200 ease-out', isOpen && 'rotate-180')} />
              </button>
              <AnimatePresence initial={false}>
                {isOpen &&
                <motion.div
                  id={`m-menu-${g.id}`}
                  initial={reduce ? false : { height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                  className="overflow-hidden">
                  
                    <div className="flex flex-col gap-4 px-1 pb-4">
                      {g.columns.map((c) =>
                    <div key={c.heading}>
                          <h3 className="px-3 text-[12px] font-bold uppercase tracking-[0.08em] text-[rgb(104_100_92)]">{c.heading}</h3>
                          <ul className="mt-1">
                            {c.items.map((i) =>
                        <li key={i.to + i.title}>
                                <Link
                            to={i.to}
                            onClick={() => recordMenuLink(i.to, i.title, 'mobile')}
                            aria-current={isCurrentLink(i.to, pathname) ? 'page' : undefined}
                            className="flex min-h-[56px] items-center gap-3 rounded-2xl px-3 py-2 hover:bg-[rgb(246_243_236)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                            
                                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgb(238_233_221)]">
                                    <i.icon size={19} strokeWidth={2.1} aria-hidden />
                                  </span>
                                  <span className="min-w-0">
                                    <span className="block text-[15px] font-bold leading-tight">{i.title}</span>
                                    <span className="block text-[13px] leading-snug text-[rgb(90_86_78)]">{i.description}</span>
                                  </span>
                                </Link>
                              </li>
                        )}
                          </ul>
                        </div>
                    )}
                      <Link
                      to={g.feature.cta.to}
                      onClick={() => recordMenuLink(g.feature.cta.to, g.feature.cta.label, 'mobile')}
                      style={{ backgroundColor: tone.bg, color: tone.fg }}
                      className="flex items-center justify-between gap-3 rounded-2xl px-4 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                      
                        <span>
                          <span className="block text-[15px] font-extrabold">{g.feature.title}</span>
                          <span className="block text-[13px] font-medium opacity-90">{g.feature.cta.label}</span>
                        </span>
                        <ArrowRightIcon size={18} aria-hidden className="shrink-0" />
                      </Link>
                    </div>
                  </motion.div>
                }
              </AnimatePresence>
            </li>);

        })}
        {siteMenuLinks.map((l) =>
        <li key={l.to}>
            <Link to={l.to} onClick={() => recordMenuLink(l.to, l.label, 'mobile')} className="flex h-14 items-center justify-between rounded-2xl px-4 text-[18px] font-bold hover:bg-[rgb(238_233_221)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
              {l.label}
              <ArrowRightIcon size={18} aria-hidden className="text-[rgb(104_100_92)]" />
            </Link>
          </li>
        )}
      </ul>
    </div>);

}