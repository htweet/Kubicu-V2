import { useCallback, useEffect, useMemo, useState } from 'react';
import type { NfcTag } from '../types/nfc';
import { NFC_EVENT, NFC_KEY, readTags, writeTags } from '../utils/nfc';

/** This workspace's NFC tags (D442). */
export function useNfcTags(workspaceId: string) {
  const [all, setAll] = useState<NfcTag[]>(readTags);
  useEffect(() => {
    const refresh = () => setAll(readTags());
    const onStorage = (e: StorageEvent) => e.key === NFC_KEY && refresh();
    window.addEventListener(NFC_EVENT, refresh);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(NFC_EVENT, refresh);
      window.removeEventListener('storage', onStorage);
    };
  }, []);
  const tags = useMemo(() => all.filter((t) => t.workspaceId === workspaceId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [all, workspaceId]);
  const update = useCallback((fn: (list: NfcTag[]) => NfcTag[]) => writeTags(fn(readTags())), []);
  return { tags, update };
}
