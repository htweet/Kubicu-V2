import { useMemo } from 'react';
import { useCommerce } from '../contexts/CommerceContext';
import { useOps } from '../contexts/OpsContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useMoney } from './useMoney';
import { useServiceOs } from './useServiceOs';
import { incomeEntries, type IncomeEntry } from '../utils/commerce/salesReport';

/** Every payment in, all time and all spaces — the same lines the Sales report shows (D227, D438). */
export function useIncomeEntries(): IncomeEntry[] {
  const { data } = useCommerce();
  const ops = useOps().data;
  const { current } = useWorkspace();
  const money = useMoney(current.id).data;
  const sos = useServiceOs(current.id).data;
  return useMemo(
    () =>
      incomeEntries(
        {
          orders: data.orders,
          subscriptions: data.subscriptions ?? [],
          giftCards: data.giftCards ?? [],
          bookings: ops.bookings,
          invoices: sos.invoices,
          linkPayments: money.links.flatMap((l) => l.payments.map((p) => ({ ...p, linkTitle: l.title }))),
        },
        { from: 0, to: Date.now() + 1 },
        null,
      ),
    [data.orders, data.subscriptions, data.giftCards, ops.bookings, sos.invoices, money.links],
  );
}
