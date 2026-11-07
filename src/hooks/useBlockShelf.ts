import { useCallback, useEffect, useState } from 'react';
import type { BlockType } from '../types/page';

/** Recently used and favourite blocks for the picker (D166), remembered on this device. */
const KEY = 'kubicu.blockShelf';
const RECENT_MAX = 8;

interface Shelf {
  recent: BlockType[];
  favourites: BlockType[];
  /** Suggestion ids the owner asked not to see again. */
  dismissed: string[];
  /** Compact list (default) or preview grid. */
  view: 'list' | 'grid';
}

const empty: Shelf = { recent: [], favourites: [], dismissed: [], view: 'list' };

function read(): Shelf {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...empty, ...(JSON.parse(raw) as Partial<Shelf>) } : empty;
  } catch {
    return empty;
  }
}

export function useBlockShelf() {
  const [shelf, setShelf] = useState<Shelf>(read);

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(shelf));
    } catch {
      /* storage full or blocked — the shelf just won't persist */
    }
  }, [shelf]);

  const used = useCallback((type: BlockType) => setShelf((s) => ({ ...s, recent: [type, ...s.recent.filter((t) => t !== type)].slice(0, RECENT_MAX) })), []);
  const toggleFavourite = useCallback(
    (type: BlockType) => setShelf((s) => ({ ...s, favourites: s.favourites.includes(type) ? s.favourites.filter((t) => t !== type) : [...s.favourites, type] })),
    [],
  );
  const dismiss = useCallback((id: string) => setShelf((s) => ({ ...s, dismissed: s.dismissed.includes(id) ? s.dismissed : [...s.dismissed, id] })), []);

  const setView = useCallback((view: Shelf['view']) => setShelf((s) => ({ ...s, view })), []);

  return { ...shelf, used, toggleFavourite, dismiss, setView };
}
