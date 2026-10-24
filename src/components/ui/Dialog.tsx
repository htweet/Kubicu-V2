import React, { useId, useRef } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { IconButton } from './IconButton';
import { cn } from '../../utils/cn';
import { useT } from '../../contexts/LocaleContext';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /** Opens above other dialogs and sheets (e.g. the upgrade dialog). */
  onTop?: boolean;
}

const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-xl' };

export function Dialog({ open, onClose, title, description, children, footer, size = 'md', onTop = false }: DialogProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Focus moves in, Tab stays inside, Escape closes, focus returns to the opener (D76).
  useFocusTrap(panelRef, open, () => onCloseRef.current());
  const { t } = useT();
  title = t(title);
  if (typeof description === 'string') description = t(description);

  return createPortal(
    <AnimatePresence>
      {open &&
      <div className={cn('fixed inset-0 flex items-end justify-center sm:items-center sm:p-6', onTop ? 'z-[95]' : 'z-[80]')}>
          <motion.div
          className="absolute inset-0 bg-black/55"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={() => onCloseRef.current()}
          aria-hidden />
        
          <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 4 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className={cn(
            'relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-lg border border-line bg-overlay text-fg shadow-3 focus:outline-none sm:rounded-lg',
            widths[size]
          )}>
          
            <div className="flex items-start justify-between gap-4 px-6 pb-2 pt-5">
              <div className="min-w-0">
                <h2 id={titleId} className="text-heading font-semibold text-fg">
                  {title}
                </h2>
                {description && <div className="mt-1 text-label text-fg-muted">{description}</div>}
              </div>
              <IconButton icon={XIcon} label="Close" size="sm" onClick={() => onCloseRef.current()} className="-mr-2 -mt-1" />
            </div>
            {children && <div className="scroll-quiet min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6 py-3">{children}</div>}
            {footer &&
          <div className="flex flex-col-reverse gap-2 border-t border-line px-6 py-4 sm:flex-row sm:justify-end">{footer}</div>
          }
          </motion.div>
        </div>
      }
    </AnimatePresence>,
    document.body
  );
}