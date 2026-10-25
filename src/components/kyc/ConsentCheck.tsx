import React from 'react';
import { useT } from '../../contexts/LocaleContext';

interface ConsentCheckProps {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: React.ReactNode;
  error?: string;
  disabled?: boolean;
}

/** A tick box the person must tick themselves — never ticked in advance. String labels and errors follow the interface language. */
export function ConsentCheck({ id, checked, onChange, label, error, disabled }: ConsentCheckProps) {
  const { t } = useT();
  return (
    <div>
      <label htmlFor={id} className="flex min-h-[44px] cursor-pointer items-start gap-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center">
          <input
            id={id}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={(e) => onChange(e.target.checked)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            className="h-4 w-4" />
          
        </span>
        <span className="pt-0.5 text-label text-fg">{typeof label === 'string' ? t(label) : label}</span>
      </label>
      {error &&
      <p id={`${id}-error`} role="alert" className="ml-9 mt-1 text-caption font-medium text-danger">
          {t(error)}
        </p>
      }
    </div>);

}