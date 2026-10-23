import React from 'react';
import { cn } from '../../../utils/cn';

interface SectionProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  id?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * A titled group without chrome — the default grouping tool. Reach for Card only when the
 * content needs a surface (Layout rules, D75). Heading → content is always 16px.
 */
export function Section({ title, description, actions, id, className, children }: SectionProps) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section id={id} aria-labelledby={headingId} className={cn('flex min-w-0 flex-col gap-4', className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h2 id={headingId} className="text-heading font-semibold text-fg">
            {title}
          </h2>
          {description && <p className="mt-0.5 max-w-xl text-caption text-fg-subtle">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </section>);

}

/** Vertical rhythm under a PageHeader: 32px to the first block, 32px between blocks. */
export function PageStack({ className, children }: {className?: string;children: React.ReactNode;}) {
  return <div className={cn('mt-8 flex flex-col gap-8', className)}>{children}</div>;
}