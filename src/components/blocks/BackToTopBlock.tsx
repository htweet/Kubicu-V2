import React from 'react';
import { ArrowUpIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { buttonRadius, mix } from './pageStyle';

/** Back to top (D171): a quiet text button; moves focus to the page's start so keyboard users land there too. */
export function BackToTopBlock({ block, theme, mode }: BlockProps<'backToTop'>) {
  const go = () => {
    if (mode !== 'live') return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    document.getElementById('page-content')?.focus({ preventScroll: true });
  };
  return (
    <div className="flex justify-center">
      <button type="button" onClick={go} className="inline-flex min-h-[44px] items-center gap-1.5 px-4 text-[14px] font-medium transition-[background-color] duration-150 ease-out" style={{ color: theme.mutedText, borderRadius: buttonRadius(theme), background: mix(theme.text, 4) }}>
        <ArrowUpIcon size={15} aria-hidden /> {block.content.label || 'Back to top'}
      </button>
    </div>);

}