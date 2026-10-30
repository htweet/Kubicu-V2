import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CopilotSession } from '../types/copilot';
import { CHATS_EVENT, currentSessionId, deleteSession, listSessions, pinnedIds, togglePin } from '../utils/copilot/store';

/** Copilot chats on this device with their pins, kept live across the sidebar, the chat page and other tabs. */
export function useCopilotChats() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const refresh = () => setTick((t) => t + 1);
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key.startsWith('kubicu.copilot')) refresh();
    };
    window.addEventListener(CHATS_EVENT, refresh);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(CHATS_EVENT, refresh);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const all = useMemo(() => listSessions('web'), [tick]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pins = useMemo(() => pinnedIds(), [tick]);
  const pinned = useMemo(() => pins.map((id) => all.find((s) => s.id === id)).filter((s): s is CopilotSession => !!s), [pins, all]);
  const recent = useMemo(() => all.filter((s) => !pins.includes(s.id)), [pins, all]);
  const isPinned = useCallback((id: string) => pins.includes(id), [pins]);

  return { all, pinned, recent, isPinned, togglePin, remove: deleteSession, currentId: currentSessionId('web') };
}