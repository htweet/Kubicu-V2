import React from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, ShoppingBagIcon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import type { Product, ShopAddMode, ShopCardStyle } from '../../types/commerce';
import { MediaImage } from '../media/MediaImage';
import { PageChip } from '../blocks/BlockTitle';
import { cardStyle, mix } from '../blocks/pageStyle';
import { CardAddControl } from './CardAddControl';
import { isLowStock, isSoldOut, priceRange, totalStock } from '../../utils/commerce/catalog';
import { formatNgn } from '../../utils/format';
import { imageShapeClass } from '../../utils/commerce/storefront';
import { cn } from '../../utils/cn';

interface StoreProductCardProps {
  product: Product;
  theme: PageTheme;
  href: string;
  shape?: 'portrait' | 'square' | 'landscape';
  showLowStock?: boolean;
  featured?: boolean;
  /** D196 */
  variant?: ShopCardStyle;
  showSale?: boolean;
  addMode?: ShopAddMode;
  ordering?: 'checkout' | 'whatsapp';
  whatsappPhone?: string;
  saved?: {on: boolean;toggle: () => void;} | null;
}

/** One product in the storefront. The photo and name open the product page; Add and the heart sit beside that link. */
export function StoreProductCard({
  product,
  theme,
  href,
  shape = 'portrait',
  showLowStock = true,
  featured = false,
  variant = 'standard',
  showSale = true,
  addMode = 'page',
  ordering = 'checkout',
  whatsappPhone = '',
  saved = null
}: StoreProductCardProps) {
  const range = priceRange(product);
  const soldOut = isSoldOut(product);
  const low = showLowStock && isLowStock(product);
  const ratio = imageShapeClass[shape];
  const onSale = !!range && product.compareAtNgn !== null && product.compareAtNgn > range[0];
  const image = product.images[0];
  const soldOutStyle = soldOut ? { filter: 'grayscale(0.7)', opacity: 0.7 } : undefined;

  const badges =
  <>
      {soldOut ? <PageChip theme={theme}>Sold out</PageChip> : onSale && showSale ? <PageChip theme={theme}>Sale</PageChip> : null}
      {featured && !soldOut && <PageChip theme={theme}>Featured</PageChip>}
      {low && !soldOut && <PageChip theme={theme}>Only {totalStock(product)} left</PageChip>}
    </>;


  const price = (size: 'sm' | 'md' = 'md') =>
  <span className={cn('flex items-baseline gap-1.5 font-semibold tabular-nums', size === 'md' ? 'text-[14.5px]' : 'text-[13.5px]')} style={{ color: theme.text }}>
      {range ?
    <>
          {range[0] !== range[1] && <span className="text-[11px] font-medium" style={{ color: theme.mutedText }}>from</span>}
          {formatNgn(range[0])}
          {onSale && showSale &&
      <s className="text-[12px] font-medium" style={{ color: theme.mutedText }}>
              {formatNgn(product.compareAtNgn as number)}
            </s>
      }
        </> :

    <span style={{ color: theme.mutedText, fontWeight: 500 }}>Price on request</span>
    }
    </span>;


  const photo = (cls: string) =>
  image ?
  <MediaImage src={image.url} alt={image.alt} loading="lazy" className={cn('w-full object-cover', cls)} style={soldOutStyle} /> :

  <div className={cn('flex w-full items-center justify-center', cls)} style={{ background: mix(theme.text, 6), color: theme.mutedText }}>
        <ShoppingBagIcon size={22} aria-hidden />
      </div>;


  const options = product.variants.length > 1 &&
  <span className="block text-[12px]" style={{ color: theme.mutedText }}>
      {product.options.map((o) => `${o.values.length} ${o.name.toLowerCase()}${o.values.length === 1 ? '' : 's'}`).join(' · ')}
    </span>;


  const add = addMode !== 'page' ? <CardAddControl product={product} theme={theme} mode={addMode} ordering={ordering} whatsappPhone={whatsappPhone} block={variant !== 'row'} /> : null;

  const heart = saved &&
  <button
    type="button"
    onClick={saved.toggle}
    aria-pressed={saved.on}
    aria-label={saved.on ? `Remove ${product.name} from saved` : `Save ${product.name}`}
    className={cn('flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-150 ease-out active:scale-95 focus-visible:outline-none focus-visible:ring-2', variant !== 'row' && 'absolute right-2 top-2 z-10')}
    style={{ background: variant === 'row' ? 'transparent' : mix(theme.background, 88), color: theme.text }}>
    
      <HeartIcon size={17} aria-hidden fill={saved.on ? 'currentColor' : 'none'} />
    </button>;


  const linkFocus = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  if (variant === 'row') {
    return (
      <li className="flex items-center gap-3 py-3" style={{ borderBottom: `1px solid ${mix(theme.text, 10)}` }}>
        <Link to={href} className={cn('group flex min-w-0 flex-1 items-center gap-3 rounded-md', linkFocus)}>
          <span className="relative block h-[72px] w-[72px] shrink-0 overflow-hidden rounded-md">{photo('h-full')}</span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="line-clamp-2 text-[15px] font-semibold leading-snug" style={{ color: theme.text }}>
              {product.name}
            </span>
            {options}
            <span className="mt-0.5 flex flex-wrap gap-1">{badges}</span>
          </span>
        </Link>
        <div className="flex shrink-0 flex-col items-end gap-2">
          {price('md')}
          <div className="flex items-center gap-1">
            {heart}
            {add}
          </div>
        </div>
      </li>);

  }

  if (variant === 'overlay') {
    return (
      <li className="relative flex">
        {heart}
        <div className="flex w-full flex-col gap-2">
          <Link to={href} className={cn('group relative block overflow-hidden', linkFocus)} style={{ borderRadius: cardStyle(theme).borderRadius }}>
            {photo(`${ratio} transition-transform duration-300 ease-out group-hover:scale-[1.03]`)}
            <span className="absolute left-2 top-2 flex flex-wrap gap-1">{badges}</span>
            <span className="absolute inset-x-2 bottom-2 flex flex-col gap-0.5 rounded-md px-3 py-2" style={{ background: mix(theme.background, 90) }}>
              <span className="line-clamp-1 text-[14px] font-semibold" style={{ color: theme.text }}>
                {product.name}
              </span>
              {price('sm')}
            </span>
          </Link>
          {add}
        </div>
      </li>);

  }

  const minimal = variant === 'minimal';
  return (
    <li className="relative flex">
      {heart}
      <div className="flex w-full flex-col overflow-hidden" style={minimal ? undefined : cardStyle(theme)}>
        <Link to={href} className={cn('group flex flex-1 flex-col transition-transform duration-150 ease-out active:scale-[0.99]', linkFocus)}>
          <span className="relative block overflow-hidden" style={minimal ? { borderRadius: cardStyle(theme).borderRadius } : undefined}>
            {photo(`${ratio} transition-transform duration-300 ease-out group-hover:scale-[1.03]`)}
            <span className="absolute left-2 top-2 flex flex-wrap gap-1">{badges}</span>
          </span>
          <span className={cn('flex flex-1 flex-col gap-1', minimal ? 'px-0.5 pt-2.5' : 'p-3')}>
            <span className={cn('line-clamp-2 leading-snug', minimal ? 'text-[14px] font-medium' : 'text-[14.5px] font-semibold')} style={{ color: theme.text }}>
              {product.name}
            </span>
            {!minimal && options}
            <span className="mt-auto pt-1">{price(minimal ? 'sm' : 'md')}</span>
          </span>
        </Link>
        {add && <div className={minimal ? 'pt-2' : 'px-3 pb-3'}>{add}</div>}
      </div>
    </li>);

}