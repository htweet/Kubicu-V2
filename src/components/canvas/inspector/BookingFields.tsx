import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRightIcon, RefreshCwIcon } from 'lucide-react';
import type { BlockOf } from '../../../types/page';
import type { ValidationIssue } from '../../../utils/validation';
import { useEditor } from '../../../contexts/EditorContext';
import { useOps } from '../../../contexts/OpsContext';
import { durationLabel } from '../../../utils/ops/slots';
import { formatNgn } from '../../../utils/format';
import { TextInput } from '../../ui/TextInput';
import { TextArea } from '../../ui/TextArea';
import { SelectInput } from '../../ui/SelectInput';
import { InlineAlert } from '../../ui/InlineAlert';
import { SourceSwitch, useCheckoutAllowed } from './CatalogFields';

export function BookingFields({ block, issues }: {block: BlockOf<'booking'>;issues: ValidationIssue[];}) {
  const { actions } = useEditor();
  const { data } = useOps();
  const { allowed, needed } = useCheckoutAllowed();
  const c = block.content;
  const err = (f: string) => issues.find((i) => i.field === f && i.severity === 'error')?.message;
  const warn = (f: string) => issues.find((i) => i.field === f && i.severity === 'warning')?.message;
  const id = (f: string) => `${block.id}-${f}`;
  const set = (patch: Partial<typeof c>, f: string) => actions.updateContent(block.id, 'booking', patch, f);
  const linked = c.source === 'catalog';
  const service = data.services.find((s) => s.id === c.serviceId);

  return (
    <div className="flex flex-col gap-4">
      <SourceSwitch id={id('source')} catalogLabel="Bookings" value={linked ? 'catalog' : 'manual'} onChange={(source) => set({ source, ctaLabel: source === 'catalog' ? 'Pick a time' : 'Book' }, 'source')} />
      {linked ?
      <>
          {!allowed &&
        <InlineAlert tone="info" title={`Built-in booking is on ${needed}`}>
              You can set it up now; it can’t be published on your current plan.
            </InlineAlert>
        }
          {data.services.length === 0 ?
        <div className="rounded-md border border-dashed border-line-strong px-3 py-3">
              <p className="text-label font-semibold text-fg">No services yet</p>
              <Link to="/app/bookings/services?new=1" className="mt-1 inline-flex items-center gap-1 text-caption font-semibold text-action hover:underline">
                Add a service <ArrowUpRightIcon size={12} aria-hidden />
              </Link>
            </div> :

        <SelectInput id={id('service')} label="Service" value={c.serviceId ?? ''} onChange={(serviceId) => set({ serviceId }, 'serviceId')} options={[{ value: '', label: 'Choose…' }, ...data.services.map((s) => ({ value: s.id, label: `${s.name}${s.active ? '' : ' (off)'}` }))]} />
        }
          {err('serviceId') && <p className="-mt-2 text-caption text-danger">{err('serviceId')}</p>}
          {!err('serviceId') && warn('serviceId') && <p className="-mt-2 text-caption text-warning">{warn('serviceId')}</p>}
          {service &&
        <div className="flex items-start gap-3 rounded-md border border-line bg-sunken px-3 py-2.5">
              <RefreshCwIcon size={15} className="mt-0.5 shrink-0 text-success" aria-hidden />
              <div>
                <p className="text-label font-semibold text-fg">Synced with Bookings</p>
                <p className="text-caption text-fg-muted">
                  {durationLabel(service.durationMin)} · {service.priceNgn !== null ? formatNgn(service.priceNgn) : 'Price on request'}
                  {service.depositNgn ? ` · ${formatNgn(service.depositNgn)} deposit` : ''}. Visitors pick from your live availability.
                </p>
                <Link to="/app/bookings/services" className="mt-1 inline-flex items-center gap-1 text-caption font-semibold text-action hover:underline">
                  Edit in Bookings <ArrowUpRightIcon size={12} aria-hidden />
                </Link>
              </div>
            </div>
        }
          <TextInput id={id('title')} label="Title" optional placeholder={service?.name} value={c.title} hint="Leave blank to use the service name." onChange={(e) => set({ title: e.target.value }, 'title')} />
          <TextInput id={id('cta')} label="Button label" value={c.ctaLabel} onChange={(e) => set({ ctaLabel: e.target.value }, 'ctaLabel')} />
        </> :

      <>
          <TextInput id={id('title')} label="Service name" value={c.title} error={err('title')} onChange={(e) => set({ title: e.target.value }, 'title')} />
          <TextArea id={id('description')} label="Description" optional rows={2} value={c.description} onChange={(e) => set({ description: e.target.value }, 'description')} />
          <div className="grid grid-cols-2 gap-3">
            <TextInput id={id('duration')} label="Duration" optional placeholder="45 min" value={c.duration} onChange={(e) => set({ duration: e.target.value }, 'duration')} />
            <TextInput id={id('price')} label="Price note" optional placeholder="From ₦…" value={c.priceNote} onChange={(e) => set({ priceNote: e.target.value }, 'priceNote')} />
          </div>
          <TextInput id={id('url')} label="Booking link" type="url" inputMode="url" placeholder="https://" value={c.url} error={err('url')} onChange={(e) => set({ url: e.target.value }, 'url')} />
          <TextInput id={id('cta')} label="Button label" value={c.ctaLabel} onChange={(e) => set({ ctaLabel: e.target.value }, 'ctaLabel')} />
          <p className="text-caption text-fg-subtle">For a calendar on your page with deposits and reminders, switch to “Bookings” above.</p>
        </>
      }
    </div>);

}