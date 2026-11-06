# KUBICU — Master Product, Market, Architecture & Implementation Blueprint

> **Prototype status note (24 Oct 2026):** this is the source spec and is not edited for status. All 20 concept extensions are now built in the prototype (several with the partner part simulated); see `docs/DESIGN_GAP_AUDIT.md` §3 for each concept's status.

**Product brand:** KUBICU (domain www.kub.icu is reported as available by the founder; verify ownership, DNS, trademark and social handles before launch)

**Document type:** Product master blueprint and implementation brief for product design, engineering, AI-assisted development, commercial planning and launch.

**Research snapshot:** 21 October 2026

**Positioning in one sentence:** An AI-powered, mobile-first link-in-bio and social-commerce operating system that turns any social profile, QR scan or shared link into a beautiful, ownable, measurable mini-business.

> **Core promise:** One link. Your brand. Your customers. Your commerce. Your growth.

---

## 0. How to use this blueprint

This document is intended to become the canonical product specification. It is not a request to clone proprietary source code or copy Linktree's protected branding. Use a clean-room competitive process: study publicly available capabilities, independently define equivalent user outcomes, and design a clearly differentiated implementation and brand.

The document separates:

1. **Market parity:** Capabilities users expect because Linktree and other competitors already offer them.
2. **Nigeria/Africa advantage:** Capabilities shaped around local payments, messaging, delivery, trust, bandwidth and business operations.
3. **Differentiated innovation:** New workflows that can create a genuine competitive moat if validated with users.
4. **Later-stage bets:** Ambitious features that should not delay a valuable and reliable first release.

A public-feature audit cannot reveal private code, unreleased features, internal system design, unpublished commercial terms or every experiment in a live product. Revalidate official competitor pages before implementation and pricing decisions. Product availability, plan packaging and payment-provider policies change.

## 1. Executive strategy

### 1.1 Build the category, not just the clone

KUBICU should launch as a **social-to-commerce operating system for African creators, entrepreneurs, service providers, retailers and small businesses**. The entry point is a personal link page. The value compounds when that page can accept enquiries, capture leads, collect payment, sell goods, book services, automate follow-up, track conversion and build a customer list the seller owns.

The product should feel like a polished creator tool on the surface and operate like a modular SaaS business platform underneath.

### 1.2 The strategic wedge

Do not compete solely through more themes, more blocks or an AI textbox. Those are easy for established competitors to add. Win by making the link page a working business asset:

- **Canvas-first creation:** build the page as a visual artboard with draggable, resizable, nestable blocks, responsive preview and safe one-tap publishing.
- **Local commerce that actually completes the sale:** Nigerian payment methods via properly licensed/approved payment partners, store checkout, local delivery rules, deposits, payment confirmation, order tracking and post-purchase communication.
- **WhatsApp-native workflows:** click-to-chat, product enquiries, prefilled order messages, lead capture, consent-based follow-up and integrations that respect WhatsApp/Meta platform rules.
- **Custom-domain ownership:** connect an existing domain or buy one through a properly authorized registrar partner; automate DNS guidance, SSL, domain verification and publishing checks.
- **Automation that performs work:** scheduled campaigns, conditional sections, stock-aware links, booking reminders, abandoned-checkout recovery and AI-generated experiments with human approval controls.
- **A real modular business console:** super admin can manage plans, feature flags, modules, billing, themes, integrations, marketplace, content, moderation, support, analytics, abuse, compliance and platform health without developer intervention for routine operations.
- **Data portability:** customers can export contacts, products, orders, analytics and page structure; their business cannot be held hostage by the tool.

### 1.3 Product principles

1. Mobile-first without making the editor cramped or frustrating.
2. Fast, accessible pages on modest devices and inconsistent networks.
3. Beautiful by default; powerful when the user wants control.
4. A modular backend with clear contracts rather than a tangled collection of conditional checks.
5. Local-first, Africa-ready, internationally extensible.
6. AI is a useful assistant and controlled executor, not an opaque, unreviewable decision-maker.
7. Sellers retain their customers' records and receive clear consent, privacy and export controls.
8. Payments are routed through approved third-party providers. Do not create an unlicensed wallet, hold customer funds or act as a payment intermediary without the appropriate legal and regulatory structure.
9. The public profile must work even when analytics, AI, marketing integrations or other non-critical services fail.
10. Every premium feature must have a cost, reliability, support and abuse-control plan.

## 2. Market and competitive audit

### 2.1 Linktree: what must be matched

Based on Linktree's official public pages reviewed on 21 October 2026, Linktree presents itself as a single destination for social links, content, products, audience capture, monetization and insights. Its official overview mentions customizable themes, social links, products, payments and tips in supported countries, digital business cards, bookings, contact forms, analytics, multiple Linktrees and Workspaces. Source: [About Linktree](https://linktr.ee/help/en/articles/5434130-about-linktree).

The following is the **parity checklist**, grouped by user outcome rather than by Linktree's internal implementation.

#### A. Profile, identity and page presentation

- Username-based hosted URL.
- Profile image/avatar, title, biography and supporting text.
- Curated themes and custom appearance controls.
- Custom backgrounds, including image/video options on paid tiers where offered.
- Button styles, shapes, colors, fonts and text colors.
- Stickers and decorative elements.
- Preview while editing.
- Featured/prominent links and media-rich link layouts.
- Link thumbnails and visual treatment.
- Basic mobile-responsive public page.
- Social profile and content embeds/links.
- QR/share-friendly destination.
- Fast, one-link publishing and editing.

Linktree's official design help describes themes, header, wallpaper, buttons, text and stickers; its link-organization guide describes featured layouts, collections, thumbnails, animated prioritization and scheduled visibility. Sources: [Customize design](https://linktr.ee/help/en/articles/8614125-customize-linktree-design), [Organize links](https://linktr.ee/help/en/articles/8614124-organize-links-keep-visitors-engaged).

#### B. Link-management functions

- Add, edit, duplicate, reorder, hide, archive and delete links.
- Link titles, URLs, descriptions, thumbnails and supported embed types.
- Collections/groups to organize destinations.
- Featured or highlighted links.
- Link scheduling: show and hide at particular dates/times.
- Campaign redirection or temporary prioritization, where offered.
- Smart rules/routing and visitor-specific variants on eligible plans.
- Social-content and media integrations.
- Link click reporting.
- Multi-page/multi-profile account management.
- Team/Workspace administration where available.
- Import/onboarding and link suggestions.
- Public page changes that update without a fresh URL.

Linktree officially documents scheduling and personalization rules that can change link copy, localize a URL or hide an irrelevant link for visitors from selected locations/platforms. Source: [Schedule links](https://linktr.ee/help/en/articles/5434174-schedule-links-on-your-linktree), [Personalize a link](https://linktr.ee/help/en/articles/13827984-personalize-a-link-for-different-visitors).

#### C. Audience capture and relationship management

- Contact forms.
- Email and phone capture/sign-ups.
- Form submissions visible inside an audience/contact area.
- Subscriber/lead lists and exports.
- Integrations that synchronize leads to email tools or spreadsheets.
- Visitor/customer notifications.
- Consent and terms options for some forms.
- Third-party marketing integrations.

Linktree's help centre documents contact-form submissions, audience records, CSV export, email notifications, and integrations such as Mailchimp, Klaviyo, Kit and Google Sheets. Sources: [Contact forms](https://linktr.ee/help/en/articles/5651972-add-contact-form), [Audience integrations](https://linktr.ee/help/en/articles/11069074-setting-up-third-party-audience-integrations).

#### D. Analytics and insights

- Page views and link clicks.
- Click-through rate.
- Link-by-link performance.
- Audience and traffic-source insights where available.
- Subscriber and earnings metrics for eligible accounts.
- Date-range analytics.
- Different history depths by plan.
- Advanced analytics and exports on higher tiers.
- Performance feedback to help prioritize links.

Linktree's published plan documentation on the research date lists different insights windows by plan: 28 days (Free), 90 days (Starter), 365 days (Pro), and lifetime (Premium). These details are subject to future plan changes. Source: [Understanding analytics](https://linktr.ee/help/en/articles/5434178-understanding-your-analytics).

#### E. Monetization and commerce

- Digital products, files, downloads and related content.
- Courses, where supported.
- Bookings/appointments, including free and paid sessions where eligible.
- Tips/donations and related earning options where supported.
- Product/affiliate displays and shop experiences, subject to eligibility.
- Checkout and provider-based payouts.
- Transaction and payment-provider fees.
- Earnings reporting.
- Restrictions on eligible countries, content categories and payout setup.

Linktree's official help page reviewed for this snapshot says direct sales of digital products, courses and bookings are limited to a defined set of supported countries and require Stripe payout setup; it lists its Linktree Shops, sponsored links and affiliate opportunities as US-only. Nigeria was not in the published direct-earnings country list on 21 October 2026. This is a documented current-market limitation, not a guarantee about future availability. Sources: [Earn feature requirements and limits](https://linktr.ee/help/en/articles/11126119-earn-feature-requirements-limits), [Digital products](https://linktr.ee/help/en/articles/10518645-about-selling-digital-products), [Linktree Shops](https://linktr.ee/help/en/articles/9342172-linktree-shops-faqs).

#### F. Growth, automation and integrations

- Social links and third-party app links.
- Email integrations.
- Scheduling for content or links.
- Instagram comment/DM auto-replies on eligible plans, subject to platform policies.
- Link personalization/routing rules.
- AI design assistance and/or integrations on higher plans.
- Third-party integrations for commerce, media, marketing and analytics.
- Multi-profile and workspace features.

#### G. Billing, support and business administration

- Free and paid subscription plans.
- Higher tiers with additional customization, insights, earning capabilities and team/AI tools.
- Self-service plan upgrades/downgrades/cancellations.
- Billing records and account settings.
- Support resources and, for higher-value customers, enhanced support.
- Terms, acceptable-use rules, safety review and payment/provider restrictions.

#### H. Published pricing snapshot

The Linktree pricing page observed on 21 October 2026 displays a US-facing offer of Free; Starter at US$6/month billed annually or US$8 monthly; Pro at US$12/month billed annually or US$15 monthly; and Premium at US$30/month billed annually or US$35 monthly. The page's precise included features, fees and promotions may differ by account, market or time. Do not copy these prices mechanically; use them as one benchmark only. Source: [Linktree pricing](https://linktr.ee/s/pricing).

### 2.2 The important Linktree distinction

The official pages establish that Linktree is more capable than a bare link list. It already has audience tools, digital products, courses, bookings, insights, design controls, schedule/routing features and integrations. Therefore:

- Do **not** claim that AI, analytics, product selling, bookings, scheduling or page customization alone beat Linktree.
- Do **not** assume every global user can access every feature.
- Do **not** build an inferior visual experience and expect local relevance to compensate.
- Do build the same essential jobs well, and then win on mobile canvas editing, local monetization, operational workflows, customer ownership and marketplace extensibility.

### 2.3 Adjacent competitor audit

| Competitor/category | Public positioning and capabilities to benchmark | Strategic implication |
|---|---|---|
| Beacons | Link-in-bio, store, AI tools, email marketing, media kit, affiliate links, analytics, paid custom domains on some plans; public pricing includes creator-oriented AI and seller-fee tiers. | AI page edits, creator commerce and email are table stakes in this category. Source: [Beacons pricing](https://beacons.ai/i/pricing), [Beacons AI product update](https://shop.beacons.ai/i/whats-new). |
| Stan Store | Creator-focused store/checkout, digital products, courses, memberships, appointments and audience monetization. Recheck live product/pricing pages at procurement time. | Make the page a transaction destination, not just a traffic hub. |
| Taplink | Flexible bio-site layouts and content blocks, forms, payments and business-oriented page tools; capabilities vary by plan/provider/region. | Simple block-based editing is a baseline; the canvas needs high usability and consistent responsive rules. |
| Carrd | Lightweight one-page websites, responsive design, forms/embeds and custom-domain support on paid tiers. | Keep public pages fast and make custom domains attainable. |
| Squarespace Bio Sites | Branded link pages within a larger website/e-commerce platform family. | Offer a path from a bio page into a broader business presence without forcing a complex website project. |
| WhatsApp Business | Messaging-led commerce, enquiries, catalogue and relationship handling through a channel familiar to local businesses. | Treat click-to-WhatsApp and messaging handoff as core flows, not footer links. |
| Payment gateways / checkout tools | Paystack and Flutterwave support locally relevant payment acceptance, subject to account approval, channel availability and pricing. | Abstract gateways behind payment adapters; the product itself should not hold seller money. |

Competitor pages for revalidation: [Beacons](https://beacons.ai/), [Stan Store](https://stan.store/), [Taplink](https://taplink.at/), [Carrd](https://carrd.co/), [Squarespace Bio Sites](https://www.squarespace.com/).

### 2.4 Payments landscape and unit-economics implications

On the research date, Paystack's published Nigeria fee page states local payments at 1.5% + ₦100, capped at ₦2,000 (with the ₦100 waived for transactions below ₦2,500); international cards are shown at 3.9% + ₦100 for Nigeria. Flutterwave's Nigerian pricing page shows local transactions at 2% (1.4% transaction fee + 0.6% platform fee) and international transactions at 4.8%, with separate transfer fees and VAT notes. The seller's actual fees depend on provider, account, payment method, settlement, contract and policy. Sources: [Paystack pricing](https://paystack.com/pricing), [Paystack fee support](https://support.paystack.com/en/articles/2130306), [Flutterwave Nigeria pricing](https://flutterwave.com/ng/pricing).

**Implications:**

- Gateway fees are separate from KUBICU's SaaS or platform fee. Display them transparently.
- Do not promise free or instant payment processing.
- Support seller-owned gateway accounts where practical; platform-managed aggregation or split settlement requires formal provider support and legal review.
- Build reconciliation and webhook idempotency from day one.
- Charge subscription fees for the platform value; transaction fees should be a clearly disclosed optional/plan-dependent revenue stream, not a confusing hidden surcharge.

## 3. The target market and priority users

### 3.1 Initial target segments

1. **Creators and influencers:** make a professional page, feature current content, collect leads, sell digital products and manage brand deals.
2. **Small retailers:** catalog, WhatsApp enquiries, checkout/payment, delivery zones, inventory and order tracking.
3. **Service providers:** stylists, barbers, makeup artists, photographers, designers, repairers, consultants, fitness coaches, tutors and event vendors.
4. **Digital sellers and educators:** e-books, templates, presets, paid communities, workshops, courses and memberships.
5. **Music, entertainment and events:** music releases, ticket links, event RSVP/booking, merch and sponsor pages.
6. **Professional businesses:** portfolio, consultation booking, quote requests, lead capture, contact card and testimonials.
7. **Restaurants, food sellers and home businesses:** menus, order forms, pickup/delivery choices and WhatsApp handoff.
8. **Agencies and social-media managers:** manage many client pages, reusable design systems, approvals, branded reporting and invoices.
9. **SMEs and teams:** several staff, locations, departments, campaigns and products under one workspace.
10. **Diaspora-facing African sellers:** cross-border enquiries and eligible payments with clear currency and fulfilment restrictions.

### 3.2 Jobs to be done

- “Give me one beautiful link I can paste in every social profile.”
- “Make the page look professionally designed even though I am not a designer.”
- “Let a customer buy or book without a long conversation.”
- “Help me sell through WhatsApp without losing track of orders.”
- “Let me publish on my own domain rather than rent a platform identity forever.”
- “Tell me which content and links bring real money, not just clicks.”
- “Automatically update my page when a product sells out, a campaign begins or my booking slots fill.”
- “Let my assistant or agency work on my page without receiving my password.”
- “Help me build a customer list I can export and use with permission.”
- “Let me start cheaply and upgrade only when the business is ready.”

### 3.3 Market wedge and brand promise

**Recommended category:** Social Commerce OS / Creator Commerce Platform.

**Short tagline options:**
- One Link. Your Whole Business.
- Turn Attention into Income.
- Your Brand, Store and Growth in One Link.

Use the first as the working internal promise. Test all consumer-facing wording with target users before brand lock.

## 4. Product scope: capability map

The product must be a modular platform with independently configurable feature packages. The following modules describe product domains, not a demand to ship all features simultaneously.

### Core platform modules

1. Identity, authentication and account security.
2. Workspace, organization, roles and team seats.
3. Link pages and page publishing.
4. Canvas visual builder and component/block library.
5. Themes, design tokens, templates and assets.
6. Links, collections, redirects and routing.
7. Public-page rendering and edge/cache delivery.
8. QR codes, short links and share cards.
9. Custom domains and SSL lifecycle.
10. Analytics and event collection.
11. Billing, plans, entitlements and feature flags.
12. AI assistant, generation and workflow automation.
13. Notification center and messaging.
14. Integrations/connectors.
15. App marketplace and module lifecycle.
16. Super-admin operations console.
17. Trust, safety, moderation and abuse prevention.
18. Support/help centre and status/incident tools.

### Commerce and growth modules

19. Physical product catalogue.
20. Digital products and gated delivery.
21. Services and packages.
22. Cart, checkout and order management.
23. Payment-provider adapters and reconciliation.
24. Taxes, invoices, receipts and refunds/returns workflows.
25. Delivery, pickup and fulfilment.
26. Coupons, promotions, bundles and gift cards.
27. Inventory and stock reservations.
28. Bookings, calendars and reminders.
29. Courses, lessons and learner access.
30. Memberships/subscriptions and access control.
31. Tips, donations and crowdfunding, subject to provider/usage policies.
32. Lead capture forms and custom form builder.
33. CRM, contact segmentation and pipelines.
34. Email campaigns and triggered communications.
35. WhatsApp/DM integrations and click-to-chat flows.
36. Social campaign links, UTM tagging and campaign attribution.
37. Affiliate/referral and ambassador management.
38. Media kits and partnership enquiry workflows.
39. Reviews, testimonials and trust badges.
40. A/B tests and conversion optimization.
41. Team collaboration, approvals and client workspaces.
42. Agency white-label and multi-client reporting.

### Differentiation and advanced modules

43. Conditional page sections and audience-specific experiences.
44. AI page operator with approval and rollback.
45. Automatic product/link health monitoring.
46. Availability-, stock- and schedule-aware page blocks.
47. Local delivery and WhatsApp order workflows.
48. Smart business card and contact exchange.
49. NFC/QR campaign tooling.
50. Offline-friendly and low-bandwidth public page modes.
51. Creator earnings and conversion attribution workspace.
52. Reputation and fraud signals for merchant pages.
53. Localized language and regional presentation packs.
54. Advanced automation workflow builder.
55. Developer API, webhooks, SDK and embedded widgets.
56. Template marketplace and third-party extension marketplace.
57. Optional AI campaign and landing-page experimentation suite.

Every module needs an owner, interface contract, dependency list, entitlement key, setting namespace, permission set, audit events, migration strategy, test suite, operational dashboard and rollback process.

## 5. The canvas-first link builder

### 5.1 The core experience

The builder should be the product's signature. Avoid making a “canvas” that is only a conventional form editor with drag handles bolted on. It should be a guided visual artboard that lets a person build a brand-quality, mobile-first page using blocks and an accurate live preview.

#### Desktop editor layout

- Left rail: block library, layers/tree, page/section structure, assets, templates and integrations.
- Central artboard: interactive page canvas; drag-and-drop reorder; selection outlines; resize handles where supported; snap guides; section boundaries; nested groups; multi-select; keyboard shortcuts.
- Right inspector: content, style, responsive behaviour, visibility, links/actions, analytics and advanced settings for selected block.
- Top bar: page selector, undo/redo, autosave state, responsive preview, preview, collaborator presence, draft/live status, publish/rollback.
- Optional secondary preview: phone frame with toggle between narrow phone, wide phone, tablet and desktop. Public pages remain mobile-first; preview sizes test responsive rules rather than define a separate page by default.

#### Mobile editor layout

A full desktop-like three-panel canvas squeezed into a phone will be frustrating. Use a mobile-native editing flow:

- Full-screen page preview as the primary view.
- Floating “Add block” action.
- Touch drag handles and clear drop insertion markers.
- Tap a block to open a bottom-sheet inspector with simple tabs: Content, Style, Behaviour and Visibility.
- One-thumb controls for reorder, duplicate, hide, delete and move.
- On-screen Undo/Redo and Save/Publish status.
- Press-and-hold or a dedicated handle for dragging so ordinary scrolling is not mistaken for reordering.
- Provide an accessible reorder list as an alternative to drag-and-drop.
- Canvas editor never requires horizontal scrolling at common phone sizes.

### 5.2 Data model: blocks, sections and responsive layout

Represent page content as a versioned, validated JSON document or equivalent structured representation, not HTML pasted into a database.

Each block should include:

- `id`: stable unique identifier.
- `type`: registered block/module type.
- `schemaVersion`: version of the block data schema.
- `content`: typed copy, URL, media or product references.
- `style`: design-token references plus safe per-block overrides.
- `layout`: order, alignment, width mode, spacing and responsive rules.
- `behaviour`: click action, destination, analytics settings and allowed interactions.
- `visibility`: publish state and conditional rules.
- `accessibility`: meaningful labels, alt text and semantics.
- `dataBindings`: optional references to product, inventory, booking or campaign data.
- `createdAt`, `updatedAt` and optional author metadata.

A page consists of sections; each section has its own order, layout constraints and visibility. Blocks should not be allowed arbitrary JavaScript or unsafe HTML. Third-party blocks run inside a capability-limited component environment with explicit permissions.

### 5.3 Block catalogue

#### Foundation blocks
- Profile/header, avatar, logo and verification status.
- Rich text, heading, paragraph, divider and spacer.
- Standard link button, featured CTA and icon link.
- Link collection/accordion.
- Image, image gallery and carousel.
- Video embed and media player where lawful/technically supported.
- Social profile row and social feed embeds where provider policies allow.
- Announcement bar, badge, countdown and campaign banner.
- Contact details and digital business card.

#### Conversion blocks
- Email/phone capture.
- Custom forms, survey and lead quiz.
- WhatsApp click-to-chat with controlled message templates.
- Call button, map/location and directions.
- Booking availability and service cards.
- Product grid, product detail, bundle and add-to-cart.
- Checkout/pay link, donation/tip and payment request.
- Course/membership offer.
- Testimonial, review summary, FAQ and trust/guarantee statement.
- Coupon, referral and limited-time campaign.
- Newsletter signup and consent manager.

#### Advanced blocks
- Live inventory indicator.
- Booking calendar or available-slot selector.
- Event/ticket block.
- Lead qualifier or quote-request flow.
- Before/after comparison, portfolio grid and case study.
- Dynamic link directory or mini-menu.
- Location-specific delivery/availability notice.
- Personalised content section based on permitted, non-sensitive conditions.
- Multi-step purchase/booking flow.
- AI-generated recommendation section with disclosure where necessary.
- Loyalty/reward status, if the business enables the relevant module.

### 5.4 Editor behaviours and quality bar

- Drag/reorder should provide obvious start, target and drop feedback.
- Undo and redo for every meaningful edit, including move, delete, layout and content.
- Autosave with visible state, conflict detection and retry; no silent loss.
- Draft, preview, publish, scheduled publish and rollback to previous published version.
- Version history with restore and optional named snapshots.
- Copy/paste, duplicate, multi-select and bulk operations.
- Responsive breakpoints and block-level visibility rules.
- Reusable blocks, saved sections, global headers/footers and brand styles.
- Starter templates by persona and goal.
- Full accessibility: keyboard paths, screen-reader labels, focus order, contrast hints and alternatives to drag gestures.
- Page speed budget and warnings for oversized media.
- Mobile preview must reflect the public page, not a fake editor-only approximation.
- Validation checks for empty URLs, broken links, missing alt text, insufficient contrast, invalid form setup, missing product price, unsupported payment configuration and unfinished domain setup.
- Theme settings should support design tokens, not force users to style each block independently.
- Publishing must be resilient: validate, generate artifact, warm/refresh cache where applicable, then flip a publication pointer atomically.

### 5.5 Template system

Templates are commercially valuable assets. Support:

- Goal templates: “get bookings,” “sell an e-book,” “launch a product,” “show a portfolio,” “promote a music release,” “restaurant menu,” “event RSVP,” “collect leads,” “sell thrift/fashion,” “real-estate agent,” “agency client page.”
- Industry packs that can be selected without making every user look the same.
- One-click apply with before/after preview and merge strategy.
- Creator-submitted templates, review queues, versioning and revenue share.
- Template scoring from activation, conversion, mobile speed and accessibility—not beauty alone.
- Seasonal/cultural campaigns for Nigerian calendars, with opt-in content and no stereotyping.

## 6. Public page and publishing runtime

### 6.1 Required routes

- `brand-domain.com/` — published page or site root.
- `brand-domain.com/shop` — optional storefront.
- `brand-domain.com/product/{slug}` — product details.
- `brand-domain.com/book/{service}` — booking.
- `brand-domain.com/checkout/{session}` — checkout.
- `brand-domain.com/qr/{campaign}` — optional tracked QR entry.
- `pulsebio.example/{username}` — hosted subdomain page.
- Short links such as `puls.bio/{slug}` — only if the final domain is secured and short-link service is built.

Do not hard-code the final codename or domain into application logic. The URL system must support future brand changes and tenant-owned custom domains.

### 6.2 Page rendering requirements

- Server-render or pre-render public page content when it improves first load and discoverability.
- Keep public pages small; lazy-load secondary sections and large media.
- Support modern image formats, responsive image sizing and video poster frames.
- Edge/CDN caching with safe invalidation when publishing.
- Canonical URLs, custom metadata, Open Graph/Twitter cards, favicons and sitemap handling where relevant.
- `noindex` options for private campaigns or unpublished previews.
- Consent-aware analytics; limit unnecessary third-party scripts.
- Clear platform branding controls by plan, without deceptive disclosure.
- SEO fields and previews; structured data for relevant products/events where appropriate.
- Avoid blocking a page load on AI, CRM, payment, analytics or messaging service availability.

### 6.3 Page safety and link integrity

- URL protocol allowlist; block dangerous schemes and disallowed destinations.
- Malicious-domain and phishing detection, with review/appeal workflow.
- Detect redirect loops, expired links and inaccessible destinations.
- Rate limiting, bot controls and abuse throttling.
- Protect against open redirects, SSRF and malicious embeds.
- Optional external-link disclosure and sponsored/affiliate labels.
- Scan uploaded assets and constrain content types/size.
- Maintain takedown records and a transparent appeal pathway.

## 7. Custom domains on the fly

Custom domains are a primary positioning advantage and must be implemented as a genuine product workflow, not a support ticket.

### 7.1 User journey

1. User chooses “Connect a domain.”
2. Enter an owned domain or, later, select domain purchase through an authorized registrar partner.
3. Explain DNS instructions in plain language; support automated connection only where provider authorization/API permits it.
4. Display the exact TXT/CNAME/A/ALIAS records needed, with copy buttons and status checks.
5. Verify control of the domain before binding it to a tenant.
6. Provision SSL/TLS and show a clear progress/status state.
7. Select the page/store/site that should be served from the domain.
8. Run pre-publish checks, redirect policies, canonical URL and certificate tests.
9. Publish when healthy; retain the hosted subdomain as a fallback.
10. Notify the owner if DNS expires, certificate renewal fails or the domain stops resolving.

### 7.2 Domain architecture and controls

- A domain registry table with tenant, hostname, verification status, DNS status, certificate status, default/canonical flag and timestamps.
- Ownership verification using unique challenges.
- Protection against one domain being claimed by multiple tenants.
- Automatic renewal/validation checks and retries.
- Domain transfer, removal and downgrade policies.
- Avoid promising “instant” propagation; DNS caching is outside the platform's complete control.
- Multi-tenant routing must validate the Host header against a known domain map and never trust arbitrary hostnames.
- Custom domain feature is entitlement-controlled and separately metered for support/SSL/DNS cost if needed.

## 8. State-of-the-art commerce system

The commerce module should feel like a real micro-store while remaining frictionless for a customer arriving from Instagram or WhatsApp.

### 8.1 Product types

- Physical goods with variants, SKU, stock, shipping, pickup and return rules.
- Digital goods: files, templates, software assets, music, videos, guides and downloads.
- Services: fixed-price packages, quote-first services, hourly bookings or retainers.
- Experiences/events: tickets, RSVPs, paid workshops and limited-capacity events.
- Courses: modules, lessons, downloads and completion tracking.
- Memberships: recurring access/benefits where billing provider, local law and operational support make this viable.
- Bundles, cross-sells, upsells, gift products and order add-ons.
- Pre-orders and made-to-order products with explicit delivery expectations.

### 8.2 Product management

- Product title, description, price, compare-at price, currency, tax flags and SKU.
- Variants, options, inventory rules, low-stock warnings and reservations.
- Multiple images, video and alt text.
- Digital-file access policy, download limits/expiries and watermark options where appropriate.
- Product status: draft, active, scheduled, sold out, archived.
- Per-product sales metrics and conversion attribution.
- Bulk import/export by validated CSV; safe duplicate detection.
- Product templates and AI-assisted copy generation.
- Stock-aware public blocks and automatic sold-out state.
- Optional stock sync connector framework for later POS/e-commerce integrations.

### 8.3 Checkout and payment flow

- Guest checkout by default; account creation should not be forced where unnecessary.
- Clear product/variant/quantity, delivery choice, fees, total and return/fulfilment policy before payment.
- Customer contact fields configured by seller, minimal by default.
- Payment methods based on country, gateway account, provider approval and transaction type.
- Provider-hosted/tokenized payment UI where practical; never store raw card credentials.
- Idempotent checkout sessions and webhook processing.
- Reliable `pending`, `paid`, `failed`, `cancelled`, `refunded`, `partially_refunded`, `disputed` and `expired` states.
- Reconciliation view for provider events versus internal orders.
- Automated receipts and seller notifications after verified provider events.
- Refund workflow and reason codes; refunds must be confirmed by the payment provider before marking paid funds refunded.
- Manual bank-transfer proof should be flagged as an unverified/manual state until a reliable provider signal or seller confirmation is received.
- Prevent duplicate charges with idempotency keys, session expiry and clear retry controls.
- Transparent gateway fee vs platform fee disclosure.

### 8.4 Nigeria-first payment strategy

Implement a payment adapter layer. Start with one primary gateway selected after technical due diligence and an alternate provider to reduce outages or support a missing method. Candidate integration evaluations include Paystack and Flutterwave, but availability of each method depends on merchant eligibility, integration approval and provider terms.

Target methods where available and permitted:

- Local debit cards.
- Bank transfer/virtual account via provider-supported rails.
- USSD and account-based flows where the provider supports them.
- International cards and diaspora checkout where account setup and settlement rules allow.
- Payment links and invoices.
- Optional pay-on-delivery or seller-approved manual transfer workflow for physical goods, with explicit fraud controls.

Avoid building a proprietary stored-value wallet, pooling seller money, or promising split settlements without specialist legal and provider review. Use seller-connected payment accounts where feasible. If a platform-of-record marketplace model is later desired, design the contracts, payout ledger, KYC, dispute handling and regulatory structure before shipping it.

Official fee references for planning only: [Paystack pricing](https://paystack.com/pricing) and [Flutterwave Nigeria pricing](https://flutterwave.com/ng/pricing). These fees are provider charges and can change.

### 8.5 Nigerian fulfilment and delivery

- Delivery zones by state, city, LGA or postcode where coverage data permits.
- Flat rate, free delivery threshold, weight/volume rules, local pickup and seller-defined rates.
- Delivery estimate and cut-off notices.
- Separate delivery address from billing details when appropriate.
- Order fulfilment status and tracking code/URL.
- Carrier adapter API for local courier integrations.
- Manual dispatch as first-class flow for informal/independent sellers.
- WhatsApp handoff with order summary and reference number.
- Return, exchange, refund and cancellation policy display before checkout.
- Delivery exceptions, failed delivery and customer contact notes.
- Location data minimization; only collect what fulfilment needs.

### 8.6 Commerce innovation concepts

- **WhatsApp Order Bridge:** creates a structured draft order, prefills relevant details and keeps a copy in the merchant's order inbox whether the last-mile conversation continues in WhatsApp or in the KUBICU checkout.
- **Pay-and-Book:** customer pays a deposit or full fee while choosing a time; payment and calendar states stay synchronized.
- **Trust Layer:** seller profile, verified contact/domain indicators, clear policies, transaction references and verified reviews. Never manufacture trust badges; define evidence required.
- **Smart Availability:** removes sold-out items, pauses bookings during unavailable windows and replaces expired campaigns automatically.
- **Business-in-a-Link Dashboard:** shows page views → product views → checkout starts → confirmed orders, plus booking and lead conversion.
- **Creator Offer Builder:** bundle a digital download, short consultation and physical add-on into a single landing experience.
- **Local Delivery Composer:** seller defines city/zone and pickup rules without integrating a courier API on day one.
- **Campaign Kit:** generate a page section, QR code, short link, tracked campaign source and social copy together.
- **Reusable customer offers:** coupon, referral and repeat-customer link, subject to abuse limits.

## 9. Booking, scheduling and service commerce

### Required capabilities

- Services, packages, duration, price, deposit and cancellation policy.
- Staff/resource calendars and availability.
- Business hours, buffers, blackout dates and minimum notice.
- Time-zone-aware availability; display the buyer's local time while storing canonical timestamps.
- Double-booking prevention and concurrency-safe slot reservation.
- Booking approval/manual confirmation and automatic-confirmation modes.
- Google Calendar or other calendar connectors only after OAuth permission and API due diligence.
- Email/WhatsApp reminders where consent, provider policy and message templates allow.
- Reschedule, cancel, waitlist and no-show controls.
- Booking intake questions and file uploads where justified.
- Venue, online meeting or home-service options.
- Deposit/full payment/refund handling.
- Staff assignment, workload limits and internal notes.
- Recurring appointments only when cancellation and payment flows are robust.
- Conversion analytics: views, slot selections, completed bookings, cancellation and no-show rates.

### Differentiators

- A service provider can publish a branded service mini-site from the same artboard as the bio link.
- AI proposes booking-page copy, service descriptions, FAQs and intake questions, with editable drafts.
- Booking capacity drives page visibility and campaign status.
- Customers can select service, location/mode, slot and payment in one coherent flow.
- Service businesses can route complex jobs to a quote form rather than forcing a fixed-price booking.

## 10. CRM, audiences and automated growth

### 10.1 CRM foundation

- Contact profiles with minimal necessary fields and consent records.
- Contact source, campaign, referrer and landing page.
- Tags, segments, lifecycle stages and custom fields.
- Lead timelines: form submitted, product viewed, order paid, booking made, message/campaign sent and consent changed.
- Notes, tasks and assignment to team member.
- Import/export and deduplication.
- Suppression list and unsubscribes.
- Data-retention controls and deletion/export requests.
- Lead pipelines: new, contacted, qualified, proposal sent, won, lost.

### 10.2 Form builder

- Simple contact, enquiry, quote request, survey, RSVP, order intake and lead qualification forms.
- Field types: text, email, phone, number, dropdown, multiple choice, consent, date/time, file, address (where required), hidden attribution fields.
- Conditional logic, validation and success state.
- Anti-spam/rate limits and CAPTCHA alternatives that work on mobile.
- Consent, purpose and privacy notice configuration.
- CRM mapping, workflow triggers and export.
- Avoid collecting sensitive personal data unless the specific product use-case and legal basis genuinely require it.

### 10.3 Messaging and lifecycle automations

- Welcome lead follow-up.
- Booking confirmation/reminders.
- Abandoned checkout reminders when the necessary consent and lawful basis exist.
- Back-in-stock alerts.
- Order receipt, delivery and digital access messages.
- Lead assignment/notification.
- Time-limited campaign launch/expiry.
- Follow-up after a quote or consultation.
- Re-engagement only with appropriate permission and frequency controls.
- Consent capture and opt-out at the point of collection.

Use a channel-adapter design: email provider, SMS provider, WhatsApp/Meta provider, in-app notification and webhook. Do not pretend a simple `wa.me` link is a WhatsApp automation integration. Official messaging APIs, approved templates, opt-in and platform policies must be respected.

## 11. AI-native capabilities

AI must offer more than a generic chat window. It should be embedded in creation, operations, growth and analysis, with clear user control.

### 11.1 AI Page Architect

Inputs may include a short description, profession, business name, existing website, logo, sample images, catalog CSV or user-selected content. Output a draft page plan:

- Proposed sections and blocks.
- Page hierarchy and CTA strategy.
- Theme palette, type scale and spacing tokens.
- Link labels and descriptions.
- Suggested trust elements, FAQs and forms.
- Suggested storefront/booking blocks when the use case indicates them.
- Recommended mobile-first layout.
- SEO/share metadata.

User reviews the draft in the artboard, edits it and publishes explicitly. AI must never publish a generated page or overwrite a live design without an authorized confirmation or previously defined user rule.

### 11.2 AI Co-Builder

Natural-language commands such as:
- “Move the booking button to the top and make it the main call to action.”
- “Create a Ramadan campaign section that ends tomorrow at 9pm Lagos time.”
- “Show this offer only when stock is available.”
- “Turn this portfolio into a page for clients who need brand identity work.”
- “Create a page for this product CSV and group products by category.”

The assistant produces a proposed change set, describes the impact, then applies it only within the user's permission model. Changes are versioned and reversible.

### 11.3 AI Growth Analyst

- Explain changes in visits, clicks, leads, bookings and sales.
- Identify broken links, low-converting CTAs, inconsistent copy and missing metadata.
- Recommend experiments backed by the user's own data.
- Suggest clearer titles and block ordering.
- Generate UTM-tagged campaigns and channel-specific copy.
- Build a weekly “what changed, what worked, what to try next” report.
- Clearly separate observed facts from estimates or model suggestions; avoid promising guaranteed revenue uplift.

### 11.4 AI Business Assistant

- Draft replies to common enquiries from approved FAQ/policy content.
- Summarize leads and order activity.
- Draft product descriptions, quotes, booking instructions and follow-up messages.
- Flag stock, booking or delivery issues.
- Answer operator questions from data the current user is permitted to access.

### 11.5 AI controls and cost governance

- Configurable model/provider adapters; do not hardwire the product to one provider.
- Model selection by task, latency, cost, privacy and quality.
- Per-tenant and per-user quotas; token/credit ledger and visible usage.
- Cache/reuse outputs only where safe and appropriate.
- Separate “generate draft” from “execute action.”
- Tool permissions: read, propose, edit draft, publish, send communication, issue refund, change billing—each is distinct and permissioned.
- High-risk actions require approval; irreversible or money-moving actions should never be triggered solely by free-text inference.
- Prompt-injection defenses for web content, uploaded files and integrations.
- Safe handling of secrets and customer data; redact sensitive fields from model inputs where feasible.
- Evaluation dataset for page quality, fact preservation, safe action execution and language quality.
- Explain AI-generated copy where material; never generate fake testimonials, fabricated statistics or unsupported certifications.
- AI provider fallback, timeout, rate limits and clear error messages.
- “AI off” mode: core product remains usable.

## 12. Automation and rules engine

Create a visual automation builder inspired by workflow tools, but scoped to product actions.

### Trigger categories
- Link clicked (aggregated, threshold-triggered; avoid needless personal tracking).
- Page published, page viewed threshold reached, or campaign window starts/ends.
- Form submitted, lead created or CRM stage changed.
- Checkout started, payment confirmed/failed/refunded.
- Product stock below threshold/out of stock/back in stock.
- Booking created/rescheduled/cancelled/approaching.
- Customer joins/unsubscribes from a list.
- A scheduled date/time occurs.
- Integration webhook received.

### Condition categories
- Page, product, campaign, order, booking or lead type.
- Date/time, timezone and day window.
- Inventory/availability state.
- Campaign source/UTM.
- Consent and channel eligibility.
- Workspace/team conditions.

Do not create targeting based on sensitive personal traits. Use country/platform or other visitor-context rules only with lawful basis, transparent notices and privacy review.

### Action categories
- Show/hide/swap a page section.
- Change button destination or CTA copy.
- Notify the seller/team.
- Add/update a CRM tag/stage.
- Send permitted transactional or consent-based communication.
- Create a task.
- Generate an AI draft/report.
- Publish a previously approved scheduled page version.
- Call a safe outbound webhook.

### Workflow guardrails
- Preview, test payload and dry run.
- Versioned workflows and rollback.
- Per-workflow execution logs and retry policy.
- Idempotency keys and dead-letter queue.
- Loop detection and maximum executions.
- Cost/volume limits, rate limiting and alerting.
- Approval gates for public publishing or outbound mass communication.

## 13. Analytics, attribution and experimentation

### 13.1 Core metrics

- Unique and total page views with privacy-respecting definitions.
- Clicks by block/link and click-through rate.
- Referrer, platform and UTM campaign.
- Lead submissions and qualified leads.
- Product impressions, product-detail views, checkout starts and paid orders.
- Gross sales, refunds, net sales and average order value.
- Booking starts, completed bookings, cancellations and no-shows.
- Digital product downloads and course access.
- Conversion by page version, template, device class and campaign.
- Custom-domain health and page-performance measures.
- Returning visitors, only where permitted and designed with privacy in mind.

### 13.2 Attribution

- UTM builder, QR source and campaign short links.
- First-touch and last-touch source models, clearly labelled.
- Order/booking tied to the original page/campaign when reliable identifiers survive the funnel.
- Click-to-WhatsApp handoff tracking with limited, transparent identifiers; do not assume the entire conversation can be observed.
- Server-side events for paid orders from trusted gateway webhooks.
- Bot filtering, event deduplication and a documented analytics glossary.

### 13.3 Experimentation

- A/B test block headline, CTA label, order, theme and offer.
- Randomization with stable assignment where feasible.
- Minimum sample and duration guidance; avoid treating noisy, tiny samples as certainty.
- Conversion target chosen by the user.
- Statistical caveats and experiment rollback.
- Never experiment with legally required disclosures, payment totals or consent controls in ways that remove user protection.

## 14. Super-admin: full operations control plane

The super-admin panel is a first-class product and must manage the full platform without direct database edits for normal operations. It should be a secure, separately permissioned control plane, not just another user's dashboard with a different menu.

### 14.1 Dashboard and operational overview

- Total users, active tenants/workspaces, published pages and paid subscribers.
- Subscription MRR/ARR estimates, churn, upgrades/downgrades and failed payments.
- Page views, clicks, checkout volume and commerce activity in aggregated form.
- Module usage and entitlement consumption.
- Payment-gateway status, webhook lag and reconciliation exceptions.
- Domain verification/SSL failure queues.
- Queue depth, latency, errors, cache hit ratio and uptime signals.
- AI usage, provider costs, error rates and tenant quotas.
- Abuse reports, phishing flags, moderation backlog and unresolved support tickets.
- Recent security events, admin actions and configuration changes.

### 14.2 Tenants and users

- Search, filter and inspect accounts/tenants/workspaces.
- View subscription, module entitlements and usage.
- Suspend/reactivate according to documented policy and authorized roles.
- Manage verified identity or business status where a defined verification program exists.
- Reset account access using secure workflows; never display user passwords or secrets.
- Impersonation/support view must be narrowly scoped, time-limited, reason-coded, auditable and preferably read-only by default. Never use unlogged impersonation.
- Merge duplicate accounts only through a reviewed, reversible process.
- User data export, deletion and privacy-request workflow.
- Account risk and fraud signals with review/appeal controls.

### 14.3 Plans, billing and entitlements

- Plan creation, versioning, localization and scheduled changes.
- Monthly/annual billing, trials, coupons, promos and grandfathered customers.
- Usage quotas and overage rules.
- Entitlement matrix by feature, module, limit and role.
- Subscription proration, failed-payment grace period, cancellation and reactivation.
- Invoices/receipts, tax configuration and provider reconciliation.
- Refund and subscription adjustment permission controls.
- Platform-level and plan-level fee settings with change logs.
- Billing audit trail and downloadable reports.

### 14.4 Feature flags and configuration

- Global, environment, tenant, plan, role and percentage-based flags.
- Kill switches for integrations/modules without taking public pages offline.
- Gradual rollout and internal-only beta access.
- Time-limited promotional entitlements.
- Configurable limits, default settings and safe fallbacks.
- Flag owner, reason, creation date, expiry/review date and audit log.
- Separate flags from permission checks: a flag says capability is deployed; entitlement/permission says this actor may use it.

### 14.5 Module and add-on marketplace administration

- Create/edit module listings and versions.
- Module manifest, compatibility range and dependency graph.
- Install, enable, disable, upgrade, rollback and uninstall flows.
- Signature/integrity validation and package provenance.
- Required permission declarations and review status.
- Release channels: development, private beta, stable and deprecated.
- Compatibility tests, migration scripts and rollback capability.
- Pricing: free, one-time, recurring, usage-based or included with plans.
- Revenue-share and payout statements for third-party developers, subject to contractual and regulatory review.
- Review/rating moderation and abuse reports.
- Marketplace search, categories, screenshots, documentation and changelog.
- Disable listing globally or for selected tenants in a security incident.

**Critical architecture rule:** A “module” is not arbitrary code that an administrator uploads and executes inside the main process. Define a safe extension contract. Internal first-party modules may register through trusted build/deployment pipelines; external modules should run through constrained APIs, isolated runtimes or sandboxed UI extensions, with explicit permissions. Never execute untrusted marketplace code with unrestricted platform database or filesystem access.

### 14.6 Theme, block and template administration

- Global themes and design-token packages.
- Block catalogue and schema versions.
- Template review, versioning, popularity and performance.
- Template ownership, licensing, revenue share and takedown workflow.
- Asset moderation and image/font licensing records.
- Roll out a new default template without changing existing published customer pages unexpectedly.

### 14.7 Integrations and API management

- Provider credentials stored in a secret manager, never exposed in frontend responses.
- Connector configuration and health checks.
- OAuth scopes and user consent state.
- Webhook event logs, redacted payload inspection, retries and dead-letter queue.
- API key lifecycle, scoping, expiry, rotation and revocation.
- Per-tenant request limits and abuse analytics.
- Integration status page and incident history.
- Versioned API docs and backward-compatibility policy.

### 14.8 Content, moderation, trust and safety

- Report queue for spam, phishing, scams, counterfeit goods, abusive content and prohibited products.
- Triage rules, reviewer assignment, evidence and case notes.
- Graduated enforcement: warning, feature restriction, payment restriction where provider/legal basis supports it, temporary suspension, removal and appeal.
- Transparent acceptable-use policy and prohibited-category configuration.
- Impersonation and fraudulent-domain response process.
- Repeat-abuse detection without automatic overreach from a single weak signal.
- Copyright/report workflow and counter-notice where applicable.
- Audit trail for every moderation action.
- Emergency takedown and incident escalation process.

### 14.9 Platform CMS and communications

- Website/landing-page content manager.
- Help centre, documentation, changelog and status page.
- Banner announcements, in-product messages and maintenance notices.
- Email templates, transactional message templates and localization.
- Searchable admin notes and internal runbooks.
- Feature discovery and onboarding prompts controlled by configuration.

### 14.10 Customer support and success

- Ticket queues, categories, priority, SLA target and assignment.
- User/page/transaction context with permission controls.
- Macros, knowledge-base links and escalation workflows.
- Refund/billing/domain support queues separated where necessary.
- CSAT/feedback and product-request collection.
- Incident communication history.
- Secure attachment management and retention policy.

### 14.11 Finance, reporting and platform economics

- Subscription revenue reports and cohort retention.
- Payment fees and refunds from platform operating accounts.
- Platform fee ledger separated from seller transaction data.
- Module marketplace income and developer liabilities.
- AI/API/hosting cost per tenant and feature.
- Chargeback/dispute signals and gateway reconciliation.
- Exportable reports for accountants.
- No unsupported claims that internal dashboards replace a statutory accounting system.

### 14.12 Security and configuration governance

- Admin RBAC, least privilege and segregation of duties.
- Mandatory MFA for super admins; phishing-resistant authentication for critical roles when supported.
- Break-glass access with reason, time limit and alert.
- Audit logs that ordinary admins cannot rewrite.
- Approval requirement for high-risk actions (fees, payout settings, global flags, platform-wide takedowns).
- Security settings, session management and IP/device anomaly signals.
- Backups, retention, restore tests and incident runbooks.
- No shared super-admin password; no secrets in frontend code or logs.

## 15. SaaS architecture and modularity

### 15.1 Recommended starting architecture

Begin with a **modular monolith plus asynchronous workers**, not a premature microservice maze. Enforce module boundaries in code and schemas, then extract high-volume domains when traffic and team maturity justify it.

Core runtime components:

1. Public page delivery layer/CDN/cache.
2. Application/API layer with domain modules.
3. Relational primary database.
4. Object storage for media and digital goods.
5. Job queue and worker processes.
6. Analytics/event pipeline or a separate event store when required.
7. Search/index service when catalogue size justifies it.
8. Secret manager and configuration store.
9. Observability: metrics, logs, traces, error reporting and alerting.
10. Integration adapters and outbound webhook dispatcher.

### 15.2 Tenant isolation

- Every tenant-owned record has a tenant/workspace identifier and access policy.
- Enforce tenant scoping in the data-access layer and API authorization, not only in the UI.
- Automated tests must try cross-tenant reads/writes for every sensitive domain.
- Use row-level security or equivalent defense-in-depth where supported by the chosen database.
- Separate super-admin operations and privileged queries from normal customer APIs.
- Tenant ID should be derived from validated authenticated context, not blindly accepted from request payloads.
- File and object paths must enforce ownership and signed access.

### 15.3 Module contract

Each module must provide:

- Unique key and semantic version.
- Manifest metadata, owner, description and compatibility range.
- Dependencies and conflicts.
- Entitlement keys and required permissions.
- Database migrations with up/down or forward-recovery strategy.
- API routes and event subscriptions.
- Settings schema and defaults.
- Scheduled jobs/queue tasks declarations.
- UI contributions through approved extension points.
- Health check and operational indicators.
- Audit event definitions.
- Test suite and rollback/uninstall rules.
- Data-retention and deletion behavior.

### 15.4 Feature flags versus modules versus plans

Keep these distinct:

- **Module installed:** code/service extension is available in the deployment.
- **Module enabled:** platform/tenant operator has turned the extension on.
- **Feature flag enabled:** a specific capability is released for some audience/environment.
- **Subscription entitlement:** the tenant's plan or purchase includes the capability/limit.
- **Permission:** this user/role may perform a particular action.
- **Policy/eligibility:** the action is legally, operationally and provider-permitted for this account/country/content type.

Access requires all relevant gates to pass. A plan upgrade must not override a security permission or provider eligibility rule.

### 15.5 Technology choice

Select technology after a technical spike based on team skills, hosting, scaling and operating cost. A practical modern reference stack might include:

- TypeScript frontend with a mature component system and design tokens.
- React-based framework for the editor and public rendering, with server rendering where useful.
- TypeScript API service or a strongly typed backend framework.
- PostgreSQL or equivalent relational database.
- Redis or equivalent for cache, rate limits and queues where justified.
- S3-compatible object storage and CDN.
- Background workers for email, webhooks, media processing, analytics and automation.
- Payment adapters for approved gateways.
- Centralized metrics/logging/tracing and managed secrets.

Do not treat these choices as compulsory if the builder's existing stack, deployment constraints or engineering capability suggest a better validated fit. Document the decision and avoid a fragile mix of too many languages/frameworks.

### 15.6 API and event model

- Version public APIs (`/v1/...`) and document deprecation rules.
- Use idempotency for payment/order mutations.
- Emit domain events such as `page.published`, `link.clicked`, `lead.created`, `checkout.started`, `payment.confirmed`, `order.refunded`, `booking.created` and `domain.verified`.
- Deliver events at least once and design consumers to deduplicate; do not claim exactly-once delivery without a defensible mechanism.
- Use transactional outbox or equivalent when database state and event publication must not diverge.
- Sign outgoing webhooks, support secret rotation and redelivery controls.
- Never include secret credentials or unnecessary personal data in event payloads.

## 16. Suggested core data model

These entities are a starting map, not a substitute for detailed ERD and migration design.

- User, Identity, Session, MFAFactor, LoginEvent.
- Organization/Workspace, Membership, Role, Permission, Invitation.
- TenantSettings, BrandKit, CustomField.
- Page, PageVersion, Publication, Section, BlockInstance, Theme, Template.
- Link, LinkCollection, LinkRule, Redirect, ShortLink, QRCode, Campaign, UTMDefinition.
- Domain, DomainChallenge, CertificateStatus, DomainEvent.
- Asset, MediaVariant, UploadScan.
- Plan, PlanVersion, Entitlement, FeatureFlag, Subscription, Invoice, Coupon, UsageLedger.
- Module, ModuleVersion, ModuleInstallation, ModulePermission, ModuleSetting, MarketplaceListing, MarketplacePurchase.
- Integration, OAuthGrant, APIKey, WebhookEndpoint, WebhookDelivery, ConnectorHealth.
- Event, DailyMetricAggregate, Experiment, ExperimentAssignment.
- Contact, ConsentRecord, ContactTag, Segment, Lead, LeadEvent, Form, FormSubmission.
- Product, ProductVariant, InventoryItem, StockMovement, DigitalAssetAccess.
- Cart, CheckoutSession, Order, OrderLine, PaymentAttempt, ProviderEvent, Refund, DisputeReference.
- DeliveryZone, Fulfilment, Shipment, TrackingEvent, ReturnRequest.
- Service, StaffMember, AvailabilityRule, BookingSlot/Reservation, Booking, CalendarConnection.
- Course, Lesson, Enrollment, MembershipPlan, AccessGrant.
- AutomationWorkflow, WorkflowVersion, WorkflowRun, WorkflowExecution, RetryRecord.
- AIUsage, AIRequestLog (redacted), ModelProvider, PromptTemplateVersion, AIActionProposal, Approval.
- Report, ModerationCase, AuditLog, SupportTicket, StatusIncident.

Data design rules:

- Store money as integer minor units plus ISO currency code, with explicit decimal/currency handling.
- Use canonical UTC timestamps internally and preserve display time zone where it matters.
- Store contact consent as an auditable event/record, not a single boolean that loses context.
- Keep payment-provider identifiers and idempotency keys unique in the appropriate scope.
- Do not log full payment secrets, authentication tokens or unnecessary personal data.
- Decide retention and deletion behavior before the first production dataset is collected.

## 17. Super-admin and customer dashboard information architecture

### 17.1 Customer workspace navigation

- Overview.
- My Pages.
- Canvas Builder.
- Links and Redirects.
- Store.
- Products and Inventory.
- Orders and Payments.
- Bookings and Services.
- Digital Products/Courses/Memberships (module-dependent).
- Audience/CRM.
- Forms.
- Campaigns and Automations.
- Analytics.
- Domains.
- Integrations.
- AI Assistant and Usage.
- Team and Permissions.
- Marketplace.
- Billing and Plan.
- Settings, Privacy and Exports.
- Help and Support.

Menu items are entitlement-aware but not hidden in a way that confuses users. Feature discovery can show locked capabilities with clear explanations and upgrade paths.

### 17.2 Super-admin navigation

- Operations Overview.
- Tenants and Users.
- Plans, Subscriptions and Billing.
- Entitlements and Feature Flags.
- Module Manager.
- Marketplace Listings and Developers.
- Themes, Templates and Blocks.
- Domains and Certificates.
- Integrations and API/Webhooks.
- Orders/Payment Observability (least-privilege and redacted).
- AI Costs and Usage.
- Analytics and Business Reports.
- Moderation and Trust/Safety.
- Support Tickets and Success.
- CMS, Documentation and Announcements.
- Security, Roles, MFA and Audit Logs.
- Infrastructure/Queues/Health.
- Data Privacy Requests and Retention.
- System Settings and Change Approvals.

## 18. Marketplace architecture and governance

### 18.1 Product categories

- Feature modules (booking, advanced CRM, courses, loyalty, advanced analytics).
- Integrations (email, calendar, messaging, shipping, accounting, social platforms).
- Themes, templates and block packs.
- Automation recipes.
- AI prompt/workflow packs.
- Agency tools and reporting connectors.
- Industry packs with pre-configured blocks, fields, workflows and content.

### 18.2 Installation lifecycle

1. Inspect listing and permission/data-access declarations.
2. Check compatibility, dependencies, tenant plan and region/provider eligibility.
3. Install version into the proper execution boundary.
4. Run database migration/initialization with backup and preflight checks.
5. Enable by tenant or rollout cohort.
6. Monitor health, error rates, data access and performance.
7. Upgrade through staged release, or disable/rollback on failure.
8. On uninstall, preserve/export customer-owned data where required; do not silently erase business records.

### 18.3 Commercial model for developers

Potential model: 70–85% of net module revenue to developer and 15–30% marketplace/platform share, adjusted after provider fees, taxes, refunds and support burden are modeled. This is a **commercial hypothesis**, not a promise. KUBICU must disclose fees, payout terms, tax documentation, refund responsibilities, IP/license rules, service-level expectations and security requirements before accepting third-party listings.

### 18.4 Required marketplace gates

- Developer identity/business verification proportional to risk.
- Source/provenance and package signing.
- Permission review and automated static/security checks.
- No arbitrary access to all customer data by default.
- Versioned privacy policy and support contact.
- Automated install/upgrade/rollback tests.
- User-facing changelog and scope disclosure.
- Abuse reporting, emergency disable and appeal.
- Listing and developer ratings with fraud/spam controls.

## 19. SaaS pricing and revenue model

The commercial goal is affordable self-serve adoption while capturing greater value from businesses that use KUBICU for sales, customers and team operations. Do not use prices designed solely to imitate Linktree's US dollar tiers; test willingness to pay locally and with diaspora users.

### 19.1 Proposed plan ladder — initial hypothesis

These prices are **testing hypotheses in Nigerian naira**, not final recommendations based on statistically representative willingness-to-pay research. Verify taxes, payment costs, support costs and conversion via a live pilot.

| Tier | Indicative price hypothesis | Intended user | Product boundary |
|---|---:|---|---|
| Free / Starter | ₦0 | First-time creator, student, side hustle | Hosted page, core blocks/links, limited AI credits, basic analytics, platform branding, limited form leads; no custom domain; commerce availability/fees shown clearly. |
| Creator | ₦2,500–₦4,000/month | Creator or solo professional | Expanded design, more templates, custom domain connection, deeper analytics, basic CRM, scheduled links, modest automation, brand control. |
| Pro / Seller | ₦6,000–₦10,000/month | Seller or service provider | Full store, bookings, digital product tools, sales analytics, coupons, order workflow, integrations, higher AI credits and fewer limits. |
| Business | ₦15,000–₦30,000/month | Growing SME or team | Multiple pages, seats, roles, workflow automation, advanced CRM, custom-domain portfolio, detailed reports, higher usage and priority support. |
| Agency | ₦35,000–₦100,000+/month | Agency or multi-brand operator | Client workspaces, reusable kits, approvals, white-label options, bulk operations, agency reporting and client billing support. |
| Enterprise / Partner | Custom | Large networks, franchises, telcos, platforms | Contracted support, SSO, advanced governance, custom integrations, negotiated limits and SLA where supportable. |

Offer monthly and discounted annual billing. Avoid annual-only onboarding for customers who cannot yet trust the product. Give annual discounts only after churn and cash-flow modeling; do not promise lifetime deals that create unlimited hosting/support obligations.

### 19.2 Commerce fees

Test three approaches:

- **SaaS-only:** seller pays plan; gateway charges payment fees directly.
- **Freemium transaction fee:** free users pay a clearly disclosed platform fee on successful sales; paid users pay lower or zero KUBICU platform fee.
- **Hybrid:** subscription includes a limited allowance; additional workflow/AI volume is usage-based, while payment-processing fees remain separate.

Recommendation: start with a simple and transparent hybrid, but only after unit economics and gateway agreements are modeled. Do not stack a surprise platform surcharge and gateway fee at checkout. Show who bears each charge before payment.

### 19.3 Other revenue streams

1. SaaS subscriptions.
2. AI-credit/usage add-ons.
3. Premium themes, block packs and industry templates.
4. Marketplace revenue share.
5. Agency and multi-tenant packages.
6. White-label/licensed instances for larger organizations.
7. Domain-registration/reseller margin where contractually permitted.
8. Advanced analytics and reporting add-ons.
9. Email/SMS/WhatsApp sending bundles priced transparently around underlying provider costs.
10. Verified-business/brand-tooling services where evidence supports them.
11. Partner referrals and affiliate commissions with explicit disclosures.
12. Paid onboarding, migration, setup and design services.
13. API usage plans and developer tooling.
14. Enterprise integrations and support contracts.

Do not make advertising the core revenue engine; it can undermine trust and conversion on merchant pages. Avoid selling customer data or using contact lists for unrelated advertising.

### 19.4 Unit-economics model

Track for every plan and module:

- Net revenue after taxes, discounts, refunds and marketplace share.
- Payment fees and chargeback costs.
- Hosting, storage, CDN, media transformation and bandwidth cost.
- AI inference and messaging/provider costs.
- Support and onboarding time.
- Average pages, visits, domains, products, storage and workflow executions per account.
- Conversion from free to paid and time-to-first-value.
- Monthly logo churn, revenue churn and cohort retention.
- Contribution margin by plan and acquisition channel.
- Cost to serve a high-volume viral creator vs a normal small business.

Use hard quotas, overage controls and fair-use policies for expensive features. A viral free customer must not silently create a cost crisis.

## 20. Go-to-market strategy

### 20.1 Launch order

1. Recruit 30–50 design partners across creators, service providers, small retailers, digital sellers and social-media agencies.
2. Build and test their real page, domain, payment, booking or lead workflows.
3. Select a narrow MVP promise: “publish a great mobile page and receive a real lead, booking or order.”
4. Launch free hosted pages and a small paid plan set.
5. Create tutorial templates for specific business categories.
6. Partner with creator communities, designers, agencies, business hubs and training communities.
7. Launch referral programmes only after attribution and abuse controls work.
8. Publish case studies with permission and verifiable before/after results.
9. Expand regionally only after payment and tax policy for the next country is validated.

### 20.2 Acquisition loops

- Every public page carries a tasteful platform attribution on the free plan and an invitation to create a page.
- Template gallery pages are SEO assets and demos.
- Users can share a template/section with collaborators.
- QR code generator drives offline sharing and local business referrals.
- Agencies onboard many businesses and become a scalable sales channel.
- Marketplace authors bring users who need their modules/templates.
- Seasonal campaign kits provide timely reasons to create/update a page.

### 20.3 Activation funnel

Measure signup → username selected → first template/page generated → first three useful blocks added → preview viewed → page published → page shared → first visitor → first lead/booking/order → first repeat action → first paid conversion.

Optimize for a user reaching a tangible outcome, not simply finishing onboarding screens.

## 21. Security, privacy, legal and trust requirements

This section is a product-planning checklist, not legal advice. Use Nigerian counsel and relevant providers to confirm current obligations before live money movement, cross-border data processing or platform-of-record activity.

### 21.1 Data protection

The Nigeria Data Protection Act, 2023 establishes Nigeria's data-protection framework and the Nigeria Data Protection Commission (NDPC) provides the Act and guidance. Assess whether KUBICU is a data controller, processor or both for each data flow; obligations depend on actual roles, scale and processing. Official reference: [NDPC — NDP Act 2023](https://www.ndpc.gov.ng/ndp-act-2023/) and [NDPC FAQs](https://ndpc.gov.ng/faqs/).

Required product controls:

- Clear privacy notice, purpose limitation and documented lawful basis.
- Consent records for optional marketing where required.
- Contact export, correction and deletion workflows.
- Data minimization and retention schedules.
- Data processor/vendor inventory and contracts.
- Access controls, encryption in transit and at rest where appropriate.
- Incident/breach response with evidence and notification workflow.
- Cross-border transfer assessment and vendor review.
- User-facing cookie/analytics choices where applicable.
- Children's data controls; avoid designing monetization or data collection for children without specialist review.
- Do not use customer data to train shared AI models without transparent terms and valid permission/lawful basis.

### 21.2 Consumer protection and e-commerce

The FCCPC's e-commerce business guidance emphasizes clear terms and conditions, privacy policies, proper product/price/promotion disclosures before payment and accessible complaint redress. Its consumer rights materials also discuss cancellations, bookings, returns and accurate product information. Sources: [FCCPC business guidance on e-commerce](https://fccpc.gov.ng/business-guidance-on-e-commerce-2/), [FCCPC consumer rights and responsibilities](https://fccpc.gov.ng/consumers/consumer-rights-responsibilities/rights-responsibilities/).

Build:
- Merchant-specific policies visible before checkout.
- Price, fee, stock, delivery and refund disclosures.
- Transaction receipts and order reference.
- Seller complaint/contact pathway.
- Platform reporting and escalation path.
- Dispute evidence, refund status and clear role definition between seller, gateway and platform.
- No deceptive countdowns, fake reviews or false scarcity.

### 21.3 Payments and financial-regulation boundary

Use regulated/authorized payment providers and clarify who is the merchant of record. The CBN publishes lists and frameworks for payment service providers. Before introducing split settlements, pooled balances, stored value, platform wallets, lending, escrow or other money services, obtain specialist Nigerian regulatory/legal advice and written confirmation from relevant providers. Official reference: [CBN Payment Service Providers](https://www.cbn.gov.ng/PaymentsSystem/PSPs.html).

### 21.4 Security checklist

- OWASP-aligned threat modelling for auth, tenant isolation, page publishing, uploads, redirects, payments and marketplace.
- MFA and least privilege for privileged users.
- Secure, rotating session and API credentials.
- Rate limiting, bot/credential-stuffing protection and abuse throttling.
- CSRF/XSS/SQL injection/SSRF/IDOR protections.
- Content Security Policy and safe embed sandboxing.
- Signed webhooks, replay protection and idempotency.
- Payment state derived from verified provider signals, not browser redirect alone.
- Database backups with recovery drills.
- Dependency scanning, secret scanning and patch cadence.
- Penetration testing before broad public launch, followed by recurring assessments.
- Separate dev/staging/production secrets and data.
- Immutable audit logs for admin, billing, moderation and AI-executed actions.
- Incident communication and postmortem practice.

## 22. Non-functional requirements and acceptance targets

Treat these as initial targets to validate under a representative test environment—not as already achieved service guarantees.

### Public page
- Target p75 mobile LCP around 2.5 seconds or better on a defined representative mobile/network profile.
- Keep the core page usable when third-party embeds fail.
- Lazy-load heavy assets and avoid unnecessary blocking scripts.
- WCAG 2.2 AA-oriented accessibility goals, confirmed through manual and automated testing.
- Page publication changes become visible within a documented cache invalidation target under normal operations.

### Builder
- No silent data loss; saved state is visible.
- Undo/redo for major editor operations.
- Clear drop targets and keyboard/accessibility alternatives.
- Preview parity with the published page for supported features.
- Mobile editor handles common tasks with one thumb and without horizontal scrolling.

### Commerce
- Every order has a unique stable reference.
- Duplicate gateway webhooks do not create duplicate orders or double entitlements.
- Payment success, failure and delayed callbacks are handled deterministically.
- Refund and cancellation states are auditable.
- Seller sees clear reconciliation exceptions.

### SaaS/control plane
- Tenant data isolation tests are mandatory in CI.
- Entitlement and permission decisions are centrally tested.
- High-risk admin changes are audited and optionally require dual approval.
- Module failure does not take down unrelated public pages.
- Every installed module can be disabled safely under documented conditions.

### Reliability and operations
- Define service-level objectives after baseline measurement.
- Alert on payment webhook lag, certificate renewal failures, publishing errors, queue backlog, abuse spikes and database resource pressure.
- Restore drills, not backup existence alone.
- Incident owner and escalation route for every critical integration.

## 23. Delivery roadmap and scope discipline

The project should be ambitious in architecture but disciplined in release scope. Build in independently testable increments. Calendar estimates should follow team size and technical spikes, not optimistic promises.

### Phase 0 — Discovery and technical validation

Deliverables:
- Customer interviews across at least five target segments.
- Competitor teardown matrix and verified feature screenshots/notes.
- Prototype tests for desktop canvas and mobile editor.
- Payment-provider capability and commercial review.
- Domain/SSL spike and page-publishing architecture proof.
- Threat model and data-flow map.
- Initial pricing interviews and cost model.
- Final brand/legal/domain clearance plan.

Exit gate: users understand the product, can build a page without assistance, and the team proves the key technical risks: safe multi-tenant rendering, domain verification and reliable payment webhook processing.

### Phase 1 — Valuable MVP

Ship:
- Signup, account security, workspace and role basics.
- Hosted profile URLs.
- Canvas-first block editor with reusable templates, undo/redo and live mobile preview.
- Core links, buttons, text, image, social links, collections and contact forms.
- AI page-generation draft with manual approval.
- Public page rendering, custom metadata, QR and share tools.
- Basic analytics: views, clicks, sources and simple conversion events.
- Custom domain connection with DNS verification and SSL status, if the technical spike passes.
- Super-admin essentials: users, plans, flags, templates, support, domain health, audit logs and platform status.
- Billing and a minimal free/paid subscription structure.
- One payment gateway for a tightly defined seller checkout pilot, after legal/provider review.
- Security, export, privacy notice, abuse reporting and basic support.

Defer in MVP: fully open third-party code marketplace, advanced multi-country settlement, full course LMS, multi-vendor marketplace, stored-value wallet, complex AI autonomous execution, large-scale social media scheduling.

### Phase 2 — Commerce and booking foundations

Ship:
- Physical/digital products, basic inventory and checkout.
- Order dashboard, receipts, refunds workflow and reconciliation.
- Delivery zones, pickup and manual fulfilment.
- Booking services, availability, deposits, reminders and calendar connector as validated.
- CRM contacts, form capture and export.
- Coupon/bundle/discount basics.
- Consent-aware messaging adapters.
- Custom domain lifecycle and page version history production hardening.

Exit gate: real design partners complete legitimate sales/bookings with supportable refund and fulfilment processes.

### Phase 3 — Growth and differentiated automation

Ship:
- Visual workflow builder with safe triggers/actions.
- Inventory- and schedule-aware blocks.
- Campaign kits and UTM/QR attribution.
- A/B testing.
- Advanced CRM segmentation and email automation.
- AI growth analyst and approved action proposals.
- Course/digital access tools and limited membership pilots.
- Agency workspace and team approvals.
- Better regional support and additional gateway connectors where justified.

### Phase 4 — Marketplace and ecosystem

Ship:
- Stable module manifest and extension SDK.
- Private/internal module catalogue first.
- Reviewed partner integrations and theme marketplace.
- Third-party developer onboarding, permissions, code isolation and marketplace revenue share.
- Public API, webhooks and audit tooling.
- White-label/agency capabilities.
- Advanced reporting and business integrations.

Do not open a public marketplace until package signing, permission review, version compatibility, staged installation, rollback, incident response and developer contracts are operating.

### Phase 5 — Africa-wide and enterprise expansion

Potential additions after local validation:
- Country-specific tax, currencies, languages and payment providers.
- Multi-location and franchise management.
- Enterprise SSO and organization-level audit exports.
- Advanced inventory/ERP connectors.
- Creator sponsorship/brand deal marketplace with fraud prevention.
- Cross-border fulfilment partner integrations.
- Regional language experiences and locally tested AI workflows.
- Optional NFC hardware or identity/loyalty products.

## 24. Product backlog: must-have vs differentiator

| Area | Must-have parity | Meaningful differentiation |
|---|---|---|
| Page builder | Blocks, links, themes, preview, responsive rendering | True artboard, nested reusable sections, safe responsive controls, mobile-native editor and change-set AI co-builder |
| Publishing | Hosted URL, fast edits, QR/share | Custom-domain self-service with automated checks, rollback and health alerts |
| Analytics | Views, clicks, date ranges | Click-to-lead/order/booking funnel, attribution, experiments and AI explanations |
| Commerce | Digital product links/store and checkout | Localized payments/fulfilment, inventory-aware sections, WhatsApp Order Bridge and reconciliation |
| Bookings | Availability and booking form | Deposit + slot synchronization, quote-first paths, team resources and no-show controls |
| Audience | Forms, contact list, export | Consent-event ledger, CRM pipeline, segmentation and workflows |
| AI | Copy/design assistance | Approved page operations, AI-generated campaign kits, measured conversion experiments and per-tenant cost controls |
| SaaS admin | Users/plans/billing | Central entitlement/flag system, module safety lifecycle, operations dashboards and auditable emergency controls |
| Marketplace | Internal module registry | Signed packages, isolated execution, developer business model, automated compatibility and staged rollback |
| Africa localization | NGN and local contact methods | City/zone delivery, local-language assist, low-bandwidth pages, WhatsApp-centered commerce and seller-owned customer relationships |

## 25. Critical risks and mitigations

1. **Scope explosion.** Mitigation: release gates and a strict MVP; separate “architecture-ready” from “shipping now.”
2. **The canvas is too complicated.** Mitigation: test novice workflows, start with templates and progressive disclosure, use a mobile-specific editing experience.
3. **Payments and settlement complexity.** Mitigation: payment adapter, initial supported provider/method matrix, formal gateway approval, no unlicensed custody.
4. **Marketplace code creates a security hole.** Mitigation: signed modules, sandboxing, permissions, compatibility testing and staged rollout.
5. **AI costs erode subscription margin.** Mitigation: per-tenant metering, task-specific models, quotas, caching and premium credit packs.
6. **Custom domains fail at DNS/SSL.** Mitigation: verification checker, clear progress, retry/recovery and hosted-subdomain fallback.
7. **Feature parity without differentiation.** Mitigation: focus on real outcomes: page-to-payment, WhatsApp, local delivery, domain ownership, automation and customer data export.
8. **Poor mobile performance.** Mitigation: performance budget, light templates, image optimization and automated mobile/network tests.
9. **Fraud, phishing and counterfeit sales.** Mitigation: reporting, risk-based review, clear prohibited-use policy, verified payment events and enforcement/appeal workflows.
10. **Vendor lock-in at the platform level.** Mitigation: exportable content, contacts and transaction records; versioned APIs and clear integration exit paths.
11. **Regulatory exposure.** Mitigation: external legal review, data-protection roles/retention, merchant-of-record clarity and provider contracts.
12. **Underpricing support-heavy users.** Mitigation: usage metering, paid support tiers, fair use and contribution-margin review.

## 26. Launch metrics and decision gates

### Activation and experience
- Median time to first published page.
- Percentage who publish during first session/day/week.
- Percentage reaching first share and first visitor.
- Builder task completion and rage-click/drop failure rate.
- Mobile editor task-success rate.

### Retention and monetization
- Day 7/30/90 active creator retention.
- Free-to-paid conversion and cohort churn.
- Subscription revenue retention.
- Plan mix, add-on attach rate and annual renewal rate.
- Revenue and contribution margin per tenant.

### Business outcomes
- Published page-to-lead conversion.
- Product page-to-paid-order conversion.
- Booking completion rate and no-show rate.
- Repeat purchase/booking rate where measurable.
- Time from page visit to first inquiry or order.

### Reliability and trust
- Public page availability and latency.
- Publish failure rate and recovery time.
- Payment reconciliation mismatch rate.
- Domain/certificate failure rate.
- Support response/resolution times.
- Abuse report rate, false-positive rate and appeal outcomes.
- Privacy requests fulfilled within required timelines.
- AI action reversal/error rate and per-task cost.

Use explicit exit gates. Example: do not expand commerce nationally until payment reconciliation, refunds, seller support and privacy controls are reliable in the initial pilot. Do not launch open modules until isolation, rollback and review controls have passed an independent security review.

## 27. Definition of done for the first public release

The first public launch is not done merely because a page can be created. All of the following must be true:

- A new user can create a beautiful page from a template and publish it from a phone.
- A user can add, reorder, edit, hide, duplicate and remove blocks without losing work.
- Public page looks good at common mobile widths and remains usable with slow networks.
- AI creates a draft page and user can inspect, edit, reject or restore it.
- Link and page analytics behave according to a documented definition.
- Admin can manage plans, entitlements, feature flags, core modules and domain health.
- The platform can connect and verify a custom domain through a tested workflow, or clearly mark this as excluded from the actual launch scope rather than pretending it works.
- Payment state cannot be forged via browser redirect; provider webhook processing is idempotent.
- Tenant access isolation is covered by automated tests.
- Users can export their page data and contacts where applicable.
- Terms, privacy notice, refunds/complaints guidance and prohibited-use rules are published.
- Abuse reporting, basic moderation and support escalation exist.
- Backups and restore procedures are tested.
- Monitoring, error reporting and incident ownership are in place.
- There is a clear downgrade/cancel flow and no deceptive billing.

## 28. Instructions for AI-assisted design and development teams

### For the design team

- Design the page builder as the hero experience; validate desktop spatial canvas and phone-native editor separately.
- Create a complete design system: color, typography, spacing, responsive rules, button states, forms, cards, surfaces, focus states, empty/loading/error states and accessibility tokens.
- Use real merchant content, not only generic demo links.
- Show realistic Nigerian use cases: service booking, fashion seller, caterer, creator selling a template, event host and consultant collecting leads. Represent the market naturally, without reducing African identity to decorative stereotypes.
- Public pages should be lively, attractive, polished and conversion-led while preserving legibility and brand individuality.
- Every screen should have a clear hierarchy and descriptive labels; avoid clutter or unexplained controls.
- Deliver desktop and mobile screens, component variants, interaction states, responsive behaviour and annotation of builder actions.

### For engineering/AI coding agents

- Treat this blueprint as the high-level source of truth; create a traceable implementation backlog before coding.
- Do not silently omit sections. If a feature is out of scope for the current phase, record it in a deferred backlog with dependencies and acceptance criteria.
- Build in vertical slices that include database, authorization, UI, tests, instrumentation and admin controls.
- Do not ship non-functional buttons or fake dashboards that show hard-coded metrics.
- Use migrations, seeded test data and reproducible local development setup.
- Add authorization and tenant-isolation tests to every relevant module.
- Add payment webhook tests for duplicate, late, out-of-order and invalid signatures.
- Build a central entitlement/feature-flag/permission contract early.
- Keep provider credentials server-side and use managed secrets.
- Provide a README, environment-variable example, deployment guide, backup/restore guide and troubleshooting instructions.
- Keep an implementation-status matrix mapping every requirement to `planned`, `in progress`, `implemented`, `tested`, `deferred` or `blocked`.
- When a provider API or commercial capability cannot be verified, implement the adapter boundary and document the dependency rather than fabricating integration behaviour.

### Required implementation documents after this blueprint

1. `KUBICU_PRODUCT_REQUIREMENTS.md` — user stories and acceptance criteria by module.
2. `KUBICU_UX_UI_MASTER_SPEC.md` — full screen inventory, user flows, responsive rules and component system.
3. `KUBICU_TECHNICAL_ARCHITECTURE.md` — deployment topology, module contracts, API conventions and threat model.
4. `KUBICU_DATABASE_ERD.md` — entity relationships, constraints and retention.
5. `KUBICU_IMPLEMENTATION_BACKLOG.md` — epics, stories, dependencies, phases and test requirements.
6. `KUBICU_SUPER_ADMIN_SPEC.md` — all control-plane screens, permissions and audited actions.
7. `KUBICU_MARKETPLACE_SPEC.md` — module manifest, permissions, sandboxing, releases, revenue share and moderation.
8. `KUBICU_AI_AUTOMATION_SPEC.md` — AI tools, approval model, quotas and workflow engine.
9. `KUBICU_COMMERCE_PAYMENTS_SPEC.md` — products, checkout, gateway adapters, reconciliation, refund and fulfilment.
10. `KUBICU_SECURITY_PRIVACY_COMPLIANCE.md` — data flows, roles, policies, incident response and review checklist.
11. `KUBICU_TEST_STRATEGY.md` — unit, integration, E2E, accessibility, performance, abuse and penetration coverage.
12. `KUBICU_DEPLOYMENT_OPERATIONS.md` — environments, secrets, observability, backups and rollback.

## 29. Final strategic recommendation

Build KUBICU as **a beautiful bio-link page that quietly contains a serious business engine**. The canvas is the memorable design differentiator; local commerce is the monetization wedge; custom domains and data portability build trust; automation and AI save time; modules and the super-admin make the business scalable.

Do not attempt to ship a fully open marketplace, multi-country commerce stack, AI autonomous agent and full business suite in the first release. Build the foundations so they can be added cleanly, then release them when reliability and user evidence support them. The product only “beats Linktree” when its end-to-end user experience is better and its customers can complete valuable business outcomes with less friction—not because the roadmap contains a longer list of features.

---

## Appendix A — Research sources

The links below are the primary official pages used for the snapshot and should be checked again before launch. Capabilities, country eligibility, terms and prices may change.

### Linktree
- [Official product overview](https://linktr.ee/help/en/articles/5434130-about-linktree)
- [Pricing](https://linktr.ee/s/pricing)
- [Paid-plan features](https://linktr.ee/help/en/articles/5434140-about-paid-plan-features)
- [Public feature page](https://linktr.ee/features)
- [Design customization](https://linktr.ee/help/en/articles/8614125-customize-linktree-design)
- [Link organization](https://linktr.ee/help/en/articles/8614124-organize-links-keep-visitors-engaged)
- [Scheduled links](https://linktr.ee/help/en/articles/5434174-schedule-links-on-your-linktree)
- [Visitor personalization rules](https://linktr.ee/help/en/articles/13827984-personalize-a-link-for-different-visitors)
- [Audience integrations](https://linktr.ee/help/en/articles/11069074-setting-up-third-party-audience-integrations)
- [Contact forms](https://linktr.ee/help/en/articles/5651972-add-contact-form)
- [Analytics definitions](https://linktr.ee/help/en/articles/5434178-understanding-your-analytics)
- [Digital products](https://linktr.ee/help/en/articles/10518645-about-selling-digital-products)
- [Booking feature](https://linktr.ee/help/en/articles/11567751-how-to-offer-bookings-on-your-linktree)
- [Earn eligibility by country](https://linktr.ee/help/en/articles/11126119-earn-feature-requirements-limits)
- [Linktree Shops availability](https://linktr.ee/help/en/articles/9342172-linktree-shops-faqs)
- [Custom domain help](https://linktr.ee/help/en/articles/6571689-can-i-change-the-linktree-url-to-a-custom-domain)
- [Multi-Linktree management](https://linktr.ee/help/en/articles/5434124-how-to-create-and-manage-multiple-linktrees)
- [Workspaces](https://linktr.ee/help/en/articles/13007538-manage-your-linktrees-and-teams-with-workspaces)

### Other creator/link-page platforms
- [Beacons pricing](https://beacons.ai/i/pricing)
- [Beacons product updates](https://shop.beacons.ai/i/whats-new)
- [Stan Store](https://stan.store/)
- [Taplink](https://taplink.at/)
- [Carrd](https://carrd.co/)
- [Squarespace](https://www.squarespace.com/)

### Payments and Nigeria-specific compliance references
- [Paystack Nigeria pricing](https://paystack.com/pricing)
- [Paystack fee support](https://support.paystack.com/en/articles/2130306)
- [Flutterwave Nigeria pricing](https://flutterwave.com/ng/pricing)
- [CBN payment service providers](https://www.cbn.gov.ng/PaymentsSystem/PSPs.html)
- [Nigeria Data Protection Commission — NDP Act 2023](https://www.ndpc.gov.ng/ndp-act-2023/)
- [NDPC FAQs](https://ndpc.gov.ng/faqs/)
- [FCCPC e-commerce guidance](https://fccpc.gov.ng/business-guidance-on-e-commerce-2/)
- [FCCPC consumer rights and responsibilities](https://fccpc.gov.ng/consumers/consumer-rights-responsibilities/rights-responsibilities/)

**Research caveat:** This is a structured public-source competitor audit and a strategic product specification. It is not a guarantee that every feature, price or country policy in every competitor account has been exhaustively captured. Recheck linked official sources at the time of implementation and record verification dates in the implementation backlog.


---

# KUBICU Brand Lock and Next-Generation Concept Addendum

**Founder-selected brand:** KUBICU  
**Primary domain:** `www.kub.icu` (founder reports availability/ownership; verify registrar and DNS status before launch).  
**Name inspiration:** “Cubicle” — a personal, modular digital space that can expand from a simple profile into a complete commercial workspace.

## Brand idea

KUBICU is not a “link list with extra features.” It is **your personal internet cubicle**: a portable, modular, branded business space that can be opened from any social platform, QR code, message or custom domain.

Suggested brand line: **Your corner of the internet. Your whole business.**

Alternative lines:
- One link. Infinite possibilities.
- Your space. Your audience. Your business.
- From bio link to business hub.
- Make every click count.

These are strategic directions, not cleared trademarks. Test them with real users and check trademark availability before adoption.

## Concept extensions that should be evaluated as product differentiators

The following are proposals, not claims about what competitors lack. Each must pass user research, feasibility and unit-economics gates.

### 1. KUBICU IntentFlow — adaptive pages by visitor intent
Allow a page owner to configure different experiences for visitors arriving from different campaigns, QR codes, referral sources, languages or declared interests. Examples: a TikTok visitor sees a hero product; a WhatsApp visitor sees “Chat to order”; a conference QR visitor sees a lead-capture offer. Keep rules transparent, privacy-aware and controllable. Do not infer sensitive traits.

### 2. KUBICU Link Intelligence — a living, self-optimising link space
Use explicit experiments and aggregate performance signals to recommend link order, CTA copy, layouts and offers. Users approve changes or enable bounded auto-optimisation. Maintain version history, experiment logs, rollback and holdout groups. Never claim causal lift when the experiment is underpowered.

### 3. KUBICU DealRoom — structured social selling
Give sellers a shareable mini-room for a product drop, service package, event, group order or limited offer. It can include variants, stock/seat counters, FAQs, payment options, delivery/pickup, a deadline, referral rewards and customer updates. Use real inventory and server-side time; never fake scarcity.

### 4. KUBICU Trust Passport
A portable, permissioned business profile containing verified business/contact details, fulfilment policies, authentic reviews, response expectations and supported verification badges. Verification must state exactly what was checked and by whom. Never sell a badge that implies due diligence that did not happen.

### 5. KUBICU Proof-of-Work Portfolio
Turn links, projects, case studies, products, certificates and testimonials into a structured portfolio with verified attribution, media optimisation, enquiry CTAs and AI-assisted case-study generation. Support freelancers, designers, developers, artisans, performers and agencies.

### 6. KUBICU Voice-to-Store
Let users describe a business by voice or chat in supported languages and receive a proposed storefront, product catalogue, policies, booking rules and WhatsApp scripts. Ask for confirmation on prices, delivery claims, refunds, stock and legal terms. Never invent product facts or publish without approval.

### 7. KUBICU WhatsApp Commerce Bridge
Create order-ready WhatsApp conversations with product/variant context, prefilled order summaries, human handoff, customer consent, event tracking where permitted and follow-up queues. Use official, policy-compliant APIs for automated messaging; provide manual sharing when a business has no approved API access. Do not promise invisible tracking of private messages.

### 8. KUBICU Local Trust & Fulfilment Layer
Offer configurable pickup points, delivery zones, delivery-fee rules, dispatch handoff, proof-of-delivery uploads, return workflows and customer status pages. Initially integrate providers through adapters; do not build a fleet or guarantee delivery quality before operational validation.

### 9. KUBICU Community Commerce
Support cohort launches, group orders, community offers, creator-led drops, event merchandise and member-only pages. Referral mechanics must be transparent, abuse-resistant and legally reviewed; avoid pyramid-like reward structures.

### 10. KUBICU Digital Product Protection
Secure delivery links, expiring download tokens, buyer receipts, version updates, license terms, optional watermarking and abuse controls. Explain that no browser-based system can completely prevent copying once content is accessible.

### 11. KUBICU Service OS
For salons, stylists, tutors, consultants, photographers, repairers, clinics where legally appropriate, event vendors and other appointment businesses: service menus, staff calendars, deposits, buffers, rescheduling, reminders, cancellation policies, intake forms, packages and post-appointment rebooking.

### 12. KUBICU Opportunity Inbox
Unify leads from forms, bookings, product questions and approved integrations into one lightweight CRM. Deduplicate contacts carefully, record consent/source, assign follow-ups, suggest next actions and expose a “money left on the table” view based on real abandoned or overdue opportunities.

### 13. KUBICU Offline-to-Online Identity
Generate dynamic QR codes for packaging, shop counters, flyers, event badges, receipts, vehicle stickers and product tags. Allow destination changes without reprinting, subject to plan limits; provide scan analytics and campaign attribution with privacy-respecting defaults.

### 14. KUBICU Micro-website mode
Let a page grow into a multi-page site without migrating platforms: home, products, services, about, portfolio, FAQ, policies, booking, contact and campaign landing pages. Preserve URL redirects and SEO metadata when layouts or domains change.

### 15. KUBICU Creator Collaboration Graph
Enable co-branded pages, affiliate/referral links, partner bundles, campaign attribution and permissioned collaboration between creators and small businesses. Make commission rules, payouts, disputes and tax responsibilities explicit; start with reporting and external payout rails before introducing complex marketplace settlement.

### 16. KUBICU Smart Accessibility
Use automated audits for contrast, keyboard navigation, semantic labels, image alt text, reduced motion and readable touch targets. Treat AI checks as assistance, not a guarantee of legal accessibility compliance.

### 17. KUBICU Lightweight Mode
Provide a low-bandwidth publishing profile with compressed images, minimal motion, cached public pages, resilient loading, small JavaScript payloads and graceful recovery on intermittent networks. Public pages should remain fast on lower-end Android devices and modest connections.

### 18. KUBICU Business-in-a-Box templates
Offer complete, vertical-specific starting kits—not just themes—for fashion sellers, food vendors, event planners, photographers, beauty professionals, coaches, musicians, churches/communities where appropriate, freelancers, real estate professionals and local service businesses. Each kit includes page blocks, starter copy, policy prompts, CTA defaults, analytics events and automation recipes.

### 19. KUBICU AI Business Coach
Turn page analytics and commerce events into explainable recommendations: fix a broken CTA, add missing delivery information, follow up with a consenting lead, restock a best-seller, improve a slow page or test a different offer. Show evidence, confidence and expected effort. Never fabricate revenue attribution or present generic AI guesses as guaranteed profit.

### 20. KUBICU Open Module Exchange
A curated marketplace for independently installable blocks, integrations, themes and workflows. Require signed packages, permissions manifests, compatibility declarations, security scans, version pinning, rollback, review moderation, billing clarity and emergency revocation. Modules must not receive blanket access to tenant data.

## Award-worthy design principles

- Make the first publish possible in minutes, while advanced canvas power remains available.
- Make the public page feel like a premium mobile-native mini-site, not a stack of identical buttons.
- Make each block understandable, accessible and named in the editor.
- Design a delightful empty state, onboarding, error recovery and low-bandwidth experience—not only polished dashboards.
- Show measurable value with transparent analytics and honest experimentation.
- Let users export their data, products, leads and page structure; support domain portability and URL redirects.
- Keep monetisation fair: no surprise platform fees, deceptive scarcity, forced branding removal or dark patterns.
- Treat African culture as a broad set of local contexts, languages, aesthetics and business practices—not one generic “African theme.”
- Keep every ambitious feature behind research, reliability, safety and unit-economics gates.

## Recommended prioritisation rule

Do not attempt all 20 concepts in the first release. Score each candidate on customer pain, differentiation, willingness to pay, technical risk, compliance burden, retention potential and operational cost. The strongest initial combination is likely: canvas builder + fast publishing + local payment adapters + product/service selling + WhatsApp workflow + custom domains + privacy-aware analytics + modular admin. Validate with real Nigerian merchants before locking the roadmap.

# 24. KUBICU WhatsApp-first Copilot — Conversational Website Creation

## 24.1 Product vision

KUBICU Copilot introduces a WhatsApp-first acquisition and onboarding journey. A prospective user starts a conversation with the KUBICU Copilot, explains what they want to build in everyday language, answers a small number of adaptive questions, and receives a tailored page draft without first learning the Canvas editor.

The user can then inspect a visual preview, open an interactive web preview through a secure KUBICU link, and continue to KUBICU to create an account or sign in, claim the draft, manage it in Canvas, and publish it after explicit approval.

The intended experience is:

**Start in WhatsApp → describe the goal → clarify only what is needed → confirm the brief → generate a draft → receive a PNG preview and interactive preview link → sign in or create an account → claim and edit in KUBICU → approve and publish.**

WhatsApp is an onboarding surface, not the system of record or replacement for the KUBICU application. KUBICU remains authoritative for accounts, page documents, template/theme configuration, publishing, domains, entitlements, and permissions.

## 24.2 Product principles

- Make the first interaction feel like a helpful conversation, not a long form disguised as chat.
- Ask one useful question at a time when practical; reuse information already supplied and ask only about material gaps.
- Let a user describe the page in natural language, use a compact structured question, share an image, or say “I am not sure” and receive a guided suggestion where supported.
- Keep users informed about what the Copilot is doing and what information it still needs.
- Summarize the proposed page brief and request confirmation before expensive or consequential generation where practical.
- Generate from KUBICU's canonical block/page schema, templates, and themes. Do not create a separate WhatsApp-only page format.
- Use existing KUBICU rendering and publishing services rather than building a parallel website engine.
- Generate a draft, never silently publish it.
- Be honest about unavailable capabilities and missing business information.
- Make it easy to leave WhatsApp and continue in the full Canvas without losing work.

## 24.3 Channel feasibility, platform policy, and decision gate

Do not assume that “WhatsApp integration” is one interchangeable API. Evaluate these routes separately before implementation.

### Route A — Official WhatsApp Third-Party Agent Platform

WhatsApp's published Third-Party Agent Terms (last updated August 25, 2026) describe a platform through which users connect third-party agents. The terms state that WhatsApp currently makes that platform available at no charge, while also reserving the right to change availability or terms. The Help Center says the experience is available only in limited countries, so availability for the intended Nigerian user journey and access for KUBICU as an agent provider must be verified rather than assumed.

This route is worth evaluating first because its published terms distinguish it from the WhatsApp Business Platform and currently state no WhatsApp platform fee for the Third-Party Agent Platform. It still uses a technical API/platform integration; “no platform fee” does not mean “no API calls,” “no model inference,” or “no operating cost.” Confirm the current developer manual, access process, supported regions, user-connection flow, rate limits, data handling, and production eligibility directly with WhatsApp before selecting this as the primary channel.

Important privacy requirement: WhatsApp's Third-Party Agent Terms state that conversations with third-party agents are not considered end-to-end encrypted in the same way as personal messages, and that the Agent Provider receives, processes, and stores messages in unencrypted form subject to its own data practices. The onboarding and privacy notice must say this plainly before users share sensitive information. Minimize chat retention and provide a workable deletion/access request route.

Sources to re-check during implementation:
- https://www.whatsapp.com/legal/third-party-agents-terms
- https://faq.whatsapp.com/1050934623978152
- https://faq.whatsapp.com/1002544104126998
- https://www.whatsapp.com/developer/WhatsApp-Agent-Platform-Developer-Manual.pdf

Do not assume that the Third-Party Agent Platform gives KUBICU a conventional public business phone number that every user can open using a simple `wa.me` link. Validate the actual user connection/discovery steps. If users must perform an additional agent-connection step, design and test that setup carefully and retain a lower-friction fallback.

### Route B — WhatsApp Business Platform / Cloud API

Do not default to the Business Platform API for the Copilot without current policy review. The published WhatsApp Business Solution Terms contain restrictions on AI Providers using the Business Solution where offering an AI technology is the primary rather than incidental functionality, with stated exceptions for phone numbers registered in the European Economic Area or Brazil. Because KUBICU Copilot's principal purpose is AI-assisted website creation, Nigerian eligibility must not be assumed. Obtain written confirmation from Meta or an authorized policy/compliance source before using this route for the core AI conversation.

The Business Platform also has message-category pricing and rules for the 24-hour customer-service window and approved message templates outside it. Meta's official FAQ, checked October 28, 2026, states that service-message pricing changed from October 1, 2026 and that the first 1,000 service messages per business phone number per month are free, with charges applying after that according to published rates. Verify current Nigeria rates and all message categories before estimating cost.

Sources to re-check during implementation:
- https://www.whatsapp.com/legal/business-solution-terms
- https://whatsappbusiness.com/policy/
- https://whatsappbusiness.com/resources/faq/
- https://whatsappbusiness.com/developers/developer-hub/

Do not evade the AI-provider policy by disguising the main AI functionality as unrelated customer support. Do not use unofficial WhatsApp Web automation, session scraping, modified clients, unofficial bridges, or other mechanisms that put accounts and customer data at risk.

### Route C — KUBICU web Copilot with WhatsApp handoff (fallback and parallel channel)

If an approved WhatsApp agent route is unavailable, offer the same guided journey on the KUBICU website. Provide an official click-to-chat link for human support or user-initiated continuation, but do not imply that clicking a regular WhatsApp link creates an automated AI bot without an approved integration.

This route allows the product team to validate the conversation design, brief schema, page generation, preview and account-claim workflow before WhatsApp production approval. The web experience should preserve the same product behavior and backend APIs, rather than becoming a separate implementation.

### Architecture decision requirement

Create an Architecture Decision Record (ADR) comparing Routes A, B, and C. Record eligibility, rollout status in Nigeria, user setup friction, provider terms, message charges, model costs, rate limits, privacy posture, operational complexity, fallback behavior, and the evidence used to choose. Route A is a candidate, not an assumed approved production route. Route B requires explicit policy validation. Route C is the safe functional fallback while channel eligibility remains unresolved.

## 24.4 Cost reality and consumption controls

A fully AI-generated experience cannot be promised to have zero compute cost. Even if the WhatsApp agent platform currently has no platform fee, a model hosted by an external provider has inference/API charges. A self-hosted open-weight model may remove per-token vendor invoices but replaces them with server/GPU, power, monitoring, scaling, and maintenance costs. Image generation, asset storage, screenshot rendering, network egress, and application hosting may also carry cost.

Design cost control into the architecture:

- Use a model-provider adapter so Claude/Anthropic, other approved providers, and a self-hosted inference endpoint can be selected without redesigning the Copilot.
- Do not make an external LLM call for every internal state transition. Use deterministic application logic for known choices, validation, IDs, permissions, quota checks, and workflow steps.
- Keep a structured, incremental brief so the system does not repeatedly send the entire conversation history when a compact state and recent context are sufficient.
- Ask clarifying questions only when answers materially improve the proposed page.
- Offer a preview generation step after the user confirms a summary of their brief.
- Reuse existing templates, sections, themes, and page blocks instead of asking a model to invent a page schema from scratch.
- Cache generated assets and preview renders using safe versioned keys; do not re-render unchanged drafts unnecessarily.
- Generate PNGs using KUBICU's own server-side page renderer and screenshot service where feasible. Do not require a paid image-generation API simply to take a screenshot of an HTML page.
- Select the cheapest model that meets quality and safety thresholds for classification, extraction, and simple copy; reserve higher-capability models for complex layout planning or difficult copy.
- Apply per-user, per-session, and platform-wide quotas, rate limits, timeouts, budgets, retries with backoff, and cost telemetry.
- Provide a graceful template-based or deterministic fallback when the AI provider is unavailable or the usage budget is exhausted.
- Record model/provider, token or compute usage where available, latency, retry count, estimated cost, and generation result for each operation.

Do not claim that a self-hosted model is free. Compare total cost of ownership and quality before deciding whether to self-host.

## 24.5 Conversational onboarding flow

The conversation must be adaptive and progressive rather than a fixed questionnaire. Gather and retain the following information as available:

1. What the user wants to create: personal page, creator page, portfolio, service business, product shop, event, professional profile, or other supported goal.
2. Primary objective: showcase work, get enquiries, receive bookings, sell products, share links, collect leads, promote an event, or build an audience.
3. Business/brand/person name and a short description.
4. Target audience and geography/market, where relevant.
5. Desired brand personality and aesthetic preferences, including reference images where supported.
6. Existing assets: logo, profile picture, product photos, portfolio links, copy, social links, and other supplied content.
7. Essential sections or block requirements.
8. Primary call to action and its real destination or configuration.
9. Relevant contact channels and business details.
10. Template preference or permission for the Copilot to recommend one.
11. Theme preference or permission for the Copilot to propose a cohesive theme.
12. Missing facts that must be supplied before publishing, such as product prices, inventory, opening hours, address, delivery rules, or service terms.

Do not ask all 12 questions if the user has already provided the answers or the use case does not require them. Ask the minimum useful next question. Allow “skip,” “not sure,” “suggest for me,” and “change that answer.” Do not require users to know design terminology.

Example opening:

“Hi, I'm KUBICU Copilot. Let's turn your idea into a page you can share. What are you creating today—a business page, portfolio, creator page, shop, service page, event page, or something else?”

After gathering enough information, summarize the brief in simple language. Show the selected page goal, audience, proposed sections, visual direction, and primary CTA. Let the user approve or correct the brief before generating the first draft.

Support natural-language corrections such as “make it more premium,” “use a cream and black theme,” “put my work before my bio,” “add WhatsApp contact,” and “remove the pricing section.” Convert each change into an explicit, validated page-document operation. Never treat arbitrary model output as executable code.

## 24.6 Page-generation pipeline

Use a controlled pipeline:

1. Receive the message through an approved channel adapter.
2. Resolve or create an anonymous Copilot session with a secure session identifier.
3. Update a versioned structured page brief from the user message and permitted context.
4. Ask a focused follow-up if a required decision is missing.
5. Summarize the brief and receive confirmation when appropriate.
6. Select a compatible existing template, a reusable composition preset, a theme, and approved blocks—or propose a custom composition assembled from the same canonical primitives.
7. Produce a structured draft following the existing KUBICU page-document schema.
8. Validate the draft server-side against schema, block compatibility, supported features, URL rules, tenant boundaries, and content-safety requirements.
9. Mark missing business facts explicitly; use editable placeholders instead of inventing prices, inventory, testimonials, credentials, reviews, guarantees, policies, or contact details.
10. Persist a draft version owned by the anonymous Copilot session, not by an unverified user account.
11. Render the draft using the standard KUBICU page renderer in a non-indexed preview environment.
12. Generate a PNG screenshot at defined mobile and/or desktop viewports. Generate an interactive preview by linking to the rendered draft website, not by pretending arbitrary HTML can run inside a WhatsApp message.
13. Return the preview image and a secure, time-limited KUBICU preview link through the supported channel.
14. When the user chooses to continue, direct them to account creation or sign-in.
15. After authentication, verify the claim token server-side and transfer ownership of the draft atomically to the authenticated account.
16. Open the claimed draft in the KUBICU Canvas with the generated template, theme, blocks, and content intact.
17. Require explicit review and publication approval before making the page public.

WhatsApp can deliver a preview image and supported buttons/links, but a full custom interactive website should open in a browser or in-app browser at KUBICU. Design this as a seamless handoff: the chat provides the first impression, while the linked preview provides real interactivity.

## 24.7 Preview, draft and claim-token security

Preview links must not expose private account data or provide edit authority. Use cryptographically random, short-lived, revocable claim tokens with server-side storage or suitable token verification. Do not put raw database IDs, phone numbers, credentials, or personal data in URLs.

Separate:

- Read-only preview token.
- Draft-claim token.
- Authenticated editing session.
- Publishing authorization.

A link must not permit anonymous visitors to claim, edit, publish, or take over another user's page. Bind claim intent to the correct draft and enforce one-time use or another explicitly justified, race-safe claim mechanism.

Use noindex directives and suitable cache controls on private draft previews. Expire stale anonymous drafts according to a disclosed retention policy. Do not reserve a public handle permanently just because a draft was generated; reserve it at an appropriate confirmed point and handle conflicts transparently.

On claim, use a database transaction or an equivalent idempotent operation so duplicate callbacks, repeated clicks, or retries cannot duplicate the page or transfer it to two accounts. If a user is already signed in, show the destination workspace and confirmation before attaching the draft to the selected workspace where ownership could be ambiguous.

Do not create an account silently from a phone number. Let users explicitly create an account or sign in, complete necessary verification, agree to relevant terms, and claim the draft.

## 24.8 Canonical data and integration boundaries

The KUBICU application/database remains the source of truth. WhatsApp messages are an entry channel, not the page database.

Use adapters and explicit boundaries for:

- `CopilotChannelAdapter`: receive/send supported messages, media, supported interactive responses, and delivery/status events.
- `CopilotSessionService`: session identity, conversation state, expiration, and recovery.
- `PageBriefService`: structured brief extraction, validation, confirmation and revision.
- `ModelProviderAdapter`: approved hosted model or self-hosted inference provider.
- `PagePlanningService`: template/theme/block selection and bounded structured page operations.
- `PageSchemaValidator`: canonical schema, compatibility, URL and feature validation.
- `DraftPageService`: draft creation, versioning and persistence.
- `PreviewRenderService`: page rendering, PNG generation, asset reuse, and expiry.
- `DraftClaimService`: authentication handoff and race-safe transfer to a tenant/workspace.
- `QuotaAndCostService`: rate limits, budgets, usage counters and alerts.
- `AuditAndPrivacyService`: consent, retention, deletion requests, security events and traceability.

Reuse the existing KUBICU renderer, design system, templates, themes and block registry. Do not create a second page schema for WhatsApp and do not allow the model to generate arbitrary scripts or SQL.

## 24.9 Data, privacy and abuse controls

Document the WhatsApp channel's data flow before production. Tell users that messages and shared media are processed by the connected agent service, identify the applicable channel/provider, and explain retention and deletion. For third-party-agent conversations, disclose the non-end-to-end-encrypted status specified by WhatsApp's terms.

- Ask for no more personal data than the page needs.
- Warn users not to share passwords, payment-card data, or unrelated sensitive information.
- Do not put sensitive profile or account details into preview URLs or model prompts unless strictly required.
- Keep channel identifiers separate from public page content; never publish a user's phone number simply because they chatted with the Copilot.
- Store secrets server-side in a secrets manager or supported secure environment; never embed provider tokens in browser code.
- Validate uploads, file types, sizes, image processing and external URLs.
- Defend against prompt injection and malicious text inside uploaded assets or linked content.
- Require explicit confirmation for public publishing and external side effects.
- Apply abuse detection, quotas, rate limits, content policy controls, block/report handling, and human support escalation.
- Define retention, export, deletion, and incident-handling policies that match applicable data-protection obligations.
- Never train or fine-tune a shared model on private user content unless the user terms, provider terms, and applicable law explicitly permit the intended use.

## 24.10 Failure states and recovery

Design and implement graceful handling for:

- WhatsApp channel/agent unavailable or regionally unavailable.
- User has not completed the required agent connection.
- Message or media delivery failure.
- Unsupported file or malformed link.
- Missing required brief information.
- Model provider timeout, rate limit, refusal, or outage.
- Invalid generated schema or unsupported block combination.
- Screenshot renderer timeout or failed asset load.
- Expired preview or claim link.
- User already owns a page with the requested handle.
- Sign-in/account-creation interruption.
- Claim token already used or draft ownership changed.
- Draft expiration.
- Quota or model budget exhausted.
- Publishing validation failure.

Preserve the brief and draft where safe. Explain what happened in human language and offer a clear next step. Do not report successful generation, saving, delivery, or publication until the responsible service confirms it.

## 24.11 Rollout strategy

### Phase 0 — Policy and feasibility validation

- Verify access to the official Third-Party Agent Platform and its developer process.
- Verify availability and onboarding friction for target users in Nigeria.
- Read the latest developer manual, rate limits, data handling and current terms.
- Obtain a policy decision for the Business Platform route; do not presume eligibility.
- Compare real model inference costs, hosting/rendering costs, and likely conversational usage.
- Test a low-cost proof of concept with synthetic data only.

### Phase 1 — Web-based Copilot and preview pipeline

- Build the guided conversation on KUBICU web using the same session and page-creation services.
- Generate validated drafts from canonical KUBICU schemas.
- Produce a mobile PNG and interactive preview link.
- Implement sign-in/create-account handoff and secure draft claiming.
- Measure completion, edit rate, time to first preview, preview-to-claim conversion, and cost per successful draft.

### Phase 2 — Approved WhatsApp adapter pilot

Only after channel eligibility is verified, connect the chosen official WhatsApp agent/channel. Run an invited pilot, with limited quotas, human support escalation, privacy notices, delivery/error telemetry, and cost alerts. Do not use unauthorized WhatsApp automation to accelerate the pilot.

### Phase 3 — Production scale

Expand only after measured quality, acceptable cost per draft, reliable claim transfer, data protection controls, support operations, and platform-policy approval are demonstrated.

## 24.12 Acceptance criteria

The feature is ready for a limited production pilot only when:

- The selected WhatsApp integration route is documented, officially supported, and approved for the intended KUBICU use case and launch region.
- A user can complete the journey without losing the brief or draft when switching channels.
- AI output is a validated KUBICU page document, not arbitrary executable code.
- At least one complete happy-path and all critical failure-path tests pass.
- The user receives a preview image and a working interactive web preview.
- Preview links are read-only and protected; claim tokens cannot be reused to take over another draft.
- Account creation/sign-in and draft claiming are authenticated, idempotent, and auditable.
- Publication requires explicit user approval.
- Missing facts and unsupported capabilities are clearly shown.
- The design is usable on mobile and desktop and meets the project's accessibility target.
- Model costs, channel costs, rendering/storage costs, quotas, and rate limits are measured and monitored.
- Privacy, retention, deletion, abuse response and human escalation are documented.
- Provider outages, invalid drafts, delivery failures and interrupted claims have tested recovery paths.

## 24.13 Authoritative implementation directive for Claude

When implementing KUBICU Copilot, preserve this blueprint and the implementation backlog as governing specifications. Start with a concise ADR and policy/eligibility spike; do not begin by blindly building against the WhatsApp Business Cloud API. Validate the official WhatsApp Third-Party Agent Platform as a candidate, account for its limited-country rollout and non-end-to-end-encrypted conversation model, and retain a web Copilot fallback.

Build the conversation, structured page brief, draft generation, preview rendering and claim flow as reusable server-side product services independent of any one channel or model vendor. The channel adapter and model provider must be replaceable. All page operations must pass canonical schema validation and authorization. Never publish automatically, never make up commercial facts, never let an LLM directly mutate ownership or permissions, and never report success without service confirmation.

Do not promise zero cost or zero API consumption. Minimize usage through bounded conversational state, deterministic transitions, appropriate model selection, caching, quotas, and telemetry. Compare hosted model API costs with self-hosted total cost of ownership before choosing an inference architecture. Document unresolved Meta eligibility questions rather than inventing an answer.

---

**Policy and platform facts last reviewed:** October 28, 2026. Re-check official terms, region availability, pricing, developer documentation and technical limits immediately before implementation and release.


# 25. Creator Pages, Marketplace, Short Links, Audience Manager & Public Mega Menu

**Revision date:** 29 October 2026. This addition supplements the existing blueprint; it does not replace any previously approved scope, including the Canvas, modular marketplace, CRM, analytics, short links/QR, or WhatsApp-first Copilot.

## 25.1 Competitive research interpretation

Review of Linktree's current public product pages indicates four user-facing capability areas that KUBICU should expose through complete marketing pages and real connected app features: creator-oriented public pages, a marketplace of apps/integrations, a short-link tool with share attribution, and an audience manager that centralizes contacts/leads. Linktree's public Marketplace includes categorized tools and integrations; its shortener documentation describes editable slugs, channels, tags, and shareable short links; its Audience Manager page describes contact organization, source filtering, exports/syncs, and notifications. These are outcomes to learn from, not a design or source-code specification to copy.

Sources reviewed 29 October 2026 (revalidate at implementation):
- https://linktr.ee/for/creators
- https://linktr.ee/features
- https://linktr.ee/marketplace
- https://linktr.ee/marketplace/apps
- https://linktr.ee/features/link-shortener
- https://linktr.ee/features/audience-management
- https://linktr.ee/help/articles/8133719-how-to-shorten-and-share-links-with-tr-ee-links

KUBICU should use its own brand, copy, visual design, icons, and layouts. Implement equivalent or better user outcomes with a more integrated product model.

## 25.2 Public routes and product surfaces

Ensure these routes exist or map to approved existing equivalents:

- `/for/creators` — public creator solution landing page.
- The existing public-page runtime route for each creator/user — the actual published, editable-by-owner public page, distinct from the marketing landing page.
- `/marketplace` — public extension marketplace landing and discovery.
- `/marketplace/apps`, `/marketplace/categories/:category`, `/marketplace/:slug` — browse, category and item details where consistent with current route conventions.
- `/tools/short-links` — public Short Links product page and allowed tool entry flow.
- `/features/audience-manager` — public Audience Manager landing page.
- `/features` — public feature index linking the product pillars.
- Existing templates, themes, pricing, resources, and help routes.

Public marketing pages and listing details should be viewable without login. Actions involving workspace install/configuration, private contact data, audience exports, managing short links, editing or publishing require authentication and authorization. Public previews must not reveal workspace data or private drafts.

## 25.3 Creator Pages

Use the same canonical page document, Canvas, blocks, templates, themes, public renderer, publishing lifecycle, slug/domain system, analytics and permissions. Creator onboarding should configure common KUBICU components with a creator-appropriate starting preset; it must not introduce a separate editor.

Creator landing page content: value-led hero; real page previews; use cases (video, music, fashion, writing, photography, design, education, professional services); templates and themes; audience capture; content/media; profile/portfolio; supported monetization; campaign links/QR; analytics; FAQs; privacy/trust and clear create-page CTA. Do not fabricate endorsements, creator metrics or capabilities.

Creator public pages should compose identity, links, content, media, portfolio, lead capture, forms, events, products/services, collaboration/contact actions and other supported blocks. Shared short links can point to the whole page or supported destinations. Forms feed the canonical CRM/Audience Manager only through defined rules, lawful disclosures and consent handling.

## 25.4 Marketplace — separate platform extension catalogue from commerce

Expose a public Marketplace for approved platform extensions and reusable assets. Taxonomy:

- Apps and integrations.
- Themes.
- Templates.
- Blocks and section packs.
- Automation recipes.
- Industry kits.
- AI workflow packs only when technically supported and approved.

Do not conflate this platform extension marketplace with individual sellers' product catalogues. If a future creator-to-brand collaboration marketplace is introduced, give it a separate product definition and name.

Each listing should provide identity/publisher, description, screenshots/previews, type/category, version, compatibility, dependencies, price/entitlement, data/permission requirements, integration or region constraints, privacy/terms, support contact, changelog, status and moderation outcome. Ratings must be genuine and abuse-moderated.

Installation lifecycle: discover → inspect → preview → permission disclosure → compatibility/entitlement check → user approval → install/connect → configure → attach to page/workspace → health verification → update/rollback/uninstall. External packages must not receive unrestricted application database/filesystem/tenant access. Use reviewed adapters, constrained APIs and/or isolated runtimes. Preserve customer-owned data on uninstall where required. Super-admin needs catalogue moderation, versions, dependency review, permission declarations, rollout, disable/rollback, audit and incident response.

## 25.5 Short Links and QR

Short Links must be a complete product, not only a public marketing page. User journeys: create a shortened URL; validate destination; optionally choose a unique custom slug; add channel/campaign/tags; create QR; copy/share; manage destinations; inspect clicks and attribution; export or delete according to plan/privacy controls.

Required foundation: atomic slug uniqueness, supported protocol allowlist (normally HTTP/HTTPS), abuse/malware screening, rate limits, redirect-loop/open-redirect protection, safe destination checking, cache invalidation after edits, stable redirect runtime, abuse reporting, auditing of destination changes and privacy-preserving event collection. Redirects must remain available when analytics/AI/CRM services are degraded.

Analytics must distinguish raw clicks, filtered bot events, estimated unique visitors and QR scans. Do not interpret a click as a known person. Capture channel, campaign, tag, timestamp and limited source/device information only as permitted. Optional advanced capabilities include UTM presets, scheduled/expiring links, broken-link alerts, dynamic QR destination changes with history, controlled A/B routing, API/webhooks and branded/custom short domains after domain/security validation. These advanced items must be staged rather than silently assumed in MVP.

## 25.6 Audience Manager / lightweight CRM

Audience Manager should be a focused interface on the existing canonical contact/CRM foundation rather than a second silo. Public landing page: explain consent-aware capture, source attribution, groups/tags, segmentation, export/deletion, integration syncing and shared analytics. Show realistic sample dashboard data only when clearly illustrative.

App screens: audience overview; contacts; contact detail/timeline; search/filter/tagging; segment builder; source/campaign view; import/export; duplicate review/merge; consent/subscription state; integration connections and field mapping; sync logs/retries; permitted notification/campaign tools; retention, deletion and privacy controls.

Potential sources: page forms, newsletter/waitlist, service and booking enquiries, supported product/checkouts, QR/short-link campaign metadata, approved integrations and other KUBICU events with defined purpose. A click alone must not create an identified contact. Contact creation/update requires a real identifying interaction or other approved basis. Consent is distinct from attribution; never infer permission to send marketing from a click. Enforce tenant isolation, role permissions, minimization, retention, export/deletion and audit trails. Suppression/unsubscribe states must be honored by outbound systems.

## 25.7 Shared integration graph

Connect the four pillars through shared services and canonical entities:

- Workspace owns pages, short links, campaigns, marketplace installations and audience records.
- Creator pages use the standard page document, block schemas, theme/template references and publishing runtime.
- Short links may point to pages, approved sections, products, bookings, campaigns or external URLs.
- QR assets reference valid destinations and the same attribution model.
- Campaigns group short links, QR assets, tags/channels and eligible conversion events.
- Forms can create/update contacts under configured validation/consent rules and preserve source/campaign metadata.
- Marketplace installation makes approved blocks/integrations available in the common Canvas/workspace, while respecting permissions and entitlements.
- Copilot-created pages are ordinary canonical page documents, and can be published and shared through the same Short Links, QR, analytics and Audience Manager services.

Suggested shared events, adapt to current telemetry: `public_page_view`, `public_link_click`, `short_link_redirect`, `qr_scan`, `form_view`, `form_submission`, `audience_contact_created`, `audience_contact_updated`, `marketplace_listing_view`, `marketplace_install_started`, `marketplace_install_completed`, `marketplace_install_failed`, and supported booking/commerce conversion events. Define source, bot filtering, attribution window and PII rules.

## 25.8 Public-site mega menu

Build a shared, accessible, configuration-backed desktop mega-menu and mobile drawer/accordion. Top-level groups should be concise: Product, Solutions, Marketplace, Resources, Pricing, plus Log in and a primary Get Started/Create Page action. Exact labels may be refined to fit the current brand architecture.

Use an icon-rich sub-header/category row and grouped entries with a relevant icon, short title, and one-line description. Suggested Product entries: Canvas Website Builder, Creator Pages, Mini-Websites, Store & Digital Products, Services & Bookings, Audience Manager, Short Links & QR, Analytics & Growth, AI Copilot. Solutions entries: Creators, Freelancers/Portfolios, Shops/Social Sellers, Service Businesses, Artists/Musicians/Podcasters, Educators/Digital Products, Events/Communities, Agencies. Marketplace entries: Apps & Integrations, Templates, Themes, Blocks/Section Packs, Automation Recipes, Industry Kits, developer/partner program when approved. Resources: guides, help, updates, template inspiration.

The desktop menu must support pointer hover **and** click/focus; keyboard access, Escape close, focus restoration, stable pointer transitions, visible focus/active states, viewport-aware sizing, and reduced motion. Mobile must use a purpose-built drawer/accordion with touch-sized controls, not a squeezed desktop panel. Avoid dead links and burying Pricing. Use KUBICU-original styling and assets while matching the usability of a mature icon-rich mega menu; do not pixel-copy Linktree. Keep public mega-menu navigation distinct from logged-in workspace navigation.

## 25.9 Public landing pages and SEO

Each pillar page must be a complete marketing experience, not a hero-only mockup: Creator page previews and use cases; Marketplace search/categories/listing previews and trust model; Short Links demo/QR/campaign use cases and safety; Audience Manager dashboard preview, capture workflow, consent, segment/export/integration value. Cross-link the pillars intentionally.

Use unique titles/descriptions, canonical metadata, Open Graph cards, sitemap/robots configuration, useful internal links, responsive optimized media and sensible lazy-loading. Private drafts and authenticated dashboards must not be indexed. Never publish fake user counts, fake testimonials, fake ratings, unapproved partner logos, or unsupported product claims.

## 25.10 Staging

Phase A: inspect repository, routes, schemas, current modules and Magic Patterns work; produce route and data-contract register.

Phase B: ship shared navigation/mega menu and public landing pages with accurate links and SEO; label future functionality honestly.

Phase C: reliable Short Links core, redirect safety, slug uniqueness, tags/channels, QR and privacy-safe events.

Phase D: Audience Manager on canonical contact/forms/CRM data, source and consent, segments, export/deletion and one validated integration adapter.

Phase E: marketplace manifest, permissions, compatibility/entitlement checks, secure install/connect, versioning, rollback and super-admin governance.

Phase F: end-to-end journeys, monitoring, security review, mobile/accessibility QA and staged rollout. Do not declare full integration until data, permissions, UI and workflows work end-to-end.

**Release gate:** All public routes work; mega menu supports pointer/keyboard/touch; creator public pages use the canonical renderer; marketplace listing/install operations are permissioned and auditable; redirects are safe and resilient; Audience Manager enforces consent, tenant isolation, export/deletion; creator → short link/QR → form → audience workflow passes; marketplace → install → Canvas passes; and metrics/error recovery are monitored.
