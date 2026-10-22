import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarIcon, PlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { Service } from '../../types/ops';
import { useOps } from '../../contexts/OpsContext';
import { uid } from '../../utils/id';
import { durationLabel } from '../../utils/ops/slots';
import { formatNgn } from '../../utils/format';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Sheet } from '../../components/ui/Sheet';
import { TextInput } from '../../components/ui/TextInput';
import { TextArea } from '../../components/ui/TextArea';
import { CurrencyInput } from '../../components/ui/CurrencyInput';
import { SelectInput } from '../../components/ui/SelectInput';
import { Segmented } from '../../components/ui/Segmented';
import { Switch } from '../../components/ui/Switch';
import { Field } from '../../components/ui/Field';
import { EmptyState } from '../../components/ui/EmptyState';
import { BookingsPlanNote } from '../../components/bookings/BookingsPlanNote';
import { SampleTag } from '../../components/commerce/StatusBadges';

const blank = (): Service => ({ id: uid('svc'), name: '', description: '', durationMin: 60, priceNgn: null, depositNgn: null, location: 'studio', locationNote: '', bufferMin: 15, active: true });
const durations = [15, 30, 45, 60, 90, 120, 180].map((m) => ({ value: String(m), label: durationLabel(m) }));

export function Services() {
  const { data, apply } = useOps();
  const [params, setParams] = useSearchParams();
  const editId = params.get('edit');
  const creating = params.get('new') === '1';
  const existing = editId ? data.services.find((s) => s.id === editId) : undefined;
  const [draft, setDraft] = useState<Service>(blank);
  const [tried, setTried] = useState(false);
  const open = creating || !!existing;

  useEffect(() => {
    if (open) {
      setDraft(existing ?? blank());
      setTried(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editId]);

  const patch = (p: Partial<Service>) => setDraft((d) => ({ ...d, ...p }));
  const depositError = draft.depositNgn !== null && draft.priceNgn !== null && draft.depositNgn > draft.priceNgn ? 'The deposit can’t be more than the price' : '';

  const save = () => {
    setTried(true);
    if (!draft.name.trim() || depositError) return;
    const s = { ...draft, name: draft.name.trim() };
    if (apply((d) => ({ ...d, services: existing ? d.services.map((x) => x.id === s.id ? s : x) : [...d.services, s] }))) {
      toast(existing ? 'Service saved' : 'Service added', { description: existing ? undefined : 'Add a Booking block to your page and pick this service.' });
      setParams({});
    }
  };

  const upcomingFor = (id: string) => data.bookings.filter((b) => b.serviceId === id && b.status === 'confirmed' && Date.parse(b.start) > Date.now()).length;

  return (
    <>
      <PageHeader
        title="Services"
        description="What people can book. Prices and deposits show before they confirm."
        actions={
        <Button leadingIcon={PlusIcon} onClick={() => setParams({ new: '1' })}>
            Add service
          </Button>
        } />
      
      <BookingsPlanNote />
      {data.services.length === 0 ?
      <div className="mt-8 rounded-lg border border-line bg-raised">
          <EmptyState icon={CalendarIcon} title="No services yet" description="A fitting, a consultation, a lesson — anything with a time." action={<Button leadingIcon={PlusIcon} onClick={() => setParams({ new: '1' })}>Add service</Button>} />
        </div> :

      <ul className="mt-8 flex flex-col divide-y divide-line rounded-lg border border-line bg-raised">
          {data.services.map((s) =>
        <li key={s.id}>
              <button type="button" onClick={() => setParams({ edit: s.id })} className="flex w-full flex-col gap-2 px-5 py-4 text-left transition-colors duration-150 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus sm:flex-row sm:items-center">
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-label font-semibold text-fg">{s.name}</span>
                    {s.sample && <SampleTag />}
                  </span>
                  <span className="block text-caption text-fg-subtle">
                    {durationLabel(s.durationMin)} · {s.location === 'online' ? 'Online' : s.location === 'customer' ? 'At customer’s address' : 'In person'} · {upcomingFor(s.id)} upcoming
                  </span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-label font-semibold tabular-nums text-fg">{s.priceNgn !== null ? formatNgn(s.priceNgn) : 'On request'}</span>
                  {s.depositNgn ? <span className="text-caption text-fg-subtle">{formatNgn(s.depositNgn)} deposit</span> : null}
                  <Badge tone={s.active ? 'success' : 'neutral'}>{s.active ? 'Bookable' : 'Off'}</Badge>
                </span>
              </button>
            </li>
        )}
        </ul>
      }

      <Sheet
        open={open}
        onClose={() => setParams({})}
        side="right"
        title={existing ? `Edit ${existing.name}` : 'New service'}
        footer={
        <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setParams({})}>
              Cancel
            </Button>
            <Button onClick={save}>{existing ? 'Save' : 'Add service'}</Button>
          </div>
        }>
        
        <div className="flex flex-col gap-5 px-5 py-5">
          <Switch id="svc-active" label="Bookable" description="Turn off to hide it from your page without deleting it." checked={draft.active} onChange={(active) => patch({ active })} />
          <TextInput id="svc-name" label="Name" value={draft.name} error={tried && !draft.name.trim() ? 'Name the service' : undefined} placeholder="e.g. Studio fitting" onChange={(e) => patch({ name: e.target.value })} />
          <TextArea id="svc-desc" label="Description" optional rows={2} value={draft.description} onChange={(e) => patch({ description: e.target.value })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectInput id="svc-dur" label="Duration" value={String(draft.durationMin)} options={durations} onChange={(v) => patch({ durationMin: Number(v) })} />
            <SelectInput id="svc-buf" label="Break after" value={String(draft.bufferMin)} options={[0, 5, 10, 15, 30, 60].map((m) => ({ value: String(m), label: m ? `${m} min` : 'None' }))} onChange={(v) => patch({ bufferMin: Number(v) })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <CurrencyInput id="svc-price" label="Price" value={draft.priceNgn} placeholder="On request" onChange={(priceNgn) => patch({ priceNgn })} />
            <CurrencyInput id="svc-dep" label="Deposit to hold the time" optional value={draft.depositNgn} placeholder="No deposit" error={tried ? depositError || undefined : undefined} hint="Taken at booking through your payment provider." onChange={(depositNgn) => patch({ depositNgn })} />
          </div>
          <Field id="svc-loc" label="Where">
            <Segmented
              ariaLabel="Where"
              fullWidth
              value={draft.location}
              onChange={(location) => patch({ location })}
              options={[
              { value: 'studio', label: 'In person' },
              { value: 'online', label: 'Online' },
              { value: 'customer', label: 'Their address' }]
              } />
            
          </Field>
          <TextInput id="svc-locnote" label={draft.location === 'online' ? 'How you’ll meet' : 'Address or area'} optional value={draft.locationNote} placeholder={draft.location === 'online' ? 'e.g. Google Meet link sent after booking' : 'e.g. Victoria Island studio'} onChange={(e) => patch({ locationNote: e.target.value })} />
        </div>
      </Sheet>
    </>);

}