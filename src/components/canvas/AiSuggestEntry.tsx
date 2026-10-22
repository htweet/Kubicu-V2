import React from 'react';
import { SparklesIcon } from 'lucide-react';
import { PlanLock } from '../ui/PlanLock';

export function AiSuggestEntry() {
  return (
    <div className="flex items-start gap-3 rounded-md border border-dashed border-line-strong p-3" aria-disabled="true">
      <SparklesIcon size={16} className="mt-0.5 shrink-0 text-fg-subtle" aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-label font-medium text-fg-muted">Suggest with AI</p>
          <PlanLock kind="planned">Batch 5</PlanLock>
        </div>
        <p className="mt-0.5 text-caption text-fg-subtle">Drafts copy and layouts from facts you provide. You review every change before it’s used.</p>
      </div>
    </div>);

}