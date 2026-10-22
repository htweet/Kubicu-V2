import React from 'react';
import type { InvoiceStatus } from '../../types/billing';
import { Badge } from '../ui/Badge';

const map: Record<InvoiceStatus | 'upcoming', {tone: 'success' | 'danger' | 'neutral' | 'info';label: string;}> = {
  paid: { tone: 'success', label: 'Paid' },
  failed: { tone: 'danger', label: 'Failed' },
  refunded: { tone: 'neutral', label: 'Refunded' },
  upcoming: { tone: 'info', label: 'Upcoming' }
};

export function InvoiceStatusBadge({ status }: {status: InvoiceStatus | 'upcoming';}) {
  return (
    <Badge tone={map[status].tone} dot>
      {map[status].label}
    </Badge>);

}