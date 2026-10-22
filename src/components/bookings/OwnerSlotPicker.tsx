import React, { useMemo, useState } from 'react';
import type { Service } from '../../types/ops';
import { useOps } from '../../contexts/OpsContext';
import { addDaysKey, dateKeyInTz, slotsFor, timeLabel, zonedToUtc } from '../../utils/ops/slots';
import { cn } from '../../utils/cn';

/** App-styled day and time picker for owners (respects the same availability as visitors). */
export function OwnerSlotPicker({ service, value, onChange, ignoreId }: {service: Service;value: number | null;onChange: (start: number) => void;ignoreId?: string;}) {
  const { data } = useOps();
  const a = data.availability;
  const tz = a.timeZone;
  const today = dateKeyInTz(Date.now(), tz);
  const days = useMemo(() => Array.from({ length: 14 }).map((_, i) => {const key = addDaysKey(today, i);return { key, slots: slotsFor(key, service, a, data.bookings, Date.now(), ignoreId) };}), [today, service, a, data.bookings, ignoreId]);
  const [day, setDay] = useState(days.find((d) => d.slots.length)?.key ?? today);
  const current = days.find((d) => d.key === day);

  return (
    <div className="flex flex-col gap-4">
      <div role="radiogroup" aria-label="Day" className="scroll-quiet flex gap-1.5 overflow-x-auto pb-1">
        {days.map((d) => {
          const noon = zonedToUtc(d.key, '12:00', tz);
          return (
            <button
              key={d.key}
              type="button"
              role="radio"
              aria-checked={d.key === day}
              disabled={!d.slots.length}
              onClick={() => setDay(d.key)}
              className={cn(
                'flex h-14 w-12 shrink-0 flex-col items-center justify-center rounded-md border text-caption transition-colors duration-150 disabled:opacity-35',
                d.key === day ? 'border-transparent bg-fg text-canvas' : 'border-line text-fg hover:bg-sunken'
              )}>
              
              <span className="font-medium">{new Intl.DateTimeFormat('en-NG', { timeZone: tz, weekday: 'short' }).format(noon)}</span>
              <span className="text-label font-semibold tabular-nums">{new Intl.DateTimeFormat('en-NG', { timeZone: tz, day: 'numeric' }).format(noon)}</span>
            </button>);

        })}
      </div>
      {current && current.slots.length ?
      <div role="radiogroup" aria-label="Time" className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
          {current.slots.map((s) =>
        <button key={s.start} type="button" role="radio" aria-checked={s.start === value} onClick={() => onChange(s.start)} className={cn('h-9 rounded-md border text-label font-medium tabular-nums transition-colors duration-150', s.start === value ? 'border-transparent bg-action text-action-fg' : 'border-line text-fg hover:bg-sunken')}>
              {timeLabel(s.start, tz)}
            </button>
        )}
        </div> :

      <p className="text-label text-fg-muted">No free times in the next two weeks. Adjust availability to open more.</p>
      }
      <p className="text-caption text-fg-subtle">Times in {tz}.</p>
    </div>);

}