import React, { useEffect, useState } from 'react';
import { CheckIcon, MessageCircleIcon, MinusIcon, PlusIcon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import type { Product } from '../../types/commerce';
import type { ShopAddMode } from '../../types/commerce';
import { useCart } from '../../contexts/CartContext';
import { buttonRadius, buttonStyle, mix } from '../blocks/pageStyle';
import { canSell, isSoldOut, variantPrice } from '../../utils/commerce/catalog';
import { formatNgn, whatsappLink } from '../../utils/format';

interface CardAddControlProps {
  product: Product;
  theme: PageTheme;
  mode: Exclude<ShopAddMode, 'page'>;
  ordering: 'checkout' | 'whatsapp';
  whatsappPhone: string;
  /** Stretches to the card width (grid cards); rows keep it compact. */
  block?: boolean;
}

/**
 * Add straight from the listing (D196): an Add button, or + and − for quick orders. Products with
 * options open the existing "choose an option" step. WhatsApp shops get an Order button instead.
 * In previews (no cart) it renders but does nothing.
 */
export function CardAddControl({ product, theme, mode, ordering, whatsappPhone, block }: CardAddControlProps) {
  const cart = useCart();
  const [added, setAdded] = useState(false);
  useEffect(() => {
    if (!added) return;
    const t = window.setTimeout(() => setAdded(false), 1400);
    return () => window.clearTimeout(t);
  }, [added]);

  if (isSoldOut(product)) return null;
  const single = product.variants.length === 1 ? product.variants[0] : null;
  const radius = Math.min(buttonRadius(theme), 999);
  const base = 'inline-flex h-10 items-center justify-center gap-1.5 px-3.5 text-[13.5px] font-semibold transition-opacity duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';
  const width = block ? 'w-full' : '';
  const secondary: React.CSSProperties = { ...buttonStyle(theme, 'default'), borderRadius: radius };
  const name = product.name;

  if (ordering === 'whatsapp') {
    if (!single || !canSell(product, single)) return null;
    const price = variantPrice(product, single);
    const href = whatsappPhone ? whatsappLink(whatsappPhone, `Hi! I’d like to order: ${name}${price ? ` (${formatNgn(price)})` : ''}.`) : undefined;
    return (
      <a href={href} target="_blank" rel="noreferrer" aria-label={`Order ${name} on WhatsApp`} className={`${base} ${width}`} style={secondary}>
        <MessageCircleIcon size={14} aria-hidden /> Order
      </a>);

  }

  if (!single) {
    return (
      <button type="button" onClick={() => cart?.add(product.id)} aria-label={`Choose options for ${name}`} className={`${base} ${width}`} style={secondary}>
        Choose
      </button>);

  }
  if (!canSell(product, single)) return null;

  const line = cart?.lines.find((l) => l.variantId === single.id);
  const qty = line?.qty ?? 0;
  const max = product.trackStock && product.kind === 'physical' ? Math.min(20, single.stock) : 20;

  if (mode === 'stepper' && qty > 0) {
    const stepBtn = 'flex h-10 w-10 items-center justify-center transition-opacity duration-150 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 disabled:opacity-40';
    return (
      <div role="group" aria-label={`${name} quantity`} className={`inline-flex h-10 items-center ${width} ${block ? 'justify-between' : ''}`} style={{ ...secondary, padding: 0 }}>
        <button type="button" className={stepBtn} aria-label={`One less ${name}`} onClick={() => cart?.setQty(single.id, qty - 1)}>
          <MinusIcon size={15} aria-hidden />
        </button>
        <span className="min-w-[2ch] text-center text-[14px] font-semibold tabular-nums" aria-live="polite">
          {qty}
        </span>
        <button type="button" className={stepBtn} aria-label={`One more ${name}`} disabled={qty >= max} onClick={() => cart?.setQty(single.id, qty + 1)}>
          <PlusIcon size={15} aria-hidden />
        </button>
      </div>);

  }

  const primary: React.CSSProperties = mode === 'stepper' ? { ...buttonStyle(theme, 'featured'), borderRadius: radius } : added ? { ...secondary, background: mix(theme.accent, 14, theme.background) } : secondary;
  return (
    <button
      type="button"
      aria-label={`Add ${name} to cart`}
      disabled={!!line && qty >= max}
      onClick={() => {
        cart?.add(product.id, single.id, false, { silent: true });
        setAdded(true);
      }}
      className={`${base} ${width} disabled:opacity-50`}
      style={primary}>
      
      {added && mode === 'button' ? <CheckIcon size={14} aria-hidden /> : <PlusIcon size={14} aria-hidden />}
      {added && mode === 'button' ? 'Added' : 'Add'}
    </button>);

}