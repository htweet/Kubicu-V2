import React from 'react';
import { AwardIcon } from 'lucide-react';
import type { CommerceData, Order } from '../../types/commerce';
import type { PageTheme } from '../../types/page';
import { extensionActive, readMarketplace } from '../../utils/marketplace';
import { LOYALTY_EXTENSION_ID, REDEEM_NGN, REDEEM_POINTS, loyaltyBalance, orderPoints } from '../../utils/loyalty';
import { cardStyle } from '../blocks/pageStyle';
import { formatNgn } from '../../utils/format';

/** Points earned on this order and the new balance, on the customer's receipt (D232). */
export function LoyaltyReceiptCard({ theme, workspaceId, order, data }: {theme: PageTheme;workspaceId: string | null;order: Order;data: CommerceData;}) {
  if (!workspaceId) return null;
  const m = readMarketplace(workspaceId);
  const rec = extensionActive(m, LOYALTY_EXTENSION_ID) ? m.installed[LOYALTY_EXTENSION_ID] : null;
  if (!rec || Date.parse(order.createdAt) < Date.parse(rec.installedAt)) return null;
  const earned = orderPoints(order);
  const bal = loyaltyBalance(data, order.customer.phone, rec.installedAt);
  if (!earned || !bal) return null;
  return (
    <section aria-labelledby="order-points" className="p-5" style={{ ...cardStyle(theme), borderRadius: 16 }}>
      <h2 id="order-points" className="flex items-center gap-2 text-[15px] font-semibold">
        <AwardIcon size={16} aria-hidden /> You earned {earned.toLocaleString()} points
      </h2>
      <p className="mt-1.5 text-[13.5px]" style={{ color: theme.mutedText }}>
        You now have {bal.balance.toLocaleString()}. {REDEEM_POINTS} points give {formatNgn(REDEEM_NGN)} off at checkout — use the same phone number.
      </p>
    </section>);

}