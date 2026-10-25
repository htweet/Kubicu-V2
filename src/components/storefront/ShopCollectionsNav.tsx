import React from 'react';
import type { PageTheme } from '../../types/page';
import type { ShopCollectionsStyle } from '../../types/commerce';
import { mix } from '../blocks/pageStyle';
import { cn } from '../../utils/cn';

export interface NavItem {
  id: string;
  name: string;
  active: boolean;
  count?: number;
}

interface ShopCollectionsNavProps {
  theme: PageTheme;
  style: ShopCollectionsStyle;
  items: NavItem[];
  onPick: (id: string) => void;
  /** Side list renders only from lg up; chips show below it. */
  placement: 'top' | 'side';
}

/** Collections as chips, tabs or a side list (D196). The side list falls back to chips on phones. */
export function ShopCollectionsNav({ theme, style, items, onPick, placement }: ShopCollectionsNavProps) {
  if (items.length <= 1) return null;

  if (placement === 'side') {
    return (
      <nav aria-label="Collections" className="hidden lg:block">
        <ul className="flex flex-col gap-0.5">
          {items.map((c) =>
          <li key={c.id || 'all'}>
              <button
              type="button"
              aria-pressed={c.active}
              onClick={() => onPick(c.id)}
              className="flex h-10 w-full items-center justify-between gap-3 rounded-md px-3 text-left text-[14.5px] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2"
              style={{ background: c.active ? mix(theme.text, 8) : 'transparent', color: theme.text, fontWeight: c.active ? 600 : 400 }}>
              
                <span className="truncate">{c.name}</span>
                {c.count !== undefined &&
              <span className="text-[12.5px] tabular-nums" style={{ color: theme.mutedText }}>
                    {c.count}
                  </span>
              }
              </button>
            </li>
          )}
        </ul>
      </nav>);

  }

  if (style === 'tabs') {
    return (
      <nav aria-label="Collections" className="scroll-quiet -mx-5 overflow-x-auto overflow-y-hidden px-5" style={{ boxShadow: `inset 0 -1px 0 ${mix(theme.text, 12)}` }}>
        <div className="flex gap-6">
          {items.map((c) =>
          <button
            key={c.id || 'all'}
            type="button"
            aria-pressed={c.active}
            onClick={() => onPick(c.id)}
            className="relative h-11 shrink-0 whitespace-nowrap text-[14.5px] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2"
            style={{ color: c.active ? theme.text : theme.mutedText, fontWeight: c.active ? 600 : 500, boxShadow: c.active ? `inset 0 -2px 0 ${theme.text}` : undefined }}>
            
              {c.name}
            </button>
          )}
        </div>
      </nav>);

  }

  return (
    <nav aria-label="Collections" className={cn('scroll-quiet -mx-5 flex gap-2 overflow-x-auto overflow-y-hidden px-5 pb-1', style === 'side' && 'lg:hidden')}>
      {items.map((c) =>
      <button
        key={c.id || 'all'}
        type="button"
        aria-pressed={c.active}
        onClick={() => onPick(c.id)}
        className="inline-flex h-9 shrink-0 items-center whitespace-nowrap rounded-full px-4 text-[14px] font-medium transition-opacity duration-150 hover:opacity-85"
        style={{ background: c.active ? theme.text : mix(theme.text, 6), color: c.active ? theme.background : theme.text }}>
        
          {c.name}
        </button>
      )}
    </nav>);

}