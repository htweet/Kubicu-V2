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
  const ids = draft.blocks.map((b) => b.id);
  const activeGroupId = draft.blocks.find((b) => b.id === selectedId)?.groupId ?? null;

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

    <Reorder.Group axis="y" values={ids} onReorder={actions.reorderBlocks} as="div" className="flex flex-col">
          {draft.blocks.map((block, i) =>
      <BlockFrame
        key={block.id}
        block={block}
        theme={draft.theme}
        groupName={findGroup(draft, block.groupId)?.name}
        groupActive={!!block.groupId && block.groupId === activeGroupId}
        groupEdge={{
          first: draft.blocks[i - 1]?.groupId !== block.groupId,
          last: draft.blocks[i + 1]?.groupId !== block.groupId
        }}
        onToggleLocked={actions.toggleLocked}
        selected={block.id === selectedId}
        issues={byBlock[block.id] ?? []}
        isFirst={i === 0}
        isLast={i === draft.blocks.length - 1}
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
        {page}
      </div>);

  }

  const width = viewportWidths[viewport];
  const isPhone = viewport === 'phone' || viewport === 'widePhone';

  return (
    <div className="scroll-quiet h-full overflow-auto bg-stage" onClick={() => actions.select(null)}>
      <div className="flex min-h-full justify-center px-8 py-10">
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