import type { PageTheme } from '../types/page';
import { CONTRAST_TARGET, contrastRatio, readableOn } from './contrast';

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

export function suggestContrastFix(theme: PageTheme, key: ContrastKey): ContrastFix {
  if (key === 'text') {
    const text = readableOn(theme.text, theme.background, CONTRAST_TARGET);
    const ratio = contrastRatio(text, theme.background);
    return { theme: { text, presetId: 'custom' }, label: `Use ${text}`, description: `Change text colour to ${text}`, ratio };
  }
  if (key === 'muted') {
    const mutedText = readableOn(theme.mutedText, theme.background, CONTRAST_TARGET);
    const ratio = contrastRatio(mutedText, theme.background);
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