import type { Block, BlockType } from '../types/page';
import { blockCatalog, type BlockPreset } from '../data/blockCatalog';
import { createBlock } from './blocks';

/*
 * Switching an existing block between its ready-made looks (D177).
 * A look only changes the block's *shape* — variants, layouts, ratios, emphasis, width, background.
 * Sample words, cleared titles and item lists in a look's preset are skipped, so the owner's
 * content is never replaced.
 */

export interface LookOption {
  id: string;
  name: string;
  note?: string;
  shape: Required<BlockPreset>;
}

type Bag = Record<string, unknown>;

/** Settings-like values: on/off, numbers and short single-word options ("split", "grid", "wide-first"). */
const isShapeValue = (v: unknown) =>
  typeof v === 'boolean' || typeof v === 'number' || (typeof v === 'string' && v.length > 0 && v.length <= 24 && !/\s/.test(v));

function shapeOf(preset: BlockPreset): Required<BlockPreset> {
  return {
    content: Object.fromEntries(Object.entries(preset.content ?? {}).filter(([, v]) => isShapeValue(v))),
    style: { ...(preset.style ?? {}) },
    layout: { ...(preset.layout ?? {}) },
  };
}

const size = (s: Required<BlockPreset>) => Object.keys(s.content).length + Object.keys(s.style).length + Object.keys(s.layout).length;
const key = (s: Required<BlockPreset>) => JSON.stringify([s.content, s.style, s.layout]);

const cache = new Map<BlockType, LookOption[]>();

/** "Standard" plus every distinct look for this block type. Empty when the block has no looks. */
export function looksFor(type: BlockType): LookOption[] {
  const hit = cache.get(type);
  if (hit) return hit;
  const looks: LookOption[] = [];
  const seen = new Set<string>();
  for (const e of blockCatalog) {
    if (e.kind !== 'look' || e.type !== type || !e.preset) continue;
    const shape = shapeOf(e.preset());
    if (!size(shape) || seen.has(key(shape))) continue;
    seen.add(key(shape));
    looks.push({ id: `look-${e.n}`, name: e.name, note: e.note, shape });
  }
  if (!looks.length) {
    cache.set(type, []);
    return [];
  }
  // Standard = the block's own defaults for every setting any look touches.
  const fresh = createBlock(type);
  const pick = (from: object, keys: Set<string>) => Object.fromEntries([...keys].map((k) => [k, (from as Bag)[k]]));
  const keys = { content: new Set<string>(), style: new Set<string>(), layout: new Set<string>() };
  looks.forEach((l) => (['content', 'style', 'layout'] as const).forEach((p) => Object.keys(l.shape[p]).forEach((k) => keys[p].add(k))));
  const standard: Required<BlockPreset> = {
    content: pick(fresh.content, keys.content),
    style: pick(fresh.style, keys.style),
    layout: pick(fresh.layout, keys.layout),
  };
  const options = [{ id: 'standard', name: 'Standard', note: 'The block as it first arrives', shape: standard }, ...looks.filter((l) => key(l.shape) !== key(standard))];
  const result = options.length > 1 ? options : [];
  cache.set(type, result);
  return result;
}

const matches = (have: object, want: Bag) => Object.entries(want).every(([k, v]) => ((have as Bag)[k] ?? undefined) === (v ?? undefined));

/** The look the block currently matches (the most specific one), or null for custom settings. */
export function currentLook(block: Block, options = looksFor(block.type)): LookOption | null {
  const fits = options.filter(
    (o) => matches(block.content, o.shape.content) && matches(block.style, o.shape.style) && (!!block.parentId || matches(block.layout, o.shape.layout)),
  );
  const specific = fits.filter((o) => o.id !== 'standard').sort((a, b) => size(b.shape) - size(a.shape));
  return specific[0] ?? fits.find((o) => o.id === 'standard') ?? null;
}

/** The block with a look's shape applied. Blocks inside a container keep their layout (the container owns it). */
export function withLook(block: Block, look: LookOption): Block {
  return {
    ...block,
    content: { ...block.content, ...look.shape.content },
    style: { ...block.style, ...look.shape.style },
    layout: block.parentId ? block.layout : { ...block.layout, ...look.shape.layout },
  } as Block;
}
