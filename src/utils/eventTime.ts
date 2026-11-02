export type EventState = 'unscheduled' | 'upcoming' | 'live' | 'ended';

export function eventState(startsAt: string | null, endsAt: string | null, now = Date.now()): EventState {
  if (!startsAt) return 'unscheduled';
  const start = Date.parse(startsAt);
  const end = endsAt ? Date.parse(endsAt) : start + 4 * 60 * 60 * 1000;
  if (now < start) return 'upcoming';
  if (now < end) return 'live';
  return 'ended';
}

/** `locale` comes from dateLocale() so visitors read dates in their language (D510); defaults to British English. */
export function formatEventDate(iso: string, timeZone: string, locale = 'en-GB'): string {
  try {
    return new Intl.DateTimeFormat(locale, { timeZone, weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso));
  } catch {
    return new Date(iso).toDateString();
  }
}

export function formatEventTime(iso: string, timeZone: string, locale = 'en-GB'): string {
  try {
    return new Intl.DateTimeFormat(locale, { timeZone, hour: 'numeric', minute: '2-digit', hour12: true, timeZoneName: 'short' }).
    format(new Date(iso)).
    replace(' am', 'am').
    replace(' pm', 'pm');
  } catch {
    return new Date(iso).toLocaleTimeString();
  }
}

export interface Remaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

export function remainingUntil(target: string | null, now = Date.now()): Remaining | null {
  if (!target) return null;
  const diff = Math.max(0, Date.parse(target) - now);
  const s = Math.floor(diff / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor(s % 86400 / 3600),
    minutes: Math.floor(s % 3600 / 60),
    seconds: s % 60,
    done: diff === 0
  };
}

/** A real future date for sample content, so examples don't expire. */
export function daysFromNow(days: number, hour = 12, minute = 0): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  d.setUTCHours(hour - 1, minute, 0, 0); // WAT is UTC+1
  return d.toISOString();
}