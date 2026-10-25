import type { Block } from '../types/page';
import { MAX_CHILDREN, childrenOf, isContainer } from './containers';
import { fitsIn } from '../data/blockCompatibility';
import { blockDefinitions } from '../data/blockRegistry';
import { layerName } from './blocks';

/**
 * Where a dragged block would land if dropped now (D180, extended D191).
 * `into`: inside a container, before `beforeId` (null = as its last block).
 * `page`: on the page itself, before the top-level block `beforeId` (null = at the end).
 * `frameId` is the top-level canvas frame that shows the message.
 */
export interface DropTarget {
  kind: 'into' | 'page';
  frameId: string;
  parentId: string | null;
  beforeId: string | null;
  ok: boolean;
  message: string;
}

interface Point {
  x: number;
  y: number;
}

const horizontal = (container: Block) => container.type !== 'section';

/** Is the point in the first half of an element, along the container's axis? */
function firstHalf(el: HTMLElement, p: Point, across: boolean) {
  const r = el.getBoundingClientRect();
  return across ? p.x < r.left + r.width / 2 : p.y < r.top + r.height / 2;
}

/**
 * Resolves a drop at a viewport point. `allowPage` is false for page-level drags (framer's
 * Reorder already handles moving between page blocks) and true for blocks dragged out of a container.
 */
export function resolveDrop(blocks: Block[], dragId: string, p: Point, allowPage: boolean): DropTarget | null {
  const dragged = blocks.find((b) => b.id === dragId);
  if (!dragged) return null;
  const name = layerName(dragged);
  const topLevel = blocks.filter((b) => !b.parentId);

  for (const el of document.elementsFromPoint(p.x, p.y)) {
    const host = (el as HTMLElement).closest?.('[data-block-id]') as HTMLElement | null;
    const id = host?.dataset.blockId;
    if (!host || !id || id === dragId) continue;
    // Skip anything inside the element being dragged.
    if (host.closest(`[data-drag-source="${dragId}"]`)) continue;
    const over = blocks.find((b) => b.id === id);
    if (!over) continue;

    const container = isContainer(over) ? over : over.parentId ? blocks.find((b) => b.id === over.parentId) : undefined;

    if (container && isContainer(container) && !isContainer(dragged)) {
      const cname = layerName(container);
      const kind = blockDefinitions[container.type].name;
      const kids = childrenOf(blocks, container.id).filter((k) => k.id !== dragId);
      let beforeId: string | null = null;
      if (over.parentId === container.id) {
        const i = kids.findIndex((k) => k.id === over.id);
        beforeId = firstHalf(host, p, horizontal(container)) ? over.id : kids[i + 1]?.id ?? null;
      }
      const beforeName = beforeId ? layerName(blocks.find((b) => b.id === beforeId) as Block) : null;
      const base = { kind: 'into' as const, frameId: container.id, parentId: container.id, beforeId };
      if (dragged.locked) return { ...base, ok: false, message: 'This block is locked. Unlock it to move it.' };
      const fit = fitsIn(dragged.type, container.type);
      if (!fit.ok) return { ...base, ok: false, message: fit.reason ?? `This block can’t go inside ${kind}.` };
      if (dragged.parentId !== container.id && kids.length >= MAX_CHILDREN) return { ...base, ok: false, message: `${cname} is full — it holds up to ${MAX_CHILDREN} blocks.` };
      return { ...base, ok: true, message: beforeName ? `Drop to put ${name} before ${beforeName}` : `Drop to put ${name} at the end of ${cname}` };
    }

    if (!allowPage) return null;
    // A page block (not a container): land above or below it on the page.
    const top = topLevel.find((b) => b.id === over.id);
    if (!top) continue;
    const i = topLevel.indexOf(top);
    const before = firstHalf(host, p, false);
    const beforeId = before ? top.id : topLevel[i + 1]?.id ?? null;
    return { kind: 'page', frameId: top.id, parentId: null, beforeId, ok: !dragged.locked, message: dragged.locked ? 'This block is locked. Unlock it to move it.' : `Drop to move ${name} ${before ? 'above' : 'below'} ${layerName(top)}` };
  }
  return null;
}