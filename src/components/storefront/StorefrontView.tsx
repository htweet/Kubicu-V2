import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MegaphoneIcon, RotateCcwIcon, SearchIcon, SearchXIcon, ShoppingBagIcon, TruckIcon, XIcon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import type { CommerceData } from '../../types/commerce';
import { StoreProductCard } from './StoreProductCard';
import { MediaImage } from '../media/MediaImage';
import { fontsFor, inputStyle, mix } from '../blocks/pageStyle';
import { shopProducts, sortLabels, sortProducts, storefrontConfig, type StorefrontSort } from '../../utils/commerce/storefront';
import { isSoldOut } from '../../utils/commerce/catalog';
import { discountStatus } from '../../utils/commerce/discounts';

interface StorefrontViewProps {
  theme: PageTheme;
  data: CommerceData;
  productHref: (id: string) => string;
}

const sorts = Object.keys(sortLabels) as StorefrontSort[];
const gridCols: Record<2 | 3 | 4, string> = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-3 lg:grid-cols-4'
};

/** The auto-built shop: every active product, with collections, search, sort and stock filter (D53, D98). */
export function StorefrontView({ theme, data, productHref }: StorefrontViewProps) {
  const [params, setParams] = useSearchParams();
  const s = storefrontConfig(data.storefront);
  const q = s.showSearch ? params.get('q') ?? '' : '';
  const collection = s.showCollections ? params.get('c') ?? '' : '';
  const sort = (sorts.includes(params.get('sort') as StorefrontSort) ? params.get('sort') : s.defaultSort) as StorefrontSort;
  const inStock = s.showStockFilter && params.get('stock') === '1';
  // "Featured" chip shows only the pinned products; the sort just puts them first.
  const featuredOnly = s.featuredIds.length > 0 && params.get('f') === '1';

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
      !featuredOnly || s.featuredIds.includes(p.id)) && (
      !inStock || !isSoldOut(p)) && (
      !term || `${p.name} ${p.description} ${p.variants.map((v) => Object.values(v.options).join(' ')).join(' ')}`.toLowerCase().includes(term))
    );
    return sortProducts(list, featuredOnly ? 'featured' : sort, s.featuredIds);
  }, [all, q, collection, inStock, sort, s.featuredIds, featuredOnly]);

  // Automatic offers are worth telling shoppers about up front.
  const offer = data.discounts.find((d) => d.kind === 'automatic' && discountStatus(d, data) === 'active');
  const activeCollection = collections.find((c) => c.id === collection);
  const chip = (active: boolean): React.CSSProperties => ({ background: active ? theme.text : mix(theme.text, 6), color: active ? theme.background : theme.text });
  const filtered = !!(q || collection || inStock || featuredOnly);
  const hasFeatured = s.featuredIds.some((id) => all.some((p) => p.id === id));
  const notes = [
  s.deliveryNote.trim() && { icon: TruckIcon, title: 'Delivery', text: s.deliveryNote.trim() },
  s.returnsNote.trim() && { icon: RotateCcwIcon, title: 'Returns & exchanges', text: s.returnsNote.trim() }].
  filter(Boolean) as {icon: typeof TruckIcon;title: string;text: string;}[];

  return (
    <div className="flex flex-col gap-5">
      {s.announcement.trim() &&
      <p className="flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-[14px] font-medium" style={{ background: mix(theme.accent, 14, theme.background), color: theme.text }}>
          <MegaphoneIcon size={15} aria-hidden className="shrink-0" />
          {s.announcement.trim()}
        </p>
      }

      {s.bannerUrl && !activeCollection && <MediaImage src={s.bannerUrl} alt={s.bannerAlt} className="aspect-[16/7] w-full rounded-lg object-cover md:aspect-[16/5]" />}

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
          {
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
              {s.showSearch &&
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
          }
              <div className="flex items-center gap-2 md:ml-auto">
                {s.showStockFilter &&
            <label className="flex h-11 cursor-pointer items-center gap-2 whitespace-nowrap px-3 text-[14px] font-medium" style={{ ...chip(inStock), borderRadius: 999 }}>
                    <input type="checkbox" className="sr-only" checked={inStock} onChange={(e) => set('stock', e.target.checked ? '1' : '')} />
                    In stock only
                  </label>
            }
                <label htmlFor="shop-sort" className="sr-only">
                  Sort
                </label>
                <select id="shop-sort" value={sort} onChange={(e) => set('sort', e.target.value === s.defaultSort ? '' : e.target.value)} className="h-11 min-w-0 flex-1 px-3 text-[14px] outline-none md:flex-none" style={inputStyle(theme)}>
                  {sorts.map((o) =>
              <option key={o} value={o}>
                      {sortLabels[o]}
                    </option>
              )}
                </select>
              </div>
            </div>
        }

          {(s.showCollections && collections.length > 0 || hasFeatured) &&
        <nav aria-label="Collections" className="scroll-quiet -mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
              {[{ id: '', name: 'All' }, ...(hasFeatured ? [{ id: '__featured', name: 'Featured' }] : []), ...(s.showCollections ? collections : [])].map((c) => {
            const active = c.id === '__featured' ? featuredOnly : !featuredOnly && collection === c.id;
            const pick = () => {
              const next = new URLSearchParams(params);
              next.delete('c');
              next.delete('f');
              if (c.id === '__featured') next.set('f', '1');else
              if (c.id) next.set('c', c.id);
              setParams(next, { replace: true });
            };
            return (
              <button
                key={c.id || 'all'}
                type="button"
                aria-pressed={active}
                onClick={pick}
                className="inline-flex h-9 shrink-0 items-center whitespace-nowrap rounded-full px-4 text-[14px] font-medium transition-opacity duration-150 hover:opacity-85"
                style={chip(active)}>
                
                    {c.name}
                  </button>);

          })}
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

        <ul className={`grid grid-cols-2 gap-3 md:gap-4 ${gridCols[s.columns]}`}>
              {visible.map((p) =>
          <StoreProductCard
            key={p.id}
            product={p}
            theme={theme}
            href={productHref(p.id)}
            shape={s.imageShape}
            showLowStock={s.showLowStock}
            featured={(featuredOnly || sort === 'featured') && s.featuredIds.includes(p.id)} />

          )}
            </ul>
        }
        </>
      }

      {notes.length > 0 &&
      <section aria-label="Good to know" className="mt-4 grid gap-4 border-t pt-6 md:grid-cols-2" style={{ borderColor: mix(theme.text, 12) }}>
          {notes.map((n) =>
        <div key={n.title} className="flex gap-3">
              <n.icon size={18} aria-hidden className="mt-0.5 shrink-0" style={{ color: theme.mutedText }} />
              <div>
                <h2 className="text-[15px] font-semibold" style={{ color: theme.text }}>
                  {n.title}
                </h2>
                <p className="mt-1 whitespace-pre-line text-[14px] leading-relaxed" style={{ color: theme.mutedText }}>
                  {n.text}
                </p>
              </div>
            </div>
        )}
        </section>
      }
    </div>);

}