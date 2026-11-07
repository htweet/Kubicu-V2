import type { Order } from '../../types/commerce';
import type { WorkspacePlan } from '../../types/plan';

/**
 * ILLUSTRATIVE fee model — not real provider pricing. Modelled loosely on common
 * Nigerian card processing (percentage + flat fee, capped) pending a provider decision.
 */
export const PROVIDER_RATE = 0.015;
export const PROVIDER_FLAT_NGN = 100;
export const PROVIDER_FLAT_WAIVED_UNDER_NGN = 2500;
export const PROVIDER_CAP_NGN = 2000;

export const kubicuRateByPlan: Record<WorkspacePlan, number> = {
  free: 0.02,
  creator: 0.015,
  pro: 0.01,
  business: 0.005,
  agency: 0,
  enterprise: 0,
};

export function providerFee(totalNgn: number): number {
  if (totalNgn <= 0) return 0;
  const flat = totalNgn < PROVIDER_FLAT_WAIVED_UNDER_NGN ? 0 : PROVIDER_FLAT_NGN;
  return Math.min(PROVIDER_CAP_NGN, Math.round(totalNgn * PROVIDER_RATE + flat));
}

export function kubicuFee(totalNgn: number, plan: WorkspacePlan): number {
  return Math.round(totalNgn * kubicuRateByPlan[plan]);
}

export interface OrderMoney {
  subtotal: number;
  discount: number;
  delivery: number;
  /** What the customer paid. */
  gross: number;
  providerFee: number;
  kubicuFee: number;
  refunded: number;
  /** What the seller keeps after fees and refunds. */
  net: number;
  /** VAT on the order (D222): inside the prices when inclusive, added to `gross` when not. */
  vat: number;
  vatInclusive: boolean;
  vatRatePct: number;
}

export function orderMoney(order: Order): OrderMoney {
  // Made-to-order: an unpaid balance isn't money the customer has paid yet (D95).
  const balanceOwed = order.balance && !order.balance.paidAt ? order.balance.dueNgn : 0;
  // Instalments (D112): parts not yet paid — and cancelled parts that never will be — aren't money paid.
  const partsOwed = order.instalments ? order.instalments.parts.filter((p) => p.status !== 'paid').reduce((s, p) => s + p.amountNgn, 0) : 0;
  const owed = balanceOwed + partsOwed;
  const vatAdded = order.vat && !order.vat.inclusive ? order.vat.amountNgn : 0;
  const gross = order.subtotalNgn - order.discountNgn + order.deliveryNgn + vatAdded - owed;
  const refunded = order.refunds.reduce((s, r) => s + r.amountNgn, 0);
  const paid = order.paymentStatus !== 'pending' && order.paymentStatus !== 'cancelled';
  const providerFeeNgn = paid ? order.providerFeeNgn : 0;
  const kubicuFeeNgn = paid ? order.kubicuFeeNgn : 0;
  return {
    subtotal: order.subtotalNgn,
    discount: order.discountNgn,
    delivery: order.deliveryNgn,
    gross,
    providerFee: providerFeeNgn,
    kubicuFee: kubicuFeeNgn,
    refunded,
    net: paid ? gross - providerFeeNgn - kubicuFeeNgn - refunded : 0,
    vat: order.vat?.amountNgn ?? 0,
    vatInclusive: order.vat?.inclusive ?? true,
    vatRatePct: order.vat?.ratePct ?? 0,
  };
}

export function refundableNgn(order: Order): number {
  const m = orderMoney(order);
  return Math.max(0, m.gross - m.refunded);
}

export function feeRateLabel(plan: WorkspacePlan): string {
  const pct = (kubicuRateByPlan[plan] * 100).toLocaleString('en-NG', { maximumFractionDigits: 1 });
  return `${pct}%`;
}
