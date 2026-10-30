import React, { useMemo, useState } from 'react';
import { BikeIcon, PackageIcon, TruckIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { Order } from '../types/commerce';
import type { Delivery } from '../types/fulfilment';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useCan } from '../contexts/TeamContext';
import { useCommerce } from '../contexts/CommerceContext';
import { useFulfilment } from '../hooks/useFulfilment';
import { useMoney } from '../hooks/useMoney';
import { activeFor, assignRider, book, cancel, deliveryLabels, deliveryTones, enterCode, fail, isActive, pickedUp, readyOrders } from '../utils/fulfilment';
import { caseForOrder, isOpen, markDelivered, release } from '../utils/money/escrow';
import { setOrderStatus } from '../utils/commerce/ops';
import { collectPod } from '../utils/commerce/payOptions';
import { usePlan } from '../contexts/PlanContext';
import { useT } from '../contexts/LocaleContext';
import { formatNgn, formatTimestamp } from '../utils/format';
import { PageHeader } from '../components/shell/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs } from '../components/ui/Tabs';
import { EmptyState } from '../components/ui/EmptyState';
import { SampleTag } from '../components/commerce/StatusBadges';
import { BookDeliverySheet } from '../components/fulfilment/BookDeliverySheet';
import { DeliveryDetail } from '../components/fulfilment/DeliveryDetail';

type Tab = 'ready' | 'active' | 'done';

const rowCls = 'flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors duration-150 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus';

/** Local Fulfilment (D96): book riders for paid delivery orders and hand over with a code. Courier side simulated. */
export function Deliveries() {
  const { t: tr } = useT();
  const { current } = useWorkspace();
  const can = useCan('orders.manage');
  const commerce = useCommerce();
  const { data, update } = useFulfilment(current.id);
  const money = useMoney(current.id);
  const plan = usePlan();
  const [tab, setTab] = useState<Tab>('ready');
  const [booking, setBooking] = useState<Order | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const ready = useMemo(() => readyOrders(commerce.data.orders, data), [commerce.data.orders, data]);
  const active = data.deliveries.filter(isActive);
  const done = data.deliveries.filter((d) => !isActive(d));
  const failed = done.filter((d) => d.status === 'failed').length;
  const open = data.deliveries.find((d) => d.id === openId) ?? null;
  const today = new Date().toDateString();
  const deliveredToday = data.deliveries.filter((d) => d.status === 'delivered' && new Date(d.events[0]?.at ?? d.createdAt).toDateString() === today).length;

  const escrowHeld = (orderId: string) => {
    const c = caseForOrder(money.data, orderId);
    return !!c && isOpen(c) && (c.stage === 'held' || c.stage === 'delivered');
  };

  const onBook: React.ComponentProps<typeof BookDeliverySheet>['onBook'] = (o, q, pickupAt, rider) => {
    let created: Delivery | null = null;
    update((d) => {
      const r = book(d, o, q, pickupAt, escrowHeld(o.id), rider);
      created = r.delivery;
      return rider && !d.riders.some((x) => x.phone === rider.phone) ? { ...r.data, riders: [rider, ...r.data.riders].slice(0, 5) } : r.data;
    });
    if (o.status === 'paid' || o.status === 'new' && o.pod) commerce.apply((c) => setOrderStatus(c, o.id, 'packing', `Delivery booked with ${q.name}`));
    setBooking(null);
    setTab('active');
    if (created) setOpenId((created as Delivery).id);
    toast(tr('Delivery booked'), { description: tr('The customer has been texted their delivery code (simulated).') });
  };

  const onPickedUp = (d: Delivery) => {
    update((x) => pickedUp(x, d.id));
    commerce.apply((c) => setOrderStatus(c, d.orderId, 'out_for_delivery', `Collected by ${d.rider?.name ?? 'the rider'} (${d.partnerName})`));
  };

  const onCode = (d: Delivery, code: string): string | null => {
    let result: ReturnType<typeof enterCode> | null = null;
    update((x) => {
      result = enterCode(x, d.id, code);
      return result.data;
    });
    const r = result as ReturnType<typeof enterCode> | null;
    if (!r) return tr('Something went wrong. Try again.');
    if (!r.ok) {
      if (r.left <= 0) {
        commerce.apply((c) => setOrderStatus(c, d.orderId, 'packing', 'Handover stopped after 3 wrong delivery codes — back with the seller'));
        toast.error(tr('Handover stopped'), { description: tr('Too many wrong codes. The order comes back to you.') });
        return null;
      }
      return tr('That code doesn’t match. Tries left: {n}', { n: r.left });
    }
    let released = false;
    if (d.escrow) {
      money.update((m) => {
        const c = caseForOrder(m, d.orderId);
        if (!c || !isOpen(c) || c.stage !== 'held' && c.stage !== 'delivered') return m;
        released = true;
        const delivered = c.stage === 'held' ? markDelivered(m, c.id, { note: `Delivered by ${d.rider?.name ?? d.partnerName} · code matched`, proof: [] }, 'system') : m;
        return release(delivered, c.id, 'delivery_code', 'system');
      });
    }
    // Pay on delivery (D112): the rider collected at handover.
    const podOrder = commerce.data.orders.find((o) => o.id === d.orderId && o.pod && !o.pod.collected);
    if (podOrder?.pod) {
      const how = podOrder.pod.accept === 'transfer' ? 'transfer' : 'cash';
      commerce.apply((c) => collectPod(c, d.orderId, how, plan.id, `Delivered — code matched and ${formatNgn(podOrder.pod!.amountNgn)} collected by the rider (${d.partnerName})`));
    } else commerce.apply((c) => setOrderStatus(c, d.orderId, 'completed', `Delivered — customer’s code matched (${d.partnerName})`));
    toast.success(tr('Delivered'), { description: released ? tr('The escrow payment was released to your wallet.') : tr('The order is marked completed.') });
    return null;
  };

  return (
    <div className="mx-auto w-full max-w-[1100px] px-5 pb-16 pt-6 md:px-10 md:pt-8">
      <PageHeader title={tr('Deliveries')} context={current.name} description={tr('Book a rider for paid orders, follow them to the door, and hand over only when the customer reads out their code. Courier partners are simulated.')} />

      <section aria-label={tr('Summary')} className="mt-8 grid gap-6 border-b border-line pb-8 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <p className="text-label text-fg-muted">{tr('Ready to send')}</p>
          <p className="mt-1 font-display text-[2rem] font-semibold leading-tight tabular-nums text-fg">{ready.length}</p>
          <p className="mt-1 text-caption text-fg-subtle">{ready.length ? tr('Oldest paid {when}', { when: formatTimestamp(ready[0].createdAt) }) : tr('Every paid delivery order has a rider')}</p>
        </div>
        <div className="sm:border-l sm:border-line sm:pl-6">
          <p className="text-label text-fg-muted">{tr('On the way')}</p>
          <p className="mt-1 text-heading font-semibold tabular-nums text-fg">{active.length}</p>
          <p className="mt-1 text-caption text-fg-subtle">{tr('Delivered today: {n}', { n: deliveredToday })}</p>
        </div>
        <div className="sm:border-l sm:border-line sm:pl-6">
          <p className="text-label text-fg-muted">{tr('Failed')}</p>
          <p className="mt-1 text-heading font-semibold tabular-nums text-fg">{failed}</p>
          <p className="mt-1 text-caption text-fg-subtle">{failed ? tr('Book again from History') : tr('None')}</p>
        </div>
      </section>

      <Tabs<Tab>
        idPrefix="dlv"
        ariaLabel={tr('Deliveries')}
        value={tab}
        onChange={setTab}
        className="mt-6"
        items={[
        { id: 'ready', label: tr('Ready to send'), badge: ready.length || undefined },
        { id: 'active', label: tr('On the way'), badge: active.length || undefined },
        { id: 'done', label: tr('History') }]
        } />
      

      <div role="tabpanel" id={`dlv-panel-${tab}`} aria-labelledby={`dlv-tab-${tab}`} className="mt-4">
        {tab === 'ready' && (
        ready.length === 0 ?
        <EmptyState icon={PackageIcon} title={tr('Nothing waiting')} description={tr('Paid orders with home delivery show here. Pickup and download orders don’t need a rider, and made-to-order items appear once the balance is paid.')} /> :

        <ul className="divide-y divide-line rounded-lg border border-line bg-raised">
              {ready.map((o) =>
          <li key={o.id} className="flex flex-wrap items-center gap-4 px-4 py-3.5">
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-label font-semibold text-fg">#{o.number} · {o.customer.name || tr('Customer')}</span>
                      {escrowHeld(o.id) && <Badge tone="info">{tr('Escrow')}</Badge>}
                      {o.sample && <SampleTag />}
                    </span>
                    <span className="mt-0.5 block truncate text-caption text-fg-muted">
                      {o.fulfilment.address || tr('No address')} · {tr('Items: {n}', { n: o.items.reduce((s, i) => s + i.qty, 0) })}
                    </span>
                  </span>
                  <Button size="sm" leadingIcon={BikeIcon} disabled={!can.allowed} title={can.allowed ? undefined : can.reason} onClick={() => setBooking(o)}>
                    {tr('Book rider')}
                  </Button>
                </li>
          )}
            </ul>)
        }

        {tab !== 'ready' && (
        (tab === 'active' ? active : done).length === 0 ?
        <EmptyState icon={TruckIcon} title={tab === 'active' ? tr('No deliveries on the way') : tr('No past deliveries yet')} description={tab === 'active' ? tr('Book a rider from Ready to send.') : tr('Delivered, failed and cancelled deliveries are kept here.')} /> :

        <ul className="divide-y divide-line rounded-lg border border-line bg-raised">
              {(tab === 'active' ? active : done).map((d) =>
          <li key={d.id}>
                  <button type="button" onClick={() => setOpenId(d.id)} className={rowCls}>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-label font-semibold text-fg">#{d.orderNumber} · {d.customerName}</span>
                        {d.escrow && <Badge tone="info">{tr('Escrow')}</Badge>}
                      </span>
                      <span className="mt-0.5 block truncate text-caption text-fg-muted">
                        {d.partnerName}
                        {d.rider ? ` · ${d.rider.name}` : ''} · {d.etaLabel}
                      </span>
                    </span>
                    <span className="hidden text-right text-label tabular-nums text-fg-muted sm:block">{d.feeNgn ? formatNgn(d.feeNgn) : '—'}</span>
                    <Badge tone={deliveryTones[d.status]} dot>
                      {tr(deliveryLabels[d.status])}
                    </Badge>
                  </button>
                </li>
          )}
            </ul>)
        }
      </div>

      <BookDeliverySheet order={booking} escrow={booking ? escrowHeld(booking.id) : false} savedRiders={data.riders} onClose={() => setBooking(null)} onBook={onBook} />
      <DeliveryDetail
        delivery={open}
        canEdit={can.allowed}
        business={current.name}
        onClose={() => setOpenId(null)}
        onAssign={(d) => update((x) => assignRider(x, d.id))}
        onPickedUp={onPickedUp}
        onCode={onCode}
        onFail={(d, reason, note) => {
          update((x) => fail(x, d.id, reason, note));
          commerce.apply((c) => setOrderStatus(c, d.orderId, 'packing', `Delivery failed — back with the seller`));
        }}
        onCancel={(d) => {
          update((x) => cancel(x, d.id));
          toast(tr('Booking cancelled'), { description: tr('No fee is charged before pickup.') });
        }}
        onRebook={(d) => {
          const o = commerce.data.orders.find((x) => x.id === d.orderId);
          if (!o || activeFor(data, o.id)) return;
          setOpenId(null);
          setBooking(o);
        }} />
      
    </div>);

}