import React from 'react';
import { cn } from '../../utils/cn';

interface KubicuLogoProps {
  withWordmark?: boolean;
  className?: string;
  /** Colour of the top-right block; defaults to the theme's action colour. */
  accent?: string;
}

export function KubicuLogo({ withWordmark = true, className, accent }: KubicuLogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden className="shrink-0">
        <rect x="1" y="1" width="24" height="24" rx="7" className="fill-fg" />
        <rect x="7" y="7" width="5" height="12" rx="1.5" className="fill-canvas" />
        <rect x="14" y="7" width="5" height="5" rx="1.5" className={accent ? undefined : 'fill-action'} style={accent ? { fill: accent } : undefined} />
        <rect x="14" y="14" width="5" height="5" rx="1.5" className="fill-canvas" />
      </svg>
      {withWordmark && <span className="text-[15px] font-semibold tracking-[0.12em] text-fg">KUBICU</span>}
    </span>);

}