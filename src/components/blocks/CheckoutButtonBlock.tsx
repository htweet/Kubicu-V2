import React from 'react';
import { CreditCardIcon, ExternalLinkIcon, LockIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { CheckoutButton } from './CheckoutButton';
import { PageAction } from './PageAction';
import { useCatalog } from '../../contexts/CatalogContext';
import { formatNgn } from '../../utils/format';
import { buttonStyle } from './pageStyle';
import { useT } from '../../contexts/LocaleContext';

/**
 * Checkout button (D170). Native: adds a Commerce product to this page's checkout. Payment link: opens the
 * seller's own link, and says where it goes. Never shows as payable without a real destination.
 */
export function CheckoutButtonBlock({ block, theme, mode }: BlockProps<'checkoutButton'>) {
  // Fixed wording follows the visitor's language (D508); the seller's label and note stay as written.
  const { t: tr } = useT();
  const c = block.content;
  const data = useCatalog();
  const product = c.mode === 'checkout' && c.productId ? data?.products.find((p) => p.id === c.productId && p.status === 'active') : undefined;
  const host = (() => {
    try {
      return c.mode === 'link' && c.url ? new URL(c.url).hostname.replace(/^www\./, '') : '';
    } catch {
      return '';
    }
  })();
  if ((c.mode === 'checkout' && !product) || (c.mode === 'link' && !host)) {
    return mode === 'edit' ? (
      <BlockPlaceholder icon={CreditCardIcon} title={c.mode === 'checkout' ? 'Choose a product to sell' : 'Add your payment link'} hint={c.mode === 'checkout' ? 'Only active products can be bought' : 'e.g. a Paystack or Flutterwave payment page'} theme={theme} />
    ) : null;
  }
  const label = c.label.trim() || tr('Buy now');
  const cls = 'flex h-14 w-full items-center justify-center gap-2 px-6 text-[16px] font-semibold';
  return (
    <div className="flex flex-col items-center gap-2">
      {product ? (
        <CheckoutButton
          mode={mode}
          className={cls}
          style={buttonStyle(theme, 'featured')}
          ariaLabel={`${label}: ${product.name}${product.priceNgn !== null ? `, ${formatNgn(product.priceNgn)}` : ''}`}
          onAdd={(cart) => cart.add(product.id, product.variants.length === 1 ? product.variants[0].id : undefined, product.variants.length > 1)}
        >
          {label}
          {product.priceNgn !== null && <span className="font-medium opacity-80">· {formatNgn(product.priceNgn)}</span>}
        </CheckoutButton>
      ) : (
        <PageAction mode={mode} href={c.url} ariaLabel={`${label} — ${tr('opens {site}', { site: host })}`} className={cls} style={buttonStyle(theme, 'featured')}>
          {label} <ExternalLinkIcon size={15} aria-hidden />
        </PageAction>
      )}
      <p className="inline-flex items-center gap-1.5 text-center text-[12.5px]" style={{ color: theme.mutedText }}>
        {product ? <LockIcon size={12} aria-hidden /> : null}
        {product ? `${product.name} · ${tr('secure checkout on this page')}` : tr('You’ll pay on {site}', { site: host })}
        {c.note && ` · ${c.note}`}
      </p>
    </div>
  );
}
