import React from 'react';
import { FeatherIcon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import { useDataSaver } from '../../contexts/DataSaverContext';
import { useT } from '../../contexts/LocaleContext';

/** Slim strip at the top of a public page while Lightweight mode is on (D85). Follows the visitor's language (D507). */
export function DataSaverBar({ theme }: { theme: PageTheme }) {
  const { t: tr } = useT();
  const { on, reason, imagesShown, setOn, showImages } = useDataSaver();
  if (!on) return null;
  const why = reason === 'network' ? tr('Your connection looks slow, so data saver is on.') : reason === 'seller' ? tr('This page opens in data saver to keep it light.') : tr('Data saver is on.');
  return (
    <div role="region" aria-label={tr('Data saver')} className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 px-4 py-2 text-center text-[12px] font-medium" style={{ background: theme.text, color: theme.background }}>
      <span className="inline-flex items-center gap-1.5">
        <FeatherIcon size={13} aria-hidden className="shrink-0" />
        {why} {imagesShown ? tr('Videos load when you tap them.') : tr('Photos and videos load when you ask.')}
      </span>
      <span className="inline-flex items-center gap-3">
        {!imagesShown && (
          <button type="button" onClick={showImages} className="whitespace-nowrap rounded px-1 font-semibold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2">
            {tr('Show photos')}
          </button>
        )}
        <button type="button" onClick={() => setOn(false)} className="whitespace-nowrap rounded px-1 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2">
          {tr('Turn off')}
        </button>
      </span>
    </div>
  );
}
