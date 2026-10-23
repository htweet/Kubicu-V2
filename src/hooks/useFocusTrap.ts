import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

const FOCUSABLE = [
'a[href]',
'button:not([disabled])',
'input:not([disabled]):not([type="hidden"])',
'select:not([disabled])',
'textarea:not([disabled])',
'[tabindex]:not([tabindex="-1"])',
'[contenteditable="true"]'].
join(',');

function focusables(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => !el.hasAttribute('inert') && el.getClientRects().length > 0);
}

/**
 * Keeps keyboard focus inside a modal surface while it is open (WCAG 2.1.2 / 2.4.3, D76):
 * moves focus in on open (a `[data-autofocus]` element, else the first field, else the panel),
 * wraps Tab / Shift+Tab at the edges, closes on Escape, and returns focus to whatever opened it.
 * Only the top-most open trap reacts, so a dialog over a sheet behaves correctly.
 */
export function useFocusTrap(ref: RefObject<HTMLElement>, active: boolean, onEscape?: () => void) {
  const escRef = useRef(onEscape);
  escRef.current = onEscape;

  useEffect(() => {
    if (!active) return;
    const previous = document.activeElement as HTMLElement | null;
    const token = Symbol('trap');
    stack.push(token);
    const isTop = () => stack[stack.length - 1] === token;

    const t = window.setTimeout(() => {
      const root = ref.current;
      if (!root || root.contains(document.activeElement)) return;
      const target = root.querySelector<HTMLElement>('[data-autofocus]') ?? root.querySelector<HTMLElement>('input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])');
      (target ?? root).focus({ preventScroll: true });
    }, 40);

    const onKey = (e: KeyboardEvent) => {
      if (!isTop()) return;
      const root = ref.current;
      if (!root) return;
      if (e.key === 'Escape' && escRef.current) {
        e.stopPropagation();
        escRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = focusables(root);
      if (items.length === 0) {
        e.preventDefault();
        root.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement as HTMLElement | null;
      if (e.shiftKey && (current === first || current === root || !root.contains(current))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (current === last || !root.contains(current))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);

    return () => {
      window.clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      const i = stack.indexOf(token);
      if (i >= 0) stack.splice(i, 1);
      // Return focus only if it is still inside the closing surface or lost to <body>.
      const active = document.activeElement;
      if (previous && document.contains(previous) && (!active || active === document.body || ref.current?.contains(active))) previous.focus({ preventScroll: true });
    };
  }, [active, ref]);
}

const stack: symbol[] = [];