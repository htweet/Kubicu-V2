import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangleIcon, ArrowUpRightIcon, CheckIcon, CopyIcon, ExternalLinkIcon, SendIcon, TruckIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { Order, TrackingMilestone } from '../../types/commerce';
import { useCommerce } from '../../contexts/CommerceContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useFulfilment } from '../../hooks/useFulfilment';
import { useT } from '../../contexts/LocaleContext';
import { deliveryLabels } from '../../utils/fulfilment';
import { buildTracking, dayLabel, healthLabels, healthTones, isTrackingUrl, milestoneLabels, postTrackingUpdate, promiseLabel, setCarrier, setPromise } from '../../utils/commerce/tracking';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { SelectInput } from '../ui/SelectInput';
import { DateTimeInput } from '../ui/DateTimeInput';
import { cn } from '../../utils/cn';
import { trackingStageIcons } from './trackingStageIcons';

type Editing = null | 'promise' | 'carrier' | 'update';

/** Seller side of order tracking (D144): progress with times, health, promise date, courier and customer updates. */
export function OrderTrackingPanel({ order, handle }: {order: Order;handle: string;}) {
  const { apply } = useCommerce();
  const { current } = useWorkspace();
  const fulfilment = useFulfilment(current.id).data;
  const { t: tr } = useT();
  const view = buildTracking(order, fulfilment);
  const [editing, setEditing] = useState<Editing>(null);
  const [promise, setPromiseDraft] = useState<string | null>(order.tracking?.promisedBy ?? view.promisedBy);
  const [carrier, setCarrierDraft] = useState({ name: order.tracking?.carrier?.name ?? '', number: order.tracking?.carrier?.trackingNumber ?? '', url: order.tracking?.carrier?.url ?? '' });
  const [carrierError, setCarrierError] = useState<{name?: string;url?: string;}>({});
  const [update, setUpdate] = useState<{label: string;location: string;milestone: TrackingMilestone;}>({ label: '', location: '', milestone: 'update' });
  const [copied, setCopied] = useState(false);

  if (!view.applies) return null;
  const d = view.delivery;
  const link = `/p/${order.sourceHandle ?? handle}/order/${order.id}#tracking`;
  const live = view.health !== 'done' && view.health !== 'cancelled';
  const sourceNote = view.promiseSource === 'seller' ? tr('you set this') : view.promiseSource === 'courier' ? tr('from {partner}', { partner: d?.partnerName ?? '' }) : tr('estimate from your delivery time');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${link}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
      toast.success(tr('Tracking link copied'), { description: tr('Send it to the customer on WhatsApp.') });
    } catch {
      toast.error(tr('Couldn’t copy — select the link and copy it yourself.'));
    }
  };

  const savePromise = () => {
    if (apply((data) => setPromise(data, order.id, promise))) {
      setEditing(null);
      toast.success(promise ? tr('Customer now sees “Expected by {date}”', { date: promiseLabel(promise) }) : tr('Back to the estimate'));
    }
  };

  const saveCarrier = () => {
    const errs: typeof carrierError = {};
    if (!carrier.name.trim()) errs.name = tr('Name the courier, like “GIG Logistics”.');
    if (carrier.url.trim() && !isTrackingUrl(carrier.url)) errs.url = tr('Use a full https:// link from the courier’s site.');
    setCarrierError(errs);
    if (Object.keys(errs).length) return;
    if (apply((data) => setCarrier(data, order.id, { name: carrier.name.trim(), trackingNumber: carrier.number.trim() || undefined, url: carrier.url.trim() || undefined }))) {
      setEditing(null);
      toast.success(tr('Courier details added to the tracking page'));
    }
  };

  const sendUpdate = () => {
    if (!update.label.trim()) return;
    if (apply((data) => postTrackingUpdate(data, order.id, update))) {
      setUpdate({ label: '', location: '', milestone: 'update' });
      setEditing(null);
      toast.success(tr('Update posted to the tracking page'), { description: tr('The customer would also get a WhatsApp message (preview only).') });
    }
  };

  return (
    <section aria-labelledby={`trk-${order.id}`} className="flex flex-col gap-4 rounded-lg border border-line p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id={`trk-${order.id}`} className="flex items-center gap-2 text-label font-semibold text-fg">
          <TruckIcon size={16} className="text-fg-subtle" aria-hidden /> {tr(view.pickup ? 'Pickup tracking' : 'Delivery tracking')}
        </h3>
        <Badge tone={healthTones[view.health]} dot>
          {healthLabels[view.health]}
        </Badge>
      </div>

      <ol className="relative flex flex-col gap-3 sm:grid sm:gap-1.5" style={{ gridTemplateColumns: `repeat(${view.stages.length}, minmax(0, 1fr))` }} aria-label={tr('Order progress')}>
        <span aria-hidden className="absolute bottom-3.5 left-[13px] top-3.5 w-px bg-line sm:hidden" />
        {view.stages.map((s, i) => {
          const Icon = trackingStageIcons[s.key];
          const next = view.stages[i + 1];
          return (
            <li key={s.key} className="relative flex items-start gap-3 sm:block" aria-current={s.state === 'current' ? 'step' : undefined}>
            {next && <span aria-hidden className={cn('absolute left-8 right-1 top-[13px] hidden h-0.5 rounded-full sm:block', next.state === 'done' ? 'bg-action' : 'bg-line')} />}
            <span
                aria-hidden
                className={cn(
                  'relative z-[1] flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-4 ring-overlay',
                  s.state === 'done' ? 'bg-action text-action-fg' : s.state === 'problem' ? 'bg-danger text-white' : s.state === 'current' ? 'border-2 border-action bg-overlay text-action' : 'border border-line-strong bg-overlay text-fg-subtle'
                )}>
                
              <Icon size={14} strokeWidth={2.25} />
            </span>
            <span className="block pt-1 sm:mt-2 sm:pt-0">
              <span className="sr-only">{tr(s.state === 'done' ? 'Done:' : s.state === 'current' ? 'Now:' : 'Next:')} </span>
              <span className={cn('block text-label sm:text-caption', s.state === 'done' || s.state === 'current' ? 'font-semibold text-fg' : 'text-fg-subtle')}>{tr(s.label)}</span>
              {s.at && <span className="block text-caption tabular-nums text-fg-subtle">{dayLabel(s.at)}</span>}
            </span>
          </li>);

        })}
      </ol>

      {view.signals.length > 0 &&
      <ul className={cn('flex flex-col gap-1 rounded-md px-3 py-2.5 text-label', view.health === 'done' ? 'bg-sunken text-fg-muted' : view.health === 'at_risk' ? 'bg-warning-soft text-fg' : 'bg-danger-soft text-fg')}>
          {view.signals.map((s, i) =>
        <li key={i} className="flex items-start gap-2">
              <AlertTriangleIcon size={14} className={cn('mt-0.5 shrink-0', view.health === 'at_risk' ? 'text-warning' : view.health === 'done' ? 'text-fg-subtle' : 'text-danger')} aria-hidden />
              <span>{tr(s.t, s.v)}</span>
            </li>
        )}
        </ul>
      }

      <dl className="grid gap-x-6 gap-y-3 border-t border-line pt-3 text-label sm:grid-cols-2">
        <div>
          <dt className="text-caption text-fg-subtle">{tr(view.doneAt ? view.pickup ? 'Collected' : 'Delivered' : 'Promised by')}</dt>
          <dd className="font-semibold text-fg">
            {view.doneAt ? promiseLabel(view.doneAt) : view.promisedBy ? promiseLabel(view.promisedBy) : tr('After the balance is paid')}
            {!view.doneAt && view.promisedBy && <span className="block text-caption font-normal text-fg-subtle">{sourceNote}</span>}
            {view.doneAt && <span className={cn('block text-caption font-normal', view.wasLate ? 'text-danger' : 'text-success')}>{tr(view.wasLate ? 'Later than promised' : 'On time')}</span>}
          </dd>
        </div>
        <div>
          <dt className="text-caption text-fg-subtle">{tr('Courier')}</dt>
          <dd className="font-semibold text-fg">
            {d ?
            <>
                {d.partnerName}
                {d.rider ? ` · ${d.rider.name}` : ''}
                <span className="block text-caption font-normal text-fg-subtle">
                  {tr(deliveryLabels[d.status])} ·{' '}
                  <Link to="/app/deliveries" className="font-medium text-action hover:underline">
                    {tr('Open in Deliveries')}
                  </Link>
                </span>
              </> :
            view.carrier ?
            <>
                {view.carrier.name}
                {view.carrier.trackingNumber && <span className="block font-mono text-caption font-normal text-fg-subtle">{view.carrier.trackingNumber}</span>}
              </> :
            view.pickup ?
            <span className="font-normal text-fg-muted">{tr('Customer collects')}</span> :

            <span className="font-normal text-fg-muted">{tr('Not booked yet')}</span>
            }
          </dd>
        </div>
      </dl>

      {editing === 'promise' &&
      <div className="flex flex-col gap-3 rounded-md bg-sunken p-3">
          <DateTimeInput id={`promise-${order.id}`} label="Promise the customer delivery by" value={promise} onChange={setPromiseDraft} clearable hint={tr('Clear it to go back to the estimate. The customer sees the new date straight away.')} />
          <div className="flex justify-end gap-2">
            <Button variant="tertiary" size="sm" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={savePromise}>
              Save date
            </Button>
          </div>
        </div>
      }

      {editing === 'carrier' &&
      <div className="flex flex-col gap-3 rounded-md bg-sunken p-3">
          <p className="text-caption text-fg-subtle">{tr('Shipping interstate or with a courier outside KUBICU? Add it so the customer can follow it.')}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput id={`car-name-${order.id}`} label="Courier" placeholder="GIG Logistics" value={carrier.name} error={carrierError.name} onChange={(e) => setCarrierDraft({ ...carrier, name: e.target.value })} />
            <TextInput id={`car-num-${order.id}`} label="Tracking number" optional value={carrier.number} onChange={(e) => setCarrierDraft({ ...carrier, number: e.target.value })} />
          </div>
          <TextInput id={`car-url-${order.id}`} label="Tracking link" optional placeholder="https://" value={carrier.url} error={carrierError.url} onChange={(e) => setCarrierDraft({ ...carrier, url: e.target.value })} />
          <div className="flex justify-end gap-2">
            {order.tracking?.carrier &&
          <Button variant="tertiary" size="sm" onClick={() => apply((data) => setCarrier(data, order.id, null)) && setEditing(null)}>
                Remove
              </Button>
          }
            <Button variant="tertiary" size="sm" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={saveCarrier}>
              Save courier
            </Button>
          </div>
        </div>
      }

      {editing === 'update' &&
      <form
        className="flex flex-col gap-3 rounded-md bg-sunken p-3"
        onSubmit={(e) => {
          e.preventDefault();
          sendUpdate();
        }}>
        
          <SelectInput<TrackingMilestone>
          id={`upd-kind-${order.id}`}
          label="Type of update"
          value={update.milestone}
          onChange={(milestone) => setUpdate({ ...update, milestone })}
          options={(Object.keys(milestoneLabels) as TrackingMilestone[]).filter((k) => !view.pickup || k === 'update').map((k) => ({ value: k, label: tr(milestoneLabels[k]) }))}
          hint={update.milestone === 'out_for_delivery' ? tr('Moves the tracker to “Out for delivery”.') : update.milestone === 'in_transit' ? tr('Moves the tracker to “With the courier”.') : undefined} />
        
          <TextInput id={`upd-text-${order.id}`} label="Message for the customer" placeholder={tr('Left our Lagos hub this morning')} value={update.label} maxLength={140} onChange={(e) => setUpdate({ ...update, label: e.target.value })} />
          <TextInput id={`upd-loc-${order.id}`} label="Location" optional placeholder="Abuja" value={update.location} onChange={(e) => setUpdate({ ...update, location: e.target.value })} />
          <div className="flex justify-end gap-2">
            <Button variant="tertiary" size="sm" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" leadingIcon={SendIcon} disabled={!update.label.trim()}>
              Post update
            </Button>
          </div>
        </form>
      }

      <div className="flex flex-wrap items-center gap-1.5 border-t border-line pt-3">
        <Button variant="secondary" size="sm" leadingIcon={copied ? CheckIcon : CopyIcon} onClick={copy}>
          {copied ? 'Copied' : 'Copy tracking link'}
        </Button>
        <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center gap-1 rounded-md px-2.5 text-label font-medium text-fg-muted hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          {tr('Customer view')} <ExternalLinkIcon size={13} aria-hidden />
        </a>
        {live &&
        <span className="ml-auto flex flex-wrap gap-1.5">
            <Button variant="tertiary" size="sm" onClick={() => setEditing(editing === 'promise' ? null : 'promise')}>
              Change date
            </Button>
            {!view.pickup && !d &&
          <Button variant="tertiary" size="sm" onClick={() => setEditing(editing === 'carrier' ? null : 'carrier')}>
                {view.carrier ? 'Edit courier' : 'Add courier'}
              </Button>
          }
            <Button variant="tertiary" size="sm" leadingIcon={ArrowUpRightIcon} onClick={() => setEditing(editing === 'update' ? null : 'update')}>
              Post update
            </Button>
          </span>
        }
      </div>
    </section>);

}