import React from 'react';
import { CornerDownLeftIcon, LogOutIcon, SquareDashedIcon } from 'lucide-react';
import type { Block } from '../../../types/page';
import { MAX_CHILDREN, childrenOf, isContainer, parentOf, slotName, topLevel } from '../../../utils/containers';
import { blockName, layerName } from '../../../utils/blocks';
import { useEditor } from '../../../contexts/EditorContext';
import { fitsIn } from '../../../data/blockCompatibility';

/** Where the block sits relative to containers (D167), so moving in and out never needs dragging. */
export function containerMembershipApplies(blocks: Block[], block: Block): boolean {
  if (block.parentId) return !!parentOf(blocks, block);
  if (isContainer(block)) return false;
  const tops = topLevel(blocks);
  const prev = tops[tops.findIndex((b) => b.id === block.id) - 1];
  return isContainer(prev) && childrenOf(blocks, prev.id).length < MAX_CHILDREN && fitsIn(block.type, prev.type).ok;
}

export function ContainerMembership({ block, disabled }: {block: Block;disabled?: boolean;}) {
  const { state, actions } = useEditor();
  const blocks = state.draft.blocks;
  const parent = parentOf(blocks, block);
  const link = 'rounded-sm font-medium text-action hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:pointer-events-none disabled:opacity-40';

  if (parent) {
    const i = childrenOf(blocks, parent.id).findIndex((b) => b.id === block.id);
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-fg-muted">
        <SquareDashedIcon size={13} className="shrink-0" aria-hidden />
        <span className="min-w-0 flex-1">
          {slotName(parent, i, block)} of{' '}
          <button type="button" onClick={() => actions.select(parent.id)} className={link}>
            {layerName(parent)}
          </button>
        </span>
        <button type="button" disabled={disabled} onClick={() => actions.moveOutOfContainer(block.id)} className={`inline-flex items-center gap-1 ${link}`}>
          <LogOutIcon size={12} aria-hidden /> Move out
        </button>
      </div>);

  }

  const tops = topLevel(blocks);
  const prev = tops[tops.findIndex((b) => b.id === block.id) - 1];
  if (!isContainer(prev)) return null;
  return (
    <div className="flex items-center gap-2 text-caption text-fg-muted">
      <SquareDashedIcon size={13} className="shrink-0" aria-hidden />
      <span className="min-w-0 flex-1">Below a {blockName(prev).toLowerCase()} with room</span>
      <button type="button" disabled={disabled} onClick={() => actions.moveIntoContainer(block.id, prev.id)} className={`inline-flex items-center gap-1 ${link}`}>
        <CornerDownLeftIcon size={12} aria-hidden /> Move into it
      </button>
    </div>);

}