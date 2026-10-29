/** Sync history for the email and Sheets sync extensions (D272). Kept on the extension's settings as JSON. */

export type SyncStatus = 'ok' | 'partial' | 'failed';

export interface SyncEntry {
  id: string;
  at: string;
  status: SyncStatus;
  /** Contacts or rows that would have gone across. */
  sent: number;
  /** Left out, with the reason in `detail`. */
  skipped: number;
  detail: string;
  /** Why it failed — something the owner can fix. */
  error?: string;
  /** Set when this run retried a failed one. */
  retryOf?: string;
}

export const MAX_SYNC_ENTRIES = 20;

export function readSyncLog(settings: Record<string, string>): SyncEntry[] {
  try {
    const parsed = JSON.parse(settings.syncLog ?? '[]');
    return Array.isArray(parsed) ? parsed as SyncEntry[] : [];
  } catch {
    return [];
  }
}

export function withSyncEntry(settings: Record<string, string>, entry: SyncEntry): Record<string, string> {
  const log = [entry, ...readSyncLog(settings)].slice(0, MAX_SYNC_ENTRIES);
  const lastOk = entry.status !== 'failed';
  return {
    ...settings,
    syncLog: JSON.stringify(log),
    ...(lastOk ? { lastSyncAt: entry.at, lastSyncCount: String(entry.sent) } : {})
  };
}

/**
 * Checks that can genuinely fail before anything is sent: no connection, or a credential that no longer
 * matches what the provider accepts. Returns the error to show, or null.
 */
export function preflight(value: string | undefined, pattern: RegExp, what: string): string | null {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return 'No internet connection. Nothing was sent — retry when you’re back online.';
  if (!value || !pattern.test(value)) return `The ${what} saved in this extension isn’t valid any more. Update it in Settings, then retry.`;
  return null;
}