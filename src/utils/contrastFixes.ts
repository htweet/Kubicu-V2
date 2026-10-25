import type { PageTheme } from '../types/page';
import { CONTRAST_TARGET, contrastRatio, readableOn } from './contrast';
import { resolveBackground } from './pageBackground';

export type ContrastKey = 'text' | 'muted' | 'button';

export interface ContrastFix {
  theme: Partial<PageTheme>;
  /** Short button label, e.g. "Use #2A2A2A". */
  label: string;
  /** What changes and the resulting ratio. */
  description: string;
  ratio: number;
}

export const contrastCopy: Record<ContrastKey, {name: string;guidance: string;}> = {
  text: {
    name: 'Body text',
    guidance:
    'Visitors on bright phone screens, in sunlight or with low vision may not be able to read your page. Use darker text on a light background, or lighter text on a dark one.'
  },
  muted: {
    name: 'Secondary text',
    guidance:
    'Taglines, captions and descriptions are too faint. Move the secondary text colour closer to your main text colour — it can stay softer, just not washed out.'
  },
  button: {
    name: 'Featured button text',
    guidance:
    'Your most important buttons are hard to read. Pick button text that is clearly lighter or darker than the button colour — white or near-black usually works.'
  }
};

/**
 * Live-page safety net (D76): returns a theme whose text, secondary text and featured-button
 * text all reach 4.5:1, shifting only the colours that fall short. The saved theme is untouched.
 */
export function liveReadableTheme(theme: PageTheme): PageTheme {
  const text = readableOn(readableOn(theme.text, theme.background), theme.surface);
  const mutedText = readableOn(readableOn(theme.mutedText, theme.background), theme.surface);
  let { accent, accentText } = theme;
  if (contrastRatio(accentText, accent) < CONTRAST_TARGET) {
    const fix = suggestContrastFix(theme, 'button').theme;
    accent = fix.accent ?? accent;
    accentText = fix.accentText ?? accentText;
  }
  if (text === theme.text && mutedText === theme.mutedText && accent === theme.accent && accentText === theme.accentText) return theme;
  return { ...theme, text, mutedText, accent, accentText };
}

export function suggestContrastFix(theme: PageTheme, key: ContrastKey): ContrastFix {
  // D182: gradients and images add colours text can sit on, so a fix must clear all of them.
  const grounds = [theme.background, ...resolveBackground(theme).stops];
  const clearAll = (fg: string) => grounds.reduce((c, g) => readableOn(c, g, CONTRAST_TARGET), fg);
  const worst = (fg: string) => Math.min(...grounds.map((g) => contrastRatio(fg, g)));
  if (key === 'text') {
    const text = clearAll(theme.text);
    const ratio = worst(text);
    return { theme: { text, presetId: 'custom' }, label: `Use ${text}`, description: `Change text colour to ${text}`, ratio };
  }
  if (key === 'muted') {
    const mutedText = clearAll(theme.mutedText);
    const ratio = worst(mutedText);
    return {
      theme: { mutedText, presetId: 'custom' },
      label: `Use ${mutedText}`,
      description: `Change secondary text to ${mutedText}`,
      ratio
    };
  }
  const accentText = readableOn(theme.accentText, theme.accent, CONTRAST_TARGET);
  const ratio = contrastRatio(accentText, theme.accent);
  if (ratio >= CONTRAST_TARGET) {
    return {
      theme: { accentText, presetId: 'custom' },
      label: `Use ${accentText}`,
      description: `Change button text to ${accentText}`,
      ratio
    };
  }
  const textColor = contrastRatio('#FFFFFF', theme.accent) >= contrastRatio('#000000', theme.accent) ? '#FFFFFF' : '#000000';
  const accent = readableOn(theme.accent, textColor, CONTRAST_TARGET);
  return {
    theme: { accent, accentText: textColor, presetId: 'custom' },
    label: `Use ${accent}`,
    description: `Change button colour to ${accent} with ${textColor} text`,
    ratio: contrastRatio(textColor, accent)
  };
}