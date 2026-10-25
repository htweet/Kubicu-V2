import React, { useState } from 'react';
import { PlusIcon, XIcon } from 'lucide-react';
import type { BlockType, PageTheme } from '../../types/page';
import type { ContainerBlock } from '../../utils/containers';
import { MAX_CHILDREN } from '../../utils/containers';
import { blockDefinitions } from '../../data/blockRegistry';
import { useEditor } from '../../contexts/EditorContext';
import { fitsIn } from '../../data/blockCompatibility';
import { mix } from '../blocks/pageStyle';

/** Common blocks to drop into a container without leaving the canvas; everything else is in the block library. */
const quick: BlockType[] = ['heading', 'text', 'image', 'link', 'video', 'featureGrid', 'product', 'leadForm'];

/** The inline "add a block inside" control at the end of a container on the canvas (D167). */
export function ContainerAddSlot({ container, theme, count, onAdded }: {container: ContainerBlock;theme: PageTheme;count: number;onAdded?: (id: string) => void;}) {
  const { actions } = useEditor();
  const [open, setOpen] = useState(false);
  const noun = container.type === 'columns' ? 'column' : container.type === 'tabs' ? 'tab' : 'block';
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  if (container.locked) return null;
  return (
    <div className="mt-3" onClick={stop} onKeyDown={stop}>
      {!open ?
      <button
        type="button"
        onClick={() => {
          actions.select(container.id);
          setOpen(true);
        }}
        className="flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-[10px] text-[13px] font-medium transition-[background-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2"
        style={{ border: `1.5px dashed ${mix(theme.text, 26)}`, color: theme.mutedText, background: 'transparent', ['--tw-ring-color' as string]: theme.text }}>
        
          <PlusIcon size={14} aria-hidden /> Add a {noun} inside <span className="opacity-70">({count} of {MAX_CHILDREN})</span>
        </button> :

      <div className="rounded-[10px] p-3" style={{ border: `1.5px dashed ${mix(theme.text, 26)}`, background: mix(theme.text, 3) }}>
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[12px] font-semibold" style={{ color: theme.text }}>
              Add inside {blockDefinitions[container.type].name}
            </p>
            <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="inline-flex h-7 w-7 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2" style={{ color: theme.mutedText, ['--tw-ring-color' as string]: theme.text }}>
              <XIcon size={14} aria-hidden />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {quick.filter((t) => fitsIn(t, container.type).ok).map((t) => {
            const def = blockDefinitions[t];
            const Icon = def.icon;
            return (
              <button
                key={t}
                type="button"
                onClick={() => {
                  const id = actions.addBlock(t, undefined, container.id);
                  setOpen(false);
                  onAdded?.(id);
                }}
                className="flex min-h-[40px] items-center gap-2 rounded-md px-2.5 text-left text-[12.5px] font-medium transition-[background-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2"
                style={{ background: theme.background, color: theme.text, border: `1px solid ${mix(theme.text, 14)}`, ['--tw-ring-color' as string]: theme.text }}>
                
                  <Icon size={14} aria-hidden className="shrink-0" style={{ color: theme.mutedText }} />
                  <span className="truncate">{def.name}</span>
                </button>);

          })}
          </div>
          <p className="mt-2 text-[11.5px]" style={{ color: theme.mutedText }}>
            For any other block, keep this selected and pick from the block library — it adds inside.
          </p>
        </div>
      }
    </div>);

}