import React from 'react';
import { AlignLeftIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { cn } from '../../utils/cn';

export function TextBlock({ block, theme, mode }: BlockProps<'text'>) {
  const { body } = block.content;
  if (!body.trim()) {
    return mode === 'edit' ?
    <BlockPlaceholder icon={AlignLeftIcon} title="Empty paragraph" hint="Write something in the inspector" theme={theme} /> :
    null;
  }
  return (
    <p
      className={cn('whitespace-pre-line text-[15px] leading-[1.65]', block.style.align === 'center' && 'text-center')}
      style={{ color: theme.text }}>
      
      {body}
    </p>);

}