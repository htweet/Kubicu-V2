import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRightIcon, RefreshCwIcon } from 'lucide-react';
import type { BlockOf } from '../../../types/page';
import type { ValidationIssue } from '../../../utils/validation';
import { useEditor } from '../../../contexts/EditorContext';
import { useOps } from '../../../contexts/OpsContext';
import { useT } from '../../../contexts/LocaleContext';
import { durationLabel } from '../../../utils/ops/slots';
import { formatNgn } from '../../../utils/format';
import { withSymbol } from '../../../utils/currency';
import { TextInput } from '../../ui/TextInput';
import { TextArea } from '../../ui/TextArea';
import { SelectInput } from '../../ui/SelectInput';
import { InlineAlert } from '../../ui/InlineAlert';
import { SourceSwitch, useCheckoutAllowed } from './CatalogFields';

/** Booking block fields. Field labels and hints translate inside the shared inputs; the rest here (D299). */
export function BookingFields({ block, issues }: {block: BlockOf<'booking'>;issues: ValidationIssue[];}) {
  const { t: tr } = useT();
  const { actions } = useEditor();
  const { data } = useOps();
  const { allowed, needed } = useCheckoutAllowed();
  const c = block.content;
  const msg = (f: string, s: ValidationIssue['severity']) => {
    const m = issues.find((i) => i.field === f && i.severity === s)?.message;
    return m ? tr(m) : undefined;
  };
  const err = (f: string) => msg(f, 'error');
  const warn = (f: string) => msg(f, 'warning');
  const id = (f: string) => `${block.id}-${f}`;
  const set = (patch: Partial<typeof c>, f: string) => actions.updateContent(block.id, 'booking', patch, f);
  const linked = c.source === 'catalog';
  const service = data.services.find((s) => s.id === c.serviceId);

  return (
    <div className="flex flex-col gap-4">
      <SourceSwitch
        id={id('source')}
        catalogLabel="My services"
        manualLabel="External booking"
        catalogHint="A service you’ve set up in Bookings. Visitors pick a free time and book right here."
        manualHint="Already take bookings somewhere else (Calendly, a form, another website)? Add its details and link — the button opens it."
        value={linked ? 'catalog' : 'manual'}
        onChange={(source) => set({ source, ctaLabel: source === 'catalog' ? 'Pick a time' : 'Book' }, 'source')} />
      
      {linked ?
      <>
          {!allowed &&
        <InlineAlert tone="info" title={tr('Built-in booking is on {plan}', { plan: needed })}>
              {tr('You can set it up now; it can’t be published on your current plan.')}
            </InlineAlert>
        }
          {data.services.length === 0 ?
        <div className="rounded-md border border-dashed border-line-strong px-3 py-3">
              <p className="text-label font-semibold text-fg">{tr('No services yet')}</p>
              <Link to="/app/bookings/services?new=1" className="mt-1 inline-flex items-center gap-1 text-caption font-semibold text-action hover:underline">
                {tr('Add a service')} <ArrowUpRightIcon size={12} aria-hidden />
              </Link>
            </div> :

        <SelectInput
          id={id('service')}
          label={tr('Service')}
          value={c.serviceId ?? ''}
          onChange={(serviceId) => set({ serviceId }, 'serviceId')}
          options={[{ value: '', label: tr('Choose…') }, ...data.services.map((s) => ({ value: s.id, label: s.active ? s.name : `${s.name} (${tr('off')})` }))]} />

        }
          {err('serviceId') && <p className="-mt-2 text-caption text-danger">{err('serviceId')}</p>}
          {!err('serviceId') && warn('serviceId') && <p className="-mt-2 text-caption text-warning">{warn('serviceId')}</p>}
          {service &&
        <div className="flex items-start gap-3 rounded-md border border-line bg-sunken px-3 py-2.5">
              <RefreshCwIcon size={15} className="mt-0.5 shrink-0 text-success" aria-hidden />
              <div>
                <p className="text-label font-semibold text-fg">{tr('Synced with Bookings')}</p>
                <p className="text-caption text-fg-muted">
                  {durationLabel(service.durationMin)} · {service.priceNgn !== null ? formatNgn(service.priceNgn) : tr('Price on request')}
                  {service.depositNgn ? ` · ${tr('{amount} deposit', { amount: formatNgn(service.depositNgn) })}` : ''}. {tr('Visitors pick from your live availability.')}
                </p>
                <Link to="/app/bookings/services" className="mt-1 inline-flex items-center gap-1 text-caption font-semibold text-action hover:underline">
                  {tr('Edit in Bookings')} <ArrowUpRightIcon size={12} aria-hidden />
                </Link>
              </div>
            </div>
        }
          <TextInput id={id('title')} label={tr('Title')} optional placeholder={service?.name} value={c.title} hint={tr('Leave blank to use the service name.')} onChange={(e) => set({ title: e.target.value }, 'title')} />
          <TextInput id={id('cta')} label={tr('Button label')} value={c.ctaLabel} onChange={(e) => set({ ctaLabel: e.target.value }, 'ctaLabel')} />
        </> :

      <>
          <TextInput id={id('title')} label={tr('Service name')} value={c.title} error={err('title')} onChange={(e) => set({ title: e.target.value }, 'title')} />
          <TextArea id={id('description')} label={tr('Description')} optional rows={2} value={c.description} onChange={(e) => set({ description: e.target.value }, 'description')} />
          <div className="grid grid-cols-2 gap-3">
            <TextInput id={id('duration')} label={tr('Duration')} optional placeholder={tr('45 min')} value={c.duration} onChange={(e) => set({ duration: e.target.value }, 'duration')} />
            <TextInput id={id('price')} label={tr('Price note')} optional placeholder={withSymbol(tr('From ₦…'))} value={c.priceNote} onChange={(e) => set({ priceNote: e.target.value }, 'priceNote')} />
          </div>
          <TextInput id={id('url')} label={tr('Booking link')} type="url" inputMode="url" placeholder="https://" value={c.url} error={err('url')} onChange={(e) => set({ url: e.target.value }, 'url')} />
          <TextInput id={id('cta')} label={tr('Button label')} value={c.ctaLabel} onChange={(e) => set({ ctaLabel: e.target.value }, 'ctaLabel')} />
          <p className="text-caption text-fg-subtle">{tr('For a calendar on your page with deposits and reminders, switch to “My services” above.')}</p>
        </>
      }
    </div>);

}