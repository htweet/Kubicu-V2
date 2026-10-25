import React from 'react';
import type { BlockProps } from './blockProps';
import { SectionHeading } from './SectionHeading';
import { ContainerPlaceholder } from './ContainerPlaceholder';
import { useBlockChildren } from '../../contexts/BlockChildrenContext';
import { MAX_CHILDREN } from '../../utils/containers';

/** Section (D167): an optional heading over up to 4 blocks, sharing the section's width and background. */
export function SectionBlock({ block, theme, mode }: BlockProps<'section'>) {
  const ctx = useBlockChildren();
  const c = block.content;
  const kids = ctx?.childrenOf(block.id) ?? [];
  const center = c.align === 'center';
  if (!ctx) return mode === 'edit' ? <ContainerPlaceholder kind="section" theme={theme} /> : null;
  if (mode !== 'edit' && kids.length === 0 && !c.heading.trim() && !c.intro.trim()) return null;
  return (
    <section aria-label={c.heading.trim() ? undefined : 'Section'}>
      <SectionHeading theme={theme} title={c.heading.trim() || undefined} intro={c.intro.trim() || undefined} center={center} />
      {kids.length > 0 &&
      <div className="flex flex-col gap-2">
          {kids.map((k, i) =>
        <React.Fragment key={k.id}>{ctx.render(k, theme, { index: i, count: kids.length, container: block })}</React.Fragment>
        )}
        </div>
      }
      {mode === 'edit' && kids.length === 0 && <ContainerPlaceholder kind="section" theme={theme} hint="Empty section — add up to 4 blocks inside" />}
      {mode === 'edit' && kids.length < MAX_CHILDREN && ctx.addSlot?.(block, theme)}
    </section>);

}