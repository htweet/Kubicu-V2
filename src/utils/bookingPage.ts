import type { Block, BookingPageSettings } from '../types/page';
import type { Availability, Booking, OpsData, Service } from '../types/ops';
import type { ValidationIssue } from './validation';
import { addDaysKey, dateKeyInTz, dayLabel, slotsFor, timeLabel, type Slot } from './ops/slots';

/*
 * Booking page spaces (D184). The page opens on chosen services from the Bookings app with each
 * one's next free time. Booking itself uses the existing sheet and rules — nothing is duplicated.
 */

export const MAX_BOOKING_SERVICES = 12;
/** How far ahead "next free time" looks, capped so the page stays quick. */
const LOOKAHEAD_DAYS = 60;

/** The chosen services that are still on, in the owner's order. */
export function bookingPageServices(s: BookingPageSettings, ops: OpsData | null | undefined): Service[] {
  if (!ops) return [];
  return s.serviceIds.map((id) => ops.services.find((x) => x.id === id)).filter((x): x is Service => !!x && x.active);
}

/** The first bookable slot within the business's booking horizon, or null when fully booked. */
export function nextFreeSlot(service: Service, a: Availability, bookings: Booking[], now = Date.now()): Slot | null {
  const today = dateKeyInTz(now, a.timeZone);
  const days = Math.min(Math.max(1, a.horizonDays), LOOKAHEAD_DAYS);
  for (let i = 0; i < days; i++) {
    const slots = slotsFor(addDaysKey(today, i), service, a, bookings, now);
    if (slots.length) return slots[0];
  }
  return null;
}

/** "Tue 28 Oct, 10:30am" in the business's time zone. */
export function slotWhen(slot: Slot, a: Availability): string {
  return `${dayLabel(slot.start, a.timeZone)}, ${timeLabel(slot.start, a.timeZone)}`;
}

export function lookaheadDays(a: Availability): number {
  return Math.min(Math.max(1, a.horizonDays), LOOKAHEAD_DAYS);
}

/** Digits only, at least 10 — enough to be a real WhatsApp number. */
export function validWhatsapp(phone: string): boolean {
  return phone.replace(/\D/g, '').length >= 10;
}

/** Pre-publish checks for a Booking page. */
export function bookingPageIssues(s: BookingPageSettings, blocks: Block[], ops: OpsData | null, appOn: boolean, now = Date.now()): ValidationIssue[] {
  const out: ValidationIssue[] = [];
  const push = (id: string, severity: ValidationIssue['severity'], message: string) => out.push({ id: `bookingpage:${id}`, blockId: null, severity, message });
  if (!appOn) push('app', 'error', 'Booking pages need the Bookings app. Install or resume it in Extensions.');
  if (!s.serviceIds.length) {
    push('services', 'error', 'Choose at least one service in Page settings → Booking page.');
    return out;
  }
  if (s.serviceIds.length > MAX_BOOKING_SERVICES) push('max', 'error', `A booking page shows up to ${MAX_BOOKING_SERVICES} services. Remove ${s.serviceIds.length - MAX_BOOKING_SERVICES}.`);
  const shown = bookingPageServices(s, ops);
  const off = s.serviceIds.length - shown.length;
  if (!shown.length) push('none-on', 'error', 'None of the chosen services is switched on in Bookings, so there’s nothing to book.');else
  if (off) push('off', 'warning', `${off} chosen service${off === 1 ? ' is' : 's are'} switched off or deleted in Bookings and won’t show.`);
  if (s.whatsapp.trim() && !validWhatsapp(s.whatsapp)) push('whatsapp', 'error', 'The WhatsApp number looks too short. Use the full number, e.g. 0803 123 4567.');
  if (ops && shown.length && shown.every((sv) => !nextFreeSlot(sv, ops.availability, ops.bookings, now))) {
    const fallback = !!s.whatsapp.trim() || !!s.waitlistBlockId && blocks.some((b) => b.id === s.waitlistBlockId && !b.visibility.hidden);
    push('full', fallback ? 'warning' : 'error', fallback ? 'No free times right now — visitors will be offered the waitlist or WhatsApp instead.' : 'No free times right now and no waitlist or WhatsApp number, so visitors would hit a dead end. Add one, or open more hours in Bookings.');
  }
  return out;
}