import type { Availability, Booking, Service, StaffHours } from '../../types/ops';
import { dateKeyInTz, weekdayOfKey } from './slots';

/** Staff customers can book for a service (D140). Empty = book the business as one. */
export function eligibleStaff(service: Service, a: Availability): StaffHours[] {
  const bookable = (a.staff ?? []).filter((s) => s.bookable);
  if (!bookable.length) return [];
  const ids = service.staffIds ?? [];
  return ids.length ? bookable.filter((s) => ids.includes(s.memberId)) : bookable;
}

/** True when the business takes bookings per person. */
export function usesStaff(a: Availability): boolean {
  return (a.staff ?? []).some((s) => s.bookable);
}

export function isAway(s: StaffHours, dateKey: string): TimeOffHit | null {
  const hit = s.timeOff.find((t) => dateKey >= t.from && dateKey <= t.to);
  return hit ? { id: hit.id, reason: hit.reason } : null;
}
interface TimeOffHit {
  id: string;
  reason: string;
}

/** This person's own window for a day, or null when they don't work it. Narrowed later to the business hours. */
export function staffHoursFor(s: StaffHours, dateKey: string): { open: string; close: string } | 'business' | null {
  if (isAway(s, dateKey)) return null;
  if (!s.weekly) return 'business';
  const w = s.weekly.find((h) => h.day === weekdayOfKey(dateKey));
  return !w || w.closed ? null : { open: w.open, close: w.close };
}

/** Busy events from this person's own connected calendar. */
export function staffBusy(s: StaffHours, a: Availability): { start: number; end: number }[] {
  if (!s.calendarId) return [];
  const c = (a.calendars ?? []).find((x) => x.id === s.calendarId && x.status === 'ok');
  if (!c) return [];
  return c.events.filter((e) => !e.bookingId && c.calendars.find((x) => x.id === e.calendarId)?.blocks).map((e) => ({ start: Date.parse(e.start), end: Date.parse(e.end) }));
}

/** Calendar connections that belong to a person block only that person; the rest still block everyone. */
export function personalCalendarIds(a: Availability): Set<string> {
  return new Set((a.staff ?? []).map((s) => s.calendarId).filter((x): x is string => !!x));
}

/**
 * Who gets an "Anyone available" booking: the free person with the fewest bookings that day,
 * ties broken by name (D140).
 */
export function pickStaff(free: string[], a: Availability, bookings: Booking[], dateKey: string): string | null {
  if (!free.length) return null;
  const staff = (a.staff ?? []).filter((s) => free.includes(s.memberId));
  const load = (id: string) => bookings.filter((b) => b.assigneeId === id && (b.status === 'confirmed' || b.status === 'pending_deposit' || b.status === 'requested') && dateKeyInTz(Date.parse(b.start), a.timeZone) === dateKey).length;
  return [...staff].sort((x, y) => load(x.memberId) - load(y.memberId) || x.name.localeCompare(y.name))[0]?.memberId ?? null;
}

export function staffName(a: Availability, id: string | null | undefined): string | null {
  if (!id) return null;
  return (a.staff ?? []).find((s) => s.memberId === id)?.name ?? null;
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}
