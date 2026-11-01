import React, { useMemo, useState } from 'react';
import { DownloadIcon, ScrollTextIcon } from 'lucide-react';
import type { AuditEntry } from '../../types/admin';
import { useAdminStore } from '../../utils/admin/store';
import { downloadCsv, toCsv } from '../../utils/csv';
import { formatTimestamp } from '../../utils/format';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { SelectInput } from '../../components/ui/SelectInput';
import { DataTable, type DataColumn } from '../../components/ui/DataTable';
import { EmptyState } from '../../components/ui/EmptyState';

type Area = 'all' | AuditEntry['area'];
const areaLabels: Record<AuditEntry['area'], string> = { tenants: 'Tenants', flags: 'Feature flags', moderation: 'Moderation', support: 'Support', announcements: 'Announcements', pages: 'Pages & domains', orders: 'Orders & disputes', data: 'Data requests', staff: 'Staff & access', appeals: 'Appeals', payments: 'Payments & providers', escrow: 'Escrow cases', sponsorships: 'Sponsorships', incidents: 'Incidents', approvals: 'Approvals', access: 'Access reviews', extensions: 'Extensions' };

/** Super admin → Audit log: every privileged staff action with its reason (D75b). Read-only. */
export function AdminAudit() {
  const [store] = useAdminStore();
  const [area, setArea] = useState<Area>('all');
  const rows = useMemo(() => store.audit.filter((a) => area === 'all' || a.area === area), [store.audit, area]);

  const columns: DataColumn<AuditEntry>[] = [
  { key: 'at', header: 'When', sortValue: (r) => Date.parse(r.at), render: (r) => <span className="whitespace-nowrap text-fg-muted">{formatTimestamp(r.at)}</span> },
  {
    key: 'action',
    header: 'Action',
    render: (r) =>
    <span className="min-w-0">
          <span className="block font-semibold text-fg">{r.action}</span>
          <span className="block truncate text-caption text-fg-subtle">{r.target}</span>
        </span>

  },
  { key: 'reason', header: 'Reason', hideOnMobile: true, render: (r) => <span className="text-fg-muted">{r.reason}</span> },
  { key: 'actor', header: 'By', hideOnMobile: true, render: (r) => <span className="text-fg-muted">{r.actor}</span> }];


  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-10 md:py-12">
      <PageHeader
        title="Audit log"
        description="Every privileged staff action, who did it and why. Entries can’t be edited or deleted."
        actions={
        <Button variant="secondary" leadingIcon={DownloadIcon} disabled={rows.length === 0} onClick={() => downloadCsv(`kubicu-staff-audit-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(['at', 'area', 'action', 'target', 'reason', 'actor'], rows.map((r) => [r.at, r.area, r.action, r.target, r.reason, r.actor])))}>
            Export
          </Button>
        } />
      
      {store.audit.length === 0 ?
      <div className="mt-8">
          <EmptyState icon={ScrollTextIcon} title="No staff actions yet" description="Changing a plan, suspending a workspace, switching a flag or taking a page down all appear here." />
        </div> :

      <div className="mt-8 flex flex-col gap-4">
          <div className="sm:w-56">
            <SelectInput<Area> id="audit-area" label="Area" value={area} onChange={setArea} options={[{ value: 'all', label: 'All areas' }, ...(Object.keys(areaLabels) as AuditEntry['area'][]).map((a) => ({ value: a, label: areaLabels[a] }))]} />
          </div>
          <DataTable caption="Staff audit log" rows={rows} columns={columns} filterText={(r) => `${r.action} ${r.target} ${r.reason}`} filterPlaceholder="Search actions" emptyTitle="No entries match" />
        </div>
      }
    </div>);

}