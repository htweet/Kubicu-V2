import { format } from 'date-fns';
import type { BlockVisibility } from '../types/page';

export type WindowState = 'always' | 'upcoming' | 'active' | 'ended';

/** Where a block's show-between window sits relative to `now`. */
export function windowState(v: BlockVisibility, now = Date.now()): WindowState {
  const from = v.showFrom ? Date.parse(v.showFrom) : null;
  const until = v.showUntil ? Date.parse(v.showUntil) : null;
  if (from === null && until === null) return 'always';
  if (from !== null && now < from) return 'upcoming';
  if (until !== null && now >= until) return 'ended';
  return 'active';
}

/** True when visitors should see the block right now. */
export function isLiveNow(v: BlockVisibility, now = Date.now()): boolean {
  if (v.hidden) return false;
  const s = windowState(v, now);
  return s === 'always' || s === 'active';
}

/** ISO → value for <input type="datetime-local"> in the device's time zone. */
export function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return format(d, "yyyy-MM-dd'T'HH:mm");
}

/** <input type="datetime-local"> value → ISO, or null when empty/invalid. */
export function fromLocalInput(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function formatSchedule(iso: string): string {
  return format(new Date(iso), "EEE d MMM, HH:mm");
}

/** Short time-zone label for the device, e.g. "WAT" or "GMT+1". */
export function timeZoneLabel(): string {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (zone === 'Africa/Lagos') return 'WAT (Lagos)';
    const part = new Intl.DateTimeFormat('en-GB', { timeZoneName: 'short' }).
    formatToParts(new Date()).
    find((p) => p.type === 'timeZoneName');
    return part ? `${part.value} (${zone.split('/').pop()?.replace('_', ' ')})` : zone;
  } catch {
    return 'your local time';
  }
}