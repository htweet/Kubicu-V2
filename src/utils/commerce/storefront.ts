import type { CommerceData, Product, ProductVariant } from '../../types/commerce';
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
  featured: 'Featured',
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

export function shopProducts(data: CommerceData | null): Product[] {
  if (!data) return [];
  return data.products.filter((p) => p.status === 'active' && (!data.storefront.hideSoldOut || !isSoldOut(p)));
}

export function sortProducts(list: Product[], sort: StorefrontSort): Product[] {
  const low = (p: Product) => priceRange(p)?.[0] ?? Number.POSITIVE_INFINITY;
  const copy = [...list];
  if (sort === 'newest') return copy.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  if (sort === 'price_asc') return copy.sort((a, b) => low(a) - low(b));
  if (sort === 'price_desc') return copy.sort((a, b) => (priceRange(b)?.[1] ?? -1) - (priceRange(a)?.[1] ?? -1));
  // Featured: in-stock first, then the order products were added in Commerce.
  return copy.sort((a, b) => Number(isSoldOut(a)) - Number(isSoldOut(b)));
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