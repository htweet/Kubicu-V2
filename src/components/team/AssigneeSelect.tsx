import React from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { useTeam } from '../../contexts/TeamContext';
import { roleInfo } from '../../data/permissions';
import { fieldControlClass } from '../ui/Field';
import { cn } from '../../utils/cn';

interface AssigneeSelectProps {
  id: string;
  value: string | null | undefined;
  onChange: (memberId: string | null) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

/** “Assigned to” — anyone on the team, or nobody (D60). */
export function AssigneeSelect({ id, value, onChange, label = 'Assigned to', disabled, className }: AssigneeSelectProps) {
  const team = useTeam();
  const members = team.data.members;
  const known = !value || members.some((m) => m.id === value);
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-label font-medium text-fg">
        {label}
      </label>
      <div className="relative">
        <select id={id} value={value ?? ''} disabled={disabled} onChange={(e) => onChange(e.target.value || null)} className={cn(fieldControlClass, 'h-10 appearance-none pr-9')}>
          <option value="">Unassigned</option>
          {members.map((m) =>
          <option key={m.id} value={m.id}>
              {m.name}
              {m.id === team.me.id ? ' (you)' : ''} · {roleInfo[m.role].label}
            </option>
          )}
          {!known && <option value={value as string}>Former member</option>}
        </select>
        <ChevronDownIcon size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-fg-subtle" aria-hidden />
      </div>
    </div>);

}

/** Small avatar + first name for lists. */
export function AssigneeChip({ memberId }: {memberId: string | null | undefined;}) {
  const team = useTeam();
  if (!memberId) return <span className="text-caption text-fg-subtle">—</span>;
  const m = team.data.members.find((x) => x.id === memberId);
  const name = m?.name ?? 'Former member';
  const initials = name.
  split(/\s+/).
  slice(0, 2).
  map((p) => p[0]).
  join('').
  toUpperCase();
  return (
    <span className="inline-flex items-center gap-1.5 text-caption text-fg-muted" title={name}>
      <span aria-hidden className="flex h-6 w-6 items-center justify-center rounded-full bg-action-soft text-[10px] font-semibold text-action">
        {initials}
      </span>
      <span className="truncate">{memberId === team.me.id ? 'You' : name.split(' ')[0]}</span>
    </span>);

}

/** “All / Mine” toggle used above lists. */
export function MineToggle({ mine, onChange, count }: {mine: boolean;onChange: (v: boolean) => void;count: number;}) {
  return (
    <button
      type="button"
      aria-pressed={mine}
      onClick={() => onChange(!mine)}
      className={cn(
        'inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-label font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
        mine ? 'border-transparent bg-action text-action-fg' : 'border-line text-fg-muted hover:text-fg'
      )}>
      
      Mine
      <span className={cn('tabular-nums', mine ? 'opacity-80' : 'text-fg-subtle')}>{count}</span>
    </button>);

}