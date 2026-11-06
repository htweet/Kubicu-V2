# KUBICU — Implementation Backlog, Product Delivery Roadmap & Acceptance Gates

> **Prototype status note (24 Oct 2026):** this is the source spec and is not edited for status. What the prototype has built against each epic is tracked in `docs/DESIGN_GAP_AUDIT.md` §6. Every Phase 6 candidate below (IntentFlow, AI recommendations and experiments, Voice-to-Store, DealRoom, Trust Passport and proof-of-work, local fulfilment, community commerce and collaboration) is **now built in the prototype**, with partner parts simulated.

**Brand:** KUBICU  
**Primary domain:** `www.kub.icu` (reported by founder; confirm registrar/DNS and domain control)  
**Companion document:** `KUBICU_MASTER_BLUEPRINT.md`  
**Purpose:** Translate the master blueprint into a traceable, testable, phased delivery plan for product, design, engineering, QA, operations, security and go-to-market.  
**Status:** Proposed baseline. Prioritisation must be validated with Nigerian users and payment/fulfilment partners.

---

## 0. Non-negotiable project rules

1. The master blueprint is the parent strategy. This backlog decomposes it; it must not silently remove or water down its requirements.
2. Build a coherent, sellable core before attempting every advanced feature.
3. Public pages are mobile-first, fast, accessible, SEO-aware and resilient on lower-end Android devices and intermittent networks.
4. The editor is a real canvas/artboard with a structured page model—not a free-form design image. Every block is editable, responsive, reorderable and accessible.
5. All monetisation, modules, limits, integrations and capabilities must be controlled through server-side entitlements and feature flags.
6. Super-admin controls are operationally complete but least-privilege, audited and protected. A feature flag is not a substitute for authorization.
7. Payment providers are adapters. KUBICU must not store raw card data or claim to be a bank, payment processor or escrow provider unless separately authorised.
8. AI proposes; the user approves material public-facing, commercial, legal, price, inventory and messaging changes unless a specific bounded automation has been explicitly enabled.
9. Use explicit experiments, honest analytics and clear attribution windows. Do not promise conversion lift without evidence.
10. Build tenant isolation, consent, export, deletion, backup, incident response and observability from the start.
11. No fake scarcity, fake reviews, dark patterns, unauthorised scraping or non-compliant bulk messaging.
12. Each epic must have an owner, status, dependencies, estimate, acceptance criteria, test evidence and release notes.

## 1. Product north star

**North-star outcome:** Help a user convert audience attention into measurable, repeatable business outcomes from one owned, branded space.

**Primary activation event:** A new user publishes a complete public KUBICU page with at least one meaningful action (link, enquiry, booking or product) and successfully opens it on a mobile device.

**Primary business outcome:** Monthly active published businesses that receive qualified actions (clicks, leads, bookings, paid orders or donations) rather than raw account registrations.

### Core funnel
Visit landing page → signup → choose use case → AI/manual setup → canvas editing → preview → publish → share → first visitor action → first lead/order/booking → repeat use → paid upgrade/referral.

### Metrics
- Activation: signup-to-published conversion; time-to-first-publish; onboarding abandonment.
- Quality: page load performance by device/network; editor crash rate; publishing failures.
- Engagement: active published pages; returning editors; meaningful visitor actions per page.
- Commerce: checkout initiation/completion; payment success/failure by provider/method; order fulfilment time; refund/dispute rate.
- Retention: 30/90-day creator retention; repeat purchase/booking; cohort survival.
- Revenue: MRR/ARR, gross margin, net revenue retention, churn, upgrade/downgrade rate, support cost per paid account.
- Trust: spam reports, fraud flags, chargebacks, consent complaints, data incidents, deletion/export completion.
- AI: task success, user acceptance, edit/rejection rate, cost per successful task, hallucination/unsupported-claim incidents.
- Marketplace: installation success, module adoption, compatibility failures, security incidents and rollback time.

Do not use vanity metrics as the only proof of product-market fit.

## 2. Delivery strategy and gates

### Phase 0 — Discovery, architecture and risk retirement
**Goal:** Resolve major uncertainties before expensive implementation.

Deliverables:
- 20–30 interviews across creators, freelancers, social sellers, service businesses and small brands.
- 8–12 observed prototype tests of mobile onboarding and canvas editing.
- Competitor matrix validated against current official documentation.
- Payment-provider account/merchant eligibility and fee review.
- Domain, trademark, privacy, tax, consumer-protection and messaging-policy review.
- Product requirement document, data map, threat model, event taxonomy and service-level objectives.
- Clickable mobile-first prototype and usability findings.
- Architecture decision records and cost model.

**Exit gate:** The team can name the first two user segments, the problem each will pay to solve, the MVP workflow, the likely acquisition channels and the reasons to choose KUBICU over free alternatives.

### Phase 1 — Core publishing MVP
**Goal:** Make a reliable, beautiful link-in-bio page that users can create, edit, publish and share.

Includes:
- Accounts, authentication, onboarding, profile/page creation.
- Structured canvas editor and mobile preview.
- Core blocks: profile, text, link, image, video/embed, divider, social icons, contact, FAQ, button, form, product teaser, booking CTA.
- Theme tokens, fonts, colours, backgrounds, button styles and spacing presets.
- Reorder, duplicate, hide, delete, undo/redo, autosave, draft/published states and version history.
- Hosted KUBICU URL, custom slug availability checks, QR generation.
- Public page renderer, responsive layout, SEO metadata, social preview cards.
- Basic analytics and privacy notice.
- Basic super-admin: accounts, pages, abuse reports, feature flags, audit log, support access controls.
- Free tier, plan entitlements, billing integration skeleton and upgrade screens.
- Monitoring, error reporting, backups, CI/CD and test automation.

**Exit gate:** A new user can publish without developer assistance; edits are safely saved; page is usable on mobile; public URLs are stable; support can resolve common issues; no critical tenant-isolation or payment-security issues remain.

### Phase 2 — Local commerce and customer capture
**Goal:** Turn pages into useful selling and lead-generation spaces.

Includes:
- Products, variants, pricing, stock, images, collections and product blocks.
- Orders, order states, receipts, customer notifications and seller dashboard.
- Payment provider adapter interface; first provider integration selected after commercial and eligibility validation.
- Payment verification using signed webhooks and server-side reconciliation.
- Bank transfer/card/USSD/other methods only where supported by the selected provider and merchant account.
- Checkout, delivery address, pickup, delivery zones/fees, order notes and seller fulfilment.
- Digital product secure delivery and buyer access records.
- Lead forms, consent records, contacts, tags, source attribution and CSV export.
- WhatsApp click-to-chat with product/order context; no unauthorised automated messaging.
- Discounts, coupons and transparent campaign codes.
- Refund workflows, dispute evidence and order support.
- Finance reports showing gross sales, provider fees, platform fees, refunds and net expected proceeds separately.

**Exit gate:** Test transactions reconcile correctly; duplicate webhook delivery cannot create duplicate orders; failed/cancelled payments do not release paid goods; refunds and support workflows are tested; sellers understand fees and payout timing.

### Phase 3 — Bookings, services and automation
**Goal:** Serve service-led businesses and remove repetitive work.

Includes:
- Service catalogue, duration, staff/resources, availability, buffers, booking limits and timezone handling.
- Deposits/full payment where provider supports it, cancellation policies and rescheduling.
- Calendar views and supported calendar integration.
- Confirmation, reminder and follow-up templates with consent and frequency limits.
- Workflow builder with trigger, condition, action, delay, test mode and execution log.
- Lead follow-up queue, task reminders and lightweight CRM.
- Email integrations and official messaging API integrations only after policy approval.
- Automation failure handling, retries, idempotency and pause/kill controls.
- Audit log for automation changes and outbound communication.
- AI-generated workflows with a human-readable explanation and test preview.

**Exit gate:** No double booking in concurrency tests; timezones and daylight-saving edge cases are handled; failed automations are visible and recoverable; consent and opt-out are enforced.

### Phase 4 — Custom domains and business identity
**Goal:** Let users own a professional web presence.

Includes:
- Domain connection wizard with DNS instructions and status checks.
- Domain verification and ownership challenge.
- Automated TLS certificate issuance/renewal and expiry monitoring.
- Host-header validation, domain-to-tenant mapping and reserved-domain protections.
- Canonical URLs, redirects, sitemap and domain-specific SEO metadata.
- Branded emails/receipts where deliverability configuration is available.
- Custom domain plan entitlements and support diagnostics.
- Domain migration, disconnect, renewal warning and recovery procedures.

**Exit gate:** Correct tenant serves for each verified domain; unverified domains cannot hijack content; SSL issuance/renewal and rollback are tested; no cross-tenant domain leakage; clear DNS troubleshooting is available.

### Phase 5 — SaaS operations and module marketplace
**Goal:** Make the platform manageable and extensible at scale.

Includes:
- Super-admin tenant lifecycle, suspension/appeal, plan changes, feature flags and usage controls.
- Billing, invoices, coupons, trials, failed-payment recovery, cancellations and entitlement reconciliation.
- Module registry, signed package metadata, manifests, compatibility constraints, install/upgrade/rollback/uninstall.
- Module permissions and scoped data access.
- Theme, block and integration marketplace with review, moderation, rating, refund and takedown workflows.
- Marketplace revenue-share ledger and creator statements.
- Admin analytics for activation, revenue, support, abuse, costs and service health.
- Support console with time-limited, audited impersonation or view-as access; sensitive values masked.
- Data export/deletion jobs and proof of completion.
- Status page, incident playbooks, service-level objectives and restore drills.

**Exit gate:** A module cannot silently obtain broad access; failed upgrades roll back; flags are server-enforced; every privileged action is auditable; billing state and entitlements reconcile reliably.

### Phase 6 — Differentiation and scale
**Goal:** Launch proven differentiators based on usage evidence.

Candidates:
- IntentFlow adaptive page experiences.
- AI conversion recommendations and controlled experiments.
- Voice-to-store in validated languages.
- DealRoom campaigns and product drops.
- Trust Passport and proof-of-work portfolio.
- Local fulfilment adapters and delivery status.
- Community commerce, creator collaboration and affiliate attribution.
- Micro-website mode.
- Lightweight/low-bandwidth public pages.
- Smart accessibility auditing.
- Advanced CRM segmentation and cohort analytics.
- Open module exchange and developer portal.

**Exit gate:** Each feature has demonstrated user demand, a safety review, support plan, measurable value, performance budget and unit-economics approval.

---

## 3. Epic catalogue

Priority definitions:
- **P0:** Required for safe, usable MVP or core architecture.
- **P1:** Needed for commerce-ready launch or early retention.
- **P2:** Differentiation after reliable core.
- **P3:** Advanced/experimental; research first.

### EPIC A — Identity, accounts and onboarding (P0)

**Stories**
- As a user, I can register and sign in using supported secure methods.
- As a user, I can recover access safely and revoke sessions.
- As a user, I can choose a goal (creator, freelancer, shop, service, event, portfolio) and get a relevant starter kit.
- As a user, I can create a page without entering every field.
- As a user, I can preview what is public before publishing.
- As an account owner, I can export my data and request deletion.

**Acceptance**
- Email verification and rate limits are active.
- Authentication secrets are never logged.
- Session invalidation works after password/security changes.
- Onboarding can be skipped and resumed.
- Required public information is distinguished from private account information.
- Deletion follows documented retention and legal exceptions; status is visible.

### EPIC B — Canvas/artboard builder (P0)

**Stories**
- User adds a block from a searchable block tray.
- User drags/reorders blocks on the canvas or through an accessible list control.
- User edits content and style in a properties inspector.
- User can switch device preview without losing work.
- User can undo/redo and restore an earlier version.
- User can hide, duplicate, lock, group or delete supported blocks.
- User can save reusable sections and apply templates.
- User can publish and see the live page.

**Acceptance**
- Page content is stored as a versioned, validated structured document.
- The canvas is not the source of truth as a screenshot or arbitrary HTML blob.
- Autosave status is explicit; conflict handling prevents silent overwrite.
- Dragging has keyboard-accessible alternatives.
- The public renderer sanitises untrusted content and restricts unsafe embeds.
- Block schemas have versioning and migration paths.
- Responsive behaviour is previewable at representative viewport sizes.
- Undo/redo covers all meaningful editor operations.
- Published versions remain stable while a draft is edited.

### EPIC C — Block and layout system (P0/P1)

**MVP blocks:** profile/identity, headline, rich text, link/button, social links, image, video/embed, divider, spacer, contact, FAQ, lead form, product highlight, service/booking CTA, map/location when enabled, newsletter signup.

**P1 blocks:** product grid, collection, reviews, countdown tied to a real event, event ticket CTA, downloadable file, audio, playlist, portfolio/case study, pricing table, donation/payment CTA, testimonial with source disclosure, menu, gallery, calendar availability.

**Acceptance**
- Every block defines schema, validation, editor controls, renderer, accessibility rules, analytics events and entitlement requirements.
- Unsupported blocks fail gracefully on old versions.
- Embed allowlists and content security policy are enforced.
- No block can execute arbitrary server code.
- Block availability is controlled by server-side entitlement and feature flags.

### EPIC D — Themes, templates and design system (P0)

**Stories**
- User chooses a template by business goal and aesthetic.
- User customises colours, typography, buttons, backgrounds, borders and spacing.
- User can use design tokens and reset individual controls.
- User can preview accessibility issues and contrast.
- User can save a branded theme and reuse it.

**Acceptance**
- Templates are responsive, tested and not merely screenshots.
- Theme values are validated; unreadable combinations are flagged.
- Motion respects reduced-motion preferences.
- Public pages meet the agreed performance budget.
- User content remains legible and functional across themes.

### EPIC E — Publishing, URLs, QR and SEO (P0)

**Stories**
- User reserves a unique handle.
- User publishes to a KUBICU subdomain/path.
- User generates a QR code for the page or a campaign destination.
- User configures title, description, share image and canonical URL.
- User can unpublish, redirect or restore a page with clear consequences.

**Acceptance**
- Slugs are normalised and collision-safe.
- Reserved names and impersonation risks are managed.
- Public routes do not expose internal IDs or private records.
- QR codes are scannable and include an accessible destination label.
- Redirects cannot be used for phishing or open-redirect abuse.
- Page removal and suspension produce predictable status codes and clear notices.

### EPIC F — Analytics and attribution (P0 basic, P1 advanced)

**Events**
`page_view`, `link_click`, `cta_click`, `form_start`, `form_submit`, `booking_start`, `booking_confirmed`, `checkout_start`, `payment_success`, `payment_failed`, `order_fulfilled`, `download_accessed`, `share_action`, `qr_scan` where measurable.

**Acceptance**
- Events include tenant/page identifiers and timestamp but exclude unnecessary sensitive payloads.
- Consent and applicable privacy rules govern non-essential tracking.
- Bot filtering and deduplication are documented.
- Click and conversion attribution windows are visible.
- Reports distinguish observed data from estimates.
- Export and retention controls are implemented.
- Users can understand which actions led to which orders without overstated causal claims.

### EPIC G — Products, inventory and orders (P1)

**Stories**
- Seller creates products with variants, prices, stock and media.
- Seller configures pickup, delivery, shipping charge and order instructions.
- Customer checks out and receives a confirmation.
- Seller updates fulfilment status and communicates changes.
- Seller handles cancellations, refunds and disputes.
- Seller can export order and sales records.

**Acceptance**
- Price and inventory are revalidated server-side at checkout.
- Order state transitions are explicit and auditable.
- Duplicate requests are idempotent.
- Currency, tax, discount, fee and refund arithmetic uses decimal-safe representations.
- Digital fulfilment is only enabled after verified payment.
- Low stock and out-of-stock states are consistent across page and checkout.
- Seller-facing reports separate gross amount, processor fee, KUBICU fee, refunds and net proceeds.

### EPIC H — Payment integrations (P1, provider decision gate)

**Architecture**
- Provider interface for checkout initiation, payment verification, refunds where supported, webhook validation, reconciliation and capability discovery.
- Per-country/per-currency capability configuration.
- Provider-specific metadata isolated behind adapters.
- Test/sandbox environment and documented go-live checklist.

**Acceptance**
- Server verifies the payment with the provider; browser redirects alone never prove payment.
- Webhook signatures and timestamps are verified according to provider documentation.
- Webhooks are idempotent, retryable and observable.
- Secrets are stored in a managed secret facility and never exposed to clients.
- Settlement, refund and payout timing are described accurately.
- A provider outage does not corrupt order state.
- Platform fees are disclosed before purchase.
- KUBICU does not custody seller funds or imply escrow without a properly reviewed and authorised arrangement.

**Decision gate:** Compare provider fees, local methods, international cards, refunds, recurring billing, split-payment capabilities, settlement, merchant onboarding, fraud tools, support and country availability. Official provider capability pages show that supported methods differ by country and account; integrations must be validated against the actual merchant account, not a generic marketing list.

### EPIC I — Digital goods (P1)

**Stories**
- Seller uploads a file or defines a digital access entitlement.
- Buyer receives a receipt and secure access link.
- Seller can update files for future buyers or provide a version update.
- Seller sets usage/licensing notes and refund policy.

**Acceptance**
- Download URLs are unguessable, scoped and optionally expiring.
- File type, size, malware scanning and storage limits are enforced.
- Access logs avoid exposing private content.
- The UI does not promise copy prevention that cannot be guaranteed.
- Refund and revoked-access rules are clear.

### EPIC J — Booking and services (P1)

**Stories**
- Seller defines services, duration, price, availability, buffer and location/meeting mode.
- Customer books a slot and receives confirmation.
- Seller reschedules or cancels with a recorded reason.
- System sends reminders only through configured, compliant channels.
- Customer can reschedule/cancel within policy.

**Acceptance**
- Slot reservation uses atomic conflict prevention.
- Time zones are stored and displayed correctly.
- Calendar conflicts and provider failures are handled.
- Deposits/refunds follow clearly stated rules.
- Intake data is minimised and protected.
- Booking reminders respect consent, frequency caps and opt-out.

### EPIC K — Leads, contacts and lightweight CRM (P1)

**Stories**
- User captures leads through forms and approved integrations.
- User sees source, consent, tags, notes and follow-up status.
- User assigns a lead, sets a task and records the outcome.
- User exports or deletes contacts according to policy.

**Acceptance**
- Consent record stores purpose, timestamp, source and relevant notice version.
- Duplicate detection is reviewable and reversible.
- Access is role-scoped.
- Bulk export and messaging are permissioned and audited.
- Unsubscribed contacts are suppressed from marketing sends.

### EPIC L — Workflow automation (P1/P2)

**Model:** Trigger → filter/condition → action → delay/schedule → success/failure branch.

**Initial triggers:** form submitted, booking created/cancelled, order paid, stock threshold reached, link campaign started/ended, lead inactive for a configured interval.

**Initial actions:** create task, send permitted email, notify owner, update tag/status, generate AI draft, call an approved webhook, produce report.

**Acceptance**
- Every workflow has a test mode, version, owner and execution log.
- Rate limits and retry/backoff are applied.
- Idempotency prevents duplicate side effects.
- Dangerous/high-impact actions require explicit permission and confirmation.
- Global kill switch and tenant-level pause exist.
- AI-generated workflows are previewed and approved before activation.
- Messaging-provider policy and consent rules are enforced.

### EPIC M — Custom domains (P1)

**Stories**
- User enters a domain they control.
- System provides DNS instructions and verification.
- System issues TLS and reports readiness.
- User maps domain to a selected page/site and sets canonical URL.
- User can disconnect, migrate or recover a domain.

**Acceptance**
- Ownership challenge is required.
- Domain and host-header allowlists prevent cross-tenant routing.
- DNS status is refreshed and understandable.
- Certificate issuance/renewal errors trigger alerts.
- Canonical URL, sitemap and redirects are correct.
- Domain lifecycle is logged.
- Support has a documented recovery process.

### EPIC N — SaaS plans, billing and entitlements (P0 foundation, P1 full)

**Stories**
- Admin creates plans, limits, trials and feature entitlements.
- User upgrades, downgrades, cancels or changes billing period.
- System handles failed payment, grace period and cancellation.
- Admin can comp a plan or issue a credit with reason and audit record.
- User sees usage, renewal date and invoice/receipt.

**Acceptance**
- Plan entitlements are enforced server-side on every protected operation.
- Billing webhooks are verified and idempotent.
- Downgrade does not silently delete user data.
- Limits have clear UI and graceful handling.
- Billing history and platform-fee accounting reconcile.
- Admin cannot edit historical financial records without an auditable correction.

### EPIC O — Super-admin operating system (P0 basic, P1 complete)

**Required areas**
1. Global dashboard and service health.
2. Tenants, users, teams and roles.
3. Pages, domains and publishing status.
4. Plans, subscriptions, invoices, coupons and entitlements.
5. Feature flags and rollout rules.
6. Module marketplace registry and compatibility.
7. Payment providers and integration health.
8. Orders, refunds and dispute support.
9. AI providers, model policies, budget limits and usage.
10. Abuse reports, spam, phishing, malware and moderation queues.
11. Support tickets, knowledge base and announcements.
12. Audit logs and privileged-access history.
13. Data export/deletion requests.
14. System settings, localisation and supported currencies.
15. Email, messaging and notification templates.
16. Analytics, experiments and operational reports.
17. Backups, restores, incident management and status page.
18. Legal pages, policy versions and consent notices.
19. Feature/plan catalogue and public marketing content.
20. Admin staff, RBAC, MFA and access reviews.

**Acceptance**
- Role-based access control follows least privilege.
- MFA is required for privileged users.
- Sensitive actions require step-up confirmation.
- Support impersonation is time-limited, justified, visible and logged; sensitive secrets remain masked.
- Feature flags are evaluated server-side and can target environment, plan, tenant cohort or percentage rollout.
- Every global change has a preview or blast-radius warning where appropriate.
- Emergency kill switches are tested.
- Admin dashboard is not exposed through obscurity; all routes are protected.
- Audit records are append-only or tamper-evident with retention rules.

### EPIC P — Module marketplace and modular architecture (P0 foundations, P2 marketplace)

**Module types:** block, theme, integration, automation recipe, report, business vertical kit, admin extension.

**Manifest fields:** module ID, version, publisher, description, supported platform versions, required permissions, routes, events, migrations, dependencies, external services, data access scope, pricing, update policy and support contact.

**Acceptance**
- Module signatures/checksums are verified.
- Permissions are explicit and consented to by the tenant.
- Modules run with scoped capabilities; do not execute arbitrary untrusted code in the core process.
- Compatibility checks happen before installation.
- Installation, upgrade and removal have migration/rollback plans.
- Marketplace review covers security, accessibility, privacy, billing and misleading claims.
- Admin can pause, revoke or roll back a module globally and per tenant.
- Marketplace commission and refunds are documented.
- Uninstall explains what data will be retained or deleted.

### EPIC Q — AI copilot and generation (P1 basic, P2 advanced)

**Initial tasks:** generate page draft, rewrite CTA, suggest blocks, generate product description from provided facts, draft FAQ, summarise analytics, propose follow-up, detect missing setup information.

**Acceptance**
- AI output is grounded in user-supplied or verified data.
- Price, inventory, delivery promises, testimonials, credentials and legal policies are not invented.
- User approves publication and material commercial changes by default.
- Prompt and model usage are budgeted and observable.
- Private tenant data is not sent to third-party models without configured permissions and appropriate disclosures.
- Output can be edited, regenerated and reverted.
- Recommendations show the evidence and limitations.
- Abuse controls prevent generated spam, impersonation and deceptive content.
- Fallback/manual path exists when AI is unavailable.

### EPIC R — Security, privacy and trust (P0)

**Deliverables**
- Threat model and data-flow map.
- Tenant-isolation test suite.
- Secure secrets and key rotation.
- Encryption in transit and at rest where supported.
- Input validation, output encoding, CSRF protections, CSP and safe embed policy.
- Rate limits, abuse detection and account recovery controls.
- Audit logging and privileged-access review.
- Data retention, export and deletion procedures.
- Incident response, breach triage and notification process.
- Dependency scanning, SBOM, patch process and backup restoration drills.
- Privacy notice, cookie/analytics controls, consent and messaging opt-out.
- Payment-provider security boundary and webhook threat model.

**Acceptance**
- Cross-tenant IDOR tests fail safely.
- Privileged access requires MFA and is logged.
- Secrets are absent from client bundles and logs.
- Public page content cannot inject executable scripts.
- Backups restore within agreed RTO/RPO.
- Security-critical findings block release.
- Legal counsel reviews obligations in launch markets; product does not assume one policy fits every African country.

### EPIC S — Accessibility, performance and resilience (P0)

**Acceptance targets to validate on real devices**
- Public page LCP target ≤ 2.5 seconds at the 75th percentile for agreed representative mobile conditions.
- Public page CLS target ≤ 0.1 at the 75th percentile.
- INP target ≤ 200 ms at the 75th percentile where measurable.
- Avoid large render-blocking scripts and autoplay media.
- Image resizing, modern formats, lazy loading and explicit dimensions.
- Keyboard operation and visible focus in editor and public page.
- Contrast and accessible names checked automatically and manually.
- Reduced-motion support.
- Graceful degradation when third-party embeds fail.
- Autosave queue recovers after temporary disconnection.
- Public published page remains available if editor-side AI is down.

These are engineering targets, not a guarantee; test with real-user monitoring and representative devices.

### EPIC T — Trust, moderation and safety (P0/P1)

**Stories**
- Visitors report a page or suspicious link.
- Admin reviews evidence and takes proportionate action.
- Page owner can appeal.
- Platform detects phishing, malware links, impersonation, spam and deceptive commerce patterns.
- Verified claims explain their scope.

**Acceptance**
- Reports receive case IDs and statuses.
- Enforcement reasons and appeal routes are recorded.
- False positives can be reversed.
- Detection combines automation with review; no opaque score is the sole basis for severe action where review is practical.
- Emergency response can disable a harmful link/page rapidly.
- Verification badges never imply guarantees beyond the stated checks.

### EPIC U — Internationalisation and African market fit (P1)

**Requirements**
- Currency, locale, timezone, phone format, address format and date/number formatting are configurable.
- Start with Nigerian English and NGN; design data and UI for additional languages and markets.
- Payment and shipping capabilities are configured per country and provider.
- Translation strings are not hard-coded into UI logic.
- Templates reflect diverse African business categories and aesthetics without stereotypes.
- Low-bandwidth mode, compressed media and graceful offline editing are considered.
- Local policies are reviewed per market.

### EPIC V — IntentFlow and adaptive pages (P2)

**Stories**
- User creates explicit campaign-specific page variants.
- User maps a QR/campaign link to a variant.
- User sees performance by source.
- User can run an A/B test with a declared metric and duration.
- User can roll back immediately.

**Acceptance**
- Visitors are not profiled using sensitive inferred attributes.
- Variant rules are visible to the owner.
- Experiment assignment and conversion windows are documented.
- No claim of causal improvement without a valid experiment.
- Privacy controls and retention rules apply.

### EPIC W — DealRoom and community commerce (P2)

**Stories**
- Seller creates a campaign room with products, bundle, real deadline and fulfilment terms.
- Customers join a group order or campaign where supported.
- Creator can issue trackable referral links.
- Seller sees order and referral attribution.

**Acceptance**
- Stock and deadlines use server-authoritative state.
- Referral rewards have abuse limits and explicit terms.
- Payment and fulfilment remain linked to real orders.
- No fake countdown, fake demand or undisclosed paid endorsement.

### EPIC X — Trust Passport and Proof-of-Work (P2)

**Stories**
- User submits verification evidence.
- System records what was checked, date, verifier and expiry.
- User assembles portfolio/case studies with source attribution.
- Visitor can report misleading claims.

**Acceptance**
- Verification is granular and revocable.
- Sensitive evidence is access-restricted and retention-limited.
- A badge does not guarantee quality or financial safety.
- Testimonials and work samples can show attribution/permission status.
- Verification vendors are replaceable adapters.

### EPIC Y — Local fulfilment and partner ecosystem (P2)

**Stories**
- Seller configures delivery zones, pickup and dispatch handoff.
- Customer sees estimated delivery conditions and charges before paying.
- Seller tracks dispatch status and proof of delivery.
- Partner integrations can be enabled by country.

**Acceptance**
- Estimates are labelled estimates unless contractually guaranteed.
- Delivery provider failures do not lose orders.
- Customer address data is shared only as needed and with appropriate disclosures.
- Refund responsibility and delivery disputes are clear.

### EPIC Z — Developer experience and public API (P2)

**Deliverables**
- Versioned API, scoped keys, OAuth where appropriate, webhooks, signature validation, rate limits, developer docs, sandbox and changelog.
- SDKs only where supported by demand.
- Module starter kit, linting, test harness and review checklist.

**Acceptance**
- API keys can be rotated/revoked.
- Webhooks retry with signatures and idempotency guidance.
- Breaking changes have deprecation windows.
- Tenants can inspect connected apps and revoke access.
- No module receives broader permissions than necessary.

---

## 4. Initial release definition

### MVP must include
- Secure accounts and basic onboarding.
- One page per account initially, with architecture ready for multiple pages/workspaces.
- Canvas-based editor and block system.
- Templates and design tokens.
- Public hosted URL, QR and social preview.
- Link clicks/basic analytics.
- Core super-admin operations and server-side feature flags.
- Plans/entitlement foundations.
- Privacy, abuse reporting, backups, monitoring and audit logging.
- Mobile performance and accessibility baseline.

### Do not make these MVP blockers
Unless discovery proves they are essential, defer:
- Full native mobile applications.
- A full general-purpose website builder with arbitrary layout grids.
- Complex marketplace revenue sharing.
- Built-in logistics fleet.
- AI autonomous publication.
- Multi-country tax engine.
- Advanced affiliate network.
- Community social network.
- Fully custom third-party executable plugins.
- Every possible payment provider.

### Commerce-ready public launch adds
- At least one verified payment integration for the initial merchant segment.
- Product/order/fulfilment workflow.
- Consent-aware lead capture.
- Refund and dispute handling.
- Booking only if chosen as a launch vertical.
- Clear fees, terms and support procedures.

---

## 5. Technical architecture requirements

Choose exact technologies after a short architecture spike and skill/cost review. Do not pick a framework solely because it is fashionable.

### Recommended logical domains
1. Identity and access.
2. Tenants, workspaces and membership.
3. Page document and canvas.
4. Publishing and rendering.
5. Assets and media.
6. Domain and routing.
7. Analytics and attribution.
8. Catalogue, inventory and orders.
9. Checkout and payment adapters.
10. Booking and availability.
11. CRM and consent.
12. Automation engine.
13. AI orchestration and budgets.
14. Plans, billing and entitlements.
15. Module registry/marketplace.
16. Moderation and trust.
17. Notifications.
18. Audit and observability.
19. Admin operations.
20. Integrations and public API.

### Architecture principles
- Start with a well-modularised application and explicit domain boundaries; do not introduce microservices before load/team needs justify the operational overhead.
- Use relational data for transactional entities and a versioned JSON schema for page documents where appropriate.
- Store media in object storage with signed uploads, scanning and CDN delivery.
- Queue slow jobs: email, media processing, analytics aggregation, AI tasks, webhooks, exports and scheduled publishing.
- Use transactional outbox or equivalent patterns for reliable event publication.
- Design idempotency for payments, webhooks, orders and automations.
- Keep public rendering cacheable while purging or versioning cache on publish.
- Separate public published content from private draft/editor data.
- Use feature flags for controlled rollout, but enforce permissions and plan entitlements separately.
- Create provider adapters for payments, email, messaging, calendars, analytics and fulfilment.
- Maintain data portability and documented migration paths.

### Core entities (initial)
`User`, `Tenant`, `Membership`, `Role`, `Page`, `PageVersion`, `BlockDefinition`, `Theme`, `Asset`, `Domain`, `Redirect`, `Plan`, `Subscription`, `Entitlement`, `FeatureFlag`, `Product`, `ProductVariant`, `InventoryMovement`, `Order`, `OrderItem`, `PaymentAttempt`, `Refund`, `Booking`, `Service`, `AvailabilityRule`, `Contact`, `ConsentRecord`, `Lead`, `Automation`, `AutomationRun`, `AnalyticsEvent`, `IntegrationConnection`, `Module`, `ModuleVersion`, `ModuleInstallation`, `AbuseReport`, `SupportCase`, `AuditEvent`.

### Page document example
A page is a validated structured tree with stable block IDs, typed properties, design tokens, visibility rules, schema version and content version. It must not allow arbitrary executable code. The editor writes a draft document; publishing creates an immutable published version used by the public renderer.

---

## 6. QA and release gates

### Automated test layers
- Unit tests: pricing, entitlements, page schema, routing rules, booking availability, automation conditions.
- Integration tests: payment adapters, webhooks, storage, email and domain lifecycle.
- End-to-end: onboarding → create page → publish → visitor action; product → checkout → verified payment → fulfilment; booking → confirmation → cancellation.
- Security: tenant isolation, IDOR, XSS, CSRF, SSRF, open redirects, auth bypass, privilege escalation, webhook replay, upload abuse and rate-limit bypass.
- Performance: public page render, editor canvas, analytics ingestion, publish cache purge and checkout.
- Accessibility: keyboard, screen reader smoke tests, contrast, focus, forms and reduced motion.
- Recovery: backup restore, queue retry, payment provider outage and deployment rollback.

### Release blockers
- Any critical security issue.
- Cross-tenant data exposure.
- Unverified payment can unlock paid goods.
- Duplicate webhook causes duplicate financial state.
- Publishing can lose user content silently.
- Custom domain can serve another tenant's page.
- Unsubscribe/consent suppression is bypassed.
- Restore procedure has not been tested.
- A core user journey is unusable on a supported mobile device.

### Beta process
1. Internal team dogfood.
2. 10–20 invited creators/sellers.
3. 50–100 diverse beta users.
4. Fix activation and reliability problems.
5. Commerce pilot with selected merchants and support coverage.
6. Public launch only after release gates pass.

Do not treat these sample counts as statistically sufficient proof; use qualitative and quantitative evidence.

---

## 7. Initial commercial model to test

Pricing is a hypothesis for customer discovery, not a promise or a final tariff. Test willingness to pay and gross margin before launch.

| Plan | Initial test range | Intended customer | Main boundaries |
|---|---:|---|---|
| Free | ₦0 | New creators and hobby users | Hosted KUBICU URL, basic blocks, limited analytics/AI |
| Creator | ₦2,500–₦4,000/month | Professionals and growing creators | More themes, richer analytics, remove platform branding, basic AI allowance |
| Pro | ₦6,000–₦10,000/month | Sellers, freelancers and service businesses | Commerce, leads, automations, advanced analytics and domain connection |
| Business | ₦15,000–₦30,000/month | Small teams and growing brands | Team roles, multiple pages, custom branding, more automation and reporting |
| Studio/Agency | ₦35,000–₦100,000+/month | Agencies managing multiple clients | Multi-workspace, client handoff, white-label options, bulk operations and support |
| Enterprise | Quote | Larger organisations/platform partners | SSO where justified, custom limits, SLA, security review and managed onboarding |

### Revenue streams
- Monthly/annual subscriptions.
- AI credit packs or metered premium tasks with cost transparency.
- Paid themes, blocks, templates and module marketplace commission.
- Optional platform commerce fee, clearly disclosed and competitively tested.
- Agency/studio plans and white-label capability.
- Domain-related services or partner referrals where lawful and transparent.
- Premium analytics, automation and team seats.
- Enterprise support and integrations.
- Carefully curated partner marketplace.

**Do not rely on hidden fees.** Processor fees, KUBICU fees, taxes, refunds and net proceeds should be separately visible. Avoid charging a platform percentage on the free plan unless user research shows it is accepted and it does not damage trust.

### Unit economics gate
For each plan, estimate:
`Gross profit = subscription + platform revenue - payment processing borne by KUBICU - AI inference - storage/CDN - messaging - support - marketplace payouts - refunds/chargebacks attributable to KUBICU`.

Set limits based on measured costs, not arbitrary feature counts. AI usage must have per-tenant budgets, throttling and abuse controls.

---

## 8. Research and launch workstreams

### Research
- Interview users who sell via WhatsApp/Instagram and those who currently use Linktree, Beacons, Stan, Paystack Commerce, storefront builders or manual forms.
- Test willingness to pay at proposed plan prices.
- Identify top three verticals rather than targeting everyone equally on day one.
- Verify local provider fees, settlement, refund, recurring billing, fraud tools and merchant onboarding.
- Test page creation on lower-end Android devices and unstable connections.
- Audit competitor pricing/features immediately before public launch; competitor features and eligibility change.

### Brand and domain
- Verify control of `kub.icu`, registrar account security, DNS, renewals and recovery email.
- Confirm trademark availability and potential conflicts in target countries.
- Reserve matching social handles if available.
- Configure SPF, DKIM and DMARC before sending transactional or marketing email.
- Use a branded status page and support contact.
- Keep the public promise specific and testable; avoid “first ever” or “guaranteed to increase sales” claims without proof.

### Launch positioning
**Primary message:** “Your corner of the internet. Your whole business.”

**Initial wedge:** A beautiful mobile-first page that can collect leads, sell products/services, take bookings and route customers into WhatsApp—with local commerce workflows and custom-domain ownership.

**Do not position as:** “the African Linktree clone.” That limits the perceived value and invites feature-by-feature comparison.

---

## 9. Award-calibre product design brief

A product award is an outcome, not a feature. Design and engineering should demonstrate a distinctive, coherent experience across the full journey.

### Product experience principles
- **Fast first success:** users can publish a useful page before being forced into a long setup wizard.
- **Visible structure:** every canvas component has a clear name, hierarchy and predictable controls.
- **Direct manipulation:** drag, reorder and edit blocks with touch-friendly controls; provide keyboard alternatives.
- **Trust by design:** show fees, data use, payment status, delivery terms and consent clearly.
- **Progressive power:** beginner-friendly defaults with advanced controls available when needed.
- **Real-world African context:** build for mobile-first usage, WhatsApp-led commerce, local payment methods and varied connectivity without flattening diverse markets into one stereotype.
- **Graceful failure:** autosave, recoverable edits, understandable error states and reliable retry.
- **Performance as design:** page speed, image optimisation and low-data modes are core features.
- **User ownership:** export, portability, custom domain, redirects and transparent cancellation.
- **Responsible AI:** explain recommendations, expose uncertainty and keep the user in control.

### Signature experience to prototype
A Nigerian fashion seller types or speaks: “I sell ready-to-wear clothes in Lagos. Customers should choose size and colour, pay, and select delivery or pickup. I want WhatsApp questions and a premium black-and-cream look.”

KUBICU generates a draft page with:
- branded hero and identity,
- editable product collection and variants,
- real inventory fields left blank until supplied,
- delivery/pickup setup prompts,
- WhatsApp CTA,
- FAQ/policy prompts,
- payment integration setup,
- analytics events,
- suggested campaign QR,
- a preview of mobile layout.

The system must clearly mark assumptions and missing facts, never invent stock, prices, delivery guarantees, testimonials or policy terms, and require the seller to approve publication.

---

## 10. Definition of done for every feature

A feature is not complete until:
- User story and non-goals are documented.
- Design covers loading, empty, success, failure, permission-denied and mobile states.
- Server-side authorization and entitlements are enforced.
- Data model and migrations are reviewed.
- Analytics and audit events are specified.
- Accessibility is checked.
- Unit/integration/e2e tests are added where relevant.
- Security and privacy implications are reviewed.
- Performance and failure handling are considered.
- Admin/support runbook exists for operationally significant functionality.
- Help copy and user-facing fee/consent disclosures are written.
- Feature flag and rollback path exist when appropriate.
- Documentation, changelog and release notes are updated.
- Product owner accepts the feature against explicit criteria.

---

## 11. AI-builder / engineering execution prompt

Use this prompt with the chosen implementation AI or engineering team:

> You are implementing KUBICU using `KUBICU_MASTER_BLUEPRINT.md` as the parent product specification and `KUBICU_IMPLEMENTATION_BACKLOG.md` as the delivery plan. Preserve the full strategic scope; do not silently omit, simplify or reinterpret requirements. First inspect both documents, identify contradictions and missing decisions, then produce a traceability matrix linking every master requirement to an epic, story, test and release phase. Do not begin large-scale code generation before architecture decisions, data boundaries, page-document schema, tenant isolation, entitlement model and payment-security boundaries are approved.
>
> Build incrementally. Start with Phase 0 decisions and a working vertical slice: sign up → create page → edit/reorder blocks on the canvas → preview → publish → open public URL on a mobile device → measure a click. Use a modular architecture with explicit domain boundaries, server-side authorization, tenant isolation, versioned page schemas, accessible controls, observability, automated tests and feature flags. Do not introduce arbitrary executable third-party plugins into the core process. Do not store raw card details. Verify payments server-side and make webhook processing idempotent. AI must not invent prices, inventory, reviews, policies or guarantees.
>
> For every phase, deliver working software, tests, documentation, migration/rollback steps, known limitations and evidence that the acceptance gates pass. Maintain a requirement traceability matrix. Mark incomplete items honestly. Do not replace implementation with mock screens, hard-coded demo data or non-functional buttons. Ask a concise decision question only when a missing decision blocks safe implementation; otherwise document a reversible assumption and proceed.
>
> Before each release, run the relevant security, privacy, accessibility, performance, mobile, recovery and acceptance suites. Never claim a requirement is complete without test evidence. Keep all future concepts visible in the backlog even when deferred.

## 12. First 10 execution tickets

1. **KUB-001 — Product decision register:** confirm initial verticals, MVP scope, initial payment provider candidate, first pricing tests, and public URL pattern.
2. **KUB-002 — User research plan:** interview guide, recruitment criteria, usability tasks and synthesis template.
3. **KUB-003 — Architecture decision records:** tenancy, page schema, rendering, storage, queues, analytics and provider adapters.
4. **KUB-004 — Threat model and data map:** identify private data, trust boundaries, abuse vectors and mitigations.
5. **KUB-005 — Design system:** mobile-first tokens, typography, spacing, components, states, accessibility and brand directions.
6. **KUB-006 — Page document schema:** stable block IDs, schema versions, validation and migration tests.
7. **KUB-007 — Canvas vertical slice:** add/edit/reorder/undo/preview/save/publish one block end-to-end.
8. **KUB-008 — Public renderer:** mobile page rendering, caching, SEO/social metadata, sanitisation and performance test.
9. **KUB-009 — Tenant and entitlement foundation:** enforce server-side tenant boundaries and feature/plan access.
10. **KUB-010 — Release pipeline and observability:** CI tests, staging, deploy/rollback, logs, metrics, alerts and backup restore drill.

## 13. Final implementation principle

**Ship a reliable, lovable core; then earn the right to add complexity.** KUBICU can become an ambitious creator-business platform, but the defensible product is built through fast first success, trusted commerce, reliable operations, strong mobile performance and user-owned distribution—not through an unvalidated accumulation of features.

# 14. New epic — KUBICU WhatsApp-first Copilot

## Outcome
A prospective user can describe a website/page idea through an approved conversational channel, receive a validated KUBICU draft plus PNG and interactive web preview, then create an account or sign in and securely claim the draft in Canvas. KUBICU remains the source of truth for page documents, permissions, publishing, and billing.

## Non-negotiable feasibility gate
Do not assume the WhatsApp Business Platform API is eligible for a product whose primary purpose is AI-assisted website creation. The published WhatsApp Business Solution Terms restrict AI Providers using the Business Solution when AI is the primary rather than incidental functionality, with exceptions stated for EEA/Brazil phone numbers. Verify the current policy and obtain explicit eligibility confirmation before using that route for Nigerian Copilot users.

Evaluate the official WhatsApp Third-Party Agent Platform separately. Its published terms currently state that the platform is free of charge, but official help material says availability is limited by country. Verify Nigeria availability, agent-provider access, user setup experience, rate limits, technical API usage, and developer terms. Third-party-agent chats are not end-to-end encrypted like personal chats; the privacy notice must disclose this clearly. Do not use unofficial WhatsApp Web automation or session bridges.

If approved WhatsApp access is unavailable or unsuitable, ship the web Copilot first and provide a conventional WhatsApp handoff as fallback. Do not represent a simple `wa.me` link as an AI integration.

Official sources to review at implementation time:
- https://www.whatsapp.com/legal/third-party-agents-terms
- https://faq.whatsapp.com/1050934623978152
- https://faq.whatsapp.com/1002544104126998
- https://www.whatsapp.com/legal/business-solution-terms
- https://whatsappbusiness.com/policy/
- https://whatsappbusiness.com/resources/faq/
- https://www.whatsapp.com/developer/WhatsApp-Agent-Platform-Developer-Manual.pdf

## Epic sequence and tickets

### KUB-WA-001 — Channel feasibility and policy ADR
**Priority:** Blocker / Phase 0

- Verify Third-Party Agent Platform access, product eligibility and Nigerian availability.
- Verify the actual consumer connection flow; do not assume the user can simply message a business number.
- Obtain current policy guidance for the Business Platform route.
- Document privacy/encryption implications, developer terms, rate limits, pricing and operational risks.
- Compare official routes and select a primary path plus fallback.
- **Acceptance:** ADR has official sources, dated findings, unresolved questions, go/no-go status and an approved fallback.

### KUB-WA-002 — Cost and provider strategy
**Priority:** High / Phase 0

- Estimate model tokens/compute, conversation turns, PNG rendering, storage, delivery, logs and hosting per successful page draft.
- Define model-provider abstraction and evaluate hosted inference versus self-hosted open-weight inference using total cost of ownership.
- Establish rate limits, quota policy, per-session budget, abuse controls and platform budget alerts.
- **Acceptance:** cost model uses measured pilot data or explicitly labelled assumptions; no “zero cost” claim; provider can be swapped without rewriting conversation/domain logic.

### KUB-WA-003 — Copilot conversation and session state
**Priority:** High / Phase 1

- Implement a resumable conversation state machine independent of the transport channel.
- Capture page goal, target audience, market, brand identity, style, content, assets, desired sections, primary CTA and missing facts.
- Ask only relevant missing questions; support skip, correction, “not sure”, and confirmation of a concise brief.
- Keep deterministic decisions outside the LLM.
- **Acceptance:** interrupted sessions resume; context is not lost; duplicate incoming events are idempotent; question flow passes usability tests.

### KUB-WA-004 — Structured page brief and schema contract
**Priority:** High / Phase 1

- Define a versioned `PageBrief` schema and map it to the existing page document schema.
- Connect generation to existing templates, themes, block registry, compatibility rules and section presets.
- Validate every generated operation server-side; never execute model-generated scripts or SQL.
- Represent unknown business facts as explicit editable placeholders.
- **Acceptance:** invalid block types, bad URLs, unsupported features and malformed page documents are rejected or repaired through deterministic validation with useful errors.

### KUB-WA-005 — Draft generation service
**Priority:** High / Phase 1

- Create a draft page owned by an anonymous Copilot session before account creation.
- Preserve template, theme, block IDs, content, assets and schema version.
- Store assumptions and missing information for the user to review.
- Require explicit confirmation before generation when an action would be costly, and always require explicit approval before publishing.
- **Acceptance:** draft is editable in Canvas after claim; prices, stock, testimonials, credentials, policies and guarantees are never invented.

### KUB-WA-006 — PNG and interactive preview rendering
**Priority:** High / Phase 1

- Render the draft with the canonical KUBICU renderer in a non-indexed preview environment.
- Generate at least a mobile PNG, with desktop PNG optional where valuable.
- Provide an interactive preview URL that opens in the browser/in-app browser; do not imply full arbitrary page interactivity can be embedded directly inside WhatsApp.
- Cache unchanged renders and expire obsolete assets safely.
- **Acceptance:** image corresponds to the exact saved draft version; render errors are recoverable; preview is read-only, noindex, and has suitable cache controls.

### KUB-WA-007 — Secure draft claim and account handoff
**Priority:** Blocker / Phase 1

- Introduce a one-time or otherwise race-safe claim mechanism using cryptographically random tokens and server-side validation.
- Separate preview rights, claim rights, authenticated editing and publishing authorization.
- Route unauthenticated users to sign-up/login; never create accounts silently.
- Atomically assign the draft to an authenticated account/workspace and prevent duplicate claims.
- Handle expired tokens, reused tokens, account conflicts and interrupted sign-in.
- **Acceptance:** authorization, replay, cross-user access and duplicate-event tests pass; no phone number or internal database ID is exposed in a token URL.

### KUB-WA-008 — Approved WhatsApp channel adapter
**Priority:** Conditional / Phase 2

- Implement only after KUB-WA-001 approves a supported production route.
- Isolate receiving, sending, button/list replies, media handling, delivery status, rate limiting and retry from the page-generation domain logic.
- Provide explicit consent and privacy messaging; implement clear human/support escalation.
- **Acceptance:** production access and policy are evidenced; test and production credentials are separate; delivery failures do not lose the draft; unsupported regions route to the web fallback.

### KUB-WA-009 — Web Copilot fallback
**Priority:** High / Phase 1

- Implement the same conversational journey on KUBICU web using the same session, brief, generation, preview and claim services.
- Offer a conventional click-to-chat/human-support handoff where appropriate, without claiming the link is an automated AI bot.
- **Acceptance:** entire core creation journey can be completed without WhatsApp and still produces the same canonical draft.

### KUB-WA-010 — Privacy, retention and controls
**Priority:** Blocker before pilot

- Publish a clear disclosure covering messages/media processing, provider/channel, retention, deletion, and third-party-agent encryption limitations where applicable.
- Implement retention limits, user data access/deletion handling, minimal collection, secret storage, upload validation and prompt-injection controls.
- Keep phone/channel identifiers out of the public page unless the user explicitly adds them.
- **Acceptance:** privacy review, security review, retention job, deletion test and incident/escalation procedures are documented and validated.

### KUB-WA-011 — Cost and quality telemetry
**Priority:** High / Phase 1

- Track first response latency, clarification turns, generation latency, model/provider use, usage/cost estimate, render success, delivery status, edits, draft claims, and publication conversion.
- Build rate-limit and budget alerts and fallback states.
- **Acceptance:** per-session usage can be audited; spikes are rate-limited; the team can calculate cost per successful draft.

### KUB-WA-012 — QA, staged rollout and release gates
**Priority:** Blocker before production

- Test happy path, session interruption, malformed inputs, missing facts, unsupported blocks, model refusal/outage, render failures, channel outage, expired links, replayed claim tokens, duplicate webhooks, account conflict, mobile accessibility and publish validation.
- Pilot with invited users and synthetic/non-sensitive data before opening broadly.
- **Acceptance:** all critical tests pass; measured quality and cost are within approved thresholds; rollback/fallback is rehearsed.

## Metrics to instrument
- Time from first message to confirmed brief.
- Time from confirmed brief to first preview.
- Successful draft generation and preview-render rates.
- Percentage of users who edit the AI draft.
- Preview-to-account and account-to-claim conversion.
- Claim-to-publish conversion.
- Average conversation turns per successful draft.
- Model and channel cost per successful draft.
- Fallback usage, failed deliveries, expired-link rate and support escalations.
- Safety corrections and user-reported inaccurate business facts.

## Execution order
1. KUB-WA-001 feasibility/policy ADR.
2. KUB-WA-002 cost model and provider strategy.
3. KUB-WA-003, KUB-WA-004 and KUB-WA-005 conversation-to-draft vertical slice.
4. KUB-WA-006 preview renderer and KUB-WA-007 secure claim flow.
5. KUB-WA-009 web fallback pilot.
6. KUB-WA-010 and KUB-WA-011 privacy, security and telemetry hardening.
7. KUB-WA-008 approved WhatsApp adapter only when the gate passes.
8. KUB-WA-012 staged pilot and release review.

**Implementation principle:** build the Copilot as a channel-independent page-creation capability first. WhatsApp should make the experience easier to enter, not own the business logic or become a single point of failure.


# 15. New epic — Creator Pages, Marketplace, Short Links, Audience Manager & Public Mega Menu

**Revision date:** 29 October 2026. This epic extends existing page publishing, marketplace, CRM, QR, link/redirect, analytics and Copilot work; it is not permission to duplicate existing modules.

## Outcome
KUBICU exposes four public product pillars—Creator Pages, Marketplace, Short Links, and Audience Manager—with polished public landing pages, complete connected functionality in the authenticated product, and a shared icon-rich accessible mega menu across the public marketing website.

## Competitive baseline to exceed
Official Linktree public pages reviewed 29 October 2026 describe creator pages/mini-websites; a categorized marketplace of link apps and integrations; short links with channel/tag attribution and click statistics; and an Audience Manager for contacts/leads, source grouping, exports, integrations and subscriber notifications. Sources: https://linktr.ee/for/creators, https://linktr.ee/marketplace, https://linktr.ee/features/link-shortener, https://linktr.ee/features/audience-management. Revalidate before implementation. Use original KUBICU architecture, wording and visual identity.

## Non-negotiable rules
- Extend the current blueprint and existing schemas; do not create disconnected duplicate editors, CRM contact stores, URL services or analytics systems.
- Public marketing pages are distinct from user-created public pages and from authenticated app screens.
- Extension Marketplace is distinct from sellers' commerce catalogues and any future creator-brand deal marketplace.
- Click telemetry alone does not create an identifiable audience contact or marketing consent.
- Public page rendering and short-link redirects must not depend on non-critical AI, CRM or analytics availability.
- Marketplace extensions receive least-privilege access and use reviewed adapters, constrained APIs or isolation.
- Do not clone Linktree pixel-for-pixel; implement an original KUBICU icon-rich mega menu with comparable or better usability.
- Design prototypes may use illustrative data, but production claims/capabilities must be accurate.

## Ticket sequence

### KUB-PUB-001 — Public route inventory and navigation schema (P0)
Inspect existing routes and map/introduce `/for/creators`, `/marketplace`, marketplace browse/category/detail routes, `/tools/short-links`, `/features/audience-manager`, `/features`, and existing templates/themes/pricing/resources. Use an established alias if an equivalent route already exists. Define a route registry with SEO metadata and valid destinations.
**Acceptance:** Route and public/app split inventory reviewed; no duplicate canonical routes or dead links.

### KUB-PUB-002 — Shared public mega menu (P0)
Build shared desktop mega menu and mobile drawer/accordion. Include icon-rich grouped entries, short descriptions, featured CTA, keyboard/click/hover/touch support, Escape/focus restoration, active states, reduced motion and viewport-safe panel sizing.
**Acceptance:** Keyboard, screen-reader semantics, mouse/pointer, touch and mobile tests pass; menu is consistent across all public pages and distinct from app navigation.

### KUB-CRE-001 — Creator landing page (P1)
Produce full public page with realistic creator page previews, use cases, supported monetization, content, templates/themes, audience tools, Short Links, analytics and CTA.
**Acceptance:** Complete page, mobile/desktop, unique metadata, real links and no unsupported claims.

### KUB-CRE-002 — Creator page starter experience (P0/P1)
Use current Canvas/page schema, templates, themes, blocks, public renderer, URL resolver and analytics. Add creator-oriented presets only as configuration/composition.
**Acceptance:** Published creator page uses the standard page renderer and remains editable by owner in standard Canvas.

### KUB-MKT-001 — Marketplace listing schema and public discovery (P1/P2)
Define listing types: integrations, apps/block packs, themes, templates, section packs, automation recipes, industry kits and approved AI packs. Implement search/category/filter and detail pages. Keep marketplace extensions distinct from user product inventory.
**Acceptance:** Listings show version, publisher, compatibility, dependencies, entitlement, permissions/data access, support/privacy, changelog, pricing and true status.

### KUB-MKT-002 — Compatibility, permission disclosure and install lifecycle (P1/P2)
Implement sign-in, compatibility/entitlement preflight, consent to permissions, install/connect, configure, enable for workspace/page, status, update/rollback/uninstall and audit events.
**Acceptance:** No install bypasses server authorization; extensions are least-privilege; failed installs are recoverable; user data is preserved on uninstall as required.

### KUB-MKT-003 — Super-admin marketplace operations (P1/P2)
Integrate listing moderation, publisher metadata, manifest/version checks, review state, dependencies, feature flags, rollout, disable/rollback, incident actions and audit trail with existing admin console.
**Acceptance:** Admin actions are permissioned/audited; external code never gets unrestricted database/filesystem access.

### KUB-LNK-001 — ShortLink model, create API and redirect service (P0/P1)
Reuse existing link/redirect entities where appropriate. Add atomic unique slugs, URL validation, safe schemes, destination screening, rate limits, redirect-loop/open-redirect protections, caching/invalidation, abuse reporting and audit history.
**Acceptance:** Unique slug race test passes; unsafe URL blocked; redirects keep working when analytics/CRM/AI is unavailable; destination updates invalidate cache safely.

### KUB-LNK-002 — Short-link manager, QR and campaign metadata (P1)
Implement create, optional custom slug, destination preview, channel/campaign/tag metadata, QR generation, copy/share, list/detail, filtering, destination update, status and export/deletion.
**Acceptance:** QR points to the correct validated destination; campaign metadata is reproducible in analytics; permissions/limits are enforced server-side.

### KUB-LNK-003 — Short-link analytics and health (P1/P2)
Record privacy-minimized click/redirect events; bot filtering; optional link health; channel/tag/source reports; basic export and retention. Stage UTM presets, scheduled links, dynamic QR updates, branded domains and A/B routing only after foundation is stable.
**Acceptance:** UI separates raw clicks, filtered bots and estimated unique visitors; no click is labelled as a known contact; A/B claims require a documented experiment design.

### KUB-AUD-001 — Audience Manager over canonical contact/CRM data (P1)
Deliver overview, contacts, contact details, search/filter/tagging, segments, source/campaign view, imports/exports, duplicate review and meaningful empty/error states.
**Acceptance:** No second siloed contact database; all reads/exports are tenant scoped and role authorized.

### KUB-AUD-002 — Consent, source events, retention and deletion (P0/P1)
Define consent records, purpose/scope, timestamps, notices, unsubscribe/suppression, contact source events, safe dedupe, retention, export/deletion and audit. Integrate form, booking and supported commerce leads.
**Acceptance:** A click alone never creates an identified contact or marketing permission; suppression blocks outbound marketing; deletion/export tested.

### KUB-AUD-003 — Approved sync integrations (P2)
Implement adapter contracts for email/CRM tools or spreadsheets only after provider review; field mapping, least-privilege credentials, rate limits, retries/idempotency, logs and connection health.
**Acceptance:** Secrets never reach the client; failed sync can be retried; field mapping and consent scopes are visible.

### KUB-ANA-001 — Shared cross-feature event taxonomy (P1)
Connect page views/clicks, short-link redirects, QR scans, forms, audience contacts, marketplace visits/install events and supported conversions through shared event schema and attribution definitions.
**Acceptance:** Events are typed/versioned, tenant scoped, privacy reviewed, and analytics explain bot filtering, attribution windows and missing data.

### KUB-INT-001 — Creator/campaign/audience end-to-end integration QA (P1)
Test creator page → short link/QR → public page activity → form submission → contact with source/consent → permitted integration sync.
**Acceptance:** End-to-end tests pass; analytics and contact records agree within documented attribution constraints.

### KUB-INT-002 — Marketplace to Canvas integration QA (P1/P2)
Test listing browse → inspect permissions → sign in → compatibility check → install/connect → block/integration appears in correct workspace/Canvas → disable/rollback.
**Acceptance:** Entitlement and permissions persist; install status is truthful; rollback is audited.

### KUB-SEO-001 — Public landing-page SEO and performance (P1)
Unique metadata, canonical URLs, Open Graph images, sitemap, route tests, responsive images, lazy loading, low-bandwidth performance, and noindex on private previews/app pages.
**Acceptance:** No private draft is indexed; pages pass agreed performance/accessibility budgets; every nav link resolves.

## Release gates
Do not call these features fully integrated until public landing pages, real authenticated tools, shared data models, permissions, analytics, error handling, and cross-feature journeys work end to end. All work must pass tenant-isolation, redirect-safety, consent, data export/deletion, mobile, accessibility, regression and operational monitoring gates.
