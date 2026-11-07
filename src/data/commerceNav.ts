import { providersIn } from './providers';
import type { PaymentProviderId } from '../types/commerce';

export const commerceNav = [
  { to: '/app/commerce', label: 'Overview', end: true },
  { to: '/app/commerce/orders', label: 'Orders' },
  { to: '/app/commerce/products', label: 'Products' },
  { to: '/app/commerce/storefront', label: 'Storefront' },
  { to: '/app/commerce/inventory', label: 'Inventory' },
  { to: '/app/commerce/branches', label: 'Branches' },
  { to: '/app/commerce/digital', label: 'Digital' },
  { to: '/app/commerce/courses', label: 'Courses' },
  { to: '/app/commerce/events', label: 'Events' },
  { to: '/app/commerce/subscriptions', label: 'Subscriptions' },
  { to: '/app/commerce/discounts', label: 'Discounts' },
  { to: '/app/commerce/gift-cards', label: 'Gift cards' },
  { to: '/app/commerce/payments', label: 'Payments' },
  { to: '/app/commerce/wallet', label: 'Wallet' },
  { to: '/app/commerce/verification', label: 'Verification' },
  { to: '/app/commerce/payment-links', label: 'Payment links' },
  { to: '/app/commerce/reports', label: 'Reports' },
  { to: '/app/commerce/settings', label: 'Settings' },
];

export const orderStatusLabels = {
  new: 'New',
  paid: 'Paid',
  packing: 'Packing',
  out_for_delivery: 'Out for delivery',
  completed: 'Completed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
} as const;

export const paymentStatusLabels = {
  pending: 'Payment pending',
  paid: 'Paid',
  partially_refunded: 'Partly refunded',
  refunded: 'Refunded',
  cancelled: 'Not paid',
} as const;

export const stockReasonLabels = {
  received: 'Received',
  correction: 'Correction',
  damaged: 'Damaged / lost',
  order: 'Order',
  cancelled: 'Order cancelled',
  returned: 'Returned',
  created: 'Opening stock',
  transfer: 'Moved between branches',
} as const;

/** Payment providers, from the provider registry (D192) — availability and methods depend on the provider and merchant. */
export const paymentProviders = providersIn('payments').map((p) => ({ id: p.id as PaymentProviderId, name: p.name, blurb: p.blurb, methods: p.tags }));
