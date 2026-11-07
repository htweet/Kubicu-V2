import React, { useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { CheckIcon, LayoutGridIcon, ListIcon, XIcon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import type { CommerceData, CommerceEvent, SeatRow } from '../../types/commerce';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { buttonRadius, buttonStyle, cardRadius, cardStyle, fontsFor, mix } from './pageStyle';
import { formatNgn } from '../../utils/format';
import { MAX_SEATS_PER_PICK, describeSeats, isTable, seatsOfRow, takenSeats, type Seat } from '../../utils/commerce/seating';
import { ticketTypeState } from '../../utils/commerce/tickets';
import { useT } from '../../contexts/LocaleContext';

interface Props {
  event: CommerceEvent;
  data: CommerceData | null;
  theme: PageTheme;
  holder: string;
  /** Seats already in the cart for this event. */
  initial: string[];
  onConfirm: (byType: Record<string, string[]>) => void;
  onClose: () => void;
}

/**
 * Choose exact seats or a whole table (D113). Map for sighted pointer users, list for keyboard and screen readers.
 * Fixed wording follows the visitor's language (D507); event, ticket, row and table names stay as written.
 */
export function SeatPicker({ event: ev, data, theme, holder, initial, onConfirm, onClose }: Props) {
  const { t: tr } = useT();
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  useFocusTrap(ref, true, onClose);
  const map = ev.seating;
  const now = Date.now();
  const taken = useMemo(() => takenSeats(data, ev.id, now, holder), [data, ev.id, holder, now]);
  const [picked, setPicked] = useState<string[]>(initial);
  const [view, setView] = useState<'map' | 'list'>('map');
  const [listRow, setListRow] = useState(map?.rows[0]?.id ?? '');
  const [notice, setNotice] = useState('');

  if (!map) return null;
  const tables = isTable(map);
  const typeIndex = new Map(ev.ticketTypes.map((t, i) => [t.id, i]));
  const typeOf = (id: string) => ev.ticketTypes.find((t) => t.id === id);
  const onSale = (ttId: string) => {
    const tt = typeOf(ttId);
    return !!tt && ticketTypeState(data, ev, tt, now, holder) !== 'closed' && ticketTypeState(data, ev, tt, now, holder) !== 'not_yet';
  };
  const seatedTypes = ev.ticketTypes.filter((t) => map.rows.some((r) => r.ticketTypeId === t.id));
  const shade = (ttId: string) => [18, 42, 70][Math.min(2, typeIndex.get(ttId) ?? 0)];

  const countOfType = (ttId: string, list = picked) => list.filter((id) => map.rows.find((r) => id.startsWith(`${r.id}:`))?.ticketTypeId === ttId).length;
  const canAdd = (seat: Seat, list = picked) => {
    const tt = typeOf(seat.ticketTypeId);
    if (!tt) return tr('This seat isn’t for sale');
    if (list.length >= MAX_SEATS_PER_PICK) return tr('Most seats per order: {n}', { n: MAX_SEATS_PER_PICK });
    if (countOfType(seat.ticketTypeId, list) >= tt.maxPerOrder) return tr('Most {ticket} per order: {n}', { ticket: tt.name, n: tt.maxPerOrder });
    return '';
  };

  const toggle = (seat: Seat) => {
    setNotice('');
    if (picked.includes(seat.id)) return setPicked((p) => p.filter((x) => x !== seat.id));
    const why = canAdd(seat);
    if (why) return setNotice(why);
    setPicked((p) => [...p, seat.id]);
  };

  const bookTable = (row: SeatRow) => {
    setNotice('');
    const seats = seatsOfRow(map, row).filter((s) => !taken.has(s.id));
    const allMine = seats.every((s) => picked.includes(s.id));
    if (allMine) return setPicked((p) => p.filter((id) => !id.startsWith(`${row.id}:`)));
    let next = [...picked];
    for (const s of seats) {
      if (next.includes(s.id)) continue;
      const why = canAdd(s, next);
      if (why) {
        setNotice(`${why} — ${tr('only part of {name} was added', { name: row.label })}`);
        break;
      }
      next = [...next, s.id];
    }
    setPicked(next);
  };

  const total = picked.reduce((s, id) => {
    const row = map.rows.find((r) => id.startsWith(`${r.id}:`));
    return s + (typeOf(row?.ticketTypeId ?? '')?.priceNgn ?? 0);
  }, 0);

  const confirm = () => {
    const byType: Record<string, string[]> = {};
    seatedTypes.forEach((t) => (byType[t.id] = []));
    picked.forEach((id) => {
      const row = map.rows.find((r) => id.startsWith(`${r.id}:`));
      if (row) byType[row.ticketTypeId] = [...(byType[row.ticketTypeId] ?? []), id];
    });
    for (const t of seatedTypes) {
      const n = byType[t.id].length;
      if (n > 0 && n < t.minPerOrder) return setNotice(tr('Fewest {ticket} seats per order: {n}', { ticket: t.name, n: t.minPerOrder }));
    }
    onConfirm(byType);
  };

  const seatButton = (s: Seat, row: SeatRow) => {
    const isTaken = taken.has(s.id);
    const mine = picked.includes(s.id);
    const closed = !onSale(row.ticketTypeId);
    const tt = typeOf(row.ticketTypeId);
    return (
      <button
        key={s.id}
        type="button"
        disabled={(isTaken || closed) && !mine}
        aria-pressed={mine}
        aria-label={`${s.label}, ${tt?.name ?? ''} ${tt ? (tt.priceNgn ? formatNgn(tt.priceNgn) : tr('Free')) : ''}, ${isTaken ? tr('Taken') : closed ? tr('Not on sale') : mine ? tr('Selected') : tr('Available')}`}
        title={s.label}
        onClick={() => toggle(s)}
        className="flex h-7 w-7 shrink-0 items-center justify-center text-[10px] font-semibold tabular-nums transition-[background-color,transform] duration-150 ease-out active:scale-95 disabled:cursor-not-allowed"
        style={{
          borderRadius: tables ? 999 : 6,
          background: mine ? theme.accent : isTaken || closed ? 'transparent' : mix(theme.accent, shade(row.ticketTypeId), theme.surface),
          color: mine ? theme.accentText : isTaken || closed ? mix(theme.text, 35) : theme.text,
          border: isTaken || closed ? `1px dashed ${mix(theme.text, 28)}` : `1px solid ${mine ? theme.accent : mix(theme.text, 14)}`,
        }}
      >
        {mine ? <CheckIcon size={12} aria-hidden /> : isTaken ? <XIcon size={11} aria-hidden /> : s.n}
      </button>
    );
  };

  const muted = { color: theme.mutedText };
  const rowForList = map.rows.find((r) => r.id === listRow) ?? map.rows[0];

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6" role="presentation">
      <motion.div
        className="absolute inset-0"
        style={{ background: 'rgba(10,10,14,0.45)', backdropFilter: 'blur(2px)' }}
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        onClick={onClose}
      />
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="seat-title"
        tabIndex={-1}
        initial={reduce ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
        className="relative flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden outline-none"
        style={{ background: theme.background, color: theme.text, borderRadius: cardRadius(theme) }}
      >
        <header className="flex items-start justify-between gap-3 px-5 pb-3 pt-5" style={{ borderBottom: `1px solid ${mix(theme.text, 9)}` }}>
          <div className="min-w-0">
            <h2 id="seat-title" className="text-[19px] font-medium leading-tight" style={{ fontFamily: fontsFor(theme).display }}>
              {tables ? tr('Choose seats or a table') : tr('Choose your seats')}
            </h2>
            <p className="mt-0.5 truncate text-[13px]" style={muted}>
              {ev.name}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <div className="flex p-0.5" role="group" aria-label={tr('View')} style={{ background: mix(theme.text, 6), borderRadius: buttonRadius(theme) }}>
              {(['map', 'list'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={view === v}
                  onClick={() => setView(v)}
                  className="flex h-8 items-center gap-1.5 px-2.5 text-[12.5px] font-semibold"
                  style={{ borderRadius: buttonRadius(theme), background: view === v ? theme.surface : 'transparent', color: theme.text }}
                >
                  {v === 'map' ? <LayoutGridIcon size={13} aria-hidden /> : <ListIcon size={13} aria-hidden />}
                  {v === 'map' ? tr('Map') : tr('List')}
                </button>
              ))}
            </div>
            <button type="button" aria-label={tr('Close')} onClick={onClose} className="flex h-9 w-9 items-center justify-center" style={{ borderRadius: buttonRadius(theme) }}>
              <XIcon size={18} aria-hidden />
            </button>
          </div>
        </header>

        <ul className="flex flex-wrap gap-x-4 gap-y-1.5 px-5 py-3 text-[12.5px]" aria-label={tr('Key')}>
          {seatedTypes.map((t) => (
            <li key={t.id} className="flex items-center gap-1.5">
              <span aria-hidden className="h-3.5 w-3.5" style={{ borderRadius: 4, background: mix(theme.accent, shade(t.id), theme.surface), border: `1px solid ${mix(theme.text, 14)}` }} />
              {t.name} · {t.priceNgn ? formatNgn(t.priceNgn) : tr('Free')}
            </li>
          ))}
          <li className="flex items-center gap-1.5">
            <span aria-hidden className="h-3.5 w-3.5" style={{ borderRadius: 4, background: theme.accent }} />
            {tr('Yours')}
          </li>
          <li className="flex items-center gap-1.5" style={muted}>
            <span aria-hidden className="h-3.5 w-3.5" style={{ borderRadius: 4, border: `1px dashed ${mix(theme.text, 28)}` }} />
            {tr('Taken')}
          </li>
        </ul>

        <div className="kb-scroll min-h-0 flex-1 overflow-y-auto px-5 pb-4">
          {view === 'map' ? (
            <div className="flex flex-col gap-3" aria-hidden={false}>
              {map.layout !== 'banquet' && (
                <div className="mx-auto mb-1 flex h-8 w-2/3 items-center justify-center text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ background: mix(theme.text, 8), borderRadius: 6, color: theme.mutedText }}>
                  {tr('Stage')}
                </div>
              )}
              {tables ? (
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {map.rows.map((r) => {
                    const seats = seatsOfRow(map, r);
                    const free = seats.filter((s) => !taken.has(s.id)).length;
                    const allMine = free > 0 && seats.filter((s) => !taken.has(s.id)).every((s) => picked.includes(s.id));
                    return (
                      <li key={r.id} className="flex flex-col gap-2.5 p-3" style={cardStyle(theme)}>
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-[14px] font-semibold">{r.label}</span>
                          <span className="text-[12px]" style={muted}>
                            {typeOf(r.ticketTypeId)?.name} · {tr('Free seats: {n} of {total}', { n: free, total: seats.length })}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">{seats.map((s) => seatButton(s, r))}</div>
                        {free > 0 && onSale(r.ticketTypeId) && (
                          <button type="button" onClick={() => bookTable(r)} className="h-9 self-start px-3 text-[12.5px] font-semibold" style={buttonStyle(theme, 'default')}>
                            {allMine ? tr('Remove: {name}', { name: r.label }) : free === seats.length ? tr('Book the whole table ({n})', { n: free }) : tr('Book the free seats ({n})', { n: free })}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="kb-scroll overflow-x-auto">
                  <ol className="mx-auto flex w-max flex-col gap-1.5">
                    {map.rows.map((r) => (
                      <li key={r.id} className="flex items-center gap-1.5">
                        <span className="w-6 shrink-0 text-right text-[11.5px] font-semibold" style={muted}>
                          {r.label}
                        </span>
                        {seatsOfRow(map, r).map((s) => seatButton(s, r))}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1 text-[13px] font-semibold">
                {tables ? tr('Table') : tr('Row')}
                <select
                  value={rowForList?.id}
                  onChange={(e) => setListRow(e.target.value)}
                  className="h-11 px-3 text-[15px] font-normal"
                  style={{ background: theme.surface, color: theme.text, border: `1px solid ${mix(theme.text, 18)}`, borderRadius: 10 }}
                >
                  {map.rows.map((r) => {
                    const free = seatsOfRow(map, r).filter((s) => !taken.has(s.id)).length;
                    return (
                      <option key={r.id} value={r.id}>
                        {tables ? r.label : tr('Row {name}', { name: r.label })} — {typeOf(r.ticketTypeId)?.name} — {tr('Free seats: {n}', { n: free })}
                      </option>
                    );
                  })}
                </select>
              </label>
              {rowForList && (
                <fieldset className="flex flex-col">
                  <legend className="sr-only">{tr('Seats in {name}', { name: rowForList.label })}</legend>
                  {seatsOfRow(map, rowForList).map((s) => {
                    const isTaken = taken.has(s.id);
                    const closed = !onSale(rowForList.ticketTypeId);
                    return (
                      <label key={s.id} className="flex min-h-[44px] items-center gap-3 text-[14.5px]" style={{ borderBottom: `1px solid ${mix(theme.text, 8)}`, color: isTaken || closed ? theme.mutedText : theme.text }}>
                        <input type="checkbox" className="h-5 w-5" checked={picked.includes(s.id)} disabled={(isTaken || closed) && !picked.includes(s.id)} onChange={() => toggle(s)} style={{ accentColor: theme.accent }} />
                        <span className="flex-1">{s.label}</span>
                        <span className="text-[13px]">{isTaken ? tr('Taken') : closed ? tr('Not on sale') : typeOf(s.ticketTypeId)?.priceNgn ? formatNgn(typeOf(s.ticketTypeId)?.priceNgn ?? 0) : tr('Free')}</span>
                      </label>
                    );
                  })}
                </fieldset>
              )}
              {tables && rowForList && onSale(rowForList.ticketTypeId) && (
                <button type="button" onClick={() => bookTable(rowForList)} className="h-10 self-start px-3.5 text-[13px] font-semibold" style={buttonStyle(theme, 'default')}>
                  {tr('Book every free seat at {name}', { name: rowForList.label })}
                </button>
              )}
            </div>
          )}
        </div>

        <footer className="flex flex-col gap-2 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3" style={{ borderTop: `1px solid ${mix(theme.text, 9)}`, background: theme.background }}>
          <p className="min-h-[1.25rem] text-[13px]" aria-live="polite" style={notice ? { color: theme.text, fontWeight: 600 } : muted}>
            {notice || (picked.length ? describeSeats(ev, picked, tr) : tr('Tap a seat to choose it. You can change seats until you pay.'))}
          </p>
          <button
            type="button"
            onClick={confirm}
            disabled={picked.length === 0 && initial.length === 0}
            className="flex h-12 w-full items-center justify-center text-[15px] font-semibold disabled:opacity-50"
            style={buttonStyle(theme, 'featured')}
          >
            {picked.length === 0
              ? initial.length
                ? tr('Remove my seats')
                : tr('Choose a seat')
              : `${tr('Add seats: {n}', { n: picked.length })} · ${total ? formatNgn(total) : tr('Free')}`}
          </button>
        </footer>
      </motion.div>
    </div>,
    document.body,
  );
}
