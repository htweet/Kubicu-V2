import { useEffect, useRef } from 'react';
import { useCommerce } from '../../contexts/CommerceContext';
import { useBilling } from '../../contexts/BillingContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { chargeDueParts, nextAttemptAt } from '../../utils/commerce/payOptions';
import { creditInstalment } from '../../utils/money/instalments';

/**
 * Charges instalments that are due, with retries on days 1, 3 and 5 (D112). Outcomes follow
 * "Simulate next renewal" in the Controls panel. Prototype: only while KUBICU is open. Renders nothing.
 */
export function InstalmentCharger() {
  const { data, applySystem } = useCommerce();
  const { renewalOutcome } = useBilling();
  const { current } = useWorkspace();
  const ref = useRef({ data, applySystem, renewalOutcome, wid: current.id });
  ref.current = { data, applySystem, renewalOutcome, wid: current.id };

  useEffect(() => {
    const tick = () => {
      const { data: d, applySystem: apply, renewalOutcome: outcome, wid } = ref.current;
      const now = Date.now();
      const due = d.orders.some((o) => o.instalments?.status === 'active' && !o.sample && o.instalments.parts.some((p) => {
        const at = nextAttemptAt(p);
        return !!at && Date.parse(at) <= now;
      }));
      if (!due) return;
      const result = chargeDueParts(d, outcome, now);
      result.paid.forEach(({ order, part }) => creditInstalment(wid, order, part));
      apply(() => result.data);
    };
    tick();
    const id = window.setInterval(tick, 30000);
    return () => window.clearInterval(id);
  }, []);

  return null;
}