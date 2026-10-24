import { useCallback } from 'react';
import { toast } from 'sonner';
import { useEditor } from '../contexts/EditorContext';
import { useCoBrand } from './useCoBrand';
import { canEditBlock, movedIds, ownerLabel } from '../utils/coBrand';
import { blockName } from '../utils/blocks';

/**
 * Stops one business moving or deleting the other business's blocks in an "Own sections"
 * co-branded space (D123). Before this, only the block's settings were locked.
 * Outside co-branded spaces, or in Open editing, everything is allowed.
 */
export function useCoBrandGuard() {
  const { state } = useEditor();
  const { cb, actor } = useCoBrand();
  const blocks = state.draft.blocks;

  const explain = useCallback(
    (id: string, verb: 'move' | 'delete') => {
      const b = blocks.find((x) => x.id === id);
      if (!cb || !b) return;
      const owner = ownerLabel(b.owner ?? 'lead', actor, cb);
      toast(`${blockName(b)} belongs to ${owner}`, {
        description: `Only ${owner} can ${verb} it. Ask them in the partner panel, or have them make it Shared.`
      });
    },
    [blocks, cb, actor]
  );

  /** True when the acting business may move or delete this block. Shows why not, otherwise. */
  const canTouch = useCallback(
    (id: string, verb: 'move' | 'delete' = 'move') => {
      const b = blocks.find((x) => x.id === id);
      if (!b || canEditBlock(cb, b, actor)) return true;
      explain(id, verb);
      return false;
    },
    [blocks, cb, actor, explain]
  );

  /** A drag reorder is allowed when the dragged item is one the acting business may move. */
  const canReorder = useCallback(
    (prev: string[], next: string[]) => {
      if (!cb || cb.mode === 'open') return true;
      const moved = movedIds(prev, next);
      if (!moved.length) return true;
      const ok = moved.some((id) => {
        const b = blocks.find((x) => x.id === id);
        return !b || canEditBlock(cb, b, actor);
      });
      if (!ok) explain(moved[0], 'move');
      return ok;
    },
    [blocks, cb, actor, explain]
  );

  return { canTouch, canReorder, active: !!cb && cb.mode === 'sections' };
}