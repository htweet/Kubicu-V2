import React from 'react';
import { Link } from 'react-router-dom';
import type { PageTheme } from '../../types/page';
import type { NavItem } from '../../utils/sitePages';
import { fontsFor } from './pageStyle';

interface SiteNavProps {
  theme: PageTheme;
  title: string;
  items: NavItem[];
  activeId: string | null;
  /** Live page: real links. */
  hrefFor?: (item: NavItem) => string;
  /** Canvas: switch the page being edited. */
  onSelect?: (id: string | null) => void;
}

/** The shared menu of a multi-page site. Scrolls sideways on narrow screens rather than wrapping. */
export function SiteNav({ theme, title, items, activeId, hrefFor, onSelect }: SiteNavProps) {
  const pill = (active: boolean): React.CSSProperties => ({
    background: active ? theme.text : 'transparent',
    color: active ? theme.background : theme.mutedText
  });
  const cls = 'inline-flex h-9 shrink-0 items-center whitespace-nowrap rounded-full px-3.5 text-[14px] font-medium transition-opacity duration-150 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1';

  return (
    <header className="w-full border-b" style={{ borderColor: `${theme.text}14` }}>
      <div className="mx-auto flex w-full max-w-[560px] items-center gap-3 px-5 py-2.5">
        <span className="min-w-0 max-w-[40%] shrink truncate text-[15px] font-semibold" style={{ fontFamily: fontsFor(theme).display, color: theme.text }}>
          {title}
        </span>
        <nav aria-label="Site" className="scroll-quiet -mr-5 ml-auto flex min-w-0 items-center gap-1 overflow-x-auto pr-5">
          {items.map((item) => {
            const active = item.id === activeId;
            if (hrefFor)
            return (
              <Link key={item.id ?? 'home'} to={hrefFor(item)} aria-current={active ? 'page' : undefined} className={cls} style={pill(active)}>
                  {item.label}
                </Link>);

            return (
              <button
                key={item.id ?? 'home'}
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect?.(item.id);
                }}
                className={cls}
                style={pill(active)}>
                
                {item.label}
              </button>);

          })}
        </nav>
      </div>
    </header>);

}