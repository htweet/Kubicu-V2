import React from 'react';
import { PanelLeftCloseIcon, PanelLeftOpenIcon } from 'lucide-react';
import { workspaceNav } from '../../data/navigation';
import { useSidebarCollapsed } from '../../hooks/useSidebarCollapsed';
import { useSideTip } from '../../hooks/useSideTip';
import { KubicuLogo } from './KubicuLogo';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { AppearancePicker } from './AppearancePicker';
import { SidebarItem, SidebarGroupLabel } from './SidebarItem';
import { cn } from '../../utils/cn';
import { useTeam } from '../../contexts/TeamContext';
import { roleInfo } from '../../data/permissions';
import { NotificationBell } from '../notifications/NotificationBell';
import { HelpMenu } from './HelpMenu';
import { AccountMenu } from './AccountMenu';

export function Sidebar() {
  const { collapsed, toggle } = useSidebarCollapsed();
  const team = useTeam();
  const reviewsWaiting = team.can('approvals.review').allowed ? team.data.reviews.filter((r) => r.status === 'pending').length : 0;
  const tip = useSideTip();
  const built = workspaceNav.filter((n) => n.group === 'build');
  const planned = workspaceNav.filter((n) => n.group === 'business');
  const ToggleIcon = collapsed ? PanelLeftOpenIcon : PanelLeftCloseIcon;
  const toggleLabel = collapsed ? 'Expand sidebar' : 'Collapse sidebar';

  const onToggle = () => {
    tip.hide();
    toggle();
  };

  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-line bg-raised transition-[width] duration-200 ease-out md:flex',
        collapsed ? 'w-[72px]' : 'w-[248px]'
      )}>
      
      {/* Brand + collapse */}
      <div className={cn('flex h-16 shrink-0 items-center', collapsed ? 'justify-center' : 'justify-between pl-4 pr-2.5')}>
        <KubicuLogo withWordmark={!collapsed} />
        {!collapsed &&
        <div className="flex items-center gap-0.5">
            <NotificationBell />
            <button
            type="button"
            onClick={onToggle}
            aria-label={toggleLabel}
            aria-expanded
            className="flex h-8 w-8 items-center justify-center rounded-md text-fg-subtle transition-colors duration-150 hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
            
              <ToggleIcon size={18} strokeWidth={2.1} aria-hidden />
            </button>
          </div>
        }
      </div>

      {/* Workspace */}
      <div className={cn('shrink-0 pb-4', collapsed ? 'px-0' : 'px-3')}>
        <WorkspaceSwitcher compact={collapsed} tip={tip} />
      </div>

      <nav aria-label="Workspace" className={cn('scroll-quiet flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pb-4', collapsed ? 'px-0' : 'px-3')}>
        <div>
          <SidebarGroupLabel collapsed={collapsed}>Build</SidebarGroupLabel>
          <ul className="flex flex-col gap-0.5">
            {built.map((item) =>
            <li key={item.id}>
                <SidebarItem to={item.to} end={item.to === '/app'} label={item.label} icon={item.icon} collapsed={collapsed} tip={tip} />
              </li>
            )}
          </ul>
        </div>
        <div>
          <SidebarGroupLabel collapsed={collapsed}>Business</SidebarGroupLabel>
          <ul className="flex flex-col gap-0.5">
            {planned.map((item) =>
            <li key={item.id}>
                <SidebarItem to={item.to} label={item.label} icon={item.icon} soon={!!item.batch} collapsed={collapsed} tip={tip} badge={item.id === 'settings' ? reviewsWaiting : undefined} />
              </li>
            )}
          </ul>
        </div>
      </nav>

      <div className={cn('flex shrink-0 flex-col gap-0.5 border-t border-line py-3', collapsed ? 'items-center px-0' : 'px-3')}>
        {team.me.role !== 'owner' &&
        <p
          className={cn('mb-1 rounded-md bg-action-soft text-caption font-medium text-action', collapsed ? 'px-1.5 py-1 text-center' : 'px-2.5 py-1.5')}
          title={`Viewing as ${team.me.name} (${roleInfo[team.role].label}) — change it in the Controls panel`}>
          
            {collapsed ? roleInfo[team.role].label.slice(0, 1) : `Viewing as ${team.me.name.split(' ')[0]} · ${roleInfo[team.role].label}`}
          </p>
        }
        {collapsed && <NotificationBell size="md" onMouseEnter={tip.show('Notifications')} onMouseLeave={tip.hide} onFocus={tip.show('Notifications')} onBlur={tip.hide} />}
        <HelpMenu collapsed={collapsed} tip={tip} />
        <AppearancePicker collapsed={collapsed} tip={tip} />
        <div className={cn('mt-1.5 border-t border-line pt-2', collapsed ? 'flex justify-center px-0' : '-mx-3 px-3')}>
          <AccountMenu collapsed={collapsed} tip={tip} />
        </div>
        {collapsed &&
        <button
          type="button"
          onClick={onToggle}
          aria-label={toggleLabel}
          aria-expanded={false}
          onMouseEnter={tip.show(toggleLabel)}
          onMouseLeave={tip.hide}
          onFocus={tip.show(toggleLabel)}
          onBlur={tip.hide}
          className="flex h-10 w-10 items-center justify-center rounded-md text-fg-subtle transition-colors duration-150 hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          
            <ToggleIcon size={20} strokeWidth={2.1} aria-hidden />
          </button>
        }
      </div>
      {tip.node}
    </aside>);

}