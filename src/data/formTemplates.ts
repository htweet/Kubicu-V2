import type { FormField, FormFieldType } from '../types/forms';
import { makeField } from '../utils/forms/fields';

type FieldSeed = [FormFieldType, Partial<FormField>?];

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  fields: () => FormField[];
}

const build = (seeds: FieldSeed[]): FormField[] => seeds.map(([t, p]) => makeField(t, p));

/** Starter forms (D79). Example copy only — sellers edit everything. */
export const formTemplates: FormTemplate[] = [
{
  id: 'blank',
  name: 'Blank form',
  description: 'Start with name and email.',
  fields: () => build([['shortText', { label: 'Your name', required: true }], ['email', { label: 'Email', required: true }]])
},
{
  id: 'quote',
  name: 'Quote request',
  description: 'Collect project details and budget before you price a job.',
  fields: () => {
    const service = makeField('dropdown', { label: 'Which service?', required: true, options: ['Bridal', 'Owambe outfit', 'Everyday wear', 'Alterations'] });
    return [
    makeField('shortText', { label: 'Your name', required: true }),
    makeField('phone', { label: 'WhatsApp number', required: true }),
    service,
    makeField('date', { label: 'Wedding date', required: true, rule: { fieldId: service.id, op: 'is', value: 'Bridal' } }),
    makeField('amount', { label: 'Budget', help: 'A rough figure is fine.', stepBreak: true, stepTitle: 'Budget and details' }),
    makeField('longText', { label: 'Tell us more' }),
    makeField('file', { label: 'Inspiration photo' }),
    makeField('hidden', { label: 'Where they came from', hiddenSource: 'source' })];

  }
},
{
  id: 'rsvp',
  name: 'RSVP',
  description: 'Guest names, attendance and dietary needs.',
  fields: () => {
    const coming = makeField('choice', { label: 'Will you attend?', required: true, options: ['Yes', 'No', 'Maybe'] });
    return [
    makeField('shortText', { label: 'Full name', required: true }),
    makeField('email', { label: 'Email', required: true }),
    coming,
    makeField('number', { label: 'Number of guests', rule: { fieldId: coming.id, op: 'is', value: 'Yes' } }),
    makeField('checkboxes', { label: 'Dietary needs', options: ['Vegetarian', 'No pork', 'Nut allergy', 'None'], rule: { fieldId: coming.id, op: 'is', value: 'Yes' } })];

  }
},
{
  id: 'survey',
  name: 'Customer survey',
  description: 'A short satisfaction check after an order or visit.',
  fields: () =>
  build([
  ['rating', { label: 'How was your experience?', required: true }],
  ['choice', { label: 'Would you recommend us?', options: ['Yes', 'Not sure', 'No'] }],
  ['longText', { label: 'What could we do better?' }],
  ['email', { label: 'Email (optional)' }],
  ['consent']]
  )
},
{
  id: 'order-intake',
  name: 'Order intake',
  description: 'Custom orders with a deposit paid up front.',
  fields: () => {
    const total = makeField('amount', { label: 'Deposit', required: true, help: 'Agreed deposit for your order.' });
    return [
    makeField('shortText', { label: 'Your name', required: true }),
    makeField('phone', { label: 'Phone', required: true }),
    makeField('longText', { label: 'What would you like?', required: true }),
    makeField('address', { label: 'Delivery address', stepBreak: true, stepTitle: 'Delivery and deposit' }),
    total,
    makeField('payment', { label: 'Pay deposit', amountNgn: null, amountFromFieldId: total.id })];

  }
},
{
  id: 'onboarding',
  name: 'Client onboarding',
  description: 'Everything you need before the first session.',
  fields: () =>
  build([
  ['shortText', { label: 'Full name', required: true }],
  ['email', { label: 'Email', required: true }],
  ['phone', { label: 'Phone' }],
  ['choice', { label: 'Preferred contact', options: ['WhatsApp', 'Email', 'Phone call'], stepBreak: true, stepTitle: 'Preferences' }],
  ['longText', { label: 'What do you want to achieve?' }],
  ['consent']]
  )
},
{
  id: 'job',
  name: 'Job application',
  description: 'Applicants, roles and CVs in one inbox.',
  fields: () =>
  build([
  ['shortText', { label: 'Full name', required: true }],
  ['email', { label: 'Email', required: true }],
  ['phone', { label: 'Phone', required: true }],
  ['dropdown', { label: 'Role', required: true, options: ['Sales assistant', 'Tailor', 'Delivery rider'] }],
  ['file', { label: 'CV', required: true, stepBreak: true, stepTitle: 'Experience' }],
  ['longText', { label: 'Why do you want to join?' }]]
  )
}];