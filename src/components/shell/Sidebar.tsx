import React from 'react';
import { PanelLeftCloseIcon, PanelLeftOpenIcon, ShieldCheckIcon } from 'lucide-react';
import { useStaffSession } from '../../hooks/useStaffSession';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { navGroups, workspaceNav } from '../../data/navigation';
import { useSidebarCollapsed } from '../../hooks/useSidebarCollapsed';
import { useNavGroups } from '../../hooks/useNavGroups';
import { useSideTip } from '../../hooks/useSideTip';
import { KubicuLogo } from './KubicuLogo';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { AppearancePicker } from './AppearancePicker';
import { SidebarItem, SidebarGroupLabel, SidebarGroupToggle } from './SidebarItem';
import { cn } from '../../utils/cn';
import { useTeam } from '../../contexts/TeamContext';
import { roleInfo } from '../../data/permissions';
import { NotificationBell } from '../notifications/NotificationBell';
import { HelpMenu } from './HelpMenu';
import { AccountMenu } from './AccountMenu';
import { useMarketplace } from '../../contexts/MarketplaceContext';
import { useT } from '../../contexts/LocaleContext';
import { useWorkspaceNavCounts } from '../../hooks/useWorkspaceNavCounts';
import { uiLanguages } from '../../data/translations';

export function Sidebar() {
  const { collapsed, toggle } = useSidebarCollapsed();
  const team = useTeam();
  const reviewsWaiting = team.can('approvals.review').allowed ? team.data.reviews.filter((r) => r.status === 'pending').length : 0;
  const tip = useSideTip();
  const market = useMarketplace();
  const superAdmin = useStaffSession()?.role === 'lead';
  // Apps that aren't installed stay out of the sidebar (D87).
  const visible = workspaceNav.filter((n) => !n.appId || market.isActive(n.appId));
  const groups = useNavGroups();
  const reduce = useReducedMotion();
  const ToggleIcon = collapsed ? PanelLeftOpenIcon : PanelLeftCloseIcon;
  const { t, lang } = useT();
  // D247: a sidebar badge only ever repeats a number the screen itself shows, so the two never disagree.
  const waitingByNav = useWorkspaceNavCounts();
  const toggleLabel = t(collapsed ? 'Expand sidebar' : 'Collapse sidebar');

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

      <nav aria-label="Workspace" className={cn(collapsed ? 'scroll-quiet flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-4' : 'scroll-quiet flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pb-4', collapsed ? 'px-0' : 'px-3')}>
        {navGroups.map((g) => {
          const items = visible.filter((n) => n.group === g.id);
          if (!items.length) return null;
          const badgeOf = (id: string) => waitingByNav[id] || undefined;
          const list =
          <ul id={`nav-group-${g.id}`} className="flex flex-col gap-0.5">
              {items.map((item) =>
            <li key={item.id} data-tour={`nav-${item.id}`}>
                  <SidebarItem to={item.to} end={item.to === '/app'} label={item.label} icon={item.icon} soon={!!item.batch} collapsed={collapsed} tip={tip} badge={badgeOf(item.id)} />
                </li>
            )}
            </ul>;

          // Collapsed rail: every icon stays reachable, sections separated by a hairline.
          if (collapsed)
          return (
            <div key={g.id}>
                <SidebarGroupLabel collapsed>{g.label}</SidebarGroupLabel>
                {list}
              </div>);

          const isOpen = groups.open.has(g.id);
          const waiting = items.reduce((s, i) => s + (badgeOf(i.id) ?? 0), 0);
          return (
            <div key={g.id} data-tour={!isOpen && items.some((i) => i.id === 'extensions') ? 'nav-extensions' : undefined}>
              <SidebarGroupToggle label={g.label} open={isOpen} onToggle={() => groups.toggle(g.id)} controls={`nav-group-${g.id}`} badge={waiting} active={groups.activeGroup === g.id} />
              <AnimatePresence initial={false}>
                {isOpen &&
                <motion.div
                  key="items"
                  initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  animate={reduce ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                  exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                  className="overflow-hidden">
                  
                    {list}
                  </motion.div>
                }
              </AnimatePresence>
            </div>);

        })}
        {/* Staff console: only for a signed-in Platform lead (D83 roles), never for workspace members. */}
        {superAdmin &&
        <div>
            <SidebarGroupLabel collapsed={collapsed}>{t('KUBICU staff')}</SidebarGroupLabel>
            <ul className="flex flex-col gap-0.5">
              <li>
                <SidebarItem to="/admin" label="Super admin" icon={ShieldCheckIcon} collapsed={collapsed} tip={tip} />
              </li>
            </ul>
          </div>
        }
      </nav>

      <div className={cn('flex shrink-0 flex-col gap-0.5 border-t border-line py-3', collapsed ? 'items-center px-0' : 'px-3')}>
        {team.me.role !== 'owner' &&
        <p
          className={cn('mb-1 rounded-md bg-action-soft text-caption font-medium text-action', collapsed ? 'px-1.5 py-1 text-center' : 'px-2.5 py-1.5')}
          title={`Viewing as ${team.me.name} (${roleInfo[team.role].label}) — change it in the Controls panel`}>
          
            {collapsed ? roleInfo[team.role].label.slice(0, 1) : `Viewing as ${team.me.name.split(' ')[0]} · ${roleInfo[team.role].label}`}
          </p>
        }
        {lang !== 'en' && !collapsed &&
        <p className="mb-1 px-2.5 text-meta text-fg-subtle" title="Drafted translations, waiting for a native speaker to check them. Screens without a draft stay in English.">
            {t('Draft translation')} · {uiLanguages.find((l) => l.value === lang)?.native}
          </p>
        }
        {collapsed && <NotificationBell size="md" onMouseEnter={tip.show(t('Notifications'))} onMouseLeave={tip.hide} onFocus={tip.show(t('Notifications'))} onBlur={tip.hide} />}
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