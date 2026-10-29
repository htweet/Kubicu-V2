import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowRightIcon, InfoIcon } from 'lucide-react';
import { PillarHero } from '../../components/marketing/PillarHero';
import { ExamplePhone } from '../../components/marketing/ExamplePhone';
import { SectionHeading } from '../../components/marketing/SectionHeading';
import { FaqList } from '../../components/marketing/FaqList';
import { PillarCrossLinks } from '../../components/marketing/PillarCrossLinks';
import { ClosingCta } from '../../components/marketing/home/ClosingCta';
import { solutionById, solutionToneColours } from '../../data/solutions';
import { findExampleById } from '../../data/examples';

/** /for/:segment — one page per audience, from data/solutions.ts (D268). */
export function Solution() {
  const { segment = '' } = useParams();
  const s = solutionById[segment];
  if (!s) return <Navigate to="/templates" replace />;
  const tone = solutionToneColours[s.tone];
  const examples = s.examples.map(findExampleById).filter(Boolean);

  return (
    <>
      <PillarHero
        id="sol-hero"
        crumb={[{ label: 'Solutions' }, { label: s.label }]}
        title={s.title}
        lead={s.lead}
        bg={tone.bg}
        fg={tone.fg}
        primary={{ label: 'Create your page free', to: '/signup', bg: tone.btnBg, fg: tone.btnFg }}
        secondary={{ label: 'Start with Copilot', to: '/copilot' }}
        visual={<img src={s.image} alt={s.imageAlt} className="mx-auto aspect-[4/5] w-full max-w-[460px] rounded-[36px] object-cover shadow-3" />} />
      

      <section aria-labelledby="sol-jobs" className="mx-auto w-full max-w-7xl px-5 py-20 md:px-8">
        <SectionHeading id="sol-jobs" title="What you’ll do with it" lead="In the order most people get to them — start with the first, add the rest when you need them." />
        <ol className="mt-10 flex flex-col">
          {s.jobs.map((j, i) =>
          <li key={j.title} className="grid gap-3 border-t border-line py-6 last:border-b md:grid-cols-[56px_minmax(0,1fr)_minmax(0,1.3fr)_auto] md:items-center md:gap-6">
              <span className="kb-display text-[32px] leading-none text-fg-subtle">{i + 1}</span>
              <h3 className="text-[20px] font-extrabold text-fg">{j.title}</h3>
              <p className="text-[15px] leading-relaxed text-fg-muted">{j.text}</p>
              <Link to={j.to} className="inline-flex items-center gap-1.5 whitespace-nowrap text-[14px] font-bold text-fg underline-offset-4 hover:underline">
                {j.linkLabel} <ArrowRightIcon size={14} aria-hidden />
              </Link>
            </li>
          )}
        </ol>
      </section>

      {examples.length > 0 &&
      <section aria-labelledby="sol-ex" style={{ backgroundColor: tone.bg, color: tone.fg }}>
          <div className="mx-auto w-full max-w-7xl px-5 py-20 md:px-8">
            <h2 id="sol-ex" className="kb-display text-[40px] leading-[1] md:text-[56px]">
              Pages to start from
            </h2>
            <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {examples.map((e) =>
            <li key={e!.id}>
                  <Link to={`/templates/${e!.id}`} className="group flex flex-col items-center gap-4 rounded-[28px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current">
                    <ExamplePhone doc={e!.doc} width={200} className="transition-transform duration-200 ease-out group-hover:-translate-y-1" />
                    <span className="text-center">
                      <span className="block text-[17px] font-extrabold">{e!.name}</span>
                      <span className="block text-[14px] opacity-80">{e!.bestFor}</span>
                    </span>
                  </Link>
                </li>
            )}
            </ul>
            {s.kit &&
          <Link to={`/marketplace/${s.kit}`} className="mt-10 inline-flex h-12 items-center gap-2 rounded-full px-6 text-[15px] font-bold" style={{ backgroundColor: tone.btnBg, color: tone.btnFg }}>
                See the industry kit <ArrowRightIcon size={16} aria-hidden />
              </Link>
          }
          </div>
        </section>
      }

      <section aria-labelledby="sol-know" className="mx-auto w-full max-w-4xl px-5 py-20 md:px-8">
        <h2 id="sol-know" className="text-[22px] font-extrabold text-fg">Good to know</h2>
        <ul className="mt-4 flex flex-col gap-3">
          {s.goodToKnow.map((g) =>
          <li key={g} className="flex gap-2.5 text-[15px] leading-relaxed text-fg-muted">
              <InfoIcon size={17} aria-hidden className="mt-1 shrink-0 text-fg-subtle" /> {g}
            </li>
          )}
        </ul>
        <div className="mt-12">
          <FaqList items={s.faqs} />
        </div>
      </section>

      <PillarCrossLinks />
      <ClosingCta />
    </>);

}