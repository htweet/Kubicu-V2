import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { AppealKind } from '../../types/admin';
import { updateAdminStore } from '../../utils/admin/store';
import { fileAppeal } from '../../utils/admin/appeals';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { TextArea } from '../ui/TextArea';

interface AppealDialogProps {
  open: boolean;
  onClose: () => void;
  kind: AppealKind;
  handle: string | null;
  workspaceId: string;
  workspaceName: string;
  from: string;
  originalReason: string;
}

/** An owner asks KUBICU to look again at a takedown or suspension (D83). */
export function AppealDialog({ open, onClose, kind, handle, workspaceId, workspaceName, from, originalReason }: AppealDialogProps) {
  const [statement, setStatement] = useState('');
  const [tried, setTried] = useState(false);
  useEffect(() => {
    if (open) {
      setStatement('');
      setTried(false);
    }
  }, [open]);
  const error = statement.trim().length < 30 ? 'Tell us a little more (at least 30 characters) — what was misunderstood, or what you’ve changed.' : '';

  const send = () => {
    setTried(true);
    if (error) return;
    const ok = updateAdminStore((s) => fileAppeal(s, { kind, handle, workspaceId, workspaceName, from, originalReason, statement: statement.trim() }));
    if (!ok) return toast.error('Couldn’t send your appeal', { description: 'Your browser blocked saving. Try again.' });
    toast.success('Appeal sent', { description: 'Someone who didn’t make the original decision will review it. You’ll see the answer here.' });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="sm"
      title={kind === 'takedown' ? `Appeal the removal of kub.icu/${handle}` : 'Appeal the pause on your pages'}
      description="A different KUBICU staff member reviews every appeal. Nothing has been deleted while you wait."
      footer={
      <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={send}>Send appeal</Button>
        </>
      }>
      
      <div className="flex flex-col gap-4">
        <div className="rounded-md bg-sunken px-3.5 py-3">
          <p className="text-caption font-semibold text-fg-subtle">Our reason</p>
          <p className="mt-0.5 text-label text-fg">{originalReason}</p>
        </div>
        <TextArea
          id="appeal-statement"
          label="Why should we look again?"
          rows={5}
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          error={tried ? error || undefined : undefined}
          hint="Mention receipts, permissions or changes you’ve made. Don’t include card numbers or passwords." />
        
      </div>
    </Dialog>);

}