import React from 'react';
import type { Block, PageDocument, PageTheme, RenderMode } from '../../types/page';
import { BlockRenderer, spacingClass } from './BlockRenderer';
import { LayoutRow } from './LayoutRow';
import { bandJoins, layoutRows, pageContentWidth, sectionTheme } from '../../utils/pageLayout';
import { BlockChildrenProvider, type BlockChildrenValue } from '../../contexts/BlockChildrenContext';
import { localiseBlockAmounts } from '../../utils/previewMoney';
import { setPreviewCurrency } from '../../utils/currency';

interface PageLayoutViewProps {
  doc: Pick<PageDocument, 'layout' | 'currency'>;
  blocks: Block[];
  theme: PageTheme;
  mode: RenderMode;
  /** Force the wide (true) or phone (false) arrangement — previews aren't the window, so breakpoints can't decide. */
  wide: boolean;
}

/** Clears the example currency once the blocks above it have drawn (D434). Renders nothing. */
function EndPreviewCurrency() {
  setPreviewCurrency(null);
  return null;
}

/** Read-only render of a page's layout rows (D153), for previews, thumbnails and the template library. Containers draw their own blocks (D167). */
export function PageLayoutView({ doc, blocks: source, theme, mode, wide }: PageLayoutViewProps) {
  // Examples from Kenya, Ghana and South Africa are priced in their own currency and shown as written (D434).
  // Everything else: on the website, typed "₦…" follows the visitor's language (D423); unchanged elsewhere.
  const own = doc.currency ?? null;
  setPreviewCurrency(own);
  const blocks = own ? source : localiseBlockAmounts(source);
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
      {layoutRows(blocks.filter((b) => !b.parentId), (b) => b, (b) => b.id).map((row, i, rows) => {
        const t = sectionTheme(theme, row.background);
        return (
          <LayoutRow key={row.key} {...bandJoins(rows, i)} theme={theme} columnPx={columnPx} density={doc.layout?.density} width={row.width} background={row.background} ratio={row.ratio} firstSecondOnPhone={row.firstSecondOnPhone} sideBySide={wide}>
            {row.items.map((b) =>
            <div key={b.id} data-preview-block={b.id} className={spacingClass[b.layout.spacing]}>
                <BlockRenderer block={b} theme={t} mode={mode} />
              </div>
            )}
          </LayoutRow>);

      })}
      {own && <EndPreviewCurrency />}
    </BlockChildrenProvider>);

}