import { useCallback, useEffect, useState } from 'react';
import type { PageDocument } from '../types/page';
import type { ListingEvent, TemplateListing, TemplateSale, TemplateStore } from '../types/templateListing';
import { examplePages } from '../data/examples';
import type { ExamplePage } from '../data/examples/build';
import { prepareStarter } from './starterKit';
import { uid } from './id';

/**
 * Creator template listings, sales and payouts (D70). Stored under ONE browser-wide key so every
 * workspace on this device sees the same marketplace — standing in for the server in production.
 */
const KEY = 'kubicu.templateMarket';
const EVENT = 'kubicu:template-market';

export const CREATOR_SHARE = 0.7;
export const REFUND_DAYS = 7;
export const PAYOUT_MIN_NGN = 5000;
export const PRICE_MIN_NGN = 2000;
export const PRICE_MAX_NGN = 20000;
const DAY = 86400000;

const empty = (): TemplateStore => ({ listings: [], sales: [], payouts: [], accounts: {}, seeded: false });

export function readTemplateStore(): TemplateStore {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? { ...empty(), ...(JSON.parse(raw) as Partial<TemplateStore>) } as TemplateStore : empty();
    if (parsed.seeded) return parsed;
    const seeded = { ...parsed, ...seed(parsed), seeded: true };
    try {
      window.localStorage.setItem(KEY, JSON.stringify(seeded));
    } catch {

      // Storage full — the sample stays in memory for this read.
    }return seeded;
  } catch {
    return empty();
  }
}

export function writeTemplateStore(store: TemplateStore): void {
  window.localStorage.setItem(KEY, JSON.stringify(store));
  window.dispatchEvent(new Event(EVENT));
}

export function updateTemplateStore(fn: (s: TemplateStore) => TemplateStore): boolean {
  try {
    writeTemplateStore(fn(readTemplateStore()));
    return true;
  } catch {
    return false;
  }
}

/** Live view of the shared store, updated across tabs and components. */
export function useTemplateStore(): [TemplateStore, (fn: (s: TemplateStore) => TemplateStore) => boolean] {
  const [store, setStore] = useState<TemplateStore>(() => readTemplateStore());
  useEffect(() => {
    const sync = () => setStore(readTemplateStore());
    const onStorage = (e: StorageEvent) => e.key === KEY && sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', onStorage);
    };
  }, []);
  const update = useCallback((fn: (s: TemplateStore) => TemplateStore) => updateTemplateStore(fn), []);
  return [store, update];
}

export const findListing = (id: string): TemplateListing | undefined => readTemplateStore().listings.find((l) => l.id === id);

export const creatorShare = (priceNgn: number) => Math.round(priceNgn * CREATOR_SHARE);

export const listingEvent = (label: string, by: ListingEvent['by']): ListingEvent => ({ id: uid('lev'), at: new Date().toISOString(), label, by });

export function averageStars(l: TemplateListing): number | null {
  if (!l.reviews.length) return null;
  return Math.round(l.reviews.reduce((s, r) => s + r.stars, 0) / l.reviews.length * 10) / 10;
}

/** The sale that gives this workspace the template, if any (refunded sales don't count). */
export const activeSale = (store: TemplateStore, listingId: string, workspaceId: string) =>
store.sales.find((s) => s.listingId === listingId && s.buyerWorkspaceId === workspaceId && !s.refundedAt);

export const canRefundSale = (sale: TemplateSale, now = Date.now()) => !sale.refundedAt && now - Date.parse(sale.at) <= REFUND_DAYS * DAY;

/** A creator's money: pending (still refundable), available, paid out. */
export function earnings(store: TemplateStore, workspaceId: string, now = Date.now()) {
  const mine = new Set(store.listings.filter((l) => l.workspaceId === workspaceId).map((l) => l.id));
  const sales = store.sales.filter((s) => mine.has(s.listingId) && !s.refundedAt);
  const pending = sales.filter((s) => now - Date.parse(s.at) <= REFUND_DAYS * DAY).reduce((t, s) => t + s.creatorShareNgn, 0);
  const cleared = sales.filter((s) => now - Date.parse(s.at) > REFUND_DAYS * DAY).reduce((t, s) => t + s.creatorShareNgn, 0);
  const paidOut = store.payouts.filter((p) => p.workspaceId === workspaceId).reduce((t, p) => t + p.amountNgn, 0);
  return { pending, available: Math.max(0, cleared - paidOut), paidOut, lifetime: sales.reduce((t, s) => t + s.creatorShareNgn, 0), salesCount: sales.length };
}

/** Shapes a creator listing like a KUBICU starter so the same grid, preview and purchase screens work. */
export function listingAsExample(l: TemplateListing, doc: PageDocument): ExamplePage {
  return { id: l.id, category: l.name, name: `by ${l.creatorName}`, city: l.region, bestFor: l.category, description: l.description, goals: [], styles: [], plan: 'free', doc };
}

/** Turns a creator's space into a shareable template: their identity, prices, contacts, links and catalogue links are removed. */
export function sanitiseForTemplate(doc: PageDocument): PageDocument {
  const { doc: prepared } = prepareStarter(doc, { name: 'Your business name', tagline: 'One line about what you do', location: '' });
  const unlink = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(unlink);
    if (!v || typeof v !== 'object') return v;
    const out: Record<string, unknown> = {};
    Object.entries(v as Record<string, unknown>).forEach(([k, x]) => {
      if (k === 'source' && x === 'catalog') out[k] = 'manual';else
      if (k === 'productId' || k === 'serviceId' || k === 'discountId') out[k] = typeof x === 'string' ? '' : undefined;else
      if (k === 'productIds' || k === 'planIds') out[k] = [];else
      if (k === 'collectionId') out[k] = null;else
      if (k === 'avatarUrl') out[k] = '';else
      out[k] = unlink(x);
    });
    return out;
  };
  return {
    ...prepared,
    title: 'Template',
    handle: 'template',
    blocks: unlink(prepared.blocks) as PageDocument['blocks'],
    pages: prepared.pages ? unlink(prepared.pages) as PageDocument['pages'] : prepared.pages,
    campaign: undefined,
    dealRoom: undefined
  } as PageDocument;
}

/** Sample creators so the marketplace and the staff review queue aren't empty. Flagged `sample`. */
function seed(store: TemplateStore): Partial<TemplateStore> {
  const pick = (id: string) => examplePages.find((e) => e.id === id) ?? examplePages[0];
  const ago = (d: number) => new Date(Date.now() - d * DAY).toISOString();
  const listed = (id: string, base: string, name: string, category: string, region: string, description: string, price: number, creator: string, days: number): TemplateListing => {
    const doc = sanitiseForTemplate(pick(base).doc);
    return {
      id,
      workspaceId: `sample_${creator.toLowerCase().replace(/\W+/g, '_')}`,
      creatorName: creator,
      sourceSpaceId: 'main',
      name,
      category,
      region,
      description,
      priceNgn: price,
      licence: 'standard',
      status: 'listed',
      listedDoc: doc,
      listedVersion: 1,
      pendingDoc: null,
      pendingVersion: null,
      reviewNote: null,
      submittedAt: ago(days + 2),
      listedAt: ago(days),
      events: [{ id: `${id}_e2`, at: ago(days), label: 'Approved and listed', by: 'staff' }, { id: `${id}_e1`, at: ago(days + 2), label: 'Submitted for review', by: 'creator' }],
      reviews: [
      { id: `${id}_r1`, workspaceId: 'sample_buyer_1', buyerName: 'Chidi’s Kitchen', stars: 5, text: 'Set up my page in an afternoon. The menu layout is spot on.', at: ago(days - 3) },
      { id: `${id}_r2`, workspaceId: 'sample_buyer_2', buyerName: 'Bola Braids', stars: 4, text: 'Clean and easy to change. Wish it had one more colour option.', at: ago(days - 5) }],

      sample: true
    };
  };
  const a = listed('ctl_nkem_menu', 'mama-put-kitchen', 'Bukka menu', 'Restaurant & food', 'Lagos', 'A warm, menu-first page for bukkas and home kitchens, with WhatsApp ordering up top.', 3000, 'Studio Ńkem', 20);
  const b = listed('ctl_ola_studio', 'glow-by-halima', 'Soft studio', 'Beauty & wellness', 'Abuja', 'A calm booking page for salons and studios: services, prices on request and reviews.', 0, 'Ola Designs', 12);
  const pendingDoc = sanitiseForTemplate(pick('afrobeats-brunch').doc);
  const c: TemplateListing = {
    ...listed('ctl_dami_event', 'afrobeats-brunch', 'Day party', 'Events', 'Lagos', 'A bold one-pager for day parties: countdown, ticket tiers and a gallery.', 6000, 'Dami Creates', 1),
    status: 'in_review',
    listedDoc: null,
    listedVersion: 0,
    pendingDoc,
    pendingVersion: 1,
    listedAt: null,
    events: [{ id: 'ctl_dami_event_e1', at: ago(1), label: 'Submitted for review', by: 'creator' }],
    reviews: []
  };
  const sales: TemplateSale[] = [
  { id: 'sale_s1', listingId: a.id, buyerWorkspaceId: 'sample_buyer_1', buyerName: 'Chidi’s Kitchen', priceNgn: 3000, creatorShareNgn: creatorShare(3000), version: 1, doc: a.listedDoc as PageDocument, at: ago(17), refundedAt: null, sample: true },
  { id: 'sale_s2', listingId: a.id, buyerWorkspaceId: 'sample_buyer_3', buyerName: 'Iya Basira', priceNgn: 3000, creatorShareNgn: creatorShare(3000), version: 1, doc: a.listedDoc as PageDocument, at: ago(4), refundedAt: null, sample: true }];

  return { listings: [...store.listings, a, b, c], sales: [...store.sales, ...sales] };
}