import type { Automation, AutomationRun, AutomationRunStep, OpsData } from '../../types/ops';
import { actionLabels, conditionLabels, triggerLabels } from '../../data/automationRecipes';
import { uid } from '../id';

/** Sample event used for test runs, per trigger. */
const sampleSubject: Record<Automation['trigger'], { subject: string; vars: Record<string, string>; total: number; source: string; subscribed: boolean }> = {
  order_paid: { subject: 'Test order #9999 from Ada Test', vars: { first_name: 'Ada', name: 'Ada Test', order_number: '#9999', total: '₦45,000', item: 'Ankara wrap dress', product: 'Ankara wrap dress', link: 'kub.icu/…', order_link: 'kub.icu/…/order/…' }, total: 45000, source: 'order', subscribed: false },
  booking_created: { subject: 'Test booking for Ada Test', vars: { first_name: 'Ada', name: 'Ada Test', service: 'Fitting', time: 'Tue 10:00am', ref: 'BK-TEST' }, total: 0, source: 'booking', subscribed: false },
  checkout_abandoned: { subject: 'Test cart left by Ada Test', vars: { first_name: 'Ada', name: 'Ada Test', order_number: '#9998', total: '₦32,000', cart_link: 'kub.icu/…/order/…' }, total: 32000, source: 'order', subscribed: true },
  lead_submitted: { subject: 'Test enquiry from Ada Test', vars: { first_name: 'Ada', name: 'Ada Test', form: 'Newsletter' }, total: 0, source: 'form', subscribed: false },
  form_sent: { subject: 'Test: Ada Test sent “Bridal quote request”', vars: { first_name: 'Ada', name: 'Ada Test', email: 'ada@example.com', form: 'Bridal quote request', total: '' }, total: 0, source: 'form', subscribed: false },
  stock_low: { subject: 'Test: Voile wrap blouse low', vars: { product: 'Voile wrap blouse', stock: '2' }, total: 0, source: 'order', subscribed: false },
  sub_started: { subject: 'Test: Ada Test joined Atelier Circle', vars: { first_name: 'Ada', plan: 'Atelier Circle' }, total: 5000, source: 'order', subscribed: false },
  sub_failed: { subject: 'Test: Ada Test’s renewal was declined', vars: { first_name: 'Ada', name: 'Ada Test', plan: 'Atelier Circle', amount: '₦5,000' }, total: 5000, source: 'order', subscribed: false },
  sub_cancelled: { subject: 'Test: Ada Test cancelled Atelier Circle', vars: { first_name: 'Ada', plan: 'Atelier Circle' }, total: 0, source: 'order', subscribed: false },
  stage_due: { subject: 'Test: “Trial session” is due on Ada Test’s bridal quote', vars: { first_name: 'Ada', name: 'Ada Test', stage: 'Trial session', total: '₦48,000', amount: '₦48,000', pay_link: 'kub.icu/ada/pay/…' }, total: 48000, source: 'order', subscribed: false },
  campaign_started: { subject: 'Test: “Owambe Season Drop” went live', vars: { campaign: 'Owambe Season Drop', link: 'kub.icu/…/owambe' }, total: 0, source: 'order', subscribed: true },
  campaign_ended: { subject: 'Test: “Owambe Season Drop” ended — 14 orders, ₦486,000', vars: { campaign: 'Owambe Season Drop', orders: '14', revenue: '₦486,000' }, total: 486000, source: 'order', subscribed: true },
  contact_quiet: { subject: 'Test: Ada Test hasn’t bought in 45 days', vars: { first_name: 'Ada', days: '45', last_item: 'Ankara wrap dress' }, total: 0, source: 'order', subscribed: true },
};

/** Rule-based "AI preview" draft for test runs (D125) — never sent without the owner's approval. */
function aiDraft(instruction: string, vars: Record<string, string>): string {
  const name = vars.first_name ?? 'there';
  const item = vars.last_item ? ` We’ve added pieces like the ${vars.last_item} you loved.` : '';
  const topic = instruction.trim() ? ` (${instruction.trim().slice(0, 60)})` : '';
  return `Hi ${name}, it’s been a while! ${item.trim()} Reply here if you’d like us to set something aside for you.${topic}`.replace(/\s+/g, ' ');
}

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
  if (a.trigger === 'contact_quiet' && (!a.triggerDays || a.triggerDays < 7)) out.push('Choose how many quiet days count (at least 7)');
  a.steps.forEach((s, i) => {
    if (s.kind === 'action' && !s.value.trim()) out.push(`Step ${i + 1} needs ${s.action === 'add_tag' ? 'a tag' : s.action === 'call_webhook' ? 'a webhook address' : s.action === 'send_report' ? 'a report to send' : 'some text'}`);
    if (s.kind === 'action' && s.action === 'call_webhook' && s.value.trim() && !/^https:\/\/[^\s/]+\.[^\s]+/.test(s.value.trim())) out.push(`Step ${i + 1}: the webhook address must start with https://`);
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
      if (step.kind === 'delay') steps.push({ label: stepLabel(step), status: 'done', detail: 'Skipped in test runs' });
      else if (step.action === 'notify_member') steps.push({ label: stepLabel(step), status: 'done', detail: `Preview: ${memberName(step.memberId)} would get “${fill(step.value, s.vars)}” in KUBICU — not sent` });
      else if (step.action === 'create_task' && step.memberId) steps.push({ label: stepLabel(step), status: 'done', detail: `Preview: follow-up “${fill(step.value, s.vars)}” for ${memberName(step.memberId)} — not created` });
      else if (step.action === 'ai_draft') steps.push({ label: stepLabel(step), status: 'waiting', detail: `AI preview draft: “${aiDraft(step.value, s.vars)}” — waits in your notifications for you to approve, edit or discard. Uses 1 AI credit on live runs.` });
      else if (step.action === 'send_report') steps.push({ label: stepLabel(step), status: 'done', detail: `Preview: “${step.value}” for ${s.subject.replace(/^Test:\s*/, '')} would arrive in your notifications — not sent` });
      else if (step.action === 'call_webhook') steps.push({ label: stepLabel(step), status: 'done', detail: `Preview: POST ${step.value.trim()} with the ${a.trigger} event, signed with your webhook secret — not called in test runs` });
      else steps.push({ label: stepLabel(step), status: 'done', detail: `Preview: “${fill(step.value, s.vars)}” — not sent` });
    }
  }
  if (paused) steps.push({ label: 'Workspace automations paused', status: 'skipped', detail: 'Live runs wouldn’t happen while paused' });
  return { id: uid('run'), at: new Date().toISOString(), test: true, status: blocked ? 'skipped' : 'succeeded', subject: s.subject, steps };
}

/** Test runs keep only the latest one per automation, so pressing Test run again replaces it instead of piling up history. */
export function addTestRun(data: OpsData, automationId: string, run: AutomationRun): OpsData {
  return { ...data, automations: data.automations.map((a) => (a.id === automationId ? { ...a, runs: [run, ...a.runs.filter((r) => !r.test)].slice(0, 50) } : a)) };
}

export function addRun(data: OpsData, automationId: string, run: AutomationRun): OpsData {
  return { ...data, automations: data.automations.map((a) => (a.id === automationId ? { ...a, runs: [run, ...a.runs].slice(0, 50) } : a)) };
}
