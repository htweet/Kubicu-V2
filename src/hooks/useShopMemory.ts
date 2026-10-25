import { useCallback, useEffect, useState } from 'react';

const EVENT = 'kubicu:shop-memory';
const RECENT_MAX = 8;

function read(key: string): string[] {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) as unknown : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function write(key: string, ids: string[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(ids));
  } catch {

    /* storage unavailable — lasts until refresh */}
  window.dispatchEvent(new CustomEvent(EVENT, { detail: key }));
}

function useList(key: string | null) {
  const [ids, setIds] = useState<string[]>(() => key ? read(key) : []);
  useEffect(() => {
    if (!key) return;
    setIds(read(key));
    const sync = (e: Event) => {
      if ((e as CustomEvent<string>).detail === key) setIds(read(key));
    };
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, [key]);
  return ids;
}

/**
 * Saved items (D196): a heart that keeps a list on the visitor's own phone. No account, nothing
 * sent anywhere. `shopKey` is null in previews, where nothing is stored.
 */
export function useSavedItems(shopKey: string | null) {
  const key = shopKey ? `kubicu.saved.${shopKey}` : null;
  const ids = useList(key);
  const toggle = useCallback(
    (id: string) => {
      if (!key) return;
      const now = read(key);
      write(key, now.includes(id) ? now.filter((x) => x !== id) : [id, ...now].slice(0, 60));
    },
    [key]
  );
  return { ids, toggle, has: (id: string) => ids.includes(id) };
}

/** Recently viewed products on this phone, newest first (D196). */
export function useRecentlyViewed(shopKey: string | null) {
  const key = shopKey ? `kubicu.recent.${shopKey}` : null;
  const ids = useList(key);
  const record = useCallback(
    (id: string) => {
      if (!key) return;
      write(key, [id, ...read(key).filter((x) => x !== id)].slice(0, RECENT_MAX));
    },
    [key]
  );
  return { ids, record };
}