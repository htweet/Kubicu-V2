import React from 'react';
import type { Block, PageDocument, PageTheme, RenderMode } from '../../types/page';
import { BlockRenderer, spacingClass } from './BlockRenderer';
import { LayoutRow } from './LayoutRow';
import { layoutRows, pageContentWidth, sectionTheme } from '../../utils/pageLayout';
import { BlockChildrenProvider, type BlockChildrenValue } from '../../contexts/BlockChildrenContext';

interface PageLayoutViewProps {
  doc: Pick<PageDocument, 'layout'>;
  blocks: Block[];
  theme: PageTheme;
  mode: RenderMode;
  /** Force the wide (true) or phone (false) arrangement — previews aren't the window, so breakpoints can't decide. */
  wide: boolean;
}

/** Read-only render of a page's layout rows (D153), for previews, thumbnails and the template library. Containers draw their own blocks (D167). */
export function PageLayoutView({ doc, blocks, theme, mode, wide }: PageLayoutViewProps) {
  const columnPx = pageContentWidth(doc);
  const childCtx: BlockChildrenValue = {
    childrenOf: (id) => blocks.filter((b) => b.parentId === id),
    render: (child, t) =>
    <div className={spacingClass[child.layout.spacing]}>
        <BlockRenderer block={child} theme={t} mode={mode} />
      </div>

  };
  return (
    <BlockChildrenProvider value={childCtx}>
      {layoutRows(blocks.filter((b) => !b.parentId), (b) => b, (b) => b.id).map((row) => {
        const t = sectionTheme(theme, row.background);
        return (
          <LayoutRow key={row.key} theme={theme} columnPx={columnPx} density={doc.layout?.density} width={row.width} background={row.background} ratio={row.ratio} firstSecondOnPhone={row.firstSecondOnPhone} sideBySide={wide}>
            {row.items.map((b) =>
            <div key={b.id} className={spacingClass[b.layout.spacing]}>
                <BlockRenderer block={b} theme={t} mode={mode} />
              </div>
            )}
          </LayoutRow>);

      })}
    </BlockChildrenProvider>);

}