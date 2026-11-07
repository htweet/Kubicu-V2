import { STAFF_SESSION_HOURS } from '../../data/staffRoles';

const KEY = 'kubicu.staffSession';
const EVENT = 'kubicu:staff-session';

interface StaffSession {
  staffId: string;
  expiresAt: string;
}

/** The staff member who passed password + two-step sign-in in this tab, if the session hasn't expired. */
export function readStaffSession(): string | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as StaffSession;
    return Date.parse(s.expiresAt) > Date.now() ? s.staffId : null;
  } catch {
    return null;
  }
}

export function startStaffSession(staffId: string) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ staffId, expiresAt: new Date(Date.now() + STAFF_SESSION_HOURS * 3600000).toISOString() }));
  } catch {
    /* storage blocked — session lasts until reload */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function endStaffSession() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(EVENT));
}

export const STAFF_SESSION_EVENT = EVENT;
