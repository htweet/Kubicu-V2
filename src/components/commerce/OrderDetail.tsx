import React, { useState } from 'react';
import { MediaImage } from '../media/MediaImage';
import { BanIcon, CheckCircle2Icon, MessageCircleIcon, PackageIcon, ReceiptIcon, RotateCcwIcon, ShoppingBagIcon, StickyNoteIcon, TruckIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { Order, OrderStatus } from '../../types/commerce';
import { useCommerce } from '../../contexts/CommerceContext';
import { addOrderNote, confirmPayment, setOrderStatus } from '../../utils/commerce/ops';
import { orderMoney, refundableNgn } from '../../utils/commerce/money';
import { formatNgn, formatTimestamp, whatsappLink } from '../../utils/format';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { MoneyBreakdown } from './MoneyBreakdown';
import { discountLineLabel } from '../../utils/commerce/discounts';
import { OrderStatusBadge, PaymentBadge, SampleTag } from './StatusBadges';
import { DisputePanel } from './DisputePanel';
import { RefundDialog } from './RefundDialog';
import { TestModeStrip } from './TestModeStrip';
import { cn } from '../../utils/cn';
import { useTeam } from '../../contexts/TeamContext';
import { AssigneeSelect } from '../team/AssigneeSelect';
import { CommentThread } from '../team/CommentThread';
import { FileTextIcon } from 'lucide-react';
import { useMarketplace } from '../../contexts/MarketplaceContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { printOrderInvoice } from '../../utils/orderInvoice';
import { orderRef, shopSettingsOf } from '../../utils/commerce/shopSettings';
import { useEditor } from '../../contexts/EditorContext';
import { EscrowPanel } from '../money/EscrowPanel';
import { OrderBalancePanel } from './OrderBalancePanel';
import { dispatchBlocked } from '../../utils/commerce/deposit';
import { podAwaiting } from '../../utils/commerce/payOptions';
import { OrderPodPanel } from './OrderPodPanel';
import { OrderInstalmentsPanel } from './OrderInstalmentsPanel';
import { OrderPartnerSplit } from './OrderPartnerSplit';
import { OrderLicenceKeys } from './OrderLicenceKeys';
import { useT } from '../../contexts/LocaleContext';
import { OrderTrackingPanel } from './OrderTrackingPanel';

const steps: {status: OrderStatus;label: string;}[] = [
{ status: 'new', label: 'Placed' },
{ status: 'paid', label: 'Paid' },
{ status: 'packing', label: 'Packed' },
{ status: 'out_for_delivery', label: 'Shipped' },
{ status: 'completed', label: 'Delivered' }];


function nextStep(o: Order): {label: string;status: OrderStatus;icon: typeof PackageIcon;} | null {
  const pickup = o.fulfilment.method === 'pickup';
  switch (o.status) {
    case 'new':
      // Pay on delivery orders are fulfilled before payment (D112).
      return o.pod && !o.pod.collected ? { label: 'Start packing', status: 'packing', icon: PackageIcon } : null;
    case 'paid':
      return { label: 'Start packing', status: 'packing', icon: PackageIcon };
    case 'packing':
      return { label: pickup ? 'Mark ready for pickup' : 'Mark out for delivery', status: 'out_for_delivery', icon: TruckIcon };
    case 'out_for_delivery':
      return { label: pickup ? 'Mark collected' : 'Mark delivered', status: 'completed', icon: CheckCircle2Icon };
    default:
      return null;
  }
}

export function OrderDetail({ orderId, onClose }: {orderId: string | null;onClose: () => void;}) {
  const { data, apply } = useCommerce();
  const team = useTeam();
  // Order invoices are part of Quotes & jobs; the retired Order invoices extension keeps working until moved (D231).
  const market = useMarketplace();
  const invoices = market.isActive('service-os') || market.isActive('invoice-generator');
  const { current } = useWorkspace();
  const { state: editor } = useEditor();
  const handle = editor.published?.handle ?? editor.site.handle;
  const order = orderId ? data.orders.find((o) => o.id === orderId) : undefined;
  const [dialog, setDialog] = useState<'refund' | 'cancel' | null>(null);
  const [note, setNote] = useState('');
  const [collecting, setCollecting] = useState(false);
  const { t: tr } = useT();

  if (!order) return <Sheet open={!!orderId} onClose={onClose} side="right" size="lg" title="Order not found"><p className="p-5 text-label text-fg-muted">This order may have been cleared with the sample data.</p></Sheet>;

  const money = orderMoney(order);
  // Group-goal orders stay held until the goal is reached (D54).
  const next = order.held ? null : nextStep(order);
  const pickup = order.fulfilment.method === 'pickup';
  const stepIndex = order.status === 'cancelled' || order.status === 'refunded' ? -1 : steps.findIndex((s) => s.status === order.status);
  const canCancel = ['new', 'paid', 'packing'].includes(order.status);
  const canRefund = (order.paymentStatus === 'paid' || order.paymentStatus === 'partially_refunded') && refundableNgn(order) > 0 && order.status !== 'cancelled';
  const digitalOnly = order.items.every((i) => i.kind === 'digital' || i.kind === 'ticket' || i.kind === 'course');

  const advance = () => {
    if (!next) return;
    if (!apply((d) => setOrderStatus(d, order.id, next.status))) return;
    team.log('commerce', `${next.label.toLowerCase().replace(/^mark /, 'marked ').replace(/^start /, 'started ')} on order ${orderRef(order)}`, `/app/commerce/orders?order=${order.id}`);
    toast(`Order ${orderRef(order)}: ${next.label.replace(/^Mark /, '').replace(/^Start /, '')}`, { description: 'The customer would get an update (preview only).' });
  };

  return (
    <>
      <Sheet
        open={!!orderId}
        onClose={onClose}
        side="right"
        size="lg"
        title={order.numberPrefix ? `${tr('Order')} ${orderRef(order)}` : tr('Order #{n}', { n: order.number })}
        description={`${formatTimestamp(order.createdAt)}${order.sample ? ` · ${tr('Sample')}` : ''}`}
        footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-1">
              {invoices &&
            <Button
              variant="tertiary"
              size="sm"
              leadingIcon={FileTextIcon}
              onClick={() => {
                if (!printOrderInvoice(order, current.name, shopSettingsOf(data).business)) toast.error('Your browser blocked the print window', { description: 'Allow pop-ups for KUBICU and try again.' });
              }}>
              
                  Invoice
                </Button>
            }
              {canCancel &&
            <Button variant="tertiary" size="sm" leadingIcon={BanIcon} onClick={() => setDialog('cancel')}>
                  Cancel order
                </Button>
            }
              {canRefund &&
            <Button variant="tertiary" size="sm" leadingIcon={RotateCcwIcon} onClick={() => setDialog('refund')}>
                  Refund
                </Button>
            }
            </div>
            {next && next.status === 'completed' && podAwaiting(order) ?
          <Button leadingIcon={next.icon} onClick={() => setCollecting(true)}>
                {next.label}
              </Button> :
          order.status === 'new' && !order.pod ?
          order.bankTransfer ?
          <Button leadingIcon={ReceiptIcon} onClick={() => apply((d) => confirmPayment(d, order.id)) && toast(tr('Transfer confirmed'), { description: tr('Only confirm once the money shows in your bank account.') })}>
                  {tr(order.bankTransfer.sentAt ? 'Confirm transfer received' : 'Confirm transfer received (not marked sent)')}
                </Button> :

          <Button leadingIcon={ReceiptIcon} onClick={() => apply((d) => confirmPayment(d, order.id)) && toast('Payment confirmed (simulated provider update)')}>
                  Mark payment confirmed
                </Button> :

          next && (next.status === 'out_for_delivery' || next.status === 'completed') && dispatchBlocked(order) ?
          <Button disabled leadingIcon={next.icon} title="Waiting for the balance">
                Waiting for balance
              </Button> :
          next ?
          <Button leadingIcon={next.icon} onClick={advance}>
                {next.label}
              </Button> :
          null}
          </div>
        }>
        
        <div className="flex flex-col gap-6 px-5 py-5">
          <div className="flex flex-wrap items-center gap-2">
            <OrderStatusBadge status={order.status} pickup={pickup} />
            <PaymentBadge status={order.paymentStatus} />
            {order.sample && <SampleTag />}
          </div>
          <TestModeStrip />

          <AssigneeSelect
            id={`ord-assignee-${order.id}`}
            value={order.assigneeId}
            onChange={(assigneeId) => {
              if (apply((d) => ({ ...d, orders: d.orders.map((o) => o.id === order.id ? { ...o, assigneeId } : o) }))) {
                const who = team.data.members.find((m) => m.id === assigneeId)?.name;
                team.log('commerce', who ? `assigned order ${orderRef(order)} to ${who}` : `unassigned order ${orderRef(order)}`, `/app/commerce/orders?order=${order.id}`);
              }
            }}
            className="max-w-xs" />
          

          {order.status === 'new' && !order.pod &&
          <p className="rounded-md bg-info-soft px-3 py-2.5 text-label text-info">
              {order.paymentNote ?? tr('Payment pending')}. {tr('Don’t pack until the provider confirms — in live mode this updates automatically.')}
            </p>
          }

          {order.held &&
          <p className="rounded-md bg-warning-soft px-3 py-2.5 text-label text-warning">
              {tr('Joined a group buy at kub.icu/{handle}. Paid, but waiting for the goal — don’t pack yet. If the goal is missed, it’s refunded in full automatically.', { handle: order.sourceHandle ?? '' })}
            </p>
          }

          <OrderBalancePanel order={order} handle={handle} business={current.name} apply={apply} />
          <OrderPodPanel order={order} data={data} apply={apply} collectOpen={collecting} onCollectOpen={setCollecting} />
          <OrderInstalmentsPanel order={order} handle={handle} business={current.name} workspaceId={current.id} apply={apply} />

          {(order.fulfilment.method === 'delivery' || order.fulfilment.method === 'pickup') && stepIndex >= 0 && !digitalOnly ?
          <OrderTrackingPanel order={order} handle={handle} /> :
          stepIndex >= 0 && !digitalOnly &&
          // Phones: a vertical tracker; wider screens: a five-part bar.
          <ol className="relative flex flex-col gap-3 sm:grid sm:grid-cols-5 sm:gap-1.5" aria-label={tr('Order progress')}>
              <span aria-hidden className="absolute bottom-1.5 left-[5px] top-1.5 w-px bg-line sm:hidden" />
              {steps.map((s, i) =>
            <li key={s.status} className="relative flex items-center gap-3 sm:block">
                  <span aria-hidden className={cn('block h-[11px] w-[11px] shrink-0 rounded-full ring-4 ring-overlay sm:h-1.5 sm:w-auto sm:ring-0', i <= stepIndex ? 'bg-action' : 'bg-line-strong sm:bg-sunken')} />
                  <span className={cn('block text-label sm:mt-1.5 sm:text-caption', i <= stepIndex ? 'font-semibold text-fg' : 'text-fg-subtle', i === stepIndex && 'max-sm:text-action')}>
                    <span className="sr-only">{tr(i <= stepIndex ? 'Done:' : 'Next:')} </span>
                    {tr(s.status === 'out_for_delivery' && pickup ? 'Ready' : s.status === 'completed' && pickup ? 'Collected' : s.label)}
                  </span>
                </li>
            )}
            </ol>
          }

          {order.dispute && <DisputePanel order={order} />}
          <EscrowPanel workspaceId={current.id} orderId={order.id} handle={order.sourceHandle ?? handle} />
          <OrderPartnerSplit order={order} leadName={current.name} />

          <section aria-label={tr('Items')}>
            <ul className="flex flex-col divide-y divide-line border-y border-line">
              {order.items.map((i) =>
              <li key={i.variantId} className="flex items-center gap-3 py-3">
                  {i.imageUrl ?
                <MediaImage src={i.imageUrl} alt="" className="h-14 w-11 shrink-0 rounded-sm object-cover" /> :

                <span aria-hidden className="flex h-14 w-11 shrink-0 items-center justify-center rounded-sm bg-sunken text-fg-subtle">
                      <ShoppingBagIcon size={16} />
                    </span>
                }
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-label font-semibold text-fg">{i.name}</p>
                    <p className="text-caption text-fg-subtle">
                      {[i.variantLabel, i.kind === 'digital' ? tr('Digital download') : i.kind === 'ticket' ? tr('Event ticket') : i.kind === 'course' ? tr('Online course') : null, `${i.qty} × ${formatNgn(i.unitPriceNgn)}`].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <span className="text-label font-semibold tabular-nums text-fg">{formatNgn(i.unitPriceNgn * i.qty)}</span>
                </li>
              )}
            </ul>
          </section>

          <div className="grid gap-6 sm:grid-cols-2">
            <section aria-labelledby={`cust-${order.id}`}>
              <h3 id={`cust-${order.id}`} className="text-caption font-semibold text-fg-subtle">
                {tr('Customer')}
              </h3>
              <p className="mt-1 text-label font-semibold text-fg">{order.customer.name}</p>
              <p className="text-label text-fg-muted">{order.customer.phone}</p>
              <p className="text-label text-fg-muted">{order.customer.email}</p>
              <a
                href={whatsappLink(order.customer.phone, `Hi ${order.customer.name.split(' ')[0]}, about your order ${orderRef(order)}…`)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-label font-semibold text-action hover:underline">
                
                <MessageCircleIcon size={14} aria-hidden /> {tr('Message on WhatsApp')}
              </a>
            </section>
            <section aria-labelledby={`ful-${order.id}`}>
              <h3 id={`ful-${order.id}`} className="text-caption font-semibold text-fg-subtle">
                {tr('Fulfilment')}
              </h3>
              <p className="mt-1 text-label font-semibold text-fg">
                {order.fulfilment.method === 'pickup' ? tr('Pickup') : order.fulfilment.method === 'tickets' ? tr('Event tickets · {n} issued', { n: order.tickets?.length ?? 0 }) : order.fulfilment.method === 'digital' ? tr('Download link') : `${tr('Delivery')} · ${order.fulfilment.zoneName}`}
              </p>
              {order.fulfilment.address && <p className="text-label text-fg-muted">{order.fulfilment.address}</p>}
              {order.popup &&
              <p className="text-caption text-fg-subtle">
                  {tr('Pop-up session')}: {order.popup.sessionLabel}
                  {order.popup.payAtStall && order.paymentStatus === 'pending' ? ` · ${tr('pays at the stall')}` : ''}
                  {order.popup.collectedAt ? ` · ${tr('collected')}` : ''}
                </p>
              }
              {order.fulfilment.eta && <p className="text-caption text-fg-subtle">{tr('Estimated {eta}', { eta: order.fulfilment.eta })}</p>}
              {order.downloadToken &&
              <p className="mt-1 text-caption text-fg-subtle">
                  {tr(order.downloads.length === 1 ? '{n} download so far' : '{n} downloads so far', { n: order.downloads.length })}
                  {order.downloads[0] ? ` · ${tr('last {date}', { date: formatTimestamp(order.downloads[order.downloads.length - 1].at) })}` : ''}
                </p>
              }
              {order.downloads.some((d) => d.copy) &&
              <ul className="mt-2 flex flex-col gap-1 rounded-md bg-sunken px-3 py-2" aria-label={tr('Stamped copies downloaded')}>
                  {order.downloads.
                filter((d) => d.copy).
                slice(-5).
                reverse().
                map((d) =>
                <li key={d.id} className="text-caption text-fg-muted">
                        <span className="font-medium text-fg">{tr('Stamped copy')}</span> · {formatTimestamp(d.at)}
                        <span className="block truncate text-fg-subtle">{d.copy}</span>
                      </li>
                )}
                </ul>
              }
              <OrderLicenceKeys order={order} />
            </section>
          </div>

          <section aria-label={tr('Money')} className="rounded-md bg-sunken px-4 py-3">
            <MoneyBreakdown money={money} discountLabel={order.discount ? discountLineLabel(order.discount) : undefined} />
            {order.discount?.referrerName && <p className="mt-1 text-caption text-fg-subtle">{tr('Referred by {name}.', { name: order.discount.referrerName })}</p>}
          </section>

          <section aria-labelledby={`tl-${order.id}`}>
            <h3 id={`tl-${order.id}`} className="text-label font-semibold text-fg">
              {tr('Timeline')}
            </h3>
            <form
              className="mt-3 flex items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!note.trim()) return;
                if (apply((d) => addOrderNote(d, order.id, note.trim()))) setNote('');
              }}>
              
              <TextInput id={`note-${order.id}`} label="Add a private note" placeholder={tr('Only you see this')} value={note} fieldClassName="flex-1" onChange={(e) => setNote(e.target.value)} />
              <Button type="submit" variant="secondary" leadingIcon={StickyNoteIcon} disabled={!note.trim()}>
                Add
              </Button>
            </form>
            <ol className="relative mt-4 flex flex-col gap-4 pl-6">
              <span aria-hidden className="absolute bottom-1 left-[7px] top-1 w-px bg-line" />
              {order.events.map((e) =>
              <li key={e.id} className="relative">
                  <span aria-hidden className={cn('absolute -left-6 top-1 h-[15px] w-[15px] rounded-full border-2 bg-raised', e.kind === 'note' ? 'border-line-strong' : e.kind === 'refund' || e.kind === 'cancelled' || e.kind === 'dispute' ? 'border-warning' : 'border-action')} />
                  <p className="text-label text-fg">{e.label}</p>
                  <p className="text-caption text-fg-subtle">{formatTimestamp(e.at)}</p>
                </li>
              )}
            </ol>
          </section>

          <CommentThread subject={`order:${order.id}`} subjectLabel={`Order ${orderRef(order)}`} href={`/app/commerce/orders?order=${order.id}`} area="commerce" className="border-t border-line pt-6" />
        </div>
      </Sheet>
      <RefundDialog order={dialog ? order : null} mode={dialog ?? 'refund'} onClose={() => setDialog(null)} />
    </>);

}