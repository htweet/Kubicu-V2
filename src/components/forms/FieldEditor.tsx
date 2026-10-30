import React from 'react';
import { Trash2Icon } from 'lucide-react';
import type { FieldRule, FormField } from '../../types/forms';
import { Link } from 'react-router-dom';
import { choiceTypes, fieldTypeInfo, listOptionTypes } from '../../utils/forms/fields';
import { useOptionalOps } from '../../contexts/OpsContext';
import { CalcEditor } from './CalcEditor';
import { ruleSentence } from '../../utils/forms/logic';
import { TextInput } from '../ui/TextInput';
import { currencySymbol } from '../../utils/currency';
import { TextArea } from '../ui/TextArea';
import { SelectInput } from '../ui/SelectInput';
import { Switch } from '../ui/Switch';
import { Button } from '../ui/Button';
import { ImageChoiceOptionsEditor } from './ImageChoiceOptionsEditor';
import { ProductPickEditor } from './ProductPickEditor';
import { useT } from '../../contexts/LocaleContext';

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
  const { t: tr } = useT();
  const p = `fe-${field.id}`;
  const info = fieldTypeInfo[field.type];
  const earlier = fields.slice(0, fields.findIndex((f) => f.id === field.id));
  const above = earlier.filter((f) => !['hidden', 'payment', 'consent', 'file', 'signature', 'products', 'section', 'bank', 'calculated', 'bookingSlot'].includes(f.type));
  const amountFields = earlier.filter((f) => f.type === 'amount' || f.type === 'number' || f.type === 'products' || f.type === 'calculated');
  const services = useOptionalOps()?.data.services.filter((s) => s.active) ?? [];
  const isSection = field.type === 'section';
  const scale = field.scale ?? { min: 0 as const, max: 10 as const, minLabel: '', maxLabel: '' };
  const rule = field.rule;
  const setRule = (patch: Partial<FieldRule> | null) => onChange({ rule: patch === null ? null : { ...(rule ?? { fieldId: above[above.length - 1]?.id ?? '', op: 'is', value: '' }), ...patch } });
  const src = rule ? fields.find((f) => f.id === rule.fieldId) : undefined;

  return (
    <fieldset disabled={disabled} className="flex flex-col gap-6">
      <legend className="sr-only">{tr('Edit {name}', { name: field.label || tr(info.label) })}</legend>
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-caption font-medium text-fg-subtle">
          <info.icon size={15} aria-hidden /> {tr(info.label)}
        </span>
        <Button size="sm" variant="tertiary" leadingIcon={Trash2Icon} onClick={onRemove}>
          Remove
        </Button>
      </div>

      <section className="flex flex-col gap-4">
        <TextInput id={`${p}-label`} label={field.type === 'hidden' ? 'Name in your inbox' : isSection ? 'Heading' : 'Question'} value={field.label} maxLength={120} onChange={(e) => onChange({ label: e.target.value })} error={field.label.trim() ? undefined : 'Add a label'} />
        {isSection ?
        <TextArea id={`${p}-help`} label="Text" hint="Optional. A short paragraph under the heading." rows={3} value={field.help} maxLength={400} onChange={(e) => onChange({ help: e.target.value })} /> :

        field.type !== 'hidden' && <TextInput id={`${p}-help`} label="Help text" optional value={field.help} maxLength={160} onChange={(e) => onChange({ help: e.target.value })} />
        }
        {field.type === 'calculated' && <CalcEditor field={field} earlier={earlier} onChange={onChange} />}
        {field.type === 'bookingSlot' && (
        services.length ?
        <SelectInput
          id={`${p}-svc`}
          label="Service"
          value={field.serviceId ?? ''}
          options={[{ value: '', label: 'Choose a service…' }, ...services.map((s) => ({ value: s.id, label: s.name }))]}
          onChange={(v) => onChange({ serviceId: v || undefined })}
          error={field.serviceId ? undefined : 'Choose which service’s free times to show'}
          hint="Shows free times from Bookings. Picking one records a preference — it doesn’t book or hold the time." /> :


        <p className="rounded-lg border border-dashed border-line px-4 py-5 text-center text-caption text-fg-muted">
              {tr('No active services yet.')}{' '}
              <Link to="/app/bookings" className="font-medium text-fg underline underline-offset-2">
                {tr('Add one in Bookings')}
              </Link>
              .
            </p>)
        }
        {field.type === 'bank' && <p className="text-caption text-fg-muted">{tr('For refunds or payouts. Account numbers must have 10 digits; names aren’t checked with the bank in this prototype. In your inbox the number is hidden except the last 4 digits until you choose Show number. Never ask for PINs, passwords or card numbers.')}</p>}
        {field.type === 'grid' &&
        <TextArea
          id={`${p}-cols`}
          label="Answer choices"
          hint="One per line, e.g. Poor, OK, Good, Great. Up to 6."
          rows={4}
          value={(field.gridColumns ?? []).join('\n')}
          onChange={(e) => onChange({ gridColumns: e.target.value.split('\n').map((x) => x.replace(/=/g, '')).slice(0, 6) })}
          error={(field.gridColumns ?? []).filter((o) => o.trim()).length < 2 ? 'Add at least two choices' : undefined} />

        }
        {(textTypes.includes(field.type) || field.type === 'website') && <TextInput id={`${p}-ph`} label="Placeholder" optional value={field.placeholder} maxLength={80} onChange={(e) => onChange({ placeholder: e.target.value })} />}
        {field.type === 'imageChoice' && <ImageChoiceOptionsEditor field={field} onChange={onChange} />}
        {field.type === 'products' && <ProductPickEditor field={field} onChange={onChange} />}
        {field.type === 'scale' &&
        <div className="grid gap-3 sm:grid-cols-2">
            <SelectInput id={`${p}-smin`} label="Starts at" value={String(scale.min) as '0' | '1'} options={[{ value: '0', label: '0' }, { value: '1', label: '1' }]} onChange={(v) => onChange({ scale: { ...scale, min: v === '1' ? 1 : 0 } })} />
            <SelectInput id={`${p}-smax`} label="Ends at" value={String(scale.max) as '5' | '10'} options={[{ value: '5', label: '5' }, { value: '10', label: '10' }]} onChange={(v) => onChange({ scale: { ...scale, max: v === '5' ? 5 : 10 } })} />
            <TextInput id={`${p}-slo`} label={tr('Word for {n}', { n: scale.min })} value={scale.minLabel} maxLength={24} placeholder="e.g. Not likely" onChange={(e) => onChange({ scale: { ...scale, minLabel: e.target.value } })} error={scale.minLabel.trim() ? undefined : 'Add a word'} />
            <TextInput id={`${p}-shi`} label={tr('Word for {n}', { n: scale.max })} value={scale.maxLabel} maxLength={24} placeholder="e.g. Very likely" onChange={(e) => onChange({ scale: { ...scale, maxLabel: e.target.value } })} error={scale.maxLabel.trim() ? undefined : 'Add a word'} />
          </div>
        }
        {field.type === 'signature' && <p className="text-caption text-fg-muted">{tr('Visitors can draw or type their name — typing is always offered, so nobody has to draw. Drawn signatures are saved as a picture with the response. This records agreement on the form; it isn’t a certified e-signature.')}</p>}
        {listOptionTypes.includes(field.type) &&
        <TextArea
          id={`${p}-opts`}
          label={field.type === 'grid' ? 'Rows' : field.type === 'ranking' ? 'Items to rank' : 'Options'}
          hint={field.type === 'ranking' ? 'One per line, in the order visitors first see them. Up to 10.' : 'One per line. At least two.'}
          rows={4}
          value={field.options.join('\n')}
          onChange={(e) => onChange({ options: e.target.value.split('\n').map((x) => field.type === 'grid' ? x.replace(/=/g, '') : x).slice(0, field.type === 'ranking' ? 10 : 20) })}
          error={field.options.filter((o) => o.trim()).length < 2 ? 'Add at least two' : undefined} />

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
            options={[{ value: 'fixed', label: 'A fixed amount' }, ...amountFields.map((f) => ({ value: f.id, label: tr(f.type === 'products' || f.type === 'calculated' ? 'Total of “{name}”' : 'From “{name}”', { name: f.label }) }))]}
            onChange={(v) => onChange({ amountFromFieldId: v === 'fixed' ? null : v, amountNgn: v === 'fixed' ? field.amountNgn ?? 5000 : null })}
            hint="Test mode — no real money moves." />
          
            {!field.amountFromFieldId &&
          <TextInput id={`${p}-amt`} label="Amount" type="number" inputMode="numeric" min={100} prefix={currencySymbol()} value={field.amountNgn ?? ''} onChange={(e) => onChange({ amountNgn: e.target.value ? Math.max(0, Math.round(Number(e.target.value))) : null })} error={field.amountNgn && field.amountNgn > 0 ? undefined : 'Enter an amount'} />
          }
          </>
        }
        {!['hidden', 'consent', 'section', 'calculated'].includes(field.type) && <Switch id={`${p}-req`} label="Required" checked={field.required} onChange={(v) => onChange({ required: v })} disabled={field.type === 'payment'} description={field.type === 'payment' ? 'Payment fields are always required.' : undefined} />}
        {field.type === 'consent' && <p className="text-caption text-fg-muted">{tr('Always optional and never ticked in advance. Only people who tick it are marked as agreeing to marketing in Audience.')}</p>}
      </section>

      {!isFirst &&
      <section className="flex flex-col gap-3 border-t border-line pt-5">
          <h3 className="text-label font-semibold text-fg">{tr('Steps')}</h3>
          <Switch id={`${p}-step`} label="Start a new step here" description="Visitors see a progress bar and a Next button." checked={field.stepBreak} onChange={(v) => onChange({ stepBreak: v })} />
          {field.stepBreak && <TextInput id={`${p}-step-title`} label="Step title" value={field.stepTitle} maxLength={40} placeholder="e.g. Delivery and deposit" onChange={(e) => onChange({ stepTitle: e.target.value })} />}
        </section>
      }

      {field.type !== 'hidden' &&
      <section className="flex flex-col gap-3 border-t border-line pt-5">
          <h3 className="text-label font-semibold text-fg">{tr('Show this question')}</h3>
          {above.length === 0 ?
        <p className="text-caption text-fg-subtle">{tr('Rules can only depend on a question above this one.')}</p> :

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
              {rule && <p className="text-caption text-fg-muted">{ruleSentence(field, fields, tr)}</p>}
            </>
        }
        </section>
      }
    </fieldset>);

}