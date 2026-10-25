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
import { Card } from '../../components/ui/layout/Card';
import { AsideNote } from '../../components/ui/layout/AsideNote';
import { DetailSection } from '../../components/ui/layout/DetailList';
import { List } from '../../components/ui/layout/ListRow';
import { CalendarSyncCard } from '../../components/bookings/CalendarSyncCard';
import { TeamHoursCard } from '../../components/bookings/TeamHoursCard';
import { useT } from '../../contexts/LocaleContext';

const num = (v: string, max: number) => Math.min(max, Number(v.replace(/[^0-9]/g, '') || '0'));

export function Availability() {
  const { data, apply, hasSample, loadSample, clearSample } = useOps();
  const { t: tr } = useT();
  const [draft, setDraft] = useState<AvailabilityT>(data.availability);
  // Calendar connections save on their own (D137), so they never count as unsaved changes here.
  const strip = (a: AvailabilityT) => JSON.stringify({ ...a, calendars: undefined });
  const dirty = strip(draft) !== strip(data.availability);
  const patch = (p: Partial<AvailabilityT>) => setDraft((d) => ({ ...d, ...p }));
  const hoursError = draft.weekly.some((h) => !h.closed && h.close <= h.open) ? 'Closing time must be after opening time' : undefined;

  const save = () => {
    if (hoursError) return;
    if (apply((d) => ({ ...d, availability: { ...draft, calendars: d.availability.calendars } }))) toast(tr('Availability saved'), { description: tr('Your booking calendar updates straight away. Existing bookings stay with whoever has them.') });
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
      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <Card id="hours" emphasis="primary" title="Weekly hours" description="When people can book, in your time zone. Visitors also see their own time.">
            <div className="max-w-xs">
              <TimezoneSelect id="av-tz" value={draft.timeZone as TimeZoneId} onChange={(timeZone) => patch({ timeZone })} />
            </div>
            <div className="mt-5 border-t border-line pt-5">
              <HoursEditor blockId="availability" hours={draft.weekly} onChange={(weekly) => patch({ weekly })} error={hoursError && tr(hoursError)} />
            </div>
          </Card>

          <Card id="ov" title="Date changes" description="Holidays, travel or special hours. These override the weekly pattern." actions={
          <Button size="sm" variant="secondary" leadingIcon={PlusIcon} onClick={() => patch({ overrides: [...draft.overrides, { id: uid('ov'), date: addDaysKey(dateKeyInTz(Date.now(), draft.timeZone), 7), closed: true, open: '10:00', close: '14:00', note: '' }] })}>
                Add date
              </Button>
          }>
            {draft.overrides.length === 0 ?
            <p className="text-label text-fg-muted">{tr('No date changes.')}</p> :

            <List label={tr('Date changes')} className="-my-3">
                {draft.overrides.map((o) => {
                const set = (p: Partial<typeof o>) => patch({ overrides: draft.overrides.map((x) => x.id === o.id ? { ...x, ...p } : x) });
                return (
                  <li key={o.id} className="flex flex-wrap items-center gap-2 py-3">
                      <label className="sr-only" htmlFor={`ov-d-${o.id}`}>{tr('Date')}</label>
                      <input id={`ov-d-${o.id}`} type="date" value={o.date} onChange={(e) => set({ date: e.target.value })} className={cn(fieldControlClass, 'h-9 w-40 text-label')} />
                      <SelectInput id={`ov-s-${o.id}`} label="Status" value={o.closed ? 'closed' : 'open'} onChange={(v) => set({ closed: v === 'closed' })} options={[{ value: 'closed', label: tr('Closed') }, { value: 'open', label: tr('Special hours') }]} />
                      {!o.closed &&
                    <>
                          <input aria-label={tr('Opens')} type="time" value={o.open} onChange={(e) => set({ open: e.target.value })} className={cn(fieldControlClass, 'h-9 w-28 text-label')} />
                          <input aria-label={tr('Closes')} type="time" value={o.close} onChange={(e) => set({ close: e.target.value })} className={cn(fieldControlClass, 'h-9 w-28 text-label')} />
                        </>
                    }
                      <input aria-label={tr('Note')} placeholder={tr('Note (only you see it)')} value={o.note} onChange={(e) => set({ note: e.target.value })} className={cn(fieldControlClass, 'h-9 min-w-[140px] flex-1 text-label')} />
                      <IconButton icon={Trash2Icon} label="Remove date" onClick={() => patch({ overrides: draft.overrides.filter((x) => x.id !== o.id) })} />
                    </li>);

              })}
              </List>
            }
          </Card>

          <TeamHoursCard draft={draft} bookings={data.bookings} onChange={(staff) => patch({ staff })} />

          <CalendarSyncCard />
        </div>

        <div className="flex flex-col gap-6">
          <Card id="rules" title="Booking rules">
          <div className="flex flex-col gap-6">
          <DetailSection title={tr('Limits')}>
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <TextInput id="av-notice" label="Minimum notice (hours)" inputMode="numeric" value={String(draft.minNoticeHours)} onChange={(e) => patch({ minNoticeHours: num(e.target.value, 336) })} />
              <TextInput id="av-max" label="Most bookings per day" inputMode="numeric" value={String(draft.maxPerDay)} onChange={(e) => patch({ maxPerDay: Math.max(1, num(e.target.value, 50)) })} />
              <TextInput id="av-horizon" label="Book up to (days ahead)" inputMode="numeric" value={String(draft.horizonDays)} onChange={(e) => patch({ horizonDays: Math.max(1, num(e.target.value, 365)) })} />
            </div>
          </DetailSection>

          <DetailSection title={tr('Cancellation policy')}>
            <div className="flex flex-col gap-4">
              <TextInput id="av-cancel" label="Free changes until (hours before)" inputMode="numeric" value={String(draft.cancelHours)} hint="After this, customer cancellations keep the deposit. You can always refund yourself." onChange={(e) => patch({ cancelHours: num(e.target.value, 168) })} />
              <TextArea id="av-policy" label="Policy shown before booking" rows={3} value={draft.policy} onChange={(e) => patch({ policy: e.target.value })} />
            </div>
          </DetailSection>

          <DetailSection title={tr('Reminders')}>
            <div>
            <Switch id="av-rem" label="Send booking reminders" description="WhatsApp or email in the customer’s own time zone. Preview only in this prototype." checked={draft.remindersOn} onChange={(remindersOn) => patch({ remindersOn })} />
            {draft.remindersOn &&
                  <>
                <div className="mt-4 max-w-[220px]">
                  <SelectInput id="av-remh" label="When" value={String(draft.reminderHours)} options={[2, 12, 24, 48].map((h) => ({ value: String(h), label: tr('{n} hours before', { n: h }) }))} onChange={(v) => patch({ reminderHours: Number(v) })} />
                </div>
                <p className="mt-3 rounded-md bg-sunken px-3 py-2.5 text-label text-fg-muted">{tr('“Hi Amaka, a reminder of your Studio fitting tomorrow at 11:00am (Lagos time). Need to move it? Use your booking link.”')}</p>
              </>
                  }
            </div>
          </DetailSection>
          </div>
          </Card>

          <aside className="flex flex-col divide-y divide-line px-1 pt-2">
            <AsideNote id="sample" title="Sample data" text={hasSample ? 'Sample services, bookings, contacts and automations are labelled “Sample”.' : 'Add labelled sample services and bookings to explore every screen.'}>
              {hasSample ?
              <Button size="sm" variant="destructive" onClick={clearSample}>
                  Clear sample data
                </Button> :

              <Button size="sm" variant="secondary" onClick={loadSample}>
                  Add sample data
                </Button>
              }
            </AsideNote>
          </aside>
        </div>
      </div>
    </>);

}