import React, { useState } from 'react';
import type { EscrowActor, EscrowEvent } from '../../types/escrow';
import { formatTimestamp } from '../../utils/format';
import { cn } from '../../utils/cn';

const actorLabels: Record<EscrowActor, string> = { buyer: 'Buyer', seller: 'Seller', staff: 'KUBICU', system: 'Automatic' };

/** The case history, newest first. Shows the latest four until expanded. */
export function EscrowTimeline({ events, id }: { events: EscrowEvent[]; id: string }) {
  const [all, setAll] = useState(false);
  const shown = all ? events : events.slice(0, 4);
  return (
    <div>
      <ol className="relative flex flex-col gap-3 pl-5" aria-label="Escrow history">
        <span aria-hidden className="absolute bottom-1 left-[5px] top-1 w-px bg-line" />
        {shown.map((e) => (
          <li key={e.id} className="relative">
            <span aria-hidden className={cn('absolute -left-5 top-1.5 h-[11px] w-[11px] rounded-full border-2 bg-raised', e.by === 'buyer' ? 'border-warning' : e.by === 'staff' ? 'border-danger' : 'border-action')} />
            <p className="text-label text-fg">{e.label}</p>
            <p className="text-caption text-fg-subtle">
              {actorLabels[e.by]} · {formatTimestamp(e.at)}
            </p>
          </li>
        ))}
      </ol>
      {events.length > 4 && (
        <button type="button" aria-controls={id} onClick={() => setAll(!all)} className="mt-2 text-label font-semibold text-action hover:underline">
          {all ? 'Show less' : `Show all ${events.length}`}
        </button>
      )}
    </div>
  );
}
