import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { MAIN_SPACE_ID } from '../../utils/spaces';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { KubicuLogo } from './KubicuLogo';
import { RoleBanner } from './RoleBanner';
import { BillingBanner } from './BillingBanner';
import { NotificationBell } from '../notifications/NotificationBell';

export function AppShell() {
  const { currentSpace, switchSpace } = useWorkspace();
  const { pathname } = useLocation();
  // Workspace screens describe the main space; campaigns and DealRooms open only in the canvas.
  const needsMain = currentSpace.id !== MAIN_SPACE_ID && !pathname.startsWith('/app/canvas');
  useEffect(() => {
    if (needsMain) switchSpace(MAIN_SPACE_ID);
  }, [needsMain, switchSpace]);

  return (
    <div className="flex min-h-screen w-full bg-canvas text-fg">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-line bg-raised px-4 md:hidden">
          <KubicuLogo />
          <NotificationBell size="md" />
        </header>
        <BillingBanner />
        <RoleBanner />
        <main className="flex-1 pb-24 md:pb-0">{needsMain ? null : <Outlet />}</main>
      </div>
      <MobileNav />
    </div>);

}