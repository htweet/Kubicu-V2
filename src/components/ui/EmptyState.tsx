import React from "react";
import { cn } from "../../utils/cn";
import { BoxIcon } from "lucide-react";
import { useT } from "../../contexts/LocaleContext";
interface EmptyStateProps {
  icon: BoxIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  /** Sit on the standard card surface (Layout rules, D75) — for page-level empty states. */
  framed?: boolean;
  className?: string;
}
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  framed,
  className
}: EmptyStateProps) {
  const { t } = useT();
  title = t(title);
  description = t(description);
  const body = <div className={cn('flex flex-col items-center px-6 py-10 text-center', !framed && className)}>
      <span className="flex h-11 w-11 items-center justify-center rounded-md border border-line bg-sunken text-fg-muted">
        <Icon size={20} aria-hidden />
      </span>
      <h3 className="mt-4 text-heading font-semibold text-fg">{title}</h3>
      <p className="mt-1 max-w-xs text-label text-fg-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>;
  // Same shell as Card, so page empty states never need a hand-built wrapper.
  return framed ? <div className={cn('rounded-lg border border-line bg-raised', className)}>{body}</div> : body;
}
