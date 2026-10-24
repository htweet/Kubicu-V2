import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, CheckIcon, MessageCircleIcon, ShoppingBagIcon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import type { CommerceData, Product } from '../../types/commerce';
import { MediaImage } from '../media/MediaImage';
import { StoreProductCard } from './StoreProductCard';
import { buttonRadius, buttonStyle, fontsFor, mix } from '../blocks/pageStyle';
import { useCart } from '../../contexts/CartContext';
import { canSell, isSoldOut, priceRange, variantLabel, variantPrice } from '../../utils/commerce/catalog';
import { matchVariant, shopProducts, valueAvailable } from '../../utils/commerce/storefront';
import { formatNgn, whatsappLink } from '../../utils/format';
import { cn } from '../../utils/cn';

interface ProductDetailViewProps {
  theme: PageTheme;
  data: CommerceData;
  product: Product;
  ordering: 'checkout' | 'whatsapp';
  whatsappPhone: string;
  shopHref: string;
  productHref: (id: string) => string;
}

/** A product's own page in the storefront: photos, options, stock and one clear way to buy (D53). */
export function ProductDetailView({ theme, data, product, ordering, whatsappPhone, shopHref, productHref }: ProductDetailViewProps) {
  const cart = useCart();
  const [imageIndex, setImageIndex] = useState(0);
  const [chosen, setChosen] = useState<Record<string, string>>({});
  const [tried, setTried] = useState(false);

  useEffect(() => {
    setImageIndex(0);
    setChosen({});
    setTried(false);
    window.scrollTo(0, 0);
  }, [product.id]);

  const variant = matchVariant(product, chosen);
  const price = variant ? variantPrice(product, variant) : null;
  const range = priceRange(product);
  const soldOut = isSoldOut(product);
  const available = variant ? canSell(product, variant) : !soldOut;
  const missing = product.options.filter((o) => !chosen[o.name]);
  const onSale = product.compareAtNgn !== null && (price ?? range?.[0] ?? Infinity) < product.compareAtNgn;
  const image = product.images[imageIndex] ?? product.images[0];
  const related = shopProducts(data).
  filter((p) => p.id !== product.id && p.collectionIds.some((c) => product.collectionIds.includes(c))).
  slice(0, 4);
  const collection = data.collections.find((c) => product.collectionIds.includes(c.id));

  const buy = () => {
    setTried(true);
    if (!variant || !available || !cart) return;
    cart.add(product.id, variant.id);
  };
  const waMessage = `Hi! I’d like to order: ${product.name}${variant && Object.keys(variant.options).length ? ` (${variantLabel(variant)})` : ''}${price !== null ? ` — ${formatNgn(price)}` : ''}.`;
  const primary = { ...buttonStyle(theme, 'featured'), borderRadius: buttonRadius(theme) };

  return (
    <div className="flex flex-col gap-10">
      <Link to={shopHref} className="inline-flex items-center gap-1.5 self-start pt-2 text-[14px] font-medium" style={{ color: theme.mutedText }}>
        <ArrowLeftIcon size={15} aria-hidden /> {collection ? collection.name : 'All products'}
      </Link>

      <article className="grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-12">
        <div className="flex flex-col gap-3">
          {image ?
          <MediaImage src={image.url} alt={image.alt} className="aspect-[4/5] w-full rounded-lg object-cover" style={soldOut ? { filter: 'grayscale(0.6)' } : undefined} /> :

          <div className="flex aspect-[4/5] w-full items-center justify-center rounded-lg" style={{ background: mix(theme.text, 6), color: theme.mutedText }}>
              <ShoppingBagIcon size={32} aria-hidden />
            </div>
          }
          {product.images.length > 1 &&
          <div className="scroll-quiet flex gap-2 overflow-x-auto" role="group" aria-label="Product photos">
              {product.images.map((img, i) =>
            <button
              key={img.id}
              type="button"
              aria-label={`Photo ${i + 1} of ${product.images.length}`}
              aria-pressed={i === imageIndex}
              onClick={() => setImageIndex(i)}
              className="h-20 w-16 shrink-0 overflow-hidden rounded-md transition-opacity duration-150"
              style={{ outline: i === imageIndex ? `2px solid ${theme.text}` : 'none', outlineOffset: 2, opacity: i === imageIndex ? 1 : 0.65 }}>
              
                  <MediaImage src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
            )}
            </div>
          }
        </div>

        <div className="flex flex-col gap-5 md:pt-2">
          <div>
            <h1 className="text-[26px] font-medium leading-tight tracking-[-0.015em] md:text-[32px]" style={{ fontFamily: fontsFor(theme).display, color: theme.text }}>
              {product.name}
            </h1>
            <p className="mt-2 flex items-baseline gap-2 text-[20px] font-semibold tabular-nums">
              {price !== null ? formatNgn(price) : range ? range[0] === range[1] ? formatNgn(range[0]) : `${formatNgn(range[0])} – ${formatNgn(range[1])}` : <span style={{ color: theme.mutedText }}>Price on request</span>}
              {onSale &&
              <s className="text-[15px] font-medium" style={{ color: theme.mutedText }}>
                  {formatNgn(product.compareAtNgn as number)}
                </s>
              }
            </p>
          </div>

          {product.options.map((o) =>
          <fieldset key={o.id}>
              <legend className="mb-2 text-[13.5px] font-semibold">
                {o.name}
                {chosen[o.name] && <span style={{ color: theme.mutedText, fontWeight: 400 }}> · {chosen[o.name]}</span>}
              </legend>
              <div className="flex flex-wrap gap-2">
                {o.values.map((value) => {
                const on = chosen[o.name] === value;
                const ok = valueAvailable(product, chosen, o.name, value);
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setChosen((c) => ({ ...c, [o.name]: value }))}
                    className={cn('inline-flex h-11 min-w-[44px] items-center justify-center gap-1.5 px-4 text-[14px] font-medium transition-colors duration-150', !ok && 'line-through')}
                    style={{
                      borderRadius: buttonRadius(theme),
                      border: `1.5px solid ${on ? theme.text : mix(theme.text, 16)}`,
                      background: on ? mix(theme.text, 8) : 'transparent',
                      color: ok ? theme.text : theme.mutedText
                    }}>
                    
                      {on && <CheckIcon size={14} aria-hidden />}
                      {value}
                      {!ok && <span className="sr-only"> (sold out)</span>}
                    </button>);

              })}
              </div>
            </fieldset>
          )}

          <p className="text-[13.5px] font-medium" style={{ color: theme.mutedText }} aria-live="polite">
            {soldOut ?
            'Sold out right now.' :
            variant ?
            !available ?
            'This option is sold out — try another.' :
            product.trackStock && product.kind === 'physical' && variant.stock <= product.lowStockAt ?
            `Only ${variant.stock} left.` :
            product.kind === 'digital' ?
            'Instant download after payment.' :
            'In stock.' :
            tried && missing.length ?
            `Choose ${missing.map((m) => m.name.toLowerCase()).join(' and ')}.` :
            `Choose ${missing.map((m) => m.name.toLowerCase()).join(' and ')} to see availability.`}
          </p>

          {ordering === 'checkout' ?
          <button type="button" onClick={buy} disabled={soldOut || !!variant && !available} className="flex h-12 w-full items-center justify-center gap-2 text-[15px] font-semibold transition-opacity duration-150 disabled:cursor-not-allowed disabled:opacity-50" style={primary}>
              <ShoppingBagIcon size={16} aria-hidden />
              {soldOut ? 'Sold out' : 'Add to cart'}
            </button> :

          <a
            href={variant && available ? whatsappLink(whatsappPhone, waMessage) : undefined}
            target="_blank"
            rel="noreferrer"
            aria-disabled={!variant || !available}
            onClick={(e) => {
              if (!variant || !available) {
                e.preventDefault();
                setTried(true);
              }
            }}
            className={cn('flex h-12 w-full items-center justify-center gap-2 text-[15px] font-semibold', (!variant || !available) && 'opacity-60')}
            style={primary}>
            
              <MessageCircleIcon size={16} aria-hidden />
              {soldOut ? 'Sold out' : 'Order on WhatsApp'}
            </a>
          }

          {product.bundle &&
          <p className="text-[14px] leading-snug" style={{ color: theme.mutedText }}>
              Made together with <strong style={{ color: theme.text }}>{product.bundle.partnerName}</strong>
              {product.bundle.partnerPart ? ` — ${product.bundle.partnerPart}` : ''}. One payment; each business is paid its own part.
            </p>
          }

          {product.description &&
          <div className="border-t pt-5 text-[15px] leading-relaxed" style={{ borderColor: mix(theme.text, 12) }}>
              {product.description.split('\n').filter(Boolean).map((para, i) =>
            <p key={i} className={i ? 'mt-3' : undefined}>
                  {para}
                </p>
            )}
            </div>
          }
        </div>
      </article>

      {related.length > 0 &&
      <section aria-labelledby="related-heading" className="flex flex-col gap-3">
          <h2 id="related-heading" className="text-[18px] font-medium" style={{ fontFamily: fontsFor(theme).display }}>
            More from {collection?.name ?? 'the shop'}
          </h2>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {related.map((p) =>
          <StoreProductCard key={p.id} product={p} theme={theme} href={productHref(p.id)} />
          )}
          </ul>
        </section>
      }
    </div>);

}