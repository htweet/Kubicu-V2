import React from 'react';
import { UsersIcon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import type { StaffHours } from '../../types/ops';
import { mix } from '../blocks/pageStyle';
import { initialsOf } from '../../utils/ops/staff';
import { useT } from '../../contexts/LocaleContext';

interface StaffPickerProps {
  theme: PageTheme;
  staff: StaffHours[];
  value: string | null;
  onChange: (id: string | null) => void;
}

/** "Who would you like?" — a person, or Anyone available (D140). */
export function StaffPicker({ theme, staff, value, onChange }: StaffPickerProps) {
  const { t } = useT();
  const chip = (active: boolean): React.CSSProperties => ({
    borderRadius: 999,
    border: `1.5px solid ${active ? theme.text : mix(theme.text, 14)}`,
    background: active ? theme.text : 'transparent',
    color: active ? theme.background : theme.text,
  });
  return (
    <div>
      <p id="staff-pick-label" className="mb-2 text-[13px] font-semibold">
        {t('Who would you like?')}
      </p>
      <div role="radiogroup" aria-labelledby="staff-pick-label" className="scroll-quiet -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <button type="button" role="radio" aria-checked={value === null} onClick={() => onChange(null)} className="flex h-10 shrink-0 items-center gap-2 whitespace-nowrap pl-2 pr-3.5 text-[13.5px] font-medium" style={chip(value === null)}>
          <span className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: mix(value === null ? theme.background : theme.text, 14) }}>
            <UsersIcon size={14} aria-hidden />
          </span>
          {t('Anyone available')}
        </button>
        {staff.map((s) => {
          const active = value === s.memberId;
          return (
            <button key={s.memberId} type="button" role="radio" aria-checked={active} onClick={() => onChange(s.memberId)} className="flex h-10 shrink-0 items-center gap-2 whitespace-nowrap pl-1.5 pr-3.5 text-[13.5px] font-medium" style={chip(active)}>
              {s.photo ? (
                <img src={s.photo} alt="" className="h-7 w-7 rounded-full object-cover" />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold" style={{ background: mix(active ? theme.background : theme.text, 14) }} aria-hidden>
                  {initialsOf(s.name)}
                </span>
              )}
              {s.name.split(' ')[0]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
