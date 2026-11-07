import React from 'react';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import type { CommerceEvent, SeatingLayout, SeatingMap } from '../../types/commerce';
import { Switch } from '../ui/Switch';
import { Segmented } from '../ui/Segmented';
import { TextInput } from '../ui/TextInput';
import { SelectInput } from '../ui/SelectInput';
import { IconButton } from '../ui/IconButton';
import { Button } from '../ui/Button';
import { InlineAlert } from '../ui/InlineAlert';
import { MAX_SEATS_PER_ROW, MAX_SEAT_ROWS, blankRow, isTable, layoutHints, layoutLabels, seatCountOfType, seatingTemplate } from '../../utils/commerce/seating';

interface Props {
  draft: CommerceEvent;
  onChange: (seating: SeatingMap | undefined) => void;
  /** Seat ids already sold, which can't be removed. */
  sold: Set<string>;
  error?: string;
  /** Seating maps need Pro and above (D113). */
  locked?: React.ReactNode;
}

const layouts: { value: SeatingLayout; label: string }[] = (Object.keys(layoutLabels) as SeatingLayout[]).map((value) => ({ value, label: layoutLabels[value] }));

/** Seating map editor inside the event sheet (D113). */
export function EventSeatingFields({ draft, onChange, sold, error, locked }: Props) {
  const map = draft.seating;
  const anySold = sold.size > 0;
  const soldInRow = (rowId: string) => [...sold].filter((s) => s.startsWith(`${rowId}:`)).map((s) => Number(s.split(':')[1]));
  const highestSold = (rowId: string) => Math.max(0, ...soldInRow(rowId));
  const typeOptions = draft.ticketTypes.map((t) => ({ value: t.id, label: t.name || 'Untitled ticket' }));
  const patchRow = (id: string, p: Partial<SeatingMap['rows'][number]>) => map && onChange({ ...map, rows: map.rows.map((r) => (r.id === id ? { ...r, ...p } : r)) });
  const seatedIds = new Set(map?.rows.map((r) => r.ticketTypeId) ?? []);
  const standing = draft.ticketTypes.filter((t) => !seatedIds.has(t.id));

  return (
    <section aria-labelledby="ev-seating" className="flex flex-col gap-4 px-5 py-6">
      <h3 id="ev-seating" className="text-label font-semibold text-fg">
        Seating
      </h3>
      <Switch
        id="ev-seated"
        label="Guests choose their seats"
        description="Buyers pick exact seats or a whole table from a map. Each ticket shows its seat, and the guest list and check-in show it too."
        checked={!!map}
        disabled={anySold || (!!locked && !map)}
        onChange={(on) => onChange(on ? seatingTemplate('theatre', draft.ticketTypes) : undefined)}
      />
      {locked && !map && locked}
      {anySold && <p className="-mt-2 text-caption text-fg-muted">Seats are already sold, so seating can’t be switched off or changed to another layout. You can still add rows or seats.</p>}
      {map && (
        <>
          <div className="flex flex-col gap-2">
            <Segmented<SeatingLayout>
              ariaLabel="Layout"
              fullWidth
              value={map.layout}
              onChange={(layout) => !anySold && onChange(seatingTemplate(layout, draft.ticketTypes))}
              options={anySold ? layouts.filter((l) => l.value === map.layout) : layouts}
            />
            <p className="text-caption text-fg-muted">{layoutHints[map.layout]} Changing layout starts the map again.</p>
          </div>
          {error && (
            <InlineAlert tone="danger" title="Check the seating map">
              {error}
            </InlineAlert>
          )}
          <ol className="flex flex-col divide-y divide-line rounded-md border border-line bg-raised">
            {map.rows.map((r) => {
              const min = highestSold(r.id);
              return (
                <li key={r.id} className="grid grid-cols-[minmax(0,1fr)_88px_minmax(0,1.3fr)_auto] items-end gap-3 px-4 py-3">
                  <TextInput id={`row-l-${r.id}`} label={isTable(map) ? 'Table' : 'Row'} value={r.label} onChange={(e) => patchRow(r.id, { label: e.target.value.slice(0, 14) })} />
                  <TextInput
                    id={`row-s-${r.id}`}
                    label="Seats"
                    type="number"
                    inputMode="numeric"
                    min={Math.max(1, min)}
                    max={MAX_SEATS_PER_ROW}
                    value={String(r.seats)}
                    onChange={(e) => patchRow(r.id, { seats: Math.min(MAX_SEATS_PER_ROW, Math.max(min, Math.floor(Number(e.target.value) || 0))) })}
                  />
                  <SelectInput id={`row-t-${r.id}`} label="Ticket" value={r.ticketTypeId} options={typeOptions} disabled={min > 0} onChange={(ticketTypeId) => patchRow(r.id, { ticketTypeId })} />
                  <IconButton
                    icon={Trash2Icon}
                    size="sm"
                    label={min > 0 ? `${r.label} has sold seats` : `Remove ${r.label}`}
                    disabled={min > 0 || map.rows.length <= 1}
                    onClick={() => onChange({ ...map, rows: map.rows.filter((x) => x.id !== r.id) })}
                  />
                </li>
              );
            })}
          </ol>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="secondary" leadingIcon={PlusIcon} disabled={map.rows.length >= MAX_SEAT_ROWS} onClick={() => onChange({ ...map, rows: [...map.rows, blankRow(map, map.rows[map.rows.length - 1]?.ticketTypeId ?? draft.ticketTypes[0]?.id ?? '')] })}>
              {isTable(map) ? 'Add table' : 'Add row'}
            </Button>
            <p className="text-caption tabular-nums text-fg-muted">
              {draft.ticketTypes
                .filter((t) => seatedIds.has(t.id))
                .map((t) => `${t.name || 'Ticket'}: ${seatCountOfType(draft, t.id)} seats`)
                .join(' · ')}
            </p>
          </div>
          <p className="text-caption text-fg-muted">
            {standing.length
              ? `${standing.map((t) => t.name || 'Untitled').join(', ')} ${standing.length === 1 ? 'has' : 'have'} no seats, so ${standing.length === 1 ? 'it sells' : 'they sell'} by quantity — good for standing or general admission.`
              : 'Seated ticket quantities follow the map. Add a ticket type with no rows for standing tickets.'}
          </p>
        </>
      )}
    </section>
  );
}
