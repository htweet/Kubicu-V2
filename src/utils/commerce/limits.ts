import type { CommerceData } from '../../types/commerce';
import type { WorkspacePlan } from '../../types/plan';

/** Plan limits are hypotheses for testing, not final. */
export function productLimit(plan: WorkspacePlan): number | null {
  return plan === 'free' ? 5 : null;
}

export function countedProducts(data: CommerceData): number {
  return data.products.filter((p) => p.status !== 'archived').length;
}

export function productsRemaining(data: CommerceData, plan: WorkspacePlan): number | null {
  const limit = productLimit(plan);
  return limit === null ? null : Math.max(0, limit - countedProducts(data));
}