import type { Availability, Booking, BookingMeeting, MeetingApp, MeetingConnection, OpsData, Service } from '../../types/ops';
import { uid } from '../id';

/** Google Meet, Zoom and Microsoft Teams links for online bookings (D225). Links are simulated in this prototype. */
export const meetingApps: Record<MeetingApp, { name: string; short: string; accountHint: string; domain: string }> = {
  google_meet: { name: 'Google Meet', short: 'Meet', accountHint: 'Your Google Workspace or Gmail address', domain: 'meet.google.com' },
  zoom: { name: 'Zoom', short: 'Zoom', accountHint: 'The email you sign in to Zoom with', domain: 'zoom.us' },
  teams: { name: 'Microsoft Teams', short: 'Teams', accountHint: 'Your Microsoft 365 work or school address', domain: 'teams.microsoft.com' },
};

export const meetingAppIds = Object.keys(meetingApps) as MeetingApp[];

export function connectionFor(av: Availability, app: MeetingApp): MeetingConnection | undefined {
  return (av.meetings ?? []).find((m) => m.app === app && m.status === 'ok');
}

function seeded(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/** A believable, stable link for one booking — what the provider's API would return. */
export function makeMeeting(app: MeetingApp, seed: string): BookingMeeting {
  const r = seeded(seed);
  const letters = (n: number) => Array.from({ length: n }, () => 'abcdefghijkmnopqrstuvwxyz'[Math.floor(r() * 25)]).join('');
  const digits = (n: number) => Array.from({ length: n }, () => String(Math.floor(r() * 10))).join('');
  const createdAt = new Date().toISOString();
  if (app === 'google_meet') return { app, url: `https://meet.google.com/${letters(3)}-${letters(4)}-${letters(3)}`, createdAt };
  if (app === 'zoom') {
    const id = `8${digits(10)}`;
    return { app, url: `https://zoom.us/j/${id}?pwd=${letters(8)}${digits(4)}`, code: digits(6), createdAt };
  }
  const id = digits(12);
  return { app, url: `https://teams.microsoft.com/l/meetup-join/19%3ameeting_${letters(12)}%40thread.v2/0`, code: `${id.slice(0, 3)} ${id.slice(3, 6)} ${id.slice(6, 9)} ${id.slice(9)}`, createdAt };
}

/** What the booking sheet tells a visitor about how they'll meet. */
export function meetingPromise(service: Service, av: Availability): string {
  if (service.location !== 'online') return '';
  const app = service.meetingApp && connectionFor(av, service.meetingApp) ? meetingApps[service.meetingApp].name : null;
  return app ? `${app} link on your confirmation` : service.locationNote || 'The business sends the meeting link';
}

/** A new online booking gets its link straight away when the service's app is connected. */
export function attachMeeting(booking: Booking, service: Service, av: Availability): Booking {
  if (service.location !== 'online' || !service.meetingApp || !connectionFor(av, service.meetingApp)) return booking;
  const meeting = makeMeeting(service.meetingApp, `${booking.id}:${service.meetingApp}`);
  return { ...booking, meeting, events: [...booking.events, { id: uid('bev'), at: meeting.createdAt, label: `${meetingApps[meeting.app].name} link created` }] };
}

/** Replace a booking's link (lost, shared too widely, or the app changed). */
export function renewMeeting(data: OpsData, bookingId: string, app: MeetingApp): OpsData {
  return {
    ...data,
    bookings: data.bookings.map((b) => {
      if (b.id !== bookingId) return b;
      const meeting = makeMeeting(app, `${b.id}:${app}:${Date.now()}`);
      return { ...b, meeting, events: [...b.events, { id: uid('bev'), at: meeting.createdAt, label: `New ${meetingApps[app].name} link made` }] };
    }),
  };
}

export function connectMeetingApp(av: Availability, app: MeetingApp, account: string): Availability {
  const rest = (av.meetings ?? []).filter((m) => m.app !== app);
  return { ...av, meetings: [...rest, { id: uid('mtg'), app, account: account.trim(), connectedAt: new Date().toISOString(), status: 'ok' }] };
}

export function disconnectMeetingApp(av: Availability, app: MeetingApp): Availability {
  return { ...av, meetings: (av.meetings ?? []).filter((m) => m.app !== app) };
}
