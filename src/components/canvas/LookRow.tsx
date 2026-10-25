import React from 'react';
import { PlusIcon } from 'lucide-react';
import type { CatalogEntry } from '../../data/blockCatalog';
import { blockDefinitions } from '../../data/blockRegistry';
import { BlockStatusChip, type BlockStatus } from './BlockStatusChip';
import { cn } from '../../utils/cn';

/** A ready-made look in the picker (D171): the same block with different starting settings. */
export function LookRow({ entry, status, touch, onAdd }: {entry: CatalogEntry;status: BlockStatus;touch?: boolean;onAdd: () => void;}) {
  if (!entry.type) return null;
  const def = blockDefinitions[entry.type];
  const Icon = def.icon;
  const canAdd = status !== 'app' && status !== 'planned';
  return (
    <li>
      <button
        type="button"
        onClick={onAdd}
        disabled={!canAdd}
        aria-label={`Add ${entry.name} — starts as a ${def.name} block`}
        className={cn('group relative flex w-full items-center gap-3 rounded-md px-2 text-left transition-colors duration-150 hover:bg-sunken focus-visible:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-60', touch ? 'min-h-[60px] py-2 pr-14' : 'min-h-[48px] py-1.5')}>
        
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-dashed border-line-strong text-fg-muted">
          <Icon size={14} aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-label font-medium text-fg">{entry.name}</span>
          <span className="mt-0.5 flex min-w-0 items-center gap-1.5">
            {status !== 'available' && <BlockStatusChip status={status} />}
            <span className="truncate text-caption text-fg-subtle">
              {def.name} look{entry.note ? ` · ${entry.note}` : ''}
            </span>
          </span>
        </span>
        {/* Overlay: no reserved width on desktop; covers the row's right edge on hover/focus. */}
        {canAdd &&
        <span aria-hidden className={cn('absolute inset-y-0 right-0 flex items-center rounded-r-md pl-2 pr-1.5 transition-opacity duration-150', touch ? 'opacity-100' : 'bg-sunken opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100')}>
            <span className={cn('flex items-center justify-center rounded-full bg-action text-action-fg', touch ? 'h-10 w-10' : 'h-8 w-8')}>
              <PlusIcon size={14} />
            </span>
          </span>
        }
      </button>
    </li>);

}