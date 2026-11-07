import React, { useMemo } from 'react';
import type { CommerceData, Order } from '../../../types/commerce';
import type { PaymentLink } from '../../../types/money';
import { Card } from '../../ui/layout/Card';
import { Stat, StatGroup } from '../../ui/layout/Stat';
import { mrr } from '../../../utils/commerce/subscriptions';
import { instalmentsOwed } from '../../../utils/commerce/payOptions';
import { formatNgn } from '../../../utils/format';
import { useT } from '../../../contexts/LocaleContext';
import type { ReportRange } from '../../../utils/commerce/salesReport';

/** Recurring revenue and money not yet collected (D95, D112) — kept out of “You receive”. */
export function MoneyStillToCome({ data, links, range }: { data: CommerceData; links: PaymentLink[]; range: ReportRange }) {
  const { t: tr } = useT();
  const ordersN = (n: number, one: string, many: string) => tr(n === 1 ? one : many, { n });
  const inR = (iso?: string) => !!iso && Date.parse(iso) >= range.from && Date.parse(iso) < range.to;

  const staged = useMemo(() => {
    const open = data.orders.filter((o) => o.balance && !o.balance.paidAt && o.status !== 'cancelled' && o.status !== 'refunded' && o.paymentStatus !== 'pending' && o.paymentStatus !== 'cancelled');
    const collected = data.orders.filter((o) => inR(o.balance?.paidAt)).reduce((t, o) => t + (o.balance?.dueNgn ?? 0), 0);
    const linkStages = links.flatMap((l) => l.payments).filter((p) => p.stageId && inR(p.at)).reduce((t, p) => t + p.amountNgn, 0);
    return { owed: open.reduce((t, o) => t + (o.balance?.dueNgn ?? 0), 0), owedCount: open.length, collected, linkStages, any: data.orders.some((o) => o.balance) || links.some((l) => l.stages?.length) };
  }, [data.orders, links, range]); // eslint-disable-line react-hooks/exhaustive-deps

  const payWays = useMemo(() => {
    const live = (o: Order) => o.status !== 'cancelled' && o.status !== 'refunded';
    const pod = data.orders.filter((o) => o.pod);
    const collected = pod.filter((o) => inR(o.pod?.collected?.at));
    const awaiting = pod.filter((o) => live(o) && !o.pod?.collected);
    const refused = pod.filter((o) => o.pod?.failed?.some((f) => f.reason === 'refused' && inR(f.at))).length;
    const inst = data.orders.filter((o) => o.instalments && live(o) && (o.instalments.status === 'active' || o.instalments.status === 'defaulted'));
    return {
      any: pod.length > 0 || data.orders.some((o) => o.instalments),
      collected: collected.reduce((t, o) => t + (o.pod?.amountNgn ?? 0), 0),
      collectedCount: collected.length,
      awaiting: awaiting.reduce((t, o) => t + (o.pod?.amountNgn ?? 0), 0),
      awaitingCount: awaiting.length,
      refused,
      owed: inst.reduce((t, o) => t + instalmentsOwed(o), 0),
      owedCount: inst.length,
      defaulted: inst.filter((o) => o.instalments?.status === 'defaulted').length,
    };
  }, [data.orders, range]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasSubs = (data.subscriptions ?? []).length > 0;
  if (!hasSubs && !staged.any && !payWays.any) return null;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      {hasSubs && (
        <Card id="recurring" title="Recurring revenue" description="What active subscriptions bring in each month, at today’s prices.">
          <dl>
            <Stat label="Monthly recurring" value={<>{formatNgn(mrr(data))}<span className="text-label font-normal text-fg-muted"> {tr('/mo')}</span></>} />
          </dl>
        </Card>
      )}
      {staged.any && (
        <Card id="staged" title="Staged payments" description="Made-to-order balances and payment links paid in stages. Still owed isn’t in “You receive”.">
          <StatGroup columns={3}>
            <Stat label="Still owed" value={formatNgn(staged.owed)} hint={ordersN(staged.owedCount, '{n} order waiting', '{n} orders waiting')} />
            <Stat label="Balances collected" value={formatNgn(staged.collected)} hint="This period" />
            <Stat label="Link stages paid" value={formatNgn(staged.linkStages)} hint="This period" />
          </StatGroup>
        </Card>
      )}
      {payWays.any && (
        <Card id="pay-ways" title="Pay on delivery and instalments" description="Cash and door transfers went to you directly. Money still to come isn’t in “You receive”.">
          <StatGroup columns={3}>
            <Stat label="Collected on delivery" value={formatNgn(payWays.collected)} hint={ordersN(payWays.collectedCount, '{n} order this period', '{n} orders this period') + (payWays.refused ? ` · ${tr('{n} refused', { n: payWays.refused })}` : '')} />
            <Stat label="Out for collection" value={formatNgn(payWays.awaiting)} hint={ordersN(payWays.awaitingCount, '{n} order not yet paid', '{n} orders not yet paid')} />
            <Stat label="Owed in instalments" value={formatNgn(payWays.owed)} hint={ordersN(payWays.owedCount, '{n} order', '{n} orders') + (payWays.defaulted ? ` · ${tr('{n} defaulted', { n: payWays.defaulted })}` : '')} />
          </StatGroup>
        </Card>
      )}
    </div>
  );
}
