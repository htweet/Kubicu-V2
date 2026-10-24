# KUBICU — Magic Patterns AI Master Design Plan

> **Prototype status note (24 Oct 2026):** this is the source spec and is not edited for status. Every "later phase" item in §13 (advanced automation, marketplace and creator payouts, IntentFlow, DealRoom, Trust Passport, Proof-of-Work, Voice-to-Store, advanced Link Intelligence and experiments, partner fulfilment, developer API and extensions) is **now built in the prototype**, partner parts simulated. Current gaps: `docs/DESIGN_GAP_AUDIT.md`; screens: `docs/SCREEN_INVENTORY.md`.

## Canonical UI/UX Direction, Screen Inventory, Design System, Interaction Rules and Scope Guardrails

**Product:** KUBICU  
**Domain:** `www.kub.icu`  
**Brand line (working):** *Your corner of the internet. Your whole business.*  
**Document type:** Canonical design instruction for Magic Patterns AI  
**Status:** Master design source of truth  
**Companion documents:** `KUBICU_MASTER_BLUEPRINT.md` and `KUBICU_IMPLEMENTATION_BACKLOG.md`

---

# 0. EXECUTIVE DIRECTIVE — READ BEFORE DESIGNING

You are designing **KUBICU**, a premium, mobile-first, AI-powered link-in-bio and digital business platform. It begins with a beautiful, flexible bio-link page and can grow into a storefront, service-booking experience, lead-capture funnel, campaign destination, portfolio, micro-website and modular business hub.

This is **not** a request to design a generic dashboard, a basic Linktree clone, or a collection of disconnected SaaS screens. Design a coherent, distinctive, commercially credible product with a polished public-facing experience, a genuinely useful visual page canvas, customer-facing commerce and a comprehensive administrative operating system.

Your output must feel **beautifully art-directed, well-designed, intentional, elegant, polished, attractive, coherent, spacious and production-minded**. Every screen should have clear hierarchy, excellent typography, deliberate alignment, consistent spacing, restrained colour, purposeful components and carefully considered interaction states. Avoid clutter, visual noise, random gradients, gratuitous glassmorphism, excessive cards, oversized empty hero sections, inconsistent corner radii, arbitrary icon use, tiny text and dense dashboards.

## The highest-priority rule: DO NOT LOSE THE PLOT

1. Treat this document as the canonical **design** specification and the two companion documents as the canonical **product and implementation** specifications.
2. Read the full companion documents before beginning, if they are available in the project context. Do not rely only on this prompt's summary.
3. Preserve all requirements. Do not silently omit, water down, invent replacements for, or contradict any major capability.
4. Maintain a **Design Traceability Matrix** mapping each requirement and product module to the relevant screen, flow, component, state and prototype coverage.
5. Maintain a **Design Decision Register** for assumptions, unresolved decisions, deferred features and dependencies. Never present a guess as a confirmed business rule.
6. Design the full product architecture, but clearly distinguish **MVP**, **next release**, and **future/experimental** capabilities. Future capabilities must remain visible in the design system and roadmap without being falsely represented as already implemented.
7. Do not claim that a visual prototype has real backend functionality. Label integrations, analytics, payments, AI outputs and data as illustrative when they are mock data.
8. Do not replace meaningful product flows with decorative mock screens. Buttons, menus, forms, tabs, canvas controls and navigation in the prototype should have plausible, consistent interaction behaviour wherever Magic Patterns supports it.
9. Never sacrifice visual quality to fit more content on a screen. Prefer progressive disclosure, well-designed detail views, tabs, accordions and contextual panels over clutter.
10. Work in clear, reviewable batches. Do not attempt to create every screen in one undifferentiated pass and then allow quality to collapse.

If requirements conflict, do not silently choose whichever is easiest to draw. Record the conflict and preserve the broader intent while proposing the least destructive resolution.

---

# 1. PRODUCT VISION AND POSITIONING

## 1.1 What KUBICU is

KUBICU is a modular digital space that lets a person or business turn one shareable link into a beautiful online presence and a practical way to connect, sell, book, capture leads and understand results.

The user can start with a simple page and progressively unlock richer capabilities without migrating to a new product.

**Product promise:** one link can become a whole business experience.

**Brand attributes:**

- Premium but approachable.
- Modern and confident, not loud or gimmicky.
- Creative, useful and commercially intelligent.
- Mobile-first and accessible.
- Locally relevant to Nigeria and extensible across African markets.
- Trustworthy about payments, fees, data, delivery and automation.
- Powerful for professionals without intimidating beginners.

Do not reduce the brand to “an African Linktree.” KUBICU should compete on the quality of the experience and the depth of its business workflows, not on geography alone.

## 1.2 Four connected product layers

1. **KUBICU Pages:** link-in-bio pages, profile pages, landing pages, portfolios, campaign pages and micro-websites.
2. **KUBICU Commerce:** physical and digital products, services, checkout, orders, delivery/pickup, bookings and customer enquiries.
3. **KUBICU Intelligence:** AI-assisted creation, recommendations, analytics interpretation and workflow automation.
4. **KUBICU Platform:** custom domains, teams, integrations, plans, entitlements, extensions, marketplace and super-admin operations.

All layers must share a coherent design system, account model, navigation logic and interaction language. Do not make them look like separate products purchased from different vendors.

## 1.3 Product differentiation

The design must make these capabilities easy to understand:

- A real canvas/artboard for arranging page blocks.
- AI-assisted page and storefront generation with user control.
- Business-specific starter kits, not just decorative templates.
- Local-market-ready commerce flows and WhatsApp handoff.
- Physical and digital product selling.
- Service catalogue, appointment booking and scheduling.
- Leads and lightweight CRM.
- Custom domains with a guided connection flow.
- Campaign QR codes and trackable links.
- Analytics that explain meaningful visitor actions.
- Workflows and automations.
- Modular feature entitlements and a controlled extension marketplace.
- A comprehensive super-admin operating system.
- Future differentiators including IntentFlow, Link Intelligence, DealRoom, Trust Passport, Proof-of-Work, Voice-to-Store and local fulfilment integrations.

These are product design targets, not claims that every feature is already built or that every competitor lacks them.

---

# 2. HOW TO WORK WITH THE COMPANION DOCUMENTS

Before designing, inspect:

- `KUBICU_MASTER_BLUEPRINT.md` — product vision, requirements, competitive strategy, market, monetisation, platform modules and differentiators.
- `KUBICU_IMPLEMENTATION_BACKLOG.md` — delivery phases, epics, acceptance criteria, security and release gates.

Create these working artefacts in the project, or in the most suitable available design documentation area:

### A. Design Traceability Matrix

Use the columns:

`Requirement ID | Requirement | Priority/Phase | User role | Screen/flow | Component | States | Prototype status | Open questions`

Every requirement must have a disposition:

- Designed for MVP.
- Designed for later phase.
- Represented in a future concept.
- Needs clarification.
- Intentionally excluded with documented rationale.

No requirement may disappear simply because it is complex.

### B. Screen Inventory

Use:

`Screen ID | Screen name | Product area | Primary user | Desktop/mobile | Entry point | Primary action | Key states | Dependencies | Phase`

### C. Design Decision Register

Track unresolved details such as exact pricing, provider availability, fees, payment methods, supported languages, domain setup behaviour and module permission models. Use clear labels like `Proposed`, `Illustrative`, `Needs validation`, and `Confirmed`.

### D. Design system

Document typography, colours, spacing, grid, radii, shadows, borders, iconography, components, interaction states, responsive breakpoints and accessibility rules.

### E. Prototype acceptance checklist

Maintain a checklist of completed flows, mobile layouts, edge states and screens that still need design.

Do not stop at producing a list of pages. Design the screens and the relationships between them.

---

# 3. VISUAL ART DIRECTION — NON-NEGOTIABLE QUALITY BAR

## 3.1 Desired aesthetic

Create a refined, contemporary SaaS product with the visual confidence of a leading international creator platform and the usability of a thoughtfully designed business tool.

The product should feel:

- Clean and editorial.
- Premium and human.
- Expressive where users create public pages.
- Calm and highly organised in the admin and operations areas.
- Visually distinctive without relying on novelty effects.
- Trustworthy in checkout, billing, data and security contexts.

Use a deliberate visual system rather than styling each screen independently.

## 3.2 Colour strategy

Propose a restrained, distinctive KUBICU palette and document exact tokens before broad screen production.

Suggested direction to explore:

- Deep ink/near-black or dark navy for primary text and strong anchors.
- Warm off-white or soft neutral backgrounds for breathing room.
- A distinctive confident primary accent—consider a rich cobalt/indigo or a deep violet-blue.
- A restrained secondary accent for selected highlights.
- Semantic success, warning, error and informational colours used only for their intended meanings.
- Neutral borders and surfaces that separate content without making every component look boxed-in.

These are design directions, not a requirement to use those exact hues. Choose a coherent palette, test contrast, then **lock it**. Do not randomly change brand colours from screen to screen.

Rules:

- Avoid a rainbow UI.
- Do not use gradients as a substitute for hierarchy.
- Avoid bright accent backgrounds behind every card.
- Do not use colour alone to convey status.
- Keep public-page themes flexible, but preserve accessibility guidance and KUBICU editor chrome consistency.
- Build semantic design tokens such as `color.text.primary`, `color.surface.canvas`, `color.border.subtle`, `color.action.primary`, `color.status.success`.

## 3.3 Typography

Typography must feel intentional, legible and premium.

Define:

- A primary UI typeface with excellent screen readability.
- An optional complementary display face only if it materially improves the brand.
- A clear type scale for display, page title, section heading, body, label, caption and metadata.
- Consistent font weights and line heights.
- Sensible maximum text widths for readability.
- Clear distinction between page titles, section headings, body copy, helper text and metadata.

Avoid:

- Too many font families or weights.
- Tiny grey text for important information.
- Excessive uppercase labels.
- Oversized headlines that crowd out the interface.
- Arbitrary typography changes between modules.
- Long paragraphs in dense admin screens where structured summaries would work better.

Use sentence case for most interface labels. Keep button labels concise and action-oriented.

## 3.4 Spacing, alignment and composition

Use a consistent spacing scale, for example a 4/8-based system, and define it as tokens. Apply spacing deliberately.

Requirements:

- Align components to a consistent grid.
- Establish clear relationships between headings, descriptions, fields and actions.
- Give content room to breathe.
- Use consistent page gutters and section spacing.
- Avoid awkward gaps, crowded clusters and inconsistent vertical rhythm.
- Use whitespace to communicate hierarchy, not to create empty decoration.
- Use responsive max-widths for forms and reading content.
- Use tables when comparing structured data; do not convert every data set into cards.
- Keep form labels, controls, helper text and errors consistently aligned.
- Use one predictable spacing logic across dialogs, drawers, cards, tables and editor panels.

## 3.5 Cards, borders, shadows and radius

Cards are useful when they establish meaningful grouping. They are not the default wrapper for every element.

- Avoid a dashboard made of dozens of same-looking cards.
- Prefer a clear page background with a small number of meaningful surfaces.
- Use subtle borders to define structure.
- Use shadows sparingly for floating layers, menus and dialogs.
- Use a consistent radius scale, with more restrained radii in dense data tables and slightly softer shapes for public-facing content.
- Avoid mixing pill shapes, sharp corners and oversized rounded cards without a defined system.
- Do not use glassmorphism everywhere.
- Avoid stacked cards inside cards unless the nesting is truly meaningful.

## 3.6 Icons and imagery

- Use one coherent icon family with consistent stroke weight and optical size.
- Icons must have clear meaning; do not decorate every heading with an icon.
- Use labels alongside unfamiliar or high-impact icons.
- Use high-quality, purposeful imagery in public-page examples and templates.
- Do not use random stock photos merely to fill empty space.
- Use authentic, diverse African and Nigerian business contexts where appropriate—fashion, food, beauty, events, creative work, professional services and retail—without stereotyping or making every screen culturally themed.
- Product images should be coherent in lighting, crop and presentation.
- Avoid emoji as the primary interface iconography.
- Ensure image placeholders have intentional proportions and loading states.

## 3.7 Motion and interaction polish

Use restrained, purposeful motion:

- Subtle hover and pressed states.
- Clear focus rings.
- Short transitions for menus, panels and modals.
- Smooth but not theatrical canvas reordering.
- Clear loading feedback and progress indicators.
- Reduced-motion support.

Do not use animation that slows common tasks, creates distraction or conceals system state.

## 3.8 No-clutter rule

A screen is not complete merely because all relevant information has been placed on it.

Every screen must answer:

1. What is this screen for?
2. What should the user notice first?
3. What is the primary action?
4. What is secondary?
5. What can be hidden until needed?
6. What can be removed?

Use progressive disclosure, contextual actions, filters, tabs, collapsible advanced settings and clear detail pages. Keep the primary task obvious.

---

# 4. DESIGN SYSTEM AND COMPONENT LIBRARY

Create and reuse a robust component library before designing dozens of screens.

## 4.1 Foundations

- Colour tokens and semantic status tokens.
- Typography scale.
- Spacing scale.
- Responsive grid and breakpoints.
- Border, radius and shadow tokens.
- Focus, hover, pressed, disabled and loading treatments.
- Motion and reduced-motion rules.
- Icon family.
- Image ratios and media treatment.
- Accessibility and contrast guidance.

## 4.2 Core components

- Primary, secondary, tertiary and destructive buttons.
- Icon buttons with accessible labels.
- Text fields, text areas, numeric inputs, search fields and URL fields.
- Selects, comboboxes, checkboxes, radio groups, switches and segmented controls.
- Date, time, currency and timezone inputs.
- File upload, image cropper and media picker.
- Tooltips, popovers, dropdown menus and command/search palette.
- Tabs, breadcrumbs, pagination and stepper.
- Modal dialogs, confirmation dialogs and side drawers.
- Toasts, inline alerts, banners and status indicators.
- Empty states, skeleton loaders, progress indicators and error states.
- Tables with sorting, filtering, bulk actions and responsive handling.
- Charts with accessible summaries and date-range controls.
- Avatars, badges, chips, tags and status labels.
- Plan/usage meters and feature-locked states.
- Navigation sidebar, top bar, mobile navigation and contextual action bars.
- Searchable block library and canvas inspector.
- Page preview frame and responsive viewport selector.
- Product, service, booking, order and lead components.
- Consent, permission and integration-status components.
- Audit log and activity timeline components.

## 4.3 Component-state requirement

For every important component, design the relevant states:

- Default.
- Hover.
- Focus.
- Pressed/selected.
- Disabled.
- Loading.
- Success.
- Error.
- Empty/unconfigured.
- Permission denied or feature locked, where relevant.

Do not show only the happy path.

---

# 5. INFORMATION ARCHITECTURE

Keep the hierarchy understandable as the product grows.

## 5.1 User-facing workspace navigation

Proposed primary navigation:

1. **Overview** — actionable summary of page performance and unfinished setup.
2. **My Spaces** — pages, profiles, campaign pages and micro-sites.
3. **Canvas** — visual editor for the selected page.
4. **Commerce** — products, collections, orders, inventory and digital goods.
5. **Bookings** — services, availability, calendar and booking management.
6. **Audience** — leads, contacts, consent and lightweight CRM.
7. **Automations** — workflows, templates, runs and failure logs.
8. **Analytics** — traffic, clicks, conversion events, sources and experiments.
9. **Domains & QR** — custom domains, handles, QR codes and campaign links.
10. **Extensions** — available blocks, themes, integrations and modules.
11. **Settings** — profile, branding, team, integrations, billing, security and data.

Do not force every user to see every module. Navigation should reflect entitlements, enabled modules and user permissions. Keep upgrade opportunities contextual and tasteful.

## 5.2 Super-admin navigation

A separate protected operations application/area with clear role-based access:

1. Operations overview.
2. Users and tenants.
3. Pages and domains.
4. Plans, billing and entitlements.
5. Feature flags and release controls.
6. Module and marketplace management.
7. Payments and provider health.
8. Orders, refunds and dispute support.
9. AI provider configuration, usage and budgets.
10. Moderation, abuse and trust.
11. Support cases and announcements.
12. Analytics and business reporting.
13. Integrations and notifications.
14. Audit logs and privileged access.
15. Data export/deletion requests.
16. System settings, localisation and policy versions.
17. Security, incidents, backups and service health.

The super-admin is not merely a dashboard. It is the operational control plane for the whole application, including its public content and enabled features. Every privileged action must be role-scoped, confirmed when risky, and auditable. Never design a single omnipotent admin role as the only access model.

---

# 6. SCREEN INVENTORY — DESIGN THE WHOLE PRODUCT

Create a screen inventory and design the core screen families below. Use the master blueprint and backlog to add any missing required screens. This list is a minimum planning inventory, not a limit.

## A. Public marketing website

1. Homepage / product landing page.
2. Features overview.
3. Use cases / business kits.
4. Templates gallery and template detail.
5. Pricing and plan comparison.
6. Marketplace/extension discovery teaser.
7. Customer stories or case studies—use clearly illustrative content until real stories exist.
8. Help centre / documentation.
9. Contact and support.
10. Sign up, sign in, password recovery and email verification.
11. Terms, privacy, cookie/consent and acceptable-use pages.
12. Mobile responsive navigation and footer states.

**Design direction:** Strong editorial hierarchy, a clear product promise, genuine product screenshots, attractive but restrained visual storytelling, and clear CTAs. Do not use exaggerated revenue claims, fake customer logos, invented testimonials or fake statistics.

## B. Onboarding and first-use experience

1. Welcome and account creation.
2. Choose primary goal: creator, freelancer, store, service provider, event, portfolio, community or other.
3. Choose template or start blank.
4. Enter page identity and handle.
5. Add profile image/logo and short description.
6. AI-assisted setup through text/chat/voice concept, with a visible draft review.
7. Select starter blocks.
8. Configure first meaningful action.
9. Preview on mobile.
10. Publish confirmation and sharing options.
11. Progress checklist and return-to-setup state.

**Requirements:** Short, skippable, resumable onboarding; useful defaults; no long interrogation before the user sees value. Show missing requirements honestly and make the next step clear.

## C. Workspace overview

1. Overview dashboard.
2. Recent pages/spaces.
3. Setup checklist.
4. Recent visitor actions and top links.
5. Commerce summary if enabled.
6. Upcoming bookings if enabled.
7. Leads requiring attention.
8. Automation failures or domain issues.
9. Usage and plan summary.
10. Contextual recommendations.

Do not make the overview a wall of metrics. Prioritise the next useful action and show only a small number of relevant metrics. Charts must answer a question and include period/context.

## D. My Spaces / page management

1. All spaces list/grid with search and filters.
2. Create new space.
3. Space detail/settings.
4. Duplicate page.
5. Draft versus published status.
6. Publish/unpublish confirmation.
7. Version history and restore.
8. Redirect/retire page flow.
9. Page-level permissions and team access.
10. Page health and setup warnings.

## E. Canvas/artboard builder — the signature experience

Design this with exceptional care. It is the product's defining interaction.

### Desktop editor layout

- **Top bar:** KUBICU brand/workspace, page name, save state, undo/redo, preview, share/publish and contextual menu.
- **Left panel:** searchable block library, layers/structure, saved sections and templates. Use tabs or clear modes rather than showing everything at once.
- **Central artboard:** the actual editable page, shown within a realistic device frame when useful. It must remain visually dominant.
- **Right inspector:** contextual properties for the selected block—content, appearance, layout, visibility, destination/data connection and advanced settings.
- **Bottom or compact viewport controls:** device preview and zoom only where they help.
- **Publishing state:** explicit draft/published/version status and clear publish confirmation.

### Mobile editor

Do not shrink the desktop layout into an unusable miniature.

- Show the artboard as the main view.
- Use a compact top bar with save state, preview and publish.
- Use a bottom action rail or clearly named tabs for Blocks, Design, Layers and Settings.
- Open block properties in a full-height sheet or dedicated panel.
- Provide touch-friendly drag handles and a non-drag reorder alternative.
- Keep essential controls reachable and avoid hidden gestures as the only interaction.
- Ensure the keyboard does not obscure the field being edited.

### Canvas capabilities to represent

- Add, remove, duplicate, hide/show and reorder blocks.
- Touch drag-and-drop and accessible list-based reorder.
- Undo/redo.
- Autosave with clear saved/saving/offline/conflict status.
- Draft and published versions.
- Preview at mobile/tablet/desktop widths.
- Page themes and design tokens.
- Background, typography, colours, buttons, spacing, borders and layout presets.
- Block-specific properties.
- Link destination, CTA style and open-behaviour settings.
- Image/media selection and crop.
- Visibility scheduling or conditions where supported.
- Data-connected blocks for products, services, forms and bookings.
- Saved sections and reusable templates.
- Version history, restore and publish review.
- Empty state, first-block onboarding, unsaved changes, save failure, offline recovery and publish failure.
- Accessibility and contrast warnings.
- Responsive warnings for content that may not fit.
- AI suggestions with clear explanation, preview and accept/reject controls.

### Canvas design rules

- Every panel has a clear title and predictable controls.
- Keep selected-block properties contextual; do not show every setting at once.
- Make the selected block visually obvious without ugly thick outlines.
- Show insertion positions clearly during drag.
- Avoid accidental deletion; provide undo and confirmation for destructive actions when needed.
- Never rely on colour alone to indicate selection.
- The public page preview must look like a real page, not a wireframe.
- Do not let the editor chrome overwhelm the artboard.
- All block types must be discoverable by name and category.
- The underlying design must support responsive behaviour; desktop layout is not automatically copied to mobile.

## F. Block library and design controls

Create a coherent library of block-picker states and editor controls for:

**Core blocks**

- Profile/identity.
- Headline and rich text.
- Link/button.
- Social links.
- Image, gallery, video and supported embed.
- Divider and spacer.
- Contact and location.
- FAQ.
- Lead capture form.
- Newsletter signup.
- Product highlight and product grid.
- Service/booking CTA.
- Downloadable file.
- Portfolio/case study.
- Pricing table.
- Event/ticket CTA.
- Donation/payment CTA where supported.
- Testimonial with attribution.
- Menu/catalogue.
- Calendar/availability CTA.
- Campaign or DealRoom CTA.
- Review/verification display with truthful status.

Each block needs a clear name, category, icon, description, preview, configuration UI, empty state, validation feedback and entitlement state. Avoid a long undifferentiated list.

## G. Public bio pages and mini-sites

Design multiple high-quality public page examples, not one repeated template:

1. Creator/influencer page.
2. Freelancer/portfolio page.
3. Small retail storefront.
4. Fashion/beauty seller.
5. Food business/menu and ordering.
6. Service provider/booking page.
7. Event or campaign page.
8. Digital product seller.
9. Professional business profile.
10. Micro-website with multiple sections/pages.

Each public page should demonstrate:

- Excellent mobile composition.
- Fast visual hierarchy and concise identity.
- Strong but tasteful calls to action.
- Consistent button styles and spacing.
- Realistic content lengths.
- Readable type and accessible contrast.
- Social links and appropriate metadata.
- Loading, unavailable, sold-out, closed and error states as relevant.
- KUBICU branding appropriate to the selected plan without intrusive promotion.
- Clear customer trust cues without fabricated verification.

Public pages must be designed separately from the editor. The visitor should not see editor chrome or admin terminology.

## H. Themes and template marketplace

1. Template discovery gallery.
2. Search, categories and filters.
3. Template detail and live preview.
4. Apply template confirmation.
5. Save custom theme.
6. Theme editor.
7. Paid/free template labels and licensing details.
8. Purchased/downloaded items.
9. Ratings and reviews with moderation-aware presentation.
10. Theme update and compatibility states.

Design templates by outcome and business type as well as by visual style. Do not make all templates the same layout with different colours.

## I. Commerce — physical products

1. Commerce overview.
2. Product list with search, filters and status.
3. Create/edit product.
4. Product image gallery and media manager.
5. Variants: size, colour, options and SKU.
6. Pricing, discounts and tax configuration where applicable.
7. Inventory and stock movements.
8. Collections/catalogues.
9. Storefront block configuration.
10. Checkout preview.
11. Order list and order detail.
12. Fulfilment: pickup, delivery zones, charges and status.
13. Customer/order timeline.
14. Cancellation, refund and dispute flow.
15. Sales and fee report.
16. Empty inventory, low stock, sold out and import errors.

Show payment processor fees, KUBICU fees, discounts, refunds and net proceeds separately. Do not imply that KUBICU holds money or provides escrow unless the business/legal model explicitly supports it.

## J. Digital products

1. Digital product list.
2. Upload/create digital item.
3. File processing and scanning state.
4. Delivery/access settings.
5. Purchase and receipt preview.
6. Secure download/access page.
7. Customer access records.
8. File version update.
9. Refund/revocation state.
10. Storage and bandwidth usage.

Do not imply that downloaded files can be made impossible to copy. Explain access rules clearly.

## K. Checkout and payment setup

1. Payment integration discovery.
2. Connect provider.
3. Provider connection success/error.
4. Test mode versus live mode.
5. Checkout settings.
6. Currency and supported payment methods.
7. Payment pending/success/failed/cancelled states.
8. Order confirmation.
9. Refund request and status.
10. Reconciliation/transaction detail.
11. Provider outage or delayed confirmation.

Payment methods depend on provider, country, account and merchant eligibility. Use clearly labelled illustrative states until confirmed. Never invent live transaction status or expose secrets.

## L. Bookings and services

1. Service list.
2. Create/edit service.
3. Duration, price, staff/resource and location.
4. Availability rules and calendar.
5. Booking settings, buffers and booking limits.
6. Customer booking flow.
7. Deposit/full payment setting where supported.
8. Booking confirmation.
9. Reschedule/cancel flow.
10. Upcoming/past bookings.
11. Customer intake form.
12. Reminders and notifications.
13. Calendar integration settings.
14. No availability, conflict and provider failure states.

Make timezone, duration, cancellation rules, fees and confirmation status explicit. Do not create ambiguous calendar interactions.

## M. Audience, leads and lightweight CRM

1. Contacts/leads list.
2. Lead detail and activity timeline.
3. Lead source and consent.
4. Tags, notes and follow-up tasks.
5. Pipeline/status view where useful.
6. Lead form builder.
7. Form submissions.
8. CSV export.
9. Duplicate detection/merge review.
10. Consent/opt-out and deletion state.
11. Contact import mapping and errors.

Do not design bulk messaging as a way around consent. Unsubscribed contacts must be clearly suppressed.

## N. Automations

1. Automation overview.
2. Workflow gallery/recipes.
3. Visual workflow builder.
4. Trigger selection.
5. Conditions/branches.
6. Action selection.
7. Delay/schedule.
8. Test run and preview.
9. Draft/active/paused states.
10. Execution history.
11. Failure detail, retry and recovery.
12. Permission and connection requirements.
13. Usage/cost visibility.
14. Tenant-level and global pause states.

Represent the workflow as a readable sequence: **Trigger → Condition → Action → Delay/Branch → Outcome**. Avoid a confusing spaghetti diagram. AI-generated workflows must be previewed and approved before activation. Show failures and logs rather than hiding them.

## O. AI copilot and Voice-to-Store

1. AI creation entry point.
2. Chat/brief composer.
3. Voice input concept where supported.
4. Clarifying questions.
5. Generated draft and assumptions.
6. Before/after preview.
7. Block-level AI suggestions.
8. Rewrite CTA/content.
9. Product-description generation from supplied facts.
10. FAQ/policy draft with warnings.
11. Analytics explanation and suggested action.
12. Workflow generation and test preview.
13. AI usage/credits and limits.
14. Unavailable, rate-limited and failed states.
15. Approval and revert controls.

AI must not invent prices, stock, testimonials, qualifications, delivery promises, legal policies or measured results. Distinguish generated suggestions from verified facts. The user retains control of public publication and consequential commercial changes.

## P. Analytics and Link Intelligence

1. Analytics overview.
2. Page views and unique/estimated visitor metrics with definitions.
3. Link/CTA performance.
4. Traffic source and campaign attribution.
5. QR/campaign performance.
6. Product and checkout funnel.
7. Booking funnel.
8. Lead conversion.
9. Date-range comparison.
10. Export/report.
11. Link Intelligence recommendations.
12. Experiment setup and variants.
13. Experiment progress/results.
14. Privacy/consent and tracking settings.

Use charts only when they clarify a real question. Label time range, units, definitions and sample size when relevant. Avoid decorative charts with fabricated precision. Use illustrative data clearly labelled in prototypes. Do not claim causal lift unless an appropriate experiment supports it.

## Q. Domains, links and QR

1. Domain list.
2. Connect domain wizard.
3. DNS record instructions.
4. Ownership verification.
5. Pending/verified/error status.
6. TLS/SSL readiness.
7. Map domain to a page/site.
8. Canonical URL and SEO settings.
9. Redirect management.
10. QR generator with destination preview.
11. Campaign link creation.
12. QR download/print formats.
13. Scan analytics where measurable.
14. Disconnect/migrate/recovery flow.
15. Domain expiry and troubleshooting.

Custom domain should feel like a guided, confidence-building workflow, not a raw DNS form. Do not claim a domain is live until verification and certificate status support that state.

## R. IntentFlow

1. IntentFlow overview.
2. Create a campaign/visitor experience.
3. Define source or explicit routing condition.
4. Design variant using the canvas.
5. Preview each variant.
6. Set measurement goal.
7. Publish/activate.
8. Compare outcomes.
9. Pause or roll back.
10. Explain routing rules and privacy implications.

Rules must be transparent and controlled by the owner. Do not infer sensitive personal traits. Do not create hidden discriminatory experiences.

## S. DealRoom and campaign commerce

1. DealRoom gallery/list.
2. Create campaign room.
3. Add products/services/bundle.
4. Set real stock, seats, deadlines and terms.
5. Configure referral/campaign links.
6. Preview mobile campaign.
7. Publish/share/QR.
8. Orders and campaign performance.
9. Campaign end/expired state.
10. Refund and fulfilment support.

No fake countdowns, fake demand, fake reviews or hidden conditions.

## T. Trust Passport and Proof-of-Work

1. Trust profile overview.
2. Verification request and evidence submission.
3. Verification status, scope and expiry.
4. Business policies and contact details.
5. Portfolio/project library.
6. Case-study builder.
7. Testimonial attribution and permission.
8. Public Trust Passport/portfolio preview.
9. Report a misleading claim.
10. Revoke/update verification.

Never imply a check was performed if it was not. Protect evidence and sensitive documents. Badges must explain their meaning.

## U. Extensions and marketplace

1. Extension marketplace.
2. Categories: blocks, themes, integrations, automation recipes, reports and business kits.
3. Extension detail page.
4. Publisher profile.
5. Permissions requested.
6. Compatibility and version details.
7. Install/enable confirmation.
8. Configure extension.
9. Update available.
10. Failed installation and rollback.
11. Disable/uninstall with data-retention explanation.
12. Reviews, reports and moderation.
13. Publisher/creator dashboard and earnings where relevant.
14. Super-admin approval queue.

Make permissions, pricing, compatibility, support status and data access understandable before installation. Marketplace design must not imply all third-party extensions are equally trusted.

## V. Teams, settings and billing

1. Account profile.
2. Workspace settings.
3. Team member list and invitations.
4. Roles and permissions.
5. Integrations/connections.
6. Security sessions and MFA.
7. Notification preferences.
8. Plan comparison.
9. Current subscription and usage.
10. Upgrade/downgrade.
11. Billing period and cancellation.
12. Invoice/receipt history.
13. Failed payment/recovery.
14. Data export and deletion.
15. Privacy and consent controls.
16. API keys/webhooks where enabled.

Make billing and cancellation clear, not manipulative. Downgrade should not be presented as if it silently deletes data.

## W. Super-admin operations system

This must be designed as a complete operating system for KUBICU—not a superficial admin dashboard.

### Operations overview

- Platform health and service status.
- New users, active tenants and published pages.
- Subscription/revenue summaries with definitions.
- Payment and webhook health.
- Abuse and support queues.
- AI usage/cost summary.
- Module/integration failures.
- Important alerts and recent privileged actions.

### Users and tenants

- Search/filter tenant list.
- Tenant detail and lifecycle.
- Users, memberships and roles.
- Subscription and entitlement view.
- Pages, domains and integrations.
- Usage limits and flags.
- Suspend/restore workflow with reason and appeal route.
- Support view-as/impersonation with time limit, justification and audit trail.

### Plans, billing and entitlements

- Plan catalogue and feature matrix.
- Trial/coupon configuration.
- Subscription and invoice lookup.
- Failed payment handling.
- Credits and manual adjustments with reasons.
- Entitlement reconciliation.
- Feature usage and limit overrides.
- Transparent financial history.

### Feature flags

- Flag list and owner.
- Environment, plan, tenant/cohort and percentage targeting.
- Preview of affected users.
- Rollout status.
- Emergency kill switch.
- Change history and audit log.
- Clear distinction between a feature flag and an authorization permission.

### Modules and marketplace

- Module registry and versions.
- Manifest/permission review.
- Compatibility checks.
- Approve/reject/pause/revoke.
- Rollback and incident state.
- Marketplace pricing/commission configuration.
- Publisher support and review moderation.

### Payments and commerce operations

- Provider health.
- Payment attempts and webhook events.
- Reconciliation exceptions.
- Refunds and disputes.
- Fee configuration and reporting.
- Audit trail and support notes.
- Never expose provider secrets or full payment credentials.

### AI operations

- Configured providers/models.
- Usage, costs and budget limits.
- Rate limits and abuse signals.
- Feature/model availability flags.
- Prompt/template version management where appropriate.
- Failure rates and fallback status.
- Tenant-level controls.
- Do not expose private user content unnecessarily.

### Trust, moderation and support

- Abuse reports and case queues.
- Link/domain risk indicators.
- Evidence and action history.
- Proportionate enforcement actions.
- Appeals and reversals.
- Support ticket details and internal notes.
- Knowledge base and announcements.
- Emergency page/link takedown.
- Do not design automated scores as the sole basis for severe enforcement when human review is practical.

### System administration

- Staff users, roles and permissions.
- MFA and privileged-access reviews.
- Audit logs.
- Data export/deletion requests.
- Notification/email templates.
- Locale/currency/policy configuration.
- Backup and restore status.
- Incident timeline and runbooks.
- Status page configuration.
- Service metrics and alert rules.

### Super-admin visual rules

- Dense information must still be organised.
- Use tables for operational lists, clear filters, meaningful column priorities and good empty states.
- Keep high-risk actions visually distinct and require confirmation.
- Separate operational alerts from ordinary activity.
- Show status, owner, timestamp and next action where relevant.
- Never use colour alone for severity.
- Make audit trails easy to inspect.
- Keep destructive actions away from routine primary buttons.
- Use progressive disclosure for advanced settings.
- Show role-based disabled states clearly without leaking restricted data.

## X. Public trust, legal and safety states

Design clear experiences for:

- Suspicious page report.
- Page owner appeal.
- Content/page suspension.
- Policy acknowledgement.
- Consent preferences.
- Cookie/analytics preferences where applicable.
- Unsubscribe confirmation.
- Data export/deletion request status.
- Payment or order dispute.
- Domain verification warning.
- Account security warning.

Do not use threatening or accusatory copy by default. Explain what happened, what the user can do next and how to appeal where appropriate.

---

# 7. RESPONSIVE DESIGN RULES

Design deliberately for:

- Small mobile screens.
- Standard mobile.
- Large mobile.
- Tablet.
- Laptop.
- Desktop/wide desktop.

Do not simply scale desktop screens down.

## Mobile-first priorities

- Public pages should feel native to a phone browser: fast, readable, easy to tap and visually balanced.
- Primary CTA should be obvious without overwhelming the content.
- Forms use appropriate mobile input types and clear validation.
- Tables transform into useful compact lists or allow intentional horizontal scrolling where appropriate.
- Canvas uses dedicated mobile interaction patterns.
- Drawers and dialogs fit the viewport and preserve a visible close/back action.
- Sticky controls must not obscure content or keyboard focus.
- Use touch targets of approximately 44 × 44 CSS pixels where practical.
- Respect safe areas on modern mobile devices.
- Avoid heavy media and unnecessary animation.
- Preserve hierarchy and meaningful content at every breakpoint.

## Accessibility

Target WCAG 2.2 AA as a design goal, subject to implementation testing:

- Readable contrast.
- Keyboard access and visible focus.
- Proper labels and error messages.
- Semantic heading hierarchy.
- Screen-reader-friendly controls.
- Alternatives to drag-and-drop.
- Reduced-motion support.
- Accessible chart summaries.
- Do not rely on colour, hover or gesture alone.
- Respect zoom and text resizing.

---

# 8. AFRICAN/NIGERIAN MARKET CONTEXT WITHOUT VISUAL STEREOTYPES

The product must feel relevant to Nigerian users and adaptable to other African markets, but do not make the entire interface look like a themed local directory.

Design for practical realities:

- Mobile-first use and Android device diversity.
- Variable network quality and data costs.
- WhatsApp-led customer discovery and handoff.
- Nigerian naira (NGN) as an initial supported currency, while allowing a future multi-currency system.
- Local phone formats and address conventions.
- Provider-dependent local payment options.
- Delivery, pickup and dispatch workflows.
- Creators and sellers who may operate from social platforms rather than a conventional website.
- Businesses ranging from informal solo operators to registered companies and agencies.

Do not assume every Nigerian user uses the same payment method, language, device or fulfilment model. Show only payment options confirmed for the configured provider and merchant.

Use locally relevant examples across fashion, beauty, food, creative work, professional services, events, education and retail. Keep the overall product aesthetic international, polished and credible.

---

# 9. CONTENT AND MICROCOPY RULES

- Use clear, concise, human language.
- Avoid filler text such as “Lorem ipsum” in key screens.
- Use realistic but explicitly illustrative sample data.
- Do not invent real customer logos, testimonials, usage statistics, payment success, certifications or verification claims.
- Use Nigerian names/businesses only as fictional sample content where appropriate; do not imply endorsement.
- Use consistent terminology: page/space, block, publish, draft, custom domain, lead, booking, order, integration, extension and plan.
- Make action labels explicit: “Publish page”, “Connect domain”, “Create product”, “Test workflow”.
- Explain consequential actions and fees before confirmation.
- Error messages should explain what failed, what remains safe and what to do next.
- Empty states should explain the value of the feature and provide one relevant next action.
- Do not use fear-based upgrade messaging.
- Avoid fake urgency, fake scarcity and manipulative cancellation flows.

---

# 10. DATA, CHARTS AND MOCKUP HONESTY

Magic Patterns prototypes may use sample data. Keep it coherent and clearly illustrative.

- Use the same page names, product names, orders, dates and metrics across related screens.
- Do not show contradictory totals between overview, orders and analytics.
- If values are illustrative, mark them in design documentation or prototype notes.
- Do not imply real provider connections, real customer reviews, actual payments or real domain verification.
- Charts must have labels, dates, units and useful empty/loading/error states.
- Include zero-data and low-data states.
- Show timestamps/timezones where important.
- Distinguish payment pending from payment confirmed.
- Distinguish estimated visitor metrics from exact transaction counts.
- Do not present inferred conversion impact as proven causal lift.

---

# 11. INTERACTION AND PROTOTYPE EXPECTATIONS

Where supported by Magic Patterns, make these interactions demonstrable:

- Main navigation and contextual subnavigation.
- Create page and choose template.
- Add and select canvas blocks.
- Edit block content and appearance.
- Reorder blocks and see the result.
- Switch device preview.
- Open and close the inspector.
- Undo/redo concept.
- Save/publish flow.
- Public page preview.
- Create product and preview its storefront block.
- View order detail and change a mock fulfilment state.
- Create a service and preview booking.
- Configure a basic automation and inspect its run history.
- Start custom-domain setup and progress through illustrative states.
- Toggle a feature flag in the admin prototype with clear impact context.
- Review an extension's permissions before installing.
- Open a support/moderation case and view its audit history.

Every visible control should be one of:

1. Working prototype interaction.
2. Clearly marked illustrative/non-functional control.
3. Intentionally disabled with a reason.

Do not create dead buttons that look functional. Do not claim that prototype interactions prove production integration.

---

# 12. SCREEN PRODUCTION WORKFLOW — QUALITY OVER VOLUME

Do not generate every screen in one uncontrolled pass. Work in batches and preserve the design system.

## Batch 1 — Brand and core design system

Deliver:

- Brand direction exploration.
- Final recommended visual direction.
- Colour and typography tokens.
- Spacing/grid/radius system.
- Core components and states.
- Mobile and desktop navigation.
- Public-page style principles.

Get this system coherent before scaling.

## Batch 2 — Signature canvas experience

Deliver:

- Desktop editor.
- Mobile editor.
- Block library.
- Properties inspector.
- Responsive preview.
- Save/error/offline/publish states.
- One complete example page built through the editor.

This batch receives the highest visual and interaction scrutiny.

## Batch 3 — Public pages and onboarding

Deliver:

- Marketing homepage.
- Signup/onboarding.
- Template gallery.
- Creator page.
- Storefront.
- Service booking page.
- Portfolio page.
- Public page mobile states.

## Batch 4 — Commerce and customer operations

Deliver:

- Products and inventory.
- Orders and fulfilment.
- Checkout states.
- Digital products.
- Bookings.
- Leads/CRM.
- Basic automations.

## Batch 5 — Analytics, domains and AI

Deliver:

- Analytics.
- Link Intelligence concept.
- QR and custom domains.
- AI page generation and review.
- Automation builder and run history.
- IntentFlow/DealRoom concept screens.

## Batch 6 — SaaS administration and marketplace

Deliver:

- Workspace settings and billing.
- Teams and roles.
- Extension marketplace.
- Super-admin operations.
- Feature flags.
- Moderation/support.
- Audit and system health.

## Batch 7 — QA and visual refinement

Review all screen families for:

- Consistent typography and spacing.
- Responsive behaviour.
- Naming consistency.
- Empty/loading/error states.
- Keyboard/accessibility affordances.
- Coherent sample data.
- Clear primary actions.
- No clutter or duplicated controls.
- No broken navigation or dead-end flows.
- No missing requirements in the traceability matrix.

If time or generation limits force prioritisation, preserve all scope in the inventory and finish batches in order. Do not silently discard later requirements.

---

# 13. MVP VERSUS FUTURE CONCEPTS

The visual system should represent the complete product vision, but must not blur what is available at launch.

## MVP design priority

- Authentication and onboarding.
- Page management.
- Canvas editor.
- Core blocks and themes.
- Public pages and publishing.
- QR generation.
- Basic analytics.
- Super-admin foundations.
- Plans/entitlements foundations.
- Security, privacy, reporting and system states.

## Commerce-ready release

- Product catalogue and inventory.
- Orders and fulfilment.
- At least one verified payment provider in the target market.
- Digital product delivery if selected.
- Leads and consent.
- Booking if validated as a launch vertical.
- Refund/support states.

## Later phases

- Advanced automation.
- Advanced marketplace and creator payouts.
- IntentFlow.
- DealRoom.
- Trust Passport.
- Proof-of-Work.
- Voice-to-Store.
- Advanced Link Intelligence and experiments.
- Partner fulfilment network.
- Developer API and extensions.

For future concepts, create compelling concept screens or clearly marked roadmap states. Do not present them as operational features in the MVP.

---

# 14. REQUIRED DESIGN DELIVERABLES

At completion, provide or maintain:

1. **KUBICU Design System** — tokens, type scale, grid, components and states.
2. **Full Screen Inventory** — all product, public, commerce, admin and future-concept screens.
3. **Design Traceability Matrix** — every master requirement mapped to design coverage.
4. **Responsive Layout Set** — key mobile, tablet and desktop variations.
5. **Canvas Interaction Specification** — block insertion, selection, reorder, editing, preview, saving and publishing.
6. **Core User Flows** — onboarding-to-publish, create-and-sell, booking, custom domain, automation and admin operation.
7. **Super-admin Operating System** — complete navigation and major management workflows.
8. **Component State Library** — loading, empty, error, success, disabled and permission states.
9. **Prototype** — linked screens and plausible interactions for core journeys.
10. **Design Decision Register** — unresolved business and technical assumptions.
11. **Visual QA Checklist** — consistency and usability findings.
12. **Handoff Notes** — component behaviour, responsive rules, design tokens and important implementation considerations.

If Magic Patterns cannot produce a particular artefact directly, document the requirement and provide the closest supported handoff. Do not pretend a missing artefact exists.

---

# 15. FINAL SELF-AUDIT BEFORE DECLARING DESIGN COMPLETE

Before reporting completion, answer every item honestly:

## Product completeness

- [ ] Did you read and preserve both companion documents?
- [ ] Is every requirement in the traceability matrix?
- [ ] Are all modules accounted for, including super-admin and future concepts?
- [ ] Are MVP and future phases clearly separated?
- [ ] Are custom domains, commerce, bookings, automation, AI and marketplace covered?
- [ ] Is the public page experience distinct from the editor?
- [ ] Is the admin a complete operations system, not just a dashboard?

## Visual quality

- [ ] Is the interface polished, elegant, attractive and coherent?
- [ ] Are typography, colours, alignment and spacing intentional?
- [ ] Is hierarchy obvious on every screen?
- [ ] Is there a clear primary action?
- [ ] Has clutter been removed?
- [ ] Are cards and gradients used with restraint?
- [ ] Are icons consistent and understandable?
- [ ] Do public templates look genuinely different and professionally art-directed?
- [ ] Does mobile feel purpose-built rather than compressed desktop?
- [ ] Are empty, loading, error and success states designed?

## Trust and accuracy

- [ ] Are mock data and future concepts labelled honestly?
- [ ] Are payment, fee, domain and verification states truthful?
- [ ] Are AI outputs reviewable and editable?
- [ ] Are consent, privacy, opt-out and data controls represented?
- [ ] Are risky admin actions confirmed and auditable?
- [ ] Are accessibility and low-bandwidth requirements considered?

## Interaction and handoff

- [ ] Are key screens linked into complete user flows?
- [ ] Are visible controls functional in the prototype or clearly marked otherwise?
- [ ] Are canvas operations represented?
- [ ] Are responsive states documented?
- [ ] Are open questions recorded?
- [ ] Are all uncovered requirements explicitly listed rather than silently omitted?

Do not mark the work complete if critical requirements are missing. Provide an honest gap report and a prioritised completion plan.

---

# 16. COPY-AND-EXECUTE INSTRUCTION TO MAGIC PATTERNS AI

You are the lead product designer, design-systems architect and interaction designer for KUBICU. Your task is to design an exceptionally polished, elegant, visually distinctive, mobile-first SaaS product and its complete design system.

First, inspect `KUBICU_MASTER_BLUEPRINT.md`, `KUBICU_IMPLEMENTATION_BACKLOG.md` and this design plan. Read them as a connected specification. Create the Design Traceability Matrix, Screen Inventory and Design Decision Register before expanding the screen set. Do not skip requirements, compress the product into a generic dashboard, or invent functionality to fill gaps.

Prioritise visual excellence: beautiful and attractive screens, intentional typography, carefully chosen colours, consistent spacing, precise alignment, balanced composition, strong hierarchy, accessible contrast, refined component states and clear primary actions. The UI must feel polished and elegant, never cluttered. Avoid generic AI-dashboard styling, excessive cards, random gradients, unnecessary decorative effects, inconsistent spacing and oversized content that pushes useful controls out of view.

Design the Canvas/artboard as the signature experience. Give it a strong, usable central artboard, a searchable block library, a contextual inspector, clear save/publish states and a mobile-specific interaction model. Design real page blocks for links, media, products, bookings, forms, portfolios and commerce. The public page must be a separate, fast, beautiful visitor experience.

Cover the full product: marketing website, onboarding, page management, canvas, public pages, templates, products, physical/digital commerce, checkout, orders, fulfilment, bookings, leads/CRM, automations, AI creation, analytics, custom domains, QR codes, IntentFlow, DealRoom, Trust Passport, Proof-of-Work, extension marketplace, team settings, billing, security, moderation, support and the comprehensive super-admin operating system.

Treat KUBICU as a modular SaaS platform. Show feature availability, plan entitlements, integration permissions and future modules clearly. Distinguish MVP from later phases. Do not present future concepts as live features. Do not fabricate testimonials, customers, statistics, verified badges, payment outcomes, prices, inventory or delivery promises.

Design desktop and mobile intentionally. The public page must be mobile-first; the canvas must have a genuinely usable mobile editor; admin tables must remain understandable at narrow widths. Include empty, loading, error, success, disabled, permission-denied and offline/failure states wherever relevant. Provide keyboard alternatives to drag-and-drop and respect accessibility needs.

Create reusable design tokens and components before producing a large volume of screens. Work in the batches specified in this plan, review each batch against the design system, and keep a traceability matrix updated. Prototype the core journeys, including onboarding-to-publish, canvas editing, storefront/order handling, bookings, custom-domain setup, automation and super-admin operations.

Do not use mock screens or decorative controls as substitutes for the actual intended experience. Where a prototype cannot implement a real integration, show a realistic, clearly illustrative state and document the limitation. Ask a concise clarification only when a decision blocks coherent design; otherwise record a reversible assumption and proceed.

At the end, provide a coverage report: what is complete, what is partial, what is not represented, what is deferred to later phases and what requires founder confirmation. Do not claim full completion unless the traceability matrix supports it. Preserve the whole plot from the master blueprint through the design handoff.

**Success standard:** KUBICU should look and feel like a premium, award-calibre product: beautifully designed, coherent, spacious, intentional, easy to understand, locally useful, commercially credible and ready for disciplined implementation—not a cluttered feature catalogue.
