import React, { useState } from 'react';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, LockIcon, LogOutIcon, MenuIcon, PanelLeftCloseIcon, PanelLeftOpenIcon } from 'lucide-react';
import type { StaffMember } from '../../types/admin';
import { setActiveCurrency } from '../../utils/currency';
import { adminNav, adminNavItems } from '../../data/adminNavigation';
import { roleCanOpen, roleInfo } from '../../data/staffRoles';
import { useStaffSession } from '../../hooks/useStaffSession';
import { audit, updateAdminStore } from '../../utils/admin/store';
import { endStaffSession } from '../../utils/admin/staffSession';
import { StaffSignIn } from './StaffSignIn';
import { useSidebarCollapsed } from '../../hooks/useSidebarCollapsed';
import { useSideTip, type SideTip } from '../../hooks/useSideTip';
import { KubicuLogo } from '../shell/KubicuLogo';
import { SidebarItem, SidebarGroupLabel } from '../shell/SidebarItem';
import { Sheet } from '../ui/Sheet';
import { IconButton } from '../ui/IconButton';
import { SkipLink } from '../ui/SkipLink';
import { cn } from '../../utils/cn';
import { StaffNotificationsProvider } from '../../contexts/StaffNotificationsContext';
import { StaffNotificationBell, StaffNotificationsPanel } from './StaffNotifications';

function AdminNavList({ staff, collapsed, tip, onNavigate }: {staff: StaffMember;collapsed?: boolean;tip?: SideTip;onNavigate?: () => void;}) {
  const groups = adminNav.map((g) => ({ ...g, items: g.items.filter((i) => roleCanOpen(staff.role, i.id)) })).filter((g) => g.items.length);
  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) =>
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

function ActorCard({ staff, collapsed }: {staff: StaffMember;collapsed?: boolean;}) {
  const role = roleInfo(staff.role).label;
  const initials = staff.name.
  split(/\s+/).
  map((p) => p[0]).
  join('').
  slice(0, 2).
  toUpperCase();
  return (
    <div className={cn('flex items-center gap-3', collapsed ? 'justify-center' : 'rounded-md border border-line bg-canvas p-2')} title={`${staff.name} · ${role}`}>
      <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-inverse text-label font-bold text-fg-inverse">
        {initials}
      </span>
      {collapsed ?
      <span className="sr-only">
          {staff.name}, {role}
        </span> :

      <span className="min-w-0 flex-1">
          <span className="block truncate text-label font-semibold text-fg">{staff.name}</span>
          <span className="block truncate text-caption text-fg-subtle">{role} · two-step on</span>
        </span>
      }
    </div>);

}

function signOut(staff: StaffMember) {
  updateAdminStore((s) => audit(s, { area: 'staff', action: 'Signed out', target: staff.email, reason: 'Signed out of the staff console.' }));
  endStaffSession();
}

/** Shown when a role opens an area it isn't allowed into (e.g. a bookmarked link). */
function NoAccess({ staff, area }: {staff: StaffMember;area: string;}) {
  const label = adminNavItems.find((i) => i.id === area)?.label ?? 'This area';
  const first = adminNavItems.find((i) => roleCanOpen(staff.role, i.id));
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-start px-5 py-16 md:px-10">
      <span aria-hidden className="flex h-11 w-11 items-center justify-center rounded-full bg-sunken text-fg-muted">
        <LockIcon size={20} />
      </span>
      <h1 className="mt-5 font-display text-title font-semibold text-fg">{label} isn’t part of your role</h1>
      <p className="mt-2 text-body text-fg-muted">
        As {roleInfo(staff.role).label}, you can open {roleInfo(staff.role).description.toLowerCase().replace(/\.$/, '')}. If you need access, ask a Platform lead to change your role — the change is recorded in the audit log.
      </p>
      {first &&
      <Link
        to={`/admin/${first.id}`}
        className="mt-6 inline-flex h-10 items-center rounded-md border border-line-strong bg-raised px-4 text-label font-medium text-fg transition-colors duration-150 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
        
          Go to {first.label}
        </Link>
      }
    </div>);

}

function AdminTag() {
  return <span className="rounded-full bg-accent-soft px-2 py-0.5 text-meta font-semibold text-accent">Super admin</span>;
}

/** The protected super-admin console — visually related to the workspace, but clearly a separate staff area. */
export function AdminShell() {
  const staff = useStaffSession();
  if (!staff) return <StaffSignIn />;
  return (
    <StaffNotificationsProvider staff={staff}>
      <AdminConsole staff={staff} />
      <StaffNotificationsPanel />
    </StaffNotificationsProvider>);

}

function AdminConsole({ staff }: {staff: StaffMember;}) {
  // The staff console reports in naira (D136).
  setActiveCurrency('NGN');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const area = pathname.split('/')[2] ?? '';
  const firstArea = adminNavItems.find((i) => roleCanOpen(staff.role, i.id))?.id ?? 'audit';
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
          <span className="flex items-center gap-0.5">
              <StaffNotificationBell />
              <button
              type="button"
              onClick={onToggle}
              aria-label={toggleLabel}
              aria-expanded
              className="flex h-8 w-8 items-center justify-center rounded-md text-fg-subtle transition-colors duration-150 hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
              
                <ToggleIcon size={18} strokeWidth={2.1} aria-hidden />
              </button>
            </span>
          }
        </div>

        <nav aria-label="Super admin" className={cn('scroll-quiet min-h-0 flex-1 overflow-y-auto pb-4 pt-1', collapsed ? 'px-0' : 'px-3')}>
          <AdminNavList staff={staff} collapsed={collapsed} tip={tip} />
        </nav>

        <div className={cn('flex shrink-0 flex-col gap-1 border-t border-line py-3', collapsed ? 'items-center px-0' : 'px-3')}>
          <ActorCard staff={staff} collapsed={collapsed} />
          <button
            type="button"
            onClick={() => signOut(staff)}
            aria-label={collapsed ? 'Sign out' : undefined}
            onMouseEnter={collapsed ? tip.show('Sign out') : undefined}
            onMouseLeave={tip.hide}
            className={cn(
              'mt-1 flex h-10 items-center gap-3 rounded-md text-label font-medium text-fg-muted transition-colors duration-150 hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
              collapsed ? 'w-10 justify-center' : 'px-2.5'
            )}>
            
            <LogOutIcon size={20} strokeWidth={2.1} aria-hidden />
            {!collapsed && 'Sign out'}
          </button>
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
          {collapsed && <StaffNotificationBell size="md" onMouseEnter={tip.show('Staff notifications')} onMouseLeave={tip.hide} />}
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
          <span className="ml-auto flex items-center gap-2">
            <AdminTag />
            <StaffNotificationBell size="md" />
          </span>
        </header>
        <SkipLink />
        <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
          {area === '' ? <Navigate to={`/admin/${firstArea}`} replace /> : roleCanOpen(staff.role, area) ? <Outlet /> : <NoAccess staff={staff} area={area} />}
        </main>
      </div>

      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} title="Super admin">
        <div className="flex flex-col gap-5 p-3">
          <ActorCard staff={staff} />
          <AdminNavList staff={staff} onNavigate={() => setMenuOpen(false)} />
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
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              signOut(staff);
            }}
            className="flex min-h-[48px] items-center gap-3 rounded-md px-2.5 text-body font-medium text-fg-muted hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
            
            <LogOutIcon size={20} strokeWidth={2.1} aria-hidden />
            Sign out
          </button>
        </div>
      </Sheet>
    </div>);

}