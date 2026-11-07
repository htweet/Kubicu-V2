import React from 'react';
import { SplitIcon, XIcon } from 'lucide-react';
import type { SourceId } from '../../types/analytics';
import { sourceLabels } from '../../utils/analytics/track';
import { intentSources } from '../../utils/intentflow';
import { cn } from '../../utils/cn';

interface Props {
  source: SourceId | null;
  onChange: (s: SourceId | null) => void;
  hiddenCount: number;
  className?: string;
}

/** "Preview as" for IntentFlow (D64). Only shown when the site has source rules. */
export function SourcePreviewBar({ source, onChange, hiddenCount, className }: Props) {
  return (
    <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-md border border-line bg-raised px-3 py-2', source && 'border-info/40 bg-info-soft', className)} onClick={(e) => e.stopPropagation()}>
      <SplitIcon size={15} className={source ? 'text-info' : 'text-fg-muted'} aria-hidden />
      <label htmlFor="preview-source" className="text-label font-medium text-fg">
        Preview as
      </label>
      <select
        id="preview-source"
        value={source ?? ''}
        onChange={(e) => onChange((e.target.value || null) as SourceId | null)}
        className="h-8 rounded-md border border-line-strong bg-field px-2 text-label text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        <option value="">Editing — every block</option>
        {intentSources.map((s) => (
          <option key={s} value={s}>
            {sourceLabels[s]} visitors
          </option>
        ))}
      </select>
      <span className="min-w-0 flex-1 text-caption text-fg-muted">
        {source ? (hiddenCount ? `${hiddenCount} block${hiddenCount === 1 ? '' : 's'} hidden for them` : 'They see every block') : 'Some blocks show only to certain sources'}
      </span>
      {source && (
        <button type="button" onClick={() => onChange(null)} className="flex h-8 items-center gap-1 rounded-md px-2 text-caption font-medium text-fg hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          <XIcon size={13} aria-hidden /> Stop
        </button>
      )}
    </div>
  );
}
