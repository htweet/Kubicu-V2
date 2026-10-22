import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DownloadIcon, ReceiptIcon } from 'lucide-react';
import type { Order, OrderStatus } from '../../types/commerce';
import { useCommerce } from '../../contexts/CommerceContext';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { DataTable, type DataColumn } from '../../components/ui/DataTable';
import { EmptyState } from '../../components/ui/EmptyState';
import { TestModeStrip } from '../../components/commerce/TestModeStrip';
import { OrderDetail } from '../../components/commerce/OrderDetail';
import { OrderStatusBadge, PaymentBadge, SampleTag } from '../../components/commerce/StatusBadges';
import { orderStatusLabels } from '../../data/commerceNav';
import { orderMoney } from '../../utils/commerce/money';
import { downloadCsv, toCsv } from '../../utils/csv';
import { formatNgn, formatRelative } from '../../utils/format';
import { cn } from '../../utils/cn';

type Tab = 'all' | OrderStatus;
const tabs: Tab[] = ['all', 'new', 'paid', 'packing', 'out_for_delivery', 'completed', 'cancelled', 'refunded'];

export function Orders() {
  const { data } = useCommerce();
  const [params, setParams] = useSearchParams();
  const tab = params.get('status') as Tab || 'all';
  const openId = params.get('order');

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: data.orders.length };
    data.orders.forEach((o) => c[o.status] = (c[o.status] ?? 0) + 1);
    return c;
  }, [data.orders]);

  const rows = tab === 'all' ? data.orders : data.orders.filter((o) => o.status === tab);
  const set = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => v === null ? next.delete(k) : next.set(k, v));
    setParams(next);
  };

  const exportCsv = () => {
    const csv = toCsv(
      ['order', 'date', 'customer', 'phone', 'email', 'items', 'status', 'payment', 'subtotal', 'delivery', 'customer_paid', 'provider_fee', 'kubicu_fee', 'refunded', 'you_receive', 'sample'],
      rows.map((o) => {
        const m = orderMoney(o);
        return [o.number, o.createdAt, o.customer.name, o.customer.phone, o.customer.email, o.items.map((i) => `${i.qty}x ${i.name}${i.variantLabel ? ` (${i.variantLabel})` : ''}`).join('; '), o.status, o.paymentStatus, m.subtotal, m.delivery, m.gross, m.providerFee, m.kubicuFee, m.refunded, m.net, o.sample ? 'yes' : ''];
      })
    );
    downloadCsv(`kubicu-orders-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const columns: DataColumn<Order>[] = [
  {
    key: 'number',
    header: 'Order',
    sortValue: (o) => o.number,
    render: (o) =>
    <button type="button" onClick={() => set({ order: o.id })} className="group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          <span className="flex items-center gap-2">
            <span className="font-mono font-semibold text-fg group-hover:underline">#{o.number}</span>
            {o.sample && <SampleTag />}
          </span>
          <span className="block text-caption text-fg-subtle">{formatRelative(o.createdAt)}</span>
        </button>

  },
  {
    key: 'customer',
    header: 'Customer',
    sortValue: (o) => o.customer.name.toLowerCase(),
    render: (o) =>
    <span className="min-w-0">
          <span className="block truncate font-medium text-fg">{o.customer.name}</span>
          <span className="block max-w-[220px] truncate text-caption text-fg-subtle">{o.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}</span>
        </span>

  },
  {
    key: 'fulfilment',
    header: 'Fulfilment',
    hideOnMobile: true,
    render: (o) => <span className="text-fg-muted">{o.fulfilment.method === 'pickup' ? 'Pickup' : o.fulfilment.method === 'digital' ? 'Download' : o.fulfilment.zoneName}</span>
  },
  { key: 'payment', header: 'Payment', hideOnMobile: true, render: (o) => <PaymentBadge status={o.paymentStatus} /> },
  { key: 'status', header: 'Status', render: (o) => <OrderStatusBadge status={o.status} pickup={o.fulfilment.method === 'pickup'} /> },
  { key: 'total', header: 'Total', align: 'right', sortValue: (o) => orderMoney(o).gross, render: (o) => <span className="font-semibold">{formatNgn(orderMoney(o).gross)}</span> }];


  return (
    <>
      <PageHeader
        title="Orders"
        description="Every order from your page, from payment to delivery."
        actions={
        <Button variant="secondary" leadingIcon={DownloadIcon} onClick={exportCsv} disabled={rows.length === 0}>
            Export CSV
          </Button>
        } />
      
      <TestModeStrip className="mt-6" />

      {data.orders.length === 0 ?
      <div className="mt-8 rounded-lg border border-line bg-raised">
          <EmptyState icon={ReceiptIcon} title="No orders yet" description="Link a product to a page block with Checkout, publish, then try buying it yourself — test mode never charges anyone." />
        </div> :

      <>
          <nav aria-label="Order status" className="scroll-quiet -mx-1 mt-6 overflow-x-auto px-1 pb-1">
            <ul className="flex gap-1.5">
              {tabs.map((t) =>
            <li key={t}>
                  <button
                type="button"
                aria-pressed={tab === t}
                onClick={() => set({ status: t === 'all' ? null : t })}
                className={cn(
                  'inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-label font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                  tab === t ? 'border-transparent bg-fg text-canvas' : 'border-line text-fg-muted hover:text-fg'
                )}>
                
                    {t === 'all' ? 'All' : orderStatusLabels[t]}
                    <span className={cn('tabular-nums', tab === t ? 'opacity-70' : 'text-fg-subtle')}>{counts[t] ?? 0}</span>
                  </button>
                </li>
            )}
            </ul>
          </nav>
          <div className="mt-4">
            <DataTable
            caption="Orders"
            rows={rows}
            columns={columns}
            filterText={(o) => `${o.number} ${o.customer.name} ${o.customer.phone} ${o.customer.email} ${o.items.map((i) => i.name).join(' ')}`}
            filterPlaceholder="Search order, customer or item"
            emptyTitle={`No ${tab === 'all' ? '' : orderStatusLabels[tab as OrderStatus].toLowerCase() + ' '}orders`}
            emptyDescription="Orders move here as their status changes." />
          
          </div>
        </>
      }

      <OrderDetail orderId={openId} onClose={() => set({ order: null })} />
    </>);

}