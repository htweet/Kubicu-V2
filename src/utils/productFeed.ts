import type { CommerceData } from '../types/commerce';
import { canSell, displayStatus, priceRange } from './commerce/catalog';
import { productSlug, STOREFRONT_PATH } from './commerce/storefront';
import { publicUrl } from './format';
import { toCsv } from './csv';

/**
 * Product feed for Meta and Google Shopping (D232). The CSV is real and follows both catalogues' column names;
 * a live, auto-updating feed address needs a backend. Links carry utm_source so visits show in Analytics.
 */
export type FeedChannel = 'meta' | 'google';

export const feedChannels: Record<FeedChannel, {label: string;where: string;source: string;}> = {
  meta: { label: 'Meta', where: 'Meta Commerce Manager → Catalogue → Data sources → Data feed', source: 'meta_shop' },
  google: { label: 'Google', where: 'Google Merchant Center → Products → Add products → File', source: 'google_shopping' }
};

export interface FeedSkip {
  id: string;
  name: string;
  reason: string;
}

export interface FeedResult {
  included: number;
  skipped: FeedSkip[];
  csv: string;
}

const HEADERS = ['id', 'title', 'description', 'availability', 'condition', 'price', 'link', 'image_link', 'brand'];
const plain = (s: string) => s.replace(/<[^>]+>/g, ' ').replace(/[*_#>`]/g, '').replace(/\s+/g, ' ').trim();

export function buildFeed(data: CommerceData, handle: string, brand: string, channel: FeedChannel): FeedResult {
  const rows: string[][] = [];
  const skipped: FeedSkip[] = [];
  data.products.
  filter((p) => p.kind === 'physical' && !p.giftCard).
  forEach((p) => {
    const status = displayStatus(p);
    const range = priceRange(p);
    const image = p.images[0]?.url ?? '';
    const reason =
    status === 'draft' ?
    'Still a draft' :
    status === 'archived' ?
    'Archived' :
    !range ?
    'No price (shown as “on request”)' :
    !image ?
    'No photo' :
    !/^https?:\/\//.test(image) ?
    'Photo is only saved on this device' :
    !plain(p.description ?? '') ?
    'No description' :
    '';
    if (reason || !range) {
      skipped.push({ id: p.id, name: p.name, reason: reason || 'No price' });
      return;
    }
    const link = `https://${publicUrl(handle)}/${STOREFRONT_PATH}/${productSlug(p, data.products)}?utm_source=${feedChannels[channel].source}&utm_medium=product_feed`;
    rows.push([p.id, p.name.slice(0, 150), plain(p.description ?? '').slice(0, 5000), canSell(p) ? 'in stock' : 'out of stock', 'new', `${range[0].toFixed(2)} NGN`, link, image, brand]);
  });
  return { included: rows.length, skipped, csv: toCsv(HEADERS, rows) };
}