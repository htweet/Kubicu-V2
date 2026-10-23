import React from 'react';
import type { Block, BlockContentMap, BlockType } from '../../../types/page';
import type { ValidationIssue } from '../../../utils/validation';
import { useEditor } from '../../../contexts/EditorContext';
import { TextInput } from '../../ui/TextInput';
import { TextArea } from '../../ui/TextArea';
import { Switch } from '../../ui/Switch';
import { Segmented } from '../../ui/Segmented';
import { InlineAlert } from '../../ui/InlineAlert';
import { Field } from '../../ui/Field';
import { FaqItemsEditor } from './FaqItemsEditor';
import { SocialItemsEditor } from './SocialItemsEditor';
import { MediaPicker } from '../../media/MediaPicker';
import { ExtendedContentFields } from './ExtendedContentFields';
import { ProductFields } from './ProductFields';
import { BookingFields } from './BookingFields';
import { SubscriptionFields } from './SubscriptionFields';
import { FormBlockFields } from './FormBlockFields';
import { ProofFields } from './ProofFields';
import { MembersOnlyFields } from './MembersOnlyFields';
import { TrustBadgeFields } from './TrustBadgeFields';

interface ContentFieldsProps {
  block: Block;
  issues: ValidationIssue[];
}

export function ContentFields({ block, issues }: ContentFieldsProps) {
  const { actions } = useEditor();
  const err = (field: string) => issues.find((i) => i.field === field && i.severity === 'error')?.message;
  const warn = (field: string) => issues.find((i) => i.field === field && i.severity === 'warning')?.message;
  const id = (field: string) => `${block.id}-${field}`;
  const setter =
  <K extends BlockType,>(type: K) =>
  (patch: Partial<BlockContentMap[K]>, field: string) =>
  actions.updateContent(block.id, type, patch, field);

  const stack = 'flex flex-col gap-4';

  switch (block.type) {
    case 'profile':{
        const c = block.content;
        const set = setter('profile');
        return (
          <div className={stack}>
          <TextInput id={id('name')} label="Name" value={c.name} error={err('name')} onChange={(e) => set({ name: e.target.value }, 'name')} />
          <TextArea id={id('tagline')} label="One-line pitch" optional value={c.tagline} rows={3} onChange={(e) => set({ tagline: e.target.value }, 'tagline')} />
          <MediaPicker
              id={id('avatar')}
              label="Photo or logo"
              optional
              round
              aspect="1:1"
              value={c.avatarUrl}
              onChange={(avatarUrl, meta) => set(meta?.alt && !c.avatarAlt.trim() ? { avatarUrl, avatarAlt: meta.alt } : { avatarUrl }, 'avatarUrl')} />
            
          {c.avatarUrl &&
            <TextInput
              id={id('avatarAlt')}
              label="Photo description"
              value={c.avatarAlt}
              hint={warn('avatarAlt') ?? 'Read aloud by screen readers.'}
              onChange={(e) => set({ avatarAlt: e.target.value }, 'avatarAlt')} />

            }
          <TextInput id={id('location')} label="Location" optional placeholder="e.g. Lekki, Lagos" value={c.location} onChange={(e) => set({ location: e.target.value }, 'location')} />
        </div>);

      }
    case 'heading':{
        const c = block.content;
        const set = setter('heading');
        return (
          <div className={stack}>
          <TextInput id={id('text')} label="Heading" value={c.text} error={err('text')} onChange={(e) => set({ text: e.target.value }, 'text')} />
          <Field id={id('level')} label="Size">
            <Segmented
                ariaLabel="Heading size"
                value={c.level}
                onChange={(level) => set({ level }, 'level')}
                options={[
                { value: 'h2', label: 'Section' },
                { value: 'h3', label: 'Sub-section' }]
                } />
              
          </Field>
        </div>);

      }
    case 'text':{
        const set = setter('text');
        return (
          <TextArea
            id={id('body')}
            label="Text"
            rows={7}
            value={block.content.body}
            hint={warn('body')}
            onChange={(e) => set({ body: e.target.value }, 'body')} />);


      }
    case 'link':{
        const c = block.content;
        const set = setter('link');
        return (
          <div className={stack}>
          <TextInput id={id('label')} label="Button label" value={c.label} error={err('label')} onChange={(e) => set({ label: e.target.value }, 'label')} />
          <TextInput
              id={id('url')}
              label="Destination"
              type="url"
              inputMode="url"
              placeholder="https://"
              value={c.url}
              error={err('url')}
              onChange={(e) => set({ url: e.target.value }, 'url')} />
            
          <TextInput id={id('description')} label="Supporting line" optional value={c.description} onChange={(e) => set({ description: e.target.value }, 'description')} />
        </div>);

      }
    case 'social':{
        const set = setter('social');
        return <SocialItemsEditor blockId={block.id} items={block.content.items} issues={issues} onChange={(items, f) => set({ items }, f)} />;
      }
    case 'image':{
        const c = block.content;
        const set = setter('image');
        return (
          <div className={stack}>
          <MediaPicker
              id={id('url')}
              label="Image"
              aspect={c.aspect}
              value={c.url}
              error={err('url')}
              onChange={(url, meta) => set(meta?.alt && !c.alt.trim() ? { url, alt: meta.alt } : { url }, 'url')} />
            
          {!c.decorative &&
            <TextInput
              id={id('alt')}
              label="Image description"
              value={c.alt}
              hint={warn('alt') ?? 'Describe what’s in the photo for screen readers.'}
              onChange={(e) => set({ alt: e.target.value }, 'alt')} />

            }
          <Switch
              id={id('decorative')}
              label="Decorative only"
              description="Turn on if the image adds no information (a texture or divider). Screen readers will skip it."
              checked={!!c.decorative}
              onChange={(decorative) => set({ decorative }, 'decorative')} />
            
          <TextInput id={id('caption')} label="Caption" optional value={c.caption} onChange={(e) => set({ caption: e.target.value }, 'caption')} />
          <Field id={id('aspect')} label="Shape">
            <Segmented
                ariaLabel="Image shape"
                value={c.aspect}
                onChange={(aspect) => set({ aspect }, 'aspect')}
                options={[
                { value: '4:5', label: 'Portrait' },
                { value: '1:1', label: 'Square' },
                { value: '16:9', label: 'Wide' }]
                } />
              
          </Field>
        </div>);

      }
    case 'video':{
        const c = block.content;
        const set = setter('video');
        return (
          <div className={stack}>
          <TextInput
              id={id('url')}
              label="YouTube link"
              type="url"
              inputMode="url"
              placeholder="https://youtube.com/watch?v=…"
              value={c.url}
              error={err('url')}
              hint="Only YouTube is allowed for now, so embeds stay safe and fast."
              onChange={(e) => set({ url: e.target.value }, 'url')} />
            
          <TextInput id={id('title')} label="Video title" optional value={c.title} hint="Used by screen readers." onChange={(e) => set({ title: e.target.value }, 'title')} />
        </div>);

      }
    case 'divider':{
        const set = setter('divider');
        return <TextInput id={id('label')} label="Label" optional value={block.content.label} hint="Leave empty for a plain line." onChange={(e) => set({ label: e.target.value }, 'label')} />;
      }
    case 'spacer':{
        const set = setter('spacer');
        return (
          <Field id={id('size')} label="Height">
          <Segmented
              ariaLabel="Spacer height"
              value={block.content.size}
              onChange={(size) => set({ size }, 'size')}
              options={[
              { value: 'sm', label: 'Small' },
              { value: 'md', label: 'Medium' },
              { value: 'lg', label: 'Large' }]
              } />
            
        </Field>);

      }
    case 'contact':{
        const c = block.content;
        const set = setter('contact');
        return (
          <div className={stack}>
          <TextInput id={id('phone')} label="Phone" optional type="tel" inputMode="tel" placeholder="+234 …" value={c.phone} error={err('phone')} onChange={(e) => set({ phone: e.target.value }, 'phone')} />
          <TextInput id={id('email')} label="Email" optional type="email" inputMode="email" value={c.email} error={err('email')} onChange={(e) => set({ email: e.target.value }, 'email')} />
          <TextArea id={id('address')} label="Address" optional rows={2} value={c.address} onChange={(e) => set({ address: e.target.value }, 'address')} />
          <TextInput id={id('hours')} label="Opening hours" optional placeholder="e.g. Mon–Fri, 9am–5pm WAT" value={c.hours} onChange={(e) => set({ hours: e.target.value }, 'hours')} />
        </div>);

      }
    case 'faq':{
        const set = setter('faq');
        return (
          <div className={stack}>
          <TextInput id={id('title')} label="Section title" optional value={block.content.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
          {warn('items') && <p className="text-caption text-warning">{warn('items')}</p>}
          <FaqItemsEditor blockId={block.id} items={block.content.items} onChange={(items, f) => set({ items }, f)} />
        </div>);

      }
    case 'leadForm':{
        const c = block.content;
        const set = setter('leadForm');
        const toggle = (key: keyof typeof c.fields) => (v: boolean) => set({ fields: { ...c.fields, [key]: v } }, `field-${key}`);
        return (
          <div className={stack}>
          <TextInput id={id('title')} label="Title" value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
          <TextArea id={id('description')} label="Intro" optional rows={2} value={c.description} onChange={(e) => set({ description: e.target.value }, 'description')} />
          <fieldset className="flex flex-col gap-3 rounded-md border border-line p-3">
            <legend className="px-1 text-label font-medium text-fg">Fields</legend>
            <Switch id={id('f-name')} label="Name" checked={c.fields.name} onChange={toggle('name')} />
            <Switch id={id('f-email')} label="Email" checked={c.fields.email} onChange={toggle('email')} />
            <Switch id={id('f-phone')} label="Phone" checked={c.fields.phone} onChange={toggle('phone')} />
            <Switch id={id('f-message')} label="Message" checked={c.fields.message} onChange={toggle('message')} />
            {err('fields') && <p className="text-caption text-danger">{err('fields')}</p>}
          </fieldset>
          <TextInput id={id('submit')} label="Button label" value={c.submitLabel} onChange={(e) => set({ submitLabel: e.target.value }, 'submitLabel')} />
          <TextArea
              id={id('consent')}
              label="Consent note"
              rows={2}
              value={c.consentText}
              hint={warn('consentText') ?? 'Shown under the form.'}
              onChange={(e) => set({ consentText: e.target.value }, 'consentText')} />
            
          <InlineAlert tone="info" title="Submissions go to Audience">
            Each one creates or updates a contact. People can also tick an optional box to get updates.
          </InlineAlert>
        </div>);

      }
    case 'product':
      return <ProductFields block={block} issues={issues} />;
    case 'booking':
      return <BookingFields block={block} issues={issues} />;
    case 'subscription':
      return <SubscriptionFields block={block} issues={issues} />;
    case 'form':
      return <FormBlockFields block={block} issues={issues} />;
    case 'proof':
      return <ProofFields block={block} />;
    case 'membersOnly':
      return <MembersOnlyFields block={block} issues={issues} />;
    case 'trustBadge':
      return <TrustBadgeFields block={block} />;
    case 'whatsapp':{
        const c = block.content;
        const set = setter('whatsapp');
        return (
          <div className={stack}>
          <TextInput id={id('label')} label="Button label" value={c.label} onChange={(e) => set({ label: e.target.value }, 'label')} />
          <TextInput
              id={id('phone')}
              label="WhatsApp number"
              type="tel"
              inputMode="tel"
              placeholder="+234 …"
              value={c.phone}
              error={err('phone')}
              hint="Include the country code."
              onChange={(e) => set({ phone: e.target.value }, 'phone')} />
            
          <TextArea
              id={id('message')}
              label="Prefilled message"
              optional
              rows={3}
              value={c.message}
              hint="Visitors can edit it before they send."
              onChange={(e) => set({ message: e.target.value }, 'message')} />
            
        </div>);

      }
    case 'newsletter':{
        const c = block.content;
        const set = setter('newsletter');
        return (
          <div className={stack}>
          <TextInput id={id('title')} label="Title" value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
          <TextInput id={id('description')} label="Intro" optional value={c.description} onChange={(e) => set({ description: e.target.value }, 'description')} />
          <TextInput id={id('button')} label="Button label" value={c.buttonLabel} onChange={(e) => set({ buttonLabel: e.target.value }, 'buttonLabel')} />
          <TextArea
              id={id('consent')}
              label="Consent note"
              rows={2}
              value={c.consentText}
              hint={warn('consentText') ?? 'Tell people what they’re signing up for.'}
              onChange={(e) => set({ consentText: e.target.value }, 'consentText')} />
            
          <InlineAlert tone="info" title="Signups go to Audience">
            Each signup is saved as a subscribed contact with a consent record.
          </InlineAlert>
        </div>);

      }
    default:
      return <ExtendedContentFields block={block} issues={issues} />;
  }
}