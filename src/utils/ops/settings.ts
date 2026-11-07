import type { OpsData, OpsSettings } from '../../types/ops';

/** Audience and Automations settings (D259). */
export const MAX_CONTACT_FIELDS = 8;
export const MAX_SAVED_TAGS = 30;

export const defaultOpsSettings: OpsSettings = {
  contactFields: [],
  savedTags: [],
  consentText: '',
  quietHours: { on: false, from: '21:00', to: '07:00' },
  defaultChannel: 'send_whatsapp',
  segments: [],
};

export const MAX_SEGMENTS = 12;

export function opsSettingsOf(d: Pick<OpsData, 'settings'> | null | undefined): OpsSettings {
  const s = d?.settings ?? {};
  return { ...defaultOpsSettings, ...s, quietHours: { ...defaultOpsSettings.quietHours, ...s.quietHours } };
}

/** Tidy tag: trimmed, single spaces, up to 24 characters. */
export const cleanTag = (t: string) => t.trim().replace(/\s+/g, ' ').slice(0, 24);

const minutesOf = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

/** Minutes past midnight now, in the business's time zone. */
function minutesIn(timeZone: string, now: number): number {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(now));
    const h = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
    const m = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
    return h * 60 + m;
  } catch {
    const d = new Date(now);
    return d.getHours() * 60 + d.getMinutes();
  }
}

/** Whether customer messages should wait right now. Handles ranges that cross midnight (21:00–07:00). */
export function inQuietHours(q: OpsSettings['quietHours'], timeZone: string, now = Date.now()): boolean {
  if (!q.on) return false;
  const from = minutesOf(q.from);
  const to = minutesOf(q.to);
  if (from === to) return false;
  const m = minutesIn(timeZone, now);
  return from < to ? m >= from && m < to : m >= from || m < to;
}
