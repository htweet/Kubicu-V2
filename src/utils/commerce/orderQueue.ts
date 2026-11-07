import type { Order } from '../../types/commerce';

/**
 * Orders waiting on the seller (D247): to confirm (payment pending) or to pack (paid / packing).
 * One definition for the sidebar badge, the Commerce "Orders" tab badge and Commerce Overview,
 * so all three always show the same number. Out-for-delivery orders wait on the courier, not on you.
 */
export const needsSellerAction = (o: Order) => o.status === 'new' || o.status === 'paid' || o.status === 'packing';

export const ordersToActOn = (orders: Order[]) => orders.filter(needsSellerAction).length;
