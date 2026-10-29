import React, { useEffect, useMemo, useState } from 'react';
import { BikeIcon, ShieldCheckIcon } from 'lucide-react';
import type { Order } from '../../types/commerce';
import { orderRef } from '../../utils/commerce/shopSettings';
import type { Rider } from '../../types/fulfilment';
import { quotesFor, type PartnerQuote } from '../../utils/fulfilment';
import { formatNgn } from '../../utils/format';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { SelectInput } from '../ui/SelectInput';
import { InlineAlert } from '../ui/InlineAlert';
import { cn } from '../../utils/cn';

interface BookDeliverySheetProps {
  order: Order | null;
  escrow: boolean;
  savedRiders: Rider[];
  onClose: () => void;
  onBook: (order: Order, quote: PartnerQuote, pickupAt: string, rider?: Rider) => void;
}

const pickupSlots = () => {
  const out: {value: string;label: string;}[] = [];
  const base = new Date();
  base.setMinutes(0, 0, 0);
  for (let h = 1; h <= 30 && out.length < 8; h++) {
    const d = new Date(base.getTime() + h * 3600000);
    if (d.getHours() < 8 || d.getHours() > 18) continue;
    out.push({ value: d.toISOString(), label: d.toLocaleString('en-NG', { weekday: 'short', hour: 'numeric', minute: '2-digit' }) });
  }
  return out;
};

/** Choose a courier (simulated quotes) or your own rider for one order (D96). */
export function BookDeliverySheet({ order, escrow, savedRiders, onClose, onBook }: BookDeliverySheetProps) {
  const quotes = useMemo(() => order ? quotesFor(order.fulfilment.address ?? '') : [], [order]);
  const slots = useMemo(pickupSlots, [order?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const [partnerId, setPartnerId] = useState('');
  const [pickupAt, setPickupAt] = useState('');
  const [rider, setRider] = useState<Rider>({ name: '', phone: '', vehicle: '' });
  const [tried, setTried] = useState(false);

  useEffect(() => {
    setPartnerId(quotes.find((q) => q.available && !q.own)?.partnerId ?? 'own');
    setPickupAt(slots[0]?.value ?? '');
    setRider(savedRiders[0] ?? { name: '', phone: '', vehicle: '' });
    setTried(false);
  }, [order?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!order) return <Sheet open={false} onClose={onClose} title="">{null}</Sheet>;
  const chosen = quotes.find((q) => q.partnerId === partnerId);
  const riderError = chosen?.own && (!rider.name.trim() || rider.phone.replace(/\D/g, '').length < 10) ? 'Add your rider’s name and an 11-digit phone number.' : '';
  const noAddress = !(order.fulfilment.address ?? '').trim();

  const submit = () => {
    setTried(true);
    if (!chosen || !chosen.available || riderError || noAddress) return;
    onBook(order, chosen, pickupAt, chosen.own ? { name: rider.name.trim(), phone: rider.phone.trim(), vehicle: rider.vehicle.trim() || 'Own rider' } : undefined);
  };

  return (
    <Sheet
      open
      onClose={onClose}
      side="right"
      size="lg"
      title={`Book delivery · order ${orderRef(order)}`}
      description={`${order.customer.name || 'Customer'} · ${order.fulfilment.address || 'No address'}`}
      footer={
      <div className="flex w-full items-center justify-between gap-3">
          <p className="text-caption text-fg-subtle">
            {order.pod && !order.pod.collected && <span className="block font-semibold text-fg">Rider collects {formatNgn(order.pod.amountNgn)} at the door</span>}
            {chosen?.available ? chosen.feeNgn ? `${formatNgn(chosen.feeNgn)} partner fee` : 'No partner fee' : ''}
          </p>
          <span className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button leadingIcon={BikeIcon} onClick={submit} disabled={!chosen?.available || noAddress}>
              Book rider
            </Button>
          </span>
        </div>
      }>
      
      <div className="flex flex-col gap-6 p-5">
        <InlineAlert tone="info" title="Simulated courier">
          Partner names, prices and riders are examples. No rider is booked and nothing is charged until a delivery partner is connected.
        </InlineAlert>
        {noAddress &&
        <InlineAlert tone="danger" title="This order has no delivery address">
            Add it on the order first, or switch the order to pickup.
          </InlineAlert>
        }

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-label font-semibold text-fg">Who delivers it</legend>
          {quotes.map((q) =>
          <label
            key={q.partnerId}
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-md border p-4 transition-colors duration-150',
              partnerId === q.partnerId ? 'border-action bg-action-soft/40' : 'border-line hover:bg-sunken',
              !q.available && 'cursor-not-allowed opacity-60 hover:bg-transparent'
            )}>
            
              <input type="radio" name="partner" value={q.partnerId} checked={partnerId === q.partnerId} disabled={!q.available} onChange={() => setPartnerId(q.partnerId)} className="mt-1 accent-[rgb(var(--action))]" />
              <span className="min-w-0 flex-1">
                <span className="block text-label font-semibold text-fg">{q.name}</span>
                <span className="block text-caption text-fg-subtle">{q.available ? q.tagline : q.note}</span>
              </span>
              {q.available &&
            <span className="shrink-0 text-right">
                  <span className="block text-label font-semibold tabular-nums text-fg">{q.own ? '—' : formatNgn(q.feeNgn)}</span>
                  <span className="block text-caption text-fg-subtle">{q.eta}</span>
                </span>
            }
            </label>
          )}
        </fieldset>

        {chosen?.own &&
        <section aria-labelledby="own-rider" className="flex flex-col gap-4 border-t border-line pt-6">
            <h3 id="own-rider" className="text-label font-semibold text-fg">
              Your rider
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput id="rider-name" label="Name" value={rider.name} onChange={(e) => setRider({ ...rider, name: e.target.value })} />
              <TextInput id="rider-phone" label="Phone" inputMode="tel" value={rider.phone} onChange={(e) => setRider({ ...rider, phone: e.target.value })} />
            </div>
            <TextInput id="rider-vehicle" label="Vehicle" optional placeholder="e.g. Bike · LSR 482 KJ" value={rider.vehicle} onChange={(e) => setRider({ ...rider, vehicle: e.target.value })} error={tried ? riderError || undefined : undefined} />
          </section>
        }

        <section aria-labelledby="pickup" className="flex flex-col gap-4 border-t border-line pt-6">
          <h3 id="pickup" className="text-label font-semibold text-fg">
            Pickup
          </h3>
          <SelectInput id="pickup-at" label="Rider collects from you" value={pickupAt} options={slots} onChange={setPickupAt} hint="Pickups run 8am–6pm." />
        </section>

        <section aria-labelledby="handover" className="flex gap-3 rounded-md bg-sunken p-4">
          <ShieldCheckIcon size={18} className="mt-0.5 shrink-0 text-fg-muted" aria-hidden />
          <div>
            <h3 id="handover" className="text-label font-semibold text-fg">
              Handover with a delivery code
            </h3>
            <p className="mt-1 text-caption text-fg-muted">
              The customer gets a 4-digit code by text. The rider only hands over the order when the customer reads it out
              {escrow ? ', and a matching code releases the escrow payment to your wallet straight away.' : '.'}
            </p>
          </div>
        </section>
      </div>
    </Sheet>);

}