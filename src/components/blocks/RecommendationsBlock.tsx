import React from 'react';
import { ArrowUpRightIcon, ThumbsUpIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { SectionHeading } from './SectionHeading';
import { PageAction } from './PageAction';
import { MediaImage } from '../media/MediaImage';
import { accentOf, cardRadius, fontsFor, mix } from './pageStyle';
import { useT } from '../../contexts/LocaleContext';

/**
 * Recommendations (D170): the owner's own picks in their chosen order, each with "why". Numbered because
 * the order is the recommendation. No automatic ranking or personalisation is claimed.
 */
export function RecommendationsBlock({ block, theme, mode }: BlockProps<'recommendations'>) {
  // "Why:" and the screen-reader pick number follow the visitor's language (D506).
  const { t: tr } = useT();
  const c = block.content;
  const items = c.items.filter((i) => i.title.trim());
  if (items.length === 0) return mode === 'edit' ? <BlockPlaceholder icon={ThumbsUpIcon} title="Add your picks" hint="Put the one people should start with first" theme={theme} /> : null;
  const display = fontsFor(theme).display;
  const accent = accentOf(theme);
  return (
    <section>
      <SectionHeading theme={theme} title={c.title} intro={c.intro} />
      <ol className="flex flex-col">
        {items.map((i, n) => {
          const body = (
            <>
              <span aria-hidden className="w-9 shrink-0 pt-0.5 text-[28px] font-medium leading-none tabular-nums" style={{ fontFamily: display, color: mix(accent, 70, theme.background) }}>
                {n + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[18px] font-medium leading-snug" style={{ fontFamily: display, color: theme.text }}>{i.title}</span>
                {i.text && <span className="mt-1 block text-[14px] leading-relaxed" style={{ color: theme.mutedText }}>{i.text}</span>}
                {i.reason && (
                  <span className="mt-2 block text-[13px] italic leading-snug" style={{ color: theme.text }}>
                    {tr('Why:')} {i.reason}
                  </span>
                )}
              </span>
              {i.imageUrl && (
                <span className="h-16 w-16 shrink-0 overflow-hidden md:h-20 md:w-20" style={{ borderRadius: Math.max(cardRadius(theme) - 6, 4) }}>
                  <MediaImage src={i.imageUrl} alt={i.imageAlt} className="h-full w-full object-cover" />
                </span>
              )}
              {i.url && !i.imageUrl && <ArrowUpRightIcon size={18} aria-hidden className="mt-1 shrink-0" style={{ color: theme.text }} />}
            </>
          );
          return (
            <li key={i.id} style={{ borderTop: `1px solid ${mix(theme.text, 10)}` }}>
              <span className="sr-only">{tr('Pick {n}:', { n: n + 1 })} </span>
              {i.url ? (
                <PageAction mode={mode} href={i.url} className="flex items-start gap-4 py-5">
                  {body}
                </PageAction>
              ) : (
                <div className="flex items-start gap-4 py-5">{body}</div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
