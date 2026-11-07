import { createContext, useContext } from 'react';
import type React from 'react';
import type { Block, PageTheme } from '../types/page';
import type { ContainerBlock } from '../utils/containers';

/**
 * How a container block (D167) finds and draws the blocks inside it. The live page, previews and the
 * canvas each provide their own: the canvas wraps children in selectable frames and adds an "add" slot.
 * Without a provider (e.g. the picker's mini previews) containers show a skeleton of their shape.
 */
export interface BlockChildrenValue {
  childrenOf: (id: string) => Block[];
  render: (child: Block, theme: PageTheme, slot: { index: number; count: number; container: ContainerBlock }) => React.ReactNode;
  /** Canvas only: the selected block, so Tabs can open the tab holding it. */
  selectedId?: string | null;
  /** Canvas only: the inline "add a block inside" control. */
  addSlot?: (container: ContainerBlock, theme: PageTheme) => React.ReactNode;
}

const BlockChildrenContext = createContext<BlockChildrenValue | null>(null);

export const BlockChildrenProvider = BlockChildrenContext.Provider;

export function useBlockChildren(): BlockChildrenValue | null {
  return useContext(BlockChildrenContext);
}
