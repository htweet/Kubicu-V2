import React, { useEffect, useState } from 'react';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import type { FulfilmentSettings, ShopSettings } from '../../../types/commerce';
import { useCommerce } from '../../../contexts/CommerceContext';
import { uid } from '../../../utils/id';
import { Button } from '../../ui/Button';
import { IconButton } from '../../ui/IconButton';
import { Switch } from '../../ui/Switch';
import { TextInput } from '../../ui/TextInput';
import { CurrencyInput } from '../../ui/CurrencyInput';
import { Field } from '../../ui/Field';
import { Segmented } from '../../ui/Segmented';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { useT } from '../../../contexts/LocaleContext';
import { hoursSummary, shopSettingsOf } from '../../../utils/commerce/shopSettings';
import { SettingsSection } from './SettingsSection';
import { countries } from '../../../data/countries';
import { activeCountry } from '../../../utils/country';

/** Pickup, delivery zones and free delivery (unchanged from before D222), plus the weight unit. */
export function DeliveryPickupSection() {
  const wide = useMediaQuery('(min-width: 768px)');
  const { t: tr } = useT();
  const { data, apply } = useCommerce();
  const savedUnit = shopSettingsOf(data).weightUnit;
  // One place for hours (D226): when opening hours are set, pickup uses them instead of its own text.
  const openingHours = hoursSummary(shopSettingsOf(data).status.hours);
  const [draft, setDraft] = useState<FulfilmentSettings>(data.fulfilment);
  const [unit, setUnit] = useState<ShopSettings['weightUnit']>(savedUnit);
  const [tried, setTried] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(data.fulfilment) || unit !== savedUnit;

  useEffect(() => {
    if (!justSaved) return;
    const t = window.setTimeout(() => setJustSaved(false), 2400);
    return () => window.clearTimeout(t);
  }, [justSaved]);

  const patch = (p: Partial<FulfilmentSettings>) => {
    setJustSaved(false);
    setDraft((d) => ({ ...d, ...p }));
  };
  const zoneErrors = draft.deliveryEnabled ? draft.zones.map((z) => !z.name.trim() ? 'Name the zone' : '') : [];
  const errors = {
    pickup: draft.pickupEnabled && !draft.pickupAddress.trim() ? 'Add where customers collect from' : '',
    zones: draft.deliveryEnabled && draft.zones.length === 0 ? 'Add at least one delivery zone' : '',
    none: !draft.pickupEnabled && !draft.deliveryEnabled ? 'Turn on pickup or delivery so physical orders can be fulfilled' : ''
  };
  const hasErrors = Object.values(errors).some(Boolean) || zoneErrors.some(Boolean);

  const save = () => {
    setTried(true);
    if (hasErrors) return;
    const ok = apply((d) => ({ ...d, fulfilment: { ...draft, zones: draft.zones.map((z) => ({ ...z, name: z.name.trim() })) }, shop: { ...d.shop, weightUnit: unit } }));
    if (ok) {
      setJustSaved(true);
      toast(tr('Delivery and pickup saved'), { description: tr('Checkout uses them straight away.') });
    }
  };

  return (
    <SettingsSection
      id="delivery"
      title="Delivery & pickup"
      description="Checkout offers whichever of these you turn on."
      dirty={dirty}
      justSaved={justSaved}
      onSave={save}
      onReset={() => {
        setDraft(data.fulfilment);
        setUnit(savedUnit);
        setTried(false);
      }}>
      
      {tried && errors.none && <p className="rounded-md bg-danger-soft px-3 py-2.5 text-label text-danger">{tr(errors.none)}</p>}
      <section aria-labelledby="pickup-heading">
        <h3 id="pickup-heading" className="sr-only">
          {tr('Pickup')}
        </h3>
        <Switch id="set-pickup" label="Customers can collect" description="Free for the customer. They see your address and opening hours at checkout." checked={draft.pickupEnabled} onChange={(pickupEnabled) => patch({ pickupEnabled })} />
        {draft.pickupEnabled &&
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <TextInput id="set-pickup-addr" label="Pickup address" value={draft.pickupAddress} error={tried ? errors.pickup || undefined : undefined} onChange={(e) => patch({ pickupAddress: e.target.value })} />
            {openingHours ?
          <div>
                <p className="text-label font-medium text-fg">Pickup hours</p>
                <p className="mt-1 text-caption text-fg-muted">
                  Your opening hours: {openingHours}.{' '}
                  <a href="#status" className="font-medium text-action hover:underline">
                    Change in Store status
                  </a>
                </p>
              </div> :

          <TextInput id="set-pickup-hours" label="Pickup hours" optional placeholder="e.g. Tue–Sat, 10am–6pm" value={draft.pickupHours} hint="Or set opening hours under Store status — they’re used here too." onChange={(e) => patch({ pickupHours: e.target.value })} />
          }
          </div>
        }
      </section>

      <section aria-labelledby="delivery-heading" className="border-t border-line pt-5">
        <h3 id="delivery-heading" className="sr-only">
          {tr('Delivery')}
        </h3>
        <Switch id="set-delivery" label="Deliver to customers" description="Charge per zone. Customers pick their zone and see the fee before paying." checked={draft.deliveryEnabled} onChange={(deliveryEnabled) => patch({ deliveryEnabled })} />
        {draft.deliveryEnabled &&
        <div className="mt-5 flex flex-col gap-4">
            <div className="overflow-x-auto rounded-md border border-line">
              <table className="block w-full text-left md:table">
                <caption className="sr-only">{tr('Delivery zones')}</caption>
                <thead className="hidden bg-sunken text-caption font-semibold text-fg-muted md:table-header-group">
                  <tr>
                    <th scope="col" className="px-3 py-2">{tr('Zone')}</th>
                    <th scope="col" className="px-3 py-2">{tr('Fee')}</th>
                    <th scope="col" className="px-3 py-2">{tr('Delivery time')}</th>
                    <th scope="col" className="px-3 py-2">
                      <span className="sr-only">{tr('Remove')}</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="block divide-y divide-line md:table-row-group md:divide-y-0">
                  {draft.zones.map((z, i) =>
                // Phones: each zone stacks as a small form with visible labels.
                <tr key={z.id} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2 p-3 align-top md:table-row md:border-t md:border-line md:p-0">
                      <td className="col-span-3 block md:table-cell md:px-3 md:py-2">
                        <TextInput id={`zone-n-${z.id}`} label="Zone name" className="h-11 md:h-9" fieldClassName="md:[&>div:first-child]:sr-only" value={z.name} error={tried ? zoneErrors[i] || undefined : undefined} placeholder="e.g. Lagos Mainland" onChange={(e) => patch({ zones: draft.zones.map((x) => x.id === z.id ? { ...x, name: e.target.value } : x) })} />
                      </td>
                      <td className="block md:table-cell md:w-36 md:px-3 md:py-2 md:[&>div>div:first-child]:sr-only">
                        <CurrencyInput id={`zone-f-${z.id}`} label="Fee" value={z.feeNgn} onChange={(v) => patch({ zones: draft.zones.map((x) => x.id === z.id ? { ...x, feeNgn: v ?? 0 } : x) })} />
                      </td>
                      <td className="block md:table-cell md:w-40 md:px-3 md:py-2">
                        <TextInput id={`zone-e-${z.id}`} label="Delivery time" className="h-11 md:h-9" fieldClassName="md:[&>div:first-child]:sr-only" placeholder="e.g. 1–2 days" value={z.eta} onChange={(e) => patch({ zones: draft.zones.map((x) => x.id === z.id ? { ...x, eta: e.target.value } : x) })} />
                      </td>
                      <td className="block pb-0.5 md:table-cell md:px-2 md:py-2">
                        <IconButton icon={Trash2Icon} size={wide ? 'sm' : 'lg'} label={tr('Remove {name}', { name: z.name || tr('zone') })} onClick={() => patch({ zones: draft.zones.filter((x) => x.id !== z.id) })} />
                      </td>
                    </tr>
                )}
                </tbody>
              </table>
              {draft.zones.length === 0 && <p className="px-3 py-4 text-label text-fg-muted">{tr('No zones yet.')}</p>}
            </div>
            {tried && errors.zones && <p className="text-caption text-danger">{tr(errors.zones)}</p>}
            <Button size="sm" variant="secondary" leadingIcon={PlusIcon} className="self-start" onClick={() => patch({ zones: [...draft.zones, { id: uid('zone'), name: '', feeNgn: 0, eta: '' }] })}>
              Add zone
            </Button>
            <div className="max-w-xs">
              <CurrencyInput id="set-free" label="Free delivery over" optional value={draft.freeDeliveryOverNgn} placeholder="No free delivery" hint="Based on the items subtotal." onChange={(freeDeliveryOverNgn) => patch({ freeDeliveryOverNgn })} />
            </div>
            {/* Cross-border delivery (D436). */}
            <fieldset className="flex flex-col gap-2 border-t border-line pt-4">
              <legend className="text-label font-semibold text-fg">{tr('Ship abroad')}</legend>
              <p className="text-caption text-fg-muted">{tr('Buyers in these countries can order with courier delivery. Fees are worked out from the parcel’s weight, and buyers are told they may pay import duties. Example courier rates.')}</p>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {countries.
              filter((c) => c.code !== activeCountry()).
              map((c) => {
                const on = (draft.international?.countries ?? []).includes(c.code);
                return (
                  <label key={c.code} className="flex min-h-[44px] cursor-pointer items-center gap-2 text-label text-fg">
                        <input
                      type="checkbox"
                      className="h-4 w-4 accent-[rgb(var(--action))]"
                      checked={on}
                      onChange={(e) => {
                        const list = draft.international?.countries ?? [];
                        patch({ international: { countries: e.target.checked ? [...list, c.code] : list.filter((x) => x !== c.code) } });
                      }} />
                    
                        {tr(c.name)}
                      </label>);

              })}
              </div>
              {(draft.international?.countries.length ?? 0) > 0 && <p className="text-caption text-fg-subtle">{tr('Add a weight, customs description and where it’s made on each product you’ll send abroad. Tax for these buyers follows Commerce settings → Tax.')}</p>}
            </fieldset>
          </div>
        }
      </section>

      <div className="max-w-xs border-t border-line pt-5">
        <Field id="set-weight" label="Weight unit" hint="Used for product weights and, later, delivery pricing by weight.">
          <Segmented
            ariaLabel="Weight unit"
            fullWidth
            value={unit}
            onChange={(u) => {
              setJustSaved(false);
              setUnit(u);
            }}
            options={[
            { value: 'kg', label: 'Kilograms (kg)' },
            { value: 'g', label: 'Grams (g)' }]
            } />
          
        </Field>
      </div>
    </SettingsSection>);

}