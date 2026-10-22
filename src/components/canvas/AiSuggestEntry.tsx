import React, { useState } from 'react';
import { SparklesIcon } from 'lucide-react';
import { useCan } from '../../contexts/TeamContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Button } from '../ui/Button';
import { AiPreviewTag } from '../ai/AiPreviewTag';
import { AiPageSetupDialog } from '../ai/AiPageSetupDialog';

/** Entry to AI page setup from the page panel (D63). */
export function AiSuggestEntry() {
  const [open, setOpen] = useState(false);
  const { currentSpace } = useWorkspace();
  const can = useCan('pages.edit', currentSpace.id);
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