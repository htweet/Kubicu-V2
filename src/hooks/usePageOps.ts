import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { OpsData } from '../types/ops';
import { useOps } from '../contexts/OpsContext';
import { readOps, writeOps } from '../utils/ops/storage';

export interface PageOps {
  data: OpsData | null;
  apply: (fn: (d: OpsData) => OpsData) => boolean;
}

/** Bookings and contacts for the page being viewed (own workspace or another on this device). */
export function usePageOps(workspaceId: string | null, isOwn: boolean): PageOps {
  const own = useOps();
  const [other, setOther] = useState<OpsData | null>(() => !isOwn && workspaceId ? readOps(workspaceId) : null);

  useEffect(() => {
    if (!isOwn && workspaceId) setOther(readOps(workspaceId));
  }, [isOwn, workspaceId]);

  const applyOther = useCallback(
    (fn: (d: OpsData) => OpsData) => {
      if (!workspaceId) return false;
      const current = readOps(workspaceId);
      if (!current) return false;
      const next = fn(current);
      try {
        writeOps(workspaceId, next);
      } catch {
        toast.error('Couldn’t complete that', { description: 'Browser storage is full.' });
        return false;
      }
      setOther(next);
      return true;
    },
    [workspaceId]
  );

  return isOwn ? { data: own.data, apply: own.apply } : { data: other, apply: applyOther };
}