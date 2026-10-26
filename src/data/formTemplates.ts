import type { LucideIcon } from 'lucide-react';
import {
  BriefcaseIcon,
  CalendarCheckIcon,
  CalculatorIcon,
  ClipboardCheckIcon,
  FileSignatureIcon,
  FilePlusIcon,
  GiftIcon,
  GraduationCapIcon,
  HandshakeIcon,
  HeartPulseIcon,
  HomeIcon,
  MegaphoneIcon,
  MessageSquareQuoteIcon,
  PackageIcon,
  PartyPopperIcon,
  RotateCcwIcon,
  ScissorsIcon,
  ShoppingBasketIcon,
  SparklesIcon,
  StarIcon,
  UserPlusIcon,
  UsersIcon } from
'lucide-react';
import type { FormField, FormFieldType } from '../types/forms';
import { makeField } from '../utils/forms/fields';

type FieldSeed = [FormFieldType, Partial<FormField>?];

export type FormTemplateCategory = 'basics' | 'sell' | 'services' | 'events' | 'feedback' | 'people';

export const formTemplateCategories: {id: FormTemplateCategory;label: string;}[] = [
{ id: 'basics', label: 'Basics' },
{ id: 'sell', label: 'Selling' },
{ id: 'services', label: 'Services' },
{ id: 'events', label: 'Events & classes' },
{ id: 'feedback', label: 'Feedback' },
{ id: 'people', label: 'People & partners' }];


export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: FormTemplateCategory;
  icon: LucideIcon;
  /** Short tags for what makes it more than a plain form, e.g. "Takes payment". */
  highlights?: string[];
  /** Something the owner must set up after creating it (shown before they pick it). */
  setupNote?: string;
  fields: () => FormField[];
}

const build = (seeds: FieldSeed[]): FormField[] => seeds.map(([t, p]) => makeField(t, p));

/** Starter forms (D79, D199). Example copy only — sellers edit everything. */
export const formTemplates: FormTemplate[] = [
{
  id: 'blank',
  name: 'Blank form',
  description: 'Start with name and email.',
  category: 'basics',
  icon: FilePlusIcon,
  fields: () => build([['shortText', { label: 'Your name', required: true }], ['email', { label: 'Email', required: true }]])
},
{
  id: 'contact',
  name: 'Contact us',
  description: 'A tidy enquiry form that routes by topic.',
  category: 'basics',
  icon: MessageSquareQuoteIcon,
  highlights: ['Smart routing'],
  fields: () => {
    const topic = makeField('dropdown', { label: 'What’s it about?', required: true, options: ['An order', 'A booking', 'Working together', 'Something else'] });
    return [
    makeField('name', { required: true }),
    makeField('email', { label: 'Email', required: true }),
    makeField('phone', { label: 'WhatsApp number', help: 'Optional — often the fastest way we reply.' }),
    topic,
    makeField('shortText', { label: 'Order number', placeholder: 'e.g. #1042', rule: { fieldId: topic.id, op: 'is', value: 'An order' } }),
    makeField('website', { label: 'Your website or Instagram', rule: { fieldId: topic.id, op: 'is', value: 'Working together' } }),
    makeField('longText', { label: 'Your message', required: true }),
    makeField('consent')];

  }
},
{
  id: 'quote',
  name: 'Quote request',
  description: 'Collect project details and budget before you price a job.',
  category: 'services',
  icon: BriefcaseIcon,
  highlights: ['Two steps', 'Logic'],
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
  id: 'instant-quote',
  name: 'Instant price estimate',
  description: 'Visitors pick options and see a live estimate, then pay a 50% deposit.',
  category: 'sell',
  icon: CalculatorIcon,
  highlights: ['Live total', 'Takes payment', 'Three steps'],
  fields: () => {
    const guests = makeField('number', { label: 'How many people?', required: true, help: 'For example, guests to cater for.' });
    const estimate = makeField('calculated', { label: 'Estimated total', calc: { fieldIds: [guests.id], multiplier: 3500, unit: 'ngn' }, help: 'Based on ₦3,500 per person. Final price confirmed by us.' });
    const deposit = makeField('calculated', { label: 'Deposit today (50%)', calc: { fieldIds: [estimate.id], multiplier: 0.5, unit: 'ngn' } });
    return [
    makeField('section', { label: 'Plan your order', help: 'Tell us the basics and see a price straight away.' }),
    makeField('choice', { label: 'What do you need?', required: true, options: ['Small chops', 'Full buffet', 'Cake and drinks'] }),
    guests,
    makeField('date', { label: 'Event date', required: true }),
    { ...estimate, stepBreak: true, stepTitle: 'Your estimate' },
    deposit,
    makeField('name', { required: true, stepBreak: true, stepTitle: 'Confirm and pay' }),
    makeField('phone', { label: 'WhatsApp number', required: true }),
    makeField('region', { label: 'Where is the event?', required: true }),
    makeField('payment', { label: 'Pay deposit', amountNgn: null, amountFromFieldId: deposit.id })];

  }
},
{
  id: 'order-intake',
  name: 'Custom order',
  description: 'Custom orders with a deposit paid up front.',
  category: 'sell',
  icon: ScissorsIcon,
  highlights: ['Takes payment', 'Two steps'],
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
  id: 'preorder',
  name: 'Pre-order list',
  description: 'Let people order from a menu of your products before a drop, with a running total.',
  category: 'sell',
  icon: ShoppingBasketIcon,
  highlights: ['Product picker', 'Takes payment'],
  setupNote: 'Pick the products to offer after you create it.',
  fields: () => {
    const picks = makeField('products', { label: 'What would you like?', required: true, help: 'Choose how many of each.' });
    return [
    makeField('section', { label: 'Reserve yours', help: 'Orders are packed in the order they arrive.' }),
    picks,
    makeField('choice', { label: 'How will you get it?', required: true, options: ['Pickup', 'Delivery in Lagos', 'Delivery outside Lagos'] }),
    makeField('name', { required: true, stepBreak: true, stepTitle: 'Your details' }),
    makeField('phone', { label: 'WhatsApp number', required: true }),
    makeField('payment', { label: 'Pay now', amountNgn: null, amountFromFieldId: picks.id })];

  }
},
{
  id: 'returns',
  name: 'Return or refund request',
  description: 'Order, reason, photos and refund details in one calm flow.',
  category: 'sell',
  icon: RotateCcwIcon,
  highlights: ['Logic', 'Bank details'],
  fields: () => {
    const want = makeField('choice', { label: 'What would you like?', required: true, options: ['Exchange for another size', 'Refund to my bank', 'Store credit'] });
    return [
    makeField('name', { required: true }),
    makeField('phone', { label: 'Phone used for the order', required: true }),
    makeField('shortText', { label: 'Order number', required: true, placeholder: 'e.g. #1042' }),
    makeField('dropdown', { label: 'Reason', required: true, options: ['Wrong size', 'Arrived damaged', 'Not as described', 'Changed my mind'], stepBreak: true, stepTitle: 'What happened' }),
    makeField('file', { label: 'Photo of the item', help: 'Helps us sort it faster.' }),
    want,
    makeField('bank', { required: true, rule: { fieldId: want.id, op: 'is', value: 'Refund to my bank' } }),
    makeField('longText', { label: 'Anything else?' })];

  }
},
{
  id: 'booking-request',
  name: 'Appointment request',
  description: 'Clients pick a real free time and tell you what they need before you confirm.',
  category: 'services',
  icon: CalendarCheckIcon,
  highlights: ['Live free times', 'Two steps'],
  setupNote: 'Choose which Bookings service it shows times for.',
  fields: () =>
  build([
  ['bookingSlot', { label: 'Preferred time', required: true }],
  ['checkboxes', { label: 'What would you like done?', options: ['Wash and style', 'Braids', 'Treatment', 'Colour'] }],
  ['file', { label: 'Inspiration photo' }],
  ['name', { required: true, stepBreak: true, stepTitle: 'Your details' }],
  ['phone', { label: 'WhatsApp number', required: true }],
  ['longText', { label: 'Anything we should know?', help: 'Allergies, sensitivities, or access needs.' }]]
  )
},
{
  id: 'onboarding',
  name: 'Client onboarding',
  description: 'Goals, priorities, preferences and a signed agreement before the first session.',
  category: 'services',
  icon: HandshakeIcon,
  highlights: ['Ranking', 'Signature', 'Three steps'],
  fields: () =>
  build([
  ['name', { required: true }],
  ['email', { label: 'Email', required: true }],
  ['phone', { label: 'Phone' }],
  ['website', { label: 'Business website or Instagram' }],
  ['longText', { label: 'What do you want to achieve?', required: true, stepBreak: true, stepTitle: 'Your goals' }],
  ['ranking', { label: 'Put these in order of importance', options: ['More sales', 'Better brand', 'Saving time', 'Growing a team'] }],
  ['choice', { label: 'Preferred contact', options: ['WhatsApp', 'Email', 'Phone call'] }],
  ['section', { label: 'Agreement', help: 'Please read our terms. Your signature records that you agree.', stepBreak: true, stepTitle: 'Agreement' }],
  ['signature', { required: true }]]
  )
},
{
  id: 'consultation-intake',
  name: 'Health & wellness intake',
  description: 'A private, considerate intake for therapists, trainers and beauty pros.',
  category: 'services',
  icon: HeartPulseIcon,
  highlights: ['Logic', 'Signature', 'Three steps'],
  fields: () => {
    const conditions = makeField('choice', { label: 'Any health conditions we should know about?', required: true, options: ['No', 'Yes'] });
    return [
    makeField('section', { label: 'Before your first visit', help: 'Your answers are only seen by your practitioner.' }),
    makeField('name', { required: true }),
    makeField('date', { label: 'Date of birth', required: true }),
    makeField('phone', { label: 'Phone', required: true }),
    conditions,
    makeField('longText', { label: 'Please tell us more', required: true, rule: { fieldId: conditions.id, op: 'is', value: 'Yes' } }),
    makeField('scale', { label: 'How would you rate your stress lately?', scale: { min: 1, max: 5, minLabel: 'Very low', maxLabel: 'Very high' }, stepBreak: true, stepTitle: 'How you’re feeling' }),
    makeField('checkboxes', { label: 'What would you like help with?', options: ['Relaxation', 'Pain relief', 'Fitness', 'Skin', 'Sleep'] }),
    makeField('shortText', { label: 'Emergency contact (name and phone)', stepBreak: true, stepTitle: 'Consent' }),
    makeField('signature', { required: true, help: 'Confirms the details are correct to the best of your knowledge.' })];

  }
},
{
  id: 'property-viewing',
  name: 'Property enquiry',
  description: 'Budget, area, move-in dates and viewing times for agents and landlords.',
  category: 'services',
  icon: HomeIcon,
  highlights: ['Date range', 'Two steps'],
  fields: () =>
  build([
  ['choice', { label: 'Are you looking to', required: true, options: ['Rent', 'Buy', 'Short let'] }],
  ['region', { label: 'Which area?', required: true }],
  ['dropdown', { label: 'Bedrooms', options: ['Studio', '1', '2', '3', '4+'] }],
  ['amount', { label: 'Budget', help: 'Per year for rent, or total to buy.' }],
  ['dateRange', { label: 'When would you move in?', stepBreak: true, stepTitle: 'Timing and contact' }],
  ['name', { required: true }],
  ['phone', { label: 'WhatsApp number', required: true }],
  ['choice', { label: 'Best time for a viewing', options: ['Weekday mornings', 'Weekday evenings', 'Weekends'] }]]
  )
},
{
  id: 'rsvp',
  name: 'RSVP',
  description: 'Guest names, attendance and dietary needs.',
  category: 'events',
  icon: PartyPopperIcon,
  highlights: ['Logic'],
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
  id: 'class-registration',
  name: 'Class or tutoring sign-up',
  description: 'Learner details, level, schedule preferences and fees for tutors and schools.',
  category: 'events',
  icon: GraduationCapIcon,
  highlights: ['Live total', 'Takes payment', 'Three steps'],
  fields: () => {
    const sessions = makeField('number', { label: 'How many sessions?', required: true, help: 'Each session is 1 hour.' });
    const fee = makeField('calculated', { label: 'Fees', calc: { fieldIds: [sessions.id], multiplier: 5000, unit: 'ngn' }, help: '₦5,000 per session.' });
    return [
    makeField('name', { label: 'Learner’s name', required: true }),
    makeField('dropdown', { label: 'Subject', required: true, options: ['Maths', 'English', 'Physics', 'Coding', 'French'] }),
    makeField('choice', { label: 'Level', required: true, options: ['Primary', 'JSS', 'SSS / WAEC', 'Adult beginner'] }),
    makeField('grid', { label: 'When can you attend?', options: ['Weekday mornings', 'Weekday evenings', 'Saturdays'], gridColumns: ['No', 'Maybe', 'Yes'], stepBreak: true, stepTitle: 'Schedule' }),
    makeField('choice', { label: 'Format', options: ['Online', 'In person'] }),
    sessions,
    fee,
    makeField('shortText', { label: 'Parent or guardian name', stepBreak: true, stepTitle: 'Contact and payment' }),
    makeField('phone', { label: 'WhatsApp number', required: true }),
    makeField('payment', { label: 'Pay fees', amountNgn: null, amountFromFieldId: fee.id })];

  }
},
{
  id: 'event-registration',
  name: 'Workshop registration',
  description: 'Tickets by tier, attendee details and a short pre-event questionnaire.',
  category: 'events',
  icon: MegaphoneIcon,
  highlights: ['Takes payment', 'Logic'],
  fields: () => {
    const tier = makeField('dropdown', { label: 'Ticket', required: true, options: ['Early bird', 'Regular', 'VIP'] });
    const price = makeField('amount', { label: 'Ticket price', required: true, help: 'Early bird ₦10,000 · Regular ₦15,000 · VIP ₦30,000.' });
    return [
    tier,
    makeField('name', { required: true }),
    makeField('email', { label: 'Email for your confirmation', required: true }),
    makeField('dropdown', { label: 'Plus one?', options: ['Just me', 'Bringing one guest'], rule: { fieldId: tier.id, op: 'is', value: 'VIP' } }),
    makeField('scale', { label: 'How much do you know about the topic already?', scale: { min: 1, max: 5, minLabel: 'New to it', maxLabel: 'Expert' }, stepBreak: true, stepTitle: 'A little about you' }),
    makeField('longText', { label: 'What do you hope to take away?' }),
    { ...price, stepBreak: true, stepTitle: 'Payment' },
    makeField('payment', { label: 'Pay for your ticket', amountNgn: null, amountFromFieldId: price.id })];

  }
},
{
  id: 'survey',
  name: 'Customer survey',
  description: 'A short satisfaction check after an order or visit.',
  category: 'feedback',
  icon: StarIcon,
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
  id: 'nps',
  name: 'Net promoter score',
  description: 'The 0–10 recommend question, a follow-up that adapts to the score, and a rating grid.',
  category: 'feedback',
  icon: SparklesIcon,
  highlights: ['Scale', 'Grid', 'Logic'],
  fields: () => {
    const nps = makeField('scale', { required: true });
    return [
    nps,
    makeField('grid', { label: 'How did we do on each of these?', options: ['Quality', 'Delivery', 'Price', 'Communication'], gridColumns: ['Poor', 'OK', 'Good', 'Great'] }),
    makeField('longText', { label: 'What’s the main reason for your score?' }),
    makeField('ranking', { label: 'What should we improve first?', options: ['Faster delivery', 'More sizes', 'Better packaging', 'Lower prices'] }),
    makeField('email', { label: 'Email, if we may follow up' })];

  }
},
{
  id: 'testimonial',
  name: 'Testimonial collector',
  description: 'Ask happy clients for a review with a photo and clear permission to publish.',
  category: 'feedback',
  icon: MessageSquareQuoteIcon,
  highlights: ['Permission built in'],
  fields: () => {
    const ok = makeField('choice', { label: 'May we share your words on our page?', required: true, options: ['Yes, with my name', 'Yes, first name only', 'No, just for you'] });
    return [
    makeField('rating', { label: 'Overall, how was it?', required: true }),
    makeField('longText', { label: 'In a sentence or two, what was it like working with us?', required: true }),
    ok,
    makeField('name', { required: true, rule: { fieldId: ok.id, op: 'isNot', value: 'No, just for you' } }),
    makeField('file', { label: 'A photo of you or your order', help: 'Optional.', rule: { fieldId: ok.id, op: 'isNot', value: 'No, just for you' } }),
    makeField('website', { label: 'Your Instagram, to tag you', rule: { fieldId: ok.id, op: 'is', value: 'Yes, with my name' } })];

  }
},
{
  id: 'giveaway',
  name: 'Giveaway entry',
  description: 'Collect fair entries with one per person, a simple question and clear consent.',
  category: 'feedback',
  icon: GiftIcon,
  highlights: ['Consent'],
  fields: () =>
  build([
  ['section', { label: 'Enter to win', help: 'One entry per person. Winner announced on our Instagram.' }],
  ['name', { required: true }],
  ['phone', { label: 'WhatsApp number', required: true, help: 'We’ll only use it to contact the winner.' }],
  ['website', { label: 'Your Instagram handle', required: true }],
  ['choice', { label: 'Which prize would you love?', required: true, options: ['Gift box', 'Store voucher', 'Free session'] }],
  ['consent']]
  )
},
{
  id: 'job',
  name: 'Job application',
  description: 'Applicants, roles and CVs in one inbox.',
  category: 'people',
  icon: UserPlusIcon,
  highlights: ['Two steps'],
  fields: () =>
  build([
  ['name', { required: true }],
  ['email', { label: 'Email', required: true }],
  ['phone', { label: 'Phone', required: true }],
  ['region', { label: 'Where are you based?' }],
  ['dropdown', { label: 'Role', required: true, options: ['Sales assistant', 'Tailor', 'Delivery rider'] }],
  ['file', { label: 'CV', required: true, stepBreak: true, stepTitle: 'Experience' }],
  ['longText', { label: 'Why do you want to join?' }]]
  )
},
{
  id: 'vendor',
  name: 'Vendor or stall application',
  description: 'For markets and pop-ups: brand, products, stall size, fee and terms.',
  category: 'people',
  icon: PackageIcon,
  highlights: ['Takes payment', 'Signature', 'Three steps'],
  fields: () => {
    const stall = makeField('choice', { label: 'Stall size', required: true, options: ['Half table', 'Full table', 'Double space'] });
    const fee = makeField('amount', { label: 'Stall fee', required: true, help: 'Half ₦15,000 · Full ₦25,000 · Double ₦45,000.' });
    return [
    makeField('shortText', { label: 'Brand name', required: true }),
    makeField('website', { label: 'Instagram or website', required: true }),
    makeField('checkboxes', { label: 'What do you sell?', required: true, options: ['Fashion', 'Beauty', 'Food & drinks', 'Art & crafts', 'Home'] }),
    makeField('file', { label: 'Photos of your products', required: true, stepBreak: true, stepTitle: 'Your stall' }),
    stall,
    makeField('choice', { label: 'Do you need power?', options: ['Yes', 'No'] }),
    makeField('name', { label: 'Contact person', required: true, stepBreak: true, stepTitle: 'Terms and fee' }),
    makeField('phone', { label: 'WhatsApp number', required: true }),
    makeField('signature', { required: true, help: 'You agree to the market rules shared with you.' }),
    fee,
    makeField('payment', { label: 'Pay stall fee', amountNgn: null, amountFromFieldId: fee.id })];

  }
},
{
  id: 'collab',
  name: 'Brand collaboration enquiry',
  description: 'For creators: campaign details, deliverables, dates and budget from brands.',
  category: 'people',
  icon: UsersIcon,
  highlights: ['Date range', 'Two steps'],
  fields: () =>
  build([
  ['shortText', { label: 'Brand or agency', required: true }],
  ['name', { label: 'Your name', required: true }],
  ['email', { label: 'Work email', required: true }],
  ['website', { label: 'Brand website or Instagram' }],
  ['checkboxes', { label: 'What would you like?', required: true, options: ['Instagram post', 'Reels / TikTok', 'Stories', 'YouTube integration', 'Event appearance'], stepBreak: true, stepTitle: 'The campaign' }],
  ['dateRange', { label: 'Campaign dates' }],
  ['amount', { label: 'Budget' }],
  ['longText', { label: 'Brief', help: 'Goals, key messages and anything we must avoid.' }],
  ['file', { label: 'Brief or deck (optional)' }]]
  )
},
{
  id: 'agreement',
  name: 'Service agreement',
  description: 'Confirm scope, dates and price, then collect a signature and deposit.',
  category: 'people',
  icon: FileSignatureIcon,
  highlights: ['Signature', 'Takes payment'],
  fields: () => {
    const deposit = makeField('amount', { label: 'Deposit', required: true, help: 'As agreed in your quote.' });
    return [
    makeField('section', { label: 'Confirm our agreement', help: 'Check the details below, sign, and pay the deposit to secure your date.' }),
    makeField('name', { label: 'Client name', required: true }),
    makeField('longText', { label: 'Scope of work', required: true, help: 'What’s included, as agreed.' }),
    makeField('dateRange', { label: 'Project dates', required: true }),
    makeField('checkboxes', { label: 'Terms', options: ['I’ve read and agree to the terms and cancellation policy'], required: true }),
    makeField('signature', { required: true, stepBreak: true, stepTitle: 'Sign and pay' }),
    deposit,
    makeField('payment', { label: 'Pay deposit', amountNgn: null, amountFromFieldId: deposit.id })];

  }
},
{
  id: 'checklist',
  name: 'Inspection checklist',
  description: 'A grid-based checklist for site visits, handovers or quality checks, signed off on the spot.',
  category: 'services',
  icon: ClipboardCheckIcon,
  highlights: ['Grid', 'Signature'],
  fields: () =>
  build([
  ['shortText', { label: 'Location or job', required: true }],
  ['date', { label: 'Date', required: true }],
  ['grid', { label: 'Condition', options: ['Walls and paint', 'Plumbing', 'Electricals', 'Doors and windows', 'Cleanliness'], gridColumns: ['Needs work', 'Fair', 'Good'] }],
  ['file', { label: 'Photos' }],
  ['longText', { label: 'Notes and follow-ups' }],
  ['signature', { label: 'Signed off by', required: true }]]
  )
}];