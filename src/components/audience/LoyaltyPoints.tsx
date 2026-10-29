import React from 'react';
import { AwardIcon } from 'lucide-react';
import { useCommerce } from '../../contexts/CommerceContext';
import { useMarketplace } from '../../contexts/MarketplaceContext';
import { LOYALTY_EXTENSION_ID, loyaltyBalance } from '../../utils/loyalty';
import { Badge } from '../ui/Badge';

/** A contact's points balance, when Loyalty points is on (D232). */
export function LoyaltyPoints({ phone }: {phone: string;}) {
  const { data } = useCommerce();
  const market = useMarketplace();
  const rec = market.data.installed[LOYALTY_EXTENSION_ID];
  if (!rec || !market.isActive(LOYALTY_EXTENSION_ID) || !phone) return null;
  const bal = loyaltyBalance(data, phone, rec.installedAt);
  if (!bal || !bal.earned && !bal.spent) return null;
  return (
    <Badge tone="info" icon={AwardIcon}>
      {bal.balance.toLocaleString()} points{bal.spent ? ` · ${bal.spent.toLocaleString()} used` : ''}
    </Badge>);

}