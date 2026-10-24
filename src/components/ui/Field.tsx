import React from 'react';
import { AlertCircleIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useT } from '../../contexts/LocaleContext';

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  trailing?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function Field({ id, label, hint, error, optional, trailing, className, children }: FieldProps) {
  const { t } = useT();
  label = t(label);
  hint = hint && t(hint);
  error = error && t(error);
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-label font-medium text-fg">
          {label}
          {optional && <span className="ml-1.5 font-normal text-fg-subtle">{t('Optional')}</span>}
        </label>
        {trailing}
      </div>
      {children}
      {error ?
      <p id={`${id}-error`} className="flex items-start gap-1.5 text-caption text-danger">
          <AlertCircleIcon size={13} className="mt-px shrink-0" aria-hidden />
          {error}
        </p> :
      hint ?
      <p id={`${id}-hint`} className="text-caption text-fg-subtle">
          {hint}
        </p> :
      null}
    </div>);

}

export const fieldControlClass = cn(
  'w-full rounded-md border border-line-strong bg-field px-3 text-body text-fg placeholder:text-fg-subtle',
  'transition-[border-color,box-shadow] duration-150 ease-out',
  'focus:border-action focus:outline-none focus:ring-2 focus:ring-action/25',
  'disabled:cursor-not-allowed disabled:opacity-50',
  'aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/25'
);