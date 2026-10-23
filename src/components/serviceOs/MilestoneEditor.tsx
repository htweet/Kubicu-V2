import React, { useState } from 'react';
import { ArrowDownIcon, ArrowUpIcon, BookmarkPlusIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import type { Milestone, MilestoneTemplate, MilestoneTrigger } from '../../types/serviceOs';
import { blankStage, builtInTemplates, MAX_STAGES, pctTotal, stagesFromTemplate, templateFrom, triggerLabels } from '../../utils/milestones';
import { formatNgn } from '../../utils/format';
import { todayKey } from '../../utils/serviceOs';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { TextInput } from '../ui/TextInput';
import { SelectInput } from '../ui/SelectInput';

interface Props {
  stages: Milestone[];
  total: number;
  readOnly: boolean;
  savedTemplates: MilestoneTemplate[];
  onChange: (stages: Milestone[]) => void;
  onSaveTemplate: (t: MilestoneTemplate) => void;
  onDeleteTemplate: (id: string) => void;
}

const triggerOptions = (Object.keys(triggerLabels) as MilestoneTrigger[]).map((t) => ({ value: t, label: triggerLabels[t] }));

/** Define the payment stages for a quote: name, share, and what makes each one due (D95). */
export function MilestoneEditor({ stages, total, readOnly, savedTemplates, onChange, onSaveTemplate, onDeleteTemplate }: Props) {
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState('');
  const sum = pctTotal(stages);
  const templates = [...builtInTemplates, ...savedTemplates];

  const set = (id: string, p: Partial<Milestone>) => onChange(stages.map((s) => s.id === id ? { ...s, ...p } : s));
  const move = (i: number, dir: -1 | 1) => {
    const next = [...stages];
    const [s] = next.splice(i, 1);
    next.splice(i + dir, 0, s);
    onChange(next);
  };
  // Amounts as the client will see them; the last stage absorbs rounding.
  let used = 0;
  const amounts = stages.map((s, i) => {
    const a = i === stages.length - 1 ? Math.max(0, total - used) : Math.round(total * (s.pct || 0) / 100);
    used += a;
    return a;
  });

  return (
    <div className="flex flex-col gap-4">
      {!readOnly &&
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1">
            <SelectInput<string>
            id="ms-template"
            label="Start from a template"
            value=""
            options={[{ value: '', label: 'Choose a template…' }, ...templates.map((t) => ({ value: t.id, label: `${t.name}${t.builtIn ? '' : ' · yours'}` }))]}
            onChange={(v) => {
              const t = templates.find((x) => x.id === v);
              if (t) onChange(stagesFromTemplate(t));
            }} />
          
          </div>
          {savedTemplates.length > 0 &&
        <details className="text-caption text-fg-muted sm:pb-2.5">
              <summary className="cursor-pointer select-none hover:text-fg">Manage yours</summary>
              <ul className="mt-2 flex flex-col gap-1">
                {savedTemplates.map((t) =>
            <li key={t.id} className="flex items-center justify-between gap-2">
                    <span className="truncate text-fg">{t.name}</span>
                    <IconButton icon={Trash2Icon} size="sm" label={`Delete template ${t.name}`} onClick={() => onDeleteTemplate(t.id)} />
                  </li>
            )}
              </ul>
            </details>
        }
        </div>
      }

      <ol className="flex flex-col divide-y divide-line rounded-lg border border-line">
        {stages.map((s, i) =>
        <li key={s.id} className="flex flex-col gap-3 p-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sunken text-caption font-semibold tabular-nums text-fg">{i + 1}</span>
              <span className="min-w-0 flex-1 truncate text-label font-medium text-fg">{s.label || 'Untitled stage'}</span>
              <span className="shrink-0 text-label font-semibold tabular-nums text-fg">{formatNgn(amounts[i])}</span>
              {!readOnly &&
            <span className="flex shrink-0 items-center">
                  <IconButton icon={ArrowUpIcon} size="sm" label={`Move ${s.label || 'stage'} up`} disabled={i === 0} onClick={() => move(i, -1)} />
                  <IconButton icon={ArrowDownIcon} size="sm" label={`Move ${s.label || 'stage'} down`} disabled={i === stages.length - 1} onClick={() => move(i, 1)} />
                  <IconButton icon={Trash2Icon} size="sm" label={`Remove ${s.label || 'stage'}`} disabled={stages.length <= 2} onClick={() => onChange(stages.filter((x) => x.id !== s.id))} />
                </span>
            }
            </div>
            {!readOnly &&
          <div className="grid gap-3 sm:grid-cols-[1fr_96px]">
                <TextInput id={`ms-label-${s.id}`} label="Stage name" placeholder="e.g. Trial session" value={s.label} maxLength={40} onChange={(e) => set(s.id, { label: e.target.value })} />
                <TextInput
              id={`ms-pct-${s.id}`}
              label="Share %"
              inputMode="numeric"
              value={s.pct ? String(s.pct) : ''}
              onChange={(e) => set(s.id, { pct: Math.min(100, Number(e.target.value.replace(/\D/g, '')) || 0) })} />
            
                <div className="sm:col-span-2">
                  <SelectInput<MilestoneTrigger> id={`ms-trigger-${s.id}`} label="Due" value={s.trigger} options={triggerOptions} onChange={(v) => set(s.id, { trigger: v })} />
                </div>
                {s.trigger === 'step' &&
            <TextInput id={`ms-step-${s.id}`} label="Job step" placeholder="e.g. Trial session" value={s.stepLabel ?? ''} maxLength={80} onChange={(e) => set(s.id, { stepLabel: e.target.value })} hint="Added to the job checklist. Ticking it makes this stage due." fieldClassName="sm:col-span-2" />
            }
                {s.trigger === 'date' && <TextInput id={`ms-date-${s.id}`} label="Date" type="date" min={todayKey()} value={s.date ?? ''} onChange={(e) => set(s.id, { date: e.target.value })} fieldClassName="sm:col-span-2 sm:max-w-[220px]" />}
              </div>
          }
            {readOnly &&
          <p className="pl-8 text-caption text-fg-muted">
                {s.pct}% · {s.trigger === 'step' ? `When “${s.stepLabel}” is ticked` : s.trigger === 'date' && s.date ? `On ${s.date}` : triggerLabels[s.trigger]}
              </p>
          }
          </li>
        )}
      </ol>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className={cn('text-label tabular-nums', sum === 100 ? 'text-fg-muted' : 'font-medium text-danger')} aria-live="polite">
          {sum}% of 100% {sum === 100 ? '· adds up' : sum < 100 ? `· ${100 - sum}% left to assign` : `· ${sum - 100}% too much`}
        </p>
        {!readOnly &&
        <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" leadingIcon={PlusIcon} disabled={stages.length >= MAX_STAGES} onClick={() => onChange([...stages, { ...blankStage(), pct: Math.max(0, 100 - sum) }])}>
              Add stage
            </Button>
            <Button size="sm" variant="tertiary" leadingIcon={BookmarkPlusIcon} onClick={() => setNaming((v) => !v)}>
              Save as template
            </Button>
          </div>
        }
      </div>

      {naming && !readOnly &&
      <form
        className="flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim() || sum !== 100 || stages.some((s) => !s.label.trim())) {
            toast.error('Finish the stages first', { description: 'Name every stage and make them add up to 100%.' });
            return;
          }
          onSaveTemplate(templateFrom(name, stages));
          toast.success('Template saved', { description: 'It’s in “Start from a template” on every new quote.' });
          setName('');
          setNaming(false);
        }}>
        
          <TextInput id="ms-tpl-name" label="Template name" placeholder="e.g. Owambe makeup — 40 / 60" value={name} maxLength={50} onChange={(e) => setName(e.target.value)} fieldClassName="flex-1" />
          <Button type="submit" variant="secondary" disabled={!name.trim()}>
            Save
          </Button>
        </form>
      }
    </div>);

}