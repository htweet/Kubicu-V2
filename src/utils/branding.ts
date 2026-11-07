import type { PageDocument } from '../types/page';
import type { PlanInfo } from '../data/plans';

/** Free pages always show the badge; paid plans honour the owner's preference. */
export function showsKubicuBadge(doc: PageDocument, plan: PlanInfo): boolean {
  return !plan.canHideBadge || !doc.branding?.hideKubicuBadge;
}
