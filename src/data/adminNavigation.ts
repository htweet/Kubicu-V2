import type { LucideIcon } from 'lucide-react';
import {
  ActivityIcon,
  BadgeDollarSignIcon,
  BarChart3Icon,
  BellIcon,
  BotIcon,
  BuildingIcon,
  CreditCardIcon,
  FileLockIcon,
  FlagIcon,
  GavelIcon,
  HandshakeIcon,
  GlobeIcon,
  LifeBuoyIcon,
  PackageIcon,
  ReceiptIcon,
  ScrollTextIcon,
  ServerCogIcon,
  ShieldAlertIcon,
  SlidersHorizontalIcon,
  ScaleIcon,
  SwatchBookIcon,
  UserCogIcon,
} from 'lucide-react';

export interface AdminNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  /** What the area will let staff do — shown on its planned screen. */
  summary: string;
  built?: boolean;
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

/** Super-admin areas from the design plan §5.2. Only Design system is built in this pass. */
export const adminNav: AdminNavGroup[] = [
  {
    label: 'Platform',
    items: [
      { id: 'overview', label: 'Operations overview', icon: ActivityIcon, summary: 'Platform health, queues, alerts and recent privileged actions in one place.', built: true },
      { id: 'tenants', label: 'Users & tenants', icon: BuildingIcon, summary: 'Find a workspace, see its lifecycle, members, pages and limits, and suspend or restore with a reason.', built: true },
      { id: 'pages', label: 'Pages & domains', icon: GlobeIcon, summary: 'Review published pages and connected domains, and act on risky links.', built: true },
      { id: 'design-system', label: 'Design system', icon: SwatchBookIcon, summary: 'Control which appearances workspaces can use, and inspect tokens and components.', built: true },
    ],
  },
  {
    label: 'Commercial',
    items: [
      { id: 'plans', label: 'Plans & entitlements', icon: BadgeDollarSignIcon, summary: 'Plan catalogue, feature matrix, trials, credits and entitlement overrides with reasons.', built: true },
      { id: 'figures', label: 'Figures & names', icon: SlidersHorizontalIcon, summary: 'Fees, prices, limits, time windows and plan names operations can change without a release.', built: true },
      { id: 'flags', label: 'Feature flags', icon: FlagIcon, summary: 'Target releases by plan, cohort or percentage, with a kill switch and full history.', built: true },
      { id: 'modules', label: 'Modules & marketplace', icon: PackageIcon, summary: 'Review creator templates and extension listings before they’re sold.', built: true },
      { id: 'payments', label: 'Payments & providers', icon: CreditCardIcon, summary: 'Payout queue, wallet freezes, identity reviews and provider health. Never shows secrets.', built: true },
      { id: 'escrow', label: 'Escrow cases', icon: GavelIcon, summary: 'Buyer-protection disputes passed to KUBICU: review both sides and decide release, refund or split.', built: true },
      { id: 'sponsorships', label: 'Sponsorships', icon: HandshakeIcon, summary: 'Check new creator sponsorship briefs before they go live, and decide problems reported on deals.', built: true },
      { id: 'orders', label: 'Orders & disputes', icon: ReceiptIcon, summary: 'Support sellers with refunds and disputes, with notes and an audit trail.', built: true },
    ],
  },
  {
    label: 'Trust & support',
    items: [
      { id: 'ai', label: 'AI operations', icon: BotIcon, summary: 'Providers, budgets, rate limits and failure rates, without exposing private content.', built: true },
      { id: 'moderation', label: 'Moderation & trust', icon: ShieldAlertIcon, summary: 'Abuse reports, evidence, proportionate actions and appeals with human review.', built: true },
      { id: 'appeals', label: 'Appeals', icon: ScaleIcon, summary: 'Owners asking us to reconsider a takedown or suspension, decided by a second person.', built: true },
      { id: 'support', label: 'Support & announcements', icon: LifeBuoyIcon, summary: 'Tickets, internal notes, knowledge base and platform announcements.', built: true },
      { id: 'reporting', label: 'Business reporting', icon: BarChart3Icon, summary: 'Growth, revenue and usage reports with clear definitions.', built: true },
      { id: 'notifications', label: 'Integrations & notifications', icon: BellIcon, summary: 'Notification channels, the event catalogue and extension versions in use.', built: true },
    ],
  },
  {
    label: 'Governance',
    items: [
      { id: 'staff', label: 'Staff & access', icon: UserCogIcon, summary: 'Staff accounts, roles, two-step sign-in and access reviews.', built: true },
      { id: 'audit', label: 'Audit log', icon: ScrollTextIcon, summary: 'Every privileged action with who, when and why.', built: true },
      { id: 'data-requests', label: 'Data requests', icon: FileLockIcon, summary: 'Export and deletion requests with status and deadlines.', built: true },
      { id: 'settings', label: 'Localisation & policies', icon: SlidersHorizontalIcon, summary: 'Currencies, locales and policy versions.', built: true },
      { id: 'health', label: 'Security & health', icon: ServerCogIcon, summary: 'Incidents, backups, runbooks, alert rules and the status page.', built: true },
    ],
  },
];

export const adminNavItems = adminNav.flatMap((g) => g.items);
