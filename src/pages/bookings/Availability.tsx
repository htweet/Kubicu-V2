import React, { useState } from 'react';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import type { Availability as AvailabilityT } from '../../types/ops';
import { useOps } from '../../contexts/OpsContext';
import { uid } from '../../utils/id';
import { addDaysKey, dateKeyInTz } from '../../utils/ops/slots';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import { TextInput } from '../../components/ui/TextInput';
import { TextArea } from '../../components/ui/TextArea';
import { SelectInput } from '../../components/ui/SelectInput';
import { Switch } from '../../components/ui/Switch';
import { TimezoneSelect, type TimeZoneId } from '../../components/ui/TimezoneSelect';
import { HoursEditor } from '../../components/canvas/inspector/HoursEditor';
import { fieldControlClass } from '../../components/ui/Field';
import { BookingsPlanNote } from '../../components/bookings/BookingsPlanNote';
import { cn } from '../../utils/cn';

const num = (v: string, max: number) => Math.min(max, Number(v.replace(/[^0-9]/g, '') || '0'));

export function Availability() {
  const { data, apply, hasSample, loadSample, clearSample } = useOps();
  const [draft, setDraft] = useState<AvailabilityT>(data.availability);
  const dirty = JSON.stringify(draft) !== JSON.stringify(data.availability);
  const patch = (p: Partial<AvailabilityT>) => setDraft((d) => ({ ...d, ...p }));
  const hoursError = draft.weekly.some((h) => !h.closed && h.close <= h.open) ? 'Closing time must be after opening time' : undefined;

  const save = () => {
    if (hoursError) return;
    if (apply((d) => ({ ...d, availability: draft }))) toast('Availability saved', { description: 'Your booking calendar updates straight away. Existing bookings stay put.' });
  };

  return (
    <>
      <PageHeader
        title="Availability & policy"
        description="When people can book, and the rules they agree to."
        actions={
        <Button onClick={save} disabled={!dirty || !!hoursError}>
            Save changes
          </Button>
        } />
      
      <BookingsPlanNote />
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-8">
          <section aria-labelledby="hours-h" className="rounded-lg border border-line bg-raised p-5">
            <h2 id="hours-h" className="text-heading font-semibold text-fg">
              Weekly hours
            </h2>
            <div className="mt-4 max-w-xs">
              <TimezoneSelect id="av-tz" value={draft.timeZone as TimeZoneId} onChange={(timeZone) => patch({ timeZone })} hint="Slots are shown in this zone; visitors also see their own time." />
            </div>
            <div className="mt-4">
              <HoursEditor blockId="availability" hours={draft.weekly} onChange={(weekly) => patch({ weekly })} error={hoursError} />
            </div>
          </section>

          <section aria-labelledby="ov-h" className="rounded-lg border border-line bg-raised p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 id="ov-h" className="text-heading font-semibold text-fg">
                Date changes
              </h2>
              <Button size="sm" variant="secondary" leadingIcon={PlusIcon} onClick={() => patch({ overrides: [...draft.overrides, { id: uid('ov'), date: addDaysKey(dateKeyInTz(Date.now(), draft.timeZone), 7), closed: true, open: '10:00', close: '14:00', note: '' }] })}>
                Add date
              </Button>
            </div>
            <p className="mt-1 text-caption text-fg-subtle">Holidays, travel or special hours. These override the weekly pattern.</p>
            {draft.overrides.length === 0 ?
            <p className="mt-4 text-label text-fg-muted">No date changes.</p> :

            <ul className="mt-4 flex flex-col divide-y divide-line border-y border-line">
                {draft.overrides.map((o) => {
                const set = (p: Partial<typeof o>) => patch({ overrides: draft.overrides.map((x) => x.id === o.id ? { ...x, ...p } : x) });
                return (
                  <li key={o.id} className="flex flex-wrap items-center gap-2 py-3">
                      <label className="sr-only" htmlFor={`ov-d-${o.id}`}>Date</label>
                      <input id={`ov-d-${o.id}`} type="date" value={o.date} onChange={(e) => set({ date: e.target.value })} className={cn(fieldControlClass, 'h-9 w-40 text-label')} />
                      <SelectInput id={`ov-s-${o.id}`} label="Status" value={o.closed ? 'closed' : 'open'} onChange={(v) => set({ closed: v === 'closed' })} options={[{ value: 'closed', label: 'Closed' }, { value: 'open', label: 'Special hours' }]} />
                      {!o.closed &&
                    <>
                          <input aria-label="Opens" type="time" value={o.open} onChange={(e) => set({ open: e.target.value })} className={cn(fieldControlClass, 'h-9 w-28 text-label')} />
                          <input aria-label="Closes" type="time" value={o.close} onChange={(e) => set({ close: e.target.value })} className={cn(fieldControlClass, 'h-9 w-28 text-label')} />
                        </>
                    }
                      <input aria-label="Note" placeholder="Note (only you see it)" value={o.note} onChange={(e) => set({ note: e.target.value })} className={cn(fieldControlClass, 'h-9 min-w-[140px] flex-1 text-label')} />
                      <IconButton icon={Trash2Icon} size="sm" label="Remove date" onClick={() => patch({ overrides: draft.overrides.filter((x) => x.id !== o.id) })} />
                    </li>);

              })}
              </ul>
            }
          </section>
        </div>

        <div className="flex flex-col gap-8">
          <section aria-labelledby="lim-h" className="rounded-lg border border-line bg-raised p-5">
            <h2 id="lim-h" className="text-heading font-semibold text-fg">
              Limits
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <TextInput id="av-notice" label="Minimum notice (hours)" inputMode="numeric" value={String(draft.minNoticeHours)} onChange={(e) => patch({ minNoticeHours: num(e.target.value, 336) })} />
              <TextInput id="av-max" label="Most bookings per day" inputMode="numeric" value={String(draft.maxPerDay)} onChange={(e) => patch({ maxPerDay: Math.max(1, num(e.target.value, 50)) })} />
              <TextInput id="av-horizon" label="Book up to (days ahead)" inputMode="numeric" value={String(draft.horizonDays)} onChange={(e) => patch({ horizonDays: Math.max(1, num(e.target.value, 365)) })} />
            </div>
          </section>

          <section aria-labelledby="pol-h" className="rounded-lg border border-line bg-raised p-5">
            <h2 id="pol-h" className="text-heading font-semibold text-fg">
              Cancellation policy
            </h2>
            <div className="mt-4 flex flex-col gap-4">
              <TextInput id="av-cancel" label="Free changes until (hours before)" inputMode="numeric" value={String(draft.cancelHours)} hint="After this, customer cancellations keep the deposit. You can always refund yourself." onChange={(e) => patch({ cancelHours: num(e.target.value, 168) })} />
              <TextArea id="av-policy" label="Policy shown before booking" rows={3} value={draft.policy} onChange={(e) => patch({ policy: e.target.value })} />
            </div>
          </section>

          <section aria-labelledby="rem-h" className="rounded-lg border border-line bg-raised p-5">
            <h2 id="rem-h" className="sr-only">
              Reminders
            </h2>
            <Switch id="av-rem" label="Send booking reminders" description="WhatsApp or email in the customer’s own time zone. Preview only in this prototype." checked={draft.remindersOn} onChange={(remindersOn) => patch({ remindersOn })} />
            {draft.remindersOn &&
            <>
                <div className="mt-4 max-w-[220px]">
                  <SelectInput id="av-remh" label="When" value={String(draft.reminderHours)} options={[2, 12, 24, 48].map((h) => ({ value: String(h), label: `${h} hours before` }))} onChange={(v) => patch({ reminderHours: Number(v) })} />
                </div>
                <p className="mt-3 rounded-md bg-sunken px-3 py-2.5 text-label text-fg-muted">“Hi Amaka, a reminder of your Studio fitting tomorrow at 11:00am (Lagos time). Need to move it? Use your booking link.”</p>
              </>
            }
          </section>

          <section className="rounded-lg border border-dashed border-line-strong p-5">
            <h2 className="text-label font-semibold text-fg">Calendar sync & sample data</h2>
            <p className="mt-1 text-label text-fg-muted">Google and Outlook calendar sync is planned. {hasSample ? 'Sample services, bookings, contacts and automations are labelled.' : ''}</p>
            <div className="mt-3">
              {hasSample ?
              <Button size="sm" variant="destructive" onClick={clearSample}>
                  Clear sample data
                </Button> :

              <Button size="sm" variant="secondary" onClick={loadSample}>
                  Add sample data
                </Button>
              }
            </div>
          </section>
        </div>
      </div>
    </>);

}