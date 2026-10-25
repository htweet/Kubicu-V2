import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { MessageSquareIcon, MoreHorizontalIcon, StickyNoteIcon, EyeIcon } from 'lucide-react';
import type { Order } from '../../types/commerce';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { readCommerce } from '../../utils/commerce/storage';
import { orderMoney } from '../../utils/commerce/money';
import { audit, staffActor, staffReplyName, useAdminStore } from '../../utils/admin/store';
import { uid } from '../../utils/id';
import { formatNgn, formatRelative, formatTimestamp } from '../../utils/format';
import { PageHeader } from '../../components/shell/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Menu } from '../../components/ui/Menu';
import { IconButton } from '../../components/ui/IconButton';
import { Tabs } from '../../components/ui/Tabs';
import { Sheet } from '../../components/ui/Sheet';
import { DetailList, DetailSection } from '../../components/ui/layout/DetailList';
import { Dialog } from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';
import { TextArea } from '../../components/ui/TextArea';
import { DataTable, type DataColumn } from '../../components/ui/DataTable';
import { Stat, StatGroup } from '../../components/ui/layout/Stat';
import { ReasonDialog } from '../../components/admin/ReasonDialog';

interface Row {
  id: string;
  workspaceId: string;
  workspace: string;
  order: Order;
  gross: number;
  refunded: number;
  flag: 'dispute' | 'refund' | 'stuck' | null;
  dueAt: string | null;
}

type Tab = 'dispute' | 'refund' | 'stuck';
const LARGE_REFUND = 50000;
const STUCK_HOURS = 24;

const disputeLabels = { needs_response: 'Seller must respond', under_review: 'With the provider', won: 'Won', lost: 'Lost' } as const;

/** Super admin → Orders & disputes: help sellers with disputes, big refunds and stuck payments (D82). Staff never move money. */
export function AdminOrders() {
  const { workspaces } = useWorkspace();
  const [store, setStore] = useAdminStore();
  const [tab, setTab] = useState<Tab>('dispute');
  const [open, setOpen] = useState<Row | null>(null);
  const [noteFor, setNoteFor] = useState<Row | null>(null);
  const [note, setNote] = useState('');
  const [messageFor, setMessageFor] = useState<Row | null>(null);
  const [message, setMessage] = useState('');

  const rows: Row[] = useMemo(() => {
    const now = Date.now();
    return workspaces.flatMap((w) =>
    (readCommerce(w.id)?.orders ?? []).map((o) => {
      const m = orderMoney(o);
      const recentBigRefund = o.refunds.some((r) => r.amountNgn >= LARGE_REFUND && now - Date.parse(r.at) < 30 * 86400000);
      const stuck = !o.pod && o.paymentStatus === 'pending' && o.status !== 'cancelled' && now - Date.parse(o.createdAt) > STUCK_HOURS * 3600000;
      const flag: Row['flag'] = o.dispute && (o.dispute.status === 'needs_response' || o.dispute.status === 'under_review') ? 'dispute' : recentBigRefund ? 'refund' : stuck ? 'stuck' : null;
      return { id: `${w.id}:${o.id}`, workspaceId: w.id, workspace: w.name, order: o, gross: m.gross, refunded: m.refunded, flag, dueAt: o.dispute?.status === 'needs_response' ? o.dispute.respondBy : null };
    })
    );
  }, [workspaces]);

  const disputes = rows.filter((r) => r.flag === 'dispute');
  const refunds = rows.filter((r) => r.flag === 'refund');
  const stuck = rows.filter((r) => r.flag === 'stuck');
  const list = tab === 'dispute' ? disputes : tab === 'refund' ? refunds : stuck;
  const atRisk = disputes.reduce((s, r) => s + (r.order.dispute?.amountNgn ?? 0), 0);
  const dueSoon = disputes.filter((r) => r.dueAt && Date.parse(r.dueAt) - Date.now() < 2 * 86400000).length;

  const saveNote = () => {
    if (!noteFor || note.trim().length < 3) return;
    const entry = { id: uid('onote'), at: new Date().toISOString(), by: staffActor(), text: note.trim() };
    setStore((s) => audit({ ...s, orderNotes: { ...s.orderNotes, [noteFor.id]: [entry, ...(s.orderNotes[noteFor.id] ?? [])] } }, { area: 'orders', action: 'Added staff note', target: `${noteFor.workspace} · #${noteFor.order.number}`, reason: note.trim() }));
    toast.success('Note added', { description: 'Only KUBICU staff can see it.' });
    setNoteFor(null);
    setNote('');
  };

  const sendMessage = (reason: string) => {
    if (!messageFor || message.trim().length < 10) {
      toast.error('Write the message to the seller first');
      return;
    }
    const r = messageFor;
    const at = new Date().toISOString();
    setStore((s) => {
      const number = Math.max(1000, ...s.tickets.map((t) => t.number)) + 1;
      return audit(
        {
          ...s,
          tickets: [
          {
            id: uid('tkt'),
            number,
            workspaceId: r.workspaceId,
            workspaceName: r.workspace,
            from: staffReplyName(),
            topic: 'payments',
            subject: `About order #${r.order.number}`,
            status: 'waiting',
            createdAt: at,
            updatedAt: at,
            messages: [{ id: uid('msg'), by: 'staff', name: staffReplyName(), text: message.trim(), at }]
          },
          ...s.tickets]

        },
        { area: 'orders', action: 'Messaged seller about an order', target: `${r.workspace} · #${r.order.number}`, reason }
      );
    });
    toast.success('Message sent to the seller', { description: 'It appears in their Help → My requests, and in Support here.' });
    setMessageFor(null);
    setMessage('');
  };

  const columns: DataColumn<Row>[] = [
  {
    key: 'order',
    header: 'Order',
    sortValue: (r) => r.order.number,
    render: (r) =>
    <span className="min-w-0">
          <span className="block truncate font-semibold text-fg">
            #{r.order.number} · {r.order.customer.name || 'Customer'}
          </span>
          <span className="block truncate text-caption text-fg-subtle">
            {r.workspace} · {formatRelative(r.order.createdAt)}
          </span>
        </span>

  },
  {
    key: 'state',
    header: tab === 'dispute' ? 'Dispute' : tab === 'refund' ? 'Refunded' : 'Waiting',
    render: (r) =>
    tab === 'dispute' && r.order.dispute ?
    <span className="flex flex-col gap-0.5">
            <Badge tone={r.order.dispute.status === 'needs_response' ? 'warning' : 'info'} dot>
              {disputeLabels[r.order.dispute.status]}
            </Badge>
            {r.dueAt && <span className="text-caption text-fg-subtle">Respond by {formatTimestamp(r.dueAt)}</span>}
          </span> :
    tab === 'refund' ?
    <span className="tabular-nums text-fg">{formatNgn(r.refunded)}</span> :

    <span className="text-fg-muted">Payment pending {formatRelative(r.order.createdAt).replace(/ ago$/, '')}</span>

  },
  { key: 'amount', header: tab === 'dispute' ? 'Disputed' : 'Order total', align: 'right', sortValue: (r) => tab === 'dispute' ? r.order.dispute?.amountNgn ?? 0 : r.gross, render: (r) => <span className="font-semibold tabular-nums text-fg">{formatNgn(tab === 'dispute' ? r.order.dispute?.amountNgn ?? 0 : r.gross)}</span> },
  { key: 'notes', header: 'Notes', align: 'right', hideOnMobile: true, render: (r) => <span className="tabular-nums text-fg-subtle">{store.orderNotes[r.id]?.length || '—'}</span> },
  {
    key: 'actions',
    header: '',
    align: 'right',
    render: (r) =>
    <Menu
      items={[
      { id: 'view', label: 'View details', icon: EyeIcon, onSelect: () => setOpen(r) },
      { id: 'note', label: 'Add staff note…', icon: StickyNoteIcon, onSelect: () => setNoteFor(r) },
      { id: 'msg', label: 'Message the seller…', icon: MessageSquareIcon, onSelect: () => setMessageFor(r) }]
      }
      trigger={(props) => <IconButton {...props} size="sm" icon={MoreHorizontalIcon} label={`Actions for order #${r.order.number}`} />} />


  }];


  const detail = open && rows.find((r) => r.id === open.id);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-10 md:py-12">
      <PageHeader title="Orders & disputes" description="Help sellers through disputes, large refunds and stuck payments. Staff can add notes and message the seller, but never refund or move money themselves." />

      <StatGroup columns={3} className="mt-8 items-end border-b border-line pb-6">
        <Stat primary label="Disputed amount" value={formatNgn(atRisk)} hint={`${disputes.length} open dispute${disputes.length === 1 ? '' : 's'}`} />
        <Stat label="Due in 2 days" value={<span className={dueSoon ? 'text-warning' : undefined}>{dueSoon}</span>} hint="Seller response deadline" />
        <Stat label="Stuck payments" value={stuck.length} hint={`Pending over ${STUCK_HOURS} h`} />
      </StatGroup>

      <div className="mt-8 flex flex-col gap-5">
        <Tabs<Tab>
          idPrefix="admin-orders"
          ariaLabel="Order queues"
          value={tab}
          onChange={setTab}
          items={[
          { id: 'dispute', label: 'Disputes', badge: disputes.length || undefined },
          { id: 'refund', label: `Refunds over ${formatNgn(LARGE_REFUND)}`, badge: refunds.length || undefined },
          { id: 'stuck', label: 'Stuck payments', badge: stuck.length || undefined }]
          } />
        
        <div role="tabpanel" id={`admin-orders-panel-${tab}`} aria-labelledby={`admin-orders-tab-${tab}`}>
          <DataTable
            caption="Orders needing staff attention"
            rows={list}
            columns={columns}
            filterText={(r) => `${r.order.number} ${r.order.customer.name} ${r.workspace}`}
            filterPlaceholder="Search order, customer or workspace"
            emptyTitle={tab === 'dispute' ? 'No open disputes' : tab === 'refund' ? 'No large refunds in 30 days' : 'No stuck payments'}
            emptyDescription="Queues fill from every workspace on this device." />
          
        </div>
      </div>

      <Sheet open={!!detail} onClose={() => setOpen(null)} side="right" title={detail ? `Order #${detail.order.number}` : 'Order'} description={detail ? `${detail.workspace} · ${formatTimestamp(detail.order.createdAt)}` : undefined}>
        {detail &&
        <div className="flex flex-col gap-6 px-5 py-5">
            <DetailSection title="Order">
              <DetailList
              items={[
              { label: 'Customer', value: detail.order.customer.name || '—' },
              { label: 'Total', value: <span className="font-semibold tabular-nums">{formatNgn(detail.gross)}</span> },
              { label: 'Payment', value: <span className="capitalize">{detail.order.paymentStatus.replace('_', ' ')}</span> },
              { label: 'Refunded', value: <span className="tabular-nums">{detail.refunded ? formatNgn(detail.refunded) : '—'}</span> }]
              } />
            
            </DetailSection>
            {detail.order.dispute &&
          <DetailSection title={`Dispute · ${disputeLabels[detail.order.dispute.status]}`}>
                <div>
                <p className="text-label text-fg-muted">“{detail.order.dispute.reason}”</p>
                <p className="mt-2 text-caption text-fg-subtle">
                  {formatNgn(detail.order.dispute.amountNgn)} · opened {formatRelative(detail.order.dispute.openedAt)} · {detail.order.dispute.evidence.length} file{detail.order.dispute.evidence.length === 1 ? '' : 's'} of evidence
                  {detail.order.dispute.response ? ' · seller has responded' : ' · no response yet'}
                </p>
                </div>
              </DetailSection>
          }
            <DetailSection
            title="Staff notes"
            actions={
            <Button size="sm" variant="secondary" leadingIcon={StickyNoteIcon} onClick={() => setNoteFor(detail)}>
                  Add note
                </Button>
            }>
            
              {(store.orderNotes[detail.id] ?? []).length === 0 ?
            <p className="text-caption text-fg-subtle">No notes yet. Only staff can see notes.</p> :

            <ul className="flex flex-col gap-3">
                  {store.orderNotes[detail.id].map((n) =>
              <li key={n.id} className="text-label">
                      <p className="text-fg">{n.text}</p>
                      <p className="mt-0.5 text-caption text-fg-subtle">
                        {n.by} · {formatRelative(n.at)}
                      </p>
                    </li>
              )}
                </ul>
            }
            </DetailSection>
          </div>
        }
      </Sheet>

      <Dialog
        open={!!noteFor}
        onClose={() => setNoteFor(null)}
        size="sm"
        title={`Note on order #${noteFor?.order.number ?? ''}`}
        description="Visible to KUBICU staff only, and kept in the audit log."
        footer={
        <>
            <Button variant="secondary" onClick={() => setNoteFor(null)}>
              Cancel
            </Button>
            <Button onClick={saveNote} disabled={note.trim().length < 3}>
              Add note
            </Button>
          </>
        }>
        
        <TextArea id="ao-note" label="Note" rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Seller sent courier proof by email — attach to response" />
      </Dialog>

      <ReasonDialog open={!!messageFor} onClose={() => setMessageFor(null)} onConfirm={sendMessage} title={`Message ${messageFor?.workspace ?? 'the seller'}`} description="Opens a support request in their Help → My requests. Write the message, then why you’re contacting them (for the audit log)." confirmLabel="Send message">
        <TextArea id="ao-message" label="Message to the seller" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={`e.g. A buyer has disputed order #${messageFor?.order.number ?? ''}. Please add delivery proof in Orders before the deadline.`} />
      </ReasonDialog>
    </div>);

}