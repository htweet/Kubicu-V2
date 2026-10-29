import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { StaffMember } from '../types/admin';
import { useAdminStore } from '../utils/admin/store';
import { useTemplateStore } from '../utils/templateListings';
import { useSubmissions } from '../utils/extensionSubmissions';
import { staffFeed, type StaffNotif } from '../utils/admin/staffFeed';
import { useKycQueue } from '../hooks/useKycQueue';

/** Staff notifications (D168): read state and muted areas per staff member, on this device. */
interface StaffNotifPrefs {
  read: string[];
  muted: string[];
}

interface StaffNotificationsValue {
  /** Everything for this role, after muting (urgent items always come through). */
  items: StaffNotif[];
  unread: number;
  urgentUnread: number;
  isRead: (n: StaffNotif) => boolean;
  markRead: (n: StaffNotif) => void;
  markAllRead: () => void;
  muted: string[];
  toggleMuted: (area: string) => void;
  /** Areas this role gets notifications from, muted or not. */
  areas: string[];
  open: boolean;
  setOpen: (v: boolean) => void;
}

const Ctx = createContext<StaffNotificationsValue | null>(null);
const keyFor = (staffId: string) => `kubicu.staffNotifs.${staffId}`;
const READ_MAX = 400;

function readPrefs(staffId: string): StaffNotifPrefs {
  try {
    const raw = window.localStorage.getItem(keyFor(staffId));
    const p = raw ? JSON.parse(raw) as Partial<StaffNotifPrefs> : {};
    return { read: p.read ?? [], muted: p.muted ?? [] };
  } catch {
    return { read: [], muted: [] };
  }
}

export function StaffNotificationsProvider({ staff, children }: {staff: StaffMember;children: React.ReactNode;}) {
  const [store] = useAdminStore();
  const [templates] = useTemplateStore();
  const [subs] = useSubmissions();
  const [prefs, setPrefs] = useState<StaffNotifPrefs>(() => readPrefs(staff.id));
  const [open, setOpen] = useState(false);
  // Re-derive every minute so deadlines and expiries tick over without a reload.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => setPrefs(readPrefs(staff.id)), [staff.id]);
  useEffect(() => {
    try {
      window.localStorage.setItem(keyFor(staff.id), JSON.stringify(prefs));
    } catch {

      /* storage full — read state just won't persist */}
  }, [prefs, staff.id]);

  const kyc = useKycQueue();
  const all = useMemo(() => staffFeed(store, templates, subs, staff, now, kyc), [store, templates, subs, staff, now, kyc]);
  const items = useMemo(() => all.filter((n) => n.urgent || !prefs.muted.includes(n.area)), [all, prefs.muted]);
  const areas = useMemo(() => Array.from(new Set(all.map((n) => n.area))), [all]);
  const readSet = useMemo(() => new Set(prefs.read), [prefs.read]);
  const isRead = useCallback((n: StaffNotif) => readSet.has(n.id), [readSet]);
  const markRead = useCallback((n: StaffNotif) => setPrefs((p) => p.read.includes(n.id) ? p : { ...p, read: [n.id, ...p.read].slice(0, READ_MAX) }), []);
  const markAllRead = useCallback(() => setPrefs((p) => ({ ...p, read: Array.from(new Set([...items.map((n) => n.id), ...p.read])).slice(0, READ_MAX) })), [items]);
  const toggleMuted = useCallback((area: string) => setPrefs((p) => ({ ...p, muted: p.muted.includes(area) ? p.muted.filter((a) => a !== area) : [...p.muted, area] })), []);

  const unreadItems = items.filter((n) => !readSet.has(n.id));
  const value: StaffNotificationsValue = {
    items,
    unread: unreadItems.length,
    urgentUnread: unreadItems.filter((n) => n.urgent).length,
    isRead,
    markRead,
    markAllRead,
    muted: prefs.muted,
    toggleMuted,
    areas,
    open,
    setOpen
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStaffNotifications(): StaffNotificationsValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStaffNotifications must be used inside StaffNotificationsProvider');
  return v;
}