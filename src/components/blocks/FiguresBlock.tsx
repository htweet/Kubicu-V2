import React from 'react';
import { BarChart3Icon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { PageChip } from './BlockTitle';
import { SectionHeading } from './SectionHeading';
import { fontsFor, mix } from './pageStyle';

/** Two to four labelled numbers (D153, refined in D157). Labelled "Example figures" until the owner confirms they're real. */
export function FiguresBlock({ block, theme, mode }: BlockProps<'figures'>) {
  const c = block.content;
  const items = c.items.filter((i) => i.value.trim() && i.label.trim());
  if (items.length === 0) return mode === 'edit' ? <BlockPlaceholder icon={BarChart3Icon} title="Add figures" hint="Only numbers you can stand behind" theme={theme} /> : null;
  const display = fontsFor(theme).display;
  return (
    <section>
      <SectionHeading theme={theme} title={c.title} aside={!c.confirmed ? <PageChip theme={theme} tone="muted">Example figures</PageChip> : undefined} />
      <dl className="grid gap-x-8 gap-y-10" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))' }}>
        {items.map((i) =>
        <div key={i.id} className="relative flex flex-col-reverse pt-5" style={{ borderTop: `1px solid ${mix(theme.text, 22)}` }}>
            <span aria-hidden className="absolute -top-px left-0 h-[3px] w-12" style={{ background: theme.accent === theme.text ? theme.mutedText : theme.accent }} />
            <dt className="mt-3 max-w-[22ch] text-[15px] leading-snug" style={{ color: theme.mutedText }}>{i.label}</dt>
            <dd className="break-words text-[clamp(2.25rem,5cqw,4rem)] font-medium leading-[0.95] tracking-[-0.04em] tabular-nums" style={{ fontFamily: display, color: theme.text }}>{i.value}</dd>
          </div>
        )}
      </dl>
    </section>);

}