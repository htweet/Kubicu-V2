import React, { useState } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { DEMO_WORKSPACE_ID } from '../../utils/workspaceStorage';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { TextInput } from '../ui/TextInput';

interface RemoveDemoWorkspaceDialogProps {
  open: boolean;
  onClose: () => void;
}

/** Confirms deleting the built-in demo workspace (D201). Typing its name guards against a slip. */
export function RemoveDemoWorkspaceDialog({ open, onClose }: RemoveDemoWorkspaceDialogProps) {
  const { workspaces, removeDemoWorkspace } = useWorkspace();
  const demo = workspaces.find((w) => w.id === DEMO_WORKSPACE_ID);
  const others = workspaces.filter((w) => w.id !== DEMO_WORKSPACE_ID);
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  if (!demo) return null;
  const confirmWord = 'REMOVE';
  const ok = typed.trim().toUpperCase() === confirmWord;

  const close = () => {
    if (busy) return;
    setTyped('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      size="sm"
      title={`Remove ${demo.name}?`}
      description="The demo workspace and everything in it is deleted from this device."
      footer={
      <>
          <Button variant="secondary" disabled={busy} onClick={close}>
            Keep it
          </Button>
          <Button
          variant="destructive"
          loading={busy}
          disabled={!ok}
          onClick={() => {
            setBusy(true);
            removeDemoWorkspace();
          }}>
          
            Remove demo workspace
          </Button>
        </>
      }>
      
      <div className="flex flex-col gap-4">
        <ul className="flex list-disc flex-col gap-1.5 pl-4 text-label text-fg-muted">
          <li>Its pages, spaces, products, orders, bookings, contacts and settings go — including anything you changed or added while trying it.</li>
          <li>You’ll move to {others[0]?.name ?? 'your workspace'}. Your own workspaces aren’t touched.</li>
          <li className="font-medium text-fg">You can add a fresh copy back any time from Your account → Workspaces.</li>
        </ul>
        <TextInput id="remove-demo-confirm" label={`Type ${confirmWord} to confirm`} value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
      </div>
    </Dialog>);

}