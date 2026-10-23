import React, { useId, useRef } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { IconButton } from './IconButton';
import { cn } from '../../utils/cn';
import { useMediaQuery } from '../../hooks/useMediaQuery';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  side?: 'right' | 'bottom';
  height?: 'auto' | 'full';
  headerActions?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  bodyClassName?: string;
  /** Width of a right-side sheet on larger screens. */
  size?: 'md' | 'lg';
}

export function Sheet({
  open,
  onClose,
  title,
  description,
  side = 'bottom',
  height = 'auto',
  headerActions,
  footer,
  children,
  bodyClassName,
  size = 'md'
}: SheetProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  // Focus moves in, Tab stays inside, Escape closes, focus returns to the opener (D76).
  useFocusTrap(panelRef, open, () => onCloseRef.current());

  // On phones, side panels open full-screen from the bottom so editors get the whole width (D49).
  const wide = useMediaQuery('(min-width: 768px)');
  const fullScreen = side === 'right' && !wide;
  const isBottom = side === 'bottom' || fullScreen;

  return createPortal(
    <AnimatePresence>
      {open &&
      <div className="fixed inset-0 z-[70]">
          <motion.div
          className="absolute inset-0 bg-black/45"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          aria-hidden />
        
          <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          initial={isBottom ? { y: '100%' } : { x: '100%' }}
          animate={isBottom ? { y: 0 } : { x: 0 }}
          exit={isBottom ? { y: '100%' } : { x: '100%' }}
          transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
          className={cn(
            'absolute flex flex-col border-line bg-overlay text-fg shadow-3 focus:outline-none',
            fullScreen ?
            'inset-0 pt-[env(safe-area-inset-top)] safe-bottom' :
            isBottom ?
            cn(
              'inset-x-0 bottom-0 rounded-t-lg border-t safe-bottom',
              height === 'full' ? 'top-[max(env(safe-area-inset-top),2.5rem)]' : 'max-h-[85vh]'
            ) :
            cn('inset-y-0 right-0 w-full border-l', size === 'lg' ? 'max-w-2xl' : 'max-w-md')
          )}>
          
            {isBottom && !fullScreen && <div aria-hidden className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-line-strong" />}
            <div className={cn('flex shrink-0 items-start justify-between gap-3 border-b border-line py-3', fullScreen ? 'pl-5 pr-2' : 'px-5')}>
              <div className="min-w-0">
                <h2 id={titleId} className="truncate text-heading font-semibold">
                  {title}
                </h2>
                {description && <p className="line-clamp-2 text-caption text-fg-subtle">{description}</p>}
              </div>
              <div className="flex items-center gap-1">
                {headerActions}
                <IconButton icon={XIcon} label="Close" size={fullScreen ? 'lg' : 'md'} onClick={onClose} />
              </div>
            </div>
            <div className={cn('scroll-quiet min-h-0 flex-1 overflow-y-auto', bodyClassName)}>{children}</div>
            {footer && <div className={cn('shrink-0 border-t border-line bg-overlay px-5 py-3', fullScreen && '[&_button]:min-h-[44px]')}>{footer}</div>}
          </motion.div>
        </div>
      }
    </AnimatePresence>,
    document.body
  );
}