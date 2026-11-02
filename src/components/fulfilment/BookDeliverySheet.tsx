import React, { useEffect, useMemo, useState } from 'react';
import { BikeIcon, PrinterIcon, ShieldCheckIcon } from 'lucide-react';
import { useCommerce } from '../../contexts/CommerceContext';
import { activeCountry, countryInfo } from '../../utils/country';
import { DEFAULT_ITEM_KG, isCrossBorderMethod } from '../../utils/commerce/crossBorder';
import type { Order } from '../../types/commerce';
import { orderRef } from '../../utils/commerce/shopSettings';
import type { Rider } from '../../types/fulfilment';
import { quotesFor, type PartnerQuote } from '../../utils/fulfilment';
import { formatNgn } from '../../utils/format';
import { useT } from '../../contexts/LocaleContext';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { PhoneInput } from '../ui/PhoneInput';
import { phoneIssueIn } from '../../utils/phone';
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
  const { t: tr } = useT();
  // Cross-border orders (D436) go with the courier the buyer chose at checkout, with a customs declaration.
  const crossBorder = !!order?.fulfilment.zoneId && isCrossBorderMethod(order.fulfilment.zoneId);
  const quotes = useMemo<PartnerQuote[]>(
    () =>
    !order ?
    [] :
    crossBorder ?
    [{ partnerId: order.fulfilment.zoneId ?? 'intl', name: order.fulfilment.zoneName ?? 'International courier', tagline: 'Cross-border · tracked door to door (example courier)', feeNgn: order.deliveryNgn, eta: order.fulfilment.eta ?? '', available: true }] :
    quotesFor(order.fulfilment.address ?? ''),
    [order, crossBorder]
  );
  const { data: commerce } = useCommerce();
  const customs = useMemo(
    () =>
    crossBorder && order ?
    order.items.map((i) => {
      const p = commerce.products.find((x) => x.id === i.productId);
      return { name: i.name, qty: i.qty, value: i.unitPriceNgn * i.qty, description: p?.shipping?.customsDescription?.trim() ?? '', origin: p?.shipping?.originCountry ?? activeCountry(), kg: (p?.weightKg ?? DEFAULT_ITEM_KG) * i.qty };
    }) :
    [],
    [crossBorder, order, commerce.products]
  );
  const customsMissing = customs.filter((c) => !c.description);
  const printCustoms = () => {
    if (!order) return;
    const w = window.open('', '_blank', 'width=800,height=900');
    if (!w) return;
    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const rows = customs.map((c) => `<tr><td>${esc(c.description || c.name)}</td><td>${c.qty}</td><td>${c.kg.toFixed(1)} kg</td><td>${esc(countryInfo(c.origin).name)}</td><td class="r">${esc(formatNgn(c.value))}</td></tr>`).join('');
    w.document.write(`<!doctype html><html><head><title>Customs declaration ${esc(orderRef(order))}</title><style>body{font-family:Inter,Arial,sans-serif;margin:40px;color:#111}table{width:100%;border-collapse:collapse;margin-top:16px;font-size:13px}td,th{border:1px solid #ccc;padding:6px;text-align:left}.r{text-align:right}.m{color:#555;font-size:12px}</style></head><body><h1 style="font-size:20px">Customs declaration — order ${esc(orderRef(order))}</h1><p class="m">From ${esc(countryInfo(activeCountry()).name)} to ${esc(order.fulfilment.address ?? '')} · ${esc(order.fulfilment.zoneName ?? '')}</p><p class="m">Type: sale of goods</p><table><tr><th>Description</th><th>Qty</th><th>Weight</th><th>Made in</th><th class="r">Value</th></tr>${rows}</table><p class="m">Example form for the prototype — the courier supplies the real one.</p><script>window.onload=function(){setTimeout(function(){window.print()},200)}</script></body></html>`);
    w.document.close();
  };
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
  const riderError = chosen?.own && (!rider.name.trim() || !rider.phone.trim()) ? tr('Add your rider’s name and phone number.') : '';
  // Length is checked for the number's own country (D402), not a fixed 11 digits.
  const riderPhoneError = chosen?.own ? phoneIssueIn(tr, rider.phone) : null;
  const noAddress = !(order.fulfilment.address ?? '').trim();

  const submit = () => {
    setTried(true);
    if (!chosen || !chosen.available || riderError || riderPhoneError || noAddress) return;
    onBook(order, chosen, pickupAt, chosen.own ? { name: rider.name.trim(), phone: rider.phone.trim(), vehicle: rider.vehicle.trim() || 'Own rider' } : undefined);
  };

  return (
    <Sheet
      open
      onClose={onClose}
      side="right"
      size="lg"
      title={tr('Book delivery · order {ref}', { ref: orderRef(order) })}
      description={`${order.customer.name || tr('Customer')} · ${order.fulfilment.address || tr('No address')}`}
      footer={
      <div className="flex w-full items-center justify-between gap-3">
          <p className="text-caption text-fg-subtle">
            {order.pod && !order.pod.collected && <span className="block font-semibold text-fg">{tr('Rider collects {amount} at the door', { amount: formatNgn(order.pod.amountNgn) })}</span>}
            {chosen?.available ? chosen.feeNgn ? tr('{amount} partner fee', { amount: formatNgn(chosen.feeNgn) }) : tr('No partner fee') : ''}
          </p>
          <span className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              {tr('Cancel')}
            </Button>
            <Button leadingIcon={BikeIcon} onClick={submit} disabled={!chosen?.available || noAddress}>
              {crossBorder ? tr('Book courier') : tr('Book rider')}
            </Button>
          </span>
        </div>
      }>
      
      <div className="flex flex-col gap-6 p-5">
        <InlineAlert tone="info" title={tr('Simulated courier')}>
          {tr('Partner names, prices and riders are examples. No rider is booked and nothing is charged until a delivery partner is connected.')}
        </InlineAlert>
        {noAddress &&
        <InlineAlert tone="danger" title={tr('This order has no delivery address')}>
            {tr('Add it on the order first, or switch the order to pickup.')}
          </InlineAlert>
        }

        {crossBorder &&
        <section aria-labelledby="customs" className="flex flex-col gap-3 rounded-md border border-line p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 id="customs" className="text-label font-semibold text-fg">
                {tr('Customs declaration')}
              </h3>
              <Button size="sm" variant="secondary" leadingIcon={PrinterIcon} onClick={printCustoms}>
                {tr('Print customs form')}
              </Button>
            </div>
            <ul className="flex flex-col divide-y divide-line text-caption">
              {customs.map((c, i) =>
            <li key={`${c.name}-${i}`} className="flex flex-wrap justify-between gap-2 py-2">
                  <span className="text-fg">
                    {c.qty} × {c.description || <span className="text-danger">{tr('{name} — no customs description', { name: c.name })}</span>}
                  </span>
                  <span className="tabular-nums text-fg-muted">
                    {c.kg.toFixed(1)} kg · {tr(countryInfo(c.origin).name)} · {formatNgn(c.value)}
                  </span>
                </li>
            )}
            </ul>
            {customsMissing.length > 0 && <p className="text-caption text-warning">{tr('Add a customs description on each product so the parcel isn’t held at the border.')}</p>}
            <p className="text-caption text-fg-subtle">{tr('Tracking includes the customs steps. If the parcel is held at customs or sent back, mark it on the delivery.')}</p>
          </section>
        }

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-label font-semibold text-fg">{tr('Who delivers it')}</legend>
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
                <span className="block text-label font-semibold text-fg">{q.own ? tr(q.name) : q.name}</span>
                <span className="block text-caption text-fg-subtle">{tr(q.available ? q.tagline : q.note ?? '')}</span>
              </span>
              {q.available &&
            <span className="shrink-0 text-right">
                  <span className="block text-label font-semibold tabular-nums text-fg">{q.own ? '—' : formatNgn(q.feeNgn)}</span>
                  <span className="block text-caption text-fg-subtle">{tr(q.eta)}</span>
                </span>
            }
            </label>
          )}
        </fieldset>

        {chosen?.own &&
        <section aria-labelledby="own-rider" className="flex flex-col gap-4 border-t border-line pt-6">
            <h3 id="own-rider" className="text-label font-semibold text-fg">
              {tr('Your rider')}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput id="rider-name" label={tr('Name')} value={rider.name} onChange={(e) => setRider({ ...rider, name: e.target.value })} error={tried ? riderError || undefined : undefined} />
              <PhoneInput id="rider-phone" label={tr('Phone')} value={rider.phone} onChange={(phone) => setRider({ ...rider, phone })} error={tried ? riderPhoneError ?? undefined : undefined} />
            </div>
            <TextInput id="rider-vehicle" label={tr('Vehicle')} optional placeholder={tr('e.g. Bike · LSR 482 KJ')} value={rider.vehicle} onChange={(e) => setRider({ ...rider, vehicle: e.target.value })} />
          </section>
        }

        <section aria-labelledby="pickup" className="flex flex-col gap-4 border-t border-line pt-6">
          <h3 id="pickup" className="text-label font-semibold text-fg">
            {tr('Pickup')}
          </h3>
          <SelectInput id="pickup-at" label={tr('Rider collects from you')} value={pickupAt} options={slots} onChange={setPickupAt} hint={tr('Pickups run 8am–6pm.')} />
        </section>

        <section aria-labelledby="handover" className="flex gap-3 rounded-md bg-sunken p-4">
          <ShieldCheckIcon size={18} className="mt-0.5 shrink-0 text-fg-muted" aria-hidden />
          <div>
            <h3 id="handover" className="text-label font-semibold text-fg">
              {tr('Handover with a delivery code')}
            </h3>
            <p className="mt-1 text-caption text-fg-muted">
              {tr(escrow ?
              'The customer gets a 4-digit code by text. The rider only hands over the order when the customer reads it out, and a matching code releases the escrow payment to your wallet straight away.' :
              'The customer gets a 4-digit code by text. The rider only hands over the order when the customer reads it out.')}
            </p>
          </div>
        </section>
      </div>
    </Sheet>);

}