import React from 'react';
import type { OrderMoney } from '../../utils/commerce/money';
import { formatNgn } from '../../utils/format';
import { IllustrativeTag } from '../ui/IllustrativeTag';
import { cn } from '../../utils/cn';

interface MoneyBreakdownProps {
  money: OrderMoney;
  /** Visitor view hides seller fees and net. */
  audience?: 'seller' | 'customer';
  className?: string;
}

/** Every money line shown separately, so fees and refunds are never hidden in a total. */
export function MoneyBreakdown({ money, audience = 'seller', className }: MoneyBreakdownProps) {
  const row = (label: React.ReactNode, value: number, opts: {negative?: boolean;strong?: boolean;muted?: boolean;} = {}) =>
  <div className={cn('flex items-baseline justify-between gap-4 py-1.5', opts.strong && 'border-t border-line pt-2.5')}>
      <dt className={cn('text-label', opts.strong ? 'font-semibold text-fg' : 'text-fg-muted')}>{label}</dt>
      <dd className={cn('tabular-nums text-label', opts.strong ? 'font-semibold text-fg' : opts.muted ? 'text-fg-subtle' : 'text-fg')}>
        {opts.negative && value > 0 ? '−' : ''}
        {formatNgn(value)}
      </dd>
    </div>;

  return (
    <dl className={cn('flex flex-col', className)}>
      {row('Subtotal', money.subtotal)}
      {money.discount > 0 && row('Discount', money.discount, { negative: true })}
      {row('Delivery', money.delivery)}
      {row('Customer paid', money.gross, { strong: true })}
      {audience === 'seller' &&
      <>
          {row(
          <span className="inline-flex items-center gap-1.5">
              Provider fee <IllustrativeTag note="Illustrative rate: 1.5% + ₦100 (waived under ₦2,500), capped at ₦2,000. Real fees depend on your provider." />
            </span>,
          money.providerFee,
          { negative: true }
        )}
          {row(
          <span className="inline-flex items-center gap-1.5">
              KUBICU fee <IllustrativeTag note="Illustrative platform fee by plan. Not final pricing." />
            </span>,
          money.kubicuFee,
          { negative: true }
        )}
          {money.refunded > 0 && row('Refunded', money.refunded, { negative: true })}
          {row('You receive', money.net, { strong: true })}
          <p className="mt-1 text-caption text-fg-subtle">Funds settle from your payment provider to your bank. KUBICU never holds your money.</p>
        </>
      }
    </dl>);

}