import React from 'react';
import { AlignLeftIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { fontsFor } from './pageStyle';
import { cn } from '../../utils/cn';

/**
 * Plain paragraph, or (D157) an editorial passage: paragraphs are split by blank lines; the first paragraph's
 * first line becomes a display heading and, when that paragraph has a second line set off before it, a short kicker.
 */
export function TextBlock({ block, theme, mode }: BlockProps<'text'>) {
  const { body, variant } = block.content;
  if (!body.trim()) {
    return mode === 'edit' ? <BlockPlaceholder icon={AlignLeftIcon} title="Empty paragraph" hint="Write something in the inspector" theme={theme} /> : null;
  }
  const center = block.style.align === 'center';
  if (variant !== 'editorial') {
    return (
      <p className={cn('whitespace-pre-line text-[15px] leading-[1.65]', center && 'text-center')} style={{ color: theme.text }}>
        {body}
      </p>);

  }

  const parts = body.trim().split(/\n\s*\n/).map((p) => p.trim());
  // "Kicker\n\nHeading\nlede…" or "Heading\n\nlede…" or "Heading\nlede…"
  let kicker = '';
  let heading = '';
  let rest = parts;
  if (parts.length >= 2 && parts[0].length <= 48 && !parts[0].includes('\n') && parts[1].split('\n')[0].length <= 90) {
    kicker = parts[0];
    const [h, ...lines] = parts[1].split('\n');
    heading = h;
    rest = [lines.join('\n'), ...parts.slice(2)].filter(Boolean);
  } else {
    const [h, ...lines] = parts[0].split('\n');
    heading = h.length <= 90 ? h : '';
    rest = heading ? [lines.join('\n'), ...parts.slice(1)].filter(Boolean) : parts;
  }
  return (
    <div className={cn('py-2', center && 'text-center')}>
      {kicker && <p className="text-[13px] font-semibold tracking-[0.01em] md:text-[14px]" style={{ color: theme.mutedText }}>{kicker}</p>}
      {heading &&
      <h2 className={cn('break-words text-[clamp(1.75rem,3.6cqw,2.75rem)] font-medium leading-[1.06] tracking-[-0.025em]', kicker && 'mt-4')} style={{ fontFamily: fontsFor(theme).display, color: theme.text }}>
          {heading}
        </h2>
      }
      {rest.map((p, i) =>
      <p key={i} className={cn('whitespace-pre-line leading-[1.7]', heading || i > 0 ? 'mt-5' : '', i === 0 ? 'text-[17px] md:text-[19px]' : 'text-[16px] md:text-[17px]', center && 'mx-auto max-w-[56ch]')} style={{ color: i === 0 ? theme.text : theme.mutedText }}>
          {p}
        </p>
      )}
    </div>);

}