import type { Availability, Booking, Service } from '../../types/ops';
import { eligibleStaff, personalCalendarIds, staffBusy, staffHoursFor, usesStaff } from './staff';
import { durationText, type FormatTr } from '../localeFormat';

/** Busy times that block bookings: events from calendars ticked "blocks", on working connections, not KUBICU's own (D137). */
export function busyTimes(a: Availability): {start: number;end: number;}[] {
  return (a.calendars ?? []).
  filter((c) => c.status === 'ok').
  flatMap((c) => c.events.filter((e) => !e.bookingId && c.calendars.find((x) => x.id === e.calendarId)?.blocks).map((e) => ({ start: Date.parse(e.start), end: Date.parse(e.end) })));
}

/** Milliseconds the zone is ahead of UTC at this instant. */
function tzOffsetMs(instant: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(instant));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
  return asUtc - Math.floor(instant / 1000) * 1000;
}

/** A wall-clock time in a zone → UTC instant. */
export function zonedToUtc(dateKey: string, hhmm: string, timeZone: string): number {
  const [y, mo, d] = dateKey.split('-').map(Number);
  const [h, mi] = hhmm.split(':').map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  return guess - tzOffsetMs(guess, timeZone);
}

export function dateKeyInTz(instant: number, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(instant));
}

export function weekdayOfKey(dateKey: string): number {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function addDaysKey(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return t.toISOString().slice(0, 10);
}

/** `locale` comes from dateLocale() on buyer screens (D510); everywhere else it stays en-NG as before. */
export function formatInTz(iso: string | number, timeZone: string, opts: Intl.DateTimeFormatOptions, locale = 'en-NG'): string {
  try {
    return new Intl.DateTimeFormat(locale, { timeZone, ...opts }).format(new Date(iso));
  } catch {
    return new Date(iso).toLocaleString();
  }
}

export function timeLabel(iso: string | number, timeZone: string, locale?: string): string {
  return formatInTz(iso, timeZone, { hour: 'numeric', minute: '2-digit', hour12: true }, locale).replace(' ', '').toLowerCase();
}

export function dayLabel(iso: string | number, timeZone: string, locale?: string): string {
  return formatInTz(iso, timeZone, { weekday: 'short', day: 'numeric', month: 'short' }, locale);
}

export function visitorTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Lagos';
  } catch {
    return 'Africa/Lagos';
  }
}

/** Opening window for a date, honouring overrides. Null = closed. */
export function hoursFor(dateKey: string, a: Availability): {open: string;close: string;} | null {
  const override = a.overrides.find((o) => o.date === dateKey);
  if (override) return override.closed ? null : { open: override.open, close: override.close };
  const w = a.weekly.find((h) => h.day === weekdayOfKey(dateKey));
  return !w || w.closed ? null : { open: w.open, close: w.close };
}

export interface Slot {
  start: number;
  end: number;
  /** People free at this time when the business books per person (D140). */
  staffIds?: string[];
  /** Group classes (D198): seats still free at this time, and the class size. */
  seatsLeft?: number;
  capacity?: number;
}

export const MAX_CLASS_SEATS = 50;

/** Seats per time: 1 for one-to-one services. */
export function classCapacity(service: Pick<Service, 'capacity'>): number {
  return Math.max(1, Math.min(MAX_CLASS_SEATS, service.capacity ?? 1));
}

/** People booked into one class time (same service, same start). */
export function classAttendees(bookings: Booking[], serviceId: string, start: number): Booking[] {
  return activeBookings(bookings).filter((b) => b.serviceId === serviceId && Date.parse(b.start) === start);
}

const STEP_MIN = 30;

export function activeBookings(bookings: Booking[], ignoreId?: string): Booking[] {
  return bookings.filter((b) => b.id !== ignoreId && holdsTime(b));
}

/** Confirmed bookings and requests waiting for an answer both keep their time (D256). */
export function holdsTime(b: Booking): boolean {
  return b.status === 'confirmed' || b.status === 'pending_deposit' || b.status === 'requested';
}

/** Requests the seller still has to accept or decline, soonest first (D256). */
export function openRequests(bookings: Booking[], now = Date.now()): Booking[] {
  return bookings.filter((b) => b.status === 'requested' && Date.parse(b.start) > now).sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
}

/**
 * Bookable start times for a service on a date (business time zone).
 * When the business books per person (D140), a time is offered if at least one eligible person
 * is free; pass `staffId` to see only that person's times.
 */
export function slotsFor(dateKey: string, service: Service, a: Availability, bookings: Booking[], now = Date.now(), ignoreId?: string, staffId?: string | null): Slot[] {
  const hours = hoursFor(dateKey, a);
  if (!hours) return [];
  const open = zonedToUtc(dateKey, hours.open, a.timeZone);
  const close = zonedToUtc(dateKey, hours.close, a.timeZone);
  const dur = service.durationMin * 60000;
  const buffer = service.bufferMin * 60000;
  const earliest = now + a.minNoticeHours * 3600000;
  const taken = activeBookings(bookings, ignoreId);
  const sameDay = taken.filter((b) => dateKeyInTz(Date.parse(b.start), a.timeZone) === dateKey);
  // Everyone in one group class counts as one appointment towards the daily limit (D198).
  const sessions = new Set(sameDay.map((b) => `${b.serviceId}@${Date.parse(b.start)}`)).size;
  const clashes = (list: Booking[], t: number) => list.some((b) => t < Date.parse(b.end) + buffer && t + dur + buffer > Date.parse(b.start));
  const overlaps = (list: {start: number;end: number;}[], t: number) => list.some((x) => t < x.end && t + dur > x.start);

  const cap = classCapacity(service);
  if (cap > 1) {
    // Group class: a time stays open until its seats are gone. Other bookings (and other class times) still clash.
    const busy = busyTimes(a).filter((x) => x.end > open && x.start < close);
    const out: Slot[] = [];
    for (let t = open; t + dur <= close; t += STEP_MIN * 60000) {
      if (t < earliest) continue;
      const mine = sameDay.filter((b) => b.serviceId === service.id && Date.parse(b.start) === t);
      if (mine.length >= cap) continue;
      if (!mine.length && sessions >= a.maxPerDay) continue;
      const others = sameDay.filter((b) => !(b.serviceId === service.id && Date.parse(b.start) === t));
      if (clashes(others, t) || overlaps(busy, t)) continue;
      out.push({ start: t, end: t + dur, seatsLeft: cap - mine.length, capacity: cap });
    }
    return out;
  }
  if (sessions >= a.maxPerDay) return [];

  const staff = eligibleStaff(service, a).filter((s) => !staffId || s.memberId === staffId);
  if (!usesStaff(a) || !staff.length && !staffId && !eligibleStaff(service, a).length) {
    // Booked as one business. Busy times from connected calendars block slots too (D137).
    const busy = busyTimes(a).filter((x) => x.end > open && x.start < close);
    const out: Slot[] = [];
    for (let t = open; t + dur <= close; t += STEP_MIN * 60000) {
      if (t < earliest) continue;
      if (!clashes(sameDay, t) && !overlaps(busy, t)) out.push({ start: t, end: t + dur });
    }
    return out;
  }

  // Per person: their hours inside the business hours, not away, no clash with their own bookings
  // (unassigned bookings block everyone), not busy on their own calendar. Shared calendars block all.
  const personal = personalCalendarIds(a);
  const sharedBusy = (a.calendars ?? []).
  filter((c) => c.status === 'ok' && !personal.has(c.id)).
  flatMap((c) => c.events.filter((e) => !e.bookingId && c.calendars.find((x) => x.id === e.calendarId)?.blocks).map((e) => ({ start: Date.parse(e.start), end: Date.parse(e.end) })));
  const unassigned = sameDay.filter((b) => !b.assigneeId);
  const windows = staff.
  map((s) => {
    const h = staffHoursFor(s, dateKey);
    if (!h) return null;
    const from = h === 'business' ? open : Math.max(open, zonedToUtc(dateKey, h.open, a.timeZone));
    const to = h === 'business' ? close : Math.min(close, zonedToUtc(dateKey, h.close, a.timeZone));
    return { id: s.memberId, from, to, own: sameDay.filter((b) => b.assigneeId === s.memberId), busy: staffBusy(s, a) };
  }).
  filter((w): w is NonNullable<typeof w> => !!w && w.to > w.from);
  const out: Slot[] = [];
  for (let t = open; t + dur <= close; t += STEP_MIN * 60000) {
    if (t < earliest || clashes(unassigned, t) || overlaps(sharedBusy, t)) continue;
    const free = windows.filter((w) => t >= w.from && t + dur <= w.to && !clashes(w.own, t) && !overlaps(w.busy, t)).map((w) => w.id);
    if (free.length) out.push({ start: t, end: t + dur, staffIds: free });
  }
  return out;
}

/** The matching slot, or null when the time isn't free (for that person, if given). */
export function findSlot(start: number, service: Service, a: Availability, bookings: Booking[], ignoreId?: string, staffId?: string | null): Slot | null {
  const key = dateKeyInTz(start, a.timeZone);
  return slotsFor(key, service, a, bookings, Date.now(), ignoreId, staffId).find((s) => s.start === start) ?? null;
}

export function isSlotFree(start: number, service: Service, a: Availability, bookings: Booking[], ignoreId?: string, staffId?: string | null): boolean {
  return !!findSlot(start, service, a, bookings, ignoreId, staffId);
}

/** Pass the visitor's translator on buyer screens so the units follow their language (D510). */
export function durationLabel(min: number, tr?: FormatTr): string {
  if (tr) return durationText(min, tr);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} hour${h === 1 ? '' : 's'}`;
}