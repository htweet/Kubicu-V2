import React, { useEffect, useState } from 'react';
import { ArrowDownIcon, ArrowUpIcon, ClockIcon, FlaskConicalIcon, PlusIcon, Trash2Icon, ZapIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { ActionId, Automation, AutomationCondition, AutomationRun, TriggerId } from '../../types/ops';
import { useOps } from '../../contexts/OpsContext';
import { actionLabels, conditionLabels, recipes, reportOptions, triggerLabels } from '../../data/automationRecipes';
import { addRun, automationProblems, stepLabel, testRun } from '../../utils/ops/automation';
import { uid } from '../../utils/id';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { TextInput } from '../ui/TextInput';
import { TextArea } from '../ui/TextArea';
import { SelectInput } from '../ui/SelectInput';
import { InlineAlert } from '../ui/InlineAlert';
import { RunSteps } from './RunSteps';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useTeam } from '../../contexts/TeamContext';
import { AssigneeSelect } from '../team/AssigneeSelect';

export function newAutomation(recipeId: string | null): Automation {
  const r = recipes.find((x) => x.id === recipeId);
  return {
    id: uid('auto'),
    name: r?.name ?? 'New automation',
    recipeId,
    status: 'draft',
    trigger: r?.trigger ?? 'order_paid',
    conditions: r ? r.conditions.map((c) => ({ ...c, id: uid('cond') })) : [],
    steps: r ? r.steps.map((s) => ({ ...s, id: uid('step') })) : [{ id: uid('step'), kind: 'action', action: 'notify_owner', value: '' }],
    runs: [],
    updatedAt: new Date().toISOString()
  };
}

/** Readable top-to-bottom builder: Trigger → Conditions → Actions/Delays → Outcome. */
export function AutomationBuilder({ automation, onClose }: {automation: Automation | null;onClose: () => void;}) {
  const { data, apply } = useOps();
  const team = useTeam();
  const [draft, setDraft] = useState<Automation | null>(automation);
  const [lastRun, setLastRun] = useState<AutomationRun | null>(null);
  useEffect(() => {
    setDraft(automation);
    setLastRun(null);
  }, [automation]);
  const [addOpen, setAddOpen] = useState(false);
  const wide = useMediaQuery('(min-width: 768px)');
  if (!draft) return null;
  const addStep = (step: Automation['steps'][number]) => {
    patch({ steps: [...draft.steps, step] });
    setAddOpen(false);
  };

  const exists = data.automations.some((a) => a.id === draft.id);
  const problems = automationProblems(draft);
  const marketing = draft.steps.some((s) => s.kind === 'action' && (s.action === 'send_email' || s.action === 'send_whatsapp')) && draft.trigger === 'checkout_abandoned';
  const patch = (p: Partial<Automation>) => setDraft((d) => d ? { ...d, ...p } : d);
  const setStep = (id: string, p: Partial<Automation['steps'][number]>) => patch({ steps: draft.steps.map((s) => s.id === id ? { ...s, ...p } : s) });
  const move = (i: number, dir: -1 | 1) => {
    const steps = [...draft.steps];
    const [s] = steps.splice(i, 1);
    steps.splice(i + dir, 0, s);
    patch({ steps });
  };

  const save = (status?: Automation['status']) => {
    const next = { ...draft, status: status ?? draft.status, updatedAt: new Date().toISOString() };
    if (status === 'active' && problems.length) return;
    if (apply((d) => ({ ...d, automations: exists ? d.automations.map((a) => a.id === next.id ? { ...next, runs: a.runs } : a) : [next, ...d.automations] }))) {
      toast(status === 'active' ? 'Automation is on' : status === 'paused' ? 'Automation paused' : 'Saved as draft', { description: status === 'active' ? 'Messages are previewed, not sent, in this prototype.' : undefined });
      onClose();
    }
  };

  const runTest = () => {
    const run = testRun(draft, data.automationsPaused, (id) => team.data.members.find((m) => m.id === id)?.name ?? 'a former member');
    setLastRun(run);
    if (exists) apply((d) => addRun(d, draft.id, run));
  };

  return (
    <Sheet
      open={!!automation}
      onClose={onClose}
      side="right"
      size="lg"
      title={exists ? draft.name : 'New automation'}
      description={draft.status === 'active' ? 'On' : draft.status === 'paused' ? 'Paused' : 'Draft'}
      footer={
      <div className="flex flex-wrap items-center justify-between gap-2">
          <Button variant="secondary" leadingIcon={FlaskConicalIcon} onClick={runTest}>
            Test run
          </Button>
          <div className="flex gap-2">
            {draft.status === 'active' ?
          <Button variant="secondary" onClick={() => save('paused')}>
                Pause
              </Button> :

          <Button variant="secondary" onClick={() => save('draft')}>
                Save draft
              </Button>
          }
            <Button onClick={() => save('active')} disabled={problems.length > 0}>
              {draft.status === 'active' ? 'Save' : 'Turn on'}
            </Button>
          </div>
        </div>
      }>
      
      <div className="flex flex-col gap-6 px-5 py-5">
        <TextInput id="auto-name" label="Name" value={draft.name} onChange={(e) => patch({ name: e.target.value })} />
        {data.automationsPaused &&
        <InlineAlert tone="warning" title="All automations are paused">
            Nothing runs until you resume them from the Automations page.
          </InlineAlert>
        }

        <ol className="flex flex-col">
          <li className="relative pb-5 pl-9">
            <span aria-hidden className="absolute left-[13px] top-7 h-full w-px bg-line" />
            <span aria-hidden className="absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full bg-action text-action-fg">
              <ZapIcon size={14} strokeWidth={2.5} />
            </span>
            <p className="text-caption font-semibold text-fg-subtle">When</p>
            <SelectInput<TriggerId> id="auto-trigger" label="Trigger" value={draft.trigger} options={(Object.keys(triggerLabels) as TriggerId[]).map((t) => ({ value: t, label: triggerLabels[t].label }))} hint={triggerLabels[draft.trigger].hint} onChange={(trigger) => patch(trigger === 'contact_quiet' && !draft.triggerDays ? { trigger, triggerDays: 30 } : { trigger })} />
            {draft.trigger === 'contact_quiet' &&
            <TextInput id="auto-quiet-days" label="Quiet for (days)" inputMode="numeric" value={String(draft.triggerDays ?? '')} fieldClassName="mt-3 w-40" hint="Counted from their last order, booking or message. At least 7." onChange={(e) => patch({ triggerDays: Number(e.target.value.replace(/[^0-9]/g, '').slice(0, 3) || '0') })} />
            }
          </li>

          <li className="relative pb-5 pl-9">
            <span aria-hidden className="absolute left-[13px] top-7 h-full w-px bg-line" />
            <span aria-hidden className="absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-line-strong bg-raised text-caption font-bold text-fg-muted">
              if
            </span>
            <p className="text-caption font-semibold text-fg-subtle">Only if (optional)</p>
            <div className="mt-2 flex flex-col gap-2">
              {draft.conditions.map((c) =>
              <div key={c.id} className="flex items-end gap-2">
                  <SelectInput<AutomationCondition['field']> id={`cond-f-${c.id}`} label="Condition" value={c.field} options={(Object.keys(conditionLabels) as AutomationCondition['field'][]).map((f) => ({ value: f, label: conditionLabels[f] }))} onChange={(field) => patch({ conditions: draft.conditions.map((x) => x.id === c.id ? { ...x, field } : x) })} />
                  {c.field !== 'consent_subscribed' &&
                <TextInput id={`cond-v-${c.id}`} label="Value" value={c.value} placeholder={c.field === 'total_over' ? '50000' : c.field === 'source_is' ? 'order' : 'VIP'} fieldClassName="w-32" onChange={(e) => patch({ conditions: draft.conditions.map((x) => x.id === c.id ? { ...x, value: e.target.value } : x) })} />
                }
                  <IconButton icon={Trash2Icon} label="Remove condition" onClick={() => patch({ conditions: draft.conditions.filter((x) => x.id !== c.id) })} />
                </div>
              )}
              <Button size="sm" variant="tertiary" leadingIcon={PlusIcon} className="self-start" onClick={() => patch({ conditions: [...draft.conditions, { id: uid('cond'), field: 'consent_subscribed', value: 'yes' }] })}>
                Add condition
              </Button>
            </div>
          </li>

          {draft.steps.map((s, i) =>
          <li key={s.id} className="relative pb-5 pl-9">
              <span aria-hidden className="absolute left-[13px] top-7 h-full w-px bg-line" />
              <span aria-hidden className="absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-action bg-raised text-caption font-bold text-action">
                {s.kind === 'delay' ? <ClockIcon size={13} strokeWidth={2.5} /> : i + 1}
              </span>
              <div className="flex items-center justify-between gap-2">
                <p className="text-caption font-semibold text-fg-subtle">{s.kind === 'delay' ? 'Wait' : 'Then'}</p>
                <div className="flex">
                  <IconButton icon={ArrowUpIcon} size={wide ? 'sm' : 'lg'} label="Move up" disabled={i === 0} onClick={() => move(i, -1)} />
                  <IconButton icon={ArrowDownIcon} size={wide ? 'sm' : 'lg'} label="Move down" disabled={i === draft.steps.length - 1} onClick={() => move(i, 1)} />
                  <IconButton icon={Trash2Icon} size={wide ? 'sm' : 'lg'} label="Remove step" disabled={draft.steps.length === 1} onClick={() => patch({ steps: draft.steps.filter((x) => x.id !== s.id) })} />
                </div>
              </div>
              {s.kind === 'delay' ?
            <TextInput id={`delay-${s.id}`} label="Hours" inputMode="numeric" value={String(s.delayHours ?? '')} fieldClassName="mt-1 w-32" onChange={(e) => setStep(s.id, { delayHours: Number(e.target.value.replace(/[^0-9]/g, '').slice(0, 3) || '0') })} /> :

            <div className="mt-1 flex flex-col gap-2">
                  <SelectInput<ActionId> id={`act-${s.id}`} label="Action" value={s.action ?? 'notify_owner'} options={(Object.keys(actionLabels) as ActionId[]).map((a) => ({ value: a, label: actionLabels[a].label }))} onChange={(action) => setStep(s.id, { action })} />
                  {(s.action === 'notify_member' || s.action === 'create_task') &&
              <AssigneeSelect id={`who-${s.id}`} label={s.action === 'notify_member' ? 'Who to notify' : 'Assign the follow-up to'} value={s.memberId} onChange={(memberId) => setStep(s.id, { memberId })} />
              }
                  {s.action === 'send_report' ?
              <SelectInput id={`val-${s.id}`} label="Report" value={s.value || ''} options={[{ value: '', label: 'Choose…' }, ...reportOptions]} hint="Arrives in your notifications. Email delivery comes with a messaging partner." onChange={(value) => setStep(s.id, { value })} /> :
              s.action === 'call_webhook' ?
              <TextInput id={`val-${s.id}`} label="Webhook address" type="url" value={s.value} placeholder={actionLabels.call_webhook.placeholder} hint="We POST the event as JSON, signed with your secret from Settings → Developers. Retried 3 times on failure." onChange={(e) => setStep(s.id, { value: e.target.value.trim() })} /> :
              s.action === 'ai_draft' ?
              <div className="flex flex-col gap-1.5">
                      <TextArea id={`val-${s.id}`} label="What should the message say?" rows={3} value={s.value} placeholder={actionLabels.ai_draft.placeholder} hint="AI preview: drafts from your real records and never invents prices or promises. Nothing is sent until you approve it." onChange={(e) => setStep(s.id, { value: e.target.value })} />
                    </div> :
              s.action === 'add_tag' || s.action === 'create_task' ?
              <TextInput id={`val-${s.id}`} label={s.action === 'add_tag' ? 'Tag' : 'Task'} value={s.value} placeholder={actionLabels[s.action].placeholder} onChange={(e) => setStep(s.id, { value: e.target.value })} /> :

              <TextArea id={`val-${s.id}`} label="Message" rows={3} value={s.value} placeholder={actionLabels[s.action ?? 'notify_owner'].placeholder} hint="Use {first_name}, {order_number}, {service}, {time}." onChange={(e) => setStep(s.id, { value: e.target.value })} />
              }
                </div>
            }
            </li>
          )}

          <li className="pl-9">
            {wide ?
            <div className="flex gap-2">
                <Button size="sm" variant="secondary" leadingIcon={PlusIcon} onClick={() => addStep({ id: uid('step'), kind: 'action', action: 'send_whatsapp', value: '' })}>
                  Action
                </Button>
                <Button size="sm" variant="secondary" leadingIcon={ClockIcon} onClick={() => addStep({ id: uid('step'), kind: 'delay', value: '', delayHours: 24 })}>
                  Delay
                </Button>
              </div> :

            <Button variant="secondary" leadingIcon={PlusIcon} fullWidth className="min-h-[44px]" onClick={() => setAddOpen(true)}>
                Add a step
              </Button>
            }
            <p className="mt-3 text-caption text-fg-subtle">Outcome: {draft.steps.map(stepLabel).join(' → ')}</p>
          </li>
        </ol>

        {marketing &&
        <InlineAlert tone="info" title="Marketing message">
            Keep the “subscribed to marketing” condition so only people who opted in are contacted. Unsubscribed contacts are always skipped.
          </InlineAlert>
        }
        {problems.length > 0 &&
        <InlineAlert tone="warning" title="Before you turn it on">
            <ul className="list-disc pl-4">
              {problems.map((p) =>
            <li key={p}>{p}</li>
            )}
            </ul>
          </InlineAlert>
        }
        {lastRun &&
        <section aria-label="Test result" className="rounded-md border border-line p-4">
            <p className="text-label font-semibold text-fg">Test run · {lastRun.status === 'succeeded' ? 'all steps passed' : 'stopped at a condition'}</p>
            <p className="text-caption text-fg-subtle">{lastRun.subject}. Nothing was sent.</p>
            <RunSteps run={lastRun} />
          </section>
        }

        {/* Phones: pick the step type from a bottom sheet. */}
        <Sheet open={addOpen} onClose={() => setAddOpen(false)} title="Add a step" description="It’s added at the end — move it up if needed">
          <ul className="flex flex-col divide-y divide-line pb-2">
            {(Object.keys(actionLabels) as ActionId[]).map((a) =>
            <li key={a}>
                <button type="button" onClick={() => addStep({ id: uid('step'), kind: 'action', action: a, value: '' })} className="flex min-h-[52px] w-full items-center gap-3 px-5 text-left text-label font-medium text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus">
                  <ZapIcon size={16} className="shrink-0 text-action" aria-hidden />
                  {actionLabels[a].label}
                </button>
              </li>
            )}
            <li>
              <button type="button" onClick={() => addStep({ id: uid('step'), kind: 'delay', value: '', delayHours: 24 })} className="flex min-h-[52px] w-full items-center gap-3 px-5 text-left text-label font-medium text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus">
                <ClockIcon size={16} className="shrink-0 text-fg-subtle" aria-hidden />
                Wait before the next step
              </button>
            </li>
          </ul>
        </Sheet>
      </div>
    </Sheet>);

}