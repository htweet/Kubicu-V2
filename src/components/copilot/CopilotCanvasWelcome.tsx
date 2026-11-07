import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CircleDashedIcon, XIcon } from 'lucide-react';
import { clearCopilotWelcome, readCopilotWelcome, type CopilotWelcome } from '../../utils/copilot/claim';

const ease = [0.23, 1, 0.32, 1] as const;

/**
 * Shown once, when a page continued from Copilot first opens in the canvas (D264): it's here, it's a
 * normal editable page, what's still missing, and that nothing goes live without the person choosing to.
 */
export function CopilotCanvasWelcome({ pageId }: { pageId: string }) {
  const [welcome, setWelcome] = useState<CopilotWelcome | null>(() => readCopilotWelcome(pageId));
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setWelcome(readCopilotWelcome(pageId));
  }, [pageId]);

  useEffect(() => {
    if (!welcome) return undefined;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [welcome]);

  const dismiss = () => {
    clearCopilotWelcome();
    setWelcome(null);
  };

  return (
    <AnimatePresence>
      {welcome && (
        <motion.section
          role="dialog"
          aria-modal="false"
          aria-labelledby="cp-welcome-title"
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.24, ease }}
          className="fixed inset-x-3 bottom-20 z-[60] max-h-[70dvh] overflow-y-auto rounded-xl border border-line bg-raised p-5 shadow-3 lg:inset-x-auto lg:bottom-6 lg:right-6 lg:w-[380px]"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-caption font-semibold text-fg-muted">From Copilot</p>
              <h2 id="cp-welcome-title" className="mt-0.5 text-[19px] font-semibold leading-tight text-fg">
                {welcome.title} is in KUBICU
              </h2>
            </div>
            <button type="button" onClick={dismiss} aria-label="Close" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-fg-muted hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
              <XIcon size={16} aria-hidden />
            </button>
          </div>
          <p className="mt-2 text-label text-fg-muted">
            It’s now {welcome.asSpace ? 'a new space in this workspace' : 'your main page'} — a normal page made of blocks, with nothing locked.
          </p>
          <ul className="mt-4 flex flex-col gap-2.5 text-label text-fg">
            <li>
              <span className="font-semibold">Edit anything.</span> <span className="text-fg-muted">Select a block to change its words, photos or layout.</span>
            </li>
            <li>
              <span className="font-semibold">Change the look.</span> <span className="text-fg-muted">Theme and Templates swap the design and keep your content.</span>
            </li>
            <li>
              <span className="font-semibold">Nothing is public yet.</span> <span className="text-fg-muted">Preview any time — publishing always asks you first.</span>
            </li>
          </ul>
          {welcome.gaps.length > 0 && (
            <div className="mt-4 border-t border-line pt-4">
              <p className="text-label font-semibold text-fg">Still to fill in before publishing</p>
              <ul className="mt-2 flex flex-col gap-1.5">
                {welcome.gaps.map((g) => (
                  <li key={g} className="flex items-start gap-2 text-caption text-fg-muted">
                    <CircleDashedIcon size={13} className="mt-0.5 shrink-0" aria-hidden /> {g}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-caption text-fg-subtle">These are marked on the page and listed in the Check tab. Fill them in or remove them.</p>
            </div>
          )}
          <button
            ref={closeRef}
            type="button"
            onClick={dismiss}
            className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-md bg-action px-4 text-label font-semibold text-action-fg transition-transform duration-150 ease-out hover:bg-action-hover active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            Start editing
          </button>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
