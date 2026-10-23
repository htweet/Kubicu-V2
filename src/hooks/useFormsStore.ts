import { useCallback, useEffect, useState } from 'react';
import type { FormsData } from '../types/forms';
import { readForms, subscribeForms, updateForms } from '../utils/forms/storage';

/** Forms and submissions for a workspace, shared across every screen and the live page (D79). */
export function useFormsStore(workspaceId: string | null) {
  const [data, setData] = useState<FormsData | null>(() => workspaceId ? readForms(workspaceId) : null);

  useEffect(() => {
    if (!workspaceId) {
      setData(null);
      return;
    }
    const load = () => setData(readForms(workspaceId));
    load();
    const off = subscribeForms(load);
    const onStorage = (e: StorageEvent) => {
      if (e.key === `kubicu.forms.${workspaceId}`) load();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      off();
      window.removeEventListener('storage', onStorage);
    };
  }, [workspaceId]);

  const update = useCallback(
    (fn: (d: FormsData) => FormsData) => {
      if (workspaceId) setData(updateForms(workspaceId, fn));
    },
    [workspaceId]
  );

  return { data, update };
}