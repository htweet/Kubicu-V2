import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightLeftIcon, GroupIcon, LockIcon, LockOpenIcon, QrCodeIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Menu } from '../ui/Menu';
import { conversionsFor } from '../../utils/blockConvert';
import { NextBlockSuggestions } from './inspector/NextBlockSuggestions';
import { currentLook, looksFor } from '../../utils/blockLooks';
import type { Block } from '../../types/page';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useT } from '../../contexts/LocaleContext';
import { blockDestination, qrHref } from '../../utils/domains/links';
import { blockName } from '../../utils/blocks';
import { blockDefinitions } from '../../data/blockRegistry';
import { useEditor } from '../../contexts/EditorContext';
import { issuesByBlock } from '../../utils/validation';
import { findGroup } from '../../utils/groups';
import { Tabs } from '../ui/Tabs';
import { IconButton } from '../ui/IconButton';
import { Button } from '../ui/Button';
import { ContentFields } from './inspector/ContentFields';
import { StyleFields } from './inspector/StyleFields';
import { BehaviourFields } from './inspector/BehaviourFields';
import { VisibilityFields } from './inspector/VisibilityFields';
import { IssueList } from './inspector/IssueList';
import { BlockSuggest, supportsSuggest } from '../ai/BlockSuggest';
import { cn } from '../../utils/cn';
import { useCoBrand } from '../../hooks/useCoBrand';
import { canEditBlock } from '../../utils/coBrand';
import { CoBrandBlockBar } from './inspector/CoBrandBlockBar';
import { ContainerMembership, containerMembershipApplies } from './inspector/ContainerMembership';

const qrBlockTypes: Block['type'][] = ['event', 'booking', 'subscription'];

type InspectorTab = 'content' | 'style' | 'behaviour' | 'visibility';

export function BlockInspector({ block, showHeader = true }: {block: Block;showHeader?: boolean;}) {
  const { t: tr } = useT();
  const [tab, setTab] = useState<InspectorTab>('content');
  const { state, actions, issues } = useEditor();
  const blockIssues = issuesByBlock(issues)[block.id] ?? [];
  const def = blockDefinitions[block.type];
  const typeName = tr(def.name);
  const Icon = def.icon;
  const coBrand = useCoBrand();
  const partnerLocked = !canEditBlock(coBrand.cb, block, coBrand.actor);
  const locked = !!block.locked || partnerLocked;
  const group = findGroup(state.draft, block.groupId);
  const { currentSpace } = useWorkspace();
  const navigate = useNavigate();
  // Events, bookings and subscription plans can have a QR code that opens straight onto them (D72).
  const qrDest = qrBlockTypes.includes(block.type) ? blockDestination(currentSpace.id, state.site, block.id) : null;
  // Change block type (D171): safe pairs only, each saying what won't carry over.
  const conversions = conversionsFor(block);
  // Ready-made looks of this block (D177), switchable from the Style tab.
  const looks = looksFor(block.type);
  const look = currentLook(block, looks);

  return (
    <div className="flex h-full flex-col">
      {showHeader &&
      <div className="flex items-center gap-3 pb-3 pl-4 pr-20 pt-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-line bg-canvas text-fg-muted">
            <Icon size={15} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-label font-semibold text-fg">{block.name?.trim() || typeName}</h2>
            <p className="truncate text-caption text-fg-subtle">{block.name ? tr('{name} · rename in Layers', { name: typeName }) : tr(def.description)}</p>
          </div>
          {qrDest &&
        <IconButton
          icon={QrCodeIcon}
          label={tr('QR code that opens this {name}', { name: typeName.toLowerCase() })}
          size="sm"
          onClick={() => navigate(qrHref(qrDest, blockName(block)))} />

        }
          {conversions.length > 0 &&
        <Menu
          align="end"
          header={<p className="px-3 pb-1 pt-2 text-caption font-medium text-fg-subtle">{tr('Change to…')}</p>}
          items={conversions.map((c) => ({
            id: c.to,
            label: tr(blockDefinitions[c.to].name),
            icon: blockDefinitions[c.to].icon,
            disabled: locked,
            onSelect: () => {
              actions.convertBlock(block.id, c.to);
              toast(tr('Changed to {name}', { name: tr(blockDefinitions[c.to].name) }), { description: c.loses ? tr(c.loses) : tr('Everything carried over.'), action: { label: tr('Undo'), onClick: () => actions.undo() } });
            }
          }))}
          trigger={(props) => <IconButton {...props} icon={ArrowRightLeftIcon} label={tr('Change block type')} size="sm" disabled={locked} />} />

        }
          <IconButton
          icon={block.locked ? LockIcon : LockOpenIcon}
          label={block.locked ? tr('Unlock block') : tr('Lock block')}
          size="sm"
          active={!!block.locked}
          disabled={partnerLocked}
          onClick={() => actions.toggleLocked(block.id)} />
        
        </div>
      }

      {containerMembershipApplies(state.draft.blocks, block) &&
      <div className="px-4 pb-3">
          <ContainerMembership block={block} disabled={locked} />
        </div>
      }
      {(locked || group || coBrand.cb) &&
      <div className="flex flex-col gap-2 px-4 pb-3">
          {coBrand.cb && <CoBrandBlockBar block={block} />}
          {!!block.locked &&
        <div className="flex items-center gap-3 rounded-md bg-sunken px-3 py-2.5">
              <LockIcon size={15} className="shrink-0 text-fg-muted" aria-hidden />
              <p className="min-w-0 flex-1 text-caption text-fg">
                <span className="font-semibold">{tr('Locked.')}</span> {tr('Unlock to edit, move, hide or delete it.')}
              </p>
              <Button size="sm" variant="secondary" onClick={() => actions.toggleLocked(block.id)}>
                {tr('Unlock')}
              </Button>
            </div>
        }
          {group &&
        <div className="flex items-center gap-2 text-caption text-fg-muted">
              <GroupIcon size={13} className="shrink-0" aria-hidden />
              <span className="min-w-0 flex-1 truncate">
                {tr('In')} <span className="font-medium text-fg">{group.name}</span>
              </span>
              <button
            type="button"
            disabled={locked}
            onClick={() => actions.removeFromGroup(block.id)}
            className="rounded-sm font-medium text-action hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:pointer-events-none disabled:opacity-40">
            
                {tr('Remove from group')}
              </button>
            </div>
        }
        </div>
      }

      <Tabs<InspectorTab>
        idPrefix={`insp-${block.id}`}
        ariaLabel={tr('Block settings')}
        value={tab}
        onChange={setTab}
        fullWidth
        className="px-2"
        items={[
        { id: 'content', label: tr('Content'), badge: blockIssues.length || undefined },
        { id: 'style', label: tr('Style') },
        { id: 'behaviour', label: tr('Behaviour') },
        { id: 'visibility', label: tr('Visibility') }]
        } />
      
      <div
        role="tabpanel"
        id={`insp-${block.id}-panel-${tab}`}
        aria-labelledby={`insp-${block.id}-tab-${tab}`}
        className="scroll-quiet min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 pb-8 pt-4 [overflow-wrap:anywhere]"
        // Focusing a field can nudge the panel sideways even with the scrollbar hidden; keep it pinned left (D216).
        onScroll={(e) => {
          if (e.currentTarget.scrollLeft !== 0) e.currentTarget.scrollLeft = 0;
        }}>
        
        <fieldset disabled={locked} className={cn('m-0 min-w-0 border-0 p-0', locked && 'opacity-60')}>
          <legend className="sr-only">{locked ? tr('{name} settings, locked', { name: typeName }) : tr('{name} settings', { name: typeName })}</legend>
          {tab === 'content' &&
          <div className="flex min-w-0 flex-col gap-4">
              {looks.length > 0 &&
            <p className="flex items-center gap-2 text-caption text-fg-muted">
                  <span className="min-w-0 flex-1 truncate">
                    {tr('Look:')} <span className="font-medium text-fg">{look ? tr(look.name) : tr('Custom settings')}</span>
                  </span>
                  <button
                type="button"
                onClick={() => setTab('style')}
                className="shrink-0 rounded-sm font-medium text-action hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                
                    {tr('Change look')}
                  </button>
                </p>
            }
              <IssueList
              issues={blockIssues}
              actionFor={(issue) => {
                // Settings that live on another tab get a way there, plus a one-tap fix where one is safe (D220).
                if (issue.field !== 'abTest') return null;
                const test = block.visibility.abTest;
                const orphan = issue.id.endsWith(':pair');
                return (
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      {orphan && test && !locked &&
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        actions.endAbTest(test.id, test.arm);
                        toast(tr('Test ended'), { description: tr('Everyone now sees this block.'), action: { label: tr('Undo'), onClick: () => actions.undo() } });
                      }}>
                      
                          {tr('End test and keep this')}
                        </Button>
                    }
                      <button
                      type="button"
                      onClick={() => setTab('visibility')}
                      className="rounded-sm font-semibold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                      
                        {tr('Open Visibility → A/B test')}
                      </button>
                    </span>);

              }} />
            
              <ContentFields block={block} issues={blockIssues} />
              {supportsSuggest(block) && <BlockSuggest block={block} />}
              {!locked && <NextBlockSuggestions block={block} />}
            </div>
          }
          {tab === 'style' && <StyleFields block={block} />}
          {tab === 'behaviour' && <BehaviourFields block={block} />}
          {tab === 'visibility' && <VisibilityFields block={block} />}
        </fieldset>
      </div>
    </div>);

}