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
  versions: {version: string;date: string;notes: string;}[];
  reviews: {name: string;business: string;rating: number;text: string;}[];
  staffPick?: boolean;
  setup?: ExtensionSetupField[];
  /** Preview only: shows what it would do; nothing external happens. */
  preview?: boolean;
  /** What stays when it's uninstalled. */
  uninstallNote: string;
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