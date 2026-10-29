import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import { Reveal } from '../Reveal';
import { RiseText } from './RiseText';
import { cn } from '../../../utils/cn';

interface ColourBandProps {
  id: string;
  /** Band background and text colours (CSS colours, usually brand vars). */
  bg: string;
  fg: string;
  title: string;
  lead: string;
  cta?: {label: string;to: string;bg: string;fg: string;};
  /** Extra content under the lead, e.g. a list. */
  children?: React.ReactNode;
  visual: React.ReactNode;
  /** Visual on the left on wide screens. */
  flip?: boolean;
}

/** Full-bleed, solid colour chapter with a giant heading and a visual (D260). Stacks text-first on phones. */
export function ColourBand({ id, bg, fg, title, lead, cta, children, visual, flip }: ColourBandProps) {
  const navigate = useNavigate();
  return (
    <section aria-labelledby={id} style={{ backgroundColor: bg, color: fg }} className="relative overflow-hidden">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-2 lg:gap-16 lg:py-32">
        <div className={cn('relative z-10 max-w-xl', flip && 'lg:order-2 lg:justify-self-end')}>
          <h2 id={id} className="kb-display text-[42px] leading-[0.98] sm:text-[56px] lg:text-[64px]">
            <RiseText text={title} stagger={0.04} />
          </h2>
          <Reveal delay={0.15}>
            <p className="mt-6 text-[18px] font-medium leading-relaxed opacity-90">{lead}</p>
          </Reveal>
          {children && <Reveal delay={0.22}>{children}</Reveal>}
          {cta &&
          <Reveal delay={0.28}>
              <button
              type="button"
              onClick={() => navigate(cta.to)}
              style={{ backgroundColor: cta.bg, color: cta.fg }}
              className="group mt-9 inline-flex h-14 items-center gap-2 whitespace-nowrap rounded-full px-7 text-[16px] font-bold transition-transform duration-150 ease-out hover:scale-[1.03] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2">
              
                {cta.label}
                <ArrowRightIcon size={18} aria-hidden className="transition-transform duration-150 ease-out group-hover:translate-x-0.5" />
              </button>
            </Reveal>
          }
        </div>
        <div className={cn('relative', flip && 'lg:order-1')}>{visual}</div>
      </div>
    </section>);

}