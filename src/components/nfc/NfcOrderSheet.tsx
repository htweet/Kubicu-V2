import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { NfcDestination, NfcKind } from '../../types/nfc';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useTeam } from '../../contexts/TeamContext';
import { useT } from '../../contexts/LocaleContext';
import { useMainLink } from '../../hooks/useMainLink';
import { useNfcTags } from '../../hooks/useNfcTags';
import { NFC_MAX_ORDER, nfcKinds, nfcPrices, orderTags } from '../../utils/nfc';
import { formatMoney } from '../../utils/currency';
import { activeCountry, countryInfo } from '../../utils/country';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { PhoneInput } from '../ui/PhoneInput';
import { NfcDestinationFields, destinationValid } from './NfcDestinationFields';
import { cn } from '../../utils/cn';

/** Order NFC tags (D442). Delivered within the workspace's own country, priced in its money (D471); paid by test card. Prices are examples. */
export function NfcOrderSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t: tr } = useT();
  const { current } = useWorkspace();
  const team = useTeam();
  const { mainHandle } = useMainLink();
  const { update } = useNfcTags(current.id);
  const [kind, setKind] = useState<NfcKind>('sticker');
  const [qty, setQty] = useState('10');
  const [dest, setDest] = useState<NfcDestination>({ type: 'page' });
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [tried, setTried] = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!open) return;
    setKind('sticker');
    setQty('10');
    setDest({ type: 'page' });
    setAddress('');
    setPhone('');
    setTried(false);
    setPaying(false);
  }, [open]);

  const country = activeCountry();
  const prices = nfcPrices(country);
  const money = (v: number) => formatMoney(v, prices.currency);
  const n = Number(qty);
  const subtotal = (n || 0) * prices.unit[kind];
  const total = subtotal + prices.delivery;
  const errs = {
    qty: Number.isInteger(n) && n >= 1 && n <= NFC_MAX_ORDER ? undefined : tr('Between 1 and {max}', { max: NFC_MAX_ORDER }),
    address: address.trim().length < 8 ? tr('Add the street address, area and state') : undefined,
    phone: phone.replace(/\D/g, '').length < 10 ? tr('So the rider can reach you') : undefined,
  };

  const pay = () => {
    setTried(true);
    if (Object.values(errs).some(Boolean) || !destinationValid(dest) || !mainHandle) return;
    setPaying(true);
    window.setTimeout(() => {
      const { tags, ref } = orderTags(current.id, mainHandle, kind, n, dest);
      if (update((list) => [...tags, ...list])) {
        team.log('settings', `ordered ${n} NFC ${nfcKinds[kind].label.toLowerCase()} (${ref})`, '/app/nfc');
        toast.success(tr('Order {ref} placed', { ref }), { description: tr('{total} paid (test mode). Your tags are ready to point now and arrive in about 5 days.', { total: money(total) }) });
        onClose();
      } else setPaying(false);
    }, 900);
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      side="right"
      size="lg"
      bodyClassName="px-5 py-6"
      title={tr('Order NFC tags')}
      description={tr('Customers tap their phone on the tag to open your page — no app or camera needed. Change where each tag points any time.')}
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <p className="text-label text-fg">
            <span className="text-fg-muted">{tr('Total')}</span> <strong className="tabular-nums">{money(total)}</strong>
          </p>
          <Button onClick={pay} loading={paying}>
            {tr('Pay with test card')}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-label font-semibold text-fg">{tr('Type')}</legend>
          {(Object.keys(nfcKinds) as NfcKind[]).map((k) => (
            <label key={k} className={cn('flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 transition-colors duration-150 focus-within:ring-2 focus-within:ring-focus', kind === k ? 'border-action bg-action-soft' : 'border-line hover:bg-sunken')}>
              <input type="radio" name="nfc-kind" checked={kind === k} onChange={() => setKind(k)} className="h-4 w-4 shrink-0 accent-[rgb(var(--action))] focus:outline-none" />
              <span className="min-w-0 flex-1">
                <span className="block text-label font-medium text-fg">{tr(nfcKinds[k].label)}</span>
                <span className="block text-caption text-fg-muted">{tr(nfcKinds[k].detail)}</span>
              </span>
              <span className="shrink-0 text-right text-label tabular-nums text-fg">{tr('{price} each', { price: money(prices.unit[k]) })}</span>
            </label>
          ))}
        </fieldset>
        <div className="w-full sm:max-w-[10rem]">
          <TextInput id="nfc-qty" label={tr('How many')} inputMode="numeric" value={qty} error={tried ? errs.qty : undefined} onChange={(e) => setQty(e.target.value.replace(/\D/g, '').slice(0, 2))} />
        </div>
        <div className="border-t border-line pt-6">
          <NfcDestinationFields id="nfc-order" value={dest} onChange={setDest} tried={tried} />
          <p className="mt-2 text-caption text-fg-subtle">{tr('All tags in this order start here. You can point each one somewhere else later.')}</p>
        </div>
        <fieldset className="flex flex-col gap-4 border-t border-line pt-6">
          <legend className="float-left mb-4 w-full text-label font-semibold text-fg">{tr('Deliver to')}</legend>
          <TextInput id="nfc-address" label={tr('Address in {country}', { country: tr(countryInfo(country).name) })} value={address} error={tried ? errs.address : undefined} onChange={(e) => setAddress(e.target.value)} />
          <PhoneInput id="nfc-phone" label={tr('Phone')} value={phone} error={tried ? errs.phone : undefined} onChange={setPhone} />
        </fieldset>
        <dl className="flex flex-col gap-1.5 rounded-md bg-sunken px-4 py-3 text-label">
          <div className="flex justify-between gap-3">
            <dt className="text-fg-muted">
              {tr(nfcKinds[kind].label)} × {n || 0}
            </dt>
            <dd className="tabular-nums text-fg">{money(subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-fg-muted">{tr('Delivery (about 5 days)')}</dt>
            <dd className="tabular-nums text-fg">{money(prices.delivery)}</dd>
          </div>
        </dl>
        <p className="text-caption text-fg-subtle">{tr('Prices are examples. Works with most phones from the last few years — iPhones tap from the lock screen, and Android needs NFC switched on.')}</p>
      </div>
    </Sheet>
  );
}
