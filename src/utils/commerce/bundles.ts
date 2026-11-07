import type { Order, OrderItem, Product, ProductBundle } from '../../types/commerce';
import type { Partnership } from '../../types/partnership';
import { kubicuRateByPlan, orderMoney } from './money';

/**
 * Partner bundles (D122): one product sold by two businesses through one checkout.
 * - Each seller's share is worked out at payment on what the customer actually paid for the goods
 *   (after discounts, before delivery), and lands in that seller's wallet — or escrow — straight away.
 * - The payment provider's fee is shared in proportion; each business pays its own KUBICU fee.
 * - Refunds come back from each share in the same proportion.
 * - Pay on delivery and instalments aren't offered, because cash at the door can't be split.
 */

/** Guests have no KUBICU plan, so they pay the Free-plan fee on their share. */
export const GUEST_FEE_RATE = kubicuRateByPlan.free;

export const NOT_FOR_BUNDLES = 'Not for things sold with a partner — pay online so each business gets its share.';

/** Naira the partner gets for one unit sold at `unitPriceNgn`, before discounts. */
export function partnerUnitNgn(b: ProductBundle, unitPriceNgn: number): number {
  if (b.split === 'fixed') return Math.max(0, Math.min(unitPriceNgn, b.partnerFixedNgn ?? 0));
  return Math.round((unitPriceNgn * (100 - b.leadSharePct)) / 100);
}

export function bundleLineFor(product: Product, unitPriceNgn: number): OrderItem['bundle'] {
  const b = product.bundle;
  if (!b) return undefined;
  return { partnershipId: b.partnershipId, partnerName: b.partnerName, partnerKind: b.partnerKind, partnerPart: b.partnerPart, partnerUnitNgn: partnerUnitNgn(b, unitPriceNgn), escrow: b.partnerKind === 'connected' && !!b.partnerEscrow };
}

/** Partner gross for a set of lines, scaled by the discount on the goods. */
export function partnerGrossFor(items: Pick<OrderItem, 'bundle' | 'qty'>[], subtotalNgn: number, discountNgn: number): number {
  const raw = items.reduce((s, i) => s + (i.bundle ? i.bundle.partnerUnitNgn * i.qty : 0), 0);
  if (!raw || subtotalNgn <= 0) return 0;
  const goodsPaid = subtotalNgn - Math.min(discountNgn, subtotalNgn);
  return Math.round((raw * goodsPaid) / subtotalNgn);
}

export const hasBundle = (o: Order) => o.items.some((i) => !!i.bundle);

/** Problems that stop a bundle product being saved (status matters: some only block going live). */
export function bundleIssue(b: ProductBundle, price: number | null, status: Product['status'], partnership: Partnership | undefined): string | null {
  const live = status === 'active';
  if (live && (!partnership || (partnership.status !== 'active' && partnership.status !== 'ending'))) return 'That partnership isn’t active. Choose another partner, turn this off, or keep the product as a draft.';
  if (b.split === 'fixed') {
    if (!b.partnerFixedNgn) return `Enter what ${b.partnerName} gets for each one sold.`;
    if (price !== null && b.partnerFixedNgn >= price) return `${b.partnerName}’s amount has to be less than the price.`;
    if (live && !b.partnerAcceptedAt) return `${b.partnerName} needs to accept the amount before this product can be active.`;
  }
  return null;
}

export type ShareStatus = 'pending' | 'held' | 'in_wallet' | 'awaiting_delivery' | 'paid_to_bank' | 'refunded';

export const shareStatusLabels: Record<ShareStatus, string> = {
  pending: 'Waiting for payment',
  held: 'Held in escrow until delivery',
  in_wallet: 'In their KUBICU wallet',
  awaiting_delivery: 'Sent to their bank after delivery',
  paid_to_bank: 'Sent to their bank',
  refunded: 'Refunded',
};

export const shareStatusTones: Record<ShareStatus, 'neutral' | 'info' | 'success' | 'warning'> = {
  pending: 'neutral',
  held: 'info',
  in_wallet: 'success',
  awaiting_delivery: 'warning',
  paid_to_bank: 'success',
  refunded: 'neutral',
};

export interface PartnerShare {
  partnershipId: string;
  partnerName: string;
  partnerKind: 'connected' | 'guest';
  escrow: boolean;
  /** Their part of what the customer paid. */
  grossNgn: number;
  /** Their part of the payment provider's fee. */
  providerFeeNgn: number;
  /** Guests: 2% Free-plan fee. Connected partners pay their own plan's fee in their own wallet. */
  kubicuFeeNgn: number | null;
  refundedNgn: number;
  /** What reaches them after the provider fee, their KUBICU fee (guests) and refunds. */
  netNgn: number;
  status: ShareStatus;
}

/** Each partner's share of an order, as both businesses see it. */
export function orderPartnerShares(o: Order): PartnerShare[] {
  const byPartner = new Map<string, OrderItem[]>();
  o.items.forEach((i) => {
    if (!i.bundle) return;
    byPartner.set(i.bundle.partnershipId, [...(byPartner.get(i.bundle.partnershipId) ?? []), i]);
  });
  if (!byPartner.size) return [];
  const m = orderMoney(o);
  const paid = o.paymentStatus !== 'pending' && o.paymentStatus !== 'cancelled';
  const delivered = o.status === 'completed';
  return [...byPartner.values()].map((lines) => {
    const b = lines[0].bundle!;
    const gross = partnerGrossFor(lines, o.subtotalNgn, o.discountNgn);
    const ratio = m.gross > 0 ? gross / m.gross : 0;
    const provider = paid ? Math.round(o.providerFeeNgn * ratio) : 0;
    const refunded = Math.round(m.refunded * ratio);
    const fee = b.partnerKind === 'guest' && paid ? Math.round((gross - refunded) * GUEST_FEE_RATE) : null;
    const fullyRefunded = o.paymentStatus === 'refunded';
    const status: ShareStatus = !paid ? 'pending' : fullyRefunded ? 'refunded' : b.partnerKind === 'guest' ? (delivered ? 'paid_to_bank' : 'awaiting_delivery') : b.escrow && !delivered ? 'held' : 'in_wallet';
    return {
      partnershipId: b.partnershipId,
      partnerName: b.partnerName,
      partnerKind: b.partnerKind,
      escrow: !!b.escrow,
      grossNgn: paid ? gross : 0,
      providerFeeNgn: provider,
      kubicuFeeNgn: fee,
      refundedNgn: refunded,
      netNgn: paid ? Math.max(0, gross - provider - refunded - (fee ?? 0)) : 0,
      status,
    };
  });
}

/** What leaves the lead's wallet for partners on one order (gross less their part of the provider fee). */
export function partnerDebitNgn(o: Order): number {
  return orderPartnerShares(o).reduce((s, x) => s + x.grossNgn - x.providerFeeNgn, 0);
}

/** The partners' combined share of what the customer paid — used to split a refund in proportion. */
export function partnerRatio(o: Order): number {
  const m = orderMoney(o);
  if (m.gross <= 0) return 0;
  const gross = o.items.length ? partnerGrossFor(o.items, o.subtotalNgn, o.discountNgn) : 0;
  return gross / m.gross;
}
