import type { ExamplePage } from './examples/build';
import { findListing } from '../utils/templateListings';
import { findExampleById } from './examples';

/** Premium starters (example prices, D67). Licence is per workspace, bought once. */
export const premiumTemplatePrices: Record<string, number> = {
  'adaeze-atelier': 5000,
  'glow-by-halima': 4000,
  'afrobeats-brunch': 3500
};

export type ColourMood = 'light' | 'dark' | 'bold';

export const moodLabels: Record<ColourMood, string> = { light: 'Light', dark: 'Dark', bold: 'Bold colour' };

export function templateMood(e: ExamplePage): ColourMood {
  if (e.styles.includes('dark')) return 'dark';
  if (e.styles.includes('bold')) return 'bold';
  return 'light';
}

/** KUBICU premium price, an Elite (D154) or Artwork (D158) template's price, or a creator listing's price (D70). */
export const templatePrice = (id: string): number => {
  const example = findExampleById(id);
  return premiumTemplatePrices[id] ?? example?.elite?.priceNgn ?? example?.artwork?.priceNgn ?? findListing(id)?.priceNgn ?? 0;
};