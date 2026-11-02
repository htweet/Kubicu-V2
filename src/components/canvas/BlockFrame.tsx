import React, { useEffect, useRef } from 'react';
import { Reorder, useDragControls, type PanInfo } from 'framer-motion';
import { AlertCircleIcon, AlertTriangleIcon, CalendarClockIcon, ColumnsIcon, EyeOffIcon, LockIcon, SplitIcon } from 'lucide-react';
import { WIDE_PX, sectionTheme, widthOf } from '../../utils/pageLayout';
import { windowState } from '../../utils/schedule';
import { activeRule } from '../../utils/intentflow';
import { sourceLabels } from '../../utils/analytics/track';
import { useT } from '../../contexts/LocaleContext';
import type { Block, PageTheme } from '../../types/page';
import type { ValidationIssue } from '../../utils/validation';
import { BlockRenderer, spacingClass } from '../blocks/BlockRenderer';
import { BlockToolbar } from './BlockToolbar';
import { layerName } from '../../utils/blocks';
import { cn } from '../../utils/cn';
import { toast } from 'sonner';
import { usePresence } from '../../contexts/PresenceContext';

interface BlockFrameProps {
  block: Block;
  theme: PageTheme;
  /** Page reading-column width (D153). */
  columnPx: number;
  /** Page section spacing (D175). */
  density?: 'comfortable' | 'compact';
  /** The block above pairs with this one on wider screens. */
  pairedWithPrevious?: boolean;
  /** Neighbours share this block's section background, so the band continues (D216). */
  joinPrev?: boolean;
  joinNext?: boolean;
  selected: boolean;
  /** Changed since the live version (D171). */
  edited?: boolean;
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
  /** Copy / paste (D516). */
  onCopy?: (id: string) => void;
  onPaste?: () => void;
  pasteName?: string | null;
  /** Dragging into containers (D180): pointer position while this block is dragged, and on drop. */
  onDragMove?: (id: string, info: PanInfo) => void;
  onDragDone?: (id: string, info: PanInfo) => void;
  /** Set while a dragged block hovers this frame: a container it would go into, or a page spot above/below (D191). */
  dropTarget?: {ok: boolean;message: string;kind: 'into' | 'page';beforeId: string | null;} | null;
}

export function BlockFrame({
  block,
  theme: pageTheme,
  columnPx,
  density,
  pairedWithPrevious,
  joinPrev,
  joinNext,
  selected,
  edited,
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
  onEdit,
  onCopy,
  onPaste,
  pasteName,
  onDragMove,
  onDragDone,
  dropTarget
}: BlockFrameProps) {
  const dragControls = useDragControls();
  const ref = useRef<HTMLDivElement>(null);
  // Someone else on this block: another tab (live) or a simulated teammate (D60, D143).
  const other = usePresence().find((p) => p.blockId === block.id);
  const otherFirst = other ? other.name.split(' (')[0].split(' ')[0] : '';
  const name = layerName(block);
  const hidden = block.visibility.hidden;
  const locked = !!block.locked;
  const hasError = issues.some((i) => i.severity === 'error');
  const hasWarning = !hasError && issues.length > 0;
  const schedule = windowState(block.visibility);
  const sourceRule = activeRule(block.visibility);
  const { t: tr } = useT();
  // Same wording as the Visibility tab and IntentFlow, with each source name translated (D342).
  const ruleLine = sourceRule ?
  tr(sourceRule.mode === 'only' ? 'Only visits from {list}' : 'Everyone except visits from {list}', { list: sourceRule.ids.map((i) => tr(sourceLabels[i])).join(', ') }) :
  '';
  const scheduleLabel = schedule === 'upcoming' ? 'Scheduled' : schedule === 'ended' ? 'Ended' : schedule === 'active' ? 'Timed' : null;
  // Layout sections (D153): the canvas shows width and section background; pairs show a chip and sit side by side in Preview.
  const width = widthOf(block);
  const background = block.layout.background ?? 'none';
  const theme = sectionTheme(pageTheme, background);
  const maxWidth = width === 'column' ? columnPx : width === 'wide' ? WIDE_PX : undefined;
  const pairLabel = block.layout.pair ? 'Beside the next block on wider screens' : pairedWithPrevious ? 'Beside the block above on wider screens' : null;

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
      className={cn(
        'group/block relative w-full',
        selected && 'z-10',
        background !== 'none' && (joinPrev ? 'pt-0' : density === 'compact' ? 'pt-4' : 'pt-6'),
        background !== 'none' && (joinNext ? 'pb-0' : density === 'compact' ? 'pb-4' : 'pb-6')
      )}
      style={background !== 'none' ? { background: theme.background, color: theme.text } : undefined}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      whileDrag={{ scale: 1.015, zIndex: 30 }}
      onDrag={onDragMove ? (_e, info) => onDragMove(block.id, info) : undefined}
      onDragEnd={onDragDone ? (_e, info) => onDragDone(block.id, info) : undefined}>
      
      {dropTarget?.kind === 'page' &&
      <div aria-hidden className={cn('pointer-events-none absolute inset-x-2 z-20 flex justify-center', dropTarget.beforeId === block.id ? '-top-1' : '-bottom-1')}>
          <span className={cn('absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full', dropTarget.ok ? 'bg-select' : 'bg-danger')} />
          <span className={cn('relative -translate-y-1/2 rounded-full px-3 py-1 text-center text-[12.5px] font-semibold shadow-sm', dropTarget.ok ? 'bg-select text-white' : 'bg-danger text-white')}>
            {dropTarget.message}
          </span>
        </div>
      }
      {dropTarget?.kind === 'into' &&
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-1 z-20 flex items-start justify-center rounded-[14px] border-2 border-dashed',
          dropTarget.ok ? 'border-select bg-select/[0.06]' : 'border-danger bg-danger/[0.05]'
        )}>
        
          <span className={cn('mt-2 max-w-[90%] rounded-full px-3 py-1.5 text-center text-[12.5px] font-semibold shadow-sm', dropTarget.ok ? 'bg-select text-white' : 'bg-danger text-white')}>
            {dropTarget.message}
          </span>
        </div>
      }
      <div className={cn('relative mx-auto w-full', width !== 'full' && 'px-5')} style={{ maxWidth }}>
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
          data-block-id={block.id}
          aria-pressed={selected}
          aria-label={`${name} block${groupName ? `, in ${groupName}` : ''}${locked ? ', locked' : ''}${hidden ? ', hidden from live page' : ''}${hasError ? ', needs attention' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            if (other && !selected)
            toast(`${otherFirst} has this block selected`, {
              description: other.live ?
              'Live from another tab. If you both save, the second save is asked whether to keep theirs or yours.' :
              'Simulated presence. In the real product you’d see their changes live.'
            });
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
        {other &&
          <>
            <span aria-hidden className="pointer-events-none absolute -inset-x-2 inset-y-0 rounded-[12px] border-2" style={{ borderColor: other.colour }} />
            <span className="pointer-events-none absolute -top-2.5 right-0 z-10 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white" style={{ background: other.colour }}>
              {other.live ? other.name.includes('another tab') ? 'Your other tab' : otherFirst : `${otherFirst} · simulated`}
            </span>
          </>
          }
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
        {(hidden || locked || hasError || hasWarning || scheduleLabel || sourceRule || pairLabel || edited) &&
          <span className="pointer-events-none absolute -right-1 top-1 flex gap-1">
            {edited && !hasError && !hasWarning &&
            <span className="inline-flex h-5 items-center gap-1 rounded-full bg-sunken px-1.5 text-meta font-medium text-fg-muted ring-1 ring-line" title="Changed since you last published. Publish to put it live.">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-action" /> Unpublished
              </span>
            }
            {pairLabel && !hidden &&
            <span className="inline-flex h-5 items-center gap-1 rounded-full bg-sunken px-1.5 text-meta font-medium text-fg-muted ring-1 ring-line" title={`${pairLabel}. Open Preview to see it.`}>
                <ColumnsIcon size={10} aria-hidden /> Side by side
              </span>
            }
            {sourceRule && !hidden &&
            <span className="inline-flex h-5 items-center gap-1 rounded-full bg-info-soft px-1.5 text-meta font-medium text-info ring-1 ring-info/30" title={ruleLine}>
                <SplitIcon size={10} aria-hidden /> {tr(sourceRule.mode === 'only' ? 'Some sources' : 'Not all sources')}
              </span>
            }
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
            onEdit={onEdit ? () => onEdit(block.id) : undefined}
            onCopy={onCopy ? () => onCopy(block.id) : undefined}
            onPaste={onPaste}
            pasteName={pasteName} />
          
        </div>
        }
      </div>
    </Reorder.Item>);

}