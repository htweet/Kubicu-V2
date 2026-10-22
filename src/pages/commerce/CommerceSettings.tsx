import React, { useState } from 'react';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import type { FulfilmentSettings } from '../../types/commerce';
import { useCommerce } from '../../contexts/CommerceContext';
import { uid } from '../../utils/id';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import { Switch } from '../../components/ui/Switch';
import { TextInput } from '../../components/ui/TextInput';
import { CurrencyInput } from '../../components/ui/CurrencyInput';
import { Dialog } from '../../components/ui/Dialog';
import { useMediaQuery } from '../../hooks/useMediaQuery';

export function CommerceSettings() {
  const wide = useMediaQuery('(min-width: 768px)');
  const { data, apply, loadSample, clearSampleData, hasSample } = useCommerce();
  const [draft, setDraft] = useState<FulfilmentSettings>(data.fulfilment);
  const [tried, setTried] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(data.fulfilment);

  const patch = (p: Partial<FulfilmentSettings>) => setDraft((d) => ({ ...d, ...p }));
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
    if (apply((d) => ({ ...d, fulfilment: { ...draft, zones: draft.zones.map((z) => ({ ...z, name: z.name.trim() })) } }))) toast('Fulfilment settings saved', { description: 'Checkout uses them straight away.' });
  };

  return (
    <>
      <PageHeader
        title="Commerce settings"
        description="How orders reach your customers."
        actions={
        <Button onClick={save} disabled={!dirty}>
            Save changes
          </Button>
        } />
      

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-8">
          {tried && errors.none && <p className="rounded-md bg-danger-soft px-3 py-2.5 text-label text-danger">{errors.none}</p>}

          <section aria-labelledby="pickup-heading" className="rounded-lg border border-line bg-raised p-5">
            <h2 id="pickup-heading" className="sr-only">
              Pickup
            </h2>
            <Switch id="set-pickup" label="Customers can collect" description="Free for the customer. They see your address and hours at checkout." checked={draft.pickupEnabled} onChange={(pickupEnabled) => patch({ pickupEnabled })} />
            {draft.pickupEnabled &&
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <TextInput id="set-pickup-addr" label="Pickup address" value={draft.pickupAddress} error={tried ? errors.pickup || undefined : undefined} onChange={(e) => patch({ pickupAddress: e.target.value })} />
                <TextInput id="set-pickup-hours" label="Pickup hours" optional placeholder="e.g. Tue–Sat, 10am–6pm" value={draft.pickupHours} onChange={(e) => patch({ pickupHours: e.target.value })} />
              </div>
            }
          </section>

          <section aria-labelledby="delivery-heading" className="rounded-lg border border-line bg-raised p-5">
            <h2 id="delivery-heading" className="sr-only">
              Delivery
            </h2>
            <Switch id="set-delivery" label="Deliver to customers" description="Charge per zone. Customers pick their zone and see the fee before paying." checked={draft.deliveryEnabled} onChange={(deliveryEnabled) => patch({ deliveryEnabled })} />
            {draft.deliveryEnabled &&
            <div className="mt-5 flex flex-col gap-4">
                <div className="overflow-x-auto rounded-md border border-line">
                  <table className="block w-full text-left md:table">
                    <caption className="sr-only">Delivery zones</caption>
                    <thead className="hidden bg-sunken text-caption font-semibold text-fg-muted md:table-header-group">
                      <tr>
                        <th scope="col" className="px-3 py-2">Zone</th>
                        <th scope="col" className="px-3 py-2">Fee</th>
                        <th scope="col" className="px-3 py-2">Delivery time</th>
                        <th scope="col" className="px-3 py-2">
                          <span className="sr-only">Remove</span>
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
                            <IconButton icon={Trash2Icon} size={wide ? 'sm' : 'lg'} label={`Remove ${z.name || 'zone'}`} onClick={() => patch({ zones: draft.zones.filter((x) => x.id !== z.id) })} />
                          </td>
                        </tr>
                    )}
                    </tbody>
                  </table>
                  {draft.zones.length === 0 && <p className="px-3 py-4 text-label text-fg-muted">No zones yet.</p>}
                </div>
                {tried && errors.zones && <p className="text-caption text-danger">{errors.zones}</p>}
                <Button size="sm" variant="secondary" leadingIcon={PlusIcon} className="self-start" onClick={() => patch({ zones: [...draft.zones, { id: uid('zone'), name: '', feeNgn: 0, eta: '' }] })}>
                  Add zone
                </Button>
                <div className="max-w-xs">
                  <CurrencyInput id="set-free" label="Free delivery over" optional value={draft.freeDeliveryOverNgn} placeholder="No free delivery" hint="Based on the items subtotal." onChange={(freeDeliveryOverNgn) => patch({ freeDeliveryOverNgn })} />
                </div>
              </div>
            }
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <section aria-labelledby="sample-heading" className="rounded-lg border border-dashed border-line-strong p-5">
            <h2 id="sample-heading" className="text-label font-semibold text-fg">
              Sample data
            </h2>
            <p className="mt-1 text-label text-fg-muted">
              {hasSample ? 'Sample products and orders are labelled “Sample”. Clear them before you start selling.' : 'Add labelled sample products and orders to explore every screen.'}
            </p>
            <div className="mt-4">
              {hasSample ?
              <Button variant="destructive" size="sm" onClick={() => setConfirmClear(true)}>
                  Clear sample data
                </Button> :

              <Button variant="secondary" size="sm" onClick={loadSample}>
                  Add sample data
                </Button>
              }
            </div>
          </section>
          <section className="rounded-lg border border-line p-5">
            <h2 className="text-label font-semibold text-fg">Customer messages</h2>
            <p className="mt-1 text-label text-fg-muted">Order confirmations, shipping and refund notices are previewed but not sent in this prototype. Email and WhatsApp sending arrive with Automations.</p>
          </section>
        </aside>
      </div>

      <Dialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        size="sm"
        title="Clear all sample data?"
        description="Sample products, orders and stock history are removed. Anything you added yourself stays. Page blocks linked to sample products will show a warning."
        footer={
        <>
            <Button variant="secondary" onClick={() => setConfirmClear(false)} data-autofocus>
              Cancel
            </Button>
            <Button
            variant="destructive"
            onClick={() => {
              clearSampleData();
              setConfirmClear(false);
            }}>
            
              Clear sample data
            </Button>
          </>
        } />
      
    </>);

}