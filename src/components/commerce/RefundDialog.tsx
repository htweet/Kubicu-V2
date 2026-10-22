import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { Order } from '../../types/commerce';
import { useCommerce } from '../../contexts/CommerceContext';
import { cancelOrder, refundOrder } from '../../utils/commerce/ops';
import { refundableNgn } from '../../utils/commerce/money';
import { formatNgn } from '../../utils/format';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { CurrencyInput } from '../ui/CurrencyInput';
import { TextInput } from '../ui/TextInput';
import { Switch } from '../ui/Switch';
import { InlineAlert } from '../ui/InlineAlert';

interface Props {
  order: Order | null;
  mode: 'refund' | 'cancel';
  onClose: () => void;
}

/** Full or partial refunds, and cancellations (which refund in full if already paid). */
export function RefundDialog({ order, mode, onClose }: Props) {
  const { apply } = useCommerce();
  const max = order ? refundableNgn(order) : 0;
  const paid = !!order && (order.paymentStatus === 'paid' || order.paymentStatus === 'partially_refunded');
  const physical = !!order?.items.some((i) => i.kind === 'physical');
  const [amount, setAmount] = useState<number | null>(max);
  const [reason, setReason] = useState('');
  const [restock, setRestock] = useState(true);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!order) return;
    setAmount(refundableNgn(order));
    setReason('');
    setRestock(mode === 'cancel');
    setTried(false);
  }, [order, mode]);

  const amountError = mode === 'refund' && (amount === null || amount <= 0 || amount > max) ? `Enter an amount between ₦1 and ${formatNgn(max)}` : undefined;
  const reasonError = !reason.trim() ? 'Add a reason — it goes in the order timeline' : undefined;

  const submit = () => {
    setTried(true);
    if (!order || amountError || reasonError) return;
    const ok = apply((d) => {
      if (mode === 'cancel') {
        const refunded = paid ? refundOrder(d, order.id, max, `Cancelled — ${reason.trim()}`, false) : d;
        return cancelOrder(refunded, order.id, reason.trim(), physical);
      }
      return refundOrder(d, order.id, amount ?? 0, reason.trim(), physical && restock);
    });
    if (ok) {
      toast(mode === 'cancel' ? `Order #${order.number} cancelled` : `Refund of ${formatNgn(amount ?? 0)} sent (test mode)`, {
        description: paid ? 'In live mode the customer’s bank usually shows it within 5–10 working days.' : undefined
      });
      onClose();
    }
  };

  const notification =
  mode === 'cancel' ?
  `Hi ${order?.customer.name.split(' ')[0] ?? ''}, your order #${order?.number} has been cancelled${paid ? ` and ${formatNgn(max)} refunded to your original payment method` : ''}. Reason: ${reason.trim() || '…'}` :
  `Hi ${order?.customer.name.split(' ')[0] ?? ''}, we’ve refunded ${formatNgn(amount ?? 0)} for order #${order?.number}. Reason: ${reason.trim() || '…'}`;

  return (
    <Dialog
      open={!!order}
      onClose={onClose}
      title={mode === 'cancel' ? `Cancel order #${order?.number ?? ''}?` : `Refund order #${order?.number ?? ''}`}
      description={mode === 'cancel' ? paid ? `It’s paid, so the full ${formatNgn(max)} is refunded.` : 'Payment hasn’t been confirmed, so nothing needs refunding.' : `Up to ${formatNgn(max)} can be refunded.`}
      footer={
      <>
          <Button variant="secondary" onClick={onClose}>
            {mode === 'cancel' ? 'Keep order' : 'Cancel'}
          </Button>
          <Button variant={mode === 'cancel' ? 'destructive' : 'primary'} onClick={submit}>
            {mode === 'cancel' ? 'Cancel order' : `Refund ${formatNgn(amount ?? 0)}`}
          </Button>
        </>
      }>
      
      <div className="flex flex-col gap-4">
        {mode === 'refund' &&
        <>
            <CurrencyInput id="rf-amount" label="Amount" value={amount} error={tried ? amountError : undefined} onChange={setAmount} />
            <div className="-mt-2 flex gap-2">
              <Button size="sm" variant="tertiary" onClick={() => setAmount(max)}>
                Full amount
              </Button>
              {order && order.deliveryNgn > 0 && max >= order.deliveryNgn &&
            <Button size="sm" variant="tertiary" onClick={() => setAmount(order.deliveryNgn)}>
                  Delivery only
                </Button>
            }
            </div>
          </>
        }
        <TextInput id="rf-reason" label="Reason" value={reason} placeholder={mode === 'cancel' ? 'e.g. Customer asked to cancel' : 'e.g. Wrong size, no exchange available'} error={tried ? reasonError : undefined} onChange={(e) => setReason(e.target.value)} />
        {mode === 'refund' && physical &&
        <Switch id="rf-restock" label="Put items back in stock" description="Turn off if the items weren’t returned or can’t be resold." checked={restock} onChange={setRestock} />
        }
        {mode === 'cancel' && physical && <p className="text-caption text-fg-subtle">Reserved stock goes back to inventory.</p>}
        <div>
          <p className="text-label font-medium text-fg">Message to the customer</p>
          <p className="mt-1.5 rounded-md bg-sunken px-3 py-2.5 text-label text-fg-muted">{notification}</p>
          <p className="mt-1 text-caption text-fg-subtle">Preview only — nothing is sent in this prototype.</p>
        </div>
        <InlineAlert tone="info" title="Refunds go through your payment provider">
          KUBICU doesn’t hold funds. Fees already charged may not be returned by the provider.
        </InlineAlert>
      </div>
    </Dialog>);

}