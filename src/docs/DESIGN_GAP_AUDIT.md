# KUBICU — Design gap audit

_Audited 22 Oct 2026 against the code and every doc in `docs/`. Source of truth for what is still missing across Batches 1–7, the proposed designs and the 20 blueprint concepts. The public roadmap (`data/roadmap.ts`) is derived from this file._

**Status key:** ⬜ missing · 🟡 partial · 🧪 simulated by design (needs engineering, not design) · 👤 waiting on founder/legal
**Readiness:** **R1** ready to design now · **R2** needs a decision first · **R3** needs engineering or a partner

---

## 1. Summary

| Group | Count | Biggest items |
|---|---|---|
| Unbuilt screens inside finished batches | 8 open (of 20) | 9 Super-admin areas (one row each, G5–G13), visitor unsubscribe page, staff roles. Legal & trust (G1–G3), Forms (G4), account export/deletion (G15) and the personal account (G20) are now built |
| Blueprint concepts not started | 9 | Trust Passport, Voice-to-Store, WhatsApp Commerce Bridge, Creator Collaboration Graph |
| Blueprint concepts partly there | 9 | Link Intelligence, Service OS, Business-in-a-Box, Open module exchange |
| Simulated by design | 10 | Sign-in, payments, files, domains, messages, calendar sync, presence |
| Waiting on founder / legal | ~55 decisions + 14 example figures + 9 wording items | Prices, fees, limits, refund and consent wording |
| Docs out of date (fixed in this pass) | 3 | Screen inventory, traceability matrix, prototype status |

---

## 2. Unbuilt or partial screens in finished batches

| # | Gap | Source | Batch | Status | Readiness | Depends on | Suggested |
|---|---|---|---|---|---|---|---|
| G1 | Legal pages (terms, privacy, cookies, acceptable use, refunds, seller terms) | DP §6 X, D35, `data/marketing.ts` | 3 | ✅ built (D78) · 👤 wording pending legal review | — | Legal review | Done |
| G2 | Trust centre, safety tips, takedown & appeals, security pages | IB EPIC T, D75b | 3/6 | ✅ built (D78) | — | — | Done |
| G3 | Help centre, Contact, About | `data/marketing.ts` | 3 | ✅ built (D78) · Contact not yet on the Forms engine | R1 | — | Small follow-up |
| G4 | Custom form builder (field types, logic, multi-step, file, payment, submissions inbox) | MB §10.2, IB EPIC K | 4 | ✅ built as a paid add-on (D79) · file answers keep the name only 🧪 | — | — | Done |
| G20 | Personal account: profile, photo, email/phone change and verification, password, two-step sign-in, backup codes, devices, sign-in history, connected logins, preferences, workspaces list, sign out | IB EPIC A, D36 | 3 | ✅ built (D80) · 🧪 no real credentials | — | Auth backend | Done |
| G5 | Super admin — Pages & domains | MB §17, `data/adminNavigation.ts` | 6 | ✅ built (D82): every link with status and open reports, take down / restore with reason; domains with stuck (>48 h) and problem flags | — | — | Done |
| G6 | Super admin — Plans & entitlements | MB §17, D65 | 6 | ⬜ | R2 | Final plan prices | Batch 8 |
| G7 | Super admin — Payments & providers | MB §17, D40 | 6 | ⬜ | R3 | Provider choice | Batch 8 |
| G8 | Super admin — Orders & disputes | MB §17, D42 | 6 | ✅ built (D82): disputes, refunds ≥ ₦50k, payments pending > 24 h; staff notes and "Message the seller" (opens a support request). Staff never move money | — | — | Done |
| G9 | Super admin — AI operations | MB §17, D63 | 6 | ⬜ | R2 | AI provider | Batch 8 |
| G10 | Super admin — Business reporting | MB §17 | 6 | ✅ built (D82): MRR, amount sold, KUBICU fees, new workspaces, visits, plan mix, top sellers, written definitions | — | — | Done |
| G11 | Super admin — Integrations & notifications | MB §17 | 6 | ⬜ | R3 | Messaging provider | Batch 8 |
| G12 | Super admin — Data requests (export/delete under NDPA) | MB §21, IB EPIC R | 6 | ✅ built (D82): queue with 30-day deadline (example), per-kind checklist, complete/refuse with outcome; account self-service requests listed · 👤 legal process to confirm | — | Legal process | Done |
| G13 | Super admin — Localisation & policies | IB EPIC U | 6 | ⬜ | R2 | Languages to support | Batch 8 |
| G14 | Visitor unsubscribe page and preference centre | DP §6 X, D45 | 4 | ✅ built (D81): `/p/:handle/preferences/:contactId`, copy link from a contact · 🧪 links aren't auto-added to messages (nothing is sent) | — | — | Done |
| G15 | Owner account data export and account deletion flow | IB-A | 3 | ✅ built in Account → Data & privacy (D80): export with 7-day download, deletion scheduled with a 14-day grace and cancel · staff-side processing is G12 | — | — | Done |
| G16 | Layout tidy-up: screens marked "not visually reviewed" | D75, D76 O4 | 7 | 🟡 | R1 | Browser review | Batch 8 QA |
| G17 | Staff roles, two-step sign-in for staff, appeals inside admin | D75b notes | 6 | ✅ built (D83): staff sign-in with required two-step, 5 fixed roles gating nav and routes, Staff & access screen, owner appeals from the app banner decided by a different staff member · dual approval for high-risk actions still open | — | — | Done |
| G18 | Theme marketplace licensing for *themes* (templates are done) | DP §6 H | 6 | 🟡 | R2 | Pricing | Later |
| G19 | Printed identity kit (business cards, stickers, receipts with QR) | MB-A13 | 5 | 🟡 | R1 | — | Later |

## 3. Blueprint concepts (addendum, 20 total)

| # | Concept | Status | What exists | What's missing | Readiness |
|---|---|---|---|---|---|
| 1 | IntentFlow | ✅ | Source rules, preview-as, results (D64) | Personalisation beyond source (deliberately excluded) | — |
| 2 | Link Intelligence | 🟡 | Up to 3 evidence-based suggestions in Analytics | Weekly digest, applying a suggestion as a one-click change | R1 |
| 3 | DealRoom | ✅ | Drops and group goals, referrals, refunds (D54, D55) | — | — |
| 4 | Trust Passport | ⬜ | — | Verified identity, business proof, review history badge | R2 (verification partner) |
| 5 | Proof-of-Work Portfolio | ⬜ | Portfolio block only | Verified client testimonials, delivered-work timeline | R1 |
| 6 | Voice-to-Store | ⬜ | Text brief → AI page setup | Voice capture, Pidgin/Yorùbá/Igbo/Hausa transcription | R3 |
| 7 | WhatsApp Commerce Bridge | ⬜ | `wa.me` ordering links | Official API catalogue sync, order capture from chats | R3 |
| 8 | Local Trust & Fulfilment | ⬜ | Delivery zones; "Lagos delivery partners" extension stub | Rider booking, tracking, pickup points | R3 |
| 9 | Community Commerce | 🟡 | DealRoom group goals | Community storefronts, co-op selling | R2 |
| 10 | Digital Product Protection | 🟡 | Expiring links, download limits, log | Watermarking, licence keys | R2 |
| 11 | Service OS | 🟡 | Bookings, deposits, reminders | Quotes → invoices → job tracking for service businesses | R1 |
| 12 | Opportunity Inbox | ✅ | `/app/opportunities` (D81): unpaid checkouts, failed renewals, unpaid deposits, no-shows, unanswered leads, overdue follow-ups, sold-out products, failed automations; WhatsApp nudge, snooze, handled | Anonymous abandoned carts (no details captured), weekly digest | — |
| 13 | Offline-to-Online Identity | 🟡 | QR codes, campaign links, fallbacks | Printed identity kit (G19) | R1 |
| 14 | Micro-website mode | 🟡 | Multi-page sites (D48) | Vertical site kits | R1 |
| 15 | Creator Collaboration Graph | ⬜ | Template selling (adjacent) | Co-branded pages, partner bundles, shared referral payouts | R2 (payout rules) |
| 16 | Smart Accessibility | 🟡 | Manual audit, contrast safety net (D76) | Automated in-canvas checker | R1 |
| 17 | Lightweight Mode | ⬜ | Lazy images | Low-data profile, image budgets, text-first rendering | R1 |
| 18 | Business-in-a-Box | 🟡 | Starter kits with sample blocks | Kits that also install policies, automations, products | R1 |
| 19 | AI Business Coach | ⬜ | — | Weekly plain-language advice from real numbers | R2 (AI provider) |
| 20 | Open Module Exchange | 🟡 | Curated Extensions (D67) | Third-party developer submissions, SDK, review queue for code | R3 |

## 4. Simulated by design (engineering, not design)

| Area | What the prototype does | What real work needs |
|---|---|---|
| Accounts & sign-in | Sign-in screens plus a full Account area (D80) stored on this device; codes, devices and sign-in history are simulated | Auth backend, sessions, MFA, email/SMS delivery |
| Payments | Test cards, outcomes | Provider integration (Paystack/Flutterwave decision) |
| Files | Name/size only; images in browser storage | Object storage, virus scan |
| Domains | Simulated DNS checks | DNS verification, certificates |
| Messages | Previews (email, WhatsApp, SMS) | Messaging providers |
| Calendar sync | Not built | Google/Outlook OAuth |
| Presence & approvals | Simulated collaborators | Realtime server |
| Check-in across doors | One device | Shared ticket state |
| Analytics | On-device events | Event pipeline |
| AI | Rule-based drafts | AI provider + safety review |

## 5. Waiting on founder or legal

- **Decisions:** about 55 of 61 register entries are still "Proposed". Highest impact: D39 (checkout), D40 (fees), D41 (plan limits), D50 (spaces), D57 (roles), D65 (billing), D67 (extensions), D70 (template revenue split).
- **Example figures (14):** plan prices, payment fees, product/page/space limits, media quotas, seat counts, data retention, AI credits, template split/price range/refund window/payout minimum, ticket types per event, seat-hold minutes and extension, Forms add-on price.
- **Legal wording (9):** terms, privacy, cookies, refunds & disputes, booking cancellation, marketing consent, analytics notice, subscription renewal terms, template licence.

## 6. Docs refreshed in this pass

- `docs/SCREEN_INVENTORY.md` — families O, P, Q, R, S, U, V, W, X updated to match the code; events, subscriptions and template selling added.
- `docs/DESIGN_TRACEABILITY_MATRIX.md` — 20 rows moved from ⬜/⏳ to their real status.
- `docs/PROTOTYPE_STATUS.md` — forms no longer described as storing nothing.
- `data/roadmap.ts` — batches 4, 6 and 7 marked done; a live / preview / planned roadmap added for the website.

## 7. Suggested next batches

1. **Batch 8 — Operations completion (R1 items): ✅ complete.** G17 staff roles, staff two-step sign-in and appeals (D83); G5, G8, G10, G12 (D82); G14, concept 12 (D81); G15 (D80).

## 8. Update — after Passes C, D and the account area

- **Built since the audit:** legal, trust and company pages (D78), the Forms add-on (D79), and the personal **Account** area (D80) — profile and photo, email and phone verification, password, two-step sign-in with backup codes, devices and sign-in history, Google/Apple logins, language/time zone/date format, text size and motion, start screen, workspaces list, data export and scheduled account deletion. Sign out sits in the sidebar account menu and the phone "More" sheet.
- **Workspace vs personal settings:** `/app/settings` is now strictly the workspace (team, roles, approvals, billing, per-workspace notifications, activity, privacy); `/app/account` is strictly the person. Super-admin controls live only in the staff console (D71a).
- **Still open from this round:** Contact page on the Forms engine; Account preferences for date format and time zone are applied in Account screens and sign-in history, not yet across every app screen; non-English languages are listed as "coming soon".
2. **Batch 9 — Differentiation (R1/R2):** Service OS, Business-in-a-Box kits, Lightweight mode, Proof-of-Work, printed identity kit.
3. **Partner-dependent (R3):** WhatsApp Commerce Bridge, local fulfilment, Voice-to-Store, Open Module Exchange — design once partners are chosen.
