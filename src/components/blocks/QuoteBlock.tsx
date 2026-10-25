import React from 'react';
import { QuoteIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { accentOf, headingStyle } from './pageStyle';

/** Pull quote (D169): editorial (large display type) or marked (accent rule at the side). */
export function QuoteBlock({ block, theme, mode }: BlockProps<'quote'>) {
  const c = block.content;
  if (!c.text.trim()) return mode === 'edit' ? <BlockPlaceholder icon={QuoteIcon} title="Add a quote" hint="A line worth setting large" theme={theme} /> : null;
  const accent = accentOf(theme);
  const editorial = c.style === 'editorial';
  return (
    <figure className={editorial ? 'mx-auto max-w-[44rem] text-center' : 'pl-6'} style={editorial ? undefined : { borderLeft: `3px solid ${accent}` }}>
      {editorial &&
      <span aria-hidden className="block text-[64px] leading-[0.6]" style={{ ...headingStyle(theme), color: accent }}>
          “
        </span>
      }
      <blockquote className={editorial ? 'mt-4 text-[clamp(1.4rem,3cqw,2.1rem)] font-medium leading-[1.25] tracking-[-0.015em]' : 'text-[20px] font-medium leading-snug md:text-[22px]'} style={{ ...headingStyle(theme), color: theme.text }}>
        {c.text}
      </blockquote>
      {(c.name || c.role) &&
      <figcaption className="mt-5 text-[14px]" style={{ color: theme.mutedText }}>
          {c.name && <span className="font-semibold" style={{ color: theme.text }}>{c.name}</span>}
          {c.name && c.role && ' · '}
          {c.role}
        </figcaption>
      }
    </figure>);

}