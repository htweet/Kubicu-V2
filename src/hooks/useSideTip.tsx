import React, { useCallback, useState } from 'react';

export interface SideTip {
  show: (label: string) => (e: React.SyntheticEvent<HTMLElement>) => void;
  hide: () => void;
  node: React.ReactNode;
}

/** A label shown beside an icon-only rail control. Fixed-positioned so scrolling containers can't clip it. */
export function useSideTip(side: 'right' | 'left' = 'right'): SideTip {
  const [tip, setTip] = useState<{ label: string; top: number; x: number } | null>(null);
  const show = useCallback(
    (label: string) => (e: React.SyntheticEvent<HTMLElement>) => {
      const r = e.currentTarget.getBoundingClientRect();
      setTip({ label, top: r.top + r.height / 2, x: side === 'right' ? r.right + 12 : r.left - 12 });
    },
    [side],
  );
  const hide = useCallback(() => setTip(null), []);
  const node = tip ? (
    <span
      role="tooltip"
      className={`pointer-events-none fixed z-50 -translate-y-1/2 whitespace-nowrap rounded-sm bg-inverse px-2.5 py-1.5 text-caption font-semibold text-fg-inverse shadow-2 ${side === 'left' ? '-translate-x-full' : ''}`}
      style={{ top: tip.top, left: tip.x }}
    >
      {tip.label}
    </span>
  ) : null;
  return { show, hide, node };
}
