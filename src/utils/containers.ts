import type { Block, BlockOf, BlockType, PageDocument } from '../types/page';
import type { ValidationIssue } from './validation';
import { fitsIn } from '../data/blockCompatibility';

/*
 * Containers (D167): Section, Columns and Tabs hold 1–4 blocks, one level deep.
 * Children stay in the page's flat block list, marked with `parentId` and kept directly after
 * their container, so every existing check, translation and analytics pass still sees them.
 */

export type ContainerType = 'section' | 'columns' | 'tabs';
export type ContainerBlock = BlockOf<ContainerType>;

export const MAX_CHILDREN = 4;

const containerTypes = new Set<BlockType>(['section', 'columns', 'tabs']);

export const isContainerType = (t: BlockType): t is ContainerType => containerTypes.has(t);
export const isContainer = (b: Block | null | undefined): b is ContainerBlock => !!b && containerTypes.has(b.type);

export const topLevel = (blocks: Block[]): Block[] => blocks.filter((b) => !b.parentId);
export const childrenOf = (blocks: Block[], id: string): Block[] => blocks.filter((b) => b.parentId === id);

/** The container a block sits in, if any. */
export function parentOf(blocks: Block[], block: Block): ContainerBlock | null {
  if (!block.parentId) return null;
  const p = blocks.find((b) => b.id === block.parentId);
  return isContainer(p) ? p : null;
}

/**
 * Keeps containers valid: a child's parent must exist and be a container; containers can't nest;
 * at most 4 children; children follow their container. Containers and children never join a block group.
 * Returns the same array when nothing changes.
 */
export function normalizeContainers(blocks: Block[]): Block[] {
  if (!blocks.some((b) => b.parentId || containerTypes.has(b.type))) return blocks;
  const byId = new Map(blocks.map((b) => [b.id, b]));
  const counts = new Map<string, number>();
  let changed = false;
  const fixed = blocks.map((b) => {
    let parent = b.parentId ?? null;
    if (parent) {
      const p = byId.get(parent);
      const ok = !!p && p.id !== b.id && containerTypes.has(p.type) && !containerTypes.has(b.type);
      const n = counts.get(parent) ?? 0;
      if (!ok || n >= MAX_CHILDREN) parent = null;else
      counts.set(parent, n + 1);
    }
    const ungroup = (!!parent || containerTypes.has(b.type)) && !!b.groupId;
    if ((b.parentId ?? null) === parent && !ungroup) return b;
    changed = true;
    return { ...b, parentId: parent, groupId: ungroup ? null : b.groupId } as Block;
  });
  const kids = new Map<string, Block[]>();
  fixed.forEach((b) => {
    if (!b.parentId) return;
    const list = kids.get(b.parentId) ?? [];
    list.push(b);
    kids.set(b.parentId, list);
  });
  const out: Block[] = [];
  fixed.forEach((b) => {
    if (b.parentId) return;
    out.push(b);
    const k = kids.get(b.id);
    if (k) out.push(...k);
  });
  if (!changed && out.length === blocks.length && out.every((b, i) => b === blocks[i])) return blocks;
  return out;
}

export function normalizeContainerDoc(doc: PageDocument): PageDocument {
  const blocks = normalizeContainers(doc.blocks);
  return blocks === doc.blocks ? doc : { ...doc, blocks };
}

export interface Placement {
  parentId: string | null;
  index: number;
  container: ContainerBlock | null;
  /** Compatibility (D174): the selected container can't hold this block, so it goes on the page below it. */
  blocked?: {container: ContainerBlock;reason: string;};
}

/**
 * Where a new block goes: inside a selected container (or beside a selected child) when there's room,
 * otherwise on the page below the selection. Containers always go on the page.
 */
export function placementFor(blocks: Block[], selectedId: string | null, type: BlockType): Placement {
  const sel = selectedId ? blocks.find((b) => b.id === selectedId) : undefined;
  if (!sel) return { parentId: null, index: blocks.length, container: null };
  const parent = parentOf(blocks, sel);
  const target = isContainer(sel) ? sel : parent;
  let blocked: Placement['blocked'];
  if (target && childrenOf(blocks, target.id).length < MAX_CHILDREN) {
    const fit = fitsIn(type, target.type);
    if (fit.ok) {
      if (isContainer(sel)) {
        const kids = childrenOf(blocks, sel.id);
        const last = kids[kids.length - 1] ?? sel;
        return { parentId: sel.id, index: blocks.indexOf(last) + 1, container: sel };
      }
      return { parentId: target.id, index: blocks.indexOf(sel) + 1, container: target };
    }
    blocked = { container: target, reason: fit.reason ?? '' };
  }
  const anchor = parent ?? sel;
  const unit = [anchor, ...childrenOf(blocks, anchor.id)];
  return { parentId: null, index: blocks.indexOf(unit[unit.length - 1]) + 1, container: null, blocked };
}

/** Rebuilds the list from an order of top-level ids, keeping each container's children after it. */
export function expandTop(ids: string[], blocks: Block[]): Block[] {
  const byId = new Map(blocks.map((b) => [b.id, b]));
  const out: Block[] = [];
  ids.forEach((id) => {
    const b = byId.get(id);
    if (!b || b.parentId) return;
    out.push(b, ...childrenOf(blocks, id));
  });
  return out.length === blocks.length ? out : blocks;
}

/** Moves a block one step: children move among their siblings, page blocks move past the next page block (with its contents). */
export function moveInPage(blocks: Block[], id: string, direction: -1 | 1): Block[] {
  const b = blocks.find((x) => x.id === id);
  if (!b || b.locked) return blocks;
  if (b.parentId) {
    const sibs = childrenOf(blocks, b.parentId);
    const j = sibs.indexOf(b) + direction;
    if (j < 0 || j >= sibs.length) return blocks;
    const fi = blocks.indexOf(b);
    const fj = blocks.indexOf(sibs[j]);
    const next = [...blocks];
    [next[fi], next[fj]] = [next[fj], next[fi]];
    return next;
  }
  const tops = topLevel(blocks);
  const i = tops.indexOf(b);
  const j = i + direction;
  if (j < 0 || j >= tops.length) return blocks;
  const order = tops.map((t) => t.id);
  [order[i], order[j]] = [order[j], order[i]];
  return expandTop(order, blocks);
}

/** After cloning a run of blocks, point copied children at their copied container. Children whose container wasn't copied go on the page. */
export function relinkClones(originals: Block[], clones: Block[]): Block[] {
  const map = new Map(originals.map((o, i) => [o.id, clones[i]?.id]));
  return clones.map((c) => {
    let next = c.parentId ? { ...c, parentId: map.get(c.parentId) ?? null } as Block : c;
    // Jump links (D169) follow the blocks they point at.
    if (next.type === 'anchorNav') next = { ...next, content: { ...next.content, items: next.content.items.map((i) => ({ ...i, blockId: map.get(i.blockId) ?? i.blockId })) } };
    return next;
  });
}

/** Publish checks for containers (D167): empty ones, single columns and unlabelled tabs. Warnings only — nothing breaks. */
export function containerIssues(blocks: Block[]): ValidationIssue[] {
  const out: ValidationIssue[] = [];
  blocks.forEach((b) => {
    if (!isContainer(b) || b.visibility.hidden) return;
    const kids = childrenOf(blocks, b.id);
    const name = b.type === 'section' ? 'section' : b.type;
    if (kids.length === 0) {
      out.push({ id: `ctr:empty:${b.id}`, blockId: b.id, severity: 'warning', message: `This ${name} is empty, so visitors see nothing here. Add a block inside or remove it.` });
      return;
    }
    // Compatibility (D174): explain, never move automatically.
    kids.forEach((k) => {
      const fit = fitsIn(k.type, b.type);
      if (!fit.ok) out.push({ id: `ctr:fit:${k.id}`, blockId: k.id, severity: 'warning', message: `This block isn’t designed to sit inside ${b.type === 'section' ? 'a Section' : b.type === 'columns' ? 'Columns' : 'Tabs'}. ${fit.reason} Use “Move out” to put it on the page.` });
    });
    if (b.type === 'columns' && kids.length === 1)
    out.push({ id: `ctr:one:${b.id}`, blockId: b.id, severity: 'warning', message: 'Columns with one block shows as a single column. Add a second block, or remove Columns and keep the block.' });
    if (b.type === 'tabs')
    kids.forEach((k, i) => {
      if (!k.slotLabel?.trim())
      out.push({ id: `ctr:label:${k.id}`, blockId: k.id, severity: 'warning', field: 'slotLabel', message: `Tab ${i + 1} has no label, so visitors see “Tab ${i + 1}”. Give it a name that says what's inside.` });
    });
  });
  return out;
}

/** Plain-words label for a child slot, e.g. "Column 2" or the tab's label. */
export function slotName(container: ContainerBlock, index: number, child?: Block): string {
  if (container.type === 'tabs') return child?.slotLabel?.trim() || `Tab ${index + 1}`;
  if (container.type === 'columns') return `Column ${index + 1}`;
  return `Item ${index + 1}`;
}