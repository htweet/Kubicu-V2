import React from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckCircle2Icon, CircleDashedIcon, CopyIcon, ExternalLinkIcon, UndoIcon, UserCheckIcon, XCircleIcon, ClockIcon } from 'lucide-react';
import type { CommerceEvent } from '../../types/commerce';
import { ticketStatusLabel, type TicketRef, type TicketStatus } from '../../utils/commerce/tickets';
import { formatEventDate, formatEventTime } from '../../utils/eventTime';
import { useMainLink } from '../../hooks/useMainLink';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

interface Props {
  ticket: (TicketRef & {status: TicketStatus;}) | null;
  event: CommerceEvent;
  canCheckIn: boolean;
  onToggleCheckIn: () => void;
  onClose: () => void;
}

const verdict: Record<TicketStatus, {title: string;detail: string;icon: typeof CheckCircle2Icon;cls: string;}> = {
  valid: { title: 'Valid — not used yet', detail: 'This ticket will be admitted at the door.', icon: CircleDashedIcon, cls: 'bg-action-soft text-action' },
  checked_in: { title: 'Valid — already checked in', detail: 'A second scan of this code will show “Already used”.', icon: CheckCircle2Icon, cls: 'bg-success-soft text-success' },
  void: { title: 'Not valid', detail: 'Refunded or cancelled. The door will turn it away.', icon: XCircleIcon, cls: 'bg-danger-soft text-danger' },
  pending: { title: 'Not valid yet', detail: 'Payment hasn’t been confirmed. It becomes valid once it is.', icon: ClockIcon, cls: 'bg-warning-soft text-warning' }
};

const dt = (iso: string) => new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

/** Owner's view-only ticket (D113a): validity verdict, seat, buyer and a link to the guest's own ticket page. */
export function TicketDetailSheet({ ticket: r, event: ev, canCheckIn, onToggleCheckIn, onClose }: Props) {
  const { mainHandle } = useMainLink();
  const v = r ? verdict[r.status] : null;
  const guestUrl = r ? `/p/${mainHandle}/ticket/${r.ticket.id}` : '';

  const rows: [string, React.ReactNode][] = r ?
  [
  ['Guest', r.ticket.guestName],
  ['Ticket', r.ticket.typeName + (r.ticket.comp ? ' · Complimentary' : '')],
  ...(r.ticket.seat ? [['Seat', r.ticket.seat]] as [string, React.ReactNode][] : []),
  ['Code', <span className="font-mono">{r.ticket.code}</span>],
  ['Event', `${ev.name} · ${formatEventDate(ev.startsAt, ev.timeZone)}, ${formatEventTime(ev.startsAt, ev.timeZone)}`],
  ['Status', ticketStatusLabel[r.status]],
  ...(r.ticket.checkedInAt ? [['Checked in', `${dt(r.ticket.checkedInAt)}${r.ticket.checkedInBy ? ` by ${r.ticket.checkedInBy}` : ''}`]] as [string, React.ReactNode][] : []),
  [
  'Order',
  <Link to={`/app/commerce/orders?order=${r.order.id}`} className="font-medium text-action hover:underline">
            #{r.order.number} · {r.order.customer.name}
          </Link>],

  ['Buyer contact', [r.order.customer.phone, r.order.customer.email].filter(Boolean).join(' · ') || '—']] :

  [];

  return (
    <Sheet
      open={!!r}
      onClose={onClose}
      side="right"
      title={r ? r.ticket.guestName : 'Ticket'}
      description="View only — this is what the door will see when the code is scanned."
      footer={
      r &&
      <div className="flex flex-col gap-2">
            {(r.status === 'valid' || r.status === 'checked_in') &&
        <Button fullWidth leadingIcon={r.status === 'checked_in' ? UndoIcon : UserCheckIcon} variant={r.status === 'checked_in' ? 'secondary' : 'primary'} disabled={!canCheckIn} onClick={onToggleCheckIn}>
                {r.status === 'checked_in' ? 'Undo check-in' : 'Check in'}
              </Button>
        }
            <div className="grid grid-cols-2 gap-2">
            <Button
            fullWidth
            variant="secondary"
            leadingIcon={CopyIcon}
            onClick={() => {
              void navigator.clipboard?.writeText(`${window.location.origin}${guestUrl}`);
              toast('Ticket link copied', { description: 'Send it to the guest if they lost theirs.' });
            }}>
            
              Copy link
            </Button>
            <Button fullWidth variant="secondary" leadingIcon={ExternalLinkIcon} onClick={() => window.open(guestUrl, '_blank', 'noopener')}>
              Open ticket
            </Button>
            </div>
          </div>

      }>
      
      {r && v &&
      <div className="flex flex-col gap-6 px-5 py-6">
          <div className={cn('flex items-start gap-3 rounded-lg p-4', v.cls)} role="status">
            <v.icon size={22} aria-hidden className="mt-0.5 shrink-0" />
            <div>
              <p className="text-label font-semibold">{v.title}</p>
              <p className="text-caption opacity-90">{v.detail}</p>
            </div>
          </div>
          <dl className="divide-y divide-line border-y border-line">
            {rows.map(([k, val]) =>
          <div key={k} className="grid grid-cols-[112px_minmax(0,1fr)] items-baseline gap-4 py-3">
                <dt className="text-caption text-fg-muted">{k}</dt>
                <dd className="break-words text-label text-fg">{val}</dd>
              </div>
          )}
          </dl>
        </div>
      }
    </Sheet>);

}