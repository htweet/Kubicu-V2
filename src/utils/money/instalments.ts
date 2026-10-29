import type { InstalmentPart, Order } from '../../types/commerce';
import { readMoney, recordStagePayment, writeMoney } from './store';
import { orderRef } from '../commerce/shopSettings';

/**
 * Credits one instalment that was paid by card or online, following the shop's payment setting (D112).
 * Call it BEFORE saving the paid part to Commerce: reading the wallet syncs the original sale, which
 * must not yet include this part.
 */
export function creditInstalment(workspaceId: string, order: Order, part: InstalmentPart): void {
  const total = order.instalments?.parts.length ?? 0;
  const label = `Instalment ${part.n} of ${total} · order ${orderRef(order)} · ${order.customer.name || 'Customer'}`;
  writeMoney(workspaceId, recordStagePayment(readMoney(workspaceId), 'shop', { type: 'order', id: order.id }, label, part.amountNgn, false).data);
}