import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, MessageCircleIcon, ShoppingBagIcon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import type { Product, ShopFeaturedStyle } from '../../types/commerce';
import { MediaImage } from '../media/MediaImage';
import { buttonRadius, buttonStyle, fontsFor, mix } from '../blocks/pageStyle';
import { useCart } from '../../contexts/CartContext';
import { canSell, isSoldOut, priceRange, variantPrice } from '../../utils/commerce/catalog';
import { formatNgn, whatsappLink } from '../../utils/format';

interface ShopFeaturedProps {
  theme: PageTheme;
  style: Exclude<ShopFeaturedStyle, 'none'>;
  products: Product[];
  productHref: (id: string) => string;
  ordering: 'checkout' | 'whatsapp';
  whatsappPhone: string;
  /** Products rendered as normal cards for the "row" style. */
  renderCard: (p: Product) => React.ReactNode;
}

/** The featured area above the grid (D196): a row, one big + two small, or one product up front. */
export function ShopFeatured({ theme, style, products, productHref, ordering, whatsappPhone, renderCard }: ShopFeaturedProps) {
  const display = fontsFor(theme).display;
  if (!products.length) return null;

  if (style === 'row') {
    return (
      <section aria-labelledby="shop-featured" className="flex flex-col gap-3">
        <h2 id="shop-featured" className="text-[18px] font-medium" style={{ fontFamily: display, color: theme.text }}>
          Featured
        </h2>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">{products.slice(0, 4).map(renderCard)}</ul>
      </section>
    );
  }

  if (style === 'hero') {
    const [big, ...rest] = products.slice(0, 3);
    const tile = (p: Product, large: boolean) => {
      const range = priceRange(p);
      return (
        <Link key={p.id} to={productHref(p.id)} className={`group relative block overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${large ? 'md:row-span-2' : ''}`}>
          {p.images[0] ? (
            <MediaImage src={p.images[0].url} alt={p.images[0].alt} className={`h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02] ${large ? 'aspect-[4/5] md:aspect-auto' : 'aspect-[4/3] md:aspect-auto'}`} />
          ) : (
            <div className={`flex h-full w-full items-center justify-center ${large ? 'aspect-[4/5]' : 'aspect-[4/3]'}`} style={{ background: mix(theme.text, 6), color: theme.mutedText }}>
              <ShoppingBagIcon size={26} aria-hidden />
            </div>
          )}
          <span className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3 rounded-md px-3.5 py-2.5" style={{ background: mix(theme.background, 92) }}>
            <span className="min-w-0">
              <span className={`block truncate font-semibold ${large ? 'text-[16px]' : 'text-[14px]'}`} style={{ color: theme.text }}>
                {p.name}
              </span>
              {range && (
                <span className="text-[13px] tabular-nums" style={{ color: theme.mutedText }}>
                  {range[0] !== range[1] ? 'from ' : ''}
                  {formatNgn(range[0])}
                </span>
              )}
            </span>
            <ArrowRightIcon size={16} aria-hidden style={{ color: theme.text }} className="shrink-0" />
          </span>
        </Link>
      );
    };
    return (
      <section aria-label="Featured" className={`grid gap-3 md:gap-4 ${rest.length ? 'md:h-[520px] md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:grid-rows-2' : ''}`}>
        {tile(big, true)}
        {rest.map((p) => tile(p, false))}
      </section>
    );
  }

  return <SpotlightProduct theme={theme} product={products[0]} href={productHref(products[0].id)} ordering={ordering} whatsappPhone={whatsappPhone} />;
}

function SpotlightProduct({ theme, product: p, href, ordering, whatsappPhone }: { theme: PageTheme; product: Product; href: string; ordering: 'checkout' | 'whatsapp'; whatsappPhone: string }) {
  const cart = useCart();
  const range = priceRange(p);
  const single = p.variants.length === 1 ? p.variants[0] : null;
  const soldOut = isSoldOut(p);
  const sellable = !!single && canSell(p, single);
  const primary: React.CSSProperties = { ...buttonStyle(theme, 'featured'), borderRadius: buttonRadius(theme) };
  const secondary: React.CSSProperties = { ...buttonStyle(theme, 'default'), borderRadius: buttonRadius(theme) };
  const btn = 'inline-flex h-12 items-center justify-center gap-2 px-6 text-[15px] font-semibold transition-opacity duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';
  const story = p.description.split('\n').filter(Boolean).slice(0, 2);

  let cta: React.ReactNode;
  if (soldOut) cta = <span className={btn} style={{ ...secondary, opacity: 0.6 }}>Sold out</span>;
  else if (!single)
    cta = (
      <Link to={href} className={btn} style={primary}>
        Choose options
      </Link>
    );
  else if (ordering === 'whatsapp')
    cta = (
      <a href={whatsappPhone ? whatsappLink(whatsappPhone, `Hi! I’d like to order: ${p.name} (${formatNgn(variantPrice(p, single) ?? 0)}).`) : undefined} target="_blank" rel="noreferrer" className={btn} style={primary}>
        <MessageCircleIcon size={16} aria-hidden /> Order on WhatsApp
      </a>
    );
  else
    cta = (
      <button type="button" disabled={!sellable} onClick={() => single && cart?.add(p.id, single.id)} className={`${btn} disabled:opacity-50`} style={primary}>
        <ShoppingBagIcon size={16} aria-hidden /> Add to cart
      </button>
    );

  return (
    <section aria-labelledby="spotlight-name" className="grid items-center gap-6 pt-2 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-12">
      {p.images[0] ? (
        <MediaImage src={p.images[0].url} alt={p.images[0].alt} className="aspect-square w-full rounded-lg object-cover md:aspect-[4/5]" />
      ) : (
        <div className="flex aspect-square w-full items-center justify-center rounded-lg" style={{ background: mix(theme.text, 6), color: theme.mutedText }}>
          <ShoppingBagIcon size={32} aria-hidden />
        </div>
      )}
      <div className="flex flex-col gap-4">
        <h2 id="spotlight-name" className="text-[30px] font-medium leading-tight tracking-[-0.015em] md:text-[42px]" style={{ fontFamily: fontsFor(theme).display, color: theme.text }}>
          {p.name}
        </h2>
        {range && (
          <p className="text-[20px] font-semibold tabular-nums" style={{ color: theme.text }}>
            {range[0] !== range[1] ? `${formatNgn(range[0])} – ${formatNgn(range[1])}` : formatNgn(range[0])}
          </p>
        )}
        {story.map((para, i) => (
          <p key={i} className="max-w-prose text-[15.5px] leading-relaxed" style={{ color: theme.mutedText }}>
            {para}
          </p>
        ))}
        <div className="mt-2 flex flex-wrap gap-3">
          {cta}
          <Link to={href} className={btn} style={secondary}>
            See details
          </Link>
        </div>
      </div>
    </section>
  );
}
