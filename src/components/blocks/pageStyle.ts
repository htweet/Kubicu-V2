import type React from 'react';
import type { BlockStyle, PageTheme, ShadowLevel } from '../../types/page';
import { fontPairs } from '../../data/pageThemes';
import { themeFonts } from '../../data/themeFonts';

/*
 * The one place page blocks read the theme (D161). Classic themes (no `material`) produce exactly the
 * styles they always have; Signature themes add atmosphere, surface finish, depth, shape and button finish.
 */

export function fontsFor(theme: PageTheme) {
  const pair = fontPairs.find((f) => f.id === theme.fontPair) ?? fontPairs[0];
  const m = theme.material;
  if (!m?.headingFont && !m?.bodyFont) return pair;
  return {
    ...pair,
    display: m.headingFont ? themeFonts[m.headingFont].stack : pair.display,
    body: m.bodyFont ? themeFonts[m.bodyFont].stack : pair.body
  };
}

/** Heading weight and tracking from the theme, for display type. */
export function headingStyle(theme: PageTheme): React.CSSProperties {
  const m = theme.material;
  return { fontFamily: fontsFor(theme).display, ...(m?.headingWeight ? { fontWeight: m.headingWeight } : {}), ...(m?.headingTracking ? { letterSpacing: m.headingTracking } : {}) };
}

export function mix(color: string, percent: number, base = 'transparent'): string {
  return `color-mix(in srgb, ${color} ${percent}%, ${base})`;
}

export function buttonRadius(theme: PageTheme): number {
  return { pill: 999, rounded: 14, square: 4 }[theme.buttonShape];
}

const radiusScale = { sharp: [2, 2], soft: [10, 8], round: [20, 12], generous: [28, 14] } as const;

export function cardRadius(theme: PageTheme): number {
  const r = theme.material?.radius;
  return r ? radiusScale[r][0] : { pill: 22, rounded: 14, square: 4 }[theme.buttonShape];
}

export function inputRadius(theme: PageTheme): number {
  const r = theme.material?.radius;
  return r ? radiusScale[r][1] : { pill: 12, rounded: 10, square: 4 }[theme.buttonShape];
}

/** Accent that stays visible when the accent equals the text colour. */
export function accentOf(theme: PageTheme): string {
  return theme.accent === theme.text ? theme.mutedText : theme.accent;
}

export function borderColor(theme: PageTheme, strength = 9): string {
  const m = theme.material;
  if (m?.border) return m.border;
  return mix(theme.text, m?.borderStrength ?? strength);
}

export function shadowFor(theme: PageTheme, level: ShadowLevel | undefined = theme.material?.shadow): string | undefined {
  switch (level) {
    case 'soft':
      return '0 1px 2px rgba(0,0,0,0.05), 0 10px 28px -16px rgba(0,0,0,0.22)';
    case 'lifted':
      return '0 2px 4px rgba(0,0,0,0.06), 0 24px 48px -22px rgba(0,0,0,0.38)';
    case 'glow':
      return `0 0 0 1px ${mix(theme.material?.glow ?? theme.accent, 22)}, 0 18px 50px -18px ${mix(theme.material?.glow ?? theme.accent, 55)}`;
    default:
      return undefined;
  }
}

/**
 * A surface (card, panel) in the theme's finish. Glass reads `--kb-glass-override` so reduced transparency
 * can swap in the solid surface, and `--kb-blur` so blur can be switched off (see PageSurface + index.css).
 */
export function surfaceStyle(theme: PageTheme): React.CSSProperties {
  const m = theme.material;
  const finish = m?.surfaceFinish ?? 'matte';
  const insetHighlight = m?.edgeHighlight ? 'inset 0 1px 0 rgba(255,255,255,0.18)' : undefined;
  const shadow = [insetHighlight, shadowFor(theme)].filter(Boolean).join(', ') || undefined;
  switch (finish) {
    case 'glass':{
        const translucent = mix(theme.surface, m?.glassOpacity ?? 60);
        return {
          background: `var(--kb-glass-override, ${translucent})`,
          backdropFilter: 'var(--kb-blur, none)',
          WebkitBackdropFilter: 'var(--kb-blur, none)',
          boxShadow: shadow
        };
      }
    case 'satin':
      return { background: `linear-gradient(180deg, ${mix('#FFFFFF', 7, theme.surface)}, ${theme.surface})`, boxShadow: shadow };
    case 'lacquer':
      return {
        background: `linear-gradient(180deg, ${mix('#FFFFFF', 10, theme.surface)} 0%, ${theme.surface} 38%, ${mix('#000000', 6, theme.surface)} 100%)`,
        boxShadow: ['inset 0 1px 0 rgba(255,255,255,0.14)', shadowFor(theme)].filter(Boolean).join(', ')
      };
    default:
      return { background: theme.surface, boxShadow: shadow };
  }
}

/** Primary action background for the theme's button finish. */
function primaryFill(theme: PageTheme): React.CSSProperties {
  const m = theme.material;
  const second = m?.secondary ?? theme.accent;
  switch (m?.buttonFinish) {
    case 'gradient':
      return { background: m.buttonGradient ?? `linear-gradient(135deg, ${theme.accent}, ${second})`, border: '1px solid transparent' };
    case 'gloss':
      return {
        background: `linear-gradient(180deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.06) 48%, rgba(0,0,0,0) 52%), ${m.buttonGradient ?? theme.accent}`,
        border: `1px solid ${mix('#FFFFFF', 22, theme.accent)}`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.35), 0 8px 22px -10px ${mix(theme.accent, 70)}`
      };
    case 'glow':
      return {
        background: m.buttonGradient ?? theme.accent,
        border: `1px solid ${mix(m.glow ?? theme.accent, 70, '#FFFFFF')}`,
        boxShadow: `0 0 0 3px ${mix(m.glow ?? theme.accent, 18)}, 0 10px 30px -10px ${mix(m.glow ?? theme.accent, 70)}`
      };
    default:
      return { background: theme.accent, border: `1px solid ${theme.accent}` };
  }
}

export function buttonStyle(theme: PageTheme, emphasis: BlockStyle['emphasis']): React.CSSProperties {
  const radius = buttonRadius(theme);
  const m = theme.material;
  if (emphasis === 'featured') {
    return { ...primaryFill(theme), color: theme.accentText, borderRadius: radius, ...(m?.sheen ? { ['--kb-sheen' as string]: '1' } : {}) };
  }
  if (emphasis === 'subtle') {
    return { background: 'transparent', color: theme.text, borderRadius: radius, border: '1px solid transparent' };
  }
  switch (theme.buttonStyle) {
    case 'outline':
      return { background: 'transparent', color: theme.text, borderRadius: radius, border: `1.5px solid ${m?.border ?? theme.text}` };
    case 'soft':
      return {
        background: mix(theme.accent, 12, theme.background),
        color: theme.text,
        borderRadius: radius,
        border: '1px solid transparent'
      };
    default:
      if (!m) return { background: theme.surface, color: theme.text, borderRadius: radius, border: `1px solid ${mix(theme.text, 12)}` };
      return { ...surfaceStyle(theme), color: theme.text, borderRadius: radius, border: `1px solid ${borderColor(theme, 12)}` };
  }
}

export function cardStyle(theme: PageTheme): React.CSSProperties {
  if (!theme.material) {
    return { background: theme.surface, borderRadius: cardRadius(theme), border: `1px solid ${mix(theme.text, 9)}` };
  }
  return { ...surfaceStyle(theme), borderRadius: cardRadius(theme), border: `1px solid ${borderColor(theme)}` };
}

export function inputStyle(theme: PageTheme): React.CSSProperties {
  const m = theme.material;
  return {
    background: m?.surfaceFinish === 'glass' ? mix(theme.background, 72) : theme.background,
    color: theme.text,
    borderRadius: inputRadius(theme),
    border: `1px solid ${m?.border ? mix(m.border, 100) : mix(theme.text, 18)}`
  };
}

/** Frame for photos and media, from the theme (D161). Classic themes: no frame. */
export function imageFrameStyle(theme: PageTheme): React.CSSProperties {
  switch (theme.material?.imageFrame) {
    case 'hairline':
      return { boxShadow: `0 0 0 1px ${borderColor(theme, 14)}` };
    case 'mat':
      return { padding: 6, background: theme.surface, boxShadow: `0 0 0 1px ${borderColor(theme, 10)}` };
    case 'shadow':
      return { boxShadow: shadowFor(theme, 'lifted') };
    default:
      return {};
  }
}