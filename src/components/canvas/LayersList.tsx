import React, { useEffect, useRef, useState } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { toast } from 'sonner';
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  BookmarkPlusIcon,
  CheckIcon,
  ChevronRightIcon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  GripVerticalIcon,
  GroupIcon,
  LayersIcon,
  LockIcon,
  LockOpenIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
  UngroupIcon } from
'lucide-react';
import type { Block, BlockGroup } from '../../types/page';
import { useEditor } from '../../contexts/EditorContext';
import { blockDefinitions } from '../../data/blockRegistry';
import { blockName, summarizeBlock } from '../../utils/blocks';
import { toUnits } from '../../utils/groups';
import { issuesByBlock, type ValidationIssue } from '../../utils/validation';
import { EmptyState } from '../ui/EmptyState';
import { Kbd } from '../ui/Kbd';
import { Button } from '../ui/Button';
import { Menu } from '../ui/Menu';
import { cn } from '../../utils/cn';
import { SaveSectionDialog } from './SaveSectionDialog';
import { useCoBrandGuard } from '../../hooks/useCoBrandGuard';
import { useT } from '../../contexts/LocaleContext';

/** Translated block-type name; an owner's own layer name is shown as typed. */
function useBlockNames() {
  const { t: tr } = useT();
  const bn = (block: Block) => tr(blockName(block));
  const ln = (block: Block) => block.name?.trim() || bn(block);
  return { tr, bn, ln };
}

interface LayersListProps {
  touch?: boolean;
  onPick?: (id: string) => void;
}

const rowIconBtn = (touch: boolean) =>
cn(
  'inline-flex shrink-0 items-center justify-center rounded-sm text-fg-subtle transition-colors duration-100 hover:bg-raised hover:text-fg',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:pointer-events-none disabled:opacity-30',
  touch ? 'h-10 w-10' : 'h-7 w-7'
);

export function LayersList({ touch = false, onPick }: LayersListProps) {
  const { tr, bn } = useBlockNames();
  const { state, actions, issues } = useEditor();
  const guard = useCoBrandGuard();
  const [selecting, setSelecting] = useState(false);
  const [checked, setChecked] = useState<string[]>([]);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState<{blocks: Block[];name: string;} | null>(null);
  const blocks = state.draft.blocks;
  const units = toUnits(state.draft);
  const byBlock = issuesByBlock(issues);

  // Drop selections for blocks that no longer exist or have since been grouped.
  useEffect(() => {
    setChecked((prev) => prev.filter((id) => blocks.some((b) => b.id === id && !b.groupId)));
  }, [blocks]);

  if (blocks.length === 0) {
    return <EmptyState icon={LayersIcon} title={tr('No blocks yet')} description={tr('Blocks you add appear here in page order.')} />;
  }

  const toggleCheck = (id: string) => setChecked((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const stopSelecting = () => {
    setSelecting(false);
    setChecked([]);
  };
  const createGroup = () => {
    const groupId = actions.groupBlocks(checked);
    if (groupId) toast(tr('Grouped {n} blocks', { n: checked.length }), { description: tr('They now move, lock and hide together.') });
    stopSelecting();
  };

  const renderRow = (block: Block, opts: {inGroup: boolean;index: number;total: number;}) =>
  <LayerRow
    key={block.id}
    block={block}
    inGroup={opts.inGroup}
    isFirst={opts.index === 0}
    isLast={opts.index === opts.total - 1}
    selected={block.id === state.selectedId}
    issues={byBlock[block.id] ?? []}
    touch={touch}
    selecting={selecting}
    checked={checked.includes(block.id)}
    onCheck={() => toggleCheck(block.id)}
    onSelect={() => {
      actions.select(block.id);
      onPick?.(block.id);
    }}
    onMove={(d) => {
      if (!guard.canTouch(block.id)) return;
      if (opts.inGroup) actions.moveWithinGroup(block.id, d);else
      actions.moveBlock(block.id, d);
    }}
    onToggleHidden={() => actions.toggleHidden(block.id)}
    onToggleLocked={() => actions.toggleLocked(block.id)} />;



  return (
    <div className="flex flex-col gap-3 px-3 pb-6 pt-4">
      <div className="flex items-start justify-between gap-2 px-1">
        <p className="text-caption text-fg-subtle">
          {selecting ?
          tr('Choose blocks to group, or save them as a reusable section.') :
          touch ?
          tr('Use the arrows to reorder, or hold the grip and drag.') :

          <>
              {tr('Drag to reorder, or focus a layer and press')} <Kbd>Alt</Kbd> + <Kbd>↑</Kbd>/<Kbd>↓</Kbd>.
            </>
          }
        </p>
        {!selecting &&
        <Button variant="tertiary" size="sm" leadingIcon={GroupIcon} className="-mr-1 -mt-1 shrink-0" onClick={() => setSelecting(true)}>
            {tr('Select')}
          </Button>
        }
      </div>

      {selecting &&
      <div className="sticky top-0 z-10 flex items-center gap-2 rounded-md border border-line bg-overlay p-1.5 pl-3 shadow-1">
          <span className="min-w-0 flex-1 text-label font-medium text-fg" aria-live="polite">
            {tr('Selected: {n}', { n: checked.length })}
          </span>
          <Button variant="tertiary" size="sm" onClick={stopSelecting}>
            {tr('Cancel')}
          </Button>
          <Button
          variant="secondary"
          size="sm"
          leadingIcon={BookmarkPlusIcon}
          disabled={checked.length < 1}
          onClick={() => {
            // A saved container keeps what's inside it (D167).
            setSaving({ blocks: blocks.filter((b) => checked.includes(b.id) || !!b.parentId && checked.includes(b.parentId)), name: '' });
            stopSelecting();
          }}>
          
            {tr('Save')}
          </Button>
          <Button size="sm" disabled={checked.length < 2} onClick={createGroup}>
            {tr('Group')} {checked.length >= 2 ? checked.length : ''}
          </Button>
        </div>
      }

      <Reorder.Group
        axis="y"
        values={units.map((u) => u.key)}
        onReorder={(next: string[]) => {
          if (guard.canReorder(units.map((u) => u.key), next)) actions.reorderUnits(next);
        }}
        as="ol" className="flex flex-col gap-0.5">
        {units.map((unit, unitIndex) =>
        unit.kind === 'block' ?
        <UnitItem key={unit.key} value={unit.key} locked={!!unit.block.locked} selecting={selecting}>
              {(startDrag) =>
          <>
                  <BlockRowShell startDrag={startDrag} touch={touch} locked={!!unit.block.locked} selecting={selecting} label={bn(unit.block)}>
                    {renderRow(unit.block, { inGroup: false, index: unitIndex, total: units.length })}
                  </BlockRowShell>
                  {/* Containers (D167): the blocks inside, indented. Arrows move them among themselves. */}
                  {unit.children.length > 0 &&
            <ol aria-label={tr('Inside {name}', { name: bn(unit.block) })} className={cn('flex flex-col gap-0.5 border-l border-line pl-2', touch ? 'ml-10' : 'ml-7')}>
                      {unit.children.map((child, i) =>
              <li key={child.id}>{renderRow(child, { inGroup: false, index: i, total: unit.children.length })}</li>
              )}
                    </ol>
            }
                </>
          }
            </UnitItem> :

        <UnitItem key={unit.key} value={unit.key} locked={unit.blocks.every((b) => b.locked)} selecting={selecting}>
              {(startDrag) =>
          <GroupLayer
            group={unit.group}
            blocks={unit.blocks}
            touch={touch}
            selecting={selecting}
            collapsed={collapsed.has(unit.group.id)}
            isFirst={unitIndex === 0}
            isLast={unitIndex === units.length - 1}
            hasSelection={unit.blocks.some((b) => b.id === state.selectedId)}
            startDrag={startDrag}
            onSaveSection={() => setSaving({ blocks: unit.blocks, name: unit.group.name })}
            onToggleCollapsed={() =>
            setCollapsed((prev) => {
              const next = new Set(prev);
              if (next.has(unit.group.id)) next.delete(unit.group.id);else
              next.add(unit.group.id);
              return next;
            })
            }
            renderRow={(block, index) => renderRow(block, { inGroup: true, index, total: unit.blocks.length })} />

          }
            </UnitItem>

        )}
      </Reorder.Group>

      <SaveSectionDialog open={!!saving} onClose={() => setSaving(null)} blocks={saving?.blocks ?? []} defaultName={saving?.name ?? ''} />
    </div>);

}

/** A top-level draggable layer (single block or whole group). */
function UnitItem({
  value,
  locked,
  selecting,
  children





}: {value: string;locked: boolean;selecting: boolean;children: (startDrag: (e: React.PointerEvent) => void) => React.ReactNode;}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={value}
      dragListener={false}
      dragControls={controls}
      as="li"
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      whileDrag={{ scale: 1.02, zIndex: 10 }}
      className="relative">
      
      {children((e) => {
        if (!locked && !selecting) controls.start(e);
      })}
    </Reorder.Item>);

}

function BlockRowShell({
  startDrag,
  touch,
  locked,
  selecting,
  label,
  children







}: {startDrag: (e: React.PointerEvent) => void;touch: boolean;locked: boolean;selecting: boolean;label: string;children: React.ReactNode;}) {
  const { t: tr } = useT();
  return (
    <div className="group flex items-center">
      {!selecting &&
      <button
        type="button"
        aria-label={tr('Drag {name}', { name: label })}
        disabled={locked}
        onPointerDown={startDrag}
        className={cn(
          rowIconBtn(touch),
          'cursor-grab touch-none active:cursor-grabbing',
          !touch && 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100'
        )}>
        
          <GripVerticalIcon size={14} aria-hidden />
        </button>
      }
      <div className="min-w-0 flex-1">{children}</div>
    </div>);

}

interface GroupLayerProps {
  group: BlockGroup;
  blocks: Block[];
  touch: boolean;
  selecting: boolean;
  collapsed: boolean;
  isFirst: boolean;
  isLast: boolean;
  hasSelection: boolean;
  startDrag: (e: React.PointerEvent) => void;
  onToggleCollapsed: () => void;
  onSaveSection: () => void;
  renderRow: (block: Block, index: number) => React.ReactNode;
}

function GroupLayer({
  group,
  blocks,
  touch,
  selecting,
  collapsed,
  isFirst,
  isLast,
  hasSelection,
  startDrag,
  onToggleCollapsed,
  onSaveSection,
  renderRow
}: GroupLayerProps) {
  const { t: tr } = useT();
  const { actions } = useEditor();
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(group.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const allLocked = blocks.every((b) => b.locked);
  const allHidden = blocks.every((b) => b.visibility.hidden);
  const btn = rowIconBtn(touch);

  useEffect(() => setName(group.name), [group.name]);
  useEffect(() => {
    if (renaming) inputRef.current?.select();
  }, [renaming]);

  const commitName = () => {
    const trimmed = name.trim();
    if (trimmed && trimmed !== group.name) actions.renameGroup(group.id, trimmed);else
    setName(group.name);
    setRenaming(false);
  };

  const deleteGroup = () => {
    const lockedCount = blocks.filter((b) => b.locked).length;
    actions.removeGroup(group.id);
    toast(tr('{name} deleted', { name: group.name }), {
      description: lockedCount ? tr('Locked blocks kept: {n}.', { n: lockedCount }) : undefined,
      action: { label: tr('Undo'), onClick: () => actions.undo() }
    });
  };

  return (
    <div className={cn('rounded-md border', hasSelection ? 'border-select/40' : 'border-line')}>
      <div className="group flex items-center gap-0.5 py-0.5 pr-1">
        {!selecting &&
        <button
          type="button"
          aria-label={tr('Drag {name}', { name: group.name })}
          disabled={allLocked}
          onPointerDown={startDrag}
          className={cn(btn, 'cursor-grab touch-none active:cursor-grabbing', !touch && 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100')}>
          
            <GripVerticalIcon size={14} aria-hidden />
          </button>
        }
        <button
          type="button"
          aria-expanded={!collapsed}
          aria-label={collapsed ? tr('Expand {name}', { name: group.name }) : tr('Collapse {name}', { name: group.name })}
          onClick={onToggleCollapsed}
          className={btn}>
          
          <ChevronRightIcon size={14} className={cn('transition-transform duration-150 ease-out', !collapsed && 'rotate-90')} aria-hidden />
        </button>
        {renaming ?
        <input
          ref={inputRef}
          aria-label={tr('Group name')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={commitName}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitName();
            if (e.key === 'Escape') {
              setName(group.name);
              setRenaming(false);
            }
          }}
          className="h-7 min-w-0 flex-1 rounded-sm border border-action bg-field px-2 text-label font-semibold text-fg focus:outline-none focus:ring-2 focus:ring-action/25" /> :


        <button
          type="button"
          onDoubleClick={() => setRenaming(true)}
          onKeyDown={(e) => {
            if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
              e.preventDefault();
              actions.moveGroup(group.id, e.key === 'ArrowUp' ? -1 : 1);
            } else if (e.key === 'F2') {
              setRenaming(true);
            }
          }}
          onClick={onToggleCollapsed}
          title={tr('Double-click to rename')}
          className={cn(
            'flex min-w-0 flex-1 items-center gap-2 rounded-sm py-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
            allHidden && 'opacity-55'
          )}>
          
            <GroupIcon size={14} className="shrink-0 text-fg-muted" aria-hidden />
            <span className="truncate text-label font-semibold text-fg">{group.name}</span>
            <span className="shrink-0 text-caption text-fg-subtle">{blocks.length}</span>
          </button>
        }
        {touch && !selecting &&
        <>
            <button type="button" aria-label={tr('Move {name} up', { name: group.name })} disabled={isFirst || allLocked} onClick={() => actions.moveGroup(group.id, -1)} className={btn}>
              <ArrowUpIcon size={16} aria-hidden />
            </button>
            <button type="button" aria-label={tr('Move {name} down', { name: group.name })} disabled={isLast || allLocked} onClick={() => actions.moveGroup(group.id, 1)} className={btn}>
              <ArrowDownIcon size={16} aria-hidden />
            </button>
          </>
        }
        <button
          type="button"
          aria-label={allLocked ? tr('Unlock {name}', { name: group.name }) : tr('Lock {name}', { name: group.name })}
          aria-pressed={allLocked}
          title={allLocked ? tr('Unlock group') : tr('Lock group')}
          onClick={() => actions.setGroupLocked(group.id, !allLocked)}
          className={cn(btn, allLocked ? 'text-action' : !touch && 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100')}>
          
          {allLocked ? <LockIcon size={14} aria-hidden /> : <LockOpenIcon size={14} aria-hidden />}
        </button>
        <button
          type="button"
          aria-label={allHidden ? tr('Show {name}', { name: group.name }) : tr('Hide {name}', { name: group.name })}
          title={allHidden ? tr('Show group on live page') : tr('Hide group from live page')}
          onClick={() => actions.setGroupHidden(group.id, !allHidden)}
          className={cn(btn, !touch && !allHidden && 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100')}>
          
          {allHidden ? <EyeOffIcon size={14} aria-hidden /> : <EyeIcon size={14} aria-hidden />}
        </button>
        <Menu
          items={[
          { id: 'rename', label: tr('Rename'), icon: PencilIcon, onSelect: () => setRenaming(true) },
          { id: 'duplicate', label: tr('Duplicate group'), icon: CopyIcon, onSelect: () => actions.duplicateGroup(group.id) },
          { id: 'save', label: tr('Save as reusable section'), icon: BookmarkPlusIcon, onSelect: onSaveSection },
          { id: 'ungroup', label: tr('Ungroup'), icon: UngroupIcon, onSelect: () => actions.ungroup(group.id) },
          {
            id: 'delete',
            label: tr('Delete group'),
            icon: Trash2Icon,
            destructive: true,
            disabled: allLocked,
            reason: allLocked ? tr('Unlock the group to delete it.') : undefined,
            onSelect: deleteGroup
          }]
          }
          trigger={(props) =>
          <button type="button" {...props} aria-label={tr('More actions for {name}', { name: group.name })} className={btn}>
              <MoreHorizontalIcon size={14} aria-hidden />
            </button>
          } />
        
      </div>
      {!collapsed &&
      <Reorder.Group
        axis="y"
        values={blocks.map((b) => b.id)}
        onReorder={(ids) => actions.reorderWithinGroup(group.id, ids)}
        as="ol"
        className="flex flex-col gap-0.5 border-t border-line py-1 pl-4 pr-0.5">
        
          {blocks.map((block, i) =>
        <MemberItem key={block.id} block={block} touch={touch} selecting={selecting}>
              {renderRow(block, i)}
            </MemberItem>
        )}
        </Reorder.Group>
      }
    </div>);

}

function MemberItem({ block, touch, selecting, children }: {block: Block;touch: boolean;selecting: boolean;children: React.ReactNode;}) {
  const { bn } = useBlockNames();
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={block.id}
      dragListener={false}
      dragControls={controls}
      as="li"
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      whileDrag={{ scale: 1.02, zIndex: 10 }}>
      
      <BlockRowShell
        startDrag={(e) => !block.locked && controls.start(e)}
        touch={touch}
        locked={!!block.locked}
        selecting={selecting}
        label={bn(block)}>
        
        {children}
      </BlockRowShell>
    </Reorder.Item>);

}

interface LayerRowProps {
  block: Block;
  inGroup: boolean;
  isFirst: boolean;
  isLast: boolean;
  selected: boolean;
  issues: ValidationIssue[];
  touch: boolean;
  selecting: boolean;
  checked: boolean;
  onCheck: () => void;
  onSelect: () => void;
  onMove: (direction: -1 | 1) => void;
  onToggleHidden: () => void;
  onToggleLocked: () => void;
}

function LayerRow({
  block,
  inGroup,
  isFirst,
  isLast,
  selected,
  issues,
  touch,
  selecting,
  checked,
  onCheck,
  onSelect,
  onMove,
  onToggleHidden,
  onToggleLocked
}: LayerRowProps) {
  const { tr, bn, ln } = useBlockNames();
  const typeName = bn(block);
  const Icon = blockDefinitions[block.type].icon;
  const hidden = block.visibility.hidden;
  const locked = !!block.locked;
  const hasError = issues.some((i) => i.severity === 'error');
  const btn = rowIconBtn(touch);
  const canCheck = selecting && !inGroup;
  const { actions } = useEditor();
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState(block.name ?? '');
  const commit = () => {
    actions.renameBlock(block.id, draftName);
    setRenaming(false);
  };

  return (
    <div
      className={cn(
        'flex items-center gap-1 rounded-md border pr-1 transition-colors duration-100',
        selected && !selecting ? 'border-select/50 bg-action-soft' : 'border-transparent hover:bg-sunken',
        checked && 'border-select/50 bg-action-soft'
      )}>
      
      {canCheck &&
      <span
        aria-hidden
        className={cn(
          'ml-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border',
          checked ? 'border-action bg-action text-action-fg' : 'border-line-strong'
        )}>
        
          {checked && <CheckIcon size={11} strokeWidth={3} />}
        </span>
      }
      {renaming ?
      <input
        autoFocus
        aria-label={tr('Name for this {name} in Layers', { name: typeName })}
        placeholder={typeName}
        value={draftName}
        maxLength={40}
        onChange={(e) => setDraftName(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') {
            setDraftName(block.name ?? '');
            setRenaming(false);
          }
        }}
        className="my-1 h-8 min-w-0 flex-1 rounded-sm border border-action bg-field px-2 text-label font-medium text-fg focus:outline-none focus:ring-2 focus:ring-action/25" /> :


      <button
        type="button"
        onDoubleClick={() => !selecting && !locked && setRenaming(true)}
        title={tr('Double-click or press F2 to rename')}
        role={canCheck ? 'checkbox' : undefined}
        aria-checked={canCheck ? checked : undefined}
        aria-disabled={selecting && inGroup ? true : undefined}
        onClick={() => {
          if (selecting) {
            if (canCheck) onCheck();
            return;
          }
          onSelect();
        }}
        aria-current={selected && !selecting ? 'true' : undefined}
        aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown Delete"
        data-layer-row
        onKeyDown={(e) => {
          if (!selecting && e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
            e.preventDefault();
            onMove(e.key === 'ArrowUp' ? -1 : 1);
          }
          if (!selecting && !locked && e.key === 'F2') {
            e.preventDefault();
            setDraftName(block.name ?? '');
            setRenaming(true);
          }
        }}
        className={cn(
          'flex min-w-0 flex-1 items-center gap-2.5 rounded-sm py-2 pl-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
          hidden && 'opacity-55',
          selecting && inGroup && 'cursor-not-allowed opacity-50'
        )}>
        
        <Icon size={15} className="shrink-0 text-fg-muted" aria-hidden />
        <span className="min-w-0">
          <span className="block truncate text-label font-medium text-fg">{ln(block)}</span>
          <span className="block truncate text-caption text-fg-subtle">{block.name ? `${typeName} · ${tr(summarizeBlock(block))}` : tr(summarizeBlock(block))}</span>
        </span>
        {issues.length > 0 && (
        hasError ?
        <AlertCircleIcon size={14} className="ml-auto shrink-0 text-danger" aria-label={tr('Needs a fix')} /> :

        <AlertTriangleIcon size={14} className="ml-auto shrink-0 text-warning" aria-label={tr('Worth checking')} />)
        }
      </button>
      }
      {!selecting &&
      <>
          {touch &&
        <>
              <button type="button" aria-label={tr('Move up')} disabled={isFirst || locked} onClick={() => onMove(-1)} className={btn}>
                <ArrowUpIcon size={16} aria-hidden />
              </button>
              <button type="button" aria-label={tr('Move down')} disabled={isLast || locked} onClick={() => onMove(1)} className={btn}>
                <ArrowDownIcon size={16} aria-hidden />
              </button>
            </>
        }
          <button
          type="button"
          aria-label={locked ? tr('Unlock {name}', { name: typeName }) : tr('Lock {name}', { name: typeName })}
          aria-pressed={locked}
          title={locked ? tr('Unlock') : tr('Lock — prevents edits, moves and deletion')}
          onClick={onToggleLocked}
          className={cn(btn, locked ? 'text-action' : !touch && 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100')}>
          
            {locked ? <LockIcon size={14} aria-hidden /> : <LockOpenIcon size={14} aria-hidden />}
          </button>
          <button
          type="button"
          aria-label={hidden ? tr('Show {name}', { name: typeName }) : tr('Hide {name}', { name: typeName })}
          title={hidden ? tr('Show on live page') : tr('Hide from live page')}
          disabled={locked}
          onClick={onToggleHidden}
          className={cn(btn, !touch && !hidden && 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100')}>
          
            {hidden ? <EyeOffIcon size={14} aria-hidden /> : <EyeIcon size={14} aria-hidden />}
          </button>
        </>
      }
    </div>);

}