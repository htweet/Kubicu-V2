import React from "react";
import { cn } from "../../utils/cn";
import { BoxIcon } from "lucide-react";
import { useT } from "../../contexts/LocaleContext";
export type BadgeTone = 'neutral' | 'action' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
const tones: Record<BadgeTone, string> = {
  neutral: 'bg-sunken text-fg-muted border-line',
  action: 'bg-action-soft text-action border-transparent',
  accent: 'bg-accent-soft text-accent border-transparent',
  success: 'bg-success-soft text-success border-transparent',
  warning: 'bg-warning-soft text-warning border-transparent',
  danger: 'bg-danger-soft text-danger border-transparent',
  info: 'bg-info-soft text-info border-transparent'
};
interface BadgeProps {
  tone?: BadgeTone;
  icon?: BoxIcon;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}
export function Badge({
  tone = 'neutral',
  icon: Icon,
  dot,
  children,
  className
}: BadgeProps) {
  const { t } = useT();
  if (typeof children === 'string') children = t(children);
  return <span className={cn('inline-flex h-6 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2 text-caption font-medium', tones[tone], className)}>
      {dot && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />}
      {Icon && <Icon size={12} aria-hidden />}
      {children}
    </span>;
}