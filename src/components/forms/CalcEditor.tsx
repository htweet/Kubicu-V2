import React from 'react';
import type { FormField } from '../../types/forms';
import { fieldTypeInfo, numericTypes } from '../../utils/forms/fields';
import { TextInput } from '../ui/TextInput';
import { SelectInput } from '../ui/SelectInput';

interface CalcEditorProps {
  field: FormField;
  /** Fields above this one. */
  earlier: FormField[];
  onChange: (patch: Partial<FormField>) => void;
}

/** Settings for a Calculated total (D194): which earlier answers to add, a multiplier and a unit. */
export function CalcEditor({ field, earlier, onChange }: CalcEditorProps) {
  const calc = field.calc ?? { fieldIds: [], multiplier: 1, unit: 'ngn' as const };
  const sources = earlier.filter((f) => numericTypes.includes(f.type));
  const toggle = (id: string) => onChange({ calc: { ...calc, fieldIds: calc.fieldIds.includes(id) ? calc.fieldIds.filter((x) => x !== id) : [...calc.fieldIds, id] } });
  const picked = sources.filter((s) => calc.fieldIds.includes(s.id));

  return (
    <div className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-label font-medium text-fg">Add up</legend>
        {sources.length === 0 ?
        <p className="rounded-lg border border-dashed border-line px-4 py-5 text-center text-caption text-fg-muted">Add a Number, ₦ amount, Product picker, Scale or Rating field above this one first.</p> :

        <ul className="flex flex-col divide-y divide-line rounded-lg border border-line">
            {sources.map((s) =>
          <li key={s.id}>
                <label className="flex min-h-[44px] cursor-pointer items-center gap-3 px-3 py-2 hover:bg-sunken">
                  <input type="checkbox" checked={calc.fieldIds.includes(s.id)} onChange={() => toggle(s.id)} className="h-4 w-4 shrink-0 accent-[rgb(var(--action))]" />
                  <span className="min-w-0 flex-1 truncate text-label text-fg">{s.label || 'Untitled'}</span>
                  <span className="shrink-0 text-caption text-fg-subtle">{fieldTypeInfo[s.type].label}</span>
                </label>
              </li>
          )}
          </ul>
        }
      </fieldset>
      <div className="grid gap-3 sm:grid-cols-2">
        <TextInput
          id={`calc-mul-${field.id}`}
          label="Then multiply by"
          type="number"
          inputMode="decimal"
          step="any"
          min={0}
          value={calc.multiplier}
          hint="e.g. 0.5 for a 50% deposit"
          onChange={(e) => onChange({ calc: { ...calc, multiplier: Math.max(0, Number(e.target.value) || 0) } })} />
        
        <SelectInput id={`calc-unit-${field.id}`} label="Show as" value={calc.unit} options={[{ value: 'ngn', label: 'Naira (₦)' }, { value: 'number', label: 'A plain number' }]} onChange={(v) => onChange({ calc: { ...calc, unit: v } })} />
      </div>
      <p className="text-caption text-fg-muted">
        {picked.length ? `${picked.map((s) => s.label || 'Untitled').join(' + ')}${calc.multiplier !== 1 ? ` × ${calc.multiplier}` : ''}. ` : ''}
        Visitors see the result update as they answer; they can’t type in it. A Payment field can charge this total.
      </p>
    </div>);

}