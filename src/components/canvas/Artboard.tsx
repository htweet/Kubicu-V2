import React from 'react';
import { Reorder } from 'framer-motion';
import { CircleUserRoundIcon, Link2Icon, MessageCircleIcon, ShoppingBagIcon, SparklesIcon } from 'lucide-react';
import type { BlockType, Viewport } from '../../types/page';
import { useEditor } from '../../contexts/EditorContext';
import { useRemoveBlock } from '../../hooks/useRemoveBlock';
import { useCoBrandGuard } from '../../hooks/useCoBrandGuard';
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
import { CoBrandStrip } from '../blocks/CoBrandStrip';
import type { CampaignPhase } from '../../types/page';
import { useCampaignPreview } from '../../contexts/CampaignPreviewContext';
import { blockInPhase } from '../../utils/campaign';
import { docPhase, phaseCopy, phasedSummary } from '../../utils/eventSpace';
import { useOptionalCommerce } from '../../contexts/CommerceContext';
import { CampaignPhaseBar } from './CampaignPhaseBar';
import { DealRoomPanel } from '../dealroom/DealRoomPanel';
import { FundraiserPanel } from '../fundraiser/FundraiserPanel';
import { PopupPanel } from '../popup/PopupPanel';
import { BookingPagePanel } from '../bookingpage/BookingPagePanel';
import { MembersAreaPreviewBar, MembersAreaWelcomePreview, type MemberView } from './MembersAreaPreview';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { SourcePreviewBar } from './SourcePreviewBar';
import { showsForSource } from '../../utils/intentflow';
import { allBlocks, pageView } from '../../utils/sitePages';
import { pageContentWidth } from '../../utils/pageLayout';
import { BlockChildrenProvider, type BlockChildrenValue } from '../../contexts/BlockChildrenContext';
import { ChildFrame } from './ChildFrame';
import { ContainerAddSlot } from './ContainerAddSlot';
import { CanvasDropContext, useContainerDrop } from '../../hooks/useContainerDrop';

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
  const guard = useCoBrandGuard();
  const byBlock = issuesByBlock(issues);
  const preview = useCampaignPreview();
  // Phased spaces: campaigns (D52) and Event spaces (D178), whose phases follow the linked event.
  const commerceData = useOptionalCommerce()?.data ?? null;
  const nowPhase = docPhase(state.site, commerceData);
  const currentWorkspaceId = useWorkspace().current.id;
  const phase: CampaignPhase | null = nowPhase ? preview.phase ?? nowPhase : null;
  const copy = phaseCopy(state.site);
  // Campaigns show only the blocks for the previewed phase; reordering keeps the others in place.
  // IntentFlow preview (D64): show only what visitors from one source would see.
  const source = preview.source;
  const shownBlocks = draft.blocks.filter((b) => (!phase || blockInPhase(b, phase)) && (!source || showsForSource(b.visibility, source)));
  // Containers (D167): blocks inside a container are drawn by it, not as page rows.
  const blocks = shownBlocks.filter((b) => !b.parentId);
  const filtered = !!phase || !!source;
  const allIds = draft.blocks.filter((b) => !b.parentId).map((b) => b.id);
  const ids = blocks.map((b) => b.id);
  const hasRules = allBlocks(state.site).some((b) => !!b.visibility.sources);
  const sourceHidden = source ? draft.blocks.filter((b) => (!phase || blockInPhase(b, phase)) && !showsForSource(b.visibility, source)).length : 0;
  const sourceBar =
  hasRules || source ?
  <SourcePreviewBar source={source} onChange={preview.setSource} hiddenCount={sourceHidden} className={framed ? 'mx-auto mb-4 w-full' : 'mx-3 mb-3 mt-3'} /> :
  null;
  // Dragging into containers (D180): hovering a container pauses reordering; dropping moves the block in.
  const drop = useContainerDrop({ blocks: draft.blocks, placeBlock: actions.placeBlock, undo: actions.undo });
  const dropCtx = { onChildDrag: drop.onChildDrag, onChildDragEnd: drop.onChildDragEnd };
  const onReorder = (next: string[]) => {
    if (drop.overContainer()) return;
    if (!guard.canReorder(ids, next)) return;
    if (!filtered) return actions.reorderBlocks(next);
    const shown = new Set(ids);
    let k = 0;
    actions.reorderBlocks(allIds.map((id) => shown.has(id) ? next[k++] : id));
  };
  const activeGroupId = draft.blocks.find((b) => b.id === selectedId)?.groupId ?? null;
  const phaseBar =
  nowPhase && phase ?
  <CampaignPhaseBar
    now={nowPhase}
    summary={phasedSummary(state.site, commerceData)}
    labels={copy.labels}
    descriptions={copy.descriptions}
    phase={phase}
    onChange={preview.setPhase} hiddenCount={draft.blocks.length - shownBlocks.length} className={framed ? 'mx-auto mb-4 w-full' : 'mx-3 mb-3 mt-3'} /> :
  null;

  // Members areas (D185): switch between what members see (editable) and the welcome card.
  const [memberView, setMemberView] = React.useState<MemberView>('member');
  const area = state.site.membersArea && !state.activePageId ? state.site.membersArea : null;
  const asVisitor = !!area && memberView === 'visitor';
  const memberBar = area ? <MembersAreaPreviewBar view={memberView} onChange={setMemberView} className={framed ? 'mx-auto mb-4 w-full' : 'mx-3 mb-3 mt-3'} /> : null;
  // Layout sections (D153): every block lays out its own width; columns keep today's reading width.
  const columnPx = pageContentWidth(state.site);
  // Changed since publishing (D171): compare each block with the live version, ignoring timestamps.
  const livePage = state.published ? pageView(state.published, state.activePageId) : null;
  const sig = (b: (typeof draft.blocks)[number]) => {
    const { updatedAt: _u, createdAt: _c, locked: _l, name: _n, ...rest } = b;
    return JSON.stringify(rest);
  };
  const liveSigs = livePage ? new Map(livePage.blocks.map((b) => [b.id, sig(b)])) : null;
  const isEdited = (b: (typeof draft.blocks)[number]) => !!liveSigs && liveSigs.get(b.id) !== sig(b);
  const selectBlock = (id: string) => {
    actions.select(id);
    if (touch && onEditBlock) onEditBlock(id);
  };
  const childCtx: BlockChildrenValue = {
    childrenOf: (id) => shownBlocks.filter((b) => b.parentId === id),
    selectedId,
    render: (child, theme, slot) =>
    <ChildFrame
      block={child}
      theme={theme}
      container={slot.container}
      index={slot.index}
      count={slot.count}
      selected={child.id === selectedId}
      issues={byBlock[child.id] ?? []}
      touch={touch}
      onSelect={selectBlock}
      onEdit={onEditBlock} />,


    addSlot: (container, theme) =>
    <ContainerAddSlot container={container} theme={theme} count={draft.blocks.filter((b) => b.parentId === container.id).length} onAdded={touch && onEditBlock ? onEditBlock : undefined} />

  };
  const page =
  <PageSurface
    fluid
    theme={draft.theme}
    className={cn(framed ? 'min-h-[720px]' : 'min-h-full')}
    columnClassName={touch ? 'pb-28' : undefined}
    footer={draft.blocks.length > 0 && showsKubicuBadge(draft, plan) ? <MadeWithKubicu theme={draft.theme} mode="edit" /> : undefined}
    header={
    showsNav(state.site) || state.site.coBrand ?
    <>
            {state.site.coBrand && <CoBrandStrip coBrand={state.site.coBrand} theme={draft.theme} />}
            {showsNav(state.site) && <SiteNav theme={draft.theme} title={state.site.title} items={navItems(state.site)} activeId={state.activePageId} onSelect={actions.setPage} />}
          </> :
    undefined
    }>
    
      {asVisitor && area ?
    <div className="mx-auto w-full px-5 py-6" style={{ maxWidth: columnPx }} onClick={(e) => e.stopPropagation()}>
          <MembersAreaWelcomePreview area={area} theme={draft.theme} handle={state.site.handle} />
          <p className="mt-2 text-center text-[12px]" style={{ color: draft.theme.mutedText }}>
            Welcome card · edit it in Page settings → Members area
          </p>
        </div> :
    draft.blocks.length === 0 ?
    <div className="mx-auto my-16 flex max-w-xs flex-col items-center px-5 text-center" onClick={(e) => e.stopPropagation()}>
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

    <BlockChildrenProvider value={childCtx}>
        <CanvasDropContext.Provider value={dropCtx}>
        <Reorder.Group axis="y" values={ids} onReorder={onReorder} as="div" className="flex flex-col">
          {state.site.dealRoom && !state.activePageId &&
          <div className="mx-auto mb-4 w-full px-5" style={{ maxWidth: columnPx }} onClick={(e) => e.stopPropagation()}>
              <DealRoomPanel room={state.site.dealRoom} handle={state.site.handle} theme={draft.theme} mode="edit" />
              <p className="mt-1.5 text-center text-[12px]" style={{ color: draft.theme.mutedText }}>
                Room offer · edit it in Page settings
              </p>
            </div>
          }
          {state.site.popup && !state.activePageId &&
          <div className="mx-auto mb-4 w-full px-5" style={{ maxWidth: columnPx }} onClick={(e) => e.stopPropagation()}>
              <PopupPanel popup={state.site.popup} handle={state.published?.handle ?? state.site.handle} theme={draft.theme} mode="edit" />
              <p className="mt-1.5 text-center text-[12px]" style={{ color: draft.theme.mutedText }}>
                Opening times and place · edit them in Page settings
              </p>
            </div>
          }
          {state.site.bookingPage && !state.activePageId &&
          <div className="mx-auto mb-4 w-full px-5" style={{ maxWidth: columnPx }} onClick={(e) => e.stopPropagation()}>
              <BookingPagePanel settings={state.site.bookingPage} pageName={state.site.title} theme={draft.theme} mode="edit" />
              <p className="mt-1.5 text-center text-[12px]" style={{ color: draft.theme.mutedText }}>
                Services and next free times · choose them in Page settings
              </p>
            </div>
          }
          {state.site.fundraiser && !state.activePageId &&
          <div className="mx-auto mb-4 w-full px-5" style={{ maxWidth: columnPx }} onClick={(e) => e.stopPropagation()}>
              <FundraiserPanel f={state.site.fundraiser} handle={state.published?.handle ?? state.site.handle} theme={draft.theme} mode="edit" workspaceId={currentWorkspaceId} />
              <p className="mt-1.5 text-center text-[12px]" style={{ color: draft.theme.mutedText }}>
                Progress, giving and terms · edit them in Page settings
              </p>
            </div>
          }
          {blocks.length === 0 && source && !phase &&
          <p className="mx-auto my-12 max-w-xs px-5 text-center text-[14px]" style={{ color: draft.theme.mutedText }}>
              Visitors from this source would see nothing on this page. Remove a rule so every visitor sees at least one block.
            </p>
          }
          {blocks.length === 0 && phase &&
          <p className="mx-auto my-12 max-w-xs px-5 text-center text-[14px]" style={{ color: draft.theme.mutedText }}>
              Nothing shows in the {copy.labels[phase]} phase yet. Select a block and tick “{copy.labels[phase]}” under Visibility, or add a new one.
            </p>
          }
          {blocks.map((block, i) =>
          <BlockFrame
            key={block.id}
            block={block}
            theme={draft.theme}
            columnPx={columnPx}
            density={state.site.layout?.density}
            pairedWithPrevious={!!blocks[i - 1]?.layout.pair}
            groupName={findGroup(draft, block.groupId)?.name}
            groupActive={!!block.groupId && block.groupId === activeGroupId}
            groupEdge={{
              first: blocks[i - 1]?.groupId !== block.groupId,
              last: blocks[i + 1]?.groupId !== block.groupId
            }}
            onToggleLocked={actions.toggleLocked}
            edited={isEdited(block)}
            selected={block.id === selectedId}
            issues={byBlock[block.id] ?? []}
            isFirst={i === 0}
            isLast={i === blocks.length - 1}
            touch={touch}
            onSelect={selectBlock}
            onMove={actions.moveBlock}
            onDuplicate={actions.duplicateBlock}
            onToggleHidden={actions.toggleHidden}
            onDelete={removeBlock}
            onEdit={onEditBlock}
            onDragMove={drop.onDrag}
            onDragDone={drop.onDragEnd}
            dropTarget={drop.target?.frameId === block.id ? drop.target : null} />

          )}
        </Reorder.Group>
        </CanvasDropContext.Provider>
        </BlockChildrenProvider>
    }
    </PageSurface>;


  if (!framed) {
    return (
      <div className="min-h-full" onClick={() => actions.select(null)}>
        {memberBar}
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
        {memberBar && <div style={{ maxWidth: Math.max(width, 560) }} className="w-full">{memberBar}</div>}
        {phaseBar && <div style={{ maxWidth: Math.max(width, 560) }} className="w-full">{phaseBar}</div>}
        {sourceBar && <div style={{ maxWidth: Math.max(width, 560) }} className="w-full">{sourceBar}</div>}
        <div
          className={cn(
            // A size container (D158): display type scales to the chosen device width, not the browser window.
            'relative h-fit w-full overflow-hidden border border-line-strong shadow-3 transition-[max-width] duration-300 ease-out [container-type:inline-size]',
            isPhone ? 'rounded-[32px]' : viewport === 'tablet' ? 'rounded-[20px]' : 'rounded-[12px]'
          )}
          style={{ maxWidth: width }}
          aria-label={`Page preview at ${width}px wide`}>
          
          {page}
        </div>
      </div>
    </div>);

}