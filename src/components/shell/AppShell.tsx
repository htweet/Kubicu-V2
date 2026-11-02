import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useDocumentLang } from '../../contexts/LocaleContext';
import { MAIN_SPACE_ID } from '../../utils/spaces';
import { setActiveCurrency, setBillingCurrency } from '../../utils/currency';
import { countryInfo, setActiveCountry, workspaceCountry } from '../../utils/country';
import { setActiveBusinessWhatsApp } from '../../utils/businessWhatsApp';
import { useAutomationRunner } from '../../hooks/useAutomationRunner';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { KubicuLogo } from './KubicuLogo';
import { RoleBanner } from './RoleBanner';
import { BillingBanner } from './BillingBanner';
import { DemoDataBanner } from './DemoDataBanner';
import { PlatformBanner } from './PlatformBanner';
import { PolicyAgreement } from './PolicyAgreement';
import { NotificationBell } from '../notifications/NotificationBell';
import { SkipLink } from '../ui/SkipLink';
import { useMarketplace } from '../../contexts/MarketplaceContext';
import { workspaceNav } from '../../data/navigation';
import { AppGate } from '../extensions/AppGate';
import { ExtensionsTour } from '../extensions/ExtensionsTour';
import { ModuleUnavailable } from './ModuleUnavailable';
import { useModuleAvailability } from '../../utils/admin/moduleFlags';
import { extensionById } from '../../data/extensions';
import { useAdminStore } from '../../utils/admin/store';
import { ACCOUNT_PERSON } from '../../utils/admin/people';
import { AccountLocked } from './AccountLocked';
import { CountryNotOpen } from './CountryNotOpen';
import { countryOpen } from '../../utils/admin/countryRollout';

export function AppShell() {
  const { current, currentSpace, switchSpace } = useWorkspace();
  const { pathname } = useLocation();
  // Every amount on workspace screens uses this workspace's currency (D136). Set before children render.
  setActiveCurrency(current.currency);
  // Phone fields, regions, banks and checkout follow the workspace's country (D352).
  setActiveCountry(workspaceCountry(current));
  // KUBICU bills in the workspace country's currency at the day's rate (D432).
  setBillingCurrency(countryInfo(workspaceCountry(current)).currency);
  useDocumentLang();
  // Every WhatsApp button without its own number uses the business number (D214).
  setActiveBusinessWhatsApp(current.whatsapp);
  // Campaign and quiet-contact automations run on real changes while the app is open (D137).
  useAutomationRunner();
  // Workspace screens describe the main space; campaigns and DealRooms open only in the canvas.
  const needsMain = currentSpace.id !== MAIN_SPACE_ID && !pathname.startsWith('/app/canvas');
  useEffect(() => {
    if (needsMain) switchSpace(MAIN_SPACE_ID);
  }, [needsMain, switchSpace]);
  // App screens open only while their app is installed (D87). Forms keeps its own paid-add-on screen.
  const market = useMarketplace();
  const navMatch = workspaceNav.find((n) => n.appId && n.appId !== 'forms' && (pathname === n.to || pathname.startsWith(`${n.to}/`)));
  const gatedApp = navMatch?.appId && !market.isInstalled(navMatch.appId) ? navMatch.appId : null;
  // Modules KUBICU has switched off stay reachable but say "Currently not available" (D464). Checked before the app gate.
  const availability = useModuleAvailability();
  const screen = workspaceNav.
  filter((n) => n.to !== '/app' && (pathname === n.to || pathname.startsWith(`${n.to}/`))).
  sort((a, b) => b.to.length - a.to.length)[0];
  const offModule = screen && !availability.nav(screen) ? screen : null;
  const offInfo = offModule?.appId ? extensionById[offModule.appId] : null;
  // Staff can lock the signed-in account from Users & tenants (D472); every workspace is closed to it until unlocked.
  const [adminStore] = useAdminStore();
  if (adminStore.people?.[ACCOUNT_PERSON]?.locked) return <AccountLocked />;
  // Countries open one at a time from Nigeria (D494): a workspace in a closed country can't be opened.
  if (!countryOpen(adminStore, workspaceCountry(current))) return <CountryNotOpen workspace={current} />;

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
        <DemoDataBanner />
        <PolicyAgreement />
        <RoleBanner />
        <main id="main-content" tabIndex={-1} className="flex-1 pb-24 focus:outline-none md:pb-0">
          {needsMain ? null : offModule ? <ModuleUnavailable name={offModule.label} description={offInfo?.summary} /> : gatedApp ? <AppGate appId={gatedApp} /> : <Outlet />}
        </main>
      </div>
      <MobileNav />
      <ExtensionsTour />
    </div>);

}