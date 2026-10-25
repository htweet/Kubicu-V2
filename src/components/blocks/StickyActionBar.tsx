import React from 'react';
import type { PageTheme } from '../../types/page';
import { useCart } from '../../contexts/CartContext';
import { buttonRadius } from './pageStyle';

interface StickyActionBarProps {
  theme: PageTheme;
  label: string;
  /** Scroll to a block on the page… */
  blockId: string | null;
  /** …or open a link. */
  url: string;
}

/**
 * One primary action pinned to the bottom of phone screens (D153).
 * Steps aside while the cart has items (the cart button takes its place) or the checkout is open.
 */
export function StickyActionBar({ theme, label, blockId, url }: StickyActionBarProps) {
  const cart = useCart();
  if (cart && (cart.open || cart.count > 0)) return null;
  const target = blockId ? `#b-${blockId}` : url;
  if (!target) return null;
  const go = (e: React.MouseEvent) => {
    if (!blockId) return;
    e.preventDefault();
    const el = document.getElementById(`b-${blockId}`);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el?.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    // Move focus to the section for keyboard and screen-reader users.
    window.setTimeout(() => (el?.querySelector<HTMLElement>('a,button,input,select,textarea') ?? el)?.focus({ preventScroll: true }), reduce ? 0 : 400);
  };
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 md:hidden" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
      <a
        href={target}
        onClick={go}
        target={blockId ? undefined : '_blank'}
        rel={blockId ? undefined : 'noopener noreferrer'}
        className="flex h-12 w-full items-center justify-center px-5 text-[15px] font-semibold shadow-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{ background: theme.accent, color: theme.accentText, borderRadius: Math.min(buttonRadius(theme), 999) }}>
        
        <span className="truncate">{label}</span>
      </a>
    </div>);

}