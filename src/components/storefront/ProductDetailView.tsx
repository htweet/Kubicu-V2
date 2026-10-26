import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, CheckIcon, MessageCircleIcon, Share2Icon, ShoppingBagIcon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import type { CommerceData, Product } from '../../types/commerce';
import { StoreProductCard } from './StoreProductCard';
import { ProductGallery } from './ProductGallery';
import { ProductReviews } from './ProductReviews';
import { buttonRadius, buttonStyle, fontsFor, mix } from '../blocks/pageStyle';
import { useCart } from '../../contexts/CartContext';
import { useRecentlyViewed } from '../../hooks/useShopMemory';
import { canSell, isSoldOut, priceRange, variantLabel, variantPrice } from '../../utils/commerce/catalog';
import { matchVariant, shopProducts, storefrontConfig, valueAvailable } from '../../utils/commerce/storefront';
import { formatNgn, whatsappLink } from '../../utils/format';
import { isValidPhone } from '../../utils/validation';
import { cn } from '../../utils/cn';
import { bulkLevels, isPreorder, preorderLeft, shipsByLabel } from '../../utils/commerce/sellModes';

interface ProductDetailViewProps {
  theme: PageTheme;
  data: CommerceData;
  product: Product;
  ordering: 'checkout' | 'whatsapp';
  whatsappPhone: string;
  shopHref: string;
  productHref: (id: string) => string;
  /** Visitor memory (recently viewed) key; null in previews, which also never scroll the window. */
  shopKey: string | null;
}

/** A product's own page in the storefront, in the shop's chosen layout and features (D53, D196). */
export function ProductDetailView({ theme, data, product, ordering, whatsappPhone, shopHref, productHref, shopKey }: ProductDetailViewProps) {
  const cart = useCart();
  const s = storefrontConfig(data.storefront);
  const recent = useRecentlyViewed(s.recentlyViewed ? shopKey : null);
  const [imageIndex, setImageIndex] = useState(0);
  const [chosen, setChosen] = useState<Record<string, string>>({});
  const [tried, setTried] = useState(false);
  const [copied, setCopied] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(true);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const { record } = recent;

  useEffect(() => {
    setImageIndex(0);
    setChosen({});
    setTried(false);
    if (shopKey) {
      window.scrollTo(0, 0);
      record(product.id);
    }
  }, [product.id, shopKey, record]);

  // The phone buy bar appears only once the main button has scrolled away.
  useEffect(() => {
    const el = ctaRef.current;
    if (!s.stickyBuy || !el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setCtaVisible(e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [s.stickyBuy, product.id]);

  const variant = matchVariant(product, chosen);
  const price = variant ? variantPrice(product, variant) : null;
  const range = priceRange(product);
  const soldOut = isSoldOut(product);
  const available = variant ? canSell(product, variant) : !soldOut;
  const missing = product.options.filter((o) => !chosen[o.name]);
  const onSale = s.showSaleBadges && product.compareAtNgn !== null && (price ?? range?.[0] ?? Infinity) < product.compareAtNgn;
  const shop = shopProducts(data);
  const related = s.relatedProducts ? shop.filter((p) => p.id !== product.id && p.collectionIds.some((c) => product.collectionIds.includes(c))).slice(0, 4) : [];
  const recentProducts = s.recentlyViewed ? recent.ids.filter((id) => id !== product.id).map((id) => shop.find((p) => p.id === id)).filter((p): p is Product => !!p).slice(0, 4) : [];
  const collection = data.collections.find((c) => product.collectionIds.includes(c.id));
  const layout = s.productPage;

  const buy = () => {
    setTried(true);
    if (!variant || !available || !cart) return;
    cart.add(product.id, variant.id);
  };
  const waMessage = `Hi! I’d like to order: ${product.name}${variant && Object.keys(variant.options).length ? ` (${variantLabel(variant)})` : ''}${price !== null ? ` — ${formatNgn(price)}` : ''}.`;
  const primary = { ...buttonStyle(theme, 'featured'), borderRadius: buttonRadius(theme) };
  const secondary = { ...buttonStyle(theme, 'default'), borderRadius: buttonRadius(theme) };
  const canAsk = s.askWhatsApp && isValidPhone(whatsappPhone) && ordering === 'checkout';
  const priceText = price !== null ? formatNgn(price) : range ? range[0] === range[1] ? formatNgn(range[0]) : `${formatNgn(range[0])} – ${formatNgn(range[1])}` : null;

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url });
      } catch {

        /* cancelled */}
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {

      /* clipboard blocked */}
  };

  const cta =
  ordering === 'checkout' ?
  <button type="button" onClick={buy} disabled={soldOut || !!variant && !available} className="flex h-12 w-full items-center justify-center gap-2 text-[15px] font-semibold transition-opacity duration-150 disabled:cursor-not-allowed disabled:opacity-50" style={primary}>
        <ShoppingBagIcon size={16} aria-hidden />
        {soldOut ? isPreorder(product) ? 'Pre-orders full' : 'Sold out' : isPreorder(product) ? 'Pre-order' : 'Add to cart'}
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
      </a>;


  const details =
  <div className={cn('flex flex-col gap-5', layout === 'side' && 'md:pt-2', layout === 'stacked' && 'md:sticky md:top-6 md:self-start', layout === 'full' && 'mx-auto w-full max-w-2xl')}>
      <div>
        <h1 className="text-[26px] font-medium leading-tight tracking-[-0.015em] md:text-[32px]" style={{ fontFamily: fontsFor(theme).display, color: theme.text }}>
          {product.name}
        </h1>
        <p className="mt-2 flex items-baseline gap-2 text-[20px] font-semibold tabular-nums">
          {priceText ?? <span style={{ color: theme.mutedText }}>Price on request</span>}
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
              style={{ borderRadius: buttonRadius(theme), border: `1.5px solid ${on ? theme.text : mix(theme.text, 16)}`, background: on ? mix(theme.text, 8) : 'transparent', color: ok ? theme.text : theme.mutedText }}>
              
                  {on && <CheckIcon size={14} aria-hidden />}
                  {value}
                  {!ok && <span className="sr-only"> (sold out)</span>}
                </button>);

        })}
          </div>
        </fieldset>
    )}

      {bulkLevels(product).length > 0 && ordering === 'checkout' &&
    <div className="rounded-md px-3.5 py-3" style={{ background: mix(theme.text, 5) }}>
          <p className="text-[13.5px] font-semibold" style={{ color: theme.text }}>
            Buy more, pay less
          </p>
          <ul className="mt-1.5 flex flex-col gap-1 text-[13.5px] tabular-nums" style={{ color: theme.mutedText }}>
            {bulkLevels(product).map((b) =>
        <li key={b.minQty} className="flex justify-between gap-4">
                <span>{b.minQty}+ items</span>
                <span className="font-semibold" style={{ color: theme.text }}>
                  {formatNgn(b.priceNgn)} each
                </span>
              </li>
        )}
          </ul>
          <p className="mt-1.5 text-[12px]" style={{ color: theme.mutedText }}>
            Applied in the cart automatically{product.variants.length > 1 ? ', counting every option together' : ''}.
          </p>
        </div>
    }

      {isPreorder(product) && !soldOut &&
    <p className="rounded-md px-3.5 py-3 text-[13.5px] leading-snug" style={{ background: mix(theme.text, 5), color: theme.text }}>
          <span className="font-semibold">Pre-order</span> — expected by {shipsByLabel(product.preorder.shipsBy)}.
          {product.preorder.depositPct ? ` Pay ${product.preorder.depositPct}% now and the rest before it’s sent.` : ' Paid in full now; sent as soon as it’s in.'}
          {preorderLeft(product) !== null && ` ${preorderLeft(product)} left.`}
        </p>
    }

      <p className="text-[13.5px] font-medium" style={{ color: theme.mutedText }} aria-live="polite">
        {soldOut ?
      isPreorder(product) ?
      'Pre-orders are full.' :
      'Sold out right now.' :
      variant ?
      !available ?
      'This option is sold out — try another.' :
      product.giftCard ?
      'Your gift card code appears on your order page as soon as payment is confirmed.' :
      isPreorder(product) ?
      'Available to pre-order.' :
      product.trackStock && product.kind === 'physical' && variant.stock <= product.lowStockAt ?
      `Only ${variant.stock} left.` :
      product.kind === 'digital' ?
      'Instant download after payment.' :
      product.kind === 'course' ?
      'Online course — start learning straight after payment.' :
      'In stock.' :
      tried && missing.length ?
      `Choose ${missing.map((m) => m.name.toLowerCase()).join(' and ')}.` :
      `Choose ${missing.map((m) => m.name.toLowerCase()).join(' and ')} to see availability.`}
      </p>

      <div ref={ctaRef} className="flex flex-col gap-2.5">
        {cta}
        {(canAsk || s.shareButtons) &&
      <div className="flex gap-2.5">
            {canAsk &&
        <a href={whatsappLink(whatsappPhone, `Hi! A question about ${product.name}: `)} target="_blank" rel="noreferrer" className="flex h-11 flex-1 items-center justify-center gap-2 text-[14px] font-semibold" style={secondary}>
                <MessageCircleIcon size={15} aria-hidden /> Ask on WhatsApp
              </a>
        }
            {s.shareButtons &&
        <button type="button" onClick={share} className="flex h-11 flex-1 items-center justify-center gap-2 text-[14px] font-semibold" style={secondary}>
                {copied ? <CheckIcon size={15} aria-hidden /> : <Share2Icon size={15} aria-hidden />}
                <span aria-live="polite">{copied ? 'Link copied' : 'Share'}</span>
              </button>
        }
          </div>
      }
      </div>

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
    </div>;


  const gallery = <ProductGallery theme={theme} product={product} layout={layout} index={imageIndex} onIndex={setImageIndex} />;
  const strip = (id: string, title: string, list: Product[]) =>
  list.length > 0 &&
  <section aria-labelledby={id} className="flex flex-col gap-3">
        <h2 id={id} className="text-[18px] font-medium" style={{ fontFamily: fontsFor(theme).display }}>
          {title}
        </h2>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {list.map((p) =>
      <StoreProductCard key={p.id} product={p} theme={theme} href={productHref(p.id)} shape={s.imageShape} showSale={s.showSaleBadges} showLowStock={s.showLowStock} />
      )}
        </ul>
      </section>;

  const showBar = s.stickyBuy && !ctaVisible && !soldOut && !(cart && cart.count > 0);

  return (
    <div className="flex flex-col gap-10">
      <Link to={shopHref} className="inline-flex items-center gap-1.5 self-start pt-2 text-[14px] font-medium" style={{ color: theme.mutedText }}>
        <ArrowLeftIcon size={15} aria-hidden /> {collection ? collection.name : 'All products'}
      </Link>

      {layout === 'full' ?
      <article className="flex flex-col gap-8">
          {gallery}
          {details}
        </article> :

      <article className={cn('grid gap-8 md:gap-12', layout === 'stacked' ? 'md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]' : 'md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]')}>
          {gallery}
          {details}
        </article>
      }

      {s.showReviews && <ProductReviews theme={theme} data={data} productId={product.id} />}
      {strip('related-heading', `More from ${collection?.name ?? 'the shop'}`, related)}
      {strip('recent-heading', 'Recently viewed', recentProducts)}

      {s.stickyBuy &&
      <div
        aria-hidden={!showBar}
        className={cn('fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 px-4 py-3 transition-[transform,opacity] duration-200 ease-out md:hidden', showBar ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0')}
        style={{ background: theme.background, borderTop: `1px solid ${mix(theme.text, 12)}`, paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
        
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold" style={{ color: theme.text }}>
              {product.name}
            </p>
            {priceText && <p className="text-[13px] tabular-nums" style={{ color: theme.mutedText }}>{priceText}</p>}
          </div>
          <button
          type="button"
          tabIndex={showBar ? 0 : -1}
          onClick={() => {
            if (missing.length) ctaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });else
            if (ordering === 'checkout') buy();else
            if (variant && available) window.open(whatsappLink(whatsappPhone, waMessage), '_blank', 'noopener');
          }}
          className="flex h-11 shrink-0 items-center justify-center gap-2 px-5 text-[14px] font-semibold"
          style={primary}>
          
            {missing.length ? `Choose ${missing[0].name.toLowerCase()}` : ordering === 'checkout' ? 'Add to cart' : 'Order'}
          </button>
        </div>
      }
    </div>);

}