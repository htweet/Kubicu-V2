# KUBICU — Handoff for Claude (or any AI / engineer continuing this project)

Last updated: 6 Nov 2026 · Decision register at **D560** (next number: **D561**). **Account mode (engineering brief, 6 Nov):** Batch 1 (D529–D548) and Batch 2 AI runs and approvals (D549–D553) are built behind the `authMode` Controls switch, with draft translations in all seven languages (only sample run content stays English); read `docs/ACCOUNT_MODE_HANDOFF.md` first — it lists every component, its state props and the one file (`utils/accountModeSim.ts`) to replace with the API client. Batch 2 field names are provisional (`types/aiRuns.ts`). The staff console is no longer being translated (owner's decision, D502). Gap audit, traceability matrix and prototype status refreshed through D481; Copilot docs through D522.

> **For the lead engineer — start with §18a.** Copilot is now KUBICU's front door (D520): a general assistant whose main job is building pages. Its screens, data shapes, page builder, limits and safety rules are built to survive the switch to a real AI model; only the rule-based conversation logic (`respond` in `utils/copilot/engine.ts` and its helpers) is replaced. The full contract is **`docs/COPILOT_AI_INTEGRATION.md`** (D522).

> **What changed since D522 (read §16 and §17):** the floating Copilot bar got a multi-colour sweep around its edge that runs at random intervals until someone uses the bar, pauses after use and returns at a calmer pace, now 2 px wide (D523–D527; a colour inversion was tried and reverted, D526/D528). **Account mode** from engineering's 6 Nov brief — Batch 1: Confirm it's you, team, invites shown once, accept invite, ownership transfer, team policies, archive workspace, Sign out everywhere, verified activity log, AI credits on hold (D529–D548); Batch 2: AI runs and approvals as Automations · Runs · Approvals tabs, with three new account-only permissions (D549–D553) — all behind `authMode = account`, documented in `docs/ACCOUNT_MODE_HANDOFF.md`. Automations: your automations and recipes share one tabbed area (D554–D555). Fixes: Account → Preferences was blank (missing import, D556); new-workspace preview now changes with "What's your page for?" (D557). **Phones:** everything on marketing, company and legal pages between the hero and the closing call to action folds into header-style bars in each block's colour (D558–D559, `hooks/useMobileSectionBars.ts`); Home's "Sell, book and get paid." is now "Sell anything and get paid." (D559).

> **What changed from D452 to D522 (read §16 and §17):** sponsorship disputes, evidence, staff queue and appeals (D453–D464); operations can switch every module and add-on on or off (D464), change ~100 example figures, plan names and any English wording (D465–D469), and search the staff console (D472); module switches reach published pages (D470); staff manage a workspace's team and country (D473); teammates limited to one location, with batches and expiry dates per location (D474–D478); a **country rollout switch** so countries open one at a time starting with Nigeria (D494–D495); buyer-facing translation finished on sellers' pages, including dates, times and checkout problems (D479–D481, D502–D513); 13 staff screens translated, the rest stay English by choice (D483–D502); leftover fixes — bookings auto-decline and CSV, Twi date fallbacks (D514); canvas drag from the library into sections, copy/paste buttons, smarter paste (D515–D517); Copilot understands typed replies in all eight languages (D518), the WhatsApp demo is translated (D519), Copilot answers questions about KUBICU with links (D520) and from every Help centre guide (D521); Copilot AI integration guide (D522).

> **What changed since D430 (read §16 and §17):** KUBICU bills sellers in their own currency at the day's rate (D432); M-Pesa, Ghana's three mobile money networks, instant EFT and per-country payout flows (D433); twelve Kenyan, Ghanaian and South African starter pages (D434); and the whole of blueprint **Phase 5** — tax across countries (D435), cross-border delivery with customs tracking (D436, D451), branches and franchises (D437), Xero/Sage accounting including wallet payouts (D438, D452), enterprise sign-on and activity-log exports (D439), Odoo/SAP/Sage X3 inventory sync (D440), a creator sponsorship marketplace (D441), and NFC tags with their own Analytics source (D442–D443). Every new screen has drafts in all seven languages (D444–D450). All of it is simulated and unopened in a browser.

> **What changed from D351 to D430:** four selling countries (Nigeria, Kenya, Ghana, South Africa) with their own currency, phones, banks, regions, payment options and seller verification; three more interface languages (Kiswahili, Twi, isiZulu) drafted across the whole app, canvas, website and Copilot; the public website converts every naira amount to the visitor's language's currency at example rates; a floating "Ask me anything" Copilot bar on most pages; one content width for workspace pages; and two rounds of accessibility fixes.

> **⛔ Do not deploy this prototype.** It runs entirely in the browser: roles, prices, balances, codes and payments are simulated and can be changed by anyone. Before writing any production code, read **`docs/NOT_FOR_PRODUCTION.md`** — what to remove, what to replace, what must move to the server, and the release gate.
Built in Magic Patterns: React 18 + TypeScript + Tailwind CSS v3, standalone files, no framework, everything runs in the browser.

**Read this file first.** It is the single entry point. It explains what KUBICU is, how to run and extend the code, the rules every change follows, what is real vs simulated, how every other doc relates (and which are out of date), what the blueprint asked for vs what exists, and everything still open. Where this file and an older doc disagree, **this file and `DESIGN_DECISION_REGISTER.md` win**.

---

## Contents
1. What KUBICU is
2. Getting it running
3. The document set — what each file is, and how current it is
4. Blueprint coverage — asked for vs built
5. Code map
6. Routes
7. State, persistence and storage keys
8. Accounts, workspaces, roles and the staff console
9. Plans and feature gating
10. Simulation switches (the Controls panel)
11. Design system and visual rules
12. Translation system
    12a. Countries, currency and money on the website
13. Real vs simulated
14. How to do common tasks (recipes)
15. Rules every change follows
16. Decision history at a glance
17. Open items — everything not finished
18. Production engineering still required
    18a. Copilot and the AI model — what survives, what's replaced
19. Handover package — every doc to give Claude
20. Working checklist

---

## 1. What KUBICU is

A phone-first page builder and business operating kit for African creators and small businesses — selling from Nigeria, Kenya, Ghana and South Africa today (D352 onwards), with Nigeria the most complete. A seller builds pages on a **canvas** (published at `kub.icu/<handle>`; in the prototype at `/p/<handle>`), then sells, takes bookings, manages contacts, automates follow-ups, tracks analytics, shares short links and QR codes, connects domains, works with partners, books deliveries, and gets help from an AI **Copilot** that drafts a page from a chat. Naira, WhatsApp, bank transfer and local languages are first-class.

It is a **high-fidelity interactive prototype**. All state lives in the browser (`localStorage`). Payments, couriers, messaging, AI, DNS and anything needing a server are simulated and labelled as such in the UI. It is design-complete for the blueprint's scope, not production software (see §18).

Surfaces:
- **Public website** — marketing, pricing, features, solutions, templates, Marketplace, Copilot, AI, developers, help, trust, legal.
- **Workspace app** (`/app/*`) — sidebar shell, canvas editor, and every business screen.
- **Visitor pages** — a seller's public page, shop, short links, checkout, order tracking, tickets, courses, invoices, door check-in.
- **Copilot** — standalone chat that drafts a page; WhatsApp simulation.
- **Staff console** (`/admin/*`) — KUBICU's internal operations (English only).

Five strategic pillars from the Linktree-parity brief, all built: **Creator pages, Marketplace, Short links & QR, Audience Manager**, plus the canvas/commerce core.

---

## 2. Getting it running

- **In Magic Patterns:** it just runs. The platform supplies Vite and Tailwind; `package.json` has no `scripts` block on purpose.
- **Outside Magic Patterns (export):** create a Vite React-TS project, copy all files, keep `index.tsx` → `App.tsx`, install the dependencies below plus `tailwindcss@3 postcss autoprefixer`, keep `tailwind.config.js` and `index.css` as they are, and serve with `BrowserRouter` history fallback (all routes are client-side).
- **Dependencies** (`package.json`): react 18.3.1, react-dom 18.3.1, react-router-dom 6.30.2, lucide-react 0.577.0, framer-motion 11.18.2, @radix-ui/react-icons 1.3.2, date-fns 4.1.0, tailwind-merge 2.6.1, sonner 1.7.1, recharts 2.15.0, qrcode-generator 1.4.4, jsqr 1.4.0. Add new packages to `package.json` with exact versions; keep React on 18.
- **`index.css` order is critical:** Google Font `@import url()` lines first, then the three Tailwind v3 imports (`tailwindcss/base|components|utilities`), then everything else. Never delete or reorder the Tailwind imports.
- **`index.tsx` must render a bare `<App />`** (no wrappers) or the Controls panel stops working (§10).
- **Reset to a clean state:** clear `localStorage` keys starting with `kubicu.` (and `sessionStorage` for the staff session and cart). The demo workspace reseeds on load.
- **Get into the staff console:** go to `/admin` directly (there is no link from the app). Sign in as a seeded staff email (e.g. `tolu@kub.icu`), any password of 8+ characters, and any 6-digit code except `000000`. Session lasts 8 hours (sessionStorage).
- **Sign in to the app:** any email and non-empty password (client-side only). Demo workspace: **Adaeze Atelier** (`ws_adaeze`).

---

## 3. The document set

All in `docs/`. Markdown files are long — grep headings (`^#+ `) or keywords and read slices; don't read them whole.

### 3.1 The four core tracking docs (what you'll see listed together)

| File | What it is | How entries look | Current up to | State |
| --- | --- | --- | --- | --- |
| `DESIGN_DECISION_REGISTER.md` | **Source of truth.** Every product/design decision in order, newest first. Code comments cite these as `(D123)`. | `ID \| Decision \| Current position \| Status \| Notes / dependency`. Status: Confirmed · Proposed · Illustrative · Needs validation · Pending founder. Sign-off log at the top; "Known conflicts recorded" at the bottom. | **D522** | Current. Add every change here. |
| `DECISIONS_FOR_SIGNOFF.md` | Extract of decisions needing founder/legal approval, grouped A–E: **A** money, limits and example figures · **B** legal wording · **C** needs a real provider/backend · **D** translations · **E** product/design (no action needed). | Group tables of D-numbers with one-line summaries. | **D343** (status note) | Refreshed 30 Oct: status table at the top says A confirmed (D233), B/C/D open, and lists items added since D232. Group tables below are historical. |
| `DESIGN_GAP_AUDIT.md` | Periodic audit of everything still open across screens, blueprint concepts, simulated features, founder items and the backlog epics. | §1 Summary · §2 Screens · §3 Blueprint addendum · §4 Simulated by design · §5 Waiting on founder/legal · §6 Backlog audit · §7 Everything still open · §8 History. | **D343** | Refreshed 30 Oct: D274–D343 re-audit note, §7 updated. §17 here is the fuller list. |
| `DESIGN_TRACEABILITY_MATRIX.md` | Traces each requirement from the Master Blueprint (MB-x), Implementation Backlog (IB-x), Design Plan (DP-x) and Linktree brief (LP-x) to screen, component and prototype status. | Columns: Req ID · Requirement · Priority · Role · Screen/flow · Component · States · Prototype · Disposition. Prototype: ✅ interactive · 🟡 partial · ⏳ placeholder · ⬜ not started; 🧪 = simulated by design; 👤 = waiting on sign-off. Disposition: MVP-D / Later-D / Concept / Clarify / Excluded. | **D343** | Refreshed 30 Oct: IB-O corrected, "Added after D273" section. 6 rows remain 🟡 (§4.2). |

### 3.2 Source briefs (static — the "why"; never edit, only read)

| File | Purpose |
| --- | --- |
| `KUBICU_MASTER_BLUEPRINT.md` | Full product, market, architecture and roadmap blueprint (§0–29 + Brand/Concept Addendum with 20 future concepts at ~L1607–1703). §23 is the Phase 0–5 roadmap; §28 lists follow-on docs for AI teams. |
| `KUBICU_IMPLEMENTATION_BACKLOG.md` | Phased delivery plan, EPIC A–Z (~L184–632), release definition, QA gates, first 10 tickets. §4 lists what must NOT block MVP. |
| `KUBICU_MAGIC_PATTERNS_MASTER_DESIGN_PLAN.md` | UX and visual direction charter, screen families (§6), required design deliverables (§14, ~L1250–1267), coverage-report rule (~L1340). |
| `KUBICU_LINKTREE_PARITY_AND_UPGRADE_MAGIC_PATTERNS.md` | Brief for Creator pages, Marketplace, Short links, Audience Manager and the mega menu; deliverables §13, acceptance criteria §14. |

### 3.3 Area registers and specs (point-in-time — check the register for later changes)

| File | Covers | Last ref | Note |
| --- | --- | --- | --- |
| `PROTOTYPE_STATUS.md` | Batch-by-batch acceptance checklist, honest limits, founder questions | ~Batch 14 | Stale: says canvas translation is on hold (done D292–D317). |
| `SCREEN_INVENTORY.md` | Screen families → status | early batches | Stale for D268+ screens; §6 routes here are authoritative. |
| `ACCESSIBILITY_REPORT.md` | D76 audit + addendum for Batches 8–12, manual test checklist | Batch 12 | Stale for Copilot, translation, D342/D343 UI. |
| `PLAN_MATRIX.md` | Plans × features | D101 | Code (`data/planMatrix.ts`) is newer. |
| `BLOCK_REGISTER.md` | Block picker inventory | D173 | Missing `faqAssistant` (D342); Planned shelf now empty. |
| `COMPOSITION_SPEC.md` | Canvas layout and container rules | D174 | §7 "can't drag into a container" is stale — built D180/D191. |
| `THEME_REGISTER.md` | 24 Signature themes (+ classic) | D165 | |
| `TEMPLATE_REGISTER.md` | Elite (24) + Artwork templates | D158 | |
| `COMMERCE_UPGRADE.md` | Commerce settings, payment links, sales report | D226 | |
| `EXTENSION_REGISTER.md` | Kept / not built / retired Marketplace add-ons | ~D130s | |
| `COPILOT_SPEC.md` | Copilot chat, brief, drafting, claim, sidebar chats, languages, questions about KUBICU | D522 | Current. |
| `COPILOT_AI_INTEGRATION.md` | **Lead-engineer guide:** what to keep and replace in Copilot, the model contract, tools, grounding, languages, acceptance tests, safety | D522 | Current. Read with `AI_ASSISTANT_INTEGRATION.md`. |
| `AI_ASSISTANT_INTEGRATION.md` | How to swap the canvas page assistant's rules for a real model | — | Engineering guide; still valid. Copilot has its own guide (above). |
| `PUBLIC_SITE_REGISTER.md` | Website routes and listings | D268 | D343 resolved its "website short-link clicks not counted" note. |
| `CLAUDE_HANDOFF.md` | This file | D522 | Current. |

---

## 4. Blueprint coverage — asked for vs built

### 4.1 Required design deliverables (Design Plan §14)

| # | Deliverable | Where it lives | Status |
| --- | --- | --- | --- |
| 1 | Design system | `index.css`, `tailwind.config.js`, `components/ui/*`, `components/design-system/*`, live at `/admin/design-system` | ✅ |
| 2 | Full screen inventory | `SCREEN_INVENTORY.md` + §6 here | ✅ (doc stale) |
| 3 | Traceability matrix | `DESIGN_TRACEABILITY_MATRIX.md` | ✅ |
| 4 | Responsive layout set | `docs/RESPONSIVE_LAYOUT_SET.md` | ✅ (D347) |
| 5 | Canvas interaction spec | `docs/CANVAS_INTERACTION_SPEC.md` (+ `COMPOSITION_SPEC.md` for layout rules) | ✅ (D346) |
| 6 | Core user flows | `docs/CORE_USER_FLOWS.md` | ✅ (D345) |
| 7 | Super-admin OS | `pages/admin/*`, `components/admin/*`, `data/adminNavigation.ts` | ✅ built, no standalone spec |
| 8 | Component state library | `docs/COMPONENT_STATE_LIBRARY.md` + live galleries `ControlGallery.tsx`, `FeedbackGallery.tsx`, `DataGallery.tsx` (at `/admin/design-system`) | ✅ (D348) |
| 9 | Prototype | The app | ✅ |
| 10 | Decision register | `DESIGN_DECISION_REGISTER.md` | ✅ |
| 11 | Visual QA checklist | `docs/VISUAL_QA_CHECKLIST.md` | ✅ (D350) |
| 12 | Handoff notes | This file | ✅ |

### 4.2 Traceability matrix rows still 🟡 partial (IB-O super-admin was corrected to ✅🧪 on 30 Oct)
- **MB-5.2** block `dataBindings` — content binds to Commerce/Bookings in practice; the generic binding model isn't formalised.
- **MB-5.4** validation — payment and domain checks exist inside those modules, not in the publish check for every case.
- **IB-R / MB-21** security, privacy, trust — privacy settings and legal pages built; backend security is engineering work.
- **IB-S / DP-7** accessibility and performance — code audit done; automated and device testing open.
- **IB-T** trust and safety — report, appeal, takedown built; real moderation tooling is backend.
- **IB-U / DP-8** local formats and languages — four drafted languages; native review pending.
Rows marked ✅🧪 are built but simulated (payments, couriers, developer API, Mailchimp/Sheets sync, menu analytics, bot filtering).

### 4.3 Blueprint roadmap (§23) vs prototype
- **Phase 1 MVP** (canvas, publishing, analytics, domains, billing, one gateway) — designed and interactive; gateway not chosen.
- **Phase 2 Commerce & bookings** — designed and interactive.
- **Phase 3 Growth & automation** — designed and interactive (audience, automations, IntentFlow, opportunities, Copilot).
- **Phase 4 Marketplace & ecosystem** — Marketplace, developer page, keys, webhooks and sandbox are **simulated**; no real public API, SDK or partner review pipeline.
- **Phase 5 Africa-wide / enterprise** — SSO, workspace currency and USSD designed; multi-country tax, multi-location/franchise, ERP connectors, cross-border fulfilment **not designed**.

### 4.4 Deliberately out of MVP (Blueprint ~L649–660, Backlog §4)
Native mobile apps · general-purpose free-grid website builder · complex marketplace revenue sharing · own logistics fleet · AI publishing without approval · multi-country tax engine · advanced affiliate network · community social network · third-party executable plugins · every payment provider. Don't build these without a founder decision.

### 4.5 Follow-on docs the blueprint (§28) asks AI teams to write — none exist yet
`KUBICU_PRODUCT_REQUIREMENTS.md`, `KUBICU_UX_UI_MASTER_SPEC.md`, `KUBICU_TECHNICAL_ARCHITECTURE.md`, `KUBICU_DATABASE_ERD.md`, `KUBICU_SUPER_ADMIN_SPEC.md`, `KUBICU_MARKETPLACE_SPEC.md`, `KUBICU_AI_AUTOMATION_SPEC.md`, `KUBICU_COMMERCE_PAYMENTS_SPEC.md`, `KUBICU_SECURITY_PRIVACY_COMPLIANCE.md`, `KUBICU_TEST_STRATEGY.md`, `KUBICU_DEPLOYMENT_OPERATIONS.md`. (Only `KUBICU_IMPLEMENTATION_BACKLOG.md` exists.) These are engineering-phase documents; the `types/` folder is the best current source for the data model.

---

## 5. Code map

```
App.tsx         routing, providers, Controls props (only)
index.tsx       createRoot(...).render(<App />)
index.css       fonts → Tailwind → theme variables and global classes
pages/          129 files — one per route (admin/, auth/, bookings/, commerce/, copilot/, domains/, forms/, marketing/(marketplace/), settings/)
components/     ~717 files in ~65 folders: blocks/ (one renderer per block type), canvas/ (+inspector/), commerce/, audience/, copilot/,
                marketing/, settings/, admin/, ui/ (+layout/), kyc/, design-system/, shell/ …
contexts/       30 providers
hooks/          59 hooks (one per feature store, plus useLocalStore generic persistence)
data/           181 files — registries, seed/sample data, plans, permissions, legal/, help/, examples/, translations*.ts
types/          35 files — the data model (page.ts, ops.ts, commerce.ts, analytics.ts, team.ts, …)
utils/          200 files — pure logic by domain (admin/, ai/, analytics/, commerce/, copilot/, domains/, forms/, media/, money/, ops/, providers/, account/ …)
docs/           see §3
```

### 5.1 Key files by area
- **Blocks:** type union and `BlockContentMap` in `types/page.ts`; definitions in `data/blockRegistry.ts`, `blockRegistryStory.ts`, `blockRegistryRound2.ts`; categories/synonyms in `data/blockTaxonomy.ts`; renderers `components/blocks/*` wired in `BlockRenderer.tsx`; inspector fields `components/canvas/inspector/*` routed from `ContentFields.tsx`; summaries and cloning in `utils/blocks.ts`; checks in `utils/validation.ts`, `utils/storyBlockChecks.ts`.
- **Canvas:** `components/canvas/*` (DesktopEditor, MobileEditor, BlockLibrary, BlockFrame, Inspector, CompositionPanel/Check tab, PublishDialog, VersionHistory, CommandPalette, VoiceToContentDialog); state, undo and insert in `hooks/useEditorStore.ts`; composition checks `utils/compositionCheck.ts`.
- **Themes/templates:** `data/themes*`, `data/examples/` (+`elite/`), theme gallery components.
- **Commerce:** `pages/commerce/*`, `components/commerce/*`, `utils/commerce/*`, money/escrow in `utils/money/*`.
- **Audience/automations/forms:** `components/audience/*`, `types/ops.ts`, `utils/ops/*`, `utils/forms/*`.
- **Analytics:** `utils/analytics/storage.ts` (`appendEvent`, retention `prune()`), `utils/analytics/aggregate.ts` (page visits = `view` events only; campaign stats also count website/WhatsApp short-link clicks, D343), `utils/analytics/track.ts`.
- **Domains, QR, short links:** `pages/domains/*`, `utils/domains/*`.
- **Copilot:** `pages/copilot/*`, `components/copilot/*` (+claim/, whatsapp/), `hooks/useCopilot.ts` (send, photos, generation loop, limits), `contexts/CopilotSimContext`. Logic in `utils/copilot/`: `engine.ts` (`respond` — the conversation, the one function a model replaces; `planFor`/`briefFrom`/`draftDocFrom` build the page through `utils/assistant/layout.ts`), `store.ts` (sessions, drafts, limits, pins, claim), `claim.ts`, `links.ts`, `translateMessage.ts` (stored English → screen language), `understand.ts` (typed words in seven languages → English hints, D518), `askAnything.ts` (question vs build, curated topic, best Help centre guide, D520–D521). Words: `data/copilotQuestions.ts`, `data/copilotUnderstanding.ts`, `data/copilotHelpTopics.ts` (17 topics with answer + screen links). Ask bar: `components/shell/AskBar.tsx`. **Before changing any of this, read `docs/COPILOT_AI_INTEGRATION.md`.**
- **AI (rule-based):** `utils/ai/*`, `utils/assistant/*`, `utils/faqMatch.ts`, `hooks/useAiUsage.ts`, limits `data/aiLimits.ts`.
- **i18n:** `contexts/LocaleContext.tsx`, `data/translations*.ts`, `utils/builtPhrases.ts`, `utils/phraseOverrides`.

### 5.2 Canvas interaction summary
Full behaviour, states and open questions: **`docs/CANVAS_INTERACTION_SPEC.md`** (D346). Short summary:
Left panel tabs: Blocks · Layers · Pages · Templates · Check. Right panel: selected block (Content · Style · Behaviour · Visibility) or Page (Page settings · Theme). Top bar: back, page switcher, panel toggles, focus mode, undo/redo, four preview widths, search/command palette, version history, language picker, Preview, Publish. Blocks are added at the insertion point shown in the library; containers (Section, Columns, Tabs) accept children by drag or "Move into"; layers support reorder, group, lock, hide, rename. Publish runs blocking checks (contrast, required fields, links) and shows non-blocking suggestions. Phones use `MobileEditor` with a bottom tab bar and slide-up panels. All edits are undoable; Voice to content inserts in one undo step.

### 5.3 Core flows
Full step-by-step flows with branches, failure states and owning files: **`docs/CORE_USER_FLOWS.md`** (20 flows + flow map, D345).

---

## 6. Routes (from `App.tsx`)

There are **no router-level auth guards**; access is simulated with App props and checked in components (`useCan`, `planAtLeast`, `AdminShell` staff gate).

- **Public website** (inside `MarketingLayout`): `/`, `/templates`, `/templates/:id`, `/pricing`, `/ai`, `/about/help/:articleId`, `/about/:topic` (help, trust, about, contact, roadmap, report, legal pages), `/developers`, `/copilot`, `/for/creators`, `/for/:segment`, `/marketplace`, `/marketplace/apps`, `/marketplace/categories/:category`, `/marketplace/:slug`, `/tools/short-links`, `/features/audience-manager`, `/features`. Redirects: themes → `/templates?tab=themes`, blocks → `/marketplace/categories/blocks`, resources → `/about/help`.
- **Copilot** (no shell): `/copilot/chat`, `/copilot/whatsapp`, `/d/:id`, `/copilot/continue`.
- **Auth:** `/signup`, `/signin`, `/reset`, `/verify`, `/start`, `/invite/:token`.
- **Workspace** (inside `AppShell`): `/app` (Overview), `spaces`, `canvas`, `media`, `bookings` (+services, availability), `audience`, `automations`, `forms`, `forms/:formId`, `commerce` (orders, products, inventory, digital, discounts, storefront, payments, wallet, verification, payment-links, subscriptions, courses, gift-cards, events, events/:eventId/guests, events/:eventId/check-in, reports, settings), `analytics`, `intentflow`, `domains`, `qr`, `print-kit`, `links`, `links/:id`, `extensions`, `templates`, `opportunities`, `services` (Service OS), `proof`, `deliveries`, `whatsapp`, `trust`, `coach`, `collabs`, `voice`, `account/:tab?`, `settings/:tab?`, `*` NotFound. Outside the shell: `/app/canvas/:pageId` (editor), `/app/assistant`.
- **Visitor pages:** `/p/:handle`, `/p/:handle/shop`, `/p/:handle/shop/:productId`, `/p/:handle/s/:slug` (short link), `/p/:handle/trust`, `/p/:handle/work/:id`, `/p/:handle/:pagePath`, `/p/:handle/order/:orderId`, and under `/p/:handle/`: `download/:token`, `ticket/:ticketId`, `learn/:courseId`, `booking/:bookingId`, `subscription/:token`, `preferences/:contactId`, `quote/:quoteId`, `invoice/:invoiceId`, `review/:token`, `pay/:slug`, `protect/:orderId`. Top level: `/m/:slug` (shared shop), `/status`, `/partner/:token`.
- **Staff console** (inside `AdminShell`): `/admin` overview, design-system, modules, tenants, pages, orders, reporting, data-requests, staff, appeals, flags, moderation, support, audit, health, payments, escrow, plans, ai, notifications, settings.
- **Legacy:** `/design-system`, `/spaces`, `/canvas/:pageId`, `/:module`, `*` → `LegacyRedirect`.

---

## 7. State, persistence and storage keys

Provider order (outer → inner): `LocaleProvider` → `MotionConfig` → `BrowserRouter` → `CopilotSimProvider` → `AppearancePolicyProvider` → `WorkspaceProvider` → per-workspace scope (`DirectionProvider` → `PlanProvider` → `TeamProvider` → `AnalyticsProvider` → `DomainsProvider` → `MediaProvider` → `LibraryProvider` → `CommerceProvider` → `OpsProvider` → `EditorProvider` (remounts per space) → `BillingProvider` → `UpgradeProvider` → `MarketplaceProvider` → `NotificationsProvider`). Background effects: `DealRoomSettler`, `SubscriptionRenewer`, `InstalmentCharger`. App-wide: `AppToaster` (sonner), `LiveAnnouncer`.

All keys start with `kubicu.`; workspace-scoped stores append `.<workspaceId>`. Each key has one owner util/context.
- Workspace: `workspaces`, `workspace.current`, `space.current`, `demoSeed` (`contexts/WorkspaceContext.tsx`, `utils/workspaceStorage.ts`); `editor.v1.<ws>` (page docs, `hooks/useEditorStore.ts`).
- Look: `appearancePolicy`, `appearance.<ws>` (legacy `direction`), `dataSaver`.
- Modules: `library`, `mediaFolders`, `commerce`, `domains` (version 1), `ops`, `analytics` (with `prune()` and a device migration shim), `team`, `billing`, `notifs.<ws>.<member>`, `marketplace`, `shared.<code>`, `forms`, `formRate`, `ai`, `opportunities`, `serviceos`, `kit`/`kit.pending`, `proof`, `money`, `fulfilment`, `whatsapp`, `voice`, `collabs`, `coach`, `printOrders`, `printKit`, `sso` (+`sso.index`), `partnerships`, `developers`, `providers`, `assistant.<ws>.<page>`.
- Global: `account` (personal prefs incl. language), `consent`, `handleClaim.v1`, `members.v1`, `sharedShops`, `extensionSubmissions`, `visitorLang`, `ai.log`, `tabId`, `door.name`, `door.queue.<event>`, `blockShelf`, `templateMarket`, `ticketHolder`, `announcements.dismissed`, `poll.<id>`, `saved.<shop>`, `recent.<shop>`, `help.feedback`, `siteMenuUsage`, `shortDemo.count`, `demoRemovedNotice`, `demoWorkspaceNotice`.
- Copilot: `copilot.sessions`, `copilot.drafts`, `copilot.usage`, `copilot.current`, `copilot.pins`, `copilot.claim`, `copilot.welcome` (`utils/copilot/store.ts`). Pinned chats are never evicted when storage is short.
- Staff: `admin` (whole console state, `utils/admin/store.ts`), `staffNotifs.<staff>`; `staffSession` in **sessionStorage**.
- Cart: `cart.<pageKey>` in **sessionStorage** (`contexts/CartContext.tsx`).
- Generic hook: `hooks/useLocalStore.ts` (cross-tab sync via `storage` events and a `kubicu:store:<key>` event).
- Migrations: `utils/media/migrate.ts` (editor, commerce, library media refs). When changing a stored shape, add a tolerant reader rather than breaking old data.

---

## 8. Accounts, workspaces, roles and the staff console

- **Sign-in** is client-side only (`pages/auth/SignIn.tsx`); SSO is simulated for domains in `utils/sso.ts`.
- **Workspaces:** demo "Adaeze Atelier" (`ws_adaeze`) is seeded. New workspaces can start with labelled demo data (`utils/demoData.ts`, auto-expires after 7 days, removable in Settings → Business).
- **Spaces:** each workspace has a main space plus extra spaces (campaign, event space, fundraiser, pop-up, booking page, members area, co-brand, DealRoom) — `utils/spaces.ts`, `data/spaceKinds.ts`, switched with `SpaceSwitcher`.
- **Roles:** `owner | admin | editor | sales | viewer` (`types/team.ts`); matrix in `data/permissions.ts` (`rolePermissions`, `seatLimits`); check with `useCan(permission, spaceId?)` from `contexts/TeamContext.tsx`. "Viewing as" a role creates a labelled preview member.
- **Staff roles:** `lead | trust | support | finance | engineering` (`data/staffRoles.ts`, `roleCanOpen`). Seeded staff in `utils/admin/store.ts` (tolu@, ifeanyi@, kemi@, dayo@, zainab@ kub.icu). Sensitive staff actions need a second lead's approval.

---

## 9. Plans and feature gating

- Ladder: `free → creator → pro → business → agency → enterprise` (`data/plans.ts`, `planAtLeast()`).
- Feature × plan matrix: `data/planMatrix.ts` (status `live | preview | planned`). Other limits: `utils/commerce/limits.ts`, `data/mediaQuota.ts`, `data/aiLimits.ts`, seat limits in `data/permissions.ts`.
- UI: `components/ui/PlanLock.tsx`, `components/ui/UpgradeButton.tsx`, `contexts/UpgradeContext.tsx` (`openUpgrade({ plan, feature })` → change-plan dialog). Never hide a locked feature silently — show it with the plan it needs.
- Feature flags: `data/featureFlags.ts` (`ai_page_setup`, `storefront`, `verified_tick`), toggled per plan in `/admin/flags`. The same page switches **every workspace module and Marketplace add-on** (D464, `utils/admin/moduleFlags.ts`; off = visible but "Currently not available", reaching published pages via `blockModule`, D470) and the **country rollout** (open / closed / scheduled per country, D494).
- Adjustable figures and names: `data/adjustableFigures.ts`, read with `figure(key)` from `utils/opsSettings.ts`, edited in `/admin/figures` (D465–D469). Plan prices and AI credits stay in Plans & entitlements (two-person approval).
- Plan **prices** are placeholders pending founder sign-off.

---

## 10. Simulation switches (the Controls panel)

`App` props with literal defaults become Magic Patterns Controls: `visualDirection`, `workspacePlan`, `viewingAs`, `simulateNextRenewal`, `copilotWhatsApp`, `copilotFailure`. Requirements: `export function App({ ... })` with destructured defaults; string unions declared in `App.tsx`; `index.tsx` renders bare `<App />`. Don't put prototype toggles in the product UI.

Other switches: demo data (onboarding / Settings), payment test mode strip (`components/commerce/TestModeStrip.tsx`), staff feature flags.

---

## 11. Design system and visual rules

- **Tokens** (`tailwind.config.js` → CSS variables in `index.css`): surfaces `canvas, raised, sunken, overlay, inverse, stage, field`; `line(.strong)`; text `fg(.muted/.subtle/.inverse)`; `action(.hover/.pressed/.fg/.soft)`, `accent(.soft)`, `select(.fg)`; status `success/warning/danger/info(.soft)`; `focus`. Font sizes: display, title, heading, body, label, caption, meta. Radius sm 6 / md 10 / lg 16. Shadows 1–3. Use tokens, never raw palette classes.
- **Visual directions** via `data-direction`: `darkStudio` (default app), `inkCobalt` (light app), `nightMarket` (public site), `kubicuBold` (public site v2). Personal prefs: `data-text-size=large`, `data-motion=reduce`.
- **Fonts:** Inter for UI; seller themes use Fraunces, Instrument Serif, Newsreader, Archivo, Lora, Cormorant Garamond, Bricolage Grotesque (also the website display face, D422).
- **Gradients:** only the reserved `.ai-*` (AI surfaces) and `.nm-*`/brand classes. Nowhere else.
- **Signature themes:** glass layer `.kb-bg/.kb-page`, simplified on phones and in data-saver `.kb-lite`, respects reduced transparency.
- **Components:** `components/ui/*` — Button (variants incl. `ai`, `brand`), Dialog (right-side sheet in workspace; `centered` on public pages, D272), Sheet, Field/TextInput/TextArea/SelectInput, Segmented, InlineAlert, PlanLock, UpgradeButton, ItemListEditor. Toasts via sonner (`AppToaster`).
- **Motion:** framer-motion, ease-out `cubic-bezier(0.23,1,0.32,1)`, ≤300 ms per element, enter from scale 0.96 + opacity 0, stagger 30–60 ms, no `transition-all`, honour reduced motion.
- **Accessibility:** semantic landmarks, labelled inputs, `focus-visible:ring-focus`, `aria-live` for results/toasts (`LiveAnnouncer`), ≥44 px targets, contrast AA (publish blocks failing contrast on seller pages). Shared helpers (D429–D430): `focusFirstError` and `onRadioGroupKeyDown`/`radioTabIndex` in `utils/a11y.ts`, `useScrollLock` (Dialog, Sheet), `useDocumentLang`, `MarqueeToggle` for moving strips.
- **Workspace page width:** every workspace page except the canvas uses the same 1200px column with 20/40px side padding (D397).

---

## 12. Translation system

- Languages (8): English, Naijá `pcm`, Yorùbá `yo`, Hausa `ha`, Igbo `ig`, **Kiswahili `sw`, Twi `tw`, isiZulu `zu`** (D356 onwards). French is listed as "Coming later". Choice is per device (`kubicu.account`), carries across sign-in and workspaces. `<html lang>` follows the screen language on the website and in the workspace via `useDocumentLang` (Twi is written as `ak`); published seller pages set their own (D429).
- **Kiswahili, Twi and isiZulu** live in `data/translationsKeGhZa/*.ts` — one file per pass, rows `[English, sw, tw, zu]` built with `columns()` from `build.ts`, merged in `translationsKeGhZa/index.ts` (add each new file to the `passes` array; earlier entries win). Every app, canvas, website and Copilot file is mirrored (passes 1–55, D356–D426). Localised examples (places, names, dishes, phone numbers, prices) differ from the Nigerian drafts on purpose — see each pass's register row.
- **New strings need drafts in all seven non-English languages**: rows in a `data/translations<Area>.ts` file for pcm/yo/ha/ig, and rows in a `data/translationsKeGhZa/` file for sw/tw/zu. Wording that only shows to sellers in one country (e.g. Kenyan verification) only needs that country's language set (D426).
- **Pickers** (D298/D299): workspace sidebar, phone More sheet, editor top bar, phone editor Page settings ("Editor language"), sign-in/up, Account → Preferences, public website header. Seller public pages keep their own visitor language switch — the themed `VisitorLanguageMenu` (D299), painted in the page's theme. Search (block library, command palette, help centre) also understands everyday words in the screen language via `data/searchGlossary.ts` + `utils/searchGlossary.ts` (D344).
- **Usage:** `const { t: tr } = useT()` from `contexts/LocaleContext`. Keys are the English text; placeholders `{name}`: `tr('Photos received: {n}', { n })`. Shared inputs (TextInput, Field, Button, Dialog title, Segmented, SelectInput, ItemListEditor) translate English labels themselves — pass English.
- **Drafts:** `data/translations*.ts`, rows `[English, Naijá, Yorùbá, Hausa, Igbo]`, merged in `data/translations.ts` (spread new files into all four dictionaries). Latest: `translationsCanvasGaps.ts` (D342), `translationsWebsiteGaps.ts` (D343).
- **Built sentences** (names/amounts): pattern fallback in `utils/builtPhrases.ts` (D341). Prefer `'Label: {value}'` wording.
- **Reviewer overrides:** `utils/phraseOverrides` (D135), managed in the staff console translation review.
- **Status:** every non-English string is an **unreviewed draft** (Group D sign-off deferred).
- **Adding another language.** Language codes are listed by hand in five places — update them all (this is how sw/tw/zu were added):
  1. `data/translations.ts` — `UiLang`, the `translations` map, `uiLanguages` (label + native name).
  2. `contexts/LocaleContext.tsx` — `toUiLang`.
  3. `types/account.ts` — `LanguageId`.
  4. `pages/admin/AdminLocalisation.tsx` — `dictFor`.
  5. `components/canvas/inspector/PageSettingsPanel.tsx` — page language list (Swahili `sw` is already listed there, for sellers' page language only).
  Then: a dictionary per new language for every `translations*.ts` file (export `xxxSw`… alongside the existing four, or one new file per language merged in `translations.ts`; missing keys fall back to English), `data/searchGlossary.ts` words, `utils/builtPhrases.ts` patterns (they look up the dictionary, so they work once phrases exist), the Voice to content speech languages, and font checks for any new characters. Countries also bring non-language work — currency (KES, GHS, ZAR), phone formats, mobile money (M-Pesa, MTN MoMo) and local providers — which is outside translation.
- **English on purpose:** legal document text (English applies; a notice says so), help guide articles (a notice says so — Copilot's guide answers say so too, D521), WhatsApp/customer messages, invoice lines, partnership agreement wording and history, referral terms, 11 staff console areas (13 areas and the frame are translated; owner stopped there, D502), Marketplace listings without a draft.
- **Eight-column files (newer pattern):** `data/translationsCopilotWhatsApp.ts` and `data/translationsCopilotHelp.ts` hold all seven languages in one row (`[English, pcm, yo, ha, ig, sw, tw, zu]`), exported as four Nigerian-language dictionaries plus a `…KeGhZa` object added to `passes`. Either pattern is fine; don't duplicate a key across both.
- **Copilot messages** are stored in English and translated on screen (`translateCopilotText`); typed replies are understood through `utils/copilot/understand.ts` (D518). With a real model this changes — see `COPILOT_AI_INTEGRATION.md` §8.

## 12a. Countries, currency and money on the website

- **Countries** (D352–D355): `types/country.ts` + `data/countries.ts` — NG, KE, GH, ZA, each with currency, dial code and number length, regions and their label, banks, account-number rule, payment options, mobile money, VAT guide, data price per GB, main city. A workspace's country is `workspaceCountry(ws)`; the one on screen is `activeCountry()` (`utils/country.ts`), set by `AppShell`, published pages and the staff console (always NG). Copilot, which has no workspace, sets it from the screen language (`countryForLanguage`, D420).
- **Currency** (D136, D353): one per workspace, no conversion of seller money. `formatNgn` = the active workspace currency (name kept from the naira-only days); `formatNaira` = KUBICU's own prices.
- **Website conversion** (D421, D423): while `MarketingLayout` is mounted in Kiswahili, Twi or isiZulu it sets `setDisplayConversion(KES|GHS|ZAR)`; every naira amount formatted without an explicit currency, `formatNaira`, fixed text through `localiseAmounts`, and "₦…" typed inside example pages (`localiseBlockAmounts` in `PageLayoutView`) show in that currency at **example rates** (₦12, ₦135, ₦85 per unit, `utils/currency.ts`). `setActiveCurrency` clears it, so the app, published pages and staff console never convert. Pricing says the figures are at an example rate.
- **Phones** (D354, D402, D403, D420): `utils/phone.ts` — `splitPhone`, `joinPhone`, `phoneIssue(In)`, `phonePlaceholder`, `findMobileNumber` (free text, any of the four countries, international form). Shared `PhoneInput` has a country-code picker.
- **Seller verification** (D424–D428): `data/kycCountries.ts` holds each country's ID numbers, ID types, registry, documents, tax number, business types, consent, sales bands; `kycRules(country?)` in `utils/money/kyc.ts`. The old field names are kept (`identity.bvn` = main ID number, `identity.nin` = second number, if the country has one) so saved cases load. Cases store their `country`. Payout limits are naira figures shown and enforced in the workspace currency at the example rates. Guest partners' bank step uses their phone's country.

---

## 13. Real vs simulated

**Works for real in the browser:** canvas editing, undo, versions and publish; all validation and composition checks; translations and language pickers; QR generation (`qrcode-generator`) and camera scanning (`jsqr`); speech-to-text via the browser (Voice to content, D342); FAQ assistant matching (`utils/faqMatch.ts`); localStorage persistence and cross-tab sync; analytics aggregation on locally recorded events.

**Simulated (labelled in the UI):** payments, bank transfer, USSD (switched off), card, escrow settlement, refunds' provider side, payouts and KYC checks; couriers and riders; WhatsApp Business messages and the WhatsApp Copilot; email marketing and Google Sheets sync; DNS/SSL and domain purchase; SSO; calendar sync and meeting links; tracking pixels; print orders; all "AI" (rule-based in `utils/ai/*`, see `AI_ASSISTANT_INTEGRATION.md`); **Copilot's whole conversation, its answers to questions about KUBICU (curated topics + Help centre guide matching) and its understanding of other languages** (rules and word lists, see `COPILOT_AI_INTEGRATION.md`); Copilot draft claiming; link safety screening (sample block list); watermarking (preview); data-saver image variants; live presence and multi-door sync; developer API, keys, webhooks and sandbox; analytics only sees this browser.

---

## 14. How to do common tasks

**Add a block type**
1. `types/page.ts`: add to `BlockType` and `BlockContentMap`.
2. Define it (name, description, icon, defaults, looks, plan needs) in the matching `data/blockRegistry*.ts` and its order list; category and synonyms in `data/blockTaxonomy.ts`.
3. Renderer in `components/blocks/<Name>Block.tsx`, wired in `BlockRenderer.tsx` (handle `mode` edit/live and an empty placeholder in edit).
4. Inspector fields in `components/canvas/inspector/<Name>Fields.tsx`, routed from `ContentFields.tsx`.
5. `utils/blocks.ts`: summary line, and fresh item ids in `cloneBlock` if it has lists.
6. Checks in `utils/validation.ts` or `utils/storyBlockChecks.ts`.
7. Drafts for all new strings; register row; update `BLOCK_REGISTER.md`.

**Add a workspace screen:** page in `pages/`, route in `App.tsx` under `AppShell`, nav entry in the sidebar data, permission via `useCan`, plan gate via `planAtLeast` + `PlanLock`, store via a `hooks/use<Feature>` + `kubicu.<feature>.<ws>` key, translations, register row.

**Add a website page:** page in `pages/marketing/`, route under `MarketingLayout`, mega-menu entry if needed, shared hero/title band components, translations.

**Add a setting to a stored record:** make it optional in `types/*`, read defensively, never break old saved data.

**Add translations:** new `data/translations<Area>.ts` with rows; import and spread into `pcm/yo/ha/ig` in `data/translations.ts`. Then a `data/translationsKeGhZa/<area>.ts` with `[English, sw, tw, zu]` rows, added to `passes` in `translationsKeGhZa/index.ts`.

**Add something country-specific:** add a field to `CountryInfo` (`types/country.ts`) and all four rows in `data/countries.ts`, or a rule in `data/kycCountries.ts`; read it via `activeCountryInfo()` / `kycRules()`. Never hard-code Nigerian formats (11-digit phones, +234, naira, BVN/CAC) outside the NG row.

**Swap in a real provider:** keep the UI; replace the simulated util (`utils/providers/*`, `utils/money/*`, `utils/ai/*`) behind the same function signatures; remove the "simulated" label only when real.

---

## 15. Rules every change follows

Product and design
- Design from intent: one primary thing per screen; disclose the rest progressively.
- No card walls, no gradients (except reserved classes), no emoji icons, no decorative blobs, no hover on static containers.
- **Honest by default:** never invent prices, policies, figures, reviews or consent. Simulated things say so ("test mode", "AI preview", "Rule-based, not AI", "Example figures").
- AI drafts, never decides: the seller approves everything; gaps are marked like "[Add your price]".
- Desktop uses its width; 390 px reflows to one column with no sideways scroll; labels never wrap to two lines.
- Workspace dialogs are right-side sheets; public pages use centered dialogs.
- Customer-facing and legal wording stays identical for both parties (don't localise agreements or messages to customers).

Code
- Named exports only; one component per file; files under 500 lines; markup and logic split past ~50 lines of hooks.
- TypeScript without `any`; theme tokens only; `lucide-react` icons with `Icon` suffix.
- Repeated content is one array in `data/`, rendered with one `.map()`.
- Folder homes as in §5 — don't create parallel folders.
- Replace, don't fork: no `V2` files left beside old ones.

Process
- Every change gets the next register row (**D523** next), status "Proposed" until signed off.
- Update any doc you make stale (see §3.3).
- Tell the user plainly what wasn't verified (e.g. not opened in a browser).

---

## 16. Decision history at a glance

| Range | Theme |
| --- | --- |
| D1–D40 | Identity, onboarding, canvas foundations, blocks, layout |
| D40–D100 | Themes, spaces, commerce, bookings, analytics, privacy, accessibility (D76), legal pages (D78), trust & safety |
| D100–D160 | Plans (D101), team, staff console, translations start (D133 series), USSD/currency (D136), calendar (D137), templates (Elite/Artwork D158) |
| D160–D235 | Signature themes (D165), block register (D173), composition (D174, D180, D191), commerce upgrade (D226), sign-off round (D233) |
| D235–D279 | Copilot (D265–D266), public site pillars: Creator pages, Marketplace, Short links, Audience Manager (D268–D273), dialogs as side sheets (D272) |
| D280–D340 | Full translation pass: app, canvas, website, Copilot |
| D284–D290 | Copilot chats in the sidebar; D290 rollback restored original (pinning moves a chat out of Recent; pin icon rebuilt from notes, may differ from version 308) |
| D298–D299 | Language picker everywhere |
| D341 | Sentence patterns for names and amounts |
| D342 | AI FAQ assistant block, Voice to content, composition copy/hierarchy checks, block search in screen language, translated rule badge |
| D343 | Website/WhatsApp short-link clicks counted in campaign stats; hand-filled source and permission for older contacts |
| D344–D351 | Glossary search; the 12 design deliverables and UX/UI master spec |
| D352–D355 | Four countries: country table, currency, phone numbers with a country code, banks and regions |
| D356–D372, D375–D401 | Kiswahili, Twi, isiZulu passes 1–43 (workspace, website, canvas) |
| D373 | Website talks about Africa; sample prices follow the language |
| D374 | Floating "Ask me anything" Copilot bar (`components/shell/AskBar.tsx`) |
| D397 | One content width (1200px) for workspace pages except the canvas |
| D402–D405 | Last Nigeria-only phone fields, price hint, data cost per country, Developers page money line |
| D406–D419 | Translation passes 44–54 (settings, panels, verification, Copilot chat) |
| D417–D418, D422 | Website display font: Inter and Plus Jakarta tried, **Bricolage Grotesque restored** |
| D420 | Copilot and the page assistant accept numbers from all four countries |
| D421, D423 | Website converts naira amounts to the language's currency (example rates) |
| D424–D428 | Seller verification per country; starter payouts and limits; staff review; guest partners; draft legal wording |
| D429–D430 | Accessibility fixes from a code audit (14 items) |
| D431 | Small fixes: Ask bar hidden on sellers' published pages, D430 labels in Nigerian languages, required dropdowns announced, staff review follows the case's country |
| D432 | KUBICU bills in the seller's currency at the day's rate; local invoices and tax; staff Exchange rates screen |
| D433 | M-Pesa, MTN/Telecel/AirtelTigo mobile money, instant EFT, card step, per-country payouts and limits |
| D434 | Twelve country starter pages (Kenya, Ghana, South Africa) and country-first suggestions |
| D435–D436, D451 | Tax across countries; cross-border delivery; customs steps in delivery tracking |
| D437 | Branches and franchises (`pages/commerce/Branches.tsx`) |
| D438, D452 | Xero and Sage accounting; wallet payouts as bank transfers (`components/settings/integrations/AccountingSection.tsx`) |
| D439 | Activity-log exports (CSV, JSON Lines, SHA-256 fingerprint) and combined log; sign-on was already built (D115) |
| D440 | Inventory & ERP: Odoo, SAP Business One, Sage X3 (`ErpSection.tsx`, `utils/erp/sync.ts`) |
| D441 | Creator sponsorship marketplace (`pages/Sponsorships.tsx`, `utils/sponsorships.ts`) |
| D442–D443 | NFC tags (`pages/NfcTags.tsx`, public tap page `/p/:handle/t/:code`) and the `nfc` Analytics source |
| D444–D450 | Translations for every Phase 5 screen in all seven languages; Sponsorships/NFC/Branches layout and side-sheet padding fixes (D445, D447, D450) |
| D453–D464 | Sponsorship disputes: frozen money, one reply, staff queue, 48-hour reply time, evidence files (D463), creator record on applications (D461), fix-and-resend briefs (D460), one appeal decided by a different reviewer (D464) |
| D462 | Order invoices worded by whose tax it is (example wording, needs an accountant) |
| D464 | Every workspace module and Marketplace add-on switchable in Super admin → Feature flags; switched-off modules show "Currently not available" (`ModuleUnavailable`), add-ons can't be installed |
| D465–D469 | **Figures & names** (`/admin/figures`, `data/adjustableFigures.ts`, `figure(key)`): ~100 example figures, plan names, and any English wording (Localisation → English) editable by operations, audited |
| D470 | Module switches reach published pages (`blockModule` in `BlockRenderer.tsx`) |
| D471 | NFC tags orderable in all four countries |
| D472–D473 | Users & tenants: people with several workspaces, staff console search (`AdminSearch.tsx`), staff change a workspace's team, role and country |
| D474–D478, D482 | Teammates limited to one location; Inventory, Orders, Sales report and Wallet follow it; batches, lots and expiry (FEFO) per location; expiry shown to buyers |
| D479–D481 | Shop product page, shop list and cards, cart and checkout translated |
| D483–D501 | Staff console frame and 13 areas translated |
| D484–D486 | Office hours in the visitor's time zone; website sample stats show the visitor's country |
| D494–D495 | **Country rollout switch** (Feature flags → Countries): open, closed or scheduled per country, starting with Nigeria; country-aware Business kits; staff money in each workspace's currency (`utils/admin/workspaceMoney.ts`); every new workspace keeps a country |
| D502 | Staff console translation stopped (owner); buyer-facing leftovers translated |
| D503–D513 | Every published-page block, dates, times, lengths, seat summary, Trust Passport and checkout problems in the visitor's language; "ago" times and month names follow the screen language app-wide |
| D514 | Leftovers: ticket dates, Twi date fallbacks, page assistant phones, bookings auto-decline and CSV |
| D515–D517 | Canvas: drag from the library (into sections/columns/tabs too), Copy/Paste buttons, smarter paste |
| D518–D519 | Copilot understands typed replies in all eight languages; WhatsApp demo translated |
| D520–D521 | **Copilot answers questions about KUBICU** (17 curated topics with screen links, then every Help centre guide), then carries on building |
| D522 | `docs/COPILOT_AI_INTEGRATION.md` — the model contract for the lead engineer; handoff and Copilot docs refreshed |
| D523–D528 | Floating Copilot bar: multi-colour edge sweep at random intervals until used (`AskBar`), resumes after 60 s in view or on leaving the page, calmer 25–45 s pace after first use, 2 px wide; colour inversion tried (D526) and reverted (D528) |
| D529–D548 | **Account mode, Batch 1** (engineering brief): stand-in `utils/auth/realAuth.ts` + Controls `authMode` / `accountSimulation`; Confirm it's you (`StepUpDialog`), shared states, Team members, invites shown once, accept invite, transfer ownership, team policies, workspaces archive, Security sign-out everywhere, verified activity log, AI credits on hold, Settings → Business saving and Workspace details card; three translation passes. Simulated server in `utils/accountModeSim.ts`; see `docs/ACCOUNT_MODE_HANDOFF.md` |
| D549–D553 | **Account mode, Batch 2**: Automations · Runs · Approvals tabs, start-run confirm, runs list, run detail with live timeline and cancel, every end state, approval card and inbox; `workflows.run/approve/admin` (account only); sample runs in `data/aiRunSamples.ts`; field names provisional (`types/aiRuns.ts`); two translation passes |
| D554–D555 | Automations: "Your automations" and "Start from a recipe" as tabs; translations |
| D556 | Fix: Account → Preferences blank (missing `languageOptions` import) |
| D557 | New-workspace live preview shows a goal-matched starter before a starting point is picked |
| D558–D559 | **Phones:** marketing, company and legal pages fold everything between hero and ClosingCta into header-style bars (`hooks/useMobileSectionBars.ts`, CSS "Mobile section bars" in `index.css`, `data-mbar-skip` opts out); headless blocks travel with the bar before them; labels skip aria-hidden text. Home selling band reworded to "Sell anything and get paid." |

---

## 17. Open items — everything not finished

### 17.1 Needs founder or legal sign-off
- **Plan prices** (placeholders).
- **Legal documents** — Draft 1.0, awaiting a lawyer; English text applies (Group B: embed allowlist, disputes/refunds, refund fees, analytics privacy, subscriptions, template sales split, ticketing, members-only wording, partnerships, co-brand, support block, developer submissions, verification, fundraiser, certificates, buyer protection/escrow, AI licence, staff data-request deadline).
- **Translations** — native-speaker review of every draft in seven languages (Group D, deferred).
- **Countries** — a licensed payment partner per country must confirm the Kenyan, Ghanaian and South African verification rules, document names and payout limits (D424–D425); a lawyer must approve the two clauses tagged "[DRAFT — country wording pending legal review, D428]" in Seller terms and Privacy and confirm each country's data-protection basis.
- **Example figures to replace** — exchange rates ₦12/KES, ₦135/GHS, ₦85/ZAR (`utils/currency.ts`, D421/D425) and the day's billing rate (D432); data prices KSh 100, GH₵ 10, R 50 per GB (`data/countries.ts`, D404); KUBICU's local tax rates and local companies on invoices (D432); payout limits and fees per country (D433); tax rates (D435); courier rates and times (`utils/commerce/crossBorder.ts`, D436); default accounting account codes incl. bank 090/1200 (`data/accountingProviders.ts`, D438/D452); the 10% sponsorship fee (D441); NFC tag prices (`utils/nfc.ts`, D442).
- **Copilot** — AI provider and model, data-processing terms for photos and business details in each country, whether and how long chats are stored online (and synced for signed-in users), final AI credit and daily-limit costs, whether question-only use is limited, whether Copilot may read workspace data when signed in, and the per-country "not advice" wording (`COPILOT_AI_INTEGRATION.md` §15).
- **Group A** money/limits was confirmed (D233); `DECISIONS_FOR_SIGNOFF.md` hasn't been updated to say so.

### 17.2 Needs a provider or backend (Group C)
Payment gateway, bank transfer and USSD; payouts and KYC; couriers; WhatsApp Business API and auto-messages; email marketing and Sheets sync; live link screening; file storage (watermarking, downloads); image CDN (data saver); DNS/SSL and domain purchase; SSO; calendar sync; meeting links and live course sessions; tracking pixels; live presence and multi-door check-in; split payments for partners and shared shops; real AI model (assistant, Copilot, Voice-to-Store, Business Coach); speech provider beyond the browser; real accounts and auth; Copilot claim links; server-side analytics and bot filtering; developer public API, OAuth, signed webhooks.

### 17.3 Needs real data
Marketplace "Popular" sort; AI workflow packs (show "Not available yet").

### 17.4 Needs testing (not design work)
- Nothing from D280–D559 has been opened in a browser.
- Account mode (D529–D553): run every page in the test list in `docs/ACCOUNT_MODE_HANDOFF.md` with `authMode = account` and each `accountSimulation` outcome, at desktop and 390 px, keyboard only; then switch back to Browser and run the 8 prototype journeys.
- Phone section bars (D558–D559): check Home, Features, Pricing, a Solutions page, a legal page and Help at 390 px — bar colours and contrast, one label per bar, headless blocks appearing with the right bar, "Jump to a section" links, and pages whose own closing call to action isn't `ClosingCta` (mark it `data-mbar-skip` if it shouldn't fold).
- Copilot questions (D520–D521): try the Ask bar with real questions in each language; check that building still wins, mid-interview answers aren't mistaken for questions, and guide matches are sensible.
- Accessibility fixes D429–D430 came from reading code; test with keyboard, VoiceOver/TalkBack and a scan.
- Every screen in Kiswahili, Twi and isiZulu for wrapping (long words, e.g. isiZulu sign-up steps).
- Browser pass on 32 templates and 35 theme versions, phone and desktop.
- Glass/blur on low-end Android; theme contrast numbers checked on screen; soft status colours in every appearance.
- 320 px / 200% zoom: Products, Orders, Schedule, Automations, IntentFlow, Domains & QR, Media, Templates, staff console, all Copilot screens.
- Screen reader and device tests: camera check-in result, seat map, print-order panel, mention picker, USSD flow, door and tracking pages, embeds, website mega menu and phone menu, required-field announcements, Yorùbá/Hausa/Igbo pronunciation, all Copilot screens.
- Full manual checklist in `ACCESSIBILITY_REPORT.md` (keyboard only, screen readers, zoom, reduced motion, automated scan).
- Transfer, USSD and refund figures on the pay page, Sales report and PDF summary.

### 17.5 Small design items still open
- ~~Form error messages English~~ — done D344. ~~Seller page language switch native select~~ — was already themed (D299). ~~Block search / help search English-only~~ — glossary search D344 (help guide articles themselves stay English).
- Help guide articles are English.
- Marketplace listings with no draft are English.
- Copilot understands typed answers in all eight languages for its everyday words (D518); the WhatsApp Copilot demo follows the chosen language too (D519, `data/translationsCopilotWhatsApp.ts`, one 8-language file).
- Copilot (D520–D521): links to workspace screens assume the person is signed in (Copilot can't see sign-in state); the Ask bar doesn't check the AI operations switch; question matching is by words, so unusual wording can miss a guide. All three are resolved by the model integration (`COPILOT_AI_INTEGRATION.md` §11–12).
- ~~D430 labels in Nigerian languages, `SelectInput required` unused, staff review labels, Ask bar on seller pages~~ — all done in D431 (Ask bar hidden there). ~~Phase 5 not designed~~ — built D435–D443.
- Pinned-chat icon may not match version 308.
- **Account mode open items:** owner to confirm the hidden Security rows (sign-in history, Google/Apple) and the new Workspace details card; the workspace-limit wording is a placeholder (D542); activity-log and AI-credit viewing use stand-in permissions (D541); returning to the same page after signing in again is left to engineering's real sign-in; Batch 2 field names and the live step feed need engineering. Translations: every account-mode string has drafts except sample run names, step descriptions and illustrative-data notes (server content); the members list wasn't checked line by line.
- **Phone section bars:** done on the rendered page (attributes and CSS only), so they need no per-page markup, but any new marketing page should keep one h1 in its hero and an h2/h3 per block so bars get labels.
- **Phase 5 follow-ups still open:** order invoices use example per-country wording (D462) that an accountant must confirm, including thresholds and numbering rules; ERP has no batches/expiry dates, no push of KUBICU stock changes, no product creation (D440); sponsorship disputes exist with a staff queue (D453–D454) with a 48-hour reply time (D455) evidence file names (D463) and one appeal decided by a different reviewer (D464), brands see each creator's identity check and deal record (D461) but there's no minimum audience or audience proof, card payment by brands (D441; staff check new briefs since D459; tracked-link results come from Analytics since D457); NFC tags can't be ordered outside Nigeria or encoded from your own blanks (D442); franchise partners can't sign in to run only their branch, there's no per-branch staff access or delivery from a branch (D437); no scheduled activity exports or live security feed (D439). Daily/hourly auto-syncs only run when the Integrations screen opens.

### 17.6 Docs refreshed on 30 Oct 2026
All ten docs flagged earlier now carry a D343 update note or corrected line: `DECISIONS_FOR_SIGNOFF.md` (status refresh: A confirmed, B/C/D open, new items), `DESIGN_GAP_AUDIT.md` (D274–D343 re-audit, §7 and history), `DESIGN_TRACEABILITY_MATRIX.md` (IB-O fixed, "Added after D273" section), `PROTOTYPE_STATUS.md` (translation passes ticked, after-Batch-14 list, founder items), `COMPOSITION_SPEC.md` §7 (drag into containers, D342 checks), `BLOCK_REGISTER.md` (D342 update), `COPILOT_SPEC.md` (sidebar chats, All chats, translation), `ACCESSIBILITY_REPORT.md` (uncovered screens), `SCREEN_INVENTORY.md` (later screens), `PLAN_MATRIX.md` (source of truth and price conflict). The point-in-time registers (`THEME_REGISTER`, `TEMPLATE_REGISTER`, `COMMERCE_UPGRADE`, `EXTENSION_REGISTER`, `PUBLIC_SITE_REGISTER`) have no known wrong statements beyond what §3.3 notes.
All 12 design deliverables now exist as written docs (D345–D350), rolled up in `KUBICU_UX_UI_MASTER_SPEC.md` (D351)., and the 11 follow-on engineering docs in §4.5.
**Known conflict:** plan prices are "confirmed (D105)" in `PLAN_MATRIX.md` but "deferred by founder" in `PROTOTYPE_STATUS.md`. Treat as not final.

---

## 18. Production engineering still required

**What must not go to production is listed item by item, with file paths and a release gate, in `docs/NOT_FOR_PRODUCTION.md` (D349).** Summary: remove the Controls-panel switches, simulation controls, PrototypeNote banners, simulated people and demo data; replace every simulated provider server-side; move auth, roles, plans, prices, balances, limits and publishing to the server; replace the "any 6 digits" codes and `Math.random()` tokens; keep nothing sensitive in localStorage; don't publish draft legal text, unreviewed translations or example prices.

The prototype is the design reference. To ship, engineering needs: a backend and database (start from `types/` as the data model), real auth and sessions, multi-tenant isolation, server-side publishing and hosting for `kub.icu/<handle>` and custom domains, payment and payout integration with webhooks and idempotency, file/media storage and CDN, server-side analytics and bot filtering, messaging integrations, the AI provider (see `AI_ASSISTANT_INTEGRATION.md` for the page assistant and `COPILOT_AI_INTEGRATION.md` for Copilot), staff console backed by real audit logs, security review, privacy/NDPA compliance review, automated tests, and deployment/operations. The §4.5 follow-on docs are the intended home for these specs.

---

## 18a. Copilot and the AI model — what survives, what's replaced

**Product position (D520):** Copilot is KUBICU's front door — a general KUBICU assistant whose main job is building pages. It answers questions briefly with a link to the screen where the person acts, hands business advice to Business Coach and workspace jobs to the Assistant, and never moves money, refunds, publishes or changes accounts from chat.

**Survives unchanged when a model is connected**
- Every screen: web chat and chat list, sidebar chats, WhatsApp simulation, brief card, progress, preview `/d/:id`, claim flow `/copilot/continue`, the Ask bar.
- The data contract in `types/copilot.ts` (sessions, messages with `replies` and `links`, questions, brief, drafts, inputs).
- Page building: the model fills answers and photo roles; `planFor` → `makePlan` builds valid blocks and themes, so drafts always pass publish checks.
- Limits, expiry, claiming, sensitive-data removal and the honesty rules (no invented prices, reviews, hours or policies).
- Knowledge: Help centre guides (`data/help/*`), curated topics (`data/copilotHelpTopics.ts`), plans, countries and the operations-adjustable figures become the model's grounding.
- Interface translations.

**Replaced:** `respond` and its rule helpers in `utils/copilot/engine.ts` (about four files of logic). **Becomes unnecessary:** `utils/copilot/understand.ts` + `data/copilotUnderstanding.ts` (a model reads all eight languages), the keyword matching in `utils/copilot/askAnything.ts` and the keyword rows in `copilotHelpTopics.ts`, and pre-translated answers. **Added by engineering anyway:** a server endpoint that holds the API key, stores sessions and drafts, enforces limits, validates output and logs to AI operations.

**Reasoning, not pasting:** today Copilot follows rules and quotes guides because nothing in the browser can reason. With a model it understands the question (including follow-ups), retrieves the relevant guides and live settings as reference, and writes its own answer in the person's language — while refusing to state any fee, price, limit or policy that isn't in those sources.

Full contract, tool list, grounding order, language handling, the 18-point acceptance list and red-team tests: **`docs/COPILOT_AI_INTEGRATION.md`**.

---

## 19. Handover package — every doc to give Claude

Give the **whole project** (all code files) plus these docs. Read them in this order.

**1. Start here**
1. `docs/CLAUDE_HANDOFF.md` — this file.
2. `docs/NOT_FOR_PRODUCTION.md` — what must not ship, what to replace, and the release gate (D349). **Read before writing production code.**
3. `docs/DESIGN_DECISION_REGISTER.md` — every decision D1–D522 (source of truth).

**2. Status and what's open**
3. `docs/DESIGN_GAP_AUDIT.md` — open gaps by type (re-audited to D343).
4. `docs/DECISIONS_FOR_SIGNOFF.md` — what needs founder or legal approval.
5. `docs/DESIGN_TRACEABILITY_MATRIX.md` — every requirement → screen → status.
6. `docs/PROTOTYPE_STATUS.md` — batch checklist, honest limits, founder questions.

**3. Source briefs (the "why")**
7. `docs/KUBICU_MASTER_BLUEPRINT.md`
8. `docs/KUBICU_IMPLEMENTATION_BACKLOG.md`
9. `docs/KUBICU_MAGIC_PATTERNS_MASTER_DESIGN_PLAN.md`
10. `docs/KUBICU_LINKTREE_PARITY_AND_UPGRADE_MAGIC_PATTERNS.md`

**4. Area specs and registers**
- `docs/CORE_USER_FLOWS.md` — every main journey step by step (D345).
- `docs/RESPONSIVE_LAYOUT_SET.md` — breakpoints, widths and how every screen type lays out on phone, tablet and desktop (D347).
- `docs/KUBICU_UX_UI_MASTER_SPEC.md` — the UX/UI rollup: principles, navigation, visual language, patterns, content rules, languages, accessibility, and every open UX decision, pointing to the detailed specs (D351).
- `docs/VISUAL_QA_CHECKLIST.md` — the per-screen and release review checklist with a record template (D350). Replaces §20 below.
- `docs/COMPONENT_STATE_LIBRARY.md` — every shared component's variants, states and usage rules (D348).
- `docs/CANVAS_INTERACTION_SPEC.md` — how the page editor behaves: selection, adding, moving, containers, saving, undo, publishing, phone editor, states (D346).
11. `docs/SCREEN_INVENTORY.md` — screens.
12. `docs/PLAN_MATRIX.md` — plans and features.
13. `docs/BLOCK_REGISTER.md` — blocks.
14. `docs/COMPOSITION_SPEC.md` — canvas layout rules.
15. `docs/THEME_REGISTER.md` — themes.
16. `docs/TEMPLATE_REGISTER.md` — templates.
17. `docs/COMMERCE_UPGRADE.md` — commerce.
18. `docs/EXTENSION_REGISTER.md` — Marketplace add-ons.
19. `docs/PUBLIC_SITE_REGISTER.md` — website.
20. `docs/COPILOT_SPEC.md` — Copilot (what it does today).
21. `docs/COPILOT_AI_INTEGRATION.md` — **connecting a real model to Copilot** (keep vs replace, contract, tools, grounding, acceptance tests) (D522).
22. `docs/AI_ASSISTANT_INTEGRATION.md` — connecting a real model to the canvas page assistant.
23. `docs/ACCESSIBILITY_REPORT.md` — accessibility status and manual test checklist.

**5. Content that lives in code (not docs) but Claude must know about**
- `data/legal/` — legal documents (Draft 1.0, awaiting lawyer).
- `data/help/` — help centre articles (also Copilot's knowledge source, D521).
- `data/copilotHelpTopics.ts` — Copilot's 17 curated answers and the screens they link to (D520).
- `data/adjustableFigures.ts` — every example figure operations can change (D465).
- `data/translations*.ts` — Pidgin, Yorùbá, Hausa and Igbo drafts; `data/translationsKeGhZa/` — Kiswahili, Twi and isiZulu drafts.
- `data/countries.ts`, `data/kycCountries.ts` — per-country rules.
- `data/planMatrix.ts`, `data/plans.ts`, `data/permissions.ts` — plans, limits, roles.
- `data/roadmap.ts` — public roadmap.
- `types/` — the data model.

That is 30 docs plus the code. Nothing else in the project is needed to continue.

## 20. Working checklist (short version — the full review is `docs/VISUAL_QA_CHECKLIST.md`)

Before changing anything
- [ ] Read the relevant register rows (grep `D<number>` or the feature name) and the area doc in §3.
- [ ] Find the existing pattern in §5 and follow it.

While building
- [ ] Tokens only; no gradients; no `transition-all`; motion ≤300 ms with ease-out.
- [ ] Every new string has drafts in all seven non-English languages (pcm/yo/ha/ig and sw/tw/zu).
- [ ] Nothing assumes Nigeria: phones, currency, banks, IDs and examples come from the country table.
- [ ] Simulated behaviour is labelled; nothing implies a real provider.
- [ ] Locked features show their plan; permissions checked with `useCan`.
- [ ] Stored shapes stay backward-compatible.

Before finishing
- [ ] Desktop uses its width; 390 px is one column, nothing clipped or scrolling sideways.
- [ ] No label, button or tab wraps to two lines (check long languages).
- [ ] Sibling cards share baselines; text contrast passes against its real background.
- [ ] Keyboard focus visible and in order; results announced.
- [ ] Register row added (next D523); stale docs updated.
- [ ] A new workspace screen or Help centre guide is something Copilot can now be asked about: add a curated topic in `data/copilotHelpTopics.ts` (answer + link) when it's a common question, otherwise the guide is found automatically (D520–D521). Never let Copilot perform money or account actions.
- [ ] Workspace screens respect the country rollout (D494): don't add another entry path that creates a workspace without `country`, and staff money uses `utils/admin/workspaceMoney.ts`, never a cross-currency sum.
- [ ] A new staff area or adjustable thing should be findable from the staff console search (`components/admin/AdminSearch.tsx`, D472).
- [ ] A new block that sells, books or collects through a module gets an entry in `blockModule` in `components/blocks/BlockRenderer.tsx` (D470), so staff module switches reach published pages.
- [ ] A new example figure goes in `data/adjustableFigures.ts` and is read with `figure(key)` (D465), so operations can change it in Figures & names. New text goes through `tr()`, so it can be reworded in Localisation → English.
- [ ] A new workspace module or add-on is automatically switchable in Feature flags (D464); check effects with `market.isActive`, and sidebar/install state with `market.isInstalled`.
- [ ] Every page sits in the 1200px workspace column and every side sheet pads its body (`bodyClassName="px-5 py-6"`) — D445/D450 fixed pages that missed this.
- [ ] New sentences go through `tr()`; shared controls translate their own labels, but plain text, counts and toasts don't (D448). Counts read "Label: n", not English plurals.
- [ ] Anything simulated stays labelled and is listed in `NOT_FOR_PRODUCTION.md`.
- [ ] Tell the user what wasn't verified.
