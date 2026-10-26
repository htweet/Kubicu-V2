import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { BanIcon, ExternalLinkIcon, MoreHorizontalIcon, PauseCircleIcon, RotateCcwIcon } from 'lucide-react';
import type { DomainStatus } from '../../types/domains';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { workspaceSpaces, readSpacePage } from '../../utils/spaces';
import { readDomains } from '../../utils/domains/storage';
import { spaceKinds } from '../../data/spaceKinds';
import { audit, useAdminStore } from '../../utils/admin/store';
import { formatRelative } from '../../utils/format';
import { PageHeader } from '../../components/shell/PageHeader';
import { Badge, type BadgeTone } from '../../components/ui/Badge';
import { Menu } from '../../components/ui/Menu';
import { IconButton } from '../../components/ui/IconButton';
import { Tabs } from '../../components/ui/Tabs';
import { DataTable, type DataColumn } from '../../components/ui/DataTable';
import { Stat, StatGroup } from '../../components/ui/layout/Stat';
import { ReasonDialog } from '../../components/admin/ReasonDialog';

interface PageRow {
  id: string;
  workspace: string;
  space: string;
  kind: string;
  handle: string;
  live: boolean;
  publishedAt: string | null;
  openReports: number;
  takenDown: boolean;
  suspended: boolean;
  /** Fundraiser spaces (D179) and whether staff paused them. */
  fundraiser: boolean;
  fundPaused: boolean;
}

interface DomainRow {
  id: string;
  host: string;
  workspace: string;
  status: DomainStatus;
  createdAt: string;
  checkedAt?: string;
  stuck: boolean;
  problem?: string;
}

const domainLabels: Record<DomainStatus, {label: string;tone: BadgeTone;}> = {
  waiting_dns: { label: 'Waiting for DNS', tone: 'neutral' },
  verifying: { label: 'Verifying', tone: 'info' },
  issuing: { label: 'Issuing certificate', tone: 'info' },
  live: { label: 'Live', tone: 'success' },
  problem: { label: 'Problem', tone: 'danger' }
};

type Tab = 'pages' | 'domains';
type Action = {kind: 'takedown' | 'restore' | 'pause_fund' | 'resume_fund';row: PageRow;} | null;
const STUCK_HOURS = 48;

/** Super admin → Pages & domains: every published link and connected domain on the platform (D82). */
export function AdminPages() {
  const { workspaces } = useWorkspace();
  const [store, setStore] = useAdminStore();
  const [tab, setTab] = useState<Tab>('pages');
  const [action, setAction] = useState<Action>(null);

  const pages: PageRow[] = useMemo(
    () =>
    workspaces.flatMap((w) =>
    workspaceSpaces(w).
    filter((s) => !s.archivedAt).
    map((s) => {
      const p = readSpacePage(w.id, s.id);
      const handle = p?.draft.handle ?? '';
      return {
        id: `${w.id}:${s.id}`,
        workspace: w.name,
        space: s.name,
        kind: spaceKinds[s.kind].label,
        handle,
        live: !!p?.published,
        publishedAt: p?.publishedAt ?? null,
        openReports: store.reports.filter((r) => r.handle === handle && r.status === 'open').length,
        takenDown: store.takedowns.some((t) => t.handle === handle),
        suspended: !!store.suspended[w.id],
        fundraiser: s.kind === 'fundraiser',
        fundPaused: !!store.pausedFundraisers?.[handle]
      };
    }).
    filter((r) => r.handle)
    ),
    [workspaces, store.reports, store.takedowns, store.suspended, store.pausedFundraisers]
  );

  const domains: DomainRow[] = useMemo(
    () =>
    workspaces.flatMap((w) =>
    (readDomains(w.id)?.domains ?? []).map((d) => ({
      id: d.id,
      host: d.host,
      workspace: w.name,
      status: d.status,
      createdAt: d.createdAt,
      checkedAt: d.checkedAt,
      stuck: d.status !== 'live' && Date.now() - Date.parse(d.createdAt) > STUCK_HOURS * 3600000,
      problem: d.problem === 'wrong_record' ? 'DNS record doesn’t match' : d.problem === 'timeout' ? 'Check timed out' : undefined
    }))
    ),
    [workspaces]
  );

  const live = pages.filter((p) => p.live && !p.takenDown).length;
  const reported = pages.filter((p) => p.openReports > 0).length;
  const needsHelp = domains.filter((d) => d.status === 'problem' || d.stuck).length;

  const confirm = (reason: string) => {
    if (!action) return;
    const { row } = action;
    if (action.kind === 'pause_fund') {
      const at = new Date().toISOString();
      setStore((s) => audit({ ...s, pausedFundraisers: { ...(s.pausedFundraisers ?? {}), [row.handle]: { reason, at, by: 'Staff' } } }, { area: 'pages', action: 'Paused fundraiser', target: `kub.icu/${row.handle}`, reason }));
      toast.success(`Fundraiser kub.icu/${row.handle} paused`, { description: 'Visitors see “Paused while we review” and can’t pay. The page stays up.' });
      return setAction(null);
    }
    if (action.kind === 'resume_fund') {
      setStore((s) => {
        const rest = { ...(s.pausedFundraisers ?? {}) };
        delete rest[row.handle];
        return audit({ ...s, pausedFundraisers: rest }, { area: 'pages', action: 'Resumed fundraiser', target: `kub.icu/${row.handle}`, reason });
      });
      toast.success(`Fundraiser kub.icu/${row.handle} resumed`);
      return setAction(null);
    }
    if (action.kind === 'takedown') {
      setStore((s) => audit({ ...s, takedowns: [...s.takedowns.filter((t) => t.handle !== row.handle), { handle: row.handle, reason, at: new Date().toISOString() }] }, { area: 'pages', action: 'Took down page', target: `kub.icu/${row.handle}`, reason }));
      toast.success(`kub.icu/${row.handle} taken down`, { description: 'Visitors now see “This page was removed”.' });
    } else {
      setStore((s) => audit({ ...s, takedowns: s.takedowns.filter((t) => t.handle !== row.handle) }, { area: 'pages', action: 'Restored page', target: `kub.icu/${row.handle}`, reason }));
      toast.success(`kub.icu/${row.handle} restored`);
    }
    setAction(null);
  };

  const pageStatus = (r: PageRow) =>
  r.takenDown ?
  <Badge tone="danger" dot>
        Taken down
      </Badge> :
  r.suspended ?
  <Badge tone="danger" dot>
        Workspace suspended
      </Badge> :
  r.fundPaused ?
  <Badge tone="warning" dot>
        Fundraiser paused
      </Badge> :
  r.live ?
  <Badge tone="success" dot>
        Live
      </Badge> :

  <Badge>Draft</Badge>;


  const pageColumns: DataColumn<PageRow>[] = [
  {
    key: 'link',
    header: 'Link',
    sortValue: (r) => r.handle,
    render: (r) =>
    <span className="min-w-0">
          <span className="block truncate font-semibold text-fg">kub.icu/{r.handle}</span>
          <span className="block truncate text-caption text-fg-subtle">
            {r.workspace} · {r.kind}
          </span>
        </span>

  },
  { key: 'status', header: 'Status', render: pageStatus },
  {
    key: 'reports',
    header: 'Open reports',
    align: 'right',
    sortValue: (r) => r.openReports,
    render: (r) => <span className={r.openReports ? 'font-semibold tabular-nums text-danger' : 'tabular-nums text-fg-subtle'}>{r.openReports || '—'}</span>
  },
  { key: 'published', header: 'Last published', hideOnMobile: true, sortValue: (r) => r.publishedAt ? Date.parse(r.publishedAt) : 0, render: (r) => <span className="text-fg-muted">{r.publishedAt ? formatRelative(r.publishedAt) : 'Never'}</span> },
  {
    key: 'actions',
    header: '',
    align: 'right',
    render: (r) =>
    <Menu
      items={[
      ...(r.live ? [{ id: 'open', label: 'Open live page', icon: ExternalLinkIcon, onSelect: () => window.open(`/p/${r.handle}`, '_blank', 'noopener') }] : []),
      ...(r.fundraiser ?
      [
      r.fundPaused ?
      { id: 'resume-fund', label: 'Resume fundraiser…', icon: RotateCcwIcon, onSelect: () => setAction({ kind: 'resume_fund', row: r }) } :
      { id: 'pause-fund', label: 'Pause fundraiser…', icon: PauseCircleIcon, onSelect: () => setAction({ kind: 'pause_fund', row: r }) }] :

      []),
      r.takenDown ?
      { id: 'restore', label: 'Restore page…', icon: RotateCcwIcon, onSelect: () => setAction({ kind: 'restore', row: r }) } :
      { id: 'takedown', label: 'Take down page…', icon: BanIcon, destructive: true, disabled: !r.live, reason: 'Only live pages can be taken down', onSelect: () => setAction({ kind: 'takedown', row: r }) }]
      }
      trigger={(props) => <IconButton {...props} size="sm" icon={MoreHorizontalIcon} label={`Actions for kub.icu/${r.handle}`} />} />


  }];


  const domainColumns: DataColumn<DomainRow>[] = [
  {
    key: 'host',
    header: 'Domain',
    sortValue: (r) => r.host,
    render: (r) =>
    <span className="min-w-0">
          <span className="block truncate font-semibold text-fg">{r.host}</span>
          <span className="block truncate text-caption text-fg-subtle">{r.workspace}</span>
        </span>

  },
  {
    key: 'status',
    header: 'Status',
    render: (r) =>
    <span className="flex flex-wrap items-center gap-1.5">
          <Badge tone={domainLabels[r.status].tone} dot>
            {domainLabels[r.status].label}
          </Badge>
          {r.stuck && <Badge tone="warning">Stuck over {STUCK_HOURS} h</Badge>}
        </span>

  },
  { key: 'problem', header: 'Last check', hideOnMobile: true, render: (r) => <span className="text-fg-muted">{r.problem ?? (r.checkedAt ? formatRelative(r.checkedAt) : 'Not checked yet')}</span> },
  { key: 'added', header: 'Added', hideOnMobile: true, sortValue: (r) => Date.parse(r.createdAt), render: (r) => <span className="text-fg-muted">{formatRelative(r.createdAt)}</span> }];


  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-10 md:py-12">
      <PageHeader title="Pages & domains" description="Every published link and connected domain on this device. Taking a page down keeps everything — the owner can appeal and you can restore it." />

      <StatGroup columns={3} className="mt-8 items-end border-b border-line pb-6">
        <Stat primary label="Live links" value={live} hint={`${pages.length} links in total`} />
        <Stat label="With open reports" value={<span className={reported ? 'text-danger' : undefined}>{reported}</span>} hint="Review in Moderation" />
        <Stat label="Domains needing help" value={<span className={needsHelp ? 'text-warning' : undefined}>{needsHelp}</span>} hint={`${domains.length} connected or connecting`} />
      </StatGroup>

      <div className="mt-8 flex flex-col gap-5">
        <Tabs<Tab>
          idPrefix="admin-pages"
          ariaLabel="Pages or domains"
          value={tab}
          onChange={setTab}
          items={[
          { id: 'pages', label: 'Pages', badge: reported || undefined },
          { id: 'domains', label: 'Domains', badge: needsHelp || undefined }]
          } />
        
        <div role="tabpanel" id={`admin-pages-panel-${tab}`} aria-labelledby={`admin-pages-tab-${tab}`}>
          {tab === 'pages' ?
          <DataTable caption="Published links" rows={pages} columns={pageColumns} filterText={(r) => `${r.handle} ${r.workspace} ${r.space}`} filterPlaceholder="Search link or workspace" emptyTitle="No links match" /> :

          <DataTable
            caption="Custom domains"
            rows={domains}
            columns={domainColumns}
            filterText={(r) => `${r.host} ${r.workspace}`}
            filterPlaceholder="Search domain or workspace"
            emptyTitle="No custom domains yet"
            emptyDescription="Domains appear here once a workspace starts connecting one in Domains." />

          }
        </div>
      </div>

      <ReasonDialog
        open={!!action}
        onClose={() => setAction(null)}
        onConfirm={confirm}
        destructive={action?.kind === 'takedown'}
        title={
        action?.kind === 'takedown' ?
        `Take down kub.icu/${action.row.handle}?` :
        action?.kind === 'pause_fund' ?
        `Pause fundraiser kub.icu/${action.row.handle}?` :
        action?.kind === 'resume_fund' ?
        `Resume fundraiser kub.icu/${action.row.handle}?` :
        `Restore kub.icu/${action?.row.handle}?`
        }
        description={
        action?.kind === 'takedown' ?
        'Visitors see “This page was removed”. Nothing is deleted and the owner can appeal. Open reports for this link stay in Moderation.' :
        action?.kind === 'pause_fund' ?
        'The page stays up with “Paused while KUBICU reviews this fundraiser”, and no one can pay. Money already raised isn’t touched. The organiser sees the pause in their canvas.' :
        action?.kind === 'resume_fund' ?
        'Visitors can give again straight away.' :
        'The page is visible again straight away.'
        }
        confirmLabel={action?.kind === 'takedown' ? 'Take down' : action?.kind === 'pause_fund' ? 'Pause fundraiser' : action?.kind === 'resume_fund' ? 'Resume' : 'Restore'} />
      
    </div>);

}