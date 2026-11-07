import React from 'react';
import { SelectInput } from './SelectInput';

/** Time zones offered first for KUBICU's launch markets; more come with localisation settings. */
export const timeZones = [
  { value: 'Africa/Lagos', label: 'Lagos, Abuja (WAT, UTC+1)' },
  { value: 'Africa/Accra', label: 'Accra (GMT, UTC+0)' },
  { value: 'Africa/Nairobi', label: 'Nairobi (EAT, UTC+3)' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST, UTC+2)' },
  { value: 'Africa/Cairo', label: 'Cairo (EET, UTC+2)' },
  { value: 'Europe/London', label: 'London (UK time)' },
  { value: 'America/New_York', label: 'New York (US Eastern)' },
] as const;

export type TimeZoneId = (typeof timeZones)[number]['value'];

interface TimezoneSelectProps {
  id: string;
  label?: string;
  value: TimeZoneId;
  onChange: (value: TimeZoneId) => void;
  hint?: string;
  disabled?: boolean;
}

export function TimezoneSelect({ id, label = 'Time zone', value, onChange, hint, disabled }: TimezoneSelectProps) {
  return (
    <SelectInput<TimeZoneId>
      id={id}
      label={label}
      value={value}
      onChange={onChange}
      hint={hint}
      disabled={disabled}
      options={timeZones.map((t) => ({ value: t.value, label: t.label }))}
    />
  );
}
