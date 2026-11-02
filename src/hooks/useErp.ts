import { useCallback, useEffect, useState } from 'react';
import type { ErpState } from '../types/erp';
import { emptyErp } from '../utils/erp/sync';

const key = (workspaceId: string) => `kubicu.erp.${workspaceId}`;

function read(workspaceId: string): ErpState {
  try {
    const raw = localStorage.getItem(key(workspaceId));
    return raw ? { ...emptyErp(), ...(JSON.parse(raw) as Partial<ErpState>) } : emptyErp();
  } catch {
    return emptyErp();
  }
}

/** The workspace's ERP connection (D440), saved in this browser. */
export function useErp(workspaceId: string) {
  const [data, setData] = useState<ErpState>(() => read(workspaceId));
  useEffect(() => setData(read(workspaceId)), [workspaceId]);
  const save = useCallback(
    (next: ErpState) => {
      setData(next);
      try {
        localStorage.setItem(key(workspaceId), JSON.stringify(next));
      } catch {

        // Storage full — lasts for this visit.
      }},
    [workspaceId]
  );
  return { data, save };
}