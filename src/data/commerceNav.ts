export const commerceNav = [
{ to: '/app/commerce', label: 'Overview', end: true },
{ to: '/app/commerce/orders', label: 'Orders' },
{ to: '/app/commerce/products', label: 'Products' },
{ to: '/app/commerce/storefront', label: 'Storefront' },
{ to: '/app/commerce/inventory', label: 'Inventory' },
{ to: '/app/commerce/digital', label: 'Digital' },
{ to: '/app/commerce/events', label: 'Events' },
{ to: '/app/commerce/subscriptions', label: 'Subscriptions' },
{ to: '/app/commerce/discounts', label: 'Discounts' },
{ to: '/app/commerce/payments', label: 'Payments' },
{ to: '/app/commerce/reports', label: 'Reports' },
{ to: '/app/commerce/settings', label: 'Settings' }];


export const orderStatusLabels = {
  new: 'New',
  paid: 'Paid',
  packing: 'Packing',
  out_for_delivery: 'Out for delivery',
  completed: 'Completed',
  cancelled: 'Cancelled',
  refunded: 'Refunded'
} as const;

export const paymentStatusLabels = {
  pending: 'Payment pending',
  paid: 'Paid',
  partially_refunded: 'Partly refunded',
  refunded: 'Refunded',
  cancelled: 'Not paid'
} as const;

export const stockReasonLabels = {
  received: 'Received',
  correction: 'Correction',
  damaged: 'Damaged / lost',
  order: 'Order',
  cancelled: 'Order cancelled',
  returned: 'Returned',
  created: 'Opening stock'
} as const;

/** Illustrative payment providers — availability and methods depend on the provider and merchant. */
export const paymentProviders = [
{ id: 'paystack' as const, name: 'Paystack', blurb: 'Cards, bank transfer, USSD and Apple Pay for Nigerian businesses.', methods: ['Card', 'Bank transfer', 'USSD', 'Apple Pay'] },
{ id: 'flutterwave' as const, name: 'Flutterwave', blurb: 'Cards, bank transfer, USSD and mobile money across Africa.', methods: ['Card', 'Bank transfer', 'USSD', 'Mobile money'] }];