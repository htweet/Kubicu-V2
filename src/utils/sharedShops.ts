import type { SharedShop, SharedShopMember } from '../types/sharedShop';
import type { Product } from '../types/commerce';
import { readCommerce } from './commerce/storage';
import { shopProducts } from './commerce/storefront';
import { priceRange } from './commerce/catalog';

/** Shared storefronts (D128). Stored once for the device so any member's view and the public page agree. */
export const SHARED_SHOPS_KEY = 'kubicu.sharedShops';
export const SHARED_SHOP_PLAN = 'pro' as const;
export const MAX_MEMBERS = 12;
const EVENT = 'kubicu:sharedShops';

export function readSharedShops(): SharedShop[] {
  try {
    const raw = localStorage.getItem(SHARED_SHOPS_KEY);
    return raw ? JSON.parse(raw) as SharedShop[] : [];
  } catch {
    return [];
  }
}

export function writeSharedShops(list: SharedShop[]): boolean {
  try {
    localStorage.setItem(SHARED_SHOPS_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event(EVENT));
    return true;
  } catch {
    return false;
  }
}

export function updateSharedShops(fn: (list: SharedShop[]) => SharedShop[]): boolean {
  return writeSharedShops(fn(readSharedShops()));
}

export function onSharedShopsChange(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener('storage', cb);
  };
}

export function slugify(s: string): string {
  return s.
  toLowerCase().
  replace(/[^a-z0-9]+/g, '-').
  replace(/^-+|-+$/g, '').
  slice(0, 40);
}

export function slugProblem(slug: string, list: SharedShop[], selfId?: string): string | null {
  if (slug.length < 3) return 'At least 3 letters or numbers.';
  if (list.some((s) => s.slug === slug && s.id !== selfId)) return 'Another shared shop already uses this link.';
  return null;
}

export const sharedShopUrl = (slug: string) => `${window.location.origin}/m/${slug}`;

export interface ShopItem {
  key: string;
  member: SharedShopMember;
  name: string;
  priceLabel: string;
  lowPrice: number;
  imageUrl: string;
  imageAlt: string;
  href: string;
  soldOut: boolean;
  sample: boolean;
}

const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

/** What a joined member shows: their real active shop products, or labelled sample cards. */
export function memberItems(m: SharedShopMember): ShopItem[] {
  if (m.status !== 'joined') return [];
  if (m.workspaceId) {
    const data = readCommerce(m.workspaceId);
    const products: Product[] = shopProducts(data).filter((p) => !m.productIds.length || m.productIds.includes(p.id));
    return products.map((p) => {
      const r = priceRange(p);
      return {
        key: `${m.id}:${p.id}`,
        member: m,
        name: p.name,
        priceLabel: r ? r[0] === r[1] ? naira(r[0]) : `From ${naira(r[0])}` : 'Ask for price',
        lowPrice: r?.[0] ?? Number.POSITIVE_INFINITY,
        imageUrl: p.images[0]?.url ?? '',
        imageAlt: p.images[0]?.alt ?? p.name,
        href: `/p/${m.handle}/shop/${p.id}`,
        soldOut: false,
        sample: false
      };
    });
  }
  return (m.sampleItems ?? []).map((s) => ({
    key: `${m.id}:${s.id}`,
    member: m,
    name: s.name,
    priceLabel: naira(s.priceNgn),
    lowPrice: s.priceNgn,
    imageUrl: s.imageUrl,
    imageAlt: s.imageAlt,
    href: `/p/${m.handle}`,
    soldOut: false,
    sample: true
  }));
}

export function shopItems(shop: SharedShop): ShopItem[] {
  return shop.members.flatMap(memberItems);
}

export const memberStatusLabels: Record<SharedShopMember['status'], string> = { invited: 'Invited', joined: 'Showing products', left: 'Left' };