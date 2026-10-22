import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeftIcon, EyeIcon, LayersIcon, PaletteIcon, PlusIcon, Redo2Icon, SettingsIcon, SquarePlusIcon, Undo2Icon, HistoryIcon, BoxIcon } from "lucide-react";
import { useEditor } from "../../contexts/EditorContext";
import { blockDefinitions } from "../../data/blockRegistry";
import { Artboard } from "./Artboard";
import { BlockLibrary } from "./BlockLibrary";
import { LayersList } from "./LayersList";
import { BlockInspector } from "./BlockInspector";
import { ThemePanel } from "./inspector/ThemePanel";
import { PageSettingsPanel } from "./inspector/PageSettingsPanel";
import { PublishDialog } from "./PublishDialog";
import { VersionHistory } from "./VersionHistory";
import { SaveIndicator } from "./SaveIndicator";
import { PageStatusBadge } from "./PageStatusBadge";
import { AiSuggestEntry } from "./AiSuggestEntry";
import { ConflictBanner } from "./ConflictBanner";
import { Sheet } from "../ui/Sheet";
import { IconButton } from "../ui/IconButton";
import { Button } from "../ui/Button";
import { cn } from "../../utils/cn";
import { FilesIcon } from "lucide-react";
import { PagesPanel } from "./PagesPanel";
import { SpaceSwitcher } from "./SpaceSwitcher";
import { ReviewBadge } from "./ReviewStatus";
import { PresenceAvatars } from "./PresenceAvatars";
import { findPage, pageHref, pageTitle } from "../../utils/sitePages";
type MobileSheet = 'blocks' | 'design' | 'layers' | 'pages' | 'settings' | 'block' | 'versions' | null;
const tabs: {
  id: Exclude<MobileSheet, 'block' | 'versions' | null>;
  label: string;
  icon: BoxIcon;
}[] = [{
  id: 'blocks',
  label: 'Blocks',
  icon: SquarePlusIcon
}, {
  id: 'design',
  label: 'Design',
  icon: PaletteIcon
}, {
  id: 'layers',
  label: 'Layers',
  icon: LayersIcon
}, {
  id: 'pages',
  label: 'Pages',
  icon: FilesIcon
}, {
  id: 'settings',
  label: 'Settings',
  icon: SettingsIcon
}];
export function MobileEditor() {
  const {
    state,
    actions,
    canUndo,
    canRedo,
    hasUnpublishedChanges
  } = useEditor();
  const navigate = useNavigate();
  const [sheet, setSheet] = useState<MobileSheet>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const selected = state.draft.blocks.find((b) => b.id === state.selectedId);
  const close = () => setSheet(null);
  return <div className="flex h-[100dvh] flex-col bg-canvas text-fg">
      <header className="flex h-14 shrink-0 items-center gap-1 border-b border-line bg-raised px-1.5">
        <Link to="/app" aria-label="Back to workspace" className="flex h-11 w-11 items-center justify-center rounded-md text-fg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          <ArrowLeftIcon size={19} aria-hidden />
        </Link>
        <SpaceSwitcher compact />
        <div className="min-w-0 flex-1">
          <p className="truncate text-label font-semibold">
            {state.draft.title || 'Untitled page'}
            {state.activePageId && <span className="font-normal text-fg-muted"> · {pageTitle(state.site, state.activePageId)}</span>}
          </p>
          <SaveIndicator compact status={state.saveStatus} lastSavedAt={state.lastSavedAt} onRetry={actions.retrySave} />
        </div>
        <IconButton icon={Undo2Icon} label="Undo" size="lg" disabled={!canUndo} onClick={actions.undo} />
        <IconButton icon={Redo2Icon} label="Redo" size="lg" disabled={!canRedo} onClick={actions.redo} />
        <IconButton icon={EyeIcon} label="Preview" size="lg" onClick={() => navigate(`${pageHref(state.draft.handle, findPage(state.site, state.activePageId)?.path ?? '')}?draft=1`)} />
        <Button size="sm" variant={hasUnpublishedChanges ? 'primary' : 'secondary'} className="ml-0.5 h-9" onClick={() => setPublishOpen(true)}>
          {hasUnpublishedChanges ? 'Publish' : 'Live'}
        </Button>
      </header>

      <ConflictBanner />
      <main aria-label="Canvas" className="scroll-quiet relative min-h-0 flex-1 overflow-y-auto">
        <Artboard framed={false} touch onEditBlock={() => setSheet('block')} />
      </main>

      <Button size="lg" leadingIcon={PlusIcon} onClick={() => setSheet('blocks')} className="fixed bottom-[calc(76px+env(safe-area-inset-bottom))] right-4 z-30 rounded-full shadow-3">
        Add block
      </Button>

      <nav aria-label="Editor tools" className="safe-bottom shrink-0 border-t border-line bg-raised">
        <ul className="grid h-16 grid-cols-5">
          {tabs.map((t) => {
          const Icon = t.icon;
          const active = sheet === t.id;
          return <li key={t.id}>
                <button type="button" onClick={() => setSheet(t.id)} aria-pressed={active} className={cn('flex h-full w-full flex-col items-center justify-center gap-1 text-caption font-medium transition-colors duration-150', 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus', active ? 'text-action' : 'text-fg-subtle')}>
                  <Icon size={20} aria-hidden />
                  {t.label}
                </button>
              </li>;
        })}
        </ul>
      </nav>

      <Sheet open={sheet === 'blocks'} onClose={close} title="Add a block" height="full" bodyClassName="bg-overlay">
        <BlockLibrary touch onAdded={close} />
      </Sheet>

      <Sheet open={sheet === 'design'} onClose={close} title="Page theme" height="full">
        <div className="px-5 py-5">
          <ThemePanel />
        </div>
      </Sheet>

      <Sheet open={sheet === 'layers'} onClose={close} title="Layers" description={`${state.draft.blocks.length} blocks`} height="full">
        <LayersList touch onPick={() => setSheet('block')} />
      </Sheet>

      <Sheet open={sheet === 'pages'} onClose={close} title="Pages" description="Tap a page to edit it" height="full">
        <PagesPanel touch />
      </Sheet>

      <Sheet open={sheet === 'settings'} onClose={close} title="Page settings" height="full" headerActions={<IconButton icon={HistoryIcon} label="Version history" onClick={() => setSheet('versions')} />}>
        <div className="flex flex-col gap-6 px-5 py-5">
          <div className="flex items-center justify-between rounded-md border border-line px-3.5 py-3">
            <span className="text-label text-fg-muted">Status</span>
            <PageStatusBadge />
            <ReviewBadge />
            <PresenceAvatars />
          </div>
          <PageSettingsPanel />
          <AiSuggestEntry />
        </div>
      </Sheet>

      <Sheet open={sheet === 'versions'} onClose={close} title="Version history" height="full">
        <VersionHistory />
      </Sheet>

      <Sheet open={sheet === 'block' && !!selected} onClose={close} title={selected ? blockDefinitions[selected.type].name : 'Block'} description="Changes appear on the canvas as you type" height="full" bodyClassName="overflow-hidden" footer={<Button fullWidth variant="secondary" onClick={close}>
            Done
          </Button>}>
        {selected && <BlockInspector key={selected.id} block={selected} showHeader={false} />}
      </Sheet>

      <PublishDialog open={publishOpen} onClose={() => setPublishOpen(false)} onGoToBlock={(id) => {
      actions.select(id);
      setSheet('block');
    }} onOpenTheme={() => setSheet('design')} />
    </div>;
}