import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ExternalLinkIcon, MegaphoneIcon, StoreIcon } from 'lucide-react';
import { useCommerce } from '../../contexts/CommerceContext';
import { useEditor } from '../../contexts/EditorContext';
import { usePlan } from '../../contexts/PlanContext';
import { planAtLeast, plans } from '../../data/plans';
import { CHECKOUT_PLAN } from '../../utils/commerce/linkIssues';
import { shopPathTaken, shopProducts, sortProducts, storefrontConfig, STOREFRONT_PATH, type StorefrontConfig } from '../../utils/commerce/storefront';
import { isCustomised, lookDef, type ShopParts } from '../../utils/commerce/shopLooks';
import { LookPicker } from '../../components/commerce/storefront/LookPicker';
import { ShopPartsEditor } from '../../components/commerce/storefront/ShopPartsEditor';
import { ShopFeatureSwitches } from '../../components/commerce/storefront/ShopFeatureSwitches';
import { StorefrontLivePreview } from '../../components/commerce/storefront/StorefrontLivePreview';
import { isSoldOut } from '../../utils/commerce/catalog';
import { isValidPhone } from '../../utils/validation';
import { publicUrl } from '../../utils/format';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { Switch } from '../../components/ui/Switch';
import { TextInput } from '../../components/ui/TextInput';
import { TextArea } from '../../components/ui/TextArea';
import { Segmented } from '../../components/ui/Segmented';
import { InlineAlert } from '../../components/ui/InlineAlert';
import { UpgradeButton } from '../../components/ui/UpgradeButton';
import { MediaPicker } from '../../components/media/MediaPicker';
import { Card } from '../../components/ui/layout/Card';
import { Section } from '../../components/ui/layout/Section';
import { FeaturedPicker } from '../../components/commerce/storefront/FeaturedPicker';
import { useT } from '../../contexts/LocaleContext';

const ANNOUNCEMENT_MAX = 90;
const SEO_TITLE_MAX = 60;
const SEO_DESC_MAX = 160;

/** Commerce → Storefront: the auto-built shop at /shop (D53, D98), in a chosen look with feature switches (D196). */
export function Storefront() {
  const { data, apply } = useCommerce();
  const { state } = useEditor();
  const plan = usePlan();
  const { t: tr } = useT();
  const saved = useMemo(() => storefrontConfig(data.storefront), [data.storefront]);
  const [draft, setDraft] = useState<StorefrontConfig>(saved);
  const [tried, setTried] = useState(false);
  useEffect(() => setDraft(saved), [saved]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const set = <K extends keyof StorefrontConfig,>(k: K, v: StorefrontConfig[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const checkoutAllowed = planAtLeast(plan.id, CHECKOUT_PLAN);
  const usesWhatsApp = draft.ordering === 'whatsapp' || !checkoutAllowed;
  const phoneError = draft.enabled && usesWhatsApp && !isValidPhone(draft.whatsappPhone) ? 'Add the WhatsApp number orders go to, e.g. +234 803 123 4567.' : '';
  const titleError = draft.enabled && !draft.title.trim() ? 'Give the shop a title.' : '';
  const bannerAltError = draft.bannerUrl && !draft.bannerAlt.trim() ? 'Describe the banner for people who can’t see it.' : '';
  const clash = shopPathTaken(state.site);
  const handle = state.published?.handle ?? state.site.handle;
  const live = !!state.published;
  const shopUrl = publicUrl(`${handle}/${STOREFRONT_PATH}`);
  const allShop = useMemo(() => shopProducts({ ...data, storefront: { ...draft, hideSoldOut: false } }), [data, draft]);
  const products = useMemo(() => sortProducts(shopProducts({ ...data, storefront: draft }), draft.defaultSort, draft.featuredIds), [data, draft]);
  const soldOutCount = products.filter(isSoldOut).length;
  const draftCount = data.products.filter((p) => p.status === 'draft').length;
  const noPhoto = products.filter((p) => !p.images.length).length;
  const noPrice = products.filter((p) => !p.priceNgn).length;
  const parts: ShopParts = { header: draft.header, featuredStyle: draft.featuredStyle, collectionsStyle: draft.collectionsStyle, cardStyle: draft.cardStyle, columns: draft.columns, imageShape: draft.imageShape, productPage: draft.productPage, stickyBuy: draft.stickyBuy, addMode: draft.addMode };
  const customised = isCustomised({ ...parts, look: draft.look });
  const off = !draft.enabled;
  const offCls = off ? 'opacity-60' : '';

  const save = () => {
    setTried(true);
    if (phoneError || titleError || bannerAltError) {
      toast.error(tr('Check the highlighted fields'));
      return;
    }
    const clean: StorefrontConfig = {
      ...draft,
      title: draft.title.trim(),
      menuLabel: draft.menuLabel.trim() || 'Shop',
      announcement: draft.announcement.trim(),
      bannerAlt: draft.bannerAlt.trim(),
      deliveryNote: draft.deliveryNote.trim(),
      returnsNote: draft.returnsNote.trim(),
      seoTitle: draft.seoTitle.trim(),
      seoDescription: draft.seoDescription.trim(),
      featuredIds: draft.featuredIds.filter((id) => allShop.some((p) => p.id === id))
    };
    if (apply((d) => ({ ...d, storefront: clean })))
    toast.success(draft.enabled ? tr('Storefront saved') : tr('Storefront turned off'), {
      description: draft.enabled ?
      live ?
      tr('Live at {url}.', { url: shopUrl }) :
      tr('Live at {url} once your page is published.', { url: shopUrl }) :
      tr('The /shop address now shows “page doesn’t exist”.')
    });
  };

  return (
    <>
      <PageHeader
        title="Storefront"
        description="Every active product in one shop at /shop, with collections, search and product pages. It updates as you edit products — nothing to publish."
        actions={
        <>
            {data.storefront.enabled && live &&
          <Button variant="secondary" leadingIcon={ExternalLinkIcon} onClick={() => window.open(`/p/${handle}/${STOREFRONT_PATH}`, '_blank', 'noopener')}>
                View shop
              </Button>
          }
            {dirty &&
          <Button variant="tertiary" onClick={() => {setDraft(saved);setTried(false);}}>
                Discard
              </Button>
          }
            <Button onClick={save} disabled={!dirty}>
              Save changes
            </Button>
          </>
        } />
      

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-10">
        <div className="flex flex-col gap-6">
          <Card emphasis="primary" as="div">
            <Switch id="sf-enabled" label="Show a storefront" description={tr('At {url}. Draft and archived products never appear.', { url: shopUrl })} checked={draft.enabled} onChange={(v) => set('enabled', v)} />
            {clash && draft.enabled &&
            <InlineAlert tone="warning" title={tr('Your “{page}” page already uses /shop', { page: clash })} className="mt-4">
                {tr('The storefront stays hidden so that page keeps working. Change the page’s address in the canvas (Pages tab) to use the storefront instead.')}
              </InlineAlert>
            }
            {!live && draft.enabled &&
            <p className="mt-4 text-caption text-fg-muted">
                {tr('Your main page isn’t published yet, so visitors can’t reach the shop.')} <Link to={`/app/canvas/${state.site.id}`} className="font-medium text-fg underline underline-offset-2">{tr('Open the canvas')}</Link>
              </p>
            }
          </Card>

          <Card id="sf-look" title="Look" description="Pick a complete layout, then fine-tune its parts. Colours and fonts come from your page’s theme. Free on every plan." className={offCls}>
            <div className="flex flex-col gap-6">
              <LookPicker value={draft.look} customised={customised} disabled={off} onPick={(l) => setDraft((d) => ({ ...d, look: l.id, ...l.parts }))} />
              <ShopPartsEditor
                parts={parts}
                customised={customised}
                disabled={off}
                hasBanner={!!draft.bannerUrl}
                hasFeatured={draft.featuredIds.length > 0}
                usesWhatsApp={usesWhatsApp}
                onChange={(k, v) => set(k, v as StorefrontConfig[typeof k])}
                onReset={() => setDraft((d) => ({ ...d, ...lookDef(d.look).parts }))} />
              
            </div>
          </Card>

          <Card id="sf-content" title="What shoppers see first" description="The top of the shop: title, intro, a notice and an optional banner." className={offCls}>
            <div className="flex flex-col gap-4">
              <TextInput id="sf-title" label="Shop title" value={draft.title} error={tried ? titleError || undefined : undefined} disabled={off} onChange={(e) => set('title', e.target.value)} />
              <TextArea id="sf-intro" label="Intro" optional rows={2} value={draft.intro} disabled={off} placeholder={tr('e.g. Made in small runs in Lekki. Delivery across Lagos.')} onChange={(e) => set('intro', e.target.value)} />
              <TextInput
                id="sf-announce"
                label="Announcement"
                optional
                maxLength={ANNOUNCEMENT_MAX}
                leadingIcon={MegaphoneIcon}
                value={draft.announcement}
                disabled={off}
                placeholder={tr('e.g. Free delivery in Lekki this week')}
                hint={`${draft.announcement.length}/${ANNOUNCEMENT_MAX}. ${tr('A slim bar above the shop. Leave empty to hide it.')}`}
                onChange={(e) => set('announcement', e.target.value)} />
              
              <MediaPicker id="sf-banner" label="Banner" optional aspect="16:9" folder="brand" value={draft.bannerUrl} disabled={off} hint="Wide photo across the top of the shop. Hidden when a collection is open." onChange={(src, meta) => setDraft((d) => ({ ...d, bannerUrl: src, bannerAlt: src ? d.bannerAlt || meta?.alt || '' : '' }))} />
              {draft.bannerUrl && <TextInput id="sf-banner-alt" label="Banner description" value={draft.bannerAlt} disabled={off} error={tried ? bannerAltError || undefined : undefined} placeholder={tr('e.g. Model wearing the wine gele in the studio')} onChange={(e) => set('bannerAlt', e.target.value)} />}
            </div>
          </Card>

          <Card id="sf-featured" title="Featured products" description="Pinned to the top when the shop is in Featured order. Up to 8." className={offCls}>
            <FeaturedPicker products={allShop} value={draft.featuredIds} disabled={off} onChange={(ids) => set('featuredIds', ids)} />
          </Card>

          <Card id="sf-features" title="Features" description="Switch parts of the shop on or off. All free." className={offCls}>
            <ShopFeatureSwitches draft={draft} disabled={off} hasCollections={data.collections.length > 0} checkoutOn={!usesWhatsApp} set={set} />
          </Card>

          <Card id="sf-order" title="How people order" className={offCls}>
            <div className="flex flex-col gap-4">
              <Segmented<StorefrontConfig['ordering']>
                ariaLabel="How people order"
                fullWidth
                value={draft.ordering}
                onChange={(v) => set('ordering', v)}
                options={[
                { value: 'checkout', label: 'Cart and checkout' },
                { value: 'whatsapp', label: 'WhatsApp' }]
                } />
              
              {draft.ordering === 'checkout' && !checkoutAllowed &&
              <InlineAlert tone="info" title={tr('Checkout is on {plan}', { plan: plans[CHECKOUT_PLAN].name })} action={<UpgradeButton plan={CHECKOUT_PLAN} feature="Checkout in your storefront" />}>
                  {tr('Until then, the shop uses WhatsApp ordering.')}
                </InlineAlert>
              }
              {usesWhatsApp &&
              <TextInput id="sf-phone" label="WhatsApp number" type="tel" inputMode="tel" value={draft.whatsappPhone} placeholder="+234 …" error={tried ? phoneError || undefined : undefined} hint="Each product sends a pre-filled message with the chosen option and price." onChange={(e) => set('whatsappPhone', e.target.value)} />
              }
              {!usesWhatsApp &&
              <p className="text-caption text-fg-muted">
                  {tr('Shoppers add to a cart and pay at checkout, with your delivery options, discount codes and payment settings.')}{' '}
                  <Link to="/app/commerce/settings" className="font-medium text-fg underline underline-offset-2">{tr('Delivery options')}</Link>
                  {' · '}
                  <Link to="/app/commerce/payments" className="font-medium text-fg underline underline-offset-2">{tr('Payment settings')}</Link>
                </p>
              }
              <div className="flex flex-col gap-3 border-t border-line pt-5">
                <Switch id="sf-menu" label="Add to the site menu" description="Shoppers can get to the shop from any of your pages." checked={draft.showInMenu} disabled={off} onChange={(v) => set('showInMenu', v)} />
                {draft.showInMenu && <TextInput id="sf-menu-label" label="Menu label" value={draft.menuLabel} disabled={off} fieldClassName="max-w-[220px]" onChange={(e) => set('menuLabel', e.target.value)} />}
              </div>
            </div>
          </Card>

          <Card id="sf-notes" title="Good to know" description="Short notes at the bottom of the shop. Leave one empty to hide it." className={offCls}>
            <div className="flex flex-col gap-4">
              <TextArea id="sf-delivery" label="Delivery" optional rows={2} maxLength={300} value={draft.deliveryNote} disabled={off} placeholder={tr('e.g. Same-day in Lagos if you order by 2pm. Nationwide in 2–4 days.')} onChange={(e) => set('deliveryNote', e.target.value)} />
              <TextArea id="sf-returns" label="Returns & exchanges" optional rows={2} maxLength={300} value={draft.returnsNote} disabled={off} placeholder={tr('e.g. Exchanges within 7 days on unworn items with tags.')} onChange={(e) => set('returnsNote', e.target.value)} />
            </div>
          </Card>

          <Card id="sf-seo" title="Search and sharing" description="What Google and link previews show for your shop. Empty uses the title and intro." className={offCls}>
            <div className="flex flex-col gap-4">
              <TextInput id="sf-seo-title" label="Title" optional maxLength={SEO_TITLE_MAX} value={draft.seoTitle} disabled={off} placeholder={`${draft.title || 'Shop'} · ${state.site.title}`} hint={`${draft.seoTitle.length}/${SEO_TITLE_MAX}`} onChange={(e) => set('seoTitle', e.target.value)} />
              <TextArea id="sf-seo-desc" label="Description" optional rows={2} maxLength={SEO_DESC_MAX} value={draft.seoDescription} disabled={off} placeholder={draft.intro || tr('A sentence about what you sell.')} hint={`${draft.seoDescription.length}/${SEO_DESC_MAX}`} onChange={(e) => set('seoDescription', e.target.value)} />
              <div className="rounded-md border border-line bg-sunken p-4" aria-label={tr('Search result preview')}>
                <p className="truncate text-caption text-fg-subtle">{shopUrl}</p>
                <p className="mt-0.5 truncate text-body font-medium text-info">{draft.seoTitle || `${draft.title || 'Shop'} · ${state.site.title}`}</p>
                <p className="mt-0.5 line-clamp-2 text-caption text-fg-muted">{draft.seoDescription || draft.intro || tr('No description yet.')}</p>
              </div>
            </div>
          </Card>
        </div>

        <Section
          id="sf-preview"
          title="In the shop"
          className="lg:sticky lg:top-6"
          description={[
          tr(products.length === 1 ? '{n} product' : '{n} products', { n: products.length }),
          soldOutCount ? tr('{n} sold out', { n: soldOutCount }) : '',
          draftCount ? tr(draftCount === 1 ? '{n} draft not shown' : '{n} drafts not shown', { n: draftCount }) : ''].

          filter(Boolean).
          join(' · ')}>
          
          {products.length === 0 ?
          <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-line-strong p-5">
              <StoreIcon size={20} className="text-fg-subtle" aria-hidden />
              <p className="text-label text-fg-muted">{tr('No active products yet. Shoppers will see an empty shop.')}</p>
              <Link to="/app/commerce/products" className="text-label font-medium text-fg underline underline-offset-2">
                {tr('Add products')}
              </Link>
            </div> :

          <StorefrontLivePreview theme={state.site.theme} data={{ ...data, storefront: draft }} ordering={usesWhatsApp ? 'whatsapp' : 'checkout'} whatsappPhone={draft.whatsappPhone} />
          }
          {(noPhoto > 0 || noPrice > 0) &&
          <InlineAlert tone="warning" title="Some products look unfinished">
              {[noPhoto && tr('{n} without a photo', { n: noPhoto }), noPrice && tr('{n} without a price (shown as “Price on request”)', { n: noPrice })].filter(Boolean).join(' · ')}.{' '}
              <Link to="/app/commerce/products" className="font-medium underline underline-offset-2">
                {tr('Fix in Products')}
              </Link>
            </InlineAlert>
          }
          <p className="text-caption text-fg-subtle">{tr('Your real shop with unsaved changes, in your page’s theme. Save to make it live.')}</p>
        </Section>
      </div>
    </>);

}