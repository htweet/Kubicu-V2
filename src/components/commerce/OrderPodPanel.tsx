import React, { useState } from 'react';
import { AlertTriangleIcon, BanknoteIcon, CheckCircle2Icon } from 'lucide-react';
import { toast } from 'sonner';
import type { CommerceData, Order, PodFailReason } from '../../types/commerce';
import { usePlan } from '../../contexts/PlanContext';
import { acceptLabels, collectPod, failPod, podFailLabels, refusalsFor } from '../../utils/commerce/payOptions';
import { formatNgn, formatTimestamp } from '../../utils/format';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { Segmented } from '../ui/Segmented';
import { SelectInput } from '../ui/SelectInput';
import { TextInput } from '../ui/TextInput';

interface Props {
  order: Order;
  data: CommerceData;
  apply: (fn: (d: CommerceData) => CommerceData) => boolean;
  /** Opened from the footer's "Mark delivered". */
  collectOpen: boolean;
  onCollectOpen: (open: boolean) => void;
}

/** Seller side of a pay-on-delivery order (D112): record what was collected, or why it wasn't. */
export function OrderPodPanel({ order, data, apply, collectOpen, onCollectOpen }: Props) {
  const plan = usePlan();
  const [how, setHow] = useState<'cash' | 'transfer'>(order.pod?.accept === 'transfer' ? 'transfer' : 'cash');
  const [failing, setFailing] = useState(false);
  const [reason, setReason] = useState<PodFailReason>('refused');
  const [note, setNote] = useState('');
  const pod = order.pod;
  if (!pod) return null;
  const earlierRefusals = refusalsFor({ ...data, orders: data.orders.filter((o) => o.id !== order.id) }, order.customer.phone);

  if (pod.collected) {
    return (
      <section aria-label="Pay on delivery" className="flex items-start gap-3 rounded-md border border-line px-4 py-3">
        <CheckCircle2Icon size={18} className="mt-0.5 shrink-0 text-success" aria-hidden />
        <p className="text-label text-fg">
          <span className="font-semibold">
            {formatNgn(pod.amountNgn)} collected by {pod.collected.how}
          </span>
          <span className="block text-caption text-fg-subtle">Pay on delivery · {formatTimestamp(pod.collected.at)} · paid to you directly, not through your wallet</span>
        </p>
      </section>);

  }
  if (order.status === 'cancelled' || order.status === 'refunded') return null;

  const collect = () => {
    if (apply((d) => collectPod(d, order.id, how, plan.id))) {
      toast.success(`Order #${order.number} delivered and paid`, { description: `${formatNgn(pod.amountNgn)} by ${how}.` });
      onCollectOpen(false);
    }
  };
  const fail = () => {
    if (apply((d) => failPod(d, order.id, reason, note.trim()))) {
      toast(`Order #${order.number} is back with you`, { description: 'Rebook the delivery or cancel the order to put the stock back.' });
      setFailing(false);
      setNote('');
      onCollectOpen(false);
    }
  };

  return (
    <section aria-labelledby={`pod-${order.id}`} className="flex flex-col gap-3 rounded-md border border-info/40 bg-info-soft px-4 py-3">
      <div className="flex items-start gap-3">
        <BanknoteIcon size={18} className="mt-0.5 shrink-0 text-info" aria-hidden />
        <div className="min-w-0">
          <h3 id={`pod-${order.id}`} className="text-label font-semibold text-fg">
            Pay on delivery · collect {formatNgn(pod.amountNgn)}
          </h3>
          <p className="text-caption text-fg-muted">
            {acceptLabels[pod.accept]}. Nothing has been paid yet — call the customer before sending, then record what you collected.
          </p>
          {earlierRefusals > 0 &&
          <p className="mt-1 flex items-center gap-1 text-caption font-medium text-warning">
              <AlertTriangleIcon size={12} aria-hidden /> This number refused {earlierRefusals} earlier delivery{earlierRefusals === 1 ? '' : 'ies'}.
            </p>
          }
          {pod.failed && pod.failed.length > 0 &&
          <ul className="mt-1.5 flex flex-col gap-0.5 text-caption text-fg-muted">
              {pod.failed.map((f) =>
            <li key={f.at}>
                  Failed {formatTimestamp(f.at)} — {podFailLabels[f.reason].toLowerCase()}
                  {f.note ? ` (${f.note})` : ''}
                </li>
            )}
            </ul>
          }
        </div>
      </div>
      {order.status !== 'new' &&
      <div className="flex flex-wrap gap-2 pl-[30px]">
          <Button size="sm" onClick={() => onCollectOpen(true)}>
            Record payment collected
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setFailing(true)}>
            Delivery failed
          </Button>
        </div>
      }

      <Dialog
        open={collectOpen}
        onClose={() => onCollectOpen(false)}
        title={`Collected ${formatNgn(pod.amountNgn)}?`}
        description="Record how the customer paid. This marks the order delivered."
        footer={
        <>
            <Button variant="tertiary" onClick={() => {onCollectOpen(false);setFailing(true);}}>
              They didn’t pay
            </Button>
            <Button onClick={collect}>Delivered and paid</Button>
          </>
        }>
        
        <Segmented<'cash' | 'transfer'>
          ariaLabel="How the customer paid"
          fullWidth
          value={how}
          onChange={setHow}
          options={[
          { value: 'cash', label: 'Cash' },
          { value: 'transfer', label: 'Transfer' }]
          } />
        
        {how === 'transfer' && <p className="mt-3 text-caption text-fg-muted">Check the money has arrived in your bank app before handing over — fake transfer alerts are common.</p>}
      </Dialog>

      <Dialog
        open={failing}
        onClose={() => setFailing(false)}
        title="Delivery failed"
        description="The order comes back to packing so you can rebook it, or cancel it to put the stock back."
        footer={
        <>
            <Button variant="tertiary" onClick={() => setFailing(false)}>
              Back
            </Button>
            <Button onClick={fail}>Record failed delivery</Button>
          </>
        }>
        
        <div className="flex flex-col gap-4">
          <SelectInput<PodFailReason> id={`pod-reason-${order.id}`} label="What happened" value={reason} onChange={setReason} options={(Object.keys(podFailLabels) as PodFailReason[]).map((r) => ({ value: r, label: podFailLabels[r] }))} hint={reason === 'refused' ? 'Remembered for this phone number — they can be asked to pay online next time.' : undefined} />
          <TextInput id={`pod-note-${order.id}`} label="Note" optional value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Said they ordered by mistake" />
        </div>
      </Dialog>
    </section>);

}