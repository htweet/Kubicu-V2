import React, { useEffect } from 'react';
import type { PageTheme } from '../../types/page';
import { fontsFor } from './pageStyle';
import { cn } from '../../utils/cn';
import { luminance } from '../../utils/contrast';
import { themeFontHref } from '../../data/themeFonts';
import { useDataSaver } from '../../contexts/DataSaverContext';
import { resolveBackground } from '../../utils/pageBackground';

interface PageSurfaceProps {
  theme: PageTheme;
  children: React.ReactNode;
  className?: string;
  columnClassName?: string;
  footer?: React.ReactNode;
  /** Shared site menu shown above the page's blocks (multi-page sites). */
  header?: React.ReactNode;
  /**
   * Layout sections (D153): children lay out their own rows (column, wide or edge to edge),
   * so the surface drops its fixed column and side padding.
   */
  fluid?: boolean;
}

/** Applies a page theme and the mobile-first reading column used by both the artboard and the public page. */
export function PageSurface({ theme, children, className, columnClassName, footer, header, fluid }: PageSurfaceProps) {
  // The owner's own background (D182) — or the preset's backdrop and artwork when left on "Theme default".
  const bg = resolveBackground(theme);
  const art = bg.image;
  const m = theme.material;
  const backdrop = bg.backdrop;
  const layered = Boolean(art || backdrop);
  const veil = Math.min(90, Math.max(0, theme.backgroundVeil ?? 40)) / 100;
  const lightText = luminance(theme.text) > 0.4;
  useThemeFonts(theme);
  const dataSaver = useDataSaver();

  const vars: Record<string, string> = {};
  if (m) {
    vars['--kb-surface-solid'] = theme.surface;
    vars['--kb-blur'] = m.surfaceFinish === 'glass' ? `blur(${m.glassBlur ?? 18}px) saturate(140%)` : 'none';
    vars['--kb-focus'] = m.focus ?? theme.accent;
  }
  if (backdrop) {
    vars['--kb-backdrop'] = backdrop;
    vars['--kb-backdrop-mobile'] = bg.backdropMobile ?? backdrop;
  }
  const fixed = !(bg.custom && theme.backgroundScroll);

  return (
    <div
      className={cn('relative w-full', m && 'kb-page', layered && 'kb-bg', bg.custom && 'kb-bg-custom', (m || layered) && dataSaver.on && 'kb-lite', className)}
      data-material={m ? '' : undefined}
      style={{ background: theme.background, color: theme.text, fontFamily: fontsFor(theme).body, ...vars }}>
      
      {layered &&
      // Atmosphere (D161) and artwork (D158): one screen tall and sticky, so it stays behind the content as the page scrolls.
      // An owner's image set to scroll (D182) instead covers the whole page height and moves with it.
      <div
        aria-hidden
        className={cn('pointer-events-none z-0 w-full overflow-hidden', fixed ? 'sticky top-0 -mb-[100svh] h-[100svh]' : 'absolute inset-0')}>
        
          {backdrop && <div className="kb-backdrop absolute inset-0" />}
          {art &&
        <div className="kb-art absolute inset-0">
              <img src={art} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: bg.custom ? theme.backgroundFocus ?? 'center' : undefined }} />
              <div className="absolute inset-0" style={{ background: theme.background, opacity: veil }} />
              {/* Contrast scrim (D158a): pushes busy artwork away from the text colour. */}
              <div className="absolute inset-0" style={{ background: lightText ? '#000000' : '#FFFFFF', opacity: 0.14 }} />
            </div>
        }
        </div>
      }
      <div className={cn(layered && 'relative z-[1]')}>
        {header}
        <div className={cn('mx-auto flex w-full flex-col pb-10 pt-4', fluid ? 'max-w-none' : 'max-w-[560px] px-5', columnClassName)}>{children}</div>
        {footer}
      </div>
    </div>);

}

/** Loads the Signature theme's extra Google faces once per document (only the ones it uses). */
function useThemeFonts(theme: PageTheme) {
  const href = themeFontHref([theme.material?.headingFont, theme.material?.bodyFont]);
  useEffect(() => {
    if (!href || typeof document === 'undefined') return;
    const id = `kb-font-${btoa(href).slice(0, 24)}`;
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }, [href]);
}