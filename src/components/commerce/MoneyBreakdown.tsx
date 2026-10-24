import React from 'react';
import type { OrderMoney } from '../../utils/commerce/money';
import { formatNgn } from '../../utils/format';
import { IllustrativeTag } from '../ui/IllustrativeTag';
import { cn } from '../../utils/cn';
import { useT } from '../../contexts/LocaleContext';

interface MoneyBreakdownProps {
  money: OrderMoney;
  /** Visitor view hides seller fees and net. */
  audience?: 'seller' | 'customer';
  className?: string;
  /** Which discount was applied, e.g. “EID20 · Eid sale — 20% off”. */
  discountLabel?: string;
}

/** Every money line shown separately, so fees and refunds are never hidden in a total. */
export function MoneyBreakdown({ money, audience = 'seller', className, discountLabel }: MoneyBreakdownProps) {
  const { t } = useT();
  const row = (label: React.ReactNode, value: number, opts: {negative?: boolean;strong?: boolean;muted?: boolean;} = {}) =>
  <div className={cn('flex items-baseline justify-between gap-4 py-1.5', opts.strong && 'border-t border-line pt-2.5')}>
      <dt className={cn('text-label', opts.strong ? 'font-semibold text-fg' : 'text-fg-muted')}>{typeof label === 'string' ? t(label) : label}</dt>
      <dd className={cn('tabular-nums text-label', opts.strong ? 'font-semibold text-fg' : opts.muted ? 'text-fg-subtle' : 'text-fg')}>
        {opts.negative && value > 0 ? '−' : ''}
        {formatNgn(value)}
      </dd>
    </div>;

  return (
    <dl className={cn('flex flex-col', className)}>
      {row('Subtotal', money.subtotal)}
      {money.discount > 0 && row(discountLabel ? `${t('Discount')} · ${discountLabel}` : 'Discount', money.discount, { negative: true })}
      {row('Delivery', money.delivery)}
      {row('Customer paid', money.gross, { strong: true })}
      {audience === 'seller' &&
      <>
          {row(
          <span className="inline-flex items-center gap-1.5">
              {t('Provider fee')} <IllustrativeTag note="Illustrative rate: 1.5% + ₦100 (waived under ₦2,500), capped at ₦2,000. Real fees depend on your provider." />
            </span>,
          money.providerFee,
          { negative: true }
        )}
          {row(
          <span className="inline-flex items-center gap-1.5">
              {t('KUBICU fee')}
            </span>,
          money.kubicuFee,
          { negative: true }
        )}
          {money.refunded > 0 && row('Refunded', money.refunded, { negative: true })}
          {row('You receive', money.net, { strong: true })}
          <p className="mt-1 text-caption text-fg-subtle">{t('Funds settle from your payment provider to your bank. KUBICU never holds your money.')}</p>
        </>
      }
    </dl>);

}