import React, { useEffect, useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';

interface MediaFolderDialogProps {
  open: boolean;
  mode: 'create' | 'rename';
  initialName?: string;
  onClose: () => void;
  /** Throw an Error with a readable message to show it under the field. */
  onSubmit: (name: string) => void;
}

/** Name a new folder, or rename one of your own. */
export function MediaFolderDialog({ open, mode, initialName = '', onClose, onSubmit }: MediaFolderDialogProps) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(initialName);
    setError(null);
  }, [open, initialName]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      onSubmit(name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Couldn’t save the folder.');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="sm"
      title={mode === 'create' ? 'New folder' : 'Rename folder'}
      description={mode === 'create' ? 'Group images your way — for a campaign, a season or a client.' : undefined}
      footer={
      <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => submit()}>{mode === 'create' ? 'Create folder' : 'Save'}</Button>
        </>
      }>
      
      <form onSubmit={submit}>
        <TextInput
          id="media-folder-name"
          label="Folder name"
          value={name}
          maxLength={40}
          placeholder="e.g. Christmas campaign"
          error={error ?? undefined}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          data-autofocus />
        
      </form>
    </Dialog>);

}