export function hexToRgb(hex: string): [number, number, number] | null {
  const raw = hex.replace('#', '').trim();
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function isHexColor(value: string): boolean {
  return hexToRgb(value) !== null;
}

function channel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
}

export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

/** Minimum ratio a page needs to publish. Below this, text is very hard to read. */
export const CONTRAST_MIN_PUBLISH = 3;
/** WCAG AA target for body text. */
export const CONTRAST_TARGET = 4.5;

export function mixHex(a: string, b: string, t: number): string {
  const ra = hexToRgb(a);
  const rb = hexToRgb(b);
  if (!ra || !rb) return a;
  const c = ra.map((v, i) => Math.round(v + (rb[i] - v) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

/** Nudges `fg` toward black or white until it reaches `target` contrast against `bg`. */
export function readableOn(fg: string, bg: string, target = CONTRAST_TARGET): string {
  if (contrastRatio(fg, bg) >= target) return fg;
  const toward = contrastRatio('#000000', bg) >= contrastRatio('#FFFFFF', bg) ? '#000000' : '#FFFFFF';
  for (let i = 1; i <= 20; i++) {
    const candidate = mixHex(fg, toward, i / 20);
    if (contrastRatio(candidate, bg) >= target) return candidate;
  }
  return toward;
}

export function formatRatio(ratio: number): string {
  return `${ratio.toFixed(1)}:1`;
}
