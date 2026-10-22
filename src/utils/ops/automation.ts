import type { Automation, AutomationRun, AutomationRunStep, OpsData } from '../../types/ops';
import { actionLabels, conditionLabels, triggerLabels } from '../../data/automationRecipes';
import { uid } from '../id';

/** Sample event used for test runs, per trigger. */
const sampleSubject: Record<Automation['trigger'], {subject: string;vars: Record<string, string>;total: number;source: string;subscribed: boolean;}> = {
  order_paid: { subject: 'Test order #9999 from Ada Test', vars: { first_name: 'Ada', order_number: '9999' }, total: 45000, source: 'order', subscribed: false },
  booking_created: { subject: 'Test booking for Ada Test', vars: { first_name: 'Ada', service: 'Fitting', time: 'Tue 10:00am' }, total: 0, source: 'booking', subscribed: false },
  checkout_abandoned: { subject: 'Test cart left by Ada Test', vars: { first_name: 'Ada', cart_link: 'kub.icu/…/cart' }, total: 32000, source: 'order', subscribed: true },
  lead_submitted: { subject: 'Test enquiry from Ada Test', vars: { first_name: 'Ada' }, total: 0, source: 'form', subscribed: false },
  stock_low: { subject: 'Test: Voile wrap blouse low', vars: { product: 'Voile wrap blouse', stock: '2' }, total: 0, source: 'order', subscribed: false }
};

function fill(text: string, vars: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? `{${k}}`);
}

export function stepLabel(step: Automation['steps'][number]): string {
  if (step.kind === 'delay') return `Wait ${step.delayHours ?? 0} hour${step.delayHours === 1 ? '' : 's'}`;
  return actionLabels[step.action ?? 'notify_owner'].label;
}

/** Problems that stop an automation being turned on. */
export function automationProblems(a: Automation): string[] {
  const out: string[] = [];
  if (!a.name.trim()) out.push('Give it a name');
  if (a.steps.filter((s) => s.kind === 'action').length === 0) out.push('Add at least one action');
  a.steps.forEach((s, i) => {
    if (s.kind === 'action' && !s.value.trim()) out.push(`Step ${i + 1} needs ${s.action === 'add_tag' ? 'a tag' : 'some text'}`);
    if (s.kind === 'action' && s.action === 'notify_member' && !s.memberId) out.push(`Step ${i + 1}: choose who to notify`);
    if (s.kind === 'delay' && (!s.delayHours || s.delayHours < 1)) out.push(`Step ${i + 1}: delay must be at least 1 hour`);
  });
  if (a.steps[a.steps.length - 1]?.kind === 'delay') out.push('End with an action, not a delay');
  return out;
}

/** Runs the automation against a sample event, step by step, without sending anything. */
export function testRun(a: Automation, paused: boolean, memberName: (id: string | null | undefined) => string = () => 'a team member'): AutomationRun {
  const s = sampleSubject[a.trigger];
  const steps: AutomationRunStep[] = [{ label: triggerLabels[a.trigger].label, status: 'done', detail: s.subject }];
  let blocked = false;
  for (const c of a.conditions) {
    let pass = true;
    if (c.field === 'total_over') pass = s.total > Number(c.value || 0);
    if (c.field === 'source_is') pass = s.source === c.value;
    if (c.field === 'tag_is') pass = false;
    if (c.field === 'consent_subscribed') pass = s.subscribed;
    steps.push({ label: `If ${conditionLabels[c.field].toLowerCase()}${c.field === 'consent_subscribed' ? '' : ` ${c.value}`}`, status: pass ? 'done' : 'skipped', detail: pass ? 'Condition met' : 'Condition not met — stopping here' });
    if (!pass) {
      blocked = true;
      break;
    }
  }
  if (!blocked) {
    for (const step of a.steps) {
      if (step.kind === 'delay') steps.push({ label: stepLabel(step), status: 'done', detail: 'Skipped in test runs' });else
      if (step.action === 'notify_member') steps.push({ label: stepLabel(step), status: 'done', detail: `Preview: ${memberName(step.memberId)} would get “${fill(step.value, s.vars)}” in KUBICU — not sent` });else
      if (step.action === 'create_task' && step.memberId) steps.push({ label: stepLabel(step), status: 'done', detail: `Preview: follow-up “${fill(step.value, s.vars)}” for ${memberName(step.memberId)} — not created` });else
      steps.push({ label: stepLabel(step), status: 'done', detail: `Preview: “${fill(step.value, s.vars)}” — not sent` });
    }
  }
  if (paused) steps.push({ label: 'Workspace automations paused', status: 'skipped', detail: 'Live runs wouldn’t happen while paused' });
  return { id: uid('run'), at: new Date().toISOString(), test: true, status: blocked ? 'skipped' : 'succeeded', subject: s.subject, steps };
}

export function addRun(data: OpsData, automationId: string, run: AutomationRun): OpsData {
  return { ...data, automations: data.automations.map((a) => a.id === automationId ? { ...a, runs: [run, ...a.runs].slice(0, 50) } : a) };
}