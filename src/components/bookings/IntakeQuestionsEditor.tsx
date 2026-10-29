import React from 'react';
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import type { IntakeQuestion } from '../../types/ops';
import { uid } from '../../utils/id';
import { TextInput } from '../ui/TextInput';
import { fieldControlClass } from '../ui/Field';
import { SelectInput } from '../ui/SelectInput';
import { Switch } from '../ui/Switch';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { useT } from '../../contexts/LocaleContext';

export const MAX_QUESTIONS = 5;
const MAX_OPTIONS = 6;

const kinds: {value: IntakeQuestion['kind'];label: string;}[] = [
{ value: 'text', label: 'Short answer' },
{ value: 'choice', label: 'Pick one' },
{ value: 'yesno', label: 'Yes or no' }];


/** What's wrong with a question, for the editor and for saving (D256). */
export function questionError(q: IntakeQuestion): string {
  if (!q.label.trim()) return 'Write the question';
  if (q.kind === 'choice' && q.options.filter((o) => o.trim()).length < 2) return 'Add at least 2 options';
  return '';
}

interface IntakeQuestionsEditorProps {
  value: IntakeQuestion[];
  onChange: (next: IntakeQuestion[]) => void;
  showErrors: boolean;
}

/** The seller's own booking questions, one card per question (D256). */
export function IntakeQuestionsEditor({ value, onChange, showErrors }: IntakeQuestionsEditorProps) {
  const { t: tr } = useT();
  const set = (id: string, p: Partial<IntakeQuestion>) => onChange(value.map((q) => q.id === id ? { ...q, ...p } : q));
  const move = (i: number, d: -1 | 1) => {
    const next = [...value];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      {value.length > 0 &&
      <ol className="flex flex-col divide-y divide-line rounded-md border border-line">
          {value.map((q, i) => {
          const err = showErrors ? questionError(q) : '';
          return (
            <li key={q.id} className="flex flex-col gap-3 p-3">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <TextInput
                    id={`q-${q.id}`}
                    label={tr('Question {n}', { n: i + 1 })}
                    value={q.label}
                    maxLength={120}
                    placeholder={tr('e.g. What’s your hair length?')}
                    error={err === 'Write the question' ? tr(err) : undefined}
                    onChange={(e) => set(q.id, { label: e.target.value })} />
                  
                  </div>
                  <div className="mt-6 flex shrink-0 items-center">
                    <IconButton icon={ArrowUpIcon} size="sm" label={tr('Move up')} disabled={i === 0} onClick={() => move(i, -1)} />
                    <IconButton icon={ArrowDownIcon} size="sm" label={tr('Move down')} disabled={i === value.length - 1} onClick={() => move(i, 1)} />
                    <IconButton icon={Trash2Icon} size="sm" label={tr('Remove question {n}', { n: i + 1 })} onClick={() => onChange(value.filter((x) => x.id !== q.id))} />
                  </div>
                </div>
                <div className="grid items-end gap-3 sm:grid-cols-2">
                  <SelectInput<IntakeQuestion['kind']>
                  id={`q-kind-${q.id}`}
                  label="Answer"
                  value={q.kind}
                  options={kinds.map((k) => ({ value: k.value, label: tr(k.label) }))}
                  onChange={(kind) => set(q.id, { kind, options: kind === 'choice' && q.options.length < 2 ? ['', ''] : q.options })} />
                
                  <Switch id={`q-req-${q.id}`} label="Required" checked={q.required} onChange={(required) => set(q.id, { required })} />
                </div>
                {q.kind === 'choice' &&
              <fieldset className="flex flex-col gap-2">
                    <legend className="mb-1 text-caption text-fg-subtle">{tr('Options')}</legend>
                    {q.options.map((o, oi) =>
                <div key={oi} className="flex items-center gap-2">
                        <div className="min-w-0 flex-1">
                          <input
                      id={`q-${q.id}-o${oi}`}
                      aria-label={tr('Option {n}', { n: oi + 1 })}
                      className={fieldControlClass}
                      value={o}
                      maxLength={60}
                      placeholder={tr('Option {n}', { n: oi + 1 })}
                      onChange={(e) => set(q.id, { options: q.options.map((x, xi) => xi === oi ? e.target.value : x) })} />
                    
                        </div>
                        <IconButton icon={Trash2Icon} size="sm" label={tr('Remove option {n}', { n: oi + 1 })} disabled={q.options.length <= 2} onClick={() => set(q.id, { options: q.options.filter((_, xi) => xi !== oi) })} />
                      </div>
                )}
                    {q.options.length < MAX_OPTIONS &&
                <Button variant="tertiary" size="sm" leadingIcon={PlusIcon} className="self-start" onClick={() => set(q.id, { options: [...q.options, ''] })}>
                        Add option
                      </Button>
                }
                    {err === 'Add at least 2 options' && <p className="text-caption font-medium text-danger">{tr(err)}</p>}
                  </fieldset>
              }
              </li>);

        })}
        </ol>
      }
      {value.length < MAX_QUESTIONS ?
      <Button variant="secondary" size="sm" leadingIcon={PlusIcon} className="self-start" onClick={() => onChange([...value, { id: uid('iq'), label: '', kind: 'text', options: [], required: false }])}>
          Add a question
        </Button> :

      <p className="text-caption text-fg-subtle">{tr('Up to {n} questions, so booking stays quick.', { n: MAX_QUESTIONS })}</p>
      }
    </div>);

}