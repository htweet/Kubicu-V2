import React from 'react';
import { cn } from '../../utils/cn';

interface SwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

export function Switch({ id, checked, onChange, label, description, disabled }: SwitchProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4', disabled && 'opacity-50')}>
      <div className="min-w-0">
        <label htmlFor={id} className="text-label font-medium text-fg">
          {label}
        </label>
        {description && <p className="mt-0.5 text-caption text-fg-subtle">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors duration-150 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
          'disabled:cursor-not-allowed',
          checked ? 'border-action bg-action' : 'border-line-strong bg-sunken'
        )}>
        
        <span
          aria-hidden
          className={cn(
            'inline-block h-3.5 w-3.5 rounded-full shadow-1 transition-transform duration-150 ease-out',
            checked ? 'translate-x-[18px] bg-action-fg' : 'translate-x-[2px] bg-fg-subtle'
          )} />
        
      </button>
    </div>);

}