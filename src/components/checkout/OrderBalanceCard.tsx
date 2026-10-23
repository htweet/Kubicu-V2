import React, { useState } from 'react';
import { CheckCircle2Icon, HammerIcon, Loader2Icon } from 'lucide-react';
import type { CommerceData, Order } from '../../types/commerce';
import type { PageTheme } from '../../types/page';
import { cardStyle, mix } from '../blocks/pageStyle';
import { PrimaryButton } from './checkoutUi';
import { longestLeadDays, payOrderBalance } from '../../utils/commerce/deposit';
import { readMoney, recordStagePayment, writeMoney } from '../../utils/money/store';
import { formatNgn, formatTimestamp } from '../../utils/format';

interface OrderBalanceCardProps {
  theme: PageTheme;
  order: Order;
  data: CommerceData | null;
  workspaceId: string | null;
  apply: (fn: (d: CommerceData) => CommerceData) => boolean;
}

/** Made-to-order: the buyer pays the balance from their order page before dispatch (D95). */
export function OrderBalanceCard({ theme, order, data, workspaceId, apply }: OrderBalanceCardProps) {
  const [outcome, setOutcome] = useState<'success' | 'declined'>('success');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const balance = order.balance;
  if (!balance) return null;
  const muted = { color: theme.mutedText };
  const lead = data ? longestLeadDays(data, order) : 0;

  if (balance.paidAt) {
    return (
      <section className="flex items-start gap-3 p-4" style={cardStyle(theme)} aria-label="Balance">
        <CheckCircle2Icon size={18} aria-hidden className="mt-0.5 shrink-0" />
        <p className="text-[14px] leading-snug">
          <span className="font-semibold">Balance of {formatNgn(balance.dueNgn)} paid</span>
          <span className="block text-[13px]" style={muted}>
            {formatTimestamp(balance.paidAt)} · your order can now be sent out.
          </span>
        </p>
      </section>);

  }

  const pay = () => {
    setBusy(true);
    setError('');
    window.setTimeout(() => {
      setBusy(false);
      if (outcome === 'declined') return setError('Your card was declined (test). Nothing was charged — try again or use another card.');
      // Wallet first: reading it syncs the original sale, which must not yet include this balance.
      const before = workspaceId ? readMoney(workspaceId) : null;
      if (!apply((d) => payOrderBalance(d, order.id, 'online'))) return setError('Couldn’t take the payment. Please try again.');
      if (workspaceId && before) writeMoney(workspaceId, recordStagePayment(before, 'shop', { type: 'order', id: order.id }, `Balance · order #${order.number} · ${order.customer.name || 'Customer'}`, balance.dueNgn).data);
    }, 1000);
  };

  return (
    <section className="flex flex-col gap-4 p-5" style={cardStyle(theme)} aria-labelledby="balance-heading">
      <div className="flex items-start gap-3">
        <HammerIcon size={18} aria-hidden className="mt-0.5 shrink-0" />
        <div>
          <h2 id="balance-heading" className="text-[15px] font-semibold">
            {formatNgn(balance.dueNgn)} balance due before dispatch
          </h2>
          <p className="mt-0.5 text-[13px] leading-snug" style={muted}>
            Your deposit is in and the seller is making your order{lead ? ` (usually about ${lead} day${lead === 1 ? '' : 's'})` : ''}. Pay the balance any time — it’s sent out once it’s paid.
            {balance.requestedAt ? ` The seller asked for it on ${formatTimestamp(balance.requestedAt)}.` : ''}
          </p>
        </div>
      </div>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-[13px] font-semibold">Test card — choose what happens</legend>
        {(
        [
        { v: 'success', label: 'Succeeds', hint: '4084 0840 8408 4081' },
        { v: 'declined', label: 'Declined', hint: 'Card declined by the bank' }] as
        const).
        map((o) =>
        <label key={o.v} className="flex cursor-pointer items-start gap-3 p-3" style={{ ...cardStyle(theme), border: `1.5px solid ${outcome === o.v ? theme.text : mix(theme.text, 12)}` }}>
            <input type="radio" name="balance-outcome" checked={outcome === o.v} onChange={() => setOutcome(o.v)} className="mt-1" style={{ accentColor: theme.text }} />
            <span>
              <span className="block text-[14px] font-semibold">{o.label}</span>
              <span className="block text-[12px]" style={muted}>
                {o.hint}
              </span>
            </span>
          </label>
        )}
      </fieldset>
      {error &&
      <p className="text-[13px] font-semibold" role="alert">
          {error}
        </p>
      }
      <PrimaryButton theme={theme} onClick={pay} disabled={busy}>
        {busy ?
        <span className="inline-flex items-center gap-2">
            <Loader2Icon size={16} className="animate-spin motion-reduce:animate-none" aria-hidden /> Paying…
          </span> :

        `Pay ${formatNgn(balance.dueNgn)} balance`
        }
      </PrimaryButton>
    </section>);

}