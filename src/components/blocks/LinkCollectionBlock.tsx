import React from 'react';
import { ArrowUpRightIcon, ListTreeIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { SectionHeading } from './SectionHeading';
import { PageAction } from './PageAction';
import { buttonStyle, cardStyle, fontsFor, mix } from './pageStyle';

/** Link collection (D170): grouped links for people with many destinations — a quiet list, or a card grid. */
export function LinkCollectionBlock({ block, theme, mode }: BlockProps<'linkCollection'>) {
  const c = block.content;
  const groups = c.groups.map((g) => ({ ...g, links: g.links.filter((l) => l.label.trim() && (l.url.trim() || mode === 'edit')) })).filter((g) => g.links.length);
  if (groups.length === 0) return mode === 'edit' ? <BlockPlaceholder icon={ListTreeIcon} title="Add links" hint="Group them under a few headings" theme={theme} /> : null;
  const display = fontsFor(theme).display;
  const grid = c.layout === 'grid';
  return (
    <section>
      <SectionHeading theme={theme} title={c.title} />
      <div className="flex flex-col gap-8">
        {groups.map((g) =>
        <div key={g.id}>
            {g.name && groups.length > 1 && <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.08em]" style={{ color: theme.mutedText }}>{g.name}</h3>}
            <ul className={grid ? 'grid gap-3' : 'flex flex-col gap-2'} style={grid ? { gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))' } : undefined}>
              {g.links.map((l) =>
            <li key={l.id} className="flex">
                  <PageAction mode={mode} href={l.url} className={grid ? 'group flex w-full flex-col p-4' : 'group flex min-h-[56px] w-full items-center justify-between gap-3 px-4 py-3'} style={grid ? cardStyle(theme) : buttonStyle(theme, 'default')}>
                    <span className="min-w-0">
                      <span className={grid ? 'block text-[16px] font-medium' : 'block text-[15px] font-medium'} style={{ color: theme.text, fontFamily: grid ? display : undefined }}>{l.label}</span>
                      {l.description && <span className="mt-0.5 block text-[13px] leading-snug" style={{ color: theme.mutedText }}>{l.description}</span>}
                    </span>
                    <ArrowUpRightIcon size={16} aria-hidden className={grid ? 'mt-3 transition-transform duration-150 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5' : 'shrink-0'} style={{ color: mix(theme.text, 60) }} />
                  </PageAction>
                </li>
            )}
            </ul>
          </div>
        )}
      </div>
    </section>);

}