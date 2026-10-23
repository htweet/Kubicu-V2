import React from 'react';
import { FeatherIcon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import { useDataSaver } from '../../contexts/DataSaverContext';

/** Slim strip at the top of a public page while Lightweight mode is on (D85). */
export function DataSaverBar({ theme }: {theme: PageTheme;}) {
  const { on, auto, imagesShown, setOn, showImages } = useDataSaver();
  if (!on) return null;
  return (
    <div role="region" aria-label="Data saver" className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 px-4 py-2 text-center text-[12px] font-medium" style={{ background: theme.text, color: theme.background }}>
      <span className="inline-flex items-center gap-1.5">
        <FeatherIcon size={13} aria-hidden className="shrink-0" />
        {auto ? 'Your connection looks slow, so data saver is on.' : 'Data saver is on.'} {imagesShown ? 'Videos load when you tap them.' : 'Photos and videos load when you ask.'}
      </span>
      <span className="inline-flex items-center gap-3">
        {!imagesShown &&
        <button type="button" onClick={showImages} className="rounded px-1 font-semibold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2">
            Show photos
          </button>
        }
        <button type="button" onClick={() => setOn(false)} className="rounded px-1 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2">
          Turn off
        </button>
      </span>
    </div>);

}