import type { LucideIcon } from 'lucide-react';
import { BlocksIcon, BriefcaseIcon, SparklesIcon as BrainCircuitIcon, LayoutTemplateIcon, PackageIcon, PaletteIcon, WorkflowIcon } from 'lucide-react';

/** The seven kinds of thing the public Marketplace lists (D268). */
export type ListingKind = 'apps' | 'templates' | 'themes' | 'blocks' | 'recipes' | 'kits' | 'ai';

export interface ListingKindInfo {
  id: ListingKind;
  label: string;
  /** One line under the label. */
  description: string;
  /** What this kind changes, in plain words — shown on every listing of the kind. */
  changes: string;
  icon: LucideIcon;
  tone: { bg: string; fg: string };
}

export const listingKinds: ListingKindInfo[] = [
  {
    id: 'apps',
    label: 'Apps & integrations',
    description: 'KUBICU apps, pixels, syncs and payment options.',
    changes: 'Adds screens or connections to your workspace. Each shows what it can read or change before you install.',
    icon: PackageIcon,
    tone: { bg: 'rgb(var(--kb-cobalt))', fg: '#ffffff' },
  },
  {
    id: 'templates',
    label: 'Templates',
    description: 'Whole-page layouts for every kind of business.',
    changes: 'Sets the structure of a page. Your theme and content can change afterwards.',
    icon: LayoutTemplateIcon,
    tone: { bg: 'rgb(var(--kb-pink))', fg: 'rgb(var(--kb-plum))' },
  },
  {
    id: 'themes',
    label: 'Themes',
    description: 'Colours, surfaces and type — the layout stays put.',
    changes: 'Changes only how a page looks. Blocks and their order never move.',
    icon: PaletteIcon,
    tone: { bg: 'rgb(var(--kb-plum))', fg: 'rgb(var(--kb-pink))' },
  },
  {
    id: 'blocks',
    label: 'Blocks & section packs',
    description: 'Single blocks and ready-made sections for the canvas.',
    changes: 'Adds editable blocks to a page. Nothing is published until you publish.',
    icon: BlocksIcon,
    tone: { bg: 'rgb(var(--kb-lime))', fg: 'rgb(var(--kb-forest))' },
  },
  {
    id: 'recipes',
    label: 'Automation recipes',
    description: 'Reviewed workflows that start as drafts.',
    changes: 'Adds an automation as a draft. Nothing runs until you switch it on.',
    icon: WorkflowIcon,
    tone: { bg: 'rgb(var(--kb-forest))', fg: 'rgb(var(--kb-lime))' },
  },
  {
    id: 'kits',
    label: 'Industry kits',
    description: 'A page, products or services, policies and automations for one trade.',
    changes: 'Adds drafts you review: starter products with no prices, draft policies and automations that are off.',
    icon: BriefcaseIcon,
    tone: { bg: 'rgb(var(--kb-peach))', fg: 'rgb(var(--kb-clay))' },
  },
  {
    id: 'ai',
    label: 'AI workflow packs',
    description: 'Planned: structured AI workflows with their providers disclosed.',
    changes: 'Not available yet. Each will name the AI provider it uses and what it sends there.',
    icon: BrainCircuitIcon,
    tone: { bg: 'rgb(var(--kb-sky))', fg: 'rgb(var(--kb-cobalt))' },
  },
];

export const listingKindById = Object.fromEntries(listingKinds.map((k) => [k.id, k])) as Record<ListingKind, ListingKindInfo>;

/** Everyday words people type, mapped to listing text (D268). */
export const marketplaceSynonyms: Record<string, string[]> = {
  appointment: ['booking', 'bookings', 'schedule'],
  booking: ['bookings', 'appointment', 'schedule'],
  shop: ['store', 'products', 'selling', 'checkout'],
  store: ['shop', 'products', 'selling'],
  email: ['newsletter', 'mailchimp', 'brevo'],
  newsletter: ['email', 'subscribe'],
  ads: ['pixel', 'tiktok', 'meta', 'google'],
  tracking: ['pixel', 'analytics', 'tag'],
  spreadsheet: ['sheets', 'google sheets', 'export'],
  accounting: ['quickbooks', 'zoho', 'vat'],
  photo: ['gallery', 'image', 'images'],
  colour: ['theme', 'themes'],
  color: ['theme', 'themes'],
  whatsapp: ['chat', 'message', 'catalogue'],
  delivery: ['fulfilment', 'courier'],
  pay: ['payment', 'transfer', 'checkout'],
};
