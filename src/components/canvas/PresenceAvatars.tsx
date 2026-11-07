import React from 'react';
import { usePresence } from '../../contexts/PresenceContext';
import { initials } from '../../utils/team';

/** Who else is here (D143): live tabs on this device first, then simulated teammates — each labelled. */
export function PresenceAvatars() {
  const others = usePresence();
  if (others.length === 0) return null;
  const describe = others.map((o) => `${o.name.split(' (')[0].split(' ')[0]}${o.live ? (o.name.includes('another tab') ? ' (another tab, live)' : ' (live)') : ' (simulated)'}`);
  const label = `Also editing: ${describe.join(', ')}`;
  return (
    <div className="flex items-center" title={label} aria-label={label} role="img">
      {others.map((o, i) => (
        <span
          key={o.id}
          aria-hidden
          className="relative flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold text-white ring-2 ring-raised"
          style={{ background: o.colour, marginLeft: i ? -6 : 0, opacity: o.live ? 1 : 0.75 }}
        >
          {initials(o.name.split(' (')[0])}
          {o.live && <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-raised" />}
        </span>
      ))}
    </div>
  );
}
