import { useMemo } from 'react';
import type { Booking } from '../types/ops';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { activeExtraSpaces, MAIN_SPACE_ID } from '../utils/spaces';
import { spaceHandle } from '../utils/domains/links';

export interface BookingSource {
  /** The public handle the booking was made on; '' when it wasn't recorded (older bookings). */
  handle: string;
  label: string;
  main: boolean;
}

/**
 * Names the page a booking came from — "Main page" or the space's own name ("Book a fitting") —
 * from the handle stored on the booking (D191). Falls back to the kub.icu address.
 */
export function useBookingSources(bookings: Booking[]) {
  const { current } = useWorkspace();
  const byHandle = useMemo(() => {
    const map = new Map<string, { name: string; main: boolean }>();
    const main = spaceHandle(current.id, MAIN_SPACE_ID);
    if (main) map.set(main.toLowerCase(), { name: 'Main page', main: true });
    activeExtraSpaces(current).forEach((s) => {
      const h = spaceHandle(current.id, s.id);
      if (h) map.set(h.toLowerCase(), { name: s.name, main: false });
    });
    return map;
  }, [current]);

  const sourceOf = (b: Booking): BookingSource => {
    const handle = (b.sourceHandle ?? '').toLowerCase();
    if (!handle) return { handle: '', label: 'Not recorded', main: false };
    const hit = byHandle.get(handle);
    return { handle, label: hit ? hit.name : `kub.icu/${handle}`, main: !!hit?.main };
  };

  const options = useMemo(() => {
    const seen = new Map<string, string>();
    bookings.forEach((b) => {
      const s = sourceOf(b);
      if (!seen.has(s.handle)) seen.set(s.handle, s.label);
    });
    return [...seen.entries()].map(([handle, label]) => ({ handle, label })).sort((a, b) => (a.handle === '' ? 1 : b.handle === '' ? -1 : a.label.localeCompare(b.label)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings, byHandle]);

  return { sourceOf, options };
}
