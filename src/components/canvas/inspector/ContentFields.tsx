import React from 'react';
import type { Block, BlockContentMap, BlockType } from '../../../types/page';
import type { ValidationIssue } from '../../../utils/validation';
import { useEditor } from '../../../contexts/EditorContext';
import { useT } from '../../../contexts/LocaleContext';
import { TextInput } from '../../ui/TextInput';
import { PhoneInput } from '../../ui/PhoneInput';
import { businessWhatsApp, waFieldHintIn } from '../../../utils/businessWhatsApp';
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
import { CourseFields } from './CourseFields';
import { FormBlockFields } from './FormBlockFields';
import { ProofFields } from './ProofFields';
import { MembersOnlyFields } from './MembersOnlyFields';
import { TrustBadgeFields } from './TrustBadgeFields';
import { EmbedFields } from './EmbedFields';
import { ContainerFields } from './ContainerFields';
import { StoryBlockFields, isStoryBlock } from './StoryBlockFields';
import { Round2BlockFields, isRound2Block } from './Round2BlockFields';
import { isContainer } from '../../../utils/containers';
import { StandardConsent } from './StandardConsent';

interface ContentFieldsProps {
  block: Block;
  issues: ValidationIssue[];
}

/** Content tab for the core blocks (D296). What the owner types shows as typed; fixed checks translate where a draft exists. */
export function ContentFields({ block, issues }: ContentFieldsProps) {
  const { t: tr } = useT();
  const { actions } = useEditor();
  const pick = (field: string, severity: ValidationIssue['severity']) => {
    const m = issues.find((i) => i.field === field && i.severity === severity)?.message;
    return m ? tr(m) : undefined;
  };
  const err = (field: string) => pick(field, 'error');
  const warn = (field: string) => pick(field, 'warning');
  const id = (field: string) => `${block.id}-${field}`;
  const setter =
  <K extends BlockType,>(type: K) =>
  (patch: Partial<BlockContentMap[K]>, field: string) =>
  actions.updateContent(block.id, type, patch, field);

  const stack = 'flex flex-col gap-4';

  // Containers (D167) have their own settings plus the blocks inside.
  if (isContainer(block)) return <ContainerFields block={block} />;
  if (isStoryBlock(block)) return <StoryBlockFields block={block} issues={issues} />;
  if (isRound2Block(block)) return <Round2BlockFields block={block} issues={issues} />;

  switch (block.type) {
    case 'profile':{
        const c = block.content;
        const set = setter('profile');
        return (
          <div className={stack}>
          <TextInput id={id('name')} label={tr('Name')} value={c.name} error={err('name')} onChange={(e) => set({ name: e.target.value }, 'name')} />
          <TextArea id={id('tagline')} label={tr('One-line pitch')} optional value={c.tagline} rows={3} onChange={(e) => set({ tagline: e.target.value }, 'tagline')} />
          <MediaPicker
              id={id('avatar')}
              label={tr('Photo or logo')}
              folder="brand"
              optional
              round
              aspect="1:1"
              value={c.avatarUrl}
              onChange={(avatarUrl, meta) => set(meta?.alt && !c.avatarAlt.trim() ? { avatarUrl, avatarAlt: meta.alt } : { avatarUrl }, 'avatarUrl')} />
            
          {c.avatarUrl &&
            <TextInput
              id={id('avatarAlt')}
              label={tr('Photo description')}
              value={c.avatarAlt}
              hint={warn('avatarAlt') ?? tr('Read aloud by screen readers.')}
              onChange={(e) => set({ avatarAlt: e.target.value }, 'avatarAlt')} />

            }
          <TextInput id={id('location')} label={tr('Location')} optional placeholder={tr('e.g. Lekki, Lagos')} value={c.location} onChange={(e) => set({ location: e.target.value }, 'location')} />
        </div>);

      }
    case 'heading':{
        const c = block.content;
        const set = setter('heading');
        return (
          <div className={stack}>
          <TextInput id={id('text')} label={tr('Heading')} value={c.text} error={err('text')} onChange={(e) => set({ text: e.target.value }, 'text')} />
          <Field id={id('level')} label={tr('Size')}>
            <Segmented
                ariaLabel={tr('Heading size')}
                value={c.level}
                onChange={(level) => set({ level }, 'level')}
                options={[
                { value: 'h2', label: tr('Section') },
                { value: 'h3', label: tr('Sub-section') }]
                } />
              
          </Field>
        </div>);

      }
    case 'text':{
        const set = setter('text');
        const editorial = block.content.variant === 'editorial';
        return (
          <div className={stack}>
          <Field id={id('variant')} label={tr('Style')}>
            <Segmented
                ariaLabel={tr('Text style')}
                value={editorial ? 'editorial' : 'plain'}
                onChange={(variant) => set({ variant }, 'variant')}
                options={[
                { value: 'plain', label: tr('Paragraph') },
                { value: 'editorial', label: tr('Editorial') }]
                } />
              
          </Field>
          <TextArea
              id={id('body')}
              label={tr('Text')}
              rows={7}
              value={block.content.body}
              hint={warn('body') ?? (editorial ? tr('First line becomes a large heading. Put a short line and a blank line before it to add a kicker above.') : undefined)}
              onChange={(e) => set({ body: e.target.value }, 'body')} />
            
        </div>);

      }
    case 'link':{
        const c = block.content;
        const set = setter('link');
        return (
          <div className={stack}>
          <TextInput id={id('label')} label={tr('Button label')} value={c.label} error={err('label')} onChange={(e) => set({ label: e.target.value }, 'label')} />
          <TextInput
              id={id('url')}
              label={tr('Destination')}
              type="url"
              inputMode="url"
              placeholder="https://"
              value={c.url}
              error={err('url')}
              onChange={(e) => set({ url: e.target.value }, 'url')} />
            
          <TextInput id={id('description')} label={tr('Supporting line')} optional value={c.description} onChange={(e) => set({ description: e.target.value }, 'description')} />
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
              label={tr('Image')}
              aspect={c.aspect}
              value={c.url}
              error={err('url')}
              onChange={(url, meta) => set(meta?.alt && !c.alt.trim() ? { url, alt: meta.alt } : { url }, 'url')} />
            
          {!c.decorative &&
            <TextInput
              id={id('alt')}
              label={tr('Image description')}
              value={c.alt}
              hint={warn('alt') ?? tr('Describe what’s in the photo for screen readers.')}
              onChange={(e) => set({ alt: e.target.value }, 'alt')} />

            }
          <Switch
              id={id('decorative')}
              label={tr('Decorative only')}
              description={tr('Turn on if the image adds no information (a texture or divider). Screen readers will skip it.')}
              checked={!!c.decorative}
              onChange={(decorative) => set({ decorative }, 'decorative')} />
            
          <TextInput id={id('caption')} label={tr('Caption')} optional value={c.caption} onChange={(e) => set({ caption: e.target.value }, 'caption')} />
          <Field id={id('aspect')} label={tr('Shape')}>
            <Segmented
                ariaLabel={tr('Image shape')}
                value={c.aspect}
                onChange={(aspect) => set({ aspect }, 'aspect')}
                options={[
                { value: '4:5', label: tr('Portrait') },
                { value: '1:1', label: tr('Square') },
                { value: '16:9', label: tr('Wide') }]
                } />
              
          </Field>
        </div>);

      }
    case 'video':
      return <EmbedFields block={block} error={err('url')} />;
    case 'divider':{
        const set = setter('divider');
        return <TextInput id={id('label')} label={tr('Label')} optional value={block.content.label} hint={tr('Leave empty for a plain line.')} onChange={(e) => set({ label: e.target.value }, 'label')} />;
      }
    case 'spacer':{
        const set = setter('spacer');
        return (
          <Field id={id('size')} label={tr('Height')}>
          <Segmented
              ariaLabel={tr('Spacer height')}
              value={block.content.size}
              onChange={(size) => set({ size }, 'size')}
              options={[
              { value: 'sm', label: tr('Small') },
              { value: 'md', label: tr('Medium') },
              { value: 'lg', label: tr('Large') }]
              } />
            
        </Field>);

      }
    case 'contact':{
        const c = block.content;
        const set = setter('contact');
        return (
          <div className={stack}>
          <PhoneInput id={id('phone')} label={tr('Phone')} optional value={c.phone} error={err('phone')} onChange={(phone) => set({ phone }, 'phone')} />
          <TextInput id={id('email')} label={tr('Email')} optional type="email" inputMode="email" value={c.email} error={err('email')} onChange={(e) => set({ email: e.target.value }, 'email')} />
          <TextArea id={id('address')} label={tr('Address')} optional rows={2} value={c.address} onChange={(e) => set({ address: e.target.value }, 'address')} />
          <TextInput id={id('hours')} label={tr('Opening hours')} optional placeholder={tr('e.g. Mon–Fri, 9am–5pm WAT')} value={c.hours} onChange={(e) => set({ hours: e.target.value }, 'hours')} />
        </div>);

      }
    case 'faq':{
        const set = setter('faq');
        return (
          <div className={stack}>
          <TextInput id={id('title')} label={tr('Section title')} optional value={block.content.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
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
          <TextInput id={id('title')} label={tr('Title')} value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
          <TextArea id={id('description')} label={tr('Intro')} optional rows={2} value={c.description} onChange={(e) => set({ description: e.target.value }, 'description')} />
          <fieldset className="flex flex-col gap-3 rounded-md border border-line p-3">
            <legend className="px-1 text-label font-medium text-fg">{tr('Fields')}</legend>
            <Switch id={id('f-name')} label={tr('Name')} checked={c.fields.name} onChange={toggle('name')} />
            <Switch id={id('f-email')} label={tr('Email')} checked={c.fields.email} onChange={toggle('email')} />
            <Switch id={id('f-phone')} label={tr('Phone')} checked={c.fields.phone} onChange={toggle('phone')} />
            <Switch id={id('f-message')} label={tr('Message')} checked={c.fields.message} onChange={toggle('message')} />
            {err('fields') && <p className="text-caption text-danger">{err('fields')}</p>}
          </fieldset>
          <TextInput id={id('submit')} label={tr('Button label')} value={c.submitLabel} onChange={(e) => set({ submitLabel: e.target.value }, 'submitLabel')} />
          <TextArea
              id={id('consent')}
              label={tr('Consent note')}
              rows={2}
              value={c.consentText}
              hint={warn('consentText') ?? tr('Shown under the form.')}
              onChange={(e) => set({ consentText: e.target.value }, 'consentText')} />
            
          <StandardConsent current={c.consentText} onUse={(t) => set({ consentText: t }, 'consentText')} />
          <InlineAlert tone="info" title={tr('Submissions go to Audience')}>
            {tr('Each one creates or updates a contact. People can also tick an optional box to get updates.')}
          </InlineAlert>
        </div>);

      }
    case 'product':
      return <ProductFields block={block} issues={issues} />;
    case 'booking':
      return <BookingFields block={block} issues={issues} />;
    case 'subscription':
      return <SubscriptionFields block={block} issues={issues} />;
    case 'course':
      return <CourseFields block={block} issues={issues} />;
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
          <TextInput id={id('label')} label={tr('Button label')} value={c.label} onChange={(e) => set({ label: e.target.value }, 'label')} />
          <TextInput
              id={id('phone')}
              label={tr('WhatsApp number')}
              type="tel"
              inputMode="tel"
              placeholder={businessWhatsApp() || '+234 …'}
              value={c.phone}
              error={err('phone')}
              hint={waFieldHintIn(tr, c.phone)}
              onChange={(e) => set({ phone: e.target.value }, 'phone')} />
            
          <TextArea
              id={id('message')}
              label={tr('Prefilled message')}
              optional
              rows={3}
              value={c.message}
              hint={tr('Visitors can edit it before they send.')}
              onChange={(e) => set({ message: e.target.value }, 'message')} />
            
        </div>);

      }
    case 'newsletter':{
        const c = block.content;
        const set = setter('newsletter');
        return (
          <div className={stack}>
          <TextInput id={id('title')} label={tr('Title')} value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
          <TextInput id={id('description')} label={tr('Intro')} optional value={c.description} onChange={(e) => set({ description: e.target.value }, 'description')} />
          <TextInput id={id('button')} label={tr('Button label')} value={c.buttonLabel} onChange={(e) => set({ buttonLabel: e.target.value }, 'buttonLabel')} />
          <TextArea
              id={id('consent')}
              label={tr('Consent note')}
              rows={2}
              value={c.consentText}
              hint={warn('consentText') ?? tr('Tell people what they’re signing up for.')}
              onChange={(e) => set({ consentText: e.target.value }, 'consentText')} />
            
          <StandardConsent current={c.consentText} onUse={(t) => set({ consentText: t }, 'consentText')} />
          <InlineAlert tone="info" title={tr('Signups go to Audience')}>
            {tr('Each signup is saved as a subscribed contact with a consent record.')}
          </InlineAlert>
        </div>);

      }
    default:
      return <ExtendedContentFields block={block} issues={issues} />;
  }
}