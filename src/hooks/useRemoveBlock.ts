import { useCallback } from 'react';
import { toast } from 'sonner';
import { useEditor } from '../contexts/EditorContext';
import { blockName } from '../utils/blocks';
import { childrenOf, isContainer } from '../utils/containers';
import { useCoBrandGuard } from './useCoBrandGuard';

/** Deletes a block and offers a one-tap restore that puts it back exactly where it was. Containers go with their contents (D167). */
export function useRemoveBlock() {
  const { state, actions } = useEditor();
  const { canTouch } = useCoBrandGuard();
  return useCallback(
    (id: string) => {
      const index = state.draft.blocks.findIndex((b) => b.id === id);
      const block = state.draft.blocks[index];
      if (!block) return;
      if (!canTouch(id, 'delete')) return;
      if (block.locked) {
        toast(`${blockName(block)} is locked`, {
          description: 'Unlock it to delete.',
          action: { label: 'Unlock', onClick: () => actions.toggleLocked(id) },
        });
        return;
      }
      const kids = isContainer(block) ? childrenOf(state.draft.blocks, id) : [];
      // Keyboard focus moves to the neighbouring block (or the canvas) instead of falling to the page top (D429).
      const gone = new Set([id, ...kids.map((k) => k.id)]);
      const rest = state.draft.blocks.filter((b) => !gone.has(b.id));
      const neighbour = rest[Math.min(index, rest.length - 1)] ?? null;
      const hadFocus = !!document.activeElement?.closest(`[data-block-id="${id}"], [data-layer-row]`);
      actions.removeBlock(id);
      if (hadFocus) {
        window.requestAnimationFrame(() => {
          const next = neighbour ? document.querySelector<HTMLElement>(`[data-block-id="${neighbour.id}"]`) : null;
          (next ?? document.getElementById('canvas-main'))?.focus();
        });
      }
      if (kids.length) {
        toast(`${blockName(block)} and ${kids.length} block${kids.length === 1 ? '' : 's'} inside deleted`, {
          action: { label: 'Undo', onClick: () => actions.restoreBlocks([block, ...kids], index) },
        });
        return;
      }
      toast(`${blockName(block)} deleted`, {
        action: { label: 'Undo', onClick: () => actions.restoreBlock(block, index) },
      });
    },
    [state.draft.blocks, actions, canTouch],
  );
}
