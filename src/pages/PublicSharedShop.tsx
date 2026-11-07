import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowUpRightIcon, ImageIcon, InfoIcon, SearchIcon, StoreIcon } from 'lucide-react';
import type { SharedShop } from '../types/sharedShop';
import { onSharedShopsChange, readSharedShops, shopItems } from '../utils/sharedShops';
import { MediaImage } from '../components/media/MediaImage';
import { cn } from '../utils/cn';

type Sort = 'mixed' | 'price_asc' | 'price_desc';

/**
 * Public shared shop `/m/:slug` (D128). Products from every joined seller, filterable by seller.
 * Tapping a product opens that seller's own shop, where they handle checkout and delivery.
 */
export function PublicSharedShop() {
  const { slug = '' } = useParams();
  const [shop, setShop] = useState<SharedShop | undefined>(() => readSharedShops().find((s) => s.slug === slug));
  useEffect(() => {
    const load = () => setShop(readSharedShops().find((s) => s.slug === slug));
    load();
    return onSharedShopsChange(load);
  }, [slug]);
  const [seller, setSeller] = useState<string>('all');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<Sort>('mixed');

  const all = useMemo(() => (shop ? shopItems(shop) : []), [shop]);
  const sellers = shop ? shop.members.filter((m) => m.status === 'joined') : [];
  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    const filtered = all.filter((i) => (seller === 'all' || i.member.id === seller) && (!term || `${i.name} ${i.member.name}`.toLowerCase().includes(term)));
    if (sort === 'price_asc') return [...filtered].sort((a, b) => a.lowPrice - b.lowPrice);
    if (sort === 'price_desc') return [...filtered].sort((a, b) => b.lowPrice - a.lowPrice);
    // Mixed: take turns between sellers so no one seller fills the top of the page.
    const bySeller = new Map<string, typeof filtered>();
    filtered.forEach((i) => bySeller.set(i.member.id, [...(bySeller.get(i.member.id) ?? []), i]));
    const out: typeof filtered = [];
    for (let r = 0; out.length < filtered.length; r++) bySeller.forEach((items) => items[r] && out.push(items[r]));
    return out;
  }, [all, seller, q, sort]);

  useEffect(() => {
    const prev = document.title;
    if (shop) document.title = `${shop.name} · KUBICU`;
    return () => {
      document.title = prev;
    };
  }, [shop]);

  if (!shop)
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-canvas px-5">
        <div className="max-w-sm text-center">
          <StoreIcon size={28} className="mx-auto text-fg-subtle" aria-hidden />
          <h1 className="mt-3 text-heading font-semibold text-fg">This shop isn’t here</h1>
          <p className="mt-1 text-label text-fg-muted">The link may be mistyped, or the shop was closed by its host.</p>
          <Link to="/" className="mt-4 inline-block text-label font-semibold text-action hover:underline">
            Go to KUBICU
          </Link>
        </div>
      </main>
    );

  return (
    <main className="min-h-screen w-full bg-canvas">
      <header className="border-b border-line bg-raised">
        <div className="mx-auto w-full max-w-[1100px] px-5 py-8 md:px-8 md:py-10">
          <p className="text-caption font-medium text-fg-subtle">
            {sellers.length} seller{sellers.length === 1 ? '' : 's'} · hosted by {shop.hostName}
          </p>
          <h1 className="mt-1 font-display text-title font-semibold text-fg md:text-display">{shop.name}</h1>
          {shop.description && <p className="mt-2 max-w-2xl text-body text-fg-muted">{shop.description}</p>}
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1100px] px-5 pb-16 pt-6 md:px-8">
        {shop.paused ? (
          <section className="rounded-lg border border-line bg-raised p-6">
            <h2 className="text-heading font-semibold text-fg">Closed for now</h2>
            <p className="mt-1 text-label text-fg-muted">You can still shop directly with each seller:</p>
            <ul className="mt-4 flex flex-col gap-2">
              {sellers.map((m) => (
                <li key={m.id}>
                  <Link to={`/p/${m.handle}`} className="inline-flex items-center gap-1 text-label font-semibold text-action hover:underline">
                    {m.name} <ArrowUpRightIcon size={14} aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="scroll-quiet -mx-5 flex gap-2 overflow-x-auto overflow-y-hidden px-5 md:mx-0 md:px-0" role="group" aria-label="Filter by seller">
                {[{ id: 'all', name: 'Everyone' }, ...sellers].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    aria-pressed={seller === m.id}
                    onClick={() => setSeller(m.id)}
                    className={cn(
                      'min-h-[40px] shrink-0 whitespace-nowrap rounded-full border px-4 text-label font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                      seller === m.id ? 'border-transparent bg-fg text-canvas' : 'border-line text-fg-muted hover:text-fg',
                    )}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <label className="relative flex-1 md:w-56 md:flex-none">
                  <span className="sr-only">Search products</span>
                  <SearchIcon size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" aria-hidden />
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="h-10 w-full rounded-md border border-line bg-field pl-9 pr-3 text-label text-fg placeholder:text-fg-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-focus" />
                </label>
                <label>
                  <span className="sr-only">Sort</span>
                  <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="h-10 rounded-md border border-line bg-field px-3 text-label text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                    <option value="mixed">Mixed</option>
                    <option value="price_asc">Price: low to high</option>
                    <option value="price_desc">Price: high to low</option>
                  </select>
                </label>
              </div>
            </div>

            {list.length === 0 ? (
              <p className="mt-12 text-center text-label text-fg-muted">{all.length === 0 ? 'Sellers are still adding their products. Check back soon.' : 'Nothing matches. Try another seller or word.'}</p>
            ) : (
              <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
                {list.map((i) => (
                  <li key={i.key}>
                    <Link to={i.href} className="group flex flex-col gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                      <span className="relative block aspect-[4/5] overflow-hidden rounded-lg bg-sunken">
                        {i.imageUrl ? (
                          <MediaImage src={i.imageUrl} alt={i.imageAlt} className="h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.02]" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-fg-subtle">
                            <ImageIcon size={22} aria-hidden />
                          </span>
                        )}
                        {i.sample && <span className="absolute left-2 top-2 rounded-full bg-raised px-2 py-0.5 text-caption font-medium text-fg-muted">Sample</span>}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-label font-medium text-fg">{i.name}</span>
                        <span className="block text-label font-semibold tabular-nums text-fg">{i.priceLabel}</span>
                        <span className="block truncate text-caption text-fg-subtle">by {i.member.name}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        <p className="mt-12 flex gap-2 border-t border-line pt-6 text-caption text-fg-muted">
          <InfoIcon size={14} className="mt-px shrink-0" aria-hidden />
          Each seller takes their own orders, payment and delivery. When you tap a product you shop on that seller’s page, and your receipt comes from them.
        </p>
      </div>
    </main>
  );
}
