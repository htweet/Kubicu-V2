import React, { useMemo, useState } from 'react';
import { ArrowLeftRightIcon, LayoutGridIcon, ListIcon, PenToolIcon, SearchIcon } from 'lucide-react';
import type { PageDocument } from '../../types/page';
import type { Workspace } from '../../types/workspace';
import { plans } from '../../data/plans';
import { formatRelative, publicUrl } from '../../utils/format';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Segmented } from '../ui/Segmented';
import { DataTable, type DataColumn } from '../ui/DataTable';
import { EmptyState } from '../ui/EmptyState';
import { fieldControlClass } from '../ui/Field';
import { PageMiniPreview } from '../overview/PageMiniPreview';
import { cn } from '../../utils/cn';

export type SpaceStatus = 'live' | 'changes' | 'draft';

export interface SpaceRow {
  id: string;
  workspace: Workspace;
  doc: PageDocument | null;
  status: SpaceStatus;
  current: boolean;
}

type Filter = 'all' | 'live' | 'draft';
type View = 'cards' | 'table';

const statusBadge: Record<SpaceStatus, {tone: 'success' | 'accent' | 'neutral';label: string;}> = {
  live: { tone: 'success', label: 'Live' },
  changes: { tone: 'accent', label: 'Live · unpublished changes' },
  draft: { tone: 'neutral', label: 'Draft' }
};

interface SpacesListProps {
  rows: SpaceRow[];
  onOpen: (row: SpaceRow) => void;
}

/** Every space you own, across workspaces: search, filter by status, cards or table. */
export function SpacesList({ rows, onOpen }: SpacesListProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [view, setView] = useState<View>('cards');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter === 'live' && r.status === 'draft') return false;
      if (filter === 'draft' && r.status !== 'draft') return false;
      if (!q) return true;
      return `${r.doc?.title ?? ''} ${r.doc?.handle ?? ''} ${r.workspace.name}`.toLowerCase().includes(q);
    });
  }, [rows, query, filter]);

  const action = (r: SpaceRow, size: 'sm' | 'md' = 'sm') =>
  r.current ?
  <Button size={size} variant="secondary" leadingIcon={PenToolIcon} onClick={() => onOpen(r)}>
        Open
      </Button> :

  <Button size={size} variant="secondary" leadingIcon={ArrowLeftRightIcon} onClick={() => onOpen(r)}>
        Switch
      </Button>;


  const columns: DataColumn<SpaceRow>[] = [
  {
    key: 'page',
    header: 'Space',
    sortValue: (r) => (r.doc?.title ?? r.workspace.name).toLowerCase(),
    render: (r) =>
    <span className="block min-w-0">
          <span className="flex items-center gap-2">
            <span className="truncate font-semibold text-fg">{r.doc?.title ?? r.workspace.name}</span>
            {r.current && <span className="text-caption font-medium text-action">You’re here</span>}
          </span>
          <span className="block truncate font-mono text-caption text-fg-subtle">{r.doc ? publicUrl(r.doc.handle) : 'No page yet'}</span>
        </span>

  },
  { key: 'ws', header: 'Workspace', hideOnMobile: true, sortValue: (r) => r.workspace.name, render: (r) => <span className="text-fg-muted">{r.workspace.name}</span> },
  { key: 'status', header: 'Status', sortValue: (r) => r.status, render: (r) => <Badge tone={statusBadge[r.status].tone} dot>{statusBadge[r.status].label}</Badge> },
  { key: 'plan', header: 'Plan', hideOnMobile: true, render: (r) => <span className="text-fg-muted">{plans[r.workspace.plan].name}</span> },
  { key: 'edited', header: 'Last edited', hideOnMobile: true, sortValue: (r) => Date.parse(r.doc?.updatedAt ?? r.workspace.createdAt), render: (r) => <span className="text-fg-muted">{formatRelative(r.doc?.updatedAt ?? r.workspace.createdAt)}</span> },
  { key: 'go', header: '', align: 'right', render: (r) => action(r) }];


  return (
    <section aria-labelledby="all-spaces-heading" className="mt-14">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 id="all-spaces-heading" className="text-heading font-semibold text-fg">
            All spaces <span className="font-normal tabular-nums text-fg-subtle">· {rows.length}</span>
          </h2>
          <p className="mt-0.5 text-label text-fg-muted">One page per workspace in this release. Switching takes you into that workspace.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-60">
            <SearchIcon size={15} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" />
            <label htmlFor="spaces-search" className="sr-only">
              Search spaces
            </label>
            <input id="spaces-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or link" className={cn(fieldControlClass, 'h-9 pl-9 text-label')} />
          </div>
          <Segmented<Filter>
            ariaLabel="Status"
            value={filter}
            onChange={setFilter}
            options={[
            { value: 'all', label: 'All' },
            { value: 'live', label: 'Live' },
            { value: 'draft', label: 'Drafts' }]
            } />
          
          <Segmented<View>
            ariaLabel="Layout"
            value={view}
            onChange={setView}
            options={[
            { value: 'cards', label: 'Cards', icon: LayoutGridIcon, iconOnly: true },
            { value: 'table', label: 'Table', icon: ListIcon, iconOnly: true }]
            } />
          
        </div>
      </div>

      {visible.length === 0 ?
      <div className="mt-5 rounded-lg border border-line bg-raised">
          <EmptyState icon={SearchIcon} title="No spaces match" description="Try another name, or show all statuses." action={<Button variant="secondary" onClick={() => {setQuery('');setFilter('all');}}>Clear filters</Button>} />
        </div> :
      view === 'table' ?
      <div className="mt-5">
          <DataTable caption="All spaces" rows={visible} columns={columns} emptyTitle="No spaces" />
        </div> :

      <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((r) =>
        <li key={r.id}>
              <article className={cn('flex h-full flex-col overflow-hidden rounded-lg border bg-raised', r.current ? 'border-select' : 'border-line')}>
                <button
              type="button"
              onClick={() => onOpen(r)}
              aria-label={r.current ? `Open ${r.doc?.title ?? r.workspace.name} in the canvas` : `Switch to ${r.workspace.name}`}
              className="dot-stage group flex h-44 items-end justify-center overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus">
              
                  {r.doc ?
              <span className="block translate-y-4 transition-transform duration-200 ease-out group-hover:translate-y-2">
                      <PageMiniPreview doc={r.doc} scale={0.3} height={170} />
                    </span> :

              <span className="mb-16 text-caption text-fg-subtle">No page yet</span>
              }
                </button>
                <div className="flex flex-1 flex-col border-t border-line p-4">
                  <div className="flex items-center justify-between gap-2">
                    <Badge tone={statusBadge[r.status].tone} dot>
                      {statusBadge[r.status].label}
                    </Badge>
                    {r.current && <span className="text-caption font-semibold text-action">You’re here</span>}
                  </div>
                  <h3 className="mt-2.5 truncate text-label font-semibold text-fg">{r.doc?.title ?? r.workspace.name}</h3>
                  <p className="truncate font-mono text-caption text-fg-subtle">{r.doc ? publicUrl(r.doc.handle) : '—'}</p>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                    <span className="min-w-0 truncate text-caption text-fg-subtle">
                      {r.workspace.name} · {plans[r.workspace.plan].name}
                    </span>
                    {action(r)}
                  </div>
                </div>
              </article>
            </li>
        )}
        </ul>
      }
    </section>);

}