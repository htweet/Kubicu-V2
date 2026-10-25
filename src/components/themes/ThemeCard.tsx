import React from 'react';
import { CheckIcon, LockIcon } from 'lucide-react';
import type { PageDocument } from '../../types/page';
import type { SignatureTheme } from '../../data/signatureThemes';
import { signatureTheme, themeMoodLabels } from '../../data/signatureThemes';
import { TemplateThumb } from '../templates/TemplateThumb';
import { cn } from '../../utils/cn';

interface ThemeCardProps {
  theme: SignatureTheme;
  referenceDoc: PageDocument;
  selected: boolean;
  locked: boolean;
  comparing: boolean;
  compareDisabled: boolean;
  onSelect: () => void;
  onToggleCompare: () => void;
}

/** One Signature theme in the gallery (D164): a real miniature page, not swatches alone. */
export function ThemeCard({ theme, referenceDoc, selected, locked, comparing, compareDisabled, onSelect, onToggleCompare }: ThemeCardProps) {
  const t = signatureTheme(theme);
  const m = t.material;
  const swatches = [t.background, t.surface, t.text, t.accent, m?.secondary].filter(Boolean) as string[];
  const modes = Object.keys(theme.modes);
  return (
    <li className={cn('flex gap-4 rounded-lg border bg-raised p-3 transition-[border-color,box-shadow] duration-150', selected ? 'border-select ring-1 ring-select' : 'border-line hover:border-line-strong')}>
      <button type="button" onClick={onSelect} aria-pressed={selected} aria-label={`Preview ${theme.name}`} className="shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
        <TemplateThumb doc={{ ...referenceDoc, theme: t }} width={104} height={168} />
      </button>
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Second hit area for the same action — kept out of the tab order so keyboard users meet one stop per card (D165). */}
        <button type="button" tabIndex={-1} onClick={onSelect} className="text-left focus-visible:outline-none">
          <p className="text-caption tabular-nums text-fg-subtle">
            {String(theme.number).padStart(2, '0')} · {themeMoodLabels[theme.mood]}
          </p>
          <h3 className="mt-0.5 flex items-center gap-1.5 truncate text-label font-semibold text-fg">
            {theme.name}
            {locked && <LockIcon size={12} className="shrink-0 text-fg-subtle" aria-label="Creator plan and above" />}
          </h3>
          <p className="mt-1 line-clamp-2 text-caption text-fg-muted">{theme.personality}</p>
        </button>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
          <span className="flex items-center gap-2">
            <span className="flex -space-x-1" aria-hidden>
              {swatches.map((c, i) =>
              <span key={i} className="h-4 w-4 rounded-full border border-line" style={{ background: c }} />
              )}
            </span>
            <span className="text-caption text-fg-subtle">{modes.length > 1 ? 'Light · Dark' : modes[0] === 'dark' ? 'Dark' : 'Light'}</span>
          </span>
          <label className={cn('inline-flex items-center gap-1.5 text-caption', compareDisabled && !comparing ? 'text-fg-subtle' : 'text-fg-muted')}>
            <input type="checkbox" checked={comparing} disabled={compareDisabled && !comparing} onChange={onToggleCompare} className="h-4 w-4 accent-[rgb(var(--select))]" />
            Compare
          </label>
        </div>
        {theme.free &&
        <span className="mt-2 inline-flex w-fit items-center gap-1 text-caption text-success">
            <CheckIcon size={12} aria-hidden /> On every plan
          </span>
        }
      </div>
    </li>);

}