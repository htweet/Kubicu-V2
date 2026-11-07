import React from 'react';
import { motion, useDragControls } from 'framer-motion';
import { AlertCircleIcon, AlertTriangleIcon, ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, CopyIcon, EyeOffIcon, GripVerticalIcon, LogOutIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { useCanvasDrop } from '../../hooks/useContainerDrop';
import type { Block, PageTheme } from '../../types/page';
import type { ValidationIssue } from '../../utils/validation';
import type { ContainerBlock } from '../../utils/containers';
import { slotName } from '../../utils/containers';
import { BlockRenderer, spacingClass } from '../blocks/BlockRenderer';
import { blockName, layerName } from '../../utils/blocks';
import { useEditor } from '../../contexts/EditorContext';
import { useRemoveBlock } from '../../hooks/useRemoveBlock';
import { cn } from '../../utils/cn';

interface ChildFrameProps {
  block: Block;
  theme: PageTheme;
  container: ContainerBlock;
  index: number;
  count: number;
  selected: boolean;
  issues: ValidationIssue[];
  touch: boolean;
  onSelect: (id: string) => void;
  onEdit?: (id: string) => void;
}

/**
 * A block inside a container on the canvas (D167). Selectable on its own, with a compact toolbar:
 * move earlier/later among its siblings (no dragging needed), take it out, duplicate, delete.
 */
export function ChildFrame({ block, theme, container, index, count, selected, issues, touch, onSelect, onEdit }: ChildFrameProps) {
  const { actions } = useEditor();
  const removeBlock = useRemoveBlock();
  const name = layerName(block);
  const where = `${slotName(container, index, block)} of ${blockName(container)}`;
  const hidden = block.visibility.hidden;
  const locked = !!block.locked;
  const hasError = issues.some((i) => i.severity === 'error');
  const hasWarning = !hasError && issues.length > 0;
  const across = container.type !== 'section';
  const PrevIcon = across ? ArrowLeftIcon : ArrowUpIcon;
  const NextIcon = across ? ArrowRightIcon : ArrowDownIcon;
  const btn = cn(
    'inline-flex items-center justify-center rounded-sm text-fg-muted transition-colors duration-100 hover:bg-sunken hover:text-fg',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:pointer-events-none disabled:opacity-35',
    touch ? 'h-10 w-10' : 'h-7 w-7',
  );
  const size = touch ? 17 : 14;
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();
  const ref = React.useRef<HTMLDivElement>(null);
  // Drag handle (D191): drop within this container, into another, or out onto the page at a chosen spot.
  const drop = useCanvasDrop();
  const dragControls = useDragControls();
  // Selected from Layers or ⌘K "Go to block": bring it into view like page blocks do.
  React.useEffect(() => {
    if (selected) ref.current?.scrollIntoView({ block: 'nearest', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, [selected]);

  return (
    <motion.div
      ref={ref}
      data-drag-source={block.id}
      className={cn('group/child relative', selected && 'z-20')}
      drag={!!drop && !locked}
      dragListener={false}
      dragControls={dragControls}
      dragSnapToOrigin
      dragMomentum={false}
      whileDrag={{ scale: 1.02, zIndex: 40, opacity: 0.92 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      onDrag={drop ? (_e, info) => drop.onChildDrag(block.id, info) : undefined}
      onDragEnd={drop ? (_e, info) => drop.onChildDragEnd(block.id, info) : undefined}
    >
      <div
        role="button"
        tabIndex={0}
        data-block-id={block.id}
        aria-pressed={selected}
        aria-label={`${name} block, ${where}${hidden ? ', hidden from live page' : ''}${hasError ? ', needs attention' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(block.id);
        }}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            onSelect(block.id);
          }
        }}
        className="relative cursor-pointer rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
      >
        <div className={cn(spacingClass[block.layout.spacing], hidden && 'opacity-40')}>
          <BlockRenderer block={block} theme={theme} mode="edit" />
        </div>
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute -inset-x-1.5 inset-y-0 rounded-[10px] transition-[border-color] duration-150 ease-out',
            selected ? 'border-2 border-select' : 'border border-dashed border-select/25 group-hover/child:border-select/70',
          )}
        />
        {selected && (
          <span aria-hidden className="pointer-events-none absolute -left-1.5 -top-2.5 inline-flex h-5 max-w-[80%] items-center rounded-[5px] bg-select px-1.5 text-meta font-semibold text-select-fg">
            <span className="truncate">
              {name}
              <span className="font-medium opacity-80"> · {slotName(container, index, block)}</span>
            </span>
          </span>
        )}
        {(hidden || hasError || hasWarning) && (
          <span className="pointer-events-none absolute -right-0.5 top-1 flex gap-1">
            {hidden && (
              <span className="inline-flex h-5 items-center gap-1 rounded-full bg-inverse px-1.5 text-meta font-medium text-fg-inverse">
                <EyeOffIcon size={10} aria-hidden /> Hidden
              </span>
            )}
            {hasError && (
              <span className="inline-flex h-5 items-center gap-1 rounded-full bg-danger-soft px-1.5 text-meta font-semibold text-danger ring-1 ring-danger/40">
                <AlertCircleIcon size={10} aria-hidden /> Fix
              </span>
            )}
            {hasWarning && (
              <span className="inline-flex h-5 items-center gap-1 rounded-full bg-warning-soft px-1.5 text-meta font-semibold text-warning ring-1 ring-warning/40">
                <AlertTriangleIcon size={10} aria-hidden /> Check
              </span>
            )}
          </span>
        )}
      </div>
      {selected && (
        <div
          role="toolbar"
          aria-label={`${name} actions`}
          onClick={stop}
          onKeyDown={stop}
          className={cn('absolute right-0 z-30 flex items-center gap-0.5 rounded-md border border-line bg-overlay p-0.5 text-fg shadow-2', touch ? '-bottom-12' : '-top-9')}
        >
          {drop && (
            <button
              type="button"
              aria-label="Drag to move — within, into another container, or out onto the page. The arrow and Move out buttons do the same."
              title="Drag to move"
              disabled={locked}
              onPointerDown={(e) => {
                e.stopPropagation();
                dragControls.start(e);
              }}
              className={cn(btn, 'cursor-grab touch-none active:cursor-grabbing')}
            >
              <GripVerticalIcon size={size} aria-hidden />
            </button>
          )}
          <button type="button" aria-label={across ? 'Move earlier' : 'Move up'} title={across ? 'Move earlier' : 'Move up'} disabled={index === 0 || locked} onClick={() => actions.moveBlock(block.id, -1)} className={btn}>
            <PrevIcon size={size} aria-hidden />
          </button>
          <button type="button" aria-label={across ? 'Move later' : 'Move down'} title={across ? 'Move later' : 'Move down'} disabled={index === count - 1 || locked} onClick={() => actions.moveBlock(block.id, 1)} className={btn}>
            <NextIcon size={size} aria-hidden />
          </button>
          <span aria-hidden className="mx-0.5 h-4 w-px bg-line" />
          {onEdit && (
            <button type="button" aria-label="Edit block" title="Edit block" onClick={() => onEdit(block.id)} className={btn}>
              <PencilIcon size={size} aria-hidden />
            </button>
          )}
          <button type="button" aria-label={`Move out of ${blockName(container)}`} title={`Move out of ${blockName(container)}`} disabled={locked} onClick={() => actions.moveOutOfContainer(block.id)} className={btn}>
            <LogOutIcon size={size} aria-hidden />
          </button>
          <button type="button" aria-label="Duplicate" title="Duplicate" onClick={() => actions.duplicateBlock(block.id)} className={btn}>
            <CopyIcon size={size} aria-hidden />
          </button>
          <button type="button" aria-label="Delete" title="Delete" disabled={locked} onClick={() => removeBlock(block.id)} className={cn(btn, 'hover:bg-danger-soft hover:text-danger')}>
            <Trash2Icon size={size} aria-hidden />
          </button>
        </div>
      )}
    </motion.div>
  );
}
