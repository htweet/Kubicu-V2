import React from 'react';
import { useT } from '../../contexts/LocaleContext';

interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** Small context line above the title, e.g. the workspace name. */
  context?: React.ReactNode;
}

export function PageHeader({ title: rawTitle, description, actions, context }: PageHeaderProps) {
  // Screen names follow the person's language where a draft exists (D133).
  const title = useT().t(rawTitle);
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {context && <p className="mb-1.5 text-label font-medium text-fg-subtle">{context}</p>}
        <h1 className="font-display text-title font-semibold text-fg md:text-[2.125rem] md:leading-[1.12] md:tracking-[-0.026em]">{title}</h1>
        {description && <p className="mt-2 max-w-xl text-body text-fg-muted">{description}</p>}
      </div>
      {/* Phones: actions wrap and the main (last) one stretches to a full, thumb-sized button. */}
      {actions &&
      <div className="flex flex-wrap items-center gap-2 max-sm:[&>button:last-child]:flex-1 max-sm:[&>button]:min-h-[44px] sm:shrink-0 sm:flex-nowrap">{actions}</div>
      }
    </div>);

}