import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { XIcon } from 'lucide-react';
import { useT } from '../../contexts/LocaleContext';

const KEY = 'kubicu.site.announcement.ai-preview';

/** Thin dismissible notice above the website nav (D260). Dismissal lasts for this browser session. Translated in D318. */
export function AnnouncementBar() {
  const { t: tr } = useT();
  const [open, setOpen] = useState(() => {
    try {
      return sessionStorage.getItem(KEY) !== '1';
    } catch {
      return true;
    }
  });
  if (!open) return null;
  return (
    <div className="relative bg-[rgb(var(--kb-plum))] px-12 py-3 text-center text-[14px] font-medium text-white print:hidden">
      {tr('New: describe your business in a chat and get a draft page in minutes.')}{' '}
      <Link to="/copilot" className="font-bold underline underline-offset-4 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
        {tr('Try it')}
      </Link>
      <button
        type="button"
        aria-label={tr('Dismiss announcement')}
        onClick={() => {
          setOpen(false);
          try {
            sessionStorage.setItem(KEY, '1');
          } catch {
            /* storage unavailable */
          }
        }}
        className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-white/80 transition-colors duration-150 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <XIcon size={16} aria-hidden />
      </button>
    </div>
  );
}
