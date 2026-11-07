import React, { useState } from 'react';
import { CalendarClockIcon, Loader2Icon } from 'lucide-react';
import type { CommerceData, Order } from '../../types/commerce';
import type { PageTheme } from '../../types/page';
import { cardStyle, mix } from '../blocks/pageStyle';
import { PrimaryButton } from './checkoutUi';
import { everyLabels, instalmentsOwed, nextAttemptAt, nextPart, payPart, updateInstalmentCard } from '../../utils/commerce/payOptions';
import { creditInstalment } from '../../utils/money/instalments';
import { formatNgn } from '../../utils/format';

interface Props {
  theme: PageTheme;
  order: Order;
  workspaceId: string | null;
  apply: (fn: (d: CommerceData) => CommerceData) => boolean;
}

const day = (iso: string) => new Date(iso).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' });

/** Buyer's view of an order paid in parts (D112): the schedule, pay the next part early, or change card. */
export function OrderInstalmentsCard({ theme: t, order, workspaceId, apply }: Props) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [cardOpen, setCardOpen] = useState(false);
  const [last4, setLast4] = useState('');
  const inst = order.instalments;
  if (!inst) return null;
  const muted = { color: t.mutedText };
  const next = nextPart(order);
  const owed = instalmentsOwed(order);
  const total = inst.parts.length;
  const live = inst.status === 'active' || inst.status === 'defaulted';

  const payNext = () => {
    if (!next) return;
    setBusy(true);
    setMessage('');
    window.setTimeout(() => {
      setBusy(false);
      if (workspaceId) creditInstalment(workspaceId, order, next);
      if (apply((d) => payPart(d, order.id, next.id, 'online'))) setMessage(`Part ${next.n} paid — thank you.`);
      else setMessage('Couldn’t take the payment. Please try again.');
    }, 900);
  };

  const saveCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(last4)) return setMessage('Enter the last 4 digits of the new card.');
    // A new card takes a failed part straight away, like a subscription.
    const failed = next?.status === 'failed' ? next : null;
    if (failed && workspaceId) creditInstalment(workspaceId, order, failed);
    apply((d) => {
      const withCard = updateInstalmentCard(d, order.id, { brand: last4.startsWith('5') ? 'Mastercard' : last4.startsWith('6') ? 'Verve' : 'Visa', last4 });
      return failed ? payPart(withCard, order.id, failed.id, 'card') : withCard;
    });
    setCardOpen(false);
    setLast4('');
    setMessage(failed ? `Card updated and part ${failed.n} paid.` : 'Card updated for the next parts.');
  };

  return (
    <section className="flex flex-col gap-4 p-5" style={cardStyle(t)} aria-labelledby="inst-heading">
      <div className="flex items-start gap-3">
        <CalendarClockIcon size={18} aria-hidden className="mt-0.5 shrink-0" />
        <div>
          <h2 id="inst-heading" className="text-[15px] font-semibold">
            {owed > 0 && inst.status !== 'cancelled' ? `Paying in ${total} parts · ${formatNgn(owed)} to go` : inst.status === 'completed' ? 'Fully paid — thank you' : `Paid in ${total} parts`}
          </h2>
          <p className="mt-0.5 text-[13px] leading-snug" style={muted}>
            {inst.status === 'cancelled'
              ? 'The seller cancelled the remaining parts. Nothing more will be charged.'
              : inst.status === 'defaulted'
                ? 'We couldn’t take a part after several tries. Pay it now or update your card — or message the seller.'
                : `Charged ${everyLabels[inst.every]} to ${inst.card.brand} ····${inst.card.last4}. ${inst.ship === 'last' && owed > 0 ? 'Your order is sent once it’s fully paid.' : ''}`}
          </p>
        </div>
      </div>
      <ol className="flex flex-col gap-1.5 text-[14px]">
        {inst.parts.map((p) => {
          const attempt = nextAttemptAt(p);
          return (
            <li key={p.id} className="flex items-baseline justify-between gap-3">
              <span>
                Part {p.n}
                <span style={muted}>
                  {' '}
                  · {p.status === 'paid' ? 'Paid' : p.status === 'failed' ? `Didn’t go through${attempt ? ` — retrying ${day(attempt)}` : ''}` : p.status === 'cancelled' ? 'Cancelled' : day(p.dueAt)}
                </span>
              </span>
              <span className="font-semibold tabular-nums" style={{ textDecoration: p.status === 'cancelled' ? 'line-through' : undefined }}>
                {formatNgn(p.amountNgn)}
              </span>
            </li>
          );
        })}
      </ol>
      {message && (
        <p className="text-[13px] font-semibold" role="status">
          {message}
        </p>
      )}
      {live && next && (
        <div className="flex flex-col gap-2">
          <PrimaryButton theme={t} onClick={payNext} disabled={busy}>
            {busy ? (
              <span className="inline-flex items-center gap-2">
                <Loader2Icon size={16} className="animate-spin motion-reduce:animate-none" aria-hidden /> Paying…
              </span>
            ) : (
              `Pay part ${next.n} now · ${formatNgn(next.amountNgn)}`
            )}
          </PrimaryButton>
          {cardOpen ? (
            <form onSubmit={saveCard} className="flex items-end gap-2">
              <label className="flex flex-1 flex-col gap-1 text-[13px] font-medium">
                Last 4 digits of the new card (test)
                <input value={last4} onChange={(e) => setLast4(e.target.value.replace(/\D/g, '').slice(0, 4))} inputMode="numeric" className="h-11 rounded-md px-3 text-[15px]" style={{ background: t.background, border: `1px solid ${mix(t.text, 18)}`, color: t.text }} />
              </label>
              <button type="submit" className="h-11 rounded-md px-4 text-[14px] font-semibold" style={{ background: mix(t.text, 8), color: t.text }}>
                Save
              </button>
            </form>
          ) : (
            <button type="button" onClick={() => setCardOpen(true)} className="self-center text-[13.5px] font-semibold underline underline-offset-2">
              Update my card
            </button>
          )}
        </div>
      )}
    </section>
  );
}
