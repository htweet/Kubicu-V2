import type React from 'react';
import type { BlockStyle, PageTheme } from '../../types/page';
import { fontPairs } from '../../data/pageThemes';

export function fontsFor(theme: PageTheme) {
  return fontPairs.find((f) => f.id === theme.fontPair) ?? fontPairs[0];
}

export function mix(color: string, percent: number, base = 'transparent'): string {
  return `color-mix(in srgb, ${color} ${percent}%, ${base})`;
}

export function buttonRadius(theme: PageTheme): number {
  return { pill: 999, rounded: 14, square: 4 }[theme.buttonShape];
}

export function cardRadius(theme: PageTheme): number {
  return { pill: 22, rounded: 14, square: 4 }[theme.buttonShape];
}

export function inputRadius(theme: PageTheme): number {
  return { pill: 12, rounded: 10, square: 4 }[theme.buttonShape];
}

export function buttonStyle(theme: PageTheme, emphasis: BlockStyle['emphasis']): React.CSSProperties {
  const radius = buttonRadius(theme);
  if (emphasis === 'featured') {
    return { background: theme.accent, color: theme.accentText, borderRadius: radius, border: `1px solid ${theme.accent}` };
  }
  if (emphasis === 'subtle') {
    return { background: 'transparent', color: theme.text, borderRadius: radius, border: '1px solid transparent' };
  }
  switch (theme.buttonStyle) {
    case 'outline':
      return { background: 'transparent', color: theme.text, borderRadius: radius, border: `1.5px solid ${theme.text}` };
    case 'soft':
      return {
        background: mix(theme.accent, 12, theme.background),
        color: theme.text,
        borderRadius: radius,
        border: '1px solid transparent'
      };
    default:
      return {
        background: theme.surface,
        color: theme.text,
        borderRadius: radius,
        border: `1px solid ${mix(theme.text, 12)}`
      };
  }
}

export function cardStyle(theme: PageTheme): React.CSSProperties {
  return {
    background: theme.surface,
    borderRadius: cardRadius(theme),
    border: `1px solid ${mix(theme.text, 9)}`
  };
}

export function inputStyle(theme: PageTheme): React.CSSProperties {
  return {
    background: theme.background,
    color: theme.text,
    borderRadius: inputRadius(theme),
    border: `1px solid ${mix(theme.text, 18)}`
  };
}