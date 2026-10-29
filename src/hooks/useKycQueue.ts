import { useEffect, useMemo, useState } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { MONEY_EVENT, readMoney } from '../utils/money/store';
import { entityInfo } from '../utils/money/kyc';

/** One verification waiting for a KUBICU decision (D244). */
export interface KycQueueItem {
  workspaceId: string;
  workspace: string;
  entityLabel: string;
  submittedAt: string;
  attempts: number;
}

/**
 * Live list of submitted verifications across every workspace, oldest first (D244).
 * Re-reads when any wallet changes in this tab, in another tab, or every 30 seconds — so a
 * seller's submission reaches the staff console without a reload.
 */
export function useKycQueue(): KycQueueItem[] {
  const { workspaces } = useWorkspace();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key.startsWith('kubicu.money.')) bump();
    };
    window.addEventListener(MONEY_EVENT, bump);
    window.addEventListener('storage', onStorage);
    const t = window.setInterval(bump, 30000);
    return () => {
      window.removeEventListener(MONEY_EVENT, bump);
      window.removeEventListener('storage', onStorage);
      window.clearInterval(t);
    };
  }, []);

  return useMemo(
    () =>
    workspaces.
    map((w) => ({ w, kyc: readMoney(w.id).kyc })).
    filter(({ kyc }) => kyc.status === 'in_review').
    map(({ w, kyc }) => ({
      workspaceId: w.id,
      workspace: w.name,
      entityLabel: kyc.entity ? entityInfo[kyc.entity].label : 'Not chosen',
      submittedAt: kyc.submittedAt ?? new Date().toISOString(),
      attempts: kyc.attempts
    })).
    sort((a, b) => Date.parse(a.submittedAt) - Date.parse(b.submittedAt)),
    [workspaces, tick] // eslint-disable-line react-hooks/exhaustive-deps
  );
}