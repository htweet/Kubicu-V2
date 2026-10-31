import { useEffect } from 'react';

/** How many open overlays currently hold the lock, so a dialog opened over a sheet doesn't release it early. */
let holders = 0;
let previous = '';

/** Stops the page behind an open dialog or sheet from scrolling (D429). */
export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    if (holders === 0) {
      previous = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    holders += 1;
    return () => {
      holders -= 1;
      if (holders === 0) document.body.style.overflow = previous;
    };
  }, [active]);
}