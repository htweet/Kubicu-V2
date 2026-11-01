import type React from 'react';

/**
 * After a form fails validation, moves focus to the first field marked invalid (D429), so keyboard and screen-reader
 * users land on the problem instead of hunting for it. Runs after React has rendered the error states.
 */
export function focusFirstError(root?: HTMLElement | null): void {
  window.requestAnimationFrame(() => {
    const scope: ParentNode = root ?? document;
    const field = scope.querySelector<HTMLElement>('[aria-invalid="true"]');
    field?.focus();
  });
}

/**
 * Arrow-key movement for a radiogroup made of role="radio" buttons (D429): Up/Left and Down/Right move to the
 * previous/next option, Home/End to the ends, and choosing follows focus as with native radio buttons.
 */
export function onRadioGroupKeyDown(e: React.KeyboardEvent<HTMLElement>): void {
  const keys = ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'];
  if (!keys.includes(e.key)) return;
  const radios = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]:not([disabled])'));
  if (!radios.length) return;
  e.preventDefault();
  const current = radios.indexOf(document.activeElement as HTMLElement);
  const last = radios.length - 1;
  const next = e.key === 'Home' ? 0 : e.key === 'End' ? last : e.key === 'ArrowDown' || e.key === 'ArrowRight' ? current >= last ? 0 : current + 1 : current <= 0 ? last : current - 1;
  radios[next].focus();
  radios[next].click();
}

/** Roving tab stop: only the chosen option (or the first, when none is chosen) is in the Tab order. */
export const radioTabIndex = (active: boolean, index: number, anyActive: boolean): 0 | -1 => active || !anyActive && index === 0 ? 0 : -1;