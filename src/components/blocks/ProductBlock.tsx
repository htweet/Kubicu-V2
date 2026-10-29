import { useT } from '../../contexts/LocaleContext';
import React, { useState } from 'react';
import { MediaImage } from '../media/MediaImage';
import { LinkIcon, MessageCircleIcon, ShoppingBagIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { PageAction } from './PageAction';
import { CheckoutButton } from './CheckoutButton';
import { buttonRadius, buttonStyle, cardRadius, cardStyle, fontsFor, mix } from './pageStyle';
import { useCatalog } from '../../contexts/CatalogContext';
import { canSell, findProduct, isSoldOut, priceRange } from '../../utils/commerce/catalog';
import { formatNgn, whatsappLink } from '../../utils/format';
import { waNumber } from '../../utils/businessWhatsApp';

export function ProductBlock({ block, theme, mode }: BlockProps<'product'>) {
  const { t: tr } = useT();
  const p = block.content;
  const catalog = useCatalog();
  const linked = p.source === 'catalog';
  const product = linked ? findProduct(catalog, p.productId) : undefined;
  const [variantId, setVariantId] = useState<string | null>(null);

  if (linked && (!product || product.status !== 'active')) {
    return mode === 'edit' ?
    <BlockPlaceholder
      icon={LinkIcon}
      title={product ? `“${product.name}” isn’t active` : 'Choose a product from Commerce'}
      hint={product ? 'Visitors won’t see this block until it’s active again.' : 'Pick one in the inspector, or switch to manual details.'}
      theme={theme}
      tall /> :

    null;
  }
  if (!linked && !p.name && !p.imageUrl) {
    return mode === 'edit' ?
    <BlockPlaceholder icon={ShoppingBagIcon} title="Product details needed" hint="Add a name, photo and price in the inspector" theme={theme} tall /> :
    null;
  }

  const range = product ? priceRange(product) : null;
  const view = product ?
  {
    name: product.name,
    price: range ? range[0] : null,
    from: !!range && range[0] !== range[1],
    description: product.description,
    imageUrl: product.images[0]?.url ?? '',
    imageAlt: product.images[0]?.alt ?? '',
    soldOut: isSoldOut(product)
  } :
  { name: p.name, price: p.priceNgn, from: false, description: p.description, imageUrl: p.imageUrl, imageAlt: p.imageAlt, soldOut: false };

  const multi = !!product && product.variants.length > 1;
  const optionName = product?.options[0]?.name ?? 'option';
  const selected = product?.variants.find((v) => v.id === variantId);
  const shownPrice = selected && product ? selected.priceNgn ?? product.priceNgn : view.price;

  const href =
  p.ctaAction === 'whatsapp' ?
  whatsappLink(waNumber(p.whatsappPhone), `Hi! I’d like to order the ${view.name}${selected ? ` (${Object.values(selected.options).join(' / ')})` : ''}${shownPrice !== null ? ` (${formatNgn(shownPrice)})` : ''}.`) :
  p.url;
  const radius = cardRadius(theme);
  const badge = view.soldOut ? tr('Sold out') : p.badge;

  return (
    <article className="overflow-hidden" style={cardStyle(theme)}>
      <div className="relative">
        {view.imageUrl ?
        <MediaImage src={view.imageUrl} alt={view.imageAlt} loading="lazy" className="aspect-[4/5] w-full object-cover" style={view.soldOut ? { filter: 'grayscale(0.6)', opacity: 0.8 } : undefined} /> :

        <div className="flex aspect-[4/5] w-full items-center justify-center" style={{ background: mix(theme.text, 6), color: theme.mutedText }}>
            <ShoppingBagIcon size={28} aria-hidden />
          </div>
        }
        {badge &&
        <span
          className="absolute left-3 top-3 inline-flex h-7 items-center px-3 text-[12px] font-semibold"
          style={{ background: theme.surface, color: theme.text, borderRadius: Math.min(radius, 999) }}>
          
            {badge}
          </span>
        }
      </div>
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-[20px] font-medium leading-tight tracking-[-0.01em]" style={{ fontFamily: fontsFor(theme).display, color: theme.text }}>
            {view.name || 'Untitled product'}
          </h3>
          <p className="shrink-0 pt-0.5 text-[15px] font-semibold tabular-nums" style={{ color: theme.text }}>
            {shownPrice !== null ?
            <>
                {view.from && !selected && <span className="mr-1 text-[12px] font-medium" style={{ color: theme.mutedText }}>from</span>}
                {formatNgn(shownPrice)}
              </> :

            <span style={{ color: theme.mutedText, fontWeight: 500 }}>Price on request</span>
            }
          </p>
        </div>
        {view.description &&
        <p className="text-[14px] leading-relaxed" style={{ color: theme.mutedText }}>
            {view.description}
          </p>
        }

        {multi && product &&
        <div role="radiogroup" aria-label={`Choose ${optionName.toLowerCase()}`} className="flex flex-wrap gap-2">
            {product.variants.map((v) => {
            const available = canSell(product, v);
            const active = v.id === variantId;
            return (
              <button
                key={v.id}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={mode === 'edit' || !available}
                onClick={() => setVariantId(v.id)}
                className="inline-flex h-9 min-w-[44px] items-center justify-center px-3 text-[13px] font-semibold transition-colors duration-150 disabled:cursor-not-allowed"
                style={{
                  borderRadius: buttonRadius(theme),
                  border: `1.5px solid ${active ? theme.text : mix(theme.text, 18)}`,
                  background: active ? theme.text : 'transparent',
                  color: active ? theme.background : available ? theme.text : theme.mutedText,
                  textDecoration: available ? undefined : 'line-through'
                }}>
                
                  {Object.values(v.options).join(' / ')}
                </button>);

          })}
          </div>
        }

        {p.ctaAction === 'checkout' && product ?
        <CheckoutButton
          mode={mode}
          disabled={view.soldOut || !!selected && !canSell(product, selected)}
          onAdd={(cart) => cart.add(product.id, multi ? selected?.id : product.variants[0]?.id, multi && !selected)}
          className="mt-1 flex h-12 w-full items-center justify-center gap-2 text-[15px] font-semibold"
          style={buttonStyle(theme, 'featured')}>
          
            {view.soldOut ? tr('Sold out') : multi && !selected ? `Choose ${optionName.toLowerCase()}` : tr(p.ctaLabel || 'Add to cart')}
          </CheckoutButton> :
        view.soldOut ?
        <span className="mt-1 flex h-12 w-full items-center justify-center text-[15px] font-medium" style={{ color: theme.mutedText, borderRadius: buttonRadius(theme), border: `1px dashed ${mix(theme.text, 20)}` }}>
            Sold out
          </span> :

        <PageAction
          mode={mode}
          href={href}
          newTab
          className="mt-1 flex h-12 w-full items-center justify-center gap-2 text-[15px] font-semibold"
          style={buttonStyle(theme, 'featured')}>
          
            {p.ctaAction === 'whatsapp' && <MessageCircleIcon size={17} aria-hidden />}
            {p.ctaLabel || 'Order'}
          </PageAction>
        }
      </div>
    </article>);

}