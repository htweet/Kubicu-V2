import React from 'react';
import { usePresence } from '../../contexts/PresenceContext';
import { initials } from '../../utils/team';

/** Who else is “here” — simulated, and labelled so (D60). */
export function PresenceAvatars() {
  const others = usePresence();
  if (others.length === 0) return null;
  const names = others.map((o) => o.member.name.split(' ')[0]).join(' and ');
  return (
    <div className="flex items-center" title={`${names} ${others.length === 1 ? 'is' : 'are'} also here (simulated)`} aria-label={`${names} also editing (simulated)`}>
      {others.map((o, i) =>
      <span
        key={o.member.id}
        aria-hidden
        className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold text-white ring-2 ring-raised"
        style={{ background: o.colour, marginLeft: i ? -6 : 0 }}>
        
          {initials(o.member.name)}
        </span>
      )}
    </div>);

}