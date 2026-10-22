import React, { useState } from 'react';
import { GroupIcon, LockIcon, LockOpenIcon } from 'lucide-react';
import type { Block } from '../../types/page';
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
import { cn } from '../../utils/cn';

type InspectorTab = 'content' | 'style' | 'behaviour' | 'visibility';

export function BlockInspector({ block, showHeader = true }: {block: Block;showHeader?: boolean;}) {
  const [tab, setTab] = useState<InspectorTab>('content');
  const { state, actions, issues } = useEditor();
  const blockIssues = issuesByBlock(issues)[block.id] ?? [];
  const def = blockDefinitions[block.type];
  const Icon = def.icon;
  const locked = !!block.locked;
  const group = findGroup(state.draft, block.groupId);

  return (
    <div className="flex h-full flex-col">
      {showHeader &&
      <div className="flex items-center gap-3 pb-3 pl-4 pr-20 pt-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-line bg-canvas text-fg-muted">
            <Icon size={15} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-label font-semibold text-fg">{def.name}</h2>
            <p className="truncate text-caption text-fg-subtle">{def.description}</p>
          </div>
          <IconButton
          icon={locked ? LockIcon : LockOpenIcon}
          label={locked ? 'Unlock block' : 'Lock block'}
          size="sm"
          active={locked}
          onClick={() => actions.toggleLocked(block.id)} />
        
        </div>
      }

      {(locked || group) &&
      <div className="flex flex-col gap-2 px-4 pb-3">
          {locked &&
        <div className="flex items-center gap-3 rounded-md bg-sunken px-3 py-2.5">
              <LockIcon size={15} className="shrink-0 text-fg-muted" aria-hidden />
              <p className="min-w-0 flex-1 text-caption text-fg">
                <span className="font-semibold">Locked.</span> Unlock to edit, move, hide or delete it.
              </p>
              <Button size="sm" variant="secondary" onClick={() => actions.toggleLocked(block.id)}>
                Unlock
              </Button>
            </div>
        }
          {group &&
        <div className="flex items-center gap-2 text-caption text-fg-muted">
              <GroupIcon size={13} className="shrink-0" aria-hidden />
              <span className="min-w-0 flex-1 truncate">
                In <span className="font-medium text-fg">{group.name}</span>
              </span>
              <button
            type="button"
            disabled={locked}
            onClick={() => actions.removeFromGroup(block.id)}
            className="rounded-sm font-medium text-action hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:pointer-events-none disabled:opacity-40">
            
                Remove from group
              </button>
            </div>
        }
        </div>
      }

      <Tabs<InspectorTab>
        idPrefix={`insp-${block.id}`}
        ariaLabel="Block settings"
        value={tab}
        onChange={setTab}
        fullWidth
        className="px-2"
        items={[
        { id: 'content', label: 'Content', badge: blockIssues.length || undefined },
        { id: 'style', label: 'Style' },
        { id: 'behaviour', label: 'Behaviour' },
        { id: 'visibility', label: 'Visibility' }]
        } />
      
      <div
        role="tabpanel"
        id={`insp-${block.id}-panel-${tab}`}
        aria-labelledby={`insp-${block.id}-tab-${tab}`}
        className="scroll-quiet min-h-0 flex-1 overflow-y-auto px-4 pb-8 pt-4">
        
        <fieldset disabled={locked} className={cn('m-0 min-w-0 border-0 p-0', locked && 'opacity-60')}>
          <legend className="sr-only">{locked ? `${def.name} settings, locked` : `${def.name} settings`}</legend>
          {tab === 'content' &&
          <div className="flex flex-col gap-4">
              <IssueList issues={blockIssues} />
              <ContentFields block={block} issues={blockIssues} />
            </div>
          }
          {tab === 'style' && <StyleFields block={block} />}
          {tab === 'behaviour' && <BehaviourFields block={block} />}
          {tab === 'visibility' && <VisibilityFields block={block} />}
        </fieldset>
      </div>
    </div>);

}