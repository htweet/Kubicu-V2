import type { CommerceData, Product, ProductOption, ProductVariant } from '../../types/commerce';
import type { BlockContentMap, MenuItem } from '../../types/page';
import { uid } from '../id';

export function variantLabel(variant: ProductVariant): string {
  const values = Object.values(variant.options);
  return values.length ? values.join(' / ') : 'Default';
}

export function variantPrice(product: Product, variant: ProductVariant): number | null {
  return variant.priceNgn ?? product.priceNgn;
}

export function totalStock(product: Product): number {
  return product.variants.reduce((s, v) => s + Math.max(0, v.stock), 0);
}

export function isSoldOut(product: Product): boolean {
  if (product.kind === 'digital' || !product.trackStock) return false;
  return totalStock(product) <= 0;
}

export function isLowStock(product: Product): boolean {
  if (product.kind === 'digital' || !product.trackStock || isSoldOut(product)) return false;
  return product.variants.some((v) => v.stock > 0 && v.stock <= product.lowStockAt);
}

export function canSell(product: Product, variant?: ProductVariant): boolean {
  if (product.status !== 'active') return false;
  if (product.kind === 'digital') return product.digital?.status === 'ready';
  if (!product.trackStock) return true;
  return variant ? variant.stock > 0 : totalStock(product) > 0;
}

/** The visitor-facing price range, e.g. ₦32,000 or ₦32,000–₦38,000. */
export function priceRange(product: Product): [number, number] | null {
  const prices = product.variants.map((v) => variantPrice(product, v)).filter((p): p is number => p !== null);
  if (prices.length === 0) return null;
  return [Math.min(...prices), Math.max(...prices)];
}

export function displayStatus(product: Product): 'active' | 'draft' | 'archived' | 'sold_out' {
  if (product.status !== 'active') return product.status;
  return isSoldOut(product) ? 'sold_out' : 'active';
}

function skuBase(name: string): string {
  return (
    name.
    toUpperCase().
    replace(/[^A-Z0-9 ]/g, '').
    split(/\s+/).
    filter(Boolean).
    map((w) => w.slice(0, 3)).
    join('-').
    slice(0, 12) || 'SKU');

}

/** Rebuilds the variant grid from options, keeping price and stock for combinations that still exist. */
export function regenerateVariants(product: Pick<Product, 'name' | 'options' | 'variants'>): ProductVariant[] {
  const opts: ProductOption[] = product.options.filter((o) => o.name.trim() && o.values.some((v) => v.trim()));
  const combos: Record<string, string>[] = opts.reduce<Record<string, string>[]>(
    (acc, opt) => acc.flatMap((c) => opt.values.filter((v) => v.trim()).map((v) => ({ ...c, [opt.name.trim()]: v.trim() }))),
    [{}]
  );
  const key = (o: Record<string, string>) => JSON.stringify(Object.entries(o).sort());
  const existing = new Map(product.variants.map((v) => [key(v.options), v]));
  const base = skuBase(product.name);
  return combos.map((options) => {
    const found = existing.get(key(options));
    if (found) return found;
    const suffix = Object.values(options).
    map((v) => v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)).
    join('-');
    return { id: uid('var'), sku: suffix ? `${base}-${suffix}` : base, options, priceNgn: null, stock: 0 };
  });
}

export function findProduct(data: CommerceData | null | undefined, id: string | undefined): Product | undefined {
  if (!data || !id) return undefined;
  return data.products.find((p) => p.id === id);
}

/** Product-grid catalogue mode: products in a collection, or picked by hand. Only active products appear. */
export function linkedGridProducts(c: BlockContentMap['productGrid'], data: CommerceData | null): Product[] {
  if (!data) return [];
  const active = (p: Product | undefined): p is Product => !!p && p.status === 'active';
  if (c.collectionId) return data.products.filter((p) => p.collectionIds.includes(c.collectionId as string)).filter(active).slice(0, 12);
  return (c.productIds ?? []).map((id) => data.products.find((p) => p.id === id)).filter(active);
}

/**
 * A menu item as visitors see it. Linked items take name, description, lowest price and
 * availability from Commerce; drafted/archived products are hidden. If the product was
 * deleted, the last typed details are shown so the menu never breaks.
 */
export function resolveMenuItem(item: MenuItem, data: CommerceData | null): (MenuItem & {linked: boolean;}) | null {
  if (!item.productId) return { ...item, linked: false };
  const p = findProduct(data, item.productId);
  if (!p) return { ...item, linked: false };
  if (p.status !== 'active') return null;
  const range = priceRange(p);
  return { ...item, name: p.name, description: p.description.split('\n')[0].slice(0, 140), priceNgn: range ? range[0] : null, available: item.available && !isSoldOut(p), linked: true };
}

export function productsInCollection(data: CommerceData, collectionId: string): Product[] {
  return data.products.filter((p) => p.collectionIds.includes(collectionId));
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const STORAGE_LIMIT_BYTES = 2 * 1024 * 1024 * 1024;