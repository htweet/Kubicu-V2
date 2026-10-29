import type { LucideIcon } from 'lucide-react';
import { BarChart3Icon, CalendarCheckIcon, GlobeIcon, LayoutTemplateIcon, Link2Icon, ShoppingBagIcon, SparklesIcon, UsersIcon } from 'lucide-react';

/** Public /features index (D268). Status words match the roadmap: Ready, Needs a plan, Simulated. */
export type FeatureStatus = 'Ready' | 'Needs a plan' | 'Simulated';

export interface FeatureArea {
  id: string;
  title: string;
  lead: string;
  icon: LucideIcon;
  tone: {bg: string;fg: string;};
  items: {name: string;status: FeatureStatus;}[];
  more: {label: string;to: string;};
  /** Example page shown beside it. */
  example?: string;
}

export const featureAreas: FeatureArea[] = [
{
  id: 'canvas',
  title: 'Canvas website builder',
  lead: 'Build on a real canvas: about 80 blocks, 24 ready-made sections, columns and tabs, and a check that catches gaps before you publish.',
  icon: LayoutTemplateIcon,
  tone: { bg: 'rgb(var(--kb-cobalt))', fg: '#ffffff' },
  items: [
  { name: 'Blocks, sections, columns and tabs', status: 'Ready' },
  { name: 'Phone, tablet and computer preview', status: 'Ready' },
  { name: 'Version history and undo', status: 'Ready' },
  { name: 'Team approvals before publishing', status: 'Needs a plan' }],

  more: { label: 'Blocks & section packs', to: '/marketplace/categories/blocks' },
  example: 'elite-signature-creator'
},
{
  id: 'sites',
  title: 'Mini-websites and spaces',
  lead: 'Grow one link into a site with Shop, About and Book pages, and add separate spaces for campaigns, events, pop-ups and members.',
  icon: GlobeIcon,
  tone: { bg: 'rgb(var(--kb-sky))', fg: 'rgb(var(--kb-cobalt))' },
  items: [
  { name: 'More pages on your main space', status: 'Ready' },
  { name: 'Campaign, event, pop-up and members spaces', status: 'Ready' },
  { name: 'Your own domain', status: 'Needs a plan' },
  { name: 'Domain connection checks', status: 'Simulated' }],

  more: { label: 'Templates', to: '/templates' },
  example: 'studio-nnamdi'
},
{
  id: 'commerce',
  title: 'Store & digital products',
  lead: 'Products with stock and variants, downloads, courses, tickets, gift cards and subscriptions — with checkout by card, transfer or pay on delivery.',
  icon: ShoppingBagIcon,
  tone: { bg: 'rgb(var(--kb-peach))', fg: 'rgb(var(--kb-clay))' },
  items: [
  { name: 'Products, stock and delivery by area', status: 'Ready' },
  { name: 'Downloads, courses and tickets', status: 'Ready' },
  { name: 'Payment links and invoices', status: 'Ready' },
  { name: 'Real payments and payouts', status: 'Simulated' }],

  more: { label: 'For shops', to: '/for/shops' },
  example: 'adaeze-atelier'
},
{
  id: 'bookings',
  title: 'Services & bookings',
  lead: 'Services, availability, deposits and a schedule, plus quotes and jobs for work that isn’t a fixed slot.',
  icon: CalendarCheckIcon,
  tone: { bg: 'rgb(var(--kb-pink))', fg: 'rgb(var(--kb-plum))' },
  items: [
  { name: 'Bookings from your real free times', status: 'Ready' },
  { name: 'Deposits', status: 'Needs a plan' },
  { name: 'Quotes, jobs and invoices', status: 'Ready' },
  { name: 'Google Meet, Zoom and Teams links', status: 'Simulated' }],

  more: { label: 'For service businesses', to: '/for/services' },
  example: 'glow-by-halima'
},
{
  id: 'audience',
  title: 'Audience Manager',
  lead: 'Everyone who signs up, books, buys or enquires — with their source, consent, tags and segments.',
  icon: UsersIcon,
  tone: { bg: 'rgb(var(--kb-peach))', fg: 'rgb(var(--kb-clay))' },
  items: [
  { name: 'Contacts, tags, notes and follow-ups', status: 'Ready' },
  { name: 'Saved segments and sources', status: 'Ready' },
  { name: 'Import, export and duplicates', status: 'Ready' },
  { name: 'Email and WhatsApp sending', status: 'Simulated' }],

  more: { label: 'Audience Manager', to: '/features/audience-manager' }
},
{
  id: 'links',
  title: 'Short links & QR',
  lead: 'A short, trackable link and QR code for every post, poster and ad — with checks on where it goes.',
  icon: Link2Icon,
  tone: { bg: 'rgb(var(--kb-lime))', fg: 'rgb(var(--kb-forest))' },
  items: [
  { name: 'Links to your pages or any website', status: 'Ready' },
  { name: 'QR codes in your colours', status: 'Ready' },
  { name: 'Tags, pause and destination history', status: 'Ready' },
  { name: 'Phishing screening', status: 'Simulated' }],

  more: { label: 'Short links', to: '/tools/short-links' }
},
{
  id: 'analytics',
  title: 'Analytics & growth',
  lead: 'Visits, sources, devices, new and returning visitors, drop-off by step, and plain suggestions that show their evidence.',
  icon: BarChart3Icon,
  tone: { bg: 'rgb(var(--kb-forest))', fg: 'rgb(var(--kb-lime))' },
  items: [
  { name: 'Visits, sources and top links', status: 'Ready' },
  { name: 'Drop-off for shop, bookings and forms', status: 'Ready' },
  { name: 'Pages by visitor source (IntentFlow)', status: 'Needs a plan' },
  { name: 'Data from many devices', status: 'Simulated' }],

  more: { label: 'Analytics apps', to: '/marketplace/categories/apps?group=Analytics' }
},
{
  id: 'ai',
  title: 'AI Copilot',
  lead: 'Describe your business in a chat and get a draft page built from real blocks. It never invents prices, reviews or promises.',
  icon: SparklesIcon,
  tone: { bg: 'rgb(var(--kb-plum))', fg: 'rgb(var(--kb-pink))' },
  items: [
  { name: 'Chat to a draft page', status: 'Ready' },
  { name: 'Help on any block', status: 'Ready' },
  { name: 'A real AI model behind it', status: 'Simulated' }],

  more: { label: 'Copilot', to: '/copilot' }
}];