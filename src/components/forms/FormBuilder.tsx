import React, { useState } from 'react';
import { ArrowDownIcon, ArrowUpIcon, GitBranchIcon, PlusIcon, SplitSquareVerticalIcon } from 'lucide-react';
import type { FormDef, FormField, FormFieldType } from '../../types/forms';
import { fieldGroups, fieldTypeInfo, makeField } from '../../utils/forms/fields';
import { formIssues } from '../../utils/forms/logic';
import { announce } from '../../utils/announce';
import { FieldEditor } from './FieldEditor';
import { IconButton } from '../ui/IconButton';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { InlineAlert } from '../ui/InlineAlert';
import { cn } from '../../utils/cn';

interface FormBuilderProps {
  form: FormDef;
  onChange: (fields: FormField[]) => void;
  disabled: boolean;
}

/** Field list on the left, the selected field's settings on the right (D79). */
export function FormBuilder({ form, onChange, disabled }: FormBuilderProps) {
  const [selectedId, setSelectedId] = useState<string | null>(form.fields[0]?.id ?? null);
  const [adding, setAdding] = useState(false);
  const fields = form.fields;
  const selected = fields.find((f) => f.id === selectedId) ?? null;
  const issues = formIssues(form);
  const hasPayment = fields.some((f) => f.type === 'payment');

  const patch = (id: string, p: Partial<FormField>) => onChange(fields.map((f) => f.id === id ? { ...f, ...p } : f));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= fields.length) return;
    const next = [...fields];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    announce(`Moved ${fields[i].label || 'field'} ${dir < 0 ? 'up' : 'down'} — ${j + 1} of ${fields.length}`);
  };
  const add = (type: FormFieldType) => {
    const f = makeField(type);
    const at = selected ? fields.findIndex((x) => x.id === selected.id) + 1 : fields.length;
    onChange([...fields.slice(0, at), f, ...fields.slice(at)]);
    setSelectedId(f.id);
    setAdding(false);
  };
  const remove = (id: string) => {
    const i = fields.findIndex((f) => f.id === id);
    // Rules that pointed at the removed field are cleared so nothing silently hides.
    onChange(fields.filter((f) => f.id !== id).map((f) => f.rule?.fieldId === id ? { ...f, rule: null } : f.amountFromFieldId === id ? { ...f, amountFromFieldId: null, amountNgn: 5000 } : f));
    setSelectedId(fields[i + 1]?.id ?? fields[i - 1]?.id ?? null);
  };

  return (
    <div className="flex flex-col gap-5">
      {issues.length > 0 &&
      <InlineAlert tone="warning" title="Fix before setting live">
          {issues.slice(0, 3).join(' · ')}
          {issues.length > 3 ? ` · and ${issues.length - 3} more` : ''}
        </InlineAlert>
      }
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start">
        <section aria-labelledby="fields-heading" className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 id="fields-heading" className="text-label font-semibold text-fg">
              Fields <span className="font-normal text-fg-subtle">· {fields.length}</span>
            </h2>
            <Button size="sm" variant="secondary" leadingIcon={PlusIcon} disabled={disabled} onClick={() => setAdding(true)}>
              Add field
            </Button>
          </div>
          <ol className="flex flex-col overflow-hidden rounded-lg border border-line bg-raised">
            {fields.map((f, i) => {
              const info = fieldTypeInfo[f.type];
              const active = f.id === selectedId;
              return (
                <li key={f.id} className={cn(i > 0 && 'border-t border-line')}>
                  {f.stepBreak && i > 0 &&
                  <div className="flex items-center gap-2 border-b border-dashed border-line bg-sunken px-3 py-1.5 text-caption font-medium text-fg-muted">
                      <SplitSquareVerticalIcon size={13} aria-hidden /> New step{f.stepTitle ? `: ${f.stepTitle}` : ''}
                    </div>
                  }
                  <div className={cn('flex items-center gap-1 pr-1.5 transition-colors duration-150', active ? 'bg-action-soft' : 'hover:bg-sunken')}>
                    <button type="button" onClick={() => setSelectedId(f.id)} aria-current={active ? 'true' : undefined} className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus">
                      <info.icon size={16} className={active ? 'shrink-0 text-action' : 'shrink-0 text-fg-subtle'} aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-label font-medium text-fg">
                          {f.label || 'Untitled'}
                          {f.required && <span className="text-fg-subtle"> *</span>}
                        </span>
                        <span className="flex items-center gap-1.5 truncate text-caption text-fg-subtle">
                          {info.label}
                          {f.rule &&
                          <>
                              <span aria-hidden>·</span>
                              <GitBranchIcon size={12} aria-hidden /> Has a rule
                            </>
                          }
                        </span>
                      </span>
                    </button>
                    <IconButton icon={ArrowUpIcon} size="sm" label={`Move ${f.label || 'field'} up`} disabled={disabled || i === 0} onClick={() => move(i, -1)} />
                    <IconButton icon={ArrowDownIcon} size="sm" label={`Move ${f.label || 'field'} down`} disabled={disabled || i === fields.length - 1} onClick={() => move(i, 1)} />
                  </div>
                </li>);

            })}
            {fields.length === 0 && <li className="px-4 py-8 text-center text-caption text-fg-muted">No fields yet. Add one to start.</li>}
          </ol>
        </section>

        <section aria-label="Field settings" className="rounded-lg border border-line bg-raised p-5 lg:sticky lg:top-6">
          {selected ?
          <FieldEditor key={selected.id} field={selected} fields={fields} isFirst={fields[0]?.id === selected.id} onChange={(p) => patch(selected.id, p)} onRemove={() => remove(selected.id)} disabled={disabled} /> :

          <p className="py-10 text-center text-caption text-fg-muted">Select a field to edit it.</p>
          }
        </section>
      </div>

      <Dialog open={adding} onClose={() => setAdding(false)} title="Add a field" description={selected ? `Added below “${selected.label || 'the selected field'}”.` : undefined} size="lg">
        <div className="flex flex-col gap-5">
          {fieldGroups.map((g) =>
          <div key={g}>
              <h3 className="mb-2 text-caption font-semibold text-fg-subtle">{g}</h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {(Object.keys(fieldTypeInfo) as FormFieldType[]).
              filter((t) => fieldTypeInfo[t].group === g).
              map((t) => {
                const Icon = fieldTypeInfo[t].icon;
                const blocked = t === 'payment' && hasPayment;
                return (
                  <button key={t} type="button" disabled={blocked} title={blocked ? 'One payment field per form' : undefined} onClick={() => add(t)} className="flex items-center gap-2.5 rounded-md border border-line px-3 py-2.5 text-left text-label text-fg transition-colors duration-150 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50">
                        <Icon size={16} className="shrink-0 text-fg-muted" aria-hidden />
                        <span className="truncate">{fieldTypeInfo[t].label}</span>
                      </button>);

              })}
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </div>);

}