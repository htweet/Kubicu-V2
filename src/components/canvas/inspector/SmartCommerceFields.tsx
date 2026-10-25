import React from 'react';
import type { Block, BlockContentMap, BlockType, SmartRule } from '../../../types/page';
import type { SourceId } from '../../../types/analytics';
import type { ValidationIssue } from '../../../utils/validation';
import { useEditor } from '../../../contexts/EditorContext';
import { useCatalog } from '../../../contexts/CatalogContext';
import { uid } from '../../../utils/id';
import { intentSources } from '../../../utils/intentflow';
import { sourceLabels } from '../../../utils/analytics/track';
import { formatNgn } from '../../../utils/format';
import { TextInput } from '../../ui/TextInput';
import { TextArea } from '../../ui/TextArea';
import { Segmented } from '../../ui/Segmented';
import { Field } from '../../ui/Field';
import { SelectInput } from '../../ui/SelectInput';
import { InlineAlert } from '../../ui/InlineAlert';
import { DateTimeInput } from '../../ui/DateTimeInput';
import { MediaPicker } from '../../media/MediaPicker';
import { ItemListEditor } from './ItemListEditor';
import { useCheckoutAllowed } from './CatalogFields';

type SmartCommerceType = 'shopCategories' | 'checkoutButton' | 'reviewSummary' | 'smartButton' | 'campaignSpotlight' | 'recommendations';
const types = new Set<BlockType>(['shopCategories', 'checkoutButton', 'reviewSummary', 'smartButton', 'campaignSpotlight', 'recommendations']);
export const isSmartCommerceBlock = (b: Block): b is Extract<Block, {type: SmartCommerceType;}> => types.has(b.type);

/** Inspector content for the commerce, review and rule-based smart blocks of round 2 (D170). */
export function SmartCommerceFields({ block, issues }: {block: Extract<Block, {type: SmartCommerceType;}>;issues: ValidationIssue[];}) {
  const { actions } = useEditor();
  const data = useCatalog();
  const checkout = useCheckoutAllowed();
  const err = (f: string) => issues.find((i) => i.field === f && i.severity === 'error')?.message;
  const id = (f: string) => `${block.id}-${f}`;
  const setter =
  <K extends BlockType,>(type: K) =>
  (patch: Partial<BlockContentMap[K]>, field: string) =>
  actions.updateContent(block.id, type, patch, field);
  const stack = 'flex flex-col gap-4';

  switch (block.type) {
    case 'shopCategories':{
        const c = block.content;
        const set = setter('shopCategories');
        const cols = data?.collections ?? [];
        const toggle = (cid: string) => set({ collectionIds: c.collectionIds.includes(cid) ? c.collectionIds.filter((x) => x !== cid) : [...c.collectionIds, cid] }, 'collectionIds');
        return (
          <div className={stack}>
          <TextInput id={id('title')} label="Title" optional value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
          <Field id={id('layout')} label="Show as">
            <Segmented ariaLabel="Show as" fullWidth value={c.layout} onChange={(layout) => set({ layout }, 'layout')} options={[{ value: 'cards', label: 'Cards' }, { value: 'chips', label: 'Chips' }]} />
          </Field>
          {cols.length === 0 ?
            <InlineAlert tone="info" title="No collections yet">Create collections in Commerce → Products. Collections with no active products stay hidden.</InlineAlert> :

            <fieldset className="flex flex-col gap-1.5">
              <legend className="mb-1 text-label font-medium text-fg">Collections to show</legend>
              <p className="text-caption text-fg-subtle">None ticked shows all of them.</p>
              {cols.map((col) =>
              <label key={col.id} className="flex min-h-[40px] items-center gap-2.5 text-label text-fg">
                  <input type="checkbox" className="h-4 w-4" checked={c.collectionIds.includes(col.id)} onChange={() => toggle(col.id)} />
                  {col.name}
                </label>
              )}
            </fieldset>
            }
        </div>);

      }
    case 'checkoutButton':{
        const c = block.content;
        const set = setter('checkoutButton');
        const products = (data?.products ?? []).filter((p) => p.status === 'active' && p.kind !== 'ticket');
        return (
          <div className={stack}>
          <Field id={id('mode')} label="When tapped">
            <Segmented ariaLabel="When tapped" fullWidth value={c.mode} onChange={(mode) => set({ mode }, 'mode')} options={[{ value: 'checkout', label: 'Your checkout' }, { value: 'link', label: 'A payment link' }]} />
          </Field>
          {c.mode === 'checkout' ?
            <>
              {!checkout.allowed && <InlineAlert tone="warning" title={`Checkout is on the ${checkout.needed} plan`}>Until then, use a payment link instead.</InlineAlert>}
              <SelectInput<string>
                id={id('product')}
                label="Product"
                value={c.productId ?? ''}
                error={err('productId')}
                onChange={(v) => set({ productId: v || null }, 'productId')}
                options={[{ value: '', label: products.length ? 'Choose a product…' : 'No active products yet' }, ...products.map((p) => ({ value: p.id, label: `${p.name}${p.priceNgn !== null ? ` · ${formatNgn(p.priceNgn)}` : ''}` }))]} />
              
            </> :

            <TextInput id={id('url')} label="Payment link" type="url" placeholder="https://paystack.com/pay/…" hint="Visitors are told they’ll pay on that site." value={c.url} error={err('url')} onChange={(e) => set({ url: e.target.value }, 'url')} />
            }
          <TextInput id={id('label')} label="Button" value={c.label} onChange={(e) => set({ label: e.target.value }, 'label')} />
          <TextInput id={id('note')} label="Small print" optional placeholder="e.g. Ships in 2–3 days" value={c.note} onChange={(e) => set({ note: e.target.value }, 'note')} />
        </div>);

      }
    case 'reviewSummary':{
        const c = block.content;
        const set = setter('reviewSummary');
        return (
          <div className={stack}>
          <TextInput id={id('title')} label="Title" optional value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
          <Field id={id('limit')} label="Latest reviews to show">
            <Segmented ariaLabel="Latest reviews to show" fullWidth value={String(c.limit) as '0' | '3' | '5'} onChange={(v) => set({ limit: Number(v) }, 'limit')} options={[{ value: '0', label: 'None' }, { value: '3', label: '3' }, { value: '5', label: '5' }]} />
          </Field>
          <InlineAlert tone="info" title="Only verified reviews">The average and count come from reviews tied to a real order, booking or job in Proof. You can’t type reviews in here.</InlineAlert>
        </div>);

      }
    case 'smartButton':{
        const c = block.content;
        const set = setter('smartButton');
        const used = new Set(c.rules.map((r) => r.source));
        return (
          <div className={stack}>
          <TextInput id={id('label')} label="Default words" hint="What everyone else sees." value={c.label} onChange={(e) => set({ label: e.target.value }, 'label')} />
          <TextInput id={id('url')} label="Default link" type="url" value={c.url} error={err('url')} onChange={(e) => set({ url: e.target.value }, 'url')} />
          <ItemListEditor<SmartRule>
              legend="Versions by where visitors came from"
              noun="Version"
              addLabel="Add a version"
              max={6}
              hint="Uses the same visit source as IntentFlow and Analytics. Nothing personal is used."
              items={c.rules}
              onChange={(rules, f) => set({ rules }, `rules:${f}`)}
              title={(r) => `${sourceLabels[r.source]} visitors`}
              meta={(r) => r.label || 'No words yet'}
              create={() => ({ id: uid('sr'), source: intentSources.find((s) => !used.has(s)) ?? 'tiktok', label: '', url: '' })}
              render={(r, up) =>
              <>
                <SelectInput<SourceId> id={id(`${r.id}-src`)} label="Visitors from" value={r.source} onChange={(source) => up({ source }, 'source')} options={intentSources.map((s) => ({ value: s, label: sourceLabels[s], disabled: s !== r.source && used.has(s) }))} />
                <TextInput id={id(`${r.id}-label`)} label="Words" placeholder="e.g. Saw us on TikTok? Get 10% off" value={r.label} onChange={(e) => up({ label: e.target.value }, 'label')} />
                <TextInput id={id(`${r.id}-url`)} label="Link" type="url" value={r.url} onChange={(e) => up({ url: e.target.value }, 'url')} />
              </>
              } />
            
          <p className="text-caption text-fg-subtle">Check each version with “Preview as” above the canvas.</p>
        </div>);

      }
    case 'campaignSpotlight':{
        const c = block.content;
        const set = setter('campaignSpotlight');
        const badRange = c.startsAt && c.endsAt && Date.parse(c.endsAt) <= Date.parse(c.startsAt);
        return (
          <div className={stack}>
          <TextInput id={id('title')} label="Headline" value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
          <TextArea id={id('text')} label="Details" optional rows={2} value={c.text} onChange={(e) => set({ text: e.target.value }, 'text')} />
          <DateTimeInput id={id('start')} label="Starts showing" optional clearable value={c.startsAt} onChange={(startsAt) => set({ startsAt }, 'startsAt')} hint="Empty = shows as soon as it’s published." />
          <DateTimeInput id={id('end')} label="Stops showing" optional clearable value={c.endsAt} error={badRange ? 'End after it starts.' : undefined} onChange={(endsAt) => set({ endsAt }, 'endsAt')} />
          <TextInput id={id('cta')} label="Button" optional value={c.ctaLabel} onChange={(e) => set({ ctaLabel: e.target.value }, 'ctaLabel')} />
          {c.ctaLabel && <TextInput id={id('url')} label="Button link" type="url" value={c.url} onChange={(e) => set({ url: e.target.value }, 'url')} />}
          <MediaPicker id={id('img')} label="Image" optional aspect="16:9" value={c.imageUrl} onChange={(imageUrl, meta) => set(meta?.alt && !c.imageAlt ? { imageUrl, imageAlt: meta.alt } : { imageUrl }, 'imageUrl')} />
          {c.imageUrl && <TextInput id={id('alt')} label="Describe the image" value={c.imageAlt} onChange={(e) => set({ imageAlt: e.target.value }, 'imageAlt')} />}
          <TextInput id={id('after')} label="After it ends, show" optional placeholder="Leave empty to hide it" value={c.afterText} onChange={(e) => set({ afterText: e.target.value }, 'afterText')} />
        </div>);

      }
    case 'recommendations':{
        const c = block.content;
        const set = setter('recommendations');
        return (
          <div className={stack}>
          <TextInput id={id('title')} label="Title" optional value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
          <TextArea id={id('intro')} label="Intro" optional rows={2} placeholder="e.g. New here? These three are where most people start." value={c.intro} onChange={(e) => set({ intro: e.target.value }, 'intro')} />
          <ItemListEditor
              legend="Your picks, in order"
              noun="Pick"
              addLabel="Add pick"
              max={8}
              items={c.items}
              onChange={(items, f) => set({ items }, `items:${f}`)}
              title={(i) => i.title}
              meta={(i) => i.reason || undefined}
              create={() => ({ id: uid('rec'), title: '', text: '', url: '', imageUrl: '', imageAlt: '', reason: '' })}
              render={(i, up) =>
              <>
                <TextInput id={id(`${i.id}-title`)} label="Title" value={i.title} onChange={(e) => up({ title: e.target.value }, 'title')} />
                <TextArea id={id(`${i.id}-text`)} label="Short description" optional rows={2} value={i.text} onChange={(e) => up({ text: e.target.value }, 'text')} />
                <TextInput id={id(`${i.id}-reason`)} label="Why you recommend it" optional value={i.reason} onChange={(e) => up({ reason: e.target.value }, 'reason')} />
                <TextInput id={id(`${i.id}-url`)} label="Link" optional type="url" value={i.url} onChange={(e) => up({ url: e.target.value }, 'url')} />
                <MediaPicker id={id(`${i.id}-img`)} label="Image" optional aspect="1:1" value={i.imageUrl} onChange={(imageUrl, meta) => up(meta?.alt && !i.imageAlt ? { imageUrl, imageAlt: meta.alt } : { imageUrl }, 'imageUrl')} />
              </>
              } />
            
          <p className="text-caption text-fg-subtle">If you earn from any of these links, say so in the description.</p>
        </div>);

      }
    default:
      return null;
  }
}