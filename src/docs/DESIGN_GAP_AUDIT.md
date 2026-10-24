# KUBICU — Design gap audit

_Re-audited 23 Oct 2026 against the code, every doc in `docs/`, the 20 blueprint concepts and a full pass of `docs/KUBICU_IMPLEMENTATION_BACKLOG.md` (epics A–Z and every non-epic section). This file is the source of truth for what is still missing. The public roadmap (`data/roadmap.ts`) and the plan list (`data/planMatrix.ts`) follow it._

**Status key:** ✅ built · 🟡 partial · ⬜ missing · 🧪 simulated by design (real work needs engineering or a partner) · 👤 waiting on founder/legal · ⚙ engineering-only (no screen to design)
**Readiness:** **R1** ready to design now · **R2** needs a decision first · **R3** needs a partner for the real thing (the screens can still be designed and simulated)

> **What changed in this re-audit.** The earlier version was out of date on several rows. Trust Passport (D99, D111), Voice-to-Store (D102), WhatsApp Commerce Bridge (D97, D100), Local fulfilment (D96) and AI Business Coach (D104) were marked "nothing built" but all exist with the partner part simulated. Super admin → Payments & providers was marked missing but is built (D92), plus Escrow cases (D94). Partner print-shop ordering is built (D114). The founder sign-off (D105–D109) closed the ~55 "Proposed" decisions. The implementation backlog has no status markers of its own; §6 below records its audit.

---

## 1. Summary

| Group | Open | Biggest items |
|---|---|---|
| Not built — nothing in the app | 12 | 4 Super-admin areas (Plans & entitlements, AI operations, Integrations & notifications, Localisation & policies), developer tools (API keys, webhooks, connected apps), staff dual approval and access reviews, public status page and incidents, watermarking and licence keys, audio and playlist blocks, sitemap and structured data, USSD at checkout |
| Partly built — specific pieces missing | 17 | Service OS invoices, Lightweight mode owner setting, Business kits in onboarding, Link Intelligence, Opportunities, automation triggers and actions, in-canvas accessibility checker, community storefronts, Contact page on Forms |
| Waiting on outside partners (designed and simulated) | 13 | Payments and split settlement, WhatsApp, email/SMS, couriers, print shop, speech, identity/KYC, outside trust checks, AI, file storage, DNS, calendar sync, realtime |
| Needs a hands-on check | 2 | Screens "not visually reviewed" at 320 px and 200% zoom; real phone with VoiceOver/TalkBack |
| Waiting on founder / legal | small | Decisions logged after the sign-off (D110 onward), instalment and buyer-protection wording, example figures that depend on a partner |

---

## 2. Screens in finished batches

| # | Screen | Status | Notes |
|---|---|---|---|
| G1–G2 | Legal, trust centre, takedown & appeals, security | ✅ | D78 · wording confirmed D109 |
| G3 | Help centre, Contact, About | 🟡 | Built (D78, Help expanded D113b). **Contact page still uses its own simple form, not the Forms engine** |
| G4 | Forms add-on | ✅ | D79 · file answers keep the name only 🧪 |
| G5 | Super admin — Pages & domains | ✅ | D82 |
| **G6** | **Super admin — Plans & entitlements** | ⬜ | Placeholder (`AdminPlannedArea`). Prices are now confirmed (D105), so this is R1 |
| G7 | Super admin — Payments & providers | ✅ | D92: payout queue, wallet pause, identity reviews, provider health (illustrative). Escrow cases D94 |
| G8 | Super admin — Orders & disputes | ✅ | D82 |
| **G9** | **Super admin — AI operations** | ⬜ | Placeholder. Provider, budget, policy and usage screens can be designed now (R3 for real data) |
| G10 | Super admin — Business reporting | ✅ | D82 |
| **G11** | **Super admin — Integrations & notifications** | ⬜ | Placeholder. Message templates and channel health (R3 for real sending) |
| G12 | Super admin — Data requests | ✅ | D82 |
| **G13** | **Super admin — Localisation & policies** | ⬜ | Placeholder. Languages, currency, policy versions |
| G14 | Visitor unsubscribe and preferences | ✅ | D81 |
| G15 | Account data export and deletion | ✅ | D80 |
| G16 | Screens marked "not visually reviewed" | 🟡 | Needs a browser review at 320 px and 200% zoom |
| G17 | Staff roles, staff two-step, appeals | 🟡 | Built (D83). **Second-person approval for high-risk actions, staff backup codes and periodic access reviews still missing** |
| G18 | Selling full *themes* (templates are done) | 🟡 | Saved themes can be shared privately; no paid theme listings |
| G19 | Printed identity kit | ✅ | D86, expanded D118–D119; print-shop ordering D114 |
| G20 | Personal account | ✅ | D80 · date format and time zone not yet applied on every screen 🟡 |

## 3. Blueprint concepts (addendum, 20 total)

| # | Concept | Status | What exists | What's still missing | Readiness |
|---|---|---|---|---|---|
| 1 | IntentFlow | ✅ | Source rules, preview-as, results (D64) | A declared A/B test (metric + duration) beyond source variants | R1 |
| 2 | Link Intelligence | 🟡 | Up to 3 evidence-based suggestions in Analytics | Weekly digest; apply a suggestion in one tap | R1 |
| 3 | DealRoom | ✅ | Drops, group goals, referrals, refunds (D54–D56) | — | — |
| 4 | Trust Passport | ✅ 🧪 | Score from six checked signals (D99), badge block and public passport (D111) | Outside checks (credit bureau, trade associations); per-check expiry/revocation view; "report a misleading claim" on the passport | R3 / R1 |
| 5 | Proof-of-Work | ✅ | Verified reviews, work timeline, Proof block (D91) | Certificates, case-study pages | R1 |
| 6 | Voice-to-Store | ✅ 🧪 | English speech or typed text → draft products (D102) | Pidgin, Yorùbá, Hausa, Igbo transcription | R3 |
| 7 | WhatsApp Commerce Bridge | ✅ 🧪 | Chats, quick replies, send a product, catalogue, 24-hour rule (D97), automatic messages (D100) | Real sending, template approval, order-from-chat checkout, catalogue push | R3 |
| 8 | Local Trust & Fulfilment | ✅ 🧪 | Deliveries app: quotes, own rider, delivery codes, escrow release (D96); pay on delivery (D112) | Real couriers, live tracking, proof-of-delivery photos, pickup points, areas beyond Lagos | R3 |
| 9 | Community Commerce | 🟡 | DealRoom goals; partner bundles (D122) | Shared storefront for a group of sellers (co-op) | R1 |
| 10 | Digital Product Protection | 🟡 | Expiring links, download limits, log | **Watermarking and licence keys** | R1 |
| 11 | Service OS | 🟡 | Quotes & jobs (D89), milestones (D95) | **Client pays an invoice online, PDF export, clients linked to Audience** | R1 |
| 12 | Opportunity Inbox | 🟡 | Opportunities (D81) | Anonymous abandoned carts; weekly digest | R1 |
| 13 | Offline-to-Online Identity | ✅ | QR, campaign links, fallbacks, print kit, print-shop ordering (D86, D114, D118–D119) | Real print partner 🧪 | R3 |
| 14 | Micro-website mode | 🟡 | Multi-page sites (D48) | Ready-made site kits per business type | R1 |
| 15 | Creator Collaboration Graph | ✅ 🧪 | Referrals (D103), partnerships (D120), co-branded spaces (D121), bundles (D122), D123 | Real split settlement | R3 |
| 16 | Smart Accessibility | 🟡 | Manual audit, contrast blocking (D76, D108) | **Automatic checker in the canvas** | R1 |
| 17 | Lightweight Mode | 🟡 | Visitor data saver (D85, D88) | **Owner "start lightweight" setting**; smaller image versions and offline use (R3) | R1 / R3 |
| 18 | Business-in-a-Box | 🟡 | Business kits (D90), six policies | **Kits offered during onboarding**, more business types | R1 |
| 19 | AI Business Coach | ✅ 🧪 | Rule-based weekly brief and questions (D104) | A real AI provider | R3 |
| 20 | Open Module Exchange | 🟡 | Curated Extensions (D67) | **Developer submissions, SDK, code review queue** | R1 (design) / R3 |

## 4. Simulated by design (needs a partner or engineering)

| Area | What the prototype does | What the real thing needs |
|---|---|---|
| Accounts & sign-in, SSO | Codes, devices, SSO provider simulated (D80, D115) | Auth backend, MFA, SAML/OIDC provider |
| Payments, wallet, escrow, splits | Test cards, simulated settlement (D92–D94, D122) | Licensed payment partner with split payouts |
| Identity / KYC / KYB | Simulated checks and staff review | Identity verification partner |
| Files | Name/size only; images in browser storage | Object storage, virus scan, image pipeline/CDN |
| Domains | Simulated DNS checks | DNS verification, certificates |
| Messages | Previews (email, WhatsApp, SMS) | Messaging providers, WhatsApp Business API |
| Couriers | Simulated quotes and riders | Courier partners |
| Print shop | "Lagos Print Hub" simulated | Print partner |
| Speech | English browser speech only | Speech partner for Nigerian languages |
| AI | Rule-based drafts and coach | AI provider + safety review |
| Calendar sync | **Not built** | Google/Outlook connection |
| Presence, check-in across doors | One device | Realtime server, shared state |
| Analytics | On-device events | Event pipeline |

## 5. Waiting on founder or legal

- **Signed off (D105–D109):** prices, limits, KUBICU fees, money fees and timings, retention, risk thresholds, commerce rules, partner-app plans. Low contrast blocks publishing; the Night-market gradient is allowed in four app places; legal wording confirmed.
- **Still "Proposed":** decisions logged after the sign-off (D110 onward: members-only, instalments, seating, prints, SSO, comments, sidebar, print kit, partnerships).
- **Still example figures:** payment provider fee (1.5% + ₦100), pay-on-delivery cap (₦100,000), instalment minimum (₦20,000), print prices, partnership invite (7 days) and notice (14 days).
- **Needs legal review:** instalment wording, buyer-protection wording, partnership agreement wording.

## 6. Implementation backlog audit (`KUBICU_IMPLEMENTATION_BACKLOG.md`)

The backlog is the pre-prototype engineering spec; it carries no status of its own. Every epic and section was checked against the code. Engineering-only criteria (⚙: server-side checks, idempotency, signatures, decimal maths, CSP, backups, test layers) are not design gaps and are listed only where they imply a screen.

| Epic | Status | Design gaps found |
|---|---|---|
| A Identity & onboarding | ✅ | 🟡 No automatic "other devices were signed out" confirmation after a password or two-step change |
| B Canvas | ✅ | — (sanitisation, schema migration ⚙) |
| C Blocks | 🟡 | ⬜ **Audio block**, ⬜ **Playlist block**, 🟡 dedicated **Collection** block, 🟡 **Donation / pay-what-you-want** block (payment links exist, no page block) |
| D Themes & design system | ✅ | — |
| E Publishing, URLs, QR, SEO | 🟡 | ⬜ **Sitemap and structured data** (only title/description today); 🟡 restore an unpublished page as its own action |
| F Analytics | ✅ | 🟡 Retention shown in Privacy but no bot-filtering note (⚙) |
| G Products & orders | ✅ | — |
| H Payments | ✅ 🧪 | ⬜ **USSD** listed but not a checkout option; 🧪 webhooks ⚙ |
| I Digital goods | ✅ | See concept 10 (watermarking, licence keys) |
| J Bookings | ✅ | 🧪 Calendar sync not built |
| K Leads / CRM | ✅ | — |
| L Automations | 🟡 | ⬜ Triggers: **campaign started/ended**, **lead inactive for N days**. ⬜ Actions: **AI draft**, **produce a report**, **call an approved webhook** |
| M Custom domains | ✅ | 🟡 Move a domain between spaces as a guided step (today: disconnect + reconnect) |
| N Plans & billing | 🟡 | ⬜ Staff **plan catalogue / trials / coupons / credits** (G6); 🟡 staff can swap a plan but can't grant a credit |
| O Super admin | 🟡 | ⬜ G6, G9, G11, G13; ⬜ **dual approval / step-up** for high-risk actions; ⬜ **access reviews**; 🟡 **incidents and public status page** (Health is a snapshot only) |
| P Module marketplace | 🟡 | 🟡 Extension detail doesn't show data access scope, events and outside services; 🟡 staff can't pause/roll back one extension per workspace or globally; ⬜ developer submissions (concept 20) |
| Q AI | 🟡 | ⬜ Staff AI operations (G9) |
| R Security & privacy | ✅ | 🟡 No general abuse/rate-limit view for staff (⚙ mostly) |
| S Accessibility & resilience | 🟡 | ⬜ In-canvas checker (concept 16); 🟡 owner lightweight setting (concept 17) |
| T Trust & safety | 🟡 | 🟡 Automated phishing/impersonation flags surfaced to moderators (reports are manual only) |
| U Internationalisation | 🟡 | ⬜ Staff localisation (G13); 🟡 only English works — other languages "coming soon" (needs translation); 🟡 naira only, no currency setting |
| V IntentFlow | ✅ | 🟡 Declared A/B test |
| W DealRoom | ✅ | — |
| X Trust Passport & Proof | ✅ 🧪 | 🟡 Per-check expiry/revocation; passport-specific report |
| Y Local fulfilment | ✅ 🧪 | 🟡 Delivery areas beyond Lagos; partner availability per area |
| Z Developer API | ⬜ | ⬜ **API keys, webhook endpoints and delivery log, connected apps with revoke, developer docs/sandbox/changelog** |
| §4 MVP, §7 commercial | ✅ | Staff plan catalogue (G6) |
| §2, §5, §6, §8, §10–§13 | ⚙ / 👤 | Process, architecture, QA and research — no screens |

## 7. Everything still open, grouped

**Not built (nothing in the app):** G6 Plans & entitlements · G9 AI operations · G11 Integrations & notifications · G13 Localisation & policies · staff dual approval, backup codes and access reviews · public status page and incidents · developer tools (API keys, webhooks, connected apps, docs) · watermarking and licence keys · audio and playlist blocks · sitemap and structured data · USSD at checkout · calendar sync.

**Partly built:** Contact on Forms · Service OS online invoice payment, PDF, Audience link · Lightweight owner setting · Business kits in onboarding and more types · micro-site kits · Link Intelligence digest and one-tap apply · Opportunities digest and anonymous carts · automation triggers and actions · in-canvas accessibility checker · community storefronts · collection and donation blocks · theme selling · extension detail scopes and staff rollback · Trust Passport expiry and report · declared A/B tests · signed-out-devices confirmation · account date/time format everywhere · developer submissions.

**Waiting on partners (designed and simulated):** payments and split settlement · WhatsApp sending · email/SMS · couriers and tracking · print shop · Nigerian-language speech · translation of the app · identity/KYC · outside trust checks · AI provider · file storage and image pipeline · DNS/certificates · realtime presence and shared check-in.

**Hands-on:** G16 visual review; real-phone screen-reader checks (seat map, print ordering, @mentions, print designs, partner panel, Sold with a partner, guest partner page).

## 8. History

- Batches 1–7, 8 (D81–D83), 9 (D84–D91), 10 (D92–D109), 11 (D110–D117a), print kit (D118–D119) and co-branded spaces & bundles (D120–D123) are complete.
- Earlier versions of this file: audit 22 Oct 2026; updates after Forms, the account area, Batch 8 and Batch 11.
