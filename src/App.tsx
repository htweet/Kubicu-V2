import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { LocaleProvider } from './contexts/LocaleContext';
import { LiveAnnouncer } from './components/ui/LiveAnnouncer';
import { AskBar } from './components/shell/AskBar';
import { AppearancePolicyProvider } from './contexts/AppearancePolicyContext';
import { DirectionProvider } from './contexts/DirectionContext';
import { EditorProvider } from './contexts/EditorContext';
import { PlanProvider } from './contexts/PlanContext';
import { LibraryProvider } from './contexts/LibraryContext';
import { MediaProvider } from './contexts/MediaContext';
import { Media } from './pages/Media';
import { Assistant } from './pages/Assistant';
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
import { AiFeatures } from './pages/marketing/AiFeatures';
import { IntentFlow } from './pages/IntentFlow';
import { DomainsProvider } from './contexts/DomainsContext';
import { DomainsLayout } from './components/domains/DomainsLayout';
import { GrowthToolLayout, MovedTo } from './components/domains/GrowthToolLayout';
import { Domains } from './pages/domains/Domains';
import { QrCodes } from './pages/domains/QrCodes';
import { CampaignLinks } from './pages/domains/CampaignLinks';
import { LinkStats } from './pages/domains/LinkStats';
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
import { Sponsorships } from './pages/Sponsorships';
import { NfcTags } from './pages/NfcTags';
import { NfcTap } from './pages/NfcTap';
import { SponsorLink } from './pages/SponsorLink';
import { VoiceToStore } from './pages/VoiceToStore';
import { ReviewSubmit } from './pages/ReviewSubmit';
import { ShortLink } from './pages/ShortLink';
import { Settings } from './pages/settings/Settings';
import { AcceptInvite } from './pages/AcceptInvite';
import { DealRoomSettler } from './components/shell/DealRoomSettler';
import { BookingAutoDecliner } from './components/shell/BookingAutoDecliner';
import { SubscriptionRenewer } from './components/shell/SubscriptionRenewer';
import { Subscriptions } from './pages/commerce/Subscriptions';
import { Events } from './pages/commerce/Events';
import { Courses } from './pages/commerce/Courses';
import { GiftCards } from './pages/commerce/GiftCards';
import { Branches } from './pages/commerce/Branches';
import { LearnPage } from './pages/LearnPage';
import { GuestList } from './pages/commerce/GuestList';
import { CheckIn } from './pages/commerce/CheckIn';
import { TicketPage } from './pages/TicketPage';
import { PartnerPortal } from './pages/PartnerPortal';
import { SubscriptionPortal } from './pages/SubscriptionPortal';
import { AppShell } from './components/shell/AppShell';
import { AppToaster } from './components/ui/AppToaster';
import { MarketingLayout } from './components/marketing/MarketingLayout';
import { CopilotSimProvider } from './contexts/CopilotSimContext';
import { CopilotLanding } from './pages/marketing/CopilotLanding';
import { CopilotWeb } from './pages/copilot/CopilotWeb';
import { CopilotWhatsApp } from './pages/copilot/CopilotWhatsApp';
import { CopilotPreview } from './pages/copilot/CopilotPreview';
import { ServerDraftPreview } from './pages/drafts/ServerDraftPreview';
import { CopilotContinue } from './pages/copilot/CopilotContinue';
import { Onboarding } from './pages/Onboarding';
import { Home } from './pages/marketing/Home';
import { Templates } from './pages/marketing/Templates';
import { TemplateDetail } from './pages/marketing/TemplateDetail';
import { Pricing } from './pages/marketing/Pricing';
import { InfoPage } from './pages/marketing/InfoPage';
import { HelpArticlePage } from './pages/marketing/HelpArticlePage';
import { Developers } from './pages/marketing/Developers';
import { Solution } from './pages/marketing/Solution';
import { ForCreators } from './pages/marketing/ForCreators';
import { Features } from './pages/marketing/Features';
import { MarketplaceHome } from './pages/marketing/marketplace/MarketplaceHome';
import { MarketplaceCategory } from './pages/marketing/marketplace/MarketplaceCategory';
import { MarketplaceListing } from './pages/marketing/marketplace/MarketplaceListing';
import { ShortLinksLanding } from './pages/marketing/ShortLinksLanding';
import { AudienceManagerLanding } from './pages/marketing/AudienceManagerLanding';
import { SignUp } from './pages/auth/SignUp';
import { SignIn } from './pages/auth/SignIn';
import { ResetPassword } from './pages/auth/ResetPassword';
import { VerifyEmail } from './pages/auth/VerifyEmail';
import { CodeSignIn } from './pages/auth/CodeSignIn';
import { VerifyCode } from './pages/auth/VerifyCode';
import { RequireSession } from './components/auth/RequireSession';
import { AuthProvider } from './contexts/AuthContext';
import { ImportsProvider } from './contexts/ImportsContext';
import { realAuthEnabled } from './utils/auth/realAuth';
import { STAFF_CONSOLE_BUILD } from './utils/staffConsole';
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
import { BuyerProtection } from './pages/BuyerProtection';
import { Reports } from './pages/commerce/Reports';
import { CommerceSettings } from './pages/commerce/CommerceSettings';
import { NotFound } from './pages/NotFound';

type VisualDirectionOption = 'darkStudio' | 'inkCobalt';
type WorkspacePlanOption = 'free' | 'creator' | 'pro' | 'business' | 'agency' | 'enterprise';

type ViewingAsOption = 'owner' | 'admin' | 'editor' | 'sales' | 'viewer';
type RenewalOption = 'succeeds' | 'fails';
type CopilotWhatsAppOption = 'available' | 'unavailable';
type CopilotFailureOption = 'none' | 'generation' | 'previewImage' | 'expiredLink' | 'signIn';

interface AppProps {
  /** KUBICU Copilot's WhatsApp channel (D262, proposed): off shows the web fallback. */
  copilotWhatsApp?: CopilotWhatsAppOption;
  /** Walk through a Copilot recovery path (D262). */
  copilotFailure?: CopilotFailureOption;
  visualDirection?: VisualDirectionOption;
  workspacePlan?: WorkspacePlanOption;
  /** Experience the workspace as a team member with this role (D57). */
  viewingAs?: ViewingAsOption;
  /** What happens at the next plan renewal (D65, test mode). */
  simulateNextRenewal?: RenewalOption;
}

/**
 * Real sign-in (M2.6, flag in utils/auth/realAuth.ts). Off: the prototype as before, no provider, no guard.
 * On: GET /v1/me decides who is signed in, and every /app/* screen needs a session (D-UI-3).
 */
function SessionScope({ children }: {children: React.ReactNode;}) {
  return realAuthEnabled() ? <AuthProvider><ImportsProvider>{children}</ImportsProvider></AuthProvider> : <>{children}</>;
}
// G-1: the prototype staff console exists only in builds with VITE_KUBICU_STAFF_CONSOLE=prototype.
const StaffConsole = STAFF_CONSOLE_BUILD ? lazy(() => import('./routes/StaffConsoleRoutes')) : null;
const guard = (element: React.ReactElement): React.ReactElement => realAuthEnabled() ? <RequireSession>{element}</RequireSession> : element;

export function App({ visualDirection = 'darkStudio', workspacePlan = 'free', viewingAs = 'owner', simulateNextRenewal = 'succeeds', copilotWhatsApp = 'available', copilotFailure = 'none' }: AppProps) {
  // Personal text size and motion preferences (D80).
  const { reduceMotion, lang } = useAccountEffects();
  const realAuth = realAuthEnabled();
  return (
    // Every framer-motion animation follows the device's "reduce motion" setting (D76), or the account's "Always reduce".
    <LocaleProvider lang={lang}>
    <MotionConfig reducedMotion={reduceMotion ? 'always' : 'user'}>
    <BrowserRouter>
      <CopilotSimProvider whatsapp={copilotWhatsApp} failure={copilotFailure}>
      <AppearancePolicyProvider initialDefault={visualDirection}>
        <WorkspaceProvider planControl={workspacePlan}>
          <WorkspaceScope visualDirection={visualDirection} viewingAs={viewingAs} renewal={simulateNextRenewal}>
            <SessionScope>
            <Routes>
              <Route element={<MarketingLayout />}>
                <Route index element={<Home />} />
                <Route path="templates" element={<Templates />} />
                <Route path="templates/:id" element={<TemplateDetail />} />
                <Route path="pricing" element={<Pricing />} />
                <Route path="ai" element={<AiFeatures />} />
                <Route path="about/help/:articleId" element={<HelpArticlePage />} />
                <Route path="about/:topic" element={<InfoPage />} />
                <Route path="developers" element={<Developers />} />
                <Route path="copilot" element={<CopilotLanding />} />
                <Route path="for/creators" element={<ForCreators />} />
                <Route path="for/:segment" element={<Solution />} />
                <Route path="marketplace" element={<MarketplaceHome />} />
                <Route path="marketplace/apps" element={<MarketplaceCategory fixed="apps" />} />
                <Route path="marketplace/categories/:category" element={<MarketplaceCategory />} />
                <Route path="marketplace/:slug" element={<MarketplaceListing />} />
                <Route path="tools/short-links" element={<ShortLinksLanding />} />
                <Route path="features/audience-manager" element={<AudienceManagerLanding />} />
                <Route path="features" element={<Features />} />
                <Route path="themes" element={<Navigate to="/templates?tab=themes" replace />} />
                <Route path="blocks" element={<Navigate to="/marketplace/categories/blocks" replace />} />
                <Route path="resources" element={<Navigate to="/about/help" replace />} />
              </Route>
              <Route path="/copilot/chat" element={<CopilotWeb />} />
              <Route path="/copilot/whatsapp" element={<CopilotWhatsApp />} />
              <Route path="/d/:id" element={<CopilotPreview />} />
              <Route path="/copilot/continue" element={<CopilotContinue />} />
              <Route path="/signup" element={realAuth ? <SignUp codeFlow /> : <SignUp />} />
              <Route path="/signin" element={realAuth ? <CodeSignIn /> : <SignIn />} />
              {/* No passwords with real sign-in (D-UI-1d): /reset goes to sign-in. */}
              <Route path="/reset" element={realAuth ? <Navigate to="/signin" replace /> : <ResetPassword />} />
              <Route path="/verify" element={realAuth ? <VerifyCode /> : <VerifyEmail />} />
              <Route path="/start" element={<Onboarding />} />
              <Route path="/invite/:token" element={<AcceptInvite />} />

              <Route path="/app" element={guard(<AppShell />)}>
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
                  <Route path="courses" element={<Courses />} />
                  <Route path="gift-cards" element={<GiftCards />} />
                  <Route path="branches" element={<Branches />} />
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
                  <Route path="redirects" element={<Redirects />} />
                </Route>
                <Route path="domains/qr" element={<MovedTo to="/app/qr" />} />
                <Route path="domains/links" element={<MovedTo to="/app/links" />} />
                <Route path="campaign-links" element={<MovedTo to="/app/links" />} />
                <Route path="domains/kit" element={<MovedTo to="/app/print-kit" />} />
                <Route element={<GrowthToolLayout />}>
                  <Route path="qr" element={<QrCodes />} />
                  <Route path="print-kit" element={<PrintKit />} />
                  <Route path="links" element={<CampaignLinks />} />
                  <Route path="links/:id" element={<LinkStats />} />
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
                <Route path="sponsorships" element={<Sponsorships />} />
                <Route path="nfc" element={<NfcTags />} />
                <Route path="voice" element={<VoiceToStore />} />
                <Route path="account" element={<Account />} />
                <Route path="account/:tab" element={<Account />} />
                <Route path="settings" element={<Settings />} />
                <Route path="settings/:tab" element={<Settings />} />
                <Route path="*" element={<NotFound embedded />} />
              </Route>
              <Route path="/app/canvas/:pageId" element={guard(<CanvasPage />)} />
              <Route path="/app/assistant" element={guard(<Assistant />)} />
              <Route path="/app/drafts/:wsId/:draftId" element={guard(<ServerDraftPreview />)} />

              {StaffConsole && <Route path="/admin/*" element={<Suspense fallback={null}><StaffConsole /></Suspense>} />}

              <Route path="/p/:handle" element={<PublicPage />} />
              <Route path="/p/:handle/shop" element={<PublicPage view="shop" />} />
              <Route path="/p/:handle/shop/:productId" element={<PublicPage view="shop" />} />
              <Route path="/p/:handle/s/:slug" element={<ShortLink />} />
              <Route path="/p/:handle/t/:code" element={<NfcTap />} />
              <Route path="/sp/:code" element={<SponsorLink />} />
              <Route path="/p/:handle/trust" element={<PublicTrustPassport />} />
              <Route path="/p/:handle/work/:id" element={<PublicWorkCertificate />} />
              <Route path="/m/:slug" element={<PublicSharedShop />} />
              <Route path="/status" element={<PublicStatus />} />
              <Route path="/p/:handle/:pagePath" element={<PublicPage />} />
            <Route path="/p/:handle/order/:orderId" element={<OrderStatus />} />
              <Route path="/p/:handle/download/:token" element={<DownloadPage />} />
              <Route path="/p/:handle/ticket/:ticketId" element={<TicketPage />} />
              <Route path="/p/:handle/learn/:courseId" element={<LearnPage />} />
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
              {StaffConsole && <Route path="/design-system" element={<Navigate to="/admin/design-system" replace />} />}
              <Route path="/spaces" element={<Navigate to="/app/spaces" replace />} />
              <Route path="/canvas/:pageId" element={<LegacyRedirect />} />
              <Route path="/:module" element={<LegacyRedirect />} />
              {/* Public addresses typed without /p (e.g. /adaeze-trunk-show/shop) still reach the page (D187). */}
              <Route path="*" element={<LegacyRedirect />} />
            </Routes>
            </SessionScope>
            <AskBar />
            <AppToaster />
            <LiveAnnouncer />
          </WorkspaceScope>
        </WorkspaceProvider>
      </AppearancePolicyProvider>
      </CopilotSimProvider>
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
                          <BookingAutoDecliner />
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