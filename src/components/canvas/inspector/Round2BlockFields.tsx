import React from 'react';
import type { Block, BlockContentMap, BlockType, CollectionLink } from '../../../types/page';
import type { ValidationIssue } from '../../../utils/validation';
import type { Round2BlockType } from '../../../data/blockRegistryRound2';
import { useEditor } from '../../../contexts/EditorContext';
import { useT } from '../../../contexts/LocaleContext';
import { uid } from '../../../utils/id';
import { parseEmbed } from '../../../utils/embeds';
import { TextInput } from '../../ui/TextInput';
import { TextArea } from '../../ui/TextArea';
import { Segmented } from '../../ui/Segmented';
import { Field } from '../../ui/Field';
import { SelectInput } from '../../ui/SelectInput';
import { InlineAlert } from '../../ui/InlineAlert';
import { MediaPicker } from '../../media/MediaPicker';
import { ItemListEditor } from './ItemListEditor';
import { SmartCommerceFields, isSmartCommerceBlock } from './SmartCommerceFields';

const round2Types = new Set<BlockType>(['carousel', 'brandHeader', 'linkCollection', 'qrCode', 'document', 'embed', 'shopCategories', 'checkoutButton', 'poll', 'community', 'reviewSummary', 'languageSwitch', 'smartButton', 'campaignSpotlight', 'recommendations', 'backToTop']);

export const isRound2Block = (b: Block): b is Extract<Block, {type: Round2BlockType;}> => round2Types.has(b.type);

/** Inspector content for round 2 blocks (D170). Commerce and smart blocks live in SmartCommerceFields. */
export function Round2BlockFields({ block, issues }: {block: Extract<Block, {type: Round2BlockType;}>;issues: ValidationIssue[];}) {
  // Labels, hints, options and segmented choices translate inside the shared inputs (D303); the rest here.
  const { t: tr } = useT();
  const { actions } = useEditor();
  const err = (f: string) => issues.find((i) => i.field === f && i.severity === 'error')?.message;
  const id = (f: string) => `${block.id}-${f}`;
  const setter =
  <K extends BlockType,>(type: K) =>
  (patch: Partial<BlockContentMap[K]>, field: string) =>
  actions.updateContent(block.id, type, patch, field);
  const stack = 'flex flex-col gap-4';

  if (isSmartCommerceBlock(block)) return <SmartCommerceFields block={block} issues={issues} />;

  switch (block.type) {
    case 'carousel':{
        const c = block.content;
        const set = setter('carousel');
        return (
          <div className={stack}>
          <TextInput id={id('title')} label="Title" optional value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
          <Field id={id('aspect')} label="Photo shape">
            <Segmented ariaLabel="Photo shape" fullWidth value={c.aspect} onChange={(aspect) => set({ aspect }, 'aspect')} options={[{ value: 'wide', label: 'Wide' }, { value: 'square', label: 'Square' }, { value: 'portrait', label: 'Portrait' }]} />
          </Field>
          <ItemListEditor
              legend="Slides"
              noun="Slide"
              addLabel="Add slide"
              max={8}
              items={c.slides}
              onChange={(slides, f) => set({ slides }, `slides:${f}`)}
              title={(s) => s.title}
              meta={(s) => s.imageUrl ? undefined : tr('No photo')}
              create={() => ({ id: uid('sl'), imageUrl: '', imageAlt: '', title: '', text: '', url: '' })}
              render={(s, up) =>
              <>
                <MediaPicker id={id(`${s.id}-img`)} label="Photo" aspect={c.aspect === 'wide' ? '16:9' : c.aspect === 'square' ? '1:1' : '4:5'} value={s.imageUrl} onChange={(imageUrl, meta) => up(meta?.alt && !s.imageAlt ? { imageUrl, imageAlt: meta.alt } : { imageUrl }, 'imageUrl')} />
                {s.imageUrl && <TextInput id={id(`${s.id}-alt`)} label="Describe the photo" value={s.imageAlt} onChange={(e) => up({ imageAlt: e.target.value }, 'imageAlt')} />}
                <TextInput id={id(`${s.id}-title`)} label="Title" optional value={s.title} onChange={(e) => up({ title: e.target.value }, 'title')} />
                <TextArea id={id(`${s.id}-text`)} label="Text" optional rows={2} value={s.text} onChange={(e) => up({ text: e.target.value }, 'text')} />
                <TextInput id={id(`${s.id}-url`)} label="Link" optional type="url" value={s.url} onChange={(e) => up({ url: e.target.value }, 'url')} />
              </>
              } />
            
          <p className="text-caption text-fg-subtle">{tr('Slides never move on their own, so everyone can read at their own pace.')}</p>
        </div>);

      }
    case 'brandHeader':{
        const c = block.content;
        const set = setter('brandHeader');
        return (
          <div className={stack}>
          <MediaPicker id={id('logo')} label="Logo" optional aspect="1:1" folder="brand" hint="Transparent PNG or SVG. Shown at its own proportions." value={c.logoUrl} onChange={(logoUrl, meta) => set(meta?.alt && !c.logoAlt ? { logoUrl, logoAlt: meta.alt } : { logoUrl }, 'logoUrl')} />
          <TextInput id={id('name')} label="Business name" value={c.name} onChange={(e) => set({ name: e.target.value }, 'name')} />
          <TextInput id={id('tagline')} label="Tagline" optional value={c.tagline} onChange={(e) => set({ tagline: e.target.value }, 'tagline')} />
          <TextInput id={id('ctaLabel')} label="Button" optional placeholder={tr('e.g. Order now')} value={c.ctaLabel} onChange={(e) => set({ ctaLabel: e.target.value }, 'ctaLabel')} />
          {c.ctaLabel && <TextInput id={id('url')} label="Button link" type="url" value={c.url} error={err('url')} onChange={(e) => set({ url: e.target.value }, 'url')} />}
          <Field id={id('align')} label="Arrange">
            <Segmented ariaLabel="Arrange" fullWidth value={c.align} onChange={(align) => set({ align }, 'align')} options={[{ value: 'center', label: 'Centred' }, { value: 'left', label: 'Left' }]} />
          </Field>
        </div>);

      }
    case 'linkCollection':{
        const c = block.content;
        const set = setter('linkCollection');
        return (
          <div className={stack}>
          <TextInput id={id('title')} label="Title" optional value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
          <Field id={id('layout')} label="Show as">
            <Segmented ariaLabel="Show as" fullWidth value={c.layout} onChange={(layout) => set({ layout }, 'layout')} options={[{ value: 'list', label: 'List' }, { value: 'grid', label: 'Grid' }]} />
          </Field>
          <ItemListEditor
              legend="Groups"
              noun="Group"
              addLabel="Add group"
              max={6}
              min={1}
              items={c.groups}
              onChange={(groups, f) => set({ groups }, `groups:${f}`)}
              title={(g) => g.name}
              meta={(g) => tr('Links: {n}', { n: g.links.length })}
              create={() => ({ id: uid('lgp'), name: '', links: [] })}
              render={(g, up) =>
              <>
                <TextInput id={id(`${g.id}-name`)} label="Group heading" value={g.name} hint="Hidden when there's only one group." onChange={(e) => up({ name: e.target.value }, 'name')} />
                <ItemListEditor<CollectionLink>
                  legend="Links"
                  noun="Link"
                  addLabel="Add link"
                  max={12}
                  items={g.links}
                  onChange={(links, f) => up({ links }, `links:${f}`)}
                  title={(l) => l.label}
                  meta={(l) => l.url || tr('No link yet')}
                  create={() => ({ id: uid('cl'), label: '', url: '', description: '' })}
                  render={(l, upl) =>
                  <>
                      <TextInput id={id(`${l.id}-label`)} label="Text" value={l.label} onChange={(e) => upl({ label: e.target.value }, 'label')} />
                      <TextInput id={id(`${l.id}-url`)} label="Link" type="url" value={l.url} onChange={(e) => upl({ url: e.target.value }, 'url')} />
                      <TextInput id={id(`${l.id}-desc`)} label="Description" optional value={l.description} onChange={(e) => upl({ description: e.target.value }, 'description')} />
                    </>
                  } />
                
              </>
              } />
            
        </div>);

      }
    case 'qrCode':{
        const c = block.content;
        const set = setter('qrCode');
        return (
          <div className={stack}>
          <Field id={id('target')} label="Opens">
            <Segmented ariaLabel="Opens" fullWidth value={c.target} onChange={(target) => set({ target }, 'target')} options={[{ value: 'page', label: 'This page' }, { value: 'url', label: 'Another link' }]} />
          </Field>
          {c.target === 'url' && <TextInput id={id('url')} label="Link" type="url" placeholder="https://" value={c.url} error={err('url')} onChange={(e) => set({ url: e.target.value }, 'url')} />}
          <TextInput id={id('caption')} label="Caption" optional value={c.caption} onChange={(e) => set({ caption: e.target.value }, 'caption')} />
          <Field id={id('size')} label="Size">
            <Segmented ariaLabel="Size" fullWidth value={c.size} onChange={(size) => set({ size }, 'size')} options={[{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }]} />
          </Field>
          <InlineAlert tone="info" title={tr('Scans count in Analytics')}>
            {tr('“This page” codes are tagged as QR visits. For printed, branded codes with their own tracking, use Domains & QR.')}
          </InlineAlert>
        </div>);

      }
    case 'document':{
        const c = block.content;
        const set = setter('document');
        return (
          <div className={stack}>
          <TextInput id={id('title')} label="Title" value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
          <TextInput id={id('url')} label="Link to the file" type="url" hint="A PDF link, Google Drive or Dropbox. Make sure anyone with the link can view it." value={c.url} error={err('url')} onChange={(e) => set({ url: e.target.value }, 'url')} />
          <TextArea id={id('description')} label="What's inside" optional rows={2} value={c.description} onChange={(e) => set({ description: e.target.value }, 'description')} />
          <div className="grid grid-cols-2 gap-3">
            <TextInput id={id('fileType')} label="File type" value={c.fileType} onChange={(e) => set({ fileType: e.target.value }, 'fileType')} />
            <TextInput id={id('pages')} label="Pages" optional inputMode="numeric" value={c.pages} onChange={(e) => set({ pages: e.target.value }, 'pages')} />
          </div>
          <MediaPicker id={id('cover')} label="Cover image" optional aspect="4:5" value={c.coverUrl} onChange={(coverUrl, meta) => set(meta?.alt && !c.coverAlt ? { coverUrl, coverAlt: meta.alt } : { coverUrl }, 'coverUrl')} />
          {c.coverUrl && <TextInput id={id('coverAlt')} label="Describe the cover" value={c.coverAlt} onChange={(e) => set({ coverAlt: e.target.value }, 'coverAlt')} />}
        </div>);

      }
    case 'embed':{
        const c = block.content;
        const set = setter('embed');
        const parsed = c.url.trim() ? parseEmbed(c.url) : null;
        return (
          <div className={stack}>
          <TextInput id={id('url')} label="Link" type="url" placeholder={tr('Paste a Spotify, SoundCloud, YouTube, Maps or Calendly link')} value={c.url} onChange={(e) => set({ url: e.target.value }, 'url')} />
          {parsed && (parsed.ok ? <InlineAlert tone="success" title={tr('{site} — will play on your page', { site: parsed.name })} /> : <InlineAlert tone="warning" title={tr('Will show as a link card')}>{tr(parsed.reason)}</InlineAlert>)}
          <TextInput id={id('title')} label="Title" optional hint="Screen readers announce this for the embedded content." value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
          <TextInput id={id('caption')} label="Caption" optional value={c.caption} onChange={(e) => set({ caption: e.target.value }, 'caption')} />
          <p className="text-caption text-fg-subtle">{tr('Custom code and scripts aren’t allowed, to keep visitors safe.')}</p>
        </div>);

      }
    case 'poll':{
        const c = block.content;
        const set = setter('poll');
        return (
          <div className={stack}>
          <TextInput id={id('question')} label="Question" value={c.question} onChange={(e) => set({ question: e.target.value }, 'question')} />
          <ItemListEditor
              legend="Answers"
              noun="Answer"
              addLabel="Add answer"
              min={2}
              max={6}
              items={c.options}
              onChange={(options, f) => set({ options }, `options:${f}`)}
              title={(o) => o.label}
              create={() => ({ id: uid('po'), label: '' })}
              render={(o, up) => <TextInput id={id(`${o.id}-label`)} label="Answer" value={o.label} onChange={(e) => up({ label: e.target.value }, 'label')} />} />
            
          <Field id={id('results')} label="Show results">
            <Segmented ariaLabel="Show results" fullWidth value={c.showResults} onChange={(showResults) => set({ showResults }, 'showResults')} options={[{ value: 'after', label: 'After voting' }, { value: 'never', label: 'Never' }]} />
          </Field>
          <InlineAlert tone="info" title={tr('Prototype limit')}>{tr('Votes are counted on each visitor’s own device, and the results say so. A shared count needs the live server.')}</InlineAlert>
        </div>);

      }
    case 'community':{
        const c = block.content;
        const set = setter('community');
        return (
          <div className={stack}>
          <SelectInput id={id('platform')} label="Where" value={c.platform} onChange={(platform) => set({ platform }, 'platform')} options={[{ value: 'whatsapp', label: 'WhatsApp group' }, { value: 'telegram', label: 'Telegram' }, { value: 'discord', label: 'Discord' }, { value: 'facebook', label: 'Facebook group' }, { value: 'slack', label: 'Slack' }, { value: 'other', label: 'Somewhere else' }]} />
          <TextInput id={id('url')} label="Invite link" type="url" value={c.url} error={err('url')} onChange={(e) => set({ url: e.target.value }, 'url')} />
          <TextInput id={id('name')} label="Community name" optional value={c.name} onChange={(e) => set({ name: e.target.value }, 'name')} />
          <TextArea id={id('description')} label="Who it’s for and what happens there" optional rows={3} value={c.description} onChange={(e) => set({ description: e.target.value }, 'description')} />
          <TextInput id={id('cta')} label="Button" value={c.ctaLabel} onChange={(e) => set({ ctaLabel: e.target.value }, 'ctaLabel')} />
          <TextArea id={id('rules')} label="House rules" optional rows={3} hint="Shown behind a “House rules” toggle." value={c.rules} onChange={(e) => set({ rules: e.target.value }, 'rules')} />
        </div>);

      }
    case 'backToTop':{
        const set = setter('backToTop');
        return (
          <div className={stack}>
          <TextInput id={id('label')} label="Label" value={block.content.label} onChange={(e) => set({ label: e.target.value }, 'label')} />
          <p className="text-caption text-fg-subtle">{tr('Best as the last block on a long page.')}</p>
        </div>);

      }
    case 'languageSwitch':{
        const c = block.content;
        const set = setter('languageSwitch');
        return (
          <div className={stack}>
          <TextInput id={id('label')} label="Label" value={c.label} onChange={(e) => set({ label: e.target.value }, 'label')} />
          <InlineAlert tone="info" title={tr('What changes')}>{tr('Visitors see buttons, labels, checkout and messages in their language. Your own words stay as you wrote them. Translations are drafts until a native speaker reviews them.')}</InlineAlert>
        </div>);

      }
    default:
      return null;
  }
}