import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SearchIcon } from 'lucide-react';
import { HelpStillStuck } from '../../components/help/HelpStillStuck';
import { helpGroups, helpTopics } from '../../data/helpTopics';
import { InfoHero } from '../../components/legal/InfoHero';
import { HelpArticleRow } from '../../components/help/HelpArticleRow';
import { helpIcons } from '../../components/help/helpIcons';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { helpArticleHref, matchesHelp } from '../../utils/help';

/** First guides most people need, in the order they need them. */
const START_HERE = ['claim-link', 'first-page', 'add-blocks', 'publish-check', 'sl-shorten', 'add-product'];

/** Help centre (D113b, D274): a step-by-step guide grouped by job, searchable, each answer on its own page. */
export function HelpCentre() {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const results = useMemo(() => helpTopics.map((t) => ({ ...t, articles: t.articles.filter((a) => matchesHelp(a, t, q)) })).filter((t) => t.articles.length > 0), [q]);
  const total = helpTopics.reduce((n, t) => n + t.articles.length, 0);
  const count = results.reduce((n, t) => n + t.articles.length, 0);
  const startHere = START_HERE.map((id) => helpTopics.flatMap((t) => t.articles).find((a) => a.id === id)).filter((a): a is NonNullable<typeof a> => !!a);

  return (
    <>
      <InfoHero crumb="Company" title="Help centre" intro="Step-by-step guides to everything in KUBICU, with a picture of each screen — from claiming your link to checking guests in at the door. Can’t find it? A person will reply." />
      <div className="mx-auto w-full max-w-6xl px-5 py-12 md:px-8">
        <label className="relative block max-w-xl">
          <span className="sr-only">Search help</span>
          <SearchIcon size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-fg-subtle" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search, e.g. short link, refund, segment, domain"
            className="h-12 w-full rounded-xl border border-line-strong bg-field pl-11 pr-4 text-body text-fg placeholder:text-fg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus" />
          
        </label>
        <p className="mt-3 text-caption text-fg-subtle" aria-live="polite">
          {q ? `${count} guide${count === 1 ? '' : 's'}` : `${total} guides across ${helpTopics.length} topics`}
        </p>

        {!q &&
        <>
            <section aria-labelledby="help-start" className="mt-10">
              <h2 id="help-start" className="text-heading font-semibold text-fg">
                Start here
              </h2>
              <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {startHere.map((a, i) =>
              <li key={a.id}>
                    <Link to={helpArticleHref(a.id)} className="flex h-full items-start gap-3 rounded-xl border border-line bg-raised p-4 transition-colors duration-150 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-fg text-caption font-bold text-raised tabular-nums">{i + 1}</span>
                      <span className="text-label font-semibold text-fg">{a.q}</span>
                    </Link>
                  </li>
              )}
              </ol>
            </section>

            <ul className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4" aria-label="Topics">
              {helpTopics.map((t) => {
              const Icon = helpIcons[t.icon];
              return (
                <li key={t.id} className="bg-raised">
                    <a href={`#topic-${t.id}`} className="flex h-full flex-col gap-2 p-5 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus">
                      <Icon size={20} className="text-[rgb(var(--nm-3))]" aria-hidden />
                      <span className="text-label font-semibold text-fg">{t.title}</span>
                      <span className="text-caption leading-relaxed text-fg-muted">{t.summary}</span>
                      <span className="mt-auto pt-1 text-meta text-fg-subtle">{t.articles.length} guides</span>
                    </a>
                  </li>);

            })}
            </ul>
          </>
        }

        {results.length === 0 ?
        <div className="mt-10">
            <EmptyState icon={SearchIcon} title="No guides match" description="Try a different word, or ask us directly." action={<Button variant="secondary" onClick={() => setQuery('')}>Clear search</Button>} />
          </div> :

        <div className="mt-14 grid gap-12 lg:grid-cols-[220px_minmax(0,1fr)]">
            <nav aria-label="Guide contents" className="hidden lg:block">
              <div className="sticky top-24 flex max-h-[calc(100vh-7rem)] flex-col gap-5 overflow-y-auto pb-4">
                {helpGroups.map((g) => {
                const inGroup = results.filter((t) => t.group === g);
                if (!inGroup.length) return null;
                return (
                  <div key={g}>
                      <p className="text-caption font-semibold text-fg-subtle">{g}</p>
                      <ul className="mt-2 flex flex-col gap-1 border-l border-line">
                        {inGroup.map((t) =>
                      <li key={t.id}>
                            <a href={`#topic-${t.id}`} className="-ml-px block border-l border-transparent py-1 pl-3 text-label text-fg-muted hover:border-fg hover:text-fg">
                              {t.title}
                            </a>
                          </li>
                      )}
                      </ul>
                    </div>);

              })}
              </div>
            </nav>

            <div className="flex flex-col gap-14">
              {results.map((t) => {
              const Icon = helpIcons[t.icon];
              return (
                <section key={t.id} id={`topic-${t.id}`} aria-labelledby={`topic-h-${t.id}`} className="scroll-mt-24">
                    <div className="flex items-start gap-3">
                      <Icon size={22} className="mt-1 shrink-0 text-[rgb(var(--nm-3))]" aria-hidden />
                      <div>
                        <p className="text-caption text-fg-subtle">{t.group}</p>
                        <h2 id={`topic-h-${t.id}`} className="font-display text-[22px] font-semibold tracking-[-0.015em] text-fg">
                          {t.title}
                        </h2>
                        <p className="mt-1 text-label text-fg-muted">{t.summary}</p>
                      </div>
                    </div>
                    <ul className="mt-5 divide-y divide-line border-y border-line">
                      {t.articles.map((a) =>
                    <HelpArticleRow key={a.id} article={a} />
                    )}
                    </ul>
                  </section>);

            })}
            </div>
          </div>
        }

        <HelpStillStuck />
      </div>
    </>);

}