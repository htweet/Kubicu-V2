import React from 'react';
import { AtSignIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { PageAction } from './PageAction';
import { mix } from './pageStyle';
import { socialPlatformLabels } from '../../data/socialPlatforms';
import { cn } from '../../utils/cn';

export function SocialBlock({ block, theme, mode }: BlockProps<'social'>) {
  const { items } = block.content;
  if (items.length === 0) {
    return mode === 'edit' ?
    <BlockPlaceholder icon={AtSignIcon} title="No social profiles yet" hint="Add Instagram, TikTok and more" theme={theme} /> :
    null;
  }
  return (
    <ul className={cn('flex flex-wrap gap-2 py-2', block.style.align === 'center' ? 'justify-center' : 'justify-start')}>
      {items.map((item) =>
      <li key={item.id}>
          <PageAction
          mode={mode}
          href={item.url}
          newTab={block.behaviour.openInNewTab}
          className="inline-flex h-10 items-center rounded-full px-4 text-[13.5px] font-medium"
          style={{ border: `1px solid ${mix(theme.text, 18)}`, color: theme.text }}>
          
            {socialPlatformLabels[item.platform]}
          </PageAction>
        </li>
      )}
    </ul>);

}