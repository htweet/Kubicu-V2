import type { LucideIcon } from 'lucide-react';
import type { ServiceLocation } from './ops';

/** Business-in-a-Box (D90): one starting setup that touches the page and the business tools together. */
export type KitPart = 'page' | 'products' | 'services' | 'policies' | 'automations' | 'apps';

export interface KitProduct {
  name: string;
  description: string;
  /** Defaults to a physical product (D126 adds digital kits). */
  kind?: 'physical' | 'digital';
}

export interface KitService {
  name: string;
  description: string;
  durationMin: number;
  location: ServiceLocation;
}

/** Draft wording only — the seller reviews it before it goes anywhere public. */
export interface KitPolicies {
  refunds: string;
  delivery: string;
  cancellation: string;
  /** Care, use or preparation instructions. Optional for kits saved before D90a. */
  instructions?: string;
  /** How-to guides: sizing, ordering, getting ready for an appointment. */
  guides?: string;
  disclaimer?: string;
  /** Free cancellation window applied to Bookings when the kit has services. */
  cancelHours?: number;
}

export interface BusinessKit {
  id: string;
  name: string;
  forWho: string;
  summary: string;
  icon: LucideIcon;
  /** Example page used as the page starter. */
  templateId: string;
  products: KitProduct[];
  services: KitService[];
  policies: KitPolicies;
  /** Automation recipe ids, added as drafts. */
  recipes: string[];
  /** Free KUBICU apps installed with the kit. */
  apps: string[];
}

/** What a kit actually added, so it can be listed and taken back out cleanly. */
export interface AppliedKit {
  kitId: string;
  appliedAt: string;
  parts: KitPart[];
  productIds: string[];
  serviceIds: string[];
  automationIds: string[];
  installedApps: string[];
  policies: KitPolicies | null;
  removedAt?: string;
}