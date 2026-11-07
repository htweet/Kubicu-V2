import { useEffect, useRef } from 'react';
import { useEditor } from '../../contexts/EditorContext';
import { blockName } from '../../utils/blocks';
import { announce } from '../../utils/announce';

/**
 * Canvas accessibility glue (D76), rendered once by each editor:
 * - announces reorders from any source (Alt+arrows, toolbar buttons, drag) as "Moved X up — 3 of 8";
 * - after a delete, moves focus to the next block (or previous, or the empty canvas with its starter buttons)
 *   if focus was lost, and puts focus back on a block restored by Undo.
 */
export function CanvasAnnouncer() {
  const { state } = useEditor();
  const blocks = state.draft.blocks;
  const prev = useRef<{ page: string | null; ids: string[] }>({ page: state.activePageId, ids: blocks.map((b) => b.id) });
  const removed = useRef<Set<string>>(new Set());

  useEffect(() => {
    const ids = blocks.map((b) => b.id);
    const before = prev.current;
    prev.current = { page: state.activePageId, ids };
    if (before.page !== state.activePageId) return;

    const sameSet = before.ids.length === ids.length && before.ids.every((id) => ids.includes(id));
    if (sameSet) {
      const changed = ids.filter((id, i) => before.ids[i] !== id);
      if (changed.length === 0) return;
      const moved =
        (state.selectedId && changed.includes(state.selectedId) ? state.selectedId : null) ??
        changed.reduce((best, id) => (Math.abs(ids.indexOf(id) - before.ids.indexOf(id)) > Math.abs(ids.indexOf(best) - before.ids.indexOf(best)) ? id : best), changed[0]);
      const block = blocks.find((b) => b.id === moved);
      if (!block) return;
      const to = ids.indexOf(moved);
      const dir = to < before.ids.indexOf(moved) ? 'up' : 'down';
      announce(`Moved ${blockName(block)} ${dir} — ${to + 1} of ${ids.length}`);
      return;
    }

    const gone = before.ids.filter((id) => !ids.includes(id));
    const added = ids.filter((id) => !before.ids.includes(id));

    if (gone.length && !added.length) {
      gone.forEach((id) => removed.current.add(id));
      window.setTimeout(() => {
        const active = document.activeElement;
        if (active && active !== document.body && document.contains(active)) return;
        const at = before.ids.indexOf(gone[0]);
        const nextId = ids[at] ?? ids[at - 1];
        const target = nextId
          ? document.querySelector<HTMLElement>(`[data-block-id="${nextId}"]`)
          : document.querySelector<HTMLElement>('#canvas-main');
        target?.focus();
      }, 30);
      return;
    }

    const restored = added.find((id) => removed.current.has(id));
    if (restored) {
      removed.current.delete(restored);
      const block = blocks.find((b) => b.id === restored);
      if (block) announce(`${blockName(block)} restored`);
      window.setTimeout(() => document.querySelector<HTMLElement>(`[data-block-id="${restored}"]`)?.focus(), 60);
    }
  }, [blocks, state.activePageId, state.selectedId]);

  return null;
}
