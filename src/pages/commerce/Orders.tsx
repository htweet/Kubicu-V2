import React, { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangleIcon, DownloadIcon, ReceiptIcon, WorkflowIcon } from 'lucide-react';
import { useMarketplace } from '../../contexts/MarketplaceContext';
import { useOps } from '../../contexts/OpsContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useFulfilment } from '../../hooks/useFulfilment';
import { buildTracking, dayLabel, healthLabels, needsTrackingAttention } from '../../utils/commerce/tracking';
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
import { orderRef } from '../../utils/commerce/shopSettings';
import { downloadCsv, toCsv } from '../../utils/csv';
import { formatNgn, formatRelative } from '../../utils/format';
import { cn } from '../../utils/cn';
import { useTeam } from '../../contexts/TeamContext';
import { MAIN_BRANCH, locationName } from '../../utils/commerce/branches';
import { AssigneeChip, MineToggle } from '../../components/team/AssigneeSelect';
import { useT } from '../../contexts/LocaleContext';

type Tab = 'all' | OrderStatus;
const tabs: Tab[] = ['all', 'new', 'paid', 'packing', 'out_for_delivery', 'completed', 'cancelled', 'refunded'];

export function Orders() {
  const { data: allData } = useCommerce();
  const { t: tr } = useT();
  // A teammate limited to one location sees only that location's orders (D474).
  const { me, myBranchId } = useTeam();
  const data = useMemo(() => myBranchId ? { ...allData, orders: allData.orders.filter((o) => (o.fulfilment.branchId ?? MAIN_BRANCH) === myBranchId) } : allData, [allData, myBranchId]);
  const [params, setParams] = useSearchParams();
  const tab = params.get('status') as Tab || 'all';
  const openId = params.get('order');
  // Abandoned-cart recovery is an Automations recipe, one tap from here (D231).
  const navigate = useNavigate();
  const automationsOn = useMarketplace().isActive('automations');
  const hasRecovery = useOps().data.automations.some((a) => a.trigger === 'checkout_abandoned');

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: data.orders.length };
    data.orders.forEach((o) => c[o.status] = (c[o.status] ?? 0) + 1);
    return c;
  }, [data.orders]);

  // “Mine”: orders assigned to the signed-in member (D60).
  const mine = params.get('mine') === '1';
  const mineCount = data.orders.filter((o) => o.assigneeId === me.id).length;
  // Delivery tracking health per order (D144).
  const { current } = useWorkspace();
  const fulfilment = useFulfilment(current.id).data;
  const views = useMemo(() => new Map(data.orders.map((o) => [o.id, buildTracking(o, fulfilment)])), [data.orders, fulfilment]);
  const attention = params.get('track') === 'attention';
  const attentionCount = data.orders.filter((o) => needsTrackingAttention(views.get(o.id)!)).length;
  const rows = (tab === 'all' ? data.orders : data.orders.filter((o) => o.status === tab)).filter((o) => (!mine || o.assigneeId === me.id) && (!attention || needsTrackingAttention(views.get(o.id)!)));
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
            <span className="font-mono font-semibold text-fg group-hover:underline">{orderRef(o)}</span>
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
    render: (o) => <span className="text-fg-muted">{o.popup ? tr('Pop-up pickup') : o.fulfilment.method === 'pickup' ? o.fulfilment.branchId ? `${tr('Pickup')} · ${o.fulfilment.zoneName}` : tr('Pickup') : o.fulfilment.method === 'tickets' ? tr('Tickets') : o.fulfilment.method === 'digital' ? tr('Download') : o.fulfilment.zoneName}</span>
  },
  { key: 'payment', header: 'Payment', hideOnMobile: true, render: (o) => <PaymentBadge status={o.paymentStatus} /> },
  {
    key: 'status',
    header: 'Status',
    render: (o) => {
      const v = views.get(o.id);
      const flag = v && needsTrackingAttention(v);
      return (
        <span className="flex flex-col items-start gap-0.5">
            <OrderStatusBadge status={o.status} pickup={o.fulfilment.method === 'pickup'} />
            {flag && v && <span className={cn('text-caption font-semibold', v.health === 'at_risk' ? 'text-warning' : 'text-danger')}>{tr(healthLabels[v.health])}</span>}
            {!flag && v?.applies && v.promisedBy && v.health === 'on_track' && <span className="text-caption text-fg-subtle">{tr('Due {date}', { date: dayLabel(v.promisedBy) })}</span>}
          </span>);

    }
  },
  { key: 'assignee', header: 'Assigned', hideOnMobile: true, render: (o) => <AssigneeChip memberId={o.assigneeId} /> },
  { key: 'total', header: 'Total', align: 'right', sortValue: (o) => orderMoney(o).gross, render: (o) => <span className="font-semibold">{formatNgn(orderMoney(o).gross)}</span> }];


  return (
    <>
      <PageHeader
        title="Orders"
        description="Every order from your page, from payment to delivery."
        actions={
        <>
          {!hasRecovery &&
          <Button variant="tertiary" leadingIcon={WorkflowIcon} onClick={() => navigate(automationsOn ? '/app/automations?recipe=abandoned' : '/app/extensions?ext=automations')}>
              Recover unpaid checkouts
            </Button>
          }
          <Button variant="secondary" leadingIcon={DownloadIcon} onClick={exportCsv} disabled={rows.length === 0}>
            Export CSV
          </Button>
          </>
        } />
      
      <TestModeStrip className="mt-6" />
      {myBranchId && <p className="mt-4 text-label text-fg-muted">{tr('Showing {location} only — the location you work at.', { location: locationName(allData, myBranchId, tr('Main shop')) })}</p>}

      {data.orders.length === 0 ?
      <EmptyState framed className="mt-8" icon={ReceiptIcon} title="No orders yet" description="Link a product to a page block with Checkout, publish, then try buying it yourself — test mode never charges anyone." /> :

      <>
          <nav aria-label={tr('Order status')} className="scroll-quiet -mx-1 mt-6 overflow-x-auto px-1 pb-1">
            <ul className="flex gap-1.5">
              <li>
                <MineToggle mine={mine} count={mineCount} onChange={(v) => set({ mine: v ? '1' : null })} />
              </li>
              {attentionCount > 0 &&
            <li>
                  <button
                type="button"
                aria-pressed={attention}
                onClick={() => set({ track: attention ? null : 'attention' })}
                className={cn(
                  'inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-label font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                  attention ? 'border-transparent bg-danger text-white' : 'border-danger/40 text-danger hover:bg-danger-soft'
                )}>
                
                    <AlertTriangleIcon size={13} aria-hidden /> {tr('Delivery needs attention')}
                    <span className="tabular-nums opacity-80">{attentionCount}</span>
                  </button>
                </li>
            }
              <li aria-hidden className="mx-1 w-px self-stretch bg-line" />
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
                
                    {tr(t === 'all' ? 'All' : orderStatusLabels[t])}
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
            emptyTitle={tab === 'all' ? 'No orders' : tr('No orders with status “{status}”', { status: tr(orderStatusLabels[tab as OrderStatus]) })}
            emptyDescription="Orders move here as their status changes." />
          
          </div>
        </>
      }

      <OrderDetail orderId={openId} onClose={() => set({ order: null })} />
    </>);

}