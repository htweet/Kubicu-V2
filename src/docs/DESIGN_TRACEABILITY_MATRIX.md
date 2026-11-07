# KUBICU — Design Traceability Matrix

Sources: Master Blueprint (MB), Implementation Backlog (IB), Master Design Plan (DP), Linktree-parity brief (LP). Updated 1 Nov 2026 through D481. 🧪 = built but simulated by design; 👤 = waiting on sign-off.
Disposition: **MVP-D** designed for MVP · **Later-D** designed for later phase · **Concept** future concept · **Clarify** needs clarification · **Excluded** with rationale.
Prototype status: ✅ interactive · 🟡 partial · ⏳ planned placeholder · ⬜ not started

| Req ID | Requirement | Priority / phase | Role | Screen / flow | Component | States | Prototype | Disposition / open questions |
|---|---|---|---|---|---|---|---|---|
| DP-3/4 | Locked design tokens, type scale, spacing, radius, shadow, motion | P0 / MVP | Team | DS-01 | `index.css`, `tailwind.config.js` | 4 directions | ✅ | MVP-D · direction pending founder (D1) |
| DP-4.2 | Core component library | P0 / MVP | Team | DS-01 | `components/ui/*` | default/hover/focus/pressed/disabled/loading/error/empty/locked | ✅ | Date/time/currency/timezone, media upload + crop, command palette, data table, chart card all built |
| DP-5.1 | 11-item workspace navigation, entitlement-aware | P0 / MVP | Owner | SH-01/02, X-01 | Sidebar, MobileNav | active, planned | ✅ | MVP-D |
| MB-17.2 / DP-5.2 | Super-admin navigation (17 areas) | P0 basic / MVP | Staff | AdminShell | adminNavigation | built | ✅ | Every area built (D75b, D82, D92, D129, D130); editing tools for four areas in Batch 13 |
| IB-A | Accounts, auth, onboarding, export/delete | P0 / MVP | Owner | Sign-in, onboarding, Your account | pages/account/* | simulated codes | ✅ 🧪 | D80 · backend out of prototype scope (D5) |
| IB-B / MB-5.1 | Canvas: block tray, drag reorder + keyboard alternative, inspector, device preview | P0 / MVP | Owner | E-01…E-11 | Artboard, BlockFrame, LayersList, Inspector | selected, hover, drag, hidden | ✅ | MVP-D |
| IB-B | Undo/redo for all meaningful operations | P0 / MVP | Owner | E-02 | `useEditorStore` | disabled when empty | ✅ | MVP-D |
| IB-B | Autosave with explicit status; conflict handling | P0 / MVP | Owner | E-02, E-11 | SaveIndicator | saved/saving/offline/failed+retry/conflict | ✅ | Cross-tab conflict built (D29); cross-device needs backend |
| IB-B | Hide, duplicate, lock, group, delete | P0 / MVP | Owner | E-01 | BlockToolbar | undo toast, locked | ✅ | Lock & group built (D21, D22) |
| IB-B | Saved reusable sections & templates | P0 / MVP | Owner | E-05 | TemplatesPanel | confirm, snapshot, empty | ✅ | Templates + reusable sections (D26) |
| IB-B | Versioned structured document; published stable while draft edits | P0 / MVP | Owner | E-09, E-10 | `types/page.ts` | draft vs live | ✅ | MVP-D · sections deferred (D7) |
| MB-5.1 | Mobile-native editor (full-screen preview, FAB, bottom sheets, touch handles, list reorder) | P0 / MVP | Owner | E-11 | MobileEditor | sheets | ✅ | MVP-D · needs observed tests |
| MB-5.2 | Block fields: id, type, schemaVersion, content, style, layout, behaviour, visibility, accessibility, dataBindings | P0 | — | — | `types/page.ts` | — | 🟡 | dataBindings arrive with Commerce/Bookings |
| IB-C / MB-5.3 | MVP blocks (profile…newsletter) | P0 | Owner | E-03, G-01 | `components/blocks/*` | empty, invalid, live | ✅ | MVP-D (16 blocks, D8) · map/location → Batch 3 |
| IB-C | P1 blocks (grid, gallery, countdown, pricing, testimonial, ticket, download, calendar…) | P1 | Owner | E-03 | components/blocks/* | live, locked, linked | ✅ | Blocks incl. event tickets, subscription, Form (with the Forms add-on, D79), audio, playlist, collection, support (D124), Video & embed for 11 sites (D142) |
| IB-C | Embed allowlist & CSP | P0 | — | Video & embed block | parseEmbed (utils/embeds) | refused link with reason | ✅ | 11-site safe list, sandboxed frames (D142); CSP headers are engineering |
| IB-D / MB-5.5 | Templates by goal; theme tokens; contrast preview; save theme | P0 | Owner | E-05, E-07 | ThemePanel | presets/custom/saved, pass/low | ✅ | Saved themes (D27) |
| IB-D | Motion respects reduced motion | P0 | Visitor | All | `index.css` | — | ✅ | MVP-D |
| MB-5.4 | Validation: empty URLs, alt text, contrast, form setup, missing price, payment config, domain setup | P0 | Owner | E-06, E-09 | `utils/validation.ts` | error blocks / warning allows | 🟡 | Payment & domain checks arrive with those modules |
| MB-5.4 | Scheduled publish, rollback, named snapshots | P0 | Owner | E-10 | VersionHistory | live/published/snapshot/scheduled | ✅ | Scheduled publish + block visibility windows (D28) |
| IB-E / MB-6 | Hosted URL, slug check, QR, SEO metadata, social cards | P0 | Owner/Visitor | E-08, G-01 | PageSettingsPanel, PublicPage | handle error, share preview, sitemap, structured data | ✅ | QR (D62, D71), search engines (D124) · real availability check needs backend |
| MB-6.2 | Public page separate from editor, mobile-first, no editor chrome | P0 | Visitor | G-01, G-02 | PublicPage | live, unavailable | ✅ | MVP-D · 9 more examples → Batch 3 |
| IB-F / MB-13 | Basic analytics; privacy notice | P0 basic | Owner | Analytics, Settings → Privacy | AnalyticsContext | real on-device + labelled sample | ✅ | D61 · server pipeline is engineering |
| IB-G/H/I / MB-8 | Products, inventory, orders, payments, digital goods | P1 / CR | Owner | Commerce | CommerceContext | test mode | ✅ | D39–D42 · provider decision gate still open |
| MB-8.4 / DP-8 | WhatsApp-native ordering | P1 | Owner/Visitor | G-01 | WhatsAppBlock, ProductBlock | prefilled message | ✅ | MVP-D (manual handoff, no API) |
| IB-J / MB-9 | Bookings & services | P1 / CR | Owner | Bookings | OpsContext, BookingSheet | deposit, reschedule, cancel | ✅ | D43/D44 · calendar sync in Batch 13 (simulated) |
| IB-K / MB-10 | Leads, contacts, consent, CRM | P1 | Owner | Audience | LeadFormBlock → Audience | consent recorded | ✅ | D45 · custom form builder via Forms add-on (D79) |
| IB-L / MB-12 | Automations | P1/P2 | Owner | Automations | AutomationBuilder | test runs; campaign/quiet triggers, AI draft/report/webhook actions | ✅ | D46, D125 · real-event runs in Batch 13 · real sending is engineering |
| IB-M / MB-7 | Custom domains | P1 | Owner | Domains & QR | DomainsContext | simulated checks | ✅ | D62 |
| IB-N / MB-19 | Plans, billing, entitlements | P0 found. | Owner | Settings → Plan & billing | BillingContext | test mode | ✅ | D65, D68 · prices are example figures |
| IB-O / MB-14 | Super-admin OS | P0 basic | Staff | /admin | pages/admin/* | approvals, incidents | ✅ 🧪 | All areas (D129, D130); staff plan editing, trials, coupons, credits, AI switches, test sends and translation review built in Batch 13 (D135) · real audit log and staff auth need a backend |
| IB-P / MB-18 | Modules & marketplace | P0 found. / P2 | Owner/Staff | Extensions, Templates | MarketplaceContext | install, pause, rollback | ✅ | D67, D70, staff rollback D130, developer submissions D132/D134 |
| IB-Q / MB-11 | AI copilot (propose → approve) | P1 | Owner | Canvas, onboarding, Overview, My Spaces | AI page assistant (`/app/assistant`), BlockSuggest | AI preview, credits | ✅ 🧪 | D63, Voice-to-Store D102, Coach D104 · rule-based simulation |
| IB-R / MB-21 | Security, privacy, trust | P0 | All | Settings → Privacy, legal pages | — | — | 🟡 | Privacy settings built; legal pages D78; backend security is engineering |
| IB-S / DP-7 | Accessibility & performance (WCAG 2.2 AA target, 44px targets, alternatives to drag) | P0 | All | All | useFocusTrap, announce, SkipLink | — | 🟡 | Batch 7 code audit done (D76); automated + device testing open |
| IB-T / DP-X | Trust & safety: report, appeal, suspension | P0/P1 | Visitor/Owner | Report dialog, Moderation | ReportPageDialog, AdminModeration | takedown, suspended | 🟡 | D75b · appeals process page D78 |
| IB-U / DP-8 | NGN, local phone formats, African market fit, languages | P1 | Owner | Product, WhatsApp, Your account → Language | formatNgn, phone validation, LocaleContext | — | 🟡 | Four drafted languages (D133); workspace currency and USSD in Batch 13 |
| IB-V / MB-A1 | IntentFlow | P2 | Owner | Visibility tab, IntentFlow | SourceRuleFields | live, paused, rolled back | ✅ | D64 |
| IB-W / MB-A3 | DealRoom | P2 | Owner | Spaces, DealRoom panel | utils/dealRoom | drop, group goal, refunds | ✅ | D54 |
| IB-X / MB-A4–5 | Trust Passport, Proof-of-Work | P2 | Owner | Trust Passport app, Proof | pages/Proof.tsx, ProofBlock, passport page | verified, lapsed, reported | ✅ 🧪 | D91, D99, D111, D126 · outside checks need partners |
| IB-Y / MB-A8 | Local fulfilment layer | P2 | Owner | Deliveries app | — | quotes, rider, delivery code | ✅ 🧪 | D96, D112 · real couriers needed |
| IB-Z | Developer API | P2 | Dev | Settings → Developers, `/developers` | — | keys, webhooks, sandbox | ✅ 🧪 | D131, D132, D134 |
| MB-A6 | Voice-to-Store | P2 | Owner | Voice-to-Store app | — | listening, draft products | ✅ 🧪 | D102 · English speech only |
| MB-A13 | Offline-to-online QR identity | P1 | Owner | Domains & QR, Print kit | QrDesigner, print kit | tracked scans, fallback, print ordering | ✅ | D62, D71, D86, D114, D118–D119 |
| MB-A14 | Micro-website mode | Later | Owner | Pages panel | multi-page sites, site kits | — | ✅ | D48, D127, seven industry page sets D137 |
| MB-A17 | Lightweight mode / low bandwidth | P0 | Visitor/Owner | Public page, canvas Check | data saver, page weight | — | ✅ | D85, D88, D126 · smaller image versions need a CDN |
| DP-9/10 | Honest microcopy & mock data labelling | P0 | All | All | IllustrativeTag, demo notes | — | ✅ | MVP-D |
| DP-11 | Every control works, is marked illustrative, or disabled with reason | P0 | All | All | Menu reasons, PlanLock, tooltips | — | ✅ | MVP-D |

## Creator pages, Marketplace, Short Links & Audience Manager (D268–D273)

Source: `docs/KUBICU_LINKTREE_PARITY_AND_UPGRADE_MAGIC_PATTERNS.md` (LP). Route list and limits: `docs/PUBLIC_SITE_REGISTER.md`.

| Req ID | Requirement | Priority / phase | Role | Screen / flow | Component | States | Prototype | Disposition / open questions |
|---|---|---|---|---|---|---|---|---|
| LP-4 | Public information architecture: `/features`, `/for/:segment`, `/marketplace`, `/tools/short-links`, `/features/audience-manager` | P1 | Visitor | Website | `pages/marketing/*`, `data/featureIndex.ts`, `data/solutions.ts` | Ready / Needs a plan / Simulated labels | ✅ | D268 · `/themes`, `/blocks`, `/resources` redirect to existing pages |
| LP-5 / LP-11 | Icon-rich mega menu (hover, click, keyboard, Escape) and phone accordion from one schema | P1 | Visitor | Website header, footer | `data/siteMenu.ts`, `MegaMenu`, `MobileSiteMenu` | open, focus return | ✅ | D268 |
| LP-5.1 | Menu usage measured without personal data | P2 | Staff | Super admin → Business reporting → Website menu | `AdminReporting` | empty, per device | ✅ 🧪 | D273 · daily counts only, 90 days, skips DNT/GPC · per device until a server endpoint exists |
| LP-6 | Creator pillar page: creator types, media kit, collaborations, page-to-selling path, Copilot, phone + desktop example | P1 | Visitor | `/for/creators` | `ForCreators`, `data/creatorsPage.ts`, `ExampleDesktop` | tabs (arrow keys) | ✅ | D273 · other seven segments keep the shared layout |
| LP-7.1–7.2 | Marketplace taxonomy, search with everyday words, filters, sort, related items | P1 | Visitor | `/marketplace`, categories, listing | `MarketplaceBrowser`, `ListingCard` | empty search, not available yet | ✅ | D268, checked D273 · no "Popular" sort until real install data exists |
| LP-7.3 | Install journey checks plan, role and installed state | P1 | Owner | Listing → workspace install | `InstallPanel` | locked by plan/role, installed | ✅ | D268 · AI workflow packs shown "Not available yet" |
| LP-8.1 | Public short-link page with safe demo | P1 | Visitor | `/tools/short-links` | `ShortLinkDemo`, `LinkStatsSample` | refused address, 5-try cap | ✅ | D268 · demo saves nothing |
| LP-8.2 | Short links as a core app feature, any destination, tags, pause, destination history | P1 | Owner | Short links (`/app/links`) | `CampaignLinks`, `utils/linkSafety.ts` | paused, ended, blocked | ✅ | D268, D270 · old Campaign links address redirects |
| LP-8.2 | Shorten from the canvas and the publish screen | P1 | Owner | Page settings → Short link; publish success | `ShortLinkQuick` | not published yet, no permission | ✅ | D269 |
| LP-8.3 | Per-link stats: clicks, uniques, outcomes, devices, time of day, landing pages, sources, latest clicks, export | P1 | Owner | `/app/links/:id` | `utils/analytics/linkStats.ts` | empty period, invalid clicks left out | ✅ | D270, D271 · no location data by design |
| LP-8.3 | Search, filter, sort, scheduled start, WhatsApp destinations, saved campaign-tag sets, creation limit | P1 | Owner | Short links list | `CampaignLinks` | scheduled, needs attention | ✅ | D271 · 30/hour and 12 sets are example figures |
| LP-8.4 | Bot and burst filtering, daily health checks, delete click data | P1 | Owner | Short links, Notifications | `ShortLink`, `NotificationsContext` | needs attention, deleted | ✅ 🧪 | D271 · server-side bot filtering, down-site detection and abuse limits need the live service |
| LP-9.1 | Public Audience Manager page | P1 | Visitor | `/features/audience-manager` | `AudienceFlow`, `AudienceDashboardSample` | sample labelled | ✅ | D268 |
| LP-9.2 | Saved segments with an "All of / Any of" rule builder | P1 | Owner | Audience | `SegmentBar` | live count, consent suggestion | ✅ | D268, D272 |
| LP-9.2 | Overview: total contacts and growth over time | P1 | Owner | Audience | Audience overview | 30 d / 90 d / 12 m | ✅ | D272 · deleted contacts aren't in the history |
| LP-9.3 | Sources view and first-touch attribution (channel, short link, page) | P1 | Owner | Audience → Sources | `AudienceSources` | older contacts "not recorded" | ✅ | D268 |
| LP-9.4 | Consent record, logged exports, email and Sheets sync history with retry | P1 | Owner | Contact detail, Activity log, Extensions | `ContactSyncTools` | synced, partly synced, failed | ✅ 🧪 | D268, D272 · real sending to Mailchimp/Brevo/Sheets needs a backend |
| LP-12 | Workspace actions open in a right-side sheet | P1 | Owner | All workspace dialogs | `components/ui/Dialog.tsx` | phone: full-height from the bottom | ✅ | D272 · public pages keep a centred dialog |

## Added after D273 (through D343)

| Req ID | Requirement | Priority / phase | Role | Screen / flow | Component | States | Prototype | Disposition / open questions |
|---|---|---|---|---|---|---|---|---|
| IB-U / DP-8 | Local languages across the whole product (Naijá, Yorùbá, Hausa, Igbo) | P1 | All | Every app, canvas, website and Copilot screen | `contexts/LocaleContext.tsx`, `data/translations*.ts`, `utils/builtPhrases.ts` | English fallback, built sentences | ✅ 👤 | D280–D341 · drafts, native review pending · legal text, help articles, customer messages stay English on purpose |
| IB-U | Language picker in every surface | P1 | All | Sidebar, More sheet, editor top bar, phone Page settings, sign-in/up, Account, website | `LanguagePicker` | collapsed sidebar badge | ✅ | D298, D299 · seller pages use the themed `VisitorLanguageMenu` · D344 visitor form messages and glossary search in the screen language |
| MB-11 | Copilot chats in the workspace sidebar, pin and see all | P2 | Owner | Sidebar → Copilot, `/copilot/chat` All chats | `utils/copilot/store.ts` | no chats, pinned, collapsed rail | ✅ | D284, D290 · device-only storage |
| MB-11 / MB-5 | AI FAQ assistant answering only from approved answers | P2 | Visitor/Owner | Canvas block `faqAssistant` | `FaqAssistantBlock`, `utils/faqMatch.ts` | no match + fallback, empty | ✅ 🧪 | D342 · word matching, no model |
| MB-11 / MB-5 | Voice to content | P2 | Owner | Canvas → Block library | `VoiceToContentDialog`, `useSpeechToText` | no mic, unsupported browser, empty | ✅ 🧪 | D342 · browser speech recognition, typing fallback |
| MB-5.4 | Composition review of copy and hierarchy | P1 | Owner | Canvas → Check | `utils/compositionCheck.ts` | — | ✅ | D342 |
| MB-13 / LP-8.3 | Website/WhatsApp short-link clicks in campaign stats | P1 | Owner | Analytics, Short links, QR | `utils/analytics/aggregate.ts` | bots and bursts excluded | ✅ | D343 |
| MB-10 / LP-9.3 | Back-fill source and permission for older contacts | P1 | Owner | Contact detail | `ContactOrigin` | added by you, not subscribed | ✅ | D343 · hand-recorded permission is the business's own record |

## Added after D343 (through D481)

| Req ID | Requirement | Priority / phase | Role | Screen / flow | Component | States | Prototype | Disposition / open questions |
|---|---|---|---|---|---|---|---|---|
| IB-U / DP-8 | Kiswahili, Twi, isiZulu across the product | P1 | All | App, canvas, website, Home, shop, cart, checkout | `data/translationsKeGhZa/*`, `data/translationsStorefrontProduct.ts` | English fallback | ✅ 👤 | D356–D401, D479–D481 · drafts, native review pending · staff console English only |
| Founder brief | Kenya, Ghana, South Africa as first-class countries | P1 | Owner/Buyer | Currency, phones, regions, banks, payouts, verification | `utils/country.ts`, `utils/currency.ts`, `PhoneField` | country picker, wrong-length errors | ✅ 🧪 | D350–D357, D402–D405, D423–D427 · 👤 example rates and limits |
| Founder brief | Public website speaks to Africa; amounts follow the visitor's language | P1 | Visitor | Website | `MarketingLayout`, `localiseAmounts` | example-rate note | ✅ | D373, D421 |
| Founder brief | Floating Copilot ask bar | P2 | All | Every page except Copilot/AI screens | `AskBar` | minimised, hidden on scroll, near footer | ✅ | D374 · hidden on sellers' published pages and shared shops since D431 |
| Plan 2bf11082 | Billing in each country's currency, local payment methods, country starters | P1 | Owner/Buyer | Pricing, checkout, onboarding | `MobileMoneyPay`, `InstantEftPay`, `CardPay` | pending, failed, timeout | ✅ 🧪 | D431–D434 |
| Plan 2bf11082 — Phase 5 | Tax across countries, cross-border delivery, branches/franchises, accounting, SSO and activity exports, ERP, sponsorships, NFC | P2 | Owner/Staff | Commerce, Settings → Integrations, Growth → Sponsorships, NFC | see register | simulated connections | ✅ 🧪 | D435–D446 |
| Phase 5 follow-ups | Country tax accounts, invoice wording, sponsorship disputes/review/appeals/evidence, real link results, NFC in four countries, branch-limited staff, batches and expiry | P2 | Owner/Staff/Buyer | as listed | `utils/commerce/batches.ts`, `utils/commerce/branches.ts`, sponsorship panels | expired, expiring soon, frozen money | ✅ 🧪 | D447–D478 · 👤 accountant/lawyer wording |
| Founder brief | Every module and add-on switchable by Operations; figures and names editable | P1 | Staff | Super admin → Feature flags, Figures & names, Localisation | `data/adjustableFigures.ts` | "Currently not available" | ✅ | D464–D470 |
| Founder brief | Users & tenants: one person, many workspaces; staff search | P1 | Staff | Super admin → Users & tenants, search | — | locked account | ✅ | D472–D473 |
| Eng brief 6 Nov §0 | Account mode switch (stub of `realAuthEnabled()`) and simulated server outcomes | P1 | All | Controls: `authMode`, `accountSimulation` | `utils/auth/realAuth.ts`, `utils/accountModeSim.ts`, `AccountModeContext` | every outcome in `accountSimulation` | ✅ 🧪 | D529 · `docs/ACCOUNT_MODE_HANDOFF.md` |
| Eng brief §1 | Confirm it's you (step-up) | P1 | Owner/Admin | Shared dialog | `StepUpDialog`, `withStepUp` | sending, code sent, wrong/expired, too many tries, offline, cancelled | ✅ 🧪 | D530 |
| Eng brief §2, §5 | Team members and transfer ownership (account mode) | P1 | Owner/Admin/All | Settings → Team | `TeamTabAccount`, `useTeamAccount` | loading, couldn't load, row saving/saved/failed, no longer in team, left, lost access, transferring, refused | ✅ 🧪 | D532, D535 |
| Eng brief §3 | Invite with a link shown once (account mode) | P1 | Owner/Admin | Settings → Team | `InviteDialogAccount` | creating, link shown, copied, no seats, already invited, step-up, cancel confirm, empty | ✅ 🧪 | D533 |
| Eng brief §4 | Accept an invite (account mode) | P1 | Invitee | `/invite/:token` | `AcceptInviteAccount` | signed out, checking, wrong account, not found or expired, no seats, already member, joined | ✅ 🧪 | D534 |
| Eng brief §6 | Archive workspace, create workspace (account mode) | P1 | Owner | Account → Workspaces | `WorkspacesTabAccount` | creating, created, limit, archive confirm, step-up, archived, failed | ✅ 🧪 | D537, D542 |
| Eng brief §7 | Team policies (account mode) | P1 | Owner/Admin | Settings → Team | `TeamPoliciesSection` | saving, saved, couldn't save, not allowed, step-up | ✅ 🧪 | D536, D544, D545 · includes Roles, Approvals, currency, country, WhatsApp and workspace details |
| Eng brief §8 | Sign out everywhere (account mode) | P1 | All | Account → Sign-in & security | `SecurityTabAccount` | confirm, signing out, signed out, failed | ✅ 🧪 | D538 |
| Eng brief §9 | Verified activity log (account mode) | P1 | Owner/Admin | Settings → Activity | `ActivityTabAccount` | loading, empty, load older, verified, couldn't verify, couldn't load, not allowed | ✅ 🧪 | D539, D541 |
| Eng brief §10 | AI credits on hold (account mode) | P1 | All | AI meter, Plan usage | `AiCreditsAccount` | unsettled charges | ✅ 🧪 | D540 |
| Eng brief §11 | Shared account states | P1 | All | Every account-mode screen | `AccountStates` | offline, server down, rate limited, lost access, session ended, saved | ✅ 🧪 | D531 |
| Eng brief Batch 2 §1–2 | Start an AI run; runs list with status filters and queue position (account mode) | P2 | Owner/Admin (workflows.run) | Automations → Runs | `AutomationsTabs`, `RunsTab`, `RunRow`, `StartRunDialog` | loading, couldn't load, empty, no match, queue full, AI off, not enough credits, not allowed | ✅ 🧪 | D549–D551 |
| Eng brief Batch 2 §3, §5 | Run detail: live timeline, cancel, every end state (account mode) | P2 | Starter / workflows.admin | Automations → Runs → run | `RunDetailSheet`, `RunTimeline`, `RunEndSummary` | live, cancelling, cancel confirm with done actions, succeeded, failed, timed out, cancelled, rejected | ✅ 🧪 | D549, D551 · live feed is simulated |
| Eng brief Batch 2 §4 | Approval card and approvals inbox (account mode) | P2 | workflows.approve | Automations → Approvals; run timeline | `ApprovalCard`, `ApprovalsTab` | pending, approved, rejected, expired, withdrawn, already decided by, someone else must approve, not allowed | ✅ 🧪 | D549–D550 · field names provisional |
