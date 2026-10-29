import React from 'react';
import { CheckCircle2Icon, CopyIcon, HammerIcon, MessageCircleIcon } from 'lucide-react';
import { orderRef } from '../../utils/commerce/shopSettings';
import { toast } from 'sonner';
import type { CommerceData, Order } from '../../types/commerce';
import { Button } from '../ui/Button';
import { requestOrderBalance, payOrderBalance } from '../../utils/commerce/deposit';
import { formatNgn, formatTimestamp, whatsappLink } from '../../utils/format';

interface OrderBalancePanelProps {
  order: Order;
  handle: string;
  business: string;
  apply: (fn: (d: CommerceData) => CommerceData) => boolean;
}

/** Seller side of a made-to-order balance (D95): request it, or record cash/transfer. */
export function OrderBalancePanel({ order, handle, business, apply }: OrderBalancePanelProps) {
  const b = order.balance;
  if (!b || order.status === 'cancelled' || order.status === 'refunded' || order.paymentStatus === 'pending') return null;
  const link = `${window.location.origin}/p/${order.sourceHandle ?? handle}/order/${order.id}`;

  if (b.paidAt) {
    return (
      <section aria-label="Balance" className="flex items-start gap-3 rounded-md border border-line px-4 py-3">
        <CheckCircle2Icon size={18} className="mt-0.5 shrink-0 text-success" aria-hidden />
        <p className="text-label text-fg">
          <span className="font-semibold">Balance of {formatNgn(b.dueNgn)} paid</span>
          <span className="block text-caption text-fg-subtle">
            {b.how === 'recorded' ? 'Recorded by you' : 'Paid online (test)'} · {formatTimestamp(b.paidAt)} · ready to dispatch
          </span>
        </p>
      </section>);

  }

  const request = () => {
    navigator.clipboard?.writeText(link).catch(() => undefined);
    if (apply((d) => requestOrderBalance(d, order.id))) toast.success('Pay link copied', { description: 'Send it to the customer — they pay from their order page.' });
  };
  const message = `Hi ${order.customer.name.split(' ')[0] || 'there'}, it's ${business}. Your order ${orderRef(order)} is nearly ready! The balance is ${formatNgn(b.dueNgn)} — you can pay it here: ${link}`;

  return (
    <section aria-labelledby="ord-balance-h" className="flex flex-col gap-3 rounded-md border border-warning/40 bg-warning-soft px-4 py-3">
      <div className="flex items-start gap-3">
        <HammerIcon size={18} className="mt-0.5 shrink-0 text-warning" aria-hidden />
        <div>
          <h3 id="ord-balance-h" className="text-label font-semibold text-fg">
            Made to order · {formatNgn(b.dueNgn)} balance still to pay
          </h3>
          <p className="text-caption text-fg-muted">
            Deposit received. You can pack it, but it can’t be marked out for delivery until the balance is in.
            {b.requestedAt ? ` Requested ${formatTimestamp(b.requestedAt)}.` : ''}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 pl-[30px]">
        <Button size="sm" leadingIcon={CopyIcon} onClick={request}>
          {b.requestedAt ? 'Copy pay link again' : 'Request balance'}
        </Button>
        {order.customer.phone &&
        <Button size="sm" variant="secondary" leadingIcon={MessageCircleIcon} onClick={() => {apply((d) => requestOrderBalance(d, order.id));window.open(whatsappLink(order.customer.phone, message), '_blank', 'noopener,noreferrer');}}>
            WhatsApp
          </Button>
        }
        <Button size="sm" variant="tertiary" onClick={() => apply((d) => payOrderBalance(d, order.id, 'recorded')) && toast.success('Balance recorded as paid')}>
          Record as paid
        </Button>
      </div>
    </section>);

}