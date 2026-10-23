# KUBICU — Screen Inventory

Status: ✅ Designed & interactive · 🟡 Partial · ⏳ Planned screen in place · ⬜ Not started
Phase: MVP · CR (commerce-ready) · Later

| Screen ID | Screen | Area | Primary user | Desktop / mobile | Entry point | Primary action | Key states | Dependencies | Phase | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| DS-01 | Super admin → Design system `/admin/design-system` | Super admin | Platform design admin | Both | Super admin nav | Control workspace appearances (available / default), inspect tokens & components | Withdraw confirmation, default locked on, change history, all control states | — | MVP | ✅ |
| SA-00 | Super admin shell `/admin` | Super admin | Staff | Both | Workspace sidebar → Super admin | Navigate the 18 ops areas | Planned-area screens (Batch 6) | Staff auth (backend) | MVP foundation | ✅ shell |
| WS-AP | Workspace Appearance picker | Workspace | Owner/member | Both | Sidebar footer, More sheet | Choose how KUBICU looks for me | Hidden when only one appearance is available; falls back to default if withdrawn | DS-01 policy | MVP | ✅ |
| SH-01 | Workspace sidebar (full + icon rail) | Shell | Owner | Desktop / laptop | Any workspace route | Navigate | Active, planned ("Soon") | — | MVP | ✅ |
| SH-02 | Mobile bottom nav + More sheet | Shell | Owner | Mobile | Any workspace route | Navigate | Active, planned (Batch N) | — | MVP | ✅ |
| SH-03 | Workspace switcher | Shell | Owner | Both | Sidebar footer | Switch workspace | Single workspace, disabled create | Teams (B6) | MVP | 🟡 |
| C-01 | Overview `/` | Workspace | Owner | Both | Logo, nav | Open canvas | Live / unpublished / draft, issues, no-analytics | Analytics (B5) | MVP | 🟡 light version |
| C-02 | Setup checklist | Workspace | Owner | Both | Overview | Next setup step | Done / to do / planned | — | MVP | ✅ |
| D-01 | My Spaces `/spaces` | Pages | Owner | Both (table → card) | Nav | Open canvas | Live / changes / draft, health, search & filter, cards/table, duplicate, unpublish confirm, no matches | Retire with redirect (B5), multiple pages per workspace (later) | MVP | ✅ |
| E-01 | Desktop canvas `/canvas/:id` | Canvas | Owner | Desktop ≥1024 | Nav, Overview, Spaces | Edit & publish | Selected, hover, hidden, error, warning, empty page, drag | — | MVP | ✅ |
| E-02 | Editor top bar | Canvas | Owner | Desktop | — | Publish | Saved/saving/offline/failed, unpublished/live, undo availability | — | MVP | ✅ |
| E-03 | Block library (search, categories, planned) | Canvas | Owner | Both | Left panel / Add block | Add block | No results, locked, planned | — | MVP | ✅ |
| E-04 | Layers list | Canvas | Owner | Both | Left panel / Layers tab | Reorder | Drag, Alt+↑/↓, up/down (touch), hidden, issues | — | MVP | ✅ |
| E-05 | Templates panel + replace confirm | Canvas | Owner | Desktop | Left panel | Apply template | Confirm, snapshot-before-apply, undo | — | MVP | ✅ |
| E-06 | Block inspector (Content/Style/Behaviour/Visibility) | Canvas | Owner | Both | Select block | Edit | Field errors, warnings, info notes, planned controls | — | MVP | ✅ |
| E-07 | Page theme panel | Canvas | Owner | Both | Nothing selected / Design tab | Choose theme | Presets, custom, contrast pass/low | — | MVP | ✅ |
| E-08 | Page settings (name, handle, SEO, share preview) | Canvas | Owner | Both | Inspector / Settings tab | Edit settings | Handle error, domain planned | Domains (B5) | MVP | ✅ |
| E-09 | Publish review dialog | Canvas | Owner | Both | Publish | Publish now | Up to date, errors block, warnings, publishing, success, failure | — | MVP | ✅ |
| E-10 | Version history | Canvas | Owner | Both | History icon / Settings | Restore to draft | Live, published, snapshot, empty | — | MVP | ✅ |
| E-11 | Mobile editor | Canvas | Owner | Mobile <1024 | Same | Edit & publish | Sheets for blocks/design/layers/settings/block, FAB | — | MVP | ✅ |
| E-12 | Draft preview `/p/:handle?draft=1` | Canvas | Owner | Both | Preview | Back to editor | Draft banner | — | MVP | ✅ |
| G-01 | Public page — Adaeze Atelier `/p/adaeze` | Public | Visitor | Mobile-first | Shared link | Order on WhatsApp | Live, form success/error, newsletter success/error | — | MVP | ✅ |
| G-02 | Public page unavailable | Public | Visitor | Both | Wrong/unpublished handle | Create own page | — | — | MVP | ✅ |
| G-03…10 | Creator, freelancer, retail, food, service, event, digital, professional, micro-site pages | Public | Visitor | Mobile-first | — | — | — | Batch 3 | MVP/Later | ⬜ (freelancer exists as template only) |
| I-01 | Commerce overview `/app/commerce` | Commerce | Owner | Both | Sidebar | Act on orders | Empty + sample data, setup, caught up | — | CR | ✅ |
| I-02 | Products + editor + collections + CSV import | Commerce | Owner | Both (side sheet → full screen) | Commerce nav | Add / edit product | Empty, filters, low/sold out, archived, unsaved, import errors, Free limit | — | CR | ✅ |
| I-03 | Inventory + adjust stock | Commerce | Owner | Both | Commerce nav | Adjust stock | Low, out, history, reason required | — | CR | ✅ |
| I-04 | Orders + order detail | Commerce | Owner | Both | Commerce nav, Overview | Advance fulfilment | Pending payment, paid, packing, shipped/ready, completed, cancelled, refunded, dispute | — | CR | ✅ |
| I-05 | Refund / cancel dialog, dispute panel | Commerce | Owner | Both | Order detail | Refund | Partial, full, restock, evidence, deadline, won/lost | Provider | CR | ✅ |
| J-01 | Digital products + access records | Commerce | Owner | Both | Commerce nav | Add file | Uploading, scanning, ready, failed, limits, expiry, versions, storage | Pro | CR | ✅ |
| K-01 | Payments setup | Commerce | Owner | Both | Commerce nav | Connect provider | Not connected, connecting, success, error, live locked | Provider (EPIC H) | CR | ✅ illustrative |
| I-06 | Sales report | Commerce | Owner | Both | Commerce nav | Export CSV | Periods, empty | — | CR | ✅ |
| I-07 | Commerce settings (fulfilment, sample data) | Commerce | Owner | Both | Commerce nav | Save zones | Validation, clear sample confirm | — | CR | ✅ |
| K-02 | Visitor checkout sheet | Public | Visitor | Mobile-first | Add to cart on page | Pay | Option choice, empty cart, stock limits, details/delivery errors, paying, declined, cancelled, pending, timeout | — | CR | ✅ test mode |
| K-03 | Order confirmation `/p/:handle/order/:id` | Public | Visitor | Mobile-first | After payment | Message seller | Confirmed, pending, timeout, cancelled, refunded, not found | — | CR | ✅ |
| J-02 | Secure download `/p/:handle/download/:token` | Public | Visitor | Mobile-first | Receipt | Download | Remaining, expired, limit reached, revoked, pending, invalid link | — | CR | ✅ |
| P-01 | Media library `/app/media` + image detail | Media | Owner | Both | Sidebar (Build) | Upload / reuse | Empty, uploading, duplicate, too large/wrong type, storage full, in use / not used, replace preview, delete in use, unavailable storage | CDN (engineering) | MVP | ✅ |
| P-02 | Image picker dialog (every image field) | Media | Owner | Both | Any image field | Choose image | Your uploads / Upload / Link, shape filter, search, crop copy | — | MVP | ✅ |
| P-03 | Pages manager (canvas Pages tab / mobile sheet) + page switcher | Canvas | Owner | Both | Canvas top bar, left rail | Add / organise pages | One page, many pages, editing a page, bad or duplicate address, address change with redirect note, at plan limit, delete confirm with undo, make home | — | MVP | ✅ |
| P-04 | Site menu + missing page (public) | Public | Visitor | Both | `/p/:handle/:path` | Move between pages | Menu on/off, hidden pages, redirected address, page doesn’t exist | — | MVP | ✅ |
| L-01 | Bookings schedule (upcoming / week / past) + detail | Bookings | Owner | Both | Sidebar | Manage bookings | Empty, today, reschedule, cancel, no-show, completed | — | CR | ✅ |
| L-02 | Services + editor | Bookings | Owner | Both | Bookings nav | Add service | Off, deposit > price | — | CR | ✅ |
| L-03 | Availability & policy | Bookings | Owner | Both | Bookings nav | Save hours | Hours error, date changes, reminders preview | Calendar sync (later) | CR | ✅ |
| L-04 | Visitor booking sheet | Public | Visitor | Mobile-first | Booking block / pricing | Book | No availability, slot taken, deposit failed, time zones | — | CR | ✅ test mode |
| L-05 | Booking confirmation `/p/:handle/booking/:id` | Public | Visitor | Mobile-first | After booking | Reschedule / cancel | Within/outside policy window, cancelled, past | — | CR | ✅ |
| M-01 | Audience list + pipeline + contact detail | Audience | Owner | Both | Sidebar | Follow up | Empty, consent states, duplicates, tasks due | — | CR | ✅ |
| M-02 | Import contacts / duplicates review | Audience | Owner | Both | Audience | Import / merge | Mapping, row errors, lawful-basis confirm | — | CR | ✅ |
| N-01 | Automations overview, recipes, builder, run history | Automations | Owner | Both | Sidebar | Turn on | Draft, on, paused, global pause, problems, test run, failed + retry | Messaging (later) | Later | ✅ |
| X-01 | Planned module screen | Shell | Owner | Both | Analytics, Domains & QR, Extensions, Settings | Back to page | — | — | — | ⏳ |
| X-02 | Not found | Shell | Anyone | Both | Bad route | Go to overview | — | — | MVP | ✅ |

## Families from design plan §6 — status

Built families point to their rows above (and to PROTOTYPE_STATUS.md for detail).

| Family | Screens (design plan) | Batch | Status |
|---|---|---|---|
| A. Marketing website | Home, templates, template detail, pricing, coming-soon, legal/help stubs, auth, mobile nav | 3 | ✅ (stories/marketplace teaser not built) |
| B. Onboarding | Goal → kit → identity → first action → mobile preview → share; resume banner | 3 | ✅ (AI draft step disabled until Batch 5) |
| C. Overview (full) | Needs attention, commerce/bookings/leads summary, recent changes, setup | 4–5 | 🟡 (visitor numbers wait for Analytics) |
| D. Page management (full) | List/table, duplicate, unpublish, health; create space, retire/redirect, permissions | 3/5 | 🟡 (spaces per workspace in progress — D50) |
| G-10. Multi-page site | Pages panel, page switcher, site menu, per-page SEO, redirects | 4 | ✅ |
| H. Themes & template marketplace | Gallery, detail, apply; marketplace/licensing/reviews | 3/6 | 🟡 (marketplace Batch 6) |
| I. Commerce — physical | Overview, products, variants, collections, import, inventory, orders, fulfilment, refunds, disputes, settings | 4 | ✅ (discounts in progress — D51) |
| J. Digital products | File upload/scan, limits, expiry, secure download, log, revoke | 4 | ✅ |
| K. Checkout & payment setup | Cart, details, delivery, review, test outcomes, order status, provider connect | 4 | ✅ |
| L. Bookings & services | Services, availability, schedule (list/week), booking flow, reschedule/cancel | 4 | ✅ (calendar sync later) |
| M. Audience / CRM | List, pipeline, contact detail, consent, import/export, duplicates | 4 | ✅ |
| N. Automations | Recipes, builder, test run, pause, run history | 4–5 | ✅ |
| Media library | Picker, Media page, usage, replace, safe delete | Gap closure | ✅ |
| O. AI copilot & Voice-to-Store | 15 screens | 5 | 🟡 AI page setup, block suggestions, credits (D63) · Voice-to-Store and AI Business Coach ⬜ |
| P. Analytics & Link Intelligence | 14 screens | 5 | ✅ (D61) · real data pipeline is engineering |
| Q. Domains, links & QR | 15 screens | 5 | ✅ (D62, D71) · DNS checks simulated |
| R. IntentFlow | 10 screens | 5 | ✅ (D64) |
| S. DealRoom | 10 screens | 5 | ✅ (D54) |
| T. Trust Passport & Proof-of-Work | 10 screens | Later | ⬜ |
| U. Extensions & marketplace | 14 screens | 6 | ✅ curated (D67) · open developer submissions ⬜ · Forms add-on in progress (D79) |
| V. Teams, settings & billing | 16 screens | 6 | ✅ (D57–D60, D65, D66, D68) |
| Events & ticketing | Events, editor, ticket types, guest list, check-in, ticket page | 6 | ✅ (D73, D74) |
| Subscriptions | Plans, subscribers, block, subscriber portal | 6 | ✅ (D69) |
| Template selling | Sell flow, My templates, staff review | 6 | ✅ (D70) |
| Spaces: campaigns (D52) | New campaign, phase bar, campaign settings, live/before/ended public views | 4 (brought forward) | ✅ |
| Spaces: DealRooms (D54) | New DealRoom, room panel (6 states), held orders, seller panel, extend/end dialogs | 4–5 (brought forward) | ✅ |
| Commerce: discounts (D51) | Discounts list, discount editor, checkout code field | 4 | ✅ |
| Commerce: storefront (D53) | Storefront settings, public shop, product page, unavailable product | 4 | ✅ |
| W. Super-admin operations | Ops overview, tenants, plans, flags, modules, payments, AI ops, trust & support, system admin | 6 | 🟡 8 of 17 areas built (D75b) · Pages & domains, Plans & entitlements, Payments, Orders & disputes, AI ops, Reporting, Integrations, Data requests, Localisation ⏳ |
| X. Public trust/legal/safety states | Report, appeal, suspension, consent, unsubscribe, export/deletion, disputes, warnings | 3/6 | 🟡 Report a page, takedown and suspension states built (D75b) · legal pages and trust centre in progress (D78) · unsubscribe, data export/deletion ⬜ |

_Families table refreshed 22 Oct 2026 against the code. Full gap list: docs/DESIGN_GAP_AUDIT.md._
