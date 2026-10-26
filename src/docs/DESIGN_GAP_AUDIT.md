# KUBICU — Design gap audit

_Re-audited 24 Oct 2026 against the code, the decision register (through D149) and every doc in `docs/`. This file is the source of truth for what is still missing. The public roadmap (`data/roadmap.ts`) and the plan list (`data/planMatrix.ts`) follow it._

**Status key:** ✅ built · 🟡 partial · ⬜ missing · 🧪 simulated by design (real work needs engineering or a partner) · 👤 waiting on founder/legal · ⚙ engineering-only (no screen to design)

> **What changed in this re-audit (Batch 13, Pass A).** The previous version stopped at the co-branded work (D123) and never recorded Batch 12. Batch 12 delivered: audio, playlist, collection and support/pay-what-you-want blocks, search-engine settings with sitemap and structured data, "Put back online" and moving a domain between spaces (D124); Service OS invoice PDF and Audience link, licence keys and PDF stamping, new automation triggers and actions, the Monday summary, anonymous carts, the Contact page on Forms and dates in the account's format everywhere (D125); ten business kits in onboarding, the canvas Check tab, page weight and "data saver for everyone", Trust Passport expiry and reporting, proof-of-work certificates (D126); multi-page site kits and A/B tests (D127); shared shops and theme selling (D128); staff Operations overview, second-person approval, staff backup codes, access reviews, incidents and `/status` (D129); the four remaining Super-admin areas as read-only screens, more approvals, extension rollback and automatic moderation flags (D130); developer tools, `/developers`, developer extension submissions and plan-based price caps (D131, D132, D134); and the translation layer with Pidgin, Yorùbá, Hausa and Igbo drafts (D133–D133r).
>
> The audit of 24 Oct also corrected itself: the four Super-admin areas are **not** placeholders (D130 built them read-only), and the automation triggers/actions **exist** (D125) but, like all automations, only run as test runs.

> **Template & theme libraries (D153–D165).** Built: layout sections; Elite collection (24 paid templates, prices cut by a third in D158); Artwork collection (8 classic templates over AI artwork, ≤ ₦3,000, enriched D159); Elite polish (D160); Signature Theme Library — material layer, 24 themes / 35 versions, Themes gallery with compare and spec sheets, Free-plan set of 4 (D161–D165). Open: a visual browser pass of all 32 templates and 35 theme versions at phone and desktop, and real-device checks of glass/blur performance on low-end Android (both in §1 "Needs a hands-on check").

> **Re-audit, 26 Oct 2026 (D150–D212).** Everything built since D149 is recorded here so this file stays the source of truth.
>
> | Area | Decisions | Status |
> |---|---|---|
> | Template & theme libraries — layout sections, Elite (24), Artwork (8), Signature themes (24 / 35 versions), page backgrounds | D153–D165, D182 | ✅ (visual browser pass still open) |
> | Canvas block ecosystem — 76 blocks, 3 containers, 50 looks, 24 ready-made sections, new picker, tidier settings and Look switcher | D166–D173, D177 | ✅ · AI FAQ assistant and Voice to content stay "Planned" 🧪 |
> | Composition — container rules, Check tab composition hints, "Goes well after", section spacing, block names | D174–D175 | ✅ |
> | Drag into containers — onto a container, at the pointed position, reorder inside, drag back out; buttons stay the keyboard route | D180, D191 | ✅ (previously listed as open — closed) |
> | Delivery & returns as its own block | D181 | ✅ (previously listed as open — closed) |
> | Spaces — Event, Fundraiser (verified only), Pop-up shop, Booking page, Members area, samples | D178–D179a, D183–D186 | ✅ 🧪 (payments, sign-in codes simulated) · 👤 fundraising wording |
> | Selling — shop looks, courses, group classes, pre-orders, bulk prices, gift cards, instalments finder | D196–D204 | ✅ 🧪 |
> | Forms — 31 field types, 24 starters, links to Automations, Commerce and Bookings | D193–D195, D199 | ✅ |
> | Provider adapters (payments, SMS, WhatsApp, email, DNS, storage) | D192 | 🧪 single swap point for real server calls |
> | Workspace demo data, removable demo workspace | D200–D201 | ✅ (expiry runs on open — no server) |
> | App shell — appearances, sidebar regrouping, Canvas out of the sidebar, media folders | D205–D210 | ✅ |
> | AI page assistant — question-led, plan approval, template or composed layout, business setup, chat changes with Keep/Discard, Remove everything, "Open in canvas" in the header | D211–D212 | ✅ 🧪 rule-based; real model per `docs/AI_ASSISTANT_INTEGRATION.md` |
>
> **Buildable gaps after this audit:** translations of the remaining screens (left out by the owner's choice). Nothing else is unbuilt; the rest is partners (§4), hands-on checks (§7) or sign-off (§5 — D110 onwards are still "Proposed").

---

## 1. Summary

| Group | Open | Items |
|---|---|---|
| Not built | 0 | Everything on the previous list was built in Batch 13 (D135–D138) — some parts simulated, listed in §4 |
| Partly built — specific pieces missing | 2 | Translations of remaining screens (Batch 14 Pass E/F, in progress — D145–D147 done); Lightweight smaller image versions (needs CDN, so really a partner item). (Closed in D139: extension access list, signed-out-devices confirmation, `aria-required`, workspace-currency price boxes. Closed in Batch 14: per-staff booking times D140, policy agreement prompt and live automation triggers D141, safe embeds and captions guidance D142, presence and multi-door check-in D143, order tracking D144. Closed in D148: "Count taps" respected, bank-transfer checkout, planned-module placeholder pages removed, unanswered FAQ questions hidden.) |
| Waiting on outside partners (designed and simulated) | 14 | See §4 |
| Needs a hands-on check | 3 | Visual review at 320 px / 200%; real-phone screen readers; automated axe-core and contrast run |
| Waiting on founder / legal | see §5 | Decisions D110–D134 "Proposed", example figures, legal wording |

---

## 2. Screens in finished batches

| # | Screen | Status | Notes |
|---|---|---|---|
| G1–G2 | Legal, trust centre, takedown & appeals, security | ✅ | D78 · wording confirmed D109 |
| G3 | Help centre, Contact, About | ✅ | D78, Help expanded D113b, Contact on Forms D125 |
| G4 | Forms add-on | ✅ | D79 · file answers keep the name only 🧪 |
| G5 | Super admin — Pages & domains | ✅ | D82 |
| G6 | Super admin — Plans & entitlements | ✅ | D130; catalogue changes with approval, trials, codes, credit grants (D135) |
| G7 | Super admin — Payments & providers | ✅ | D92, escrow cases D94, payout approvals D130 |
| G8 | Super admin — Orders & disputes | ✅ | D82 |
| G9 | Super admin — AI operations | ✅ | D130; per-feature switches and redacted request log (D135) |
| G10 | Super admin — Business reporting | ✅ | D82 |
| G11 | Super admin — Integrations & notifications | ✅ 🧪 | D130; test sends and message previews in five languages (D135) |
| G12 | Super admin — Data requests | ✅ | D82 |
| G13 | Super admin — Localisation & policies | ✅ | D130; native review queue and policy publishing (D135); Owner agreement prompt, blocking after 14 days (D141) |
| G14 | Visitor unsubscribe and preferences | ✅ | D81 |
| G15 | Account data export and deletion | ✅ | D80 |
| G16 | Screens marked "not visually reviewed" | 🟡 | Needs a browser review at 320 px and 200% zoom |
| G17 | Staff roles, two-step, approvals, backup codes, access reviews | ✅ | D83, D129, D130 |
| G18 | Selling full themes | ✅ | D128 |
| G19 | Printed identity kit | ✅ | D86, D114, D118–D119 |
| G20 | Personal account | ✅ | D80 · dates follow the account format everywhere (D125) |
| G21 | Operations overview, incidents, `/status` | ✅ | D129 |
| G22 | Developer tools and `/developers` | ✅ 🧪 | D131, D132, D134 |

## 3. Blueprint concepts (addendum, 20 total)

| # | Concept | Status | What exists | Still missing |
|---|---|---|---|---|
| 1 | IntentFlow | ✅ | Source rules, preview-as, results (D64), A/B tests (D127) | — |
| 2 | Link Intelligence | ✅ | Suggestions, one-tap "Move it up", Monday summary (D125) | — |
| 3 | DealRoom | ✅ | D54–D56 | — |
| 4 | Trust Passport | ✅ 🧪 | D99, D111, expiry and report (D126) | Outside checks (credit bureau, associations) 🧪 |
| 5 | Proof-of-Work | ✅ | D91, certificates (D126) | — |
| 6 | Voice-to-Store | ✅ 🧪 | D102 | Nigerian-language speech 🧪 |
| 7 | WhatsApp Commerce Bridge | ✅ 🧪 | D97, D100 | Real sending and template approval 🧪 |
| 8 | Local Trust & Fulfilment | ✅ 🧪 | D96, D112 | Real couriers, tracking beyond Lagos 🧪 |
| 9 | Community Commerce | ✅ | DealRoom goals, bundles (D122), shared shops (D128) | — |
| 10 | Digital Product Protection | ✅ 🧪 | Expiring links, limits, log, licence keys (D125), PDF and image watermark previews, per-copy download trace (D136) | Watermark burned into the real file needs storage 🧪 |
| 11 | Service OS | ✅ | D89, D95, invoice PDF and Audience link (D125) | — |
| 12 | Opportunity Inbox | ✅ | D81, anonymous carts and Monday summary (D125) | — |
| 13 | Offline-to-Online Identity | ✅ | D86, D114, D118–D119 | Real print partner 🧪 |
| 14 | Micro-website mode | ✅ | Multi-page sites (D48), seven industry page sets with previews, in onboarding (D127, D137) | — |
| 15 | Creator Collaboration Graph | ✅ 🧪 | D103, D120–D123 | Real split settlement 🧪 |
| 16 | Smart Accessibility | ✅ | D76, canvas Check tab (D126) | Not a full WCAG audit |
| 17 | Lightweight Mode | ✅ | D85, D88, "data saver for everyone" (D126) | Smaller image versions need a CDN 🧪 |
| 18 | Business-in-a-Box | ✅ | Ten kits, offered in onboarding (D90, D126) | — |
| 19 | AI Business Coach | ✅ 🧪 | D104 | Real AI provider 🧪 |
| 20 | Open Module Exchange | ✅ 🧪 | Curated extensions (D67), developer submissions (D132, D134) | Real code hosting and review 🧪 |

## 4. Simulated by design (needs a partner or engineering)

| Area | What the prototype does | What the real thing needs |
|---|---|---|
| Accounts, sign-in, SSO | Codes, devices, SSO simulated (D80, D115) | Auth backend, SAML/OIDC |
| Payments, wallet, escrow, splits | Test cards, simulated settlement | Licensed payment partner with split payouts |
| USSD | Batch 13 adds a simulated flow | Bank USSD via the payment partner |
| Identity / KYC / KYB | Simulated checks and staff review | Identity verification partner |
| Files | Name/size only; images in browser storage | Object storage, virus scan, image pipeline/CDN, real watermarking |
| Domains | Simulated DNS checks | DNS verification, certificates |
| Messages | Previews (email, WhatsApp, SMS) | Messaging providers, WhatsApp Business API |
| Couriers | Simulated quotes and riders | Courier partners |
| Print shop | "Lagos Print Hub" simulated | Print partner |
| Speech | English browser speech only | Speech partner for Nigerian languages |
| AI | Rule-based drafts and coach | AI provider + safety review |
| Calendar sync | Batch 13 adds a simulated two-way connection | Google/Outlook OAuth and APIs |
| Developer API and webhooks | Simulated keys, deliveries, sandbox (D131) | Real API and delivery service |
| Presence, check-in across doors, shared shops | One device | Realtime server, shared state |
| Analytics | On-device events | Event pipeline |
| Translations | Drafts in four languages (D133) | Native-speaker review |

## 5. Waiting on founder or legal

- **Signed off (D105–D109):** prices, limits, fees, timings, retention, risk thresholds, commerce rules, partner-app plans, legal wording.
- **Still "Proposed":** D110–D134, including all translation parts (D133–D133r), partnerships (D120–D123), print kit (D114, D118–D119), shared shops (D128), staff safety (D129–D130) and developer tools (D131–D134).
- **Example figures:** payment provider fee, pay-on-delivery cap (₦100,000), instalment minimum (₦20,000), print prices, partnership windows, webhook retry/auto-off, API rate limit, extension price caps and 80/20 split, staff approval expiry (24 h), access review cycle (90 days).
- **Needs legal review:** instalments (D112), buyer protection (D94), partnership agreement (D120), support-block wording (D124), developer data-use declaration (D132).

## 6. Implementation backlog audit (`KUBICU_IMPLEMENTATION_BACKLOG.md`)

| Epic | Status | Remaining design gaps |
|---|---|---|
| A Identity & onboarding | ✅ | — (D139) |
| B Canvas | ✅ | — |
| C Blocks | ✅ | Safe embeds from 11 sites with sandboxed frames and captions confirmation (D142) |
| D Themes | ✅ | — |
| E Publishing, URLs, QR, SEO | ✅ | — (D124) |
| F Analytics | ✅ | ⚙ bot filtering |
| G Products & orders | ✅ | — |
| H Payments | ✅ 🧪 | USSD and workspace currency (D136) |
| I Digital goods | ✅ 🧪 | Watermarks (D136) |
| J Bookings | ✅ 🧪 | Calendar sync simulated (D137); per-staff availability built (D140) |
| K Leads / CRM | ✅ | — |
| L Automations | ✅ 🧪 | Every trigger fires on real changes while the app is open (D137, D141); sending needs partners |
| M Custom domains | ✅ | — |
| N Plans & billing | ✅ | — (D135) |
| O Super admin | ✅ | — (D135) |
| P Module marketplace | ✅ | — (D139; scopes derived from wording until real manifests) |
| Q AI | ✅ 🧪 | — (D135; AI provider simulated) |
| R Security & privacy | ✅ | ⚙ rate limits |
| S Accessibility & resilience | ✅ | Hands-on checks (§7) |
| T Trust & safety | ✅ | Automatic flags (D130) |
| U Internationalisation | 🟡 | 🟡 Remaining screens to translate (currency done, D136) |
| V IntentFlow | ✅ | — |
| W DealRoom | ✅ | — |
| X Trust Passport & Proof | ✅ 🧪 | — |
| Y Local fulfilment | ✅ 🧪 | 🧪 areas beyond Lagos |
| Z Developer API | ✅ 🧪 | — (D131) |
| Workspaces | ✅ | Unlimited, each on Free (D137) |

## 7. Everything still open, grouped

**Not built:** nothing. Batch 13 closed the list (D135 staff tools, D136 currency/USSD/watermarks, D137 calendar/automations/page sets/workspaces, D138 checks).

**Partly built:** translations still in English — pay-on-delivery/instalment order panels; workspace Settings; Your account; Automations, Forms, IntentFlow, Analytics, Domains & QR, Opportunities, Collaborations and Deliveries; the canvas; the marketing site; the remaining buyer-protection sentences. (Done in Batch 14 Pass E: tracking, payout and bank windows D145; Payments card, Verification frame, Reports, Commerce settings D146; Audience, Schedule, Services D147; Availability, Team hours, Calendar sync D150; booking and contact panels, import and duplicates D151; Verification step fields D152.) Smaller image versions for low-data mode need a CDN.

**Closed in Batch 14:** per-staff booking times D140; policy agreement prompt and all automation triggers on real events D141; safe embeds beyond YouTube and captions guidance D142; presence between tabs and multi-door check-in D143; order tracking paid → delivered with stage icons D144; QR code on the publish screen.

**Closed in the clean-up (D148):** the block "Count taps" switch now really stops counting; the "Bank transfer payments" extension adds bank transfer at checkout with order-number reference, "I’ve sent the money" and seller confirmation; the old "planned module" pages are gone (unknown addresses show "Page not found"); unanswered FAQ questions are hidden from visitors; the last "Batch 5" labels in the design system page are removed.

**Checks (D149):** every Batch 14 screen read for phone fit and accessibility and fixed; what remains needs a real phone or browser (below).

**Final buildable list after D149:** only the translations listed under "Partly built" above. Everything else is waiting on partners, real devices or sign-off.

**Still true after the 26 Oct re-audit (D212):** the same — translations only. Add to the hands-on list: all 32 templates and 35 theme versions at 320 px and desktop; glass/blur on a low-end Android; the AI assistant, courses, group classes, gift cards, fundraiser and event pages with VoiceOver/TalkBack; canvas drag into and out of containers on touch.

**Waiting on partners:** see §4.

**Hands-on:** G16 visual review at 320 px / 200%; real-phone screen readers (seat map, print ordering, @mentions, print designs, partner panel, Sold with a partner, guest partner page, check-in result card and doors panel, buyer tracking page, bank-transfer order page, USSD flow); axe-core and status-colour contrast run, including the tracking "problem" orange on dark custom themes; embeds from each of the 11 sites at 320 px.

## 8. History

- Batches 1–11, print kit (D118–D119), co-branded spaces & bundles (D120–D123) and Batch 12 (D124–D134) are complete; Batch 12 translations continue in parts.
- Batch 13 complete (D135–D138): docs reconciliation, staff editing tools, workspace currency, USSD, watermarks, calendar sync, live automations, seven industry page sets, multiple workspaces, checks.
- 26 Oct 2026 re-audit (D212): libraries, block ecosystem, spaces, selling, forms, providers, demo data and the AI assistant recorded; drag-into-container and Delivery & returns confirmed closed (D180, D181, D191).
- Earlier versions of this file: 22 Oct 2026; updates after Forms, the account area, Batch 8, Batch 11 and 23 Oct 2026.
