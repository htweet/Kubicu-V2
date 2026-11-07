import React from 'react';
import { XIcon } from 'lucide-react';
import { Field, fieldControlClass } from './Field';
import { fromLocalInput, timeZoneLabel, toLocalInput } from '../../utils/schedule';
import { cn } from '../../utils/cn';

interface DateTimeInputProps {
  id: string;
  label: string;
  /** ISO string or null. */
  value: string | null | undefined;
  onChange: (iso: string | null) => void;
  mode?: 'datetime' | 'date' | 'time';
  hint?: string;
  error?: string;
  optional?: boolean;
  min?: string;
  disabled?: boolean;
  /** Show a clear button when set. */
  clearable?: boolean;
}

/**
 * Native date/time picker (best on mobile) that always shows which time zone the value is in.
 * `date` and `time` modes store the raw input value rather than ISO.
 */
export function DateTimeInput({ id, label, value, onChange, mode = 'datetime', hint, error, optional, min, disabled, clearable }: DateTimeInputProps) {
  const type = mode === 'datetime' ? 'datetime-local' : mode;
  const inputValue = mode === 'datetime' ? toLocalInput(value) : value ?? '';
  const tz = timeZoneLabel();

  return (
    <Field id={id} label={label} optional={optional} error={error} hint={hint ?? (mode === 'date' ? undefined : `Times are in ${tz}.`)}>
      <div className="relative flex items-center">
        <input
          id={id}
          type={type}
          min={min}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          value={inputValue}
          onChange={(e) => onChange(mode === 'datetime' ? fromLocalInput(e.target.value) : e.target.value || null)}
          className={cn(fieldControlClass, 'h-10 tabular-nums [color-scheme:light_dark]', clearable && value && 'pr-10')}
        />
        {clearable && value && !disabled && (
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label={`Clear ${label.toLowerCase()}`}
            className="absolute right-1.5 inline-flex h-7 w-7 items-center justify-center rounded-sm text-fg-subtle hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <XIcon size={14} aria-hidden />
          </button>
        )}
      </div>
    </Field>
  );
}
