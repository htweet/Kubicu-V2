import React, { useState } from 'react';
import { BanIcon, CalendarClockIcon, CheckCircle2Icon, CopyIcon, MessageCircleIcon, UserXIcon } from 'lucide-react';
import { bookingBalance, balanceLabels, payBookingBalance } from '../../utils/ops/balance';
import { useMainLink } from '../../hooks/useMainLink';
import { cn } from '../../utils/cn';
import { toast } from 'sonner';
import { useOps } from '../../contexts/OpsContext';
import { cancelBooking, rescheduleBooking, setBookingStatus } from '../../utils/ops/ops';
import { dayLabel, durationLabel, timeLabel } from '../../utils/ops/slots';
import { formatNgn, formatTimestamp, whatsappLink } from '../../utils/format';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { TextInput } from '../ui/TextInput';
import { Dialog } from '../ui/Dialog';
import { SampleTag } from '../commerce/StatusBadges';
import { OwnerSlotPicker } from './OwnerSlotPicker';
import { useTeam } from '../../contexts/TeamContext';
import { AssigneeSelect } from '../team/AssigneeSelect';
import { CommentThread } from '../team/CommentThread';

export const bookingStatusCopy = {
  confirmed: { label: 'Confirmed', tone: 'success' as const },
  pending_deposit: { label: 'Awaiting deposit', tone: 'warning' as const },
  cancelled: { label: 'Cancelled', tone: 'neutral' as const },
  completed: { label: 'Completed', tone: 'neutral' as const },
  no_show: { label: 'No-show', tone: 'danger' as const }
};

export function BookingDetail({ bookingId, onClose }: {bookingId: string | null;onClose: () => void;}) {
  const { data, apply } = useOps();
  const team = useTeam();
  const { mainHandle } = useMainLink();
  const b = data.bookings.find((x) => x.id === bookingId);
  const [dialog, setDialog] = useState<'cancel' | 'reschedule' | null>(null);
  const [reason, setReason] = useState('');
  const [newStart, setNewStart] = useState<number | null>(null);
  if (!b) return <Sheet open={!!bookingId} onClose={onClose} side="right" title="Booking not found"><p className="p-5 text-label text-fg-muted">It may have been cleared with the sample data.</p></Sheet>;

  const tz = data.availability.timeZone;
  const service = data.services.find((s) => s.id === b.serviceId);
  const start = Date.parse(b.start);
  const past = start < Date.now();
  const open = b.status === 'confirmed' || b.status === 'pending_deposit';
  const bal = bookingBalance(b, service);
  const balanceLink = `${window.location.origin}/p/${mainHandle}/booking/${b.id}`;

  const reschedule = () => {
    if (!service || newStart === null) return;
    let msg: string | undefined;
    if (apply((d) => {const r = rescheduleBooking(d, b.id, newStart, service, 'owner');msg = r.message;return r.data;}) && !msg) {
      toast(`Moved to ${dayLabel(newStart, tz)}, ${timeLabel(newStart, tz)}`, { description: 'The customer would get an update (preview only).' });
      setDialog(null);
    } else if (msg) toast.error(msg);
  };

  return (
    <>
      <Sheet
        open={!!bookingId}
        onClose={onClose}
        side="right"
        title={`${b.serviceName} · ${b.ref}`}
        description={`${dayLabel(start, tz)}, ${timeLabel(start, tz)}`}
        footer={
        open ?
        <div className="flex flex-wrap items-center justify-between gap-2">
              <Button variant="tertiary" size="sm" leadingIcon={BanIcon} onClick={() => setDialog('cancel')}>
                Cancel
              </Button>
              {past ?
          <div className="flex gap-2">
                  <Button variant="secondary" size="sm" leadingIcon={UserXIcon} onClick={() => apply((d) => setBookingStatus(d, b.id, 'no_show', 'Marked as no-show'))}>
                    No-show
                  </Button>
                  <Button size="sm" leadingIcon={CheckCircle2Icon} onClick={() => apply((d) => setBookingStatus(d, b.id, 'completed', 'Marked as completed'))}>
                    Completed
                  </Button>
                </div> :

          <Button size="sm" leadingIcon={CalendarClockIcon} onClick={() => setDialog('reschedule')}>
                  Reschedule
                </Button>
          }
            </div> :
        undefined
        }>
        
        <div className="flex flex-col gap-6 px-5 py-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={bookingStatusCopy[b.status].tone} dot>
              {bookingStatusCopy[b.status].label}
            </Badge>
            {b.sample && <SampleTag />}
          </div>
          <AssigneeSelect
            id={`bk-assignee-${b.id}`}
            value={b.assigneeId}
            className="max-w-xs"
            onChange={(assigneeId) => {
              if (apply((d) => ({ ...d, bookings: d.bookings.map((x) => x.id === b.id ? { ...x, assigneeId } : x) }))) {
                const who = team.data.members.find((m) => m.id === assigneeId)?.name;
                team.log('bookings', who ? `assigned booking ${b.ref} to ${who}` : `unassigned booking ${b.ref}`, `/app/bookings?booking=${b.id}`);
              }
            }} />
          
          <dl className="grid grid-cols-2 gap-4 text-label">
            <div>
              <dt className="text-caption text-fg-subtle">When</dt>
              <dd className="font-semibold text-fg">
                {dayLabel(start, tz)}, {timeLabel(start, tz)}
              </dd>
              <dd className="text-caption text-fg-subtle">{service ? durationLabel(service.durationMin) : ''} · {tz}</dd>
            </div>
            <div>
              <dt className="text-caption text-fg-subtle">Money</dt>
              <dd className="font-semibold text-fg">{b.priceNgn !== null ? formatNgn(b.priceNgn) : 'Price on request'}</dd>
              <dd className="text-caption text-fg-subtle">{b.depositPaidNgn ? `${formatNgn(b.depositPaidNgn)} booking fee paid (test)` : 'No deposit'}</dd>
              {bal.state !== 'none' &&
              <dd className={cn('text-caption', bal.state === 'overdue' ? 'font-medium text-danger' : bal.state === 'paid' ? 'text-success' : 'text-fg-subtle')}>
                  {balanceLabels[bal.state]}
                  {bal.state !== 'paid' && ` · ${formatNgn(bal.amount)}`}
                  {bal.dueAt && bal.state !== 'paid' && ` · by ${dayLabel(bal.dueAt, tz)}, ${timeLabel(bal.dueAt, tz)}`}
                  {bal.state === 'paid' && b.balancePaidHow === 'recorded' && ' (recorded by you)'}
                </dd>
              }
              {open && (bal.state === 'upcoming' || bal.state === 'due' || bal.state === 'overdue' || bal.state === 'at_appointment') &&
              <dd className="mt-1.5 flex flex-wrap gap-1.5">
                  {bal.state !== 'at_appointment' &&
                <Button size="sm" variant="secondary" leadingIcon={CopyIcon} onClick={() => navigator.clipboard?.writeText(balanceLink).then(() => toast.success('Balance link copied'))}>
                      Pay link
                    </Button>
                }
                  <Button size="sm" variant="tertiary" onClick={() => apply((d) => payBookingBalance(d, b.id, 'recorded')) && toast.success('Balance recorded as paid')}>
                    Record as paid
                  </Button>
                </dd>
              }
            </div>
            <div className="col-span-2">
              <dt className="text-caption text-fg-subtle">Customer</dt>
              <dd className="font-semibold text-fg">{b.customer.name}</dd>
              <dd className="text-fg-muted">
                {b.customer.phone} · {b.customer.email}
              </dd>
              {b.customerTimeZone !== tz && <dd className="text-caption text-fg-subtle">Their time zone: {b.customerTimeZone}</dd>}
              {b.customer.phone &&
              <a href={whatsappLink(b.customer.phone, `Hi ${b.customer.name.split(' ')[0]}, about your ${b.serviceName} booking…`)} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1.5 font-semibold text-action hover:underline">
                  <MessageCircleIcon size={14} aria-hidden /> Message on WhatsApp
                </a>
              }
            </div>
            {b.intake &&
            <div className="col-span-2">
                <dt className="text-caption text-fg-subtle">They told you</dt>
                <dd className="rounded-md bg-sunken px-3 py-2 text-fg">{b.intake}</dd>
              </div>
            }
          </dl>
          <section aria-label="History">
            <h3 className="text-label font-semibold text-fg">History</h3>
            <ol className="mt-2 flex flex-col divide-y divide-line border-y border-line">
              {b.events.map((e) =>
              <li key={e.id} className="flex justify-between gap-3 py-2 text-label">
                  <span className="text-fg">{e.label}</span>
                  <span className="shrink-0 text-caption text-fg-subtle">{formatTimestamp(e.at)}</span>
                </li>
              )}
            </ol>
          </section>

          <CommentThread subject={`booking:${b.id}`} subjectLabel={`${b.customer.name}’s ${b.serviceName} booking`} href={`/app/bookings?booking=${b.id}`} area="bookings" className="border-t border-line pt-6" />
        </div>
      </Sheet>

      <Dialog
        open={dialog === 'cancel'}
        onClose={() => setDialog(null)}
        size="sm"
        title={`Cancel ${b.customer.name}’s booking?`}
        description={b.depositPaidNgn ? `When you cancel, the ${formatNgn(b.depositPaidNgn)} deposit is refunded in full (test mode).` : 'Nothing was paid.'}
        footer={
        <>
            <Button variant="secondary" onClick={() => setDialog(null)}>
              Keep it
            </Button>
            <Button
            variant="destructive"
            onClick={() => {
              if (apply((d) => cancelBooking(d, b.id, 'owner', reason.trim()))) {
                toast('Booking cancelled', { description: 'The customer would get a message (preview only).' });
                setDialog(null);
                setReason('');
              }
            }}>
            
              Cancel booking
            </Button>
          </>
        }>
        
        <TextInput id="bk-cancel-reason" label="Reason for the customer" optional value={reason} placeholder="e.g. Studio closed for a family event" onChange={(e) => setReason(e.target.value)} />
      </Dialog>

      <Dialog
        open={dialog === 'reschedule'}
        onClose={() => setDialog(null)}
        size="lg"
        title="Move to another time"
        description="Only free times are shown. The customer is told the new time."
        footer={
        <>
            <Button variant="secondary" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button onClick={reschedule} disabled={newStart === null}>
              Move booking
            </Button>
          </>
        }>
        
        {service ? <OwnerSlotPicker service={service} value={newStart} onChange={setNewStart} ignoreId={b.id} /> : <p className="text-label text-fg-muted">The service was deleted, so it can’t be rescheduled.</p>}
      </Dialog>
    </>);

}