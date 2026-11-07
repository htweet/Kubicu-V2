import React from 'react';
import type { PageTheme } from '../../types/page';
import { fontsFor, headingStyle } from './pageStyle';
import { cn } from '../../utils/cn';

interface SectionHeadingProps {
  theme: PageTheme;
  title?: string;
  intro?: string;
  /** Right-hand slot on wide screens, e.g. a chip or a "See all" link. */
  aside?: React.ReactNode;
  center?: boolean;
  className?: string;
}

/** The shared heading for showcase sections (D157): one confident display size, generous space below. */
export function SectionHeading({ theme, title, intro, aside, center, className }: SectionHeadingProps) {
  if (!title && !intro && !aside) return null;
  const display = fontsFor(theme).display;
  return (
    <header className={cn('mb-8 flex flex-wrap items-end gap-x-8 gap-y-3 md:mb-12', center ? 'justify-center text-center' : 'justify-between', className)}>
      <div className={cn('min-w-0 max-w-[40rem]', center && 'mx-auto')}>
        {title && (
          // A short accent rule anchors each section (D160) — one consistent mark, not a label.
          <span aria-hidden className={cn('mb-5 block h-[3px] w-10 rounded-full', center && 'mx-auto')} style={{ background: theme.accent === theme.text ? theme.mutedText : theme.accent }} />
        )}
        {title && (
          <h2 className="break-words text-[clamp(1.75rem,3.4cqw,2.75rem)] font-medium leading-[1.06] tracking-[-0.025em]" style={{ fontFamily: display, ...headingStyle(theme), color: theme.text }}>
            {title}
          </h2>
        )}
        {intro && <p className="mt-3 text-[16px] leading-relaxed md:text-[18px]" style={{ color: theme.mutedText }}>{intro}</p>}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </header>
  );
}
