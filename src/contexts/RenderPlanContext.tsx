import React, { createContext, useContext } from 'react';
import type { PlanInfo } from '../data/plans';
import { usePlan } from './PlanContext';

const RenderPlanContext = createContext<PlanInfo | null>(null);

/** The plan of the page being rendered (may differ from the signed-in workspace on public pages). */
export function RenderPlanProvider({ plan, children }: { plan: PlanInfo; children: React.ReactNode }) {
  return <RenderPlanContext.Provider value={plan}>{children}</RenderPlanContext.Provider>;
}

export function useRenderPlan(): PlanInfo {
  const override = useContext(RenderPlanContext);
  const workspace = usePlan();
  return override ?? workspace;
}
