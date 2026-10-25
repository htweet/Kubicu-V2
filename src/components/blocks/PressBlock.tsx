import React from 'react';
import { ArrowUpRightIcon, NewspaperIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { SectionHeading } from './SectionHeading';
import { PageAction } from './PageAction';
import { accentOf, fontsFor, mix } from './pageStyle';

const kindLabels = { article: 'Article', interview: 'Interview', book: 'Book', podcast: 'Podcast', talk: 'Talk' } as const;

/** Press & publications (D169): an index of outlet, headline and date — each row links to the source. */
export function PressBlock({ block, theme, mode }: BlockProps<'press'>) {
  const c = block.content;
  const items = c.items.filter((i) => i.title.trim() || i.outlet.trim());
  if (items.length === 0) return mode === 'edit' ? <BlockPlaceholder icon={NewspaperIcon} title="Add press or publications" hint="Link each one to where it was published" theme={theme} /> : null;
  const display = fontsFor(theme).display;
  return (
    <section>
      <SectionHeading theme={theme} title={c.title} />
      <ul className="flex flex-col">
        {items.map((i) => {
          const row =
          <>
              <span className="min-w-0 flex-1">
                <span className="block text-[12px] font-semibold uppercase tracking-[0.08em]" style={{ color: accentOf(theme) }}>
                  {i.outlet || kindLabels[i.kind]}
                </span>
                <span className="mt-1 block text-[18px] font-medium leading-snug" style={{ fontFamily: display, color: theme.text }}>
                  {i.title || i.outlet}
                </span>
                <span className="mt-1 block text-[13px]" style={{ color: theme.mutedText }}>
                  {kindLabels[i.kind]}
                  {i.date && ` · ${i.date}`}
                </span>
              </span>
              {i.url && <ArrowUpRightIcon size={18} aria-hidden className="mt-1 shrink-0 transition-transform duration-150 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" style={{ color: theme.text }} />}
            </>;

          return (
            <li key={i.id} style={{ borderTop: `1px solid ${mix(theme.text, 10)}` }}>
              {i.url ?
              <PageAction mode={mode} href={i.url} className="group flex items-start gap-4 py-5">
                  {row}
                </PageAction> :

              <div className="flex items-start gap-4 py-5">{row}</div>
              }
            </li>);

        })}
      </ul>
    </section>);

}