import React, { useMemo } from 'react';
import type { CommerceData, CommerceEvent } from '../../types/commerce';
import type { TicketRef, TicketStatus } from '../../utils/commerce/tickets';
import { isTable, seatsOfRow, soldSeats, takenSeats, type Seat } from '../../utils/commerce/seating';
import { cn } from '../../utils/cn';

interface Props {
  data: CommerceData;
  event: CommerceEvent;
  /** Tickets with their live status, keyed by seat id. */
  bySeat: Map<string, TicketRef & { status: TicketStatus }>;
  onOpen: (ticketId: string) => void;
}

type SeatState = 'in' | 'sold' | 'held' | 'free';

const swatch: Record<SeatState, string> = {
  in: 'bg-success border-success text-white',
  sold: 'bg-action border-action text-white',
  held: 'bg-warning-soft border-warning text-warning',
  free: 'bg-raised border-line text-fg-subtle',
};
const words: Record<SeatState, string> = { in: 'Checked in', sold: 'Sold, not in yet', held: 'Held in a checkout', free: 'Free' };

/** Owner's read-only seat map (D113a): who sits where, and who has arrived. Sold seats open the ticket. */
export function SeatMapOverview({ data, event: ev, bySeat, onOpen }: Props) {
  const map = ev.seating;
  const sold = useMemo(() => soldSeats(data, ev.id), [data, ev.id]);
  const taken = useMemo(() => takenSeats(data, ev.id), [data, ev.id]);
  if (!map) return null;

  const stateOf = (s: Seat): SeatState => {
    const t = bySeat.get(s.id);
    if (t?.status === 'checked_in') return 'in';
    if (sold.has(s.id)) return 'sold';
    if (taken.has(s.id)) return 'held';
    return 'free';
  };
  const typeName = (id: string) => ev.ticketTypes.find((t) => t.id === id)?.name ?? '';
  const counts = map.rows.flatMap((r) => seatsOfRow(map, r)).reduce<Record<SeatState, number>>((acc, s) => ({ ...acc, [stateOf(s)]: acc[stateOf(s)] + 1 }), { in: 0, sold: 0, held: 0, free: 0 });

  const seatEl = (s: Seat) => {
    const st = stateOf(s);
    const t = bySeat.get(s.id);
    const label = `${s.label} — ${words[st]}${t ? `, ${t.ticket.guestName}` : ''}`;
    const cls = cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-[10.5px] font-semibold tabular-nums', swatch[st]);
    return t ? (
      <button key={s.id} type="button" title={label} aria-label={label} onClick={() => onOpen(t.ticket.id)} className={cn(cls, 'transition-transform duration-100 ease-out hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1')}>
        {s.n}
      </button>
    ) : (
      <span key={s.id} title={label} aria-label={label} role="img" className={cls}>
        {s.n}
      </span>
    );
  };

  return (
    <section aria-labelledby="seatmap-h" className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="seatmap-h" className="text-label font-semibold text-fg">
            Seat map
          </h2>
          <p className="text-caption text-fg-muted">Tap a sold seat to see its ticket. Updates as guests check in.</p>
        </div>
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-caption text-fg-muted" aria-label="Key">
          {(Object.keys(words) as SeatState[]).map((k) => (
            <li key={k} className="flex items-center gap-1.5">
              <span aria-hidden className={cn('h-3.5 w-3.5 rounded border', swatch[k])} />
              {words[k]} · <span className="font-semibold text-fg tabular-nums">{counts[k]}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border border-line bg-raised p-4 sm:p-5">
        {map.layout !== 'banquet' && (
          <div className="mx-auto mb-4 flex h-8 w-2/3 max-w-md items-center justify-center rounded-md bg-action-soft text-caption font-semibold text-action">Stage</div>
        )}
        {isTable(map) ? (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {map.rows.map((r) => {
              const seats = seatsOfRow(map, r);
              const filled = seats.filter((s) => stateOf(s) === 'sold' || stateOf(s) === 'in').length;
              return (
                <li key={r.id} className="flex flex-col gap-2.5 rounded-md border border-line p-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-label font-semibold text-fg">{r.label}</span>
                    <span className="text-caption text-fg-muted">
                      {typeName(r.ticketTypeId)} · {filled}/{seats.length}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">{seats.map(seatEl)}</div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="kb-scroll overflow-x-auto">
            <ol className="mx-auto flex w-max flex-col gap-1.5">
              {map.rows.map((r) => (
                <li key={r.id} className="flex items-center gap-1.5">
                  <span className="w-7 shrink-0 text-right text-caption font-semibold text-fg-muted">{r.label}</span>
                  {seatsOfRow(map, r).map(seatEl)}
                  <span className="ml-2 shrink-0 text-meta text-fg-subtle">{typeName(r.ticketTypeId)}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}
