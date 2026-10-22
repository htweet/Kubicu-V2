import type { WorkspacePlan } from '../types/plan';

export interface PlanInfo {
  id: WorkspacePlan;
  name: string;
  /** Indicative price hypothesis in NGN (blueprint §19.1) — not final. */
  priceHypothesis: string;
  intendedFor: string;
  /** Whether the "Made with KUBICU" footer can be turned off. */
  canHideBadge: boolean;
}

/**
 * Plan ladder from KUBICU_MASTER_BLUEPRINT.md §19.1. Names follow the blueprint;
 * prices are testing hypotheses pending a live pilot.
 */
export const plans: Record<WorkspacePlan, PlanInfo> = {
  free: { id: 'free', name: 'Free', priceHypothesis: '₦0', intendedFor: 'First-time creators and side hustles', canHideBadge: false },
  creator: {
    id: 'creator',
    name: 'Creator',
    priceHypothesis: '₦2,500–₦4,000/month',
    intendedFor: 'Creators and solo professionals',
    canHideBadge: true
  },
  pro: { id: 'pro', name: 'Pro', priceHypothesis: '₦6,000–₦10,000/month', intendedFor: 'Sellers and service providers', canHideBadge: true },
  business: {
    id: 'business',
    name: 'Business',
    priceHypothesis: '₦15,000–₦30,000/month',
    intendedFor: 'Growing SMEs and teams',
    canHideBadge: true
  },
  agency: {
    id: 'agency',
    name: 'Agency',
    priceHypothesis: '₦35,000–₦100,000+/month',
    intendedFor: 'Agencies and multi-brand operators',
    canHideBadge: true
  },
  enterprise: { id: 'enterprise', name: 'Enterprise', priceHypothesis: 'Custom', intendedFor: 'Large networks and partners', canHideBadge: true }
};

export const planOrder: WorkspacePlan[] = ['free', 'creator', 'pro', 'business', 'agency', 'enterprise'];

export function planAtLeast(plan: WorkspacePlan, min: WorkspacePlan): boolean {
  return planOrder.indexOf(plan) >= planOrder.indexOf(min);
}

/** "Brand control" starts at Creator (blueprint §19.1; backlog: "remove platform branding"). */
export const badgeRemovalPlanName = plans.creator.name;