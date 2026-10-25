import React from 'react';
import { CalendarClockIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { SectionHeading } from './SectionHeading';
import { accentOf, fontsFor, mix } from './pageStyle';

/** Agenda (D169): time in its own column, session title, who's on, and a short note. */
export function AgendaBlock({ block, theme, mode }: BlockProps<'agenda'>) {
  const c = block.content;
  const items = c.items.filter((i) => i.title.trim());
  if (items.length === 0) return mode === 'edit' ? <BlockPlaceholder icon={CalendarClockIcon} title="Add sessions" hint="A time and a title for each" theme={theme} /> : null;
  const display = fontsFor(theme).display;
  return (
    <section>
      <SectionHeading theme={theme} title={c.title} intro={c.date || undefined} />
      <ol className="flex flex-col">
        {items.map((i) =>
        <li key={i.id} className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4 py-5 md:grid-cols-[6rem_minmax(0,1fr)] md:gap-8" style={{ borderTop: `1px solid ${mix(theme.text, 10)}` }}>
            <time className="pt-0.5 text-[15px] font-semibold tabular-nums" style={{ color: accentOf(theme) }}>{i.time}</time>
            <div className="min-w-0">
              <h3 className="text-[18px] font-medium leading-snug" style={{ fontFamily: display, color: theme.text }}>{i.title}</h3>
              {i.speaker && <p className="mt-0.5 text-[14px] font-medium" style={{ color: theme.text }}>{i.speaker}</p>}
              {i.text && <p className="mt-1.5 text-[14px] leading-relaxed" style={{ color: theme.mutedText }}>{i.text}</p>}
            </div>
          </li>
        )}
      </ol>
    </section>);

}