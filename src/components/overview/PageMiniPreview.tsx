import React from 'react';
import type { PageDocument } from '../../types/page';
import { PageSurface } from '../blocks/PageSurface';
import { BlockRenderer, spacingClass } from '../blocks/BlockRenderer';

const WIDTH = 390;

interface PageMiniPreviewProps {
  doc: PageDocument;
  scale?: number;
  height?: number;
}

/** A scaled, non-interactive render of a page using the real block renderers. */
export function PageMiniPreview({ doc, scale = 0.52, height = 420 }: PageMiniPreviewProps) {
  const visible = doc.blocks.filter((b) => !b.visibility.hidden);
  return (
    <div
      aria-hidden
      className="pointer-events-none relative shrink-0 overflow-hidden rounded-[22px] border border-line-strong shadow-2"
      style={{ width: WIDTH * scale, height, background: doc.theme.background }}>
      
      <div style={{ width: WIDTH, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <PageSurface theme={doc.theme}>
          {visible.map((block) =>
          <div key={block.id} className={spacingClass[block.layout.spacing]}>
              <BlockRenderer block={block} theme={doc.theme} mode="edit" />
            </div>
          )}
        </PageSurface>
      </div>
    </div>);

}