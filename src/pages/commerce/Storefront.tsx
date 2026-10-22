import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ExternalLinkIcon, StoreIcon } from 'lucide-react';
import type { StorefrontSettings } from '../../types/commerce';
import { useCommerce } from '../../contexts/CommerceContext';
import { useEditor } from '../../contexts/EditorContext';
import { usePlan } from '../../contexts/PlanContext';
import { planAtLeast, plans } from '../../data/plans';
import { CHECKOUT_PLAN } from '../../utils/commerce/linkIssues';
import { shopPathTaken, shopProducts, STOREFRONT_PATH } from '../../utils/commerce/storefront';
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
import { MediaImage } from '../../components/media/MediaImage';

/** Commerce → Storefront: the auto-built shop at /shop (D53). */
export function Storefront() {
  const { data, apply } = useCommerce();
  const { state } = useEditor();
  const plan = usePlan();
  const [draft, setDraft] = useState<StorefrontSettings>(data.storefront);
  const [tried, setTried] = useState(false);
  useEffect(() => setDraft(data.storefront), [data.storefront]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(data.storefront);
  const set = <K extends keyof StorefrontSettings,>(k: K, v: StorefrontSettings[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const checkoutAllowed = planAtLeast(plan.id, CHECKOUT_PLAN);
  const usesWhatsApp = draft.ordering === 'whatsapp' || !checkoutAllowed;
  const phoneError = draft.enabled && usesWhatsApp && !isValidPhone(draft.whatsappPhone) ? 'Add the WhatsApp number orders go to, e.g. +234 803 123 4567.' : '';
  const titleError = draft.enabled && !draft.title.trim() ? 'Give the shop a title.' : '';
  const clash = shopPathTaken(state.site);
  const handle = state.published?.handle ?? state.site.handle;
  const live = !!state.published;
  const products = shopProducts({ ...data, storefront: draft });
  const soldOutCount = products.filter(isSoldOut).length;
  const draftCount = data.products.filter((p) => p.status === 'draft').length;

  const save = () => {
    setTried(true);
    if (phoneError || titleError) return;
    if (apply((d) => ({ ...d, storefront: { ...draft, title: draft.title.trim(), menuLabel: draft.menuLabel.trim() || 'Shop' } })))
    toast.success(draft.enabled ? 'Storefront saved' : 'Storefront turned off', { description: draft.enabled ? `Live at ${publicUrl(`${handle}/${STOREFRONT_PATH}`)}${live ? '' : ' once your page is published'}.` : 'The /shop address now shows “page doesn’t exist”.' });
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
            <Button onClick={save} disabled={!dirty}>
              Save changes
            </Button>
          </>
        } />
      

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-8">
          <section aria-labelledby="sf-on" className="rounded-lg border border-line bg-raised p-5">
            <h2 id="sf-on" className="sr-only">
              Storefront on or off
            </h2>
            <Switch id="sf-enabled" label="Show a storefront" description={`At ${publicUrl(`${handle}/${STOREFRONT_PATH}`)}. Draft and archived products never appear.`} checked={draft.enabled} onChange={(v) => set('enabled', v)} />
            {clash && draft.enabled &&
            <InlineAlert tone="warning" title={`Your “${clash}” page already uses /shop`} className="mt-4">
                The storefront stays hidden so that page keeps working. Change the page’s address in the canvas (Pages tab) to use the storefront instead.
              </InlineAlert>
            }
            {!live && draft.enabled &&
            <p className="mt-4 text-caption text-fg-muted">
                Your main page isn’t published yet, so visitors can’t reach the shop. <Link to={`/app/canvas/${state.site.id}`} className="font-medium text-fg underline underline-offset-2">Open the canvas</Link>
              </p>
            }
          </section>

          <section aria-labelledby="sf-content" className={`flex flex-col gap-4 rounded-lg border border-line bg-raised p-5 ${draft.enabled ? '' : 'opacity-60'}`}>
            <h2 id="sf-content" className="text-label font-semibold text-fg">
              What shoppers see
            </h2>
            <TextInput id="sf-title" label="Shop title" value={draft.title} error={tried ? titleError || undefined : undefined} disabled={!draft.enabled} onChange={(e) => set('title', e.target.value)} />
            <TextArea id="sf-intro" label="Intro" optional rows={2} value={draft.intro} disabled={!draft.enabled} placeholder="e.g. Made in small runs in Lekki. Delivery across Lagos." onChange={(e) => set('intro', e.target.value)} />
            <Switch id="sf-menu" label="Add to the site menu" description="Shoppers can get to the shop from any of your pages." checked={draft.showInMenu} disabled={!draft.enabled} onChange={(v) => set('showInMenu', v)} />
            {draft.showInMenu && <TextInput id="sf-menu-label" label="Menu label" value={draft.menuLabel} disabled={!draft.enabled} fieldClassName="max-w-[220px]" onChange={(e) => set('menuLabel', e.target.value)} />}
            <Switch id="sf-soldout" label="Hide sold-out products" description="Off shows them with a Sold out label, so people know to come back." checked={draft.hideSoldOut} disabled={!draft.enabled} onChange={(v) => set('hideSoldOut', v)} />
          </section>

          <section aria-labelledby="sf-order" className={`flex flex-col gap-4 rounded-lg border border-line bg-raised p-5 ${draft.enabled ? '' : 'opacity-60'}`}>
            <h2 id="sf-order" className="text-label font-semibold text-fg">
              How people order
            </h2>
            <Segmented<StorefrontSettings['ordering']>
              ariaLabel="How people order"
              fullWidth
              value={draft.ordering}
              onChange={(v) => set('ordering', v)}
              options={[
              { value: 'checkout', label: 'Cart and checkout' },
              { value: 'whatsapp', label: 'WhatsApp' }]
              } />
            
            {draft.ordering === 'checkout' && !checkoutAllowed &&
            <InlineAlert tone="info" title={`Checkout is on ${plans[CHECKOUT_PLAN].name}`} action={<UpgradeButton plan={CHECKOUT_PLAN} feature="Checkout in your storefront" />}>
                Until then, the shop uses WhatsApp ordering.
              </InlineAlert>
            }
            {usesWhatsApp &&
            <TextInput id="sf-phone" label="WhatsApp number" type="tel" inputMode="tel" value={draft.whatsappPhone} placeholder="+234 …" error={tried ? phoneError || undefined : undefined} hint="Each product sends a pre-filled message with the chosen option and price." onChange={(e) => set('whatsappPhone', e.target.value)} />
            }
            {!usesWhatsApp && <p className="text-caption text-fg-muted">Shoppers add to a cart and pay at checkout, with your delivery options and discount codes.</p>}
          </section>
        </div>

        <aside aria-labelledby="sf-preview" className="flex flex-col gap-4">
          <h2 id="sf-preview" className="text-label font-semibold text-fg">
            In the shop
          </h2>
          <p className="text-caption text-fg-muted">
            <span className="font-semibold tabular-nums text-fg">{products.length}</span> product{products.length === 1 ? '' : 's'}
            {soldOutCount ? ` · ${soldOutCount} sold out` : ''}
            {draftCount ? ` · ${draftCount} draft${draftCount === 1 ? '' : 's'} not shown` : ''}
          </p>
          {products.length === 0 ?
          <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-line-strong p-5">
              <StoreIcon size={20} className="text-fg-subtle" aria-hidden />
              <p className="text-label text-fg-muted">No active products yet. Shoppers will see an empty shop.</p>
              <Link to="/app/commerce/products" className="text-label font-medium text-fg underline underline-offset-2">
                Add products
              </Link>
            </div> :

          <ul className="grid grid-cols-3 gap-2">
              {products.slice(0, 9).map((p) =>
            <li key={p.id} className="overflow-hidden rounded-md border border-line bg-sunken">
                  {p.images[0] ? <MediaImage src={p.images[0].url} alt="" className="aspect-[4/5] w-full object-cover" /> : <div className="aspect-[4/5] w-full" />}
                  <p className="truncate px-2 py-1.5 text-caption text-fg">{p.name}</p>
                </li>
            )}
            </ul>
          }
          <p className="text-caption text-fg-subtle">Collections become filter tabs. Product pages show every photo, option and stock level.</p>
        </aside>
      </div>
    </>);

}