import type { WorkspacePlan } from '../types/plan';

/** Monthly AI credits per plan (D63). Example figures until pricing is set. */
export const aiCredits: Record<WorkspacePlan, number> = {
  free: 10,
  creator: 60,
  pro: 200,
  business: 500,
  agency: 1500,
  enterprise: 5000
};

/** What each kind of request uses. */
export const aiCost = {
  page: 5,
  block: 1
} as const;