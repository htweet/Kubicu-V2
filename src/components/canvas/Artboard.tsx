import React from 'react';
import { Reorder } from 'framer-motion';
import { CircleUserRoundIcon, Link2Icon, MessageCircleIcon, ShoppingBagIcon, SparklesIcon } from 'lucide-react';
import type { BlockType, Viewport } from '../../types/page';
import { useEditor } from '../../contexts/EditorContext';
import { useRemoveBlock } from '../../hooks/useRemoveBlock';
import { issuesByBlock } from '../../utils/validation';
import { PageSurface } from '../blocks/PageSurface';
import { BlockFrame } from './BlockFrame';
import { MadeWithKubicu } from '../blocks/MadeWithKubicu';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';
import { usePlan } from '../../contexts/PlanContext';
import { showsKubicuBadge } from '../../utils/branding';
import { findGroup } from '../../utils/groups';
import { navItems, pageTitle, showsNav } from '../../utils/sitePages';
import { SiteNav } from '../blocks/SiteNav';
import type { CampaignPhase } from '../../types/page';
import { useCampaignPreview } from '../../contexts/CampaignPreviewContext';
import { blockInPhase, campaignPhase, phaseLabels } from '../../utils/campaign';
import { CampaignPhaseBar } from './CampaignPhaseBar';
import { DealRoomPanel } from '../dealroom/DealRoomPanel';
import { SourcePreviewBar } from './SourcePreviewBar';
import { showsForSource } from '../../utils/intentflow';
import { allBlocks } from '../../utils/sitePages';

export const viewportWidths: Record<Viewport, number> = {
  phone: 390,
  widePhone: 430,
  tablet: 768,
  desktop: 1180
};

interface ArtboardProps {
  viewport?: Viewport;
  framed?: boolean;
  touch?: boolean;
  onEditBlock?: (id: string) => void;
}

const quickStart: {type: BlockType;label: string;icon: typeof Link2Icon;}[] = [
{ type: 'profile', label: 'Profile', icon: CircleUserRoundIcon },
{ type: 'link', label: 'Link button', icon: Link2Icon },
{ type: 'product', label: 'Product', icon: ShoppingBagIcon },
{ type: 'whatsapp', label: 'WhatsApp', icon: MessageCircleIcon }];


export function Artboard({ viewport = 'phone', framed = true, touch = false, onEditBlock }: ArtboardProps) {
  const { state, actions, issues } = useEditor();
  const { draft, selectedId } = state;
  const plan = usePlan();
  const removeBlock = useRemoveBlock();
  const byBlock = issuesByBlock(issues);
  const preview = useCampaignPreview();
  const campaign = state.site.campaign;
  const phase: CampaignPhase | null = campaign ? preview.phase ?? campaignPhase(campaign) : null;
  // Campaigns show only the blocks for the previewed phase; reordering keeps the others in place.
  // IntentFlow preview (D64): show only what visitors from one source would see.
  const source = preview.source;
  const blocks = draft.blocks.filter((b) => (!phase || blockInPhase(b, phase)) && (!source || showsForSource(b.visibility, source)));
  const filtered = !!phase || !!source;
  const allIds = draft.blocks.map((b) => b.id);
  const ids = blocks.map((b) => b.id);
  const hasRules = allBlocks(state.site).some((b) => !!b.visibility.sources);
  const sourceHidden = source ? draft.blocks.filter((b) => (!phase || blockInPhase(b, phase)) && !showsForSource(b.visibility, source)).length : 0;
  const sourceBar =
  hasRules || source ?
  <SourcePreviewBar source={source} onChange={preview.setSource} hiddenCount={sourceHidden} className={framed ? 'mx-auto mb-4 w-full' : 'mx-3 mb-3 mt-3'} /> :
  null;
  const onReorder = (next: string[]) => {
    if (!filtered) return actions.reorderBlocks(next);
    const shown = new Set(ids);
    let k = 0;
    actions.reorderBlocks(allIds.map((id) => shown.has(id) ? next[k++] : id));
  };
  const activeGroupId = draft.blocks.find((b) => b.id === selectedId)?.groupId ?? null;
  const phaseBar =
  campaign && phase ?
  <CampaignPhaseBar campaign={campaign} phase={phase} onChange={preview.setPhase} hiddenCount={draft.blocks.length - blocks.length} className={framed ? 'mx-auto mb-4 w-full' : 'mx-3 mb-3 mt-3'} /> :
  null;

  const page =
  <PageSurface
    theme={draft.theme}
    className={cn(framed ? 'min-h-[720px]' : 'min-h-full')}
    columnClassName={touch ? 'pb-28' : undefined}
    footer={draft.blocks.length > 0 && showsKubicuBadge(draft, plan) ? <MadeWithKubicu theme={draft.theme} mode="edit" /> : undefined}
    header={
    showsNav(state.site) ?
    <SiteNav theme={draft.theme} title={state.site.title} items={navItems(state.site)} activeId={state.activePageId} onSelect={actions.setPage} /> :
    undefined
    }>
    
      {draft.blocks.length === 0 ?
    <div className="mx-auto my-16 flex max-w-xs flex-col items-center text-center" onClick={(e) => e.stopPropagation()}>
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/5" style={{ color: draft.theme.mutedText }}>
            <SparklesIcon size={20} aria-hidden />
          </span>
          <h2 className="mt-4 text-[18px] font-semibold" style={{ color: draft.theme.text }}>
            {state.activePageId ? `Start the ${pageTitle(state.site, state.activePageId)} page` : 'Start your page'}
          </h2>
          <p className="mt-1 text-[14px]" style={{ color: draft.theme.mutedText }}>
            Most pages begin with a profile and one clear action. Pick a block to begin.
          </p>
          <div className="mt-5 grid w-full grid-cols-2 gap-2">
            {quickStart.map((q) =>
        <Button key={q.type} variant="secondary" size="md" leadingIcon={q.icon} onClick={() => actions.addBlock(q.type)}>
                {q.label}
              </Button>
        )}
          </div>
        </div> :

    <Reorder.Group axis="y" values={ids} onReorder={onReorder} as="div" className="flex flex-col">
          {state.site.dealRoom && !state.activePageId &&
      <div className="mb-4" onClick={(e) => e.stopPropagation()}>
              <DealRoomPanel room={state.site.dealRoom} handle={state.site.handle} theme={draft.theme} mode="edit" />
              <p className="mt-1.5 text-center text-[12px]" style={{ color: draft.theme.mutedText }}>
                Room offer · edit it in Page settings
              </p>
            </div>
      }
          {blocks.length === 0 && source && !phase &&
      <p className="mx-auto my-12 max-w-xs text-center text-[14px]" style={{ color: draft.theme.mutedText }}>
              Visitors from this source would see nothing on this page. Remove a rule so every visitor sees at least one block.
            </p>
      }
          {blocks.length === 0 && phase &&
      <p className="mx-auto my-12 max-w-xs text-center text-[14px]" style={{ color: draft.theme.mutedText }}>
              Nothing shows in the {phaseLabels[phase]} phase yet. Select a block and tick “{phaseLabels[phase]}” under Visibility, or add a new one.
            </p>
      }
          {blocks.map((block, i) =>
      <BlockFrame
        key={block.id}
        block={block}
        theme={draft.theme}
        groupName={findGroup(draft, block.groupId)?.name}
        groupActive={!!block.groupId && block.groupId === activeGroupId}
        groupEdge={{
          first: blocks[i - 1]?.groupId !== block.groupId,
          last: blocks[i + 1]?.groupId !== block.groupId
        }}
        onToggleLocked={actions.toggleLocked}
        selected={block.id === selectedId}
        issues={byBlock[block.id] ?? []}
        isFirst={i === 0}
        isLast={i === blocks.length - 1}
        touch={touch}
        onSelect={(id) => {
          actions.select(id);
          if (touch && onEditBlock) onEditBlock(id);
        }}
        onMove={actions.moveBlock}
        onDuplicate={actions.duplicateBlock}
        onToggleHidden={actions.toggleHidden}
        onDelete={removeBlock}
        onEdit={onEditBlock} />

      )}
        </Reorder.Group>
    }
    </PageSurface>;


  if (!framed) {
    return (
      <div className="min-h-full" onClick={() => actions.select(null)}>
        {phaseBar}
        {sourceBar}
        {page}
      </div>);

  }

  const width = viewportWidths[viewport];
  const isPhone = viewport === 'phone' || viewport === 'widePhone';

  return (
    <div className="scroll-quiet h-full overflow-auto bg-stage" onClick={() => actions.select(null)}>
      <div className="flex min-h-full flex-col items-center px-8 py-10">
        {phaseBar && <div style={{ maxWidth: Math.max(width, 560) }} className="w-full">{phaseBar}</div>}
        {sourceBar && <div style={{ maxWidth: Math.max(width, 560) }} className="w-full">{sourceBar}</div>}
        <div
          className={cn(
            'relative h-fit w-full overflow-hidden border border-line-strong shadow-3 transition-[max-width] duration-300 ease-out',
            isPhone ? 'rounded-[32px]' : viewport === 'tablet' ? 'rounded-[20px]' : 'rounded-[12px]'
          )}
          style={{ maxWidth: width }}
          aria-label={`Page preview at ${width}px wide`}>
          
          {page}
        </div>
      </div>
    </div>);

}