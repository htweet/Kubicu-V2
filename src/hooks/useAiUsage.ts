import { useCallback, useEffect, useState } from 'react';
import type { AiFeatureId } from '../types/admin';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { usePlan } from '../contexts/PlanContext';
import { useAdminStore } from '../utils/admin/store';
import { aiAllowance, aiBonus } from '../utils/planCatalogue';
import { logAiRequest } from '../utils/aiLog';

interface Stored {
  month: string;
  used: number;
}

const EVENT = 'kubicu:ai-usage';
const keyFor = (workspaceId: string) => `kubicu.ai.${workspaceId}`;
const thisMonth = () => new Date().toISOString().slice(0, 7);

function read(workspaceId: string): number {
  try {
    const raw = window.localStorage.getItem(keyFor(workspaceId));
    if (!raw) return 0;
    const s = JSON.parse(raw) as Stored;
    return s.month === thisMonth() ? s.used : 0;
  } catch {
    return 0;
  }
}

/**
 * AI credits used this month in the current workspace. Stored on this device (prototype).
 * The allowance follows the approved plan catalogue plus any credits staff gave this month (D135),
 * and staff can switch individual AI features off for everyone.
 */
export function useAiUsage() {
  const { current } = useWorkspace();
  const plan = usePlan();
  const [admin] = useAdminStore();
  const [used, setUsed] = useState(() => read(current.id));
  const bonus = aiBonus(current.id, admin);
  const limit = aiAllowance(plan.id, admin) + bonus;

  useEffect(() => {
    setUsed(read(current.id));
    const sync = () => setUsed(read(current.id));
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, [current.id]);

  const spend = useCallback(
    (cost: number, feature = 'AI request') => {
      const next = read(current.id) + cost;
      try {
        window.localStorage.setItem(keyFor(current.id), JSON.stringify({ month: thisMonth(), used: next } satisfies Stored));
      } catch {
        // Storage blocked — the count resets on reload, which is acceptable in the prototype.
      }
      logAiRequest({ workspaceId: current.id, workspaceName: current.name, feature, credits: cost, outcome: 'ok' });
      setUsed(next);
      window.dispatchEvent(new Event(EVENT));
    },
    [current.id, current.name],
  );

  /** False when KUBICU staff have switched this feature off for everyone. */
  const featureOn = useCallback((id: AiFeatureId) => !admin.aiOff?.[id], [admin.aiOff]);

  const now = new Date();
  const resetsOn = new Date(now.getFullYear(), now.getMonth() + 1, 1).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });

  return { used, limit, bonus, remaining: Math.max(0, limit - used), canSpend: (cost: number) => used + cost <= limit, spend, featureOn, resetsOn, planId: plan.id, planName: plan.name };
}
