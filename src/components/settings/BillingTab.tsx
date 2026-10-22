import React, { useState } from 'react';
import { toast } from 'sonner';
import { CalendarClockIcon, CreditCardIcon, DownloadIcon, FlaskConicalIcon, ReceiptIcon } from 'lucide-react';
import type { Invoice } from '../../types/billing';
import { useBilling } from '../../contexts/BillingContext';
import { usePlan } from '../../contexts/PlanContext';
import { useTeam } from '../../contexts/TeamContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useUpgrade } from '../../contexts/UpgradeContext';
import { plans } from '../../data/plans';
import { TRIAL_PLAN } from '../../data/billing';
import { daysUntil, formatDate, isPaidPlan, priceFor, withVat } from '../../utils/billing';
import { formatNgn } from '../../utils/format';
import { downloadCsv, toCsv } from '../../utils/csv';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Dialog } from '../ui/Dialog';
import { InlineAlert } from '../ui/InlineAlert';
import { EmptyState } from '../ui/EmptyState';
import { TestModeStrip } from '../commerce/TestModeStrip';
import { UsageMeters } from '../billing/UsageMeters';
import { InvoiceDialog } from '../billing/InvoiceDialog';
import { InvoiceStatusBadge } from '../billing/InvoiceStatusBadge';
import { CancelPlanDialog } from '../billing/CancelPlanDialog';
import { PaymentStep } from '../billing/PaymentStep';
import { BillingHistory } from '../billing/BillingHistory';

/** Settings → Plan & billing (D65). Owner manages; Admins read only. */
export function BillingTab() {
  const billing = useBilling();
  const plan = usePlan();
  const { current } = useWorkspace();
  const { openPlans } = useUpgrade();
  const can = useTeam().can('billing.manage');
  const d = billing.data;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [cardOpen, setCardOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const paid = isPaidPlan(plan.id);
  const price = priceFor(plan.id, d.cycle);
  const nextTotal = d.pendingPlan && d.pendingPlan !== 'free' ? withVat(priceFor(d.pendingPlan, d.pendingCycle ?? d.cycle)).total : withVat(price).total;
  const periodEnd = d.periodEnd ? formatDate(d.periodEnd) : null;

  const status = d.trial ?
  { tone: 'info' as const, label: `Trial · ${daysUntil(d.trial.endsAt)} days left` } :
  d.status === 'past_due' ?
  { tone: 'danger' as const, label: 'Payment failed' } :
  d.pendingPlan === 'free' ?
  { tone: 'warning' as const, label: `Ends ${periodEnd}` } :
  d.pendingPlan ?
  { tone: 'warning' as const, label: `Changes to ${plans[d.pendingPlan].name} ${periodEnd}` } :
  { tone: 'success' as const, label: 'Active' };

  const comingUp = d.trial ?
  `Trial ends ${formatDate(d.trial.endsAt)} — then back to ${plans[d.trial.previousPlan].name} unless you choose a plan.` :
  d.status === 'past_due' && d.graceEndsAt ?
  `Moves to Free on ${formatDate(d.graceEndsAt)} unless the payment is fixed.` :
  !paid ?
  plan.id === 'enterprise' ?
  'Billed by contract — nothing scheduled here.' :
  'Nothing scheduled. Free has no renewals.' :
  d.pendingPlan === 'free' ?
  `Ends ${periodEnd}, then Free. Nothing will be charged.` :
  d.pendingPlan ?
  `Moves to ${plans[d.pendingPlan].name} on ${periodEnd}, then ${formatNgn(nextTotal)} incl. VAT.` :
  d.pendingCycle && d.pendingCycle !== d.cycle ?
  `Switches to ${d.pendingCycle} billing on ${periodEnd} for ${formatNgn(nextTotal)} incl. VAT.` :
  `Renews ${periodEnd} for ${formatNgn(nextTotal)} incl. VAT${d.card ? ` on •••• ${d.card.last4}` : ' — add a card first'}.`;

  const exportCsv = () => {
    const csv = toCsv(
      ['Invoice', 'Date', 'Status', 'Items', 'Subtotal (NGN)', 'VAT (NGN)', 'Total (NGN)', 'Card'],
      d.invoices.map((i) => [i.number, i.issuedAt.slice(0, 10), i.status, i.lines.map((l) => l.label).join(' | '), i.subtotalNgn, i.vatNgn, i.totalNgn, i.cardLast4 ? `•••• ${i.cardLast4}` : ''])
    );
    downloadCsv(`kubicu-invoices-${current.name.toLowerCase().replace(/\W+/g, '-')}.csv`, csv);
  };

  return (
    <div className="flex flex-col gap-8">
      <TestModeStrip />
      {!can.allowed &&
      <InlineAlert tone="info" title="View only">
          {can.reason}
        </InlineAlert>
      }

      {d.status === 'past_due' && d.graceEndsAt &&
      <InlineAlert
        tone="danger"
        title={`Renewal payment failed — ${daysUntil(d.graceEndsAt)} days to fix it`}
        action={
        <div className="flex flex-wrap gap-2">
              <Button size="sm" disabled={!can.allowed} onClick={() => billing.retryPayment()}>
                Retry payment
              </Button>
              <Button size="sm" variant="secondary" disabled={!can.allowed} onClick={() => setCardOpen(true)}>
                Update card
              </Button>
            </div>
        }>
        
          {plan.name} keeps working until {formatDate(d.graceEndsAt)}. After that the workspace moves to Free — nothing is deleted.
        </InlineAlert>
      }

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <section aria-labelledby="billing-plan" className="flex flex-col gap-5 rounded-lg border border-line bg-raised p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-caption font-medium text-fg-subtle">Current plan</p>
              <h2 id="billing-plan" className="mt-1 font-display text-title font-semibold text-fg">
                {plan.name}
              </h2>
              <p className="mt-1 text-label text-fg-muted">{plan.intendedFor}</p>
            </div>
            <Badge tone={status.tone} dot>
              {status.label}
            </Badge>
          </div>

          {paid && !d.trial &&
          <p className="font-display text-heading font-semibold tabular-nums text-fg">
              {formatNgn(price)}
              <span className="text-label font-normal text-fg-muted"> /{d.cycle === 'yearly' ? 'year' : 'month'} + VAT</span>
            </p>
          }

          <div className="flex items-start gap-2.5 text-label text-fg-muted">
            <CalendarClockIcon size={16} className="mt-0.5 shrink-0" aria-hidden />
            <span>
              {d.trial ?
              `Free ${plans[TRIAL_PLAN].name} trial until ${formatDate(d.trial.endsAt)}. Then back to ${plans[d.trial.previousPlan].name} unless you choose a plan — no card needed.` :
              !paid ?
              plan.id === 'enterprise' ?
              'Billed by contract. Talk to your account manager about changes.' :
              'Free has no subscription. Upgrade any time — you only pay from the day you switch.' :
              d.pendingPlan === 'free' ?
              `Cancelled${d.cancelReason ? ` (“${d.cancelReason}”)` : ''}. You keep ${plan.name} until ${periodEnd}, then move to Free.` :
              d.pendingPlan ?
              `Moves to ${plans[d.pendingPlan].name} on ${periodEnd}, then ${formatNgn(nextTotal)} incl. VAT.` :
              `Renews on ${periodEnd} for ${formatNgn(nextTotal)} incl. VAT.`}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-line pt-5">
            {plan.id !== 'enterprise' &&
            <Button disabled={!can.allowed} onClick={() => openPlans()}>
                {d.trial ? 'Choose a plan' : paid ? 'Change plan' : 'Upgrade'}
              </Button>
            }
            {paid && !d.trial && d.cycle === 'monthly' && !d.pendingPlan &&
            <Button variant="secondary" disabled={!can.allowed} onClick={() => openPlans({ plan: plan.id, cycle: 'yearly' })}>
                Switch to yearly · 2 months free
              </Button>
            }
            {d.pendingPlan ?
            <Button variant="secondary" disabled={!can.allowed} onClick={billing.cancelScheduled}>
                {d.pendingPlan === 'free' ? `Resume ${plan.name}` : `Stay on ${plan.name}`}
              </Button> :

            paid &&
            !d.trial &&
            <Button variant="tertiary" disabled={!can.allowed} onClick={() => setCancelOpen(true)} className="sm:ml-auto">
                  Cancel plan
                </Button>

            }
            {d.trial &&
            <Button variant="tertiary" disabled={!can.allowed} onClick={billing.endTrialNow} className="sm:ml-auto">
                End trial now
              </Button>
            }
          </div>
        </section>

        <aside aria-labelledby="billing-usage" className="flex flex-col gap-4">
          <h2 id="billing-usage" className="text-label font-semibold text-fg">
            Usage this period
          </h2>
          <UsageMeters />
        </aside>
      </div>

      <section aria-labelledby="billing-card" className="flex flex-col gap-3">
        <h2 id="billing-card" className="text-label font-semibold text-fg">
          Payment method
        </h2>
        <div className="flex flex-col gap-3 rounded-lg border border-line bg-raised p-4 sm:flex-row sm:items-center">
          <span className="flex h-10 w-14 shrink-0 items-center justify-center rounded-md bg-sunken text-fg-muted">
            <CreditCardIcon size={20} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            {d.card ?
            <>
                <p className="text-label font-medium text-fg">
                  {d.card.brand} •••• {d.card.last4}
                </p>
                <p className="text-caption text-fg-muted">
                  Expires {d.card.expiry} · {d.card.holder}
                </p>
              </> :

            <>
                <p className="text-label font-medium text-fg">No card on file</p>
                <p className="text-caption text-fg-muted">{paid ? 'Add a card before your renewal so the plan carries on.' : 'You’ll add one when you upgrade.'}</p>
              </>
            }
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" disabled={!can.allowed} onClick={() => setCardOpen(true)}>
              {d.card ? 'Replace card' : 'Add card'}
            </Button>
            {d.card && !paid &&
            <Button size="sm" variant="tertiary" disabled={!can.allowed} onClick={billing.removeCard}>
                Remove
              </Button>
            }
          </div>
        </div>
      </section>

      <section aria-labelledby="billing-invoices" className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id="billing-invoices" className="text-label font-semibold text-fg">
            Invoices
          </h2>
          {d.invoices.length > 0 &&
          <Button size="sm" variant="tertiary" leadingIcon={DownloadIcon} onClick={exportCsv}>
              Export CSV
            </Button>
          }
        </div>
        {d.invoices.length === 0 && !(paid && !d.trial) ?
        <EmptyState icon={ReceiptIcon} title="No invoices yet" description="Invoices appear here when you upgrade, renew or buy a premium template." /> :

        <ul className="flex flex-col divide-y divide-line rounded-lg border border-line bg-raised">
            {paid && !d.trial && d.status !== 'past_due' && d.pendingPlan !== 'free' && periodEnd &&
          <li className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
                <span className="w-[120px] text-label text-fg-muted">{periodEnd}</span>
                <span className="min-w-0 flex-1 text-label text-fg">
                  {plans[d.pendingPlan ?? plan.id].name} ({d.pendingCycle ?? d.cycle}) renewal
                </span>
                <InvoiceStatusBadge status="upcoming" />
                <span className="w-[110px] text-right text-label tabular-nums text-fg">{formatNgn(nextTotal)}</span>
              </li>
          }
            {d.invoices.map((i) =>
          <li key={i.id}>
                <button
              type="button"
              onClick={() => setInvoice(i)}
              className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-left transition-colors duration-150 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus">
              
                  <span className="w-[120px] text-label text-fg-muted">{formatDate(i.issuedAt)}</span>
                  <span className="min-w-0 flex-1 truncate text-label text-fg">
                    <span className="font-mono text-caption text-fg-subtle">{i.number}</span> · {i.lines[0]?.label}
                    {i.sample && <span className="text-fg-subtle"> · sample</span>}
                  </span>
                  <InvoiceStatusBadge status={i.status} />
                  <span className="w-[110px] text-right text-label tabular-nums text-fg">{formatNgn(i.totalNgn)}</span>
                </button>
              </li>
          )}
          </ul>
        }
      </section>

      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3 rounded-lg bg-sunken px-4 py-3">
          <CalendarClockIcon size={16} className="mt-0.5 shrink-0 text-fg-muted" aria-hidden />
          <p className="text-label text-fg">
            <span className="font-semibold">What’s coming: </span>
            {comingUp}
          </p>
        </div>
        <BillingHistory history={d.history} invoices={d.invoices} workspaceName={current.name} onOpenInvoice={setInvoice} />
      </div>

      <section aria-labelledby="billing-proto" className="flex flex-col gap-3 rounded-lg border border-dashed border-line-strong p-4">
        <h2 id="billing-proto" className="flex items-center gap-2 text-label font-semibold text-fg">
          <FlaskConicalIcon size={15} aria-hidden /> Prototype: skip ahead in time
        </h2>
        <p className="text-caption text-fg-muted">
          Renewals follow <span className="font-medium text-fg">Simulate next renewal</span> in the Controls panel (now: {billing.renewalOutcome === 'succeeds' ? 'succeeds' : 'fails'}).
        </p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" disabled={!can.allowed || !paid} onClick={billing.runRenewal}>
            {d.trial ? 'Reach trial end' : 'Run renewal now'}
          </Button>
          <Button size="sm" variant="secondary" disabled={!can.allowed || d.status !== 'past_due'} onClick={billing.endGraceNow}>
            End grace period now
          </Button>
        </div>
      </section>

      <InvoiceDialog invoice={invoice} onClose={() => setInvoice(null)} />
      <CancelPlanDialog open={cancelOpen} onClose={() => setCancelOpen(false)} />
      <Dialog open={cardOpen} onClose={() => setCardOpen(false)} title={d.card ? 'Replace card' : 'Add a card'} description="Used for renewals and purchases. Test mode — no real card is charged.">
        <PaymentStep
          verifyOnly
          payLabel="Save card"
          savedCard={null}
          defaultHolder={current.ownerName}
          onPaid={(card) => {
            billing.saveCard(card);
            setCardOpen(false);
            toast.success(`${card.brand} •••• ${card.last4} saved`, { description: d.status === 'past_due' ? 'Now retry the payment.' : undefined });
          }} />
        
      </Dialog>
    </div>);

}