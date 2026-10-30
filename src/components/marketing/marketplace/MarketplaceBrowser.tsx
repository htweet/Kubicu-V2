import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchIcon, SearchXIcon, XIcon } from 'lucide-react';
import { useMarketplace } from '../../../contexts/MarketplaceContext';
import { listingKinds, type ListingKind } from '../../../data/marketplaceKinds';
import { allListings, searchListings, sortListings, type ListingSort } from '../../../utils/marketplaceListings';
import { ListingCard } from './ListingCard';
import { useT } from '../../../contexts/LocaleContext';
import { cn } from '../../../utils/cn';

interface MarketplaceBrowserProps {
  /** Fix the kind (category pages). Leave empty to browse everything with kind chips. */
  kind?: ListingKind;
  /** Accessible name for the results region. */
  label: string;
}

const PAGE = 24;

/**
 * Search, filter and sort for the public Marketplace (D268). State lives in the address (?q=&group=&sort=&kind=)
 * so a filtered view can be shared and Back works.
 */
export function MarketplaceBrowser({ kind: fixedKind, label }: MarketplaceBrowserProps) {
  const { t: tr } = useT();
  const [params, setParams] = useSearchParams();
  const market = useMarketplace();
  const q = params.get('q') ?? '';
  const group = params.get('group') ?? '';
  const sort = params.get('sort') as ListingSort || 'relevant';
  const kindParam = params.get('kind') as ListingKind | null;
  const kind = fixedKind ?? (listingKinds.some((k) => k.id === kindParam) ? kindParam : null);
  const shown = Number(params.get('n')) || PAGE;

  const set = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => v ? next.set(k, v) : next.delete(k));
    if (!('n' in patch)) next.delete('n');
    setParams(next, { replace: true });
  };

  const base = useMemo(() => allListings().filter((l) => !kind || l.kind === kind), [kind]);
  const groups = useMemo(() => [...new Set(base.map((l) => l.group))].sort(), [base]);
  const results = useMemo(() => sortListings(searchListings(group ? base.filter((l) => l.group === group) : base, q), sort), [base, group, q, sort]);

  return (
    <div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <label htmlFor="mp-search" className="sr-only">
            {tr('Search the Marketplace')}
          </label>
          <SearchIcon size={18} aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-fg-subtle" />
          <input
            id="mp-search"
            type="search"
            value={q}
            onChange={(e) => set({ q: e.target.value || null })}
            placeholder={tr(kind === 'apps' ? 'Try “email”, “ads” or “appointment”' : 'Search apps, templates, themes and more')}
            className="h-12 w-full rounded-full border border-line bg-raised pl-11 pr-11 text-[15px] text-fg shadow-1 placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-focus" />
          
          {q &&
          <button
            type="button"
            aria-label={tr('Clear search')}
            onClick={() => set({ q: null })}
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-fg-muted hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
            
              <XIcon size={16} aria-hidden />
            </button>
          }
        </div>
        <div className="flex gap-2">
          <label className="sr-only" htmlFor="mp-group">
            {tr('Filter by group')}
          </label>
          <select
            id="mp-group"
            value={group}
            onChange={(e) => set({ group: e.target.value || null })}
            className="h-12 min-w-0 flex-1 rounded-full border border-line bg-raised px-4 text-[14px] font-semibold text-fg shadow-1 focus:outline-none focus:ring-2 focus:ring-focus lg:w-56 lg:flex-none">
            
            <option value="">{tr('All groups')}</option>
            {groups.map((g) =>
            <option key={g} value={g}>
                {tr(g)}
              </option>
            )}
          </select>
          <label className="sr-only" htmlFor="mp-sort">
            {tr('Sort')}
          </label>
          <select
            id="mp-sort"
            value={sort}
            onChange={(e) => set({ sort: e.target.value === 'relevant' ? null : e.target.value })}
            className="h-12 rounded-full border border-line bg-raised px-4 text-[14px] font-semibold text-fg shadow-1 focus:outline-none focus:ring-2 focus:ring-focus">
            
            <option value="relevant">{tr('Curated order')}</option>
            <option value="newest">{tr('Newly updated')}</option>
            <option value="price">{tr('Price: free first')}</option>
          </select>
        </div>
      </div>

      {!fixedKind &&
      <div role="group" aria-label={tr('Kind')} className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto overflow-y-hidden px-5 pb-1 md:mx-0 md:flex-wrap md:px-0">
          {[{ id: null as ListingKind | null, label: 'Everything' }, ...listingKinds.map((k) => ({ id: k.id as ListingKind | null, label: k.label }))].map((k) =>
        <button
          key={k.label}
          type="button"
          aria-pressed={kind === k.id}
          onClick={() => set({ kind: k.id, group: null })}
          className={cn(
            'h-10 shrink-0 whitespace-nowrap rounded-full px-4 text-[14px] font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
            kind === k.id ? 'bg-fg text-canvas' : 'bg-raised text-fg shadow-1 hover:bg-sunken'
          )}>
          
              {tr(k.label)}
            </button>
        )}
        </div>
      }

      <p className="mt-6 text-[14px] text-fg-muted" aria-live="polite">
        {results.length === 0 ? tr('No matches') : q ? tr('Results for “{q}”: {n}', { q, n: results.length }) : tr('Results: {n}', { n: results.length })}
      </p>

      {results.length === 0 ?
      <div className="mt-4 flex flex-col items-center rounded-[28px] bg-raised px-6 py-14 text-center shadow-1">
          <SearchXIcon size={28} aria-hidden className="text-fg-subtle" />
          <p className="mt-3 text-[17px] font-bold text-fg">{tr('Nothing matches that yet')}</p>
          <p className="mt-1 max-w-sm text-[14px] text-fg-muted">{tr('Try a shorter word, or describe the job — “sell”, “bookings”, “email” — rather than a brand name.')}</p>
          <button
          type="button"
          onClick={() => setParams(new URLSearchParams(), { replace: true })}
          className="mt-5 h-11 rounded-full bg-fg px-5 text-[14px] font-bold text-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2">
          
            {tr('Clear filters')}
          </button>
        </div> :

      <>
          <ul aria-label={label} className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.slice(0, shown).map((l) =>
          <ListingCard key={l.slug} listing={l} installed={!!l.ext && market.isActive(l.ext.id)} showKind={!kind} />
          )}
          </ul>
          {results.length > shown &&
        <div className="mt-8 flex justify-center">
              <button
            type="button"
            onClick={() => set({ n: String(shown + PAGE) })}
            className="h-12 rounded-full bg-raised px-6 text-[15px] font-bold text-fg shadow-1 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
            
                {tr('Show more · left: {n}', { n: results.length - shown })}
              </button>
            </div>
        }
        </>
      }
    </div>);

}