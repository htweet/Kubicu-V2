import React from 'react';
import { PlusIcon, StarIcon } from 'lucide-react';
import type { BlockType } from '../../types/page';
import { blockDefinitions } from '../../data/blockRegistry';
import { BlockStatusChip, type BlockStatus } from './BlockStatusChip';
import { useT } from '../../contexts/LocaleContext';
import { cn } from '../../utils/cn';

interface BlockRowProps {
  type: BlockType;
  status: BlockStatus;
  favourite: boolean;
  touch?: boolean;
  note?: string;
  onOpen: () => void;
  onAdd: () => void;
  onToggleFavourite: () => void;
}

/**
 * One block in the picker's list view. The row uses the full width; the star and + float over its right
 * edge only on hover or keyboard focus (always shown on touch), so they never take width from the text.
 * A favourited star stays visible as a small marker.
 */
export function BlockRow({ type, status, favourite, touch, note, onOpen, onAdd, onToggleFavourite }: BlockRowProps) {
  const { t: tr } = useT();
  const def = blockDefinitions[type];
  const name = tr(def.name);
  const Icon = def.icon;
  const canAdd = status !== 'app' && status !== 'planned';
  return (
    <li className="group relative rounded-md transition-colors duration-150 hover:bg-sunken focus-within:bg-sunken">
      <button
        type="button"
        onClick={onOpen}
        aria-label={tr('{name} — details', { name })}
        className={cn('flex w-full min-w-0 items-center gap-3 rounded-md px-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus', touch ? 'min-h-[60px] py-2 pr-24' : 'min-h-[52px] py-1.5')}>
        
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-line bg-raised text-fg-muted">
          <Icon size={16} aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-label font-medium text-fg">{name}</span>
            {favourite && !touch && <StarIcon size={11} fill="currentColor" className="shrink-0 text-warning group-hover:invisible group-focus-within:invisible" aria-label={tr('Favourite')} />}
          </span>
          <span className="mt-0.5 flex min-w-0 items-center gap-1.5">
            {status !== 'available' && <BlockStatusChip status={status} />}
            <span className="truncate text-caption text-fg-subtle">{note ?? tr(def.description)}</span>
          </span>
        </span>
      </button>
      {/* Overlay actions: no reserved width; they sit on the row's own hover background. */}
      <span
        className={cn(
          'absolute inset-y-0 right-0 flex items-center gap-0.5 rounded-r-md bg-sunken pl-2 pr-1 transition-opacity duration-150',
          touch ? 'bg-transparent opacity-100' : 'pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100'
        )}>
        
        <button
          type="button"
          onClick={onToggleFavourite}
          aria-pressed={favourite}
          aria-label={favourite ? tr('Remove {name} from favourites', { name }) : tr('Add {name} to favourites', { name })}
          className={cn('relative flex items-center justify-center rounded-full hover:bg-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus', touch ? 'h-10 w-10' : 'h-8 w-8', favourite ? 'text-warning' : 'text-fg-subtle')}>
          
          <StarIcon size={14} fill={favourite ? 'currentColor' : 'none'} aria-hidden />
        </button>
        {canAdd &&
        <button
          type="button"
          onClick={onAdd}
          aria-label={tr('Add {name}', { name })}
          className={cn('relative flex items-center justify-center rounded-full bg-action text-action-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus', touch ? 'h-10 w-10' : 'h-8 w-8')}>
          
            <PlusIcon size={15} aria-hidden />
          </button>
        }
      </span>
    </li>);

}