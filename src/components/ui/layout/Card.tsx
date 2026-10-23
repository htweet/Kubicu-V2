import React from "react";
import { cn } from "../../../utils/cn";
import { BoxIcon } from "lucide-react";
interface CardProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: BoxIcon;
  /** Right side of the header, usually one text link or a small button. */
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  /**
   * `padded` (default) — body sits on the card's 20/24px inset.
   * `flush` — body runs edge to edge (lists, tables); use ListRow inside so rows share the inset.
   */
  body?: 'padded' | 'flush';
  /** Primary cards get a soft shadow so the one thing that matters reads first. */
  emphasis?: 'primary' | 'default';
  as?: 'section' | 'div' | 'article';
  id?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * The one bordered container in the app (Layout rules, D75).
 * Header and body share a 20px inset (24px from md); a header with a flush body gets a hairline.
 */
export function Card({
  title,
  description,
  icon: Icon,
  actions,
  footer,
  body = 'padded',
  emphasis = 'default',
  as: Tag = 'section',
  id,
  className,
  children
}: CardProps) {
  const headingId = id ? `${id}-title` : undefined;
  const hasHeader = title || actions;
  return <Tag id={id} aria-labelledby={title && headingId ? headingId : undefined} className={cn('flex min-w-0 flex-col rounded-lg border border-line bg-raised', emphasis === 'primary' && 'shadow-1', className)}>
      {hasHeader && <header className={cn('flex items-start justify-between gap-4 px-5 pt-5 md:px-6', body === 'flush' ? 'border-b border-line pb-4' : 'pb-0')}>
          <div className="min-w-0">
            {title && <h2 id={headingId} className="flex items-center gap-2 text-heading font-semibold text-fg">
                {Icon && <Icon size={18} strokeWidth={2.25} className="shrink-0 text-fg-subtle" aria-hidden />}
                {title}
              </h2>}
            {description && <p className="mt-0.5 text-caption text-fg-subtle">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2 pt-0.5">{actions}</div>}
        </header>}
      {children !== undefined && children !== null && children !== false && <div className={cn('min-w-0 flex-1', body === 'padded' ? cn('px-5 pb-5 md:px-6 md:pb-6', hasHeader ? 'pt-4' : 'pt-5 md:pt-6') : '')}>{children}</div>}
      {footer && <footer className="mt-auto border-t border-line px-5 py-3.5 md:px-6">{footer}</footer>}
    </Tag>;
}