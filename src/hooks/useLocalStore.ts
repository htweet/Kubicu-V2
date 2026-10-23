import { useCallback, useEffect, useState } from 'react';

/**
 * A small per-workspace store saved in this browser, kept in sync across screens (same tab) and tabs.
 * `empty` fills in any fields missing from older saved versions.
 */
export function useLocalStore<T extends object>(storageKey: string, empty: () => T) {
  const event = `kubicu:store:${storageKey}`;
  const read = useCallback((): T => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) return { ...empty(), ...(JSON.parse(raw) as Partial<T>) };
    } catch {

      /* fresh store */}
    return empty();
    // `empty` is a stable module-level factory in every caller.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const [data, setData] = useState<T>(read);

  useEffect(() => {
    const sync = () => setData(read());
    sync();
    const onStorage = (e: StorageEvent) => e.key === storageKey && sync();
    window.addEventListener(event, sync);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(event, sync);
      window.removeEventListener('storage', onStorage);
    };
  }, [storageKey, event, read]);

  const update = useCallback(
    (fn: (d: T) => T) => {
      const next = fn(read());
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {

        /* storage full — the change lasts for this visit */}
      setData(next);
      window.dispatchEvent(new Event(event));
    },
    [storageKey, event, read]
  );

  return { data, update };
}