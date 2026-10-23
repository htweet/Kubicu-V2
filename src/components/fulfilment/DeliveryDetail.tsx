import React, { useEffect, useState } from 'react';
import { BanIcon, KeyRoundIcon, MessageCircleIcon, PackageCheckIcon, PhoneIcon, UserCheckIcon } from 'lucide-react';
import type { Delivery, FailReason } from '../../types/fulfilment';
import { deliveryLabels, deliveryTones, failLabels, MAX_CODE_ATTEMPTS } from '../../utils/fulfilment';
import { formatNgn, formatTimestamp, whatsappLink } from '../../utils/format';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { TextInput } from '../ui/TextInput';
import { SelectInput } from '../ui/SelectInput';
import { TextArea } from '../ui/TextArea';
import { InlineAlert } from '../ui/InlineAlert';
import { SampleTag } from '../commerce/StatusBadges';

interface DeliveryDetailProps {
  delivery: Delivery | null;
  canEdit: boolean;
  business: string;
  onClose: () => void;
  onAssign: (d: Delivery) => void;
  onPickedUp: (d: Delivery) => void;
  /** Returns an error message for a wrong code, or null on success. */
  onCode: (d: Delivery, code: string) => string | null;
  onFail: (d: Delivery, reason: FailReason, note: string) => void;
  onCancel: (d: Delivery) => void;
  onRebook: (d: Delivery) => void;
}

/** One delivery: rider, timeline and the code handover (D96). */
export function DeliveryDetail({ delivery: d, canEdit, business, onClose, onAssign, onPickedUp, onCode, onFail, onCancel, onRebook }: DeliveryDetailProps) {
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [failing, setFailing] = useState(false);
  const [reason, setReason] = useState<FailReason>('unreachable');
  const [note, setNote] = useState('');

  useEffect(() => {
    setCode('');
    setCodeError('');
    setFailing(false);
    setNote('');
  }, [d?.id]);

  if (!d) return <Sheet open={false} onClose={onClose} title="">{null}</Sheet>;
  const active = d.status === 'booked' || d.status === 'assigned' || d.status === 'picked_up';

  const submitCode = () => {
    if (!/^\d{4}$/.test(code.trim())) return setCodeError('Enter the 4 digits the customer reads out.');
    const err = onCode(d, code);
    setCodeError(err ?? '');
    if (err) setCode('');
  };

  const footer = !canEdit ? undefined : failing ?
  <div className="flex w-full justify-end gap-2">
      <Button variant="secondary" onClick={() => setFailing(false)}>
        Back
      </Button>
      <Button variant="destructive" onClick={() => onFail(d, reason, note)}>
        Mark as failed
      </Button>
    </div> :
  active ?
  <div className="flex w-full flex-wrap items-center justify-between gap-2">
      <span className="flex gap-2">
        {(d.status === 'booked' || d.status === 'assigned') &&
      <Button variant="tertiary" leadingIcon={BanIcon} onClick={() => onCancel(d)}>
            Cancel booking
          </Button>
      }
        {d.status === 'picked_up' &&
      <Button variant="tertiary" onClick={() => setFailing(true)}>
            Couldn’t deliver
          </Button>
      }
      </span>
      {d.status === 'booked' &&
    <Button variant="secondary" leadingIcon={UserCheckIcon} onClick={() => onAssign(d)}>
          Prototype: assign a rider
        </Button>
    }
      {d.status === 'assigned' &&
    <Button leadingIcon={PackageCheckIcon} onClick={() => onPickedUp(d)}>
          Rider has collected it
        </Button>
    }
    </div> :
  d.status === 'failed' ?
  <div className="flex w-full justify-end">
      <Button onClick={() => onRebook(d)}>Book again</Button>
    </div> :
  undefined;

  return (
    <Sheet open onClose={onClose} side="right" size="lg" title={`Delivery · order #${d.orderNumber}`} description={`${d.partnerName} · booked ${formatTimestamp(d.createdAt)}`} footer={footer}>
      <div className="flex flex-col gap-6 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={deliveryTones[d.status]} dot>
            {deliveryLabels[d.status]}
          </Badge>
          {d.escrow && <Badge tone="info">Escrow order</Badge>}
          <Badge tone="neutral">Simulated</Badge>
          {d.sample && <SampleTag />}
        </div>

        {d.status === 'failed' &&
        <InlineAlert tone="danger" title={d.failReason ? failLabels[d.failReason] : 'Delivery failed'}>
            {d.failNote ? `“${d.failNote}” · ` : ''}The order is back with you. Book again or contact the customer.
            {d.escrow ? ' The escrow payment stays held until it’s delivered.' : ''}
          </InlineAlert>
        }

        {d.status === 'picked_up' && canEdit && !failing &&
        <section aria-labelledby="dl-code" className="flex flex-col gap-3 rounded-md border border-line p-4">
            <h3 id="dl-code" className="flex items-center gap-2 text-label font-semibold text-fg">
              <KeyRoundIcon size={16} className="text-fg-muted" aria-hidden /> At the door: enter the customer’s code
            </h3>
            <p className="text-caption text-fg-muted">
              In a live setup the rider types this in their app. {d.escrow ? 'A match releases the escrow payment to your wallet.' : 'A match marks the order delivered.'} {MAX_CODE_ATTEMPTS - d.codeAttempts} tries left.
            </p>
            <div className="flex items-start gap-2">
              <TextInput
              id="dl-code-input"
              label="Delivery code"
              inputMode="numeric"
              maxLength={4}
              autoComplete="one-time-code"
              value={code}
              error={codeError || undefined}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              onKeyDown={(e) => e.key === 'Enter' && submitCode()}
              fieldClassName="w-40" />
            
              <Button className="mt-6" onClick={submitCode}>
                Confirm handover
              </Button>
            </div>
            <details className="text-caption text-fg-subtle">
              <summary className="cursor-pointer select-none font-medium text-fg-muted">Prototype: what the customer received</summary>
              <p className="mt-1">“Your {business} order #{d.orderNumber} is on the way. Give the rider this code: {d.code}. Don’t share it before you have your order.”</p>
            </details>
          </section>
        }

        {failing &&
        <section aria-labelledby="dl-fail" className="flex flex-col gap-4 rounded-md border border-line p-4">
            <h3 id="dl-fail" className="text-label font-semibold text-fg">
              What happened?
            </h3>
            <SelectInput<FailReason>
            id="dl-fail-reason"
            label="Reason"
            value={reason}
            onChange={setReason}
            options={(['unreachable', 'wrong_address', 'refused', 'other'] as FailReason[]).map((r) => ({ value: r, label: failLabels[r] }))} />
          
            <TextArea id="dl-fail-note" label="Note" optional rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Gate locked, no answer after 3 calls" />
          </section>
        }

        <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <Detail label="Customer" value={d.customerName} sub={d.customerPhone} />
          <Detail label="Deliver to" value={d.address || '—'} />
          <Detail label="Pickup" value={formatTimestamp(d.pickupAt)} sub={d.etaLabel} />
          <Detail label="Partner fee" value={d.feeNgn ? formatNgn(d.feeNgn) : 'None'} sub={d.feeNgn ? 'Settled with the partner (simulated)' : undefined} />
        </dl>

        {d.rider &&
        <section aria-labelledby="dl-rider" className="flex flex-col gap-3 border-t border-line pt-6">
            <h3 id="dl-rider" className="text-label font-semibold text-fg">
              Rider
            </h3>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>
                <span className="block text-label font-medium text-fg">{d.rider.name}</span>
                <span className="block text-caption text-fg-subtle">
                  {d.rider.vehicle} · {d.rider.phone}
                </span>
              </span>
              <span className="flex gap-2">
                <Button size="sm" variant="secondary" leadingIcon={PhoneIcon} onClick={() => window.open(`tel:${d.rider!.phone.replace(/\s/g, '')}`)}>
                  Call
                </Button>
                {d.customerPhone &&
              <Button size="sm" variant="secondary" leadingIcon={MessageCircleIcon} onClick={() => window.open(whatsappLink(d.customerPhone, `Hi ${d.customerName.split(' ')[0]}, your ${business} order #${d.orderNumber} is with ${d.rider!.name} (${d.rider!.phone}). Expected: ${d.etaLabel}.`), '_blank', 'noopener')}>
                    Update customer
                  </Button>
              }
              </span>
            </div>
          </section>
        }

        <section aria-labelledby="dl-timeline" className="flex flex-col gap-3 border-t border-line pt-6">
          <h3 id="dl-timeline" className="text-label font-semibold text-fg">
            Timeline
          </h3>
          <ol className="flex flex-col gap-3">
            {d.events.map((e) =>
            <li key={e.id} className="grid grid-cols-[8rem_minmax(0,1fr)] gap-3 text-caption">
                <span className="tabular-nums text-fg-subtle">{formatTimestamp(e.at)}</span>
                <span className="text-fg">{e.label}</span>
              </li>
            )}
          </ol>
        </section>
      </div>
    </Sheet>);

}

function Detail({ label, value, sub }: {label: string;value: string;sub?: string;}) {
  return (
    <div className="min-w-0">
      <dt className="text-caption text-fg-subtle">{label}</dt>
      <dd className="mt-0.5 text-label font-medium text-fg">{value}</dd>
      {sub && <dd className="text-caption text-fg-subtle">{sub}</dd>}
    </div>);

}