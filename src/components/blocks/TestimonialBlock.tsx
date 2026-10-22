import React from 'react';
import { MediaImage } from '../media/MediaImage';
import { QuoteIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { cardStyle, fontsFor } from './pageStyle';

export function TestimonialBlock({ block, theme, mode }: BlockProps<'testimonial'>) {
  const c = block.content;
  // Never shown to visitors without the owner confirming permission.
  if (!c.quote.trim() || !c.name.trim() || !c.permission) {
    if (mode !== 'edit') return null;
    return (
      <BlockPlaceholder
        icon={QuoteIcon}
        title={c.quote && c.name && !c.permission ? 'Hidden until you confirm permission' : 'Add a real customer quote'}
        hint={c.quote && c.name ? 'Tick “I have permission” in the inspector to show this' : 'Quote, name and where it came from'}
        theme={theme} />);


  }

  return (
    <figure className="p-5" style={cardStyle(theme)}>
      <QuoteIcon size={20} style={{ color: theme.mutedText }} aria-hidden />
      <blockquote className="mt-3 text-[18px] leading-snug" style={{ fontFamily: fontsFor(theme).display, color: theme.text }}>
        “{c.quote.trim()}”
      </blockquote>
      <figcaption className="mt-4 flex items-center gap-3">
        {c.avatarUrl && <MediaImage src={c.avatarUrl} alt={c.avatarAlt} loading="lazy" className="h-10 w-10 rounded-full object-cover" />}
        <span>
          <span className="block text-[14px] font-semibold" style={{ color: theme.text }}>{c.name}</span>
          {(c.role || c.source) &&
          <span className="block text-[12px]" style={{ color: theme.mutedText }}>
              {[c.role, c.source && `via ${c.source}`].filter(Boolean).join(' · ')}
            </span>
          }
        </span>
      </figcaption>
    </figure>);

}