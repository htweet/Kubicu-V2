import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import { FaqList } from '../FaqList';
import { RiseText } from './RiseText';
import { Reveal } from '../Reveal';
import { capabilityStatus, homeFaq } from '../../../data/marketing';
import { cn } from '../../../utils/cn';
import { useT } from '../../../contexts/LocaleContext';

/** Honest availability, then questions — the plain-speaking end of the page (D260). Translated in D319. */
export function StatusFaqSection() {
  const { t: tr } = useT();
  return (
    <section className="bg-canvas py-20 md:py-28">
      <div className="mx-auto grid w-full max-w-7xl gap-14 px-5 md:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
        <div>
          <h2 id="faq-heading" className="kb-display text-[42px] leading-[0.98] text-fg sm:text-[56px]">
            <RiseText text={tr('Questions? Answered.')} stagger={0.05} />
          </h2>
          <Reveal delay={0.1} className="mt-10">
            <div className="overflow-hidden rounded-[28px] bg-raised shadow-1" aria-labelledby="status-heading" role="region">
              <div className="flex items-center justify-between gap-4 px-6 pb-3 pt-6">
                <h3 id="status-heading" className="text-[17px] font-bold text-fg">
                  {tr('What’s ready, and what’s coming')}
                </h3>
                <Link to="/about/roadmap" className="inline-flex shrink-0 items-center gap-1 text-label font-bold text-fg hover:underline">
                  {tr('Roadmap')} <ArrowRightIcon size={14} aria-hidden />
                </Link>
              </div>
              <ul>
                {capabilityStatus.map((c) => (
                  <li key={c.name} className="flex items-start justify-between gap-4 border-t border-line px-6 py-4">
                    <div className="min-w-0">
                      <p className="text-label font-semibold text-fg">{tr(c.name)}</p>
                      <p className="mt-0.5 text-caption text-fg-subtle">{tr(c.detail)}</p>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold',
                        c.ready ? 'bg-[rgb(var(--kb-lime))] text-[rgb(var(--kb-forest))]' : c.status === 'Preview' ? 'bg-[rgb(var(--kb-peach))] text-[rgb(var(--kb-clay))]' : 'bg-sunken text-fg-muted',
                      )}
                    >
                      {tr(c.ready ? 'Ready' : c.status)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
        <Reveal delay={0.12} className="lg:pt-4">
          <FaqList items={homeFaq} />
        </Reveal>
      </div>
    </section>
  );
}
