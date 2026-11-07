import { useCallback, useEffect, useState } from 'react';
import type { ProofData } from '../types/proof';
import { PROOF_EVENT, readProof, writeProof } from '../utils/proof';

/** Review requests, reviews and delivered work for one workspace (D91). */
export function useProof(workspaceId: string | null) {
  const [data, setData] = useState<ProofData | null>(() => (workspaceId ? readProof(workspaceId) : null));

  useEffect(() => {
    if (!workspaceId) return;
    const sync = () => setData(readProof(workspaceId));
    sync();
    window.addEventListener(PROOF_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(PROOF_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [workspaceId]);

  const update = useCallback(
    (fn: (d: ProofData) => ProofData) => {
      if (workspaceId) writeProof(workspaceId, fn(readProof(workspaceId)));
    },
    [workspaceId],
  );

  return { data, update };
}
