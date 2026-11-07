import React from 'react';
import type { WeekdayId } from '../../../types/commerce';
import { useShopSection } from '../../../hooks/useShopSection';
import { Switch } from '../../ui/Switch';
import { TextInput } from '../../ui/TextInput';
import { Button } from '../../ui/Button';
import { SettingsSection } from './SettingsSection';
import { defaultHours, hoursSummary, weekdays } from '../../../utils/commerce/shopSettings';
import { cn } from '../../../utils/cn';

/** Pause the shop with a message, and opening hours by day (D222). */
export function StoreStatusSection() {
  const s = useShopSection('status', 'Store status saved');
  const st = s.draft;
  const hours = st.hours;
  const setDay = (id: WeekdayId, p: Partial<{ open: boolean; from: string; to: string }>) => hours && s.patch({ hours: { ...hours, [id]: { ...hours[id], ...p } } });
  const dayError = (id: WeekdayId) => (hours && hours[id].open && hours[id].from >= hours[id].to ? 'Closing time must be after opening' : '');
  const anyDayError = !!hours && weekdays.some((d) => dayError(d.id));
  const today = new Date().toISOString().slice(0, 10);

  return (
    <SettingsSection id="status" title="Store status" description="Take a break without unpublishing anything, and tell buyers when you’re open." dirty={s.dirty} justSaved={s.justSaved} onSave={() => s.save()} onReset={s.reset} saveDisabled={anyDayError}>
      <div className={cn('rounded-md border px-4 py-3.5', st.paused ? 'border-warning/40 bg-warning-soft' : 'border-line')}>
        <Switch
          id="st-paused"
          label="Pause the shop"
          description={st.paused ? 'Checkout is closed. Your shop and pages stay up and show your message.' : 'Open — buyers can check out.'}
          checked={st.paused}
          onChange={(paused) => s.patch({ paused })}
        />
        {st.paused && (
          <div className="mt-4 grid items-start gap-4 sm:grid-cols-[minmax(0,1fr)_12rem]">
            <TextInput id="st-message" label="Message for buyers" maxLength={160} placeholder="e.g. We’re restocking after the Christmas rush." value={st.message} hint={`${st.message.length}/160`} onChange={(e) => s.patch({ message: e.target.value })} />
            <TextInput id="st-back" label="Back on" optional type="date" min={today} value={st.backOn ?? ''} onChange={(e) => s.patch({ backOn: e.target.value || null })} />
            <div className="sm:col-span-2">
              <Switch id="st-links" label="Pause payment links too" description="Off: payment links, invoices and fundraisers keep taking payments while the shop rests." checked={st.pauseLinks} onChange={(pauseLinks) => s.patch({ pauseLinks })} />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-line pt-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-label font-medium text-fg">Opening hours</h3>
            <p className="text-caption text-fg-subtle">{hours ? hoursSummary(hours) : 'Not set. Shown on your shop and at pickup when you add them.'}</p>
          </div>
          {hours ? (
            <Button variant="tertiary" size="sm" onClick={() => s.patch({ hours: null })}>
              Remove hours
            </Button>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => s.patch({ hours: defaultHours() })}>
              Add opening hours
            </Button>
          )}
        </div>
        {hours && (
          <ul className="flex flex-col divide-y divide-line rounded-md border border-line">
            {weekdays.map((d) => {
              const h = hours[d.id];
              const err = dayError(d.id);
              return (
                <li key={d.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-3.5 py-2.5 sm:grid-cols-[7rem_auto_minmax(0,1fr)]">
                  <span className="text-label font-medium text-fg">{d.label}</span>
                  <Switch id={`st-${d.id}`} label={`Open on ${d.label}`} hideLabel checked={h.open} onChange={(open) => setDay(d.id, { open })} />
                  <div className="col-span-2 flex flex-wrap items-center gap-2 sm:col-span-1">
                    {h.open ? (
                      <>
                        <input type="time" aria-label={`${d.label} opens`} value={h.from} onChange={(e) => setDay(d.id, { from: e.target.value })} className="h-9 rounded-md border border-line-strong bg-field px-2 text-label text-fg focus:border-action focus:outline-none focus:ring-2 focus:ring-action/25" />
                        <span className="text-caption text-fg-subtle">to</span>
                        <input type="time" aria-label={`${d.label} closes`} value={h.to} aria-invalid={!!err} onChange={(e) => setDay(d.id, { to: e.target.value })} className="h-9 rounded-md border border-line-strong bg-field px-2 text-label text-fg focus:border-action focus:outline-none focus:ring-2 focus:ring-action/25 aria-[invalid=true]:border-danger" />
                        {err && <span className="text-caption text-danger">{err}</span>}
                      </>
                    ) : (
                      <span className="text-caption text-fg-subtle">Closed</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <p className="text-caption text-fg-subtle">Hours are information for buyers — the shop still takes orders outside them. Pause the shop to stop orders.</p>
      </div>
    </SettingsSection>
  );
}
