import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2Icon, CircleIcon } from 'lucide-react';
import type { DataRequest, DataRequestKind, DataRequestStatus } from '../../types/admin';
import { audit, DATA_REQUEST_DAYS, useAdminStore } from '../../utils/admin/store';
import { readAccount } from '../../utils/account/store';
import { formatRelative, formatTimestamp } from '../../utils/format';
import { PageHeader } from '../../components/shell/PageHeader';
import { Badge, type BadgeTone } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Sheet } from '../../components/ui/Sheet';
import { Segmented } from '../../components/ui/Segmented';
import { DataTable, type DataColumn } from '../../components/ui/DataTable';
import { Stat, StatGroup } from '../../components/ui/layout/Stat';
import { SampleTag } from '../../components/commerce/StatusBadges';
import { ReasonDialog } from '../../components/admin/ReasonDialog';

const kindLabels: Record<DataRequestKind, string> = { export: 'Copy of data', delete: 'Delete data', correct: 'Correct data' };
const statusInfo: Record<DataRequestStatus, { label: string; tone: BadgeTone }> = {
  new: { label: 'New', tone: 'warning' },
  in_progress: { label: 'In progress', tone: 'info' },
  completed: { label: 'Completed', tone: 'success' },
  refused: { label: 'Refused', tone: 'neutral' },
};

/** What staff must do for each kind of request, in order. */
const checklist: Record<DataRequestKind, { id: string; label: string }[]> = {
  export: [
    { id: 'verify', label: 'Confirm it’s really them (reply from the email on the records)' },
    { id: 'collect', label: 'Gather orders, bookings, contact record and messages from the workspace' },
    { id: 'send', label: 'Send a secure, expiring download link' },
  ],
  delete: [
    { id: 'verify', label: 'Confirm it’s really them' },
    { id: 'collect', label: 'Tell the seller and check for anything that must be kept (tax records, open disputes)' },
    { id: 'erase', label: 'Remove personal details; keep order totals anonymised for tax' },
  ],
  correct: [
    { id: 'verify', label: 'Confirm it’s really them' },
    { id: 'fix', label: 'Correct the record and tell the seller what changed' },
  ],
};

type View = 'open' | 'closed' | 'account';
type Action = { kind: 'complete' | 'refuse'; req: DataRequest } | null;

interface AccountRow {
  id: string;
  what: string;
  at: string;
  state: string;
}

/** Super admin → Data requests: personal-data requests with deadlines, checklists and outcomes (D82). */
export function AdminDataRequests() {
  const [store, setStore] = useAdminStore();
  const [view, setView] = useState<View>('open');
  const [openId, setOpenId] = useState<string | null>(null);
  const [action, setAction] = useState<Action>(null);

  const reqs = store.dataRequests;
  const open = reqs.filter((r) => r.status === 'new' || r.status === 'in_progress');
  const closed = reqs.filter((r) => r.status === 'completed' || r.status === 'refused');
  const overdue = open.filter((r) => Date.parse(r.dueAt) < Date.now()).length;
  const dueWeek = open.filter((r) => Date.parse(r.dueAt) - Date.now() < 7 * 86400000).length;

  const account = useMemo(() => readAccount(), []);
  const accountRows: AccountRow[] = [
    ...account.exports.map((e) => ({ id: e.id, what: `${account.profile.name} · copy of account data`, at: e.requestedAt, state: Date.parse(e.readyAt) <= Date.now() ? 'Ready — handled automatically' : 'Preparing' })),
    ...(account.deletion ? [{ id: 'deletion', what: `${account.profile.name} · delete account`, at: account.deletion.requestedAt, state: `Scheduled for ${formatTimestamp(account.deletion.scheduledFor)} · can still cancel` }] : []),
  ];

  const req = reqs.find((r) => r.id === openId) ?? null;
  const patch = (id: string, p: Partial<DataRequest>) => setStore((s) => ({ ...s, dataRequests: s.dataRequests.map((r) => (r.id === id ? { ...r, ...p } : r)) }));

  const toggleStep = (r: DataRequest, step: string) => {
    const steps = r.steps.includes(step) ? r.steps.filter((x) => x !== step) : [...r.steps, step];
    patch(r.id, { steps, status: r.status === 'new' ? 'in_progress' : r.status });
  };

  const confirm = (reason: string) => {
    if (!action) return;
    const { req: r, kind } = action;
    const status: DataRequestStatus = kind === 'complete' ? 'completed' : 'refused';
    setStore((s) =>
      audit(
        { ...s, dataRequests: s.dataRequests.map((x) => (x.id === r.id ? { ...x, status, outcome: reason, closedAt: new Date().toISOString() } : x)) },
        { area: 'data', action: kind === 'complete' ? `Completed ${kindLabels[r.kind].toLowerCase()} request` : `Refused ${kindLabels[r.kind].toLowerCase()} request`, target: `${r.name}${r.workspaceName ? ` · ${r.workspaceName}` : ''}`, reason },
      ),
    );
    toast.success(kind === 'complete' ? 'Request completed' : 'Request refused', { description: 'The outcome is kept with the request and in the audit log.' });
    setAction(null);
  };

  const dueBadge = (r: DataRequest) => {
    if (r.status === 'completed' || r.status === 'refused') return <span className="text-fg-muted">{r.closedAt ? formatRelative(r.closedAt) : '—'}</span>;
    const daysLeft = Math.ceil((Date.parse(r.dueAt) - Date.now()) / 86400000);
    return daysLeft < 0 ? (
      <Badge tone="danger" dot>
        {-daysLeft} day{daysLeft === -1 ? '' : 's'} overdue
      </Badge>
    ) : (
      <span className={daysLeft <= 7 ? 'font-semibold text-warning' : 'text-fg-muted'}>{daysLeft} day{daysLeft === 1 ? '' : 's'} left</span>
    );
  };

  const columns: DataColumn<DataRequest>[] = [
    {
      key: 'who',
      header: 'Request',
      sortValue: (r) => r.name,
      render: (r) => (
        <span className="min-w-0">
          <span className="flex items-center gap-2">
            <span className="truncate font-semibold text-fg">{r.name}</span>
            {r.sample && <SampleTag />}
          </span>
          <span className="block truncate text-caption text-fg-subtle">
            {kindLabels[r.kind]} · {r.subject === 'visitor' ? `customer of ${r.workspaceName}` : 'account holder'}
          </span>
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <Badge tone={statusInfo[r.status].tone} dot>
          {statusInfo[r.status].label}
        </Badge>
      ),
    },
    { key: 'due', header: view === 'closed' ? 'Closed' : 'Deadline', sortValue: (r) => Date.parse(r.closedAt ?? r.dueAt), render: dueBadge },
    { key: 'received', header: 'Received', hideOnMobile: true, sortValue: (r) => Date.parse(r.receivedAt), render: (r) => <span className="text-fg-muted">{formatRelative(r.receivedAt)}</span> },
    {
      key: 'open',
      header: '',
      align: 'right',
      render: (r) => (
        <Button size="sm" variant="secondary" onClick={() => setOpenId(r.id)}>
          {view === 'closed' ? 'View' : 'Work on it'}
        </Button>
      ),
    },
  ];

  const accountColumns: DataColumn<AccountRow>[] = [
    { key: 'what', header: 'Request', render: (r) => <span className="font-semibold text-fg">{r.what}</span> },
    { key: 'state', header: 'Status', render: (r) => <span className="text-fg-muted">{r.state}</span> },
    { key: 'at', header: 'Requested', sortValue: (r) => Date.parse(r.at), render: (r) => <span className="text-fg-muted">{formatRelative(r.at)}</span> },
  ];

  const stepsDone = req ? checklist[req.kind].every((s) => req.steps.includes(s.id)) : false;
  const closedReq = req && (req.status === 'completed' || req.status === 'refused');

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-10 md:py-12">
      <PageHeader title="Data requests" description="Requests to see, correct or delete personal data — from account holders and from customers of the businesses on KUBICU." />

      <StatGroup columns={3} className="mt-8 items-end border-b border-line pb-6">
        <Stat primary label="Open requests" value={open.length} hint={`${closed.length} closed`} />
        <Stat label="Due within 7 days" value={<span className={dueWeek ? 'text-warning' : undefined}>{dueWeek}</span>} />
        <Stat
          label="Overdue"
          value={<span className={overdue ? 'text-danger' : undefined}>{overdue}</span>}
          hint={
            <span className="inline-flex items-center gap-1.5">
              {DATA_REQUEST_DAYS}-day deadline
            </span>
          }
        />
      </StatGroup>

      <div className="mt-8 flex flex-col gap-5">
        <Segmented<View>
          size="sm"
          ariaLabel="Requests to show"
          value={view}
          onChange={setView}
          options={[
            { value: 'open', label: `Open ${open.length}` },
            { value: 'closed', label: `Closed ${closed.length}` },
            { value: 'account', label: `Account self-service ${accountRows.length}` },
          ]}
        />
        {view === 'account' ? (
          <DataTable caption="Account self-service requests" rows={accountRows} columns={accountColumns} emptyTitle="No self-service requests" emptyDescription="Data copies and account deletions requested in Your account → Data & privacy appear here. They run automatically." />
        ) : (
          <DataTable
            caption={view === 'open' ? 'Open data requests' : 'Closed data requests'}
            rows={view === 'open' ? [...open].sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt)) : closed}
            columns={columns}
            filterText={(r) => `${r.name} ${r.email} ${r.workspaceName ?? ''}`}
            filterPlaceholder="Search name, email or workspace"
            emptyTitle={view === 'open' ? 'No open requests' : 'Nothing closed yet'}
          />
        )}
      </div>

      <Sheet
        open={!!req}
        onClose={() => setOpenId(null)}
        side="right"
        title={req ? `${kindLabels[req.kind]} · ${req.name}` : 'Request'}
        description={req ? `${req.email}${req.workspaceName ? ` · ${req.workspaceName}` : ''}` : undefined}
        footer={
          req && !closedReq ? (
            <div className="flex items-center justify-between gap-3">
              <Button variant="tertiary" onClick={() => setAction({ kind: 'refuse', req })}>
                Refuse…
              </Button>
              <Button onClick={() => setAction({ kind: 'complete', req })} disabled={!stepsDone}>
                Complete request
              </Button>
            </div>
          ) : undefined
        }
      >
        {req && (
          <div className="flex flex-col divide-y divide-line">
            <section aria-labelledby="dr-what" className="px-5 py-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={statusInfo[req.status].tone} dot>
                  {statusInfo[req.status].label}
                </Badge>
                {dueBadge(req)}
              </div>
              <h3 id="dr-what" className="mt-4 text-label font-semibold text-fg">
                What they asked
              </h3>
              <p className="mt-1 text-label text-fg-muted">“{req.details}”</p>
              <p className="mt-2 text-caption text-fg-subtle">
                Received {formatTimestamp(req.receivedAt)} · due {formatTimestamp(req.dueAt)}
              </p>
            </section>
            <section aria-labelledby="dr-steps" className="px-5 py-5">
              <h3 id="dr-steps" className="text-label font-semibold text-fg">
                Steps
              </h3>
              <ul className="mt-3 flex flex-col gap-1">
                {checklist[req.kind].map((s) => {
                  const done = req.steps.includes(s.id);
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={done}
                        disabled={!!closedReq}
                        onClick={() => toggleStep(req, s.id)}
                        className="-mx-2 flex w-full items-start gap-3 rounded-md px-2 py-2 text-left text-label transition-colors duration-150 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:pointer-events-none"
                      >
                        {done ? <CheckCircle2Icon size={18} className="mt-0.5 shrink-0 text-success" aria-hidden /> : <CircleIcon size={18} className="mt-0.5 shrink-0 text-fg-subtle" aria-hidden />}
                        <span className={done ? 'text-fg-muted line-through' : 'text-fg'}>{s.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {!closedReq && !stepsDone && <p className="mt-3 text-caption text-fg-subtle">Tick every step to complete the request. Refusing needs a lawful reason.</p>}
            </section>
            {req.outcome && (
              <section aria-labelledby="dr-outcome" className="px-5 py-5">
                <h3 id="dr-outcome" className="text-label font-semibold text-fg">
                  Outcome sent to {req.name.split(' ')[0]}
                </h3>
                <p className="mt-1 text-label text-fg-muted">{req.outcome}</p>
              </section>
            )}
          </div>
        )}
      </Sheet>

      <ReasonDialog
        open={!!action}
        onClose={() => setAction(null)}
        onConfirm={confirm}
        destructive={action?.kind === 'refuse'}
        title={action?.kind === 'complete' ? 'Complete this request?' : 'Refuse this request?'}
        description={action?.kind === 'complete' ? 'Write the outcome the requester receives. It’s also kept in the audit log.' : 'Only refuse with a lawful reason, e.g. you couldn’t confirm their identity. The requester is told why.'}
        confirmLabel={action?.kind === 'complete' ? 'Complete' : 'Refuse'}
      />
    </div>
  );
}
