import React from 'react';
import { LayoutGridIcon, ShoppingBagIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import type { GridProduct } from '../../types/page';
import type { Product } from '../../types/commerce';
import { BlockPlaceholder } from './BlockPlaceholder';
import { BlockTitle, PageChip } from './BlockTitle';
import { PageAction } from './PageAction';
import { CheckoutButton } from './CheckoutButton';
import { MediaImage } from '../media/MediaImage';
import { buttonRadius, cardStyle, mix } from './pageStyle';
import { useCatalog } from '../../contexts/CatalogContext';
import { isSoldOut, linkedGridProducts, priceRange } from '../../utils/commerce/catalog';
import { formatNgn, whatsappLink } from '../../utils/format';

type GridView = GridProduct & {product?: Product;from?: boolean;};

export function ProductGridBlock({ block, theme, mode }: BlockProps<'productGrid'>) {
  const c = block.content;
  const catalog = useCatalog();
  const linked = c.source === 'catalog';

  const items: GridView[] = linked ?
  linkedGridProducts(c, catalog).map((p) => {
    const range = priceRange(p);
    return {
      id: p.id,
      name: p.name,
      priceNgn: range ? range[0] : null,
      from: !!range && range[0] !== range[1],
      imageUrl: p.images[0]?.url ?? '',
      imageAlt: p.images[0]?.alt ?? '',
      note: p.variants.length > 1 ? `${p.variants.length} options` : '',
      soldOut: isSoldOut(p),
      url: '',
      product: p
    };
  }) :
  c.items.filter((i) => i.name || i.imageUrl);

  if (items.length === 0) {
    return mode === 'edit' ?
    <BlockPlaceholder
      icon={LayoutGridIcon}
      title={linked ? 'No active products to show' : 'Add products'}
      hint={linked ? 'Pick products or a collection in the inspector. Drafts and archived items are hidden.' : 'Name, photo and price for each item'}
      theme={theme}
      tall /> :

    null;
  }
  const available = items.filter((i) => !i.soldOut).length;
  const action = linked ? c.orderAction : c.orderAction === 'checkout' ? 'whatsapp' : c.orderAction;

  return (
    <section>
      {c.title &&
      <BlockTitle theme={theme} aside={<span className="text-[13px]" style={{ color: theme.mutedText }}>{items.length} items</span>}>
          {c.title}
        </BlockTitle>
      }
      <ul className="grid grid-cols-2 gap-3">
        {items.map((item) => {
          const href =
          action === 'whatsapp' ?
          whatsappLink(c.whatsappPhone, `Hi! I’d like to order: ${item.name}${item.priceNgn !== null ? ` (${formatNgn(item.priceNgn)})` : ''}.`) :
          item.url;
          const buttonCls = 'mt-1 flex h-10 items-center justify-center gap-1.5 text-[13px] font-semibold';
          const buttonCss = { background: theme.accent, color: theme.accentText, borderRadius: buttonRadius(theme) };
          return (
            <li key={item.id} className="flex flex-col overflow-hidden" style={cardStyle(theme)}>
              <div className="relative">
                {item.imageUrl ?
                <MediaImage src={item.imageUrl} alt={item.imageAlt} loading="lazy" className="aspect-square w-full object-cover" style={item.soldOut ? { filter: 'grayscale(0.7)', opacity: 0.7 } : undefined} /> :

                <div className="flex aspect-square w-full items-center justify-center" style={{ background: mix(theme.text, 6), color: theme.mutedText }}>
                    <ShoppingBagIcon size={22} aria-hidden />
                  </div>
                }
                {item.soldOut &&
                <span className="absolute left-2 top-2">
                    <PageChip theme={theme}>Sold out</PageChip>
                  </span>
                }
              </div>
              <div className="flex flex-1 flex-col gap-1 p-3">
                <h3 className="text-[14px] font-semibold leading-snug" style={{ color: theme.text }}>{item.name || 'Untitled'}</h3>
                {item.note && <p className="text-[12px] leading-snug" style={{ color: theme.mutedText }}>{item.note}</p>}
                <p className="mt-auto pt-1 text-[14px] font-semibold tabular-nums" style={{ color: theme.text }}>
                  {item.priceNgn !== null ?
                  <>
                      {item.from && <span className="mr-1 text-[11px] font-medium" style={{ color: theme.mutedText }}>from</span>}
                      {formatNgn(item.priceNgn)}
                    </> :

                  <span style={{ color: theme.mutedText, fontWeight: 500 }}>Price on request</span>
                  }
                </p>
                {item.soldOut ?
                <span className="mt-1 flex h-10 items-center justify-center text-[13px] font-medium" style={{ color: theme.mutedText, borderRadius: buttonRadius(theme), border: `1px dashed ${mix(theme.text, 20)}` }}>
                    Unavailable
                  </span> :
                action === 'checkout' && item.product ?
                <CheckoutButton
                  mode={mode}
                  showIcon={false}
                  ariaLabel={`${c.ctaLabel || 'Add'} ${item.name}`}
                  onAdd={(cart) => {
                    const p = item.product as Product;
                    cart.add(p.id, p.variants.length === 1 ? p.variants[0].id : undefined, p.variants.length > 1);
                  }}
                  className={buttonCls}
                  style={buttonCss}>
                  
                    {c.ctaLabel || 'Add to cart'}
                  </CheckoutButton> :

                <PageAction mode={mode} href={href} ariaLabel={`${c.ctaLabel || 'Order'} ${item.name}`} className={buttonCls} style={buttonCss}>
                    {c.ctaLabel || 'Order'}
                  </PageAction>
                }
              </div>
            </li>);

        })}
      </ul>
      {available === 0 &&
      <p className="mt-3 text-[13px]" style={{ color: theme.mutedText }}>Everything is sold out right now. Check back soon.</p>
      }
    </section>);

}