import React, { useMemo, useState } from 'react';
import type { PageTheme } from '../../types/page';
import type { Availability, Booking, Service } from '../../types/ops';
import { addDaysKey, dateKeyInTz, slotsFor, timeLabel, visitorTimeZone, zonedToUtc } from '../../utils/ops/slots';
import { cardStyle, mix } from '../blocks/pageStyle';

interface SlotPickerProps {
  theme: PageTheme;
  service: Service;
  availability: Availability;
  bookings: Booking[];
  value: number | null;
  onChange: (start: number) => void;
  ignoreId?: string;
  /** Only this person's times (D140). */
  staffId?: string | null;
}

const DAYS_SHOWN = 14;

/** Date chips then time slots, both in the business’s time zone, with the visitor’s local time alongside. */
export function SlotPicker({ theme, service, availability, bookings, value, onChange, ignoreId, staffId }: SlotPickerProps) {
  const tz = availability.timeZone;
  const local = visitorTimeZone();
  const differentZone = local !== tz && timeLabel(Date.now(), local) !== timeLabel(Date.now(), tz);
  const today = dateKeyInTz(Date.now(), tz);
  const days = useMemo(
    () =>
    Array.from({ length: Math.min(DAYS_SHOWN, availability.horizonDays) }).map((_, i) => {
      const key = addDaysKey(today, i);
      return { key, slots: slotsFor(key, service, availability, bookings, Date.now(), ignoreId, staffId) };
    }),
    [today, service, availability, bookings, ignoreId, staffId]
  );
  const firstOpen = days.find((d) => d.slots.length)?.key ?? days[0]?.key;
  const [day, setDay] = useState<string>(value ? dateKeyInTz(value, tz) : firstOpen);
  const current = days.find((d) => d.key === day) ?? days[0];
  const muted = { color: theme.mutedText };

  if (!days.some((d) => d.slots.length)) {
    return (
      <p className="p-4 text-[14px]" style={cardStyle(theme)} role="status">
        No times are free in the next {DAYS_SHOWN} days. Please message the business to arrange a time.
      </p>);

  }

  return (
    <div className="flex flex-col gap-4">
      <div role="radiogroup" aria-label="Choose a day" className="scroll-quiet -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {days.map((d) => {
          const noon = zonedToUtc(d.key, '12:00', tz);
          const active = d.key === day;
          const none = d.slots.length === 0;
          return (
            <button
              key={d.key}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={none}
              onClick={() => setDay(d.key)}
              className="flex h-16 w-14 shrink-0 flex-col items-center justify-center disabled:cursor-not-allowed disabled:opacity-40"
              style={{ borderRadius: 12, border: `1.5px solid ${active ? theme.text : mix(theme.text, 12)}`, background: active ? theme.text : 'transparent', color: active ? theme.background : theme.text }}>
              
              <span className="text-[11px] font-medium uppercase">{new Intl.DateTimeFormat('en-NG', { timeZone: tz, weekday: 'short' }).format(noon)}</span>
              <span className="text-[17px] font-semibold tabular-nums">{new Intl.DateTimeFormat('en-NG', { timeZone: tz, day: 'numeric' }).format(noon)}</span>
            </button>);

        })}
      </div>
      <div>
        <p className="mb-2 text-[12.5px]" style={muted}>
          Times in {tz.replace('_', ' ')}
          {differentZone ? ` · your time (${local.split('/').pop()?.replace('_', ' ')}) in brackets` : ''}
        </p>
        {current.slots.length === 0 ?
        <p className="text-[14px]" style={muted}>
            Nothing free this day. Try another.
          </p> :

        <div role="radiogroup" aria-label="Choose a time" className="grid grid-cols-3 gap-2">
            {current.slots.map((s) => {
            const active = s.start === value;
            return (
              <button
                key={s.start}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onChange(s.start)}
                aria-label={s.capacity ? `${timeLabel(s.start, tz)}, ${s.seatsLeft} of ${s.capacity} seats left` : undefined}
                className={`flex ${s.capacity || differentZone ? 'min-h-[56px] py-1.5' : 'h-12'} flex-col items-center justify-center text-[14px] font-semibold tabular-nums`}
                style={{ borderRadius: 10, border: `1.5px solid ${active ? theme.text : mix(theme.text, 12)}`, background: active ? theme.text : theme.surface, color: active ? theme.background : theme.text }}>
                
                  {timeLabel(s.start, tz)}
                  {differentZone && <span className="text-[10.5px] font-medium opacity-70">({timeLabel(s.start, local)})</span>}
                  {s.capacity && <span className="text-[10.5px] font-medium opacity-75">{s.seatsLeft === 1 ? '1 seat left' : `${s.seatsLeft} of ${s.capacity} left`}</span>}
                </button>);

          })}
          </div>
        }
      </div>
    </div>);

}