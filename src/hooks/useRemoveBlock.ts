import { useCallback } from 'react';
import { toast } from 'sonner';
import { useEditor } from '../contexts/EditorContext';
import { blockName } from '../utils/blocks';

/** Deletes a block and offers a one-tap restore that puts it back exactly where it was. */
export function useRemoveBlock() {
  const { state, actions } = useEditor();
  return useCallback(
    (id: string) => {
      const index = state.draft.blocks.findIndex((b) => b.id === id);
      const block = state.draft.blocks[index];
      if (!block) return;
      if (block.locked) {
        toast(`${blockName(block)} is locked`, {
          description: 'Unlock it to delete.',
          action: { label: 'Unlock', onClick: () => actions.toggleLocked(id) }
        });
        return;
      }
      actions.removeBlock(id);
      toast(`${blockName(block)} deleted`, {
        action: { label: 'Undo', onClick: () => actions.restoreBlock(block, index) }
      });
    },
    [state.draft.blocks, actions]
  );
}