import { useEffect, useRef } from 'react';

interface Shortcuts {
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onEscape: () => void;
  onCommand?: () => void;
  /** D515: copy the selected block; paste copied blocks below the selection (works across pages). */
  onCopy?: () => void;
  onPaste?: () => void;
}

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

export function useCanvasShortcuts(handlers: Shortcuts) {
  const ref = useRef(handlers);
  ref.current = handlers;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k' && ref.current.onCommand) {
        if (document.querySelector('[role="dialog"]')) return;
        e.preventDefault();
        ref.current.onCommand();
        return;
      }
      if (isTyping(e.target)) return;
      if (document.querySelector('[role="dialog"]')) return;
      const mod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();
      if (mod && key === 'z') {
        e.preventDefault();
        if (e.shiftKey) ref.current.onRedo();else
        ref.current.onUndo();
      } else if (mod && key === 'y') {
        e.preventDefault();
        ref.current.onRedo();
      } else if (mod && key === 'c' && ref.current.onCopy && !window.getSelection()?.toString()) {
        // Leave ordinary text copying alone when the person has selected some words.
        e.preventDefault();
        ref.current.onCopy();
      } else if (mod && key === 'v' && ref.current.onPaste) {
        e.preventDefault();
        ref.current.onPaste();
      } else if (mod && key === 'd') {
        e.preventDefault();
        ref.current.onDuplicate();
      } else if (key === 'delete' || key === 'backspace') {
        // Only when the block itself (or its layer row) has focus — never from another button (WCAG 2.1.4, D76).
        const t = e.target as HTMLElement | null;
        if (t && (t === document.body || t.matches('[data-block-id][aria-pressed="true"],[data-layer-row][aria-current="true"]'))) {
          e.preventDefault();
          ref.current.onDelete();
        }
      } else if (key === 'escape') {
        ref.current.onEscape();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}