# KUBICU — Design Traceability Matrix

Sources: Master Blueprint (MB), Implementation Backlog (IB), Master Design Plan (DP).
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
| IB-O / MB-14 | Super-admin OS | P0 basic | Staff | /admin | pages/admin/* | approvals, incidents | 🟡 | All areas (D129, D130); staff plan editing, trials, coupons, credits, AI switches, test sends, translation review in Batch 13 |
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
