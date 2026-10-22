import React from 'react';
import type { PageTheme } from '../../types/page';
import { fontsFor } from './pageStyle';
import { cn } from '../../utils/cn';

interface PageSurfaceProps {
  theme: PageTheme;
  children: React.ReactNode;
  className?: string;
  columnClassName?: string;
  footer?: React.ReactNode;
  /** Shared site menu shown above the page's blocks (multi-page sites). */
  header?: React.ReactNode;
}

/** Applies a page theme and the mobile-first reading column used by both the artboard and the public page. */
export function PageSurface({ theme, children, className, columnClassName, footer, header }: PageSurfaceProps) {
  return (
    <div
      className={cn('w-full', className)}
      style={{ background: theme.background, color: theme.text, fontFamily: fontsFor(theme).body }}>
      
      {header}
      <div className={cn('mx-auto flex w-full max-w-[560px] flex-col px-5 pb-10 pt-4', columnClassName)}>{children}</div>
      {footer}
    </div>);

}