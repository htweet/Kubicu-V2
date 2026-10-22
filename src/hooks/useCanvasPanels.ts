import { useCallback, useEffect, useState } from 'react';

const KEY = 'kubicu.canvas.panels';

interface PanelState {
  left: boolean;
  right: boolean;
}

function read(): PanelState {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<PanelState>;
      return { left: p.left !== false, right: p.right !== false };
    }
  } catch {

    // Fall through to defaults.
  }return { left: true, right: true };
}

/** Which canvas side panels are open. Both start open; the choice is remembered on this device. */
export function useCanvasPanels() {
  const [panels, setPanels] = useState<PanelState>(read);

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(panels));
    } catch {

      // Storage unavailable — the choice lasts for this visit.
    }}, [panels]);

  const setLeft = useCallback((left: boolean) => setPanels((p) => ({ ...p, left })), []);
  const setRight = useCallback((right: boolean) => setPanels((p) => ({ ...p, right })), []);
  const toggleLeft = useCallback(() => setPanels((p) => ({ ...p, left: !p.left })), []);
  const toggleRight = useCallback(() => setPanels((p) => ({ ...p, right: !p.right })), []);
  /** Focus mode: hide both if either is open, otherwise bring both back. */
  const toggleFocus = useCallback(() => setPanels((p) => p.left || p.right ? { left: false, right: false } : { left: true, right: true }), []);

  return { ...panels, focus: !panels.left && !panels.right, setLeft, setRight, toggleLeft, toggleRight, toggleFocus };
}