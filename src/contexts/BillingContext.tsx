import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { WorkspacePlan } from '../types/plan';
import type { BillingCycle, BillingData, InvoiceLine, PaymentCard } from '../types/billing';
import { useWorkspace } from './WorkspaceContext';
import { usePlan } from './PlanContext';
import { useTeam } from './TeamContext';
import { planOrder, plans } from '../data/plans';
import { GRACE_DAYS, TRIAL_DAYS, TRIAL_PLAN } from '../data/billing';
import { DEMO_WORKSPACE_ID } from '../utils/workspaceStorage';
import { addCycle, addDays, BILLING_EXTERNAL_EVENT, billingKey, emptyBilling, formatDate, isPaidPlan, makeInvoice, priceFor, quoteChange, readBilling, requote, sampleHistory, sampleInvoices, withEvent, withVat, writeBilling, type Quote } from '../utils/billing';
import { adjustLines, creditAvailable } from '../utils/planCatalogue';
import { updateAdminStore } from '../utils/admin/store';
import type { Coupon } from '../types/admin';
import { formatNaira as formatNgn } from '../utils/format';

export type RenewalOutcome = 'succeeds' | 'fails';

const AUTO = 'Automatic';

interface BillingValue {
  data: BillingData;
  /** Pay now and switch plan (upgrades, cycle changes, keeping a trial plan). A coupon and any account credit apply first (D135). */
  checkout: (target: WorkspacePlan, cycle: BillingCycle, card: PaymentCard, coupon?: Coupon | null) => void;
  /** The exact charge checkout would make, with coupon and account credit applied. */
  previewQuote: (target: WorkspacePlan, cycle: BillingCycle, coupon?: Coupon | null) => Quote;
  /** Account credit from KUBICU not yet used. */
  creditLeft: number;
  /** Downgrade at the renewal date. Nothing changes until then. */
  scheduleChange: (target: WorkspacePlan, cycle: BillingCycle) => void;
  cancelScheduled: () => void;
  cancelPlan: (reason: string) => void;
  startTrial: () => void;
  saveCard: (card: PaymentCard) => void;
  removeCard: () => void;
  retryPayment: () => boolean;
  /** Extra one-off charges (premium templates in Pass B). */
  charge: (lines: InvoiceLine[], card: PaymentCard) => void;
  /** Prototype time travel. */
  runRenewal: () => void;
  endTrialNow: () => void;
  endGraceNow: () => void;
  renewalOutcome: RenewalOutcome;
}

const BillingContext = createContext<BillingValue | null>(null);

/** Subscription, card, invoices and history for the current workspace (D65, D68). Simulated; test mode. */
export function BillingProvider({ renewalOutcome, children }: {renewalOutcome: RenewalOutcome;children: React.ReactNode;}) {
  const { current, update } = useWorkspace();
  const plan = usePlan();
  const team = useTeam();
  const me = team.me.name;
  const [data, setData] = useState<BillingData>(() => readBilling(current.id) ?? emptyBilling());
  const ref = useRef(data);
  ref.current = data;
  const planRef = useRef(plan.id);
  planRef.current = plan.id;

  const apply = useCallback(
    (fn: (d: BillingData) => BillingData) => {
      const next = fn(ref.current);
      ref.current = next;
      setData(next);
      try {
        writeBilling(current.id, next);
      } catch {

        // Storage unavailable — billing lasts for this visit.
      }},
    [current.id]
  );

  const setPlan = useCallback((p: WorkspacePlan) => update(current.id, { plan: p }), [update, current.id]);

  // Keep billing in step when the plan is changed from the Controls panel.
  useEffect(() => {
    const d = ref.current;
    if (isPaidPlan(plan.id) && !d.periodEnd) {
      const start = new Date(Date.now() - 12 * 86400000).toISOString();
      apply((x) => {
        const seeded = current.id === DEMO_WORKSPACE_ID && !x.sampleSeeded;
        const card: PaymentCard | null = x.card ?? (seeded ? { brand: 'Visa', last4: '4242', expiry: '08/29', holder: current.ownerName } : null);
        const samples = seeded && card ? sampleInvoices(x, plan.id, card) : [];
        return {
          ...x,
          periodStart: start,
          periodEnd: addCycle(start, x.cycle),
          status: 'active',
          card,
          invoices: [...samples, ...x.invoices],
          history: seeded && card ? [...x.history, ...sampleHistory(plan.id, samples, card)] : x.history,
          sampleSeeded: x.sampleSeeded || seeded
        };
      });
    } else if (!isPaidPlan(plan.id) && d.periodEnd) {
      apply((x) => ({ ...x, periodStart: null, periodEnd: null, status: 'active', pendingPlan: null, pendingCycle: null, trial: null, graceEndsAt: null, cancelReason: null }));
    }
  }, [plan.id, apply, current.id, current.ownerName]);

  // Workspaces seeded before history existed get a matching sample history once (D68).
  useEffect(() => {
    const d = ref.current;
    const samples = d.invoices.filter((i) => i.sample);
    if (d.history.length === 0 && samples.length > 0 && d.card) {
      const card = d.card;
      apply((x) => ({ ...x, history: sampleHistory(planRef.current, samples, card) }));
    }
  }, [current.id, apply]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== billingKey(current.id)) return;
      const next = readBilling(current.id);
      if (next) {
        ref.current = next;
        setData(next);
      }
    };
    // Staff changes from Super admin in this same tab (trials, D135).
    const onExternal = (e: Event) => {
      if ((e as CustomEvent<string>).detail !== current.id) return;
      const next = readBilling(current.id);
      if (next) {
        ref.current = next;
        setData(next);
      }
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener(BILLING_EXTERNAL_EVENT, onExternal);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(BILLING_EXTERNAL_EVENT, onExternal);
    };
  }, [current.id]);

  const previewQuote = useCallback(
    (target: WorkspacePlan, cycle: BillingCycle, coupon?: Coupon | null): Quote => {
      const d = ref.current;
      const q = quoteChange(d, planRef.current, target, cycle);
      const adj = adjustLines(q.lines, { coupon, credit: creditAvailable(current.id, d.creditUsedNgn) });
      const renewLines = adjustLines([{ label: 'renewal', amountNgn: priceFor(target, cycle) }], { coupon: coupon?.duration === 'every' ? coupon : null });
      return requote(q, adj.lines, withVat(Math.max(0, renewLines.lines.reduce((s, l) => s + l.amountNgn, 0))).total);
    },
    [current.id]
  );

  const endTrial = useCallback(() => {
    const t = ref.current.trial;
    if (!t) return;
    apply((x) => withEvent({ ...x, trial: null, status: 'active', periodStart: null, periodEnd: null }, { kind: 'plan', text: `${plans[TRIAL_PLAN].name} trial ended`, detail: `Back on ${plans[t.previousPlan].name}. Nothing was deleted.`, actor: AUTO, tone: 'warning' }));
    setPlan(t.previousPlan);
    team.log('settings', `Pro trial ended — back on ${plans[t.previousPlan].name}`, '/app/settings/billing');
    toast(`Your ${plans[TRIAL_PLAN].name} trial has ended`, { description: `You’re back on ${plans[t.previousPlan].name}. Nothing you made was deleted.` });
  }, [apply, setPlan, team]);

  const endGrace = useCallback(() => {
    const from = planRef.current;
    apply((x) =>
    withEvent(
      { ...x, status: 'active', graceEndsAt: null, periodStart: null, periodEnd: null, pendingPlan: null, pendingCycle: null, failedCardLast4: null },
      { kind: 'plan', text: 'Moved to Free', detail: `The ${plans[from].name} renewal wasn’t paid within ${GRACE_DAYS} days. Nothing was deleted.`, actor: AUTO, tone: 'danger' }
    )
    );
    setPlan('free');
    team.log('settings', 'Payment wasn’t fixed in time — moved to Free', '/app/settings/billing');
    toast.error('Moved to Free', { description: 'The renewal payment wasn’t fixed in time. Nothing was deleted — upgrade again whenever you’re ready.' });
  }, [apply, setPlan, team]);

  const runRenewal = useCallback(() => {
    const d = ref.current;
    const cur = planRef.current;
    if (d.trial) return endTrial();
    if (!isPaidPlan(cur)) {
      toast('Nothing to renew', { description: `${plans[cur].name} has no subscription.` });
      return;
    }
    if (d.status === 'past_due') {
      toast('Payment already failed', { description: 'Retry the payment or update the card first.' });
      return;
    }
    if (d.pendingPlan === 'free') {
      apply((x) => withEvent({ ...x, periodStart: null, periodEnd: null, pendingPlan: null, pendingCycle: null, cancelReason: null }, { kind: 'plan', text: `${plans[cur].name} ended — now on Free`, detail: 'The cancellation took effect at renewal. Nothing was deleted.', actor: AUTO, tone: 'warning' }));
      setPlan('free');
      team.log('settings', 'Plan ended at renewal — now on Free', '/app/settings/billing');
      toast('Your plan has ended', { description: 'You’re on Free now. Nothing was deleted.' });
      return;
    }
    const nextPlan = d.pendingPlan ?? cur;
    const nextCycle = d.pendingCycle ?? d.cycle;
    const start = d.periodEnd && Date.parse(d.periodEnd) < Date.now() ? d.periodEnd : new Date().toISOString();
    const changed = nextPlan !== cur || nextCycle !== d.cycle;
    // A repeating coupon keeps applying while the plan is kept; account credit is used before the card (D135).
    const adj = adjustLines([{ label: `${plans[nextPlan].name} (${nextCycle}) renewal`, amountNgn: priceFor(nextPlan, nextCycle) }], { coupon: nextPlan === cur ? d.coupon : null, credit: creditAvailable(current.id, d.creditUsedNgn) });
    const lines = adj.lines;
    const covered = lines.reduce((s, l) => s + l.amountNgn, 0) <= 0;
    const pays = (covered || !!d.card) && renewalOutcome === 'succeeds';
    if (pays) {
      apply((x) => {
        const inv = makeInvoice(x, lines, 'paid', x.card);
        let next: BillingData = { ...x, cycle: nextCycle, periodStart: start, periodEnd: addCycle(start, nextCycle), pendingPlan: null, pendingCycle: null, invoices: [inv, ...x.invoices], creditUsedNgn: (x.creditUsedNgn ?? 0) + adj.creditUsed, coupon: nextPlan === cur ? x.coupon : null };
        if (changed) next = withEvent(next, { kind: 'plan', text: nextPlan !== cur ? `Downgrade applied — now on ${plans[nextPlan].name}` : `Switched to ${nextCycle} billing`, detail: 'The scheduled change took effect at renewal.', actor: AUTO, tone: 'neutral' });
        return withEvent(next, { kind: 'payment', text: `Renewed ${plans[nextPlan].name} (${nextCycle})`, detail: `Paid ${formatNgn(inv.totalNgn)} incl. VAT · next renewal ${formatDate(addCycle(start, nextCycle))}`, actor: AUTO, invoiceId: inv.id, tone: 'success' });
      });
      if (nextPlan !== cur) setPlan(nextPlan);
      team.log('settings', `Renewed ${plans[nextPlan].name}`, '/app/settings/billing');
      toast.success(`${plans[nextPlan].name} renewed`, { description: 'Test payment taken. The invoice is in Plan & billing.' });
    } else {
      const grace = addDays(new Date().toISOString(), GRACE_DAYS);
      apply((x) => {
        const inv = makeInvoice(x, lines, 'failed', x.card, x.card ? 'Renewal failed: card declined' : 'Renewal failed: no card on file');
        const next = withEvent({ ...x, status: 'past_due', graceEndsAt: grace, failedCardLast4: x.card?.last4 ?? null, invoices: [inv, ...x.invoices] }, { kind: 'payment', text: 'Renewal payment failed', detail: x.card ? `${x.card.brand} •••• ${x.card.last4} was declined for ${formatNgn(inv.totalNgn)}.` : 'No card on file.', actor: AUTO, invoiceId: inv.id, tone: 'danger' });
        return withEvent(next, { kind: 'plan', text: `${GRACE_DAYS}-day grace period started`, detail: `${plans[cur].name} keeps working until ${formatDate(grace)}, then the workspace moves to Free.`, actor: AUTO, tone: 'warning' });
      });
      team.log('settings', 'Renewal payment failed', '/app/settings/billing');
      toast.error('Renewal payment failed', { description: `You have ${GRACE_DAYS} days to update the card before moving to Free.` });
    }
  }, [apply, endTrial, renewalOutcome, setPlan, team, current.id]);

  // Anything already due (trial over, grace over, period ended) settles on open.
  useEffect(() => {
    const d = ref.current;
    const now = Date.now();
    if (d.trial && Date.parse(d.trial.endsAt) <= now) endTrial();else
    if (d.status === 'past_due' && d.graceEndsAt && Date.parse(d.graceEndsAt) <= now) endGrace();else
    if (d.status === 'active' && d.periodEnd && Date.parse(d.periodEnd) <= now && isPaidPlan(planRef.current)) runRenewal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.id]);

  const value = useMemo<BillingValue>(
    () => ({
      data,
      renewalOutcome,
      previewQuote,
      creditLeft: creditAvailable(current.id, data.creditUsedNgn),
      checkout: (target, cycle, card, coupon) => {
        const cur = planRef.current;
        const before = ref.current;
        const base = quoteChange(before, cur, target, cycle);
        const credit = -base.lines.filter((l) => l.amountNgn < 0).reduce((s, l) => s + l.amountNgn, 0);
        const adj = adjustLines(base.lines, { coupon, credit: creditAvailable(current.id, before.creditUsedNgn) });
        const q = requote(base, adj.lines);
        if (coupon && adj.couponOff > 0) updateAdminStore((s) => ({ ...s, coupons: s.coupons.map((c) => c.id === coupon.id ? { ...c, uses: c.uses + 1 } : c) }));
        const extras = [adj.couponOff > 0 && `${formatNgn(adj.couponOff)} off with ${coupon?.code}`, adj.creditUsed > 0 && `${formatNgn(adj.creditUsed)} account credit used`].filter(Boolean).join(' · ');
        const wasTrial = !!before.trial;
        const text = wasTrial ?
        `Kept ${plans[target].name} after the trial (${cycle})` :
        target === cur ?
        `Switched to ${cycle} billing` :
        `${planOrder.indexOf(target) > planOrder.indexOf(cur) ? 'Upgraded' : 'Changed'} from ${plans[cur].name} to ${plans[target].name} (${cycle})`;
        const cardChanged = before.card?.last4 !== card.last4;
        apply((x) => {
          const inv = q.subtotal > 0 ? makeInvoice(x, q.lines, 'paid', card) : null;
          let next: BillingData = {
            ...x,
            card,
            cycle,
            periodStart: q.periodStart,
            periodEnd: q.periodEnd,
            status: 'active',
            trial: null,
            pendingPlan: null,
            pendingCycle: null,
            cancelReason: null,
            invoices: inv ? [inv, ...x.invoices] : x.invoices,
            creditUsedNgn: (x.creditUsedNgn ?? 0) + adj.creditUsed,
            coupon: coupon && coupon.duration === 'every' && adj.couponOff > 0 ? { code: coupon.code, kind: coupon.kind, value: coupon.value } : target === cur ? x.coupon ?? null : null
          };
          if (cardChanged) next = withEvent(next, { kind: 'card', text: `Added ${card.brand} •••• ${card.last4}`, actor: me, tone: 'neutral' });
          return withEvent(next, {
            kind: 'plan',
            text,
            detail: `${inv ? `Charged ${formatNgn(inv.totalNgn)} incl. VAT${credit > 0 ? ` after ${formatNgn(credit)} unused time` : ''}` : 'Nothing to pay today'}${extras ? ` · ${extras}` : ''} · renews ${formatDate(q.periodEnd)}`,
            actor: me,
            invoiceId: inv?.id,
            tone: 'success'
          });
        });
        if (target !== cur) setPlan(target);
        team.log('settings', `Changed plan to ${plans[target].name} (${cycle})`, '/app/settings/billing');
      },
      scheduleChange: (target, cycle) => {
        const end = ref.current.periodEnd;
        const cur = planRef.current;
        apply((x) =>
        withEvent(
          { ...x, pendingPlan: target, pendingCycle: cycle, cancelReason: target === 'free' ? x.cancelReason : null },
          {
            kind: 'plan',
            text: target === cur ? `Scheduled a switch to ${cycle} billing` : `Scheduled a downgrade to ${plans[target].name}`,
            detail: `Takes effect on ${end ? formatDate(end) : 'renewal'}, then ${formatNgn(withVat(priceFor(target, cycle)).total)} incl. VAT. ${plans[cur].name} keeps working until then.`,
            actor: me,
            tone: 'warning'
          }
        )
        );
        team.log('settings', `Scheduled a change to ${plans[target].name} on ${end ? formatDate(end) : 'renewal'}`, '/app/settings/billing');
      },
      cancelScheduled: () => {
        const wasCancel = ref.current.pendingPlan === 'free';
        apply((x) => withEvent({ ...x, pendingPlan: null, pendingCycle: null, cancelReason: null }, { kind: 'plan', text: wasCancel ? `Resumed ${plans[planRef.current].name}` : 'Cancelled the scheduled change', detail: `Staying on ${plans[planRef.current].name}.`, actor: me, tone: 'success' }));
        team.log('settings', 'Kept the current plan (scheduled change cancelled)', '/app/settings/billing');
        toast.success(`You’re staying on ${plans[planRef.current].name}`);
      },
      cancelPlan: (reason) => {
        const end = ref.current.periodEnd;
        apply((x) => withEvent({ ...x, pendingPlan: 'free', pendingCycle: null, cancelReason: reason }, { kind: 'plan', text: `Cancelled ${plans[planRef.current].name}`, detail: `Reason: “${reason}”. Ends ${end ? formatDate(end) : 'at renewal'}, then Free.`, actor: me, tone: 'warning' }));
        team.log('settings', `Cancelled ${plans[planRef.current].name} — ends at renewal`, '/app/settings/billing');
      },
      startTrial: () => {
        const now = new Date().toISOString();
        const endsAt = addDays(now, TRIAL_DAYS);
        apply((x) => withEvent({ ...x, trial: { endsAt, previousPlan: planRef.current }, trialUsed: true, status: 'trialing', periodStart: now, periodEnd: endsAt }, { kind: 'plan', text: `Started a ${TRIAL_DAYS}-day ${plans[TRIAL_PLAN].name} trial`, detail: `Free until ${formatDate(endsAt)}. No card needed.`, actor: me, tone: 'success' }));
        setPlan(TRIAL_PLAN);
        team.log('settings', `Started a ${TRIAL_DAYS}-day ${plans[TRIAL_PLAN].name} trial`, '/app/settings/billing');
        toast.success(`${plans[TRIAL_PLAN].name} trial started`, { description: `Free until ${formatDate(endsAt)}. No card needed — you’ll be reminded before it ends.` });
      },
      saveCard: (card) => {
        const prev = ref.current.card;
        apply((x) => withEvent({ ...x, card }, { kind: 'card', text: prev ? `Replaced the card with ${card.brand} •••• ${card.last4}` : `Added ${card.brand} •••• ${card.last4}`, detail: prev ? `Was ${prev.brand} •••• ${prev.last4}` : undefined, actor: me, tone: 'neutral' }));
        team.log('settings', `Updated the payment card (•••• ${card.last4})`, '/app/settings/billing');
      },
      removeCard: () => {
        const prev = ref.current.card;
        apply((x) => withEvent({ ...x, card: null }, { kind: 'card', text: prev ? `Removed ${prev.brand} •••• ${prev.last4}` : 'Removed the card', actor: me, tone: 'neutral' }));
      },
      retryPayment: () => {
        const d = ref.current;
        if (d.status !== 'past_due') return true;
        const ok = !!d.card && (renewalOutcome === 'succeeds' || d.card.last4 !== d.failedCardLast4);
        if (!ok) {
          apply((x) => withEvent(x, { kind: 'payment', text: 'Retry failed', detail: x.card ? `${x.card.brand} •••• ${x.card.last4} was declined again.` : 'No card on file.', actor: me, tone: 'danger' }));
          toast.error('Payment failed again', { description: d.card ? 'The card was declined. Try another card.' : 'Add a card first.' });
          return false;
        }
        const start = new Date().toISOString();
        apply((x) => {
          const idx = x.invoices.findIndex((i) => i.status === 'failed');
          const failed = x.invoices[idx];
          const invoices = x.invoices.map((inv, i) => i === idx ? { ...inv, status: 'paid' as const, cardLast4: x.card?.last4 ?? null, note: `Paid on retry, ${formatDate(start)}` } : inv);
          return withEvent(
            { ...x, status: 'active', graceEndsAt: null, failedCardLast4: null, periodStart: start, periodEnd: addCycle(start, x.cycle), invoices },
            { kind: 'payment', text: 'Retry succeeded — grace period over', detail: failed ? `Paid ${formatNgn(failed.totalNgn)} with •••• ${x.card?.last4}` : undefined, actor: me, invoiceId: failed?.id, tone: 'success' }
          );
        });
        team.log('settings', 'Retried the renewal payment — paid', '/app/settings/billing');
        toast.success('Payment went through', { description: 'Your plan carries on as normal.' });
        return true;
      },
      charge: (lines, card) =>
      apply((x) => {
        const inv = makeInvoice(x, lines, 'paid', card);
        return withEvent({ ...x, card: x.card ?? card, invoices: [inv, ...x.invoices] }, { kind: 'payment', text: lines[0]?.label ?? 'One-off purchase', detail: `Paid ${formatNgn(inv.totalNgn)} incl. VAT`, actor: me, invoiceId: inv.id, tone: 'success' });
      }),
      runRenewal,
      endTrialNow: endTrial,
      endGraceNow: endGrace
    }),
    [data, renewalOutcome, apply, setPlan, team, me, runRenewal, endTrial, endGrace, previewQuote, current.id]
  );

  return <BillingContext.Provider value={value}>{children}</BillingContext.Provider>;
}

export function useBilling(): BillingValue {
  const ctx = useContext(BillingContext);
  if (!ctx) throw new Error('useBilling must be used inside BillingProvider');
  return ctx;
}