import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronDownIcon, LinkIcon, PrinterIcon } from 'lucide-react';
import type { LegalDoc } from '../../types/legal';
import { allLegalDocs } from '../../data/legal';
import { Button } from '../ui/Button';
import { InfoHero } from './InfoHero';
import { cn } from '../../utils/cn';

/** Structured legal/policy page: draft banner, sticky contents, summary above every section (D78). */
export function LegalDocument({ doc }: {doc: LegalDoc;}) {
  const [active, setActive] = useState(doc.sections[0]?.id);

  useEffect(() => {
    const els = doc.sections.map((s) => document.getElementById(s.id)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-96px 0px -60% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [doc]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href.split('#')[0]);
      toast.success('Link copied');
    } catch {
      toast.error('Couldn’t copy — copy the address bar instead');
    }
  };

  const related = allLegalDocs.filter((d) => d.group === doc.group && d.slug !== doc.slug);

  return (
    <article>
      <InfoHero
        crumb={doc.group}
        title={doc.title}
        intro={doc.intro}
        meta={
        <>
            <span>Last updated {doc.updated}</span>
            <span aria-hidden>·</span>
            <span>{doc.version}</span>
          </>
        }
        actions={
        <>
            <Button variant="secondary" size="sm" leadingIcon={PrinterIcon} onClick={() => window.print()}>
              Print
            </Button>
            <Button variant="secondary" size="sm" leadingIcon={LinkIcon} onClick={copyLink}>
              Copy link
            </Button>
          </>
        } />
      

      <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
        <div className="mt-12 grid gap-10 pb-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
          {/* Contents */}
          <nav aria-label="On this page" className="lg:sticky lg:top-24 lg:self-start">
            <details className="kb-faq group rounded-xl border border-line lg:hidden">
              <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-label font-semibold text-fg">
                Jump to a section
                <ChevronDownIcon size={16} className="text-fg-subtle transition-transform duration-150 group-open:rotate-180" aria-hidden />
              </summary>
              <TocList doc={doc} active={active} />
            </details>
            <div className="hidden lg:block">
              <p className="text-caption font-semibold text-fg">On this page</p>
              <TocList doc={doc} active={active} />
            </div>
          </nav>

          <div className="flex min-w-0 max-w-3xl flex-col gap-14">
            {doc.sections.map((s, i) =>
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="scroll-mt-24">
                <h2 id={`${s.id}-h`} className="flex items-baseline gap-3 font-display text-[24px] font-semibold tracking-[-0.02em] text-fg">
                  <span className="nm-text text-[18px] tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  {s.title}
                </h2>
                <p className="mt-4 rounded-xl border-l-2 border-[rgb(var(--nm-2))] bg-raised px-4 py-3 text-label text-fg">
                  <span className="font-semibold">In short: </span>
                  {s.summary}
                </p>
                <div className="mt-5 flex flex-col gap-4 text-body leading-relaxed text-fg-muted">
                  {s.paragraphs.map((p) =>
                <p key={p}>{p}</p>
                )}
                  {s.list &&
                <ul className="flex flex-col gap-2 pl-1">
                      {s.list.map((l) =>
                  <li key={l} className="flex gap-3">
                          <span aria-hidden className="nm-fill mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full" />
                          {l}
                        </li>
                  )}
                    </ul>
                }
                </div>
              </section>
            )}

            {related.length > 0 &&
            <aside aria-labelledby="related-h" className="border-t border-line pt-8">
                <h2 id="related-h" className="text-label font-semibold text-fg">
                  More in {doc.group}
                </h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {related.map((d) =>
                <li key={d.slug}>
                      <Link to={`/about/${d.slug}`} className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                        <span className="nm-edge block rounded-xl">
                          <span className="block rounded-[11px] bg-raised px-4 py-3">
                            <span className="block text-label font-semibold text-fg">{d.title}</span>
                            <span className="mt-0.5 block text-caption text-fg-subtle line-clamp-1">{d.intro}</span>
                          </span>
                        </span>
                      </Link>
                    </li>
                )}
                </ul>
              </aside>
            }
          </div>
        </div>
      </div>
    </article>);

}

function TocList({ doc, active }: {doc: LegalDoc;active?: string;}) {
  return (
    <ol className="mt-3 flex flex-col border-l border-line px-4 pb-3 lg:px-0 lg:pb-0">
      {doc.sections.map((s) =>
      <li key={s.id}>
          <a
          href={`#${s.id}`}
          aria-current={active === s.id ? 'location' : undefined}
          className={cn(
            '-ml-px block border-l-2 py-1.5 pl-3 text-label transition-colors duration-150',
            active === s.id ? 'border-[rgb(var(--nm-2))] font-semibold text-fg' : 'border-transparent text-fg-muted hover:text-fg'
          )}>
          
            {s.title}
          </a>
        </li>
      )}
    </ol>);

}