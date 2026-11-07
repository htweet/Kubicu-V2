import React from 'react';
import { ArrowRightIcon, MousePointerClickIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { PageAction } from './PageAction';
import { buttonStyle, cardStyle, headingStyle, mix } from './pageStyle';
import { cn } from '../../utils/cn';
import { useT } from '../../contexts/LocaleContext';

/**
 * Call to action (D169): one main ask, an optional quieter second. Band = full colour panel,
 * Card = theme surface, Split = headline left, buttons right on wide screens.
 */
export function CtaBlock({ block, theme, mode }: BlockProps<'cta'>) {
  const { t: tr } = useT();
  const c = block.content;
  if (!c.title.trim() && !c.primaryLabel.trim()) return mode === 'edit' ? <BlockPlaceholder icon={MousePointerClickIcon} title="Add your call to action" hint="A headline and one clear button" theme={theme} /> : null;
  const band = c.layout === 'band';
  const t = band ? { ...theme, background: theme.text, text: theme.background, mutedText: mix(theme.background, 72, theme.text), accent: theme.background, accentText: theme.text, surface: theme.text } : theme;
  const hasPrimary = c.primaryLabel.trim() && c.primaryUrl.trim();
  const hasSecondary = c.secondaryLabel.trim() && c.secondaryUrl.trim();
  const buttons = (hasPrimary || hasSecondary || mode === 'edit') && (
    <div className={cn('flex flex-wrap gap-3', c.layout !== 'split' && 'justify-center')}>
      {(hasPrimary || mode === 'edit') && (
        <PageAction mode={mode} href={c.primaryUrl || '#'} className="inline-flex h-12 items-center gap-2 px-6 text-[15px] font-semibold" style={buttonStyle(t, 'featured')}>
          {c.primaryLabel || tr('Button')} <ArrowRightIcon size={16} aria-hidden />
        </PageAction>
      )}
      {hasSecondary && (
        <PageAction mode={mode} href={c.secondaryUrl} className="inline-flex h-12 items-center px-5 text-[15px] font-medium" style={{ ...buttonStyle(t, 'default'), background: 'transparent' }}>
          {c.secondaryLabel}
        </PageAction>
      )}
    </div>
  );
  const shell = band ? { background: theme.text, color: theme.background, borderRadius: cardStyle(theme).borderRadius } : cardStyle(theme);
  return (
    <section className={cn('px-6 py-10 md:px-12 md:py-14', c.layout === 'split' ? 'md:flex md:items-center md:justify-between md:gap-10' : 'text-center')} style={shell}>
      <div className={cn('min-w-0', c.layout !== 'split' && 'mx-auto max-w-[36rem]')}>
        {c.title && (
          <h2 className="break-words text-[clamp(1.6rem,3.2cqw,2.5rem)] font-medium leading-[1.08] tracking-[-0.02em]" style={{ ...headingStyle(t), color: t.text }}>
            {c.title}
          </h2>
        )}
        {c.text && <p className="mt-3 text-[16px] leading-relaxed" style={{ color: t.mutedText }}>{c.text}</p>}
      </div>
      {buttons && <div className={cn('mt-7', c.layout === 'split' && 'md:mt-0 md:shrink-0')}>{buttons}</div>}
    </section>
  );
}
