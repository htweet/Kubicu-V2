import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRightIcon, CheckIcon, PackageIcon, PlusIcon, ShoppingBagIcon, SparklesIcon, TruckIcon, WalletIcon } from 'lucide-react';
import { useCommerce } from '../../contexts/CommerceContext';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { TestModeStrip } from '../../components/commerce/TestModeStrip';
import { OrderStatusBadge, PaymentBadge, SampleTag } from '../../components/commerce/StatusBadges';
import { isLowStock, isSoldOut, totalStock } from '../../utils/commerce/catalog';
import { orderMoney } from '../../utils/commerce/money';
import { formatNgn, formatRelative } from '../../utils/format';
import { cn } from '../../utils/cn';
import { Card } from '../../components/ui/layout/Card';
import { CardLink } from '../../components/ui/layout/CardLink';
import { List, ListRow } from '../../components/ui/layout/ListRow';
import { Stat, StatGroup } from '../../components/ui/layout/Stat';
import type { Order } from '../../types/commerce';

const queue: {id: string;label: string;match: (o: Order) => boolean;hint: string;}[] = [
{ id: 'confirm', label: 'To confirm', match: (o) => o.status === 'new', hint: 'Payment pending — check before packing' },
{ id: 'pack', label: 'To pack', match: (o) => o.status === 'paid' || o.status === 'packing', hint: 'Paid and waiting to go out' },
{ id: 'deliver', label: 'Out now', match: (o) => o.status === 'out_for_delivery', hint: 'Mark delivered when they arrive' }];


export function CommerceOverview() {
  const { data, loadSample } = useCommerce();
  const navigate = useNavigate();

  const weekAgo = Date.now() - 7 * 86400000;
  const week = useMemo(() => {
    const orders = data.orders.filter((o) => Date.parse(o.createdAt) >= weekAgo && o.paymentStatus !== 'pending' && o.paymentStatus !== 'cancelled');
    return orders.reduce(
      (acc, o) => {
        const m = orderMoney(o);
        return { count: acc.count + 1, gross: acc.gross + m.gross, fees: acc.fees + m.providerFee + m.kubicuFee, refunds: acc.refunds + m.refunded, net: acc.net + m.net };
      },
      { count: 0, gross: 0, fees: 0, refunds: 0, net: 0 }
    );
  }, [data.orders, weekAgo]);

  const stockAlerts = data.products.filter((p) => p.status === 'active' && p.kind !== 'ticket' && (isSoldOut(p) || isLowStock(p)));
  const groups = queue.map((q) => ({ ...q, orders: data.orders.filter(q.match) }));
  const totalActionable = groups.reduce((s, g) => s + g.orders.length, 0);

  const setup = [
  { id: 'product', label: 'Add your first product', done: data.products.length > 0, to: '/app/commerce/products?new=1' },
  { id: 'delivery', label: 'Set pickup or delivery zones', done: data.fulfilment.pickupEnabled || data.fulfilment.deliveryEnabled && data.fulfilment.zones.length > 0, to: '/app/commerce/settings' },
  { id: 'payments', label: 'Choose how you’ll take payment', done: !!data.payments.provider, to: '/app/commerce/payments' }];

  const setupDone = setup.every((s) => s.done);

  if (data.products.length === 0 && data.orders.length === 0) {
    return (
      <>
        <PageHeader title="Commerce" description="Sell from your page: products, stock, orders and checkout." />
        <div className="mt-8 rounded-lg border border-line bg-raised">
          <EmptyState
            icon={ShoppingBagIcon}
            title="Nothing for sale yet"
            description="Add a product to start. Then link it to a block on your page so price and stock stay in sync."
            action={
            <div className="flex flex-wrap justify-center gap-2">
                <Button leadingIcon={PlusIcon} onClick={() => navigate('/app/commerce/products?new=1')}>
                  Add a product
                </Button>
                <Button variant="secondary" leadingIcon={SparklesIcon} onClick={loadSample}>
                  Explore with sample data
                </Button>
              </div>
            } />
          
        </div>
      </>);

  }

  return (
    <>
      <PageHeader
        title="Commerce"
        description="What needs doing today, then how stock and sales are looking."
        actions={
        <Button leadingIcon={PlusIcon} onClick={() => navigate('/app/commerce/products?new=1')}>
            Add product
          </Button>
        } />
      
      <TestModeStrip className="mt-6" />

      {!setupDone &&
      <section aria-label="Commerce setup" className="mt-6 flex flex-col gap-3 rounded-md border border-line bg-raised p-4 md:flex-row md:items-center md:gap-6">
          <p className="shrink-0 text-label font-semibold text-fg">Finish setting up</p>
          <ol className="flex flex-1 flex-wrap gap-2">
            {setup.map((s) =>
          <li key={s.id}>
                <Link
              to={s.to}
              className={cn(
                'inline-flex h-9 items-center gap-2 rounded-full border px-3 text-label transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                s.done ? 'border-transparent bg-success-soft text-success' : 'border-line-strong text-fg hover:bg-sunken'
              )}>
              
                  {s.done ? <CheckIcon size={14} strokeWidth={3} aria-hidden /> : <span aria-hidden className="h-3.5 w-3.5 rounded-full border-2 border-line-strong" />}
                  <span className="sr-only">{s.done ? 'Done: ' : 'To do: '}</span>
                  {s.label}
                </Link>
              </li>
          )}
          </ol>
        </section>
      }

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <Card
          id="queue"
          emphasis="primary"
          body="flush"
          title="Orders needing action"
          description={totalActionable === 0 ? 'You’re all caught up.' : `${totalActionable} order${totalActionable === 1 ? '' : 's'} across ${groups.filter((g) => g.orders.length).length} stages`}
          actions={<CardLink to="/app/commerce/orders">All orders</CardLink>}>
          
          {totalActionable === 0 ?
          <p className="px-6 py-10 text-center text-label text-fg-muted">New orders from your page will appear here.</p> :

          <div className="divide-y divide-line">
              {groups.
            filter((g) => g.orders.length).
            map((g) =>
            <div key={g.id} className="py-2">
                    <div className="flex items-baseline justify-between gap-3 px-5 pb-1 pt-3 md:px-6">
                      <h3 className="text-label font-semibold text-fg">
                        {g.label} <span className="ml-1 tabular-nums text-fg-subtle">{g.orders.length}</span>
                      </h3>
                      <span className="hidden text-caption text-fg-subtle sm:inline">{g.hint}</span>
                    </div>
                    <List>
                      {g.orders.slice(0, 4).map((o) =>
                <ListRow
                  key={o.id}
                  to={`/app/commerce/orders?order=${o.id}`}
                  leading={<span className="w-12 font-mono text-caption text-fg-subtle">#{o.number}</span>}
                  title={
                  <span className="flex items-center gap-2">
                              <span className="truncate">{o.customer.name}</span>
                              {o.sample && <SampleTag />}
                            </span>
                  }
                  meta={`${o.items.map((i) => `${i.qty}× ${i.name}`).join(', ')} · ${formatRelative(o.createdAt)}`}
                  trailing={
                  <>
                              <span className="hidden sm:block">{o.status === 'new' ? <PaymentBadge status={o.paymentStatus} /> : <OrderStatusBadge status={o.status} pickup={o.fulfilment.method === 'pickup'} />}</span>
                              <span className="w-20 text-label font-semibold tabular-nums text-fg">{formatNgn(orderMoney(o).gross)}</span>
                            </>
                  } />

                )}
                    </List>
                  </div>
            )}
            </div>
          }
        </Card>

        <div className="flex flex-col gap-6">
          <Card id="stock" icon={PackageIcon} title="Stock to watch" body="flush" actions={<CardLink to="/app/commerce/inventory">Inventory</CardLink>}>
            {stockAlerts.length === 0 ?
            <p className="px-5 py-5 text-label text-fg-muted md:px-6">Nothing is low or sold out.</p> :

            <List>
                {stockAlerts.slice(0, 5).map((p) =>
              <ListRow
                key={p.id}
                to={`/app/commerce/inventory?product=${p.id}`}
                title={p.name}
                trailing={<span className={cn('text-caption font-semibold tabular-nums', isSoldOut(p) ? 'text-danger' : 'text-warning')}>{isSoldOut(p) ? 'Sold out' : `${totalStock(p)} left`}</span>} />

              )}
              </List>
            }
          </Card>

          <Card id="week" icon={WalletIcon} title="Last 7 days" actions={<CardLink to="/app/commerce/reports">Report</CardLink>}>
            <dl>
              <Stat primary label={`You receive, from ${week.count} paid order${week.count === 1 ? '' : 's'}`} value={formatNgn(week.net)} />
            </dl>
            <StatGroup columns={3} divided className="mt-4 !grid-cols-3">
              <Stat label="Customers paid" value={<span className="text-label">{formatNgn(week.gross)}</span>} />
              <Stat label="Fees" value={<span className="text-label">{formatNgn(week.fees)}</span>} />
              <Stat label="Refunds" value={<span className="text-label">{formatNgn(week.refunds)}</span>} />
            </StatGroup>
          </Card>

          <Link
            to="/app/commerce/settings"
            className="flex items-center gap-3 rounded-md border border-dashed border-line-strong px-4 py-3 text-label text-fg-muted transition-colors duration-150 hover:text-fg">
            
            <TruckIcon size={17} strokeWidth={2.25} aria-hidden />
            <span className="flex-1">
              {data.fulfilment.zones.length} delivery zone{data.fulfilment.zones.length === 1 ? '' : 's'}
              {data.fulfilment.pickupEnabled ? ' · pickup on' : ''}
            </span>
            <ArrowRightIcon size={14} aria-hidden />
          </Link>
        </div>
      </div>
    </>);

}