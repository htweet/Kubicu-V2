import React from 'react';
import type { PageDocument } from '../../types/page';
import { PageMiniPreview } from '../overview/PageMiniPreview';

interface TemplateThumbProps {
  doc: PageDocument;
  width?: number;
  height?: number;
}

/** A real, scaled render of a template's first screen. */
export function TemplateThumb({ doc, width = 200, height = 300 }: TemplateThumbProps) {
  return <PageMiniPreview doc={doc} scale={width / 390} height={height} />;
}