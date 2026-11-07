import React from 'react';
import { AlertTriangleIcon, CheckCircle2Icon, InfoIcon, XCircleIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useT } from '../../contexts/LocaleContext';

type Tone = 'info' | 'success' | 'warning' | 'danger';

const config = {
  info: { icon: InfoIcon, cls: 'bg-info-soft text-info' },
  success: { icon: CheckCircle2Icon, cls: 'bg-success-soft text-success' },
  warning: { icon: AlertTriangleIcon, cls: 'bg-warning-soft text-warning' },
  danger: { icon: XCircleIcon, cls: 'bg-danger-soft text-danger' },
};

interface InlineAlertProps {
  tone?: Tone;
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function InlineAlert({ tone = 'info', title, children, action, className }: InlineAlertProps) {
  const { icon: Icon, cls } = config[tone];
  const { t } = useT();
  title = t(title);
  if (typeof children === 'string') children = t(children);
  return (
    <div role={tone === 'danger' ? 'alert' : 'status'} className={cn('flex gap-3 rounded-md px-3.5 py-3', cls, className)}>
      <Icon size={16} className="mt-0.5 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-label font-semibold">{title}</p>
        {children && <div className="mt-0.5 text-caption text-fg-muted">{children}</div>}
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  );
}
