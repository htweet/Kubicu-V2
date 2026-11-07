import React from 'react';
import type { OrderStatus, PaymentStatus, Product } from '../../types/commerce';
import { Badge, type BadgeTone } from '../ui/Badge';
import { orderStatusLabels, paymentStatusLabels } from '../../data/commerceNav';
import { displayStatus, isLowStock } from '../../utils/commerce/catalog';
import { useT } from '../../contexts/LocaleContext';

const orderTones: Record<OrderStatus, BadgeTone> = {
  new: 'info',
  paid: 'action',
  packing: 'accent',
  out_for_delivery: 'accent',
  completed: 'success',
  cancelled: 'neutral',
  refunded: 'neutral',
};

export function OrderStatusBadge({ status, pickup }: { status: OrderStatus; pickup?: boolean }) {
  const label = status === 'out_for_delivery' && pickup ? 'Ready for pickup' : orderStatusLabels[status];
  return (
    <Badge tone={orderTones[status]} dot>
      {label}
    </Badge>
  );
}

const paymentTones: Record<PaymentStatus, BadgeTone> = {
  pending: 'warning',
  paid: 'success',
  partially_refunded: 'neutral',
  refunded: 'neutral',
  cancelled: 'neutral',
};

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return <Badge tone={paymentTones[status]}>{paymentStatusLabels[status]}</Badge>;
}

export function ProductStatusBadge({ product }: { product: Product }) {
  const s = displayStatus(product);
  if (s === 'sold_out') return <Badge tone="danger">Sold out</Badge>;
  if (s === 'draft') return <Badge tone="neutral">Draft</Badge>;
  if (s === 'archived') return <Badge tone="neutral">Archived</Badge>;
  if (isLowStock(product)) return <Badge tone="warning">Low stock</Badge>;
  return <Badge tone="success">Active</Badge>;
}

export function SampleTag() {
  const { t } = useT();
  return (
    <span className="rounded-sm border border-dashed border-line-strong px-1.5 py-px text-meta font-medium text-fg-subtle" title={t('Sample data — clear it from Commerce settings')}>
      {t('Sample')}
    </span>
  );
}
