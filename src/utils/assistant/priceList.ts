import type { AssistantItem } from '../../types/assistant';
import { uid } from '../id';

/**
 * Reads a pasted price list (D211, Pass C). Prices are only ever taken from what the owner typed —
 * a line without a number becomes an item with no price, never a guess.
 *   "Small chops tray — 15,000"  → { name: 'Small chops tray', priceNgn: 15000 }
 *   "Jollof (large): ₦8.5k"       → { name: 'Jollof (large)', priceNgn: 8500 }
 *   "Asun"                        → { name: 'Asun', priceNgn: null }
 */

const LINE_PRICE = /^(.*?)[\s]*(?:[-–—:|,=@]|\bat\b|\bfor\b)?\s*(?:₦|NGN|N)?\s*(\d[\d,]*(?:\.\d+)?)\s*(k)?\s*(?:naira)?\.?$/i;

export function parsePrice(raw: string, thousands: boolean): number | null {
  const n = Number(raw.replace(/,/g, ''));
  if (!Number.isFinite(n) || n <= 0) return null;
  const value = thousands ? n * 1000 : n;
  return value >= 50 && value <= 100_000_000 ? Math.round(value) : null;
}

export function parsePriceList(text: string, max = 30): AssistantItem[] {
  const lines = text
    .split(/\n|;|•/)
    .map((l) => l.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim())
    .filter(Boolean);
  // A single comma-separated line ("jollof, asun, small chops") is a list of names.
  const parts = lines.length === 1 && !LINE_PRICE.test(lines[0]) && lines[0].includes(',') ? lines[0].split(',').map((p) => p.trim()).filter(Boolean) : lines;
  const items: AssistantItem[] = [];
  for (const line of parts) {
    const m = LINE_PRICE.exec(line);
    const price = m ? parsePrice(m[2], !!m[3]) : null;
    // A number that isn't a sensible price ("Party tray 2") stays part of the name.
    const name = (m && price !== null ? m[1] : line).replace(/[\s\-–—:|,=@]+$/, '').trim();
    if (name.length < 2 || name.length > 80) continue;
    items.push({ id: uid('prd'), name: name.charAt(0).toUpperCase() + name.slice(1), priceNgn: price });
    if (items.length >= max) break;
  }
  return items;
}

/** True when text looks like a list with prices (at least two priced lines). */
export function looksLikePriceList(text: string): boolean {
  return text.split('\n').filter((l) => LINE_PRICE.test(l.trim()) && /[a-z]/i.test(l)).length >= 2;
}

/**
 * Fills missing prices from a reply like "Asun 4500, small chops 3000" or, when only one item is
 * missing, a bare "4500". Matches by the start of each item's name.
 */
export function applyPrices(items: AssistantItem[], reply: string): { items: AssistantItem[]; filled: number } {
  const missing = items.filter((i) => i.priceNgn === null);
  let filled = 0;
  const bare = /^\s*(?:₦|N)?\s*(\d[\d,]*(?:\.\d+)?)\s*(k)?\s*$/i.exec(reply);
  if (bare && missing.length === 1) {
    const price = parsePrice(bare[1], !!bare[2]);
    if (price === null) return { items, filled: 0 };
    return { items: items.map((i) => (i.id === missing[0].id ? { ...i, priceNgn: price } : i)), filled: 1 };
  }
  const given = parsePriceList(reply, 50).filter((g) => g.priceNgn !== null);
  const next = items.map((i) => {
    if (i.priceNgn !== null) return i;
    const key = i.name.toLowerCase();
    const hit = given.find((g) => key.startsWith(g.name.toLowerCase()) || g.name.toLowerCase().startsWith(key));
    if (!hit) return i;
    filled += 1;
    return { ...i, priceNgn: hit.priceNgn };
  });
  return { items: next, filled };
}
