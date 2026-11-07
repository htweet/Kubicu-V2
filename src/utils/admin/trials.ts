import type { WorkspacePlan } from '../../types/plan';
import type { BillingData } from '../../types/billing';
import { plans } from '../../data/plans';
import { TRIAL_PLAN } from '../../data/billing';
import { addDays, emptyBilling, formatDate, notifyBillingChanged, readBilling, withEvent, writeBilling } from '../billing';

export type TrialAction = 'start' | 'extend' | 'end';

const STAFF = 'KUBICU support';

/**
 * Staff trial changes for one workspace (D135). Writes that workspace's billing record and
 * returns the plan it should be on, or an error in plain words.
 */
export function staffTrial(workspaceId: string, currentPlan: WorkspacePlan, action: TrialAction, days: number, reason: string): { plan: WorkspacePlan; summary: string } | { error: string } {
  const d: BillingData = readBilling(workspaceId) ?? emptyBilling();
  const now = new Date().toISOString();
  let next: BillingData;
  let plan = currentPlan;
  let summary: string;

  if (action === 'start') {
    if (d.trial) return { error: 'This workspace is already on a trial. Extend it instead.' };
    if (currentPlan !== 'free') return { error: `Trials start from Free. This workspace is on ${plans[currentPlan].name}.` };
    const endsAt = addDays(now, days);
    next = withEvent({ ...d, trial: { endsAt, previousPlan: currentPlan }, trialUsed: true, status: 'trialing', periodStart: now, periodEnd: endsAt }, { kind: 'plan', text: `KUBICU started a ${days}-day ${plans[TRIAL_PLAN].name} trial`, detail: `Free until ${formatDate(endsAt)}. Reason: ${reason}`, actor: STAFF, tone: 'success' });
    plan = TRIAL_PLAN;
    summary = `Started a ${days}-day ${plans[TRIAL_PLAN].name} trial (until ${formatDate(endsAt)})`;
  } else if (action === 'extend') {
    if (!d.trial) return { error: 'There’s no trial to extend.' };
    const endsAt = addDays(d.trial.endsAt, days);
    next = withEvent({ ...d, trial: { ...d.trial, endsAt }, periodEnd: endsAt }, { kind: 'plan', text: `KUBICU extended the trial by ${days} days`, detail: `Now ends ${formatDate(endsAt)}. Reason: ${reason}`, actor: STAFF, tone: 'success' });
    summary = `Extended the trial by ${days} days (now ends ${formatDate(endsAt)})`;
  } else {
    if (!d.trial) return { error: 'There’s no trial to end.' };
    plan = d.trial.previousPlan;
    next = withEvent({ ...d, trial: null, status: 'active', periodStart: null, periodEnd: null }, { kind: 'plan', text: 'KUBICU ended the trial', detail: `Back on ${plans[plan].name}. Nothing was deleted. Reason: ${reason}`, actor: STAFF, tone: 'warning' });
    summary = `Ended the trial — back on ${plans[plan].name}`;
  }

  try {
    writeBilling(workspaceId, next);
  } catch {
    return { error: 'Couldn’t save — browser storage is full or blocked.' };
  }
  notifyBillingChanged(workspaceId);
  return { plan, summary };
}

export function trialState(workspaceId: string): BillingData['trial'] {
  return readBilling(workspaceId)?.trial ?? null;
}
