import React, { useEffect, useRef } from 'react';
import { CheckIcon, Undo2Icon, XIcon } from 'lucide-react';
import type { AssistantChange } from '../../types/assistant';
import { Button } from '../ui/Button';

interface AssistantChangeCardProps {
  change: AssistantChange;
  /** Only the most recent kept change can be undone from the chat. */
  canUndo: boolean;
  onKeep: () => void;
  onDiscard: () => void;
  onUndo: () => void;
}

const statusText: Record<AssistantChange['status'], string> = {
  pending: 'Proposed — not on your page yet',
  kept: 'Kept',
  discarded: 'Discarded',
  undone: 'Undone'
};

/** One requested change after the build: Keep or Discard while proposed, Undo once kept (D211, Pass D). */
export function AssistantChangeCard({ change, canUndo, onKeep, onDiscard, onUndo }: AssistantChangeCardProps) {
  const pending = change.status === 'pending';
  const statusRef = useRef<HTMLParagraphElement>(null);
  const wasPending = useRef(pending);
  // Keep/Discard/Undo remove the button that had focus — move focus to the new status so keyboard users aren't lost.
  useEffect(() => {
    if (wasPending.current !== pending || change.status === 'undone') {
      const active = document.activeElement;
      if (!active || active === document.body) statusRef.current?.focus();
    }
    wasPending.current = pending;
  }, [pending, change.status]);
  return (
    <div className="rounded-lg border border-line bg-raised p-3">
      <p ref={statusRef} tabIndex={-1} role="status" className="text-caption font-semibold text-fg-muted focus:outline-none">
        {statusText[change.status]}
        {pending && <span className="font-normal"> · compare Before and After in the preview</span>}
      </p>
      {pending ?
      <div className="mt-2.5 flex flex-wrap gap-2">
          <Button size="sm" leadingIcon={CheckIcon} onClick={onKeep}>
            Keep
          </Button>
          <Button size="sm" variant="secondary" leadingIcon={XIcon} onClick={onDiscard}>
            Discard
          </Button>
        </div> :
      change.status === 'kept' && canUndo ?
      <Button size="sm" variant="tertiary" className="mt-2" leadingIcon={Undo2Icon} onClick={onUndo}>
          Undo this change
        </Button> :
      null}
    </div>);

}