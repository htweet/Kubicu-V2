import React from 'react';
import { RotateCcwIcon } from 'lucide-react';
import { SelectInput } from '../../ui/SelectInput';
import { Segmented } from '../../ui/Segmented';
import { Switch } from '../../ui/Switch';
import { Button } from '../../ui/Button';
import { InlineAlert } from '../../ui/InlineAlert';
import { partLabels, type ShopParts } from '../../../utils/commerce/shopLooks';

interface ShopPartsEditorProps {
  parts: ShopParts;
  customised: boolean;
  disabled: boolean;
  hasBanner: boolean;
  hasFeatured: boolean;
  usesWhatsApp: boolean;
  onChange: <K extends keyof ShopParts>(key: K, value: ShopParts[K]) => void;
  onReset: () => void;
}

const opts = <T extends string>(labels: Record<T, string>) => (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }));

/** Mix-and-match parts on top of the chosen look (D196). Changing any marks the look "Customised". */
export function ShopPartsEditor({ parts, customised, disabled, hasBanner, hasFeatured, usesWhatsApp, onChange, onReset }: ShopPartsEditorProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-label font-semibold text-fg">
          Parts{customised && <span className="font-normal text-fg-muted"> · Customised</span>}
        </p>
        {customised && (
          <Button size="sm" variant="tertiary" leadingIcon={RotateCcwIcon} disabled={disabled} onClick={onReset}>
            Reset to look
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectInput id="sf-header" label="Shop header" value={parts.header} disabled={disabled} onChange={(v) => onChange('header', v)} options={opts(partLabels.header)} hint={(parts.header === 'banner' || parts.header === 'split') && !hasBanner ? 'Add a banner photo above, or this shows the title only.' : undefined} />
        <SelectInput id="sf-featured-style" label="Featured area" value={parts.featuredStyle} disabled={disabled} onChange={(v) => onChange('featuredStyle', v)} options={opts(partLabels.featuredStyle)} hint={parts.featuredStyle === 'row' && !hasFeatured ? 'Pin products in Featured products to fill it.' : parts.featuredStyle === 'hero' || parts.featuredStyle === 'spotlight' ? (hasFeatured ? 'Uses your featured products first.' : 'Uses your first products until you pin some.') : undefined} />
        <SelectInput id="sf-colls-style" label="Collections" value={parts.collectionsStyle} disabled={disabled} onChange={(v) => onChange('collectionsStyle', v)} options={opts(partLabels.collectionsStyle)} hint={parts.collectionsStyle === 'side' ? 'Phones show chips.' : undefined} />
        <SelectInput id="sf-card" label="Product card" value={parts.cardStyle} disabled={disabled} onChange={(v) => onChange('cardStyle', v)} options={opts(partLabels.cardStyle)} />
      </div>

      {parts.cardStyle !== 'row' && parts.cardStyle !== 'pricelist' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <span className="text-label font-medium text-fg">Products per row</span>
            <Segmented<'2' | '3' | '4'> ariaLabel="Products per row on desktop" fullWidth value={String(parts.columns) as '2' | '3' | '4'} onChange={(v) => onChange('columns', Number(v) as 2 | 3 | 4)} options={[{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }]} />
            <span className="text-caption text-fg-subtle">On desktop. Phones always show 2.</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-label font-medium text-fg">Photo shape</span>
            <Segmented<ShopParts['imageShape']> ariaLabel="Photo shape" fullWidth value={parts.imageShape} onChange={(v) => onChange('imageShape', v)} options={[{ value: 'portrait', label: 'Portrait' }, { value: 'square', label: 'Square' }, { value: 'landscape', label: 'Wide' }]} />
            <span className="text-caption text-fg-subtle">Portrait suits fashion; square suits food and beauty.</span>
          </div>
        </div>
      )}

      <div className="grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
        <SelectInput id="sf-add" label="Adding to cart" value={parts.addMode} disabled={disabled} onChange={(v) => onChange('addMode', v)} options={opts(partLabels.addMode)} hint={parts.addMode !== 'page' ? 'Products with sizes or colours open a quick “choose an option” step.' : undefined} />
        <SelectInput id="sf-pdp" label="Product page" value={parts.productPage} disabled={disabled} onChange={(v) => onChange('productPage', v)} options={opts(partLabels.productPage)} />
      </div>
      {parts.addMode !== 'page' && usesWhatsApp && (
        <InlineAlert tone="info" title="With WhatsApp ordering, each item gets an Order button">
          Plus and minus need cart and checkout. Products with options still open their page.
        </InlineAlert>
      )}
      <Switch id="sf-sticky" label="Buy bar on phones" description="Keeps the price and buy button at the bottom of product pages once the main button scrolls away." checked={parts.stickyBuy} disabled={disabled} onChange={(v) => onChange('stickyBuy', v)} />
    </div>
  );
}
