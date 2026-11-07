import React from 'react';
import type { RenderMode } from '../../types/page';

interface PageActionProps {
  mode: RenderMode;
  href: string;
  newTab?: boolean;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
  children: React.ReactNode;
}

/**
 * A link on the public page. In the editor it renders inert so clicks select
 * the block instead of navigating away.
 */
export function PageAction({ mode, href, newTab = true, className, style, ariaLabel, children }: PageActionProps) {
  if (mode === 'edit' || !href) {
    return (
      <span className={className} style={style} aria-label={ariaLabel}>
        {children}
      </span>
    );
  }
  return (
    <a
      href={href}
      target={newTab ? '_blank' : undefined}
      rel={newTab ? 'noopener noreferrer' : undefined}
      aria-label={ariaLabel}
      className={className}
      style={style}
    >
      {children}
    </a>
  );
}
