import React from 'react';
import { ArrowUpRightIcon, UsersIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { SectionHeading } from './SectionHeading';
import { PageAction } from './PageAction';
import { MediaImage } from '../media/MediaImage';
import { accentOf, cardRadius, fontsFor, imageFrameStyle, mix } from './pageStyle';
import { useT } from '../../contexts/LocaleContext';

/** Team (D169): portrait-led people grid. "Speakers" crops tighter and leads with the session role. Link wording follows the visitor's language (D506). */
export function TeamBlock({ block, theme, mode }: BlockProps<'team'>) {
  const { t: tr } = useT();
  const c = block.content;
  const people = c.items.filter((p) => p.name.trim());
  if (people.length === 0) return mode === 'edit' ? <BlockPlaceholder icon={UsersIcon} title="Add people" hint="A photo, name and role for each" theme={theme} tall /> : null;
  const display = fontsFor(theme).display;
  const accent = accentOf(theme);
  const radius = Math.max(cardRadius(theme) - 4, 4);
  const speakers = c.variant === 'speakers';
  return (
    <section>
      <SectionHeading theme={theme} title={c.title} intro={c.intro} />
      <ul className="grid gap-x-6 gap-y-10" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${speakers ? 180 : 210}px), 1fr))` }}>
        {people.map((p) => (
          <li key={p.id} className="flex flex-col">
            <div className={speakers ? 'aspect-square overflow-hidden' : 'aspect-[4/5] overflow-hidden'} style={{ borderRadius: speakers ? 999 : radius, background: mix(accent, 12, theme.background), ...(speakers ? {} : imageFrameStyle(theme)) }}>
              {p.imageUrl ? (
                <MediaImage src={p.imageUrl} alt={p.imageAlt || p.name} className="h-full w-full object-cover" />
              ) : (
                <span aria-hidden className="flex h-full w-full items-center justify-center text-[44px] font-medium" style={{ fontFamily: display, color: mix(accent, 60, theme.background) }}>
                  {p.name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <h3 className={`mt-4 text-[18px] font-medium leading-snug ${speakers ? 'text-center' : ''}`} style={{ fontFamily: display, color: theme.text }}>
              {p.name}
            </h3>
            {p.role && <p className={`mt-0.5 text-[14px] font-medium ${speakers ? 'text-center' : ''}`} style={{ color: accent }}>{p.role}</p>}
            {p.bio && <p className={`mt-2 text-[14px] leading-relaxed ${speakers ? 'text-center' : ''}`} style={{ color: theme.mutedText }}>{p.bio}</p>}
            {p.url && (
              <PageAction mode={mode} href={p.url} ariaLabel={tr('More about {name}', { name: p.name })} className={`mt-3 inline-flex min-h-[32px] items-center gap-1 text-[14px] font-semibold ${speakers ? 'self-center' : ''}`} style={{ color: theme.text }}>
                {tr('Profile')} <ArrowUpRightIcon size={14} aria-hidden />
              </PageAction>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
