import type { CommerceData, Product, ProductVariant, StorefrontSettings } from '../../types/commerce';
import type { PageDocument } from '../../types/page';
import type { WorkspacePlan } from '../../types/plan';
import { planAtLeast } from '../../data/plans';
import { CHECKOUT_PLAN } from './linkIssues';
import { canSell, isSoldOut, priceRange } from './catalog';
import { sitePages } from '../sitePages';

/** The storefront lives at /shop on a workspace's main page and pages (D53). */
export const STOREFRONT_PATH = 'shop';

export type StorefrontSort = 'featured' | 'newest' | 'price_asc' | 'price_desc';

export const sortLabels: Record<StorefrontSort, string> = {
  featured: 'Featured first',
  newest: 'Newest',
  price_asc: 'Price: low to high',
  price_desc: 'Price: high to low'
};

/** A page of the site already uses /shop, so the storefront steps aside instead of breaking it. */
export function shopPathTaken(doc: PageDocument): string | null {
  return sitePages(doc).find((p) => p.path === STOREFRONT_PATH)?.title ?? null;
}

export function storefrontAvailable(doc: PageDocument, data: CommerceData | null): boolean {
  return !!data?.storefront.enabled && !doc.campaign && !shopPathTaken(doc);
}

/** Ordering actually used: checkout falls back to WhatsApp below the Pro plan. */
export function storefrontOrdering(data: CommerceData, plan: WorkspacePlan): 'checkout' | 'whatsapp' {
  return data.storefront.ordering === 'checkout' && planAtLeast(plan, CHECKOUT_PLAN) ? 'checkout' : 'whatsapp';
}

export const MAX_FEATURED = 8;

export type StorefrontConfig = Required<StorefrontSettings>;

/** Storefront settings with every D98 option filled in, so older saved shops look exactly as before. */
export function storefrontConfig(s: StorefrontSettings): StorefrontConfig {
  return {
    announcement: '',
    bannerUrl: '',
    bannerAlt: '',
    columns: 4,
    imageShape: 'portrait',
    defaultSort: 'featured',
    featuredIds: [],
    showSearch: true,
    showCollections: true,
    showStockFilter: true,
    showLowStock: true,
    deliveryNote: '',
    returnsNote: '',
    seoTitle: '',
    seoDescription: '',
    // D196: Classic grid with today's behaviour, so older saved shops don't move.
    look: 'classic',
    header: 'banner',
    featuredStyle: 'none',
    collectionsStyle: 'chips',
    cardStyle: 'standard',
    productPage: 'side',
    stickyBuy: false,
    addMode: 'page',
    showSaleBadges: true,
    savedItems: false,
    recentlyViewed: false,
    relatedProducts: true,
    askWhatsApp: false,
    shareButtons: false,
    showReviews: false,
    ...s
  } as StorefrontConfig;
}

export const imageShapeClass: Record<StorefrontConfig['imageShape'], string> = {
  portrait: 'aspect-[4/5]',
  square: 'aspect-square',
  landscape: 'aspect-[4/3]'
};

export function shopProducts(data: CommerceData | null): Product[] {
  if (!data) return [];
  // Event tickets are sold from Event blocks, not the shop (D73).
  return data.products.filter((p) => p.status === 'active' && p.kind !== 'ticket' && (!data.storefront.hideSoldOut || !isSoldOut(p)));
}

export function sortProducts(list: Product[], sort: StorefrontSort, featuredIds: string[] = []): Product[] {
  const low = (p: Product) => priceRange(p)?.[0] ?? Number.POSITIVE_INFINITY;
  const copy = [...list];
  if (sort === 'newest') return copy.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  if (sort === 'price_asc') return copy.sort((a, b) => low(a) - low(b));
  if (sort === 'price_desc') return copy.sort((a, b) => (priceRange(b)?.[1] ?? -1) - (priceRange(a)?.[1] ?? -1));
  // Featured: pinned products in the seller's order, then in-stock first, then the order products were added.
  const pin = (p: Product) => {
    const i = featuredIds.indexOf(p.id);
    return i === -1 ? Number.POSITIVE_INFINITY : i;
  };
  return copy.sort((a, b) => pin(a) - pin(b) || Number(isSoldOut(a)) - Number(isSoldOut(b)));
}

function baseSlug(name: string): string {
  return name.
  toLowerCase().
  normalize('NFKD').
  replace(/[\u0300-\u036f]/g, '').
  replace(/[^a-z0-9]+/g, '-').
  replace(/^-+|-+$/g, '').
  slice(0, 60) || 'product';
}

/** Readable product address used on custom domains (D62): /shop/ankara-wrap-dress. Same names get a short suffix. */
export function productSlug(p: Product, all: Product[]): string {
  const base = baseSlug(p.name);
  const clash = all.some((o) => o.id !== p.id && o.status === 'active' && baseSlug(o.name) === base);
  return clash ? `${base}-${p.id.slice(-4).toLowerCase()}` : base;
}

/** An active product by id or readable address. */
export function findShopProduct(data: CommerceData | null, ref: string): Product | undefined {
  if (!data) return undefined;
  const active = data.products.filter((p) => p.status === 'active' && p.kind !== 'ticket');
  return active.find((p) => p.id === ref) ?? active.find((p) => productSlug(p, data.products) === ref);
}

/** The variant matching a set of chosen option values, if every option is chosen. */
export function matchVariant(product: Product, chosen: Record<string, string>): ProductVariant | undefined {
  if (product.variants.length === 1) return product.variants[0];
  return product.variants.find((v) => Object.entries(v.options).every(([k, val]) => chosen[k] === val));
}

/** Whether picking this value (with the others already chosen) can still lead to something in stock. */
export function valueAvailable(product: Product, chosen: Record<string, string>, option: string, value: string): boolean {
  const want = { ...chosen, [option]: value };
  return product.variants.some((v) => Object.entries(want).every(([k, val]) => !v.options[k] || v.options[k] === val) && canSell(product, v));
}