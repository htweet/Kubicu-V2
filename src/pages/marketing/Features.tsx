import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import { PillarHero } from '../../components/marketing/PillarHero';
import { PillarCrossLinks } from '../../components/marketing/PillarCrossLinks';
import { ExamplePhone } from '../../components/marketing/ExamplePhone';
import { Reveal } from '../../components/marketing/Reveal';
import { ClosingCta } from '../../components/marketing/home/ClosingCta';
import { featureAreas, type FeatureStatus } from '../../data/featureIndex';
import { findExampleById } from '../../data/examples';
import { useT } from '../../contexts/LocaleContext';
import { cn } from '../../utils/cn';

const statusClass: Record<FeatureStatus, string> = {
  Ready: 'bg-[rgb(var(--kb-lime))] text-[rgb(var(--kb-forest))]',
  'Needs a plan': 'bg-[rgb(var(--kb-sky))] text-[rgb(var(--kb-cobalt))]',
  Simulated: 'bg-sunken text-fg-muted'
};

/** /features — every product area on one page, each with an honest status per capability (D268). Translated in D321. */
export function Features() {
  const { t: tr } = useT();
  const hero = findExampleById('elite-beauty');
  return (
    <>
      <PillarHero
        id="ft-hero"
        crumb={[{ label: 'Features' }]}
        title="Everything a page can do."
        lead="Build it, sell and book from it, share it with short links, and keep the people it brings in — each part labelled with what’s ready and what’s still simulated."
        bg="rgb(30 30 33)"
        fg="#ffffff"
        primary={{ label: 'Create your page free', to: '/signup', bg: 'rgb(var(--kb-lime))', fg: 'rgb(var(--kb-forest))' }}
        secondary={{ label: 'See the roadmap', to: '/about/roadmap' }}
        visual={hero ? <ExamplePhone doc={hero.doc} width={240} bezel="light" className="mx-auto w-fit rotate-[3deg]" /> : null} />
      

      <nav aria-label={tr('On this page')} className="sticky top-[88px] z-20 border-b border-line bg-canvas/95 backdrop-blur">
        <ul className="no-scrollbar mx-auto flex max-w-7xl gap-1 overflow-x-auto overflow-y-hidden px-5 py-2 md:px-8">
          {featureAreas.map((a) =>
          <li key={a.id}>
              <a href={`#${a.id}`} className="inline-flex h-10 items-center whitespace-nowrap rounded-full px-4 text-[14px] font-semibold text-fg-muted hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                {tr(a.title)}
              </a>
            </li>
          )}
        </ul>
      </nav>

      <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
        {featureAreas.map((a, i) => {
          const ex = a.example ? findExampleById(a.example) : undefined;
          return (
            <section key={a.id} id={a.id} aria-labelledby={`${a.id}-h`} className="grid scroll-mt-40 gap-10 border-b border-line py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:py-20">
              <Reveal className={cn(i % 2 === 1 && 'lg:order-2')}>
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: a.tone.bg, color: a.tone.fg }}>
                  <a.icon size={24} strokeWidth={2.1} aria-hidden />
                </span>
                <h2 id={`${a.id}-h`} className="kb-display mt-5 text-[36px] leading-[1] text-fg md:text-[48px]">
                  {tr(a.title)}
                </h2>
                <p className="mt-4 max-w-lg text-[17px] leading-relaxed text-fg-muted">{tr(a.lead)}</p>
                <Link to={a.more.to} className="group mt-6 inline-flex items-center gap-1.5 text-[15px] font-bold text-fg underline-offset-4 hover:underline">
                  {tr(a.more.label)} <ArrowRightIcon size={15} aria-hidden className="transition-transform duration-150 ease-out group-hover:translate-x-0.5" />
                </Link>
              </Reveal>
              <div className={cn('flex flex-col gap-6 sm:flex-row sm:items-center', i % 2 === 1 && 'lg:order-1')}>
                <ul className="flex flex-1 flex-col">
                  {a.items.map((it) =>
                  <li key={it.name} className="flex items-center justify-between gap-4 border-t border-line py-4 text-[16px] text-fg last:border-b">
                      <span className="min-w-0">{tr(it.name)}</span>
                      <span className={cn('shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-bold', statusClass[it.status])}>{tr(it.status)}</span>
                    </li>
                  )}
                </ul>
                {ex && <ExamplePhone doc={ex.doc} width={170} className="mx-auto shrink-0" />}
              </div>
            </section>);

        })}
        <p className="py-8 text-[13px] text-fg-subtle">{tr('“Simulated” means it works in this prototype without the outside service it needs in production — payments, messaging, domains or an AI model.')}</p>
      </div>

      <PillarCrossLinks title="Four places to go next" />
      <ClosingCta />
    </>);

}