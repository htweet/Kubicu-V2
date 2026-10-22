import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchIcon, SearchXIcon, ShoppingBagIcon, XIcon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import type { CommerceData } from '../../types/commerce';
import { StoreProductCard } from './StoreProductCard';
import { fontsFor, inputStyle, mix } from '../blocks/pageStyle';
import { shopProducts, sortLabels, sortProducts, type StorefrontSort } from '../../utils/commerce/storefront';
import { isSoldOut } from '../../utils/commerce/catalog';
import { discountStatus } from '../../utils/commerce/discounts';

interface StorefrontViewProps {
  theme: PageTheme;
  data: CommerceData;
  productHref: (id: string) => string;
}

const sorts = Object.keys(sortLabels) as StorefrontSort[];

/** The auto-built shop: every active product, with collections, search, sort and stock filter (D53). */
export function StorefrontView({ theme, data, productHref }: StorefrontViewProps) {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const collection = params.get('c') ?? '';
  const sort = (sorts.includes(params.get('sort') as StorefrontSort) ? params.get('sort') : 'featured') as StorefrontSort;
  const inStock = params.get('stock') === '1';

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);else
    next.delete(key);
    setParams(next, { replace: true });
  };

  const all = useMemo(() => shopProducts(data), [data]);
  const collections = data.collections.filter((c) => all.some((p) => p.collectionIds.includes(c.id)));
  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = all.filter(
      (p) =>
      (!collection || p.collectionIds.includes(collection)) && (
      !inStock || !isSoldOut(p)) && (
      !term || `${p.name} ${p.description} ${p.variants.map((v) => Object.values(v.options).join(' ')).join(' ')}`.toLowerCase().includes(term))
    );
    return sortProducts(list, sort);
  }, [all, q, collection, inStock, sort]);

  // Automatic offers are worth telling shoppers about up front.
  const offer = data.discounts.find((d) => d.kind === 'automatic' && discountStatus(d, data) === 'active');
  const activeCollection = collections.find((c) => c.id === collection);
  const s = data.storefront;
  const chip = (active: boolean): React.CSSProperties => ({ background: active ? theme.text : mix(theme.text, 6), color: active ? theme.background : theme.text });
  const filtered = !!(q || collection || inStock);

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-2 pt-2">
        <h1 className="text-[28px] font-medium leading-tight tracking-[-0.015em] md:text-[34px]" style={{ fontFamily: fontsFor(theme).display, color: theme.text }}>
          {activeCollection ? activeCollection.name : s.title || 'Shop'}
        </h1>
        {(activeCollection?.description || !activeCollection && s.intro) &&
        <p className="max-w-2xl text-[15px] leading-relaxed" style={{ color: theme.mutedText }}>
            {activeCollection ? activeCollection.description : s.intro}
          </p>
        }
        {offer &&
        <p className="self-start rounded-full px-3 py-1 text-[13px] font-semibold" style={{ background: mix(theme.accent, 16, theme.background), color: theme.text }}>
            {offer.title} — applied at checkout
          </p>
        }
      </header>

      {all.length === 0 ?
      <div className="flex flex-col items-center gap-2 py-16 text-center">
          <ShoppingBagIcon size={28} aria-hidden style={{ color: theme.mutedText }} />
          <p className="text-[16px] font-medium">Nothing in the shop yet</p>
          <p className="text-[14px]" style={{ color: theme.mutedText }}>
            New pieces are on the way. Check back soon.
          </p>
        </div> :

      <>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative md:w-72">
              <label htmlFor="shop-search" className="sr-only">
                Search products
              </label>
              <SearchIcon size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: theme.mutedText }} aria-hidden />
              <input
              id="shop-search"
              type="search"
              value={q}
              placeholder="Search"
              onChange={(e) => set('q', e.target.value)}
              className="h-11 w-full pl-10 pr-3.5 text-[15px] outline-none focus:ring-2"
              style={inputStyle(theme)} />
            
            </div>
            <div className="flex items-center gap-2 md:ml-auto">
              <label className="flex h-11 cursor-pointer items-center gap-2 px-3 text-[14px] font-medium" style={{ ...chip(inStock), borderRadius: 999 }}>
                <input type="checkbox" className="sr-only" checked={inStock} onChange={(e) => set('stock', e.target.checked ? '1' : '')} />
                In stock only
              </label>
              <label htmlFor="shop-sort" className="sr-only">
                Sort
              </label>
              <select id="shop-sort" value={sort} onChange={(e) => set('sort', e.target.value === 'featured' ? '' : e.target.value)} className="h-11 min-w-0 flex-1 px-3 text-[14px] outline-none md:flex-none" style={inputStyle(theme)}>
                {sorts.map((o) =>
              <option key={o} value={o}>
                    {sortLabels[o]}
                  </option>
              )}
              </select>
            </div>
          </div>

          {collections.length > 0 &&
        <nav aria-label="Collections" className="scroll-quiet -mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
              {[{ id: '', name: 'All' }, ...collections].map((c) =>
          <button
            key={c.id || 'all'}
            type="button"
            aria-pressed={collection === c.id}
            onClick={() => set('c', c.id)}
            className="inline-flex h-9 shrink-0 items-center whitespace-nowrap rounded-full px-4 text-[14px] font-medium transition-opacity duration-150 hover:opacity-85"
            style={chip(collection === c.id)}>
            
                  {c.name}
                </button>
          )}
            </nav>
        }

          <p className="text-[13px]" style={{ color: theme.mutedText }} aria-live="polite">
            {visible.length} {visible.length === 1 ? 'product' : 'products'}
          </p>

          {visible.length === 0 ?
        <div className="flex flex-col items-center gap-2 py-12 text-center">
              <SearchXIcon size={26} aria-hidden style={{ color: theme.mutedText }} />
              <p className="text-[15px] font-medium">No products match</p>
              {filtered &&
          <button type="button" onClick={() => setParams(new URLSearchParams(), { replace: true })} className="mt-1 inline-flex items-center gap-1.5 text-[14px] font-semibold underline underline-offset-4">
                  <XIcon size={14} aria-hidden /> Clear filters
                </button>
          }
            </div> :

        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
              {visible.map((p) =>
          <StoreProductCard key={p.id} product={p} theme={theme} href={productHref(p.id)} />
          )}
            </ul>
        }
        </>
      }
    </div>);

}