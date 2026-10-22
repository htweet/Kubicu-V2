import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import { cardRadius, fontsFor } from './pageStyle';

interface PageOverlayProps {
  open: boolean;
  onClose: () => void;
  theme: PageTheme;
  label: string;
  /** `sheet` rises from the bottom on phones; `viewer` is a dark full-screen photo view. */
  variant?: 'sheet' | 'viewer';
  children: React.ReactNode;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

/** Visitor-facing overlay styled by the page theme (not KUBICU chrome). */
export function PageOverlay({ open, onClose, theme, label, variant = 'sheet', children, onKeyDown }: PageOverlayProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = window.setTimeout(() => closeRef.current?.focus(), 30);
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prevOverflow;
      previous?.focus();
    };
  }, [open]);

  const viewer = variant === 'viewer';

  return createPortal(
    <AnimatePresence>
      {open &&
      <div
        className={`fixed inset-0 z-[100] flex ${viewer ? 'items-center justify-center' : 'items-end justify-center sm:items-center'}`}
        style={{ fontFamily: fontsFor(theme).body }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose();
          onKeyDown?.(e);
        }}>
        
          <motion.div
          aria-hidden
          className="absolute inset-0"
          style={{ background: viewer ? 'rgba(0,0,0,0.92)' : 'rgba(0,0,0,0.5)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose} />
        
          <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={label}
          initial={reduce ? { opacity: 0 } : viewer ? { opacity: 0, scale: 0.97 } : { opacity: 0, y: 24 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : viewer ? { opacity: 0, scale: 0.98 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          className={
          viewer ?
          'relative flex h-full w-full flex-col' :
          'relative max-h-[88vh] w-full overflow-y-auto sm:max-w-lg'
          }
          style={
          viewer ?
          undefined :
          {
            background: theme.background,
            color: theme.text,
            borderTopLeftRadius: cardRadius(theme) + 6,
            borderTopRightRadius: cardRadius(theme) + 6,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            paddingBottom: 'env(safe-area-inset-bottom)'
          }
          }>
          
            <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full"
            style={viewer ? { background: 'rgba(255,255,255,0.12)', color: '#fff' } : { background: theme.surface, color: theme.text }}>
            
              <XIcon size={18} aria-hidden />
            </button>
            {children}
          </motion.div>
        </div>
      }
    </AnimatePresence>,
    document.body
  );
}