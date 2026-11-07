import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { WorkspacePlan } from '../types/plan';
import type { BillingCycle } from '../types/billing';
import { ChangePlanDialog } from '../components/billing/ChangePlanDialog';

export interface UpgradeRequest {
  /** The lowest plan that unlocks what the user tried to do. */
  plan: WorkspacePlan;
  /** Plain description of the locked thing, e.g. “Checkout on your page”. */
  feature: string;
}

interface UpgradeValue {
  openUpgrade: (req: UpgradeRequest) => void;
  /** Open plan comparison, optionally jumping to one plan and cycle. */
  openPlans: (initial?: { plan: WorkspacePlan; cycle: BillingCycle }) => void;
}

type Open = { kind: 'feature'; req: UpgradeRequest } | { kind: 'plans'; initial?: { plan: WorkspacePlan; cycle: BillingCycle } } | null;

const UpgradeContext = createContext<UpgradeValue | null>(null);

/** Every upgrade button opens the same plan-change flow with billing (D65). */
export function UpgradeProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<Open>(null);
  const openUpgrade = useCallback((req: UpgradeRequest) => setOpen({ kind: 'feature', req }), []);
  const openPlans = useCallback((initial?: { plan: WorkspacePlan; cycle: BillingCycle }) => setOpen({ kind: 'plans', initial }), []);
  const value = useMemo(() => ({ openUpgrade, openPlans }), [openUpgrade, openPlans]);

  return (
    <UpgradeContext.Provider value={value}>
      {children}
      <ChangePlanDialog
        open={!!open}
        onClose={() => setOpen(null)}
        feature={open?.kind === 'feature' ? open.req.feature : undefined}
        minPlan={open?.kind === 'feature' ? open.req.plan : undefined}
        initial={open?.kind === 'plans' ? open.initial : undefined}
      />
    </UpgradeContext.Provider>
  );
}

export function useUpgrade(): UpgradeValue {
  const ctx = useContext(UpgradeContext);
  if (!ctx) throw new Error('useUpgrade must be used inside UpgradeProvider');
  return ctx;
}
