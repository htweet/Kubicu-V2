import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { MAIN_SPACE_ID } from '../../utils/spaces';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { KubicuLogo } from './KubicuLogo';
import { RoleBanner } from './RoleBanner';
import { BillingBanner } from './BillingBanner';
import { PlatformBanner } from './PlatformBanner';
import { NotificationBell } from '../notifications/NotificationBell';
import { SkipLink } from '../ui/SkipLink';
import { useMarketplace } from '../../contexts/MarketplaceContext';
import { workspaceNav } from '../../data/navigation';
import { AppGate } from '../extensions/AppGate';
import { ExtensionsTour } from '../extensions/ExtensionsTour';

export function AppShell() {
  const { currentSpace, switchSpace } = useWorkspace();
  const { pathname } = useLocation();
  // Workspace screens describe the main space; campaigns and DealRooms open only in the canvas.
  const needsMain = currentSpace.id !== MAIN_SPACE_ID && !pathname.startsWith('/app/canvas');
  useEffect(() => {
    if (needsMain) switchSpace(MAIN_SPACE_ID);
  }, [needsMain, switchSpace]);
  // App screens open only while their app is installed (D87). Forms keeps its own paid-add-on screen.
  const market = useMarketplace();
  const navMatch = workspaceNav.find((n) => n.appId && n.appId !== 'forms' && (pathname === n.to || pathname.startsWith(`${n.to}/`)));
  const gatedApp = navMatch?.appId && !market.isActive(navMatch.appId) ? navMatch.appId : null;

  return (
    <div className="flex min-h-screen w-full bg-canvas text-fg">
      <SkipLink />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-line bg-raised px-4 md:hidden">
          <KubicuLogo />
          <NotificationBell size="md" />
        </header>
        <PlatformBanner />
        <BillingBanner />
        <RoleBanner />
        <main id="main-content" tabIndex={-1} className="flex-1 pb-24 focus:outline-none md:pb-0">
          {needsMain ? null : gatedApp ? <AppGate appId={gatedApp} /> : <Outlet />}
        </main>
      </div>
      <MobileNav />
      <ExtensionsTour />
    </div>);

}