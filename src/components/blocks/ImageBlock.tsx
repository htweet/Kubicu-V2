import React from 'react';
import { ImageIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { cardRadius, imageFrameStyle } from './pageStyle';
import { MediaImage } from '../media/MediaImage';

const aspects = { '1:1': 'aspect-square', '4:5': 'aspect-[4/5]', '16:9': 'aspect-video' };

export function ImageBlock({ block, theme, mode }: BlockProps<'image'>) {
  const { url, caption, aspect, decorative } = block.content;
  const alt = decorative ? '' : block.content.alt;
  if (!url) {
    return mode === 'edit' ?
    <BlockPlaceholder icon={ImageIcon} title="No image chosen" hint="Paste an image link in the inspector" theme={theme} tall /> :
    null;
  }
  return (
    <figure className="flex flex-col gap-2">
      <MediaImage
        src={url}
        alt={alt}
        loading="lazy"
        className={`w-full object-cover ${aspects[aspect]}`}
        style={{ borderRadius: cardRadius(theme), ...imageFrameStyle(theme) }} />
      
      {caption &&
      <figcaption className="text-[13px] leading-snug" style={{ color: theme.mutedText }}>
          {caption}
        </figcaption>
      }
    </figure>);

}