import React from 'react';
import { ArrowUpRightIcon, LayoutDashboardIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { PageAction } from './PageAction';
import { MediaImage } from '../media/MediaImage';
import { SectionHeading } from './SectionHeading';
import { cardRadius, cardStyle as themeCard, fontsFor, mix } from './pageStyle';

const minWidth = { 2: 280, 3: 230, 4: 190 } as const;

/**
 * Two to four items side by side (D153, refined in D157). With photos: image-led cards. Without: surface panels
 * with a large display title, so text-only grids still feel designed. Footers share a baseline (mt-auto).
 */
export function FeatureGridBlock({ block, theme, mode }: BlockProps<'featureGrid'>) {
  const c = block.content;
  const items = c.items.filter((i) => i.title.trim());
  if (items.length === 0) return mode === 'edit' ? <BlockPlaceholder icon={LayoutDashboardIcon} title="Add items" hint="Services, programmes, formats or categories" theme={theme} tall /> : null;
  const display = fontsFor(theme).display;
  const radius = cardRadius(theme);
  const withImages = items.some((i) => i.imageUrl);
  const accent = theme.accent === theme.text ? theme.mutedText : theme.accent;
  return (
    <section>
      <SectionHeading theme={theme} title={c.title} intro={c.intro} />
      <ul className="grid gap-5 md:gap-6" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${minWidth[c.columns]}px), 1fr))` }}>
        {items.map((i, idx) => {
          const body = (
            <>
              {withImages && (
                // Inset photo with its own inner radius — reads as a framed print rather than a cropped strip (D160).
                <div className="px-3 pt-3">
                  <div className="aspect-[4/3] overflow-hidden" style={{ background: mix(accent, 12, theme.background), borderRadius: Math.max(0, Math.min(radius, 999) - 6) }}>
                    {i.imageUrl ? (
                      <MediaImage src={i.imageUrl} alt={i.imageAlt} className="block h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]" />
                    ) : (
                      <span aria-hidden className="flex h-full w-full items-center justify-center text-[clamp(2.5rem,6cqw,3.5rem)] font-medium" style={{ fontFamily: display, color: mix(accent, 55, theme.background) }}>
                        {i.title.slice(0, 1)}
                      </span>
                    )}
                  </div>
                </div>
              )}
              <div className="flex flex-1 flex-col p-6 md:p-7">
                {!withImages && (
                  <span aria-hidden className="mb-5 flex h-10 w-10 items-center justify-center rounded-full text-[15px] font-semibold tabular-nums" style={{ background: mix(accent, 16, theme.surface), color: theme.text }}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                )}
                {i.label && <p className="text-[13px] font-semibold tabular-nums" style={{ color: theme.accent === theme.text ? theme.mutedText : theme.accent }}>{i.label}</p>}
                <h3 className={`${i.label ? 'mt-3' : ''} text-[22px] font-medium leading-[1.15] tracking-[-0.015em] md:text-[24px]`} style={{ fontFamily: display, color: theme.text }}>
                  {i.title}
                </h3>
                {i.text && <p className="mt-3 text-[15px] leading-relaxed md:text-[16px]" style={{ color: theme.mutedText }}>{i.text}</p>}
                {i.url && (
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-[14px] font-semibold" style={{ color: theme.text }}>
                    Learn more <ArrowUpRightIcon size={15} aria-hidden className="transition-transform duration-150 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                )}
              </div>
            </>
          );
          // Signature themes (D161) bring their own surface finish; classic themes keep the soft card.
          const cardStyle = theme.material
            ? { ...themeCard(theme), borderRadius: radius }
            : { background: theme.surface, borderRadius: radius, border: `1px solid ${mix(theme.text, 8)}`, boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 18px 36px -24px rgba(0,0,0,0.22)' };
          return (
            <li key={i.id} className="flex">
              {i.url ? (
                <PageAction mode={mode} href={i.url} className="group flex w-full flex-col overflow-hidden transition-[border-color,transform] duration-150 ease-out hover:-translate-y-0.5" style={cardStyle}>
                  {body}
                </PageAction>
              ) : (
                <div className="flex w-full flex-col overflow-hidden" style={cardStyle}>
                  {body}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
