import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppearancePolicyProvider } from './contexts/AppearancePolicyContext';
import { DirectionProvider } from './contexts/DirectionContext';
import { EditorProvider } from './contexts/EditorContext';
import { PlanProvider } from './contexts/PlanContext';
import { LibraryProvider } from './contexts/LibraryContext';
import { MediaProvider } from './contexts/MediaContext';
import { Media } from './pages/Media';
import { CommerceProvider } from './contexts/CommerceContext';
import { OpsProvider } from './contexts/OpsContext';
import { WorkspaceProvider, useWorkspace } from './contexts/WorkspaceContext';
import { UpgradeProvider } from './contexts/UpgradeContext';
import { TeamProvider } from './contexts/TeamContext';
import { AnalyticsProvider } from './contexts/AnalyticsContext';
import { Analytics } from './pages/Analytics';
import { IntentFlow } from './pages/IntentFlow';
import { DomainsProvider } from './contexts/DomainsContext';
import { DomainsLayout } from './components/domains/DomainsLayout';
import { Domains } from './pages/domains/Domains';
import { QrCodes } from './pages/domains/QrCodes';
import { CampaignLinks } from './pages/domains/CampaignLinks';
import { Redirects } from './pages/domains/Redirects';
import { ShortLink } from './pages/ShortLink';
import { Settings } from './pages/settings/Settings';
import { AcceptInvite } from './pages/AcceptInvite';
import { DealRoomSettler } from './components/shell/DealRoomSettler';
import { AppShell } from './components/shell/AppShell';
import { AdminShell } from './components/admin/AdminShell';
import { AppToaster } from './components/ui/AppToaster';
import { MarketingLayout } from './components/marketing/MarketingLayout';
import { Onboarding } from './pages/Onboarding';
import { Home } from './pages/marketing/Home';
import { Templates } from './pages/marketing/Templates';
import { TemplateDetail } from './pages/marketing/TemplateDetail';
import { Pricing } from './pages/marketing/Pricing';
import { ComingSoon } from './pages/marketing/ComingSoon';
import { SignUp } from './pages/auth/SignUp';
import { SignIn } from './pages/auth/SignIn';
import { ResetPassword } from './pages/auth/ResetPassword';
import { VerifyEmail } from './pages/auth/VerifyEmail';
import { Overview } from './pages/Overview';
import { Spaces } from './pages/Spaces';
import { PlannedModule } from './pages/PlannedModule';
import { CanvasPage } from './pages/CanvasPage';
import { CanvasRedirect } from './pages/CanvasRedirect';
import { LegacyRedirect } from './pages/LegacyRedirect';
import { PublicPage } from './pages/PublicPage';
import { OrderStatus } from './pages/OrderStatus';
import { DownloadPage } from './pages/DownloadPage';
import { BookingStatus } from './pages/BookingStatus';
import { BookingsLayout } from './components/bookings/BookingsLayout';
import { Schedule } from './pages/bookings/Schedule';
import { Services } from './pages/bookings/Services';
import { Availability } from './pages/bookings/Availability';
import { Audience } from './pages/Audience';
import { Automations } from './pages/Automations';
import { CommerceLayout } from './components/commerce/CommerceLayout';
import { CommerceOverview } from './pages/commerce/CommerceOverview';
import { Orders } from './pages/commerce/Orders';
import { Products } from './pages/commerce/Products';
import { Inventory } from './pages/commerce/Inventory';
import { Digital } from './pages/commerce/Digital';
import { Discounts } from './pages/commerce/Discounts';
import { Storefront } from './pages/commerce/Storefront';
import { Payments } from './pages/commerce/Payments';
import { Reports } from './pages/commerce/Reports';
import { CommerceSettings } from './pages/commerce/CommerceSettings';
import { NotFound } from './pages/NotFound';
import { AdminDesignSystem } from './pages/admin/AdminDesignSystem';
import { AdminPlannedArea } from './pages/admin/AdminPlannedArea';

type VisualDirectionOption = 'darkStudio' | 'inkCobalt' | 'inkViolet' | 'navyClay';
type WorkspacePlanOption = 'free' | 'creator' | 'pro' | 'business' | 'agency' | 'enterprise';

type ViewingAsOption = 'owner' | 'admin' | 'editor' | 'sales' | 'viewer';

interface AppProps {
  visualDirection?: VisualDirectionOption;
  workspacePlan?: WorkspacePlanOption;
  /** Experience the workspace as a team member with this role (D57). */
  viewingAs?: ViewingAsOption;
}

export function App({ visualDirection = 'darkStudio', workspacePlan = 'free', viewingAs = 'owner' }: AppProps) {
  return (
    <BrowserRouter>
      <AppearancePolicyProvider initialDefault={visualDirection}>
        <WorkspaceProvider planControl={workspacePlan}>
          <WorkspaceScope visualDirection={visualDirection} viewingAs={viewingAs}>
            <Routes>
              <Route element={<MarketingLayout />}>
                <Route index element={<Home />} />
                <Route path="templates" element={<Templates />} />
                <Route path="templates/:id" element={<TemplateDetail />} />
                <Route path="pricing" element={<Pricing />} />
                <Route path="about/:topic" element={<ComingSoon />} />
              </Route>
              <Route path="/signup" element={<SignUp />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/reset" element={<ResetPassword />} />
              <Route path="/verify" element={<VerifyEmail />} />
              <Route path="/start" element={<Onboarding />} />
              <Route path="/invite/:token" element={<AcceptInvite />} />

              <Route path="/app" element={<AppShell />}>
                <Route index element={<Overview />} />
                <Route path="spaces" element={<Spaces />} />
                <Route path="canvas" element={<CanvasRedirect />} />
                <Route path="media" element={<Media />} />
                <Route path="bookings" element={<BookingsLayout />}>
                  <Route index element={<Schedule />} />
                  <Route path="services" element={<Services />} />
                  <Route path="availability" element={<Availability />} />
                </Route>
                <Route path="audience" element={<Audience />} />
                <Route path="automations" element={<Automations />} />
                <Route path="commerce" element={<CommerceLayout />}>
                  <Route index element={<CommerceOverview />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="products" element={<Products />} />
                  <Route path="inventory" element={<Inventory />} />
                  <Route path="digital" element={<Digital />} />
                  <Route path="discounts" element={<Discounts />} />
                  <Route path="storefront" element={<Storefront />} />
                  <Route path="payments" element={<Payments />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="settings" element={<CommerceSettings />} />
                </Route>
                <Route path="analytics" element={<Analytics />} />
                <Route path="intentflow" element={<IntentFlow />} />
                <Route path="domains" element={<DomainsLayout />}>
                  <Route index element={<Domains />} />
                  <Route path="qr" element={<QrCodes />} />
                  <Route path="links" element={<CampaignLinks />} />
                  <Route path="redirects" element={<Redirects />} />
                </Route>
                <Route path="settings" element={<Settings />} />
                <Route path="settings/:tab" element={<Settings />} />
                <Route path=":module" element={<PlannedModule />} />
              </Route>
              <Route path="/app/canvas/:pageId" element={<CanvasPage />} />

              <Route path="/admin" element={<AdminShell />}>
                <Route index element={<Navigate to="design-system" replace />} />
                <Route path="design-system" element={<AdminDesignSystem />} />
                <Route path=":area" element={<AdminPlannedArea />} />
              </Route>

              <Route path="/p/:handle" element={<PublicPage />} />
              <Route path="/p/:handle/shop" element={<PublicPage view="shop" />} />
              <Route path="/p/:handle/shop/:productId" element={<PublicPage view="shop" />} />
              <Route path="/p/:handle/s/:slug" element={<ShortLink />} />
              <Route path="/p/:handle/:pagePath" element={<PublicPage />} />
            <Route path="/p/:handle/order/:orderId" element={<OrderStatus />} />
              <Route path="/p/:handle/download/:token" element={<DownloadPage />} />
              <Route path="/p/:handle/booking/:bookingId" element={<BookingStatus />} />

              {/* Earlier addresses */}
              <Route path="/design-system" element={<Navigate to="/admin/design-system" replace />} />
              <Route path="/spaces" element={<Navigate to="/app/spaces" replace />} />
              <Route path="/canvas/:pageId" element={<LegacyRedirect />} />
              <Route path="/:module" element={<LegacyRedirect />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <AppToaster />
          </WorkspaceScope>
        </WorkspaceProvider>
      </AppearancePolicyProvider>
    </BrowserRouter>);

}

/** Everything that belongs to one workspace remounts when you switch workspaces. */
function WorkspaceScope({ visualDirection, viewingAs, children }: {visualDirection: VisualDirectionOption;viewingAs: ViewingAsOption;children: React.ReactNode;}) {
  const { current, currentSpace } = useWorkspace();
  return (
    <DirectionProvider key={current.id} direction={visualDirection}>
      <PlanProvider plan={current.plan}>
       <TeamProvider viewingAs={viewingAs}>
       <AnalyticsProvider>
       <DomainsProvider>
        <MediaProvider>
          <LibraryProvider>
            <CommerceProvider>
              <OpsProvider>
                {/* The editor follows the space open in the canvas (D50). */}
                <EditorProvider key={currentSpace.id}>
                  <UpgradeProvider>
                    {children}
                    <DealRoomSettler />
                  </UpgradeProvider>
                </EditorProvider>
              </OpsProvider>
            </CommerceProvider>
          </LibraryProvider>
        </MediaProvider>
       </DomainsProvider>
       </AnalyticsProvider>
       </TeamProvider>
      </PlanProvider>
    </DirectionProvider>);

}