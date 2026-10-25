import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { LocaleProvider } from './contexts/LocaleContext';
import { LiveAnnouncer } from './components/ui/LiveAnnouncer';
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
import { BillingProvider } from './contexts/BillingContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { MarketplaceProvider } from './contexts/MarketplaceContext';
import { Extensions } from './pages/Extensions';
import { TemplatesMarket } from './pages/TemplatesMarket';
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
import { PrintKit } from './pages/domains/PrintKit';
import { ServiceOs } from './pages/ServiceOs';
import { QuoteView } from './pages/QuoteView';
import { InvoicePayPage } from './pages/InvoicePayPage';
import { Proof } from './pages/Proof';
import { Deliveries } from './pages/Deliveries';
import { WhatsApp } from './pages/WhatsApp';
import { TrustPassport } from './pages/TrustPassport';
import { BusinessCoach } from './pages/BusinessCoach';
import { Collaborations } from './pages/Collaborations';
import { VoiceToStore } from './pages/VoiceToStore';
import { ReviewSubmit } from './pages/ReviewSubmit';
import { ShortLink } from './pages/ShortLink';
import { Settings } from './pages/settings/Settings';
import { AcceptInvite } from './pages/AcceptInvite';
import { DealRoomSettler } from './components/shell/DealRoomSettler';
import { SubscriptionRenewer } from './components/shell/SubscriptionRenewer';
import { Subscriptions } from './pages/commerce/Subscriptions';
import { Events } from './pages/commerce/Events';
import { GuestList } from './pages/commerce/GuestList';
import { CheckIn } from './pages/commerce/CheckIn';
import { TicketPage } from './pages/TicketPage';
import { PartnerPortal } from './pages/PartnerPortal';
import { SubscriptionPortal } from './pages/SubscriptionPortal';
import { AdminMarketplace } from './pages/admin/AdminMarketplace';
import { AppShell } from './components/shell/AppShell';
import { AdminShell } from './components/admin/AdminShell';
import { AppToaster } from './components/ui/AppToaster';
import { MarketingLayout } from './components/marketing/MarketingLayout';
import { Onboarding } from './pages/Onboarding';
import { Home } from './pages/marketing/Home';
import { Templates } from './pages/marketing/Templates';
import { TemplateDetail } from './pages/marketing/TemplateDetail';
import { Pricing } from './pages/marketing/Pricing';
import { InfoPage } from './pages/marketing/InfoPage';
import { Developers } from './pages/marketing/Developers';
import { SignUp } from './pages/auth/SignUp';
import { SignIn } from './pages/auth/SignIn';
import { ResetPassword } from './pages/auth/ResetPassword';
import { VerifyEmail } from './pages/auth/VerifyEmail';
import { Overview } from './pages/Overview';
import { Spaces } from './pages/Spaces';
import { CanvasPage } from './pages/CanvasPage';
import { CanvasRedirect } from './pages/CanvasRedirect';
import { LegacyRedirect } from './pages/LegacyRedirect';
import { PublicPage } from './pages/PublicPage';
import { PublicTrustPassport } from './pages/PublicTrustPassport';
import { PublicWorkCertificate } from './pages/PublicWorkCertificate';
import { PublicSharedShop } from './pages/PublicSharedShop';
import { PublicStatus } from './pages/PublicStatus';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminPlans } from './pages/admin/AdminPlans';
import { AdminAi } from './pages/admin/AdminAi';
import { AdminIntegrations } from './pages/admin/AdminIntegrations';
import { AdminLocalisation } from './pages/admin/AdminLocalisation';
import { InstalmentCharger } from './components/shell/InstalmentCharger';
import { OrderStatus } from './pages/OrderStatus';
import { DownloadPage } from './pages/DownloadPage';
import { BookingStatus } from './pages/BookingStatus';
import { BookingsLayout } from './components/bookings/BookingsLayout';
import { Schedule } from './pages/bookings/Schedule';
import { Services } from './pages/bookings/Services';
import { Availability } from './pages/bookings/Availability';
import { Audience } from './pages/Audience';
import { Automations } from './pages/Automations';
import { FormsList } from './pages/forms/FormsList';
import { Account } from './pages/Account';
import { Opportunities } from './pages/Opportunities';
import { EmailPreferences } from './pages/EmailPreferences';
import { useAccountEffects } from './hooks/useAccountEffects';
import { FormEditor } from './pages/forms/FormEditor';
import { CommerceLayout } from './components/commerce/CommerceLayout';
import { CommerceOverview } from './pages/commerce/CommerceOverview';
import { Orders } from './pages/commerce/Orders';
import { Products } from './pages/commerce/Products';
import { Inventory } from './pages/commerce/Inventory';
import { Digital } from './pages/commerce/Digital';
import { Discounts } from './pages/commerce/Discounts';
import { Storefront } from './pages/commerce/Storefront';
import { Payments } from './pages/commerce/Payments';
import { Wallet } from './pages/commerce/Wallet';
import { Verification } from './pages/commerce/Verification';
import { PaymentLinks } from './pages/commerce/PaymentLinks';
import { PayLinkPage } from './pages/PayLinkPage';
import { AdminPayments } from './pages/admin/AdminPayments';
import { BuyerProtection } from './pages/BuyerProtection';
import { AdminEscrow } from './pages/admin/AdminEscrow';
import { Reports } from './pages/commerce/Reports';
import { CommerceSettings } from './pages/commerce/CommerceSettings';
import { NotFound } from './pages/NotFound';
import { AdminDesignSystem } from './pages/admin/AdminDesignSystem';
import { AdminPlannedArea } from './pages/admin/AdminPlannedArea';
import { AdminTenants } from './pages/admin/AdminTenants';
import { AdminPages } from './pages/admin/AdminPages';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminReporting } from './pages/admin/AdminReporting';
import { AdminDataRequests } from './pages/admin/AdminDataRequests';
import { AdminStaff } from './pages/admin/AdminStaff';
import { AdminAppeals } from './pages/admin/AdminAppeals';
import { AdminFlags } from './pages/admin/AdminFlags';
import { AdminModeration } from './pages/admin/AdminModeration';
import { AdminSupport } from './pages/admin/AdminSupport';
import { AdminAudit } from './pages/admin/AdminAudit';
import { AdminHealth } from './pages/admin/AdminHealth';

type VisualDirectionOption = 'darkStudio' | 'inkCobalt' | 'inkViolet' | 'navyClay';
type WorkspacePlanOption = 'free' | 'creator' | 'pro' | 'business' | 'agency' | 'enterprise';

type ViewingAsOption = 'owner' | 'admin' | 'editor' | 'sales' | 'viewer';
type RenewalOption = 'succeeds' | 'fails';

interface AppProps {
  visualDirection?: VisualDirectionOption;
  workspacePlan?: WorkspacePlanOption;
  /** Experience the workspace as a team member with this role (D57). */
  viewingAs?: ViewingAsOption;
  /** What happens at the next plan renewal (D65, test mode). */
  simulateNextRenewal?: RenewalOption;
}

export function App({ visualDirection = 'darkStudio', workspacePlan = 'free', viewingAs = 'owner', simulateNextRenewal = 'succeeds' }: AppProps) {
  // Personal text size and motion preferences (D80).
  const { reduceMotion, lang } = useAccountEffects();
  return (
    // Every framer-motion animation follows the device's "reduce motion" setting (D76), or the account's "Always reduce".
    <LocaleProvider lang={lang}>
    <MotionConfig reducedMotion={reduceMotion ? 'always' : 'user'}>
    <BrowserRouter>
      <AppearancePolicyProvider initialDefault={visualDirection}>
        <WorkspaceProvider planControl={workspacePlan}>
          <WorkspaceScope visualDirection={visualDirection} viewingAs={viewingAs} renewal={simulateNextRenewal}>
            <Routes>
              <Route element={<MarketingLayout />}>
                <Route index element={<Home />} />
                <Route path="templates" element={<Templates />} />
                <Route path="templates/:id" element={<TemplateDetail />} />
                <Route path="pricing" element={<Pricing />} />
                <Route path="about/:topic" element={<InfoPage />} />
                <Route path="developers" element={<Developers />} />
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
                <Route path="forms" element={<FormsList />} />
                <Route path="forms/:formId" element={<FormEditor />} />
                <Route path="commerce" element={<CommerceLayout />}>
                  <Route index element={<CommerceOverview />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="products" element={<Products />} />
                  <Route path="inventory" element={<Inventory />} />
                  <Route path="digital" element={<Digital />} />
                  <Route path="discounts" element={<Discounts />} />
                  <Route path="storefront" element={<Storefront />} />
                  <Route path="payments" element={<Payments />} />
                  <Route path="wallet" element={<Wallet />} />
                  <Route path="verification" element={<Verification />} />
                  <Route path="payment-links" element={<PaymentLinks />} />
                  <Route path="subscriptions" element={<Subscriptions />} />
                  <Route path="events" element={<Events />} />
                  <Route path="events/:eventId/guests" element={<GuestList />} />
                  <Route path="events/:eventId/check-in" element={<CheckIn />} />
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
                  <Route path="kit" element={<PrintKit />} />
                </Route>
                <Route path="extensions" element={<Extensions />} />
                <Route path="templates" element={<TemplatesMarket />} />
                <Route path="opportunities" element={<Opportunities />} />
                <Route path="services" element={<ServiceOs />} />
                <Route path="proof" element={<Proof />} />
                <Route path="deliveries" element={<Deliveries />} />
                <Route path="whatsapp" element={<WhatsApp />} />
                <Route path="trust" element={<TrustPassport />} />
                <Route path="coach" element={<BusinessCoach />} />
                <Route path="collabs" element={<Collaborations />} />
                <Route path="voice" element={<VoiceToStore />} />
                <Route path="account" element={<Account />} />
                <Route path="account/:tab" element={<Account />} />
                <Route path="settings" element={<Settings />} />
                <Route path="settings/:tab" element={<Settings />} />
                <Route path="*" element={<NotFound embedded />} />
              </Route>
              <Route path="/app/canvas/:pageId" element={<CanvasPage />} />

              <Route path="/admin" element={<AdminShell />}>
                <Route index element={<Navigate to="overview" replace />} />
                <Route path="overview" element={<AdminOverview />} />
                <Route path="design-system" element={<AdminDesignSystem />} />
                <Route path="modules" element={<AdminMarketplace />} />
                <Route path="tenants" element={<AdminTenants />} />
                <Route path="pages" element={<AdminPages />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="reporting" element={<AdminReporting />} />
                <Route path="data-requests" element={<AdminDataRequests />} />
                <Route path="staff" element={<AdminStaff />} />
                <Route path="appeals" element={<AdminAppeals />} />
                <Route path="flags" element={<AdminFlags />} />
                <Route path="moderation" element={<AdminModeration />} />
                <Route path="support" element={<AdminSupport />} />
                <Route path="audit" element={<AdminAudit />} />
                <Route path="health" element={<AdminHealth />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="escrow" element={<AdminEscrow />} />
                <Route path="plans" element={<AdminPlans />} />
                <Route path="ai" element={<AdminAi />} />
                <Route path="notifications" element={<AdminIntegrations />} />
                <Route path="settings" element={<AdminLocalisation />} />
                <Route path=":area" element={<AdminPlannedArea />} />
              </Route>

              <Route path="/p/:handle" element={<PublicPage />} />
              <Route path="/p/:handle/shop" element={<PublicPage view="shop" />} />
              <Route path="/p/:handle/shop/:productId" element={<PublicPage view="shop" />} />
              <Route path="/p/:handle/s/:slug" element={<ShortLink />} />
              <Route path="/p/:handle/trust" element={<PublicTrustPassport />} />
              <Route path="/p/:handle/work/:id" element={<PublicWorkCertificate />} />
              <Route path="/m/:slug" element={<PublicSharedShop />} />
              <Route path="/status" element={<PublicStatus />} />
              <Route path="/p/:handle/:pagePath" element={<PublicPage />} />
            <Route path="/p/:handle/order/:orderId" element={<OrderStatus />} />
              <Route path="/p/:handle/download/:token" element={<DownloadPage />} />
              <Route path="/p/:handle/ticket/:ticketId" element={<TicketPage />} />
              <Route path="/p/:handle/booking/:bookingId" element={<BookingStatus />} />
              <Route path="/p/:handle/subscription/:token" element={<SubscriptionPortal />} />
              <Route path="/p/:handle/preferences/:contactId" element={<EmailPreferences />} />
              <Route path="/p/:handle/quote/:quoteId" element={<QuoteView />} />
        <Route path="/p/:handle/invoice/:invoiceId" element={<InvoicePayPage />} />
              <Route path="/p/:handle/review/:token" element={<ReviewSubmit />} />
              <Route path="/p/:handle/pay/:slug" element={<PayLinkPage />} />
              <Route path="/p/:handle/protect/:orderId" element={<BuyerProtection />} />
              <Route path="/partner/:token" element={<PartnerPortal />} />

              {/* Earlier addresses */}
              <Route path="/design-system" element={<Navigate to="/admin/design-system" replace />} />
              <Route path="/spaces" element={<Navigate to="/app/spaces" replace />} />
              <Route path="/canvas/:pageId" element={<LegacyRedirect />} />
              <Route path="/:module" element={<LegacyRedirect />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <AppToaster />
            <LiveAnnouncer />
          </WorkspaceScope>
        </WorkspaceProvider>
      </AppearancePolicyProvider>
    </BrowserRouter>
    </MotionConfig>
    </LocaleProvider>);

}

/** Everything that belongs to one workspace remounts when you switch workspaces. */
function WorkspaceScope({ visualDirection, viewingAs, renewal, children }: {visualDirection: VisualDirectionOption;viewingAs: ViewingAsOption;renewal: RenewalOption;children: React.ReactNode;}) {
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
                  <BillingProvider renewalOutcome={renewal}>
                    <UpgradeProvider>
                      <MarketplaceProvider>
                        <NotificationsProvider>
                          {children}
                          <DealRoomSettler />
                          <SubscriptionRenewer />
                          <InstalmentCharger />
                        </NotificationsProvider>
                      </MarketplaceProvider>
                    </UpgradeProvider>
                  </BillingProvider>
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