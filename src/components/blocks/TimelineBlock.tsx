import React from 'react';
import { GitCommitVerticalIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { SectionHeading } from './SectionHeading';
import { accentOf, fontsFor, mix } from './pageStyle';

/** Timeline (D169): a vertical rule with dated milestones; dates sit in their own column on wide screens. */
export function TimelineBlock({ block, theme, mode }: BlockProps<'timeline'>) {
  const c = block.content;
  const items = c.items.filter((i) => i.title.trim());
  if (items.length === 0) return mode === 'edit' ? <BlockPlaceholder icon={GitCommitVerticalIcon} title="Add milestones" hint="A date and a title for each" theme={theme} /> : null;
  const accent = accentOf(theme);
  return (
    <section>
      <SectionHeading theme={theme} title={c.title} intro={c.intro} />
      <ol className="relative flex flex-col gap-8">
        <span aria-hidden className="absolute bottom-2 left-[5px] top-2 w-px md:left-[calc(7rem+5px)]" style={{ background: mix(theme.text, 18) }} />
        {items.map((i) =>
        <li key={i.id} className="relative grid gap-1 pl-8 md:grid-cols-[7rem_minmax(0,1fr)] md:gap-x-8 md:pl-0">
            <span aria-hidden className="absolute left-0 top-[7px] h-[11px] w-[11px] rounded-full md:left-[7rem]" style={{ background: accent, boxShadow: `0 0 0 4px ${theme.background}` }} />
            <span className="text-[13px] font-semibold tabular-nums md:pt-0.5 md:text-right" style={{ color: theme.mutedText }}>
              {i.date}
            </span>
            <div className="md:pl-8">
              <h3 className="text-[18px] font-medium leading-snug" style={{ fontFamily: fontsFor(theme).display, color: theme.text }}>
                {i.title}
              </h3>
              {i.text && <p className="mt-1.5 text-[15px] leading-relaxed" style={{ color: theme.mutedText }}>{i.text}</p>}
            </div>
          </li>
        )}
      </ol>
    </section>);

}