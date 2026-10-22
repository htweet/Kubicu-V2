export interface PlannedModule {
  slug: string;
  title: string;
  batch: number;
  phase: 'Commerce-ready release' | 'Later phase' | 'MVP';
  summary: string;
  capabilities: string[];
  guardrail: string;
}

export const plannedModules: PlannedModule[] = [
{
  slug: 'commerce',
  title: 'Commerce',
  batch: 4,
  phase: 'Commerce-ready release',
  summary: 'Sell physical and digital products from your page, with orders you can actually fulfil.',
  capabilities: [
  'Products with variants, stock and photos',
  'Orders, receipts and fulfilment status',
  'Delivery zones, fees and studio pickup',
  'Refunds and disputes with a clear timeline',
  'Fees shown separately: provider, KUBICU, net'],

  guardrail: 'Payments run through a licensed provider. KUBICU never holds your money.'
},
{
  slug: 'bookings',
  title: 'Bookings',
  batch: 4,
  phase: 'Commerce-ready release',
  summary: 'Let customers book services, fittings and sessions without the back-and-forth.',
  capabilities: [
  'Services with duration, price and location',
  'Availability rules, buffers and limits',
  'Deposits where your provider supports them',
  'Reschedule and cancellation policies',
  'Reminders in the customer’s timezone'],

  guardrail: 'Timezone, fees and cancellation rules are always shown before a customer confirms.'
},
{
  slug: 'audience',
  title: 'Audience',
  batch: 4,
  phase: 'Commerce-ready release',
  summary: 'One lightweight CRM for every lead, subscriber and customer your page brings in.',
  capabilities: [
  'Contacts with source and consent history',
  'Notes, tags and follow-up tasks',
  'Form submissions and newsletter subscribers',
  'Duplicate review and CSV export'],

  guardrail: 'Unsubscribed contacts are suppressed. No bulk messaging around consent.'
},
{
  slug: 'automations',
  title: 'Automations',
  batch: 4,
  phase: 'Later phase',
  summary: 'Readable workflows that follow up, remind and recover sales while you work.',
  capabilities: [
  'Trigger → condition → action → outcome',
  'Recipes: booking reminders, abandoned checkout',
  'Test runs before anything goes live',
  'Run history with failures and retries'],

  guardrail: 'AI-drafted workflows are previewed and approved before they run.'
},
{
  slug: 'analytics',
  title: 'Analytics',
  batch: 5,
  phase: 'MVP',
  summary: 'See which links, products and campaigns turn visitors into customers.',
  capabilities: [
  'Views, clicks and sources with definitions',
  'QR and campaign attribution',
  'Product, booking and lead funnels',
  'Link Intelligence suggestions with evidence'],

  guardrail: 'No fabricated precision. Estimates are labelled, and lift is only claimed from real experiments.'
},
{
  slug: 'domains',
  title: 'Domains & QR',
  batch: 5,
  phase: 'MVP',
  summary: 'Put your page on your own domain and print QR codes you can redirect later.',
  capabilities: [
  'Guided custom-domain connection',
  'DNS instructions and live verification status',
  'Certificate readiness before anything says “live”',
  'Dynamic QR codes for packaging and counters'],

  guardrail: 'A domain is never shown as live until verification and SSL both pass.'
},
{
  slug: 'extensions',
  title: 'Extensions',
  batch: 6,
  phase: 'Later phase',
  summary: 'Add blocks, themes, integrations and business kits from a reviewed marketplace.',
  capabilities: [
  'Permissions shown before you install',
  'Compatibility and version details',
  'Safe rollback and uninstall',
  'Publisher profiles and moderated reviews'],

  guardrail: 'Extensions never get blanket access to your customers’ data.'
},
{
  slug: 'settings',
  title: 'Settings',
  batch: 6,
  phase: 'MVP',
  summary: 'Your workspace, team, billing, security and data — in one place.',
  capabilities: [
  'Team members, roles and invitations',
  'Plan, usage and invoices',
  'Sessions and two-factor sign-in',
  'Export everything or delete your account'],

  guardrail: 'Cancelling or downgrading never silently deletes your data.'
}];