import { useEffect, useRef } from 'react';

interface Shortcuts {
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onEscape: () => void;
  onCommand?: () => void;
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
      } else if (mod && key === 'd') {
        e.preventDefault();
        ref.current.onDuplicate();
      } else if (key === 'delete' || key === 'backspace') {
        ref.current.onDelete();
      } else if (key === 'escape') {
        ref.current.onEscape();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}