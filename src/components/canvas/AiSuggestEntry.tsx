import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PauseCircleIcon, SparklesIcon } from 'lucide-react';
import { useCan } from '../../contexts/TeamContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { usePlan } from '../../contexts/PlanContext';
import { useFlag } from '../../utils/admin/store';
import { Button } from '../ui/Button';
import { AiPreviewTag } from '../ai/AiPreviewTag';

/** Entry to the AI page assistant from the page panel (D211, replaces the D63 dialog). Super admin can pause it per plan (D75b). */
export function AiSuggestEntry() {
  const navigate = useNavigate();
  const { currentSpace } = useWorkspace();
  const plan = usePlan();
  const can = useCan('pages.edit', currentSpace.id);
  const enabled = useFlag('ai_page_setup', plan.id);

  if (!enabled)
  return (
    <div className="flex items-start gap-2.5 rounded-md border border-line bg-sunken p-3">
        <PauseCircleIcon size={16} className="mt-0.5 shrink-0 text-fg-subtle" aria-hidden />
        <div>
          <p className="text-label font-semibold text-fg">The AI assistant is paused</p>
          <p className="mt-0.5 text-caption text-fg-muted">KUBICU has switched it off for {plan.name} for now. Your page and anything built before are unaffected.</p>
        </div>
      </div>);


  return (
    <div className="ai-frame rounded-md">
      <div className="flex flex-col gap-2 rounded-[7px] bg-raised">
        <div className="ai-soft flex flex-col gap-2 rounded-[7px] p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-label font-semibold text-fg">Build with the AI assistant</p>
            <AiPreviewTag />
          </div>
          <p className="text-caption text-fg-muted">Answer a few questions, add photos, approve a plan and watch the page build. We never make up prices, reviews or promises.</p>
          <Button size="sm" variant="ai" leadingIcon={SparklesIcon} className="self-start" disabled={!can.allowed} title={can.allowed ? undefined : can.reason} onClick={() => navigate('/app/assistant')}>
            Open the assistant
          </Button>
        </div>
      </div>
    </div>);

}