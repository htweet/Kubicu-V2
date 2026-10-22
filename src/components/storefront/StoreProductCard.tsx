import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBagIcon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import type { Product } from '../../types/commerce';
import { MediaImage } from '../media/MediaImage';
import { PageChip } from '../blocks/BlockTitle';
import { cardStyle, mix } from '../blocks/pageStyle';
import { isLowStock, isSoldOut, priceRange, totalStock } from '../../utils/commerce/catalog';
import { formatNgn } from '../../utils/format';

/** One product in the storefront grid. The whole card opens the product page. */
export function StoreProductCard({ product, theme, href }: {product: Product;theme: PageTheme;href: string;}) {
  const range = priceRange(product);
  const soldOut = isSoldOut(product);
  const low = isLowStock(product);
  const onSale = !!range && product.compareAtNgn !== null && product.compareAtNgn > range[0];
  const image = product.images[0];

  return (
    <li className="flex">
      <Link
        to={href}
        className="group flex w-full flex-col overflow-hidden transition-transform duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.99]"
        style={cardStyle(theme)}>
        
        <div className="relative overflow-hidden">
          {image ?
          <MediaImage
            src={image.url}
            alt={image.alt}
            loading="lazy"
            className="aspect-[4/5] w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
            style={soldOut ? { filter: 'grayscale(0.7)', opacity: 0.7 } : undefined} /> :


          <div className="flex aspect-[4/5] w-full items-center justify-center" style={{ background: mix(theme.text, 6), color: theme.mutedText }}>
              <ShoppingBagIcon size={24} aria-hidden />
            </div>
          }
          <span className="absolute left-2 top-2 flex flex-wrap gap-1">
            {soldOut ? <PageChip theme={theme}>Sold out</PageChip> : onSale ? <PageChip theme={theme}>Sale</PageChip> : null}
            {low && !soldOut && <PageChip theme={theme}>Only {totalStock(product)} left</PageChip>}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-1 p-3">
          <h3 className="line-clamp-2 text-[14.5px] font-semibold leading-snug" style={{ color: theme.text }}>
            {product.name}
          </h3>
          {product.variants.length > 1 &&
          <p className="text-[12px]" style={{ color: theme.mutedText }}>
              {product.options.map((o) => `${o.values.length} ${o.name.toLowerCase()}${o.values.length === 1 ? '' : 's'}`).join(' · ')}
            </p>
          }
          <p className="mt-auto flex items-baseline gap-1.5 pt-1 text-[14.5px] font-semibold tabular-nums" style={{ color: theme.text }}>
            {range ?
            <>
                {range[0] !== range[1] && <span className="text-[11px] font-medium" style={{ color: theme.mutedText }}>from</span>}
                {formatNgn(range[0])}
                {onSale &&
              <s className="text-[12.5px] font-medium" style={{ color: theme.mutedText }}>
                    {formatNgn(product.compareAtNgn as number)}
                  </s>
              }
              </> :

            <span style={{ color: theme.mutedText, fontWeight: 500 }}>Price on request</span>
            }
          </p>
        </div>
      </Link>
    </li>);

}