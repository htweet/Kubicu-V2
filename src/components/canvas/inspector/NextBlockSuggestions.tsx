import React from 'react';
import { PlusIcon, XIcon } from 'lucide-react';
import type { Block } from '../../../types/page';
import { useEditor } from '../../../contexts/EditorContext';
import { useMarketplace } from '../../../contexts/MarketplaceContext';
import { useBlockShelf } from '../../../hooks/useBlockShelf';
import { blockDefinitions } from '../../../data/blockRegistry';
import { nextFor } from '../../../utils/compositionCheck';
import { childrenOf, parentOf } from '../../../utils/containers';

/**
 * "Goes well after this" (D174): up to three next blocks for the selected one, from a fixed table — no AI.
 * Adds straight below this block (or below its container). Hidden for a block type once dismissed.
 */
export function NextBlockSuggestions({ block }: {block: Block;}) {
  const { state, actions } = useEditor();
  const shelf = useBlockShelf();
  const market = useMarketplace();
  const key = `next:${block.type}`;
  const blocks = state.draft.blocks;
  const present = new Set(blocks.map((b) => b.type));
  const list = (nextFor[block.type] ?? []).filter((t) => !present.has(t) && (!blockDefinitions[t].requiresApp || market.isActive(blockDefinitions[t].requiresApp as string))).slice(0, 3);
  if (list.length === 0 || shelf.dismissed.includes(key)) return null;

  const anchor = parentOf(blocks, block) ?? block;
  const unit = [anchor, ...childrenOf(blocks, anchor.id)];
  const after = blocks.indexOf(unit[unit.length - 1]) + 1;

  return (
    <section aria-label="Goes well after this" className="rounded-md border border-dashed border-line-strong p-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-caption font-semibold text-fg">Goes well after this</h3>
        <button type="button" aria-label="Don’t suggest for this block type" title="Don’t suggest for this block type" onClick={() => shelf.dismiss(key)} className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-fg-subtle hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          <XIcon size={13} aria-hidden />
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {list.map((t) => {
          const d = blockDefinitions[t];
          const Icon = d.icon;
          return (
            <button
              key={t}
              type="button"
              onClick={() => {
                actions.addBlock(t, after);
                shelf.used(t);
              }}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-line px-3 text-caption font-medium text-fg transition-colors duration-150 hover:border-line-strong hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
              
              <Icon size={13} aria-hidden className="text-fg-muted" />
              {d.name}
              <PlusIcon size={12} aria-hidden className="text-fg-subtle" />
            </button>);

        })}
      </div>
      <p className="mt-2 text-[11.5px] text-fg-subtle">Common next steps for a {blockDefinitions[block.type].name.toLowerCase()}. Adds below it.</p>
    </section>);

}