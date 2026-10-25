import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeftIcon, DownloadIcon, MoreHorizontalIcon, ScanLineIcon, SendIcon, UndoIcon, UserCheckIcon, UserPlusIcon, ReceiptIcon } from 'lucide-react';
import type { CommerceEvent } from '../../types/commerce';
import { useCommerce } from '../../contexts/CommerceContext';
import { useTeam } from '../../contexts/TeamContext';
import { addCompTicket, checkedInCount, eventHeld, eventSold, eventTickets, eventTotalSeats, findEvent, setCheckedIn, ticketStatus, ticketStatusLabel, type TicketRef, type TicketStatus } from '../../utils/commerce/tickets';
import { formatEventDate, formatEventTime } from '../../utils/eventTime';
import { downloadCsv, toCsv } from '../../utils/csv';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import { Badge, type BadgeTone } from '../../components/ui/Badge';
import { Menu } from '../../components/ui/Menu';
import { Segmented } from '../../components/ui/Segmented';
import { SelectInput } from '../../components/ui/SelectInput';
import { DataTable, type DataColumn } from '../../components/ui/DataTable';
import { Dialog } from '../../components/ui/Dialog';
import { TextInput } from '../../components/ui/TextInput';
import { EmptyState } from '../../components/ui/EmptyState';
import { SampleTag } from '../../components/commerce/StatusBadges';
import { Stat, StatGroup } from '../../components/ui/layout/Stat';
import { SeatMapOverview } from '../../components/commerce/SeatMapOverview';
import { TicketDetailSheet } from '../../components/commerce/TicketDetailSheet';
import { EyeIcon } from 'lucide-react';

type Filter = 'all' | TicketStatus;
interface Row extends TicketRef {
  id: string;
  status: TicketStatus;
}

const tone: Record<TicketStatus, BadgeTone> = { valid: 'neutral', checked_in: 'success', void: 'danger', pending: 'warning' };
const time = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

/** Commerce → Events → Guest list: every ticket, check-in state and comp tickets (D74). */
export function GuestList() {
  const { eventId = '' } = useParams();
  const navigate = useNavigate();
  const { data, apply } = useCommerce();
  const team = useTeam();
  const ev = findEvent(data, eventId);
  const [filter, setFilter] = useState<Filter>('all');
  const [type, setType] = useState('all');
  const [adding, setAdding] = useState(false);
  const [view, setView] = useState<'list' | 'map'>('list');
  const [openId, setOpenId] = useState<string | null>(null);
  const canCheckIn = team.can('tickets.checkin');

  const rows: Row[] = useMemo(
    () => ev ? eventTickets(data, ev.id).map((r) => ({ ...r, id: r.ticket.id, status: ticketStatus(r, ev) })) : [],
    [data, ev]
  );
  const bySeat = useMemo(() => new Map(rows.filter((r) => r.ticket.seatId && r.status !== 'void').map((r) => [r.ticket.seatId as string, r])), [rows]);
  const opened = rows.find((r) => r.id === openId) ?? null;
  if (!ev) {
    return (
      <EmptyState framed className="mt-8" icon={ReceiptIcon} title="Event not found" description="It may have been deleted." action={<Button onClick={() => navigate('/app/commerce/events')}>Back to events</Button>} />);

  }

  const shown = rows.filter((r) => (filter === 'all' || r.status === filter) && (type === 'all' || r.ticket.ticketTypeId === type));
  const count = (s: TicketStatus) => rows.filter((r) => r.status === s).length;
  const inCount = checkedInCount(data, ev);
  const admittable = rows.filter((r) => r.status === 'valid' || r.status === 'checked_in').length;

  const toggle = (r: Row) => {
    if (!canCheckIn.allowed) return toast.error(canCheckIn.reason);
    const undo = r.status === 'checked_in';
    if (apply((d) => setCheckedIn(d, r.ticket.id, undo ? null : team.me.name))) toast(undo ? `${r.ticket.guestName} is no longer checked in` : `${r.ticket.guestName} checked in`);
  };

  const exportCsv = () => {
    downloadCsv(
      `${ev.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-guests.csv`,
      toCsv(
        ['ticket', 'guest', 'type', 'status', 'checked_in_at', 'checked_in_by', 'order', 'buyer', 'phone', 'email', 'complimentary'],
        rows.map((r) => [r.ticket.code, r.ticket.guestName, r.ticket.seat ? `${r.ticket.typeName} — ${r.ticket.seat}` : r.ticket.typeName, ticketStatusLabel[r.status], r.ticket.checkedInAt ?? '', r.ticket.checkedInBy ?? '', `#${r.order.number}`, r.order.customer.name, r.order.customer.phone, r.order.customer.email, r.ticket.comp ? 'yes' : ''])
      )
    );
  };

  const columns: DataColumn<Row>[] = [
  {
    key: 'guest',
    header: 'Guest',
    sortValue: (r) => r.ticket.guestName,
    render: (r) =>
    <span className="min-w-0">
          <span className="flex items-center gap-2">
            <button type="button" onClick={() => setOpenId(r.id)} className="truncate text-left font-semibold text-fg hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-sm">
              {r.ticket.guestName}
            </button>
            {r.ticket.comp && <Badge tone="info">Comp</Badge>}
            {r.order.sample && <SampleTag />}
          </span>
          <span className="block truncate font-mono text-caption text-fg-subtle">{r.ticket.code}</span>
        </span>

  },
  { key: 'type', header: 'Ticket', sortValue: (r) => `${r.ticket.typeName} ${r.ticket.seat ?? ''}`, render: (r) => <span className="text-fg-muted">{r.ticket.typeName}{r.ticket.seat && <span className="block text-caption text-fg">{r.ticket.seat}</span>}</span> },
  {
    key: 'order',
    header: 'Order',
    hideOnMobile: true,
    sortValue: (r) => r.order.number,
    render: (r) =>
    <Link to={`/app/commerce/orders?order=${r.order.id}`} className="text-fg-muted hover:text-fg hover:underline">
          #{r.order.number} · {r.order.customer.name}
        </Link>

  },
  {
    key: 'status',
    header: 'Status',
    sortValue: (r) => r.status,
    render: (r) =>
    <span className="flex flex-col items-start gap-0.5">
          <Badge tone={tone[r.status]} dot>
            {ticketStatusLabel[r.status]}
          </Badge>
          {r.status === 'checked_in' && r.ticket.checkedInAt &&
      <span className="text-meta text-fg-subtle">
              {time(r.ticket.checkedInAt)}
              {r.ticket.checkedInBy ? ` · ${r.ticket.checkedInBy}` : ''}
            </span>
      }
        </span>

  },
  {
    key: 'actions',
    header: '',
    align: 'right',
    render: (r) =>
    <span className="flex items-center justify-end gap-1">
          {(r.status === 'valid' || r.status === 'checked_in') &&
      <Button size="sm" variant={r.status === 'checked_in' ? 'tertiary' : 'secondary'} leadingIcon={r.status === 'checked_in' ? UndoIcon : UserCheckIcon} disabled={!canCheckIn.allowed} onClick={() => toggle(r)}>
              {r.status === 'checked_in' ? 'Undo' : 'Check in'}
            </Button>
      }
          <Menu
        align="end"
        items={[
        { id: 'view', label: 'View ticket', icon: EyeIcon, onSelect: () => setOpenId(r.id) },
        { id: 'resend', label: 'Resend ticket', icon: SendIcon, onSelect: () => toast('Ticket resent (preview)', { description: `Would go to ${r.order.customer.email || r.order.customer.phone}. Messages aren’t sent in the prototype.` }) },
        { id: 'order', label: 'Open order', icon: ReceiptIcon, onSelect: () => navigate(`/app/commerce/orders?order=${r.order.id}`) }]
        }
        trigger={(props) => <IconButton {...props} size="sm" icon={MoreHorizontalIcon} label={`More for ${r.ticket.guestName}`} />} />
      
        </span>

  }];


  return (
    <>
      <Link to="/app/commerce/events" className="mb-3 inline-flex items-center gap-1.5 text-label font-medium text-fg-muted hover:text-fg">
        <ArrowLeftIcon size={15} aria-hidden /> Events
      </Link>
      <PageHeader
        title={`${ev.name} · Guest list`}
        description={`${formatEventDate(ev.startsAt, ev.timeZone)} · ${formatEventTime(ev.startsAt, ev.timeZone)} · ${ev.online ? 'Online' : ev.venue}`}
        actions={
        <>
            <Button variant="secondary" leadingIcon={DownloadIcon} onClick={exportCsv} disabled={!rows.length}>
              Export CSV
            </Button>
            <Button variant="secondary" leadingIcon={UserPlusIcon} onClick={() => setAdding(true)} disabled={ev.status === 'cancelled'}>
              Add guest
            </Button>
            <Button leadingIcon={ScanLineIcon} onClick={() => navigate(`/app/commerce/events/${ev.id}/check-in`)} disabled={!canCheckIn.allowed || ev.status === 'cancelled'}>
              Check in guests
            </Button>
          </>
        } />
      

      <StatGroup columns={4} className="mt-8 items-end border-b border-line pb-6">
        <Stat primary label="Checked in" value={<>{inCount} <span className="text-heading font-medium text-fg-subtle">/ {admittable}</span></>} />
        <Stat label="Seats sold" value={`${eventSold(data, ev)} of ${eventTotalSeats(ev)}`} hint={eventHeld(data, ev) > 0 ? `+${eventHeld(data, ev)} held in checkout` : undefined} />
        {ev.ticketTypes.map((t) =>
        <Stat key={t.id} label={t.name} value={rows.filter((r) => r.ticket.ticketTypeId === t.id && r.status !== 'void').length} />
        )}
      </StatGroup>

      {ev.seating &&
      <div className="mt-6">
          <Segmented<'list' | 'map'>
          ariaLabel="Guest list view"
          value={view}
          onChange={setView}
          options={[
          { value: 'list', label: 'Guest list' },
          { value: 'map', label: 'Seat map' }]
          } />
        
        </div>
      }

      {ev.seating && view === 'map' ?
      <div className="mt-6">
          <SeatMapOverview data={data} event={ev} bySeat={bySeat} onOpen={setOpenId} />
        </div> :
      rows.length === 0 ?
      <EmptyState framed className="mt-8" icon={UserPlusIcon} title="No guests yet" description="Tickets appear here the moment they’re bought. You can also add a guest yourself." action={<Button onClick={() => setAdding(true)}>Add guest</Button>} /> :

      <>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-full overflow-x-auto overflow-y-hidden">
              <Segmented<Filter>
              ariaLabel="Show guests"
              value={filter}
              onChange={setFilter}
              options={[
              { value: 'all', label: `All · ${rows.length}` },
              { value: 'valid', label: `Not in · ${count('valid')}` },
              { value: 'checked_in', label: `In · ${count('checked_in')}` },
              { value: 'void', label: `Void · ${count('void')}` }]
              } />
            
            </div>
            {ev.ticketTypes.length > 1 &&
          <div className="sm:w-48">
                <SelectInput id="gl-type" label="Ticket type" value={type} onChange={setType} options={[{ value: 'all', label: 'All types' }, ...ev.ticketTypes.map((t) => ({ value: t.id, label: t.name }))]} />
              </div>
          }
          </div>
          <div className="mt-4">
            <DataTable caption="Guests" rows={shown} columns={columns} filterText={(r) => `${r.ticket.guestName} ${r.ticket.code} ${r.order.customer.name} ${r.order.customer.phone} #${r.order.number}`} filterPlaceholder="Search name, code or order" emptyTitle="No guests match" />
          </div>
        </>
      }

      <AddGuestDialog open={adding} event={ev} onClose={() => setAdding(false)} />
      <TicketDetailSheet ticket={opened} event={ev} canCheckIn={canCheckIn.allowed} onToggleCheckIn={() => opened && toggle(opened)} onClose={() => setOpenId(null)} />
    </>);

}

function AddGuestDialog({ open, event: ev, onClose }: {open: boolean;event: CommerceEvent;onClose: () => void;}) {
  const { apply } = useCommerce();
  const team = useTeam();
  const [form, setForm] = useState({ name: '', phone: '', email: '', type: ev.ticketTypes[0]?.id ?? '', qty: '1' });
  const [error, setError] = useState('');

  const save = () => {
    if (!form.name.trim()) return setError('Add the guest’s name.');
    const qty = Math.max(1, Math.min(10, Math.floor(Number(form.qty) || 1)));
    let problem = '';
    const ok = apply((d) => {
      const r = addCompTicket(d, ev.id, form.type, { name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim() }, qty);
      problem = r.error ?? '';
      return r.data;
    });
    if (problem) return setError(problem);
    if (!ok) return;
    team.log('commerce', `added ${qty} complimentary ticket${qty === 1 ? '' : 's'} for ${form.name.trim()} to ${ev.name}`, `/app/commerce/events/${ev.id}/guests`);
    toast.success(`${form.name.trim()} added`, { description: 'A ₦0 order was created so seats and check-in stay accurate.' });
    setForm({ name: '', phone: '', email: '', type: ev.ticketTypes[0]?.id ?? '', qty: '1' });
    setError('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Add a guest"
      description="A complimentary ticket — a friend, speaker or press. It takes a seat like any ticket."
      footer={
      <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>Add guest</Button>
        </div>
      }>
      
      <div className="flex flex-col gap-4">
        <TextInput id="ag-name" label="Name" value={form.name} error={error && !form.name.trim() ? error : undefined} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput id="ag-phone" label="Phone" optional type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          <TextInput id="ag-email" label="Email" optional type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_96px] gap-4">
          <SelectInput id="ag-type" label="Ticket type" value={form.type} onChange={(type) => setForm((f) => ({ ...f, type }))} options={ev.ticketTypes.map((t) => ({ value: t.id, label: t.name }))} />
          <TextInput id="ag-qty" label="Tickets" type="number" inputMode="numeric" min={1} max={10} value={form.qty} onChange={(e) => setForm((f) => ({ ...f, qty: e.target.value }))} />
        </div>
        {error && form.name.trim() &&
        <p className="text-caption font-medium text-danger" role="alert">
            {error}
          </p>
        }
      </div>
    </Dialog>);

}