import React, { useState } from 'react';
import { toast } from 'sonner';
import { CalendarClockIcon, CreditCardIcon, DownloadIcon, ReceiptIcon } from 'lucide-react';
import { PrototypeNote } from '../ui/PrototypeNote';
import { Card } from '../ui/layout/Card';
import { List } from '../ui/layout/ListRow';
import type { Invoice } from '../../types/billing';
import { useBilling } from '../../contexts/BillingContext';
import { usePlan } from '../../contexts/PlanContext';
import { useTeam } from '../../contexts/TeamContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useUpgrade } from '../../contexts/UpgradeContext';
import { plans } from '../../data/plans';
import { TRIAL_PLAN } from '../../data/billing';
import { daysUntil, formatDate, isPaidPlan, priceFor, withVat } from '../../utils/billing';
import { formatNaira as formatNgn } from '../../utils/format';
import { billingCurrency, formatMoney } from '../../utils/currency';
import { invoiceTotals, localBreakdown, rateLine, rateMovedSince } from '../../utils/billingMoney';
import { isFxCode, nairaPerToday } from '../../utils/fxRates';
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
import { cn } from '../../utils/cn';
import { useT } from '../../contexts/LocaleContext';

/** Settings → Plan & billing (D65). Owner manages; Admins read only. */
export function BillingTab() {
  const { t: tr } = useT();
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
  const nextSubtotal = d.pendingPlan && d.pendingPlan !== 'free' ? priceFor(d.pendingPlan, d.pendingCycle ?? d.cycle) : price;
  const nextTotal = withVat(nextSubtotal).total;
  const periodEnd = d.periodEnd ? formatDate(d.periodEnd) : null;
  // Outside Nigeria KUBICU bills in the workspace country's currency at the day's rate (D432).
  const billCode = billingCurrency();
  const converts = isFxCode(billCode);
  const nextLocal = localBreakdown(nextSubtotal);
  const lastPaid = d.invoices.find((i) => i.status === 'paid');
  const moved = rateMovedSince(lastPaid);

  const status = d.trial
    ? { tone: 'info' as const, label: tr('Trial · {n} days left', { n: daysUntil(d.trial.endsAt) }) }
    : d.status === 'past_due'
      ? { tone: 'danger' as const, label: tr('Payment failed') }
      : d.pendingPlan === 'free'
        ? { tone: 'warning' as const, label: tr('Ends {date}', { date: periodEnd ?? '' }) }
        : d.pendingPlan
          ? { tone: 'warning' as const, label: tr('Changes to {plan} {date}', { plan: plans[d.pendingPlan].name, date: periodEnd ?? '' }) }
          : { tone: 'success' as const, label: tr('Active') };

  const total = converts ? formatMoney(nextLocal.total, billCode) : formatNgn(nextTotal);
  const comingUp = d.trial
    ? tr('Trial ends {date} — then back to {plan} unless you choose a plan.', { date: formatDate(d.trial.endsAt), plan: plans[d.trial.previousPlan].name })
    : d.status === 'past_due' && d.graceEndsAt
      ? tr('Moves to Free on {date} unless the payment is fixed.', { date: formatDate(d.graceEndsAt) })
      : !paid
        ? plan.id === 'enterprise'
          ? tr('Billed by contract — nothing scheduled here.')
          : tr('Nothing scheduled. Free has no renewals.')
        : d.pendingPlan === 'free'
          ? tr('Ends {date}, then Free. Nothing will be charged.', { date: periodEnd ?? '' })
          : d.pendingPlan
            ? tr('Moves to {plan} on {date}, then {total} incl. VAT.', { plan: plans[d.pendingPlan].name, date: periodEnd ?? '', total })
            : d.pendingCycle && d.pendingCycle !== d.cycle
              ? tr(d.pendingCycle === 'yearly' ? 'Switches to yearly billing on {date} for {total} incl. VAT.' : 'Switches to monthly billing on {date} for {total} incl. VAT.', { date: periodEnd ?? '', total })
              : d.card
                ? tr('Renews {date} for {total} incl. VAT on •••• {last4}.', { date: periodEnd ?? '', total, last4: d.card.last4 })
                : tr('Renews {date} for {total} incl. VAT — add a card first.', { date: periodEnd ?? '', total });

  const exportCsv = () => {
    const csv = toCsv(
      ['Invoice', 'Date', 'Status', 'Items', 'Currency', 'Subtotal', 'Tax', 'Total', 'Price list (NGN)', 'Rate (NGN per unit)', 'Card'],
      d.invoices.map((i) => {
        const t = invoiceTotals(i);
        return [i.number, i.issuedAt.slice(0, 10), i.status, i.lines.map((l) => l.label).join(' | '), t.code, t.subtotal, t.tax, t.total, i.subtotalNgn, i.fx ? i.fx.rate : 1, i.cardLast4 ? `•••• ${i.cardLast4}` : ''];
      }),
    );
    downloadCsv(`kubicu-invoices-${current.name.toLowerCase().replace(/\W+/g, '-')}.csv`, csv);
  };

  return (
    <div className="flex flex-col gap-8">
      <TestModeStrip />
      {!can.allowed && (
        <InlineAlert tone="info" title="View only">
          {can.reason}
        </InlineAlert>
      )}

      {d.status === 'past_due' && d.graceEndsAt && (
        <InlineAlert
          tone="danger"
          title={tr('Renewal payment failed — {n} days to fix it', { n: daysUntil(d.graceEndsAt) })}
          action={
            <div className="flex flex-wrap gap-2">
              <Button size="sm" disabled={!can.allowed} onClick={() => billing.retryPayment()}>
                Retry payment
              </Button>
              <Button size="sm" variant="secondary" disabled={!can.allowed} onClick={() => setCardOpen(true)}>
                Update card
              </Button>
            </div>
          }
        >
          {tr('{plan} keeps working until {date}. After that the workspace moves to Free — nothing is deleted.', { plan: plan.name, date: formatDate(d.graceEndsAt) })}
        </InlineAlert>
      )}

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-10">
        <div className={cn('rounded-lg shadow-1', paid ? 'nm-frame' : 'border border-line')}>
        <section aria-labelledby="billing-plan" className={cn('flex flex-col gap-5 bg-raised p-5 md:p-6', paid ? 'rounded-[calc(0.5rem-1px)]' : 'rounded-lg')}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-caption font-medium text-fg-subtle">{tr('Current plan')}</p>
              <h2 id="billing-plan" className="mt-1 font-display text-title font-semibold text-fg">
                {plan.name}
              </h2>
              <p className="mt-1 text-label text-fg-muted">{tr(plan.intendedFor)}</p>
            </div>
            <Badge tone={status.tone} dot>
              {status.label}
            </Badge>
          </div>

          {paid && !d.trial && (
            <p className="font-display text-heading font-semibold tabular-nums text-fg">
              {formatNgn(price)}
              <span className="text-label font-normal text-fg-muted"> {tr(d.cycle === 'yearly' ? '/year + VAT' : '/month + VAT')}</span>
            </p>
          )}

          {paid && converts && (
            <div className="flex flex-col gap-1 text-caption text-fg-muted">
              <p>
                {tr('Converted from {price} at today’s rate ({rate}). The amount is fixed on each invoice, and an unpaid invoice keeps its amount for 7 days.', { price: `₦${price.toLocaleString('en-NG')}`, rate: rateLine(billCode, nairaPerToday(billCode)) })}
              </p>
              {moved.moved && <p className="font-medium text-warning">{tr('The rate has moved {pct}% since your last payment, so your next charge will differ from the last one.', { pct: Math.round(moved.pct * 100) })}</p>}
            </div>
          )}

          {(billing.creditLeft > 0 || d.coupon) && (
            <ul className="flex flex-col gap-1.5 rounded-md bg-success-soft px-3 py-2.5 text-label text-fg">
              {billing.creditLeft > 0 && (
                <li>
                  {tr('{amount} account credit from KUBICU — used before your card on the next invoice.', { amount: formatNgn(billing.creditLeft) })}
                </li>
              )}
              {d.coupon && (
                <li>
                  {tr('Code {code} keeps applying at every renewal while you stay on {plan}.', { code: d.coupon.code, plan: plan.name })}
                </li>
              )}
            </ul>
          )}

          <div className="flex items-start gap-2.5 text-label text-fg-muted">
            <CalendarClockIcon size={16} className="mt-0.5 shrink-0" aria-hidden />
            <span>
              {d.trial
                ? tr('Free {trial} trial until {date}. Then back to {plan} unless you choose a plan — no card needed.', { trial: plans[TRIAL_PLAN].name, date: formatDate(d.trial.endsAt), plan: plans[d.trial.previousPlan].name })
                : !paid
                  ? plan.id === 'enterprise'
                    ? tr('Billed by contract. Talk to your account manager about changes.')
                    : tr('Free has no subscription. Upgrade any time — you only pay from the day you switch.')
                  : d.pendingPlan === 'free'
                    ? `${tr('Cancelled')}${d.cancelReason ? ` (“${d.cancelReason}”)` : ''}. ${tr('You keep {plan} until {date}, then move to Free.', { plan: plan.name, date: periodEnd ?? '' })}`
                    : d.pendingPlan
                      ? tr('Moves to {plan} on {date}, then {total} incl. VAT.', { plan: plans[d.pendingPlan].name, date: periodEnd ?? '', total })
                      : tr('Renews on {date} for {total} incl. VAT.', { date: periodEnd ?? '', total })}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-line pt-5">
            {plan.id !== 'enterprise' && (
              <Button disabled={!can.allowed} onClick={() => openPlans()}>
                {d.trial ? 'Choose a plan' : paid ? 'Change plan' : 'Upgrade'}
              </Button>
            )}
            {paid && !d.trial && d.cycle === 'monthly' && !d.pendingPlan && (
              <Button variant="secondary" disabled={!can.allowed} onClick={() => openPlans({ plan: plan.id, cycle: 'yearly' })}>
                Switch to yearly · 2 months free
              </Button>
            )}
            {d.pendingPlan ? (
              <Button variant="secondary" disabled={!can.allowed} onClick={billing.cancelScheduled}>
                {tr(d.pendingPlan === 'free' ? 'Resume {plan}' : 'Stay on {plan}', { plan: plan.name })}
              </Button>
            ) : (
              paid &&
              !d.trial && (
                <Button variant="tertiary" disabled={!can.allowed} onClick={() => setCancelOpen(true)} className="sm:ml-auto">
                  Cancel plan
                </Button>
              )
            )}
            {d.trial && (
              <Button variant="tertiary" disabled={!can.allowed} onClick={billing.endTrialNow} className="sm:ml-auto">
                End trial now
              </Button>
            )}
          </div>
        </section>
        </div>

        <aside aria-labelledby="billing-usage" className="flex flex-col gap-4">
          <h2 id="billing-usage" className="text-label font-semibold text-fg">
            {tr('Usage this period')}
          </h2>
          <UsageMeters />
        </aside>
      </div>

      <section aria-labelledby="billing-card" className="flex flex-col gap-3">
        <h2 id="billing-card" className="text-label font-semibold text-fg">
          {tr('Payment method')}
        </h2>
        <div className="flex flex-col gap-3 rounded-lg border border-line bg-raised p-4 sm:flex-row sm:items-center">
          <span className="flex h-10 w-14 shrink-0 items-center justify-center rounded-md bg-sunken text-fg-muted">
            <CreditCardIcon size={20} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            {d.card ? (
              <>
                <p className="text-label font-medium text-fg">
                  {d.card.brand} •••• {d.card.last4}
                </p>
                <p className="text-caption text-fg-muted">
                  {tr('Expires {date}', { date: d.card.expiry })} · {d.card.holder}
                </p>
              </>
            ) : (
              <>
                <p className="text-label font-medium text-fg">{tr('No card on file')}</p>
                <p className="text-caption text-fg-muted">{tr(paid ? 'Add a card before your renewal so the plan carries on.' : 'You’ll add one when you upgrade.')}</p>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" disabled={!can.allowed} onClick={() => setCardOpen(true)}>
              {d.card ? 'Replace card' : 'Add card'}
            </Button>
            {d.card && !paid && (
              <Button size="sm" variant="tertiary" disabled={!can.allowed} onClick={billing.removeCard}>
                Remove
              </Button>
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="billing-invoices" className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id="billing-invoices" className="text-label font-semibold text-fg">
            {tr('Invoices')}
          </h2>
          {d.invoices.length > 0 && (
            <Button size="sm" variant="tertiary" leadingIcon={DownloadIcon} onClick={exportCsv}>
              Export CSV
            </Button>
          )}
        </div>
        {d.invoices.length === 0 && !(paid && !d.trial) ? (
          <EmptyState icon={ReceiptIcon} title="No invoices yet" description="Invoices appear here when you upgrade, renew or buy a premium template." />
        ) : (
          <Card as="div" body="flush">
          <List label="Invoices">
            {paid && !d.trial && d.status !== 'past_due' && d.pendingPlan !== 'free' && periodEnd && (
              <li className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 md:px-6">
                <span className="w-[120px] text-label text-fg-muted">{periodEnd}</span>
                <span className="min-w-0 flex-1 text-label text-fg">
                  {tr((d.pendingCycle ?? d.cycle) === 'yearly' ? '{plan} (yearly) renewal' : '{plan} (monthly) renewal', { plan: plans[d.pendingPlan ?? plan.id].name })}
                </span>
                <InvoiceStatusBadge status="upcoming" />
                <span className="w-[110px] text-right text-label tabular-nums text-fg">{total}</span>
              </li>
            )}
            {d.invoices.map((i) => (
              <li key={i.id}>
                <button
                  type="button"
                  onClick={() => setInvoice(i)}
                  className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 text-left md:px-6 transition-colors duration-150 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus"
                >
                  <span className="w-[120px] text-label text-fg-muted">{formatDate(i.issuedAt)}</span>
                  <span className="min-w-0 flex-1 truncate text-label text-fg">
                    <span className="font-mono text-caption text-fg-subtle">{i.number}</span> · {i.lines[0]?.label}
                    {i.sample && <span className="text-fg-subtle"> · {tr('sample')}</span>}
                  </span>
                  <InvoiceStatusBadge status={i.status} />
                  <span className="w-[110px] text-right text-label tabular-nums text-fg">{formatMoney(invoiceTotals(i).total, invoiceTotals(i).code)}</span>
                </button>
              </li>
            ))}
          </List>
          </Card>
        )}
      </section>

      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3 rounded-lg bg-sunken px-4 py-3">
          <CalendarClockIcon size={16} className="mt-0.5 shrink-0 text-fg-muted" aria-hidden />
          <p className="text-label text-fg">
            <span className="font-semibold">{tr('What’s coming:')} </span>
            {comingUp}
          </p>
        </div>
        <BillingHistory history={d.history} invoices={d.invoices} workspaceName={current.name} onOpenInvoice={setInvoice} />
      </div>

      <PrototypeNote
        id="billing-proto"
        title="Prototype: skip ahead in time"
        actions={
          <>
            <Button size="sm" variant="secondary" disabled={!can.allowed || !paid} onClick={billing.runRenewal}>
              {d.trial ? 'Reach trial end' : 'Run renewal now'}
            </Button>
            <Button size="sm" variant="secondary" disabled={!can.allowed || d.status !== 'past_due'} onClick={billing.endGraceNow}>
              End grace period now
            </Button>
          </>
        }
      >
        {tr(billing.renewalOutcome === 'succeeds' ? 'Renewals follow Simulate next renewal in the Controls panel (now: succeeds).' : 'Renewals follow Simulate next renewal in the Controls panel (now: fails).')}
      </PrototypeNote>

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
            toast.success(tr('{card} saved', { card: `${card.brand} •••• ${card.last4}` }), { description: d.status === 'past_due' ? tr('Now retry the payment.') : undefined });
          }}
        />
      </Dialog>
    </div>
  );
}
