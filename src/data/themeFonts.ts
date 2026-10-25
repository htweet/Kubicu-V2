import type { ThemeFontId } from '../types/page';

/**
 * Curated type set for Signature themes (D161). The first eight are already loaded globally;
 * the six marked `load` are fetched only on pages whose theme uses them.
 */
export const themeFonts: Record<ThemeFontId, {name: string;stack: string;load?: string;}> = {
  inter: { name: 'Inter', stack: "'Inter', system-ui, sans-serif" },
  fraunces: { name: 'Fraunces', stack: "'Fraunces', Georgia, serif" },
  newsreader: { name: 'Newsreader', stack: "'Newsreader', Georgia, serif" },
  instrument: { name: 'Instrument Serif', stack: "'Instrument Serif', Georgia, serif" },
  archivo: { name: 'Archivo', stack: "'Archivo', system-ui, sans-serif" },
  lora: { name: 'Lora', stack: "'Lora', Georgia, serif" },
  cormorant: { name: 'Cormorant Garamond', stack: "'Cormorant Garamond', Georgia, serif" },
  bricolage: { name: 'Bricolage Grotesque', stack: "'Bricolage Grotesque', system-ui, sans-serif" },
  manrope: { name: 'Manrope', stack: "'Manrope', system-ui, sans-serif", load: 'Manrope:wght@400;500;600;700' },
  sora: { name: 'Sora', stack: "'Sora', system-ui, sans-serif", load: 'Sora:wght@400;500;600;700' },
  dmSerif: { name: 'DM Serif Display', stack: "'DM Serif Display', Georgia, serif", load: 'DM+Serif+Display' },
  playfair: { name: 'Playfair Display', stack: "'Playfair Display', Georgia, serif", load: 'Playfair+Display:wght@500;600;700' },
  outfit: { name: 'Outfit', stack: "'Outfit', system-ui, sans-serif", load: 'Outfit:wght@400;500;600;700' },
  syne: { name: 'Syne', stack: "'Syne', system-ui, sans-serif", load: 'Syne:wght@500;600;700;800' }
};

/** Google Fonts stylesheet URL for the theme's extra faces, or null when none are needed. */
export function themeFontHref(ids: (ThemeFontId | undefined)[]): string | null {
  const families = Array.from(new Set(ids.filter(Boolean) as ThemeFontId[])).
  map((id) => themeFonts[id].load).
  filter(Boolean);
  return families.length ? `https://fonts.googleapis.com/css2?${families.map((f) => `family=${f}`).join('&')}&display=swap` : null;
}