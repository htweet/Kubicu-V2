import type { ExamplePage } from './examples/build';

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

export const templatePrice = (id: string): number => premiumTemplatePrices[id] ?? 0;