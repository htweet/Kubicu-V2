import React from 'react';
import { PlayIcon, TvIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { PageAction } from './PageAction';
import { MediaImage } from '../media/MediaImage';
import { SectionHeading } from './SectionHeading';
import { buttonStyle, cardRadius, fontsFor, mix } from './pageStyle';

/** Episodes, releases, videos or chapters (D153, refined in D157): an editorial index with big titles, then where to listen or watch. */
export function MediaListBlock({ block, theme, mode }: BlockProps<'mediaList'>) {
  const c = block.content;
  const items = c.items.filter((i) => i.title.trim());
  if (items.length === 0) return mode === 'edit' ? <BlockPlaceholder icon={TvIcon} title="Add episodes or releases" hint="Title, date or guest, length and a link" theme={theme} tall /> : null;
  const wideThumb = c.kind === 'videos';
  const display = fontsFor(theme).display;
  const links = c.links.filter((l) => l.label.trim() && l.url.trim());
  return (
    <section>
      <SectionHeading theme={theme} title={c.title} />
      <ul style={{ borderTop: `1px solid ${mix(theme.text, 22)}` }}>
        {items.map((i, n) => (
          <li key={i.id} style={{ borderBottom: `1px solid ${mix(theme.text, 12)}` }}>
            <PageAction mode={mode} href={i.url} className="group flex items-center gap-5 py-5 md:gap-8 md:py-6" ariaLabel={i.url ? `${i.title}${i.meta ? `, ${i.meta}` : ''}${i.duration ? `, ${i.duration}` : ''}` : undefined}>
              {i.imageUrl ? (
                <span className={`relative shrink-0 overflow-hidden ${wideThumb ? 'aspect-video w-28 md:w-44' : 'h-16 w-16 md:h-20 md:w-20'}`} style={{ borderRadius: Math.min(cardRadius(theme), 14), background: mix(theme.text, 6, theme.background) }}>
                  <MediaImage src={i.imageUrl} alt="" className="block h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]" />
                </span>
              ) : (
                <span aria-hidden className="w-9 shrink-0 text-[15px] font-medium tabular-nums md:w-12 md:text-[17px]" style={{ color: theme.mutedText, fontFamily: display }}>
                  {String(n + 1).padStart(2, '0')}
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block text-[18px] font-medium leading-snug tracking-[-0.01em] decoration-1 underline-offset-4 group-hover:underline md:text-[22px]" style={{ color: theme.text, fontFamily: display }}>{i.title}</span>
                {i.meta && <span className="mt-1 block truncate text-[14px]" style={{ color: theme.mutedText }}>{i.meta}</span>}
              </span>
              {i.duration && <span className="hidden shrink-0 text-[14px] tabular-nums sm:block" style={{ color: theme.mutedText }}>{i.duration}</span>}
              {i.url && (
                <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors duration-150" style={{ border: `1px solid ${mix(theme.text, 22)}`, color: theme.text }}>
                  <PlayIcon size={15} />
                </span>
              )}
            </PageAction>
          </li>
        ))}
      </ul>
      {links.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2.5">
          {links.map((l) => (
            <PageAction key={l.id} mode={mode} href={l.url} className="inline-flex min-h-[46px] items-center px-5 text-[14px] font-semibold" style={buttonStyle(theme, 'default')}>
              {l.label}
            </PageAction>
          ))}
        </div>
      )}
    </section>
  );
}
