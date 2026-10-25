import React, { useMemo, useState } from 'react';
import type { FormField } from '../../types/forms';
import type { FormSkin } from './formSkin';
import { usePageOpsContext } from '../../contexts/PageOpsContext';
import { addDaysKey, dateKeyInTz, dayLabel, durationLabel, slotsFor, timeLabel } from '../../utils/ops/slots';

interface BookingSlotInputProps {
  field: FormField;
  value: string[];
  onChange: (v: string[]) => void;
  skin: FormSkin;
  inert: boolean;
  id: string;
  labelId: string;
  describedBy?: string;
  invalid: boolean;
}

const DAYS = 14;

/**
 * Booking time field (D194): free times for one Bookings service, using the same rules as the
 * booking sheet. Choosing a time records a preference with the response — it doesn't book or hold it.
 * Stored as [ISO start, readable label].
 */
export function BookingSlotInput({ field, value, onChange, skin, inert, id, labelId, describedBy, invalid }: BookingSlotInputProps) {
  const { data } = usePageOpsContext();
  const service = data?.services.find((s) => s.id === field.serviceId && s.active) ?? null;
  const a = data?.availability ?? null;
  const tz = a?.timeZone ?? 'Africa/Lagos';
  const days = useMemo(() => {
    if (!service || !a || !data) return [];
    const today = dateKeyInTz(Date.now(), tz);
    return Array.from({ length: Math.min(DAYS, a.horizonDays) }, (_, i) => {
      const key = addDaysKey(today, i);
      return { key, slots: slotsFor(key, service, a, data.bookings) };
    }).filter((d) => d.slots.length);
  }, [service, a, data, tz]);
  const chosen = value[0] ? Date.parse(value[0]) : null;
  const [day, setDay] = useState<string>(() => chosen ? dateKeyInTz(chosen, tz) : '');
  const current = days.find((d) => d.key === day) ?? days[0];

  if (!service || !a) {
    return (
      <p className="text-[13.5px]" style={{ color: skin.muted }} role="status">
        Times aren’t available right now. Add your preferred time in your message instead.
      </p>);

  }
  if (!days.length) {
    return (
      <p className="text-[13.5px]" style={{ color: skin.muted }} role="status">
        No free times in the next {DAYS} days. We’ll suggest one when we reply.
      </p>);

  }

  const pick = (start: number) => onChange([new Date(start).toISOString(), `${dayLabel(start, tz)}, ${timeLabel(start, tz)} · ${service.name}`]);

  return (
    <div role="group" aria-labelledby={labelId} aria-describedby={describedBy} className="flex flex-col gap-3">
      <p className="text-[12.5px]" style={{ color: skin.muted }}>
        {service.name} · {durationLabel(service.durationMin)} · times in {tz.replace('_', ' ')}
      </p>
      <label className="flex flex-col gap-1">
        <span className="text-[12px]" style={{ color: skin.muted }}>
          Day
        </span>
        <select
          id={id}
          disabled={inert}
          tabIndex={inert ? -1 : undefined}
          aria-invalid={invalid || undefined}
          value={current.key}
          onChange={(e) => setDay(e.target.value)}
          className="h-11 w-full px-3.5 text-[14.5px] outline-none focus:ring-2"
          style={skin.input}>
          
          {days.map((d) =>
          <option key={d.key} value={d.key}>
              {dayLabel(d.slots[0].start, tz)} · {d.slots.length} free
            </option>
          )}
        </select>
      </label>
      <div role="radiogroup" aria-label={`Times on ${dayLabel(current.slots[0].start, tz)}`} className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {current.slots.map((s) => {
          const on = chosen === s.start;
          return (
            <button
              key={s.start}
              type="button"
              role="radio"
              aria-checked={on}
              disabled={inert}
              tabIndex={inert ? -1 : undefined}
              onClick={() => pick(s.start)}
              className="flex h-11 items-center justify-center text-[14px] font-medium tabular-nums focus-visible:outline-none focus-visible:ring-2"
              style={on ? { ...skin.input, ...skin.button } : { ...skin.input, color: skin.text }}>
              
              {timeLabel(s.start, tz)}
            </button>);

        })}
      </div>
    </div>);

}