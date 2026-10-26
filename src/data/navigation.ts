import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboardIcon,
  LayersIcon,
  ShoppingBagIcon,
  CalendarIcon,
  UsersIcon,
  WorkflowIcon,
  BarChart3Icon,
  GlobeIcon,
  PuzzleIcon,
  SettingsIcon,
  ImagesIcon,
  SplitIcon,
  LayoutTemplateIcon,
  ClipboardListIcon,
  HandCoinsIcon,
  BriefcaseIcon,
  BadgeCheckIcon,
  TruckIcon,
  MessageCircleIcon,
  ShieldCheckIcon,
  SparklesIcon,
  HandshakeIcon,
  MicIcon,
  QrCodeIcon,
  PrinterIcon,
  Link2Icon } from
'lucide-react';

export type NavGroupId = 'studio' | 'business' | 'customers' | 'growth' | 'workspace';

/** Sidebar sections, in order (D117). Each opens and closes like an accordion. */
export const navGroups: {id: NavGroupId;label: string;}[] = [
{ id: 'studio', label: 'Studio' },
{ id: 'business', label: 'Business' },
{ id: 'customers', label: 'Customers' },
{ id: 'growth', label: 'Growth' },
{ id: 'workspace', label: 'Workspace' }];


export interface NavItem {
  id: string;
  label: string;
  to: string;
  icon: LucideIcon;
  group: NavGroupId;
  /** Planned batch — shown as “Soon” until it ships. */
  batch?: number;
  /** Extension id that must be installed (and not paused) for this screen to show (D87). */
  appId?: string;
}

/** The canvas isn't a sidebar item: open it from Overview or My Spaces (`/app/canvas` still resolves to the current page). */
export const workspaceNav: NavItem[] = [
// Studio — make and manage pages
{ id: 'overview', label: 'Overview', to: '/app', icon: LayoutDashboardIcon, group: 'studio' },
{ id: 'spaces', label: 'My Spaces', to: '/app/spaces', icon: LayersIcon, group: 'studio' },
{ id: 'media', label: 'Media', to: '/app/media', icon: ImagesIcon, group: 'studio' },
{ id: 'templates', label: 'Templates', to: '/app/templates', icon: LayoutTemplateIcon, group: 'studio' },
// Business — what you sell and deliver
{ id: 'commerce', label: 'Commerce', to: '/app/commerce', icon: ShoppingBagIcon, group: 'business' },
{ id: 'bookings', label: 'Bookings', to: '/app/bookings', icon: CalendarIcon, group: 'business', appId: 'bookings' },
{ id: 'services', label: 'Quotes & jobs', to: '/app/services', icon: BriefcaseIcon, group: 'business', appId: 'service-os' },
{ id: 'deliveries', label: 'Deliveries', to: '/app/deliveries', icon: TruckIcon, group: 'business', appId: 'local-fulfilment' },
{ id: 'voice', label: 'Voice-to-Store', to: '/app/voice', icon: MicIcon, group: 'business', appId: 'voice-to-store' },
{ id: 'proof', label: 'Proof of work', to: '/app/proof', icon: BadgeCheckIcon, group: 'business', appId: 'proof' },
{ id: 'analytics', label: 'Analytics', to: '/app/analytics', icon: BarChart3Icon, group: 'business' },
{ id: 'collabs', label: 'Collaborations', to: '/app/collabs', icon: HandshakeIcon, group: 'business', appId: 'collaborations' },
// Customers — people, conversations and follow-up
{ id: 'audience', label: 'Audience', to: '/app/audience', icon: UsersIcon, group: 'customers' },
{ id: 'whatsapp', label: 'WhatsApp', to: '/app/whatsapp', icon: MessageCircleIcon, group: 'customers', appId: 'whatsapp-catalogue' },
{ id: 'opportunities', label: 'Opportunities', to: '/app/opportunities', icon: HandCoinsIcon, group: 'customers', appId: 'opportunities' },
{ id: 'forms', label: 'Forms', to: '/app/forms', icon: ClipboardListIcon, group: 'customers', appId: 'forms' },
{ id: 'automations', label: 'Automations', to: '/app/automations', icon: WorkflowIcon, group: 'customers', appId: 'automations' },
// Growth — reach, insight and reputation
{ id: 'intentflow', label: 'IntentFlow', to: '/app/intentflow', icon: SplitIcon, group: 'growth', appId: 'intentflow' },
{ id: 'domains', label: 'Domains', to: '/app/domains', icon: GlobeIcon, group: 'growth', appId: 'domains' },
{ id: 'qr', label: 'QR codes', to: '/app/qr', icon: QrCodeIcon, group: 'growth', appId: 'domains' },
{ id: 'printkit', label: 'Print kit', to: '/app/print-kit', icon: PrinterIcon, group: 'growth', appId: 'domains' },
{ id: 'links', label: 'Campaign links', to: '/app/campaign-links', icon: Link2Icon, group: 'growth', appId: 'domains' },
{ id: 'trust', label: 'Trust Passport', to: '/app/trust', icon: ShieldCheckIcon, group: 'growth', appId: 'trust-passport' },
{ id: 'coach', label: 'Business Coach', to: '/app/coach', icon: SparklesIcon, group: 'growth', appId: 'ai-coach' },
// Workspace — tools and settings
{ id: 'extensions', label: 'Extensions', to: '/app/extensions', icon: PuzzleIcon, group: 'workspace' },
{ id: 'settings', label: 'Settings', to: '/app/settings', icon: SettingsIcon, group: 'workspace' }];


export const mobilePrimaryNavIds = ['overview', 'spaces', 'commerce'];

/** Old top-level addresses that now live under /app. */
export const legacyModuleIds = workspaceNav.filter((n) => n.group !== 'studio' && n.to === `/app/${n.id}`).map((n) => n.id);