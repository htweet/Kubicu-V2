import { useEffect } from 'react';
import type { CommerceData } from '../types/commerce';
import type { DealRoomSettings } from '../types/page';
import { settleRoom } from '../utils/dealRoom';

/**
 * Releases held orders when a group goal is reached and refunds everyone when it's missed.
 * In production this runs on the server at the deadline; here it runs while KUBICU is open.
 */
export function useDealRoomSettlement(data: CommerceData | null, apply: ((fn: (d: CommerceData) => CommerceData) => boolean) | null, rooms: {room: DealRoomSettings;handle: string;}[]) {
  const key = rooms.map((r) => `${r.handle}:${r.room.deadline}:${r.room.endedAt}:${r.room.goal}`).join('|');
  useEffect(() => {
    if (!data || !apply || rooms.length === 0) return;
    const run = () => {
      apply((d) => rooms.reduce((acc, r) => settleRoom(acc, r.room, r.handle), d));
    };
    const needs = rooms.some((r) => settleRoom(data, r.room, r.handle) !== data);
    if (needs) run();
    const t = window.setInterval(() => {
      if (rooms.some((r) => r.room.type === 'goal')) run();
    }, 30000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, data?.orders.length, data?.settledRooms]);
}