# KUBICU — Creator Pages, Marketplace, Smart Links & Audience Manager
## Master Magic Patterns Design and Product-Integration Prompt

**Revision:** 29 October 2026  
**Purpose:** Extend the existing KUBICU project with four connected product pillars and an icon-rich mega menu across the public marketing website.  
**Governing documents:** `KUBICU_MASTER_BLUEPRINT.md`, `KUBICU_IMPLEMENTATION_BACKLOG.md`, approved Canvas, template, theme, block, and Copilot design work.

---

## 1. Your mission

Act as an elite product design organization combining a principal SaaS product designer, public-site information architect, design-system lead, creator-economy strategist, CRM/product growth designer, URL infrastructure product lead, marketplace product manager, and accessibility-focused interaction designer.

Extend KUBICU with an integrated product experience that makes the following capabilities first-class, discoverable, and connected:

1. **Creators and public creator pages** — beautiful profile pages and mini-websites that help creators present their identity, content, products, services, collaborations, audience links, and monetization options.
2. **KUBICU Marketplace** — a discoverable public directory of compatible apps, integrations, blocks, themes, templates, industry kits, and automation recipes, with appropriate governance and install flows.
3. **KUBICU Short Links** — a secure link-shortening and campaign-routing tool with branded-link options, QR, tags, channel attribution, analytics, and management.
4. **KUBICU Audience Manager** — a consent-aware contact and lead management experience integrating forms, creator pages, QR/short-link campaigns, bookings, supported commerce events, and approved integrations.

These are not four disconnected marketing pages. They must be presented through polished public landing pages and then lead to real, coherent functionality inside the KUBICU product. Every visible promise should connect to an implemented capability, an approved integration, or a clearly marked planned capability.

The strategic goal is not to copy Linktree pixel-for-pixel. Study the user outcomes and navigation patterns of its public product pages, then create an original KUBICU experience that is more unified, more adaptable, more useful for small businesses and creators, and more commercially extensible.

**Do not merely propose a plan. Produce the actual public-page designs, app screens, responsive states, menu interactions, and connected prototype paths in the existing Magic Patterns project.**

## 2. Inspect and preserve the existing KUBICU system

Before designing:

- Review the master blueprint and implementation backlog.
- Inspect the existing public website, header, navigation, footer, pricing, features, Canvas, themes, templates, block picker, Marketplace/admin concepts, Audience/CRM, short links/redirects, QR, analytics, and WhatsApp-first Copilot work.
- Reuse approved typography, spacing, colour, icon, radius, shadow, button, card, and responsive tokens.
- Reuse current block and theme concepts rather than introducing an incompatible parallel builder.
- Keep existing approved scope and capabilities. Do not restart the website or quietly drop earlier requirements.
- Distinguish current capabilities, planned work, integration-dependent capabilities, and future concepts.
- Add missing routes and UI components to the existing information architecture. If an existing route or component already serves the purpose, extend it rather than creating duplicates.

Maintain a design traceability register linking each new public route and app surface to its shared components, product capability, prototype interaction, and implementation status.

## 3. Research interpretation: what KUBICU needs to learn from Linktree

Use the following high-level capability patterns as competitive research, not as source code or visual assets to copy:

- A creator-oriented public landing page explains how a creator can use the platform to showcase content, expand audience reach, customize a page, sell or promote offerings, capture contacts, and understand engagement.
- A Marketplace public page makes integrations and add-on experiences discoverable through search, categories, clear descriptions, and visual previews.
- A short-link product lets users shorten destinations, share clean links, optionally label channels/campaigns, and understand link performance.
- An Audience Manager landing page explains contact capture, contact organization, segmentation/source information, exports, and supported integrations.
- The public navigation uses a prominent, wide dropdown/mega-menu pattern with grouped destinations and scannable entries. KUBICU should use an equally intuitive icon-rich group-and-card approach but with original KUBICU branding, wording, layout details, and assets.

Research references reviewed 29 October 2026:

- Linktree public home: https://linktr.ee/
- Creators landing page: https://linktr.ee/for/creators
- Public features index: https://linktr.ee/features
- Public Marketplace: https://linktr.ee/marketplace
- Marketplace app directory: https://linktr.ee/marketplace/apps
- Short link landing page: https://linktr.ee/features/link-shortener
- Audience Manager landing page: https://linktr.ee/features/audience-management
- Templates directory: https://linktr.ee/s/templates
- Short-link sharing and attribution guide: https://linktr.ee/help/articles/8133719-how-to-shorten-and-share-links-with-tr-ee-links

Revalidate these pages and the visual navigation before implementation; live products change. Do not reproduce competitor trademarks, copy, logo, screenshots, or exact art direction.

## 4. Public website information architecture

Create or extend the public site around the following routes. Respect existing approved route conventions and use aliases/redirects only when necessary.

### Primary public routes

- `/` — KUBICU homepage.
- `/for/creators` — creator product landing page.
- `/marketplace` — public extension and integration marketplace.
- `/marketplace/apps` — browse app/integration listings.
- `/marketplace/categories/:category` — category directory.
- `/marketplace/:slug` — individual listing detail.
- `/tools/short-links` — public Short Links feature landing page and appropriate entry tool.
- `/features/audience-manager` — Audience Manager landing page.
- `/features` — consolidated feature discovery page.
- `/templates` — template gallery.
- `/themes` — theme gallery.
- `/blocks` — block library overview if useful in current IA.
- `/pricing` — plan comparison and entitlements.
- `/resources` or established equivalent — help, guides, case studies, and product education.
- `/developers` — developer/partner entry point, only if the public API or partner program is approved for presentation.

### Public creator pages

The creator landing page is marketing content; it is not a substitute for the user's actual public page.

Ensure the existing public publishing runtime also supports each user's published page at the established KUBICU public URL/slug, with the user's selected template, theme, content blocks, links, media, forms, products/services where enabled, and other permitted content.

The creator landing page must show realistic previews of public creator pages and explain how one KUBICU destination can serve as a link hub, mini-website, portfolio, storefront, media kit, and lead destination.

### Public versus authenticated surfaces

Marketing pages and public marketplace listings should be viewable without logging in. Actions such as installing an extension, saving a template to a workspace, managing a short link, viewing private contact records, exporting audience data, or publishing a page must route through appropriate authentication and permission checks.

A public feature landing page may include a demo or low-friction tool entry point, but must not expose private contacts, analytics, or internal workspace data.

## 5. Build the icon-rich public mega menu

Implement a premium desktop mega menu and a mobile navigation equivalent, integrated into the current KUBICU public-site header.

### 5.1 Interaction requirements

- Top-level navigation items open a wide, aligned mega-menu panel.
- On desktop, support pointer hover where appropriate **and** click/focus interaction; do not make hover the only way to navigate.
- Menus must work with keyboard navigation, focus visibility, Escape-to-close, and sensible focus restoration.
- Avoid flicker when the pointer moves from a trigger into the panel.
- Use short, precise headings and concise one-line descriptions.
- Every sub-navigation item has a relevant, consistent icon, a clear title, and a compact description. Icons support scanning; they must not overpower the text.
- Group related links under meaningful category headers. Separate ordinary destinations from featured calls to action.
- Include a small, visually distinguished but restrained feature panel for the most valuable entry point, such as “Create your page with Copilot” or “Explore KUBICU Marketplace”.
- Keep the mega menu within the viewport, with appropriate maximum width, spacing, alignment, shadows/borders, and a high stacking context.
- Ensure click targets are generous and the panel does not cover the active navigation state confusingly.
- Show subtle transitions that respect reduced-motion preferences.
- At narrow widths, convert mega-menu groups into a well-structured mobile drawer or accordion; do not squeeze the desktop panel into a phone.
- Provide a fallback for touch devices where hover does not exist.
- Keep the header sticky only if consistent with existing site behavior and without obscuring the page.

### 5.2 Suggested top-level menu structure

Use this as a strong starting point, not an excuse to add unnecessary navigation depth.

**Product**
- Canvas Website Builder — “Compose a page from flexible, responsive blocks.”
- Creator Pages — “Bring your identity, content, and opportunities together.”
- Mini-Websites — “Grow from a link page into a richer web presence.”
- Store & Digital Products — “Showcase and sell supported products.”
- Services & Bookings — “Turn visitor interest into enquiries and appointments.”
- Audience Manager — “Collect, organize, and understand your contacts.”
- Short Links & QR — “Create trackable links for every campaign.”
- Analytics & Growth — “Understand which pages, links, and campaigns perform.”
- AI Copilot — “Start with a conversation, continue in KUBICU.”

**Solutions**
- Creators & Influencers.
- Freelancers & Portfolios.
- Shops & Social Sellers.
- Service Businesses.
- Artists, Musicians & Podcasters.
- Educators & Digital Product Sellers.
- Events & Communities.
- Agencies & Multi-brand Teams.

Each solution destination should lead to a coherent landing page or relevant anchored section, not an empty link.

**Marketplace**
- Explore Marketplace.
- Apps & Integrations.
- Templates.
- Themes.
- Blocks & Section Packs.
- Automation Recipes.
- Industry Kits.
- Developer/Partner Program, only when approved.

**Resources**
- Template Inspiration.
- Creator/Business Guides.
- Help Centre.
- Product Updates.
- Customer Stories, only where real and authorized.

**Pricing**
Keep Pricing as a clear primary destination or CTA. Do not bury it under an excessive hierarchy.

**Primary header actions**
- Log in.
- Get started / Create your page.
- Optional “Start with AI Copilot” feature CTA.

### 5.3 Mega-menu visual composition

Create an icon-rich “sub-header” arrangement inside the mega menu:

- A slim category/header row at the top of the open panel.
- A multi-column body grouping related destinations.
- Each row/card contains an icon or small symbolic tile, title, and concise description.
- An optional right-side or bottom featured panel with a polished screenshot/mini page preview and one CTA.
- A clear view-all link for large categories.
- A visually distinct active/hover/focus state.
- A subtle closing/transition behavior.

Make the menu beautiful, roomy, aligned, intentional, and easy to scan. Avoid tiny icon grids with cryptic labels, random badges, overcrowded lists, and decorative glass effects that reduce contrast.

Use a KUBICU-original palette, icons, content, and layout. Match the interaction quality and information density of a mature SaaS mega menu without pixel-copying Linktree.

## 6. Build the Creator product pillar

Create a complete public landing page at `/for/creators`.

### Marketing page content

- Premium hero with a clear value proposition and a CTA to create a page.
- A realistic, high-quality example creator page shown on mobile and desktop.
- Explain the outcomes: collect social links and content, showcase media, promote work, capture enquiries, build an audience list, use short campaign links, view engagement, and monetize through supported commerce features.
- Showcase premium templates and themes with relevant creator profiles.
- Showcase media kit / collaboration enquiries and portfolio capabilities where these are supported or clearly staged.
- Explain the path from a basic page to richer business/commerce features without forcing an advanced setup on beginners.
- Include a creator-specific use-case gallery (music, video, fashion, writing, design, photography, education, etc.).
- Explain AI-assisted setup through KUBICU Copilot without claiming unimplemented channel functionality.
- Include FAQ, privacy/trust statements, and meaningful CTA placement.

### Integrated product functionality

- Users can create and publish a creator page from existing KUBICU Canvas, template, theme, and block primitives.
- Creator page can include profile/identity, links, social channels, featured content, media, portfolio, event, service, lead-capture, product and other supported blocks.
- Users can create multiple pages when their plan permits, keep content reusable, preview responsive states, and see the page's engagement analytics.
- A creator can create a short link to a profile or a particular section/content destination where supported.
- Form and audience capture events feed the Audience Manager with lawful source/consent records.
- Marketplace-installed compatible blocks and integrations are available from the same block picker after authorization and installation.

Do not create a separate “Creator Page” editor that duplicates Canvas. Creator-specific onboarding and starter presets should configure the common Canvas system.

## 7. Build the Marketplace as a connected extension ecosystem

Create a complete public Marketplace page at `/marketplace` and browse/detail experiences.

### 7.1 Marketplace taxonomy

Unify discoverability while distinguishing the different asset types:

1. **Apps & Integrations** — first-party and approved external services, embeds, data sync, communication, calendar, analytics, and commerce connectors.
2. **Themes** — reusable visual token/material systems.
3. **Templates** — full-page structural arrangements.
4. **Blocks & Section Packs** — individual functional components and reusable compositions.
5. **Automation Recipes** — reviewed trigger/condition/action workflows.
6. **Industry Kits** — bundles of relevant blocks, content fields, templates, and workflows for a specific use case.
7. **AI Workflow Packs** — optional prompts or structured AI workflows with disclosed dependencies, only once supported.

Do not conflate this with a customer’s own shop/product catalogue. KUBICU's extension marketplace is for improving the platform; the seller's storefront is for selling to their customers. If KUBICU later runs a creator-to-brand collaboration marketplace, define that as a separate clearly named marketplace product.

### 7.2 Marketplace discovery UI

Include:
- Search with useful synonyms.
- Category filters.
- Sort by popularity, newly added, relevant, and rating only when genuine ranking data exists.
- Feature/compatibility labels.
- Free/paid pricing labels where applicable.
- Installed/saved state for authenticated users.
- Responsive visual previews and screenshots.
- Short descriptions and specific use cases.
- Detail page with features, required permissions, data accessed, dependencies, plan/region availability, version/changelog, support information, developer identity, terms/privacy links, and honest limitations.
- Reviews or ratings only when backed by genuine users and moderated against abuse.
- Related items and alternative options.
- Clear “Install”, “Connect”, “Preview”, or “Save” actions according to item type.

### 7.3 Installation and connection journey

Design the sequence:

**Discover → Inspect → Preview → Understand permissions → Check compatibility/entitlement → Install or connect → Configure → Enable for chosen page/workspace → Verify → Manage/update/uninstall.**

The user should know precisely what an integration can read or change before connecting it. No integration may receive blanket access to every tenant or the whole customer's audience by default.

Ensure the marketplace connects to:
- Canvas block picker and page sections.
- Theme/template selector.
- Customer workspace integrations and connection settings.
- Audience Manager syncs where authorized.
- Public page renderer and published-block compatibility.
- Super-admin catalogue, review, entitlement, versioning, safety, rollback, and audit controls.

Public listing pages may advertise planned modules only if clearly labeled. Do not present a fake installation success for unavailable integrations.

## 8. Build KUBICU Short Links as a complete product

Create a public landing page at `/tools/short-links` and the actual app screens for creating and managing short links.

### 8.1 Public landing page

- Strong hero and a real, clearly labelled demo/entry form where safe to expose publicly.
- Explain link shortening, sharing, QR access, campaign labels, channel attribution, and performance reporting.
- Show realistic examples for social posts, WhatsApp, email, packaging, ads, QR posters, and campaigns.
- Explain link safety and data practices honestly.
- Provide clear free/paid limits only after the plan model has been approved.
- Link to Audience Manager and analytics as connected features.
- Do not make unsupported “best”, “most secure”, or guaranteed-conversion claims.

### 8.2 Core app workflow

- Create short link from a full URL.
- Optional custom slug if available and policy-compliant.
- Destination validation and preview.
- Optional campaign, channel, and tags.
- Optional expiration, pause, or destination updates if implemented.
- Generate a QR code for the short link.
- Copy/share the short link.
- Show a list and detail view for links.
- Provide search, filter, status, last activity, and destination management.
- Analytics: clicks, unique/estimated visitors where technically defensible, time series, referrer/source, channel, campaign/tag, geography at an appropriate privacy level, device category, and QR scans when measured.
- Separate raw clicks from filtered bot/invalid traffic; label estimation and sampling.
- Allow export and deletion according to plan and privacy rules.
- Keep event tracking optional where appropriate and offer privacy-respecting defaults.

### 8.3 Beyond a basic shortener

Where product capacity permits, design advanced capabilities as staged improvements:

- Campaign variants with channel-specific links.
- UTM builder with validation and reusable presets.
- Dynamic QR destination that can change without reprinting, with a clear history of changes.
- Link health checks and broken destination alerts.
- Expiring or access-controlled links only when carefully specified and implemented.
- Scheduled links and temporary campaigns.
- A/B routing/experiments only after the system supports statistically honest evaluation.
- Public API/webhooks with scoped credentials and rate limits.
- Branded/custom short domains only after domain ownership and safe redirect infrastructure are established.
- Click-to-WhatsApp links with optional, user-approved prefilled message context; never infer or track private WhatsApp conversation content.

### 8.4 Security and reliability

- Allow only supported schemes, normally HTTP/HTTPS.
- Block dangerous schemes and malicious/phishing destinations using a defined screening service and review process.
- Prevent open-redirect abuse, redirect loops, SSRF, brute-force slug enumeration, and excessive redirect traffic.
- Use unique slugs, atomic creation, abuse rate limits, bot mitigation, caching, and high availability appropriate to the URL runtime.
- Make redirect status and caching choices explicit; changes to a destination must safely invalidate cache.
- Record audit history for meaningful destination changes.
- Do not store excessive identifying data in click logs.
- Clearly distinguish click events, filtered bot events, QR scans, and inferred audience metrics.

## 9. Build KUBICU Audience Manager as a connected lightweight CRM

Create a public feature page at `/features/audience-manager` and the actual authenticated workspace product.

### 9.1 Public landing page

- Premium hero explaining that KUBICU helps users collect, organize, and understand the audience they build across their digital touchpoints.
- Show realistic, polished dashboard previews for contacts, segments, lead sources, and growth over time.
- Demonstrate an end-to-end path from a public creator/business page form to a consent-aware contact record.
- Explain tagging, segmentation, source attribution, deduplication, export, and supported integrations.
- Show how short-link and QR campaigns can contribute campaign-level attribution where consent and telemetry support it.
- Cross-link Creator Pages, Short Links, Forms, Analytics, and approved integrations.
- Use clear copy about data ownership, permissions, consent, export and deletion.
- Do not fabricate audience counts, conversion improvements or customer testimonials.

### 9.2 Workspace screens

Design the complete working experience:

- Audience overview with meaningful summary metrics.
- Contacts table/list with search, filters, sort, profile drawer/detail, tags and contact status.
- Segment builder with understandable rule logic.
- Lead source/campaign view.
- Contact timeline showing permitted and meaningful interactions.
- Form/lead source detail.
- Imports, exports and field mapping.
- Duplicate detection/merge review.
- Consent and subscription status.
- Integration connections and field mapping.
- Notification/campaign composer only where the approved outbound messaging capability and consent requirements are met.
- Sync/error logs and retry controls for integrations.
- Data retention, privacy, export and deletion workflows.
- Empty/loading/error/unavailable states.

### 9.3 Contacts and source attribution

The Audience Manager can receive contacts and events from:
- Public profile/contact forms.
- Newsletter and waitlist forms.
- Service, booking and enquiry flows.
- Supported product/checkout events.
- Short links and QR campaign metadata.
- Approved integrations such as email marketing or spreadsheets.
- Other KUBICU surfaces where a clear lawful purpose and reliable event exists.

A click must not automatically create a named personal contact. Anonymous analytics and identifiable contact records are different data types. Connect them only when the user submits information or another lawful, transparent mechanism exists.

Capture source/campaign/tag and timestamp where appropriate. Track consent state and scope separately from source attribution. Deduplicate carefully; do not merge people solely because they share an unreliable signal.

### 9.4 Consent, data portability, and outbound messaging

- Collect only necessary data and declare its intended use.
- Store source, timestamp, consent scope, and relevant notice/terms version when required.
- Provide unsubscribe/suppression and contact preference states for outbound messages.
- Do not message every imported contact without appropriate legal basis and consent.
- Keep provider credentials server-side.
- Support export and deletion under the applicable retention policy.
- Limit staff access by role and log privileged actions.
- Do not imply that clicking a short link grants permission to send marketing messages.

## 10. Connect all four pillars to one coherent product model

These capabilities must share core entities and permissions rather than becoming disconnected silos.

### Shared product relationships

- A user/workspace owns one or more pages.
- A page contains a validated page document, compatible blocks, a selected template and a theme.
- A published page exposes approved public content at a controlled URL.
- A short link points to an allowed destination and may reference a page, section, product, campaign or external URL.
- A QR asset references a short link or other valid destination and uses the same attribution model.
- A campaign can group short links, tags, QR assets, and measurable conversion events.
- A form submission can create or update an Audience Manager contact only under configured rules.
- A permitted contact/audience event may reference source page, form, campaign, or short-link attribution.
- A marketplace listing has a versioned manifest, required permissions, dependencies, compatible products/blocks, price/entitlement and installation lifecycle.
- Installing a marketplace asset makes only its approved capabilities visible; it does not bypass permissions or feature flags.
- The public mega menu and public landing pages are managed through the existing public-site/CMS strategy where available.

### Cross-feature journey examples

**Creator launch:** Creator page → campaign short link → QR/social sharing → page analytics → form signup → Audience Manager → consented email tool sync → user reviews campaign results.

**Small business campaign:** Public mini-store → product-specific short link → campaign/channel tags → visitor opens product page → supported checkout or WhatsApp enquiry → order/contact record where appropriate → audience/source dashboard.

**Marketplace extension:** Visitor explores marketplace public listing → inspects permissions and preview → signs in → installs approved extension → connects it to a page or workspace → sees the corresponding block or data within the normal Canvas/workspace.

**Copilot-created page:** KUBICU Copilot generates a draft using existing blocks/templates/themes → user previews and claims it → publishes the same canonical page → creates a share/short link → receives analytics and permitted form leads through shared product services.

## 11. Shared public-site Mega Menu design system

Create one reusable mega menu component for the entire KUBICU public site—not separate unrelated dropdowns on each marketing page.

It should include:
- Shared menu schema/navigation configuration.
- Consistent icon primitives and categories.
- Title and one-line description per destination.
- Keyboard and screen-reader semantics.
- Pointer, click, focus, and touch interaction states.
- Active/hover/expanded states.
- Reduced-motion support.
- Responsive mobile drawer/accordion adaptation.
- Analytics for menu engagement, without invasive visitor tracking.
- CMS/administrative configuration if consistent with the existing architecture.

Only public-facing marketing pages should use this marketing mega menu. Logged-in dashboards should use their own workspace navigation appropriate to app tasks. Do not confuse the public mega menu with internal app navigation.

## 12. Premium design requirements

Follow KUBICU's established high-quality visual direction: exceptionally polished, spacious, modern, premium, coherent, responsive, well aligned, and typographically sophisticated.

- Use generous spacing and a strong grid.
- Use refined typography and concise copy.
- Use original KUBICU colour and icon systems.
- Use glass, gloss, gradients, depth, and highlighted surfaces with restraint.
- Make the menu icon-rich, but ensure the copy remains the primary navigational clue.
- Use compelling, realistic product screenshots/previews within landing pages.
- Keep public pages visually distinct from authenticated dashboards while preserving the same design-system DNA.
- Build real page compositions with hero, product explanation, feature groups, example states, workflow, FAQs/trust, and CTAs; do not stop at hero-only mockups.
- Avoid generic identical cards for every section, overcrowded layouts, long unbroken paragraphs, false badges, fake metrics, and fake testimonials.
- Build attractive mobile screens intentionally, not as reduced desktop layouts.

## 13. Required design deliverables

Create the actual Magic Patterns designs and a connected prototype for:

1. Updated public-site header, desktop mega menu, keyboard/focus states, and mobile navigation.
2. KUBICU homepage navigation entry points to the four pillars.
3. Complete `/for/creators` landing page.
4. Public creator page examples using the existing template/theme/block system.
5. Complete `/marketplace` landing/discovery page.
6. Marketplace browsing, filter/search, category, listing detail, permission disclosure, install/connect, installed, error, and upgrade states.
7. Complete `/tools/short-links` landing page.
8. Short-link creation, validation, copy/share, QR, link list/detail, campaign tags, analytics, broken-link/error, and rate-limit states.
9. Complete `/features/audience-manager` landing page.
10. Audience Manager overview, contacts, contact detail, segments, source attribution, import/export, integration mapping, consent, notification permissions, and error states.
11. Public feature index with coherent cross-links among the four pillars.
12. Integrated public-page and product-app journeys described above.
13. Desktop, tablet, and mobile variants.
14. Design traceability register, route inventory, and feature status register.

The required deliverable is the actual high-fidelity pages and product screens—not merely a component list or a sitemap. If Magic Patterns needs multiple passes, break the work into numbered batches and maintain a checklist of every required route/state. Do not shrink the scope to one landing-page screenshot.

## 14. Prototype acceptance criteria

A reviewer must be able to:

- Open the public-site mega menu and select every core destination.
- Navigate to all four public feature pages.
- View a public creator page and identify its public-versus-editor distinction.
- Browse/search/filter marketplace listings and inspect a listing detail.
- Follow a believable authenticated install/connect prototype path.
- Enter a long URL into the Short Links UI, configure a slug/channel/tag, and reach a copy/share state.
- Preview a QR destination and campaign analytics state.
- Open Audience Manager, view contacts, inspect a source, filter a segment and review consent state.
- Follow the creator campaign journey from page to short link to audience capture.
- Use the navigation on mobile and desktop.
- Encounter at least one honest unavailable/permission/feature-not-enabled state.

Prototype data must be clearly illustrative. Do not label mock data as live or claim external API operations succeeded.

## 15. Final execution directive

Extend the current KUBICU project with four deeply integrated product pillars—Creator Pages, Marketplace, Short Links, and Audience Manager—and a shared icon-rich public mega menu.

Make every pillar discoverable from the public website, useful inside the authenticated product, and connected to the common page, campaign, contact, analytics, and permission model.

Design for product ambition without feature hallucination. Use Linktree's publicly visible outcomes and navigation approach as competitive reference, but make the KUBICU implementation original, more coherent, more extensible, more useful for real business workflows, and recognizably KUBICU.

**Do not merely imitate a link-in-bio tool. Design KUBICU as the connected operating layer for a creator's or small business's public digital presence, distribution, audience relationships, and growth.**
