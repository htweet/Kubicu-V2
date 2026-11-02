import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { cardRadius, fontsFor, mix } from './pageStyle';
import { useT } from '../../contexts/LocaleContext';

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

/** Visitor-facing overlay styled by the page theme (not KUBICU chrome). Focus stays inside while open (D76). */
export function PageOverlay({ open, onClose, theme, label, variant = 'sheet', children, onKeyDown }: PageOverlayProps) {
  const { t: tr } = useT();
  const panelRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useFocusTrap(panelRef, open, () => onCloseRef.current());

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const viewer = variant === 'viewer';

  return createPortal(
    <AnimatePresence>
      {open &&
      <div
        className={`fixed inset-0 z-[100] flex ${viewer ? 'items-center justify-center' : 'items-end justify-center'}`}
        style={{ fontFamily: fontsFor(theme).body }}
        onKeyDown={onKeyDown}>
        
          <motion.div
          aria-hidden
          className="absolute inset-0"
          style={{ background: viewer ? 'rgba(0,0,0,0.92)' : 'rgba(10,10,10,0.28)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose} />
        
          <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={label}
          tabIndex={-1}
          initial={reduce ? { opacity: 0 } : viewer ? { opacity: 0, scale: 0.97 } : { opacity: 0, y: 24 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : viewer ? { opacity: 0, scale: 0.98 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          className={
          viewer ?
          'relative flex h-full w-full flex-col focus:outline-none' :
          'relative flex max-h-[min(88vh,820px)] w-full flex-col overflow-hidden shadow-[0_-12px_40px_rgba(0,0,0,0.18)] focus:outline-none sm:max-w-lg'
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
            '--sb-thumb': mix(theme.text, 22, theme.background),
            '--sb-thumb-hover': mix(theme.text, 38, theme.background)
          } as React.CSSProperties
          }>
          
            <button
            type="button"
            data-autofocus
            onClick={onClose}
            aria-label={tr('Close')}
            className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full"
            style={viewer ? { background: 'rgba(255,255,255,0.12)', color: '#fff' } : { background: theme.surface, color: theme.text }}>
            
              <XIcon size={18} aria-hidden />
            </button>
            {viewer ? children : <div className="page-scroll flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">{children}</div>}
          </motion.div>
        </div>
      }
    </AnimatePresence>,
    document.body
  );
}