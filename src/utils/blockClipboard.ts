import type { Block } from '../types/page';

/**
 * The canvas clipboard (D515, D516): copied blocks kept on this device, so they can be pasted on another page or
 * another space in the same browser. Copies get fresh ids when pasted, like saved sections.
 */
const KEY = 'kubicu.canvas.clipboard';
const EVENT = 'kubicu:canvas-clipboard';

/** Drag data type for a block dragged from the library onto the artboard (D515). Its value is the block type. */
export const LIBRARY_DRAG_TYPE = 'application/x-kubicu-block';

/** Browsers hide drag data until the drop, so the dragged type is kept here to check fit while hovering (D516). */
let draggingType: string | null = null;
export const setLibraryDrag = (type: string | null) => {
  draggingType = type;
};
export const libraryDrag = () => draggingType;

/** The block plus everything inside it when it's a container. The copied block itself always starts on its own. */
export function blocksToCopy(all: Block[], id: string): Block[] {
  const block = all.find((b) => b.id === id);
  if (!block) return [];
  const free = (b: Block) => ({ ...b, locked: false, groupId: null }) as Block;
  return [{ ...free(block), parentId: null } as Block, ...all.filter((b) => b.parentId === id).map(free)];
}

export function writeClipboard(blocks: Block[]): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify({ blocks, at: new Date().toISOString() }));
    window.dispatchEvent(new Event(EVENT));
    return true;
  } catch {
    return false;
  }
}

export function readClipboard(): Block[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as { blocks?: Block[] }) : null;
    return Array.isArray(parsed?.blocks) ? parsed.blocks : [];
  } catch {
    return [];
  }
}

/** Calls back when the clipboard changes here or in another tab. */
export function subscribeClipboard(cb: () => void): () => void {
  const onStorage = (e: StorageEvent) => e.key === KEY && cb();
  window.addEventListener(EVENT, cb);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener('storage', onStorage);
  };
}

/** A stable snapshot for useSyncExternalStore: the raw stored value. */
export function clipboardSnapshot(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}
