import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import type { CommerceEvent, EventStatus, TicketType } from '../../types/commerce';
import { useCommerce } from '../../contexts/CommerceContext';
import { usePlan } from '../../contexts/PlanContext';
import { planAtLeast, plans } from '../../data/plans';
import { CHECKOUT_PLAN } from '../../utils/commerce/linkIssues';
import { MAX_TICKET_TYPES, blankEvent, blankTicketType, deleteEvent, eventProduct, findEvent, soldOfType, upsertEvent } from '../../utils/commerce/tickets';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { TextInput } from '../ui/TextInput';
import { TextArea } from '../ui/TextArea';
import { CurrencyInput } from '../ui/CurrencyInput';
import { DateTimeInput } from '../ui/DateTimeInput';
import { TimezoneSelect, type TimeZoneId } from '../ui/TimezoneSelect';
import { Segmented } from '../ui/Segmented';
import { Switch } from '../ui/Switch';
import { InlineAlert } from '../ui/InlineAlert';
import { SelectInput } from '../ui/SelectInput';
import { MediaPicker } from '../media/MediaPicker';
import { UpgradeButton } from '../ui/UpgradeButton';
import { EventSeatingFields } from './EventSeatingFields';
import type { RepeatEvery } from '../../types/commerce';
import { MAX_SERIES_DATES, copyForDate, isSeatedType, nextSeriesDate, repeatLabels, seriesDates, shiftDate, soldSeats, syncSeatQuantities } from '../../utils/commerce/seating';
import { uid } from '../../utils/id';
import { formatEventDate } from '../../utils/eventTime';

interface Props {
  /** Event id to edit, 'new', or null when closed. */
  target: string | 'new' | null;
  onClose: () => void;
}

type Errors = Partial<Record<string, string>>;

const statusOptions: {value: EventStatus;label: string;}[] = [
{ value: 'draft', label: 'Draft' },
{ value: 'on_sale', label: 'On sale' },
{ value: 'paused', label: 'Paused' }];


/** Create or edit an event and its ticket types (D73). */
export function EventEditor({ target, onClose }: Props) {
  const { data, apply } = useCommerce();
  const plan = usePlan();
  const paidAllowed = planAtLeast(plan.id, CHECKOUT_PLAN);
  const existing = target && target !== 'new' ? findEvent(data, target) : undefined;
  const [draft, setDraft] = useState<CommerceEvent>(() => existing ?? blankEvent());
  const [tried, setTried] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [repeat, setRepeat] = useState<RepeatEvery | 'none'>('none');
  const [repeatCount, setRepeatCount] = useState(4);
  const [applyLater, setApplyLater] = useState(false);

  useEffect(() => {
    if (!target) return;
    setDraft(existing ?? blankEvent());
    setTried(false);
    setConfirmDelete(false);
    setRepeat('none');
    setRepeatCount(4);
    setApplyLater(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  const product = existing ? eventProduct(data, existing) : undefined;
  const soldOf = (tt: TicketType) => {
    const prev = existing?.ticketTypes.find((t) => t.id === tt.id);
    return prev ? soldOfType(product, prev) : 0;
  };
  const totalSold = draft.ticketTypes.reduce((s, t) => s + soldOf(t), 0);
  const sold = useMemo(() => existing ? soldSeats(data, existing.id) : new Set<string>(), [data, existing]);
  const series = existing?.series ? seriesDates(data, existing) : [];
  const laterDates = series.filter((e) => Date.parse(e.startsAt) > Date.parse(existing?.startsAt ?? '') && e.status !== 'cancelled');
  const patch = (p: Partial<CommerceEvent>) => setDraft((d) => ({ ...d, ...p }));
  const patchType = (id: string, p: Partial<TicketType>) => setDraft((d) => ({ ...d, ticketTypes: d.ticketTypes.map((t) => t.id === id ? { ...t, ...p } : t) }));

  const errors = useMemo(() => {
    const e: Errors = {};
    if (!draft.name.trim()) e.name = 'Give the event a name.';
    if (!draft.startsAt) e.startsAt = 'Set when it starts.';
    if (draft.endsAt && Date.parse(draft.endsAt) <= Date.parse(draft.startsAt)) e.endsAt = 'End after it starts.';
    if (!draft.online && !draft.venue.trim()) e.venue = 'Add the venue, or mark it as online.';
    if (draft.ticketTypes.length === 0) e.types = 'Add at least one ticket type.';
    if (draft.capacity !== null && draft.capacity < totalSold) e.capacity = `${totalSold} tickets are already sold.`;
    if (draft.seating) {
      const labels = draft.seating.rows.map((r) => r.label.trim().toLowerCase());
      if (labels.some((l) => !l)) e.seating = 'Every row or table needs a name.';else
      if (new Set(labels).size !== labels.length) e.seating = 'Two rows or tables have the same name — guests wouldn’t know which is theirs.';else
      if (draft.seating.rows.some((r) => r.seats < 1)) e.seating = 'Every row or table needs at least 1 seat.';
    }
    syncSeatQuantities(draft).ticketTypes.forEach((t) => {
      if (!t.name.trim()) e[`${t.id}.name`] = 'Name this ticket.';
      if (t.quantity < soldOf(t)) e[`${t.id}.quantity`] = `${soldOf(t)} already sold.`;else
      if (t.quantity < 1) e[`${t.id}.quantity`] = 'At least 1.';
      if (t.minPerOrder < 1 || t.maxPerOrder < t.minPerOrder) e[`${t.id}.limits`] = 'Max must be at least the min, and min at least 1.';
      if (t.salesStart && t.salesEnd && Date.parse(t.salesEnd) <= Date.parse(t.salesStart)) e[`${t.id}.window`] = 'Sales must close after they open.';
      if (t.priceNgn > 0 && !paidAllowed && draft.status === 'on_sale') e[`${t.id}.price`] = `Paid tickets need ${plans[CHECKOUT_PLAN].name}.`;
    });
    return e;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, paidAllowed, totalSold]);
  const err = (k: string) => tried ? errors[k] : undefined;

  const save = () => {
    setTried(true);
    if (Object.keys(errors).length) {
      toast.error('Check the highlighted fields');
      return;
    }
    const base: CommerceEvent = {
      ...draft,
      name: draft.name.trim(),
      venue: draft.online ? '' : draft.venue.trim(),
      ticketTypes: draft.ticketTypes.map((t) => ({ ...t, name: t.name.trim() })),
      seating: draft.seating ? { ...draft.seating, rows: draft.seating.rows.map((r) => ({ ...r, label: r.label.trim() })) } : undefined
    };
    const repeating = !existing && repeat !== 'none';
    const next: CommerceEvent = repeating ? { ...base, series: { id: uid('ser'), every: repeat } } : base;
    const ok = apply((d) => {
      let out = upsertEvent(d, next);
      if (repeating) for (let i = 1; i < repeatCount; i++) out = upsertEvent(out, copyForDate(next, shiftDate(next.startsAt, repeat, i)));
      // Shared details flow to later dates; seats, sales and guest lists stay per date.
      if (existing && applyLater)
      laterDates.forEach((later) => {
        out = upsertEvent(out, {
          ...later,
          name: next.name,
          description: next.description,
          imageUrl: next.imageUrl,
          online: next.online,
          venue: next.venue,
          address: next.address,
          refundPolicy: next.refundPolicy,
          ticketTypes: later.ticketTypes.map((t, i) => next.ticketTypes[i] ? { ...t, name: next.ticketTypes[i].name, priceNgn: next.ticketTypes[i].priceNgn, note: next.ticketTypes[i].note } : t)
        });
      });
      return out;
    });
    if (!ok) return;
    toast.success(existing ? applyLater && laterDates.length ? `Saved on this and ${laterDates.length} later date${laterDates.length === 1 ? '' : 's'}` : 'Event saved' : repeating ? `${repeatCount} dates created` : 'Event created', {
      description: next.status === 'on_sale' ? 'Link it from an Event block on your page to start selling.' : 'It’s a draft — put it on sale when you’re ready.'
    });
    onClose();
  };

  const addNextDate = () => {
    if (!existing) return;
    if (series.length >= MAX_SERIES_DATES * 4) return toast.error('This series has as many dates as it can hold');
    if (apply((d) => upsertEvent(d, copyForDate(existing, nextSeriesDate(d, existing))))) toast.success('Next date added', { description: 'It has its own seats and guest list. Edit it from the Events list.' });
  };

  const remove = () => {
    if (!existing) return;
    if (apply((d) => deleteEvent(d, existing.id))) {
      toast('Event deleted');
      onClose();
    }
  };

  const cancelled = draft.status === 'cancelled';

  return (
    <Sheet
      open={!!target}
      onClose={onClose}
      side="right"
      size="lg"
      title={existing ? `Edit ${existing.name}` : 'New event'}
      description="Ticket types, seat limits and sales dates. Ticket orders appear in Orders like any sale."
      footer={
      <div className="flex w-full items-center justify-between gap-2">
          {existing && totalSold === 0 ?
        confirmDelete ?
        <Button variant="destructive" leadingIcon={Trash2Icon} onClick={remove}>
                Confirm delete
              </Button> :

        <Button variant="tertiary" leadingIcon={Trash2Icon} onClick={() => setConfirmDelete(true)}>
                Delete
              </Button> :


        <span />
        }
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={save} disabled={cancelled}>
              {existing ? 'Save' : 'Create event'}
            </Button>
          </div>
        </div>
      }>
      
      <div className="flex flex-col divide-y divide-line">
        {cancelled &&
        <div className="px-5 py-5">
            <InlineAlert tone="warning" title="This event was cancelled">
              Cancelled events can’t be edited or put back on sale. Every ticket order was refunded.
            </InlineAlert>
          </div>
        }

        <section aria-labelledby="ev-basics" className="flex flex-col gap-4 px-5 py-6">
          <h3 id="ev-basics" className="text-label font-semibold text-fg">
            Event
          </h3>
          <TextInput id="ev-name" label="Name" value={draft.name} error={err('name')} placeholder="e.g. Trunk Show — Autumn collection" onChange={(e) => patch({ name: e.target.value })} />
          <TextArea id="ev-desc" label="Description" optional rows={3} value={draft.description} placeholder="What happens, who it’s for, what to bring." onChange={(e) => patch({ description: e.target.value })} />
          <MediaPicker id="ev-img" label="Cover image" optional aspect="16:9" value={draft.imageUrl} onChange={(imageUrl) => patch({ imageUrl })} />
        </section>

        <section aria-labelledby="ev-when" className="flex flex-col gap-4 px-5 py-6">
          <h3 id="ev-when" className="text-label font-semibold text-fg">
            When &amp; where
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <DateTimeInput id="ev-start" label="Starts" value={draft.startsAt} error={err('startsAt')} onChange={(v) => patch({ startsAt: v ?? draft.startsAt })} />
            <DateTimeInput id="ev-end" label="Ends" optional clearable value={draft.endsAt} error={err('endsAt')} onChange={(v) => patch({ endsAt: v })} />
          </div>
          <TimezoneSelect id="ev-tz" label="Time zone" value={draft.timeZone as TimeZoneId} onChange={(timeZone) => patch({ timeZone })} />
          {!existing ?
          <div className="flex flex-col gap-3 rounded-md border border-line px-4 py-3">
              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_140px]">
                <SelectInput<RepeatEvery | 'none'>
                id="ev-repeat"
                label="Repeats"
                value={repeat}
                onChange={setRepeat}
                options={[{ value: 'none', label: 'Doesn’t repeat' }, ...(Object.keys(repeatLabels) as RepeatEvery[]).map((value) => ({ value, label: repeatLabels[value] }))]} />
              
                {repeat !== 'none' &&
              <TextInput id="ev-repeat-n" label="Number of dates" type="number" inputMode="numeric" min={2} max={MAX_SERIES_DATES} value={String(repeatCount)} onChange={(e) => setRepeatCount(Math.min(MAX_SERIES_DATES, Math.max(2, Math.floor(Number(e.target.value) || 2))))} />
              }
              </div>
              <p className="text-caption text-fg-muted">
                {repeat === 'none' ?
              'For weekly classes, monthly meet-ups or a show with several nights. Each date gets its own seats, guest list and check-in.' :
              `${repeatCount} dates, from ${formatEventDate(draft.startsAt, draft.timeZone)} to ${formatEventDate(shiftDate(draft.startsAt, repeat, repeatCount - 1), draft.timeZone)}. Each has its own seats and guest list; your page shows a date picker.`}
              </p>
            </div> :
          existing.series ?
          <div className="flex flex-col gap-3 rounded-md border border-line px-4 py-3">
              <p className="text-label text-fg">
                Date {series.findIndex((e) => e.id === existing.id) + 1} of {series.length} · {repeatLabels[existing.series.every].toLowerCase()}
              </p>
              {laterDates.length > 0 &&
            <Switch
              id="ev-apply-later"
              label={`Also update the ${laterDates.length} later date${laterDates.length === 1 ? '' : 's'}`}
              description="Copies the name, description, cover, venue, refund policy and ticket names and prices. Seats, quantities, sales and guest lists stay separate."
              checked={applyLater}
              onChange={setApplyLater} />

            }
              <Button variant="secondary" leadingIcon={PlusIcon} className="self-start" onClick={addNextDate}>
                Add the next date
              </Button>
            </div> :
          null}
          <Switch id="ev-online" label="Online event" description="Guests get the joining link with their ticket." checked={draft.online} onChange={(online) => patch({ online })} />
          {!draft.online &&
          <div className="grid gap-4 sm:grid-cols-2">
              <TextInput id="ev-venue" label="Venue" value={draft.venue} error={err('venue')} placeholder="e.g. The Wheatbaker" onChange={(e) => patch({ venue: e.target.value })} />
              <TextInput id="ev-address" label="Address" optional value={draft.address} onChange={(e) => patch({ address: e.target.value })} />
            </div>
          }
        </section>

        <section aria-labelledby="ev-tickets" className="flex flex-col gap-4 px-5 py-6">
          <div className="flex items-baseline justify-between gap-3">
            <h3 id="ev-tickets" className="text-label font-semibold text-fg">
              Ticket types
            </h3>
            <span className="text-caption tabular-nums text-fg-subtle">
              {draft.ticketTypes.length} of {MAX_TICKET_TYPES}
            </span>
          </div>
          {!paidAllowed &&
          <InlineAlert tone="info" title={`Free tickets work on ${plan.name}`} action={<UpgradeButton plan={CHECKOUT_PLAN} feature="Selling event tickets" />}>
              Paid tickets need {plans[CHECKOUT_PLAN].name}, because they use KUBICU checkout.
            </InlineAlert>
          }
          {err('types') && <p className="text-caption font-medium text-danger">{err('types')}</p>}
          <ol className="flex flex-col gap-3">
            {draft.ticketTypes.map((t, i) => {
              const sold = soldOf(t);
              return (
                <li key={t.id} className="rounded-md border border-line bg-raised">
                  <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
                    <span className="text-caption font-semibold text-fg-muted">
                      Ticket {i + 1}
                      {sold > 0 && <span className="font-normal text-fg-subtle"> · {sold} sold</span>}
                    </span>
                    <IconButton
                      icon={Trash2Icon}
                      size="sm"
                      label={sold > 0 ? 'Tickets of this type are sold — set quantity to stop sales instead' : `Remove ${t.name || 'ticket type'}`}
                      disabled={sold > 0}
                      onClick={() => {
                        const rest = draft.ticketTypes.filter((x) => x.id !== t.id);
                        // Rows that sold this type move to the first remaining type.
                        patch({ ticketTypes: rest, seating: draft.seating ? { ...draft.seating, rows: draft.seating.rows.map((r) => r.ticketTypeId === t.id ? { ...r, ticketTypeId: rest[0]?.id ?? '' } : r) } : undefined });
                      }} />
                    
                  </div>
                  <div className="flex flex-col gap-4 p-4">
                    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_160px]">
                      <TextInput id={`tt-n-${t.id}`} label="Name" value={t.name} error={err(`${t.id}.name`)} placeholder="e.g. VIP" onChange={(e) => patchType(t.id, { name: e.target.value })} />
                      <CurrencyInput id={`tt-p-${t.id}`} label="Price" value={t.priceNgn} error={err(`${t.id}.price`)} hint="0 = free" onChange={(v) => patchType(t.id, { priceNgn: Math.max(0, v ?? 0) })} />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {isSeatedType(draft, t.id) ?
                      <TextInput id={`tt-q-${t.id}`} label="Quantity" value={String(syncSeatQuantities(draft).ticketTypes.find((x) => x.id === t.id)?.quantity ?? 0)} disabled hint="Seats on the map" error={err(`${t.id}.quantity`)} onChange={() => undefined} /> :

                      <TextInput id={`tt-q-${t.id}`} label="Quantity" type="number" inputMode="numeric" min={1} value={String(t.quantity)} error={err(`${t.id}.quantity`)} onChange={(e) => patchType(t.id, { quantity: Math.max(0, Math.floor(Number(e.target.value) || 0)) })} />
                      }
                      <TextInput id={`tt-min-${t.id}`} label="Min / order" type="number" inputMode="numeric" min={1} value={String(t.minPerOrder)} onChange={(e) => patchType(t.id, { minPerOrder: Math.max(1, Math.floor(Number(e.target.value) || 1)) })} />
                      <TextInput id={`tt-max-${t.id}`} label="Max / order" type="number" inputMode="numeric" min={1} max={20} value={String(t.maxPerOrder)} onChange={(e) => patchType(t.id, { maxPerOrder: Math.min(20, Math.max(1, Math.floor(Number(e.target.value) || 1))) })} />
                    </div>
                    {err(`${t.id}.limits`) && <p className="-mt-2 text-caption font-medium text-danger">{err(`${t.id}.limits`)}</p>}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <DateTimeInput id={`tt-s-${t.id}`} label="Sales open" optional clearable value={t.salesStart} hint="Empty = now" onChange={(salesStart) => patchType(t.id, { salesStart })} />
                      <DateTimeInput id={`tt-e-${t.id}`} label="Sales close" optional clearable value={t.salesEnd} error={err(`${t.id}.window`)} hint="Empty = when the event starts" onChange={(salesEnd) => patchType(t.id, { salesEnd })} />
                    </div>
                    <TextInput id={`tt-note-${t.id}`} label="Note" optional value={t.note} placeholder="e.g. Includes a welcome drink" onChange={(e) => patchType(t.id, { note: e.target.value })} />
                  </div>
                </li>);

            })}
          </ol>
          <Button
            variant="secondary"
            leadingIcon={PlusIcon}
            className="self-start"
            disabled={draft.ticketTypes.length >= MAX_TICKET_TYPES}
            onClick={() => patch({ ticketTypes: [...draft.ticketTypes, blankTicketType()] })}>
            
            Add ticket type
          </Button>
        </section>

        <EventSeatingFields
          draft={draft}
          sold={sold}
          error={err('seating')}
          onChange={(seating) => patch({ seating })}
          locked={
          planAtLeast(plan.id, 'pro') ? undefined :
          <InlineAlert tone="info" title="Seat maps need Pro" action={<UpgradeButton plan="pro" feature="Seating maps" />}>
                Let guests pick exact seats or book a whole table. Repeating dates work on every plan.
              </InlineAlert>

          } />
        

        <section aria-labelledby="ev-rules" className="flex flex-col gap-4 px-5 py-6">
          <h3 id="ev-rules" className="text-label font-semibold text-fg">
            Seats &amp; policy
          </h3>
          <TextInput
            id="ev-cap"
            label="Overall capacity"
            optional
            type="number"
            inputMode="numeric"
            min={1}
            value={draft.capacity === null ? '' : String(draft.capacity)}
            error={err('capacity')}
            placeholder="Only the ticket quantities"
            hint="The most people the venue holds, across every ticket type."
            fieldClassName="max-w-[240px]"
            onChange={(e) => patch({ capacity: e.target.value.trim() === '' ? null : Math.max(0, Math.floor(Number(e.target.value))) })} />
          
          <TextArea id="ev-policy" label="Refund policy" rows={2} value={draft.refundPolicy} hint="Shown under the tickets and on every ticket. Keep it in line with KUBICU’s refund policy." onChange={(e) => patch({ refundPolicy: e.target.value })} />
        </section>

        {!cancelled &&
        <section aria-labelledby="ev-status" className="flex flex-col gap-3 px-5 py-6">
            <h3 id="ev-status" className="text-label font-semibold text-fg">
              Sales
            </h3>
            <Segmented<EventStatus> ariaLabel="Sales status" fullWidth value={draft.status} onChange={(status) => patch({ status })} options={statusOptions} />
            <p className="text-caption text-fg-muted">
              {draft.status === 'draft' ? 'Hidden from your pages until it’s on sale.' : draft.status === 'paused' ? 'Visible on your page, but no one can buy until you resume.' : 'Anyone can buy within each ticket’s sales dates, until seats run out.'}
            </p>
          </section>
        }
      </div>
    </Sheet>);

}