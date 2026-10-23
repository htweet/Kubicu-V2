import { useCallback, useEffect, useState } from 'react';
import type { ServiceOsData } from '../types/serviceOs';
import { readServiceOs, SERVICE_OS_EVENT, writeServiceOs } from '../utils/serviceOs';

/** Quotes, invoices and jobs for one workspace, kept in sync across screens and tabs (D89). */
export function useServiceOs(workspaceId: string) {
  const [data, setData] = useState<ServiceOsData>(() => readServiceOs(workspaceId));

  useEffect(() => {
    const sync = () => setData(readServiceOs(workspaceId));
    sync();
    window.addEventListener(SERVICE_OS_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(SERVICE_OS_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [workspaceId]);

  const update = useCallback((fn: (d: ServiceOsData) => ServiceOsData) => writeServiceOs(workspaceId, fn(readServiceOs(workspaceId))), [workspaceId]);

  return { data, update };
}