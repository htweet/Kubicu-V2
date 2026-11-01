# KUBICU — What must not go to production

_Instructions for Claude (or any engineer) turning this prototype into the real product. Written 30 Oct 2026 from the code at **D348**. Decision: D349._

**This prototype is the design reference, not the production codebase.** It runs entirely in the browser: every role, price, balance, permission and payment is stored in `localStorage` and computed client-side, so anyone can change it. Rebuild the behaviour on a real backend; do not deploy this code as-is.

How to use this file:
- Treat every item below as **must replace, must remove, or must not ship until approved**. Each has a file path.
- If you're unsure whether something is real, assume it isn't and check `CLAUDE_HANDOFF.md` §13.
- Before any release, walk the **release gate** in §10. A single unchecked item blocks the release.

---

## 1. Remove entirely (prototype-only)

| What | Where | Why |
|---|---|---|
| **Controls-panel switches** on `App`: `viewingAs` (role simulator), `workspacePlan`, `visualDirection`, `simulateNextRenewal`, `copilotFailure`, `copilotWhatsApp` | `App.tsx` (props), `contexts/TeamContext.tsx`, `PlanContext.tsx`, `BillingContext.tsx`, `CopilotSimContext.tsx`, `AppearancePolicyProvider` | `viewingAs` lets anyone act as any role; plan comes from billing, not a prop; failures come from real errors |
| **In-product simulation controls** | `booking/BookingSheet.tsx` ("simulate someone else booking"), `commerce/DisputePanel.tsx` ("simulate the provider's decision"), `QrDesigner.tsx` (simulate a scan), check-in "simulate a scan" picker, `OrderDetail.tsx` simulated provider confirmation, WhatsApp "receive a message", calendar "simulate access withdrawn", "see as partner" and co-brand act-as switches (`hooks/useCoBrandActor.ts`) | Testing aids |
| **PrototypeNote banners** | `components/ui/PrototypeNote.tsx` and every use | Replace each with the real behaviour, or with honest production copy where something is genuinely unavailable |
| **Test mode strip** | `components/commerce/TestModeStrip.tsx` | Keep only if the real provider has a test mode, wired to it |
| **Simulated teammates** ("· simulated") | `contexts/PresenceContext.tsx`, `canvas/PresenceAvatars.tsx`, `BlockFrame.tsx` | Fake people |
| **Demo data and demo workspace** | `data/*Seed.ts`, `data/sample*.ts`, `data/examples/*`, `utils/demoData.ts`, `utils/workspaceStorage.ts` (`DEMO_SEED_KEY`), `settings/DemoDataCard.tsx`, `DemoWorkspaceCard.tsx`, `RemoveDemoWorkspaceDialog.tsx`, `useEditorStore.ts` `resetDemo()` | New accounts start empty, or with clearly labelled starter content created server-side |
| **Simulated riders and customers** | `utils/fulfilment.ts` (`SIMULATED_RIDERS`), `utils/whatsapp.ts` (`SIM_CUSTOMERS`) | Fake people |
| **Storage size report** | `pages/admin/AdminHealth.tsx` (localStorage) | Replace with real platform health |

## 2. Replace with real providers (server-side)

Nothing here may call a provider from the browser with a secret. All provider calls go through the backend, with webhooks, idempotency keys and audit logs. Provider choices are **unmade** (`DECISIONS_FOR_SIGNOFF.md` Group C) — don't pick one without the founder.

| Area | Simulated in | Production needs |
|---|---|---|
| Provider registry and adapters | `data/providers.ts`, `utils/providers/adapters.ts`, `utils/providers/store.ts` (stores connections in the browser) | Server-held credentials, never in the client |
| Card payments, bank transfer, USSD | `ConfirmMoneyDialog.tsx`, `utils/commerce/bankTransfer.ts`, `checkout/UssdPay.tsx`, `data/ussdBanks.ts` | Payment provider + webhooks. **USSD stays off** (`USSD_AVAILABLE`) until a provider is chosen |
| Escrow, payouts, refunds, disputes | `utils/money/escrow.ts`, `utils/money/store.ts` | Licensed partner; money never held by KUBICU without regulatory sign-off |
| KYC / verification | `components/kyc/*`, `utils/money/kyc.ts` | Real identity/business checks |
| Couriers and delivery codes | `utils/fulfilment.ts` | Courier APIs; codes generated and checked server-side |
| WhatsApp, SMS, email | `utils/whatsapp.ts`, `whatsapp/WhatsAppSetup.tsx`, email marketing and Sheets sync (`data/extensions.ts`) | WhatsApp Business API, SMS and email providers, with opt-out handling |
| Domains, DNS, SSL | `utils/domains/dns.ts`, `domains/ConnectDomainDialog.tsx` | Real DNS checks and certificate issuance |
| Link safety | `utils/linkSafety.ts` (sample block list) | A live URL-reputation service |
| Calendar, meetings | `utils/ops/calendarSync.ts`, `utils/ops/meetings.ts` | OAuth integrations |
| SSO | `utils/sso.ts` | Real identity provider |
| AI and Copilot | `utils/ai/*`, `utils/copilot/engine.ts` (`respond`), `utils/copilot/understand.ts` + `data/copilotUnderstanding.ts` (word lists), `utils/copilot/askAnything.ts` (question/guide matching), `utils/assistant/engine.ts` (rule-based) | Chosen model behind the server — page assistant per `AI_ASSISTANT_INTEGRATION.md`, Copilot per `COPILOT_AI_INTEGRATION.md` (keep screens, types, `makePlan`, limits; replace the rule logic; delete the word lists); credits, limits and the sensitive-data filter enforced server-side; links only from the allowlist |
| Speech-to-text | `hooks/useSpeechToText.ts` (browser API) | Acceptable as-is for the browser; a server model if quality requires, with consent |
| Watermarking, image variants, print orders | `WatermarkPreview.tsx`, data-saver images, print kit orders | File storage + processing + CDN + print partner |
| Analytics | Local events in this browser | Server-side collection with bot filtering and consent |
| Presence, multi-door check-in sync | `PresenceContext.tsx`, check-in sync | Real-time backend |
| Developer API, keys, webhooks | `utils/developers.ts` | Real API gateway |

## 3. Security logic that must move to the server

The browser may **show** these; only the server may **decide** them.
- **Authentication and sessions:** `utils/account/store.ts` (`kubicu.account`, including backup codes), `contexts/WorkspaceContext.tsx`, `utils/admin/staffSession.ts`.
- **Roles and permissions:** `data/permissions.ts`, `contexts/TeamContext.tsx`, `useCan`. Every API call checks permission again.
- **Staff console access and approvals:** `components/admin/StaffSignIn.tsx`, `data/staffRoles.ts`, `utils/admin/approvals.ts`. Staff actions need real audit logs and real second-person approval.
- **Plans, limits and feature gating:** `contexts/PlanContext.tsx`, `data/plans.ts`, `data/planMatrix.ts`, `utils/commerce/limits.ts`, `PlanLock`.
- **Prices, fees, VAT, splits:** `utils/commerce/money.ts`, `utils/money/escrow.ts`, `utils/partnerships.ts`. Never trust an amount sent from the browser.
- **Wallet balances, orders, stock, tickets, licences:** `utils/money/store.ts`, `utils/commerce/storage.ts`, `utils/commerce/tickets.ts`, `utils/commerce/licence.ts`.
- **Rate limits and spam traps:** form daily limit (`utils/forms/storage.ts`, `kubicu.formRate`), AI credits (`data/aiLimits.ts`, `hooks/useAiUsage.ts`), automation run limits, honeypot (`utils/forms/logic.ts`, `submit.ts`).
- **Kill switches and feature flags:** staff flags, e.g. `ai_page_setup`.
- **Publishing:** the published page must be rendered from the server's copy, not the editor's localStorage.

## 4. Fake codes and insecure tokens

- **One-time codes accept any 6 digits except 000000** and are often shown on screen: `account/ProfileTab.tsx`, `account/TwoStepDialog.tsx`, `admin/StaffSignIn.tsx` (`validCode`), `money/ConfirmMoneyDialog.tsx`, `kyc/steps/IdentityStep.tsx`, `whatsapp/WhatsAppSetup.tsx`, `pages/PartnerPortal.tsx`, `members/MemberSignInSheet.tsx`. Staff sign-in accepts any password of 8+ characters. **Replace all of them** with server-issued, expiring, rate-limited codes.
- **Tokens use `Math.random()`**, which isn't secure: `utils/id.ts`, `utils/partnerships.ts` (`newToken`), `utils/sso.ts` (`domainToken`), `utils/domains/dns.ts`, `utils/commerce/tickets.ts`, `utils/commerce/licence.ts`, backup codes in `utils/account/store.ts`, delivery codes in `utils/fulfilment.ts`, member sign-in codes. Download links, ticket QR codes, invite links, claim links (`utils/copilot/claim.ts`), licence keys and domain tokens must be generated server-side with a cryptographic generator, single-use where the flow says so, and signed. (`utils/developers.ts` uses `crypto.getRandomValues` — still move it server-side.)

## 5. Data stored in the browser

Every `kubicu.*` localStorage key is prototype storage. In production:
- Store nothing sensitive in the browser: no sessions beyond a secure HTTP-only cookie, no roles, balances, bank or card details, KYC documents, codes or other people's contact data.
- Device preferences (language, appearance, text size, reduced motion, sidebar collapsed, block shelf favourites) may stay on the device.
- There's no storage version or migration helper (only `utils/media/migrate.ts`). Don't build production migrations on these shapes; start from `types/` as the data model.

## 6. Content that isn't approved

Don't publish these until the named person signs off (`DECISIONS_FOR_SIGNOFF.md`).
| Content | Where | Blocker |
|---|---|---|
| **Legal documents** (`VERSION = 'Draft 1.0 — for legal review'`) | `data/legal/legalDocs.ts`, `data/legal/policyDocs.ts` | Lawyer (Group B) |
| **Translations** — every non-English string is an unreviewed draft, with no per-entry draft flag in code | `data/translations*.ts`, `data/searchGlossary.ts` | Native-speaker review (Group D). Until then, either ship English only or label languages as drafts |
| **Plan prices, fees and limits** ("example figures") | `data/plans.ts`, `data/billing.ts`, `data/planMatrix.ts`, `utils/commerce/limits.ts`, `utils/money/escrow.ts` (timers, caps), `data/aiLimits.ts` | Founder. Note the conflict: `PLAN_MATRIX.md` says prices were confirmed in D105; `PROTOTYPE_STATUS.md` says deferred |
| **Exchange rates, country tax on KUBICU invoices, local billing entities** (D432) | `utils/fxRates.ts`, `data/billingCountries.ts` | Founder + tax advice + lawyer; choose the real daily rate source |
| **Payout limits, fees and wallet caps per country** (D432) | `data/payoutLimits.ts` | Licensed payment partner in each country |
| **M-Pesa Paybill number, Ghana network prefixes, payout arrival times; simulated mobile money, instant EFT and card screens** (D433) | `data/countries.ts`, `utils/mobileMoney.ts`, `utils/money/store.ts` (`payoutArrival`), `components/checkout/*Pay.tsx` | Replace with the real partner flows (Daraja STK push, MoMo/Telecel/AirtelTigo APIs, an instant EFT provider, card 3-D Secure) |
| **Phase 5 example figures and simulations** (D435–D452): tax rates and cross-border rules; courier names, rates and customs tracking; Xero/Sage connection, default account codes and payout transfers; Odoo/SAP/Sage X3 connection and the ERP's stock counts; sponsorship holds, 10% fee and tracked-link results; NFC tag prices, ordering and delivery | `utils/commerce/shopSettings.ts` (`vatFor`), `utils/commerce/crossBorder.ts`, `utils/fulfilment.ts` (`advanceCrossBorder`), `data/accountingProviders.ts`, `utils/accounting/sync.ts`, `data/erpProviders.ts`, `utils/erp/sync.ts`, `utils/sponsorships.ts`, `utils/nfc.ts` | Accountant/tax advice per country; real courier, accounting, ERP and NFC-printing partners; real escrow for sponsorships. Sponsorship briefs and NFC tags live in shared browser keys (`kubicu.sponsorships`, `kubicu.nfc`) and must move to the server |
| **Sample block list** | `utils/linkSafety.ts` | Replaced by a live service |
| **Help articles** | `data/help/` | Review against the real product |
| **Public roadmap** | `data/roadmap.ts` | Founder |
| **Sample businesses, people, photos** in templates, examples and marketing | `data/examples/*`, `data/kitPhotos.ts`, `data/designSystemSamples.ts`, CDN images | Confirm image licences and that every name is fictional and labelled |
| **Copilot privacy notice and AI data terms** | Copilot pages | Legal + AI provider choice |

## 7. Honest-labelling rule carries over

Several features are honestly labelled as unavailable in the prototype ("Not available yet", "Coming later", USSD off, AI packs, French). In production, a feature either works for real or keeps an honest unavailable state. **Never remove a simulation label and leave the fake behaviour behind it.**

## 8. Things that are fine to keep

Design tokens, components, layouts, copy (in English), validation rules, composition and accessibility checks, QR generation (`qrcode-generator`), camera scanning (`jsqr`), and the canvas editing model are the intended product behaviour. Reimplement or port them; they're the spec.

## 9. Before you write production code

1. Read `CLAUDE_HANDOFF.md` §18 and the blueprint's follow-on doc list (§4.5) — architecture, data model, security, payments and testing specs must exist first.
2. Get the founder's decisions on providers, prices and AI.
3. Get the lawyer's sign-off on legal text and the Copilot privacy notice.

## 10. Release gate (every item must be ticked)

- [ ] No `App` simulation props; `index.tsx` renders the real app with real providers.
- [ ] No `PrototypeNote`, "simulate" control, simulated person or test-mode strip remains (search: `simulat`, `PrototypeNote`, `SIMULATED_`, `SIM_`, `sample: true`, `Seed`, `resetDemo`).
- [ ] No one-time code check of the form "any 6 digits"; no code shown on screen (search: `000000`).
- [ ] No `Math.random()` in any token, code, id that grants access, or link (search: `Math.random`).
- [ ] No permission, plan, price, balance or limit decided only in the browser.
- [ ] No secret or provider credential in client code or localStorage.
- [ ] Legal text is lawyer-approved (no "Draft 1.0").
- [ ] Shipped languages are native-speaker approved, or clearly labelled drafts by founder decision.
- [ ] Prices and limits are founder-confirmed.
- [ ] Every provider-backed feature works end to end with a real provider, or shows an honest unavailable state.
- [ ] Accessibility manual checklist (`ACCESSIBILITY_REPORT.md` §6) done.
- [ ] Security and privacy (NDPA) review done.
