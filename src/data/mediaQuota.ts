import type { WorkspacePlan } from '../types/plan';

const MB = 1024 * 1024;

/** Media storage per plan — example figures until pricing is confirmed (D47). */
export const mediaQuota: Record<WorkspacePlan, number> = {
  free: 100 * MB,
  creator: 1024 * MB,
  pro: 5 * 1024 * MB,
  business: 10 * 1024 * MB,
  agency: 25 * 1024 * MB,
  enterprise: 50 * 1024 * MB
};