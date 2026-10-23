import React from 'react';
import { Trash2Icon } from 'lucide-react';
import type { FieldRule, FormField } from '../../types/forms';
import { choiceTypes, fieldTypeInfo } from '../../utils/forms/fields';
import { ruleSentence } from '../../utils/forms/logic';
import { TextInput } from '../ui/TextInput';
import { TextArea } from '../ui/TextArea';
import { SelectInput } from '../ui/SelectInput';
import { Switch } from '../ui/Switch';
import { Button } from '../ui/Button';

interface FieldEditorProps {
  field: FormField;
  /** All fields, so rules and payment amounts can reference fields above this one. */
  fields: FormField[];
  isFirst: boolean;
  onChange: (patch: Partial<FormField>) => void;
  onRemove: () => void;
  disabled: boolean;
}

const textTypes = ['shortText', 'longText', 'email', 'phone', 'number', 'amount', 'address'];

/** Settings for one field: label, help, options, rules, steps and payment (D79). */
export function FieldEditor({ field, fields, isFirst, onChange, onRemove, disabled }: FieldEditorProps) {
  const p = `fe-${field.id}`;
  const info = fieldTypeInfo[field.type];
  const above = fields.slice(0, fields.findIndex((f) => f.id === field.id)).filter((f) => !['hidden', 'payment', 'consent', 'file'].includes(f.type));
  const amountFields = above.filter((f) => f.type === 'amount' || f.type === 'number');
  const rule = field.rule;
  const setRule = (patch: Partial<FieldRule> | null) => onChange({ rule: patch === null ? null : { ...(rule ?? { fieldId: above[above.length - 1]?.id ?? '', op: 'is', value: '' }), ...patch } });
  const src = rule ? fields.find((f) => f.id === rule.fieldId) : undefined;

  return (
    <fieldset disabled={disabled} className="flex flex-col gap-6">
      <legend className="sr-only">Edit {field.label || info.label}</legend>
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-caption font-medium text-fg-subtle">
          <info.icon size={15} aria-hidden /> {info.label}
        </span>
        <Button size="sm" variant="tertiary" leadingIcon={Trash2Icon} onClick={onRemove}>
          Remove
        </Button>
      </div>

      <section className="flex flex-col gap-4">
        <TextInput id={`${p}-label`} label={field.type === 'hidden' ? 'Name in your inbox' : 'Question'} value={field.label} maxLength={120} onChange={(e) => onChange({ label: e.target.value })} error={field.label.trim() ? undefined : 'Add a label'} />
        {field.type !== 'hidden' && <TextInput id={`${p}-help`} label="Help text" optional value={field.help} maxLength={160} onChange={(e) => onChange({ help: e.target.value })} />}
        {textTypes.includes(field.type) && <TextInput id={`${p}-ph`} label="Placeholder" optional value={field.placeholder} maxLength={80} onChange={(e) => onChange({ placeholder: e.target.value })} />}
        {choiceTypes.includes(field.type) &&
        <TextArea
          id={`${p}-opts`}
          label="Options"
          hint="One per line. At least two."
          rows={4}
          value={field.options.join('\n')}
          onChange={(e) => onChange({ options: e.target.value.split('\n').slice(0, 20) })}
          error={field.options.filter((o) => o.trim()).length < 2 ? 'Add at least two options' : undefined} />

        }
        {(field.type === 'shortText' || field.type === 'longText') &&
        <TextInput id={`${p}-max`} label="Character limit" type="number" inputMode="numeric" min={10} max={5000} value={field.maxLength ?? ''} onChange={(e) => onChange({ maxLength: e.target.value ? Math.max(10, Math.min(5000, Number(e.target.value))) : null })} />
        }
        {field.type === 'hidden' &&
        <SelectInput
          id={`${p}-hs`}
          label="Capture"
          value={field.hiddenSource}
          options={[
          { value: 'source', label: 'Where the visit came from (WhatsApp, Instagram, QR…)' },
          { value: 'campaign', label: 'Campaign link name' },
          { value: 'page', label: 'Which page the form was on' }]
          }
          onChange={(v) => onChange({ hiddenSource: v })}
          hint="Visitors never see this field." />

        }
        {field.type === 'payment' &&
        <>
            <SelectInput
            id={`${p}-amt-src`}
            label="Amount"
            value={field.amountFromFieldId ?? 'fixed'}
            options={[{ value: 'fixed', label: 'A fixed amount' }, ...amountFields.map((f) => ({ value: f.id, label: `From “${f.label}”` }))]}
            onChange={(v) => onChange({ amountFromFieldId: v === 'fixed' ? null : v, amountNgn: v === 'fixed' ? field.amountNgn ?? 5000 : null })}
            hint="Test mode — no real money moves." />
          
            {!field.amountFromFieldId &&
          <TextInput id={`${p}-amt`} label="Amount (₦)" type="number" inputMode="numeric" min={100} prefix="₦" value={field.amountNgn ?? ''} onChange={(e) => onChange({ amountNgn: e.target.value ? Math.max(0, Math.round(Number(e.target.value))) : null })} error={field.amountNgn && field.amountNgn > 0 ? undefined : 'Enter an amount'} />
          }
          </>
        }
        {!['hidden', 'consent'].includes(field.type) && <Switch id={`${p}-req`} label="Required" checked={field.required} onChange={(v) => onChange({ required: v })} disabled={field.type === 'payment'} description={field.type === 'payment' ? 'Payment fields are always required.' : undefined} />}
        {field.type === 'consent' && <p className="text-caption text-fg-muted">Always optional and never ticked in advance. Only people who tick it are marked as agreeing to marketing in Audience.</p>}
      </section>

      {!isFirst &&
      <section className="flex flex-col gap-3 border-t border-line pt-5">
          <h3 className="text-label font-semibold text-fg">Steps</h3>
          <Switch id={`${p}-step`} label="Start a new step here" description="Visitors see a progress bar and a Next button." checked={field.stepBreak} onChange={(v) => onChange({ stepBreak: v })} />
          {field.stepBreak && <TextInput id={`${p}-step-title`} label="Step title" value={field.stepTitle} maxLength={40} placeholder="e.g. Delivery and deposit" onChange={(e) => onChange({ stepTitle: e.target.value })} />}
        </section>
      }

      {field.type !== 'hidden' &&
      <section className="flex flex-col gap-3 border-t border-line pt-5">
          <h3 className="text-label font-semibold text-fg">Show this question</h3>
          {above.length === 0 ?
        <p className="text-caption text-fg-subtle">Rules can only depend on a question above this one.</p> :

        <>
              <SelectInput id={`${p}-rule-on`} label="When" value={rule ? 'rule' : 'always'} options={[{ value: 'always', label: 'Always' }, { value: 'rule', label: 'Only when an earlier answer matches' }]} onChange={(v) => setRule(v === 'always' ? null : {})} />
              {rule &&
          <div className="grid gap-3 sm:grid-cols-2">
                  <SelectInput id={`${p}-rule-f`} label="Question" value={rule.fieldId} options={above.map((f) => ({ value: f.id, label: f.label || 'Untitled' }))} onChange={(v) => setRule({ fieldId: v, value: '' })} error={src ? undefined : 'Choose a question'} />
                  <SelectInput id={`${p}-rule-op`} label="Condition" value={rule.op} options={[{ value: 'is', label: 'is' }, { value: 'isNot', label: 'is not' }, { value: 'contains', label: 'contains' }, { value: 'answered', label: 'is answered' }]} onChange={(v) => setRule({ op: v })} />
                  {rule.op !== 'answered' && (
            src && choiceTypes.includes(src.type) ?
            <div className="sm:col-span-2">
                        <SelectInput id={`${p}-rule-v`} label="Answer" value={rule.value} options={[{ value: '', label: 'Choose…' }, ...src.options.filter((o) => o.trim()).map((o) => ({ value: o, label: o }))]} onChange={(v) => setRule({ value: v })} />
                      </div> :

            <div className="sm:col-span-2">
                        <TextInput id={`${p}-rule-v`} label="Answer" value={rule.value} maxLength={80} onChange={(e) => setRule({ value: e.target.value })} />
                      </div>)
            }
                </div>
          }
              {rule && <p className="text-caption text-fg-muted">{ruleSentence(field, fields)}</p>}
            </>
        }
        </section>
      }
    </fieldset>);

}