import React, { useState } from 'react';
import { AlertTriangleIcon, CheckCircle2Icon, CircleAlertIcon, RotateCwIcon } from 'lucide-react';
import type { SyncEntry } from '../../../utils/extensions/syncLog';
import { formatTimestamp } from '../../../utils/format';
import { Button } from '../../ui/Button';
import { cn } from '../../../utils/cn';

const statusMeta = {
  ok: { icon: CheckCircle2Icon, label: 'Synced', tone: 'text-success' },
  partial: { icon: AlertTriangleIcon, label: 'Synced with some left out', tone: 'text-warning' },
  failed: { icon: CircleAlertIcon, label: 'Failed', tone: 'text-danger' },
} as const;

/** Past syncs, newest first (D272). A failed run that hasn't been retried successfully gets a Retry button. */
export function SyncHistory({ entries, onRetry, unit }: { entries: SyncEntry[]; onRetry: (entry: SyncEntry) => void; unit: string }) {
  const [all, setAll] = useState(false);
  if (entries.length === 0) return <p className="text-caption text-fg-subtle">No syncs yet. Each one will be listed here with what went across and anything left out.</p>;
  const shown = all ? entries : entries.slice(0, 5);
  const retried = new Set(entries.filter((e) => e.retryOf && e.status !== 'failed').map((e) => e.retryOf));
  const latest = entries[0];

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-label font-semibold text-fg">Sync history</h4>
      {latest.status === 'failed' && (
        <p role="alert" className="flex items-start gap-2 rounded-md bg-danger-soft px-3 py-2 text-caption text-danger">
          <CircleAlertIcon size={14} className="mt-0.5 shrink-0" aria-hidden />
          The last sync failed: {latest.error}
        </p>
      )}
      <ol className="flex flex-col divide-y divide-line">
        {shown.map((e) => {
          const m = statusMeta[e.status];
          const Icon = m.icon;
          return (
            <li key={e.id} className="flex items-start gap-3 py-2.5">
              <Icon size={16} className={cn('mt-0.5 shrink-0', m.tone)} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-label text-fg">
                  <span className="font-medium">{m.label}</span>
                  {e.status !== 'failed' && (
                    <span className="text-fg-muted">
                      {' '}
                      · {e.sent} {unit}
                      {e.skipped ? `, ${e.skipped} left out` : ''}
                    </span>
                  )}
                  {e.retryOf && <span className="text-fg-subtle"> · retry</span>}
                </p>
                <p className="text-caption text-fg-subtle">
                  {formatTimestamp(e.at)}
                  {e.status === 'failed' ? ` · ${e.error}` : e.detail ? ` · ${e.detail}` : ''}
                </p>
              </div>
              {e.status === 'failed' && !retried.has(e.id) && e.id === entries.find((x) => x.status === 'failed' && !retried.has(x.id))?.id && (
                <Button size="sm" variant="secondary" leadingIcon={RotateCwIcon} onClick={() => onRetry(e)}>
                  Retry
                </Button>
              )}
            </li>
          );
        })}
      </ol>
      {entries.length > 5 && (
        <button type="button" onClick={() => setAll((v) => !v)} className="self-start text-caption font-medium text-action underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          {all ? 'Show fewer' : `Show all ${entries.length}`}
        </button>
      )}
    </div>
  );
}
