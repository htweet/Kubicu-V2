import React, { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';

export interface SubNavItem {
  to: string;
  label: string;
  end?: boolean;
  badge?: number;
}

/** Module sub-navigation. Swipes sideways on phones and keeps the current tab in view. */
export function SubNav({ label, items }: {label: string;items: SubNavItem[];}) {
  const ref = useRef<HTMLElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const el = ref.current?.querySelector<HTMLElement>('[aria-current="page"]');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
  }, [pathname]);

  return (
    <nav ref={ref} aria-label={label} className="scroll-quiet -mx-5 overflow-x-auto border-b border-line px-5 md:mx-0 md:px-0">
      <ul className="flex gap-1">
        {items.map((n) =>
        <li key={n.to} className="shrink-0">
            <NavLink
            to={n.to}
            end={n.end}
            className={({ isActive }) =>
            cn(
              'relative -mb-px inline-flex h-11 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 text-label font-medium transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus',
              isActive ? 'border-action text-fg' : 'border-transparent text-fg-subtle hover:text-fg'
            )
            }>
            
              {n.label}
              {!!n.badge && <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-action px-1 text-meta font-bold text-action-fg">{n.badge}</span>}
            </NavLink>
          </li>
        )}
      </ul>
    </nav>);

}