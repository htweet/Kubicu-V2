import React, { useEffect, useState } from 'react';
import { CheckIcon, FastForwardIcon, PackageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useTeam } from '../../contexts/TeamContext';
import { useMoney } from '../../hooks/useMoney';
import { useLocalStore } from '../../hooks/useLocalStore';
import { kitItems } from '../../utils/domains/printKit';
import { canCancel, deliveryZones, emptyPrintOrders, estimateArrival, flowStages, PRINT_PARTNER, printOrdersKey, stageIndex, stageLabels, stageOf, stageTones, type PrintOrder } from '../../utils/domains/printOrders';
import { formatNaira as formatNgn, formatRelative } from '../../utils/format';
import { uid } from '../../utils/id';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

/** Print orders with live tracking, cancel-before-printing and a prototype fast-forward (D114). */
export function PrintOrdersList({ highlightId }: {highlightId?: string | null;}) {
  const { current } = useWorkspace();
  const team = useTeam();
  const money = useMoney(current.id);
  const { data, update } = useLocalStore(printOrdersKey(current.id), emptyPrintOrders);
  const [, tick] = useState(0);

  // Stages move with time; re-check every 30 seconds.
  useEffect(() => {
    const t = window.setInterval(() => tick((n) => n + 1), 30000);
    return () => window.clearInterval(t);
  }, []);

  if (data.orders.length === 0) return null;

  const cancel = (o: PrintOrder) => {
    if (!canCancel(o)) return toast.error('Printing has started', { description: 'This order can’t be cancelled any more.' });
    const at = new Date().toISOString();
    if (o.payMethod === 'wallet') money.update((m) => ({ ...m, ledger: [{ id: uid('led'), at, kind: 'purchase', amountNgn: o.totalNgn, state: 'available', label: `Print order cancelled · ${o.ref}` }, ...m.ledger] }));
    update((d) => ({ ...d, orders: d.orders.map((x) => x.id === o.id ? { ...x, cancelledAt: at, refundedTo: o.payMethod } : x) }));
    team.log('pages', `cancelled print order ${o.ref}`, '/app/domains/kit');
    toast.success(`${o.ref} cancelled`, { description: `${formatNgn(o.totalNgn)} refunded to your ${o.payMethod === 'wallet' ? 'wallet' : 'card'}.` });
  };

  const skip = (o: PrintOrder) => update((d) => ({ ...d, orders: d.orders.map((x) => x.id === o.id ? { ...x, skipped: x.skipped + 1 } : x) }));

  return (
    <section aria-labelledby="print-orders" className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="print-orders" className="text-heading font-semibold text-fg">
          Print orders
        </h2>
        <span className="text-caption text-fg-subtle">{PRINT_PARTNER} · simulated</span>
      </div>
      <ul className="flex flex-col divide-y divide-line rounded-lg border border-line bg-raised">
        {data.orders.map((o) => {
          const stage = stageOf(o);
          const at = stageIndex(stage);
          const spec = kitItems.find((k) => k.id === o.item);
          const eta = estimateArrival(o.zone, new Date(o.placedAt));
          return (
            <li key={o.id} className={cn('flex flex-col gap-4 p-4 md:p-5', highlightId === o.id && 'bg-sunken')}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sunken text-fg-muted">
                    <PackageIcon size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-label font-semibold text-fg">
                      {o.quantity.toLocaleString('en-NG')} × {spec?.label ?? o.item} <span className="font-normal text-fg-subtle">· {o.ref}</span>
                    </p>
                    <p className="text-caption text-fg-muted">
                      {o.finish} · {formatNgn(o.totalNgn)} · ordered {formatRelative(o.placedAt)} by {o.placedBy}
                    </p>
                  </div>
                </div>
                <Badge tone={stageTones[stage]} dot>
                  {stageLabels[stage]}
                </Badge>
              </div>

              {stage === 'cancelled' ?
              <p className="text-caption text-fg-muted">Cancelled before printing · {formatNgn(o.totalNgn)} refunded to your {o.refundedTo === 'wallet' ? 'wallet' : 'card'}.</p> :

              <ol className="grid grid-cols-4 gap-2" aria-label={`Progress: ${stageLabels[stage]}`}>
                  {flowStages.map((s, i) =>
                <li key={s} className="flex flex-col gap-1.5">
                      <span className={cn('h-1 rounded-full', i <= at ? 'bg-action' : 'bg-line')} />
                      <span className={cn('flex items-center gap-1 text-caption', i === at ? 'font-semibold text-fg' : i < at ? 'text-fg-muted' : 'text-fg-subtle')}>
                        {i < at && <CheckIcon size={12} aria-hidden />}
                        {stageLabels[s]}
                      </span>
                    </li>
                )}
                </ol>
              }

              {stage !== 'cancelled' &&
              <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-caption text-fg-muted">
                    {stage === 'delivered' ?
                  o.zone === 'pickup' ?
                  'Collected from the print shop.' :
                  `Delivered to ${o.recipient.name}.` :
                  `${o.zone === 'pickup' ? 'Ready to pick up' : `To ${o.recipient.state}`} · expected ${eta.earliest.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}${eta.latest.getTime() !== eta.earliest.getTime() ? `–${eta.latest.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}` : ''} · ${deliveryZones.find((z) => z.id === o.zone)?.label}`}
                  </p>
                  <div className="flex gap-2">
                    {canCancel(o) &&
                  <Button size="sm" variant="tertiary" onClick={() => cancel(o)}>
                        Cancel & refund
                      </Button>
                  }
                    {stage !== 'delivered' &&
                  <Button size="sm" variant="secondary" leadingIcon={FastForwardIcon} onClick={() => skip(o)} title="Prototype only">
                        Prototype: next stage
                      </Button>
                  }
                  </div>
                </div>
              }
            </li>);

        })}
      </ul>
    </section>);

}