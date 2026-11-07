import { useCallback, useEffect, useState } from 'react';
import { joinChannel, type Beat } from '../utils/liveChannel';

export interface DoorPayload {
  door: string;
  by: string;
}

export interface QueuedScan {
  raw: string;
  at: string;
}

const NAME_KEY = 'kubicu.door.name';
const queueKey = (eventId: string) => `kubicu.door.queue.${eventId}`;

const read = <T,>(key: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};

/**
 * This phone's door at an event (D143): its name, the other doors open right now (other tabs on this
 * device, live), and an offline queue so scans are never lost when the signal drops.
 */
export function useDoor(eventId: string, by: string) {
  const [door, setDoorState] = useState<string>(() => read<string>(NAME_KEY, ''));
  const [peers, setPeers] = useState<Beat<DoorPayload>[]>([]);
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  const [simOffline, setSimOffline] = useState(false);
  const [queue, setQueue] = useState<QueuedScan[]>(() => read<QueuedScan[]>(queueKey(eventId), []));

  const setDoor = useCallback((name: string) => {
    const v = name.trim().slice(0, 30);
    setDoorState(v);
    try {
      localStorage.setItem(NAME_KEY, JSON.stringify(v));
    } catch {
      /* storage full or blocked: keep it for this session */
    }
  }, []);

  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);

  useEffect(() => {
    if (!door) return;
    const ch = joinChannel<DoorPayload>(`doors:${eventId}`, { door, by }, setPeers);
    return () => {
      ch.leave();
      setPeers([]);
    };
  }, [eventId, door, by]);

  const saveQueue = useCallback(
    (next: QueuedScan[]) => {
      setQueue(next);
      try {
        localStorage.setItem(queueKey(eventId), JSON.stringify(next));
      } catch {
        /* ignore */
      }
    },
    [eventId],
  );

  const enqueue = useCallback((raw: string) => saveQueue([...read<QueuedScan[]>(queueKey(eventId), []), { raw, at: new Date().toISOString() }]), [eventId, saveQueue]);
  const clearQueue = useCallback(() => saveQueue([]), [saveQueue]);

  return { door, setDoor, peers, connected: online && !simOffline, online, simOffline, setSimOffline, queue, enqueue, clearQueue };
}
