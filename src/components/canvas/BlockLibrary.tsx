import React, { useMemo, useState } from 'react';
import { SearchIcon, SearchXIcon } from 'lucide-react';
import type { BlockType } from '../../types/page';
import { blockCategories, blockDefinitions, blockOrder, plannedBlocks } from '../../data/blockRegistry';
import { useEditor } from '../../contexts/EditorContext';
import { blockName } from '../../utils/blocks';
import { PlanLock } from '../ui/PlanLock';
import { EmptyState } from '../ui/EmptyState';
import { fieldControlClass } from '../ui/Field';
import { cn } from '../../utils/cn';
import { SavedSectionsList } from './SavedSectionsList';
import { usePlan } from '../../contexts/PlanContext';
import { planAtLeast, plans } from '../../data/plans';

interface BlockLibraryProps {
  onAdded?: (id: string) => void;
  touch?: boolean;
}

export function BlockLibrary({ onAdded, touch }: BlockLibraryProps) {
  const { state, actions } = useEditor();
  const plan = usePlan();
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const selected = state.draft.blocks.find((b) => b.id === state.selectedId);

  const matches = useMemo(
    () =>
    blockOrder.filter((type) => {
      if (!q) return true;
      const def = blockDefinitions[type];
      return [def.name, def.description, def.category, ...def.keywords].join(' ').toLowerCase().includes(q);
    }),
    [q]
  );
  const plannedMatches = plannedBlocks.filter((p) => !q || `${p.name} ${p.description}`.toLowerCase().includes(q));

  const add = (type: BlockType) => {
    const id = actions.addBlock(type);
    onAdded?.(id);
  };

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 bg-inherit px-4 pb-3 pt-4">
        <label htmlFor="block-search" className="sr-only">
          Search blocks
        </label>
        <div className="relative">
          <SearchIcon size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" aria-hidden />
          <input
            id="block-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search blocks and sections"
            className={cn(fieldControlClass, 'h-9 pl-9 text-label')} />
          
        </div>
        <p className="mt-2 text-caption text-fg-subtle">
          {selected ?
          <>
              Adds below <span className="font-medium text-fg-muted">{blockName(selected)}</span>
            </> :

          'Adds to the end of your page'
          }
        </p>
      </div>

      {matches.length === 0 && plannedMatches.length === 0 ?
      <EmptyState icon={SearchXIcon} title="No blocks found" description={`Nothing matches “${query}”. Try “button”, “photo” or “form”.`} /> :

      <div className="flex flex-col gap-5 px-2 pb-6">
          <SavedSectionsList query={query} touch={touch} onInserted={() => onAdded?.(state.selectedId ?? '')} />
          {blockCategories.map((category) => {
          const items = matches.filter((t) => blockDefinitions[t].category === category);
          if (items.length === 0) return null;
          return (
            <section key={category} aria-labelledby={`cat-${category}`}>
                <h3 id={`cat-${category}`} className="px-2 pb-1.5 text-caption font-semibold text-fg-subtle">
                  {category}
                </h3>
                <ul className="flex flex-col">
                  {items.map((type) => {
                  const def = blockDefinitions[type];
                  const Icon = def.icon;
                  return (
                    <li key={type}>
                        <button
                        type="button"
                        onClick={() => add(type)}
                        className={cn(
                          'group flex w-full items-center gap-3 rounded-md px-2 text-left transition-colors duration-100',
                          'hover:bg-sunken focus-visible:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                          touch ? 'py-3' : 'py-2'
                        )}>
                        
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-line bg-canvas text-fg-muted transition-colors duration-100 group-hover:text-fg">
                            <Icon size={15} aria-hidden />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-label font-medium text-fg">{def.name}</span>
                            <span className="block truncate text-caption text-fg-subtle">{def.description}</span>
                          </span>
                          {def.minPlan && !planAtLeast(plan.id, def.minPlan) &&
                        <span className="shrink-0" title={`Full block on ${plans[def.minPlan].name} plan. On ${plan.name}, a limited version shows.`}>
                              <PlanLock kind="plan">{plans[def.minPlan].name}</PlanLock>
                            </span>
                        }
                        </button>
                      </li>);

                })}
                </ul>
              </section>);

        })}

          {plannedMatches.length > 0 &&
        <section aria-labelledby="cat-later" className="border-t border-line pt-4">
              <h3 id="cat-later" className="px-2 pb-1.5 text-caption font-semibold text-fg-subtle">
                Coming later
              </h3>
              <ul className="flex flex-col">
                {plannedMatches.map((p) => {
              const Icon = p.icon;
              return (
                <li key={p.id} className="flex items-center gap-3 rounded-md px-2 py-2" aria-disabled="true">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-dashed border-line-strong text-fg-subtle">
                        <Icon size={15} aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-label font-medium text-fg-muted">{p.name}</span>
                        <PlanLock kind={p.availability}>{p.note}</PlanLock>
                      </span>
                    </li>);

            })}
              </ul>
            </section>
        }
        </div>
      }
    </div>);

}