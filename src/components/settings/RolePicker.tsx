import React from 'react';
import type { Role } from '../../types/team';
import { roleInfo } from '../../data/permissions';
import { cn } from '../../utils/cn';
import { useT } from '../../contexts/LocaleContext';

const assignable: Role[] = ['admin', 'editor', 'sales', 'viewer'];

/** Pick a role, each with its plain-language summary. The Owner role is only given by transfer. */
export function RolePicker({ value, onChange }: {value: Role;onChange: (r: Role) => void;}) {
  const { t } = useT();
  return (
    <fieldset>
      <legend className="mb-2 text-label font-medium text-fg">{t('Role')}</legend>
      <div className="grid gap-2 sm:grid-cols-2" role="radiogroup">
        {assignable.map((r) =>
        <label
          key={r}
          className={cn(
            'flex cursor-pointer flex-col gap-0.5 rounded-md border p-3 transition-colors duration-150 focus-within:ring-2 focus-within:ring-focus',
            value === r ? 'border-select bg-action-soft' : 'border-line hover:bg-sunken'
          )}>
          
            <input type="radio" name="role" className="sr-only" checked={value === r} onChange={() => onChange(r)} />
            <span className="text-label font-semibold text-fg">{t(roleInfo[r].label)}</span>
            <span className="text-caption text-fg-muted">{t(roleInfo[r].summary)}</span>
          </label>
        )}
      </div>
    </fieldset>);

}