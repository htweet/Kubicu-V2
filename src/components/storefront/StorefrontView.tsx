import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MegaphoneIcon, RotateCcwIcon, SearchIcon, SearchXIcon, ShoppingBagIcon, TruckIcon, XIcon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import type { CommerceData, Product } from '../../types/commerce';
import { StoreProductCard } from './StoreProductCard';
import { ShopHeader } from './ShopHeader';
import { ShopFeatured } from './ShopFeatured';
import { ShopCollectionsNav, type NavItem } from './ShopCollectionsNav';
import { inputStyle, mix } from '../blocks/pageStyle';
import { shopProducts, sortLabels, sortProducts, storefrontConfig, type StorefrontSort } from '../../utils/commerce/storefront';
import { isSoldOut } from '../../utils/commerce/catalog';
import { discountStatus } from '../../utils/commerce/discounts';
import { useSavedItems } from '../../hooks/useShopMemory';
import { cn } from '../../utils/cn';

interface StorefrontViewProps {
  theme: PageTheme;
  data: CommerceData;
  productHref: (id: string) => string;
  ordering: 'checkout' | 'whatsapp';
  whatsappPhone: string;
  /** Visitor memory (saved items) key; null in previews. */
  shopKey: string | null;
}

const sorts = Object.keys(sortLabels) as StorefrontSort[];
const gridCols: Record<2 | 3 | 4, string> = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-3 lg:grid-cols-4'
};

/** The auto-built shop in the seller's chosen look (D53, D98, D196). */
export function StorefrontView({ theme, data, productHref, ordering, whatsappPhone, shopKey }: StorefrontViewProps) {
  const [params, setParams] = useSearchParams();
  const s = storefrontConfig(data.storefront);
  const saved = useSavedItems(s.savedItems ? shopKey : null);
  const q = s.showSearch ? params.get('q') ?? '' : '';
  const collection = s.showCollections ? params.get('c') ?? '' : '';
  const sort = (sorts.includes(params.get('sort') as StorefrontSort) ? params.get('sort') : s.defaultSort) as StorefrontSort;
  const inStock = s.showStockFilter && params.get('stock') === '1';
  const featuredOnly = s.featuredIds.length > 0 && params.get('f') === '1';
  const savedOnly = s.savedItems && params.get('saved') === '1';

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);else
    next.delete(key);
    setParams(next, { replace: true });
  };

  const all = useMemo(() => shopProducts(data), [data]);
  const collections = data.collections.filter((c) => all.some((p) => p.collectionIds.includes(c.id)));
  const filtered = !!(q || collection || inStock || featuredOnly || savedOnly);

  // The featured area shows when nothing is filtered; whatever it shows is left out of the grid below.
  const featured = useMemo<Product[]>(() => {
    if (s.featuredStyle === 'none' || filtered) return [];
    const pinned = s.featuredIds.map((id) => all.find((p) => p.id === id)).filter((p): p is Product => !!p);
    if (s.featuredStyle === 'row') return pinned.slice(0, 4);
    const pool = pinned.length ? pinned : sortProducts(all, 'featured', []);
    return pool.slice(0, s.featuredStyle === 'hero' ? 3 : 1);
  }, [s.featuredStyle, s.featuredIds, all, filtered]);

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    const shown = new Set(featured.map((p) => p.id));
    const list = all.filter(
      (p) =>
      !shown.has(p.id) && (
      !collection || p.collectionIds.includes(collection)) && (
      !featuredOnly || s.featuredIds.includes(p.id)) && (
      !savedOnly || saved.ids.includes(p.id)) && (
      !inStock || !isSoldOut(p)) && (
      !term || `${p.name} ${p.description} ${p.variants.map((v) => Object.values(v.options).join(' ')).join(' ')}`.toLowerCase().includes(term))
    );
    return sortProducts(list, featuredOnly ? 'featured' : sort, s.featuredIds);
  }, [all, q, collection, inStock, sort, s.featuredIds, featuredOnly, savedOnly, saved.ids, featured]);

  const offer = data.discounts.find((d) => d.kind === 'automatic' && discountStatus(d, data) === 'active');
  const activeCollection = collections.find((c) => c.id === collection);
  const hasFeatured = s.featuredIds.some((id) => all.some((p) => p.id === id));
  const notes = [
  s.deliveryNote.trim() && { icon: TruckIcon, title: 'Delivery', text: s.deliveryNote.trim() },
  s.returnsNote.trim() && { icon: RotateCcwIcon, title: 'Returns & exchanges', text: s.returnsNote.trim() }].
  filter(Boolean) as {icon: typeof TruckIcon;title: string;text: string;}[];

  const navItems: NavItem[] = [
  { id: '', name: 'All', active: !featuredOnly && !savedOnly && !collection, count: all.length },
  ...(hasFeatured && s.featuredStyle !== 'row' ? [{ id: '__featured', name: 'Featured', active: featuredOnly }] : []),
  ...(s.savedItems && saved.ids.some((id) => all.some((p) => p.id === id)) ? [{ id: '__saved', name: `Saved (${saved.ids.filter((id) => all.some((p) => p.id === id)).length})`, active: savedOnly }] : []),
  ...(s.showCollections ? collections.map((c) => ({ id: c.id, name: c.name, active: !featuredOnly && !savedOnly && collection === c.id, count: all.filter((p) => p.collectionIds.includes(c.id)).length })) : [])];

  const pick = (id: string) => {
    const next = new URLSearchParams(params);
    ['c', 'f', 'saved'].forEach((k) => next.delete(k));
    if (id === '__featured') next.set('f', '1');else
    if (id === '__saved') next.set('saved', '1');else
    if (id) next.set('c', id);
    setParams(next, { replace: true });
  };
  const side = s.collectionsStyle === 'side' && navItems.length > 1;
  const chip = (active: boolean): React.CSSProperties => ({ background: active ? theme.text : mix(theme.text, 6), color: active ? theme.background : theme.text });

  const card = (p: Product) =>
  <StoreProductCard
    key={p.id}
    product={p}
    theme={theme}
    href={productHref(p.id)}
    shape={s.imageShape}
    showLowStock={s.showLowStock}
    featured={(featuredOnly || sort === 'featured') && s.featuredIds.includes(p.id) && s.featuredStyle === 'none'}
    variant={s.cardStyle}
    showSale={s.showSaleBadges}
    addMode={s.addMode}
    ordering={ordering}
    whatsappPhone={whatsappPhone}
    saved={s.savedItems ? { on: saved.has(p.id), toggle: () => saved.toggle(p.id) } : null} />;


  const rows = s.cardStyle === 'row';
  const priceList = s.cardStyle === 'pricelist';
  // Price list (Catalogue): grouped under collection headings when the shopper hasn't narrowed things down.
  const groups = useMemo(() => {
    if (!priceList || collection || q || featuredOnly || savedOnly || collections.length === 0) return null;
    const used = new Set<string>();
    const out = collections.
    map((c) => {
      const items = visible.filter((p) => !used.has(p.id) && p.collectionIds.includes(c.id));
      items.forEach((p) => used.add(p.id));
      return { id: c.id, name: c.name, items };
    }).
    filter((g) => g.items.length > 0);
    const rest = visible.filter((p) => !used.has(p.id));
    if (rest.length) out.push({ id: '__rest', name: 'More', items: rest });
    return out;
  }, [priceList, collection, q, featuredOnly, savedOnly, collections, visible]);

  return (
    <div className="flex flex-col gap-5">
      {s.announcement.trim() &&
      <p className="flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-[14px] font-medium" style={{ background: mix(theme.accent, 14, theme.background), color: theme.text }}>
          <MegaphoneIcon size={15} aria-hidden className="shrink-0" />
          {s.announcement.trim()}
        </p>
      }

      <ShopHeader
        theme={theme}
        style={s.header}
        title={activeCollection ? activeCollection.name : s.title || 'Shop'}
        intro={activeCollection ? activeCollection.description : s.intro}
        bannerUrl={s.bannerUrl}
        bannerAlt={s.bannerAlt}
        offer={offer ? offer.title : null}
        inCollection={!!activeCollection} />
      

      {all.length === 0 ?
      <div className="flex flex-col items-center gap-2 py-16 text-center">
          <ShoppingBagIcon size={28} aria-hidden style={{ color: theme.mutedText }} />
          <p className="text-[16px] font-medium">Nothing in the shop yet</p>
          <p className="text-[14px]" style={{ color: theme.mutedText }}>
            New pieces are on the way. Check back soon.
          </p>
        </div> :

      <>
          {s.featuredStyle !== 'none' && featured.length > 0 &&
        <ShopFeatured theme={theme} style={s.featuredStyle} products={featured} productHref={productHref} ordering={ordering} whatsappPhone={whatsappPhone} renderCard={card} />
        }

          <div className={cn('flex flex-col gap-5', side && 'lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:items-start lg:gap-10')}>
            {side && <ShopCollectionsNav theme={theme} style={s.collectionsStyle} items={navItems} onPick={pick} placement="side" />}
            <div className="flex min-w-0 flex-col gap-5">
              {(s.showSearch || s.showStockFilter || all.length > 1) &&
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  {s.showSearch &&
              <div className="relative md:w-72">
                      <label htmlFor="shop-search" className="sr-only">
                        Search products
                      </label>
                      <SearchIcon size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: theme.mutedText }} aria-hidden />
                      <input id="shop-search" type="search" value={q} placeholder="Search" onChange={(e) => set('q', e.target.value)} className="h-11 w-full pl-10 pr-3.5 text-[15px] outline-none focus:ring-2" style={inputStyle(theme)} />
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

              {(s.showCollections || hasFeatured || s.savedItems) && <ShopCollectionsNav theme={theme} style={s.collectionsStyle} items={navItems} onPick={pick} placement="top" />}

              <p className="text-[13px]" style={{ color: theme.mutedText }} aria-live="polite">
                {visible.length} {visible.length === 1 ? 'product' : 'products'}
                {featured.length > 0 ? ' more' : ''}
              </p>

              {visible.length === 0 ?
            <div className="flex flex-col items-center gap-2 py-12 text-center">
                  <SearchXIcon size={26} aria-hidden style={{ color: theme.mutedText }} />
                  <p className="text-[15px] font-medium">{savedOnly ? 'Nothing saved yet' : featured.length ? 'That’s everything' : 'No products match'}</p>
                  {filtered &&
              <button type="button" onClick={() => setParams(new URLSearchParams(), { replace: true })} className="mt-1 inline-flex items-center gap-1.5 text-[14px] font-semibold underline underline-offset-4">
                      <XIcon size={14} aria-hidden /> Clear filters
                    </button>
              }
                </div> :
            priceList ?
            groups ?
            <div className="flex max-w-3xl flex-col gap-8">
                    {groups.map((g) =>
              <section key={g.id} aria-labelledby={`pl-${g.id}`}>
                        <h2 id={`pl-${g.id}`} className="pb-1 text-[17px] font-semibold" style={{ color: theme.text, borderBottom: `2px solid ${theme.text}` }}>
                          {g.name}
                        </h2>
                        <ul>{g.items.map(card)}</ul>
                      </section>
              )}
                  </div> :

            <ul className="max-w-3xl">{visible.map(card)}</ul> :

            rows ?
            <ul className={cn('grid grid-cols-1', s.addMode === 'stepper' ? 'md:grid-cols-2 md:gap-x-10 xl:grid-cols-3' : 'md:grid-cols-2 md:gap-x-8')}>{visible.map(card)}</ul> :

            <ul className={cn('grid grid-cols-2', s.cardStyle === 'minimal' ? 'gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10' : 'gap-3 md:gap-4', gridCols[s.columns])}>{visible.map(card)}</ul>
            }
            </div>
          </div>
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