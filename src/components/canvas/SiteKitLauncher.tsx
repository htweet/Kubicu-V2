import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useEditor } from '../../contexts/EditorContext';
import { usePlan } from '../../contexts/PlanContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { plans, planOrder } from '../../data/plans';
import { pageCount, pageLimits } from '../../utils/sitePages';
import { siteKitById } from '../../data/siteKits';
import { SiteKitDialog } from './SiteKitDialog';

/** Opens "Add a ready-made site" when the canvas is reached with ?siteKit= (from onboarding, D137). */
export function SiteKitLauncher() {
  const [params, setParams] = useSearchParams();
  const { state } = useEditor();
  const { currentSpace } = useWorkspace();
  const plan = usePlan();
  const param = params.get('siteKit');
  const [kitId, setKitId] = useState<string | null>(null);

  useEffect(() => {
    if (!param) return;
    if (currentSpace.kind === 'main' && siteKitById(param)) setKitId(param);
    const next = new URLSearchParams(params);
    next.delete('siteKit');
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [param]);

  const limit = pageLimits[plan.id];
  const nextPlan = planOrder.map((id) => plans[id]).find((p) => pageLimits[p.id] > limit);
  return <SiteKitDialog open={!!kitId} onClose={() => setKitId(null)} initialKitId={kitId} room={Math.max(0, limit - pageCount(state.site))} nextPlan={nextPlan ? { id: nextPlan.id, name: nextPlan.name } : undefined} />;
}