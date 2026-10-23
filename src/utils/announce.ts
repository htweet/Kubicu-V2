/**
 * One shared, visually hidden live region for status messages (WCAG 4.1.3, D76).
 * Call `announce('Moved Gallery up — 3 of 8')` from anywhere; LiveAnnouncer renders the regions.
 */
type Listener = (message: string, politeness: 'polite' | 'assertive') => void;

const listeners = new Set<Listener>();

export function announce(message: string, politeness: 'polite' | 'assertive' = 'polite') {
  if (!message) return;
  listeners.forEach((l) => l(message, politeness));
}

export function subscribeAnnouncer(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Moves focus to the first invalid field inside a form or panel after a failed submit (WCAG 3.3.1). */
export function focusFirstError(root?: HTMLElement | null) {
  window.setTimeout(() => {
    const scope = root ?? document;
    const el = scope.querySelector<HTMLElement>('[aria-invalid="true"]');
    el?.focus();
  }, 0);
}