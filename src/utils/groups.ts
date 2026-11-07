import type { Block, BlockGroup, PageDocument } from '../types/page';

export type LayerUnit =
  /** `children`: blocks inside a container (D167); they move with it and are never units themselves. */
  | { kind: 'block'; key: string; block: Block; children: Block[] }
  | { kind: 'group'; key: string; group: BlockGroup; blocks: Block[] };

/**
 * Keeps groups valid: each group is one contiguous run of at least two blocks.
 * A block moved away from its group's run leaves the group; groups with fewer
 * than two members dissolve.
 */
export function normalizeGroups(doc: PageDocument): PageDocument {
  const groups = doc.groups ?? [];
  if (groups.length === 0 && !doc.blocks.some((b) => b.groupId)) return doc;
  const valid = new Set(groups.map((g) => g.id));
  const ended = new Set<string>();
  let current: string | null = null;

  const blocks = doc.blocks.map((b) => {
    let g = b.groupId && valid.has(b.groupId) ? b.groupId : null;
    if (g && g !== current && ended.has(g)) g = null;
    if (current && g !== current) ended.add(current);
    current = g;
    return (b.groupId ?? null) === g ? b : { ...b, groupId: g };
  });

  const counts = new Map<string, number>();
  blocks.forEach((b) => b.groupId && counts.set(b.groupId, (counts.get(b.groupId) ?? 0) + 1));
  const keep = groups.filter((g) => (counts.get(g.id) ?? 0) >= 2);
  const keepIds = new Set(keep.map((g) => g.id));

  return {
    ...doc,
    blocks: blocks.map((b) => (b.groupId && !keepIds.has(b.groupId) ? { ...b, groupId: null } : b)),
    groups: keep,
  };
}

export function groupRange(doc: PageDocument, groupId: string): [number, number] | null {
  const start = doc.blocks.findIndex((b) => b.groupId === groupId);
  if (start < 0) return null;
  let end = start;
  while (end + 1 < doc.blocks.length && doc.blocks[end + 1].groupId === groupId) end++;
  return [start, end];
}

export function toUnits(doc: PageDocument): LayerUnit[] {
  const byId = new Map((doc.groups ?? []).map((g) => [g.id, g]));
  const units: LayerUnit[] = [];
  for (const block of doc.blocks) {
    if (block.parentId) continue;
    const group = block.groupId ? byId.get(block.groupId) : undefined;
    const last = units[units.length - 1];
    if (group) {
      if (last && last.kind === 'group' && last.group.id === group.id) last.blocks.push(block);
      else units.push({ kind: 'group', key: `group:${group.id}`, group, blocks: [block] });
    } else {
      units.push({ kind: 'block', key: block.id, block, children: doc.blocks.filter((b) => b.parentId === block.id) });
    }
  }
  return units;
}

export function flattenUnits(units: LayerUnit[]): Block[] {
  return units.flatMap((u) => (u.kind === 'block' ? [u.block, ...u.children] : u.blocks));
}

export function findGroup(doc: PageDocument, groupId: string | null | undefined): BlockGroup | undefined {
  return groupId ? doc.groups?.find((g) => g.id === groupId) : undefined;
}

export function nextGroupName(doc: PageDocument): string {
  const names = new Set((doc.groups ?? []).map((g) => g.name));
  let n = (doc.groups?.length ?? 0) + 1;
  while (names.has(`Group ${n}`)) n++;
  return `Group ${n}`;
}
