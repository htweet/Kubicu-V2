import React from 'react';
import type { Block, BlockContentMap, BlockType } from '../../../types/page';
import type { ValidationIssue } from '../../../utils/validation';
import { useEditor } from '../../../contexts/EditorContext';
import { usePlan } from '../../../contexts/PlanContext';
import { planAtLeast } from '../../../data/plans';
import { uid } from '../../../utils/id';
import { formatNgn } from '../../../utils/format';
import { TextInput } from '../../ui/TextInput';
import { TextArea } from '../../ui/TextArea';
import { Switch } from '../../ui/Switch';
import { Segmented } from '../../ui/Segmented';
import { InlineAlert } from '../../ui/InlineAlert';
import { Field } from '../../ui/Field';
import { CurrencyInput } from '../../ui/CurrencyInput';
import { DateTimeInput } from '../../ui/DateTimeInput';
import { TimezoneSelect, type TimeZoneId } from '../../ui/TimezoneSelect';
import { IllustrativeTag } from '../../ui/IllustrativeTag';
import { MediaPicker } from '../../media/MediaPicker';
import { ItemListEditor } from './ItemListEditor';
import { HoursEditor } from './HoursEditor';
import { OrderActionField, ProductPicker, ProductSelect, SourceSwitch, SyncedNote, productSummary, useCheckoutAllowed } from './CatalogFields';
import { SelectInput } from '../../ui/SelectInput';
import { useCommerce } from '../../../contexts/CommerceContext';
import { useOps } from '../../../contexts/OpsContext';
import { findProduct, priceRange } from '../../../utils/commerce/catalog';
import { EventLinkFields } from './EventLinkFields';
import { MediaSupportFields } from './MediaSupportFields';

interface Props {
  block: Block;
  issues: ValidationIssue[];
}

const priceTag = <IllustrativeTag note="KUBICU never invents prices. Leave blank to show “Price on request”." />;
const priceText = (p: number | null) => p === null ? 'Price on request' : formatNgn(p);

/** Inspector fields for the blocks added in Batch 3. */
export function ExtendedContentFields({ block, issues }: Props) {
  const { actions } = useEditor();
  const plan = usePlan();
  const commerce = useCommerce().data;
  const ops = useOps().data;
  const checkout = useCheckoutAllowed();
  const err = (field: string) => issues.find((i) => i.field === field && i.severity === 'error')?.message;
  const warn = (field: string) => issues.find((i) => i.field === field && i.severity === 'warning')?.message;
  const id = (field: string) => `${block.id}-${field}`;
  const setter =
  <K extends BlockType,>(type: K) =>
  (patch: Partial<BlockContentMap[K]>, field: string) =>
  actions.updateContent(block.id, type, patch, field);
  const stack = 'flex flex-col gap-4';

  switch (block.type) {
    case 'gallery':{
        const c = block.content;
        const set = setter('gallery');
        const unlocked = planAtLeast(plan.id, 'creator');
        return (
          <div className={stack}>
          {!unlocked &&
            <InlineAlert tone="info" title="Creator plan shows the full gallery">
              On {plan.name}, visitors see the first photo only. Your other photos are kept and appear when you upgrade.
            </InlineAlert>
            }
          <TextInput id={id('title')} label="Title" optional value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
          <Field id={id('layout')} label="Layout">
            <Segmented ariaLabel="Gallery layout" value={c.layout} onChange={(layout) => set({ layout }, 'layout')} options={[{ value: 'grid', label: 'Grid' }, { value: 'masonry', label: 'Masonry' }, { value: 'carousel', label: 'Swipe' }]} />
          </Field>
          <ItemListEditor
              legend="Photos"
              noun="Photo"
              items={c.images}
              onChange={(images, f) => set({ images }, f)}
              title={(img) => img.alt || (img.url ? 'Photo' : '')}
              meta={(img) => img.url && !img.alt ? 'Needs a description' : undefined}
              create={() => ({ id: uid('img'), url: '', alt: '' })}
              addLabel="Add photo"
              hint={warn('images')}
              error={err('images')}
              render={(img, update) =>
              <>
                <MediaPicker id={id(`img-${img.id}`)} label="Photo" aspect="1:1" value={img.url} onChange={(url, meta) => update(meta?.alt && !img.alt.trim() ? { url, alt: meta.alt } : { url }, 'url')} />
                <TextInput id={id(`alt-${img.id}`)} label="Photo description" value={img.alt} hint="Read aloud by screen readers." onChange={(e) => update({ alt: e.target.value }, 'alt')} />
              </>
              } />
            
        </div>);

      }
    case 'productGrid':{
        const c = block.content;
        const set = setter('productGrid');
        const sourceSwitch =
        <SourceSwitch
          id={id('source')}
          value={c.source === 'catalog' ? 'catalog' : 'manual'}
          onChange={(source) =>
          set(
            source === 'catalog' ?
            { source, orderAction: checkout.allowed ? 'checkout' : 'whatsapp', ctaLabel: checkout.allowed ? 'Add to cart' : 'Order' } :
            { source, orderAction: c.orderAction === 'checkout' ? 'whatsapp' : c.orderAction, ctaLabel: 'Order' },
            'source'
          )
          } />;


        if (c.source === 'catalog') {
          const byCollection = !!c.collectionId;
          return (
            <div className={stack}>
            {sourceSwitch}
            <TextInput id={id('title')} label="Title" optional value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
            <Field id={id('pick')} label="Show">
              <Segmented
                  ariaLabel="Which products"
                  fullWidth
                  value={byCollection ? 'collection' : 'pick'}
                  onChange={(v) => set(v === 'collection' ? { collectionId: commerce.collections[0]?.id ?? null } : { collectionId: null }, 'source')}
                  options={[
                  { value: 'pick', label: 'Products I pick' },
                  { value: 'collection', label: 'A collection' }]
                  } />
                
            </Field>
            {byCollection ?
              commerce.collections.length ?
              <SelectInput
                id={id('collection')}
                label="Collection"
                value={c.collectionId ?? ''}
                onChange={(collectionId) => set({ collectionId }, 'source')}
                options={commerce.collections.map((col) => ({ value: col.id, label: col.name }))}
                hint="New products added to this collection appear automatically. Up to 12." /> :


              <p className="text-caption text-fg-muted">No collections yet. Create one from Commerce → Products.</p> :


              <ProductPicker selected={c.productIds ?? []} onChange={(productIds) => set({ productIds }, 'source')} />
              }
            {err('source') && <p className="text-caption text-danger">{err('source')}</p>}
            {!err('source') && warn('source') && <p className="text-caption text-warning">{warn('source')}</p>}
            <OrderActionField
                id={id('order')}
                value={c.orderAction === 'link' ? 'whatsapp' : c.orderAction}
                onChange={(orderAction) => set({ orderAction, ctaLabel: orderAction === 'checkout' ? 'Add to cart' : 'Order' }, 'orderAction')}
                options={[
                { value: 'checkout', label: 'Checkout' },
                { value: 'whatsapp', label: 'WhatsApp' }]
                } />
              
            {err('orderAction') && <p className="-mt-2 text-caption text-danger">{err('orderAction')}</p>}
            {c.orderAction === 'whatsapp' &&
              <TextInput id={id('wa')} label="WhatsApp number" type="tel" inputMode="tel" placeholder="+234 …" value={c.whatsappPhone} error={err('whatsappPhone')} onChange={(e) => set({ whatsappPhone: e.target.value }, 'whatsappPhone')} />
              }
            <TextInput id={id('cta')} label="Button label" value={c.ctaLabel} onChange={(e) => set({ ctaLabel: e.target.value }, 'ctaLabel')} />
            <p className="text-caption text-fg-subtle">Prices, photos and sold-out status stay in sync with Commerce. Drafts and archived products never show.</p>
          </div>);

        }
        return (
          <div className={stack}>
          {sourceSwitch}
          <TextInput id={id('title')} label="Title" optional value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
          <ItemListEditor
              legend="Products"
              noun="Product"
              items={c.items}
              min={1}
              onChange={(items, f) => set({ items }, f)}
              title={(p) => p.name}
              meta={(p) => `${priceText(p.priceNgn)}${p.soldOut ? ' · Sold out' : ''}`}
              create={() => ({ id: uid('gp'), name: '', priceNgn: null, imageUrl: '', imageAlt: '', note: '', soldOut: false, url: '' })}
              addLabel="Add product"
              error={err('items')}
              hint={warn('items')}
              render={(p, update) =>
              <>
                <TextInput id={id(`n-${p.id}`)} label="Name" value={p.name} onChange={(e) => update({ name: e.target.value }, 'name')} />
                <CurrencyInput id={id(`p-${p.id}`)} label="Price" value={p.priceNgn} placeholder="Price on request" trailing={priceTag} onChange={(priceNgn) => update({ priceNgn }, 'price')} />
                <TextInput id={id(`note-${p.id}`)} label="Short note" optional placeholder="e.g. Sizes 8–16" value={p.note} onChange={(e) => update({ note: e.target.value }, 'note')} />
                <MediaPicker id={id(`img-${p.id}`)} label="Photo" aspect="1:1" value={p.imageUrl} onChange={(imageUrl) => update({ imageUrl }, 'image')} />
                {p.imageUrl && <TextInput id={id(`alt-${p.id}`)} label="Photo description" value={p.imageAlt} onChange={(e) => update({ imageAlt: e.target.value }, 'alt')} />}
                {c.orderAction === 'link' && <TextInput id={id(`url-${p.id}`)} label="Order link" type="url" inputMode="url" placeholder="https://" value={p.url} onChange={(e) => update({ url: e.target.value }, 'url')} />}
                <Switch id={id(`so-${p.id}`)} label="Sold out" description="Shows a Sold out tag and hides the order button." checked={p.soldOut} onChange={(soldOut) => update({ soldOut }, 'soldOut')} />
              </>
              } />
            
          <Field id={id('order')} label="When someone taps order">
            <Segmented ariaLabel="Order action" fullWidth value={c.orderAction === 'checkout' ? 'whatsapp' : c.orderAction} onChange={(orderAction) => set({ orderAction }, 'orderAction')} options={[{ value: 'whatsapp', label: 'Open WhatsApp' }, { value: 'link', label: 'Open a link' }]} />
          </Field>
          {c.orderAction !== 'link' &&
            <TextInput id={id('wa')} label="WhatsApp number" type="tel" inputMode="tel" placeholder="+234 …" value={c.whatsappPhone} error={err('whatsappPhone')} hint="Each order message names the product and price." onChange={(e) => set({ whatsappPhone: e.target.value }, 'whatsappPhone')} />
            }
          <TextInput id={id('cta')} label="Button label" value={c.ctaLabel} onChange={(e) => set({ ctaLabel: e.target.value }, 'ctaLabel')} />
          <p className="text-caption text-fg-subtle">Here you mark items sold out yourself. For live stock and checkout, switch to “Commerce” above.</p>
        </div>);

      }
    case 'menu':{
        const c = block.content;
        const set = setter('menu');
        return (
          <div className={stack}>
          <TextInput id={id('title')} label="Title" value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
          <TextArea id={id('note')} label="Note" optional rows={2} placeholder="e.g. Delivery within Ibadan from ₦1,500" value={c.note} onChange={(e) => set({ note: e.target.value }, 'note')} />
          <ItemListEditor
              legend="Categories"
              noun="Category"
              items={c.categories}
              min={1}
              max={8}
              onChange={(categories, f) => set({ categories }, f)}
              title={(cat) => cat.name}
              meta={(cat) => `${cat.items.length} item${cat.items.length === 1 ? '' : 's'}`}
              create={() => ({ id: uid('mc'), name: '', items: [{ id: uid('mi'), name: '', description: '', priceNgn: null, tags: '', available: true }] })}
              addLabel="Add category"
              error={err('categories')}
              render={(cat, updateCat) =>
              <>
                <TextInput id={id(`cat-${cat.id}`)} label="Category name" value={cat.name} onChange={(e) => updateCat({ name: e.target.value }, 'name')} />
                <ItemListEditor
                  legend="Items"
                  noun="Item"
                  items={cat.items}
                  max={20}
                  onChange={(items, f) => updateCat({ items }, f)}
                  title={(it) => findProduct(commerce, it.productId)?.name ?? it.name}
                  meta={(it) => {
                    const p = findProduct(commerce, it.productId);
                    if (it.productId && p) return `Synced · ${p.status === 'active' ? productSummary(p) : `${p.status}, hidden`}`;
                    if (it.productId) return 'Linked product deleted · showing typed details';
                    return `${it.priceNgn === null ? 'No price' : formatNgn(it.priceNgn)}${it.available ? '' : ' · Sold out today'}`;
                  }}
                  create={() => ({ id: uid('mi'), name: '', description: '', priceNgn: null, tags: '', available: true })}
                  addLabel="Add item"
                  render={(it, update) => {
                    const linkable = commerce.products.filter((p) => p.kind === 'physical' && p.status !== 'archived');
                    const product = findProduct(commerce, it.productId);
                    return (
                      <>
                        {linkable.length > 0 || it.productId ?
                        <SelectInput
                          id={id(`ilink-${it.id}`)}
                          label="Details come from"
                          value={it.productId ?? ''}
                          options={[
                          { value: '', label: 'Typed here' },
                          ...linkable.map((p) => ({ value: p.id, label: `Commerce · ${p.name}${p.status === 'draft' ? ' (draft)' : ''}` })),
                          ...(it.productId && !linkable.some((p) => p.id === it.productId) ? [{ value: it.productId, label: product ? `${product.name} (archived)` : 'Deleted product' }] : [])]
                          }
                          onChange={(productId) => {
                            const p = findProduct(commerce, productId);
                            const range = p ? priceRange(p) : null;
                            // Keep a typed copy so the item still reads well if the product is later deleted.
                            update(p ? { productId, name: p.name, description: p.description.split('\n')[0].slice(0, 140), priceNgn: range ? range[0] : null } : { productId: undefined }, 'link');
                          }} /> :


                        <p className="text-caption text-fg-subtle">Add products in Commerce to sync dishes, prices and sold-out status here.</p>
                        }
                        {product ?
                        <SyncedNote product={product} /> :

                        <>
                            <TextInput id={id(`in-${it.id}`)} label="Name" value={it.name} onChange={(e) => update({ name: e.target.value }, 'name')} />
                            <TextInput id={id(`id-${it.id}`)} label="Description" optional value={it.description} onChange={(e) => update({ description: e.target.value }, 'desc')} />
                            <CurrencyInput id={id(`ip-${it.id}`)} label="Price" value={it.priceNgn} placeholder="Ask" trailing={priceTag} onChange={(priceNgn) => update({ priceNgn }, 'price')} />
                          </>
                        }
                        <TextInput id={id(`it-${it.id}`)} label="Notes" optional placeholder="e.g. Spicy · Contains nuts" value={it.tags} onChange={(e) => update({ tags: e.target.value }, 'tags')} />
                        <Switch
                          id={id(`ia-${it.id}`)}
                          label="Available today"
                          description={product ? 'Also shows sold out automatically when Commerce stock runs out.' : undefined}
                          checked={it.available}
                          onChange={(available) => update({ available }, 'available')} />
                        
                      </>);

                  }} />
                
              </>
              } />
            
          <TextInput id={id('wa')} label="WhatsApp for orders" type="tel" inputMode="tel" placeholder="+234 …" value={c.whatsappPhone} error={err('whatsappPhone')} hint={warn('whatsappPhone')} onChange={(e) => set({ whatsappPhone: e.target.value }, 'whatsappPhone')} />
          <Switch id={id('open')} label="Taking orders" description="Turn off when the kitchen is closed. The menu stays visible." checked={c.orderingOpen} onChange={(orderingOpen) => set({ orderingOpen }, 'orderingOpen')} />
          {!c.orderingOpen && <TextInput id={id('closed')} label="Message while paused" value={c.closedMessage} onChange={(e) => set({ closedMessage: e.target.value }, 'closedMessage')} />}
        </div>);

      }
    case 'pricing':{
        const c = block.content;
        const set = setter('pricing');
        return (
          <div className={stack}>
          <TextInput id={id('title')} label="Title" optional value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
          <ItemListEditor
              legend="Packages"
              noun="Package"
              items={c.packages}
              min={1}
              max={3}
              onChange={(packages, f) => set({ packages }, f)}
              title={(p) => p.name}
              meta={(p) => `${priceText(p.priceNgn)}${p.highlighted ? ' · Highlighted' : ''}`}
              create={() => ({ id: uid('pk'), name: '', priceNgn: null, unit: '', description: '', features: '', ctaLabel: 'Enquire', url: '', highlighted: false })}
              addLabel="Add package"
              error={err('packages')}
              hint={warn('packages')}
              render={(p, update) =>
              <>
                <TextInput id={id(`n-${p.id}`)} label="Name" value={p.name} onChange={(e) => update({ name: e.target.value }, 'name')} />
                <div className="grid grid-cols-[1fr_120px] gap-2">
                  <CurrencyInput id={id(`p-${p.id}`)} label="Price" value={p.priceNgn} placeholder="On request" trailing={priceTag} onChange={(priceNgn) => update({ priceNgn }, 'price')} />
                  <TextInput id={id(`u-${p.id}`)} label="Per" optional placeholder="project" value={p.unit} onChange={(e) => update({ unit: e.target.value }, 'unit')} />
                </div>
                <TextInput id={id(`d-${p.id}`)} label="One-line summary" optional value={p.description} onChange={(e) => update({ description: e.target.value }, 'desc')} />
                <TextArea id={id(`f-${p.id}`)} label="What’s included" rows={4} hint="One item per line." value={p.features} onChange={(e) => update({ features: e.target.value }, 'features')} />
                <TextInput id={id(`l-${p.id}`)} label="Button label" value={p.ctaLabel} onChange={(e) => update({ ctaLabel: e.target.value }, 'cta')} />
                {ops.services.length > 0 &&
                <SelectInput
                  id={id(`svc-${p.id}`)}
                  label="Button books a service"
                  value={p.serviceId ?? ''}
                  onChange={(serviceId) => update({ serviceId: serviceId || undefined }, 'service')}
                  options={[{ value: '', label: 'No — use a link' }, ...ops.services.map((s) => ({ value: s.id, label: s.name }))]}
                  hint="Opens your booking calendar on the page." />

                }
                {!p.serviceId && <TextInput id={id(`url-${p.id}`)} label="Button link" type="url" inputMode="url" placeholder="https://" value={p.url} onChange={(e) => update({ url: e.target.value }, 'url')} />}
                <Switch
                  id={id(`h-${p.id}`)}
                  label="Highlight this package"
                  checked={p.highlighted}
                  onChange={(highlighted) =>
                  set({ packages: c.packages.map((x) => ({ ...x, highlighted: x.id === p.id ? highlighted : highlighted ? false : x.highlighted })) }, 'highlight')
                  } />
                
              </>
              } />
            
        </div>);

      }
    case 'testimonial':{
        const c = block.content;
        const set = setter('testimonial');
        return (
          <div className={stack}>
          <TextArea id={id('quote')} label="Their words" rows={4} value={c.quote} error={err('quote')} hint="Use what they actually said. Don’t edit the meaning." onChange={(e) => set({ quote: e.target.value }, 'quote')} />
          <TextInput id={id('name')} label="Name" value={c.name} error={err('name')} onChange={(e) => set({ name: e.target.value }, 'name')} />
          <TextInput id={id('role')} label="Role or context" optional placeholder="e.g. Bride, Lekki" value={c.role} onChange={(e) => set({ role: e.target.value }, 'role')} />
          <TextInput id={id('source')} label="Where it came from" optional placeholder="e.g. Instagram DM, Google review" value={c.source} onChange={(e) => set({ source: e.target.value }, 'source')} />
          <MediaPicker id={id('avatar')} label="Their photo" optional round aspect="1:1" value={c.avatarUrl} onChange={(avatarUrl) => set({ avatarUrl }, 'avatarUrl')} />
          {c.avatarUrl && <TextInput id={id('avatarAlt')} label="Photo description" value={c.avatarAlt} onChange={(e) => set({ avatarAlt: e.target.value }, 'avatarAlt')} />}
          <div className="rounded-md border border-line p-3">
            <label className="flex items-start gap-2.5 text-label text-fg">
              <input type="checkbox" checked={c.permission} onChange={(e) => set({ permission: e.target.checked }, 'permission')} className="mt-0.5 h-4 w-4 accent-[rgb(var(--action))]" />
              <span>
                I have this person’s permission to publish their words{c.avatarUrl ? ' and photo' : ''}.
                <span className="mt-0.5 block text-caption text-fg-subtle">Until you tick this, the quote stays hidden from visitors.</span>
              </span>
            </label>
            {err('permission') && <p className="mt-2 text-caption text-danger">{err('permission')}</p>}
          </div>
        </div>);

      }
    case 'event':{
        const c = block.content;
        const set = setter('event');
        const source = c.source ?? 'manual';
        const sourceSwitch = <SourceSwitch id={id('source')} value={source} catalogLabel="Commerce event" onChange={(v) => set({ source: v }, 'source')} />;
        if (source === 'catalog') {
          return (
            <div className={stack}>
            {sourceSwitch}
            <EventLinkFields id={id('event')} eventId={c.eventId ?? null} error={err('eventId')} onChange={(eventId) => set({ eventId }, 'eventId')} />
            <TextInput id={id('cta')} label="Button label" optional placeholder="Get tickets" value={c.ctaLabel} onChange={(e) => set({ ctaLabel: e.target.value }, 'ctaLabel')} />
          </div>);

        }
        return (
          <div className={stack}>
          {sourceSwitch}
          <TextInput id={id('title')} label="Event name" value={c.title} error={err('title')} onChange={(e) => set({ title: e.target.value }, 'title')} />
          <DateTimeInput id={id('start')} label="Starts" value={c.startsAt} error={err('startsAt')} hint="Used for the date shown and the Event ended state." onChange={(startsAt) => set({ startsAt }, 'startsAt')} />
          <DateTimeInput id={id('end')} label="Ends" optional clearable value={c.endsAt} error={err('endsAt')} onChange={(endsAt) => set({ endsAt }, 'endsAt')} />
          <TimezoneSelect id={id('tz')} label="Show times in" value={c.timeZone as TimeZoneId} onChange={(timeZone) => set({ timeZone }, 'timeZone')} />
          <TextInput id={id('venue')} label="Venue" value={c.venue} hint={warn('venue')} onChange={(e) => set({ venue: e.target.value }, 'venue')} />
          <TextInput id={id('address')} label="Address" optional value={c.address} onChange={(e) => set({ address: e.target.value }, 'address')} />
          <ItemListEditor
              legend="Ticket types"
              noun="Ticket"
              items={c.tiers}
              max={5}
              onChange={(tiers, f) => set({ tiers }, f)}
              title={(t) => t.name}
              meta={(t) => t.soldOut ? 'Sold out' : t.priceNgn === 0 ? 'Free' : priceText(t.priceNgn)}
              create={() => ({ id: uid('tier'), name: '', priceNgn: null, note: '', soldOut: false })}
              addLabel="Add ticket type"
              render={(t, update) =>
              <>
                <TextInput id={id(`tn-${t.id}`)} label="Name" placeholder="e.g. Early bird" value={t.name} onChange={(e) => update({ name: e.target.value }, 'name')} />
                <CurrencyInput id={id(`tp-${t.id}`)} label="Price" value={t.priceNgn} placeholder="TBC" hint="Enter 0 for free entry." trailing={priceTag} onChange={(priceNgn) => update({ priceNgn }, 'price')} />
                <TextInput id={id(`tt-${t.id}`)} label="Note" optional placeholder="e.g. Includes brunch" value={t.note} onChange={(e) => update({ note: e.target.value }, 'note')} />
                <Switch id={id(`ts-${t.id}`)} label="Sold out" checked={t.soldOut} onChange={(soldOut) => update({ soldOut }, 'soldOut')} />
              </>
              } />
            
          <TextInput id={id('url')} label="Ticket link" type="url" inputMode="url" placeholder="https://" value={c.ticketUrl} error={err('ticketUrl')} onChange={(e) => set({ ticketUrl: e.target.value }, 'ticketUrl')} />
          <TextInput id={id('cta')} label="Button label" value={c.ctaLabel} onChange={(e) => set({ ctaLabel: e.target.value }, 'ctaLabel')} />
          <Switch id={id('soldout')} label="Whole event sold out" checked={c.soldOut} onChange={(soldOut) => set({ soldOut }, 'soldOut')} />
          <InlineAlert tone="info" title="Sell tickets on KUBICU instead">
            Switch “Details come from” to Commerce event for real seat limits, checkout and QR tickets.
          </InlineAlert>
        </div>);

      }
    case 'countdown':{
        const c = block.content;
        const set = setter('countdown');
        return (
          <div className={stack}>
          <TextInput id={id('title')} label="Title" value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
          <DateTimeInput id={id('target')} label="Counts down to" value={c.target} error={err('target')} hint={warn('target')} onChange={(target) => set({ target }, 'target')} />
          <TextInput id={id('ended')} label="Message when it ends" value={c.endedMessage} onChange={(e) => set({ endedMessage: e.target.value }, 'endedMessage')} />
          <TextInput id={id('linkLabel')} label="Button label" optional value={c.linkLabel} onChange={(e) => set({ linkLabel: e.target.value }, 'linkLabel')} />
          {c.linkLabel && <TextInput id={id('url')} label="Button link" type="url" inputMode="url" placeholder="https://" value={c.url} error={err('url')} onChange={(e) => set({ url: e.target.value }, 'url')} />}
          <InlineAlert tone="info" title="Honest by design">
            The countdown only runs to the date you set and never restarts for new visitors. When it reaches zero, people see your ended message.
          </InlineAlert>
        </div>);

      }
    case 'download':{
        const c = block.content;
        const set = setter('download');
        const sourceSwitch =
        <SourceSwitch
          id={id('source')}
          value={c.source === 'catalog' ? 'catalog' : 'manual'}
          onChange={(source) => set(source === 'catalog' ? { source, ctaLabel: 'Buy and download' } : { source, ctaLabel: c.access === 'paid' ? 'Buy now' : 'Download' }, 'source')} />;


        if (c.source === 'catalog') {
          const product = findProduct(commerce, c.productId);
          return (
            <div className={stack}>
            {!checkout.allowed &&
              <InlineAlert tone="info" title={`Secure file delivery is on ${checkout.needed}`}>
                You can set it up now; it can’t be published on {plan.name}.
              </InlineAlert>
              }
            {sourceSwitch}
            <ProductSelect id={id('productId')} kind="digital" value={c.productId} onChange={(productId) => set({ productId }, 'productId')} />
            {err('productId') && <p className="-mt-2 text-caption text-danger">{err('productId')}</p>}
            {!err('productId') && warn('productId') && <p className="-mt-2 text-caption text-warning">{warn('productId')}</p>}
            {product && <SyncedNote product={product} />}
            <TextInput id={id('title')} label="Title" optional placeholder={product?.name} value={c.title} hint="Leave blank to use the product name." onChange={(e) => set({ title: e.target.value }, 'title')} />
            <TextInput id={id('cta')} label="Button label" value={c.ctaLabel} onChange={(e) => set({ ctaLabel: e.target.value }, 'ctaLabel')} />
            <p className="text-caption text-fg-subtle">Buyers pay through checkout (test mode) and get a secure download link with your limits.</p>
          </div>);

        }
        return (
          <div className={stack}>
          {sourceSwitch}
          <TextInput id={id('title')} label="Title" value={c.title} error={err('title')} onChange={(e) => set({ title: e.target.value }, 'title')} />
          <TextArea id={id('desc')} label="Description" optional rows={2} value={c.description} onChange={(e) => set({ description: e.target.value }, 'description')} />
          <div className="grid grid-cols-2 gap-2">
            <TextInput id={id('format')} label="Format" placeholder="PDF" value={c.format} onChange={(e) => set({ format: e.target.value }, 'format')} />
            <TextInput id={id('size')} label="Size" optional placeholder="12 MB" value={c.fileSize} onChange={(e) => set({ fileSize: e.target.value }, 'fileSize')} />
          </div>
          <Field id={id('access')} label="Access">
            <Segmented ariaLabel="Access" fullWidth value={c.access} onChange={(access) => set({ access, ctaLabel: access === 'paid' ? 'Buy now' : 'Download' }, 'access')} options={[{ value: 'free', label: 'Free' }, { value: 'paid', label: 'Paid via link' }]} />
          </Field>
          {c.access === 'paid' && <CurrencyInput id={id('price')} label="Price" value={c.priceNgn} hint={warn('priceNgn')} trailing={priceTag} onChange={(priceNgn) => set({ priceNgn }, 'priceNgn')} />}
          <TextInput
              id={id('url')}
              label={c.access === 'paid' ? 'Your payment page link' : 'File link'}
              type="url"
              inputMode="url"
              placeholder="https://"
              value={c.url}
              error={err('url')}
              hint={c.access === 'paid' ? 'e.g. your Paystack or Selar product page.' : 'A shared Google Drive, Dropbox or website link.'}
              onChange={(e) => set({ url: e.target.value }, 'url')} />
            
          <TextInput id={id('cta')} label="Button label" value={c.ctaLabel} onChange={(e) => set({ ctaLabel: e.target.value }, 'ctaLabel')} />
          <MediaPicker id={id('cover')} label="Cover image" optional aspect="4:5" value={c.coverUrl} onChange={(coverUrl) => set({ coverUrl }, 'coverUrl')} />
          {c.coverUrl && <TextInput id={id('coverAlt')} label="Cover description" value={c.coverAlt} onChange={(e) => set({ coverAlt: e.target.value }, 'coverAlt')} />}
          <p className="text-caption text-fg-subtle">To sell files with secure delivery and download limits, switch to “Commerce” above.</p>
        </div>);

      }
    case 'portfolio':{
        const c = block.content;
        const set = setter('portfolio');
        return (
          <div className={stack}>
          <TextInput id={id('title')} label="Title" optional value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
          <ItemListEditor
              legend="Projects"
              noun="Project"
              items={c.items}
              min={1}
              max={8}
              onChange={(items, f) => set({ items }, f)}
              title={(p) => p.title}
              meta={(p) => p.client || undefined}
              create={() => ({ id: uid('pf'), title: '', client: '', role: '', outcome: '', summary: '', coverUrl: '', coverAlt: '', url: '' })}
              addLabel="Add project"
              error={err('items')}
              hint={warn('items')}
              render={(p, update) =>
              <>
                <TextInput id={id(`t-${p.id}`)} label="Project title" value={p.title} onChange={(e) => update({ title: e.target.value }, 'title')} />
                <div className="grid grid-cols-2 gap-2">
                  <TextInput id={id(`c-${p.id}`)} label="Client" optional value={p.client} onChange={(e) => update({ client: e.target.value }, 'client')} />
                  <TextInput id={id(`r-${p.id}`)} label="Your role" optional value={p.role} onChange={(e) => update({ role: e.target.value }, 'role')} />
                </div>
                <TextInput id={id(`o-${p.id}`)} label="Outcome" optional hint="Only results you can stand behind." value={p.outcome} onChange={(e) => update({ outcome: e.target.value }, 'outcome')} />
                <TextArea id={id(`s-${p.id}`)} label="Case study" optional rows={4} hint="Shown when a visitor opens the project." value={p.summary} onChange={(e) => update({ summary: e.target.value }, 'summary')} />
                <MediaPicker id={id(`img-${p.id}`)} label="Cover image" aspect="16:9" value={p.coverUrl} onChange={(coverUrl) => update({ coverUrl }, 'cover')} />
                {p.coverUrl && <TextInput id={id(`a-${p.id}`)} label="Cover description" value={p.coverAlt} onChange={(e) => update({ coverAlt: e.target.value }, 'alt')} />}
                <TextInput id={id(`u-${p.id}`)} label="Project link" optional type="url" inputMode="url" placeholder="https://" value={p.url} onChange={(e) => update({ url: e.target.value }, 'url')} />
              </>
              } />
            
        </div>);

      }
    case 'location':{
        const c = block.content;
        const set = setter('location');
        return (
          <div className={stack}>
          <TextInput id={id('name')} label="Place name" optional placeholder="e.g. Our Yaba shop" value={c.name} onChange={(e) => set({ name: e.target.value }, 'name')} />
          <TextArea id={id('address')} label="Address" rows={2} value={c.address} error={err('address')} onChange={(e) => set({ address: e.target.value }, 'address')} />
          <TimezoneSelect id={id('tz')} label="Your time zone" value={c.timeZone as TimeZoneId} hint="The open-now badge uses this." onChange={(timeZone) => set({ timeZone }, 'timeZone')} />
          <HoursEditor blockId={block.id} hours={c.hours} error={err('hours')} onChange={(hours, f) => set({ hours }, f)} />
          <TextInput id={id('note')} label="Note" optional placeholder="e.g. Parking at the back" value={c.note} onChange={(e) => set({ note: e.target.value }, 'note')} />
        </div>);

      }
    default:
      return <MediaSupportFields block={block} issues={issues} />;
  }
}