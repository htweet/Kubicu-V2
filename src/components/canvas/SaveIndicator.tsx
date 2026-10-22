import React from 'react';
import { CheckIcon, CloudOffIcon, Loader2Icon, AlertTriangleIcon } from 'lucide-react';
import type { SaveStatus } from '../../types/page';
import { formatRelative } from '../../utils/format';
import { cn } from '../../utils/cn';

interface SaveIndicatorProps {
  status: SaveStatus;
  lastSavedAt: string | null;
  onRetry: () => void;
  compact?: boolean;
}

export function SaveIndicator({ status, lastSavedAt, onRetry, compact }: SaveIndicatorProps) {
  const base = 'inline-flex items-center gap-1.5 whitespace-nowrap text-caption font-medium';

  if (status === 'saving') {
    return (
      <span className={cn(base, 'text-fg-subtle')} role="status" aria-live="polite">
        <Loader2Icon size={13} className="animate-spin" aria-hidden />
        Saving…
      </span>);

  }
  if (status === 'offline') {
    return (
      <span className={cn(base, 'text-warning')} role="status" aria-live="polite" title="Changes are kept on this device and will save when you reconnect.">
        <CloudOffIcon size={13} aria-hidden />
        {compact ? 'Offline' : 'Offline — kept on this device'}
      </span>);

  }
  if (status === 'conflict') {
    return (
      <span className={cn(base, 'text-warning')} role="status" aria-live="polite" title="This page was changed in another tab. Choose which version to keep.">
        <AlertTriangleIcon size={13} aria-hidden />
        {compact ? 'Paused' : 'Saving paused'}
      </span>);

  }
  if (status === 'error') {
    return (
      <span className={cn(base, 'text-danger')} role="alert">
        <AlertTriangleIcon size={13} aria-hidden />
        {compact ? 'Not saved' : 'Save failed'}
        <button
          type="button"
          onClick={onRetry}
          className="ml-0.5 rounded-sm px-1 font-semibold underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          
          Retry
        </button>
      </span>);

  }
  return (
    <span className={cn(base, 'text-fg-subtle')} role="status" aria-live="polite">
      <CheckIcon size={13} className="text-success" aria-hidden />
      {compact || !lastSavedAt ? 'Saved' : `Saved ${formatRelative(lastSavedAt)}`}
    </span>);

}