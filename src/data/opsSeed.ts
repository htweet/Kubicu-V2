import type { Automation, Booking, Contact, OpsData, Service } from '../types/ops';
import { addDaysKey, dateKeyInTz, zonedToUtc } from '../utils/ops/slots';

/** SAMPLE bookings, contacts and automations. All fictional and flagged `sample`. */

const ago = (h: number) => new Date(Date.now() - h * 3600000).toISOString();
const TZ = 'Africa/Lagos';

const services: Service[] = [
{ id: 'ss_fitting', name: 'Studio fitting', description: 'Try the collection on and have adjustments pinned by our tailor.', durationMin: 45, priceNgn: 10000, depositNgn: 5000, location: 'studio', locationNote: 'Victoria Island studio (sample address)', bufferMin: 15, active: true, sample: true },
{ id: 'ss_bespoke', name: 'Bespoke consultation', description: 'Talk through a made-to-measure piece: fabric, fit and timeline.', durationMin: 60, priceNgn: 25000, depositNgn: 10000, balanceOnline: true, balanceHoursBefore: 24, location: 'studio', locationNote: 'Victoria Island studio (sample address)', bufferMin: 15, active: true, sample: true },
{ id: 'ss_video', name: 'Video styling call', description: 'A styling session over video for anywhere in Nigeria.', durationMin: 30, priceNgn: 8000, depositNgn: null, location: 'online', locationNote: 'Google Meet link sent after booking', bufferMin: 10, active: true, sample: true }];


function at(daysFromToday: number, hhmm: string): string {
  const key = addDaysKey(dateKeyInTz(Date.now(), TZ), daysFromToday);
  return new Date(zonedToUtc(key, hhmm, TZ)).toISOString();
}
function plus(iso: string, min: number) {
  return new Date(Date.parse(iso) + min * 60000).toISOString();
}

function booking(id: string, ref: string, s: Service, day: number, time: string, name: string, phone: string, email: string, status: Booking['status'], deposit: boolean, intake = ''): Booking {
  const start = at(day, time);
  return {
    id,
    ref,
    serviceId: s.id,
    serviceName: s.name,
    start,
    end: plus(start, s.durationMin),
    customer: { name, phone, email },
    intake,
    status,
    depositPaidNgn: deposit ? s.depositNgn ?? 0 : 0,
    priceNgn: s.priceNgn,
    customerTimeZone: TZ,
    events: [{ id: `bev_${id}`, at: ago(48), label: 'Booked on your page' }],
    sample: true
  };
}

const bookings = (): Booking[] => [
booking('sb_1', 'B1996', services[0], 1, '11:00', 'Amaka Nwosu', '+234 811 000 2001', 'amaka@example.com', 'confirmed', true, 'Size 12, wedding guest outfit'),
booking('sb_2', 'B1997', services[1], 2, '14:00', 'Tunde Bakare', '+234 812 000 2002', 'tunde@example.com', 'confirmed', true, 'Agbada for a naming ceremony'),
booking('sb_3', 'B1998', services[2], 3, '10:00', 'Chiamaka Obi', '+234 803 000 1107', 'chiamaka@example.com', 'confirmed', false),
booking('sb_4', 'B1994', services[0], -2, '12:00', 'Bisi Lawal', '+234 805 000 1106', 'bisi@example.com', 'completed', true),
booking('sb_5', 'B1995', services[0], -1, '15:00', 'Femi Ojo', '+234 813 000 2005', 'femi@example.com', 'no_show', true)];


function contact(id: string, name: string, email: string, phone: string, sources: Contact['sources'], consent: Contact['consent'], stage: Contact['stage'], tags: string[], hoursAgo: number, label: string): Contact {
  return {
    id,
    name,
    email,
    phone,
    sources,
    consent,
    tags,
    notes: [],
    tasks: [],
    stage,
    activity: [{ id: `act_${id}`, at: ago(hoursAgo), kind: sources[0], label }],
    linked: [],
    createdAt: ago(hoursAgo),
    sample: true
  };
}

const contacts = (): Contact[] => [
contact('sc_1', 'Zainab Musa', 'zainab@example.com', '+234 814 000 3001', ['form'], 'subscribed', 'new', ['Bridal'], 3, 'Enquiry: bridal party of 6, March'),
contact('sc_2', 'Ifeoma Chukwu', 'ifeoma@example.com', '', ['newsletter'], 'subscribed', 'new', [], 30, 'Joined the newsletter'),
contact('sc_3', 'Segun Adeyemi', 'segun@example.com', '+234 815 000 3003', ['form'], 'transactional', 'contacted', ['Corporate'], 60, 'Enquiry: staff uniforms for 40'),
{ ...contact('sc_4', 'Ngozi Eze', 'ngozi@example.com', '+234 806 000 1105', ['order'], 'unsubscribed', 'won', ['Repeat'], 100, 'Order #1005'), activity: [{ id: 'act_sc_4b', at: ago(20), kind: 'consent', label: 'Unsubscribed from marketing' }, { id: 'act_sc_4', at: ago(100), kind: 'order', label: 'Order #1005' }] },
contact('sc_5', 'Zainab M.', '', '+234 814 000 3001', ['import'], 'transactional', 'new', [], 400, 'Imported from customers.csv'),
{ ...contact('sc_6', 'Tolu Ade', 'tolu@example.com', '+234 816 000 3006', ['form'], 'subscribed', 'lost', [], 300, 'Enquiry: custom suit'), notes: [{ id: 'n1', at: ago(200), text: 'Went with another tailor — budget.' }] },
{
  ...contact('sc_7', 'Kunle Ade', 'kunle@example.com', '+234 817 000 3007', ['form'], 'transactional', 'contacted', [], 50, 'Enquiry: matching outfits for a wedding'),
  tasks: [{ id: 't1', text: 'Send fabric options', due: new Date(Date.now() + 86400000).toISOString(), done: false }]
}];


const automations = (): Automation[] => [
{
  id: 'sa_1',
  name: 'Thank customers after an order',
  recipeId: 'thanks',
  status: 'active',
  trigger: 'order_paid',
  conditions: [],
  steps: [{ id: 's1', kind: 'action', action: 'send_whatsapp', value: 'Hi {first_name}, thank you for your order #{order_number}! We’ll let you know when it’s on its way.' }],
  runs: [
  { id: 'r1', at: ago(5), test: false, status: 'succeeded', subject: 'Order #1007 · Chiamaka Obi', steps: [{ label: 'An order is paid', status: 'done', detail: 'Order #1007' }, { label: 'Send a WhatsApp message', status: 'done', detail: 'Previewed (prototype doesn’t send)' }] },
  { id: 'r2', at: ago(26), test: false, status: 'failed', subject: 'Order #1006 · Bisi Lawal', steps: [{ label: 'An order is paid', status: 'done', detail: 'Order #1006' }, { label: 'Send a WhatsApp message', status: 'failed', detail: 'WhatsApp not connected — connect it to send for real' }] }],

  updatedAt: ago(24 * 7),
  sample: true
},
{
  id: 'sa_2',
  name: 'Booking reminder',
  recipeId: 'reminder',
  status: 'paused',
  trigger: 'booking_created',
  conditions: [],
  steps: [
  { id: 's1', kind: 'delay', value: '', delayHours: 24 },
  { id: 's2', kind: 'action', action: 'send_whatsapp', value: 'Hi {first_name}, a reminder of your {service} at {time}. Need to move it? Reply here.' }],

  runs: [],
  updatedAt: ago(24 * 2),
  sample: true
}];


export function withOpsSample(data: OpsData): OpsData {
  return {
    ...data,
    services: [...data.services, ...services],
    bookings: [...data.bookings, ...bookings()],
    contacts: [...data.contacts, ...contacts()],
    automations: [...data.automations, ...automations()],
    nextBookingRef: Math.max(data.nextBookingRef, 2001),
    sampleSeeded: true
  };
}