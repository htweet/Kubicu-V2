import React from 'react';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ClipboardCopyIcon,
  ClipboardPasteIcon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  GripVerticalIcon,
  LockIcon,
  LockOpenIcon,
  PencilIcon,
  Trash2Icon,
} from 'lucide-react';
import type { DragControls } from 'framer-motion';
import { cn } from '../../utils/cn';
import { useT } from '../../contexts/LocaleContext';

interface BlockToolbarProps {
  dragControls: DragControls;
  hidden: boolean;
  locked: boolean;
  isFirst: boolean;
  isLast: boolean;
  touch: boolean;
  onMove: (direction: -1 | 1) => void;
  onDuplicate: () => void;
  onToggleHidden: () => void;
  onToggleLocked: () => void;
  onDelete: () => void;
  onEdit?: () => void;
  /** D516: copy to the canvas clipboard; paste shows only when something's been copied. */
  onCopy?: () => void;
  onPaste?: () => void;
  pasteName?: string | null;
}

export function BlockToolbar({
  dragControls,
  hidden,
  locked,
  isFirst,
  isLast,
  touch,
  onMove,
  onDuplicate,
  onToggleHidden,
  onToggleLocked,
  onDelete,
  onEdit,
  onCopy,
  onPaste,
  pasteName,
}: BlockToolbarProps) {
  const { t: tr } = useT();
  const btn = cn(
    'inline-flex items-center justify-center rounded-sm text-fg-muted transition-colors duration-100 hover:bg-sunken hover:text-fg',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:pointer-events-none disabled:opacity-35',
    touch ? 'h-10 w-10' : 'h-7 w-7',
  );
  const size = touch ? 17 : 14;
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();
  const lockedHint = locked ? ' (unlock first)' : '';

  return (
    <div
      role="toolbar"
      aria-label="Block actions"
      onClick={stop}
      onKeyDown={stop}
      className="flex items-center gap-0.5 rounded-md border border-line bg-overlay p-0.5 text-fg shadow-2"
    >
      <button
        type="button"
        aria-label="Drag to reorder"
        title={`Drag to reorder${lockedHint}`}
        disabled={locked}
        onPointerDown={(e) => !locked && dragControls.start(e)}
        className={cn(btn, 'cursor-grab touch-none active:cursor-grabbing')}
      >
        <GripVerticalIcon size={size} aria-hidden />
      </button>
      <button type="button" aria-label="Move up" title={`Move up${lockedHint}`} disabled={isFirst || locked} onClick={() => onMove(-1)} className={btn}>
        <ArrowUpIcon size={size} aria-hidden />
      </button>
      <button type="button" aria-label="Move down" title={`Move down${lockedHint}`} disabled={isLast || locked} onClick={() => onMove(1)} className={btn}>
        <ArrowDownIcon size={size} aria-hidden />
      </button>
      <span aria-hidden className="mx-0.5 h-4 w-px bg-line" />
      {onEdit && (
        <button type="button" aria-label="Edit block" title="Edit block" onClick={onEdit} className={btn}>
          <PencilIcon size={size} aria-hidden />
        </button>
      )}
      <button type="button" aria-label="Duplicate" title="Duplicate" onClick={onDuplicate} className={btn}>
        <CopyIcon size={size} aria-hidden />
      </button>
      {onCopy && (
        <button type="button" aria-label={tr('Copy')} title={touch ? tr('Copy') : tr('Copy — paste on any page (⌘C)')} onClick={onCopy} className={btn}>
          <ClipboardCopyIcon size={size} aria-hidden />
        </button>
      )}
      {onPaste && pasteName && (
        <button
          type="button"
          aria-label={tr('Paste “{name}” here', { name: pasteName })}
          title={tr('Paste “{name}” here', { name: pasteName }) + (touch ? '' : ' (⌘V)')}
          onClick={onPaste}
          className={btn}
        >
          <ClipboardPasteIcon size={size} aria-hidden />
        </button>
      )}
      <button
        type="button"
        aria-label={hidden ? 'Show on live page' : 'Hide from live page'}
        title={(hidden ? 'Show on live page' : 'Hide from live page') + lockedHint}
        disabled={locked}
        onClick={onToggleHidden}
        className={btn}
      >
        {hidden ? <EyeIcon size={size} aria-hidden /> : <EyeOffIcon size={size} aria-hidden />}
      </button>
      <button
        type="button"
        aria-label={locked ? 'Unlock block' : 'Lock block'}
        aria-pressed={locked}
        title={locked ? 'Unlock block' : 'Lock block — prevents edits, moves and deletion'}
        onClick={onToggleLocked}
        className={cn(btn, locked && 'bg-action-soft text-action hover:bg-action-soft hover:text-action')}
      >
        {locked ? <LockIcon size={size} aria-hidden /> : <LockOpenIcon size={size} aria-hidden />}
      </button>
      <button
        type="button"
        aria-label="Delete"
        title={`Delete${lockedHint}`}
        disabled={locked}
        onClick={onDelete}
        className={cn(btn, 'hover:bg-danger-soft hover:text-danger')}
      >
        <Trash2Icon size={size} aria-hidden />
      </button>
    </div>
  );
}
