import type React from 'react';
import type { PageTheme } from '../../types/page';
import { buttonStyle, fontsFor, inputStyle } from '../blocks/pageStyle';

/** How a form looks: from a page theme (blocks, preview) or from app tokens (website). */
export interface FormSkin {
  text: string;
  muted: string;
  display?: string;
  input: React.CSSProperties;
  button: React.CSSProperties;
  danger: string;
}

export function skinFromTheme(theme: PageTheme): FormSkin {
  return { text: theme.text, muted: theme.mutedText, display: fontsFor(theme).display, input: inputStyle(theme), button: buttonStyle(theme, 'featured'), danger: theme.text };
}

export const appSkin: FormSkin = {
  text: 'rgb(var(--text-primary))',
  muted: 'rgb(var(--text-secondary))',
  input: { background: 'rgb(var(--field))', color: 'rgb(var(--text-primary))', border: '1px solid rgb(var(--border-strong))', borderRadius: 10 },
  button: { background: 'rgb(var(--action))', color: 'rgb(var(--on-action))', borderRadius: 10 },
  danger: 'rgb(var(--danger))'
};