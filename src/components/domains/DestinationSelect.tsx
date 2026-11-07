import React, { useMemo } from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { Field, fieldControlClass } from '../ui/Field';
import { cn } from '../../utils/cn';
import type { DestinationOption } from '../../utils/domains/links';

interface Props {
  id: string;
  label: string;
  value: string;
  options: DestinationOption[];
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
  disabled?: boolean;
}

/** Pick a page, the shop or a product, grouped by space. */
export function DestinationSelect({ id, label, value, options, onChange, hint, error, disabled }: Props) {
  const groups = useMemo(() => {
    const map = new Map<string, DestinationOption[]>();
    options.forEach((o) => map.set(o.group, [...(map.get(o.group) ?? []), o]));
    return Array.from(map.entries());
  }, [options]);
  const missing = value && !options.some((o) => o.value === value);
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <div className="relative">
        <select
          id={id}
          value={value}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          onChange={(e) => onChange(e.target.value)}
          className={cn(fieldControlClass, 'h-10 appearance-none pr-9')}
        >
          {missing && <option value={value}>Missing page — choose another</option>}
          {groups.map(([group, items]) => (
            <optgroup key={group} label={group}>
              {items.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <ChevronDownIcon size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-fg-subtle" aria-hidden />
      </div>
    </Field>
  );
}
