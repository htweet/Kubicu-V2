import React, { useMemo, useState } from 'react';
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon, SearchIcon, SearchXIcon, CheckIcon, MinusIcon } from 'lucide-react';
import { fieldControlClass } from './Field';
import { EmptyState } from './EmptyState';
import { Skeleton } from './Skeleton';
import { cn } from '../../utils/cn';
import { useMediaQuery } from '../../hooks/useMediaQuery';

export interface DataColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  /** Provide to make the column sortable. */
  sortValue?: (row: T) => string | number;
  align?: 'left' | 'right';
  /** Hide on narrow screens so the important columns stay readable. */
  hideOnMobile?: boolean;
}

export interface BulkAction<T> {
  label: string;
  onRun: (rows: T[]) => void;
  destructive?: boolean;
}

interface DataTableProps<T extends {id: string;}> {
  caption: string;
  rows: T[];
  columns: DataColumn<T>[];
  /** Text searched by the filter box. */
  filterText?: (row: T) => string;
  filterPlaceholder?: string;
  bulkActions?: BulkAction<T>[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

type Sort = {key: string;dir: 'asc' | 'desc';} | null;

/** Operational table: filter, sort, bulk select. Low-priority columns drop away on mobile. */
export function DataTable<T extends {id: string;}>({
  caption,
  rows,
  columns,
  filterText,
  filterPlaceholder = 'Filter',
  bulkActions,
  loading,
  emptyTitle = 'Nothing here yet',
  emptyDescription
}: DataTableProps<T>) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const wide = useMediaQuery('(min-width: 768px)');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = q && filterText ? rows.filter((r) => filterText(r).toLowerCase().includes(q)) : rows;
    const col = sort && columns.find((c) => c.key === sort.key);
    if (sort && col?.sortValue) {
      const get = col.sortValue;
      out = [...out].sort((a, b) => {
        const av = get(a);
        const bv = get(b);
        const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
        return sort.dir === 'asc' ? cmp : -cmp;
      });
    }
    return out;
  }, [rows, query, sort, columns, filterText]);

  const selectedRows = visible.filter((r) => selected.has(r.id));
  const allChecked = visible.length > 0 && selectedRows.length === visible.length;
  const someChecked = selectedRows.length > 0 && !allChecked;
  const hasBulk = !!bulkActions?.length;

  const toggleAll = () => setSelected(allChecked ? new Set() : new Set(visible.map((r) => r.id)));
  const toggle = (id: string) =>
  setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);else
    next.add(id);
    return next;
  });

  const cycleSort = (key: string) =>
  setSort((s) => !s || s.key !== key ? { key, dir: 'asc' } : s.dir === 'asc' ? { key, dir: 'desc' } : null);

  const hide = (c: DataColumn<T>) => c.hideOnMobile ? 'hidden md:table-cell' : '';
  const sortable = columns.filter((c) => c.sortValue);

  // Phones: each row becomes a card — first column as the title, right-aligned values on the right, the rest beneath (D49).
  if (!wide) {
    const [primary, ...rest] = columns;
    const trailing = rest.filter((c) => !c.hideOnMobile && c.align === 'right');
    const meta = rest.filter((c) => !c.hideOnMobile && c.align !== 'right');
    return (
      <div className="flex flex-col gap-3">
        {filterText &&
        <div className="relative w-full">
            <SearchIcon size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" aria-hidden />
            <label className="sr-only" htmlFor={`${caption}-filter`}>
              {filterPlaceholder}
            </label>
            <input id={`${caption}-filter`} type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={filterPlaceholder} className={cn(fieldControlClass, 'h-11 pl-9 text-label')} />
          </div>
        }
        {(sortable.length > 0 || hasBulk) &&
        <div className="flex min-h-9 items-center justify-between gap-2">
            {hasBulk ?
          selectedRows.length > 0 ?
          <div className="flex flex-wrap items-center gap-2" aria-live="polite">
                  <span className="text-label font-medium text-fg">{selectedRows.length} selected</span>
                  {bulkActions!.map((a) =>
            <button
              key={a.label}
              type="button"
              onClick={() => {
                a.onRun(selectedRows);
                setSelected(new Set());
              }}
              className={cn('h-9 rounded-md border px-3 text-label font-medium', a.destructive ? 'border-danger/40 text-danger' : 'border-line-strong text-fg')}>
              
                      {a.label}
                    </button>
            )}
                </div> :

          <label className="flex h-11 items-center gap-2.5 text-label text-fg-muted">
                  <Checkbox checked={allChecked} mixed={someChecked} onChange={toggleAll} label="Select all rows" />
                  Select
                </label> :


          <span />
          }
            {sortable.length > 0 &&
          <label className="flex items-center gap-2 text-caption text-fg-subtle">
                Sort
                <select
              value={sort ? `${sort.key}:${sort.dir}` : ''}
              onChange={(e) => {
                const [key, dir] = e.target.value.split(':');
                setSort(key ? { key, dir: dir as 'asc' | 'desc' } : null);
              }}
              className={cn(fieldControlClass, 'h-9 w-auto py-0 pr-8 text-label')}>
              
                  <option value="">Default</option>
                  {sortable.flatMap((c) => [
              <option key={`${c.key}:asc`} value={`${c.key}:asc`}>
                      {c.header} ↑
                    </option>,
              <option key={`${c.key}:desc`} value={`${c.key}:desc`}>
                      {c.header} ↓
                    </option>]
              )}
                </select>
              </label>
          }
          </div>
        }
        <ul aria-label={caption} className="flex flex-col divide-y divide-line overflow-hidden rounded-md border border-line bg-raised">
          {loading ?
          Array.from({ length: 4 }).map((_, i) =>
          <li key={i} className="px-4 py-4">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="mt-2 h-3 w-1/3" />
                </li>
          ) :
          visible.map((row) => {
            const isSel = selected.has(row.id);
            return (
              <li key={row.id} className={cn('flex gap-3 px-4 py-3.5', isSel && 'bg-action-soft')}>
                    {hasBulk &&
                <span className="flex h-6 items-center">
                        <Checkbox checked={isSel} onChange={() => toggle(row.id)} label="Select row" />
                      </span>
                }
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 text-label text-fg">{primary?.render(row)}</div>
                        {trailing.length > 0 &&
                    <div className="flex shrink-0 flex-col items-end gap-0.5 text-right text-label tabular-nums text-fg">
                            {trailing.map((c) =>
                      <span key={c.key}>{c.render(row)}</span>
                      )}
                          </div>
                    }
                      </div>
                      {meta.length > 0 &&
                  <dl className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-caption">
                          {meta.map((c) =>
                    <div key={c.key} className="flex items-center gap-1.5">
                              <dt className="sr-only">{c.header}</dt>
                              <dd>{c.render(row)}</dd>
                            </div>
                    )}
                        </dl>
                  }
                    </div>
                  </li>);

          })}
        </ul>
        {!loading && visible.length === 0 &&
        <div className="rounded-md border border-line">
            <EmptyState icon={SearchXIcon} title={rows.length === 0 ? emptyTitle : 'No matches'} description={rows.length === 0 ? emptyDescription : `Nothing matches “${query}”.`} />
          </div>
        }
      </div>);

  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex min-h-9 flex-wrap items-center gap-2">
        {filterText &&
        <div className="relative w-full sm:w-64">
            <SearchIcon size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" aria-hidden />
            <label className="sr-only" htmlFor={`${caption}-filter`}>
              {filterPlaceholder}
            </label>
            <input
            id={`${caption}-filter`}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={filterPlaceholder}
            className={cn(fieldControlClass, 'h-9 pl-9 text-label')} />
          
          </div>
        }
        {hasBulk && selectedRows.length > 0 &&
        <div className="flex items-center gap-2 sm:ml-auto" aria-live="polite">
            <span className="text-label font-medium text-fg">{selectedRows.length} selected</span>
            {bulkActions!.map((a) =>
          <button
            key={a.label}
            type="button"
            onClick={() => {
              a.onRun(selectedRows);
              setSelected(new Set());
            }}
            className={cn(
              'h-8 rounded-md border px-3 text-label font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
              a.destructive ? 'border-danger/40 text-danger hover:bg-danger-soft' : 'border-line-strong text-fg hover:bg-sunken'
            )}>
            
                {a.label}
              </button>
          )}
          </div>
        }
      </div>

      <div className="overflow-x-auto rounded-md border border-line">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-sunken">
            <tr>
              {hasBulk &&
              <th scope="col" className="w-10 px-3 py-2.5">
                  <Checkbox checked={allChecked} mixed={someChecked} onChange={toggleAll} label="Select all rows" />
                </th>
              }
              {columns.map((c) => {
                const dir = sort?.key === c.key ? sort.dir : null;
                return (
                  <th
                    key={c.key}
                    scope="col"
                    aria-sort={dir ? dir === 'asc' ? 'ascending' : 'descending' : c.sortValue ? 'none' : undefined}
                    className={cn('whitespace-nowrap px-3 py-2.5 text-caption font-semibold text-fg-muted', c.align === 'right' && 'text-right', hide(c))}>
                    
                    {c.sortValue ?
                    <button
                      type="button"
                      onClick={() => cycleSort(c.key)}
                      className={cn('inline-flex items-center gap-1 rounded-sm hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus', c.align === 'right' && 'flex-row-reverse')}>
                      
                        {c.header}
                        {dir === 'asc' ? <ArrowUpIcon size={12} aria-hidden /> : dir === 'desc' ? <ArrowDownIcon size={12} aria-hidden /> : <ChevronsUpDownIcon size={12} className="opacity-50" aria-hidden />}
                      </button> :

                    c.header
                    }
                  </th>);

              })}
            </tr>
          </thead>
          <tbody>
            {loading ?
            Array.from({ length: 4 }).map((_, i) =>
            <tr key={i} className="border-t border-line">
                    {hasBulk && <td className="px-3 py-3" />}
                    {columns.map((c) =>
              <td key={c.key} className={cn('px-3 py-3', hide(c))}>
                        <Skeleton className="h-3.5 w-3/4" />
                      </td>
              )}
                  </tr>
            ) :
            visible.map((row) => {
              const isSel = selected.has(row.id);
              return (
                <tr key={row.id} className={cn('border-t border-line transition-colors duration-100', isSel ? 'bg-action-soft' : 'hover:bg-sunken/60')}>
                      {hasBulk &&
                  <td className="px-3 py-2.5">
                          <Checkbox checked={isSel} onChange={() => toggle(row.id)} label="Select row" />
                        </td>
                  }
                      {columns.map((c) =>
                  <td key={c.key} className={cn('px-3 py-2.5 text-label text-fg', c.align === 'right' && 'text-right tabular-nums', hide(c))}>
                          {c.render(row)}
                        </td>
                  )}
                    </tr>);

            })}
          </tbody>
        </table>
        {!loading && visible.length === 0 &&
        <EmptyState
          icon={SearchXIcon}
          title={rows.length === 0 ? emptyTitle : 'No matches'}
          description={rows.length === 0 ? emptyDescription : `Nothing matches “${query}”.`} />

        }
      </div>
    </div>);

}

function Checkbox({ checked, mixed, onChange, label }: {checked: boolean;mixed?: boolean;onChange: () => void;label: string;}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={mixed ? 'mixed' : checked}
      aria-label={label}
      onClick={onChange}
      // 24px hit area around a 16px box (WCAG 2.5.8, D76).
      className="-m-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
      
      <span
        aria-hidden
        className={cn(
          'flex h-4 w-4 items-center justify-center rounded-[4px] border',
          checked || mixed ? 'border-action bg-action text-action-fg' : 'border-line-strong bg-field'
        )}>
        
        {checked ? <CheckIcon size={11} strokeWidth={3} /> : mixed ? <MinusIcon size={11} strokeWidth={3} /> : null}
      </span>
    </button>);

}