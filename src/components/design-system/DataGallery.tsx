import React, { useState } from 'react';
import { toast } from 'sonner';
import { DataTable, type DataColumn } from '../ui/DataTable';
import { BarChartCard } from '../ui/BarChartCard';
import { Badge, type BadgeTone } from '../ui/Badge';
import { Segmented } from '../ui/Segmented';
import { IllustrativeTag } from '../ui/IllustrativeTag';
import { sampleTenants, sampleWeeklyTaps, type SampleTenant } from '../../data/designSystemSamples';
import { DsLabel } from './DsSection';

const statusTone: Record<SampleTenant['status'], BadgeTone> = { Active: 'success', Trial: 'info', Suspended: 'danger' };

const columns: DataColumn<SampleTenant>[] = [
{
  key: 'workspace',
  header: 'Workspace',
  sortValue: (r) => r.workspace,
  render: (r) =>
  <span className="flex flex-col">
        <span className="font-medium">{r.workspace}</span>
        <span className="text-caption text-fg-subtle md:hidden">
          {r.plan} · {r.pages} page{r.pages === 1 ? '' : 's'}
        </span>
      </span>

},
{ key: 'owner', header: 'Owner', sortValue: (r) => r.owner, render: (r) => r.owner, hideOnMobile: true },
{ key: 'plan', header: 'Plan', sortValue: (r) => r.plan, render: (r) => r.plan, hideOnMobile: true },
{ key: 'pages', header: 'Pages', align: 'right', sortValue: (r) => r.pages, render: (r) => r.pages, hideOnMobile: true },
{
  key: 'status',
  header: 'Status',
  sortValue: (r) => r.status,
  render: (r) =>
  <Badge tone={statusTone[r.status]} dot>
        {r.status}
      </Badge>

}];


type ChartState = 'ready' | 'loading' | 'empty' | 'error';

export function DataGallery() {
  const [chartState, setChartState] = useState<ChartState>('ready');
  const [tableLoading, setTableLoading] = useState(false);
  const total = sampleWeeklyTaps.reduce((s, p) => s + p.value, 0);
  const peak = sampleWeeklyTaps.reduce((a, b) => b.value > a.value ? b : a);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <DsLabel>Data table — filter, sort, bulk select; low-priority columns fold into the first on mobile</DsLabel>
          <div className="flex items-center gap-2">
            <IllustrativeTag />
            <button
              type="button"
              onClick={() => {
                setTableLoading(true);
                window.setTimeout(() => setTableLoading(false), 900);
              }}
              className="rounded-sm text-caption font-medium text-action hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
              
              Show loading
            </button>
          </div>
        </div>
        <DataTable
          caption="Example workspaces"
          rows={sampleTenants}
          columns={columns}
          loading={tableLoading}
          filterText={(r) => `${r.workspace} ${r.owner} ${r.plan}`}
          filterPlaceholder="Filter workspaces"
          bulkActions={[{ label: 'Export', onRun: (rows) => toast(`Would export ${rows.length} workspaces`, { description: 'Illustrative — no data leaves this browser.' }) }]} />
        
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
        <BarChartCard
          title="Link taps by day"
          context="Last 7 days · taps"
          unit="taps"
          data={sampleWeeklyTaps}
          state={chartState}
          onRetry={() => setChartState('ready')}
          summary={`${total} taps this week. Busiest day was ${peak.label} with ${peak.value}.`}
          footnote={<p className="text-caption text-fg-subtle">Illustrative data. Real analytics arrive in Batch 5 with clear metric definitions.</p>} />
        
        <div className="flex flex-col gap-2">
          <DsLabel>Chart states</DsLabel>
          <Segmented<ChartState>
            ariaLabel="Chart state"
            size="sm"
            fullWidth
            value={chartState}
            onChange={setChartState}
            options={[
            { value: 'ready', label: 'Data' },
            { value: 'loading', label: 'Load' },
            { value: 'empty', label: 'Empty' },
            { value: 'error', label: 'Error' }]
            } />
          
          <p className="text-caption text-fg-subtle">Every chart names its period and unit, and has a written summary for screen readers.</p>
        </div>
      </div>
    </div>);

}