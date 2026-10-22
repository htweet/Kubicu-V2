import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckIcon } from 'lucide-react';
import type { WorkspacePlan } from '../types/plan';
import { planAtLeast, planOrder, plans } from '../data/plans';
import { planHighlights } from '../data/planHighlights';
import { usePlan } from './PlanContext';
import { useWorkspace } from './WorkspaceContext';
import { Dialog } from '../components/ui/Dialog';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { IllustrativeTag } from '../components/ui/IllustrativeTag';
import { cn } from '../utils/cn';

export interface UpgradeRequest {
  /** The lowest plan that unlocks what the user tried to do. */
  plan: WorkspacePlan;
  /** Plain description of the locked thing, e.g. “Checkout on your page”. */
  feature: string;
}

interface UpgradeValue {
  openUpgrade: (req: UpgradeRequest) => void;
}

const UpgradeContext = createContext<UpgradeValue | null>(null);

/** Plans offered in the dialog: at most three, starting with the one that unlocks the feature. */
function offered(current: WorkspacePlan, needed: WorkspacePlan): WorkspacePlan[] {
  const start = planOrder.indexOf(planAtLeast(current, needed) ? current : needed);
  return planOrder.slice(start, start + 3).filter((p) => p !== 'enterprise' && planOrder.indexOf(p) > planOrder.indexOf(current));
}

export function UpgradeProvider({ children }: {children: React.ReactNode;}) {
  const plan = usePlan();
  const { current, update } = useWorkspace();
  const [req, setReq] = useState<UpgradeRequest | null>(null);
  const openUpgrade = useCallback((r: UpgradeRequest) => setReq(r), []);
  const value = useMemo(() => ({ openUpgrade }), [openUpgrade]);
  const options = req ? offered(plan.id, req.plan) : [];

  const choose = (id: WorkspacePlan) => {
    update(current.id, { plan: id });
    toast.success(`You’re on ${plans[id].name}`, { description: 'Prototype only: no payment was taken. Billing arrives in Batch 6.' });
    setReq(null);
  };

  return (
    <UpgradeContext.Provider value={value}>
      {children}
      <Dialog
        open={!!req}
        onClose={() => setReq(null)}
        size="lg"
        onTop
        title={req ? `Upgrade to ${plans[req.plan].name}` : 'Upgrade'}
        description={
        req ?
        <>
              <span className="font-medium text-fg">{req.feature}</span> needs {plans[req.plan].name} or above. You’re on {plan.name}. Nothing you’ve made is deleted when plans change.
            </> :
        undefined
        }
        footer={
        <>
            <Link to="/pricing" className="mr-auto self-center text-label font-medium text-fg-muted hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus" onClick={() => setReq(null)}>
              Compare all plans
            </Link>
            <Button variant="secondary" onClick={() => setReq(null)}>
              Not now
            </Button>
          </>
        }>
        
        <ul className={cn('grid gap-3', options.length > 1 && 'sm:grid-cols-2', options.length > 2 && 'lg:grid-cols-3')}>
          {options.map((id) => {
            const p = plans[id];
            const recommended = id === req?.plan || req && planAtLeast(plan.id, req.plan) && id === options[0];
            return (
              <li key={id} className={cn('flex min-w-0 flex-col rounded-lg border p-4', recommended ? 'border-select bg-action-soft' : 'border-line bg-raised')}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-label font-semibold text-fg">{p.name}</span>
                  {recommended && <Badge tone="info">Unlocks this</Badge>}
                </div>
                <p className="mt-1 text-caption text-fg-muted">{p.intendedFor}</p>
                <p className="mt-3 font-display text-heading font-semibold tabular-nums text-fg">{p.priceHypothesis}</p>
                <ul className="mt-3 flex flex-col gap-1.5">
                  {planHighlights[id].map((h) =>
                  <li key={h} className="flex items-start gap-2 text-caption text-fg">
                      <CheckIcon size={13} className="mt-0.5 shrink-0 text-success" aria-hidden />
                      {h}
                    </li>
                  )}
                </ul>
                <Button className="mt-4" variant={recommended ? 'primary' : 'secondary'} fullWidth onClick={() => choose(id)}>
                  Switch to {p.name}
                </Button>
              </li>);

          })}
        </ul>
        <div className="mt-3 flex justify-end">
          <IllustrativeTag note="Prices and limits are testing hypotheses, not final pricing." />
        </div>
      </Dialog>
    </UpgradeContext.Provider>);

}

export function useUpgrade(): UpgradeValue {
  const ctx = useContext(UpgradeContext);
  if (!ctx) throw new Error('useUpgrade must be used inside UpgradeProvider');
  return ctx;
}