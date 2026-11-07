import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import type { OpeningHours } from '../../types/page';
import type { Availability as AvailabilityT, Booking, StaffHours } from '../../types/ops';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Switch } from '../ui/Switch';
import { IconButton } from '../ui/IconButton';
import { SelectInput } from '../ui/SelectInput';
import { InlineAlert } from '../ui/InlineAlert';
import { fieldControlClass } from '../ui/Field';
import { HoursEditor } from '../canvas/inspector/HoursEditor';
import { uid } from '../../utils/id';
import { cn } from '../../utils/cn';
import { addDaysKey, dateKeyInTz, dayLabel, timeLabel } from '../../utils/ops/slots';
import { providerName } from '../../utils/ops/calendarSync';
import { useT } from '../../contexts/LocaleContext';

interface Props {
  open: boolean;
  onClose: () => void;
  staff: StaffHours | null;
  availability: AvailabilityT;
  bookings: Booking[];
  onSave: (s: StaffHours) => void;
}

/** One person's hours, time off and calendar (D140). Saved into the Availability draft. */
export function StaffHoursDialog({ open, onClose, staff, availability, bookings, onSave }: Props) {
  const { t: tr } = useT();
  const [draft, setDraft] = useState<StaffHours | null>(staff);
  useEffect(() => setDraft(staff), [staff, open]);
  if (!draft) return <Dialog open={false} onClose={onClose} title="" />;
  const tz = availability.timeZone;
  const today = dateKeyInTz(Date.now(), tz);
  const set = (p: Partial<StaffHours>) => setDraft((d) => (d ? { ...d, ...p } : d));
  const weekly: OpeningHours[] = draft.weekly ?? availability.weekly;
  const hoursError = draft.weekly?.some((h) => !h.closed && h.close <= h.open) ? 'Finish time must be after start time' : undefined;
  const rangeError = draft.timeOff.some((t) => t.to < t.from) ? 'An end date is before its start date' : undefined;
  // Bookings already with this person on days they'd now be away.
  const clashes = bookings.filter((b) => b.assigneeId === draft.memberId && (b.status === 'confirmed' || b.status === 'pending_deposit') && draft.timeOff.some((t) => { const k = dateKeyInTz(Date.parse(b.start), tz); return k >= t.from && k <= t.to; }));
  const conns = (availability.calendars ?? []).filter((c) => c.status === 'ok');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title={draft.name}
      description="Their own hours sit inside your business hours. Customers only see times when someone who does the service is free."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!!hoursError || !!rangeError} onClick={() => (onSave({ ...draft, timeOff: draft.timeOff.map((t) => ({ ...t, reason: t.reason.trim() })) }), onClose())}>
            Done
          </Button>
        </>
      }
    >
      <div className="flex flex-col divide-y divide-line">
        <section aria-labelledby="sh-hours" className="pb-5">
          <h3 id="sh-hours" className="text-label font-semibold text-fg">
            {tr('Working hours')}
          </h3>
          <div className="mt-3">
            <Switch id="sh-follow" label="Follow the business hours" description="Turn off to set days and times just for them." checked={draft.weekly === null} onChange={(v) => set({ weekly: v ? null : availability.weekly.map((h) => ({ ...h })) })} />
          </div>
          {draft.weekly !== null && (
            <div className="mt-4">
              <HoursEditor blockId={`staff-${draft.memberId}`} hours={weekly} onChange={(w) => set({ weekly: w })} error={hoursError && tr(hoursError)} />
            </div>
          )}
        </section>

        <section aria-labelledby="sh-off" className="py-5">
          <div className="flex items-center justify-between gap-3">
            <h3 id="sh-off" className="text-label font-semibold text-fg">
              {tr('Time off')}
            </h3>
            <Button size="sm" variant="secondary" leadingIcon={PlusIcon} onClick={() => set({ timeOff: [...draft.timeOff, { id: uid('off'), from: addDaysKey(today, 7), to: addDaysKey(today, 7), reason: '' }] })}>
              Add time off
            </Button>
          </div>
          {draft.timeOff.length === 0 ? (
            <p className="mt-2 text-label text-fg-muted">{tr('No time off planned.')}</p>
          ) : (
            <ul className="mt-2 flex flex-col divide-y divide-line">
              {draft.timeOff.map((t) => {
                const upd = (p: Partial<typeof t>) => set({ timeOff: draft.timeOff.map((x) => (x.id === t.id ? { ...x, ...p } : x)) });
                return (
                  <li key={t.id} className="flex flex-wrap items-center gap-2 py-3">
                    <label className="sr-only" htmlFor={`off-f-${t.id}`}>{tr('From')}</label>
                    <input id={`off-f-${t.id}`} type="date" value={t.from} onChange={(e) => upd({ from: e.target.value, to: t.to < e.target.value ? e.target.value : t.to })} className={cn(fieldControlClass, 'h-9 w-40 text-label')} />
                    <span className="text-label text-fg-subtle" aria-hidden>
                      {tr('to')}
                    </span>
                    <label className="sr-only" htmlFor={`off-t-${t.id}`}>{tr('To')}</label>
                    <input id={`off-t-${t.id}`} type="date" value={t.to} min={t.from} onChange={(e) => upd({ to: e.target.value })} className={cn(fieldControlClass, 'h-9 w-40 text-label')} />
                    <input aria-label={tr('Reason (only you see it)')} placeholder={tr('Reason (only you see it)')} value={t.reason} maxLength={60} onChange={(e) => upd({ reason: e.target.value })} className={cn(fieldControlClass, 'h-9 min-w-[160px] flex-1 text-label')} />
                    <IconButton icon={Trash2Icon} label="Remove time off" onClick={() => set({ timeOff: draft.timeOff.filter((x) => x.id !== t.id) })} />
                  </li>
                );
              })}
            </ul>
          )}
          {rangeError && <p role="alert" className="mt-2 text-caption text-danger">{tr(rangeError)}</p>}
          {clashes.length > 0 && (
            <InlineAlert tone="warning" className="mt-3" title={tr(clashes.length === 1 ? '{n} booking already with {name} on these days' : '{n} bookings already with {name} on these days', { n: clashes.length, name: draft.name.split(' ')[0] })}>
              <ul className="mt-1 flex flex-col gap-1">
                {clashes.slice(0, 5).map((b) => (
                  <li key={b.id}>
                    {b.customer.name} · {b.serviceName} · {dayLabel(b.start, tz)}, {timeLabel(b.start, tz)} ·{' '}
                    <Link to={`/app/bookings?booking=${b.id}`} className="font-medium text-action underline-offset-2 hover:underline">
                      {tr('Reschedule')}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-1">{tr('They stay booked until you move them.')}</p>
            </InlineAlert>
          )}
        </section>

        <section aria-labelledby="sh-cal" className="pt-5">
          <h3 id="sh-cal" className="text-label font-semibold text-fg">
            {tr('Their calendar')}
          </h3>
          {conns.length === 0 ? (
            <p className="mt-2 text-label text-fg-muted">{tr('Connect a Google or Outlook calendar under “Calendar sync” first.')}</p>
          ) : (
            <div className="mt-3 max-w-sm">
              <SelectInput
                id="sh-calsel"
                label="Busy times that block only them"
                value={draft.calendarId ?? ''}
                onChange={(v) => set({ calendarId: v || null })}
                options={[{ value: '', label: tr('None — shared calendars block everyone') }, ...conns.map((c) => ({ value: c.id, label: `${providerName(c.provider)} · ${c.account}` }))]}
                hint="A calendar linked to one person stops blocking everyone else."
              />
            </div>
          )}
        </section>
      </div>
    </Dialog>
  );
}
