import React from 'react';
import type { Block, BlockContentMap, BlockType, CompareColumn, CompareRow } from '../../../types/page';
import type { ValidationIssue } from '../../../utils/validation';
import type { StoryBlockType } from '../../../data/blockRegistryStory';
import { useEditor } from '../../../contexts/EditorContext';
import { uid } from '../../../utils/id';
import { businessWhatsApp, waFieldHintIn } from '../../../utils/businessWhatsApp';
import { useT } from '../../../contexts/LocaleContext';
import { blockName, summarizeBlock } from '../../../utils/blocks';
import { TextInput } from '../../ui/TextInput';
import { PhoneInput } from '../../ui/PhoneInput';
import { TextArea } from '../../ui/TextArea';
import { Segmented } from '../../ui/Segmented';
import { Field } from '../../ui/Field';
import { Switch } from '../../ui/Switch';
import { SelectInput } from '../../ui/SelectInput';
import { InlineAlert } from '../../ui/InlineAlert';
import { TimezoneSelect, type TimeZoneId } from '../../ui/TimezoneSelect';
import { MediaPicker } from '../../media/MediaPicker';
import { ItemListEditor } from './ItemListEditor';
import { HoursEditor } from './HoursEditor';
import { DeliveryFields } from './DeliveryFields';

const storyTypes = new Set<BlockType>(['announcement', 'cta', 'quote', 'timeline', 'comparison', 'beforeAfter', 'team', 'credentials', 'press', 'hours', 'agenda', 'contactActions', 'share', 'anchorNav', 'policies', 'delivery']);

export const isStoryBlock = (b: Block): b is Extract<Block, {type: StoryBlockType;}> => storyTypes.has(b.type);

/** Inspector content for round 1 blocks (D169): only each block's own fields, short and grouped. */
export function StoryBlockFields({ block, issues }: {block: Extract<Block, {type: StoryBlockType;}>;issues: ValidationIssue[];}) {
  // Labels, hints, switches, options and segmented choices translate inside the shared inputs (D303);
  // placeholders, notes and built lines are translated here.
  const { t: tr } = useT();
  const { state, actions } = useEditor();
  const err = (f: string) => issues.find((i) => i.field === f && i.severity === 'error')?.message;
  const id = (f: string) => `${block.id}-${f}`;
  const setter =
  <K extends BlockType,>(type: K) =>
  (patch: Partial<BlockContentMap[K]>, field: string) =>
  actions.updateContent(block.id, type, patch, field);
  const stack = 'flex flex-col gap-4';

  switch (block.type) {
    case 'announcement':{
        const c = block.content;
        const set = setter('announcement');
        return (
          <div className={stack}>
          <TextInput id={id('text')} label="Announcement" value={c.text} maxLength={120} hint="One short line. Keep it to what's true today." onChange={(e) => set({ text: e.target.value }, 'text')} />
          <TextInput id={id('linkLabel')} label="Link text" optional placeholder={tr('e.g. Shop now')} value={c.linkLabel} onChange={(e) => set({ linkLabel: e.target.value }, 'linkLabel')} />
          <TextInput id={id('url')} label="Link" optional type="url" placeholder="https://" value={c.url} error={err('url')} onChange={(e) => set({ url: e.target.value }, 'url')} />
          <Field id={id('tone')} label="Look">
            <Segmented ariaLabel="Look" fullWidth value={c.tone} onChange={(tone) => set({ tone }, 'tone')} options={[{ value: 'neutral', label: 'Neutral' }, { value: 'accent', label: 'Accent' }, { value: 'invert', label: 'Inverted' }]} />
          </Field>
        </div>);

      }
    case 'cta':{
        const c = block.content;
        const set = setter('cta');
        return (
          <div className={stack}>
          <Field id={id('layout')} label="Layout">
            <Segmented ariaLabel="Layout" fullWidth value={c.layout} onChange={(layout) => set({ layout }, 'layout')} options={[{ value: 'band', label: 'Band' }, { value: 'card', label: 'Card' }, { value: 'split', label: 'Split' }]} />
          </Field>
          <TextInput id={id('title')} label="Headline" value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
          <TextArea id={id('text')} label="Supporting line" optional rows={2} value={c.text} onChange={(e) => set({ text: e.target.value }, 'text')} />
          <TextInput id={id('primaryLabel')} label="Main button" value={c.primaryLabel} onChange={(e) => set({ primaryLabel: e.target.value }, 'primaryLabel')} />
          <TextInput id={id('primaryUrl')} label="Main button link" type="url" placeholder={tr('https:// or wa.me/…')} value={c.primaryUrl} error={err('primaryUrl')} onChange={(e) => set({ primaryUrl: e.target.value }, 'primaryUrl')} />
          <TextInput id={id('secondaryLabel')} label="Second button" optional value={c.secondaryLabel} onChange={(e) => set({ secondaryLabel: e.target.value }, 'secondaryLabel')} />
          {c.secondaryLabel && <TextInput id={id('secondaryUrl')} label="Second button link" type="url" value={c.secondaryUrl} onChange={(e) => set({ secondaryUrl: e.target.value }, 'secondaryUrl')} />}
        </div>);

      }
    case 'quote':{
        const c = block.content;
        const set = setter('quote');
        return (
          <div className={stack}>
          <TextArea id={id('text')} label="Quote" rows={3} value={c.text} onChange={(e) => set({ text: e.target.value }, 'text')} />
          <TextInput id={id('name')} label="Who said it" optional value={c.name} onChange={(e) => set({ name: e.target.value }, 'name')} />
          <TextInput id={id('role')} label="Their role or source" optional value={c.role} onChange={(e) => set({ role: e.target.value }, 'role')} />
          <Field id={id('style')} label="Look">
            <Segmented ariaLabel="Look" fullWidth value={c.style} onChange={(style) => set({ style }, 'style')} options={[{ value: 'editorial', label: 'Editorial' }, { value: 'marked', label: 'Marked' }]} />
          </Field>
          {c.name && <p className="text-caption text-fg-subtle">{tr('Quoting a real person? Make sure they’re happy to be quoted.')}</p>}
        </div>);

      }
    case 'timeline':{
        const c = block.content;
        const set = setter('timeline');
        return (
          <div className={stack}>
          <TextInput id={id('title')} label="Title" optional value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
          <TextArea id={id('intro')} label="Intro" optional rows={2} value={c.intro} onChange={(e) => set({ intro: e.target.value }, 'intro')} />
          <ItemListEditor
              legend="Milestones"
              noun="Milestone"
              addLabel="Add milestone"
              max={12}
              items={c.items}
              onChange={(items, f) => set({ items }, `items:${f}`)}
              title={(i) => i.title}
              meta={(i) => i.date || undefined}
              create={() => ({ id: uid('tl'), date: '', title: '', text: '' })}
              render={(i, up) =>
              <>
                <TextInput id={id(`${i.id}-date`)} label="Date or year" value={i.date} placeholder={tr('e.g. 2021 or March 2024')} onChange={(e) => up({ date: e.target.value }, 'date')} />
                <TextInput id={id(`${i.id}-title`)} label="What happened" value={i.title} onChange={(e) => up({ title: e.target.value }, 'title')} />
                <TextArea id={id(`${i.id}-text`)} label="Detail" optional rows={2} value={i.text} onChange={(e) => up({ text: e.target.value }, 'text')} />
              </>
              } />
            
        </div>);

      }
    case 'comparison':
      return <ComparisonFields block={block} />;
    case 'beforeAfter':{
        const c = block.content;
        const set = setter('beforeAfter');
        return (
          <div className={stack}>
          <TextInput id={id('title')} label="Title" optional value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
          <MediaPicker id={id('before')} label="Before photo" aspect="4:5" value={c.beforeUrl} onChange={(beforeUrl, meta) => set(meta?.alt && !c.beforeAlt ? { beforeUrl, beforeAlt: meta.alt } : { beforeUrl }, 'beforeUrl')} />
          <TextInput id={id('beforeAlt')} label="Describe the before photo" value={c.beforeAlt} error={err('beforeAlt')} onChange={(e) => set({ beforeAlt: e.target.value }, 'beforeAlt')} />
          <MediaPicker id={id('after')} label="After photo" aspect="4:5" value={c.afterUrl} onChange={(afterUrl, meta) => set(meta?.alt && !c.afterAlt ? { afterUrl, afterAlt: meta.alt } : { afterUrl }, 'afterUrl')} />
          <TextInput id={id('afterAlt')} label="Describe the after photo" value={c.afterAlt} error={err('afterAlt')} onChange={(e) => set({ afterAlt: e.target.value }, 'afterAlt')} />
          <div className="grid grid-cols-2 gap-3">
            <TextInput id={id('beforeLabel')} label="Before label" value={c.beforeLabel} onChange={(e) => set({ beforeLabel: e.target.value }, 'beforeLabel')} />
            <TextInput id={id('afterLabel')} label="After label" value={c.afterLabel} onChange={(e) => set({ afterLabel: e.target.value }, 'afterLabel')} />
          </div>
          <TextInput id={id('caption')} label="Caption" optional value={c.caption} onChange={(e) => set({ caption: e.target.value }, 'caption')} />
          <Switch id={id('permission')} checked={c.permission} onChange={(permission) => set({ permission }, 'permission')} label="I have permission to show these photos" description="Required before publishing if a person or their home appears in them." />
        </div>);

      }
    case 'team':{
        const c = block.content;
        const set = setter('team');
        return (
          <div className={stack}>
          <Field id={id('variant')} label="Look">
            <Segmented ariaLabel="Look" fullWidth value={c.variant} onChange={(variant) => set({ variant }, 'variant')} options={[{ value: 'team', label: 'Team' }, { value: 'speakers', label: 'Speakers' }]} />
          </Field>
          <TextInput id={id('title')} label="Title" optional value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
          <TextArea id={id('intro')} label="Intro" optional rows={2} value={c.intro} onChange={(e) => set({ intro: e.target.value }, 'intro')} />
          <ItemListEditor
              legend="People"
              noun="Person"
              addLabel="Add person"
              max={12}
              items={c.items}
              onChange={(items, f) => set({ items }, `items:${f}`)}
              title={(i) => i.name}
              meta={(i) => i.role || undefined}
              create={() => ({ id: uid('tm'), name: '', role: '', bio: '', imageUrl: '', imageAlt: '', url: '' })}
              render={(i, up) =>
              <>
                <TextInput id={id(`${i.id}-name`)} label="Name" value={i.name} onChange={(e) => up({ name: e.target.value }, 'name')} />
                <TextInput id={id(`${i.id}-role`)} label={c.variant === 'speakers' ? 'Session or role' : 'Role'} optional value={i.role} onChange={(e) => up({ role: e.target.value }, 'role')} />
                <MediaPicker id={id(`${i.id}-img`)} label="Photo" optional aspect={c.variant === 'speakers' ? '1:1' : '4:5'} value={i.imageUrl} onChange={(imageUrl, meta) => up(meta?.alt && !i.imageAlt ? { imageUrl, imageAlt: meta.alt } : { imageUrl }, 'imageUrl')} />
                <TextArea id={id(`${i.id}-bio`)} label="Short bio" optional rows={2} value={i.bio} onChange={(e) => up({ bio: e.target.value }, 'bio')} />
                <TextInput id={id(`${i.id}-url`)} label="Profile link" optional type="url" value={i.url} onChange={(e) => up({ url: e.target.value }, 'url')} />
              </>
              } />
            
        </div>);

      }
    case 'credentials':{
        const c = block.content;
        const set = setter('credentials');
        return (
          <div className={stack}>
          <Field id={id('variant')} label="Look">
            <Segmented ariaLabel="Look" fullWidth value={c.variant} onChange={(variant) => set({ variant }, 'variant')} options={[{ value: 'credentials', label: 'Credentials' }, { value: 'resume', label: 'Résumé' }]} />
          </Field>
          <TextInput id={id('title')} label="Title" optional value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
          {c.variant === 'resume' && <TextArea id={id('summary')} label="Summary" optional rows={3} value={c.summary} onChange={(e) => set({ summary: e.target.value }, 'summary')} />}
          <ItemListEditor
              legend={c.variant === 'resume' ? 'Roles' : 'Credentials'}
              noun={c.variant === 'resume' ? 'Role' : 'Credential'}
              addLabel={c.variant === 'resume' ? 'Add role' : 'Add credential'}
              max={12}
              items={c.items}
              onChange={(items, f) => set({ items }, `items:${f}`)}
              title={(i) => i.title}
              meta={(i) => [i.org, i.year].filter(Boolean).join(' · ') || undefined}
              create={() => ({ id: uid('cd'), title: '', org: '', year: '', text: '' })}
              render={(i, up) =>
              <>
                <TextInput id={id(`${i.id}-title`)} label={c.variant === 'resume' ? 'Role' : 'Qualification'} value={i.title} onChange={(e) => up({ title: e.target.value }, 'title')} />
                <TextInput id={id(`${i.id}-org`)} label={c.variant === 'resume' ? 'Organisation' : 'Issued by'} optional value={i.org} onChange={(e) => up({ org: e.target.value }, 'org')} />
                <TextInput id={id(`${i.id}-year`)} label={c.variant === 'resume' ? 'Years' : 'Year'} optional placeholder={c.variant === 'resume' ? tr('2020 – now') : '2023'} value={i.year} onChange={(e) => up({ year: e.target.value }, 'year')} />
                <TextArea id={id(`${i.id}-text`)} label="Detail" optional rows={2} value={i.text} onChange={(e) => up({ text: e.target.value }, 'text')} />
              </>
              } />
            
          {c.variant === 'resume' && <TextInput id={id('cv')} label="CV link" optional type="url" hint="A PDF in your files or a link to it." value={c.cvUrl} onChange={(e) => set({ cvUrl: e.target.value }, 'cvUrl')} />}
          <p className="text-caption text-fg-subtle">{tr('List only qualifications you can show if a customer asks. KUBICU doesn’t verify these.')}</p>
        </div>);

      }
    case 'press':{
        const c = block.content;
        const set = setter('press');
        return (
          <div className={stack}>
          <TextInput id={id('title')} label="Title" optional value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
          <ItemListEditor
              legend="Mentions"
              noun="Mention"
              addLabel="Add mention"
              max={12}
              items={c.items}
              onChange={(items, f) => set({ items }, `items:${f}`)}
              title={(i) => i.title || i.outlet}
              meta={(i) => i.outlet || undefined}
              create={() => ({ id: uid('pr'), outlet: '', title: '', date: '', url: '', kind: 'article' as const })}
              render={(i, up) =>
              <>
                <SelectInput id={id(`${i.id}-kind`)} label="Type" value={i.kind} onChange={(kind) => up({ kind }, 'kind')} options={[{ value: 'article', label: 'Article' }, { value: 'interview', label: 'Interview' }, { value: 'book', label: 'Book' }, { value: 'podcast', label: 'Podcast' }, { value: 'talk', label: 'Talk' }]} />
                <TextInput id={id(`${i.id}-outlet`)} label="Where" placeholder={tr('e.g. BusinessDay')} value={i.outlet} onChange={(e) => up({ outlet: e.target.value }, 'outlet')} />
                <TextInput id={id(`${i.id}-title`)} label="Headline or title" value={i.title} onChange={(e) => up({ title: e.target.value }, 'title')} />
                <TextInput id={id(`${i.id}-date`)} label="Date" optional value={i.date} onChange={(e) => up({ date: e.target.value }, 'date')} />
                <TextInput id={id(`${i.id}-url`)} label="Link to it" optional type="url" value={i.url} onChange={(e) => up({ url: e.target.value }, 'url')} />
              </>
              } />
            
        </div>);

      }
    case 'hours':{
        const c = block.content;
        const set = setter('hours');
        return (
          <div className={stack}>
          <TextInput id={id('title')} label="Title" optional value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
          <TimezoneSelect id={id('tz')} label="Your time zone" value={c.timeZone as TimeZoneId} hint="The open-now label uses this." onChange={(timeZone) => set({ timeZone }, 'timeZone')} />
          <HoursEditor blockId={block.id} hours={c.hours} onChange={(hours, f) => set({ hours }, f)} />
          <TextInput id={id('note')} label="Note" optional placeholder={tr('e.g. Closed on public holidays')} value={c.note} onChange={(e) => set({ note: e.target.value }, 'note')} />
        </div>);

      }
    case 'agenda':{
        const c = block.content;
        const set = setter('agenda');
        return (
          <div className={stack}>
          <TextInput id={id('title')} label="Title" optional value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
          <TextInput id={id('date')} label="Day or date" optional placeholder={tr('e.g. Saturday 14 June')} value={c.date} onChange={(e) => set({ date: e.target.value }, 'date')} />
          <ItemListEditor
              legend="Sessions"
              noun="Session"
              addLabel="Add session"
              max={20}
              items={c.items}
              onChange={(items, f) => set({ items }, `items:${f}`)}
              title={(i) => i.title}
              meta={(i) => i.time || undefined}
              create={() => ({ id: uid('ag'), time: '', title: '', speaker: '', text: '' })}
              render={(i, up) =>
              <>
                <TextInput id={id(`${i.id}-time`)} label="Time" placeholder={tr('e.g. 14:30')} value={i.time} onChange={(e) => up({ time: e.target.value }, 'time')} />
                <TextInput id={id(`${i.id}-title`)} label="Session" value={i.title} onChange={(e) => up({ title: e.target.value }, 'title')} />
                <TextInput id={id(`${i.id}-speaker`)} label="Who’s on" optional value={i.speaker} onChange={(e) => up({ speaker: e.target.value }, 'speaker')} />
                <TextArea id={id(`${i.id}-text`)} label="Note" optional rows={2} value={i.text} onChange={(e) => up({ text: e.target.value }, 'text')} />
              </>
              } />
            
        </div>);

      }
    case 'contactActions':{
        const c = block.content;
        const set = setter('contactActions');
        return (
          <div className={stack}>
          <TextInput id={id('title')} label="Title" optional value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
          <PhoneInput id={id('phone')} label="Phone" optional value={c.phone} onChange={(phone) => set({ phone }, 'phone')} />
          <PhoneInput id={id('whatsapp')} label="WhatsApp number" optional placeholder={businessWhatsApp() || undefined} hint={waFieldHintIn(tr, c.whatsapp, tr('Opens a chat with you.'))} value={c.whatsapp} error={err('whatsapp')} onChange={(whatsapp) => set({ whatsapp }, 'whatsapp')} />
          {!c.whatsapp.trim() && businessWhatsApp() &&
            <label className="-mt-2 flex items-center gap-2 text-label text-fg">
              <input type="checkbox" className="h-4 w-4" checked={c.useBusinessWhatsApp !== false} onChange={(e) => set({ useBusinessWhatsApp: e.target.checked }, 'whatsapp')} />
              {tr('Show a WhatsApp button with my business number')}
            </label>
            }
          <TextInput id={id('email')} label="Email" optional type="email" value={c.email} error={err('email')} onChange={(e) => set({ email: e.target.value }, 'email')} />
          <TextInput id={id('website')} label="Website" optional type="url" placeholder="https://" value={c.website} error={err('website')} onChange={(e) => set({ website: e.target.value }, 'website')} />
          <Field id={id('layout')} label="Arrange">
            <Segmented ariaLabel="Arrange" fullWidth value={c.layout} onChange={(layout) => set({ layout }, 'layout')} options={[{ value: 'row', label: 'In a row' }, { value: 'stack', label: 'Stacked' }]} />
          </Field>
          <p className="text-caption text-fg-subtle">{tr('These show on your public page. Leave out anything you don’t want strangers to see.')}</p>
        </div>);

      }
    case 'share':{
        const c = block.content;
        const set = setter('share');
        return (
          <div className={stack}>
          <TextInput id={id('title')} label="Title" optional value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
          <TextInput id={id('text')} label="Message that goes with the link" optional placeholder={tr('Defaults to your page title')} value={c.text} onChange={(e) => set({ text: e.target.value }, 'text')} />
          <InlineAlert tone="info" title={tr('Uses the visitor’s own apps')}>{tr('On phones that support it, a Share button opens the device’s share sheet.')}</InlineAlert>
        </div>);

      }
    case 'anchorNav':{
        const c = block.content;
        const set = setter('anchorNav');
        const targets = state.draft.blocks.filter((b) => b.id !== block.id && !b.parentId && b.type !== 'anchorNav' && !b.visibility.hidden);
        return (
          <div className={stack}>
          <TextInput id={id('title')} label="Title" optional placeholder={tr('e.g. On this page')} value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
          {targets.length === 0 ?
            <p className="rounded-md bg-sunken px-3 py-2.5 text-caption text-fg-muted">{tr('Add a few sections to the page first, then link to them here.')}</p> :

            <ItemListEditor
              legend="Links"
              noun="Link"
              addLabel="Add link"
              max={8}
              items={c.items}
              onChange={(items, f) => set({ items }, `items:${f}`)}
              title={(i) => i.label}
              meta={(i) => {
                const t = targets.find((b) => b.id === i.blockId);
                return t ? `→ ${tr(blockName(t))}` : tr('Choose a block');
              }}
              create={() => ({ id: uid('an'), label: '', blockId: '' })}
              render={(i, up) =>
              <>
                  <SelectInput<string>
                  id={id(`${i.id}-target`)}
                  label="Jumps to"
                  value={i.blockId}
                  onChange={(blockId) => {
                    const t = targets.find((b) => b.id === blockId);
                    up(!i.label && t ? { blockId, label: blockName(t) } : { blockId }, 'blockId');
                  }}
                  options={[{ value: '', label: 'Choose a block…' }, ...targets.map((b) => ({ value: b.id, label: `${tr(blockName(b))} — ${summarizeBlock(b).slice(0, 30) || tr('untitled')}` }))]} />
                
                  <TextInput id={id(`${i.id}-label`)} label="Link text" value={i.label} onChange={(e) => up({ label: e.target.value }, 'label')} />
                </>
              } />

            }
        </div>);

      }
    case 'policies':{
        const c = block.content;
        const set = setter('policies');
        return (
          <div className={stack}>
          <TextInput id={id('title')} label="Title" optional value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
          <TextArea id={id('intro')} label="Intro" optional rows={2} value={c.intro} onChange={(e) => set({ intro: e.target.value }, 'intro')} />
          <ItemListEditor
              legend="Policies"
              noun="Policy"
              addLabel="Add policy"
              max={8}
              items={c.items}
              onChange={(items, f) => set({ items }, `items:${f}`)}
              title={(i) => i.title}
              meta={(i) => i.text.trim() ? undefined : tr('Needs your words — hidden until written')}
              create={() => ({ id: uid('pol'), title: '', text: '' })}
              render={(i, up) =>
              <>
                <TextInput id={id(`${i.id}-title`)} label="Heading" placeholder={tr('e.g. Delivery, Returns, Support')} value={i.title} onChange={(e) => up({ title: e.target.value }, 'title')} />
                <TextArea id={id(`${i.id}-text`)} label="What you promise" rows={3} value={i.text} onChange={(e) => up({ text: e.target.value }, 'text')} />
              </>
              } />
            
          <p className="text-caption text-fg-subtle">{tr('Write only what you actually do. Visitors may hold you to it.')}</p>
        </div>);

      }
    case 'delivery':
      return <DeliveryFields block={block} set={setter('delivery')} id={id} />;
    default:
      return null;
  }
}

/** Comparison: options as columns, rows as features; each row has one value per option. */
function ComparisonFields({ block }: {block: Extract<Block, {type: 'comparison';}>;}) {
  const { t: tr } = useT();
  const { actions } = useEditor();
  const c = block.content;
  const id = (f: string) => `${block.id}-${f}`;
  const set = (patch: Partial<BlockContentMap['comparison']>, field: string) => actions.updateContent(block.id, 'comparison', patch, field);
  const setColumns = (columns: CompareColumn[], f: string) => {
    // Keep each row's values lined up with the columns: added columns get a blank, removed ones drop.
    const rows = c.rows.map((r) => ({ ...r, values: columns.map((col) => r.values[c.columns.findIndex((x) => x.id === col.id)] ?? '') }));
    set({ columns, rows }, `cols:${f}`);
  };
  return (
    <div className="flex flex-col gap-4">
      <TextInput id={id('title')} label="Title" optional value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
      <TextArea id={id('intro')} label="Intro" optional rows={2} value={c.intro} onChange={(e) => set({ intro: e.target.value }, 'intro')} />
      <ItemListEditor<CompareColumn>
        legend="Options"
        noun="Option"
        addLabel="Add option"
        min={2}
        max={4}
        items={c.columns}
        onChange={setColumns}
        title={(i) => i.name}
        meta={(i) => [i.price, i.highlight ? tr('Most chosen') : ''].filter(Boolean).join(' · ') || undefined}
        create={() => ({ id: uid('cc'), name: '', price: '', highlight: false })}
        render={(i, up) =>
        <>
            <TextInput id={id(`${i.id}-name`)} label="Name" value={i.name} onChange={(e) => up({ name: e.target.value }, 'name')} />
            <TextInput id={id(`${i.id}-price`)} label="Price" optional placeholder={tr('Leave blank if it varies')} value={i.price} onChange={(e) => up({ price: e.target.value }, 'price')} />
            <Switch id={id(`${i.id}-hl`)} checked={i.highlight} onChange={(highlight) => up({ highlight }, 'highlight')} label="Mark as most chosen" description="Only if it genuinely is." />
          </>
        } />
      
      <ItemListEditor<CompareRow>
        legend="Rows"
        noun="Row"
        addLabel="Add row"
        max={12}
        hint="Type “yes” or “no” for a tick or a dash, or write the detail."
        items={c.rows}
        onChange={(rows, f) => set({ rows }, `rows:${f}`)}
        title={(r) => r.label}
        create={() => ({ id: uid('cr'), label: '', values: c.columns.map(() => '') })}
        render={(r, up) =>
        <>
            <TextInput id={id(`${r.id}-label`)} label="Feature" value={r.label} onChange={(e) => up({ label: e.target.value }, 'label')} />
            {c.columns.map((col, ci) =>
          <TextInput
            key={col.id}
            id={id(`${r.id}-v${col.id}`)}
            label={col.name || tr('Option {n}', { n: ci + 1 })}
            value={r.values[ci] ?? ''}
            onChange={(e) => up({ values: c.columns.map((_, k) => k === ci ? e.target.value : r.values[k] ?? '') }, `v${ci}`)} />

          )}
          </>
        } />
      
    </div>);

}