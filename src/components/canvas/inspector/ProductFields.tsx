import React from 'react';
import type { BlockOf } from '../../../types/page';
import type { ValidationIssue } from '../../../utils/validation';
import { useEditor } from '../../../contexts/EditorContext';
import { useCommerce } from '../../../contexts/CommerceContext';
import { findProduct } from '../../../utils/commerce/catalog';
import { businessWhatsApp, waFieldHint } from '../../../utils/businessWhatsApp';
import { TextInput } from '../../ui/TextInput';
import { TextArea } from '../../ui/TextArea';
import { CurrencyInput } from '../../ui/CurrencyInput';
import { InlineAlert } from '../../ui/InlineAlert';
import { IllustrativeTag } from '../../ui/IllustrativeTag';
import { MediaPicker } from '../../media/MediaPicker';
import { OrderActionField, ProductSelect, SourceSwitch, SyncedNote, useCheckoutAllowed } from './CatalogFields';

interface ProductFieldsProps {
  block: BlockOf<'product'>;
  issues: ValidationIssue[];
}

export function ProductFields({ block, issues }: ProductFieldsProps) {
  const { actions } = useEditor();
  const { data } = useCommerce();
  const { allowed } = useCheckoutAllowed();
  const c = block.content;
  const err = (field: string) => issues.find((i) => i.field === field && i.severity === 'error')?.message;
  const warn = (field: string) => issues.find((i) => i.field === field && i.severity === 'warning')?.message;
  const id = (field: string) => `${block.id}-${field}`;
  const set = (patch: Partial<typeof c>, field: string) => actions.updateContent(block.id, 'product', patch, field);
  const linked = c.source === 'catalog';
  const product = linked ? findProduct(data, c.productId) : undefined;

  const whatsapp =
  <TextInput
    id={id('wa')}
    label="WhatsApp number"
    type="tel"
    inputMode="tel"
    placeholder={businessWhatsApp() || '+234 …'}
    value={c.whatsappPhone}
    error={err('whatsappPhone')}
    hint={waFieldHint(c.whatsappPhone, 'The order message includes the product name and price.')}
    onChange={(e) => set({ whatsappPhone: e.target.value }, 'whatsappPhone')} />;



  return (
    <div className="flex flex-col gap-4">
      <SourceSwitch
        id={id('source')}
        value={linked ? 'catalog' : 'manual'}
        onChange={(source) =>
        set(
          source === 'catalog' ?
          { source, ctaAction: allowed ? 'checkout' : 'whatsapp', ctaLabel: allowed ? 'Add to cart' : c.ctaLabel } :
          { source, ctaAction: c.ctaAction === 'checkout' ? 'whatsapp' : c.ctaAction, ctaLabel: c.ctaAction === 'checkout' ? 'Order on WhatsApp' : c.ctaLabel },
          'source'
        )
        } />
      

      {linked ?
      <>
          <ProductSelect id={id('productId')} kind="physical" value={c.productId} onChange={(productId) => set({ productId }, 'productId')} />
          {err('productId') && <p className="-mt-2 text-caption text-danger">{err('productId')}</p>}
          {!err('productId') && warn('productId') && <p className="-mt-2 text-caption text-warning">{warn('productId')}</p>}
          {product && <SyncedNote product={product} />}
          <TextInput id={id('badge')} label="Badge" optional placeholder="e.g. New drop" value={c.badge} hint="Replaced by “Sold out” when stock runs out." onChange={(e) => set({ badge: e.target.value }, 'badge')} />
          <OrderActionField
          id={id('cta')}
          value={c.ctaAction === 'link' ? 'whatsapp' : c.ctaAction}
          onChange={(ctaAction) => set({ ctaAction, ctaLabel: ctaAction === 'checkout' ? 'Add to cart' : 'Order on WhatsApp' }, 'ctaAction')}
          options={[
          { value: 'checkout', label: 'Checkout' },
          { value: 'whatsapp', label: 'WhatsApp' }]
          } />
        
          {err('ctaAction') && <p className="-mt-2 text-caption text-danger">{err('ctaAction')}</p>}
          {c.ctaAction === 'whatsapp' && whatsapp}
          <TextInput id={id('ctaLabel')} label="Button label" value={c.ctaLabel} onChange={(e) => set({ ctaLabel: e.target.value }, 'ctaLabel')} />
          {c.ctaAction === 'checkout' &&
        <InlineAlert tone="info" title="Checkout is in test mode">
              Visitors can add to cart and go through payment, but no real money moves in this prototype.
            </InlineAlert>
        }
        </> :

      <>
          <TextInput id={id('name')} label="Product name" value={c.name} error={err('name')} onChange={(e) => set({ name: e.target.value }, 'name')} />
          <CurrencyInput
          id={id('price')}
          label="Price"
          value={c.priceNgn}
          placeholder="Price on request"
          trailing={<IllustrativeTag note="KUBICU never invents prices — leave blank to show “Price on request”." />}
          hint={warn('priceNgn') ?? 'Naira, whole numbers.'}
          onChange={(priceNgn) => set({ priceNgn }, 'priceNgn')} />
        
          <TextArea id={id('description')} label="Description" optional rows={3} value={c.description} onChange={(e) => set({ description: e.target.value }, 'description')} />
          <MediaPicker id={id('image')} label="Product photo" aspect="4:5" folder="products" value={c.imageUrl} hint={warn('imageUrl')} onChange={(imageUrl) => set({ imageUrl }, 'imageUrl')} />
          {c.imageUrl &&
        <TextInput id={id('imageAlt')} label="Photo description" value={c.imageAlt} hint={warn('imageAlt') ?? 'Read aloud by screen readers.'} onChange={(e) => set({ imageAlt: e.target.value }, 'imageAlt')} />
        }
          <TextInput id={id('badge')} label="Badge" optional placeholder="e.g. New drop" value={c.badge} onChange={(e) => set({ badge: e.target.value }, 'badge')} />
          <OrderActionField
          id={id('cta')}
          value={c.ctaAction === 'checkout' ? 'whatsapp' : c.ctaAction}
          onChange={(ctaAction) => set({ ctaAction }, 'ctaAction')}
          options={[
          { value: 'whatsapp', label: 'Open WhatsApp' },
          { value: 'link', label: 'Open a link' }]
          } />
        
          {c.ctaAction === 'link' ?
        <TextInput id={id('url')} label="Order link" type="url" inputMode="url" placeholder="https://" value={c.url} error={err('url')} onChange={(e) => set({ url: e.target.value }, 'url')} /> :

        whatsapp
        }
          <TextInput id={id('ctaLabel')} label="Button label" value={c.ctaLabel} onChange={(e) => set({ ctaLabel: e.target.value }, 'ctaLabel')} />
          <p className="text-caption text-fg-subtle">For stock, variants and checkout, switch to “My products” above.</p>
        </>
      }
    </div>);

}