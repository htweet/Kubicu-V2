import type { WorkspacePlan } from './plan';
import type { Block, PageTheme } from './page';

/** 'apps' = KUBICU's own workspace modules, off until installed so the sidebar stays lean (D87). */
export type ExtensionCategory = 'apps' | 'selling' | 'marketing' | 'analytics' | 'operations';

export interface ExtensionSetupField {
  id: string;
  label: string;
  placeholder: string;
  hint: string;
  /** Returns an error message, or undefined when valid. */
  pattern: RegExp;
  error: string;
}

/** Core KUBICU modules an extension can connect to (D231). */
export type CoreModule =
  | 'orders'
  | 'products'
  | 'checkout'
  | 'storefront'
  | 'paymentLinks'
  | 'reports'
  | 'wallet'
  | 'pages'
  | 'bookings'
  | 'audience'
  | 'automations'
  | 'analytics'
  | 'notifications'
  | 'forms'
  | 'campaignLinks'
  | 'quotes'
  | 'proof'
  | 'settings';

export interface ModuleConnection {
  module: CoreModule;
  /** What it does there, in a few words. */
  how: string;
}

/** A catalogue entry folded into a core feature (D231). */
export interface RetiredInfo {
  movedTo: string;
  href: string;
  note: string;
  /** Installed for the seller when they move, so nothing stops working. */
  installs?: string;
}

export interface ExtensionInfo {
  id: string;
  name: string;
  publisher: string;
  /** KUBICU-built, a reviewed partner (curated catalogue, D67), or a reviewed independent developer (D132). */
  verified: 'kubicu' | 'partner' | 'community';
  category: ExtensionCategory;
  summary: string;
  description: string;
  /** What it adds, shown as the "screenshot" panel. */
  adds: string[];
  permissions: string[];
  minPlan: WorkspacePlan;
  /** Monthly add-on price; 0 = free. */
  priceNgn: number;
  version: string;
  versions: { version: string; date: string; notes: string }[];
  reviews: { name: string; business: string; rating: number; text: string }[];
  staffPick?: boolean;
  setup?: ExtensionSetupField[];
  /** Preview only: shows what it would do; nothing external happens. */
  preview?: boolean;
  /** What stays when it's uninstalled. */
  uninstallNote: string;
  /** Core modules it genuinely connects to — at least two for KUBICU-listed extensions (D231). */
  worksWith?: ModuleConnection[];
  retired?: RetiredInfo;
}

export interface InstalledExtension {
  id: string;
  version: string;
  installedAt: string;
  paused: boolean;
  settings: Record<string, string>;
  /** Things it created, so uninstalling removes exactly those. */
  addedZoneIds?: string[];
  automationId?: string;
}

export interface MarketplaceData {
  installed: Record<string, InstalledExtension>;
  /** Premium templates bought for this workspace (licence per workspace). */
  templateLicences: string[];
  /** Retired extensions whose "now part of…" notice was shown (D231). */
  retiredNoticed?: string[];
}

/** A saved theme or section shared privately with another workspace (blueprint §21). */
export interface SharedLibraryItem {
  code: string;
  kind: 'theme' | 'section';
  name: string;
  theme?: PageTheme;
  blocks?: Block[];
  fromWorkspace: string;
  createdAt: string;
}
