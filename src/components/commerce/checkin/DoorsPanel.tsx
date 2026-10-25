import React from 'react';
import { AlertTriangleIcon, DoorOpenIcon, WifiOffIcon } from 'lucide-react';
import type { CommerceData } from '../../../types/commerce';
import type { Beat } from '../../../utils/liveChannel';
import type { DoorPayload, QueuedScan } from '../../../hooks/useDoor';
import { checkInsByDoor, recentCheckIns } from '../../../utils/commerce/tickets';
import { cn } from '../../../utils/cn';

export interface SyncConflict {
  code: string;
  guest: string;
  reason: string;
}

const time = (iso?: string) => iso ? new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '';

/** Example door shown so the several-phones layout is designed (clearly labelled, never counted). */
const SIM_DOOR = { door: 'VIP entrance', by: 'Tunde (example)' };

interface DoorsPanelProps {
  data: CommerceData;
  eventId: string;
  door: string;
  me: string;
  peers: Beat<DoorPayload>[];
  connected: boolean;
  queue: QueuedScan[];
  conflicts: SyncConflict[];
  onDismissConflicts: () => void;
}

/** Every door at this event: who's scanning where, counts per door and the latest check-ins (D143). */
export function DoorsPanel({ data, eventId, door, me, peers, connected, queue, conflicts, onDismissConflicts }: DoorsPanelProps) {
  const counts = checkInsByDoor(data, eventId);
  const recent = recentCheckIns(data, eventId);
  const doors: {door: string;by: string;kind: 'me' | 'live' | 'example';}[] = [
  { door, by: me, kind: 'me' },
  ...peers.map((p) => ({ door: p.payload.door, by: p.payload.by, kind: 'live' as const })),
  { ...SIM_DOOR, kind: 'example' as const }];


  return (
    <div className="flex flex-col gap-4">
      {!connected &&
      <div role="status" className="flex items-start gap-2.5 rounded-md bg-warning-soft px-3 py-2.5 text-label text-fg">
          <WifiOffIcon size={16} className="mt-0.5 shrink-0" aria-hidden />
          <span>
            <span className="font-semibold">Offline — scans are saved on this phone.</span> {queue.length} waiting to sync. Other doors can’t see them yet, so watch for repeat tickets.
          </span>
        </div>
      }

      {conflicts.length > 0 &&
      <section aria-labelledby="ci-conflicts" aria-live="polite" className="rounded-md border border-danger/40 bg-danger-soft p-3">
          <div className="flex items-start justify-between gap-3">
            <h2 id="ci-conflicts" className="flex items-center gap-1.5 text-label font-semibold text-fg">
              <AlertTriangleIcon size={15} className="text-danger" aria-hidden /> {conflicts.length} offline scan{conflicts.length === 1 ? '' : 's'} need a look
            </h2>
            <button type="button" onClick={onDismissConflicts} className="-my-2 inline-flex min-h-[44px] shrink-0 items-center px-2 text-caption font-medium text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
              Dismiss
            </button>
          </div>
          <ul className="mt-2 flex flex-col gap-1.5">
            {conflicts.map((c) =>
          <li key={c.code} className="text-caption text-fg-muted">
                <span className="font-semibold text-fg">{c.guest}</span> · <span className="font-mono">{c.code}</span> — {c.reason}
              </li>
          )}
          </ul>
        </section>
      }

      <section aria-labelledby="ci-doors">
        <h2 id="ci-doors" className="text-label font-semibold text-fg">
          Doors open now
        </h2>
        <ul className="mt-2 flex flex-col divide-y divide-line rounded-md border border-line bg-raised">
          {doors.map((d, i) =>
          <li key={`${d.door}-${i}`} className={cn('flex items-center gap-3 px-4 py-2.5', d.kind === 'example' && 'opacity-70')}>
              <DoorOpenIcon size={16} className="shrink-0 text-fg-subtle" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-label font-medium text-fg">
                  {d.door}
                  {d.kind === 'me' && <span className="font-normal text-fg-subtle"> · this phone</span>}
                </span>
                <span className="block truncate text-caption text-fg-subtle">
                  {d.by} · {d.kind === 'live' ? 'live, another tab' : d.kind === 'example' ? 'example only' : connected ? 'online' : 'offline'}
                </span>
              </span>
              <span className="shrink-0 text-right tabular-nums">
                <span className="text-label font-semibold text-fg">{d.kind === 'example' ? '—' : counts[d.door] ?? 0}</span>
                <span className="block text-caption text-fg-subtle">in</span>
              </span>
            </li>
          )}
        </ul>
      </section>

      <section aria-labelledby="ci-recent">
        <h2 id="ci-recent" className="text-label font-semibold text-fg">
          Latest at every door
        </h2>
        {recent.length === 0 ?
        <p className="mt-2 text-label text-fg-muted">No one checked in yet.</p> :

        <ul className="mt-2 flex flex-col divide-y divide-line rounded-md border border-line bg-raised" aria-live="polite">
            {recent.map((r) =>
          <li key={r.ticket.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-label font-medium text-fg">{r.ticket.guestName}</span>
                  <span className="block truncate text-caption text-fg-subtle">
                    {r.ticket.checkedInDoor ?? 'No door named'}
                    {r.ticket.checkedInBy ? ` · ${r.ticket.checkedInBy}` : ''}
                  </span>
                </span>
                <span className="shrink-0 text-caption tabular-nums text-fg-subtle">{time(r.ticket.checkedInAt)}</span>
              </li>
          )}
          </ul>
        }
      </section>
    </div>);

}