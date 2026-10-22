import React from 'react';
import type { BlockProps } from './blockProps';
import { fontsFor } from './pageStyle';
import { cn } from '../../utils/cn';

export function HeadingBlock({ block, theme }: BlockProps<'heading'>) {
  const { text, level } = block.content;
  const Tag = level;
  return (
    <Tag
      className={cn(
        'pt-4 font-medium tracking-[-0.01em]',
        level === 'h2' ? 'text-[23px] leading-tight' : 'text-[18px] leading-snug',
        block.style.align === 'center' ? 'text-center' : 'text-left'
      )}
      style={{ fontFamily: fontsFor(theme).display, color: theme.text, opacity: text ? 1 : 0.4 }}>
      
      {text || 'Empty heading'}
    </Tag>);

}