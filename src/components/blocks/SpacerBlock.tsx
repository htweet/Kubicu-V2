import React from 'react';
import type { BlockProps } from './blockProps';

const heights = { sm: 12, md: 28, lg: 52 };

export function SpacerBlock({ block, mode, theme }: BlockProps<'spacer'>) {
  return (
    <div aria-hidden className="flex items-center justify-center" style={{ height: heights[block.content.size] }}>
      {mode === 'edit' &&
      <span className="text-[11px] font-medium opacity-0 transition-opacity duration-150 group-hover/block:opacity-60" style={{ color: theme.mutedText }}>
          Spacer
        </span>
      }
    </div>);

}