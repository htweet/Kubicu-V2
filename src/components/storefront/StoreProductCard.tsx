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
import { useT } from '../../contexts/LocaleContext';

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
  saved?: { on: boolean; toggle: () => void } | null;
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
  saved = null,
}: StoreProductCardProps) {
  // Buyer wording follows the visitor's language (D480); names and options stay as the seller wrote them.
  const { t: tr } = useT();
  const range = priceRange(product);
  const soldOut = isSoldOut(product);
  const low = showLowStock && isLowStock(product);
  const ratio = imageShapeClass[shape];
  const onSale = !!range && product.compareAtNgn !== null && product.compareAtNgn > range[0];
  const image = product.images[0];
  const soldOutStyle = soldOut ? { filter: 'grayscale(0.7)', opacity: 0.7 } : undefined;

  const badges = (
    <>
      {soldOut ? <PageChip theme={theme}>{tr(product.preorder ? 'Pre-orders full' : 'Sold out')}</PageChip> : onSale && showSale ? <PageChip theme={theme}>{tr('Sale')}</PageChip> : null}
      {product.preorder && !soldOut && <PageChip theme={theme}>{tr('Pre-order')}</PageChip>}
      {(product.bulkPrices?.length ?? 0) > 0 && !soldOut && <PageChip theme={theme}>{tr('Bulk prices')}</PageChip>}
      {featured && !soldOut && <PageChip theme={theme}>{tr('Featured')}</PageChip>}
      {low && !soldOut && <PageChip theme={theme}>{tr('Left: {n}', { n: totalStock(product) })}</PageChip>}
    </>
  );

  const price = (size: 'sm' | 'md' = 'md') => (
    <span className={cn('flex items-baseline gap-1.5 font-semibold tabular-nums', size === 'md' ? 'text-[14.5px]' : 'text-[13.5px]')} style={{ color: theme.text }}>
      {range ? (
        <>
          {range[0] !== range[1] && <span className="text-[11px] font-medium" style={{ color: theme.mutedText }}>{tr('from')}</span>}
          {formatNgn(range[0])}
          {onSale && showSale && (
            <s className="text-[12px] font-medium" style={{ color: theme.mutedText }}>
              {formatNgn(product.compareAtNgn as number)}
            </s>
          )}
        </>
      ) : (
        <span style={{ color: theme.mutedText, fontWeight: 500 }}>{tr('Price on request')}</span>
      )}
    </span>
  );

  const photo = (cls: string) =>
    image ? (
      <MediaImage src={image.url} alt={image.alt} loading="lazy" className={cn('w-full object-cover', cls)} style={soldOutStyle} />
    ) : (
      <div className={cn('flex w-full items-center justify-center', cls)} style={{ background: mix(theme.text, 6), color: theme.mutedText }}>
        <ShoppingBagIcon size={22} aria-hidden />
      </div>
    );

  const options = product.variants.length > 1 && (
    <span className="block text-[12px]" style={{ color: theme.mutedText }}>
      {product.options.map((o) => `${o.name}: ${o.values.length}`).join(' · ')}
    </span>
  );

  const inline = variant === 'row' || variant === 'pricelist';
  const add = addMode !== 'page' ? <CardAddControl product={product} theme={theme} mode={addMode} ordering={ordering} whatsappPhone={whatsappPhone} block={!inline} /> : null;

  const heart = saved && (
    <button
      type="button"
      onClick={saved.toggle}
      aria-pressed={saved.on}
      aria-label={saved.on ? tr('Remove {name} from saved', { name: product.name }) : tr('Save {name}', { name: product.name })}
      className={cn('flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-150 ease-out active:scale-95 focus-visible:outline-none focus-visible:ring-2', !inline && 'absolute right-2 top-2 z-10')}
      style={{ background: inline ? 'transparent' : mix(theme.background, 88), color: theme.text }}
    >
      <HeartIcon size={17} aria-hidden fill={saved.on ? 'currentColor' : 'none'} />
    </button>
  );

  const linkFocus = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  if (variant === 'pricelist') {
    // Catalogue (D196c): a printed-menu style entry — name and one line of description, a dotted leader, then price and Add.
    const blurb = product.description.split('\n').map((l) => l.trim()).find(Boolean) ?? '';
    return (
      <li className="flex items-start gap-3 py-3.5 md:gap-4" style={{ borderBottom: `1px dashed ${mix(theme.text, 14)}` }}>
        {image && <span className="relative mt-0.5 hidden h-12 w-12 shrink-0 overflow-hidden rounded-md sm:block">{photo('h-full')}</span>}
        <Link to={href} className={cn('group min-w-0 flex-1 rounded-sm', linkFocus)}>
          <span className="flex items-baseline gap-2">
            <span className="min-w-0 text-[15px] font-semibold leading-snug group-hover:underline group-hover:underline-offset-4" style={{ color: theme.text }}>
              {product.name}
            </span>
            <span aria-hidden className="hidden min-w-[24px] flex-1 translate-y-[-3px] border-b border-dotted sm:block" style={{ borderColor: mix(theme.text, 30) }} />
          </span>
          {blurb && (
            <span className="mt-0.5 line-clamp-1 block text-[13.5px] leading-snug" style={{ color: theme.mutedText }}>
              {blurb}
            </span>
          )}
          {(soldOut || low || (onSale && showSale) || !!product.preorder || !!product.bulkPrices?.length) && <span className="mt-1.5 flex flex-wrap gap-1">{badges}</span>}
        </Link>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {price('md')}
          <div className="flex items-center gap-0.5">
            {heart}
            {add}
          </div>
        </div>
      </li>
    );
  }

  if (variant === 'row' && addMode === 'stepper') {
    // Quick order (D196b): one tight line per item — photo, name and price, then the stepper. No second column.
    return (
      <li className="flex min-h-[72px] items-center gap-3 py-2" style={{ borderBottom: `1px solid ${mix(theme.text, 10)}` }}>
        <Link to={href} className={cn('group flex min-w-0 flex-1 items-center gap-3 rounded-md', linkFocus)}>
          <span className="relative block h-14 w-14 shrink-0 overflow-hidden rounded-md">{photo('h-full')}</span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="line-clamp-1 text-[15px] font-semibold leading-snug" style={{ color: theme.text }}>
              {product.name}
            </span>
            <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              {price('sm')}
              {(soldOut || (onSale && showSale) || low || !!product.preorder) && <span className="flex flex-wrap gap-1">{badges}</span>}
            </span>
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-0.5">
          {heart}
          {add}
        </div>
      </li>
    );
  }

  if (variant === 'row') {
    return (
      <li className="flex items-center gap-3 py-3" style={{ borderBottom: `1px solid ${mix(theme.text, 10)}` }}>
        <Link to={href} className={cn('group flex min-w-0 flex-1 items-center gap-3 rounded-md', linkFocus)}>
          <span className="relative block h-16 w-16 shrink-0 overflow-hidden rounded-md md:h-[72px] md:w-[72px]">{photo('h-full')}</span>
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
      </li>
    );
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
      </li>
    );
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
    </li>
  );
}
