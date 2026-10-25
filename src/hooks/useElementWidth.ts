import { useLayoutEffect, useState } from 'react';
import type React from 'react';

/** The rendered width of an element, kept current with ResizeObserver. Used where the layout depends on the block's own width, not the window. */
export function useElementWidth(ref: React.RefObject<HTMLElement>): number {
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.getBoundingClientRect().width);
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (typeof w === 'number') setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return width;
}