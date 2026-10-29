import type { DigitalAsset, Order } from '../../types/commerce';
import { orderRef } from './shopSettings';

/** Which kind of watermark this file gets for this buyer, if any (D125, D136). */
export function watermarkKind(asset: DigitalAsset): 'pdf' | 'image' | null {
  if (asset.stamp && /\.pdf$/i.test(asset.fileName)) return 'pdf';
  if (asset.watermarkImages && /\.(jpe?g|png|webp|gif|tiff?|heic)$/i.test(asset.fileName)) return 'image';
  return null;
}

/** "Licensed to Chiamaka Obi · chiamaka@example.com · Order #1042" — printed on the buyer's copy. */
export function copyLabel(order: Pick<Order, 'customer' | 'number'>): string {
  return `Licensed to ${order.customer.name}${order.customer.email ? ` · ${order.customer.email}` : ''} · Order ${orderRef(order)}`;
}