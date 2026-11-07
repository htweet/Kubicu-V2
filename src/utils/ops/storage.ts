import type { OpsData } from '../../types/ops';
import { defaultHours } from '../openHours';

export const opsKey = (workspaceId: string) => `kubicu.ops.${workspaceId}`;

export function emptyOps(): OpsData {
  return {
    services: [],
    availability: {
      timeZone: 'Africa/Lagos',
      weekly: defaultHours(),
      overrides: [],
      minNoticeHours: 12,
      maxPerDay: 6,
      horizonDays: 30,
      cancelHours: 24,
      policy: 'Free to reschedule or cancel up to 24 hours before. After that, deposits aren’t refunded.',
      remindersOn: true,
      reminderHours: 24,
    },
    bookings: [],
    contacts: [],
    automations: [],
    automationsPaused: false,
    nextBookingRef: 2001,
    sampleSeeded: false,
  };
}

export function readOps(workspaceId: string): OpsData | null {
  try {
    const raw = window.localStorage.getItem(opsKey(workspaceId));
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<OpsData>;
    const base = emptyOps();
    return {
      ...base,
      ...p,
      availability: { ...base.availability, ...p.availability },
      services: Array.isArray(p.services) ? p.services : [],
      bookings: Array.isArray(p.bookings) ? p.bookings : [],
      contacts: Array.isArray(p.contacts) ? p.contacts : [],
      automations: Array.isArray(p.automations) ? p.automations : [],
    };
  } catch {
    return null;
  }
}

export function writeOps(workspaceId: string, data: OpsData): void {
  window.localStorage.setItem(opsKey(workspaceId), JSON.stringify(data));
}
