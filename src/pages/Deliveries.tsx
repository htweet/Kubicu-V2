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
  const { current } = useWorkspace();
  const can = useCan('orders.manage');
  const commerce = useCommerce();
  const { data, update } = useFulfilment(current.id);
  const money = useMoney(current.id);
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
    if (o.status === 'paid') commerce.apply((c) => setOrderStatus(c, o.id, 'packing', `Delivery booked with ${q.name}`));
    setBooking(null);
    setTab('active');
    if (created) setOpenId((created as Delivery).id);
    toast('Delivery booked', { description: 'The customer has been texted their delivery code (simulated).' });
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
    if (!r) return 'Something went wrong. Try again.';
    if (!r.ok) {
      if (r.left <= 0) {
        commerce.apply((c) => setOrderStatus(c, d.orderId, 'packing', 'Handover stopped after 3 wrong delivery codes — back with the seller'));
        toast.error('Handover stopped', { description: 'Too many wrong codes. The order comes back to you.' });
        return null;
      }
      return `That code doesn’t match. ${r.left} ${r.left === 1 ? 'try' : 'tries'} left.`;
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
    commerce.apply((c) => setOrderStatus(c, d.orderId, 'completed', `Delivered — customer’s code matched (${d.partnerName})`));
    toast.success('Delivered', { description: released ? 'The escrow payment was released to your wallet.' : 'The order is marked completed.' });
    return null;
  };

  return (
    <div className="mx-auto w-full max-w-[1100px] px-5 pb-16 pt-6 md:px-10 md:pt-8">
      <PageHeader title="Deliveries" context={current.name} description="Book a rider for paid orders, follow them to the door, and hand over only when the customer reads out their code. Courier partners are simulated." />

      <section aria-label="Summary" className="mt-8 grid gap-6 border-b border-line pb-8 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <p className="text-label text-fg-muted">Ready to send</p>
          <p className="mt-1 font-display text-[2rem] font-semibold leading-tight tabular-nums text-fg">{ready.length}</p>
          <p className="mt-1 text-caption text-fg-subtle">{ready.length ? `Oldest paid ${formatTimestamp(ready[0].createdAt)}` : 'Every paid delivery order has a rider'}</p>
        </div>
        <div className="sm:border-l sm:border-line sm:pl-6">
          <p className="text-label text-fg-muted">On the way</p>
          <p className="mt-1 text-heading font-semibold tabular-nums text-fg">{active.length}</p>
          <p className="mt-1 text-caption text-fg-subtle">{deliveredToday} delivered today</p>
        </div>
        <div className="sm:border-l sm:border-line sm:pl-6">
          <p className="text-label text-fg-muted">Failed</p>
          <p className="mt-1 text-heading font-semibold tabular-nums text-fg">{failed}</p>
          <p className="mt-1 text-caption text-fg-subtle">{failed ? 'Book again from History' : 'None'}</p>
        </div>
      </section>

      <Tabs<Tab>
        idPrefix="dlv"
        ariaLabel="Deliveries"
        value={tab}
        onChange={setTab}
        className="mt-6"
        items={[
        { id: 'ready', label: 'Ready to send', badge: ready.length || undefined },
        { id: 'active', label: 'On the way', badge: active.length || undefined },
        { id: 'done', label: 'History' }]
        } />
      

      <div role="tabpanel" id={`dlv-panel-${tab}`} aria-labelledby={`dlv-tab-${tab}`} className="mt-4">
        {tab === 'ready' && (
        ready.length === 0 ?
        <EmptyState icon={PackageIcon} title="Nothing waiting" description="Paid orders with home delivery show here. Pickup and download orders don’t need a rider, and made-to-order items appear once the balance is paid." /> :

        <ul className="divide-y divide-line rounded-lg border border-line bg-raised">
              {ready.map((o) =>
          <li key={o.id} className="flex flex-wrap items-center gap-4 px-4 py-3.5">
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-label font-semibold text-fg">#{o.number} · {o.customer.name || 'Customer'}</span>
                      {escrowHeld(o.id) && <Badge tone="info">Escrow</Badge>}
                      {o.sample && <SampleTag />}
                    </span>
                    <span className="mt-0.5 block truncate text-caption text-fg-muted">
                      {o.fulfilment.address || 'No address'} · {o.items.reduce((s, i) => s + i.qty, 0)} item{o.items.reduce((s, i) => s + i.qty, 0) === 1 ? '' : 's'}
                    </span>
                  </span>
                  <Button size="sm" leadingIcon={BikeIcon} disabled={!can.allowed} title={can.allowed ? undefined : can.reason} onClick={() => setBooking(o)}>
                    Book rider
                  </Button>
                </li>
          )}
            </ul>)
        }

        {tab !== 'ready' && (
        (tab === 'active' ? active : done).length === 0 ?
        <EmptyState icon={TruckIcon} title={tab === 'active' ? 'No deliveries on the way' : 'No past deliveries yet'} description={tab === 'active' ? 'Book a rider from Ready to send.' : 'Delivered, failed and cancelled deliveries are kept here.'} /> :

        <ul className="divide-y divide-line rounded-lg border border-line bg-raised">
              {(tab === 'active' ? active : done).map((d) =>
          <li key={d.id}>
                  <button type="button" onClick={() => setOpenId(d.id)} className={rowCls}>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-label font-semibold text-fg">#{d.orderNumber} · {d.customerName}</span>
                        {d.escrow && <Badge tone="info">Escrow</Badge>}
                      </span>
                      <span className="mt-0.5 block truncate text-caption text-fg-muted">
                        {d.partnerName}
                        {d.rider ? ` · ${d.rider.name}` : ''} · {d.etaLabel}
                      </span>
                    </span>
                    <span className="hidden text-right text-label tabular-nums text-fg-muted sm:block">{d.feeNgn ? formatNgn(d.feeNgn) : '—'}</span>
                    <Badge tone={deliveryTones[d.status]} dot>
                      {deliveryLabels[d.status]}
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
          toast('Booking cancelled', { description: 'No fee is charged before pickup.' });
        }}
        onRebook={(d) => {
          const o = commerce.data.orders.find((x) => x.id === d.orderId);
          if (!o || activeFor(data, o.id)) return;
          setOpenId(null);
          setBooking(o);
        }} />
      
    </div>);

}