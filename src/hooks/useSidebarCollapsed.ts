import { useCallback, useEffect, useState } from 'react';

const KEY = 'kubicu.sidebar.collapsed';

/** Sidebar starts collapsed (icons only); the choice is remembered on this device. */
export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      const saved = window.localStorage.getItem(KEY);
      return saved === null ? true : saved === '1';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, collapsed ? '1' : '0');
    } catch {

      // Storage unavailable — the choice lasts for this visit.
    }}, [collapsed]);

  const toggle = useCallback(() => setCollapsed((c) => !c), []);
  return { collapsed, toggle };
}