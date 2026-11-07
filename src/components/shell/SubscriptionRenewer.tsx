import { useEffect, useRef } from 'react';
import { useCommerce } from '../../contexts/CommerceContext';
import { useBilling } from '../../contexts/BillingContext';
import { usePlan } from '../../contexts/PlanContext';
import { nextDueAt, renewDue } from '../../utils/commerce/subscriptions';

/**
 * Runs customer subscription renewals, trial ends, retries and cancellations that are due (D69).
 * In the prototype this only happens while KUBICU is open; in production it runs on the server.
 * Renders nothing.
 */
export function SubscriptionRenewer() {
  const { data, applySystem } = useCommerce();
  const { renewalOutcome } = useBilling();
  const plan = usePlan();
  const ref = useRef({ data, applySystem, renewalOutcome, plan: plan.id });
  ref.current = { data, applySystem, renewalOutcome, plan: plan.id };

  useEffect(() => {
    const tick = () => {
      const { data: d, applySystem: apply, renewalOutcome: outcome, plan: ws } = ref.current;
      const now = Date.now();
      const due = d.subscriptions.some((s) => {
        const at = nextDueAt(s);
        return !!at && Date.parse(at) <= now;
      });
      if (due) apply((x) => renewDue(x, outcome, ws, now));
    };
    tick();
    const id = window.setInterval(tick, 30000);
    return () => window.clearInterval(id);
  }, []);

  return null;
}
