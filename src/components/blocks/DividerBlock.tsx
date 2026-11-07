import React from 'react';
import type { BlockProps } from './blockProps';
import { mix } from './pageStyle';

export function DividerBlock({ block, theme }: BlockProps<'divider'>) {
  const line = mix(theme.text, 14);
  if (!block.content.label) {
    return <hr className="my-2 border-0 border-t" style={{ borderColor: line }} />;
  }
  return (
    <div className="my-2 flex items-center gap-3" role="separator" aria-label={block.content.label}>
      <span className="h-px flex-1" style={{ background: line }} />
      <span className="text-[12.5px] font-medium" style={{ color: theme.mutedText }}>
        {block.content.label}
      </span>
      <span className="h-px flex-1" style={{ background: line }} />
    </div>
  );
}
