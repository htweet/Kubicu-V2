import type { Availability, Booking, BusyEvent, CalendarConnection } from '../../types/ops';
import { addDaysKey, busyTimes, dateKeyInTz, zonedToUtc } from './slots';
import { uid } from '../id';

/** Simulated Google / Outlook connection (D137). No provider is contacted. */

export const providerName = { google: 'Google Calendar', outlook: 'Outlook' } as const;

export { busyTimes };

/** A few believable busy times over the next two weeks so the effect shows straight away. */
function sampleEvents(tz: string, calIds: {main: string;family: string;}): BusyEvent[] {
  const today = dateKeyInTz(Date.now(), tz);
  const out: BusyEvent[] = [];
  const add = (dayOffset: number, from: string, to: string, title: string, cal: string) => out.push({ id: uid('evt'), calendarId: cal, title, start: new Date(zonedToUtc(addDaysKey(today, dayOffset), from, tz)).toISOString(), end: new Date(zonedToUtc(addDaysKey(today, dayOffset), to, tz)).toISOString() });
  for (let d = 1; d <= 14; d++) {
    const wd = new Date(zonedToUtc(addDaysKey(today, d), '12:00', tz)).getUTCDay();
    if (wd === 2 || wd === 4) add(d, '13:00', '14:00', 'Lunch with supplier', calIds.main);
    if (wd === 3) add(d, '15:00', '17:00', 'School run & homework', calIds.family);
  }
  add(2, '10:00', '11:30', 'Fabric market — Balogun', calIds.main);
  add(6, '09:00', '18:00', 'Family wedding (owambe)', calIds.family);
  add(9, '11:00', '12:00', 'Bank — BVN update', calIds.main);
  return out;
}

export function newConnection(provider: CalendarConnection['provider'], account: string, memberName: string, tz: string): CalendarConnection {
  const main = uid('cal');
  const family = uid('cal');
  const now = new Date().toISOString();
  return {
    id: uid('conn'),
    provider,
    account,
    memberName,
    connectedAt: now,
    status: 'ok',
    lastSyncedAt: now,
    calendars: [
    { id: main, name: provider === 'google' ? account : 'Calendar', blocks: true },
    { id: family, name: 'Family', blocks: true },
    { id: uid('cal'), name: provider === 'google' ? 'Nigerian public holidays' : 'Holidays in Nigeria', blocks: false }],

    addTo: main,
    events: sampleEvents(tz, { main, family }),
    log: [{ at: now, text: `Connected ${providerName[provider]} (${account})` }]
  };
}

/**
 * Two-way sync: brings in busy times (unchanged in the simulation) and mirrors KUBICU bookings into the
 * chosen calendar — new and moved bookings are added or updated, cancelled ones removed.
 */
export function syncConnection(c: CalendarConnection, bookings: Booking[]): CalendarConnection {
  if (c.status !== 'ok') return c;
  const now = Date.now();
  const live = bookings.filter((b) => (b.status === 'confirmed' || b.status === 'pending_deposit') && Date.parse(b.end) > now);
  const mirrored = c.events.filter((e) => e.bookingId);
  let added = 0;
  let moved = 0;
  const kept: BusyEvent[] = [];
  for (const b of live) {
    const ex = mirrored.find((e) => e.bookingId === b.id);
    if (!ex) added++;else
    if (ex.start !== b.start || ex.end !== b.end) moved++;
    kept.push({ id: ex?.id ?? uid('evt'), calendarId: c.addTo, title: `${b.serviceName} — ${b.customer.name} (KUBICU)`, start: b.start, end: b.end, bookingId: b.id });
  }
  const removed = mirrored.filter((e) => !live.some((b) => b.id === e.bookingId)).length;
  const parts = [added && `added ${added}`, moved && `moved ${moved}`, removed && `removed ${removed} cancelled`].filter(Boolean);
  const at = new Date().toISOString();
  return { ...c, lastSyncedAt: at, events: [...c.events.filter((e) => !e.bookingId), ...kept], log: parts.length ? [{ at, text: `Bookings ${parts.join(', ')}` }, ...c.log].slice(0, 20) : c.log };
}

/** True when a booking sits on top of an outside busy time — shown as a warning on the Schedule. */
export function clashesWithCalendar(b: Booking, a: Availability): boolean {
  const s = Date.parse(b.start);
  const e = Date.parse(b.end);
  return busyTimes(a).some((x) => s < x.end && e > x.start);
}