import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRightIcon, ChevronDownIcon } from 'lucide-react';
import { siteMenu, siteMenuLinks, type SiteMenuFeature, type SiteMenuGroup } from '../../data/siteMenu';
import { cn } from '../../utils/cn';

const ink = 'text-[rgb(20_20_18)]';
const trigger =
'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3.5 py-2 text-[15px] font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus';

export const featureTone: Record<SiteMenuFeature['tone'], {bg: string;fg: string;btnBg: string;btnFg: string;}> = {
  lime: { bg: 'rgb(var(--kb-lime))', fg: 'rgb(var(--kb-forest))', btnBg: 'rgb(var(--kb-forest))', btnFg: 'rgb(var(--kb-lime))' },
  cobalt: { bg: 'rgb(var(--kb-cobalt))', fg: '#ffffff', btnBg: '#ffffff', btnFg: 'rgb(var(--kb-cobalt))' },
  pink: { bg: 'rgb(var(--kb-pink))', fg: 'rgb(var(--kb-plum))', btnBg: 'rgb(var(--kb-plum))', btnFg: '#ffffff' },
  peach: { bg: 'rgb(var(--kb-peach))', fg: 'rgb(var(--kb-clay))', btnBg: 'rgb(var(--kb-clay))', btnFg: '#ffffff' }
};

/** True when a menu link points at the page being viewed (hash links match their page). */
export function isCurrentLink(to: string, pathname: string): boolean {
  const path = to.split(/[?#]/)[0];
  return path !== '/' && pathname === path;
}

/**
 * Public-site mega menu (D268). Opens on hover (mouse only), click, or keyboard; Escape closes and
 * returns focus to its trigger. A hidden bridge under the triggers stops flicker on the way down.
 */
export function MegaMenu() {
  const [openId, setOpenId] = useState<string | null>(null);
  const location = useLocation();
  const root = useRef<HTMLDivElement>(null);
  const triggers = useRef<Record<string, HTMLButtonElement | null>>({});
  const closeTimer = useRef<number>();
  const openTimer = useRef<number>();

  const clearTimers = () => {
    window.clearTimeout(closeTimer.current);
    window.clearTimeout(openTimer.current);
  };
  const close = useCallback((refocus?: string) => {
    clearTimers();
    setOpenId(null);
    if (refocus) triggers.current[refocus]?.focus();
  }, []);

  useEffect(() => close(), [location.pathname, location.hash, close]);

  useEffect(() => {
    if (!openId) return;
    const onDown = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(openId);
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [openId, close]);

  useEffect(() => clearTimers, []);

  const hoverOpen = (id: string, e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    clearTimers();
    if (openId) setOpenId(id);else
    openTimer.current = window.setTimeout(() => setOpenId(id), 70);
  };
  const hoverClose = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    clearTimers();
    closeTimer.current = window.setTimeout(() => setOpenId(null), 160);
  };

  const focusFirst = (id: string) => {
    window.requestAnimationFrame(() => {
      const first = document.querySelector<HTMLAnchorElement>(`#mega-${id} a`);
      first?.focus();
    });
  };

  const groupActive = (g: SiteMenuGroup) => g.columns.some((c) => c.items.some((i) => isCurrentLink(i.to, location.pathname)));
  const open = siteMenu.find((g) => g.id === openId) ?? null;

  return (
    <div
      ref={root}
      className="hidden lg:block"
      onPointerLeave={hoverClose}
      onPointerEnter={() => window.clearTimeout(closeTimer.current)}
      onBlur={(e) => {
        if (openId && root.current && !root.current.contains(e.relatedTarget as Node | null)) close();
      }}>
      
      <nav aria-label="Main" className="flex items-center gap-0.5">
        {siteMenu.map((g) => {
          const isOpen = openId === g.id;
          return (
            <button
              key={g.id}
              ref={(el) => triggers.current[g.id] = el}
              type="button"
              aria-expanded={isOpen}
              aria-controls={`mega-${g.id}`}
              onPointerEnter={(e) => hoverOpen(g.id, e)}
              onClick={() => setOpenId((o) => o === g.id ? null : g.id)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setOpenId(g.id);
                  focusFirst(g.id);
                }
              }}
              className={cn(
                trigger,
                isOpen || groupActive(g) ? `bg-[rgb(238_233_221)] ${ink}` : 'text-[rgb(70_68_62)] hover:bg-[rgb(238_233_221)] hover:text-[rgb(20_20_18)]'
              )}>
              
              {g.label}
              <ChevronDownIcon size={15} aria-hidden className={cn('transition-transform duration-200 ease-out', isOpen && 'rotate-180')} />
            </button>);

        })}
        {siteMenuLinks.map((l) =>
        <NavLink
          key={l.to}
          to={l.to}
          onPointerEnter={(e) => e.pointerType === 'mouse' && openId && close()}
          className={({ isActive }) =>
          cn(trigger, isActive ? `bg-[rgb(238_233_221)] ${ink}` : 'text-[rgb(70_68_62)] hover:bg-[rgb(238_233_221)] hover:text-[rgb(20_20_18)]')
          }>
          
            {l.label}
          </NavLink>
        )}
      </nav>

      <AnimatePresence>{open && <MegaPanel key={open.id} group={open} pathname={location.pathname} onNavigate={() => close()} />}</AnimatePresence>
    </div>);

}

function MegaPanel({ group, pathname, onNavigate }: {group: SiteMenuGroup;pathname: string;onNavigate: () => void;}) {
  const reduce = useReducedMotion();
  const tone = featureTone[group.feature.tone];
  const cols = group.columns.length;
  return (
    // pt-2 is the invisible bridge between the header pill and the panel.
    <motion.div
      id={`mega-${group.id}`}
      initial={reduce ? false : { opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
      transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
      className="absolute inset-x-0 top-full z-40 pt-2">
      
      <div className={cn('grid max-h-[calc(100vh-120px)] overflow-y-auto rounded-[28px] bg-white p-3 shadow-3 ring-1 ring-black/5', ink, 'grid-cols-[minmax(0,1fr)_300px]')}>
        <div className="flex flex-col p-4 pr-6">
          <div className={cn('grid gap-x-6 gap-y-6', cols === 3 ? 'grid-cols-3' : 'grid-cols-2')}>
            {group.columns.map((c) =>
            <div key={c.heading}>
                <h3 className="px-3 text-[12px] font-bold uppercase tracking-[0.08em] text-[rgb(104_100_92)]">{c.heading}</h3>
                <ul className="mt-2 flex flex-col gap-0.5">
                  {c.items.map((i) => {
                  const current = isCurrentLink(i.to, pathname);
                  return (
                    <li key={i.to + i.title}>
                        <Link
                        to={i.to}
                        onClick={onNavigate}
                        aria-current={current ? 'page' : undefined}
                        className={cn(
                          'group flex items-start gap-3 rounded-2xl p-3 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                          current ? 'bg-[rgb(238_233_221)]' : 'hover:bg-[rgb(246_243_236)]'
                        )}>
                        
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgb(238_233_221)] text-[rgb(20_20_18)] transition-colors duration-150 group-hover:bg-[rgb(var(--kb-lime))] group-hover:text-[rgb(var(--kb-forest))]">
                            <i.icon size={19} strokeWidth={2.1} aria-hidden />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-[15px] font-bold leading-tight">{i.title}</span>
                            <span className="mt-0.5 block text-[13px] leading-snug text-[rgb(90_86_78)]">{i.description}</span>
                          </span>
                        </Link>
                      </li>);

                })}
                </ul>
              </div>
            )}
          </div>
          {group.viewAll &&
          <Link
            to={group.viewAll.to}
            onClick={onNavigate}
            className="group mt-4 inline-flex items-center gap-1.5 self-start rounded-full px-3 py-2 text-[14px] font-bold hover:bg-[rgb(246_243_236)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
            
              {group.viewAll.label}
              <ArrowRightIcon size={15} aria-hidden className="transition-transform duration-150 ease-out group-hover:translate-x-0.5" />
            </Link>
          }
        </div>

        <div className="flex flex-col justify-between rounded-[22px] p-6" style={{ backgroundColor: tone.bg, color: tone.fg }}>
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.08em] opacity-80">{group.feature.eyebrow}</p>
            <p className="kb-display mt-3 text-[28px] leading-[1.02]">{group.feature.title}</p>
            <p className="mt-3 text-[14px] font-medium leading-relaxed opacity-90">{group.feature.text}</p>
          </div>
          <Link
            to={group.feature.cta.to}
            onClick={onNavigate}
            style={{ backgroundColor: tone.btnBg, color: tone.btnFg }}
            className="group mt-6 inline-flex h-11 items-center justify-center gap-1.5 self-start whitespace-nowrap rounded-full px-5 text-[14px] font-bold transition-transform duration-150 ease-out hover:scale-[1.03] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2">
            
            {group.feature.cta.label} <ArrowRightIcon size={15} aria-hidden />
          </Link>
        </div>
      </div>
    </motion.div>);

}