import { useCallback, useEffect, useState } from 'react';

// v2: the default changed to expanded (D210), so earlier auto-saved "collapsed" values are ignored.
const KEY = 'kubicu.sidebar.collapsed.v2';

/** Sidebar starts expanded (icons and labels); collapsing it is remembered on this device. */
export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem(KEY) === '1';
    } catch {
      return false;
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