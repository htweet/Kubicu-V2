import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, MenuIcon, PanelLeftCloseIcon, PanelLeftOpenIcon } from 'lucide-react';
import { adminNav } from '../../data/adminNavigation';
import { ADMIN_ACTOR } from '../../contexts/AppearancePolicyContext';
import { useSidebarCollapsed } from '../../hooks/useSidebarCollapsed';
import { useSideTip, type SideTip } from '../../hooks/useSideTip';
import { KubicuLogo } from '../shell/KubicuLogo';
import { SidebarItem, SidebarGroupLabel } from '../shell/SidebarItem';
import { Sheet } from '../ui/Sheet';
import { IconButton } from '../ui/IconButton';
import { cn } from '../../utils/cn';

function AdminNavList({ collapsed, tip, onNavigate }: {collapsed?: boolean;tip?: SideTip;onNavigate?: () => void;}) {
  return (
    <div className="flex flex-col gap-6">
      {adminNav.map((group) =>
      <div key={group.label}>
          <SidebarGroupLabel collapsed={collapsed}>{group.label}</SidebarGroupLabel>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) =>
          <li key={item.id}>
                <SidebarItem to={`/admin/${item.id}`} label={item.label} icon={item.icon} soon={!item.built} collapsed={collapsed} tip={tip} onNavigate={onNavigate} />
              </li>
          )}
          </ul>
        </div>
      )}
    </div>);

}

const [actorName, actorRole] = ADMIN_ACTOR.split(' · ');
const actorInitials = actorName.
split(/\s+/).
map((p) => p[0]).
join('').
slice(0, 2).
toUpperCase();

function ActorCard({ collapsed }: {collapsed?: boolean;}) {
  return (
    <div className={cn('flex items-center gap-3', collapsed ? 'justify-center' : 'rounded-md border border-line bg-canvas p-2')} title={`${ADMIN_ACTOR} (illustrative staff account)`}>
      <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-inverse text-label font-bold text-fg-inverse">
        {actorInitials}
      </span>
      {collapsed ?
      <span className="sr-only">{ADMIN_ACTOR}</span> :

      <span className="min-w-0 flex-1">
          <span className="block truncate text-label font-semibold text-fg">{actorName}</span>
          <span className="block truncate text-caption text-fg-subtle">{actorRole}</span>
        </span>
      }
    </div>);

}

function AdminTag() {
  return <span className="rounded-full bg-accent-soft px-2 py-0.5 text-meta font-semibold text-accent">Super admin</span>;
}

/** The protected super-admin console — visually related to the workspace, but clearly a separate staff area. */
export function AdminShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { collapsed, toggle } = useSidebarCollapsed();
  const tip = useSideTip();
  const ToggleIcon = collapsed ? PanelLeftOpenIcon : PanelLeftCloseIcon;
  const toggleLabel = collapsed ? 'Expand sidebar' : 'Collapse sidebar';
  const onToggle = () => {
    tip.hide();
    toggle();
  };
  // Staff console is separate from any customer workspace; this opens the customer app preview.
  const back = 'Open customer app';

  return (
    <div className="flex min-h-screen w-full bg-canvas text-fg">
      <aside
        className={cn(
          'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-line bg-raised transition-[width] duration-200 ease-out md:flex',
          collapsed ? 'w-[72px]' : 'w-[264px]'
        )}>
        
        <div className={cn('flex h-16 shrink-0 items-center', collapsed ? 'justify-center' : 'justify-between pl-4 pr-2.5')}>
          <span className="flex items-center gap-2.5">
            <KubicuLogo withWordmark={!collapsed} />
            {!collapsed && <AdminTag />}
          </span>
          {!collapsed &&
          <button
            type="button"
            onClick={onToggle}
            aria-label={toggleLabel}
            aria-expanded
            className="flex h-8 w-8 items-center justify-center rounded-md text-fg-subtle transition-colors duration-150 hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
            
              <ToggleIcon size={18} strokeWidth={2.1} aria-hidden />
            </button>
          }
        </div>

        <nav aria-label="Super admin" className={cn('scroll-quiet min-h-0 flex-1 overflow-y-auto pb-4 pt-1', collapsed ? 'px-0' : 'px-3')}>
          <AdminNavList collapsed={collapsed} tip={tip} />
        </nav>

        <div className={cn('flex shrink-0 flex-col gap-1 border-t border-line py-3', collapsed ? 'items-center px-0' : 'px-3')}>
          <ActorCard collapsed={collapsed} />
          <button
            type="button"
            onClick={() => navigate('/app')}
            aria-label={collapsed ? back : undefined}
            onMouseEnter={collapsed ? tip.show(back) : undefined}
            onMouseLeave={tip.hide}
            className={cn(
              'mt-1 flex h-10 items-center gap-3 rounded-md text-label font-medium text-fg-muted transition-colors duration-150 hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
              collapsed ? 'w-10 justify-center' : 'px-2.5'
            )}>
            
            <ArrowLeftIcon size={20} strokeWidth={2.1} aria-hidden />
            {!collapsed && back}
          </button>
          {collapsed &&
          <button
            type="button"
            onClick={onToggle}
            aria-label={toggleLabel}
            aria-expanded={false}
            onMouseEnter={tip.show(toggleLabel)}
            onMouseLeave={tip.hide}
            className="flex h-10 w-10 items-center justify-center rounded-md text-fg-subtle transition-colors duration-150 hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
            
              <ToggleIcon size={20} strokeWidth={2.1} aria-hidden />
            </button>
          }
        </div>
        {tip.node}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-2 border-b border-line bg-raised px-3 md:hidden">
          <IconButton icon={MenuIcon} label="Open super admin menu" onClick={() => setMenuOpen(true)} />
          <KubicuLogo />
          <span className="ml-auto">
            <AdminTag />
          </span>
        </header>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} title="Super admin">
        <div className="flex flex-col gap-5 p-3">
          <ActorCard />
          <AdminNavList onNavigate={() => setMenuOpen(false)} />
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              navigate('/app');
            }}
            className="flex min-h-[48px] items-center gap-3 rounded-md border-t border-line px-2.5 text-body font-medium text-fg-muted hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
            
            <ArrowLeftIcon size={20} strokeWidth={2.1} aria-hidden />
            {back}
          </button>
        </div>
      </Sheet>
    </div>);

}