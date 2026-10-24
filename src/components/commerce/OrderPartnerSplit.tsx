import React from 'react';
import { HandshakeIcon } from 'lucide-react';
import type { Order } from '../../types/commerce';
import { orderPartnerShares, shareStatusLabels, shareStatusTones } from '../../utils/commerce/bundles';
import { orderMoney } from '../../utils/commerce/money';
import { formatNgn } from '../../utils/format';
import { Badge } from '../ui/Badge';

/** How a partner bundle order was split between the businesses (D122). */
export function OrderPartnerSplit({ order, leadName }: {order: Order;leadName: string;}) {
  const shares = orderPartnerShares(order);
  if (!shares.length) return null;
  const m = orderMoney(order);
  const partnersGross = shares.reduce((s, x) => s + x.grossNgn, 0);
  const yours = Math.max(0, m.gross - partnersGross);
  const paid = shares[0].status !== 'pending';

  return (
    <section aria-labelledby={`split-${order.id}`} className="flex flex-col gap-3 rounded-md border border-line px-4 py-3">
      <h3 id={`split-${order.id}`} className="flex items-center gap-2 text-label font-semibold text-fg">
        <HandshakeIcon size={15} aria-hidden /> Sold with a partner
      </h3>
      <div className="flex h-2 overflow-hidden rounded-full" role="img" aria-label={`${leadName} ${formatNgn(yours)}, partners ${formatNgn(partnersGross)}`}>
        <span className="bg-action" style={{ width: `${m.gross ? yours / m.gross * 100 : 50}%` }} />
        <span className="bg-accent" style={{ width: `${m.gross ? partnersGross / m.gross * 100 : 50}%` }} />
      </div>
      <ul className="flex flex-col divide-y divide-line text-label">
        <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-2">
          <span className="flex min-w-0 items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full bg-action" aria-hidden />
            <span className="truncate text-fg">{leadName} (you)</span>
          </span>
          <span className="tabular-nums font-semibold text-fg">{formatNgn(yours)}</span>
        </li>
        {shares.map((s) =>
        <li key={s.partnershipId} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 py-2">
            <span className="min-w-0">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden />
                <span className="truncate text-fg">{s.partnerName}</span>
              </span>
              {paid &&
            <span className="mt-1 block pl-4">
                  <Badge tone={shareStatusTones[s.status]}>{shareStatusLabels[s.status]}</Badge>
                </span>
            }
            </span>
            <span className="text-right">
              <span className="block tabular-nums font-semibold text-fg">{formatNgn(s.grossNgn)}</span>
              {s.refundedNgn > 0 && <span className="block text-caption tabular-nums text-fg-subtle">−{formatNgn(s.refundedNgn)} refunded</span>}
            </span>
          </li>
        )}
      </ul>
      <p className="text-caption text-fg-muted">
        {paid ? 'Split at payment, as you both agreed: worked out on what the customer paid after the discount. Delivery isn’t split. The payment fee is shared in proportion, each business pays its own KUBICU fee, and refunds come back from each share in proportion.' : 'Nothing is split until the customer pays.'}
      </p>
    </section>);

}