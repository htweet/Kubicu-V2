import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquareIcon, SearchIcon } from 'lucide-react';
import { helpTopics } from '../../data/helpTopics';
import { InfoHero } from '../../components/legal/InfoHero';
import { FaqList } from '../../components/marketing/FaqList';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';

export function HelpCentre() {
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return helpTopics.
    map((t) => ({ ...t, articles: t.articles.filter((a) => !q || a.q.toLowerCase().includes(q) || a.a.toLowerCase().includes(q)) })).
    filter((t) => t.articles.length > 0);
  }, [query]);
  const count = results.reduce((n, t) => n + t.articles.length, 0);

  return (
    <>
      <InfoHero crumb="Company" title="Help centre" intro="Short answers to the questions people ask most. Can’t find yours? Contact us and a person will reply." />
      <div className="mx-auto w-full max-w-6xl px-5 py-12 md:px-8">
        <label className="relative block max-w-xl">
          <span className="sr-only">Search help</span>
          <SearchIcon size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-fg-subtle" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search, e.g. refund, publish, domain"
            className="h-12 w-full rounded-xl border border-line-strong bg-field pl-11 pr-4 text-body text-fg placeholder:text-fg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus" />
          
        </label>
        <p className="mt-3 text-caption text-fg-subtle" aria-live="polite">
          {query ? `${count} answer${count === 1 ? '' : 's'}` : `${helpTopics.length} topics`}
        </p>

        {results.length === 0 ?
        <div className="mt-10">
            <EmptyState icon={SearchIcon} title="No answers match" description="Try a different word, or ask us directly." action={<Button variant="secondary" onClick={() => setQuery('')}>Clear search</Button>} />
          </div> :

        <div className="mt-10 grid gap-x-12 gap-y-12 lg:grid-cols-2">
            {results.map((t) =>
          <section key={t.area} aria-labelledby={`help-${t.area}`}>
                <h2 id={`help-${t.area}`} className="font-display text-[22px] font-semibold tracking-[-0.015em] text-fg">
                  {t.area}
                </h2>
                <div className="mt-4">
                  <FaqList items={t.articles} />
                </div>
              </section>
          )}
          </div>
        }

        <div className="nm-frame mt-16 rounded-2xl">
          <div className="flex flex-col gap-4 rounded-[15px] bg-raised p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <MessageSquareIcon size={20} className="mt-0.5 shrink-0 text-[rgb(var(--nm-3))]" aria-hidden />
              <div>
                <h2 className="text-heading font-semibold text-fg">Still stuck?</h2>
                <p className="mt-1 text-label text-fg-muted">Signed in? Use Help → Contact support in your workspace for the fastest reply.</p>
              </div>
            </div>
            <Link to="/about/contact" className="inline-flex h-10 items-center justify-center rounded-md border border-line-strong px-4 text-label font-medium text-fg hover:bg-sunken">
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </>);

}