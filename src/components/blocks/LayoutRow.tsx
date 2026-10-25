import React from 'react';
import type { PageTheme } from '../../types/page';
import type { LayoutWidth, PairRatio } from '../../utils/pageLayout';
import { WIDE_PX, pairColumns, sectionTheme } from '../../utils/pageLayout';
import { cn } from '../../utils/cn';

interface LayoutRowProps {
  theme: PageTheme;
  /** Reading-column width for this page, in px. */
  columnPx: number;
  width: LayoutWidth;
  background: 'none' | 'tint' | 'invert';
  ratio: PairRatio | null;
  firstSecondOnPhone?: boolean;
  /**
   * 'responsive' (public page): pairs sit side by side from the md breakpoint.
   * true / false (canvas artboard): force the wide or phone arrangement, since the artboard isn't the window.
   */
  sideBySide?: 'responsive' | boolean;
  children: React.ReactNode[];
}

/**
 * One row of a page (D153): a width, an optional theme-derived section background,
 * and either one block or two blocks side by side. Defaults reproduce today's single column exactly.
 */
export function LayoutRow({ theme, columnPx, width, background, ratio, firstSecondOnPhone, sideBySide = 'responsive', children }: LayoutRowProps) {
  const st = sectionTheme(theme, background);
  const maxWidth = width === 'column' ? columnPx : width === 'wide' ? WIDE_PX : undefined;
  const paired = children.length === 2 && ratio;
  const forced = typeof sideBySide === 'boolean';

  const inner = paired ?
  <div
    className={cn('grid gap-8', !forced && 'md:items-center md:gap-16 md:[grid-template-columns:var(--kb-cols)]', forced && sideBySide && 'items-center gap-16')}
    style={{ ['--kb-cols' as string]: pairColumns[ratio], ...(forced && sideBySide ? { gridTemplateColumns: pairColumns[ratio] } : {}) }}>
    
      <div className={cn('min-w-0', firstSecondOnPhone && (forced ? !sideBySide && 'order-2' : 'order-2 md:order-none'))}>{children[0]}</div>
      <div className="min-w-0">{children[1]}</div>
    </div> :

  children;


  // Wide sections get real breathing room (D157). Column rows keep today's spacing so existing pages don't move.
  const body =
  <div className={cn('mx-auto w-full', width !== 'full' && 'px-5 md:px-8', width === 'wide' && background === 'none' && 'py-6 md:py-12')} style={{ maxWidth: maxWidth ? maxWidth + (width === 'wide' ? 64 : 0) : undefined }}>
      {inner}
    </div>;


  if (background === 'none') return body;
  return (
    <div className="w-full py-14 md:py-24" style={{ background: st.background, color: st.text }}>
      {body}
    </div>);

}