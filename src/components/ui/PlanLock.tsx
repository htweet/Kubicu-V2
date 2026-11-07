import React from 'react';
import { LockIcon, ClockIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface PlanLockProps {
  kind: 'plan' | 'planned';
  children: React.ReactNode;
  className?: string;
}

export function PlanLock({ kind, children, className }: PlanLockProps) {
  const Icon = kind === 'plan' ? LockIcon : ClockIcon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap text-meta font-medium',
        kind === 'plan' ? 'text-accent' : 'text-fg-subtle',
        className,
      )}
    >
      <Icon size={11} aria-hidden />
      {children}
    </span>
  );
}
