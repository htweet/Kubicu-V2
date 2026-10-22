import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AppNotification, NotifChannel, NotifEventId, NotifPrefs } from '../types/notifications';
import { useTeam } from './TeamContext';
import { useWorkspace } from './WorkspaceContext';
import { useNotificationFeed } from '../hooks/useNotificationFeed';
import { notifEventById } from '../data/notificationEvents';
import { channelOn, readPrefs, writePrefs } from '../utils/notifications';
import { NotificationsPanel } from '../components/notifications/NotificationsPanel';

interface NotificationsValue {
  /** What this member receives in the app, newest first. */
  items: AppNotification[];
  unread: number;
  isRead: (n: AppNotification) => boolean;
  markRead: (n: AppNotification) => void;
  markAllRead: () => void;
  prefs: NotifPrefs;
  setChannel: (event: NotifEventId, channel: NotifChannel, on: boolean) => void;
  updatePrefs: (patch: Partial<Pick<NotifPrefs, 'digest' | 'quietHours'>>) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const NotificationsContext = createContext<NotificationsValue | null>(null);

/** One inbox for everything that needs you (D66). Role-aware; only in-app notices are delivered. */
export function NotificationsProvider({ children }: {children: React.ReactNode;}) {
  const team = useTeam();
  const { current } = useWorkspace();
  const feed = useNotificationFeed();
  const memberId = team.me.id;
  const [prefs, setPrefs] = useState<NotifPrefs>(() => readPrefs(current.id, memberId));
  const [open, setOpen] = useState(false);

  useEffect(() => setPrefs(readPrefs(current.id, memberId)), [current.id, memberId]);

  const save = useCallback(
    (fn: (p: NotifPrefs) => NotifPrefs) =>
    setPrefs((p) => {
      const next = fn(p);
      try {
        writePrefs(current.id, memberId, next);
      } catch {

        // Storage unavailable — settings last for this visit.
      }return next;
    }),
    [current.id, memberId]
  );

  const items = useMemo(
    () =>
    feed.filter((n) => {
      const ev = notifEventById[n.event];
      if (ev.permission && !team.can(ev.permission).allowed) return false;
      return channelOn(prefs, n.event, 'app');
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [feed, prefs, team.role]
  );

  const readSet = useMemo(() => new Set(prefs.read), [prefs.read]);
  const isRead = useCallback(
    (n: AppNotification) => {
      if (n.noticeId) return !!team.myNotices.find((x) => x.id === n.noticeId)?.seen || readSet.has(n.id);
      return readSet.has(n.id);
    },
    [readSet, team.myNotices]
  );
  const unread = items.filter((n) => !isRead(n)).length;

  const value = useMemo<NotificationsValue>(
    () => ({
      items,
      unread,
      isRead,
      markRead: (n) => save((p) => p.read.includes(n.id) ? p : { ...p, read: [...p.read, n.id] }),
      markAllRead: () => {
        save((p) => ({ ...p, read: Array.from(new Set([...p.read, ...items.map((i) => i.id)])) }));
        if (team.myNotices.some((n) => !n.seen)) team.markNoticesSeen();
      },
      prefs,
      setChannel: (event, channel, on) => save((p) => ({ ...p, channels: { ...p.channels, [event]: { ...p.channels[event], [channel]: on } } })),
      updatePrefs: (patch) => save((p) => ({ ...p, ...patch })),
      open,
      setOpen
    }),
    [items, unread, isRead, save, prefs, open, team]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
      <NotificationsPanel />
    </NotificationsContext.Provider>);

}

export function useNotifications(): NotificationsValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationsProvider');
  return ctx;
}