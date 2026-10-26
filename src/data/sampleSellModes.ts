import type { CommerceData, GiftCard } from '../types/commerce';
import { DEFAULT_GIFT_AMOUNTS, GIFT_CARD_PRODUCT_ID, upsertGiftCardProduct } from '../utils/commerce/sellModes';

/**
 * SAMPLE pre-order, bulk prices and gift cards (D202), for demo workspaces only.
 * Every record is flagged `sample`; codes are fictional and only work in this workspace.
 */

const ago = (days: number) => new Date(Date.now() - days * 86400000).toISOString();
const inDays = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

const sampleGiftCards = (): GiftCard[] => [
{
  id: 'gc_s1',
  code: 'GIFT-ADZE-7K2M',
  initialNgn: 20000,
  balanceNgn: 8000,
  source: 'sold',
  buyerName: 'Funke Adeyemi',
  recipientName: '',
  message: '',
  status: 'active',
  expiresAt: null,
  uses: [{ orderId: 'so_sample_gc', orderNumber: 1009, amountNgn: 12000, at: ago(3) }],
  createdAt: ago(12),
  sample: true
},
{
  id: 'gc_s2',
  code: 'GIFT-ADZE-P4QR',
  initialNgn: 10000,
  balanceNgn: 10000,
  source: 'issued',
  buyerName: 'Issued by you',
  recipientName: 'Chiamaka',
  message: 'Sorry about the late delivery — this one’s on us.',
  note: 'Store credit for a delayed order (sample)',
  status: 'active',
  expiresAt: new Date(Date.now() + 90 * 86400000).toISOString(),
  uses: [],
  createdAt: ago(5),
  sample: true
},
{
  id: 'gc_s3',
  code: 'GIFT-ADZE-W9XT',
  initialNgn: 5000,
  balanceNgn: 0,
  source: 'sold',
  buyerName: 'Tolu Bakare',
  recipientName: '',
  message: '',
  status: 'active',
  expiresAt: null,
  uses: [{ orderId: 'so_sample_gc2', orderNumber: 1004, amountNgn: 5000, at: ago(9) }],
  createdAt: ago(20),
  sample: true
}];


/** Adds the sample pre-order, bulk prices and gift cards once. Never touches the seller’s own records. */
export function withSampleSellModes(data: CommerceData): CommerceData {
  if (data.sampleSellModesSeeded) return data;
  const products = data.products.map((p) => {
    // Sold-out sample trousers become a pre-order, so the label and expected date show.
    if (p.id === 'sp_trousers' && p.sample && !p.preorder) return { ...p, preorder: { shipsBy: inDays(18), limit: 12, depositPct: null, taken: 3 } };
    // The sample scarf gets bulk prices for gifting and resellers.
    if (p.id === 'sp_scarf' && p.sample && !p.bulkPrices?.length) return { ...p, bulkPrices: [{ minQty: 3, priceNgn: 16000 }, { minQty: 6, priceNgn: 14500 }] };
    return p;
  });
  let next: CommerceData = { ...data, products };
  if (!next.products.some((p) => p.id === GIFT_CARD_PRODUCT_ID)) {
    next = upsertGiftCardProduct(next, DEFAULT_GIFT_AMOUNTS, true);
    next = { ...next, products: next.products.map((p) => p.id === GIFT_CARD_PRODUCT_ID ? { ...p, sample: true } : p) };
  }
  const cards = next.giftCards ?? [];
  return { ...next, giftCards: [...cards, ...sampleGiftCards().filter((s) => !cards.some((c) => c.id === s.id || c.code === s.code))], sampleSellModesSeeded: true };
}