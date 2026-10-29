import type { FormDef, FormField } from '../types/forms';
import type { TicketTopic } from '../types/admin';

const field = (f: Partial<FormField> & Pick<FormField, 'id' | 'type' | 'label'>): FormField => ({
  help: '',
  required: false,
  placeholder: '',
  options: [],
  maxLength: null,
  amountNgn: null,
  amountFromFieldId: null,
  hiddenSource: 'source',
  stepBreak: false,
  stepTitle: '',
  rule: null,
  ...f
});

/** Legal pages link to the contact form with this topic already chosen (D236). */
export const LEGAL_TOPIC_LABEL = 'Legal, privacy or security';

/** Topic labels on the website contact form, mapped to support-queue topics. */
export const contactTopics: {label: string;topic: TicketTopic;}[] = [
{ label: 'A question before signing up', topic: 'other' },
{ label: 'My account or billing', topic: 'billing' },
{ label: 'Selling and payouts', topic: 'payments' },
{ label: 'My page or domain', topic: 'pages' },
{ label: 'Partnerships', topic: 'other' },
{ label: 'Press', topic: 'other' },
{ label: LEGAL_TOPIC_LABEL, topic: 'legal' }];


/**
 * KUBICU's own website contact form, built on the Forms engine (D125) so it gets the same
 * validation, spam checks, show-if rules and accessibility as sellers' forms.
 */
export const contactFormDef: FormDef = {
  id: 'kubicu_contact',
  name: 'Send a message',
  description: '',
  status: 'live',
  templateId: null,
  createdAt: '2026-10-01T09:00:00.000Z',
  updatedAt: '2026-10-23T09:00:00.000Z',
  fields: [
  field({ id: 'name', type: 'shortText', label: 'Your name', required: true, maxLength: 80 }),
  field({ id: 'email', type: 'email', label: 'Email', required: true, help: 'We reply here within 1 working day.' }),
  field({ id: 'topic', type: 'dropdown', label: 'What’s it about?', required: true, options: contactTopics.map((t) => t.label) }),
  field({ id: 'handle', type: 'shortText', label: 'Your KUBICU link', placeholder: 'kub.icu/yourname', help: 'So we can find your account faster.', rule: { fieldId: 'topic', op: 'isNot', value: 'A question before signing up' } }),
  field({ id: 'phone', type: 'phone', label: 'WhatsApp number', help: 'If you’d rather we reply on WhatsApp.' }),
  field({ id: 'message', type: 'longText', label: 'Message', required: true, maxLength: 2000 })],

  settings: {
    submitLabel: 'Send message',
    successTitle: 'Message sent',
    successText: 'Thanks — a person on our team will reply within 1 working day (Monday–Friday, 9am–6pm WAT).',
    redirectUrl: '',
    closeAt: null,
    maxResponses: null,
    minFillSeconds: 3,
    perVisitorLimit: 5,
    privacyNote: 'We use your details only to reply. See our privacy policy at kub.icu/about/privacy.',
    assigneeId: null
  }
};