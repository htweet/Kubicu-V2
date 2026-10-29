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

export type RecipeGroup = 'sales' | 'bookings' | 'audience' | 'subscriptions' | 'operations';

export const recipeGroups: {id: RecipeGroup;label: string;}[] = [
{ id: 'sales', label: 'Orders & checkout' },
{ id: 'bookings', label: 'Bookings' },
{ id: 'audience', label: 'Leads & customers' },
{ id: 'subscriptions', label: 'Subscriptions & payments due' },
{ id: 'operations', label: 'Stock & campaigns' }];


export interface Recipe {
  id: string;
  name: string;
  description: string;
  group: RecipeGroup;
  trigger: TriggerId;
  /** contact_quiet only. */
  triggerDays?: number;
  conditions: AutomationCondition[];
  steps: AutomationStep[];
  /** Marketing messages need opt-in; transactional ones don’t. */
  marketing: boolean;
  /** What has to be set up for it to fire, in plain words. */
  needs?: string;
}

export const recipes: Recipe[] = [
{
  id: 'thanks',
  name: 'Thank customers after an order',
  description: 'A warm thank-you with their order number as soon as payment clears.',
  group: 'sales',
  trigger: 'order_paid',
  conditions: [],
  steps: [{ id: 's1', kind: 'action', action: 'send_whatsapp', value: 'Hi {first_name}, thank you for your order {order_number}! Follow it here: {order_link}' }],
  marketing: false
},
{
  id: 'vip',
  name: 'Spot big orders',
  description: 'Tags customers who spend over ₦100,000 as VIP and tells you straight away.',
  group: 'sales',
  trigger: 'order_paid',
  conditions: [{ id: 'c1', field: 'total_over', value: '100000' }],
  steps: [
  { id: 's1', kind: 'action', action: 'add_tag', value: 'VIP' },
  { id: 's2', kind: 'action', action: 'notify_owner', value: 'Big order {order_number} from {name} — {total}' }],

  marketing: false
},
{
  id: 'pack',
  name: 'Hand new orders to your packer',
  description: 'Tells the team member who packs orders as soon as one is paid. Choose who after you open it.',
  group: 'sales',
  trigger: 'order_paid',
  conditions: [],
  steps: [{ id: 's1', kind: 'action', action: 'notify_member', value: 'Pack order {order_number} for {name} today', memberId: null }],
  marketing: false,
  needs: 'A team member to notify'
},
{
  id: 'review',
  name: 'Ask for a review',
  description: 'Three days after an order, asks how they’re finding it. Only sent if they agreed to updates.',
  group: 'sales',
  trigger: 'order_paid',
  conditions: [{ id: 'c1', field: 'consent_subscribed', value: 'yes' }],
  steps: [
  { id: 's1', kind: 'delay', value: '', delayHours: 72 },
  { id: 's2', kind: 'action', action: 'send_whatsapp', value: 'Hi {first_name}, how are you finding your {item}? A short review helps other customers: {link}' }],

  marketing: true
},
{
  id: 'unpaid-call',
  name: 'Call about unpaid checkouts',
  description: 'A follow-up task when someone leaves checkout unpaid — no message sent, so no opt-in needed.',
  group: 'sales',
  trigger: 'checkout_abandoned',
  conditions: [],
  steps: [
  { id: 's1', kind: 'delay', value: '', delayHours: 3 },
  { id: 's2', kind: 'action', action: 'create_task', value: 'Check in with {first_name} about unpaid order {order_number} ({total})' }],

  marketing: false
},
{
  id: 'reminder',
  name: 'Booking reminder',
  description: 'Follows up a day after they book with the time, and how to move it.',
  group: 'bookings',
  needs: 'Bookings app',
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
  group: 'sales',
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
  group: 'audience',
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
  group: 'operations',
  trigger: 'stock_low',
  conditions: [],
  steps: [{ id: 's1', kind: 'action', action: 'notify_owner', value: 'Restock {product} — only {stock} left.' }],
  marketing: false
},
{
  id: 'booking-confirm',
  name: 'Confirm every booking',
  description: 'Sends the service, time and booking reference the moment someone books.',
  group: 'bookings',
  needs: 'Bookings app',
  trigger: 'booking_created',
  conditions: [],
  steps: [{ id: 's1', kind: 'action', action: 'send_whatsapp', value: 'Hi {first_name}, you’re booked for {service} on {time}. Your reference is {ref}. See you then!' }],
  marketing: false
},
{
  id: 'booking-client',
  name: 'Tag new clients and tell me',
  description: 'Tags anyone who books as a Client and sends you a notice with the time.',
  group: 'bookings',
  needs: 'Bookings app',
  trigger: 'booking_created',
  conditions: [],
  steps: [
  { id: 's1', kind: 'action', action: 'add_tag', value: 'Client' },
  { id: 's2', kind: 'action', action: 'notify_owner', value: 'New booking: {name} — {service}, {time}' }],

  marketing: false
},
{
  id: 'lead-welcome',
  name: 'Welcome new subscribers',
  description: 'A short welcome email to people who join your list and agreed to hear from you.',
  group: 'audience',
  trigger: 'lead_submitted',
  conditions: [{ id: 'c1', field: 'consent_subscribed', value: 'yes' }],
  steps: [{ id: 's1', kind: 'action', action: 'send_email', value: 'Hi {first_name}, thanks for joining! Here’s what to expect from us — new arrivals, offers and the occasional tip. Reply any time.' }],
  marketing: true
},
{
  id: 'form-reply',
  name: 'Reply to form responses',
  description: 'Every response to your forms gets a follow-up task and a notice, so nothing waits.',
  group: 'audience',
  needs: 'Forms add-on',
  trigger: 'form_sent',
  conditions: [],
  steps: [
  { id: 's1', kind: 'action', action: 'create_task', value: 'Reply to {name} about “{form}”' },
  { id: 's2', kind: 'action', action: 'notify_owner', value: '{name} sent “{form}”' }],

  marketing: false
},
{
  id: 'winback',
  name: 'Win back quiet customers',
  description: 'After 60 days without an order, booking or message, drafts a friendly note for you to approve.',
  group: 'audience',
  trigger: 'contact_quiet',
  triggerDays: 60,
  conditions: [{ id: 'c1', field: 'consent_subscribed', value: 'yes' }],
  steps: [{ id: 's1', kind: 'action', action: 'ai_draft', value: 'A warm note inviting {first_name} back after {days} days. Mention their last purchase ({last_item}) if there is one. No discounts unless I add one.' }],
  marketing: true
},
{
  id: 'sub-welcome',
  name: 'Welcome new members',
  description: 'A welcome message as soon as someone subscribes or starts a free trial.',
  group: 'subscriptions',
  needs: 'Subscriptions (Pro)',
  trigger: 'sub_started',
  conditions: [],
  steps: [
  { id: 's1', kind: 'action', action: 'send_whatsapp', value: 'Welcome to {plan}, {first_name}! You can manage your membership any time from the link on your receipt.' },
  { id: 's2', kind: 'action', action: 'add_tag', value: 'Member' }],

  marketing: false
},
{
  id: 'sub-failed',
  name: 'Rescue failed payments',
  description: 'Tells the subscriber their payment didn’t go through and lets you know, before retries run out.',
  group: 'subscriptions',
  needs: 'Subscriptions (Pro)',
  trigger: 'sub_failed',
  conditions: [],
  steps: [
  { id: 's1', kind: 'action', action: 'send_whatsapp', value: 'Hi {first_name}, your {plan} payment didn’t go through. We’ll try again soon — you can update your card from the link on your last receipt.' },
  { id: 's2', kind: 'action', action: 'notify_owner', value: '{name}’s {plan} payment failed' }],

  marketing: false
},
{
  id: 'sub-cancelled',
  name: 'Learn why members leave',
  description: 'Tags former members and creates a task to ask what would bring them back.',
  group: 'subscriptions',
  needs: 'Subscriptions (Pro)',
  trigger: 'sub_cancelled',
  conditions: [],
  steps: [
  { id: 's1', kind: 'action', action: 'add_tag', value: 'Former member' },
  { id: 's2', kind: 'action', action: 'create_task', value: 'Ask {first_name} why they left {plan}' }],

  marketing: false
},
{
  id: 'balance-due',
  name: 'Remind about balances due',
  description: 'A polite reminder when a booking balance, quote stage or made-to-order balance falls due.',
  group: 'subscriptions',
  trigger: 'stage_due',
  conditions: [],
  steps: [{ id: 's1', kind: 'action', action: 'send_whatsapp', value: 'Hi {first_name}, a quick reminder that your balance of {total} is now due. Thank you!' }],
  marketing: false
},
{
  id: 'campaign-live',
  name: 'Share campaigns when they go live',
  description: 'Lets you know the moment a campaign space opens, with the link to share.',
  group: 'operations',
  trigger: 'campaign_started',
  conditions: [],
  steps: [{ id: 's1', kind: 'action', action: 'notify_owner', value: '“{campaign}” is live — share it: {link}' }],
  marketing: false
},
{
  id: 'campaign-results',
  name: 'Campaign results report',
  description: 'When a campaign ends, sends you its results in your notifications.',
  group: 'operations',
  trigger: 'campaign_ended',
  conditions: [],
  steps: [{ id: 's1', kind: 'action', action: 'send_report', value: 'Campaign results' }],
  marketing: false
}];