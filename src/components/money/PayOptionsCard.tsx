import React from 'react';
import { BanknoteIcon, CalendarClockIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { PayOptions } from '../../types/commerce';
import { useCommerce } from '../../contexts/CommerceContext';
import { useCan } from '../../contexts/TeamContext';
import { usePlan } from '../../contexts/PlanContext';
import { planAtLeast } from '../../data/plans';
import { CHECKOUT_PLAN } from '../../utils/commerce/linkIssues';
import { INSTALMENT_MIN_NGN, acceptLabels, payOptionsOf } from '../../utils/commerce/payOptions';
import { formatNgn } from '../../utils/format';
import { Card } from '../ui/layout/Card';
import { Switch } from '../ui/Switch';
import { SelectInput } from '../ui/SelectInput';
import { Segmented } from '../ui/Segmented';
import { UpgradeButton } from '../ui/UpgradeButton';

const maxOptions = [20_000, 50_000, 100_000, 200_000, 500_000].map((n) => ({ value: String(n), label: `Up to ${formatNgn(n)}` }));

/** Commerce → Payments: extra ways buyers can pay at checkout (D112). */
export function PayOptionsCard() {
  const { data, apply } = useCommerce();
  const can = useCan('commerce.settings');
  const plan = usePlan();
  const allowed = planAtLeast(plan.id, CHECKOUT_PLAN);
  const o = payOptionsOf(data);
  const zones = data.fulfilment.zones;
  const productsWithParts = data.products.filter((p) => p.instalments && p.status === 'active').length;
  const refusals = data.orders.filter((x) => x.pod?.failed?.some((f) => f.reason === 'refused')).length;
  const locked = !allowed || !can.allowed;

  const set = (fn: (p: PayOptions) => PayOptions) => {
    if (!can.allowed) return toast.error(can.reason);
    apply((d) => ({ ...d, payOptions: fn(payOptionsOf(d)) }));
  };
  const setPod = (patch: Partial<PayOptions['pod']>) => set((p) => ({ ...p, pod: { ...p.pod, ...patch } }));
  const toggleZone = (id: string) =>
  setPod({ zoneIds: (() => {
      const current = o.pod.zoneIds ?? zones.map((z) => z.id);
      const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
      return next.length === zones.length ? null : next;
    })() });

  return (
    <Card title="Ways buyers can pay" description="On top of paying in full. Both are run by you — KUBICU doesn’t lend money or collect cash." body="flush">
      {!allowed &&
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5 md:px-6">
          <p className="text-label text-fg-muted">Pay on delivery and instalments are on Pro and above, with checkout.</p>
          <UpgradeButton plan={CHECKOUT_PLAN} feature="Pay on delivery and instalments" variant="secondary" />
        </div>
      }
      <div className="flex flex-col divide-y divide-line">
        <section aria-labelledby="pod-h" className="flex flex-col gap-4 px-5 py-5 md:px-6">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sunken text-fg-muted">
              <BanknoteIcon size={18} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <h3 id="pod-h" className="text-label font-semibold text-fg">
                Pay on delivery
              </h3>
              <p className="text-caption text-fg-muted">Many buyers only pay once they see it. Nothing is charged online; you or your rider collect at the door and mark it in Orders.</p>
            </div>
          </div>
          <Switch id="pod-on" label="Offer pay on delivery" description="Delivery orders with physical items only — not pickup, downloads, tickets, DealRooms or made-to-order deposits." checked={o.pod.enabled} disabled={locked} onChange={(v) => setPod({ enabled: v })} />
          {o.pod.enabled &&
          <div className="grid gap-4 border-l-2 border-line pl-4 md:grid-cols-2">
              <SelectInput id="pod-max" label="Largest order" value={String(o.pod.maxOrderNgn)} options={maxOptions} disabled={locked} onChange={(v) => setPod({ maxOrderNgn: Number(v) })} hint="Bigger orders pay online — limits how much a refused delivery can cost you." />
              <div className="flex flex-col gap-1.5">
                <span className="text-label font-medium text-fg">At the door</span>
                <Segmented<PayOptions['pod']['accept']>
                ariaLabel="How the customer pays at the door"
                fullWidth
                value={o.pod.accept}
                onChange={(v) => !locked && setPod({ accept: v })}
                options={(['cash', 'transfer', 'both'] as const).map((v) => ({ value: v, label: v === 'both' ? 'Both' : acceptLabels[v].replace(' at the door', '') }))} />
              
              </div>
              <fieldset className="md:col-span-2">
                <legend className="mb-1.5 text-label font-medium text-fg">Delivery areas</legend>
                {zones.length === 0 ?
              <p className="text-caption text-fg-subtle">Add delivery zones in Commerce → Settings first.</p> :

              <ul className="flex flex-wrap gap-x-5 gap-y-2">
                    {zones.map((z) =>
                <li key={z.id}>
                        <label className="flex min-h-[32px] cursor-pointer items-center gap-2 text-label text-fg">
                          <input type="checkbox" className="h-4 w-4" disabled={locked} checked={!o.pod.zoneIds || o.pod.zoneIds.includes(z.id)} onChange={() => toggleZone(z.id)} />
                          {z.name}
                        </label>
                      </li>
                )}
                  </ul>
              }
              </fieldset>
              <div className="md:col-span-2">
                <Switch
                id="pod-refusal"
                label="Ask repeat refusers to pay online"
                description={`A phone number that refused a pay-on-delivery order before has to pay online next time.${refusals ? ` ${refusals} refused order${refusals === 1 ? '' : 's'} so far.` : ''}`}
                checked={o.pod.blockAfterRefusal}
                disabled={locked}
                onChange={(v) => setPod({ blockAfterRefusal: v })} />
              
              </div>
              <p className="text-caption text-fg-subtle md:col-span-2">Cash and door transfers go to you directly, never through your wallet. KUBICU’s fee on these orders is added to your next plan invoice.</p>
            </div>
          }
        </section>

        <section aria-labelledby="inst-h" className="flex flex-col gap-4 px-5 py-5 md:px-6">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sunken text-fg-muted">
              <CalendarClockIcon size={18} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <h3 id="inst-h" className="text-label font-semibold text-fg">
                Instalments
              </h3>
              <p className="text-caption text-fg-muted">Buyers pay in 2–4 parts. The first part at checkout, the rest charged to the same card. No interest or fees — you carry the risk if a buyer stops paying.</p>
            </div>
          </div>
          <Switch id="inst-on" label="Offer instalments" description={`Orders of ${formatNgn(INSTALMENT_MIN_NGN)} or more, on products you switch it on for (Product → Stock & options).`} checked={o.instalments.enabled} disabled={locked} onChange={(v) => set((p) => ({ ...p, instalments: { enabled: v } }))} />
          {o.instalments.enabled &&
          <p className="border-l-2 border-line pl-4 text-caption text-fg-muted">
              {productsWithParts ? `${productsWithParts} active product${productsWithParts === 1 ? '' : 's'} can be paid in parts.` : 'No products can be paid in parts yet — switch it on in a product’s Stock & options.'} Failed charges retry on days 1, 3 and 5. Each part reaches your wallet like a sale when you use the wallet or escrow.
            </p>
          }
        </section>
      </div>
    </Card>);

}