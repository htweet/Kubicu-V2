import React from 'react';
import { Switch } from '../../ui/Switch';
import { SelectInput } from '../../ui/SelectInput';
import { sortLabels, type StorefrontConfig, type StorefrontSort } from '../../../utils/commerce/storefront';

interface ShopFeatureSwitchesProps {
  draft: StorefrontConfig;
  disabled: boolean;
  hasCollections: boolean;
  checkoutOn: boolean;
  set: <K extends keyof StorefrontConfig>(key: K, value: StorefrontConfig[K]) => void;
}

/** Every shop feature in one list, grouped as Finding, Buying and Trust (D196). All free. */
export function ShopFeatureSwitches({ draft, disabled, hasCollections, checkoutOn, set }: ShopFeatureSwitchesProps) {
  const group = (title: string, children: React.ReactNode) => (
    <fieldset className="flex flex-col gap-4 border-t border-line pt-5 first:border-t-0 first:pt-0">
      <legend className="mb-1 text-caption font-semibold text-fg-subtle">{title}</legend>
      {children}
    </fieldset>
  );
  return (
    <div className="flex flex-col gap-5">
      {group(
        'Finding',
        <>
          <Switch id="sf-search" label="Search box" checked={draft.showSearch} disabled={disabled} onChange={(v) => set('showSearch', v)} />
          <Switch id="sf-colls" label="Collections" description={hasCollections ? 'Each collection with products becomes a chip, tab or side link.' : 'Add collections in Products to use this.'} checked={draft.showCollections} disabled={disabled} onChange={(v) => set('showCollections', v)} />
          <Switch id="sf-stockfilter" label="“In stock only” filter" checked={draft.showStockFilter} disabled={disabled} onChange={(v) => set('showStockFilter', v)} />
          <Switch id="sf-saved" label="Saved items" description="A heart on each product. The list stays on the shopper’s own phone — no account, nothing sent to you." checked={draft.savedItems} disabled={disabled} onChange={(v) => set('savedItems', v)} />
          <Switch id="sf-recent" label="Recently viewed" description="A row on product pages, kept on the shopper’s phone." checked={draft.recentlyViewed} disabled={disabled} onChange={(v) => set('recentlyViewed', v)} />
          <Switch id="sf-related" label="Related products" description="“More from” the same collection on product pages." checked={draft.relatedProducts} disabled={disabled} onChange={(v) => set('relatedProducts', v)} />
          <SelectInput<StorefrontSort> id="sf-sort" label="Order shoppers see first" value={draft.defaultSort} disabled={disabled} hint="Shoppers can still change it." onChange={(v) => set('defaultSort', v)} options={(Object.keys(sortLabels) as StorefrontSort[]).map((o) => ({ value: o, label: sortLabels[o] }))} />
        </>,
      )}
      {group(
        'Buying',
        <>
          <Switch id="sf-ask" label="Ask on WhatsApp" description={checkoutOn ? 'A second button on product pages for questions, next to Add to cart.' : 'Already how people order in your shop.'} checked={draft.askWhatsApp} disabled={disabled || !checkoutOn} onChange={(v) => set('askWhatsApp', v)} />
          <Switch id="sf-share" label="Share button" description="On product pages: the phone’s share menu, or copy the link." checked={draft.shareButtons} disabled={disabled} onChange={(v) => set('shareButtons', v)} />
          <Switch id="sf-soldout" label="Hide sold-out products" description="Off shows them with a Sold out label, so people know to come back." checked={draft.hideSoldOut} disabled={disabled} onChange={(v) => set('hideSoldOut', v)} />
        </>,
      )}
      {group(
        'Trust',
        <>
          <Switch id="sf-reviews" label="What customers said" description="Verified reviews from Proof, matched to real orders of that product. Nothing shows until there’s one." checked={draft.showReviews} disabled={disabled} onChange={(v) => set('showReviews', v)} />
          <Switch id="sf-low" label="“Only N left” labels" description="Shown when stock reaches each product’s low-stock level." checked={draft.showLowStock} disabled={disabled} onChange={(v) => set('showLowStock', v)} />
          <Switch id="sf-sale" label="Sale badges" description="A Sale label and the old price crossed out, when a product has a compare-at price." checked={draft.showSaleBadges} disabled={disabled} onChange={(v) => set('showSaleBadges', v)} />
        </>,
      )}
    </div>
  );
}
