import React, { useEffect, useState } from 'react';
import { ChevronDownIcon } from 'lucide-react';
import type { CountryCode } from '../../types/country';
import { Field, fieldControlClass } from './Field';
import { cn } from '../../utils/cn';
import { countries } from '../../data/countries';
import { activeCountry, countryInfo } from '../../utils/country';
import { groupLocal, joinPhone, splitPhone } from '../../utils/phone';
import { useT } from '../../contexts/LocaleContext';

interface PhoneInputProps {
  id: string;
  label: string;
  /** Stored as international text, e.g. "+254 712 345 678". Empty string when blank. */
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
  optional?: boolean;
  required?: boolean;
  disabled?: boolean;
  /** Overrides the example in the box. Defaults to the chosen country's example. */
  placeholder?: string;
  autoComplete?: string;
  fieldClassName?: string;
}

/**
 * Phone number with a country code (D354). The code defaults to the workspace's country and can be changed;
 * the number is checked for that country's length elsewhere (`phoneIssue`). A number with an unfamiliar code
 * (e.g. +44) stays as typed in a single box so nothing is lost.
 */
export function PhoneInput({ id, label, value, onChange, hint, error, optional, required, disabled, placeholder, autoComplete = 'tel', fieldClassName }: PhoneInputProps) {
  const { t } = useT();
  const parsed = splitPhone(value, activeCountry());
  const [country, setCountry] = useState<CountryCode>(parsed.country);
  // Follow outside changes (e.g. a saved value loading in).
  useEffect(() => {
    if (value.trim()) setCountry(splitPhone(value, activeCountry()).country);
  }, [value]);
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const info = countryInfo(country);

  if (parsed.foreign) {
    return (
      <Field id={id} label={label} hint={hint} error={error} optional={optional} className={fieldClassName}>
        <input id={id} type="tel" inputMode="tel" autoComplete={autoComplete} disabled={disabled} aria-required={required || undefined} aria-invalid={error ? true : undefined} aria-describedby={describedBy} value={value} onChange={(e) => onChange(e.target.value)} className={cn(fieldControlClass, 'h-10 tabular-nums')} />
      </Field>);

  }

  return (
    <Field id={id} label={label} hint={hint} error={error} optional={optional} className={fieldClassName}>
      <div className="flex min-w-0">
        <div className="relative shrink-0">
          <label htmlFor={`${id}-cc`} className="sr-only">
            {t('Country code')}
          </label>
          <select
            id={`${id}-cc`}
            value={country}
            disabled={disabled}
            onChange={(e) => {
              const next = e.target.value as CountryCode;
              setCountry(next);
              onChange(joinPhone(next, parsed.local));
            }}
            className={cn(fieldControlClass, 'h-10 w-[6.75rem] appearance-none rounded-r-none border-r-0 pl-3 pr-7 tabular-nums')}>
            
            {countries.map((c) =>
            <option key={c.code} value={c.code} aria-label={`${t(c.name)} +${c.dialCode}`}>
                {`${c.code} +${c.dialCode}`}
              </option>
            )}
          </select>
          <ChevronDownIcon size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-fg-subtle" aria-hidden />
        </div>
        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete={autoComplete === 'tel' ? 'tel-national' : autoComplete}
          disabled={disabled}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          placeholder={placeholder ?? info.phoneExample.replace(/^0/, '')}
          value={groupLocal(parsed.local)}
          onChange={(e) => {
            const raw = e.target.value;
            // Someone pasting a full international number keeps its own code.
            if (raw.trim().startsWith('+')) return onChange(raw);
            onChange(joinPhone(country, raw.replace(/\D/g, '').slice(0, 12)));
          }}
          className={cn(fieldControlClass, 'h-10 min-w-0 flex-1 rounded-l-none tabular-nums')} />
        
      </div>
    </Field>);

}