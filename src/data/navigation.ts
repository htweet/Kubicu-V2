import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboardIcon,
  LayersIcon,
  PenToolIcon,
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
  TruckIcon } from
'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  to: string;
  icon: LucideIcon;
  group: 'build' | 'business';
  /** Planned batch — shown as “Soon” until it ships. */
  batch?: number;
  /** Extension id that must be installed (and not paused) for this screen to show (D87). */
  appId?: string;
}

/** `/app/canvas` resolves to the current workspace's page. */
export const workspaceNav: NavItem[] = [
{ id: 'overview', label: 'Overview', to: '/app', icon: LayoutDashboardIcon, group: 'build' },
{ id: 'spaces', label: 'My Spaces', to: '/app/spaces', icon: LayersIcon, group: 'build' },
{ id: 'canvas', label: 'Canvas', to: '/app/canvas', icon: PenToolIcon, group: 'build' },
{ id: 'media', label: 'Media', to: '/app/media', icon: ImagesIcon, group: 'build' },
{ id: 'templates', label: 'Templates', to: '/app/templates', icon: LayoutTemplateIcon, group: 'build' },
{ id: 'opportunities', label: 'Opportunities', to: '/app/opportunities', icon: HandCoinsIcon, group: 'business', appId: 'opportunities' },
{ id: 'commerce', label: 'Commerce', to: '/app/commerce', icon: ShoppingBagIcon, group: 'business' },
{ id: 'deliveries', label: 'Deliveries', to: '/app/deliveries', icon: TruckIcon, group: 'business', appId: 'local-fulfilment' },
{ id: 'bookings', label: 'Bookings', to: '/app/bookings', icon: CalendarIcon, group: 'business', appId: 'bookings' },
{ id: 'services', label: 'Quotes & jobs', to: '/app/services', icon: BriefcaseIcon, group: 'business', appId: 'service-os' },
{ id: 'proof', label: 'Proof of work', to: '/app/proof', icon: BadgeCheckIcon, group: 'business', appId: 'proof' },
{ id: 'audience', label: 'Audience', to: '/app/audience', icon: UsersIcon, group: 'business' },
{ id: 'forms', label: 'Forms', to: '/app/forms', icon: ClipboardListIcon, group: 'business', appId: 'forms' },
{ id: 'automations', label: 'Automations', to: '/app/automations', icon: WorkflowIcon, group: 'business', appId: 'automations' },
{ id: 'analytics', label: 'Analytics', to: '/app/analytics', icon: BarChart3Icon, group: 'business' },
{ id: 'intentflow', label: 'IntentFlow', to: '/app/intentflow', icon: SplitIcon, group: 'business', appId: 'intentflow' },
{ id: 'domains', label: 'Domains & QR', to: '/app/domains', icon: GlobeIcon, group: 'business', appId: 'domains' },
{ id: 'extensions', label: 'Extensions', to: '/app/extensions', icon: PuzzleIcon, group: 'business' },
{ id: 'settings', label: 'Settings', to: '/app/settings', icon: SettingsIcon, group: 'business' }];


export const mobilePrimaryNavIds = ['overview', 'spaces', 'canvas'];

/** Old top-level addresses that now live under /app. */
export const legacyModuleIds = workspaceNav.filter((n) => n.group === 'business').map((n) => n.id);