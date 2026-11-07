import React, { useMemo, useState } from 'react';
import { ArrowLeftRightIcon, ChevronDownIcon, LayoutGridIcon, ListIcon, PenToolIcon, SearchIcon } from 'lucide-react';
import type { PageDocument } from '../../types/page';
import type { Space, SpaceKind, Workspace } from '../../types/workspace';
import type { SpaceStatus } from '../../utils/spaces';
import { spaceKinds } from '../../data/spaceKinds';
import { formatRelative, publicUrl } from '../../utils/format';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Segmented } from '../ui/Segmented';
import { DataTable, type DataColumn } from '../ui/DataTable';
import { EmptyState } from '../ui/EmptyState';
import { fieldControlClass } from '../ui/Field';
import { PageMiniPreview } from '../overview/PageMiniPreview';
import { cn } from '../../utils/cn';

export interface SpaceRow {
  id: string;
  workspace: Workspace;
  space: Space;
  doc: PageDocument | null;
  status: SpaceStatus;
  /** The workspace you're in. */
  inCurrentWorkspace: boolean;
}

type Filter = 'all' | 'live' | 'draft' | 'ended';
type KindFilter = 'all' | SpaceKind;
type View = 'cards' | 'table';

export const spaceStatusBadge: Record<SpaceStatus, { tone: 'success' | 'accent' | 'neutral' | 'warning'; label: string }> = {
  live: { tone: 'success', label: 'Live' },
  changes: { tone: 'accent', label: 'Live · unpublished changes' },
  scheduled: { tone: 'warning', label: 'Scheduled' },
  draft: { tone: 'neutral', label: 'Draft' },
  ended: { tone: 'neutral', label: 'Ended · archived' },
};

interface SpacesListProps {
  rows: SpaceRow[];
  onOpen: (row: SpaceRow) => void;
  /** Extra actions for a row (e.g. archive), shown on cards and in the table. */
  menuFor?: (row: SpaceRow) => React.ReactNode;
}

const title = (r: SpaceRow) => (r.space.kind === 'main' ? r.doc?.title ?? r.workspace.name : r.space.name);

/** The current workspace's spaces; optionally every workspace you belong to (D176). */
export function SpacesList({ rows, onOpen, menuFor }: SpacesListProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [kind, setKind] = useState<KindFilter>('all');
  const [view, setView] = useState<View>('cards');
  // Workspace boundary (D176): this workspace's spaces by default; your other workspaces only when you ask.
  const [scope, setScope] = useState<'workspace' | 'all'>('workspace');
  const workspaceCount = new Set(rows.map((r) => r.workspace.id)).size;
  const currentName = rows.find((r) => r.inCurrentWorkspace)?.workspace.name ?? 'this workspace';
  const scoped = useMemo(() => (scope === 'all' ? rows : rows.filter((r) => r.inCurrentWorkspace)), [rows, scope]);
  // A new workspace has one or two spaces — search, filters and a layout switch would be noise until there's a list to sort.
  const showTools = scoped.length > 4 || query !== '' || filter !== 'all' || kind !== 'all' || view !== 'cards';

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scoped.filter((r) => {
      if (kind !== 'all' && r.space.kind !== kind) return false;
      if (filter === 'live' && !(r.status === 'live' || r.status === 'changes')) return false;
      if (filter === 'draft' && !(r.status === 'draft' || r.status === 'scheduled')) return false;
      if (filter === 'ended' && r.status !== 'ended') return false;
      if (!q) return true;
      return `${title(r)} ${r.doc?.handle ?? ''} ${r.workspace.name}`.toLowerCase().includes(q);
    });
  }, [scoped, query, filter, kind]);

  const action = (r: SpaceRow) =>
    r.inCurrentWorkspace ? (
      <Button size="sm" variant="secondary" leadingIcon={PenToolIcon} disabled={r.status === 'ended'} onClick={() => onOpen(r)}>
        Open
      </Button>
    ) : (
      <Button size="sm" variant="secondary" leadingIcon={ArrowLeftRightIcon} onClick={() => onOpen(r)}>
        Switch
      </Button>
    );

  const kindTag = (r: SpaceRow) => {
    const K = spaceKinds[r.space.kind];
    return (
      <span className={cn('inline-flex items-center gap-1 text-caption font-medium', r.space.kind === 'main' ? 'text-fg-subtle' : 'text-action')}>
        <K.icon size={13} strokeWidth={2.25} aria-hidden />
        {K.label}
        {r.doc?.coBrand && <span className="font-normal text-fg-muted">· with {r.doc.coBrand.partnerName}</span>}
      </span>
    );
  };

  const columns: DataColumn<SpaceRow>[] = [
    {
      key: 'page',
      header: 'Space',
      sortValue: (r) => title(r).toLowerCase(),
      render: (r) => (
        <span className="block min-w-0">
          <span className="truncate font-semibold text-fg">{title(r)}</span>
          <span className="block truncate font-mono text-caption text-fg-subtle">{r.doc ? publicUrl(r.doc.handle) : 'No page yet'}</span>
        </span>
      ),
    },
    { key: 'kind', header: 'Type', sortValue: (r) => r.space.kind, render: kindTag },
    { key: 'status', header: 'Status', sortValue: (r) => r.status, render: (r) => <Badge tone={spaceStatusBadge[r.status].tone} dot>{spaceStatusBadge[r.status].label}</Badge> },
    ...(scope === 'all' ? [{ key: 'ws', header: 'Workspace', hideOnMobile: true, sortValue: (r: SpaceRow) => r.workspace.name, render: (r: SpaceRow) => <span className="text-fg-muted">{r.workspace.name}</span> }] : []),
    { key: 'edited', header: 'Last edited', hideOnMobile: true, sortValue: (r) => Date.parse(r.doc?.updatedAt ?? r.space.createdAt), render: (r) => <span className="text-fg-muted">{formatRelative(r.doc?.updatedAt ?? r.space.createdAt)}</span> },
    {
      key: 'go',
      header: '',
      align: 'right',
      render: (r) => (
        <span className="inline-flex items-center gap-1">
          {action(r)}
          {menuFor?.(r)}
        </span>
      ),
    },
  ];

  return (
    <section aria-labelledby="all-spaces-heading" className="mt-14">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 id="all-spaces-heading" className="text-heading font-semibold text-fg">
            {scope === 'all' ? 'Spaces in all your workspaces' : 'Spaces in this workspace'} <span className="font-normal tabular-nums text-fg-subtle">· {scoped.length}</span>
          </h2>
          <p className="mt-0.5 text-label text-fg-muted">
            {scope === 'all'
              ? 'Each workspace keeps its own spaces, products, orders and contacts — nothing is shared between them. This view only lists workspaces you belong to; opening another one switches you into it.'
              : `Spaces in ${currentName} share its products, orders and contacts. Other workspaces can’t see them.`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {workspaceCount > 1 && (
            <Segmented<'workspace' | 'all'>
              ariaLabel="Which workspaces"
              value={scope}
              onChange={setScope}
              options={[
                { value: 'workspace', label: 'This workspace' },
                { value: 'all', label: `All ${workspaceCount}` },
              ]}
            />
          )}
          {showTools && (
          <>
          <div className="relative w-full sm:w-56">
            <SearchIcon size={15} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" />
            <label htmlFor="spaces-search" className="sr-only">
              Search spaces
            </label>
            <input id="spaces-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or link" className={cn(fieldControlClass, 'h-9 pl-9 text-label')} />
          </div>
          <label htmlFor="spaces-kind" className="sr-only">
            Type
          </label>
          <div className="relative">
            <select id="spaces-kind" value={kind} onChange={(e) => setKind(e.target.value as KindFilter)} className={cn(fieldControlClass, 'h-9 w-36 appearance-none pr-8 text-label')}>
              <option value="all">All types</option>
              {(Object.keys(spaceKinds) as SpaceKind[]).map((k) => (
                <option key={k} value={k}>
                  {spaceKinds[k].plural}
                </option>
              ))}
            </select>
            <ChevronDownIcon size={14} aria-hidden className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-subtle" />
          </div>
          <Segmented<Filter>
            ariaLabel="Status"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'All' },
              { value: 'live', label: 'Live' },
              { value: 'draft', label: 'Drafts' },
              { value: 'ended', label: 'Ended' },
            ]}
          />
          <Segmented<View>
            ariaLabel="Layout"
            value={view}
            onChange={setView}
            options={[
              { value: 'cards', label: 'Cards', icon: LayoutGridIcon, iconOnly: true },
              { value: 'table', label: 'Table', icon: ListIcon, iconOnly: true },
            ]}
          />
          </>
          )}
        </div>
      </div>

      {visible.length === 0 ? (
          <EmptyState
            framed
            className="mt-5"
            icon={SearchIcon}
            title="No spaces match"
            description="Try another name, type or status."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setQuery('');
                  setFilter('all');
                  setKind('all');
                }}
              >
                Clear filters
              </Button>
            }
          />
      ) : view === 'table' ? (
        <div className="mt-5">
          <DataTable caption="All spaces" rows={visible} columns={columns} emptyTitle="No spaces" />
        </div>
      ) : (
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((r) => (
            <li key={r.id}>
              <article className={cn('flex h-full flex-col overflow-hidden rounded-lg border bg-raised', r.status === 'ended' ? 'border-line opacity-80' : 'border-line')}>
                <button
                  type="button"
                  onClick={() => onOpen(r)}
                  disabled={r.inCurrentWorkspace && r.status === 'ended'}
                  aria-label={r.inCurrentWorkspace ? `Open ${title(r)} in the canvas` : `Switch to ${r.workspace.name} and open ${title(r)}`}
                  className="dot-stage group flex h-44 items-end justify-center overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus disabled:cursor-default"
                >
                  {r.doc ? (
                    <span className="block translate-y-4 transition-transform duration-200 ease-out group-hover:translate-y-2 group-disabled:translate-y-4">
                      <PageMiniPreview doc={r.doc} scale={0.3} height={170} />
                    </span>
                  ) : (
                    <span className="mb-16 text-caption text-fg-subtle">No page yet</span>
                  )}
                </button>
                <div className="flex flex-1 flex-col border-t border-line p-4">
                  <div className="flex items-center justify-between gap-2">
                    {kindTag(r)}
                    <Badge tone={spaceStatusBadge[r.status].tone} dot>
                      {spaceStatusBadge[r.status].label}
                    </Badge>
                  </div>
                  <h3 className="mt-2.5 truncate text-label font-semibold text-fg">{title(r)}</h3>
                  <p className="truncate font-mono text-caption text-fg-subtle">{r.doc ? publicUrl(r.doc.handle) : '—'}</p>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                    <span className="min-w-0 truncate text-caption text-fg-subtle">{r.inCurrentWorkspace ? `Edited ${formatRelative(r.doc?.updatedAt ?? r.space.createdAt)}` : r.workspace.name}</span>
                    <span className="flex shrink-0 items-center gap-1">
                      {action(r)}
                      {menuFor?.(r)}
                    </span>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
