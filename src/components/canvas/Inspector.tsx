import React from 'react';
import { PanelRightCloseIcon, XIcon } from 'lucide-react';
import { useEditor } from '../../contexts/EditorContext';
import { BlockInspector } from './BlockInspector';
import { ThemePanel } from './inspector/ThemePanel';
import { PageSettingsPanel } from './inspector/PageSettingsPanel';
import { AiSuggestEntry } from './AiSuggestEntry';
import { Tabs } from '../ui/Tabs';
import { IconButton } from '../ui/IconButton';

export type PageTab = 'theme' | 'page';

interface InspectorProps {
  pageTab: PageTab;
  onPageTabChange: (tab: PageTab) => void;
  onCollapse?: () => void;
}

export function Inspector({ pageTab, onPageTabChange, onCollapse }: InspectorProps) {
  const { state, actions } = useEditor();
  const block = state.draft.blocks.find((b) => b.id === state.selectedId);

  if (block) {
    return (
      <div className="relative flex h-full flex-col bg-raised">
        <div className="absolute right-3 top-4 z-10 flex items-center gap-0.5">
          {onCollapse && <IconButton icon={PanelRightCloseIcon} label="Collapse panel" size="sm" onClick={onCollapse} />}
          <IconButton icon={XIcon} label="Deselect block" size="sm" onClick={() => actions.select(null)} />
        </div>
        <BlockInspector key={block.id} block={block} />
      </div>);

  }

  return (
    <div className="flex h-full flex-col bg-raised">
      <div className="flex items-start justify-between gap-2 pb-3 pl-4 pr-3 pt-4">
        <div className="min-w-0">
          <h2 className="text-label font-semibold text-fg">Page</h2>
          <p className="text-caption text-fg-subtle">Select a block on the canvas to edit it.</p>
        </div>
        {onCollapse && <IconButton icon={PanelRightCloseIcon} label="Collapse panel" size="sm" onClick={onCollapse} />}
      </div>
      <Tabs<PageTab>
        idPrefix="page"
        ariaLabel="Page settings"
        value={pageTab}
        onChange={onPageTabChange}
        fullWidth
        className="px-2"
        items={[
        { id: 'theme', label: 'Theme' },
        { id: 'page', label: 'Settings' }]
        } />
      
      <div
        role="tabpanel"
        id={`page-panel-${pageTab}`}
        aria-labelledby={`page-tab-${pageTab}`}
        className="scroll-quiet min-h-0 flex-1 overflow-y-auto px-4 pb-8 pt-4">
        
        {pageTab === 'theme' ? <ThemePanel /> : <PageSettingsPanel />}
        <div className="mt-6 border-t border-line pt-5">
          <AiSuggestEntry />
        </div>
      </div>
    </div>);

}