import type { MembersAreaSettings } from '../types/page';
import type { CommerceData } from '../types/commerce';
import type { WorkspacePlan } from '../types/plan';
import type { ValidationIssue } from './validation';
import { planAtLeast, plans } from '../data/plans';
import { CHECKOUT_PLAN } from './commerce/linkIssues';
import { subGrants } from './members';

/*
 * Members area spaces (D185). The whole space is behind the same live check as Members-only blocks:
 * an active (or trialing, cancelling-until-period-end, or in-grace) subscription to a chosen plan.
 */

/** Membership plans people can be given access through (boxes aren't memberships). */
export function membershipPlans(data: CommerceData | null | undefined) {
  return (data?.subPlans ?? []).filter((p) => p.kind === 'membership');
}

/** Subscribers who would get in right now. */
export function membersWithAccess(s: MembersAreaSettings, data: CommerceData | null | undefined, now = Date.now()): number {
  return (data?.subscriptions ?? []).filter((sub) => (s.rule.access === 'any' || s.rule.planIds.includes(sub.planId)) && subGrants(sub, now)).length;
}

/** Pre-publish checks for a Members area. */
export function membersAreaIssues(s: MembersAreaSettings, data: CommerceData | null, plan: WorkspacePlan): ValidationIssue[] {
  const out: ValidationIssue[] = [];
  const push = (id: string, severity: ValidationIssue['severity'], message: string, extra: Partial<ValidationIssue> = {}) => out.push({ id: `membersarea:${id}`, blockId: null, severity, message, ...extra });
  if (!planAtLeast(plan, CHECKOUT_PLAN))
    push('plan', 'error', `Members areas are on the ${plans[CHECKOUT_PLAN].name} plan, because members join through subscriptions.`, { upgradeTo: CHECKOUT_PLAN, upgradeFeature: 'Members areas' });
  if (s.rule.access === 'plans') {
    if (!s.rule.planIds.length) push('none', 'error', 'Choose which membership plans get in, in Page settings → Members area.');
    const chosen = s.rule.planIds.map((id) => data?.subPlans.find((p) => p.id === id));
    const missing = chosen.filter((p) => !p).length;
    if (missing) push('missing', 'error', `${missing} chosen plan${missing === 1 ? ' no longer exists' : 's no longer exist'} — choose again.`);
    else if (chosen.length && chosen.every((p) => p?.status === 'archived')) push('archived', 'warning', 'Every chosen plan is archived, so nobody new can join. Current members still get in.');
  }
  if (!membershipPlans(data).some((p) => p.status === 'active')) push('noplans', 'error', 'Create a membership plan people can join in Commerce → Subscriptions.');
  if (!s.title.trim()) push('title', 'warning', 'Add a welcome heading for people who aren’t members yet.');
  return out;
}
