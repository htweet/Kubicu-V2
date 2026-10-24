import React from "react";
import { cn } from "../../utils/cn";
import { BoxIcon } from "lucide-react";
import { useT } from "../../contexts/LocaleContext";
interface EmptyStateProps {
  icon: BoxIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  const { t } = useT();
  title = t(title);
  description = t(description);
  return <div className={cn('flex flex-col items-center px-6 py-10 text-center', className)}>
      <span className="flex h-11 w-11 items-center justify-center rounded-md border border-line bg-sunken text-fg-muted">
        <Icon size={20} aria-hidden />
      </span>
      <h3 className="mt-4 text-heading font-semibold text-fg">{title}</h3>
      <p className="mt-1 max-w-xs text-label text-fg-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>;
}