import React from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { workspaceSpaces } from '../../utils/spaces';
import { Segmented } from '../ui/Segmented';
import { useT } from '../../contexts/LocaleContext';

/** Every space, or chosen ones (D57). Owners and Admins always have every space. */
export function SpaceAccessField({ value, onChange }: { value: string[] | null; onChange: (v: string[] | null) => void }) {
  const { t } = useT();
  const { current } = useWorkspace();
  const spaces = workspaceSpaces(current).filter((s) => !s.archivedAt);
  const mode = value === null ? 'all' : 'some';

  return (
    <fieldset className="flex flex-col gap-2.5">
      <legend className="mb-2 text-label font-medium text-fg">{t('Spaces they can edit')}</legend>
      <Segmented<'all' | 'some'>
        ariaLabel="Spaces they can edit"
        fullWidth
        value={mode}
        onChange={(m) => onChange(m === 'all' ? null : value ?? ['main'])}
        options={[
          { value: 'all', label: 'Every space' },
          { value: 'some', label: 'Chosen spaces' },
        ]}
      />
      {mode === 'some' && (
        <ul className="flex flex-col rounded-md border border-line">
          {spaces.map((s) => {
            const on = (value ?? []).includes(s.id);
            return (
              <li key={s.id} className="border-b border-line last:border-0">
                <label className="flex min-h-[44px] cursor-pointer items-center gap-3 px-3 text-label text-fg hover:bg-sunken">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={on}
                    onChange={() => onChange(on ? (value ?? []).filter((x) => x !== s.id) : [...(value ?? []), s.id])}
                  />
                  {s.name}
                </label>
              </li>
            );
          })}
        </ul>
      )}
      {mode === 'some' && (value ?? []).length === 0 && <p className="text-caption text-warning">{t('They’ll be able to see the workspace but not edit any space.')}</p>}
    </fieldset>
  );
}
