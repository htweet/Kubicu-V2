import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { Block } from '../../types/page';
import { useLibrary } from '../../contexts/LibraryContext';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';

interface SaveSectionDialogProps {
  open: boolean;
  onClose: () => void;
  blocks: Block[];
  defaultName: string;
}

export function SaveSectionDialog({ open, onClose, blocks, defaultName }: SaveSectionDialogProps) {
  const library = useLibrary();
  const [name, setName] = useState(defaultName);

  useEffect(() => {
    if (open) setName(defaultName);
  }, [open, defaultName]);

  const save = () => {
    library.saveSection(name, blocks);
    toast(`Saved “${name.trim() || 'Untitled section'}”`, { description: 'Find it at the top of Blocks on any page in this workspace.' });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="sm"
      title="Save as reusable section"
      description={`${blocks.length} block${blocks.length === 1 ? '' : 's'} · available on every page in this workspace.`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={!name.trim()}>
            Save section
          </Button>
        </>
      }
    >
      <form
        className="pb-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) save();
        }}
      >
        <TextInput id="section-name" label="Section name" value={name} maxLength={48} onChange={(e) => setName(e.target.value)} hint="e.g. Delivery & pickup FAQ" />
      </form>
    </Dialog>
  );
}
