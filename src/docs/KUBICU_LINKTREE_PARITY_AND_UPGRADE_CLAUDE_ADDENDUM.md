# KUBICU — Creator Pages, Marketplace, Short Links & Audience Manager
## Claude Engineering Addendum

**Revision:** 29 October 2026  
**Governing specs:** `KUBICU_MASTER_BLUEPRINT_UPDATED.md`, `KUBICU_IMPLEMENTATION_BACKLOG_UPDATED.md`, and the current KUBICU Canvas/Copilot specifications.  
**Purpose:** Engineering scope, domain boundaries, acceptance criteria and phased delivery for the four connected product pillars and the public-site mega menu.

## 1. Instruction hierarchy

Treat the KUBICU master blueprint as the governing architecture and the implementation backlog as the phase/ticket sequence. This addendum extends those documents and must not delete, replace, or water down existing approved scope. Inspect the repository, current schemas, routes, UI, feature flags, and integration contracts before implementing. Identify existing capabilities first; reuse rather than duplicating them.

Build original KUBICU branding and information architecture. Publicly available Linktree pages are competitive research only. Do not copy proprietary assets, text, logos, source code, or exact layouts.

## 2. Product areas and route requirements

Confirm current routing conventions and adapt route names consistently. Required public entry points:

- `/for/creators` — creator solution landing page.
- Existing public user page route — actual published creator/business page, not the marketing landing page.
- `/marketplace` — extension/integration marketplace landing page.
- `/marketplace/apps` and category/detail routes — public listing discovery.
- `/tools/short-links` — Short Links landing page and entry workflow.
- `/features/audience-manager` — Audience Manager landing page.
- `/features` — consolidated feature index.
- Existing `/templates`, `/themes`, pricing, resources and help routes where present.

Public marketing pages are accessible without authentication. Public marketplace listing details can be read without authentication. Installing/connect, managing short links, private contact records, exports, workspace settings, editing and publishing require appropriate authentication and authorization.

The marketing mega menu must not be reused as the authenticated workspace navigation. It is a separate public-site component sharing design tokens only.

## 3. Required module boundaries

Use the existing modular-monolith/clean-domain approach unless repository evidence justifies another architecture. Avoid new microservices solely to mirror public page categories.

### A. Public Website/CMS

Own public landing-page content, nav configuration where current architecture permits, SEO metadata, Open Graph data, canonical URLs, sitemap inclusion, page revisions and safe publishing. Do not hard-code feature names separately in every header/footer. Use a shared navigation/route registry with validated destinations.

### B. Creator Pages and Publishing

Reuse canonical KUBICU page documents, Canvas block schemas, templates, theme tokens, public renderer, publishing state, slug/domain resolver, QR and page analytics. Creator onboarding should preconfigure the common page builder, not create a divergent creator editor.

### C. Marketplace Catalogue and Runtime Lifecycle

Use one listing domain with explicit listing types, for example:

- `integration`
- `app_or_block_pack`
- `theme`
- `template`
- `section_pack`
- `automation_recipe`
- `industry_kit`
- `ai_workflow_pack` only when approved and supported

Keep the extension marketplace distinct from the customer's commerce product catalogue. Also keep it distinct from any future creator/brand collaboration marketplace.

Each listing should have: stable ID/slug, publisher/developer identity, version, title, description, screenshots/previews, category, pricing/entitlement, compatibility declaration, dependencies, required permissions, accessed data, region/provider constraints, privacy/terms links, support contact, changelog, moderation state, installability state and status. Reviews/ratings must only reflect genuine, moderated activity.

Installation should be a controlled lifecycle: inspect → compatibility/entitlement check → permission disclosure → user approval → initialize/connect → apply to workspace/page → verify → monitor → update/rollback/uninstall. External code must not run with unrestricted application database, filesystem or tenant data access. Preserve/export customer-owned data when uninstalling where required. First-party modules may use trusted build pipelines; third-party functionality must use constrained APIs, sandboxing or reviewed integration adapters.

### D. Short Links and Redirect Runtime

Keep link creation and redirection reliable and independent of non-critical analytics services. A redirect must work even if a dashboard chart, CRM sync, or AI service is degraded.

Suggested canonical entities; adapt to the current schema and avoid duplicate models:

- `ShortLink`: owner/workspace, slug, destination, status, created/updated timestamps, optional expiration, optional custom-domain reference.
- `ShortLinkDestinationVersion`: previous/new destination and reason/actor for auditable changes.
- `Campaign` or existing campaign entity.
- `LinkTag`/tag associations.
- `Channel` or `SharePlacement` metadata.
- `QRAsset`/QR destination configuration.
- `ClickEvent`: timestamp, short link, campaign/channel/tag, privacy-safe/referrer/device fields as permitted, bot/filter classification.
- `LinkHealthCheck`: destination availability and status where health checking is supported.

Required backend controls:

- Atomic slug creation with uniqueness guarantees.
- Allowlist URL schemes, normally HTTP/HTTPS; block JavaScript/data/file and other dangerous schemes.
- Phishing/malware checks, abuse reporting and review/appeal.
- Rate limiting, bot and brute-force controls, redirect-loop prevention, open-redirect protection and SSRF protections in any destination checker.
- Cache invalidation when destinations change.
- Appropriate redirect status decisions and explicit redirect behavior in tests.
- Avoid collecting unnecessary personal data in click events.
- Separate raw clicks, filtered bots, estimated unique visitors and QR scans. Do not present a click as a unique person.
- Privacy and retention policies, event quotas and deletion/export behavior.
- Audit logs for destination changes and high-risk actions.
- Custom domains only after domain ownership, DNS verification, SSL and redirect architecture are proven.

Optional advanced capabilities must be feature-flagged and staged: UTM builder, channel/tag presets, campaign dashboards, scheduled links, dynamic QR destination updates, broken-link alerts, expiry, A/B routing, API/webhooks, and branded short domains. Do not claim A/B testing without proper assignment, outcome definition, sample adequacy and statistical limitations.

### E. Audience Manager / CRM

Reuse the existing CRM/contact foundation. Avoid a second contacts table solely for Audience Manager. Audience Manager is a goal-oriented surface over the shared contact, form, consent, campaign, booking and commerce data.

Suggested concepts if absent:

- `AudienceContact` or canonical `Contact` with dedupe rules and stable tenant scope.
- `ContactIdentifier` with normalized email/phone values under appropriate protection.
- `ContactSourceEvent` for supported page/form/booking/order/campaign attribution.
- `ContactTag`, `Segment`, and versioned segment definition.
- `ConsentRecord` with scope/purpose, source, timestamp, applicable notice version, status and withdrawal/suppression.
- `IntegrationConnection` and `FieldMapping` for external audience syncs.
- `ExportJob`, `ImportJob`, `SyncRun` and redacted error records.
- `NotificationJob` only when outbound messaging is approved and consent requirements are met.

Rules:

- A click does not create a named contact by itself.
- A submitted form can create/update a contact under the configured disclosure and consent rules.
- Consent is distinct from source attribution and must not be inferred from a click.
- Do not merge contacts based on weak identifiers.
- Apply tenant and role authorization on every read/export/change.
- Support deletion, export, retention limits, suppression/unsubscribe and audit history.
- Do not send marketing messages to imported or captured contacts without the required legal basis and consent.
- Provider secrets stay server-side; external syncs use least-privilege scopes, retries, idempotency, rate limits and observable failure states.
- Consent, source and timestamp should flow consistently from forms and campaigns into CRM where appropriate.

### F. Analytics and Event Taxonomy

Use a shared event taxonomy across creator pages, short links, QR, marketplace installs, forms, and supported conversion events. Prefer stable event names and typed properties. Examples include `public_page_view`, `public_link_click`, `short_link_redirect`, `qr_scan`, `form_view`, `form_submission`, `audience_contact_created`, `audience_contact_updated`, `marketplace_listing_view`, `marketplace_install_started`, `marketplace_install_completed`, `marketplace_install_failed`, and supported commerce/booking conversion events.

Use tenant-scoped identifiers and data minimization. Avoid exposing contact PII in analytics dashboards. Document attribution windows, duplicate/bot filtering, missing data, and aggregation rules; never imply causal attribution when only a referrer or tag is known.

## 4. Cross-feature contract

The product must support these connected flows through shared services:

1. Creator page → short link/QR → campaign/channel attribution → page/target interaction → consented form submission → Audience Manager contact/source → permitted integration sync.
2. Marketplace public listing → sign-in → compatibility/entitlement/permission check → install/connect → approved block/integration appears inside Canvas/workspace → operational health and rollback are available to admins.
3. Short-link creation from a public page, page block, product, booking or campaign → same canonical ShortLink service → analytics consistently visible in the appropriate workspace.
4. Audience Manager captures relevant submitted contact details and supported source metadata; anonymous click analytics do not turn into personal profiles without a justified and disclosed mechanism.
5. KUBICU Copilot creates an ordinary canonical page document; that page can be published using the standard runtime, then shared using the same Short Links, QR, analytics and contact services.

## 5. Public mega menu requirements

Build a shared, configuration-backed, accessible menu component. The menu is for public marketing pages only.

Desktop requirements:
- Top-level groups: Product, Solutions, Marketplace, Resources, Pricing (adapt only if existing IA proves better).
- Wide, aligned panel with an icon-rich sub-header/category row, grouped menu entries, concise descriptions, and a restrained featured CTA/preview.
- Pointer hover plus click/focus, stable pointer transition, active states, Escape close, focus restoration, keyboard support and no hover-only dependency.
- Responsive positioning within viewport; no clipping or scroll traps.
- Analytics for open/selection using privacy-conscious event design.

Mobile requirements:
- Purpose-built drawer/accordion with touch-sized targets, clear expanded state, logical heading hierarchy and easy return to prior context.
- No compressed desktop mega menu.

Each entry should use a shared route/nav schema, approved icon token, title, short description, and optional feature flag/availability status. Validate internal destinations; avoid dead links. Super-admin/CMS editing must not permit arbitrary unsafe URL injection.

## 6. Public landing-page quality and SEO

All four public pillar pages must be complete and substantive, not hero-only mockups:

- Creator page: outcome-led introduction, page previews, use cases, templates/themes, creation workflow, connected audience/short link/commerce benefits and CTA.
- Marketplace: search/categories, listing previews, use-case groups, install explanation, permissions/trust model, featured approved items and CTA.
- Short Links: URL input/product demo where permitted, examples, QR, campaign labels, analytics, safety explanation, features and CTA.
- Audience Manager: capture/organize/segment, source-aware contacts, consent, export/integration, sample dashboard, realistic workflow and CTA.

For all pages:
- SSR/SSG where compatible with current framework and dynamic constraints.
- Canonical metadata, distinct titles/descriptions, Open Graph images, sitemap/robots rules and useful internal links.
- Fast LCP, responsive image assets, lazy-load secondary media, avoid hydration-heavy gimmicks, noindex private drafts and authenticated surfaces.
- Do not publish fake metrics, invented testimonials, unapproved partner logos, or capabilities not available in the product.
- CTA and navigation analytics should be measured without collecting unnecessary personal data.

## 7. Suggested delivery tickets

Use or map these IDs into the existing backlog; avoid duplicated tickets if an equivalent is already present.

- `KUB-PUB-001`: Public route inventory, shared navigation schema and route validation.
- `KUB-PUB-002`: Public desktop mega menu and responsive mobile navigation.
- `KUB-CRE-001`: Creator landing page and use-case/preview system.
- `KUB-CRE-002`: Creator onboarding presets using existing Canvas and public renderer.
- `KUB-MKT-001`: Marketplace listing taxonomy, schemas, public index and search/filter.
- `KUB-MKT-002`: Marketplace detail, permissions, compatibility and entitlement checks.
- `KUB-MKT-003`: Install/connect lifecycle, status, sync, update/rollback and uninstall governance.
- `KUB-LNK-001`: ShortLink API/domain model, URL validation, slug uniqueness and redirect runtime.
- `KUB-LNK-002`: Short-link management UI, QR/share flow, campaign/channel/tags and audit history.
- `KUB-LNK-003`: Privacy-safe link analytics, bot filtering, link health and export.
- `KUB-AUD-001`: Audience Manager UX over canonical contacts/forms/CRM schema.
- `KUB-AUD-002`: Source attribution, consent record, segmentation, export/deletion.
- `KUB-AUD-003`: Approved external integrations with field mapping, retry/idempotency and health view.
- `KUB-ANA-001`: Shared event taxonomy and cross-feature attribution contracts.
- `KUB-SUP-001`: Super-admin control for marketplace catalogue, permissions, approvals, feature flags and audit trails.
- `KUB-QA-001`: End-to-end QA across creator → short link/QR → form → Audience Manager, and marketplace → install → Canvas.

## 8. Recommended sequence and gates

**Phase A — Design and shared contracts:** Inspect the repo; produce ADRs and schemas for routes/navigation, ShortLink, Campaign/Channel/Tag, marketplace manifests, and contact/consent/source events. Complete the high-fidelity Magic Patterns prototype and validate flows with real target users.

**Phase B — Public discovery surfaces:** Build shared navigation, mega menu, four marketing pages, SEO, responsive states and accurate links to existing product capabilities. Public pages may launch ahead of every backend capability, but must label future features clearly.

**Phase C — Short Links foundation:** Implement safe redirects, slug uniqueness, link management, campaign metadata, QR output, event recording, privacy and abuse controls. Establish reliable redirect performance before adding advanced analytics.

**Phase D — Audience Manager foundation:** Integrate canonical contacts/forms, source/campaign metadata, consent, segments, export, deletion and initial sync adapter. Test tenant isolation and suppressions.

**Phase E — Marketplace lifecycle:** Implement listing metadata, permission disclosure, compatibility/entitlement preflight, safe installation/connect, lifecycle monitoring, versioning, rollback, support and admin controls.

**Phase F — Integrated user journeys:** Complete Creator Page → Short Link/QR → Audience capture → Audience Manager and Marketplace → Canvas/Workspace flows. Instrument success/failure and run cross-module regression tests.

**Release gate:** Do not claim all four features are “fully integrated” until both the public marketing pages and the actual authenticated functions work end-to-end, data is correctly scoped, privacy/consent controls pass, errors are recoverable, mobile UX is validated, and deployment/monitoring are live.

## 9. Acceptance criteria

- All required public routes return the correct page, have unique metadata, and contain working internal links.
- Mega menu works with pointer, mouse click, keyboard, screen reader, touch/mobile, and reduced motion.
- Creator public page renders from the same canonical page structure and public renderer as other KUBICU pages.
- Marketplace can surface approved listings with type, version, compatibility, permissions, dependencies, entitlements and real status; install/update/uninstall are auditable and recoverable.
- Short-link slugs are unique; invalid or unsafe destinations are rejected; redirect changes invalidate cache; abuse limits and redirect monitoring work.
- QR is linked to a valid destination and analytics distinguishes scans/clicks without false precision.
- Audience Manager shows only authorized tenant data, stores relevant consent/source information, handles duplicates safely, supports export/deletion and respects suppression state.
- Contact messages/integrations cannot run without configured provider support, authorization and required consent.
- Creator → campaign link → capture → Audience Manager flow and marketplace → install → block integration flow pass end-to-end tests.
- Public pages and dashboards work at mobile widths and meet accessibility/performance targets.
- Telemetry includes failures, cost/usage where relevant, install errors, redirect errors, sync failures, and user success metrics.
- No mock data, testimonials, ratings or capability labels are misrepresented as production evidence.

## 10. Competitive sources to revalidate at implementation time

- https://linktr.ee/for/creators
- https://linktr.ee/marketplace
- https://linktr.ee/marketplace/apps
- https://linktr.ee/features/link-shortener
- https://linktr.ee/features/audience-management
- https://linktr.ee/features
- https://linktr.ee/help/articles/8133719-how-to-shorten-and-share-links-with-tr-ee-links

These sources document public user-facing capabilities and navigation patterns only. They do not define KUBICU's internal architecture or entitle KUBICU to copy proprietary design assets.

## Final instruction to Claude

Implement the features as connected domains in KUBICU's existing architecture. Begin with repository inspection, route inventory, existing-schema reuse, and short architecture decision records. Do not build the public pages as inert marketing mockups while the corresponding app features remain disconnected. Equally, do not block public-page design on speculative advanced functionality: clearly stage features, ship reliable foundations, and connect them through shared interfaces. Preserve all current blueprint and backlog requirements. Record tests, unresolved risks, provider dependencies, and what is genuinely complete after each phase.
