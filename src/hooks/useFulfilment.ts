import { useCallback, useEffect, useState } from 'react';
import type { FulfilmentData } from '../types/fulfilment';
import { FULFILMENT_EVENT, readFulfilment, writeFulfilment } from '../utils/fulfilment';

/** Deliveries for one workspace (D96), synced across screens and tabs. */
export function useFulfilment(workspaceId: string) {
  const [data, setData] = useState<FulfilmentData>(() => readFulfilment(workspaceId));

  useEffect(() => {
    const sync = () => setData(readFulfilment(workspaceId));
    sync();
    window.addEventListener(FULFILMENT_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(FULFILMENT_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [workspaceId]);

  const update = useCallback((fn: (d: FulfilmentData) => FulfilmentData) => writeFulfilment(workspaceId, fn(readFulfilment(workspaceId))), [workspaceId]);

  return { data, update };
}