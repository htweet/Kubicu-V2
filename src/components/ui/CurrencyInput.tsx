import React from 'react';
import { Field, fieldControlClass } from './Field';
import { cn } from '../../utils/cn';
import { currencySymbol, groupNumber } from '../../utils/currency';

interface CurrencyInputProps {
  id: string;
  label: string;
  /** Whole naira, or null when empty. */
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  trailing?: React.ReactNode;
  disabled?: boolean;
  /** KUBICU's own prices (always naira). */
  naira?: boolean;
}

/** Amount in whole units of the workspace's currency (D136). Shows thousands separators; stores a number. */
export function CurrencyInput({ id, label, value, onChange, placeholder, hint, error, optional, trailing, disabled, naira }: CurrencyInputProps) {
  const symbol = naira ? '₦' : currencySymbol();
  return (
    <Field id={id} label={label} hint={hint} error={error} optional={optional} trailing={trailing}>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-body text-fg-subtle" aria-hidden>
          {symbol}
        </span>
        <input
          id={id}
          inputMode="numeric"
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          value={value === null ? '' : groupNumber(value, naira ? 'NGN' : undefined)}
          placeholder={placeholder}
          onChange={(e) => {
            const digits = e.target.value.replace(/[^0-9]/g, '').slice(0, 12);
            onChange(digits === '' ? null : Number(digits));
          }}
          className={cn(fieldControlClass, 'h-10 tabular-nums', symbol.length > 1 ? 'pl-12' : 'pl-8')}
        />
      </div>
    </Field>
  );
}
