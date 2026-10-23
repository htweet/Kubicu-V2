import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertTriangleIcon, CameraIcon, CameraOffIcon, CheckCircle2Icon, FlaskConicalIcon, SearchIcon, UndoIcon, XCircleIcon, XIcon } from 'lucide-react';
import { useCommerce } from '../../contexts/CommerceContext';
import { useTeam } from '../../contexts/TeamContext';
import { useQrScanner } from '../../hooks/useQrScanner';
import { checkedInCount, eventTickets, eventsOf, findEvent, parseTicketCode, scanTicket, setCheckedIn, ticketQrValue, ticketStatus, type ScanOutcome } from '../../utils/commerce/tickets';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import { SelectInput } from '../../components/ui/SelectInput';
import { cn } from '../../utils/cn';

const RESULT_MS = 2000;
const time = (iso?: string) => iso ? new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '';

type Sim = '' | 'valid' | 'already' | 'void' | 'wrong' | 'unknown';

/** Phone-first door check-in: camera scan, search fallback, unmistakable results (D74). */
export function CheckIn() {
  const { eventId = '' } = useParams();
  const navigate = useNavigate();
  const { data, apply } = useCommerce();
  const team = useTeam();
  const reduce = useReducedMotion();
  const ev = findEvent(data, eventId);
  const [result, setResult] = useState<ScanOutcome | null>(null);
  const [query, setQuery] = useState('');
  const [sim, setSim] = useState<Sim>('');
  const timer = useRef<number>();
  const lastScan = useRef<{value: string;at: number;}>({ value: '', at: 0 });
  const allowed = team.can('tickets.checkin');

  const handle = useCallback(
    (raw: string) => {
      if (!ev || !allowed.allowed) return;
      let found = null as ScanOutcome | null;
      apply((d) => {
        const r = scanTicket(d, ev.id, raw, team.me.name);
        found = r.outcome;
        return r.data;
      });
      const outcome = found;
      if (!outcome) return;
      setResult(outcome);
      if ('vibrate' in navigator) navigator.vibrate(outcome.kind === 'admitted' ? 60 : [80, 60, 80]);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setResult(null), RESULT_MS);
    },
    [apply, ev, allowed.allowed, team.me.name]
  );

  const onCameraCode = useCallback(
    (value: string) => {
      // The same code stays in view between frames; count it once.
      const now = Date.now();
      if (value === lastScan.current.value && now - lastScan.current.at < 4000) return;
      lastScan.current = { value, at: now };
      handle(value);
    },
    [handle]
  );

  const scanner = useQrScanner(onCameraCode, !!result);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const tickets = useMemo(() => ev ? eventTickets(data, ev.id) : [], [data, ev]);
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return tickets.filter((r) => `${r.ticket.guestName} ${r.ticket.code} ${r.order.customer.name} ${r.order.customer.phone}`.toLowerCase().includes(q)).slice(0, 6);
  }, [query, tickets]);

  if (!ev) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-canvas p-6 text-center">
        <p className="text-heading font-semibold text-fg">Event not found</p>
        <Button onClick={() => navigate('/app/commerce/events')}>Back to events</Button>
      </div>);

  }

  const admittable = tickets.filter((r) => ['valid', 'checked_in'].includes(ticketStatus(r, ev))).length;
  const inCount = checkedInCount(data, ev);
  const close = () => {
    scanner.stop();
    navigate(`/app/commerce/events/${ev.id}/guests`);
  };

  const simValue = (s: Sim): string | null => {
    const pick = (fn: (st: ReturnType<typeof ticketStatus>) => boolean) => tickets.find((r) => fn(ticketStatus(r, ev)));
    if (s === 'valid') return pick((st) => st === 'valid')?.ticket.code ?? null;
    if (s === 'already') return pick((st) => st === 'checked_in')?.ticket.code ?? null;
    if (s === 'void') return pick((st) => st === 'void')?.ticket.code ?? null;
    if (s === 'wrong') {
      const other = eventsOf(data).find((e) => e.id !== ev.id && eventTickets(data, e.id).length);
      return other ? eventTickets(data, other.id)[0].ticket.code : null;
    }
    if (s === 'unknown') return 'KUB-ZZZZ';
    return null;
  };
  const simOptions: {value: Sim;label: string;}[] = [
  { value: '', label: 'Choose a scan to test…' },
  { value: 'valid', label: `Valid ticket${simValue('valid') ? '' : ' (none left)'}` },
  { value: 'already', label: `Already checked in${simValue('already') ? '' : ' (none yet)'}` },
  { value: 'void', label: `Refunded ticket${simValue('void') ? '' : ' (none)'}` },
  { value: 'wrong', label: `Ticket for another event${simValue('wrong') ? '' : ' (none)'}` },
  { value: 'unknown', label: 'Not a KUBICU ticket' }];


  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-canvas" role="dialog" aria-modal="true" aria-label={`Check in guests — ${ev.name}`}>
      <header className="flex shrink-0 items-center gap-3 border-b border-line bg-raised px-4 py-3">
        <IconButton icon={XIcon} label="Close check-in" onClick={close} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-label font-semibold text-fg">{ev.name}</p>
          <p className="text-caption text-fg-subtle">Checking in as {team.me.name}</p>
        </div>
        <p className="shrink-0 text-right tabular-nums" aria-live="polite">
          <span className="text-heading font-semibold text-fg">{inCount}</span>
          <span className="text-label text-fg-subtle"> / {admittable} in</span>
        </p>
      </header>

      <div className="mx-auto flex w-full max-w-md min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
        {!allowed.allowed &&
        <p className="rounded-md bg-warning-soft px-3 py-2.5 text-label text-fg" role="alert">
            {allowed.reason}
          </p>
        }

        <section aria-label="Camera" className="relative aspect-square w-full shrink-0 overflow-hidden rounded-lg bg-[#0b0b0c]">
          <video ref={scanner.videoRef} muted playsInline className={cn('h-full w-full object-cover', scanner.state !== 'on' && 'invisible')} />
          {scanner.state === 'on' ?
          <div aria-hidden className="pointer-events-none absolute inset-[18%] rounded-xl border-[3px] border-white/90" /> :

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
              {scanner.state === 'denied' || scanner.state === 'unavailable' ? <CameraOffIcon size={30} className="text-white/70" aria-hidden /> : <CameraIcon size={30} className="text-white/70" aria-hidden />}
              <p className="max-w-[260px] text-label text-white/85">
                {scanner.state === 'denied' ?
              'Camera access is blocked. Allow it in your browser settings, or search for guests below.' :
              scanner.state === 'unavailable' ?
              'No camera found on this device. Search for guests by name or code below.' :
              'Point the camera at a guest’s QR ticket.'}
              </p>
              {(scanner.state === 'idle' || scanner.state === 'starting') &&
            <Button onClick={scanner.start} disabled={scanner.state === 'starting' || !allowed.allowed} leadingIcon={CameraIcon}>
                  {scanner.state === 'starting' ? 'Starting camera…' : 'Start camera'}
                </Button>
            }
            </div>
          }

          <AnimatePresence>
            {result &&
            <motion.div
              key={`${result.kind}-${'ref' in result ? result.ref.ticket.id : result.code}`}
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
              className="absolute inset-x-3 bottom-3">
              
                <ResultCard outcome={result} onUndo={() => {
                if (result.kind !== 'admitted') return;
                apply((d) => setCheckedIn(d, result.ref.ticket.id, null));
                setResult(null);
              }} />
              </motion.div>
            }
          </AnimatePresence>
        </section>

        <section aria-labelledby="ci-search" className="flex flex-col gap-2">
          <h2 id="ci-search" className="text-label font-semibold text-fg">
            Find a guest
          </h2>
          <form
            className="relative"
            onSubmit={(e) => {
              e.preventDefault();
              if (parseTicketCode(query)) {
                handle(query);
                setQuery('');
              }
            }}>
            
            <SearchIcon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" aria-hidden />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, phone or ticket code"
              aria-label="Name, phone or ticket code"
              className="h-12 w-full rounded-md border border-line bg-field pl-9 pr-3 text-body text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-focus" />
            
          </form>
          {query.trim() &&
          <ul className="flex flex-col divide-y divide-line rounded-md border border-line bg-raised">
              {matches.length === 0 && <li className="px-4 py-3 text-label text-fg-muted">{parseTicketCode(query) ? 'Press Enter to check this code.' : 'No guest matches.'}</li>}
              {matches.map((r) => {
              const st = ticketStatus(r, ev);
              return (
                <li key={r.ticket.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-label font-semibold text-fg">{r.ticket.guestName}</span>
                      <span className="block truncate text-caption text-fg-subtle">
                        {r.ticket.typeName}{r.ticket.seat ? ` · ${r.ticket.seat}` : ''} · <span className="font-mono">{r.ticket.code}</span>
                        {st === 'checked_in' ? ` · in at ${time(r.ticket.checkedInAt)}` : st === 'void' ? ' · void' : st === 'pending' ? ' · payment pending' : ''}
                      </span>
                    </span>
                    {st === 'valid' ?
                  <Button
                    size="sm"
                    disabled={!allowed.allowed}
                    onClick={() => {
                      handle(r.ticket.code);
                      setQuery('');
                    }}>
                    
                        Check in
                      </Button> :

                  <span className={cn('shrink-0 text-caption font-semibold', st === 'checked_in' ? 'text-success' : 'text-danger')}>{st === 'checked_in' ? 'In' : st === 'void' ? 'Void' : 'Unpaid'}</span>
                  }
                  </li>);

            })}
            </ul>
          }
        </section>

        <section aria-labelledby="ci-sim" className="mt-auto flex flex-col gap-2 rounded-md border border-dashed border-line-strong p-3">
          <h2 id="ci-sim" className="flex items-center gap-1.5 text-caption font-semibold text-fg-muted">
            <FlaskConicalIcon size={13} aria-hidden /> Prototype: simulate a scan
          </h2>
          <div className="flex items-end gap-2">
            <div className="min-w-0 flex-1">
              <SelectInput id="ci-sim-pick" label="Test result" value={sim} onChange={setSim} options={simOptions} />
            </div>
            <Button
              variant="secondary"
              disabled={!sim || !simValue(sim)}
              onClick={() => {
                const v = simValue(sim);
                if (v) handle(ticketQrValue(v));
              }}>
              
              Scan
            </Button>
          </div>
        </section>
      </div>
    </div>);

}

function ResultCard({ outcome, onUndo }: {outcome: ScanOutcome;onUndo: () => void;}) {
  const ok = outcome.kind === 'admitted';
  const warn = outcome.kind === 'already';
  const Icon = ok ? CheckCircle2Icon : warn ? AlertTriangleIcon : XCircleIcon;
  const ref = 'ref' in outcome ? outcome.ref : null;
  const title =
  outcome.kind === 'admitted' ?
  'Checked in' :
  outcome.kind === 'already' ?
  'Already checked in' :
  outcome.kind === 'void' ?
  'Not valid — refunded' :
  outcome.kind === 'pending' ?
  'Not paid yet' :
  outcome.kind === 'wrong_event' ?
  'Wrong event' :
  'Not a ticket we know';
  const detail =
  outcome.kind === 'already' ?
  `At ${time(outcome.ref.ticket.checkedInAt)}${outcome.ref.ticket.checkedInBy ? ` by ${outcome.ref.ticket.checkedInBy}` : ''}` :
  outcome.kind === 'void' ?
  'This ticket was refunded or its order cancelled.' :
  outcome.kind === 'pending' ?
  'The payment hasn’t cleared. Ask them to check their order page.' :
  outcome.kind === 'wrong_event' ?
  `This ticket is for ${outcome.otherEvent}.` :
  outcome.kind === 'unknown' ?
  'Check the code, or search for the guest by name.' :
  '';

  return (
    <div role="status" aria-live="assertive" className={cn('flex items-center gap-3 rounded-lg px-4 py-3.5 shadow-2', ok ? 'bg-success text-success-soft' : warn ? 'bg-warning text-warning-soft' : 'bg-danger text-danger-soft')}>
      <Icon size={30} className="shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-[18px] font-semibold leading-tight">{title}</p>
        {ref &&
        <p className="truncate text-label font-medium">
            {ref.ticket.typeName}{ref.ticket.seat ? ` · ${ref.ticket.seat}` : ''} · {ref.ticket.guestName}
          </p>
        }
        {detail && <p className="text-caption opacity-90">{detail}</p>}
      </div>
      {ok &&
      <button type="button" onClick={onUndo} className="inline-flex h-9 shrink-0 items-center gap-1 rounded-md border border-current px-3 text-label font-semibold transition-opacity duration-150 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current">
          <UndoIcon size={14} aria-hidden /> Undo
        </button>
      }
    </div>);

}