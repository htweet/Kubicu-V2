import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRightIcon } from 'lucide-react';
import { RiseText } from './RiseText';
import { MarqueeToggle } from './MarqueeToggle';
import { Reveal } from '../Reveal';
import { businessTypes } from '../../../data/marketing';
import { peopleCards } from '../../../data/marketingHome';
import { useT } from '../../../contexts/LocaleContext';

/** "Made for" — four photo cards and a moving strip of every business type (D260). Translated in D319. */
export function PeopleSection() {
  const { t: tr } = useT();
  const reduce = useReducedMotion();
  const [typesPaused, setTypesPaused] = useState(false);
  return (
    <section aria-labelledby="people-heading" className="overflow-hidden bg-canvas py-20 md:py-28">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 id="people-heading" className="kb-display max-w-3xl text-[42px] leading-[0.98] text-fg sm:text-[56px] lg:text-[64px]">
            <RiseText text={tr('Made for every kind of hustle.')} stagger={0.04} />
          </h2>
          <Reveal delay={0.15}>
            <Link to="/templates" className="group inline-flex h-12 items-center gap-2 whitespace-nowrap rounded-full bg-fg px-6 text-[15px] font-bold text-canvas transition-transform duration-150 ease-out hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2">
              {tr('See pages for your work')} <ArrowUpRightIcon size={17} aria-hidden className="transition-transform duration-150 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </Reveal>
        </div>

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {peopleCards.map((p, i) =>
          <motion.li
            key={p.name}
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.3, delay: i * 0.06, ease: [0.23, 1, 0.32, 1] }}
            className={i % 2 ? 'lg:mt-12' : ''}>
            
              <article className="flex h-full flex-col overflow-hidden rounded-[32px]" style={{ backgroundColor: p.bg }}>
                <div className="overflow-hidden">
                  <img src={p.image} alt={tr(p.alt)} loading="lazy" className="aspect-[4/5] w-full object-cover object-top" />
                </div>
                <div className="flex flex-1 flex-col p-6 text-[rgb(20_20_18)]">
                  <h3 className="kb-display text-[24px] leading-tight">{tr(p.name)}</h3>
                  <p className="mt-2 text-[15px] font-medium leading-relaxed text-[rgb(20_20_18)]/80">{tr(p.line)}</p>
                </div>
              </article>
            </motion.li>
          )}
        </ul>
        <p className="mt-6 text-caption text-fg-subtle">{tr('People pictured are illustrative.')}</p>
      </div>

      <div className="mx-auto mt-16 flex w-full max-w-7xl justify-end px-5 md:px-8">
        <MarqueeToggle paused={typesPaused} onToggle={() => setTypesPaused((p) => !p)} />
      </div>
      <div className="kb-marquee-host mt-4 border-y-2 border-fg py-5" aria-label={tr('Business types')} data-paused={typesPaused}>
        <div className="kb-marquee flex w-max gap-10" style={{ ['--kb-marquee-duration' as string]: '40s' }}>
          {[...businessTypes, ...businessTypes].map((t, i) =>
          <span key={`${t}-${i}`} aria-hidden={i >= businessTypes.length || undefined} className="kb-display flex items-center gap-10 whitespace-nowrap text-[28px] text-fg md:text-[36px]">
              {tr(t)}
              <span className="inline-block h-4 w-4 rotate-45 bg-[rgb(var(--kb-cobalt))]" aria-hidden />
            </span>
          )}
        </div>
      </div>
    </section>);

}