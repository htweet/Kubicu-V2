import type { CommerceData, CommerceEvent, RepeatEvery, SeatRow, SeatingLayout, SeatingMap, TicketType } from '../../types/commerce';
import { uid } from '../id';
import type { FormatTr } from '../localeFormat';

/** Seating maps and repeating events (D113). Example limits. */
export const MAX_SEAT_ROWS = 30;
export const MAX_SEATS_PER_ROW = 40;
export const MAX_SERIES_DATES = 12;
export const MAX_SEATS_PER_PICK = 10;

export interface Seat {
  id: string;
  rowId: string;
  n: number;
  label: string;
  ticketTypeId: string;
}

export const layoutLabels: Record<SeatingLayout, string> = {
  theatre: 'Theatre rows',
  banquet: 'Banquet tables',
  stage: 'Stage + standing'
};

export const layoutHints: Record<SeatingLayout, string> = {
  theatre: 'Numbered rows facing the stage — church halls, cinemas, recitals.',
  banquet: 'Round tables of 6–10 — weddings, dinners, award nights. Guests can book a whole table.',
  stage: 'Seated rows near the stage, plus a standing ticket with no seat — concerts, comedy shows.'
};

const rowLetter = (i: number) => i < 26 ? String.fromCharCode(65 + i) : `${String.fromCharCode(65 + Math.floor(i / 26) - 1)}${String.fromCharCode(65 + i % 26)}`;

export const isTable = (map: SeatingMap | undefined) => map?.layout === 'banquet';

/** Starting layout for each kind. Seated types are the first one or two ticket types. */
export function seatingTemplate(layout: SeatingLayout, types: TicketType[]): SeatingMap {
  const first = types[0]?.id ?? '';
  const second = types[1]?.id ?? first;
  if (layout === 'banquet') {
    return { layout, rows: Array.from({ length: 8 }, (_, i) => ({ id: uid('row'), label: `Table ${i + 1}`, seats: 8, ticketTypeId: i < 2 ? second : first })) };
  }
  if (layout === 'stage') {
    return { layout, rows: Array.from({ length: 4 }, (_, i) => ({ id: uid('row'), label: rowLetter(i), seats: 12, ticketTypeId: first })) };
  }
  return { layout, rows: Array.from({ length: 6 }, (_, i) => ({ id: uid('row'), label: rowLetter(i), seats: 14, ticketTypeId: i < 2 ? second : first })) };
}

export function nextRowLabel(map: SeatingMap): string {
  return isTable(map) ? `Table ${map.rows.length + 1}` : rowLetter(map.rows.length);
}

export function blankRow(map: SeatingMap, ticketTypeId: string): SeatRow {
  return { id: uid('row'), label: nextRowLabel(map), seats: isTable(map) ? 8 : 12, ticketTypeId };
}

export function seatLabel(map: SeatingMap, row: SeatRow, n: number): string {
  return isTable(map) ? `${row.label}, seat ${n}` : `Row ${row.label}, seat ${n}`;
}

export function seatsOfRow(map: SeatingMap, row: SeatRow): Seat[] {
  return Array.from({ length: Math.max(0, row.seats) }, (_, i) => ({ id: `${row.id}:${i + 1}`, rowId: row.id, n: i + 1, label: seatLabel(map, row, i + 1), ticketTypeId: row.ticketTypeId }));
}

export function allSeats(ev: CommerceEvent): Seat[] {
  const map = ev.seating;
  return map ? map.rows.flatMap((r) => seatsOfRow(map, r)) : [];
}

export function findSeat(ev: CommerceEvent, seatId: string): Seat | undefined {
  return allSeats(ev).find((s) => s.id === seatId);
}

/** Ticket types that sell exact seats. Types with no rows (e.g. Standing) stay quantity-based. */
export function seatedTypeIds(ev: CommerceEvent): Set<string> {
  return new Set(ev.seating?.rows.map((r) => r.ticketTypeId) ?? []);
}

export const isSeatedType = (ev: CommerceEvent, ticketTypeId: string) => seatedTypeIds(ev).has(ticketTypeId);

export function seatCountOfType(ev: CommerceEvent, ticketTypeId: string): number {
  return ev.seating?.rows.filter((r) => r.ticketTypeId === ticketTypeId).reduce((s, r) => s + Math.max(0, r.seats), 0) ?? 0;
}

/** Seated types' quantities always equal their seats on the map. */
export function syncSeatQuantities(ev: CommerceEvent): CommerceEvent {
  if (!ev.seating) return ev;
  const seated = seatedTypeIds(ev);
  return { ...ev, ticketTypes: ev.ticketTypes.map((t) => seated.has(t.id) ? { ...t, quantity: seatCountOfType(ev, t.id) } : t) };
}

/** Seats sold (valid tickets) for this event. */
export function soldSeats(data: CommerceData | null | undefined, eventId: string): Set<string> {
  const out = new Set<string>();
  data?.orders.forEach((o) => o.tickets?.forEach((t) => t.eventId === eventId && t.status === 'valid' && t.seatId && out.add(t.seatId)));
  return out;
}

/** Seats sold or held by someone else mid-checkout. */
export function takenSeats(data: CommerceData | null | undefined, eventId: string, now = Date.now(), except?: string): Set<string> {
  const out = soldSeats(data, eventId);
  (data?.ticketHolds ?? []).forEach((h) => {
    if (h.eventId === eventId && h.holder !== except && Date.parse(h.expiresAt) > now) h.seats?.forEach((s) => out.add(s));
  });
  return out;
}

/** Why these seats can't be bought, or ''. */
export function seatsIssue(data: CommerceData | null | undefined, ev: CommerceEvent, ticketTypeId: string, seats: string[] | undefined, qty: number, now = Date.now(), holder?: string): string {
  if (!isSeatedType(ev, ticketTypeId)) return '';
  const tt = ev.ticketTypes.find((t) => t.id === ticketTypeId);
  if (!seats?.length || seats.length !== qty) return `Choose your seats for ${tt?.name ?? 'these tickets'}`;
  const taken = takenSeats(data, ev.id, now, holder);
  for (const id of seats) {
    const seat = findSeat(ev, id);
    if (!seat || seat.ticketTypeId !== ticketTypeId) return 'One of your seats was changed by the organiser — please choose again';
    if (taken.has(id)) return `${seat.label} was just taken — please choose another seat`;
  }
  return '';
}

/**
 * Readable list, e.g. "Row B, seats 4, 5" or "Table 3, seats 1–8". Pass the visitor's translator on buyer
 * screens (D511) to get "Row B · Seats: 4, 5" in their language; without one the English wording is unchanged.
 */
export function describeSeats(ev: CommerceEvent | undefined, ids: string[] | undefined, tr?: FormatTr): string {
  if (!ev?.seating || !ids?.length) return '';
  const map = ev.seating;
  const byRow = new Map<string, number[]>();
  ids.forEach((id) => {
    const s = findSeat(ev, id);
    if (s) byRow.set(s.rowId, [...(byRow.get(s.rowId) ?? []), s.n]);
  });
  return map.rows.
  filter((r) => byRow.has(r.id)).
  map((r) => {
    const ns = (byRow.get(r.id) ?? []).sort((a, b) => a - b);
    const contiguous = ns.length > 2 && ns[ns.length - 1] - ns[0] === ns.length - 1;
    const list = contiguous ? `${ns[0]}–${ns[ns.length - 1]}` : ns.join(', ');
    if (tr) return `${isTable(map) ? r.label : tr('Row {name}', { name: r.label })} · ${tr('Seats: {list}', { list })}`;
    const name = isTable(map) ? r.label : `Row ${r.label}`;
    return `${name}, seat${ns.length > 1 ? 's' : ''} ${list}`;
  }).
  join(' · ');
}

/* ---------- Repeating events ---------- */

export const repeatLabels: Record<RepeatEvery, string> = {
  weekly: 'Every week',
  fortnightly: 'Every 2 weeks',
  monthly: 'Every month'
};

export function shiftDate(iso: string, every: RepeatEvery, steps: number): string {
  const d = new Date(iso);
  if (every === 'monthly') d.setMonth(d.getMonth() + steps);else
  d.setDate(d.getDate() + steps * (every === 'weekly' ? 7 : 14));
  return d.toISOString();
}

/**
 * A copy of an event for another date: new ids for the event, its ticket product and every
 * ticket type (cart lines are keyed by ticket type), with sales windows moved by the same amount.
 */
export function copyForDate(ev: CommerceEvent, startsAt: string): CommerceEvent {
  const offset = Date.parse(startsAt) - Date.parse(ev.startsAt);
  const move = (iso: string | null) => iso ? new Date(Date.parse(iso) + offset).toISOString() : null;
  const idMap = new Map(ev.ticketTypes.map((t) => [t.id, uid('tt')]));
  const at = new Date().toISOString();
  return {
    ...ev,
    id: uid('evt'),
    productId: uid('prd'),
    startsAt,
    endsAt: move(ev.endsAt),
    status: ev.status === 'cancelled' ? 'draft' : ev.status,
    cancelledAt: undefined,
    sample: undefined,
    ticketTypes: ev.ticketTypes.map((t) => ({ ...t, id: idMap.get(t.id) as string, salesStart: move(t.salesStart), salesEnd: move(t.salesEnd) })),
    seating: ev.seating ? { ...ev.seating, rows: ev.seating.rows.map((r) => ({ ...r, id: uid('row'), ticketTypeId: idMap.get(r.ticketTypeId) ?? r.ticketTypeId })) } : undefined,
    createdAt: at,
    updatedAt: at
  };
}

/** Every date in a series, earliest first. */
export function seriesDates(data: CommerceData | null | undefined, ev: CommerceEvent): CommerceEvent[] {
  if (!ev.series) return [ev];
  return (data?.events ?? []).filter((e) => e.series?.id === ev.series?.id).sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
}

/** The date after the series' last one. */
export function nextSeriesDate(data: CommerceData | null | undefined, ev: CommerceEvent): string {
  const dates = seriesDates(data, ev);
  const last = dates[dates.length - 1] ?? ev;
  return shiftDate(last.startsAt, ev.series?.every ?? 'weekly', 1);
}