import React from 'react';
import type { Block, BlockContentMap, BlockType, HeroVariant } from '../../../types/page';
import { useEditor } from '../../../contexts/EditorContext';
import { uid } from '../../../utils/id';
import { TextInput } from '../../ui/TextInput';
import { TextArea } from '../../ui/TextArea';
import { Switch } from '../../ui/Switch';
import { Segmented } from '../../ui/Segmented';
import { Field } from '../../ui/Field';
import { SelectInput } from '../../ui/SelectInput';
import { MediaPicker } from '../../media/MediaPicker';
import { ItemListEditor } from './ItemListEditor';

const heroVariants: {value: HeroVariant;label: string;}[] = [
{ value: 'split', label: 'Split — text beside a photo' },
{ value: 'portrait', label: 'Portrait — centred identity' },
{ value: 'cover', label: 'Cover — text over a full photo' },
{ value: 'masthead', label: 'Masthead — editorial nameplate' },
{ value: 'poster', label: 'Poster — event-style big type' },
{ value: 'product', label: 'Product — one product to buy' }];


/** Inspector fields for the layout & showcase blocks (D153). */
export function LayoutBlockFields({ block }: {block: Block;}) {
  const { actions } = useEditor();
  const id = (f: string) => `${block.id}-${f}`;
  const setter =
  <K extends BlockType,>(type: K) =>
  (patch: Partial<BlockContentMap[K]>, field: string) =>
  actions.updateContent(block.id, type, patch, field);
  const stack = 'flex flex-col gap-4';

  switch (block.type) {
    case 'hero':{
        const c = block.content;
        const set = setter('hero');
        return (
          <div className={stack}>
          <SelectInput id={id('variant')} label="Layout" value={c.variant} onChange={(variant) => set({ variant }, 'variant')} options={heroVariants} />
          <TextInput id={id('eyebrow')} label="Small line above" optional value={c.eyebrow} onChange={(e) => set({ eyebrow: e.target.value }, 'eyebrow')} />
          <TextInput id={id('title')} label="Headline" value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
          <TextArea id={id('subtitle')} label="Supporting line" optional rows={3} value={c.subtitle} onChange={(e) => set({ subtitle: e.target.value }, 'subtitle')} />
          <TextInput id={id('meta')} label={c.variant === 'poster' ? 'Date and venue' : c.variant === 'product' ? 'Price line' : 'Small note'} optional value={c.meta} onChange={(e) => set({ meta: e.target.value }, 'meta')} />
          <MediaPicker id={id('image')} label="Photo" optional value={c.imageUrl} onChange={(imageUrl, meta) => set(meta?.alt && !c.imageAlt ? { imageUrl, imageAlt: meta.alt } : { imageUrl }, 'imageUrl')} />
          {c.imageUrl &&
            <>
              <TextInput id={id('alt')} label="Photo description" value={c.imageAlt} hint="Read aloud by screen readers." onChange={(e) => set({ imageAlt: e.target.value }, 'imageAlt')} />
              <Field id={id('focal')} label="Keep in view when cropped">
                <Segmented ariaLabel="Focal point" fullWidth value={c.focal} onChange={(focal) => set({ focal }, 'focal')} options={[{ value: 'top', label: 'Top' }, { value: 'center', label: 'Centre' }, { value: 'bottom', label: 'Bottom' }]} />
              </Field>
            </>
            }
          <TextInput id={id('pl')} label="Main button" optional value={c.primaryLabel} onChange={(e) => set({ primaryLabel: e.target.value }, 'primaryLabel')} />
          <TextInput id={id('pu')} label="Main button link" optional placeholder="https:// or #section" value={c.primaryUrl} onChange={(e) => set({ primaryUrl: e.target.value }, 'primaryUrl')} />
          <TextInput id={id('sl')} label="Second button" optional value={c.secondaryLabel} onChange={(e) => set({ secondaryLabel: e.target.value }, 'secondaryLabel')} />
          <TextInput id={id('su')} label="Second button link" optional value={c.secondaryUrl} onChange={(e) => set({ secondaryUrl: e.target.value }, 'secondaryUrl')} />
        </div>);

      }
    case 'featureGrid':{
        const c = block.content;
        const set = setter('featureGrid');
        return (
          <div className={stack}>
          <TextInput id={id('title')} label="Title" optional value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
          <TextArea id={id('intro')} label="Intro" optional rows={2} value={c.intro} onChange={(e) => set({ intro: e.target.value }, 'intro')} />
          <Field id={id('cols')} label="Columns on wide screens">
            <Segmented ariaLabel="Columns" fullWidth value={String(c.columns) as '2' | '3' | '4'} onChange={(v) => set({ columns: Number(v) as 2 | 3 | 4 }, 'columns')} options={[{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }]} />
          </Field>
          <ItemListEditor
              legend="Items"
              noun="Item"
              addLabel="Add item"
              max={8}
              items={c.items}
              onChange={(items, f) => set({ items }, f)}
              title={(i) => i.title}
              create={() => ({ id: uid('ft'), title: '', text: '', imageUrl: '', imageAlt: '', label: '', url: '' })}
              render={(i, up) =>
              <>
                <TextInput id={`${i.id}-t`} label="Title" value={i.title} onChange={(e) => up({ title: e.target.value }, 'title')} />
                <TextInput id={`${i.id}-l`} label="Small line" optional placeholder="e.g. From ₦45,000" value={i.label} onChange={(e) => up({ label: e.target.value }, 'label')} />
                <TextArea id={`${i.id}-x`} label="Text" optional rows={2} value={i.text} onChange={(e) => up({ text: e.target.value }, 'text')} />
                <MediaPicker id={`${i.id}-img`} label="Photo" optional value={i.imageUrl} onChange={(imageUrl) => up({ imageUrl }, 'imageUrl')} />
                {i.imageUrl && <TextInput id={`${i.id}-a`} label="Photo description" value={i.imageAlt} onChange={(e) => up({ imageAlt: e.target.value }, 'imageAlt')} />}
                <TextInput id={`${i.id}-u`} label="Link" optional value={i.url} onChange={(e) => up({ url: e.target.value }, 'url')} />
              </>
              } />
            
        </div>);

      }
    case 'steps':{
        const c = block.content;
        const set = setter('steps');
        return (
          <div className={stack}>
          <TextInput id={id('title')} label="Title" optional value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
          <ItemListEditor legend="Steps" noun="Step" addLabel="Add step" max={8} items={c.items} onChange={(items, f) => set({ items }, f)} title={(i) => i.title} create={() => ({ id: uid('st'), title: '', text: '' })}
            render={(i, up) =>
            <>
                <TextInput id={`${i.id}-t`} label="Step" value={i.title} onChange={(e) => up({ title: e.target.value }, 'title')} />
                <TextArea id={`${i.id}-x`} label="Detail" optional rows={2} value={i.text} onChange={(e) => up({ text: e.target.value }, 'text')} />
              </>
            } />
            
        </div>);

      }
    case 'logoStrip':{
        const c = block.content;
        const set = setter('logoStrip');
        return (
          <div className={stack}>
          <TextInput id={id('title')} label="Title" optional value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
          <ItemListEditor legend="Names or logos" noun="Logo" addLabel="Add a name" max={10} items={c.items} onChange={(items, f) => set({ items }, f)} title={(i) => i.name} create={() => ({ id: uid('lg'), name: '', logoUrl: '' })}
            render={(i, up) =>
            <>
                <TextInput id={`${i.id}-n`} label="Name" value={i.name} onChange={(e) => up({ name: e.target.value }, 'name')} />
                <MediaPicker id={`${i.id}-img`} label="Logo" optional value={i.logoUrl} onChange={(logoUrl) => up({ logoUrl }, 'logoUrl')} />
              </>
            } />
            
          <Switch id={id('perm')} label="These brands agreed to be shown" description="The strip stays hidden on your live page until this is on." checked={c.permission} onChange={(permission) => set({ permission }, 'permission')} />
        </div>);

      }
    case 'figures':{
        const c = block.content;
        const set = setter('figures');
        return (
          <div className={stack}>
          <TextInput id={id('title')} label="Title" optional value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
          <ItemListEditor legend="Figures" noun="Figure" addLabel="Add figure" max={4} items={c.items} onChange={(items, f) => set({ items }, f)} title={(i) => `${i.value} ${i.label}`.trim()} create={() => ({ id: uid('fg'), value: '', label: '' })}
            render={(i, up) =>
            <>
                <TextInput id={`${i.id}-v`} label="Number" value={i.value} onChange={(e) => up({ value: e.target.value }, 'value')} />
                <TextInput id={`${i.id}-l`} label="What it counts" value={i.label} onChange={(e) => up({ label: e.target.value }, 'label')} />
              </>
            } />
            
          <Switch id={id('ok')} label="These are real figures I can stand behind" description="Until this is on, visitors see an “Example figures” label." checked={c.confirmed} onChange={(confirmed) => set({ confirmed }, 'confirmed')} />
        </div>);

      }
    case 'mediaList':{
        const c = block.content;
        const set = setter('mediaList');
        return (
          <div className={stack}>
          <TextInput id={id('title')} label="Title" optional value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
          <SelectInput id={id('kind')} label="What this lists" value={c.kind} onChange={(kind) => set({ kind }, 'kind')} options={[{ value: 'episodes', label: 'Episodes' }, { value: 'tracks', label: 'Tracks or releases' }, { value: 'videos', label: 'Videos' }, { value: 'chapters', label: 'Chapters or stories' }]} />
          <ItemListEditor legend="Items" noun="Item" addLabel="Add item" max={12} items={c.items} onChange={(items, f) => set({ items }, f)} title={(i) => i.title} create={() => ({ id: uid('md'), title: '', meta: '', duration: '', imageUrl: '', url: '' })}
            render={(i, up) =>
            <>
                <TextInput id={`${i.id}-t`} label="Title" value={i.title} onChange={(e) => up({ title: e.target.value }, 'title')} />
                <TextInput id={`${i.id}-m`} label="Date, guest or format" optional value={i.meta} onChange={(e) => up({ meta: e.target.value }, 'meta')} />
                <TextInput id={`${i.id}-d`} label="Length" optional placeholder="e.g. 42 min" value={i.duration} onChange={(e) => up({ duration: e.target.value }, 'duration')} />
                <MediaPicker id={`${i.id}-img`} label="Thumbnail" optional value={i.imageUrl} onChange={(imageUrl) => up({ imageUrl }, 'imageUrl')} />
                <TextInput id={`${i.id}-u`} label="Link" optional value={i.url} onChange={(e) => up({ url: e.target.value }, 'url')} />
              </>
            } />
            
          <ItemListEditor legend="Listen or watch on" noun="Link" addLabel="Add a platform" max={6} items={c.links} onChange={(links, f) => set({ links }, f)} title={(l) => l.label} create={() => ({ id: uid('pl'), label: '', url: '' })}
            render={(l, up) =>
            <>
                <TextInput id={`${l.id}-l`} label="Label" placeholder="e.g. Spotify" value={l.label} onChange={(e) => up({ label: e.target.value }, 'label')} />
                <TextInput id={`${l.id}-u`} label="Link" value={l.url} onChange={(e) => up({ url: e.target.value }, 'url')} />
              </>
            } />
            
        </div>);

      }
    case 'listings':{
        const c = block.content;
        const set = setter('listings');
        return (
          <div className={stack}>
          <TextInput id={id('title')} label="Title" optional value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
          <TextInput id={id('cta')} label="Button label" value={c.ctaLabel} onChange={(e) => set({ ctaLabel: e.target.value }, 'ctaLabel')} />
          <ItemListEditor legend="Listings" noun="Listing" addLabel="Add listing" max={12} items={c.items} onChange={(items, f) => set({ items }, f)} title={(i) => i.title} meta={(i) => i.example ? 'Example listing' : undefined} create={() => ({ id: uid('ls'), title: '', imageUrl: '', imageAlt: '', price: '', facts: '', location: '', url: '', example: false })}
            render={(i, up) =>
            <>
                <TextInput id={`${i.id}-t`} label="Title" value={i.title} onChange={(e) => up({ title: e.target.value, example: false }, 'title')} />
                <TextInput id={`${i.id}-p`} label="Price" optional value={i.price} onChange={(e) => up({ price: e.target.value, example: false }, 'price')} />
                <TextInput id={`${i.id}-f`} label="Key facts" optional placeholder="e.g. 3 bed · 2 bath · 180 m²" value={i.facts} onChange={(e) => up({ facts: e.target.value }, 'facts')} />
                <TextInput id={`${i.id}-loc`} label="Location" optional value={i.location} onChange={(e) => up({ location: e.target.value }, 'location')} />
                <MediaPicker id={`${i.id}-img`} label="Photo" optional value={i.imageUrl} onChange={(imageUrl) => up({ imageUrl, example: false }, 'imageUrl')} />
                {i.imageUrl && <TextInput id={`${i.id}-a`} label="Photo description" value={i.imageAlt} onChange={(e) => up({ imageAlt: e.target.value }, 'imageAlt')} />}
                <TextInput id={`${i.id}-u`} label="Enquiry link" optional value={i.url} onChange={(e) => up({ url: e.target.value }, 'url')} />
                {i.example && <Switch id={`${i.id}-ex`} label="Show “Example listing” label" checked={i.example} onChange={(example) => up({ example }, 'example')} />}
              </>
            } />
            
        </div>);

      }
    default:
      return null;
  }
}