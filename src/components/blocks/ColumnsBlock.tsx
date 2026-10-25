import React, { useRef } from 'react';
import type { BlockProps } from './blockProps';
import { ContainerPlaceholder } from './ContainerPlaceholder';
import { useBlockChildren } from '../../contexts/BlockChildrenContext';
import { useRenderPlan } from '../../contexts/RenderPlanContext';
import { useElementWidth } from '../../hooks/useElementWidth';
import { planAtLeast } from '../../data/plans';
import { MAX_CHILDREN } from '../../utils/containers';
import { pairColumns } from '../../utils/pageLayout';

/**
 * Columns (D167): each block inside is one column. Side by side when the block itself is wide enough
 * (measured, so the canvas, previews and the live page agree); stacked on phones, optionally reversed.
 * Free plan: always stacked — the graceful fallback.
 */
export function ColumnsBlock({ block, theme, mode }: BlockProps<'columns'>) {
  const ctx = useBlockChildren();
  const plan = useRenderPlan();
  const ref = useRef<HTMLDivElement>(null);
  const width = useElementWidth(ref);
  const c = block.content;
  const kids = ctx?.childrenOf(block.id) ?? [];
  if (!ctx) return mode === 'edit' ? <ContainerPlaceholder kind="columns" theme={theme} /> : null;
  if (mode !== 'edit' && kids.length === 0) return null;

  const n = kids.length;
  const unlocked = planAtLeast(plan.id, 'creator');
  // Four columns fold into a 2 × 2 grid until there's real room for four.
  const perRow = n === 4 && width < 920 ? 2 : n;
  const side = unlocked && n > 1 && width >= (perRow >= 3 ? 760 : 600);
  const template = !side ? 'minmax(0,1fr)' : n === 2 ? pairColumns[c.ratio] : `repeat(${perRow}, minmax(0,1fr))`;
  const gap = c.gap === 'wide' ? side ? 56 : 28 : side ? 32 : 16;
  const ordered = !side && c.phoneReverse ? [...kids].reverse() : kids;

  return (
    <div ref={ref}>
      {n > 0 &&
      <div className="grid" style={{ gridTemplateColumns: template, columnGap: gap, rowGap: gap, alignItems: c.valign === 'center' ? 'center' : 'start' }}>
          {ordered.map((k) =>
        <div key={k.id} className="min-w-0">
              {ctx.render(k, theme, { index: kids.indexOf(k), count: n, container: block })}
            </div>
        )}
        </div>
      }
      {mode === 'edit' && n === 0 && <ContainerPlaceholder kind="columns" theme={theme} hint="Empty columns — each block you add is one column" />}
      {mode === 'edit' && n < MAX_CHILDREN && ctx.addSlot?.(block, theme)}
    </div>);

}