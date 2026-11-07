import type { NotifChannel, NotifEventId, NotifPrefs } from '../types/notifications';
import { notifEventById } from '../data/notificationEvents';

export const notifKey = (workspaceId: string, memberId: string) => `kubicu.notifs.${workspaceId}.${memberId}`;

export function emptyPrefs(): NotifPrefs {
  return { channels: {}, digest: false, quietHours: { on: false, from: '21:00', to: '07:00' }, read: [] };
}

export function readPrefs(workspaceId: string, memberId: string): NotifPrefs {
  try {
    const raw = window.localStorage.getItem(notifKey(workspaceId, memberId));
    return raw ? { ...emptyPrefs(), ...(JSON.parse(raw) as Partial<NotifPrefs>) } : emptyPrefs();
  } catch {
    return emptyPrefs();
  }
}

export function writePrefs(workspaceId: string, memberId: string, prefs: NotifPrefs): void {
  // Keep the read list bounded.
  window.localStorage.setItem(notifKey(workspaceId, memberId), JSON.stringify({ ...prefs, read: prefs.read.slice(-400) }));
}

export function channelOn(prefs: NotifPrefs, event: NotifEventId, channel: NotifChannel): boolean {
  return prefs.channels[event]?.[channel] ?? notifEventById[event].defaults[channel];
}

export function plural(n: number, one: string, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`;
}
