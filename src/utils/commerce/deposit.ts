import type { CommerceData, Order, OrderEvent, OrderEventKind, Product } from '../../types/commerce';
import { uid } from '../id';
import { providerFee } from './money';

/** Made-to-order deposits (D95): a share at checkout, the rest before dispatch. */
export const depositPctOptions = [20, 30, 40, 50, 60, 70, 80];
export const DEFAULT_DEPOSIT_PCT = 50;
export const DEFAULT_LEAD_DAYS = 7;

export function isMadeToOrder(p: Product | undefined): p is Product & {madeToOrder: NonNullable<Product['madeToOrder']>;} {
  return !!p && p.kind === 'physical' && !!p.madeToOrder;
}

/** The part of one line that waits until before dispatch. */
export function lineBalanceNgn(p: Product | undefined, lineTotalNgn: number): number {
  if (!isMadeToOrder(p)) return 0;
  return Math.round(lineTotalNgn * (100 - p.madeToOrder.depositPct) / 100);
}

/** Balance for a set of lines, never more than the order total. */
export function cartBalanceNgn(products: Product[], lines: {productId: string;amountNgn: number;}[], orderTotalNgn: number): number {
  const sum = lines.reduce((s, l) => s + lineBalanceNgn(products.find((p) => p.id === l.productId), l.amountNgn), 0);
  return Math.max(0, Math.min(sum, orderTotalNgn));
}

export function balanceOwed(o: Order): number {
  return o.balance && !o.balance.paidAt ? o.balance.dueNgn : 0;
}

/** True while an unpaid balance should stop the order going out. */
export function dispatchBlocked(o: Order): boolean {
  return balanceOwed(o) > 0 && o.status !== 'cancelled' && o.status !== 'refunded';
}

export function longestLeadDays(data: CommerceData, o: Order): number {
  return o.items.reduce((m, i) => {
    const p = data.products.find((x) => x.id === i.productId);
    return isMadeToOrder(p) ? Math.max(m, p.madeToOrder.leadDays) : m;
  }, 0);
}

function stamp(o: Order, kind: OrderEventKind, label: string): OrderEvent[] {
  return [{ id: uid('ev'), kind, label, at: new Date().toISOString() }, ...o.events];
}

/** Seller asks for the balance: records when, so the buyer page and Opportunities can show it. */
export function requestOrderBalance(data: CommerceData, orderId: string): CommerceData {
  return {
    ...data,
    orders: data.orders.map((o) => o.id === orderId && o.balance && !o.balance.paidAt ? { ...o, balance: { ...o.balance, requestedAt: new Date().toISOString() }, events: stamp(o, 'note', 'Balance requested from the customer') } : o)
  };
}

/** Balance paid online by the buyer or recorded by the seller. Fees grow in proportion to the new money. */
export function payOrderBalance(data: CommerceData, orderId: string, how: 'online' | 'recorded'): CommerceData {
  return {
    ...data,
    orders: data.orders.map((o) => {
      if (o.id !== orderId || !o.balance || o.balance.paidAt) return o;
      const due = o.balance.dueNgn;
      const charged = o.subtotalNgn - o.discountNgn + o.deliveryNgn - due;
      const kubicuRate = charged > 0 ? o.kubicuFeeNgn / charged : 0;
      const online = how === 'online';
      return {
        ...o,
        providerFeeNgn: o.providerFeeNgn + (online ? providerFee(due) : 0),
        kubicuFeeNgn: o.kubicuFeeNgn + (online ? Math.round(due * kubicuRate) : 0),
        balance: { ...o.balance, paidAt: new Date().toISOString(), how },
        events: stamp(o, 'paid', online ? `Balance paid online (test mode) — ready to dispatch` : 'Balance recorded as paid by you — ready to dispatch')
      };
    })
  };
}