import React from 'react';
import type { OpeningHours } from '../../../types/page';
import { dayNames } from '../../../utils/openHours';
import { fieldControlClass } from '../../ui/Field';
import { cn } from '../../../utils/cn';

interface HoursEditorProps {
  blockId: string;
  hours: OpeningHours[];
  onChange: (hours: OpeningHours[], field: string) => void;
  error?: string;
}

const order = [1, 2, 3, 4, 5, 6, 0];

export function HoursEditor({ blockId, hours, onChange, error }: HoursEditorProps) {
  const set = (day: number, patch: Partial<OpeningHours>) =>
    onChange(hours.map((h) => (h.day === day ? { ...h, ...patch } : h)), `hours-${day}`);
  const copyMonday = () => {
    const mon = hours.find((h) => h.day === 1);
    if (!mon) return;
    onChange(hours.map((h) => (h.day >= 2 && h.day <= 5 ? { ...h, open: mon.open, close: mon.close, closed: mon.closed } : h)), 'hours-copy');
  };

  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 flex w-full items-baseline justify-between text-label font-medium text-fg">
        Opening hours
        <button type="button" onClick={copyMonday} className="text-caption font-normal text-action hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          Copy Monday to weekdays
        </button>
      </legend>
      {error && <p role="alert" className="text-caption text-danger">{error}</p>}
      {order.map((day) => {
        const h = hours.find((x) => x.day === day);
        if (!h) return null;
        const id = `${blockId}-h${day}`;
        return (
          <div key={day} className="grid min-h-[44px] grid-cols-[64px_1fr] items-center gap-2 md:min-h-0 md:grid-cols-[52px_1fr]">
            <label className="flex min-h-[44px] items-center gap-2 text-label text-fg md:min-h-0 md:gap-1.5 md:text-caption">
              <input type="checkbox" checked={!h.closed} onChange={(e) => set(day, { closed: !e.target.checked })} className="h-5 w-5 accent-[rgb(var(--action))] md:h-4 md:w-4" aria-label={`Open on ${dayNames[day]}`} />
              {dayNames[day].slice(0, 3)}
            </label>
            {h.closed ? (
              <span className="text-caption text-fg-subtle">Closed</span>
            ) : (
              <div className="flex items-center gap-1.5">
                <input id={`${id}-o`} type="time" value={h.open} aria-label={`${dayNames[day]} opens`} onChange={(e) => set(day, { open: e.target.value })} className={cn(fieldControlClass, 'h-11 px-2 text-label tabular-nums [color-scheme:light_dark] md:h-8 md:text-caption')} />
                <span className="text-caption text-fg-subtle" aria-hidden>–</span>
                <input id={`${id}-c`} type="time" value={h.close} aria-label={`${dayNames[day]} closes`} onChange={(e) => set(day, { close: e.target.value })} className={cn(fieldControlClass, 'h-11 px-2 text-label tabular-nums [color-scheme:light_dark] md:h-8 md:text-caption')} />
              </div>
            )}
          </div>
        );
      })}
    </fieldset>
  );
}
