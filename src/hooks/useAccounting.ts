import { useCallback, useEffect, useState } from 'react';
import type { AccountingState } from '../types/accounting';
import { emptyAccounting } from '../utils/accounting/sync';

const key = (workspaceId: string) => `kubicu.accounting.${workspaceId}`;

function read(workspaceId: string): AccountingState {
  try {
    const raw = localStorage.getItem(key(workspaceId));
    return raw ? { ...emptyAccounting(), ...(JSON.parse(raw) as Partial<AccountingState>) } : emptyAccounting();
  } catch {
    return emptyAccounting();
  }
}

/** The workspace's accounting connection (D438), saved in this browser. */
export function useAccounting(workspaceId: string) {
  const [data, setData] = useState<AccountingState>(() => read(workspaceId));
  useEffect(() => setData(read(workspaceId)), [workspaceId]);
  const update = useCallback(
    (fn: (s: AccountingState) => AccountingState) => {
      setData((prev) => {
        const next = fn(prev);
        try {
          localStorage.setItem(key(workspaceId), JSON.stringify(next));
        } catch {
          // Storage full — lasts for this visit.
        }
        return next;
      });
    },
    [workspaceId],
  );
  return { data, update };
}
