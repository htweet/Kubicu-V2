import type { PageDocument } from '../types/page';
import type { CommerceData } from '../types/commerce';
import type { Service } from '../types/ops';
import { publicUrl } from './format';
import { sitePages } from './sitePages';
import { canSell, isSoldOut } from './commerce/catalog';
import { productSlug, STOREFRONT_PATH, storefrontAvailable } from './commerce/storefront';

/** One address search engines would be told about (D124). */
export interface SitemapEntry {
  url: string;
  kind: 'Home' | 'Page' | 'Shop' | 'Product' | 'Event' | 'Service';
  label: string;
  updated: string;
}

export type StructuredItem = Record<string, unknown>;

const full = (handle: string, path = '') => `https://${publicUrl(handle)}${path ? `/${path}` : ''}`;

/**
 * What a sitemap for this space would list. Hidden pages, members-only pages, drafts,
 * unsellable products and past events are left out, so search never sends people to dead ends.
 */
export function sitemapEntries(doc: PageDocument, commerce: CommerceData | null, services: Service[]): SitemapEntry[] {
  if (doc.branding?.hideFromSearch) return [];
  const out: SitemapEntry[] = doc.seo.noIndex ? [] : [{ url: full(doc.handle), kind: 'Home', label: doc.homeLabel || 'Home', updated: doc.updatedAt }];
  sitePages(doc).
  filter((p) => !p.membersOnly && !p.seo.noIndex).
  forEach((p) => out.push({ url: full(doc.handle, p.path), kind: 'Page', label: p.title, updated: doc.updatedAt }));
  if (commerce && storefrontAvailable(doc, commerce)) {
    out.push({ url: full(doc.handle, STOREFRONT_PATH), kind: 'Shop', label: commerce.storefront.title || 'Shop', updated: doc.updatedAt });
    commerce.products.
    filter((p) => p.kind !== 'ticket' && canSell(p)).
    forEach((p) => out.push({ url: full(doc.handle, `${STOREFRONT_PATH}/${productSlug(p, commerce.products)}`), kind: 'Product', label: p.name, updated: p.updatedAt }));
  }
  const now = Date.now();
  (commerce?.events ?? []).
  filter((e) => !e.sample && e.status === 'on_sale' && new Date(e.endsAt ?? e.startsAt).getTime() > now).
  forEach((e) => out.push({ url: full(doc.handle), kind: 'Event', label: e.name, updated: e.updatedAt }));
  services.
  filter((s) => s.active && !s.sample).
  forEach((s) => out.push({ url: full(doc.handle), kind: 'Service', label: s.name, updated: doc.updatedAt }));
  return out;
}

/**
 * The robots instruction for one page (D221): hidden space or page → noindex; "don't follow links" → nofollow.
 * Returns null when the defaults (index, follow) apply, so no tag is needed.
 */
export function robotsFor(doc: Pick<PageDocument, 'branding'>, pageSeo: {noIndex?: boolean;} | null): string | null {
  const noindex = !!doc.branding?.hideFromSearch || !!pageSeo?.noIndex;
  const nofollow = !!doc.branding?.noFollowLinks;
  if (!noindex && !nofollow) return null;
  return `${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}`;
}

/** Structured data (schema.org) a search engine would read: the business, products and events. */
export function structuredData(doc: PageDocument, commerce: CommerceData | null, services: Service[]): StructuredItem[] {
  const items: StructuredItem[] = [
  {
    '@type': 'LocalBusiness',
    name: doc.title,
    url: full(doc.handle),
    description: doc.seo.description || undefined,
    currenciesAccepted: 'NGN'
  }];

  if (commerce) {
    commerce.products.
    filter((p) => p.kind !== 'ticket' && canSell(p)).
    slice(0, 20).
    forEach((p) =>
    items.push({
      '@type': 'Product',
      name: p.name,
      image: p.images[0]?.url || undefined,
      description: p.description ? p.description.slice(0, 160) : undefined,
      offers: p.priceNgn !== null ? { '@type': 'Offer', price: p.priceNgn, priceCurrency: 'NGN', availability: isSoldOut(p) ? 'OutOfStock' : 'InStock' } : undefined
    })
    );
    (commerce.events ?? []).
    filter((e) => !e.sample && e.status === 'on_sale').
    slice(0, 10).
    forEach((e) =>
    items.push({
      '@type': 'Event',
      name: e.name,
      startDate: e.startsAt,
      endDate: e.endsAt ?? undefined,
      eventAttendanceMode: e.online ? 'OnlineEventAttendanceMode' : 'OfflineEventAttendanceMode',
      location: e.online ? { '@type': 'VirtualLocation' } : { '@type': 'Place', name: e.venue, address: e.address }
    })
    );
  }
  services.
  filter((s) => s.active && !s.sample).
  slice(0, 10).
  forEach((s) => items.push({ '@type': 'Service', name: s.name, offers: s.priceNgn !== null ? { '@type': 'Offer', price: s.priceNgn, priceCurrency: 'NGN' } : undefined }));
  return items;
}

/**
 * Plain-language list of what Google may show from the structured data. Each hint is an English phrase with
 * `{n}` placeholders plus its numbers, so the editor can translate it (D306) — written “label: number” to avoid plurals.
 */
export function richResultHints(items: StructuredItem[]): {text: string;vars?: Record<string, number>;}[] {
  const count = (t: string) => items.filter((i) => i['@type'] === t).length;
  const hints: {text: string;vars?: Record<string, number>;}[] = [{ text: 'Your business name and link' }];
  const products = count('Product');
  const priced = items.filter((i) => i['@type'] === 'Product' && i.offers).length;
  if (products) hints.push(priced ? { text: 'Products: {n} ({priced} with price and stock)', vars: { n: products, priced } } : { text: 'Products: {n}', vars: { n: products } });
  const events = count('Event');
  if (events) hints.push({ text: 'Upcoming events with date and place: {n}', vars: { n: events } });
  const svc = count('Service');
  if (svc) hints.push({ text: 'Services: {n}', vars: { n: svc } });
  return hints;
}