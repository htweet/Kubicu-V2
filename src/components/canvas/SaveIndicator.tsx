import React from 'react';
import { CheckIcon, CloudOffIcon, Loader2Icon, AlertTriangleIcon } from 'lucide-react';
import type { SaveStatus } from '../../types/page';
import { formatRelative } from '../../utils/format';
import { useT } from '../../contexts/LocaleContext';
import { cn } from '../../utils/cn';

interface SaveIndicatorProps {
  status: SaveStatus;
  lastSavedAt: string | null;
  onRetry: () => void;
  compact?: boolean;
}

export function SaveIndicator({ status, lastSavedAt, onRetry, compact }: SaveIndicatorProps) {
  const { t: tr } = useT();
  const base = 'inline-flex items-center gap-1.5 whitespace-nowrap text-caption font-medium';

  if (status === 'saving') {
    return (
      <span className={cn(base, 'text-fg-subtle')} role="status" aria-live="polite">
        <Loader2Icon size={13} className="animate-spin" aria-hidden />
        {tr('Saving…')}
      </span>
    );
  }
  if (status === 'offline') {
    return (
      <span className={cn(base, 'text-warning')} role="status" aria-live="polite" title={tr('Changes are kept on this device and will save when you reconnect.')}>
        <CloudOffIcon size={13} aria-hidden />
        {compact ? tr('Offline') : tr('Offline — kept on this device')}
      </span>
    );
  }
  if (status === 'conflict') {
    return (
      <span className={cn(base, 'text-warning')} role="status" aria-live="polite" title={tr('This page was changed in another tab. Choose which version to keep.')}>
        <AlertTriangleIcon size={13} aria-hidden />
        {compact ? tr('Paused') : tr('Saving paused')}
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className={cn(base, 'text-danger')} role="alert">
        <AlertTriangleIcon size={13} aria-hidden />
        {compact ? tr('Not saved') : tr('Save failed')}
        <button
          type="button"
          onClick={onRetry}
          className="ml-0.5 rounded-sm px-1 font-semibold underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          {tr('Retry')}
        </button>
      </span>
    );
  }
  return (
    <span className={cn(base, 'text-fg-subtle')} role="status" aria-live="polite">
      <CheckIcon size={13} className="text-success" aria-hidden />
      {compact || !lastSavedAt ? tr('Saved') : tr('Saved {when}', { when: formatRelative(lastSavedAt) })}
    </span>
  );
}
