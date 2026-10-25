import type { BackgroundFocus, PageBackgroundMode, PageGradient, PageTheme } from '../types/page';

/**
 * The owner's page background (D182), resolved into what the page surface draws and what the
 * readability check must test. 'theme' (or missing) keeps the preset's own backdrop and artwork,
 * so every existing page renders exactly as before.
 */
export interface ResolvedBackground {
  mode: PageBackgroundMode;
  backdrop?: string;
  backdropMobile?: string;
  image?: string;
  /** Extra colours text may sit on, beyond `theme.background`. */
  stops: string[];
  /** True when the owner chose it — these fall back to the plain colour for reduced transparency. */
  custom: boolean;
}

export const GRADIENT_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315] as const;

export function backgroundMode(theme: PageTheme): PageBackgroundMode {
  return theme.backgroundMode ?? 'theme';
}

export function resolveBackground(theme: PageTheme): ResolvedBackground {
  const mode = backgroundMode(theme);
  switch (mode) {
    case 'solid':
      return { mode, stops: [], custom: true };
    case 'gradient':{
        const g = theme.backgroundGradient ?? defaultGradient(theme);
        return { mode, backdrop: gradientCss(g), backdropMobile: g.calmOnPhones ? calmGradientCss(g) : gradientCss(g), stops: g.stops, custom: true };
      }
    case 'image':{
        if (!theme.backgroundImage) return { mode, stops: [], custom: true };
        const tone = theme.backgroundTone ? [veiledTone(theme.backgroundTone, theme.background, theme.backgroundVeil ?? 40)] : [];
        return { mode, image: theme.backgroundImage, stops: tone, custom: true };
      }
    default:{
        const m = theme.material;
        return { mode: 'theme', backdrop: m?.backdrop, backdropMobile: m?.backdropMobile ?? m?.backdrop, image: theme.backgroundImage, stops: m?.backdropStops ?? [], custom: false };
      }
  }
}

/** Swatch/thumbnail background for theme cards. */
export function backgroundPreview(theme: PageTheme): string {
  const r = resolveBackground(theme);
  if (r.image) return `center / cover no-repeat url("${r.image}"), ${theme.background}`;
  return r.backdrop ?? theme.background;
}

export function gradientCss(g: PageGradient): string {
  const stops = g.stops.join(', ');
  if (g.kind === 'radial') {
    const [x, y] = radialOrigin(g.angle);
    return `radial-gradient(120% 90% at ${x}% ${y}%, ${stops})`;
  }
  return `linear-gradient(${g.angle}deg, ${stops})`;
}

/** Phones: one gentle top-to-bottom fade between the first and last colours. */
export function calmGradientCss(g: PageGradient): string {
  return `linear-gradient(180deg, ${g.stops[0]}, ${g.stops[g.stops.length - 1]} 75%)`;
}

/** Starting blends drawn from the page's own colours. */
export function gradientSuggestions(theme: PageTheme): {name: string;gradient: PageGradient;}[] {
  const bg = theme.background;
  return [
  { name: 'Soft accent', gradient: { stops: [mixHex(theme.accent, bg, 0.22), bg], kind: 'linear', angle: 180, calmOnPhones: true } },
  { name: 'Glow', gradient: { stops: [mixHex(theme.accent, bg, 0.3), mixHex(theme.surface, bg, 0.5), bg], kind: 'radial', angle: 315, calmOnPhones: true } },
  { name: 'Two tone', gradient: { stops: [mixHex(theme.accent, bg, 0.16), mixHex(theme.mutedText, bg, 0.14)], kind: 'linear', angle: 135, calmOnPhones: true } },
  { name: 'Surface', gradient: { stops: [theme.surface, bg], kind: 'linear', angle: 180, calmOnPhones: true } }];

}

export function defaultGradient(theme: PageTheme): PageGradient {
  return gradientSuggestions(theme)[0].gradient;
}

export const FOCUS_POINTS: BackgroundFocus[] = ['top left', 'top', 'top right', 'left', 'center', 'right', 'bottom left', 'bottom', 'bottom right'];

/** What a visitor actually sees behind text over an image: its average colour under the veil. */
export function veiledTone(tone: string, background: string, veilPct: number): string {
  return mixHex(background, tone, Math.min(90, Math.max(0, veilPct)) / 100);
}

/** Mixes `a` into `b` by `amount` (0 = b, 1 = a). Hex colours only; anything else returns `b`. */
export function mixHex(a: string, b: string, amount: number): string {
  const pa = parseHex(a);
  const pb = parseHex(b);
  if (!pa || !pb) return b;
  const c = pa.map((v, i) => Math.round(v * amount + pb[i] * (1 - amount)));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

/** Average colour of an image (sampled small), for the readability check. */
export function averageTone(img: CanvasImageSource): string | undefined {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 24;
    canvas.height = 24;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    ctx.drawImage(img, 0, 0, 24, 24);
    const px = ctx.getImageData(0, 0, 24, 24).data;
    let r = 0;
    let g = 0;
    let b = 0;
    const n = px.length / 4;
    for (let i = 0; i < px.length; i += 4) {
      r += px[i];
      g += px[i + 1];
      b += px[i + 2];
    }
    return `#${[r, g, b].map((v) => Math.round(v / n).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
  } catch {
    return undefined;
  }
}

function parseHex(hex: string): number[] | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].split('').map((c) => c + c).join('') : m[1];
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

function radialOrigin(angle: number): [number, number] {
  // The light comes from the direction the angle points to; 0° = top centre.
  const rad = angle * Math.PI / 180;
  return [Math.round(50 + Math.sin(rad) * 45), Math.round(50 - Math.cos(rad) * 45)];
}