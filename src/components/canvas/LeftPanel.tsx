import React, { useMemo } from 'react';
import { PageCheckPanel } from './PageCheckPanel';
import { a11yFindings } from '../../utils/pageCheck';
import { PanelLeftCloseIcon } from 'lucide-react';
import { Tabs } from '../ui/Tabs';
import { IconButton } from '../ui/IconButton';
import { BlockLibrary } from './BlockLibrary';
import { LayersList } from './LayersList';
import { TemplatesPanel } from './TemplatesPanel';
import { useEditor } from '../../contexts/EditorContext';
import { PagesPanel } from './PagesPanel';
import { pageCount } from '../../utils/sitePages';

export type LeftTab = 'blocks' | 'layers' | 'pages' | 'templates' | 'check';

interface LeftPanelProps {
  tab: LeftTab;
  onTabChange: (tab: LeftTab) => void;
  onCollapse?: () => void;
}

export function LeftPanel({ tab, onTabChange, onCollapse }: LeftPanelProps) {
  const { state, issues } = useEditor();
  const fixCount = useMemo(() => a11yFindings(state.draft.blocks, issues).filter((f) => f.level === 'fix').length, [state.draft.blocks, issues]);

  return (
    <div className="flex h-full flex-col bg-raised">
      <div className="flex items-center gap-1 pr-2">
        <Tabs<LeftTab>
          idPrefix="left"
          ariaLabel="Editor panels"
          value={tab}
          onChange={onTabChange}
          fullWidth
          className="min-w-0 flex-1 px-2"
          items={[
          { id: 'blocks', label: 'Blocks' },
          { id: 'layers', label: 'Layers' },
          { id: 'pages', label: pageCount(state.site) > 1 ? `Pages ${pageCount(state.site)}` : 'Pages' },
          { id: 'templates', label: 'Templates' },
          { id: 'check', label: fixCount ? `Check ${fixCount}` : 'Check' }]
          } />
        
        {onCollapse && <IconButton icon={PanelLeftCloseIcon} size="sm" label="Collapse panel" onClick={onCollapse} />}
      </div>
      <div
        role="tabpanel"
        id={`left-panel-${tab}`}
        aria-labelledby={`left-tab-${tab}`}
        className="scroll-quiet min-h-0 flex-1 overflow-y-auto bg-raised">
        
        {tab === 'blocks' && <BlockLibrary />}
        {tab === 'layers' && <LayersList />}
        {tab === 'pages' && <PagesPanel />}
        {tab === 'templates' && <TemplatesPanel />}
        {tab === 'check' && <PageCheckPanel />}
      </div>
    </div>);

}