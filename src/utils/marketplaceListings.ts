import type { LucideIcon } from 'lucide-react';
import type { ExtensionInfo, ModuleConnection } from '../types/marketplace';
import type { WorkspacePlan } from '../types/plan';
import type { ExamplePage } from '../data/examples';
import type { SignatureTheme } from '../data/signatureThemes';
import type { Recipe } from '../data/automationRecipes';
import type { BusinessKit } from '../types/kit';
import type { SectionPreset } from '../data/sectionPresets';
import { extensions, extensionCategories } from '../data/extensions';
import { examplePages } from '../data/examples';
import { signatureThemes, themeMoodLabels } from '../data/signatureThemes';
import { recipes, recipeGroups } from '../data/automationRecipes';
import { businessKits } from '../data/businessKits';
import { sectionPresets } from '../data/sectionPresets';
import { blockCatalog } from '../data/blockCatalog';
import { libraryCategories } from '../data/blockTaxonomy';
import { templatePrice } from '../data/templateMarket';
import { listingKindById, marketplaceSynonyms, type ListingKind } from '../data/marketplaceKinds';
import { plans } from '../data/plans';
import { formatNgn } from './format';

/*
 * One shape for everything the public Marketplace lists (D268). Built from the same catalogues the app
 * uses — extensions, templates, themes, block catalogue, section presets, recipes and kits — so a listing
 * can never describe something the product doesn't have.
 */

export type ListingStatus = 'available' | 'preview' | 'planned';

export interface Listing {
  slug: string;
  kind: ListingKind;
  title: string;
  summary: string;
  description: string;
  publisher: string;
  verified: 'kubicu' | 'partner' | 'community';
  /** Sub-group inside its kind, e.g. "Marketing" or "Dark luxury". */
  group: string;
  icon: LucideIcon;
  priceNgn: number;
  priceLabel: string;
  minPlan: WorkspacePlan;
  status: ListingStatus;
  /** What you get, as short lines. */
  inside: string[];
  /** What it can read or change. Empty for design assets that touch nothing but the page. */
  permissions: string[];
  /** Data it reads, in plain words. */
  dataAccess: string[];
  worksWith: ModuleConnection[];
  limitations: string[];
  version?: string;
  versions?: {version: string;date: string;notes: string;}[];
  /** Newest change, for "Newly added" sorting. */
  updated: string;
  /** Where to act on it inside the product. */
  action: {label: string;to: string;};
  /** Words search matches against. */
  keywords: string;
  ext?: ExtensionInfo;
  example?: ExamplePage;
  theme?: SignatureTheme;
  recipe?: Recipe;
  kit?: BusinessKit;
  section?: SectionPreset;
}

const LAUNCH = '2026-10-23';

function priceLabel(ngn: number, kind: ListingKind, minPlan: WorkspacePlan): string {
  if (ngn > 0) return kind === 'apps' ? `${formatNgn(ngn)}/month` : `${formatNgn(ngn)} once`;
  return minPlan === 'free' ? 'Free' : `Included in ${plans[minPlan].name}`;
}

function fromExtension(e: ExtensionInfo): Listing {
  const kind = listingKindById.apps;
  const status: ListingStatus = e.preview ? 'preview' : 'available';
  return {
    slug: e.id,
    kind: 'apps',
    title: e.name,
    summary: e.summary,
    description: e.description,
    publisher: e.publisher,
    verified: e.verified,
    group: extensionCategories[e.category],
    icon: kind.icon,
    priceNgn: e.priceNgn,
    priceLabel: priceLabel(e.priceNgn, 'apps', e.minPlan),
    minPlan: e.minPlan,
    status,
    inside: e.adds,
    permissions: e.permissions,
    dataAccess: e.permissions.filter((p) => /read|see|count|sync|send|copy|match|record|save/i.test(p)),
    worksWith: e.worksWith ?? [],
    limitations: [
    ...(e.preview ? ['Preview only in this version: it shows what it would do, and nothing is sent to an outside service.'] : []),
    `If you uninstall: ${e.uninstallNote}`],

    version: e.version,
    versions: e.versions,
    updated: e.versions[0]?.date ?? LAUNCH,
    action: { label: 'Install', to: `/app/extensions?ext=${e.id}` },
    keywords: [e.name, e.summary, e.description, extensionCategories[e.category], ...e.adds].join(' '),
    ext: e
  };
}

function fromTemplate(e: ExamplePage): Listing {
  const price = templatePrice(e.id);
  const kind = e.elite ? 'Elite' : e.artwork ? 'Artwork' : 'Starter';
  return {
    slug: `template-${e.id}`,
    kind: 'templates',
    title: e.name,
    summary: e.bestFor,
    description: e.description,
    publisher: 'KUBICU',
    verified: 'kubicu',
    group: `${kind} · ${e.category}`,
    icon: listingKindById.templates.icon,
    priceNgn: price,
    priceLabel: priceLabel(price, 'templates', 'free'),
    minPlan: 'free',
    status: 'available',
    inside: e.elite?.inside ?? e.doc.blocks.filter((b) => !b.parentId).slice(0, 8).map((b) => b.slotLabel ?? b.type),
    permissions: [],
    dataAccess: [],
    worksWith: [],
    limitations: [
    'Sample names, photos and figures are illustrative and are removed when you use it.',
    ...(e.elite?.goodToKnow ?? []),
    ...(price > 0 ? ['Bought once per workspace (test mode).'] : [])],

    updated: LAUNCH,
    action: { label: 'Preview template', to: `/templates/${e.id}` },
    keywords: [e.name, e.category, e.bestFor, e.description, e.city, kind].join(' '),
    example: e
  };
}

function fromTheme(t: SignatureTheme): Listing {
  const modes = Object.keys(t.modes).length > 1 ? 'Light and dark versions' : t.defaultMode === 'dark' ? 'Dark' : 'Light';
  return {
    slug: `theme-${t.id}`,
    kind: 'themes',
    title: t.name,
    summary: t.personality,
    description: `${t.personality} Changes colours, page background, surfaces, buttons and type on any template — blocks and their order never move.`,
    publisher: 'KUBICU',
    verified: 'kubicu',
    group: themeMoodLabels[t.mood],
    icon: listingKindById.themes.icon,
    priceNgn: 0,
    priceLabel: t.free ? 'Free' : 'Included in Creator',
    minPlan: t.free ? 'free' : 'creator',
    status: 'available',
    inside: [modes, 'Colour, surface and button styles', 'Heading and body type pairing', 'Readability checked against its own backgrounds'],
    permissions: [],
    dataAccess: [],
    worksWith: [],
    limitations: ['Glass and blur switch to solid surfaces for visitors who ask for less transparency, and in low-data mode.', 'Preview on any plan; using it needs Creator or above.'],
    updated: LAUNCH,
    action: { label: 'Try on a page', to: `/templates?tab=themes` },
    keywords: [t.name, t.personality, themeMoodLabels[t.mood], 'theme colour color'].join(' '),
    theme: t
  };
}

function fromSection(s: SectionPreset): Listing {
  return {
    slug: `section-${s.id}`,
    kind: 'blocks',
    title: s.name,
    summary: s.description,
    description: `${s.description} Inserted as normal, editable blocks: ${s.shape}. Anything that only you know is left as a marked gap, so the page can’t go live claiming something untrue.`,
    publisher: 'KUBICU',
    verified: 'kubicu',
    group: `Section pack · ${s.group}`,
    icon: listingKindById.blocks.icon,
    priceNgn: 0,
    priceLabel: 'Free',
    minPlan: 'free',
    status: 'available',
    inside: s.shape.split('·').map((x) => x.trim()),
    permissions: [],
    dataAccess: [],
    worksWith: [{ module: 'pages', how: 'Added to the page you’re editing in the canvas' }],
    limitations: ['Gaps like “[Add your price]” must be filled before you can publish.'],
    updated: LAUNCH,
    action: { label: 'Use in canvas', to: '/app/canvas' },
    keywords: [s.name, s.description, s.shape, s.group].join(' '),
    section: s
  };
}

function blockPacks(): Listing[] {
  return libraryCategories.map((c) => {
    const entries = blockCatalog.filter((b) => b.category === c.id && (b.kind === 'block' || b.kind === 'look'));
    return {
      slug: `blocks-${c.id}`,
      kind: 'blocks' as const,
      title: `${c.label} blocks`,
      summary: c.description,
      description: `${entries.length} blocks and ready-made looks for the canvas: ${entries.map((e) => e.name).join(', ')}.`,
      publisher: 'KUBICU',
      verified: 'kubicu' as const,
      group: 'Block pack',
      icon: c.icon,
      priceNgn: 0,
      priceLabel: 'Built in',
      minPlan: 'free' as WorkspacePlan,
      status: 'available' as const,
      inside: entries.map((e) => e.name),
      permissions: [],
      dataAccess: [],
      worksWith: [{ module: 'pages' as const, how: 'In the canvas block library, under this category' }],
      limitations: entries.filter((e) => e.note).slice(0, 3).map((e) => `${e.name}: ${e.note}`),
      updated: LAUNCH,
      action: { label: 'Open the canvas', to: '/app/canvas' },
      keywords: [c.label, c.description, ...entries.map((e) => e.name)].join(' ')
    };
  });
}

function fromRecipe(r: Recipe): Listing {
  const group = recipeGroups.find((g) => g.id === r.group)?.label ?? 'Automations';
  return {
    slug: `recipe-${r.id}`,
    kind: 'recipes',
    title: r.name,
    summary: r.description,
    description: `${r.description} Added to Automations as a draft — nothing runs until you switch it on.${r.marketing ? ' It sends marketing messages, so only contacts who subscribed receive them.' : ''}`,
    publisher: 'KUBICU',
    verified: 'kubicu',
    group,
    icon: listingKindById.recipes.icon,
    priceNgn: 0,
    priceLabel: 'Needs Automations',
    minPlan: 'free',
    status: 'available',
    inside: [`${r.steps.length} step${r.steps.length === 1 ? '' : 's'}`, ...(r.conditions.length ? [`${r.conditions.length} condition${r.conditions.length === 1 ? '' : 's'}`] : []), r.marketing ? 'Marketing — subscribers only' : 'Transactional'],
    permissions: ['Run on the event it watches', 'Send the messages written in its steps'],
    dataAccess: ['The contact or order that started it'],
    worksWith: [
    { module: 'automations', how: 'Added as a draft automation' },
    { module: r.group === 'bookings' ? 'bookings' : r.group === 'audience' ? 'audience' : 'orders', how: 'Watches events from here' }],

    limitations: [...(r.needs ? [`Needs: ${r.needs}`] : []), 'WhatsApp and email steps are previews until a messaging partner is connected.'],
    updated: LAUNCH,
    action: { label: 'Add as draft', to: `/app/automations?recipe=${r.id}` },
    keywords: [r.name, r.description, group, 'automation workflow'].join(' '),
    recipe: r
  };
}

function fromKit(k: BusinessKit): Listing {
  return {
    slug: `kit-${k.id}`,
    kind: 'kits',
    title: k.name,
    summary: k.forWho,
    description: k.summary,
    publisher: 'KUBICU',
    verified: 'kubicu',
    group: 'Industry kit',
    icon: k.icon,
    priceNgn: 0,
    priceLabel: 'Free',
    minPlan: 'free',
    status: 'available',
    inside: [
    'A matching page layout',
    ...(k.products.length ? [`${k.products.length} starter products (no prices)`] : []),
    ...(k.services.length ? [`${k.services.length} starter services (switched off)`] : []),
    'Draft policies to review',
    ...(k.recipes.length ? [`${k.recipes.length} automations as drafts`] : []),
    ...(k.apps.length ? [`Free apps: ${k.apps.join(', ')}`] : [])],

    permissions: ['Add a page draft, products, services, policies and automations — each one listed before you apply'],
    dataAccess: [],
    worksWith: [
    { module: 'pages', how: 'Sets up the page layout' },
    ...(k.products.length ? [{ module: 'products' as const, how: 'Adds starter products as drafts' }] : []),
    ...(k.services.length ? [{ module: 'bookings' as const, how: 'Adds starter services, switched off' }] : []),
    ...(k.recipes.length ? [{ module: 'automations' as const, how: 'Adds automations as drafts' }] : [])],

    limitations: ['Kits never invent facts: no prices, and policies are drafts that need your review.', 'Applying can be undone from the kit’s card.'],
    updated: LAUNCH,
    action: { label: 'Apply in workspace', to: '/app/templates?tab=kits' },
    keywords: [k.name, k.forWho, k.summary, 'kit business in a box'].join(' '),
    kit: k
  };
}

function plannedAi(): Listing[] {
  return blockCatalog.
  filter((b) => b.kind === 'planned').
  map((b) => ({
    slug: `ai-${b.n}`,
    kind: 'ai' as const,
    title: b.name,
    summary: b.note ?? 'Planned',
    description: `${b.name} is planned and can’t be installed yet. ${b.note ?? ''} When it arrives it will name the provider it uses and exactly what it sends there.`,
    publisher: 'KUBICU',
    verified: 'kubicu' as const,
    group: 'Planned',
    icon: listingKindById.ai.icon,
    priceNgn: 0,
    priceLabel: 'Not available yet',
    minPlan: 'free' as WorkspacePlan,
    status: 'planned' as const,
    inside: [],
    permissions: [],
    dataAccess: [],
    worksWith: [],
    limitations: ['Not available in any plan yet.'],
    updated: LAUNCH,
    action: { label: 'See the roadmap', to: '/about/roadmap' },
    keywords: [b.name, b.note ?? '', 'ai planned'].join(' ')
  }));
}

let cache: Listing[] | null = null;

export function allListings(): Listing[] {
  if (cache) return cache;
  cache = [
  ...extensions.filter((e) => !e.retired).map(fromExtension),
  ...examplePages.map(fromTemplate),
  ...signatureThemes.map(fromTheme),
  ...blockPacks(),
  ...sectionPresets.map(fromSection),
  ...recipes.map(fromRecipe),
  ...businessKits.map(fromKit),
  ...plannedAi()];

  return cache;
}

export function findListingBySlug(slug: string): Listing | undefined {
  return allListings().find((l) => l.slug === slug);
}

/** Search with everyday synonyms ("appointment" finds Bookings). Every word must match. */
export function searchListings(list: Listing[], query: string): Listing[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return list;
  return list.filter((l) => {
    const hay = `${l.title} ${l.keywords} ${l.group}`.toLowerCase();
    return words.every((w) => hay.includes(w) || (marketplaceSynonyms[w] ?? []).some((s) => hay.includes(s)));
  });
}

export type ListingSort = 'relevant' | 'newest' | 'price';

/** "Relevant" keeps KUBICU's curated order; there's no popularity sort because there's no real usage data yet. */
export function sortListings(list: Listing[], sort: ListingSort): Listing[] {
  if (sort === 'newest') return [...list].sort((a, b) => b.updated.localeCompare(a.updated));
  if (sort === 'price') return [...list].sort((a, b) => a.priceNgn - b.priceNgn);
  return list;
}

export function relatedListings(l: Listing, n = 3): Listing[] {
  return allListings().
  filter((o) => o.slug !== l.slug && o.kind === l.kind && o.status !== 'planned').
  sort((a, b) => Number(b.group === l.group) - Number(a.group === l.group)).
  slice(0, n);
}