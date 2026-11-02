import React from 'react';
import { useCommerce } from '../../contexts/CommerceContext';
import { useT } from '../../contexts/LocaleContext';
import { MAIN_BRANCH, branchesOf } from '../../utils/commerce/branches';
import { SelectInput } from '../ui/SelectInput';

const ALL = '__all';

/**
 * Which shop location a teammate works at (D474). Shown only when the workspace has branches.
 * One location limits their Orders and Branches screens to it — the usual set-up for a franchise partner.
 */
export function BranchAccessField({ id, value, onChange }: {id: string;value: string | null;onChange: (branchId: string | null) => void;}) {
  const { t: tr } = useT();
  const { data } = useCommerce();
  const branches = branchesOf(data);
  if (branches.length === 0) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <SelectInput<string>
        id={id}
        label={tr('Location')}
        value={value ?? ALL}
        onChange={(v) => onChange(v === ALL ? null : v)}
        options={[
        { value: ALL, label: tr('Every location') },
        { value: MAIN_BRANCH, label: tr('Main shop') },
        ...branches.map((b) => ({ value: b.id, label: b.kind === 'franchise' ? `${b.name} · ${tr('Franchise')}` : b.name }))]
        } />
      
      <p className="text-caption text-fg-subtle">{tr('With one location, they only see that location’s orders, stock and sales — right for a franchise partner or branch manager.')}</p>
    </div>);

}