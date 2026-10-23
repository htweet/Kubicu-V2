import React, { useState } from 'react';
import { toast } from 'sonner';
import type { Appeal } from '../../types/admin';
import { audit, staffActor, useAdminStore } from '../../utils/admin/store';
import { formatRelative, formatTimestamp } from '../../utils/format';
import { PageHeader } from '../../components/shell/PageHeader';
import { Badge, type BadgeTone } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Sheet } from '../../components/ui/Sheet';
import { Segmented } from '../../components/ui/Segmented';
import { InlineAlert } from '../../components/ui/InlineAlert';
import { DataTable, type DataColumn } from '../../components/ui/DataTable';
import { Stat, StatGroup } from '../../components/ui/layout/Stat';
import { SampleTag } from '../../components/commerce/StatusBadges';
import { ReasonDialog } from '../../components/admin/ReasonDialog';

type View = 'open' | 'decided';
type Action = {kind: 'reverse' | 'uphold';appeal: Appeal;} | null;

const statusInfo: Record<Appeal['status'], {label: string;tone: BadgeTone;}> = {
  open: { label: 'Waiting', tone: 'warning' },
  reversed: { label: 'Reversed', tone: 'success' },
  upheld: { label: 'Upheld', tone: 'neutral' }
};

const subject = (a: Appeal) => a.kind === 'takedown' ? `kub.icu/${a.handle}` : `${a.workspaceName} (whole workspace)`;

/** Super admin → Appeals: owners ask us to reconsider; a different staff member decides (D83). */
export function AdminAppeals() {
  const [store, setStore] = useAdminStore();
  const [view, setView] = useState<View>('open');
  const [openId, setOpenId] = useState<string | null>(null);
  const [action, setAction] = useState<Action>(null);
  const me = staffActor(store);

  const open = store.appeals.filter((a) => a.status === 'open');
  const decided = store.appeals.filter((a) => a.status !== 'open');
  const reversed = decided.filter((a) => a.status === 'reversed').length;
  const appeal = store.appeals.find((a) => a.id === openId) ?? null;
  const ownDecision = !!appeal && !!appeal.originalBy && appeal.originalBy === me;

  const confirm = (reason: string) => {
    if (!action) return;
    const { appeal: a, kind } = action;
    const now = new Date().toISOString();
    setStore((s) => {
      let next = { ...s, appeals: s.appeals.map((x) => x.id === a.id ? { ...x, status: kind === 'reverse' ? 'reversed' as const : 'upheld' as const, decision: reason, decidedBy: me, decidedAt: now } : x) };
      if (kind === 'reverse') {
        if (a.kind === 'takedown') next = { ...next, takedowns: next.takedowns.filter((t) => t.handle !== a.handle) };else
        {
          const { [a.workspaceId]: _lifted, ...rest } = next.suspended;
          next = { ...next, suspended: rest };
        }
      }
      return audit(next, { area: 'appeals', action: kind === 'reverse' ? `Reversed ${a.kind} on appeal` : `Upheld ${a.kind} on appeal`, target: subject(a), reason });
    });
    toast.success(kind === 'reverse' ? a.kind === 'takedown' ? 'Page restored' : 'Workspace restored' : 'Decision upheld', { description: 'The owner sees your note word for word.' });
    setAction(null);
  };

  const columns: DataColumn<Appeal>[] = [
  {
    key: 'what',
    header: 'Appeal',
    sortValue: (a) => a.workspaceName,
    render: (a) =>
    <span className="min-w-0">
          <span className="flex items-center gap-2">
            <span className="truncate font-semibold text-fg">{subject(a)}</span>
            {a.sample && <SampleTag />}
          </span>
          <span className="block truncate text-caption text-fg-subtle">
            {a.kind === 'takedown' ? 'Page takedown' : 'Suspension'} · from {a.from}
          </span>
        </span>

  },
  {
    key: 'status',
    header: 'Status',
    render: (a) =>
    <Badge tone={statusInfo[a.status].tone} dot>
          {statusInfo[a.status].label}
        </Badge>

  },
  { key: 'when', header: view === 'open' ? 'Waiting' : 'Decided', sortValue: (a) => Date.parse(a.decidedAt ?? a.createdAt), render: (a) => <span className="text-fg-muted">{formatRelative(a.decidedAt ?? a.createdAt)}</span> },
  {
    key: 'open',
    header: '',
    align: 'right',
    render: (a) =>
    <Button size="sm" variant="secondary" onClick={() => setOpenId(a.id)}>
          {a.status === 'open' ? 'Review' : 'View'}
        </Button>

  }];


  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-10 md:py-12">
      <PageHeader title="Appeals" description="Owners asking us to reconsider a takedown or suspension. Someone other than the person who made the decision reviews it." />

      <StatGroup columns={3} className="mt-8 items-end border-b border-line pb-6">
        <Stat primary label="Waiting for a decision" value={open.length} />
        <Stat label="Reversed" value={reversed} hint={`of ${decided.length} decided`} />
        <Stat label="Upheld" value={decided.length - reversed} />
      </StatGroup>

      <div className="mt-8 flex flex-col gap-5">
        <Segmented<View>
          size="sm"
          ariaLabel="Appeals to show"
          value={view}
          onChange={setView}
          options={[
          { value: 'open', label: `Waiting ${open.length}` },
          { value: 'decided', label: `Decided ${decided.length}` }]
          } />
        
        <DataTable
          caption={view === 'open' ? 'Appeals waiting for a decision' : 'Decided appeals'}
          rows={view === 'open' ? open : decided}
          columns={columns}
          filterText={(a) => `${a.workspaceName} ${a.handle ?? ''} ${a.from}`}
          filterPlaceholder="Search workspace, link or owner"
          emptyTitle={view === 'open' ? 'No appeals waiting' : 'No decided appeals yet'}
          emptyDescription="Owners appeal from the banner in their app after a takedown or suspension." />
        
      </div>

      <Sheet
        open={!!appeal}
        onClose={() => setOpenId(null)}
        side="right"
        title={appeal ? subject(appeal) : 'Appeal'}
        description={appeal ? `${appeal.kind === 'takedown' ? 'Page takedown' : 'Suspension'} · ${appeal.workspaceName}` : undefined}
        footer={
        appeal && appeal.status === 'open' && !ownDecision ?
        <div className="flex items-center justify-between gap-3">
              <Button variant="secondary" onClick={() => setAction({ kind: 'uphold', appeal })}>
                Uphold decision
              </Button>
              <Button onClick={() => setAction({ kind: 'reverse', appeal })}>{appeal.kind === 'takedown' ? 'Reverse and restore page' : 'Reverse and restore'}</Button>
            </div> :
        undefined
        }>
        
        {appeal &&
        <div className="flex flex-col divide-y divide-line">
            {ownDecision && appeal.status === 'open' &&
          <div className="px-5 py-4">
                <InlineAlert tone="warning" title="You made the original decision">
                  A different staff member must review this appeal, so it gets a fresh pair of eyes.
                </InlineAlert>
              </div>
          }
            <section aria-labelledby="ap-orig" className="px-5 py-5">
              <h3 id="ap-orig" className="text-label font-semibold text-fg">
                Original decision
              </h3>
              <p className="mt-1 text-label text-fg-muted">{appeal.originalReason}</p>
              <p className="mt-2 text-caption text-fg-subtle">By {appeal.originalBy ?? 'unknown (before staff accounts)'}</p>
            </section>
            <section aria-labelledby="ap-statement" className="px-5 py-5">
              <h3 id="ap-statement" className="text-label font-semibold text-fg">
                What {appeal.from.split(' ')[0]} says
              </h3>
              <p className="mt-1 text-label text-fg">“{appeal.statement}”</p>
              <p className="mt-2 text-caption text-fg-subtle">Sent {formatTimestamp(appeal.createdAt)}</p>
            </section>
            {appeal.kind === 'takedown' &&
          <section aria-labelledby="ap-reports" className="px-5 py-5">
                <h3 id="ap-reports" className="text-label font-semibold text-fg">
                  Reports about this link
                </h3>
                {store.reports.filter((r) => r.handle === appeal.handle).length === 0 ?
            <p className="mt-1 text-caption text-fg-subtle">No visitor reports — taken down by staff directly.</p> :

            <ul className="mt-2 flex flex-col gap-3">
                    {store.reports.
              filter((r) => r.handle === appeal.handle).
              map((r) =>
              <li key={r.id} className="text-label">
                          <span className="font-medium capitalize text-fg">{r.reason}</span>
                          <span className="text-fg-muted"> · “{r.details}”</span>
                        </li>
              )}
                  </ul>
            }
              </section>
          }
            {appeal.decision &&
          <section aria-labelledby="ap-decision" className="px-5 py-5">
                <h3 id="ap-decision" className="text-label font-semibold text-fg">
                  {appeal.status === 'reversed' ? 'Reversed' : 'Upheld'} · note to the owner
                </h3>
                <p className="mt-1 text-label text-fg-muted">{appeal.decision}</p>
                <p className="mt-2 text-caption text-fg-subtle">
                  {appeal.decidedBy} · {appeal.decidedAt ? formatTimestamp(appeal.decidedAt) : ''}
                </p>
              </section>
          }
          </div>
        }
      </Sheet>

      <ReasonDialog
        open={!!action}
        onClose={() => setAction(null)}
        onConfirm={confirm}
        title={action?.kind === 'reverse' ? 'Reverse this decision?' : 'Uphold this decision?'}
        description={
        action?.kind === 'reverse' ?
        action.appeal.kind === 'takedown' ?
        'The page is visible again straight away. Your note is shown to the owner.' :
        'The workspace’s public pages come back straight away. Your note is shown to the owner.' :
        'Nothing changes. Your note is shown to the owner word for word, so explain what they can do next.'
        }
        confirmLabel={action?.kind === 'reverse' ? 'Reverse' : 'Uphold'} />
      
    </div>);

}