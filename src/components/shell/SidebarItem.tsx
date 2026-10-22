import React from "react";
import { NavLink } from "react-router-dom";
import { SideTip } from "../../hooks/useSideTip";
import { cn } from "../../utils/cn";
import { BoxIcon } from "lucide-react";
interface SidebarItemProps {
  to: string;
  label: string;
  icon: BoxIcon;
  /** Not built yet — shown quieter with a "Soon" marker. */
  soon?: boolean;
  end?: boolean;
  collapsed?: boolean;
  tip?: SideTip;
  onNavigate?: () => void;
}

/** One navigation row, shared by the workspace and super-admin sidebars. */
export function SidebarItem({
  to,
  label,
  icon: Icon,
  soon,
  end,
  collapsed,
  tip,
  onNavigate
}: SidebarItemProps) {
  const tipLabel = soon ? `${label} · Soon` : label;
  return <NavLink to={to} end={end} onClick={onNavigate} aria-label={collapsed ? tipLabel : undefined} onMouseEnter={collapsed ? tip?.show(tipLabel) : undefined} onMouseLeave={tip?.hide} onFocus={collapsed ? tip?.show(tipLabel) : undefined} onBlur={tip?.hide} className={({
    isActive
  }) => cn('group flex h-10 items-center gap-3 rounded-md text-label transition-colors duration-150', 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus', collapsed ? 'mx-auto w-10 justify-center' : 'px-2.5', isActive ? 'bg-canvas font-semibold text-fg shadow-1 ring-1 ring-line' : cn('font-medium hover:bg-sunken hover:text-fg', soon ? 'text-fg-subtle' : 'text-fg-muted'))}>
      {({
      isActive
    }) => <>
          <Icon size={20} strokeWidth={2.1} className={cn('shrink-0 transition-colors duration-150', isActive ? 'text-action' : soon ? 'text-fg-subtle group-hover:text-fg-muted' : 'text-fg-muted group-hover:text-fg')} aria-hidden />
          {!collapsed && <>
              <span className="min-w-0 flex-1 truncate">{label}</span>
              {soon && <span className="text-meta font-medium text-fg-subtle">Soon</span>}
            </>}
        </>}
    </NavLink>;
}
export function SidebarGroupLabel({
  children,
  collapsed



}: {children: React.ReactNode;collapsed?: boolean;}) {
  if (collapsed) return <span aria-hidden className="mx-auto mb-2 mt-1 block h-px w-6 bg-line-strong" />;
  return <p className="mb-1.5 px-2.5 text-caption font-semibold text-fg-subtle">{children}</p>;
}