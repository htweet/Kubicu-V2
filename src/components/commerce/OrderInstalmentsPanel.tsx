import React, { useState } from 'react';
import { CalendarClockIcon, CopyIcon, MessageCircleIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { CommerceData, InstalmentPart, Order } from '../../types/commerce';
import { cancelRemaining, everyLabels, instalmentsOwed, nextAttemptAt, nextPart, payPart } from '../../utils/commerce/payOptions';
import { creditInstalment } from '../../utils/money/instalments';
import { formatNgn, formatTimestamp, whatsappLink } from '../../utils/format';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Dialog } from '../ui/Dialog';
import { TextInput } from '../ui/TextInput';
import { cn } from '../../utils/cn';

interface Props {
  order: Order;
  handle: string;
  business: string;
  workspaceId: string;
  apply: (fn: (d: CommerceData) => CommerceData) => boolean;
}

const partTone = { paid: 'success', scheduled: 'neutral', failed: 'danger', cancelled: 'neutral' } as const;
const partLabel = { paid: 'Paid', scheduled: 'Scheduled', failed: 'Failed', cancelled: 'Cancelled' } as const;
const statusLine = { active: 'In progress', completed: 'Fully paid', defaulted: 'Defaulted — retries used up', cancelled: 'Remaining parts cancelled' } as const;

/** Seller side of an order paid in parts (D112). */
export function OrderInstalmentsPanel({ order, handle, business, workspaceId, apply }: Props) {
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState('');
  const inst = order.instalments;
  if (!inst) return null;
  const owed = instalmentsOwed(order);
  const next = nextPart(order);
  const total = inst.parts.length;
  const link = `${window.location.origin}/p/${order.sourceHandle ?? handle}/order/${order.id}`;
  const live = inst.status === 'active' || inst.status === 'defaulted';

  const retry = (p: InstalmentPart) => {
    creditInstalment(workspaceId, order, p);
    if (apply((d) => payPart(d, order.id, p.id, 'card'))) toast.success(`Instalment ${p.n} charged (test)`);
  };
  const record = (p: InstalmentPart) => apply((d) => payPart(d, order.id, p.id, 'recorded')) && toast.success(`Instalment ${p.n} recorded as paid`, { description: 'Cash or transfer to you — not added to your wallet.' });
  const nudge = next ? `Hi ${order.customer.name.split(' ')[0] || 'there'}, it’s ${business}. Instalment ${next.n} of ${total} for order #${order.number} (${formatNgn(next.amountNgn)}) ${next.status === 'failed' ? 'didn’t go through' : 'is coming up'}. You can pay it or update your card here: ${link}` : '';

  return (
    <section aria-labelledby={`inst-${order.id}`} className={cn('flex flex-col gap-3 rounded-md border px-4 py-3', inst.status === 'defaulted' || next?.status === 'failed' ? 'border-danger/40 bg-danger-soft' : 'border-line')}>
      <div className="flex items-start gap-3">
        <CalendarClockIcon size={18} className="mt-0.5 shrink-0 text-fg-muted" aria-hidden />
        <div className="min-w-0 flex-1">
          <h3 id={`inst-${order.id}`} className="text-label font-semibold text-fg">
            Paid in {total} parts · {statusLine[inst.status]}
          </h3>
          <p className="text-caption text-fg-muted">
            {owed > 0 ? `${formatNgn(owed)} still to come, ${everyLabels[inst.every]} on ${inst.card.brand} ····${inst.card.last4}. ` : ''}
            {inst.ship === 'last' ? owed > 0 && inst.status !== 'cancelled' ? 'You chose to send it after the last part.' : 'Ready to send.' : 'You chose to send it after the first part.'}
          </p>
        </div>
      </div>
      <ol className="flex flex-col divide-y divide-line rounded-md border border-line bg-raised">
        {inst.parts.map((p) => {
          const attempt = nextAttemptAt(p);
          return (
            <li key={p.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2.5 text-label">
              <span className="w-14 shrink-0 text-fg-muted">
                {p.n} of {total}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold tabular-nums text-fg">{formatNgn(p.amountNgn)}</span>
                <span className="block text-caption text-fg-subtle">
                  {p.status === 'paid' && p.paidAt ? `${p.how === 'recorded' ? 'Recorded' : 'Paid'} ${formatTimestamp(p.paidAt)}` : p.status === 'failed' ? attempt ? `Retry ${formatTimestamp(attempt)}` : 'No retries left' : p.status === 'scheduled' ? `Due ${formatTimestamp(p.dueAt)}` : 'Won’t be charged'}
                </span>
              </span>
              <Badge tone={partTone[p.status]}>{partLabel[p.status]}</Badge>
              {live && next?.id === p.id &&
              <span className="flex w-full flex-wrap gap-2 sm:w-auto">
                  {p.status === 'failed' &&
                <Button size="sm" variant="secondary" onClick={() => retry(p)}>
                      Retry now
                    </Button>
                }
                  <Button size="sm" variant="tertiary" onClick={() => record(p)}>
                    Record as paid
                  </Button>
                </span>
              }
            </li>);

        })}
      </ol>
      {live && next &&
      <div className="flex flex-wrap gap-2">
          {order.customer.phone &&
        <Button size="sm" variant="secondary" leadingIcon={MessageCircleIcon} onClick={() => window.open(whatsappLink(order.customer.phone, nudge), '_blank', 'noopener,noreferrer')}>
              WhatsApp
            </Button>
        }
          <Button size="sm" variant="tertiary" leadingIcon={CopyIcon} onClick={() => navigator.clipboard?.writeText(link).then(() => toast.success('Order page link copied'), () => undefined)}>
            Copy pay link
          </Button>
          <Button size="sm" variant="tertiary" onClick={() => setCancelling(true)}>
            Cancel remaining parts
          </Button>
        </div>
      }
      <Dialog
        open={cancelling}
        onClose={() => setCancelling(false)}
        title="Cancel the remaining parts?"
        description={`${formatNgn(owed)} won’t be charged. What’s been paid stays paid — refund it from the order if you’re taking the item back.`}
        footer={
        <>
            <Button variant="tertiary" onClick={() => setCancelling(false)}>
              Keep them
            </Button>
            <Button
            variant="destructive"
            onClick={() => {
              if (apply((d) => cancelRemaining(d, order.id, reason.trim()))) {
                toast('Remaining instalments cancelled');
                setCancelling(false);
              }
            }}>
            
              Cancel remaining parts
            </Button>
          </>
        }>
        
        <TextInput id={`inst-reason-${order.id}`} label="Reason" optional value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Agreed with the customer" />
      </Dialog>
    </section>);

}