import React, { useEffect, useRef } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { AlertCircleIcon, AlertTriangleIcon, CalendarClockIcon, EyeOffIcon, LockIcon } from 'lucide-react';
import { windowState } from '../../utils/schedule';
import type { Block, PageTheme } from '../../types/page';
import type { ValidationIssue } from '../../utils/validation';
import { BlockRenderer, spacingClass } from '../blocks/BlockRenderer';
import { BlockToolbar } from './BlockToolbar';
import { blockName } from '../../utils/blocks';
import { cn } from '../../utils/cn';

interface BlockFrameProps {
  block: Block;
  theme: PageTheme;
  selected: boolean;
  issues: ValidationIssue[];
  isFirst: boolean;
  isLast: boolean;
  touch: boolean;
  groupName?: string;
  /** True when the selected block is in the same group, so the group outline shows. */
  groupActive: boolean;
  groupEdge: {first: boolean;last: boolean;};
  onSelect: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onDuplicate: (id: string) => void;
  onToggleHidden: (id: string) => void;
  onToggleLocked: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
}

export function BlockFrame({
  block,
  theme,
  selected,
  issues,
  isFirst,
  isLast,
  touch,
  groupName,
  groupActive,
  groupEdge,
  onSelect,
  onMove,
  onDuplicate,
  onToggleHidden,
  onToggleLocked,
  onDelete,
  onEdit
}: BlockFrameProps) {
  const dragControls = useDragControls();
  const ref = useRef<HTMLDivElement>(null);
  const name = blockName(block);
  const hidden = block.visibility.hidden;
  const locked = !!block.locked;
  const hasError = issues.some((i) => i.severity === 'error');
  const hasWarning = !hasError && issues.length > 0;
  const schedule = windowState(block.visibility);
  const scheduleLabel = schedule === 'upcoming' ? 'Scheduled' : schedule === 'ended' ? 'Ended' : schedule === 'active' ? 'Timed' : null;

  useEffect(() => {
    if (selected) ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selected]);

  return (
    <Reorder.Item
      value={block.id}
      dragListener={false}
      dragControls={dragControls}
      as="div"
      ref={ref}
      className={cn('group/block relative', selected && 'z-10')}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      whileDrag={{ scale: 1.015, zIndex: 30 }}>
      
      {groupActive &&
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute -left-3.5 w-[3px] bg-select/45',
          groupEdge.first ? 'top-1 rounded-t-full' : 'top-0',
          groupEdge.last ? 'bottom-1 rounded-b-full' : 'bottom-0'
        )} />

      }
      <div
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        aria-label={`${name} block${groupName ? `, in ${groupName}` : ''}${locked ? ', locked' : ''}${hidden ? ', hidden from live page' : ''}${hasError ? ', needs attention' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(block.id);
        }}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(block.id);
          }
        }}
        className="relative cursor-pointer rounded-[12px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-4">
        
        <div className={cn(spacingClass[block.layout.spacing], hidden && 'opacity-40')}>
          <BlockRenderer block={block} theme={theme} mode="edit" />
        </div>
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute -inset-x-2 inset-y-0 rounded-[12px] transition-[border-color] duration-150 ease-out',
            selected ?
            'border-2 border-select' :
            'border border-dashed border-transparent group-hover/block:border-select/60'
          )} />
        
        {selected &&
        <span
          aria-hidden
          className="pointer-events-none absolute -left-2 -top-2.5 inline-flex h-5 max-w-[70%] items-center gap-1 rounded-[5px] bg-select px-1.5 text-meta font-semibold text-select-fg">
          
            {locked && <LockIcon size={10} className="shrink-0" />}
            <span className="truncate">
              {name}
              {groupName && <span className="font-medium opacity-80"> · {groupName}</span>}
            </span>
          </span>
        }
        {(hidden || locked || hasError || hasWarning || scheduleLabel) &&
        <span className="pointer-events-none absolute -right-1 top-1 flex gap-1">
            {scheduleLabel && !hidden &&
          <span className="inline-flex h-5 items-center gap-1 rounded-full bg-info-soft px-1.5 text-meta font-medium text-info ring-1 ring-info/30">
                <CalendarClockIcon size={10} aria-hidden /> {scheduleLabel}
              </span>
          }
            {locked && !selected &&
          <span className="inline-flex h-5 items-center gap-1 rounded-full bg-inverse px-1.5 text-meta font-medium text-fg-inverse">
                <LockIcon size={10} aria-hidden /> Locked
              </span>
          }
            {hidden &&
          <span className="inline-flex h-5 items-center gap-1 rounded-full bg-inverse px-1.5 text-meta font-medium text-fg-inverse">
                <EyeOffIcon size={10} aria-hidden /> Hidden
              </span>
          }
            {hasError &&
          <span className="inline-flex h-5 items-center gap-1 rounded-full bg-danger-soft px-1.5 text-meta font-semibold text-danger ring-1 ring-danger/40">
                <AlertCircleIcon size={10} aria-hidden /> Fix
              </span>
          }
            {hasWarning &&
          <span className="inline-flex h-5 items-center gap-1 rounded-full bg-warning-soft px-1.5 text-meta font-semibold text-warning ring-1 ring-warning/40">
                <AlertTriangleIcon size={10} aria-hidden /> Check
              </span>
          }
          </span>
        }
      </div>
      {selected &&
      <div className={cn('absolute right-0 z-20', touch ? '-bottom-12' : '-top-9')}>
          <BlockToolbar
          dragControls={dragControls}
          hidden={hidden}
          locked={locked}
          isFirst={isFirst}
          isLast={isLast}
          touch={touch}
          onMove={(d) => onMove(block.id, d)}
          onDuplicate={() => onDuplicate(block.id)}
          onToggleHidden={() => onToggleHidden(block.id)}
          onToggleLocked={() => onToggleLocked(block.id)}
          onDelete={() => onDelete(block.id)}
          onEdit={onEdit ? () => onEdit(block.id) : undefined} />
        
        </div>
      }
    </Reorder.Item>);

}