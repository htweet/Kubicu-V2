import React, { useEffect, useState } from 'react';
import { FilesIcon, LayersIcon, LayoutTemplateIcon, PaletteIcon, PlusSquareIcon, SlidersHorizontalIcon } from 'lucide-react';
import { pageCount } from '../../utils/sitePages';
import type { Viewport } from '../../types/page';
import { useEditor } from '../../contexts/EditorContext';
import { useT } from '../../contexts/LocaleContext';
import { useCanvasShortcuts } from '../../hooks/useCanvasShortcuts';
import { useCanvasPanels } from '../../hooks/useCanvasPanels';
import { useRemoveBlock } from '../../hooks/useRemoveBlock';
import { blockDefinitions } from '../../data/blockRegistry';
import { EditorTopBar } from './EditorTopBar';
import { LeftPanel, type LeftTab } from './LeftPanel';
import { Artboard } from './Artboard';
import { Inspector, type PageTab } from './Inspector';
import { PanelRail } from './PanelRail';
import { PublishDialog } from './PublishDialog';
import { VersionHistory } from './VersionHistory';
import { CommandPalette } from './CommandPalette';
import { ConflictBanner } from './ConflictBanner';
import { CanvasAnnouncer } from './CanvasAnnouncer';
import { ShortcutsDialog } from './ShortcutsDialog';
import { Sheet } from '../ui/Sheet';
import { SkipLink } from '../ui/SkipLink';
import { cn } from '../../utils/cn';

const RAIL = 56;
const LEFT_W = 280;
const RIGHT_W = 340;
const panelMotion = 'transition-[width] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none';

export function DesktopEditor() {
  const { t: tr } = useT();
  const { state, actions } = useEditor();
  const removeBlock = useRemoveBlock();
  const panels = useCanvasPanels();
  const [viewport, setViewport] = useState<Viewport>('phone');
  const [leftTab, setLeftTab] = useState<LeftTab>('blocks');
  const [pageTab, setPageTab] = useState<PageTab>('theme');
  const [publishOpen, setPublishOpen] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const selected = state.draft.blocks.find((b) => b.id === state.selectedId);
  const selectedDef = selected ? blockDefinitions[selected.type] : null;

  useCanvasShortcuts({
    onUndo: actions.undo,
    onRedo: actions.redo,
    onDelete: () => state.selectedId && removeBlock(state.selectedId),
    onDuplicate: () => state.selectedId && actions.duplicateBlock(state.selectedId),
    onEscape: () => actions.select(null),
    onCommand: () => setCommandOpen(true)
  });

  // ⌘\ / Ctrl+\ hides both panels for a clear view of the page, and brings them back.
  const { toggleFocus } = panels;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        if (document.querySelector('[role="dialog"]')) return;
        e.preventDefault();
        toggleFocus();
      } else if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        if (document.querySelector('[role="dialog"]')) return;
        e.preventDefault();
        setShortcutsOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleFocus]);

  const openLeft = (tab: LeftTab) => {
    setLeftTab(tab);
    panels.setLeft(true);
  };
  const openPage = (tab: PageTab) => {
    actions.select(null);
    setPageTab(tab);
    panels.setRight(true);
  };

  return (
    <div className="flex h-screen flex-col bg-canvas text-fg">
      <SkipLink target="canvas-main" label={tr('Skip to canvas')} />
      <EditorTopBar
        viewport={viewport}
        onViewportChange={setViewport}
        onOpenVersions={() => setVersionsOpen(true)}
        onOpenPublish={() => setPublishOpen(true)}
        onOpenCommand={() => setCommandOpen(true)}
        leftOpen={panels.left}
        rightOpen={panels.right}
        onToggleLeft={panels.toggleLeft}
        onToggleRight={panels.toggleRight}
        onManagePages={() => openLeft('pages')} />
      
      <ConflictBanner />
      <div className="flex min-h-0 flex-1">
        <aside
          aria-label={tr('Blocks and layers')}
          className={cn('shrink-0 overflow-hidden border-r border-line bg-raised', panelMotion)}
          style={{ width: panels.left ? LEFT_W : RAIL }}>
          
          {panels.left ?
          <div className="h-full" style={{ width: LEFT_W }}>
              <LeftPanel tab={leftTab} onTabChange={setLeftTab} onCollapse={() => panels.setLeft(false)} />
            </div> :

          <div className="h-full" style={{ width: RAIL }}>
              <PanelRail
              side="left"
              expandLabel={tr('Expand panel')}
              onExpand={() => panels.setLeft(true)}
              items={[
              { id: 'blocks', label: tr('Add blocks'), icon: PlusSquareIcon, onSelect: () => openLeft('blocks') },
              { id: 'layers', label: tr('Layers'), icon: LayersIcon, badge: state.draft.blocks.length, onSelect: () => openLeft('layers') },
              { id: 'pages', label: tr('Pages'), icon: FilesIcon, badge: pageCount(state.site), onSelect: () => openLeft('pages') },
              { id: 'templates', label: tr('Templates'), icon: LayoutTemplateIcon, onSelect: () => openLeft('templates') }]
              } />
            
            </div>
          }
        </aside>

        <main id="canvas-main" tabIndex={-1} aria-label={tr('Canvas')} className="min-w-0 flex-1 focus:outline-none">
          <Artboard viewport={viewport} />
          <CanvasAnnouncer />
          <ShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
        </main>

        <aside
          aria-label={tr('Inspector')}
          className={cn('shrink-0 overflow-hidden border-l border-line bg-raised', panelMotion)}
          style={{ width: panels.right ? RIGHT_W : RAIL }}>
          
          {panels.right ?
          <div className="h-full" style={{ width: RIGHT_W }}>
              <Inspector pageTab={pageTab} onPageTabChange={setPageTab} onCollapse={() => panels.setRight(false)} />
            </div> :

          <div className="h-full" style={{ width: RAIL }}>
              <PanelRail
              side="right"
              expandLabel={tr('Expand inspector')}
              onExpand={() => panels.setRight(true)}
              items={[
              ...(selected && selectedDef ?
              [{ id: 'block', label: tr('Edit {name}', { name: tr(selectedDef.name) }), icon: selectedDef.icon ?? SlidersHorizontalIcon, active: true, onSelect: () => panels.setRight(true) }] :
              []),
              { id: 'theme', label: tr('Theme'), icon: PaletteIcon, active: !selected && pageTab === 'theme', onSelect: () => openPage('theme') },
              { id: 'page', label: tr('Page settings'), icon: SlidersHorizontalIcon, active: !selected && pageTab === 'page', onSelect: () => openPage('page') }]
              } />
            
            </div>
          }
        </aside>
      </div>

      <PublishDialog
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        onGoToBlock={(id) => {
          actions.select(id);
          panels.setRight(true);
        }}
        onOpenTheme={() => openPage('theme')} />
      
      <Sheet open={versionsOpen} onClose={() => setVersionsOpen(false)} side="right" title={tr('Version history')} description={tr('Publishes and snapshots, newest first')}>
        <VersionHistory />
      </Sheet>
      <CommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        onPublish={() => setPublishOpen(true)}
        onVersions={() => setVersionsOpen(true)}
        onViewport={setViewport} />
      
    </div>);

}