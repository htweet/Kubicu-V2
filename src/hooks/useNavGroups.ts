import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { workspaceNav, type NavGroupId } from '../data/navigation';

const KEY = 'kubicu.nav.openGroup';
const DEFAULT_OPEN: NavGroupId = 'studio';

function read(): NavGroupId | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === 'none') return null;
    if (raw) return raw as NavGroupId;
  } catch {
    /* fall through */
  }
  return DEFAULT_OPEN;
}

function save(id: NavGroupId | null) {
  try {
    window.localStorage.setItem(KEY, id ?? 'none');
  } catch {
    /* storage full — lasts for this visit */
  }
}

/**
 * Sidebar sections work as a single-open accordion (D117b): only Studio is open at first,
 * opening a section closes the one that was open, and the section you're in opens on navigation.
 */
export function useNavGroups() {
  const { pathname } = useLocation();
  const [openId, setOpenId] = useState<NavGroupId | null>(read);

  const activeGroup = [...workspaceNav]
    .sort((a, b) => b.to.length - a.to.length)
    .find((n) => (n.to === '/app' ? pathname === '/app' : pathname === n.to || pathname.startsWith(`${n.to}/`)))?.group;

  // Landing on a screen opens its section (and closes the other) so the current page is never hidden.
  useEffect(() => {
    if (!activeGroup) return;
    setOpenId((prev) => {
      if (prev === activeGroup) return prev;
      save(activeGroup);
      return activeGroup;
    });
  }, [activeGroup]);

  const toggle = useCallback((id: NavGroupId) => {
    setOpenId((prev) => {
      const next = prev === id ? null : id;
      save(next);
      return next;
    });
  }, []);

  const open = new Set<NavGroupId>(openId ? [openId] : []);
  return { open, openId, toggle, activeGroup };
}
