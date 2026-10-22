import React, { createContext, useContext } from 'react';
import type { WorkspacePlan } from '../types/plan';
import { plans, type PlanInfo } from '../data/plans';

const PlanContext = createContext<WorkspacePlan>('free');

export function PlanProvider({ plan, children }: {plan: WorkspacePlan;children: React.ReactNode;}) {
  return <PlanContext.Provider value={plan}>{children}</PlanContext.Provider>;
}

export function usePlan(): PlanInfo {
  return plans[useContext(PlanContext)];
}