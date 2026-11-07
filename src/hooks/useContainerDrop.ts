import { createContext, useContext, useRef, useState } from 'react';
import type { PanInfo } from 'framer-motion';
import { toast } from 'sonner';
import type { Block } from '../types/page';
import { layerName } from '../utils/blocks';
import { announce } from '../utils/announce';
import { resolveDrop, type DropTarget } from '../utils/canvasDrop';

export type { DropTarget } from '../utils/canvasDrop';

interface Options {
  blocks: Block[];
  placeBlock: (id: string, parentId: string | null, beforeId: string | null) => void;
  undo: () => void;
}

const pointOf = (info: PanInfo) => ({ x: info.point.x - window.scrollX, y: info.point.y - window.scrollY });

/**
 * Dragging on the canvas between the page and containers (D180, D191).
 * - Page blocks: hovering a Section, Columns or Tabs pauses reordering; dropping puts the block
 *   inside, at the spot under the pointer (before or after the block you're over).
 * - Blocks inside a container (drag handle in their toolbar): drop elsewhere in the same container
 *   to reorder, in another container to move across, or on the page to take it out at that spot.
 * Buttons ("Move into it", "Move out", arrows) remain the keyboard and screen-reader route.
 */
export function useContainerDrop({ blocks, placeBlock, undo }: Options) {
  const [target, setTarget] = useState<DropTarget | null>(null);
  const targetRef = useRef<DropTarget | null>(null);

  const set = (t: DropTarget | null) => {
    const prev = targetRef.current;
    if (prev?.frameId === t?.frameId && prev?.ok === t?.ok && prev?.beforeId === t?.beforeId && prev?.kind === t?.kind) return;
    targetRef.current = t;
    setTarget(t);
  };

  const finish = (dragId: string, t: DropTarget | null) => {
    set(null);
    if (!t) return;
    const dragged = blocks.find((b) => b.id === dragId);
    if (!dragged) return;
    if (!t.ok) {
      toast('Couldn’t move it there', { description: t.message });
      announce(`Not moved. ${t.message}`);
      return;
    }
    // Dropping a block back exactly where it is does nothing.
    const sameParent = (dragged.parentId ?? null) === t.parentId;
    const siblings = blocks.filter((b) => (b.parentId ?? null) === t.parentId);
    const next = siblings[siblings.findIndex((b) => b.id === dragId) + 1];
    if (sameParent && (t.beforeId === dragId || (next ? t.beforeId === next.id : t.beforeId === null))) return;

    placeBlock(dragId, t.parentId, t.beforeId);
    const container = t.parentId ? blocks.find((b) => b.id === t.parentId) : undefined;
    const msg = container ? (sameParent ? `Moved ${layerName(dragged)} within ${layerName(container)}` : `Moved ${layerName(dragged)} into ${layerName(container)}`) : `Moved ${layerName(dragged)} out onto the page`;
    toast(msg, { action: { label: 'Undo', onClick: undo } });
    announce(msg);
  };

  /** Page-level drags: only containers are drop targets (Reorder moves between page blocks). */
  const onDrag = (dragId: string, info: PanInfo) => set(resolveDrop(blocks, dragId, pointOf(info), false));
  const onDragEnd = (dragId: string, info: PanInfo) => finish(dragId, resolveDrop(blocks, dragId, pointOf(info), false));

  /** Drags that start inside a container: containers and page positions are both targets. */
  const onChildDrag = (dragId: string, info: PanInfo) => set(resolveDrop(blocks, dragId, pointOf(info), true));
  const onChildDragEnd = (dragId: string, info: PanInfo) => finish(dragId, resolveDrop(blocks, dragId, pointOf(info), true));

  /** True while hovering a container, so page reordering pauses and the container stays put. */
  const overContainer = () => targetRef.current?.kind === 'into';

  return { target, onDrag, onDragEnd, onChildDrag, onChildDragEnd, overContainer };
}

/** Lets blocks rendered inside containers start a drag without prop-drilling through renderers. */
export const CanvasDropContext = createContext<{
  onChildDrag: (id: string, info: PanInfo) => void;
  onChildDragEnd: (id: string, info: PanInfo) => void;
} | null>(null);

export const useCanvasDrop = () => useContext(CanvasDropContext);
