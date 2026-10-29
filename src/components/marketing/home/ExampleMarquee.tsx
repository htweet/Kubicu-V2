import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import { TemplateThumb } from '../../templates/TemplateThumb';
import { RiseText } from './RiseText';
import { Reveal } from '../Reveal';
import { examplePages, findExampleById } from '../../../data/examples';

const ids = ['glow-by-halima', 'afrobeats-brunch', 'lagos-bookshelf', 'kemi-presets', 'fixright-plumbing', 'ife-sounds', 'mama-put-kitchen', 'studio-nnamdi'];
const pages = ids.map((id) => findExampleById(id)).filter((e): e is NonNullable<typeof e> => !!e);

/** Endless strip of real example pages; pauses on hover or keyboard focus, still on reduced motion (D260). */
export function ExampleMarquee() {
  return (
    <section aria-labelledby="examples-heading" className="overflow-hidden bg-[rgb(var(--kb-sky))] py-20 text-[rgb(20_20_18)] md:py-28">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 md:flex-row md:items-end md:justify-between md:px-8">
        <div className="max-w-2xl">
          <h2 id="examples-heading" className="kb-display text-[42px] leading-[0.98] sm:text-[56px]">
            <RiseText text="One platform. Very different pages." stagger={0.04} />
          </h2>
          <Reveal delay={0.12}>
            <p className="mt-5 text-[18px] font-medium leading-relaxed text-[rgb(20_20_18)]/80">Every example is a fictional business. Open one to see the full page, or start from its layout.</p>
          </Reveal>
        </div>
        <Reveal delay={0.18}>
          <Link to="/templates" className="group inline-flex h-12 items-center gap-2 whitespace-nowrap rounded-full bg-[rgb(var(--kb-cobalt))] px-6 text-[15px] font-bold text-white transition-transform duration-150 ease-out hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--kb-cobalt))] focus-visible:ring-offset-2">
            All {examplePages.length} templates <ArrowRightIcon size={17} aria-hidden className="transition-transform duration-150 ease-out group-hover:translate-x-0.5" />
          </Link>
        </Reveal>
      </div>

      <div className="kb-marquee-host mt-14 overflow-x-auto [scrollbar-width:none] motion-safe:overflow-x-hidden">
        <ul className="kb-marquee flex w-max gap-6 px-5" style={{ ['--kb-marquee-duration' as string]: '60s' }}>
          {[...pages, ...pages].map((e, i) => {
            const dup = i >= pages.length;
            return (
              <li key={`${e.id}-${i}`} aria-hidden={dup || undefined}>
                <Link
                  to={`/p/${e.doc.handle}`}
                  tabIndex={dup ? -1 : undefined}
                  className="group block rounded-[28px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgb(var(--kb-cobalt))]">
                  
                  <span className="block overflow-hidden rounded-[28px] border-[6px] border-[rgb(20_20_18)] bg-[rgb(20_20_18)] shadow-2 transition-transform duration-200 ease-out group-hover:-translate-y-1.5 group-hover:rotate-[-1.5deg]">
                    <TemplateThumb doc={e.doc} width={190} height={380} />
                  </span>
                  <span className="mt-4 block text-[15px] font-bold">{e.name}</span>
                  <span className="block text-[13px] font-medium text-[rgb(20_20_18)]/70">{e.category}</span>
                </Link>
              </li>);

          })}
        </ul>
      </div>
    </section>);

}