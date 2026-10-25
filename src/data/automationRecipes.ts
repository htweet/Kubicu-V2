import type { ActionId, AutomationCondition, AutomationStep, TriggerId } from '../types/ops';

export const triggerLabels: Record<TriggerId, {label: string;hint: string;}> = {
  order_paid: { label: 'An order is paid', hint: 'From checkout on your page' },
  booking_created: { label: 'Someone books', hint: 'Any service' },
  checkout_abandoned: { label: 'A checkout is left unfinished', hint: 'Details entered, no payment after 1 hour' },
  lead_submitted: { label: 'Someone becomes a lead', hint: 'Lead form and Newsletter blocks, plus any form that collects an email or phone' },
  form_sent: { label: 'A form response arrives', hint: 'Forms add-on — any form, or one you choose. Fires even without contact details.' },
  stock_low: { label: 'Stock runs low', hint: 'Below a product’s alert level' },
  sub_started: { label: 'A subscription starts', hint: 'New subscriber or free trial' },
  sub_failed: { label: 'A subscription payment fails', hint: 'Before automatic retries' },
  sub_cancelled: { label: 'A subscription is cancelled', hint: 'By the subscriber or by you' },
  stage_due: { label: 'A payment stage or balance is due', hint: 'Quote stages, booking balances and made-to-order balances' },
  campaign_started: { label: 'A campaign goes live', hint: 'When a campaign space reaches its start time' },
  campaign_ended: { label: 'A campaign ends', hint: 'When a campaign space passes its end time' },
  contact_quiet: { label: 'A contact goes quiet', hint: 'No order, booking or message for the number of days you choose' }
};

export const actionLabels: Record<ActionId, {label: string;needsConsent: boolean;placeholder: string;}> = {
  send_email: { label: 'Send an email', needsConsent: false, placeholder: 'Hi {first_name}, …' },
  send_whatsapp: { label: 'Send a WhatsApp message', needsConsent: false, placeholder: 'Hi {first_name}, …' },
  create_task: { label: 'Create a follow-up task', needsConsent: false, placeholder: 'e.g. Call to confirm sizing' },
  add_tag: { label: 'Tag the contact', needsConsent: false, placeholder: 'e.g. VIP' },
  notify_owner: { label: 'Notify me', needsConsent: false, placeholder: 'e.g. Restock {product}' },
  notify_member: { label: 'Notify a team member', needsConsent: false, placeholder: 'e.g. Pack order {order_number} today' },
  ai_draft: { label: 'Draft a message with AI (you approve)', needsConsent: false, placeholder: 'e.g. A warm note inviting {first_name} back, mention new arrivals' },
  send_report: { label: 'Send me a report', needsConsent: false, placeholder: 'e.g. Campaign results' },
  call_webhook: { label: 'Call a webhook', needsConsent: false, placeholder: 'https://example.com/hooks/kubicu' }
};

/** What "Send me a report" can include (D125). */
export const reportOptions = [
{ value: 'Sales summary', label: 'Sales summary' },
{ value: 'Campaign results', label: 'Campaign results' },
{ value: 'New contacts', label: 'New contacts' },
{ value: 'Stock to reorder', label: 'Stock to reorder' }];


export const conditionLabels: Record<AutomationCondition['field'], string> = {
  total_over: 'Order total is over (₦)',
  source_is: 'Contact came from',
  tag_is: 'Contact has tag',
  consent_subscribed: 'Contact subscribed to marketing'
};

export interface Recipe {
  id: string;
  name: string;
  description: string;
  trigger: TriggerId;
  conditions: AutomationCondition[];
  steps: AutomationStep[];
  /** Marketing messages need opt-in; transactional ones don’t. */
  marketing: boolean;
}

export const recipes: Recipe[] = [
{
  id: 'thanks',
  name: 'Thank customers after an order',
  description: 'A warm thank-you with their order number as soon as payment clears.',
  trigger: 'order_paid',
  conditions: [],
  steps: [{ id: 's1', kind: 'action', action: 'send_whatsapp', value: 'Hi {first_name}, thank you for your order #{order_number}! We’ll let you know when it’s on its way.' }],
  marketing: false
},
{
  id: 'reminder',
  name: 'Booking reminder',
  description: 'Reminds people the day before, with your reschedule policy.',
  trigger: 'booking_created',
  conditions: [],
  steps: [
  { id: 's1', kind: 'delay', value: '', delayHours: 24 },
  { id: 's2', kind: 'action', action: 'send_whatsapp', value: 'Hi {first_name}, a reminder of your {service} at {time}. Need to move it? Reply here.' }],

  marketing: false
},
{
  id: 'abandoned',
  name: 'Abandoned checkout nudge',
  description: 'A gentle reminder to people who started checkout and stopped — only if they agreed to updates.',
  trigger: 'checkout_abandoned',
  conditions: [{ id: 'c1', field: 'consent_subscribed', value: 'yes' }],
  steps: [
  { id: 's1', kind: 'delay', value: '', delayHours: 2 },
  { id: 's2', kind: 'action', action: 'send_email', value: 'Hi {first_name}, you left something in your cart. It’s saved for you here: {cart_link}' }],

  marketing: true
},
{
  id: 'lead',
  name: 'Follow up new leads',
  description: 'Creates a task so no enquiry is forgotten, and tags the contact.',
  trigger: 'lead_submitted',
  conditions: [],
  steps: [
  { id: 's1', kind: 'action', action: 'add_tag', value: 'Lead' },
  { id: 's2', kind: 'action', action: 'create_task', value: 'Reply to {first_name}’s enquiry' }],

  marketing: false
},
{
  id: 'stock',
  name: 'Low-stock alert',
  description: 'Tells you when a product is about to sell out.',
  trigger: 'stock_low',
  conditions: [],
  steps: [{ id: 's1', kind: 'action', action: 'notify_owner', value: 'Restock {product} — only {stock} left.' }],
  marketing: false
}];