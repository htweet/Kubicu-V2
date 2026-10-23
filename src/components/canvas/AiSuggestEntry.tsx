import React, { useState } from 'react';
import { PauseCircleIcon, SparklesIcon } from 'lucide-react';
import { useCan } from '../../contexts/TeamContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { usePlan } from '../../contexts/PlanContext';
import { useFlag } from '../../utils/admin/store';
import { Button } from '../ui/Button';
import { AiPreviewTag } from '../ai/AiPreviewTag';
import { AiPageSetupDialog } from '../ai/AiPageSetupDialog';

/** Entry to AI page setup from the page panel (D63). Super admin can pause it per plan (D75b). */
export function AiSuggestEntry() {
  const [open, setOpen] = useState(false);
  const { currentSpace } = useWorkspace();
  const plan = usePlan();
  const can = useCan('pages.edit', currentSpace.id);
  const enabled = useFlag('ai_page_setup', plan.id);

  if (!enabled)
  return (
    <div className="flex items-start gap-2.5 rounded-md border border-line bg-sunken p-3">
        <PauseCircleIcon size={16} className="mt-0.5 shrink-0 text-fg-subtle" aria-hidden />
        <div>
          <p className="text-label font-semibold text-fg">AI page setup is paused</p>
          <p className="mt-0.5 text-caption text-fg-muted">KUBICU has switched it off for {plan.name} for now. Your page and anything AI drafted before are unaffected.</p>
        </div>
      </div>);


  return (
    <div className="ai-frame rounded-md">
      <div className="flex flex-col gap-2 rounded-[7px] bg-raised">
        <div className="ai-soft flex flex-col gap-2 rounded-[7px] p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-label font-semibold text-fg">Set up with AI</p>
            <AiPreviewTag />
          </div>
          <p className="text-caption text-fg-muted">Describe your business and review a draft page. We never make up prices, reviews or promises — gaps are marked for you.</p>
          <Button size="sm" variant="ai" leadingIcon={SparklesIcon} className="self-start" disabled={!can.allowed} title={can.allowed ? undefined : can.reason} onClick={() => setOpen(true)}>
            Describe your business
          </Button>
        </div>
      </div>
      <AiPageSetupDialog open={open} onClose={() => setOpen(false)} />
    </div>);

}