import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CheckIcon,
  EyeIcon,
  HistoryIcon,
  Maximize2Icon,
  Minimize2Icon,
  MonitorIcon,
  PanelLeftIcon,
  PanelRightIcon,
  Redo2Icon,
  SearchIcon,
  SmartphoneIcon,
  TabletIcon,
  TabletSmartphoneIcon,
  Undo2Icon } from
'lucide-react';
import type { Viewport } from '../../types/page';
import { useEditor } from '../../contexts/EditorContext';
import { IconButton } from '../ui/IconButton';
import { Button } from '../ui/Button';
import { Segmented } from '../ui/Segmented';
import { Tooltip } from '../ui/Tooltip';
import { Kbd } from '../ui/Kbd';
import { PageStatusBadge } from './PageStatusBadge';
import { SaveIndicator } from './SaveIndicator';
import { KubicuLogo } from '../shell/KubicuLogo';
import { publicUrl } from '../../utils/format';
import { cn } from '../../utils/cn';
import { findPage, pageHref } from '../../utils/sitePages';
import { PageSwitcher } from './PageSwitcher';
import { SpaceSwitcher } from './SpaceSwitcher';
import { ReviewBadge } from './ReviewStatus';
import { PresenceAvatars } from './PresenceAvatars';
import { CoBrandChip } from './CoBrandChip';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useCampaignPreview } from '../../contexts/CampaignPreviewContext';

interface EditorTopBarProps {
  viewport: Viewport;
  onViewportChange: (v: Viewport) => void;
  onOpenVersions: () => void;
  onOpenPublish: () => void;
  onOpenCommand: () => void;
  leftOpen?: boolean;
  rightOpen?: boolean;
  onToggleLeft?: () => void;
  onToggleRight?: () => void;
  onManagePages?: () => void;
}

export function EditorTopBar({ viewport, onViewportChange, onOpenVersions, onOpenPublish, onOpenCommand, leftOpen, rightOpen, onToggleLeft, onToggleRight, onManagePages }: EditorTopBarProps) {
  const { state, actions, canUndo, canRedo, hasUnpublishedChanges } = useEditor();
  const navigate = useNavigate();
  const { draft } = state;
  const activePath = findPage(state.site, state.activePageId)?.path ?? '';
  // Campaigns and DealRooms have one page; only the main space grows into a site.
  const isMain = useWorkspace().currentSpace.kind === 'main';
  const previewSource = useCampaignPreview().source;

  return (
    <header className="grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-line bg-raised px-3">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          to="/app"
          aria-label="Back to workspace"
          className="group flex h-9 items-center gap-1.5 rounded-md px-1.5 text-fg-muted transition-colors duration-150 hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          
          <ArrowLeftIcon size={15} aria-hidden />
          <KubicuLogo withWordmark={false} />
        </Link>
        <span aria-hidden className="h-6 w-px bg-line" />
        <SpaceSwitcher />
        <button
          type="button"
          onClick={() => actions.select(null)}
          className="min-w-0 rounded-md px-1.5 py-1 text-left transition-colors duration-150 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          title="Page settings">
          
          <span className="block truncate text-label font-semibold text-fg">{draft.title || 'Untitled page'}</span>
          <span className="block truncate text-caption text-fg-subtle">
            {publicUrl(draft.handle)}
            {activePath ? `/${activePath}` : ''}
          </span>
        </button>
        {onManagePages && isMain && <PageSwitcher onManage={onManagePages} className="shrink-0" />}
        <PageStatusBadge />
        <ReviewBadge />
        <CoBrandChip />
        <PresenceAvatars />
      </div>

      <div className="flex items-center gap-2">
        {onToggleLeft && onToggleRight &&
        <>
            <div role="group" aria-label="Panels" className="flex items-center rounded-md border border-line p-0.5">
              <Tooltip content={leftOpen ? 'Hide blocks panel' : 'Show blocks panel'} side="bottom">
                <button
                type="button"
                aria-pressed={leftOpen}
                aria-label="Blocks panel"
                onClick={onToggleLeft}
                className={cn('flex h-8 w-8 items-center justify-center rounded-[5px] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus', leftOpen ? 'bg-sunken text-fg' : 'text-fg-subtle hover:text-fg')}>
                
                  <PanelLeftIcon size={17} strokeWidth={2.1} aria-hidden />
                </button>
              </Tooltip>
              <Tooltip content={<span className="inline-flex items-center gap-1">Focus mode <Kbd>⌘</Kbd><Kbd>\</Kbd></span>} side="bottom">
                <button
                type="button"
                aria-pressed={!leftOpen && !rightOpen}
                aria-label="Focus mode — hide both panels"
                onClick={() => {
                  const hide = leftOpen || rightOpen;
                  if (leftOpen === hide) onToggleLeft();
                  if (rightOpen === hide) onToggleRight();
                }}
                className={cn('flex h-8 w-8 items-center justify-center rounded-[5px] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus', !leftOpen && !rightOpen ? 'bg-sunken text-fg' : 'text-fg-subtle hover:text-fg')}>
                
                  {!leftOpen && !rightOpen ? <Minimize2Icon size={16} strokeWidth={2.1} aria-hidden /> : <Maximize2Icon size={16} strokeWidth={2.1} aria-hidden />}
                </button>
              </Tooltip>
              <Tooltip content={rightOpen ? 'Hide inspector' : 'Show inspector'} side="bottom">
                <button
                type="button"
                aria-pressed={rightOpen}
                aria-label="Inspector panel"
                onClick={onToggleRight}
                className={cn('flex h-8 w-8 items-center justify-center rounded-[5px] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus', rightOpen ? 'bg-sunken text-fg' : 'text-fg-subtle hover:text-fg')}>
                
                  <PanelRightIcon size={17} strokeWidth={2.1} aria-hidden />
                </button>
              </Tooltip>
            </div>
            <span aria-hidden className="mx-1 h-6 w-px bg-line" />
          </>
        }
        <Tooltip content={<span className="inline-flex items-center gap-1">Undo <Kbd>⌘</Kbd><Kbd>Z</Kbd></span>} side="bottom">
          <IconButton icon={Undo2Icon} label="Undo" title="" disabled={!canUndo} onClick={actions.undo} />
        </Tooltip>
        <Tooltip content={<span className="inline-flex items-center gap-1">Redo <Kbd>⇧</Kbd><Kbd>⌘</Kbd><Kbd>Z</Kbd></span>} side="bottom">
          <IconButton icon={Redo2Icon} label="Redo" title="" disabled={!canRedo} onClick={actions.redo} />
        </Tooltip>
        <span aria-hidden className="mx-1 h-6 w-px bg-line" />
        <Segmented<Viewport>
          ariaLabel="Preview width"
          value={viewport}
          onChange={onViewportChange}
          options={[
          { value: 'phone', label: 'Phone · 390px', icon: SmartphoneIcon, iconOnly: true },
          { value: 'widePhone', label: 'Wide phone · 430px', icon: TabletSmartphoneIcon, iconOnly: true },
          { value: 'tablet', label: 'Tablet · 768px', icon: TabletIcon, iconOnly: true },
          { value: 'desktop', label: 'Desktop · 1180px', icon: MonitorIcon, iconOnly: true }]
          } />
        
      </div>

      <div className="flex items-center justify-end gap-2">
        <span className="hidden xl:inline-flex">
          <SaveIndicator status={state.saveStatus} lastSavedAt={state.lastSavedAt} onRetry={actions.retrySave} />
        </span>
        <span className="xl:hidden">
          <SaveIndicator compact status={state.saveStatus} lastSavedAt={state.lastSavedAt} onRetry={actions.retrySave} />
        </span>
        <Tooltip content={<span className="inline-flex items-center gap-1">Search & actions <Kbd>⌘</Kbd><Kbd>K</Kbd></span>} side="bottom">
          <IconButton icon={SearchIcon} label="Search blocks and actions" title="" onClick={onOpenCommand} />
        </Tooltip>
        <IconButton icon={HistoryIcon} label="Version history" onClick={onOpenVersions} />
        <Button variant="secondary" leadingIcon={EyeIcon} onClick={() => navigate(`${pageHref(draft.handle, activePath)}?draft=1${previewSource ? `&as=${previewSource}` : ''}`)}>
          Preview
        </Button>
        {hasUnpublishedChanges ?
        <Button onClick={onOpenPublish}>Publish</Button> :

        <Button variant="secondary" leadingIcon={CheckIcon} onClick={onOpenPublish}>
            Published
          </Button>
        }
      </div>
    </header>);

}