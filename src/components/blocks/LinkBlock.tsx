import React from 'react';
import { ArrowUpRightIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { PageAction } from './PageAction';
import { buttonStyle } from './pageStyle';
import { cn } from '../../utils/cn';

export function LinkBlock({ block, theme, mode }: BlockProps<'link'>) {
  const { label, url, description } = block.content;
  const { emphasis, align } = block.style;
  const subtle = emphasis === 'subtle';

  return (
    <PageAction
      mode={mode}
      href={url}
      newTab={block.behaviour.openInNewTab}
      ariaLabel={block.accessibility.label || undefined}
      className={cn(
        'group flex w-full items-center gap-3 px-5 transition-transform duration-150 ease-out',
        mode === 'live' && 'active:scale-[0.985]',
        subtle ? 'min-h-[44px] justify-center py-2 underline underline-offset-4' : 'min-h-[56px] py-3',
        !subtle && (align === 'center' ? 'justify-center text-center' : 'justify-between text-left')
      )}
      style={buttonStyle(theme, emphasis)}>
      
      <span className={cn('flex min-w-0 flex-col', align === 'center' && 'items-center')}>
        <span className="text-[15px] font-semibold leading-snug" style={{ opacity: label ? 1 : 0.5 }}>
          {label || 'Untitled link'}
        </span>
        {description && !subtle && <span className="mt-0.5 text-[12.5px] leading-snug opacity-75">{description}</span>}
      </span>
      {align === 'left' && !subtle && <ArrowUpRightIcon size={17} className="shrink-0 opacity-70" aria-hidden />}
    </PageAction>);

}