import type { LucideIcon } from 'lucide-react';
import {
  BarChart3Icon,
  BlocksIcon,
  BookOpenIcon,
  BriefcaseIcon,
  CalendarCheckIcon,
  CodeIcon,
  GlobeIcon,
  GraduationCapIcon,
  HelpCircleIcon,
  LayoutTemplateIcon,
  Link2Icon,
  MegaphoneIcon,
  MessageCircleIcon,
  MicIcon,
  PackageIcon,
  PaletteIcon,
  PenToolIcon,
  PuzzleIcon,
  RocketIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  SparklesIcon,
  StoreIcon,
  TicketIcon,
  UserRoundIcon,
  UsersIcon,
  WorkflowIcon,
  WrenchIcon } from
'lucide-react';

/*
 * Public-site menu (D268): one schema drives the desktop mega menu, the phone menu and the footer.
 * Only marketing pages use it — the workspace keeps its own sidebar.
 */

export interface SiteMenuItem {
  title: string;
  /** One line, under ~60 characters. */
  description: string;
  to: string;
  icon: LucideIcon;
}

export interface SiteMenuColumn {
  heading: string;
  items: SiteMenuItem[];
}

export interface SiteMenuFeature {
  eyebrow: string;
  title: string;
  text: string;
  cta: {label: string;to: string;};
  /** Solid brand colour for the panel (CSS var name without rgb()). */
  tone: 'lime' | 'cobalt' | 'pink' | 'peach';
}

export interface SiteMenuGroup {
  id: string;
  label: string;
  columns: SiteMenuColumn[];
  feature: SiteMenuFeature;
  viewAll?: {label: string;to: string;};
}

export const siteMenu: SiteMenuGroup[] = [
{
  id: 'product',
  label: 'Product',
  columns: [
  {
    heading: 'Build',
    items: [
    { title: 'Canvas website builder', description: 'Compose a page from flexible, responsive blocks.', to: '/features#canvas', icon: LayoutTemplateIcon },
    { title: 'Creator pages', description: 'Your identity, content and opportunities together.', to: '/for/creators', icon: UserRoundIcon },
    { title: 'Mini-websites', description: 'Grow from one link into a site with more pages.', to: '/features#sites', icon: GlobeIcon },
    { title: 'AI Copilot', description: 'Start with a chat, continue in KUBICU.', to: '/copilot', icon: SparklesIcon }]

  },
  {
    heading: 'Sell & book',
    items: [
    { title: 'Store & digital products', description: 'Show and sell products, downloads and tickets.', to: '/features#commerce', icon: ShoppingBagIcon },
    { title: 'Services & bookings', description: 'Turn interest into enquiries and appointments.', to: '/features#bookings', icon: CalendarCheckIcon }]

  },
  {
    heading: 'Grow',
    items: [
    { title: 'Audience Manager', description: 'Collect, organise and understand your contacts.', to: '/features/audience-manager', icon: UsersIcon },
    { title: 'Short links & QR', description: 'Trackable links for every post, flyer and ad.', to: '/tools/short-links', icon: Link2Icon },
    { title: 'Analytics & growth', description: 'See which pages, links and campaigns work.', to: '/features#analytics', icon: BarChart3Icon }]

  }],

  feature: {
    eyebrow: 'New',
    title: 'Describe it. See it. Keep it.',
    text: 'Tell Copilot about your business in a chat and get a draft page you can edit.',
    cta: { label: 'Start with Copilot', to: '/copilot' },
    tone: 'lime'
  },
  viewAll: { label: 'All features', to: '/features' }
},
{
  id: 'solutions',
  label: 'Solutions',
  columns: [
  {
    heading: 'For people',
    items: [
    { title: 'Creators & influencers', description: 'Links, content, brand deals and fans.', to: '/for/creators', icon: UserRoundIcon },
    { title: 'Freelancers & portfolios', description: 'Show your work and win the next client.', to: '/for/freelancers', icon: PenToolIcon },
    { title: 'Artists, musicians & podcasters', description: 'Releases, episodes, shows and bookings.', to: '/for/artists', icon: MicIcon },
    { title: 'Educators & digital sellers', description: 'Courses, guides, downloads and classes.', to: '/for/educators', icon: GraduationCapIcon }]

  },
  {
    heading: 'For businesses',
    items: [
    { title: 'Shops & social sellers', description: 'Sell from WhatsApp, Instagram and TikTok.', to: '/for/shops', icon: StoreIcon },
    { title: 'Service businesses', description: 'Salons, repairs, consultants and studios.', to: '/for/services', icon: WrenchIcon },
    { title: 'Events & communities', description: 'Tickets, guest lists and members.', to: '/for/events', icon: TicketIcon },
    { title: 'Agencies & multi-brand teams', description: 'Many brands, one workspace, clear roles.', to: '/for/agencies', icon: BriefcaseIcon }]

  }],

  feature: {
    eyebrow: 'Ready-made',
    title: 'Business-in-a-Box kits',
    text: 'A page, products or services, policies and automations — set up together for your trade.',
    cta: { label: 'See industry kits', to: '/marketplace/categories/kits' },
    tone: 'peach'
  }
},
{
  id: 'marketplace',
  label: 'Marketplace',
  columns: [
  {
    heading: 'Add to KUBICU',
    items: [
    { title: 'Explore Marketplace', description: 'Everything you can add, in one place.', to: '/marketplace', icon: PuzzleIcon },
    { title: 'Apps & integrations', description: 'Pixels, syncs, payments and KUBICU apps.', to: '/marketplace/apps', icon: PackageIcon },
    { title: 'Automation recipes', description: 'Reviewed workflows you switch on in a tap.', to: '/marketplace/categories/recipes', icon: WorkflowIcon },
    { title: 'Industry kits', description: 'Everything a trade needs, set up together.', to: '/marketplace/categories/kits', icon: BriefcaseIcon }]

  },
  {
    heading: 'Design',
    items: [
    { title: 'Templates', description: 'Whole-page layouts for every kind of business.', to: '/marketplace/categories/templates', icon: LayoutTemplateIcon },
    { title: 'Themes', description: 'Colours, materials and type — layout untouched.', to: '/marketplace/categories/themes', icon: PaletteIcon },
    { title: 'Blocks & section packs', description: 'Single blocks and ready-made sections.', to: '/marketplace/categories/blocks', icon: BlocksIcon },
    { title: 'Developers', description: 'API keys, webhooks and building extensions.', to: '/developers', icon: CodeIcon }]

  }],

  feature: {
    eyebrow: 'Curated',
    title: 'Every extension connects to your business',
    text: 'Each one works with at least two parts of KUBICU — and shows exactly what it can read or change.',
    cta: { label: 'Explore Marketplace', to: '/marketplace' },
    tone: 'cobalt'
  }
},
{
  id: 'resources',
  label: 'Resources',
  columns: [
  {
    heading: 'Learn',
    items: [
    { title: 'Template inspiration', description: 'Real example pages you can start from.', to: '/templates', icon: LayoutTemplateIcon },
    { title: 'Guides & help centre', description: 'How-tos for pages, selling and bookings.', to: '/about/help', icon: BookOpenIcon },
    { title: 'Product updates', description: 'What’s ready, what’s next and what changed.', to: '/about/roadmap', icon: RocketIcon }]

  },
  {
    heading: 'Trust & support',
    items: [
    { title: 'Trust centre', description: 'Safety, takedowns and how we protect buyers.', to: '/about/trust', icon: ShieldCheckIcon },
    { title: 'Contact us', description: 'Talk to the KUBICU team.', to: '/about/contact', icon: MessageCircleIcon },
    { title: 'Questions & answers', description: 'Plans, payments, domains and data.', to: '/about/help#faq', icon: HelpCircleIcon }]

  }],

  feature: {
    eyebrow: 'Honest status',
    title: 'What’s ready and what’s coming',
    text: 'One table of every feature: available now, in testing or planned.',
    cta: { label: 'See the roadmap', to: '/about/roadmap' },
    tone: 'pink'
  }
}];


/** Plain links beside the menu triggers. */
export const siteMenuLinks = [{ label: 'Pricing', to: '/pricing' }];

/** Campaign-style links for the footer "Tools" column. */
export const siteMenuToolLinks: SiteMenuItem[] = [
{ title: 'Short links', description: '', to: '/tools/short-links', icon: Link2Icon },
{ title: 'Audience Manager', description: '', to: '/features/audience-manager', icon: UsersIcon },
{ title: 'Marketplace', description: '', to: '/marketplace', icon: PuzzleIcon },
{ title: 'Campaign pages', description: '', to: '/features#commerce', icon: MegaphoneIcon }];