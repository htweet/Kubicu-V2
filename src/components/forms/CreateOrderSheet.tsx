import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { FormDef, FormField, FormSubmission } from '../../types/forms';
import type { CommerceData, OrderEvent } from '../../types/commerce';
import { useCommerce } from '../../contexts/CommerceContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { placeOrder } from '../../utils/commerce/ops';
import { variantLabel, variantPrice } from '../../utils/commerce/catalog';
import { answerText, parsePicks } from '../../utils/forms/logic';
import { contactFrom } from '../../utils/forms/submit';
import { formatNgn } from '../../utils/format';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { Segmented } from '../ui/Segmented';
import { SelectInput } from '../ui/SelectInput';
import { TextArea } from '../ui/TextArea';
import { TextInput } from '../ui/TextInput';
import { InlineAlert } from '../ui/InlineAlert';

interface CreateOrderSheetProps {
  open: boolean;
  onClose: () => void;
  form: FormDef;
  field: FormField;
  submission: FormSubmission;
  onCreated: (orderId: string, orderNumber: number) => void;
}

type Method = 'pickup' | 'delivery';

/** Turns a response's product picks into a real Commerce order (D195). Stock is reserved like any order. */
export function CreateOrderSheet({ open, onClose, form, field, submission, onCreated }: CreateOrderSheetProps) {
  const commerce = useCommerce();
  const { current } = useWorkspace();
  const picks = useMemo(() => parsePicks(submission.answers[field.id]), [submission.answers, field.id]);
  const contact = contactFrom(form, submission.answers);
  const addressField = form.fields.find((f) => f.type === 'address' && answerText(submission.answers[f.id], f).trim());

  const [variants, setVariants] = useState<Record<string, string>>({});
  const [method, setMethod] = useState<Method>(addressField ? 'delivery' : 'pickup');
  const [address, setAddress] = useState(addressField ? answerText(submission.answers[addressField.id], addressField) : '');
  const [fee, setFee] = useState('0');
  const [failure, setFailure] = useState<string | null>(null);

  // Default each line to its first in-stock option.
  useEffect(() => {
    if (!open) return;
    const next: Record<string, string> = {};
    picks.forEach((p) => {
      const product = commerce.data.products.find((x) => x.id === p.id);
      const v = product?.variants.find((x) => !product.trackStock || product.kind !== 'physical' || x.stock >= p.qty) ?? product?.variants[0];
      if (v) next[p.id] = v.id;
    });
    setVariants(next);
    setFailure(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const lines = picks.map((p) => {
    const product = commerce.data.products.find((x) => x.id === p.id);
    const variant = product?.variants.find((v) => v.id === variants[p.id]);
    const price = product && variant ? variantPrice(product, variant) : null;
    const problem = !product ? 'No longer in Commerce' : product.status !== 'active' ? 'Not for sale' : price === null ? 'No price' : product.kind === 'physical' && product.trackStock && variant && variant.stock < p.qty ? `Only ${variant.stock} in stock` : null;
    return { pick: p, product, variant, price, problem };
  });
  const subtotal = lines.reduce((t, l) => t + (l.price ?? 0) * l.pick.qty, 0);
  const deliveryNgn = method === 'delivery' ? Math.max(0, Math.round(Number(fee) || 0)) : 0;
  const total = subtotal + deliveryNgn;
  const paidInForm = submission.payment?.amountNgn ?? 0;
  const fullyPaid = paidInForm > 0 && paidInForm >= total;
  const blocked = lines.some((l) => l.problem) || !lines.length || method === 'delivery' && !address.trim();

  const create = () => {
    let placed: {id: string;number: number;} | null = null;
    let message: string | null = null;
    const ok = commerce.apply((d: CommerceData) => {
      const r = placeOrder(d, {
        lines: lines.map((l) => ({ productId: l.pick.id, variantId: l.variant!.id, qty: l.pick.qty })),
        customer: { name: contact.name || submission.contactName || 'Form respondent', phone: contact.phone, email: contact.email },
        fulfilment: method === 'pickup' ? { method: 'pickup', address: commerce.data.fulfilment.pickupAddress } : { method: 'delivery', address: address.trim() },
        deliveryNgn,
        outcome: fullyPaid ? 'success' : 'pending',
        plan: current.plan,
        sourceHandle: submission.pageHandle ?? undefined
      });
      if (!r.ok) {
        message = r.message.replace('Nothing was charged.', '').trim();
        return d;
      }
      const label = (e: OrderEvent): OrderEvent =>
      e.kind === 'placed' ?
      { ...e, label: `Created from a response to “${form.name}”` } :
      e.kind === 'paid' ?
      { ...e, label: `Paid in the form (test mode${submission.payment ? `, ref ${submission.payment.reference}` : ''})` } :
      e.kind === 'payment' ?
      { ...e, label: paidInForm ? `${formatNgn(paidInForm)} was paid in the form — ${formatNgn(total - paidInForm)} still to collect` : 'Awaiting payment — send the customer a payment link' } :
      e;
      placed = { id: r.order.id, number: r.order.number };
      return { ...r.data, orders: r.data.orders.map((o) => o.id === r.order.id ? { ...o, events: o.events.map(label), note: `From a “${form.name}” form response.` } : o) };
    });
    const p = placed as {id: string;number: number;} | null;
    if (!ok) return;
    if (!p) {
      setFailure(message ?? 'The order couldn’t be created.');
      return;
    }
    onCreated(p.id, p.number);
    toast(`Order #${p.number} created`, { description: fullyPaid ? 'Marked paid — the form payment covered it.' : 'Waiting for payment. Stock is reserved.' });
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      side="right"
      size="md"
      title="Create order"
      description={`From ${submission.contactName || 'this response'}`}
      footer={
      <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={create} disabled={blocked}>
            Create order · {formatNgn(total)}
          </Button>
        </div>
      }>
      
      <div className="flex flex-col gap-6 px-5 py-5">
        {failure &&
        <InlineAlert tone="danger" title="Couldn’t create the order">
            {failure}
          </InlineAlert>
        }

        <section aria-labelledby="co-items" className="flex flex-col gap-3">
          <h3 id="co-items" className="text-label font-semibold text-fg">
            Items
          </h3>
          <ul className="flex flex-col divide-y divide-line border-y border-line">
            {lines.map((l) =>
            <li key={l.pick.id} className="flex flex-col gap-2 py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate text-label text-fg">
                    {l.pick.qty} × {l.product?.name ?? field.products?.find((x) => x.id === l.pick.id)?.name ?? 'Removed product'}
                  </span>
                  <span className="shrink-0 text-label tabular-nums text-fg">{l.price === null ? '—' : formatNgn(l.price * l.pick.qty)}</span>
                </div>
                {l.product && l.product.variants.length > 1 &&
              <SelectInput
                id={`co-var-${l.pick.id}`}
                label="Option"
                value={variants[l.pick.id] ?? ''}
                options={l.product.variants.map((v) => ({ value: v.id, label: `${variantLabel(v)}${l.product!.trackStock && l.product!.kind === 'physical' ? ` · ${v.stock} in stock` : ''}` }))}
                onChange={(v) => setVariants((s) => ({ ...s, [l.pick.id]: v }))}
                hint="The form didn’t ask which option — check with the customer." />

              }
                {l.problem && <p className="text-caption font-medium text-danger">{l.problem}</p>}
              </li>
            )}
          </ul>
          <p className="text-caption text-fg-muted">Prices come from Commerce today, which may differ from what the form showed.</p>
        </section>

        <section aria-labelledby="co-ful" className="flex flex-col gap-3">
          <h3 id="co-ful" className="text-label font-semibold text-fg">
            Getting it to them
          </h3>
          <Segmented<Method>
            ariaLabel="Fulfilment"
            value={method}
            onChange={setMethod}
            options={[
            { value: 'pickup', label: 'Pickup' },
            { value: 'delivery', label: 'Delivery' }]
            }
            size="sm" />
          
          {method === 'delivery' &&
          <>
              <TextArea id="co-addr" label="Delivery address" rows={2} value={address} onChange={(e) => setAddress(e.target.value)} error={address.trim() ? undefined : 'Add an address'} />
              <TextInput id="co-fee" label="Delivery fee (₦)" type="number" inputMode="numeric" min={0} value={fee} onChange={(e) => setFee(e.target.value)} fieldClassName="w-48" />
            </>
          }
        </section>

        <section aria-labelledby="co-pay" className="flex flex-col gap-2 border-t border-line pt-5">
          <h3 id="co-pay" className="text-label font-semibold text-fg">
            Payment
          </h3>
          <p className="text-label text-fg">
            {fullyPaid ? `Paid in the form — ${formatNgn(paidInForm)} (test). The order is marked paid.` : paidInForm ? `${formatNgn(paidInForm)} was paid in the form. The order waits for the remaining ${formatNgn(total - paidInForm)}.` : 'Nothing was paid in the form. The order waits for payment.'}
          </p>
          <p className="text-caption text-fg-muted">Stock is reserved as soon as the order is created, and the customer is added to Audience like any order.</p>
        </section>
      </div>
    </Sheet>);

}