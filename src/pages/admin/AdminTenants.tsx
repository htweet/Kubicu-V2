import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { BanIcon, ExternalLinkIcon, MoreHorizontalIcon, RotateCcwIcon, ArrowUpDownIcon, ShieldCheckIcon } from 'lucide-react';
import type { WorkspacePlan } from '../../types/plan';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { planOrder, plans } from '../../data/plans';
import { readPersistedPage } from '../../utils/workspaceStorage';
import { audit, staffActor, useAdminStore } from '../../utils/admin/store';
import { APPROVAL_HOURS, effectiveStatus, newApproval } from '../../utils/admin/approvals';
import { useStaffSession } from '../../hooks/useStaffSession';
import { ApprovalQueue } from '../../components/admin/ApprovalQueue';
import { formatTimestamp } from '../../utils/format';
import { PageHeader } from '../../components/shell/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Menu } from '../../components/ui/Menu';
import { IconButton } from '../../components/ui/IconButton';
import { SelectInput } from '../../components/ui/SelectInput';
import { DataTable, type DataColumn } from '../../components/ui/DataTable';
import { Stat, StatGroup } from '../../components/ui/layout/Stat';
import { ReasonDialog } from '../../components/admin/ReasonDialog';

interface Row {
  id: string;
  name: string;
  owner: string;
  plan: WorkspacePlan;
  handle: string;
  live: boolean;
  spaces: number;
  createdAt: string;
  suspended: boolean;
}

type Action = {kind: 'suspend' | 'restore' | 'plan';row: Row;} | null;

/** Super admin → Users & tenants: find a workspace, change its plan, suspend or restore (D75b). */
export function AdminTenants() {
  const { workspaces, update } = useWorkspace();
  const [store, setStore] = useAdminStore();
  const [action, setAction] = useState<Action>(null);
  const [newPlan, setNewPlan] = useState<WorkspacePlan>('free');
  const me = useStaffSession();
  const navigate = useNavigate();

  const rows: Row[] = useMemo(
    () =>
    workspaces.map((w) => {
      const page = readPersistedPage(w.id);
      return {
        id: w.id,
        name: w.name,
        owner: w.ownerName,
        plan: w.plan,
        handle: page?.draft.handle ?? '—',
        live: !!page?.published,
        spaces: 1 + (w.spaces?.filter((s) => !s.archivedAt).length ?? 0),
        createdAt: w.createdAt,
        suspended: !!store.suspended[w.id]
      };
    }),
    [workspaces, store.suspended]
  );
  const paying = rows.filter((r) => r.plan !== 'free').length;

  const confirm = (reason: string) => {
    if (!action) return;
    const { row } = action;
    if (action.kind === 'plan') {
      update(row.id, { plan: newPlan });
      setStore((s) => audit(s, { area: 'tenants', action: `Changed plan ${plans[row.plan].name} → ${plans[newPlan].name}`, target: row.name, reason }));
      toast.success(`${row.name} is now on ${plans[newPlan].name}`, { description: 'Entitlement override — no charge or refund is made.' });
    } else if (action.kind === 'suspend') {
      // Suspending takes a whole business offline, so a second staff member must approve (D130).
      if (store.approvals.some((a) => a.kind === 'workspace_suspend' && a.workspaceId === row.id && effectiveStatus(a) === 'pending')) {
        toast('A suspension for this workspace is already waiting for approval');
      } else {
        const req = newApproval({ kind: 'workspace_suspend', summary: `Suspend ${row.name}`, targetId: row.id, targetEmail: row.name, workspaceId: row.id, reason, requestedById: me?.id ?? '', requestedBy: staffActor(store) });
        setStore((s) => audit({ ...s, approvals: [req, ...s.approvals] }, { area: 'approvals', action: `Requested: ${req.summary}`, target: row.name, reason }));
        toast.success('Sent for a second approval', { description: `Another staff member who can open Users & tenants must approve within ${APPROVAL_HOURS} hours. Use Moderation to take a single page down straight away.` });
      }
    } else {
      setStore((s) => {
        const { [row.id]: _gone, ...rest } = s.suspended;
        return audit({ ...s, suspended: rest }, { area: 'tenants', action: 'Restored workspace', target: row.name, reason });
      });
      toast.success(`${row.name} restored`);
    }
    setAction(null);
  };

  const columns: DataColumn<Row>[] = [
  {
    key: 'name',
    header: 'Workspace',
    sortValue: (r) => r.name.toLowerCase(),
    render: (r) =>
    <span className="min-w-0">
          <span className="block truncate font-semibold text-fg">{r.name}</span>
          <span className="block truncate text-caption text-fg-subtle">
            {r.owner} · kub.icu/{r.handle}
          </span>
        </span>

  },
  { key: 'plan', header: 'Plan', sortValue: (r) => planOrder.indexOf(r.plan), render: (r) => <span className="text-fg-muted">{plans[r.plan].name}</span> },
  {
    key: 'status',
    header: 'Status',
    render: (r) =>
    r.suspended ?
    <Badge tone="danger" dot>
            Suspended
          </Badge> :
    r.live ?
    <Badge tone="success" dot>
            Live
          </Badge> :

    <Badge tone="neutral">Draft</Badge>

  },
  { key: 'spaces', header: 'Spaces', align: 'right', hideOnMobile: true, sortValue: (r) => r.spaces, render: (r) => <span className="tabular-nums text-fg-muted">{r.spaces}</span> },
  { key: 'created', header: 'Created', hideOnMobile: true, sortValue: (r) => Date.parse(r.createdAt), render: (r) => <span className="text-fg-muted">{formatTimestamp(r.createdAt)}</span> },
  {
    key: 'actions',
    header: '',
    align: 'right',
    render: (r) =>
    <Menu
      align="end"
      items={[
      ...(r.live ? [{ id: 'open', label: 'Open live page', icon: ExternalLinkIcon, onSelect: () => window.open(`/p/${r.handle}`, '_blank', 'noopener') }] : []),
      // D252: straight to this workspace's verification record, decided or not.
      { id: 'kyc', label: 'Verification', icon: ShieldCheckIcon, onSelect: () => navigate(`/admin/payments?tab=identity&ws=${encodeURIComponent(r.id)}`) },
      {
        id: 'plan',
        label: 'Change plan…',
        icon: ArrowUpDownIcon,
        onSelect: () => {
          setNewPlan(r.plan);
          setAction({ kind: 'plan', row: r });
        }
      },
      r.suspended ?
      { id: 'restore', label: 'Restore…', icon: RotateCcwIcon, onSelect: () => setAction({ kind: 'restore', row: r }) } :
      { id: 'suspend', label: 'Suspend…', icon: BanIcon, destructive: true, onSelect: () => setAction({ kind: 'suspend', row: r }) }]
      }
      trigger={(props) => <IconButton {...props} size="sm" icon={MoreHorizontalIcon} label={`Actions for ${r.name}`} />} />


  }];


  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-10 md:py-12">
      <PageHeader title="Users & tenants" description="Every workspace on this device. Plan changes here are entitlement overrides — nothing is charged or refunded." />

      <StatGroup columns={3} className="mt-8 items-end border-b border-line pb-6">
        <Stat primary label="Workspaces" value={rows.length} />
        <Stat label="On a paid plan" value={paying} />
        <Stat label="Suspended" value={<span className={Object.keys(store.suspended).length ? 'text-danger' : undefined}>{Object.keys(store.suspended).length}</span>} />
      </StatGroup>

      <ApprovalQueue kinds={['workspace_suspend']} title="Suspensions waiting for a second person" description="Suspending takes a whole business offline. Whoever asked can’t approve their own request." />

      <div className="mt-8">
        <DataTable caption="Workspaces" rows={rows} columns={columns} filterText={(r) => `${r.name} ${r.owner} ${r.handle}`} filterPlaceholder="Search name, owner or link" emptyTitle="No workspaces match" />
      </div>

      <ReasonDialog
        open={!!action}
        onClose={() => setAction(null)}
        onConfirm={confirm}
        destructive={action?.kind === 'suspend'}
        title={action?.kind === 'plan' ? `Change ${action.row.name}’s plan` : action?.kind === 'suspend' ? `Suspend ${action?.row.name}?` : `Restore ${action?.row.name}?`}
        description={
        action?.kind === 'plan' ?
        'Use for goodwill upgrades, partner deals or fixing a billing error. Their billing history isn’t changed.' :
        action?.kind === 'suspend' ?
        `A second staff member must approve within ${APPROVAL_HOURS} hours. Once approved, their public pages show “temporarily unavailable” and the owner sees why in the app. Nothing is deleted, and you can restore at any time.` :
        'Their pages come back straight away.'
        }
        confirmLabel={action?.kind === 'plan' ? 'Change plan' : action?.kind === 'suspend' ? 'Send for approval' : 'Restore'}>
        
        {action?.kind === 'plan' && <SelectInput<WorkspacePlan> id="admin-plan" label="New plan" value={newPlan} onChange={setNewPlan} options={planOrder.map((p) => ({ value: p, label: plans[p].name }))} />}
      </ReasonDialog>
    </div>);

}