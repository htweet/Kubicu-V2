import React from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { Field, fieldControlClass } from './Field';
import { cn } from '../../utils/cn';

interface SelectInputProps<T extends string> {
  id: string;
  label: string;
  value: T;
  options: {value: T;label: string;}[];
  onChange: (value: T) => void;
  hint?: string;
  disabled?: boolean;
}

export function SelectInput<T extends string>({ id, label, value, options, onChange, hint, disabled }: SelectInputProps<T>) {
  return (
    <Field id={id} label={label} hint={hint}>
      <div className="relative">
        <select
          id={id}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value as T)}
          className={cn(fieldControlClass, 'h-10 appearance-none pr-9')}>
          
          {options.map((o) =>
          <option key={o.value} value={o.value}>
              {o.label}
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