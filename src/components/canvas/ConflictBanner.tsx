import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { CopyIcon } from 'lucide-react';
import { useEditor } from '../../contexts/EditorContext';
import { formatRelative } from '../../utils/format';
import { Button } from '../ui/Button';

/** Shown when the same page is saved from another tab, so nothing is overwritten silently. */
export function ConflictBanner() {
  const { state, actions } = useEditor();
  const open = state.saveStatus === 'conflict' && !!state.remote;
  const theirs = state.remote?.draft.updatedAt;

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          role="alert"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="shrink-0 overflow-hidden border-b border-line bg-warning-soft"
        >
          <div className="flex flex-col gap-2 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <p className="flex items-start gap-2 text-label text-fg">
              <CopyIcon size={15} className="mt-0.5 shrink-0 text-warning" aria-hidden />
              <span>
                <span className="font-semibold">This page was changed in another tab{theirs ? ` ${formatRelative(theirs)}` : ''}.</span>{' '}
                <span className="text-fg-muted">Saving is paused here until you choose which version to keep.</span>
              </span>
            </p>
            <div className="flex shrink-0 gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  actions.loadTheirs();
                  toast('Loaded the other tab’s version');
                }}
              >
                Load other version
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  actions.keepMine();
                  toast('Kept this version', { description: 'It replaced the copy from the other tab.' });
                }}
              >
                Keep this version
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
