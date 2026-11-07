import React, { useId, useRef } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useScrollLock } from '../../hooks/useScrollLock';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { IconButton } from './IconButton';
import { cn } from '../../utils/cn';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useT } from '../../contexts/LocaleContext';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Opens above other dialogs and sheets (e.g. the upgrade dialog). */
  onTop?: boolean;
  /** False hides the close button and ignores Escape and backdrop clicks (required decisions). */
  dismissible?: boolean;
  /** Public pages keep a centred dialog; the workspace always uses the side sheet (D272). */
  centered?: boolean;
}

// Workspace actions open as a right-side sheet, not a centred modal (D272). Width follows the old size.
const widths = { sm: 'max-w-md', md: 'max-w-md', lg: 'max-w-xl', xl: 'max-w-3xl' };

export function Dialog({ open, onClose, title, description, children, footer, size = 'md', onTop = false, dismissible = true, centered = false }: DialogProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = dismissible ? onClose : () => undefined;

  // Focus moves in, Tab stays inside, Escape closes, focus returns to the opener (D76).
  useFocusTrap(panelRef, open, () => onCloseRef.current());
  useScrollLock(open);
  const { t } = useT();
  title = t(title);
  if (typeof description === 'string') description = t(description);

  // On phones the sheet rises from the bottom and fills the screen so forms get the whole width (D49).
  const wide = useMediaQuery('(min-width: 768px)');

  if (centered) {
    return createPortal(
      <AnimatePresence>
        {open && (
          <div className={cn('fixed inset-0 flex items-end justify-center sm:items-center sm:p-6', onTop ? 'z-[95]' : 'z-[80]')}>
            <motion.div className="absolute inset-0 bg-black/55" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} onClick={() => onCloseRef.current()} aria-hidden />
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
              className={cn('relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-lg border border-line bg-overlay text-fg shadow-3 focus:outline-none sm:rounded-lg', { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-xl', xl: 'max-w-3xl' }[size])}
            >
              <div className="flex items-start justify-between gap-4 px-6 pb-2 pt-5">
                <div className="min-w-0">
                  <h2 id={titleId} className="text-heading font-semibold text-fg">
                    {title}
                  </h2>
                  {description && <div className="mt-1 text-label text-fg-muted">{description}</div>}
                </div>
                {dismissible && <IconButton icon={XIcon} label="Close" size="sm" onClick={() => onCloseRef.current()} className="-mr-2 -mt-1" />}
              </div>
              {children && <div className="scroll-quiet min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6 py-3">{children}</div>}
              {footer && <div className="flex flex-col-reverse gap-2 border-t border-line px-6 py-4 sm:flex-row sm:justify-end">{footer}</div>}
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body,
    );
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className={cn('fixed inset-0', onTop ? 'z-[95]' : 'z-[80]')}>
          <motion.div
            className="absolute inset-0 bg-black/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => onCloseRef.current()}
            aria-hidden
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={wide ? { x: '100%' } : { y: '100%' }}
            animate={wide ? { x: 0 } : { y: 0 }}
            exit={wide ? { x: '100%' } : { y: '100%' }}
            transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
            className={cn(
              'absolute flex flex-col overflow-hidden border-line bg-overlay text-fg shadow-3 focus:outline-none',
              wide
                ? cn('inset-y-0 right-0 w-full border-l', widths[size])
                : 'inset-x-0 bottom-0 top-[max(env(safe-area-inset-top),2.5rem)] rounded-t-lg border-t safe-bottom',
            )}
          >
            {!wide && <div aria-hidden className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-line-strong" />}
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-6 py-4">
              <div className="min-w-0">
                <h2 id={titleId} className="text-heading font-semibold text-fg">
                  {title}
                </h2>
                {description && <div className="mt-1 text-label text-fg-muted">{description}</div>}
              </div>
              {dismissible && <IconButton icon={XIcon} label="Close" size={wide ? 'sm' : 'md'} onClick={() => onCloseRef.current()} className="-mr-2" />}
            </div>
            <div className="scroll-quiet min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6 py-4">{children}</div>
            {footer && (
              <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-line bg-overlay px-6 py-4 sm:flex-row sm:justify-end [&_button]:min-h-[44px] sm:[&_button]:min-h-0">{footer}</div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
