import React from 'react';
import type { PageDocument, PageTheme } from '../../types/page';
import type { WorkspacePlan } from '../../types/plan';
import { plans } from '../../data/plans';
import { RenderPlanProvider } from '../../contexts/RenderPlanContext';
import { PageSurface } from '../blocks/PageSurface';
import { PageLayoutView } from '../blocks/PageLayoutView';
import { ViewportFrame } from './ViewportFrame';
import { cn } from '../../utils/cn';

interface TemplateLivePreviewProps {
  doc: PageDocument;
  plan: WorkspacePlan;
  device: 'phone' | 'desktop';
  /** Try another theme without changing the template. */
  theme?: PageTheme;
  name: string;
  height?: number;
}

/**
 * Full-fidelity, scrollable render of a whole template — every section, as visitors see it (D155).
 * Rendered in a real frame (D158) so phone and desktop each get their true responsive layout.
 */
export function TemplateLivePreview({ doc, plan, device, theme = doc.theme, name, height = 640 }: TemplateLivePreviewProps) {
  const wide = device === 'desktop';
  const visible = doc.blocks.filter((b) => !b.visibility.hidden);
  return (
    // data-mbar-ignore: the sample page's own headings and sections aren't part of the website's phone folds (D563).
    <div data-mbar-ignore="" className={cn('mx-auto w-full overflow-hidden border border-line-strong', wide ? 'max-w-[1180px] rounded-[14px]' : 'max-w-[390px] rounded-[30px]')}>
      <ViewportFrame key={device} title={`Scrollable ${device} preview of ${name}`} height={height} background={theme.background}>
        <RenderPlanProvider plan={plans[plan]}>
          <PageSurface theme={theme} fluid>
            <PageLayoutView doc={doc} blocks={visible} theme={theme} mode="live" wide={wide} />
          </PageSurface>
        </RenderPlanProvider>
      </ViewportFrame>
    </div>
  );
}
