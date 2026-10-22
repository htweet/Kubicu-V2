import React from 'react';
import type { PageTheme } from '../../types/page';
import { fontsFor } from './pageStyle';

/** The small heading many blocks carry (“Shop”, “Menu”, “Selected work”). */
export function BlockTitle({ theme, children, aside }: {theme: PageTheme;children: React.ReactNode;aside?: React.ReactNode;}) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h2 className="text-[22px] font-medium leading-tight tracking-[-0.01em]" style={{ fontFamily: fontsFor(theme).display, color: theme.text }}>
        {children}
      </h2>
      {aside}
    </div>);

}

/** Small status chip in the page's own theme. Always carries text, never colour alone. */
export function PageChip({ theme, tone = 'neutral', children }: {theme: PageTheme;tone?: 'neutral' | 'strong' | 'muted';children: React.ReactNode;}) {
  const style: React.CSSProperties =
  tone === 'strong' ?
  { background: theme.accent, color: theme.accentText } :
  tone === 'muted' ?
  { background: `color-mix(in srgb, ${theme.text} 8%, transparent)`, color: theme.mutedText } :
  { background: theme.surface, color: theme.text, border: `1px solid color-mix(in srgb, ${theme.text} 12%, transparent)` };
  return (
    <span className="inline-flex h-6 shrink-0 items-center whitespace-nowrap rounded-full px-2.5 text-[12px] font-semibold" style={style}>
      {children}
    </span>);

}