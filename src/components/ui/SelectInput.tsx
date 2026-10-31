import React from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { Field, fieldControlClass } from './Field';
import { cn } from '../../utils/cn';
import { useT } from '../../contexts/LocaleContext';

interface SelectInputProps<T extends string> {
  id: string;
  label: string;
  value: T;
  options: {value: T;label: string;disabled?: boolean;}[];
  onChange: (value: T) => void;
  hint?: string;
  error?: string;
  disabled?: boolean;
  /** Announced as required to screen readers (D430). */
  required?: boolean;
}

export function SelectInput<T extends string>({ id, label, value, options, onChange, hint, error, disabled, required }: SelectInputProps<T>) {
  // Option labels follow the interface language like every other primitive; untranslated ones stay English.
  const { t } = useT();
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <div className="relative">
        <select
          id={id}
          value={value}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-required={required || undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          onChange={(e) => onChange(e.target.value as T)}
          className={cn(fieldControlClass, 'h-10 appearance-none pr-9')}>
          
          {options.map((o) =>
          <option key={o.value} value={o.value} disabled={o.disabled}>
              {t(o.label)}
            </option>
          )}
        </select>
        <ChevronDownIcon
          size={15}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-fg-subtle"
          aria-hidden />
        
      </div>
    </Field>);

}