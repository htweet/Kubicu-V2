# KUBICU — Prototype Status & Gap Report

**Pass:** 1 + gap closure (Batches 1–2 complete) · **Default appearance:** Dark studio

## Acceptance checklist

### Batch 1 · Design system & shell
- [x] Four complete visual directions, all driven by one set of semantic tokens
- [x] Type scale, 4/8 spacing, radius, three elevations, motion rules, reduced motion
- [x] Buttons (4 variants, 3 sizes, disabled, loading), icon buttons
- [x] Text field, text area, select, prefix/icon fields, error/hint/disabled/optional
- [x] Currency (₦) input, date / time / date-time inputs with time-zone label, time-zone select
- [x] Media picker: upload (JPG/PNG/WebP ≤ 10 MB, resized to 1280px, compressed), crop to block shape (drag, zoom, arrow keys), or paste a link; broken-image state
- [x] Switch, segmented control, tabs (keyboard arrows), badges, plan lock, illustrative tag
- [x] Inline alerts, empty state, skeleton, dialog, sheet, menu, toast
- [x] Command palette (⌘K / Ctrl+K) in the desktop editor
- [x] Data table: filter, sort, bulk select + action, loading/empty/no-match, columns fold on mobile
- [x] Chart card: period + unit always shown, written summary, loading/empty/error states
- [x] Desktop sidebar → icon rail on laptop → bottom bar + More sheet on mobile
- [x] Honest "Planned · Batch N" screen for all unbuilt modules and admin areas
- [x] Design system lives in Super admin (`/admin/design-system`) with appearance policy controls + change history
- [x] **Workspace appearance**: each workspace has its own look, shared by everyone in it (D23, D25)
- [x] Plan ladder follows the blueprint: Free, Creator, Pro, Business, Agency, Enterprise

### Batch 2 · Canvas
- [x] Desktop: top bar, Blocks/Layers/Templates panel, framed artboard, contextual inspector
- [x] Mobile: full-screen artboard, FAB, Blocks/Design/Layers/Settings sheets, tap-to-edit sheet
- [x] 16 working blocks, shared renderers between editor and public page
- [x] Add, select, live edit; drag, keyboard (Alt+↑/↓) and button reorder
- [x] Duplicate, hide/show, delete with exact-position restore; undo/redo; shortcuts
- [x] Block locking and grouping (first release, confirmed)
- [x] **Reusable sections**: save selected blocks or a group from Layers; insert from "Your sections" at the top of Blocks or from ⌘K; rename/delete with undo; shared across the workspace
- [x] **Saved themes**: "Save current" in the theme panel; reuse on any page; delete with undo
- [x] **Block scheduling**: "Show between dates" per block (Visibility tab); canvas badge (Scheduled / Timed / Ended); live page respects the window; draft preview shows all
- [x] **Scheduled publish**: Publish now / Schedule in the publish dialog; status badge; reschedule or cancel; goes live with a version entry
- [x] **Edit conflict**: editing the same page in two tabs pauses autosave and asks "Keep mine" or "Load other version" — nothing is overwritten silently
- [x] Page theme presets, custom colours, contrast check; < 3:1 blocks publishing with fixes
- [x] Responsive warning: button labels over 32 characters may wrap on small phones
- [x] Publish review, draft vs live, version history + snapshots + restore, templates
- [x] Example page (Adaeze Atelier) + public page `/p/adaeze` + unavailable state

### Batch 3 · Public pages, templates, website & onboarding
- [x] Multiple workspaces, each with its own page, versions, look, plan and library; unique handles enforced
- [x] 10 new blocks (gallery, product grid, menu, pricing, testimonial, event, countdown, download, portfolio, location & hours) — 26 total
- [x] 12 fictional example pages, viewable at `/p/{handle}` with an "Example page" notice
- [x] Template gallery on the website (`/templates`, filters by goal/style + search, detail with scrollable live preview) and in the canvas Templates tab
- [x] Applying a template strips the example's prices, links, contacts, dates and quotes; blocks needing details are hidden, not deleted
- [x] Marketing homepage, pricing (test ranges, labelled), help/contact/legal placeholders, responsive header/footer
- [x] Sign up, sign in, password reset, email verification (prototype — no account created)
- [x] Onboarding: goal → starter (AI option disabled, Batch 5) → identity (live handle check + suggestions, photo) → first action → phone preview with honest gaps → publish/share
- [x] "Finish setting up" on Overview resumes at the same step
- [ ] QR code on share screen (Batch 5)
- [ ] Media library — browse past uploads (needs file storage)
- [ ] Multi-page micro-site (G-10) — moved to Batch 4 with the section model (D7)

### Batch 4 · Pass A — Commerce
- [x] Commerce area with sub-navigation; sidebar item live
- [x] Overview: action queue (confirm / pack / out now), stock to watch, last 7 days with fees, setup checklist
- [x] Products: search, status & collection filters, editor (photos, price, compare-at, options → variants with SKU/price/stock, collections), archive/delete, unsaved-changes guard, CSV import with error preview, Free limit of 5
- [x] Inventory: per-variant stock, adjust with reason, movement history; orders reserve, cancellations/returns release
- [x] Orders: status tabs, CSV export, detail panel with progress, timeline, notes, money breakdown, simulated payment confirmation
- [x] Cancel, full/partial refund with restock and message preview; dispute with evidence, response and simulated outcome
- [x] Digital products: simulated upload → scan → ready, limits, expiry, licence, versions, access records, storage meter, update notice preview
- [x] Payments: illustrative providers, simulated connect success/error, live mode locked; Reports with period, fee breakdown, best sellers, CSV
- [x] Fulfilment settings: pickup, zones with fees and ETAs, free-delivery threshold; sample data load/clear
- [x] Catalogue-linked Product, Product grid and Download blocks with pre-publish checks
- [x] Public checkout sheet with five test outcomes, order confirmation page, secure download page
- [x] Overview “Needs attention”; command palette Add product / Find order

### Batch 4 · Pass B — Bookings, Audience, Automations
- [x] Bookings: services (duration, price, deposit, location, break), weekly hours + date changes, limits (notice, per day, horizon), cancellation policy, reminder preview
- [x] Schedule: upcoming / week calendar / past; booking detail with reschedule (free times only), cancel, completed, no-show
- [x] Booking block linked to a service; Pricing packages can book a service
- [x] Visitor booking sheet: day → time (business zone + visitor’s own) → details & intake → test deposit → confirmation; slot-taken and deposit-failure states; booking page with reschedule/cancel under policy
- [x] Audience: contacts from orders, bookings, forms and newsletter (forms/newsletter now store submissions); consent, tags, stage, notes, follow-ups, timeline; list + pipeline; CSV import with mapping & errors; export; duplicate review & merge; opt-out recorded and never reversible by owner
- [x] Automations: five recipes, readable builder (trigger → conditions → actions/delays → outcome), test runs, draft/on/paused, workspace-wide pause, run history with failures and retry
- [x] Overview “Needs attention”: bookings today, new leads, follow-ups due; palette “Add contact”
- [x] Menu items can link to Commerce products (name, price, sold-out sync; drafts hide; deleted products fall back to typed details)

### Gap closure (before Batch 5)
- [x] My Spaces: all spaces across workspaces with search, status filter, cards/table; page health; duplicate as new workspace; unpublish with confirmation
- [x] Canvas: collapsible side panels with icon rails, focus mode (⌘\), remembered per device
- [x] **Pass A — Media library**: one library per workspace (IndexedDB); image fields choose from Your uploads / Upload / Link; crop makes a copy; library default descriptions fill empty alt fields; Media screen (`/app/media`) with In use / Not used filters, search, multi-upload and drag-and-drop, storage bar (example allowance); detail with where-used links, replace everywhere (with preview), safe delete (removes from draft and products, keeps a copy for the live page and history, undo when unused); duplicate detection; embedded photos moved into the library automatically on load; falls back to embedded photos if storage is unavailable
- [x] **Pass B — Multi-page sites (D48)**: home page plus extra pages inside one space (shared link, theme, branding, menu); each page has its own blocks, menu name, address (`kub.icu/handle/path`) and search & sharing; canvas page switcher in the top bar, Pages tab/rail (add, rename, address, hide from menu, reorder, duplicate, make home, delete with undo) and a Pages sheet on mobile; site menu on the canvas and live page; whole site publishes as one version; renamed/removed live pages redirect (removed → home); pre-publish checks per page (empty page, bad/duplicate address, block issues labelled with the page) plus the plan page limit (Free 1 · Creator 5 · Pro 20 — example); Media “where used” and deep links open the right page; existing pages load as one-page sites unchanged
- [x] **Pass C — Mobile patterns (D49)**, applied through shared components so every business screen picks them up:
  - Side panels (order, product editor, contact, booking, service, automation builder, media detail) open **full-screen** below 768px, with a 44px close button and the save/action bar pinned at the bottom
  - Every `DataTable` (Orders, Products, Inventory, Reports, Audience list) becomes a **card list** on phones: title column, right-aligned values (totals, stock, dates) on the right, key details beneath; mobile sort menu and “Select” for bulk actions
  - Sub-navigation (Commerce, Bookings) swipes sideways and **keeps the current tab in view**
  - Bookings **Week → day-by-day agenda** on phones (swipeable day strip with booking dots, then that day’s list)
  - Audience **Pipeline → stage tabs** with counts on phones; filters sit two-up
  - Delivery zones and product variants **stack as small forms** with visible labels; variant stock gets **− / + steppers**
  - CSV import preview becomes a **list with problem rows first** on phones
  - Page header actions wrap and the main action stretches to a full-width, 44px button
  - Product editor on phones: **one section open at a time** (Details · Photos · Stock & options / File & access · Collections) with a summary on each closed section; save jumps to the section with the problem
  - Order detail on phones: **vertical progress tracker** with the current step highlighted
  - Contact detail on phones: **Details · Follow-ups · Activity tabs**
  - Automation builder on phones: **“Add a step” bottom sheet** listing every action plus Wait; move up/down/remove at 44px
  - Weekly hours (Availability and Hours block): 44px rows, larger day switches and time fields
  - Contact import already shows problem rows as a list; duplicate review already stacks the two records on phones
  - Kept by design: Inventory “Adjust” keeps its reason step (quick ± lives in the product editor’s variants)

### Pending designs round (plan: label fixes, spaces, discounts, campaigns, DealRooms)
- [x] **Pass 0 — Stale labels**: My Spaces “Coming next” line removed; website capability list and Pricing table show Commerce, Bookings and multi-page sites as available; Screen inventory family table brought up to date
- [x] **Pass A — Several spaces per workspace (D50)**: space types Main page · Campaign · DealRoom; each extra space has its own link (availability-checked), look, blocks, versions and publishing, and shares the workspace’s products, stock, orders, bookings, contacts, automations and media; My Spaces “New space” type picker (with plan allowance: Free main only · Creator 3 · Pro 15 — example), name + link step with suggestions; All spaces lists every space with type filter, status (Live · changes · Scheduled · Draft · Ended), archive (link forwards to main page; orders and contacts kept) and restore; canvas space switcher in the top bar (desktop and mobile); campaigns and DealRooms have one page (Pages tab explains, page switcher hidden, publish check blocks extra pages); spaces over the plan allowance stay editable but can’t publish; Overview shows live/scheduled campaigns and DealRooms under the main page; existing workspaces load unchanged as main-page-only
- [x] **Upgrade path everywhere a plan limits you**: one upgrade dialog (plans that unlock the feature, what each adds, example prices; switching is prototype-only, no payment) opened from New space, Pages limit, product limit, Digital, Bookings note, Media storage full, “Made with KUBICU” setting, and every plan-related publish check and block issue
- [x] Dialog bodies never scroll sideways; New workspace (`/start`) has a Back button on its first step
- [x] **Pass B — Discounts (D51)**: Commerce → Discounts (`/app/commerce/discounts`) with codes, automatic offers and referral codes; % / fixed / free delivery; everything, chosen products or collections; minimum spend; start/end; total and per-customer limits (by phone); pause; delete only when unused; statuses Active · Scheduled · Expired · Used up · Paused; totals given, uses per code and top referrers; checkout “Add discount code” on the cart and review steps with plain reasons (unknown, expired, not yet active, used up, minimum not met, already used, doesn’t apply to these items); one discount per order — the better one wins and the customer is told; campaign links pre-fill `?code=`; discount re-checked when the order is placed; shown as its own line on order detail, the customer’s order page, Reports and CSV; refunds return what was actually paid; sample EID20, “10% off over ₦50,000” and ADA-CHIOMA referral (labelled sample)
- [x] **Storefront (D53)**: Commerce → Storefront (`/app/commerce/storefront`) — on/off, title, intro, “Shop” in the site menu with its own label, hide sold-out, ordering (cart + checkout on Pro with upgrade prompt; WhatsApp with number otherwise), live preview of what’s in the shop and a warning if a page already uses /shop; public shop at `/p/{handle}/shop` with collection tabs, search, sort (featured, newest, price), in-stock filter, Sale / Sold out / Only N left labels, automatic-offer banner, empty and no-match states with Clear filters; product pages at `/p/{handle}/shop/{id}` with photo gallery, option chips showing sold-out combinations, live stock note, Add to cart or Order on WhatsApp (pre-filled with option and price), description and “More from {collection}”; shared cart and checkout with the page; demo workspace has it switched on
- [x] **Pass C — Campaign pages (D52)**: New campaign asks for a starter (Sale · Product launch · Event), start and end, featured products and an optional discount code; the starter builds a Before version (teaser, “Starts in” countdown, Notify-me sign-up), a Live version (offer, “Ends in” countdown, product grid linked to the featured products; event details for Event) and an Ended version (thank-you + link back to the main page); each block’s Visibility tab has “Show during the campaign: Before · Live · Ended”; the canvas shows a phase bar to preview each version (reordering keeps hidden blocks in place); page settings hold the campaign window, discount, featured products and results (orders, revenue, discounted) — countdowns follow date changes; the live link shows the right version automatically and applies the campaign code at checkout while live; draft preview has a phase switcher; orders record which link they came from; Overview strip shows phase, timing and orders; publish checks for no end date, end before start, already ended, deleted/paused/early-ending discount, featured products archived or sold out, and empty phases (Live empty blocks publishing)
- [x] **Pass D — DealRooms (D54)**: New DealRoom asks for type (Group goal / Limited drop), product, room price, buyers needed or units, per-person limit and deadline; the room page opens with a panel showing the product and room price vs normal, a live “14 of 20 joined” / “6 of 20 left” bar from real paid orders, a ticking countdown, plain terms, one buy/join button, WhatsApp share and copy link, and seller updates; states Opens soon · Live · Goal reached · Sold out · Ended · Goal missed, each with its own message; checkout uses the room price, only the room product, caps quantity by per-person limit and units left, checks earlier orders by phone, and shows the group-goal promise; group-goal orders are marked held (“don’t pack yet”, fulfilment blocked) and released automatically when the goal is reached; after a missed deadline every held order is refunded in full with stock returned; seller panel in Page settings: progress, revenue, held count, who joined, post an update (preview), extend deadline or end early with a recorded reason, terms locked once anyone joins; publish checks (product, price, deadline, goal ≥ 2, units, stock vs units, Pro plan with upgrade); Overview strip shows room state and progress
- [x] **DealRoom referral links (D56)**: each buyer gets a share code and link on their order page (copy, WhatsApp share, “N joined through your link”); visitors arriving with `?ref=` see “Ngozi invited you”; orders record who referred them (self-referral ignored); seller panel shows top referrers, “via CODE” on each buyer and an optional reward note shown in the room terms; sample buyers include two referred by Ngozi
- [x] **Refund fees (D55, recommended policy)**: customers always get 100% back; KUBICU fee returned on full refunds and waived on missed-goal refunds; provider fee treated as non-refundable and shown — Payments has a “Fees when you refund” section, New DealRoom and the seller panel estimate the cost of a missed goal
- [x] **Pass E — Phones, docs and samples**: new screens use the shared phone patterns (Discounts table → cards, discount editor and order sheets full-screen with pinned actions, Storefront settings stack, New space opens as a bottom sheet); full-width segmented controls on the discount editor, storefront ordering, DealRoom type and the campaign phase bar; decisions D50–D54 recorded; demo workspace gets a **sample Eid sale campaign** (live, EID20 applied, three featured products) and a **sample scarf group buy** (goal 10, room price ₦14,000, four sample buyers held), both named “(sample)” and archivable like any space

### Batch 6 part 1 — Teams (plan: Teams, roles, approvals and assignments)
- [x] **Pass A — Members, roles and enforcement (D57, D59)**: Settings (`/app/settings`) with Team and Roles; members list (role, spaces, last active, sample tag), seat meter with upgrade at the limit, paused-seat warning after a downgrade; invite by email or phone with role and spaces (duplicate and already-member checks, copyable link, nothing sent); pending/expired invites with copy, resend and cancel; change role, spaces they can edit, remove (confirmation), make Owner (transfer, you become Admin); Roles table with the signed-in role highlighted and the Sales refund limit; accept-invite page (`/invite/:token`) with valid, expired, cancelled, used and unknown states; **Viewing as** control in the Controls panel (Owner · Admin · Editor · Sales · Viewer) with a sidebar chip; enforcement — Commerce and Bookings/Audience/Automations changes go through the role (visitor actions don’t), “View only” line on screens your role can’t change, canvas read-only door with Preview, prices locked for Sales, Sales refund limit, New space/Archive and Media uploads gated; team actions and refunds written to the activity log; demo workspace has sample Ngozi (Editor, main + Eid sale), Tunde (Sales) and a pending Viewer invite — paused as Viewers on plans below Business
- [x] **Pass B — Space access and approvals (D57, D58)**: “Who can edit” on every space in My Spaces (Owner/Admin always; tick Editors/Sales; everyone / only admins shortcuts); spaces you can’t edit are hidden from My Spaces and the canvas space switcher with a count; Settings → Approvals with the on/off switch and rules, waiting and recently decided lists; Editors get Send for review (now or with a go-live time) in the publish dialog; pending requests follow the Editor’s later edits; review sheet with live vs proposed previews, changed blocks and settings, note and requested time; Approve & publish / Approve & schedule (exact reviewed version, main space through the editor, campaigns and DealRooms from storage), Request changes with required comment, Withdraw for the requester; “changed since you opened this” guard; sidebar and tab badges, Needs-attention chips for reviewers and requesters, canvas toast and “In review” / “Changes requested” badge; publishes, schedules and decisions logged
- [x] **Pass C — Assignments, activity and presence (D60)**: “Assigned to” on order detail, booking detail and contacts (“Looked after by”), follow-ups assignable when added (defaults to you) with a chip in the list; Mine filter with counts on Orders, Schedule and Audience, plus Assigned / Looked-after-by columns; removing a member moves their open orders, bookings, contacts and follow-ups to you; automations: “Notify a team member” action and assignable “Create a follow-up”, both with a member picker, validation and test-run previews; Settings → Activity (who, area, period filters, grouped by day, linked entries, CSV export); simulated canvas presence (teammate avatars in the top bar on desktop and phone, one teammate’s colour and name on a block, heads-up toast when you select it); invitation actions wrap on phones; decisions D57–D60 recorded

### Batch 5 (plan: Analytics, domains & QR, AI page setup, IntentFlow)
- [x] **Pass A — Recording and Analytics (D61)**: on-device recording on every public page (views, taps by block, product views, cart, checkout, paid orders with value, booking steps, forms, sign-ups) with source detection and anonymous session/browser ids; draft previews and examples never record; Analytics screen (`/app/analytics`, sidebar module live) with 7/30/90/custom periods, compare-to-previous (dashed line and % changes), space filter, headline (visits leading; estimated visitors, tap rate, revenue with definitions), visits-over-time chart with text summary, top links table, sources table with conversions, Shop / Bookings / Leads funnels, Link Intelligence (evidence, dismiss, open in canvas, “not proof” note), CSV export, sample badge with clear; Overview “Visitor activity” shows 7-day visits, top source, top link and a mini bar strip; Settings → Privacy (record on/off, don’t count my own visits, 90-day retention, add/clear sample, delete all with confirmation, visitor notice); “See analytics” permission; demo workspace has 30 days of labelled sample visits
- [x] **Pass B — Domains, QR codes, campaign links, redirects (D62)**: Domains & QR module live in the sidebar (`/app/domains`: Domains · QR codes · Campaign links · Redirects); connect-a-domain wizard with DNS records, registrar tips and a simulated check (success / wrong record / timeout) driving Waiting for DNS → Verifying → Certificate → Live or Problem, primary address, kub.icu forwarding, disconnect; Creator+ gating with upgrade; short links at `/p/{handle}/s/{slug}` that land with `src`/`c` tags (ended links show a friendly page); QR designer (contrast check, initials, caption, PNG/SVG, print sheets for A6 card, A4 poster, table tent) using the `qrcode` package; per-link visits/scans, orders and revenue on Campaign links, QR cards and a new Analytics section; custom redirects (to a page or an https site) resolved on public pages, plus the automatic ones listed; readable product addresses once a domain is live; new “Connect and manage domains” permission; demo workspace has sample “Instagram bio” and “Market flyer” links/QR with matching sample visits
- [x] **Pass C — AI page setup and block suggestions, simulated (D63)**: "Set up with AI" in the canvas page panel (desktop and phone) — brief → up to 4 follow-up questions (only what the brief didn't say) → short drafting state → review with before/after thumbnails, "What we assumed", per-block checkboxes and "Use the draft's look"; applied as one undoable step. Draft takes layout from the closest starter and words from the owner only; prices, testimonials, FAQ answers and policies are never written — they become `[Add …]` placeholders (publishing blocked until replaced) or hidden blocks. Block suggestions in the inspector: heading rewrites, button labels (from the link's destination), product descriptions from real Commerce details (saved to the product), FAQ answers from page facts. Monthly credit meter per plan (example figures: Free 10 … Agency 1,500; page draft 5, block 1) with not-enough-credits + upgrade state and a simulated service failure (no credits used). Onboarding "Describe it with AI" picks the closest starter from a brief. Everything labelled "AI preview"; no model is called.
- [x] **Pass D — IntentFlow, source-based blocks and preview-as (D64)**: per-block source rules in Visibility (Everyone / Only / All except, 10 sources, goal, pause), "Some sources" chip on canvas blocks, "Preview as" bar in the canvas (desktop and phone) when rules exist and `?as=` on the draft preview, live pages filter by the visit's source; safeguards in publish checks (a block for everyone on every page; no rule hiding a block from all sources); IntentFlow screen in the sidebar with live status, results vs everyone else (≥30 visits each side), and instant Pause / Resume / Roll back with Undo
- [x] AI surfaces use the reserved AI gradient (D63a): AI buttons, "AI preview" tag, AI cards, drafts, suggestions and the credit meter

### Batch 6 part 2 (plan: Billing, notifications, marketplaces, Super-admin operations)
- [x] **Pass A — Plan & billing and the notifications centre (D65, D66)**: Settings → Plan & billing (current plan with status and renewal, usage meters with upgrade at 80/100%, test card, invoices with printable view, VAT line, watermark and CSV, prototype "skip ahead" controls); one plan-change flow behind every upgrade button (monthly/yearly compare, prorated charge preview, test-card payment with bank confirmation, downgrades scheduled for renewal with an exact impact list, Enterprise "Talk to us"); cancel with reason and resume; failed renewal → 7-day grace with app-wide banner, retry and update card, then Free; 14-day Pro trial from Free; Controls "Simulate next renewal". Notifications bell (sidebar and phone top bar) with an inbox grouped Needs action / Updates, area filters and read state, role-aware sources across orders, stock, bookings, audience, reviews, team notices, billing, AI credits, domains, DealRooms and campaigns; Settings → Notifications (event × channel, digest, quiet hours; email/WhatsApp marked preview); Overview "See all"
- [x] **Pass B — Extension and template marketplaces (D67)**: Extensions screen live in the sidebar (staff picks, search, categories, Installed tab, detail sheet with permissions, versions + roll back, reviews), install flow (permissions → test-card payment for paid add-ons → setup → done), pause / settings / uninstall with activity-log entries; working effects — draft abandoned-checkout automation, cookie notice for Meta Pixel / Google tag on public pages, partner delivery zones, Invoice button on orders — and previews from real data (review requests, WhatsApp catalogue sync, bank transfer). Templates screen (`/app/templates`, Build group) with type / region / mood / price filters, phone and desktop preview, apply to main page (undoable) or start a campaign from a template, premium purchase per workspace (invoice), private share codes for saved themes and sections; canvas Templates panel shows premium locks; public Templates page gets Premium tags plus price and region filters

### Batch 6 (part 3) — subscriptions, template selling, Super-admin
- [x] **Pass A — Subscription history (D68)**: Plan & billing has a "What's coming" line and a dated Subscription history (who, when, linked invoice) for trials, plan and cycle changes, scheduled downgrades, cancel/resume, renewals paid or failed, grace period, retries, move to Free, card changes and one-off purchases; filters and CSV export; sample history for the demo workspace
- [x] **Pass B — Customer subscriptions (D69)**: Commerce → Subscriptions (plans editor for memberships and product boxes, subscribers list and detail, MRR/joined/left/failing, prototype "Run renewals now"); Subscription block with inspector and publish checks; visitor sign-up sheet (details → delivery → review & pay with renewal terms; card works / bank confirmation / declined); subscriber portal (pause, skip, change plan, update card, cancel/resume); automatic renewals, trial ends, retries on days 1/3/5 and 7-day grace while the app is open; box renewals create orders and take stock; Reports recurring revenue; notifications, automation triggers and Analytics funnel; sample plans and subscribers for the demo workspace
- [x] **Pass C — Creators sell reviewed templates (D70)**: Templates gets Browse / My templates tabs; creator listings in Browse (credit, rating, reviews, Made by filter, buy, refund within 7 days, buyers keep the version bought); Sell / Update dialog with a side-by-side "what buyers get" check; My templates with statuses, review notes, sales, pending / available / lifetime earnings and test-mode payouts; Super admin → Modules & marketplace review queue with checklist, approve / ask for changes / don't approve, listed and sent-back tabs, unlist; review outcomes in notifications; canvas Templates panel links to more templates and to selling; sample creators and one template waiting for review
- [x] **QR reach and fallbacks (D72)**: QR/campaign link destinations include event, booking and subscription blocks; "Get QR code" from My Spaces, publish success, product editor, Services and the block inspector; removed destinations fall back to the nearest live page with a notification
- [x] Right-side sheets: Discount, Subscription plan, Subscriber and template-review panels get proper padding; sheet descriptions wrap to two lines; header and footer no longer shrink
- [x] Onboarding first step: each goal card has an icon
- [x] Staff console separated from the customer app (D71a): no Super admin link in the workspace sidebar or phone menu; entry from the sign-in page
- [ ] Pass D — Super-admin operations

## Honest limits
- **Front-end only.** No sign-in, server storage, payments, domains or real analytics. Data lives in this browser.
- **Scheduled publishing** fires while KUBICU is open in this browser; in production it runs server-side. Said in the UI.
- **Conflict detection** works between tabs in one browser; across devices it needs the backend.
- **Uploaded photos** are stored inside the page in browser storage, so many large photos can fill it and trigger the "Save failed" state. A real media library (Batch 3) stores files on a CDN.
- **kub.icu links** are displayed but illustrative; the prototype route is `/p/{handle}`.
- **Forms and newsletter** confirm to visitors but store nothing, and say so.

## Remaining items and why they wait
| Item | Why it waits | Plan |
|---|---|---|
| Full accessibility audit | By plan | Batch 7 |

## Needs founder confirmation
1. Plan prices (deferred by founder).

- **Accounts** are not created; sign-in opens the workspace on this device.
- **Legal and help pages** contain summaries only, pending legal review.

- **Payments** are always test mode; fee rates are illustrative. Digital files keep only name and size — nothing is uploaded or downloaded.
- **Customer messages** (receipts, shipping, refunds) are previews; nothing is sent.

- **Bookings and automations** never send real messages; reminders and runs are previews. Calendar sync is planned.

## Next
Batch 5 — analytics, domains & QR, AI page setup.
