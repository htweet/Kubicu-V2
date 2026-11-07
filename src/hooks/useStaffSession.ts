import { useEffect, useState } from 'react';
import type { StaffMember } from '../types/admin';
import { useAdminStore } from '../utils/admin/store';
import { readStaffSession, STAFF_SESSION_EVENT } from '../utils/admin/staffSession';

/** The verified staff member for this tab. Disabled or deleted accounts count as signed out. */
export function useStaffSession(): StaffMember | null {
  const [store] = useAdminStore();
  const [id, setId] = useState<string | null>(() => readStaffSession());
  useEffect(() => {
    const sync = () => setId(readStaffSession());
    window.addEventListener(STAFF_SESSION_EVENT, sync);
    // Re-check expiry every minute so an 8-hour session ends on time.
    const t = window.setInterval(sync, 60000);
    return () => {
      window.removeEventListener(STAFF_SESSION_EVENT, sync);
      window.clearInterval(t);
    };
  }, []);
  const member = id ? store.staff.find((m) => m.id === id) : undefined;
  return member && member.status === 'active' && member.twoStep ? member : null;
}
