import type { Automation, AutomationRun, AutomationRunStep, Contact, OpsData } from '../../types/ops';
import type { CommerceData } from '../../types/commerce';
import { conditionLabels, triggerLabels } from '../../data/automationRecipes';
import { simulateResponse } from '../developers';
import { orderMoney } from '../commerce/money';
import { isLowStock, isSoldOut } from '../commerce/catalog';
import { formatNgn } from '../format';
import { uid } from '../id';
import { stepLabel } from './automation';

const DAY = 86400000;

/** One real thing that happened and might start an automation (D137). */
export interface LiveEvent {
  /** Stable per occurrence, so it only fires once. */
  key: string;
  subject: string;
  vars: Record<string, string>;
  total: number;
  source: string;
  subscribed: boolean;
  contactId?: string;
}

const fill = (text: string, vars: Record<string, string>) => text.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? `{${k}}`);

/** When the contact last did anything (order, booking, form, message…). */
export function lastActivity(c: Contact): number {
  return Math.max(Date.parse(c.createdAt), ...c.activity.filter((a) => a.kind !== 'note' && a.kind !== 'task' && a.kind !== 'stage').map((a) => Date.parse(a.at)));
}

/** Rule-based draft (AI preview, D125). Uses only the contact's name and what they last bought. */
function draft(instruction: string, vars: Record<string, string>): string {
  const name = vars.first_name ?? 'there';
  const item = vars.last_item ? ` We’ve got new pieces you might like after your ${vars.last_item}.` : '';
  const topic = instruction.trim() ? ` ${instruction.trim().replace(/[.!]?$/, '.')}` : '';
  return `Hi ${name}, it’s been a little while!${item}${topic} Reply here and we’ll set something aside for you.`.replace(/\s+/g, ' ');
}

/** A short report from the workspace's own numbers. */
export function reportText(kind: string, commerce: CommerceData, ops: OpsData, now = Date.now()): string {
  const week = commerce.orders.filter((o) => now - Date.parse(o.createdAt) < 7 * DAY && o.paymentStatus !== 'pending' && o.paymentStatus !== 'cancelled');
  if (kind === 'New contacts') {
    const n = ops.contacts.filter((c) => now - Date.parse(c.createdAt) < 7 * DAY).length;
    return `${n} new contact${n === 1 ? '' : 's'} in the last 7 days.`;
  }
  if (kind === 'Stock to reorder') {
    const low = commerce.products.filter((p) => p.status === 'active' && (isLowStock(p) || isSoldOut(p)));
    return low.length ? `${low.length} to reorder: ${low.slice(0, 4).map((p) => p.name).join(', ')}${low.length > 4 ? '…' : ''}.` : 'Nothing is low on stock.';
  }
  const revenue = week.reduce((s, o) => s + orderMoney(o).gross, 0);
  return `${week.length} paid order${week.length === 1 ? '' : 's'}, ${formatNgn(revenue)} in the last 7 days.`;
}

/**
 * Runs an active automation for a real event (D137). Tags and follow-ups really change the contact;
 * AI drafts wait for approval; reports are written from live numbers; webhooks are called (simulated).
 * Customer messages are still written but not sent — that needs a messaging partner.
 */
export function runLive(data: OpsData, a: Automation, ev: LiveEvent, ctx: {commerce: CommerceData;memberName: (id: string | null | undefined) => string;}): OpsData {
  const steps: AutomationRunStep[] = [{ label: triggerLabels[a.trigger].label, status: 'done', detail: ev.subject }];
  let blocked = false;
  let contacts = data.contacts;
  const contact = ev.contactId ? contacts.find((c) => c.id === ev.contactId) : undefined;

  for (const c of a.conditions) {
    let pass = true;
    if (c.field === 'total_over') pass = ev.total > Number(c.value || 0);
    if (c.field === 'source_is') pass = ev.source === c.value;
    if (c.field === 'tag_is') pass = !!contact?.tags.includes(c.value);
    if (c.field === 'consent_subscribed') pass = ev.subscribed;
    steps.push({ label: `If ${conditionLabels[c.field].toLowerCase()}${c.field === 'consent_subscribed' ? '' : ` ${c.value}`}`, status: pass ? 'done' : 'skipped', detail: pass ? 'Condition met' : 'Condition not met — stopped here' });
    if (!pass) {
      blocked = true;
      break;
    }
  }

  let failed = false;
  if (!blocked) {
    for (const step of a.steps) {
      if (step.kind === 'delay') {
        steps.push({ label: stepLabel(step), status: 'done', detail: 'Counted from the event — the next step was due straight away in this prototype' });
        continue;
      }
      const text = fill(step.value, ev.vars);
      if (step.action === 'add_tag' && contact) {
        contacts = contacts.map((c) => c.id === contact.id && !c.tags.includes(step.value) ? { ...c, tags: [...c.tags, step.value] } : c);
        steps.push({ label: stepLabel(step), status: 'done', detail: `Tagged ${contact.name} “${step.value}”` });
      } else if (step.action === 'create_task' && contact) {
        contacts = contacts.map((c) => c.id === contact.id ? { ...c, tasks: [...c.tasks, { id: uid('task'), text, due: new Date(Date.now() + DAY).toISOString(), done: false, assigneeId: step.memberId ?? null }] } : c);
        steps.push({ label: stepLabel(step), status: 'done', detail: `Follow-up “${text}” added to ${contact.name}${step.memberId ? ` for ${ctx.memberName(step.memberId)}` : ''}, due tomorrow` });
      } else if (step.action === 'notify_owner' || step.action === 'notify_member') {
        steps.push({ label: stepLabel(step), status: 'done', detail: `In your notifications: “${text}”${step.action === 'notify_member' ? ` (for ${ctx.memberName(step.memberId)})` : ''}` });
      } else if (step.action === 'ai_draft') {
        steps.push({ label: stepLabel(step), status: 'waiting', detail: draft(step.value, ev.vars) });
      } else if (step.action === 'send_report') {
        steps.push({ label: stepLabel(step), status: 'done', detail: `${step.value}: ${reportText(step.value, ctx.commerce, { ...data, contacts })}` });
      } else if (step.action === 'call_webhook') {
        const res = simulateResponse(step.value);
        steps.push({ label: stepLabel(step), status: res.ok ? 'done' : 'failed', detail: res.ok ? `POST ${step.value.trim()} → ${res.status} OK in ${res.durationMs} ms (signed, simulated)` : `POST ${step.value.trim()} → ${res.status}. Retried 3 times, then stopped.` });
        if (!res.ok) failed = true;
      } else {
        steps.push({ label: stepLabel(step), status: 'done', detail: `Written: “${text}” — not sent; sending needs a messaging partner` });
      }
    }
  }

  const run: AutomationRun = { id: uid('run'), at: new Date().toISOString(), test: false, status: blocked ? 'skipped' : failed ? 'failed' : 'succeeded', subject: ev.subject, steps };
  return {
    ...data,
    contacts,
    automations: data.automations.map((x) => x.id === a.id ? { ...x, runs: [run, ...x.runs].slice(0, 50) } : x),
    firedKeys: [ev.key, ...(data.firedKeys ?? [])].slice(0, 500)
  };
}

/** Approve or discard a waiting AI draft. Approved drafts are ready to send, still as a preview. */
export function decideDraft(data: OpsData, automationId: string, runId: string, stepIndex: number, approve: boolean, by: string): OpsData {
  return {
    ...data,
    automations: data.automations.map((a) =>
    a.id !== automationId ?
    a :
    { ...a, runs: a.runs.map((r) => r.id !== runId ? r : { ...r, steps: r.steps.map((s, i) => i !== stepIndex ? s : { ...s, status: approve ? 'done' : 'skipped', detail: `${approve ? `Approved by ${by}` : `Discarded by ${by}`}: “${s.detail.replace(/^(Approved|Discarded) by [^:]+: “|”$/g, '')}”` }) }) }
    )
  };
}