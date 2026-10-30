import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { CalendarClockIcon, CopyIcon, CreditCardIcon, GiftIcon, PauseIcon, PlayIcon, RotateCcwIcon, SkipForwardIcon, TruckIcon, XCircleIcon } from 'lucide-react';
import type { Subscription } from '../../types/subscriptions';
import { useCommerce } from '../../contexts/CommerceContext';
import { useBilling } from '../../contexts/BillingContext';
import { usePlan } from '../../contexts/PlanContext';
import { useTeam } from '../../contexts/TeamContext';
import { useEditor } from '../../contexts/EditorContext';
import { cancelSub, giveFreeCycle, intervalWord, lastPaid, pauseSub, refundLastPayment, resumeSub, skipNextCycle, subDate, undoCancel, updateCard, SUB_RETRY_DAYS } from '../../utils/commerce/subscriptions';
import { formatNgn, formatTimestamp } from '../../utils/format';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { TextInput } from '../ui/TextInput';
import { InlineAlert } from '../ui/InlineAlert';
import { SubStatusBadge } from './SubStatusBadge';
import { SampleTag } from '../commerce/StatusBadges';
import { cn } from '../../utils/cn';
import { useT } from '../../contexts/LocaleContext';

type Confirm = 'cancel' | 'refund' | null;

/** One subscriber: facts, actions, payments and timeline (D69). */
export function SubscriberDetail({ subId, onClose }: {subId: string | null;onClose: () => void;}) {
  const { t: tr } = useT();
  const { data, apply } = useCommerce();
  const { renewalOutcome } = useBilling();
  const plan = usePlan();
  const team = useTeam();
  const { state } = useEditor();
  const can = team.can('orders.manage');
  const sub = data.subscriptions.find((s) => s.id === subId) ?? null;
  const subPlan = sub ? data.subPlans.find((p) => p.id === sub.planId) : undefined;
  const pending = sub?.pendingPlanId ? data.subPlans.find((p) => p.id === sub.pendingPlanId) : undefined;
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [reason, setReason] = useState('');
  const [whenEnd, setWhenEnd] = useState<'period' | 'now'>('period');

  useEffect(() => {
    setConfirm(null);
    setReason('');
  }, [subId]);

  const run = (fn: (s: Subscription) => Parameters<typeof apply>[0], msg: string, logText?: string) => {
    if (!sub) return;
    if (apply(fn(sub))) {
      toast.success(msg);
      if (logText) team.log('commerce', logText, '/app/commerce/subscriptions');
    }
  };

  const portal = sub ? `/p/${sub.sourceHandle ?? state.published.handle}/subscription/${sub.token}` : '';
  const live = sub && sub.status !== 'ended';
  const paid = sub ? lastPaid(sub) : undefined;
  const cycle = tr(subPlan ? intervalWord[subPlan.interval] : 'cycle');

  return (
    <Sheet
      open={!!sub}
      onClose={onClose}
      side="right"
      size="lg"
      title={sub?.customer.name ?? ''}
      description={sub ? `${subPlan?.name ?? tr('Removed plan')} · ${tr('since {date}', { date: subDate(sub.startedAt) })}` : undefined}>
      
      {sub &&
      <div className="flex flex-col gap-6 px-5 py-5">
          <div className="flex flex-wrap items-center gap-2">
            <SubStatusBadge status={sub.status} />
            {sub.sample && <SampleTag />}
            <Button
            size="sm"
            variant="tertiary"
            leadingIcon={CopyIcon}
            className="ml-auto"
            onClick={() =>
            void navigator.clipboard?.writeText(`${window.location.origin}${portal}`).then(
              () => toast.success(tr('Subscriber link copied'), { description: tr('They can pause, skip, switch, update their card or cancel there.') }),
              () => toast.error(tr('Couldn’t copy the link'))
            )
            }>
            
              {tr('Copy their link')}
            </Button>
            <Link to={portal} className="text-caption font-medium text-action hover:underline">
              {tr('Open as subscriber')}
            </Link>
          </div>

          {sub.status === 'past_due' && sub.graceEndsAt &&
        <InlineAlert tone="danger" title={tr('Payment failed')}>
              {tr('Retried automatically on days {days} ({done} of {total} done). Ends {date} if it isn’t paid — a new card from the subscriber settles it straight away.', { days: SUB_RETRY_DAYS.join(', '), done: sub.retries, total: SUB_RETRY_DAYS.length, date: subDate(sub.graceEndsAt) })}
            </InlineAlert>
        }
          {!can.allowed && <p className="text-caption text-fg-muted">{can.reason}</p>}

          <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <Fact icon={CalendarClockIcon} label={tr(sub.status === 'ended' ? 'Ended' : sub.status === 'cancelling' ? 'Ends' : sub.status === 'trialing' ? 'Trial ends — first charge' : sub.status === 'paused' ? 'Paused until' : 'Next charge')}>
              {sub.status === 'ended' ? sub.endedAt ? subDate(sub.endedAt) : '—' : `${subDate(sub.periodEnd)}${subPlan && sub.status !== 'cancelling' ? ` · ${formatNgn((pending ?? subPlan).priceNgn + (sub.delivery?.method === 'delivery' ? sub.delivery.feeNgn : 0))}` : ''}`}
              {pending && <span className="block text-caption text-fg-muted">{tr('Switching to {plan} then', { plan: pending.name })}</span>}
            </Fact>
            <Fact icon={CreditCardIcon} label={tr('Card')}>
              {sub.card.brand} •••• {sub.card.last4}
            </Fact>
            <Fact icon={TruckIcon} label={tr('Customer')}>
              {sub.customer.phone}
              {sub.customer.email && <span className="block text-caption text-fg-muted">{sub.customer.email}</span>}
            </Fact>
            {sub.delivery &&
          <Fact icon={TruckIcon} label={tr('Box delivery')}>
                {sub.delivery.method === 'delivery' ? `${sub.delivery.zoneName} · ${formatNgn(sub.delivery.feeNgn)}` : tr('Pickup')}
                {sub.delivery.address && <span className="block text-caption text-fg-muted">{sub.delivery.address}</span>}
              </Fact>
          }
            {sub.cancelReason &&
          <Fact icon={XCircleIcon} label={tr('Reason for cancelling')}>
                “{sub.cancelReason}”
              </Fact>
          }
          </dl>

          {live &&
        <div className="flex flex-wrap gap-2 border-y border-line py-4">
              {sub.status === 'paused' ?
          <Button size="sm" variant="secondary" leadingIcon={PlayIcon} disabled={!can.allowed} onClick={() => run((s) => (d) => resumeSub(d, s.id, 'seller'), tr('Subscription resumed'))}>
                  {tr('Resume')}
                </Button> :
          sub.status === 'cancelling' ?
          <Button size="sm" variant="secondary" leadingIcon={PlayIcon} disabled={!can.allowed} onClick={() => run((s) => (d) => undoCancel(d, s.id, 'seller'), tr('Cancellation undone'))}>
                  {tr('Undo cancellation')}
                </Button> :

          (sub.status === 'active' || sub.status === 'trialing') &&
          <>
                    <Button size="sm" variant="secondary" leadingIcon={PauseIcon} disabled={!can.allowed || sub.status === 'trialing'} onClick={() => run((s) => (d) => pauseSub(d, s.id, 1, 'seller'), tr('Paused for one {cycle}', { cycle }))}>
                      {tr('Pause one {cycle}', { cycle })}
                    </Button>
                    <Button size="sm" variant="secondary" leadingIcon={SkipForwardIcon} disabled={!can.allowed || sub.status === 'trialing'} onClick={() => run((s) => (d) => skipNextCycle(d, s.id, 'seller'), tr('Next cycle skipped'))}>
                      {tr('Skip next')}
                    </Button>
                  </>

          }
              {sub.status === 'past_due' &&
          <Button size="sm" variant="secondary" leadingIcon={RotateCcwIcon} disabled={!can.allowed} onClick={() => run((s) => (d) => updateCard(d, s.id, s.card, renewalOutcome, plan.id, 'seller'), tr(renewalOutcome === 'succeeds' ? 'Retried — paid' : 'Retried — still declined'))}>
                  {tr('Retry now')}
                </Button>
          }
              <Button size="sm" variant="secondary" leadingIcon={GiftIcon} disabled={!can.allowed || sub.status === 'past_due'} onClick={() => run((s) => (d) => giveFreeCycle(d, s.id), tr('Free {cycle} given', { cycle }), `gave ${sub.customer.name} a free subscription cycle`)}>
                {tr('Give a free {cycle}', { cycle })}
              </Button>
              {sub.status !== 'cancelling' &&
          <Button size="sm" variant="tertiary" className="sm:ml-auto" disabled={!can.allowed} onClick={() => setConfirm('cancel')}>
                  {tr('Cancel subscription')}
                </Button>
          }
            </div>
        }

          <section aria-labelledby="sub-payments">
            <div className="flex items-center justify-between gap-3">
              <h3 id="sub-payments" className="text-label font-semibold text-fg">
                {tr('Payments')}
              </h3>
              {paid &&
            <Button size="sm" variant="tertiary" disabled={!can.allowed || !team.can('orders.refund').allowed} onClick={() => setConfirm('refund')}>
                  {tr('Refund last payment')}
                </Button>
            }
            </div>
            {sub.payments.length === 0 ?
          <p className="mt-2 text-caption text-fg-muted">{tr(sub.status === 'trialing' ? 'No payments yet — the first charge is when the trial ends.' : 'No payments yet.')}</p> :

          <ul className="mt-2 divide-y divide-line rounded-lg border border-line bg-raised">
                {sub.payments.map((p) =>
            <li key={p.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-label">
                    <span className="w-[100px] text-caption text-fg-muted">{subDate(p.at)}</span>
                    <span className="min-w-0 flex-1 text-fg">
                      {p.label}
                      {p.orderId &&
                <Link to={`/app/commerce/orders?order=${p.orderId}`} className="ml-2 text-caption font-medium text-action hover:underline">
                          {tr('Order #{n}', { n: data.orders.find((o) => o.id === p.orderId)?.number ?? '' })}
                        </Link>
                }
                    </span>
                    <span className={cn('text-caption font-medium', p.status === 'failed' ? 'text-danger' : p.status === 'refunded' ? 'text-fg-subtle' : 'text-success')}>{tr(p.status === 'paid' ? 'Paid' : p.status === 'failed' ? 'Failed' : 'Refunded')}</span>
                    <span className={cn('w-[90px] text-right tabular-nums', p.status === 'paid' ? 'text-fg' : 'text-fg-subtle line-through')}>{formatNgn(p.amountNgn)}</span>
                  </li>
            )}
              </ul>
          }
          </section>

          <section aria-labelledby="sub-timeline">
            <h3 id="sub-timeline" className="text-label font-semibold text-fg">
              {tr('Timeline')}
            </h3>
            <ol className="mt-2 flex flex-col">
              {sub.events.map((e) =>
            <li key={e.id} className="grid grid-cols-[12px_minmax(0,1fr)] gap-x-3 border-l border-line py-2 pl-3 first:pt-0">
                  <span className="-ml-[19px] mt-1.5 h-2 w-2 rounded-full bg-fg-subtle" aria-hidden />
                  <div>
                    <p className="text-label text-fg">{tr(e.label)}</p>
                    <p className="text-caption text-fg-subtle">
                      {formatTimestamp(e.at)} · {tr(e.by === 'customer' ? 'Subscriber' : e.by === 'seller' ? 'You' : 'Automatic')}
                    </p>
                  </div>
                </li>
            )}
            </ol>
          </section>
        </div>
      }

      <Dialog
        open={confirm === 'cancel'}
        onClose={() => setConfirm(null)}
        title={tr('Cancel {name}’s subscription?', { name: sub?.customer.name ?? '' })}
        description={tr('They’re not charged again. Nothing already paid is refunded unless you refund it.')}
        footer={
        <>
            <Button variant="secondary" onClick={() => setConfirm(null)}>
              {tr('Keep it')}
            </Button>
            <Button
            variant="destructive"
            onClick={() => {
              run((s) => (d) => cancelSub(d, s.id, reason.trim(), 'seller', whenEnd === 'now'), tr(whenEnd === 'now' ? 'Subscription ended' : 'Subscription will end at the period end'), `cancelled ${sub?.customer.name}’s subscription`);
              setConfirm(null);
            }}>
            
              {tr('Cancel subscription')}
            </Button>
          </>
        }>
        
        <div className="flex flex-col gap-4">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-label font-medium text-fg">{tr('When')}</legend>
            {(['period', 'now'] as const).map((w) =>
            <label key={w} className="flex min-h-[40px] cursor-pointer items-start gap-3 text-label text-fg">
                <input type="radio" name="sub-cancel-when" className="mt-1 h-4 w-4" checked={whenEnd === w} onChange={() => setWhenEnd(w)} />
                <span>{w === 'period' ? `${tr('At the end of what they’ve paid for')}${sub ? ` (${subDate(sub.periodEnd)})` : ''}` : tr('Straight away')}</span>
              </label>
            )}
          </fieldset>
          <TextInput id="sub-cancel-reason" label="Reason" optional value={reason} onChange={(e) => setReason(e.target.value)} placeholder={tr('Shown in the timeline')} />
        </div>
      </Dialog>

      <Dialog
        open={confirm === 'refund'}
        onClose={() => setConfirm(null)}
        title={paid ? tr('Refund {amount}?', { amount: formatNgn(paid.amountNgn) }) : tr('Refund')}
        description={paid ? `${paid.label} · ${subDate(paid.at)}. ${tr('The subscription carries on — cancel it separately if you need to.')}${paid.orderId ? ` ${tr('The box order stays; refund it in Orders if items are returned.')}` : ''}` : undefined}
        footer={
        <>
            <Button variant="secondary" onClick={() => setConfirm(null)}>
              {tr('Cancel')}
            </Button>
            <Button
            variant="destructive"
            onClick={() => {
              run((s) => (d) => refundLastPayment(d, s.id), tr('Payment refunded (test mode)'), `refunded a subscription payment for ${sub?.customer.name}`);
              setConfirm(null);
            }}>
            
              {tr('Refund')}
            </Button>
          </>
        } />
      
    </Sheet>);

}

function Fact({ icon: Icon, label, children }: {icon: typeof CalendarClockIcon;label: string;children: React.ReactNode;}) {
  return (
    <div className="flex gap-2.5">
      <Icon size={16} className="mt-0.5 shrink-0 text-fg-subtle" aria-hidden />
      <div className="min-w-0">
        <dt className="text-caption text-fg-subtle">{label}</dt>
        <dd className="text-label text-fg">{children}</dd>
      </div>
    </div>);

}