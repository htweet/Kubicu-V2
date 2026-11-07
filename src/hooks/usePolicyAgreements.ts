import { useCallback, useEffect, useState } from 'react';
import { AGREEMENTS_EVENT, readAgreements, writeAgreements, type PolicyAgreementStore } from '../utils/policyAgreements';

/** This workspace's policy agreements (D141). Kept per workspace on this device in the prototype. */
export function usePolicyAgreements(workspaceId: string): [PolicyAgreementStore, (fn: (s: PolicyAgreementStore) => PolicyAgreementStore) => void] {
  const [store, setStore] = useState(() => readAgreements(workspaceId));
  useEffect(() => {
    setStore(readAgreements(workspaceId));
    const sync = () => setStore(readAgreements(workspaceId));
    window.addEventListener(AGREEMENTS_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(AGREEMENTS_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [workspaceId]);
  const update = useCallback((fn: (s: PolicyAgreementStore) => PolicyAgreementStore) => writeAgreements(workspaceId, fn(readAgreements(workspaceId))), [workspaceId]);
  return [store, update];
}
