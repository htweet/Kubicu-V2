import type { OpeningHours } from '../types/page';

export const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const dayShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Day of week and minutes since midnight in a given time zone. */
export function zonedNow(timeZone: string, now = new Date()): {day: number;minutes: number;} {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
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

/** “Open now · until 6pm” or “Closed · opens Tue 10am”, computed in the business's time zone. */
export function openStatus(hours: OpeningHours[], timeZone: string, now = new Date()): OpenStatus | null {
  if (hours.length === 0) return null;
  const { day, minutes } = zonedNow(timeZone, now);
  const today = hours.find((h) => h.day === day);
  if (today && !today.closed) {
    const open = toMinutes(today.open);
    const close = toMinutes(today.close);
    if (minutes >= open && minutes < close) return { open: true, label: `Open now · until ${formatTime(today.close)}` };
    if (minutes < open) return { open: false, label: `Closed · opens today ${formatTime(today.open)}` };
  }
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    const next = hours.find((h) => h.day === d && !h.closed);
    if (next) return { open: false, label: `Closed · opens ${i === 1 ? 'tomorrow' : dayShort[d]} ${formatTime(next.open)}` };
  }
  return { open: false, label: 'Closed' };
}

/** Groups consecutive days with the same hours: “Mon–Fri 9am–6pm”. */
export function summarizeHours(hours: OpeningHours[]): {days: string;time: string;}[] {
  const ordered = [1, 2, 3, 4, 5, 6, 0].map((d) => hours.find((h) => h.day === d)).filter((h): h is OpeningHours => !!h);
  const rows: {start: number;end: number;time: string;}[] = [];
  ordered.forEach((h) => {
    const time = h.closed ? 'Closed' : `${formatTime(h.open)}–${formatTime(h.close)}`;
    const last = rows[rows.length - 1];
    if (last && last.time === time) last.end = h.day;else
    rows.push({ start: h.day, end: h.day, time });
  });
  return rows.map((r) => ({ days: r.start === r.end ? dayShort[r.start] : `${dayShort[r.start]}–${dayShort[r.end]}`, time: r.time }));
}

export function defaultHours(): OpeningHours[] {
  return [0, 1, 2, 3, 4, 5, 6].map((day) => ({ day, open: '09:00', close: '18:00', closed: day === 0 }));
}