import React from 'react';
import { ArrowRightIcon, StoreIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { PageAction } from './PageAction';
import { MediaImage } from '../media/MediaImage';
import { VerifiedTick } from './VerifiedTick';
import { buttonStyle, headingStyle } from './pageStyle';
import { cn } from '../../utils/cn';

/** Brand header (D170): a business-first opening — logo at its own proportions, name, tagline, one optional action. */
export function BrandHeaderBlock({ block, theme, mode }: BlockProps<'brandHeader'>) {
  const c = block.content;
  if (!c.name.trim() && !c.logoUrl) return mode === 'edit' ? <BlockPlaceholder icon={StoreIcon} title="Add your logo and business name" hint="Transparent PNG or SVG logos look best" theme={theme} /> : null;
  const center = c.align === 'center';
  return (
    <header className={cn('flex flex-col gap-4 py-4', center ? 'items-center text-center' : 'items-start md:flex-row md:items-center md:justify-between')}>
      <div className={cn('flex items-center gap-4', center && 'flex-col')}>
        {c.logoUrl && <MediaImage src={c.logoUrl} alt={c.logoAlt || c.name} className="h-14 w-auto max-w-[180px] object-contain md:h-16" />}
        <div className="min-w-0">
          {c.name && (
            <h1 className="break-words text-[clamp(1.6rem,3.6cqw,2.4rem)] font-medium leading-[1.08] tracking-[-0.02em]" style={{ ...headingStyle(theme), color: theme.text }}>
              {c.name} <VerifiedTick theme={theme} size={26} />
            </h1>
          )}
          {c.tagline && <p className="mt-1.5 text-[16px] leading-snug" style={{ color: theme.mutedText }}>{c.tagline}</p>}
        </div>
      </div>
      {c.ctaLabel && c.url && (
        <PageAction mode={mode} href={c.url} className="inline-flex h-11 shrink-0 items-center gap-2 px-5 text-[14px] font-semibold" style={buttonStyle(theme, 'featured')}>
          {c.ctaLabel} <ArrowRightIcon size={15} aria-hidden />
        </PageAction>
      )}
    </header>
  );
}
