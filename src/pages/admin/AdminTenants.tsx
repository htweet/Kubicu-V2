import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import type { WorkspacePlan } from '../../types/plan';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { planOrder, plans } from '../../data/plans';
import { readPersistedPage } from '../../utils/workspaceStorage';
import { audit, staffActor, useAdminStore } from '../../utils/admin/store';
import { APPROVAL_HOURS, effectiveStatus, newApproval } from '../../utils/admin/approvals';
import { buildPeople, roleNames, type Person } from '../../utils/admin/people';
import { useAccount } from '../../utils/account/store';
import { countryInfo } from '../../utils/country';
import { useStaffSession } from '../../hooks/useStaffSession';
import { ApprovalQueue } from '../../components/admin/ApprovalQueue';
import { formatRelative, formatTimestamp } from '../../utils/format';
import { PageHeader } from '../../components/shell/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { SelectInput } from '../../components/ui/SelectInput';
import { DataTable, type DataColumn } from '../../components/ui/DataTable';
import { Stat, StatGroup } from '../../components/ui/layout/Stat';
import { ReasonDialog } from '../../components/admin/ReasonDialog';
import { PersonSheet } from '../../components/admin/tenants/PersonSheet';
import { WorkspaceSheet, type WorkspaceSummary } from '../../components/admin/tenants/WorkspaceSheet';

type Tab = 'people' | 'workspaces';

interface WsRow extends WorkspaceSummary {
  id: string;
  owner: string;
  members: number;
}

interface PersonRow extends Person {
  id: string;
  locked: boolean;
}

type Action = {kind: 'suspend' | 'restore' | 'plan';row: WsRow;} | null;

/**
 * Super admin → Users & tenants (D75b, reworked D472). People and workspaces are separate lists: one person can own
 * or work in several workspaces. Each opens a side panel with details, staff actions and internal notes.
 */
export function AdminTenants() {
  const { workspaces, update } = useWorkspace();
  const account = useAccount();
  const [store, setStore] = useAdminStore();
  const [params, setParams] = useSearchParams();
  const [action, setAction] = useState<Action>(null);
  const [newPlan, setNewPlan] = useState<WorkspacePlan>('free');
  const me = useStaffSession();
  const navigate = useNavigate();

  const tab: Tab = params.get('tab') === 'workspaces' || params.get('ws') && !params.get('person') ? 'workspaces' : 'people';
  const openPersonKey = params.get('person');
  const openWsId = params.get('ws');
  const setParam = (next: Record<string, string | null>) => {
    const p = new URLSearchParams(params);
    Object.entries(next).forEach(([k, v]) => v === null ? p.delete(k) : p.set(k, v));
    setParams(p, { replace: true });
  };

  // Bumped when staff change a team from the workspace panel, so people rebuild from the saved teams (D473).
  const [teamVersion, setTeamVersion] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const people = useMemo(() => buildPeople(workspaces, account), [workspaces, account, teamVersion]);
  const personRows: PersonRow[] = useMemo(() => people.map((p) => ({ ...p, id: p.key, locked: !!store.people?.[p.key]?.locked })), [people, store.people]);

  const wsRows: WsRow[] = useMemo(
    () =>
    workspaces.map((w) => {
      const page = readPersistedPage(w.id);
      return {
        id: w.id,
        workspace: w,
        owner: people[0]?.name ?? w.ownerName,
        members: people.filter((p) => p.workspaces.some((x) => x.id === w.id)).length,
        handle: page?.draft.handle ?? '—',
        live: !!page?.published,
        spaces: 1 + (w.spaces?.filter((s) => !s.archivedAt).length ?? 0),
        suspended: !!store.suspended[w.id]
      };
    }),
    [workspaces, people, store.suspended]
  );

  const openPerson = people.find((p) => p.key === openPersonKey) ?? null;
  const openWs = wsRows.find((r) => r.id === openWsId) ?? null;
  const paying = wsRows.filter((r) => r.workspace.plan !== 'free').length;
  const lockedCount = personRows.filter((p) => p.locked).length;
  const suspendedCount = Object.keys(store.suspended).length;

  const confirm = (reason: string) => {
    if (!action) return;
    const { row } = action;
    const name = row.workspace.name;
    if (action.kind === 'plan') {
      update(row.id, { plan: newPlan });
      setStore((s) => audit(s, { area: 'tenants', action: `Changed plan ${plans[row.workspace.plan].name} → ${plans[newPlan].name}`, target: name, reason }));
      toast.success(`${name} is now on ${plans[newPlan].name}`, { description: 'Entitlement override — no charge or refund is made.' });
    } else if (action.kind === 'suspend') {
      // Suspending takes a whole business offline, so a second staff member must approve (D130).
      if (store.approvals.some((a) => a.kind === 'workspace_suspend' && a.workspaceId === row.id && effectiveStatus(a) === 'pending')) {
        toast('A suspension for this workspace is already waiting for approval');
      } else {
        const req = newApproval({ kind: 'workspace_suspend', summary: `Suspend ${name}`, targetId: row.id, targetEmail: name, workspaceId: row.id, reason, requestedById: me?.id ?? '', requestedBy: staffActor(store) });
        setStore((s) => audit({ ...s, approvals: [req, ...s.approvals] }, { area: 'approvals', action: `Requested: ${req.summary}`, target: name, reason }));
        toast.success('Sent for a second approval', { description: `Another staff member who can open Users & tenants must approve within ${APPROVAL_HOURS} hours. Use Moderation to take a single page down straight away.` });
      }
    } else {
      setStore((s) => {
        const { [row.id]: _gone, ...rest } = s.suspended;
        return audit({ ...s, suspended: rest }, { area: 'tenants', action: 'Restored workspace', target: name, reason });
      });
      toast.success(`${name} restored`);
    }
    setAction(null);
  };

  const nameButton = (label: string, sub: string, onClick: () => void) =>
  <button type="button" onClick={onClick} className="min-w-0 rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
      <span className="block truncate font-semibold text-fg hover:underline">{label}</span>
      <span className="block truncate text-caption text-fg-subtle">{sub}</span>
    </button>;


  const personColumns: DataColumn<PersonRow>[] = [
  { key: 'name', header: 'Person', sortValue: (r) => r.name.toLowerCase(), render: (r) => nameButton(r.name, r.email || r.phone || '—', () => setParam({ person: r.key })) },
  {
    key: 'workspaces',
    header: 'Workspaces',
    sortValue: (r) => r.workspaces.length,
    render: (r) =>
    <span className="min-w-0">
          <span className="block tabular-nums text-fg">{r.workspaces.length}</span>
          <span className="block max-w-[16rem] truncate text-caption text-fg-subtle">{r.workspaces.map((w) => `${w.name} (${roleNames[w.role]})`).join(', ')}</span>
        </span>

  },
  {
    key: 'status',
    header: 'Status',
    render: (r) =>
    r.locked ?
    <Badge tone="danger" dot>
            Locked
          </Badge> :

    <Badge tone="success" dot>
            Active
          </Badge>

  },
  { key: 'twostep', header: 'Two-step', hideOnMobile: true, render: (r) => <span className="text-fg-muted">{r.twoStep === null ? '—' : r.twoStep === 'none' ? 'Off' : 'On'}</span> },
  { key: 'active', header: 'Last active', hideOnMobile: true, sortValue: (r) => r.lastActiveAt ? Date.parse(r.lastActiveAt) : 0, render: (r) => <span className="text-fg-muted">{r.lastActiveAt ? formatRelative(r.lastActiveAt) : '—'}</span> }];


  const wsColumns: DataColumn<WsRow>[] = [
  { key: 'name', header: 'Workspace', sortValue: (r) => r.workspace.name.toLowerCase(), render: (r) => nameButton(r.workspace.name, `kub.icu/${r.handle}`, () => setParam({ ws: r.id, person: null })) },
  {
    key: 'owner',
    header: 'Owner',
    sortValue: (r) => r.owner.toLowerCase(),
    render: (r) =>
    <button type="button" onClick={() => setParam({ person: people[0]?.key ?? null })} className="truncate rounded-sm text-left text-fg-muted hover:text-fg hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          {r.owner}
        </button>

  },
  { key: 'plan', header: 'Plan', sortValue: (r) => planOrder.indexOf(r.workspace.plan), render: (r) => <span className="text-fg-muted">{plans[r.workspace.plan].name}</span> },
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
  { key: 'country', header: 'Country', hideOnMobile: true, sortValue: (r) => r.workspace.country ?? 'NG', render: (r) => <span className="text-fg-muted">{countryInfo(r.workspace.country ?? 'NG').name}</span> },
  { key: 'people', header: 'People', align: 'right', hideOnMobile: true, sortValue: (r) => r.members, render: (r) => <span className="tabular-nums text-fg-muted">{r.members}</span> },
  { key: 'created', header: 'Created', hideOnMobile: true, sortValue: (r) => Date.parse(r.workspace.createdAt), render: (r) => <span className="text-fg-muted">{formatTimestamp(r.workspace.createdAt)}</span> }];


  const startAction = (kind: 'plan' | 'suspend' | 'restore', row: WsRow) => {
    if (kind === 'plan') setNewPlan(row.workspace.plan);
    setAction({ kind, row });
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-10 md:py-12">
      <PageHeader title="Users & tenants" description="Every person and workspace on this device. One person can own or work in several workspaces. Plan changes are entitlement overrides — nothing is charged or refunded." />

      <StatGroup columns={4} className="mt-8 items-end border-b border-line pb-6">
        <Stat primary label="People" value={people.length} />
        <Stat label="Workspaces" value={`${wsRows.length} · paid ${paying}`} />
        <Stat label="Locked accounts" value={<span className={lockedCount ? 'text-danger' : undefined}>{lockedCount}</span>} />
        <Stat label="Suspended workspaces" value={<span className={suspendedCount ? 'text-danger' : undefined}>{suspendedCount}</span>} />
      </StatGroup>

      <ApprovalQueue kinds={['workspace_suspend']} title="Suspensions waiting for a second person" description="Suspending takes a whole business offline. Whoever asked can’t approve their own request." />

      <Tabs<Tab>
        className="mt-8"
        idPrefix="tenants"
        ariaLabel="People or workspaces"
        value={tab}
        onChange={(v) => setParam({ tab: v === 'people' ? null : v })}
        items={[
        { id: 'people', label: 'People' },
        { id: 'workspaces', label: 'Workspaces' }]
        } />
      
      <div role="tabpanel" id={`tenants-panel-${tab}`} aria-labelledby={`tenants-tab-${tab}`} className="mt-6">
        {tab === 'people' ?
        <DataTable caption="People" rows={personRows} columns={personColumns} filterText={(r) => `${r.name} ${r.email} ${r.phone} ${r.workspaces.map((w) => w.name).join(' ')}`} filterPlaceholder="Search name, email, phone or workspace" emptyTitle="No people match" /> :

        <DataTable caption="Workspaces" rows={wsRows} columns={wsColumns} filterText={(r) => `${r.workspace.name} ${r.owner} ${r.handle} ${countryInfo(r.workspace.country ?? 'NG').name}`} filterPlaceholder="Search name, owner, link or country" emptyTitle="No workspaces match" />
        }
      </div>

      <PersonSheet person={openPerson} onClose={() => setParam({ person: null })} onOpenWorkspace={(id) => setParam({ ws: id, person: null })} />
      <WorkspaceSheet
        item={openPerson ? null : openWs}
        people={people}
        onClose={() => setParam({ ws: null })}
        onOpenPerson={(key) => setParam({ person: key, ws: null })}
        onAction={(kind) => openWs && startAction(kind, openWs)}
        onVerification={() => openWs && navigate(`/admin/payments?tab=identity&ws=${encodeURIComponent(openWs.id)}`)}
        onTeamChanged={() => setTeamVersion((v) => v + 1)} />
      

      <ReasonDialog
        open={!!action}
        onClose={() => setAction(null)}
        onConfirm={confirm}
        destructive={action?.kind === 'suspend'}
        title={action?.kind === 'plan' ? `Change ${action.row.workspace.name}’s plan` : action?.kind === 'suspend' ? `Suspend ${action?.row.workspace.name}?` : `Restore ${action?.row.workspace.name}?`}
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