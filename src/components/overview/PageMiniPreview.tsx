import React from 'react';
import type { PageDocument } from '../../types/page';
import { PageSurface } from '../blocks/PageSurface';
import { PageLayoutView } from '../blocks/PageLayoutView';
import { blockInPhase, campaignPhase } from '../../utils/campaign';

const WIDTH = 390;

interface PageMiniPreviewProps {
  doc: PageDocument;
  scale?: number;
  height?: number;
}

/** A scaled, non-interactive render of a page using the real block renderers, in its phone arrangement. */
export function PageMiniPreview({ doc, scale = 0.52, height = 420 }: PageMiniPreviewProps) {
  // Campaigns preview the version visitors see right now (D52).
  const phase = doc.campaign ? campaignPhase(doc.campaign) : null;
  const visible = doc.blocks.filter((b) => !b.visibility.hidden && (!phase || blockInPhase(b, phase)));
  return (
    <div
      aria-hidden
      className="pointer-events-none relative shrink-0 overflow-hidden rounded-[22px] border border-line-strong shadow-2"
      style={{ width: WIDTH * scale, height, background: doc.theme.background }}>
      
      {/* A size container, so display type scales to the 390px phone, not the browser window (D158). */}
      <div className="[container-type:inline-size]" style={{ width: WIDTH, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <PageSurface theme={doc.theme} fluid>
          <PageLayoutView doc={doc} blocks={visible} theme={doc.theme} mode="edit" wide={false} />
        </PageSurface>
      </div>
    </div>);

}