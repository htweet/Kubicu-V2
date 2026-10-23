import { useCallback, useEffect, useState } from 'react';
import type { MoneyData } from '../types/money';
import { MONEY_EVENT, readMoney, writeMoney } from '../utils/money/store';

/**
 * Wallet, payouts and payment links for one workspace (D92), kept in sync across screens and tabs.
 * Re-reads every few seconds so settlements, escrow windows and payouts move on their own.
 */
export function useMoney(workspaceId: string) {
  const [data, setData] = useState<MoneyData>(() => readMoney(workspaceId));

  useEffect(() => {
    const sync = () => setData(readMoney(workspaceId));
    sync();
    const timer = window.setInterval(sync, 4000);
    window.addEventListener(MONEY_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener(MONEY_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [workspaceId]);

  const update = useCallback((fn: (d: MoneyData) => MoneyData) => writeMoney(workspaceId, fn(readMoney(workspaceId))), [workspaceId]);

  return { data, update };
}