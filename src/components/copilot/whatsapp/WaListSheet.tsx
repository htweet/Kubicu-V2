import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import type { CopilotReply } from '../../../types/copilot';
import { wa } from './waStyle';
import { useT } from '../../../contexts/LocaleContext';

interface Props {
  title: string;
  rows: CopilotReply[];
  onPick: (r: CopilotReply) => void;
  onClose: () => void;
}

const ease = [0.23, 1, 0.32, 1] as const;

/** WhatsApp's list message (D263): a sheet of up to 10 rows, each with an optional description. */
export function WaListSheet({ title, rows, onPick, onClose }: Props) {
  const { t: tr } = useT();
  const first = useRef<HTMLButtonElement>(null);
  useEffect(() => first.current?.focus(), []);

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-end" onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <motion.button
        type="button"
        aria-label={tr('Close list')}
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative max-h-[80%] overflow-y-auto rounded-t-2xl bg-white pb-3"
        style={{ color: wa.text }}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.22, ease }}
      >
        <div className="sticky top-0 flex items-center gap-3 bg-white px-4 pb-2 pt-4">
          <button type="button" onClick={onClose} aria-label={tr('Close')} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2" style={{ color: wa.meta }}>
            <XIcon size={20} aria-hidden />
          </button>
          <p className="text-[16px] font-semibold">{title}</p>
        </div>
        <ul>
          {rows.map((r, i) => (
            <li key={r.value} style={{ borderTop: i ? `1px solid ${wa.divider}` : undefined }}>
              <button
                ref={i === 0 ? first : undefined}
                type="button"
                onClick={() => onPick(r)}
                className="flex min-h-[56px] w-full items-center gap-3 px-5 py-2.5 text-left hover:bg-black/[0.03] focus-visible:bg-black/[0.05] focus-visible:outline-none"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px]">{tr(r.label)}</span>
                  {r.description && <span className="block text-[13px]" style={{ color: wa.meta }}>{tr(r.description)}</span>}
                </span>
                <span aria-hidden className="h-5 w-5 shrink-0 rounded-full border-2" style={{ borderColor: wa.meta }} />
              </button>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
