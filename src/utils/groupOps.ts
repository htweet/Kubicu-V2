import type { Block, BlockGroup, PageDocument } from '../types/page';
import { cloneBlock } from './blocks';
import { flattenUnits, groupRange, toUnits } from './groups';
import { uid } from './id';

/** Pure document transforms for block groups. Each returns the same doc when nothing changes. */

export function groupBlocks(doc: PageDocument, ids: string[], group: BlockGroup): PageDocument {
  const chosen = new Set(ids);
  const firstIndex = doc.blocks.findIndex((b) => chosen.has(b.id));
  if (firstIndex < 0 || ids.length < 2) return doc;
  const rest = doc.blocks.filter((b) => !chosen.has(b.id));
  const members = doc.blocks.filter((b) => chosen.has(b.id)).map((b) => ({ ...b, groupId: group.id }));
  const insertAt = doc.blocks.slice(0, firstIndex).filter((b) => !chosen.has(b.id)).length;
  rest.splice(insertAt, 0, ...members);
  return { ...doc, blocks: rest, groups: [...(doc.groups ?? []), group] };
}

export function ungroup(doc: PageDocument, groupId: string): PageDocument {
  return {
    ...doc,
    blocks: doc.blocks.map((b) => (b.groupId === groupId ? { ...b, groupId: null } : b)),
    groups: (doc.groups ?? []).filter((g) => g.id !== groupId),
  };
}

export function renameGroup(doc: PageDocument, groupId: string, name: string): PageDocument {
  return { ...doc, groups: (doc.groups ?? []).map((g) => (g.id === groupId ? { ...g, name } : g)) };
}

export function setGroupLocked(doc: PageDocument, groupId: string, locked: boolean): PageDocument {
  return { ...doc, blocks: doc.blocks.map((b) => (b.groupId === groupId ? { ...b, locked } : b)) };
}

export function setGroupHidden(doc: PageDocument, groupId: string, hidden: boolean): PageDocument {
  return {
    ...doc,
    blocks: doc.blocks.map((b) => (b.groupId === groupId ? { ...b, visibility: { ...b.visibility, hidden } } : b)),
  };
}

export function moveGroup(doc: PageDocument, groupId: string, direction: -1 | 1): PageDocument {
  const units = toUnits(doc);
  const i = units.findIndex((u) => u.kind === 'group' && u.group.id === groupId);
  const j = i + direction;
  if (i < 0 || j < 0 || j >= units.length) return doc;
  [units[i], units[j]] = [units[j], units[i]];
  return { ...doc, blocks: flattenUnits(units) };
}

export function reorderUnits(doc: PageDocument, keys: string[]): PageDocument {
  const units = toUnits(doc);
  if (keys.join('|') === units.map((u) => u.key).join('|')) return doc;
  const byKey = new Map(units.map((u) => [u.key, u]));
  const next = keys.map((k) => byKey.get(k)).filter((u): u is (typeof units)[number] => !!u);
  if (next.length !== units.length) return doc;
  return { ...doc, blocks: flattenUnits(next) };
}

export function reorderWithinGroup(doc: PageDocument, groupId: string, ids: string[]): PageDocument {
  const range = groupRange(doc, groupId);
  if (!range) return doc;
  const run = doc.blocks.slice(range[0], range[1] + 1);
  if (ids.join('|') === run.map((b) => b.id).join('|')) return doc;
  const byId = new Map(run.map((b) => [b.id, b]));
  const reordered = ids.map((id) => byId.get(id)).filter((b): b is Block => !!b);
  if (reordered.length !== run.length) return doc;
  const blocks = [...doc.blocks];
  blocks.splice(range[0], run.length, ...reordered);
  return { ...doc, blocks };
}

export function moveWithinGroup(doc: PageDocument, id: string, direction: -1 | 1): PageDocument {
  const i = doc.blocks.findIndex((b) => b.id === id);
  const block = doc.blocks[i];
  if (!block?.groupId || block.locked) return doc;
  const range = groupRange(doc, block.groupId);
  const j = i + direction;
  if (!range || j < range[0] || j > range[1]) return doc;
  const blocks = [...doc.blocks];
  [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
  return { ...doc, blocks };
}

export function removeFromGroup(doc: PageDocument, id: string): PageDocument {
  const block = doc.blocks.find((b) => b.id === id);
  if (!block?.groupId) return doc;
  const range = groupRange(doc, block.groupId);
  if (!range) return doc;
  const blocks = doc.blocks.filter((b) => b.id !== id);
  blocks.splice(range[1], 0, { ...block, groupId: null });
  return { ...doc, blocks };
}

export function duplicateGroup(doc: PageDocument, groupId: string): PageDocument {
  const range = groupRange(doc, groupId);
  const source = doc.groups?.find((g) => g.id === groupId);
  if (!range || !source) return doc;
  const group: BlockGroup = { id: uid('grp'), name: `${source.name} copy` };
  const copies = doc.blocks.slice(range[0], range[1] + 1).map((b) => ({ ...cloneBlock(b), groupId: group.id }));
  const blocks = [...doc.blocks];
  blocks.splice(range[1] + 1, 0, ...copies);
  return { ...doc, blocks, groups: [...(doc.groups ?? []), group] };
}

/** Deletes a group and its blocks. Locked blocks stay, outside the group. */
export function removeGroup(doc: PageDocument, groupId: string): PageDocument {
  return {
    ...doc,
    blocks: doc.blocks.filter((b) => b.groupId !== groupId || b.locked).map((b) => (b.groupId === groupId ? { ...b, groupId: null } : b)),
    groups: (doc.groups ?? []).filter((g) => g.id !== groupId),
  };
}
