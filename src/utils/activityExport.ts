import type { ActivityEntry } from '../types/team';
import { toCsv } from './csv';

/** Activity log exports (D439): CSV for people, JSON Lines for security tools, each with an integrity fingerprint. */
export type ActivityFormat = 'csv' | 'jsonl';

export interface ActivityRow extends ActivityEntry {
  workspace: string;
}

export const activityFormats: Record<ActivityFormat, {label: string;hint: string;ext: string;mime: string;}> = {
  csv: { label: 'Spreadsheet (CSV)', hint: 'Opens in Excel or Google Sheets.', ext: 'csv', mime: 'text/csv' },
  jsonl: { label: 'JSON Lines', hint: 'One event per line, for security tools like Splunk, Microsoft Sentinel or Datadog.', ext: 'jsonl', mime: 'application/x-ndjson' }
};

export function activityFile(rows: ActivityRow[], format: ActivityFormat): string {
  const sorted = [...rows].sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  if (format === 'csv') return toCsv(['when', 'workspace', 'who', 'area', 'what', 'id'], sorted.map((r) => [r.at, r.workspace, r.actor, r.area, r.text, r.id]));
  return sorted.map((r) => JSON.stringify({ id: r.id, timestamp: r.at, workspace: r.workspace, actor: r.actor, area: r.area, action: r.text, source: 'kubicu' })).join('\n') + '\n';
}

/** SHA-256 of the file, so whoever receives it can check it wasn't changed. */
export async function fingerprint(text: string): Promise<string> {
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).
    map((b) => b.toString(16).padStart(2, '0')).
    join('');
  } catch {
    let h = 0;
    for (let i = 0; i < text.length; i++) h = h * 31 + text.charCodeAt(i) >>> 0;
    return `fallback-${h.toString(16)}`;
  }
}

export function downloadText(filename: string, text: string, mime: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: `${mime};charset=utf-8` }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}