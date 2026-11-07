import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRightIcon, LibraryBigIcon, ShoppingBagIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { BlockTitle, PageChip } from './BlockTitle';
import { MediaImage } from '../media/MediaImage';
import { cardStyle, mix } from './pageStyle';
import { useCatalog } from '../../contexts/CatalogContext';
import { canSell, isSoldOut, priceRange } from '../../utils/commerce/catalog';
import { formatNgn } from '../../utils/format';
import { productSlug, STOREFRONT_PATH } from '../../utils/commerce/storefront';
import { pageHref } from '../../utils/sitePages';

/** One Commerce collection as a strip or grid, linking into the shop filtered to it (D124). */
export function CollectionBlock({ block, theme: t, mode }: BlockProps<'collection'>) {
  const c = block.content;
  const catalog = useCatalog();
  const { handle } = useParams();
  const col = catalog?.collections.find((x) => x.id === c.collectionId);
  const all = col && catalog ? catalog.products.filter((p) => p.collectionIds.includes(col.id) && p.kind !== 'ticket' && canSell(p)) : [];
  const items = all.slice(0, Math.max(1, c.limit));

  if (!col || items.length === 0) {
    return mode === 'edit' ? (
      <BlockPlaceholder
        icon={LibraryBigIcon}
        title={!col ? 'Choose a collection' : `“${col.name}” has no active products`}
        hint={!col ? 'Pick one in the inspector. Create collections in Commerce → Products.' : 'Drafts, archived and unpriced items are hidden.'}
        theme={t}
        tall
      />
    ) : null;
  }

  const shopHref = handle ? `${pageHref(handle, STOREFRONT_PATH)}?c=${encodeURIComponent(col.id)}` : '';
  const products = catalog?.products ?? [];
  const strip = c.layout === 'strip';

  return (
    <section>
      <BlockTitle
        theme={t}
        aside={
          c.showSeeAll && all.length > items.length ? (
            mode === 'live' && shopHref ? (
              <Link to={shopHref} className="inline-flex items-center gap-1 text-[13px] font-semibold focus-visible:outline-none focus-visible:ring-2" style={{ color: t.text }}>
                See all {all.length} <ArrowRightIcon size={14} aria-hidden />
              </Link>
            ) : (
              <span className="text-[13px] font-semibold" style={{ color: t.text }}>See all {all.length}</span>
            )
          ) : undefined
        }
      >
        {c.title || col.name}
      </BlockTitle>
      <ul className={strip ? 'scroll-quiet -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden px-1 pb-1' : 'grid grid-cols-2 gap-3'}>
        {items.map((p) => {
          const range = priceRange(p);
          const sold = isSoldOut(p);
          const inner = (
            <>
              <div className="relative">
                {p.images[0] ? (
                  <MediaImage src={p.images[0].url} alt={p.images[0].alt} loading="lazy" className="aspect-square w-full object-cover" style={sold ? { filter: 'grayscale(0.7)', opacity: 0.7 } : undefined} />
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center" style={{ background: mix(t.text, 6), color: t.mutedText }}>
                    <ShoppingBagIcon size={20} aria-hidden />
                  </div>
                )}
                {sold && <span className="absolute left-2 top-2"><PageChip theme={t}>Sold out</PageChip></span>}
              </div>
              <div className="flex flex-1 flex-col gap-0.5 p-3">
                <span className="line-clamp-2 text-[13.5px] font-semibold leading-snug" style={{ color: t.text }}>{p.name}</span>
                <span className="mt-auto pt-1 text-[13.5px] font-semibold tabular-nums" style={{ color: t.text }}>
                  {range ? `${range[0] !== range[1] ? 'from ' : ''}${formatNgn(range[0])}` : <span style={{ color: t.mutedText, fontWeight: 500 }}>Price on request</span>}
                </span>
              </div>
            </>
          );
          const href = handle ? pageHref(handle, `${STOREFRONT_PATH}/${productSlug(p, products)}`) : '';
          return (
            <li key={p.id} className={strip ? 'w-[44%] shrink-0 snap-start sm:w-[34%]' : ''}>
              {mode === 'live' && href ? (
                <Link to={href} className="flex h-full flex-col overflow-hidden focus-visible:outline-none focus-visible:ring-2" style={cardStyle(t)}>
                  {inner}
                </Link>
              ) : (
                <div className="flex h-full flex-col overflow-hidden" style={cardStyle(t)}>{inner}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
