import type { Booking, BookingStatus, Contact, ContactSource, ConsentStatus, OpsData, Service } from '../../types/ops';
import { uid } from '../id';
import { dateKeyInTz, findSlot } from './slots';
import { pickStaff, staffName } from './staff';

const now = () => new Date().toISOString();

// ——— Contacts ———

export interface ContactInput {
  name: string;
  email: string;
  phone: string;
}

function norm(s: string) {
  return s.trim().toLowerCase();
}
function normPhone(s: string) {
  return s.replace(/[^0-9]/g, '').slice(-10);
}

export function matchContact(contacts: Contact[], input: ContactInput): Contact | undefined {
  return contacts.find(
    (c) => input.email && norm(c.email) === norm(input.email) || input.phone && normPhone(input.phone).length >= 7 && normPhone(c.phone) === normPhone(input.phone)
  );
}

/**
 * Creates or updates a contact from an order, booking, form or signup. Consent only ever
 * moves toward “subscribed” when the person ticked it; it never overrides an opt-out.
 */
export function upsertContact(
data: OpsData,
input: ContactInput,
source: ContactSource,
label: string,
opts: {linkedId?: string;consent?: ConsentStatus;at?: string;} = {})
: OpsData {
  const at = opts.at ?? now();
  const existing = matchContact(data.contacts, input);
  if (existing && opts.linkedId && existing.linked.includes(opts.linkedId)) return data;
  if (existing) {
    const consent = existing.consent === 'unsubscribed' ? 'unsubscribed' : opts.consent === 'subscribed' ? 'subscribed' : existing.consent;
    const updated: Contact = {
      ...existing,
      name: existing.name || input.name,
      email: existing.email || input.email,
      phone: existing.phone || input.phone,
      sources: existing.sources.includes(source) ? existing.sources : [...existing.sources, source],
      consent,
      linked: opts.linkedId ? [...existing.linked, opts.linkedId] : existing.linked,
      activity: [
      { id: uid('act'), at, kind: source, label },
      ...(consent !== existing.consent ? [{ id: uid('act'), at, kind: 'consent' as const, label: 'Subscribed to updates' }] : []),
      ...existing.activity]

    };
    return { ...data, contacts: data.contacts.map((c) => c.id === existing.id ? updated : c) };
  }
  const contact: Contact = {
    id: uid('ct'),
    name: input.name.trim() || input.email || input.phone,
    email: input.email.trim(),
    phone: input.phone.trim(),
    sources: [source],
    consent: opts.consent ?? 'transactional',
    tags: [],
    notes: [],
    tasks: [],
    stage: 'new',
    activity: [{ id: uid('act'), at, kind: source, label }],
    linked: opts.linkedId ? [opts.linkedId] : [],
    createdAt: at
  };
  return { ...data, contacts: [contact, ...data.contacts] };
}

export function patchContact(data: OpsData, id: string, patch: Partial<Contact>, activity?: {kind: Contact['activity'][number]['kind'];label: string;}): OpsData {
  return {
    ...data,
    contacts: data.contacts.map((c) =>
    c.id === id ? { ...c, ...patch, activity: activity ? [{ id: uid('act'), at: now(), ...activity }, ...(patch.activity ?? c.activity)] : patch.activity ?? c.activity } : c
    )
  };
}

/** Pairs of contacts that look like the same person. */
export function duplicatePairs(contacts: Contact[]): [Contact, Contact][] {
  const pairs: [Contact, Contact][] = [];
  for (let i = 0; i < contacts.length; i++) {
    for (let j = i + 1; j < contacts.length; j++) {
      const a = contacts[i];
      const b = contacts[j];
      const sameEmail = a.email && norm(a.email) === norm(b.email);
      const samePhone = normPhone(a.phone).length >= 7 && normPhone(a.phone) === normPhone(b.phone);
      const sameName = norm(a.name) && norm(a.name) === norm(b.name);
      if (sameEmail || samePhone || sameName) pairs.push([a, b]);
    }
  }
  return pairs;
}

/** Keeps `keep`, folds in the other's details, history and links. */
export function mergeContacts(data: OpsData, keepId: string, dropId: string): OpsData {
  const keep = data.contacts.find((c) => c.id === keepId);
  const drop = data.contacts.find((c) => c.id === dropId);
  if (!keep || !drop) return data;
  const consent: ConsentStatus = keep.consent === 'unsubscribed' || drop.consent === 'unsubscribed' ? 'unsubscribed' : keep.consent === 'subscribed' || drop.consent === 'subscribed' ? 'subscribed' : 'transactional';
  const merged: Contact = {
    ...keep,
    email: keep.email || drop.email,
    phone: keep.phone || drop.phone,
    sources: Array.from(new Set([...keep.sources, ...drop.sources])),
    tags: Array.from(new Set([...keep.tags, ...drop.tags])),
    notes: [...keep.notes, ...drop.notes],
    tasks: [...keep.tasks, ...drop.tasks],
    linked: Array.from(new Set([...keep.linked, ...drop.linked])),
    consent,
    activity: [{ id: uid('act'), at: now(), kind: 'merge', label: `Merged with duplicate “${drop.name}”` }, ...keep.activity, ...drop.activity].sort((a, b) => Date.parse(b.at) - Date.parse(a.at)),
    createdAt: Date.parse(drop.createdAt) < Date.parse(keep.createdAt) ? drop.createdAt : keep.createdAt
  };
  return { ...data, contacts: data.contacts.filter((c) => c.id !== dropId).map((c) => c.id === keepId ? merged : c) };
}

// ——— Bookings ———

export interface BookingInput {
  service: Service;
  start: number;
  customer: {name: string;phone: string;email: string;};
  intake: string;
  depositOutcome: 'paid' | 'failed' | 'none';
  customerTimeZone: string;
  marketingConsent: boolean;
  /** A chosen person, or null/undefined for "Anyone available" (D140). */
  staffId?: string | null;
  /** The page or space handle the booking sheet was opened on (D191). */
  sourceHandle?: string;
  /** Answers to the service's own questions (D256). */
  answers?: {question: string;answer: string;}[];
}

export type BookingResult = {ok: true;data: OpsData;booking: Booking;} | {ok: false;reason: 'taken' | 'failed';message: string;};

export function createBooking(data: OpsData, input: BookingInput): BookingResult {
  const slot = findSlot(input.start, input.service, data.availability, data.bookings, undefined, input.staffId);
  if (!slot) {
    return { ok: false, reason: 'taken', message: input.staffId ? `${staffName(data.availability, input.staffId) ?? 'They'} just got booked at that time. Please pick another time or “Anyone available”.` : 'Someone just booked that time. Please pick another.' };
  }
  // Per-person booking (D140): the chosen person, or whoever free has the fewest bookings that day.
  const assigneeId = slot.staffIds ? input.staffId ?? pickStaff(slot.staffIds, data.availability, data.bookings, dateKeyInTz(input.start, data.availability.timeZone)) : undefined;
  const assigneeName = staffName(data.availability, assigneeId);
  if (input.depositOutcome === 'failed') return { ok: false, reason: 'failed', message: 'The test deposit payment didn’t go through. Your time isn’t held yet.' };
  const at = now();
  const ref = `B${data.nextBookingRef}`;
  const request = !!input.service.approval;
  const answers = (input.answers ?? []).filter((x) => x.answer.trim());
  const booking: Booking = {
    id: uid('bk'),
    ref,
    serviceId: input.service.id,
    serviceName: input.service.name,
    start: new Date(input.start).toISOString(),
    end: new Date(input.start + input.service.durationMin * 60000).toISOString(),
    customer: input.customer,
    intake: input.intake,
    answers: answers.length ? answers : undefined,
    status: request ? 'requested' : 'confirmed',
    depositPaidNgn: input.depositOutcome === 'paid' ? input.service.depositNgn ?? 0 : 0,
    priceNgn: input.service.priceNgn,
    balanceOnline: input.service.balanceOnline || undefined,
    balanceHoursBefore: input.service.balanceOnline ? input.service.balanceHoursBefore ?? 24 : undefined,
    customerTimeZone: input.customerTimeZone,
    assigneeId: assigneeId ?? undefined,
    sourceHandle: input.sourceHandle || undefined,
    events: [
    ...(input.depositOutcome === 'paid' ? [{ id: uid('bev'), at, label: `Deposit paid (test mode)` }] : []),
    {
      id: uid('bev'),
      at,
      label: request ?
      `Requested on your page${assigneeName ? ` with ${assigneeName}` : ''} — waiting for you to accept` :
      slot.capacity ?
      `Booked a seat on your page — seat ${slot.capacity - (slot.seatsLeft ?? 1) + 1} of ${slot.capacity}` :
      assigneeName ?
      `Booked on your page with ${assigneeName}${input.staffId ? '' : ' (anyone available)'}` :
      'Booked on your page'
    }]

  };
  // Online services with a connected video app get their meeting link now (D225) — requests get theirs once accepted.
  const withMeeting = request ? booking : attachMeeting(booking, input.service, data.availability);
  let next: OpsData = { ...data, bookings: [withMeeting, ...data.bookings], nextBookingRef: data.nextBookingRef + 1 };
  next = upsertContact(next, input.customer, 'booking', `${request ? 'Requested' : 'Booked'} ${input.service.name}`, { linkedId: booking.id, consent: input.marketingConsent ? 'subscribed' : 'transactional' });
  return { ok: true, data: next, booking: withMeeting };
}

export function rescheduleBooking(data: OpsData, bookingId: string, start: number, service: Service, by: 'customer' | 'owner'): {ok: boolean;data: OpsData;message?: string;} {
  const b = data.bookings.find((x) => x.id === bookingId);
  if (!b) return { ok: false, data, message: 'Booking not found' };
  const slot = findSlot(start, service, data.availability, data.bookings, bookingId);
  if (!slot) return { ok: false, data, message: 'That time was just taken. Pick another.' };
  // Keep the same person while they're free; otherwise hand it to whoever is (D140).
  let assigneeId = b.assigneeId;
  let moved = '';
  if (slot.staffIds && !(b.assigneeId && slot.staffIds.includes(b.assigneeId))) {
    assigneeId = pickStaff(slot.staffIds, data.availability, data.bookings, dateKeyInTz(start, data.availability.timeZone));
    const from = staffName(data.availability, b.assigneeId);
    const to = staffName(data.availability, assigneeId);
    if (to) moved = from ? ` · ${from} isn’t free then, so now with ${to}` : ` · with ${to}`;
  }
  const updated: Booking = {
    ...b,
    assigneeId,
    start: new Date(start).toISOString(),
    end: new Date(start + service.durationMin * 60000).toISOString(),
    events: [{ id: uid('bev'), at: now(), label: `Rescheduled by ${by === 'customer' ? 'customer' : 'you'}${moved}` }, ...b.events]
  };
  return { ok: true, data: { ...data, bookings: data.bookings.map((x) => x.id === bookingId ? updated : x) } };
}

/** Within the free-cancellation window the deposit is refunded; after it, it’s kept. */
export function cancelBooking(data: OpsData, bookingId: string, by: 'customer' | 'owner', reason: string): OpsData {
  return {
    ...data,
    bookings: data.bookings.map((b) => {
      if (b.id !== bookingId) return b;
      const inWindow = Date.parse(b.start) - Date.now() >= data.availability.cancelHours * 3600000;
      // A request that was never accepted (D256) always gets its deposit back.
      const refund = b.depositPaidNgn > 0 && (inWindow || by === 'owner' || b.status === 'requested');
      const label = `Cancelled by ${by === 'customer' ? 'customer' : 'you'}${reason ? ` — ${reason}` : ''}${b.depositPaidNgn ? refund ? ' · deposit refunded' : ' · deposit kept under policy' : ''}`;
      return { ...b, status: 'cancelled' as const, events: [{ id: uid('bev'), at: now(), label }, ...b.events] };
    })
  };
}

/** Cancels a whole group class time (D198): every attendee is cancelled by you, so every deposit is refunded. */
export function cancelClass(data: OpsData, serviceId: string, start: number, reason: string): {data: OpsData;cancelled: number;refundedNgn: number;} {
  const ids = activeBookingsFor(data, serviceId, start);
  let next = data;
  ids.forEach((b) => {
    next = cancelBooking(next, b.id, 'owner', reason ? `Class cancelled — ${reason}` : 'Class cancelled');
  });
  return { data: next, cancelled: ids.length, refundedNgn: ids.reduce((s, b) => s + b.depositPaidNgn, 0) };
}

function activeBookingsFor(data: OpsData, serviceId: string, start: number): Booking[] {
  return data.bookings.filter((b) => b.serviceId === serviceId && Date.parse(b.start) === start && (b.status === 'confirmed' || b.status === 'pending_deposit' || b.status === 'requested'));
}

/** Accept a request (D256): it becomes a normal booking and, for online services, gets its meeting link. */
export function acceptBooking(data: OpsData, bookingId: string): OpsData {
  return {
    ...data,
    bookings: data.bookings.map((b) => {
      if (b.id !== bookingId || b.status !== 'requested') return b;
      const accepted: Booking = { ...b, status: 'confirmed', events: [{ id: uid('bev'), at: now(), label: 'Accepted by you' }, ...b.events] };
      const service = data.services.find((s) => s.id === b.serviceId);
      return service ? attachMeeting(accepted, service, data.availability) : accepted;
    })
  };
}

/** Decline a request (D256): the time is freed and any deposit is refunded in full. */
export function declineBooking(data: OpsData, bookingId: string, reason: string): OpsData {
  return {
    ...data,
    bookings: data.bookings.map((b) => {
      if (b.id !== bookingId || b.status !== 'requested') return b;
      const label = `Declined by you${reason ? ` — ${reason}` : ''}${b.depositPaidNgn ? ' · deposit refunded in full' : ''}`;
      return { ...b, status: 'cancelled' as const, events: [{ id: uid('bev'), at: now(), label }, ...b.events] };
    })
  };
}

/** A request is declined once its event log says so; otherwise a cancelled booking was cancelled. */
export const wasDeclined = (b: Booking) => b.status === 'cancelled' && b.events.some((e) => e.label.startsWith('Declined by you'));

export function setBookingStatus(data: OpsData, bookingId: string, status: BookingStatus, label: string): OpsData {
  return { ...data, bookings: data.bookings.map((b) => b.id === bookingId ? { ...b, status, events: [{ id: uid('bev'), at: now(), label }, ...b.events] } : b) };
}

export function clearOpsSample(data: OpsData): OpsData {
  return {
    ...data,
    services: data.services.filter((s) => !s.sample),
    bookings: data.bookings.filter((b) => !b.sample),
    contacts: data.contacts.filter((c) => !c.sample),
    automations: data.automations.filter((a) => !a.sample)
  };
}