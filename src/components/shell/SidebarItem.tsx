import React from "react";
import { NavLink } from "react-router-dom";
import { SideTip } from "../../hooks/useSideTip";
import { cn } from "../../utils/cn";
import { BoxIcon, ChevronDownIcon } from "lucide-react";
import { useT } from "../../contexts/LocaleContext";
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
  /** Count of things waiting, e.g. reviews to approve. */
  badge?: number;
  /** Switched off by KUBICU for now (D464): still listed, quieter, marked "Not available". */
  unavailable?: boolean;
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
  onNavigate,
  badge,
  unavailable
}: SidebarItemProps) {
  const { t } = useT();
  label = t(label);
  const tipLabel = unavailable ? `${label} · ${t('Not available')}` : soon ? `${label} · ${t('Soon')}` : label;
  soon = soon || unavailable;
  return <NavLink to={to} end={end} onClick={onNavigate} aria-label={collapsed ? tipLabel : undefined} onMouseEnter={collapsed ? tip?.show(tipLabel) : undefined} onMouseLeave={tip?.hide} onFocus={collapsed ? tip?.show(tipLabel) : undefined} onBlur={tip?.hide} className={({
    isActive
  }) => cn('group flex h-10 items-center gap-3 rounded-md text-label transition-colors duration-150', 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus', collapsed ? 'mx-auto w-10 justify-center' : 'px-2.5', isActive ? 'bg-canvas font-semibold text-fg shadow-1 ring-1 ring-line' : cn('font-medium hover:bg-sunken hover:text-fg', soon ? 'text-fg-subtle' : 'text-fg-muted'))}>
      {({
      isActive
    }) => <>
          <span className="relative shrink-0">
            <Icon size={20} strokeWidth={2.1} className={cn('transition-colors duration-150', isActive ? 'text-action' : soon ? 'text-fg-subtle group-hover:text-fg-muted' : 'text-fg-muted group-hover:text-fg')} aria-hidden />
            {collapsed && !!badge && <span aria-hidden className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-warning ring-2 ring-raised" />}
          </span>
          {!collapsed && <>
              <span className="min-w-0 flex-1 truncate">{label}</span>
              {soon && <span className="shrink-0 text-meta font-medium text-fg-subtle">{t(unavailable ? 'Not available' : 'Soon')}</span>}
              {!!badge && <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-warning-soft px-1 text-meta font-semibold text-warning" aria-label={`${badge} waiting`}>{badge}</span>}
            </>}
        </>}
    </NavLink>;
}
/** Clickable section header that opens and closes its items (D117). */
export function SidebarGroupToggle({
  label,
  open,
  onToggle,
  controls,
  badge,
  active








}: {label: string;open: boolean;onToggle: () => void;controls: string;badge?: number; /** The current screen is inside this (closed) section. */active?: boolean;}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={controls}
      className="group mb-0.5 flex h-8 w-full items-center gap-2 rounded-md px-2.5 text-left text-caption font-semibold text-fg-subtle transition-colors duration-150 hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
      
      <span className="min-w-0 flex-1 truncate">{useT().t(label)}</span>
      {!open && active && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-action" />}
      {!open && !!badge &&
      <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-warning-soft px-1 text-meta font-semibold text-warning" aria-label={`${badge} waiting`}>
          {badge}
        </span>
      }
      <ChevronDownIcon size={14} strokeWidth={2.2} aria-hidden className={cn('shrink-0 transition-transform duration-200 ease-out', open ? 'rotate-0' : '-rotate-90')} />
    </button>);

}

export function SidebarGroupLabel({
  children,
  collapsed



}: {children: React.ReactNode;collapsed?: boolean;}) {
  if (collapsed) return <span aria-hidden className="mx-auto mb-2 mt-1 block h-px w-6 bg-line-strong" />;
  return <p className="mb-1.5 px-2.5 text-caption font-semibold text-fg-subtle">{children}</p>;
}