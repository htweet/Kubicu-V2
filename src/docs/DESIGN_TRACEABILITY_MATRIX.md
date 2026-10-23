# KUBICU — Design Traceability Matrix

Sources: Master Blueprint (MB), Implementation Backlog (IB), Master Design Plan (DP).
Disposition: **MVP-D** designed for MVP · **Later-D** designed for later phase · **Concept** future concept · **Clarify** needs clarification · **Excluded** with rationale.
Prototype status: ✅ interactive · 🟡 partial · ⏳ planned placeholder · ⬜ not started

| Req ID | Requirement | Priority / phase | Role | Screen / flow | Component | States | Prototype | Disposition / open questions |
|---|---|---|---|---|---|---|---|---|
| DP-3/4 | Locked design tokens, type scale, spacing, radius, shadow, motion | P0 / MVP | Team | DS-01 | `index.css`, `tailwind.config.js` | 4 directions | ✅ | MVP-D · direction pending founder (D1) |
| DP-4.2 | Core component library | P0 / MVP | Team | DS-01 | `components/ui/*` | default/hover/focus/pressed/disabled/loading/error/empty/locked | ✅ | Date/time/currency/timezone, media upload + crop, command palette, data table, chart card all built |
| DP-5.1 | 11-item workspace navigation, entitlement-aware | P0 / MVP | Owner | SH-01/02, X-01 | Sidebar, MobileNav | active, planned | ✅ | MVP-D |
| MB-17.2 / DP-5.2 | Super-admin navigation (17 areas) | P0 basic / MVP | Staff | AdminShell | adminNavigation | built / planned | 🟡 | 8 areas working (D75b); 9 planned screens |
| IB-A | Accounts, auth, onboarding, export/delete | P0 / MVP | Owner | — | — | — | ⬜ | Batch 3 (auth/onboarding UI); backend out of prototype scope (D5) |
| IB-B / MB-5.1 | Canvas: block tray, drag reorder + keyboard alternative, inspector, device preview | P0 / MVP | Owner | E-01…E-11 | Artboard, BlockFrame, LayersList, Inspector | selected, hover, drag, hidden | ✅ | MVP-D |
| IB-B | Undo/redo for all meaningful operations | P0 / MVP | Owner | E-02 | `useEditorStore` | disabled when empty | ✅ | MVP-D |
| IB-B | Autosave with explicit status; conflict handling | P0 / MVP | Owner | E-02, E-11 | SaveIndicator | saved/saving/offline/failed+retry/conflict | ✅ | Cross-tab conflict built (D29); cross-device needs backend |
| IB-B | Hide, duplicate, lock, group, delete | P0 / MVP | Owner | E-01 | BlockToolbar | undo toast, locked | ✅ | Lock & group built (D21, D22) |
| IB-B | Saved reusable sections & templates | P0 / MVP | Owner | E-05 | TemplatesPanel | confirm, snapshot, empty | ✅ | Templates + reusable sections (D26) |
| IB-B | Versioned structured document; published stable while draft edits | P0 / MVP | Owner | E-09, E-10 | `types/page.ts` | draft vs live | ✅ | MVP-D · sections deferred (D7) |
| MB-5.1 | Mobile-native editor (full-screen preview, FAB, bottom sheets, touch handles, list reorder) | P0 / MVP | Owner | E-11 | MobileEditor | sheets | ✅ | MVP-D · needs observed tests |
| MB-5.2 | Block fields: id, type, schemaVersion, content, style, layout, behaviour, visibility, accessibility, dataBindings | P0 | — | — | `types/page.ts` | — | 🟡 | dataBindings arrive with Commerce/Bookings |
| IB-C / MB-5.3 | MVP blocks (profile…newsletter) | P0 | Owner | E-03, G-01 | `components/blocks/*` | empty, invalid, live | ✅ | MVP-D (16 blocks, D8) · map/location → Batch 3 |
| IB-C | P1 blocks (grid, gallery, countdown, pricing, testimonial, ticket, download, calendar…) | P1 | Owner | E-03 | components/blocks/* | live, locked, linked | ✅ | 27 blocks incl. event tickets, subscription; Form block arrives with Forms add-on (D79) |
| IB-C | Embed allowlist & CSP | P0 | — | Video block | getYouTubeId | unsupported link | 🟡 | YouTube only (D9); CSP is engineering |
| IB-D / MB-5.5 | Templates by goal; theme tokens; contrast preview; save theme | P0 | Owner | E-05, E-07 | ThemePanel | presets/custom/saved, pass/low | ✅ | Saved themes (D27) |
| IB-D | Motion respects reduced motion | P0 | Visitor | All | `index.css` | — | ✅ | MVP-D |
| MB-5.4 | Validation: empty URLs, alt text, contrast, form setup, missing price, payment config, domain setup | P0 | Owner | E-06, E-09 | `utils/validation.ts` | error blocks / warning allows | 🟡 | Payment & domain checks arrive with those modules |
| MB-5.4 | Scheduled publish, rollback, named snapshots | P0 | Owner | E-10 | VersionHistory | live/published/snapshot/scheduled | ✅ | Scheduled publish + block visibility windows (D28) |
| IB-E / MB-6 | Hosted URL, slug check, QR, SEO metadata, social cards | P0 | Owner/Visitor | E-08, G-01 | PageSettingsPanel, PublicPage | handle error, share preview | 🟡 | Availability check needs backend · QR → Batch 5 |
| MB-6.2 | Public page separate from editor, mobile-first, no editor chrome | P0 | Visitor | G-01, G-02 | PublicPage | live, unavailable | ✅ | MVP-D · 9 more examples → Batch 3 |
| IB-F / MB-13 | Basic analytics; privacy notice | P0 basic | Owner | Analytics, Settings → Privacy | AnalyticsContext | real on-device + labelled sample | ✅ | D61 · server pipeline is engineering |
| IB-G/H/I / MB-8 | Products, inventory, orders, payments, digital goods | P1 / CR | Owner | Commerce | CommerceContext | test mode | ✅ | D39–D42 · provider decision gate still open |
| MB-8.4 / DP-8 | WhatsApp-native ordering | P1 | Owner/Visitor | G-01 | WhatsAppBlock, ProductBlock | prefilled message | ✅ | MVP-D (manual handoff, no API) |
| IB-J / MB-9 | Bookings & services | P1 / CR | Owner | Bookings | OpsContext, BookingSheet | deposit, reschedule, cancel | ✅ | D43/D44 · calendar sync later |
| IB-K / MB-10 | Leads, contacts, consent, CRM | P1 | Owner | Audience | LeadFormBlock → Audience | consent recorded | ✅ | D45 · custom form builder via Forms add-on (D79) |
| IB-L / MB-12 | Automations | P1/P2 | Owner | Automations | AutomationBuilder | test runs only | ✅ | D46 · real sending is engineering |
| IB-M / MB-7 | Custom domains | P1 | Owner | Domains & QR | DomainsContext | simulated checks | ✅ | D62 |
| IB-N / MB-19 | Plans, billing, entitlements | P0 found. | Owner | Settings → Plan & billing | BillingContext | test mode | ✅ | D65, D68 · prices are example figures |
| IB-O / MB-14 | Super-admin OS | P0 basic | Staff | /admin | pages/admin/* | — | 🟡 | 8 of 17 areas (D75b) |
| IB-P / MB-18 | Modules & marketplace | P0 found. / P2 | Owner/Staff | Extensions, Templates | MarketplaceContext | install, pause, rollback | ✅ | D67, D70 · curated only |
| IB-Q / MB-11 | AI copilot (propose → approve) | P1 | Owner | Canvas, onboarding | AiPageSetupDialog, BlockSuggest | AI preview, credits | 🟡 | D63 · rule-based simulation; no Voice-to-Store |
| IB-R / MB-21 | Security, privacy, trust | P0 | All | Settings → Privacy, legal pages | — | — | 🟡 | Privacy settings built; legal pages D78; backend security is engineering |
| IB-S / DP-7 | Accessibility & performance (WCAG 2.2 AA target, 44px targets, alternatives to drag) | P0 | All | All | useFocusTrap, announce, SkipLink | — | 🟡 | Batch 7 code audit done (D76); automated + device testing open |
| IB-T / DP-X | Trust & safety: report, appeal, suspension | P0/P1 | Visitor/Owner | Report dialog, Moderation | ReportPageDialog, AdminModeration | takedown, suspended | 🟡 | D75b · appeals process page D78 |
| IB-U / DP-8 | NGN, local phone formats, African market fit | P1 | Owner | Product, WhatsApp | formatNgn, phone validation | — | 🟡 | Multi-currency later |
| IB-V / MB-A1 | IntentFlow | P2 | Owner | Visibility tab, IntentFlow | SourceRuleFields | live, paused, rolled back | ✅ | D64 |
| IB-W / MB-A3 | DealRoom | P2 | Owner | Spaces, DealRoom panel | utils/dealRoom | drop, group goal, refunds | ✅ | D54 |
| IB-X / MB-A4–5 | Trust Passport, Proof-of-Work | P2 | Owner | — | pages/Proof.tsx, pages/ReviewSubmit.tsx, components/blocks/ProofBlock.tsx | empty, verified, hidden, rating-only | 🟡 | Proof-of-Work built (D91); Trust Passport later |
| IB-Y / MB-A8 | Local fulfilment layer | P2 | Owner | FAQ copy only | — | — | ⬜ | Later |
| IB-Z | Developer API | P2 | Dev | — | — | — | ⬜ | Later |
| MB-A6 | Voice-to-Store | P2 | Owner | — | — | — | ⬜ | Batch 5 concept |
| MB-A13 | Offline-to-online QR identity | P1 | Owner | Domains & QR | QrDesigner | tracked scans, fallback | 🟡 | D62, D71 · printed identity kit (cards, stickers) not designed |
| MB-A14 | Micro-website mode | Later | Owner | Pages panel | multi-page sites | — | 🟡 | D48 · vertical site kits not designed |
| MB-A17 | Lightweight mode / low bandwidth | P0 | Visitor | Public page | lazy images, no heavy motion | — | 🟡 | Dedicated low-data profile later |
| DP-9/10 | Honest microcopy & mock data labelling | P0 | All | All | IllustrativeTag, demo notes | — | ✅ | MVP-D |
| DP-11 | Every control works, is marked illustrative, or disabled with reason | P0 | All | All | Menu reasons, PlanLock, tooltips | — | ✅ | MVP-D |
