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
  HandCoinsIcon } from
'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  to: string;
  icon: LucideIcon;
  group: 'build' | 'business';
  /** Planned batch — shown as “Soon” until it ships. */
  batch?: number;
}

/** `/app/canvas` resolves to the current workspace's page. */
export const workspaceNav: NavItem[] = [
{ id: 'overview', label: 'Overview', to: '/app', icon: LayoutDashboardIcon, group: 'build' },
{ id: 'spaces', label: 'My Spaces', to: '/app/spaces', icon: LayersIcon, group: 'build' },
{ id: 'canvas', label: 'Canvas', to: '/app/canvas', icon: PenToolIcon, group: 'build' },
{ id: 'media', label: 'Media', to: '/app/media', icon: ImagesIcon, group: 'build' },
{ id: 'templates', label: 'Templates', to: '/app/templates', icon: LayoutTemplateIcon, group: 'build' },
{ id: 'opportunities', label: 'Opportunities', to: '/app/opportunities', icon: HandCoinsIcon, group: 'business' },
{ id: 'commerce', label: 'Commerce', to: '/app/commerce', icon: ShoppingBagIcon, group: 'business' },
{ id: 'bookings', label: 'Bookings', to: '/app/bookings', icon: CalendarIcon, group: 'business' },
{ id: 'audience', label: 'Audience', to: '/app/audience', icon: UsersIcon, group: 'business' },
{ id: 'forms', label: 'Forms', to: '/app/forms', icon: ClipboardListIcon, group: 'business' },
{ id: 'automations', label: 'Automations', to: '/app/automations', icon: WorkflowIcon, group: 'business' },
{ id: 'analytics', label: 'Analytics', to: '/app/analytics', icon: BarChart3Icon, group: 'business' },
{ id: 'intentflow', label: 'IntentFlow', to: '/app/intentflow', icon: SplitIcon, group: 'business' },
{ id: 'domains', label: 'Domains & QR', to: '/app/domains', icon: GlobeIcon, group: 'business' },
{ id: 'extensions', label: 'Extensions', to: '/app/extensions', icon: PuzzleIcon, group: 'business' },
{ id: 'settings', label: 'Settings', to: '/app/settings', icon: SettingsIcon, group: 'business' }];


export const mobilePrimaryNavIds = ['overview', 'spaces', 'canvas'];

/** Old top-level addresses that now live under /app. */
export const legacyModuleIds = workspaceNav.filter((n) => n.group === 'business').map((n) => n.id);