import React from 'react';
import type { CoBrandSettings, PageTheme } from '../../types/page';
import { useT } from '../../contexts/LocaleContext';

/** Both businesses' names at the top of a co-branded page (D121), in the page's own colours. */
export function CoBrandStrip({ coBrand, theme }: { coBrand: CoBrandSettings; theme: PageTheme }) {
  const { t: tr } = useT();
  const mark = (name: string, filled: boolean) => (
    <span
      aria-hidden
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
      style={filled ? { background: theme.accent, color: theme.accentText } : { background: theme.surface, color: theme.text, boxShadow: `0 0 0 1px ${theme.mutedText}55` }}
    >
      {initials(name)}
    </span>
  );
  return (
    <div className="flex items-center justify-center gap-2.5 px-4 py-3" style={{ color: theme.text }} aria-label={tr('A page by {a} and {b}', { a: coBrand.leadName, b: coBrand.partnerName })} role="note">
      <span className="flex -space-x-1.5">
        {mark(coBrand.leadName, true)}
        {mark(coBrand.partnerName, false)}
      </span>
      <span className="min-w-0 truncate text-sm font-semibold">
        {coBrand.leadName} <span style={{ color: theme.mutedText }}>×</span> {coBrand.partnerName}
      </span>
    </div>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}
