import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRightIcon, ChevronRightIcon } from 'lucide-react';
import { RiseText } from './home/RiseText';
import { cn } from '../../utils/cn';

interface PillarHeroProps {
  id: string;
  crumb: {label: string;to?: string;}[];
  title: string;
  lead: string;
  /** Band colours (CSS colours). */
  bg: string;
  fg: string;
  primary: {label: string;to: string;bg: string;fg: string;};
  secondary?: {label: string;to: string;};
  /** Short honest note under the buttons, e.g. what's simulated. */
  note?: React.ReactNode;
  visual: React.ReactNode;
  /** Extra content under the buttons (e.g. a demo form). */
  children?: React.ReactNode;
}

const ease = [0.23, 1, 0.32, 1] as const;

/** Opening band for product, solution and marketplace pages (D268): solid colour, giant title, one visual. */
export function PillarHero({ id, crumb, title, lead, bg, fg, primary, secondary, note, visual, children }: PillarHeroProps) {
  const reduce = useReducedMotion();
  const fade = (delay: number) => reduce ? {} : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3, delay, ease } };
  return (
    <section aria-labelledby={id} className="relative -mt-[88px] overflow-hidden pt-[88px]" style={{ backgroundColor: bg, color: fg }}>
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 pb-16 pt-8 md:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12 lg:pb-24 lg:pt-14">
        <div className="relative z-10 max-w-2xl">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-[13px] font-semibold opacity-80">
            <Link to="/" className="rounded-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current">
              KUBICU
            </Link>
            {crumb.map((c) =>
            <React.Fragment key={c.label}>
                <ChevronRightIcon size={12} aria-hidden />
                {c.to ?
              <Link to={c.to} className="rounded-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current">
                    {c.label}
                  </Link> :

              <span aria-current="page">{c.label}</span>
              }
              </React.Fragment>
            )}
          </nav>
          <h1 id={id} className="kb-display mt-5 text-[46px] leading-[0.96] sm:text-[64px] lg:text-[76px]">
            <RiseText text={title} />
          </h1>
          <motion.p className="mt-6 max-w-xl text-[18px] font-medium leading-relaxed opacity-90 md:text-[19px]" {...fade(0.3)}>
            {lead}
          </motion.p>
          <motion.div className="mt-8 flex flex-wrap items-center gap-3" {...fade(0.4)}>
            <Link
              to={primary.to}
              style={{ backgroundColor: primary.bg, color: primary.fg }}
              className="group inline-flex h-14 items-center gap-2 whitespace-nowrap rounded-full px-7 text-[16px] font-bold transition-transform duration-150 ease-out hover:scale-[1.03] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2">
              
              {primary.label}
              <ArrowRightIcon size={18} aria-hidden className="transition-transform duration-150 ease-out group-hover:translate-x-0.5" />
            </Link>
            {secondary &&
            <Link
              to={secondary.to}
              className="inline-flex h-14 items-center whitespace-nowrap rounded-full px-6 text-[16px] font-bold transition-colors duration-150 hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2"
              style={{ boxShadow: 'inset 0 0 0 2px currentColor' }}>
              
                {secondary.label}
              </Link>
            }
          </motion.div>
          {children && <motion.div {...fade(0.45)}>{children}</motion.div>}
          {note && <p className={cn('mt-5 max-w-lg text-[13px] font-medium opacity-75')}>{note}</p>}
        </div>
        <div className="relative">{visual}</div>
      </div>
    </section>);

}