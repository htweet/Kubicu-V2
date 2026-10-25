import React from 'react';
import { AwardIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { MediaImage } from '../media/MediaImage';
import { fontsFor, mix } from './pageStyle';

/** Clients, partners or press (D153, refined in D157). Hidden on the live page until the owner confirms they have permission. */
export function LogoStripBlock({ block, theme, mode }: BlockProps<'logoStrip'>) {
  const c = block.content;
  const items = c.items.filter((i) => i.name.trim());
  if (items.length === 0) return mode === 'edit' ? <BlockPlaceholder icon={AwardIcon} title="Add names or logos" hint="Only brands that agreed to be shown" theme={theme} /> : null;
  if (mode === 'live' && !c.permission) return null;
  return (
    <section className="py-2">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-12">
        {c.title && <p className="shrink-0 text-[14px] font-medium md:w-40" style={{ color: theme.mutedText }}>{c.title}</p>}
        <ul className="grid flex-1 items-center gap-x-10 gap-y-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))' }}>
          {items.map((i) =>
          <li key={i.id} className="flex h-12 items-center">
              {i.logoUrl ?
            <MediaImage src={i.logoUrl} alt={i.name} className="h-9 w-auto max-w-[150px] object-contain opacity-80 grayscale" /> :

            <span className="text-[20px] font-medium leading-tight tracking-[-0.02em]" style={{ color: mix(theme.text, 78, theme.background), fontFamily: fontsFor(theme).display }}>{i.name}</span>
            }
            </li>
          )}
        </ul>
      </div>
      {mode === 'edit' && !c.permission && <p className="mt-4 text-[12px]" style={{ color: theme.mutedText }}>Hidden on your live page until you confirm you have permission to show these.</p>}
    </section>);

}