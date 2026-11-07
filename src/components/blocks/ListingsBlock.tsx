import React from 'react';
import { ArrowUpRightIcon, HomeIcon, MapPinIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { PageAction } from './PageAction';
import { PageChip } from './BlockTitle';
import { MediaImage } from '../media/MediaImage';
import { SectionHeading } from './SectionHeading';
import { cardRadius, fontsFor, mix } from './pageStyle';
import { useT } from '../../contexts/LocaleContext';

/** Properties, stays or experiences (D153, refined in D157). Sample cards carry "Example listing" until edited. */
export function ListingsBlock({ block, theme, mode }: BlockProps<'listings'>) {
  const { t: tr } = useT();
  const c = block.content;
  const cta = c.ctaLabel || tr('Enquire');
  const items = c.items.filter((i) => i.title.trim());
  if (items.length === 0) return mode === 'edit' ? <BlockPlaceholder icon={HomeIcon} title="Add listings" hint="Photo, price, key facts and location" theme={theme} tall /> : null;
  const display = fontsFor(theme).display;
  const radius = cardRadius(theme);
  return (
    <section>
      <SectionHeading theme={theme} title={c.title} />
      <ul className="grid gap-x-6 gap-y-12" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 290px), 1fr))' }}>
        {items.map((i) => (
          <li key={i.id} className="flex">
            <PageAction mode={mode} href={i.url} className="group flex w-full flex-col" ariaLabel={`${cta}: ${i.title}`}>
              <div className="relative aspect-[4/3] overflow-hidden" style={{ borderRadius: radius, background: mix(theme.text, 6, theme.background) }}>
                {i.imageUrl && <MediaImage src={i.imageUrl} alt={i.imageAlt} className="block h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]" />}
                {i.example && (
                  <span className="absolute left-3 top-3">
                    <PageChip theme={theme}>{tr('Example listing')}</PageChip>
                  </span>
                )}
                {i.price && (
                  <span className="absolute bottom-3 left-3 px-3.5 py-2 text-[15px] font-semibold tabular-nums" style={{ background: theme.background, color: theme.text, borderRadius: Math.min(radius, 999) }}>
                    {i.price}
                  </span>
                )}
              </div>
              <div className="mt-5 flex items-start justify-between gap-4">
                <h3 className="min-w-0 text-[21px] font-medium leading-snug tracking-[-0.01em]" style={{ fontFamily: display, color: theme.text }}>{i.title}</h3>
                <ArrowUpRightIcon size={18} aria-hidden className="mt-1 shrink-0 transition-transform duration-150 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" style={{ color: theme.text }} />
              </div>
              {i.facts && <p className="mt-2 text-[15px]" style={{ color: theme.text }}>{i.facts}</p>}
              {i.location && (
                <p className="mt-1.5 flex items-center gap-1.5 text-[14px]" style={{ color: theme.mutedText }}>
                  <MapPinIcon size={14} aria-hidden /> {i.location}
                </p>
              )}
              <span className="mt-4 text-[14px] font-semibold underline decoration-1 underline-offset-4" style={{ color: theme.text }}>
                {cta}
              </span>
            </PageAction>
          </li>
        ))}
      </ul>
    </section>
  );
}
