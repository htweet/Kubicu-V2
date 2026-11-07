import type { OpeningHours } from '../types/page';

export const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const dayShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Day of week and minutes since midnight in a given time zone. */
export function zonedNow(timeZone: string, now = new Date()): { day: number; minutes: number } {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(now);
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
    const day = dayShort.indexOf(get('weekday'));
    return { day: day < 0 ? now.getDay() : day, minutes: Number(get('hour')) * 60 + Number(get('minute')) };
  } catch {
    return { day: now.getDay(), minutes: now.getHours() * 60 + now.getMinutes() };
  }
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function formatTime(hhmm: string): string {
  const mins = toMinutes(hhmm);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const suffix = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m ? `${h12}:${String(m).padStart(2, '0')}${suffix}` : `${h12}${suffix}`;
}

export interface OpenStatus {
  open: boolean;
  label: string;
}

/** A translator: English phrase with {placeholders} in, display text out. Defaults to plain English. */
export type HoursTr = (phrase: string, vars?: Record<string, string | number>) => string;
const plain: HoursTr = (s, v) => (v ? s.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? '')) : s);

/** Plain-language time zone names for the four launch countries (D504); others show the zone id. */
const zoneNames: Record<string, string> = {
  'Africa/Lagos': 'West Africa Time',
  'Africa/Nairobi': 'East Africa Time',
  'Africa/Accra': 'Greenwich Mean Time',
  'Africa/Johannesburg': 'South Africa Standard Time',
};
export const timeZoneName = (timeZone: string, tr: HoursTr = plain) => (zoneNames[timeZone] ? tr(zoneNames[timeZone]) : timeZone);

/**
 * “Open now · until 6pm” or “Closed · opens Tue 10am”, computed in the business's time zone.
 * Pass the visitor's translator to get the label in their language (D504).
 */
export function openStatus(hours: OpeningHours[], timeZone: string, now = new Date(), tr: HoursTr = plain): OpenStatus | null {
  if (hours.length === 0) return null;
  const { day, minutes } = zonedNow(timeZone, now);
  const today = hours.find((h) => h.day === day);
  if (today && !today.closed) {
    const open = toMinutes(today.open);
    const close = toMinutes(today.close);
    if (minutes >= open && minutes < close) return { open: true, label: tr('Open now · until {time}', { time: formatTime(today.close) }) };
    if (minutes < open) return { open: false, label: tr('Closed · opens today {time}', { time: formatTime(today.open) }) };
  }
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    const next = hours.find((h) => h.day === d && !h.closed);
    if (next)
      return {
        open: false,
        label: i === 1 ? tr('Closed · opens tomorrow {time}', { time: formatTime(next.open) }) : tr('Closed · opens {day} {time}', { day: tr(dayShort[d]), time: formatTime(next.open) }),
      };
  }
  return { open: false, label: tr('Closed') };
}

/**
 * Groups consecutive days with the same hours: “Mon–Fri 9am–6pm”. `start`/`end` are day numbers (0 = Sunday)
 * so callers never have to parse the (possibly translated) `days` text.
 */
export function summarizeHours(hours: OpeningHours[], tr: HoursTr = plain): { days: string; time: string; start: number; end: number }[] {
  const ordered = [1, 2, 3, 4, 5, 6, 0].map((d) => hours.find((h) => h.day === d)).filter((h): h is OpeningHours => !!h);
  const rows: { start: number; end: number; time: string; closed: boolean }[] = [];
  ordered.forEach((h) => {
    const time = h.closed ? 'Closed' : `${formatTime(h.open)}–${formatTime(h.close)}`;
    const last = rows[rows.length - 1];
    if (last && last.time === time) last.end = h.day;
    else rows.push({ start: h.day, end: h.day, time, closed: !!h.closed });
  });
  return rows.map((r) => ({
    days: r.start === r.end ? tr(dayShort[r.start]) : `${tr(dayShort[r.start])}–${tr(dayShort[r.end])}`,
    time: r.closed ? tr('Closed') : r.time,
    start: r.start,
    end: r.end,
  }));
}

/** True when `day` (0 = Sunday) falls in a Monday-first range from summarizeHours. */
export function dayInRange(day: number, start: number, end: number): boolean {
  const pos = (d: number) => (d + 6) % 7;
  return pos(day) >= pos(start) && pos(day) <= pos(end);
}

export function defaultHours(): OpeningHours[] {
  return [0, 1, 2, 3, 4, 5, 6].map((day) => ({ day, open: '09:00', close: '18:00', closed: day === 0 }));
}
