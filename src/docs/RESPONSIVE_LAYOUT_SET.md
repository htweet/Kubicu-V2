# KUBICU — Responsive layout set

_Design deliverable of the Master Design Plan (responsive layouts). Written 30 Oct 2026 from the code at **D346**. Decision: D347._

How every kind of screen lays out on **phone, tablet and desktop**, with the exact breakpoints, widths and classes used, and the files that own each pattern. Part A is the shared system; Part B is each screen type; Part C lists inconsistencies and open layout decisions. If this doc and the code disagree, the code wins — update this doc in the same change. Canvas layouts are in `CANVAS_INTERACTION_SPEC.md` §2 and §19.

---

## Part A — The system

### A1. Breakpoints
Tailwind's defaults; `tailwind.config.js` doesn't override `screens`.

| Name | Min width | Used for |
|---|---|---|
| (base) | 0 | Phones. **Design target 390px; must work at 320px** |
| `sm` | 640px | Header rows go side by side; dialog footers go horizontal; 2-column card grids |
| `md` | **768px** | **App shell switch** (sidebar ↔ bottom tabs), tables ↔ cards, dialogs as right sheets, side-by-side page blocks, sticky phone bars hide |
| `lg` | **1024px** | **Desktop editor**, split views (Forms inbox, Copilot, Home, auth), website mega menu |
| `xl` | 1280px | Extra stat columns on Home |
| `2xl` | 1536px | Not used |

**Rule:** only `md` and `lg` change structure. `sm` and `xl` only adjust columns and spacing.

**Device classes in this doc:** Phone < 768 · Tablet 768–1023 · Desktop ≥ 1024.

### A2. Content widths
| Surface | Max width |
|---|---|
| Workspace pages (Home, Audience, modules) | `max-w-[1200px]` |
| Settings | `max-w-[1100px]` |
| Website shell (header, footer) | `max-w-7xl` (1280) |
| Website pricing body | `max-w-6xl` (1152) |
| Seller page reading column | narrow 480 · **standard 560** · wide 760 (`contentWidthPx`) |
| Seller page wide blocks | 1120 (`WIDE_PX`) |
| Standalone visitor pages (order, booking, ticket, download, pay link) | 560 |
| Auth form card | 460 |

### A3. Gutters and rhythm
- Workspace pages: `px-5 py-8` → `md:px-10 md:py-12`.
- Seller page blocks: `px-5` → `md:px-8`; band padding `pt-8 pb-8` → `md:pt-12 md:pb-12` (compact density 6/8); matching neighbouring bands join (D216).
- Phone content clears the bottom tab bar with `pb-24 md:pb-0`; fixed bars use `.safe-bottom` / `env(safe-area-inset-bottom)`.

### A4. Touch and type
- Touch targets ≥ 44px on phones (`min-h-[44px]` primary actions, 40px icon buttons in the editor, 56px accordion headers).
- Type tokens don't change by breakpoint except page titles (`md:text-[2.125rem]`) and hero headlines, which scale with the block's own width using container units (`clamp(…, 9cqw, …)`).

### A5. Overlays
| Overlay | Phone (< 768) | Tablet / desktop (≥ 768) | File |
|---|---|---|---|
| **Dialog** (workspace actions) | Bottom sheet, full width, top inset `max(safe-area, 2.5rem)`, drag handle | **Right side sheet**, `max-w-md` (sm/md) · `max-w-xl` (lg) · `max-w-3xl` (xl) | `components/ui/Dialog.tsx` |
| Dialog `centered` (public pages) | Bottom sheet | Centred from 640px | same |
| **Sheet** `right` | Full screen | Right panel `max-w-md` / `max-w-2xl` (lg) | `components/ui/Sheet.tsx` |
| Sheet `bottom` | Bottom sheet `max-h-[85vh]` or full height | Same | same |
| **Menu / popover** | Floating, auto-placed, 220px min, `min(340px, 100vw−16px)` max | Same | `components/ui/Menu.tsx` |
| **Toast** | Bottom centre, 88px offset (clears tab bar) | Same | `components/ui/AppToaster.tsx` |
| **Visitor overlays** (checkout, booking, subscribe) | Bottom sheet, `max-h-[min(88vh,820px)]` | Bottom-anchored, capped `sm:max-w-lg` (512) | `components/blocks/PageOverlay.tsx` |

Dialog footers: buttons stacked `flex-col-reverse` (primary on top) → `sm:flex-row`.

---

## Part B — Screen types

### B1. Workspace app shell
`components/shell/AppShell.tsx`, `Sidebar.tsx`, `MobileNav.tsx`, `data/navigation.ts`.

```
Phone (<768)                         Tablet/desktop (≥768)
┌──────────────────────┐            ┌────────┬────────────────────────────┐
│ Logo          🔔     │ h-14       │Sidebar │ Page (max 1200, px-10)     │
├──────────────────────┤            │ 248px  │ PageHeader                 │
│ Page (px-5)          │            │ (72px  │ content                    │
│                      │            │ when   │                            │
│                      │            │collapsed)                           │
├──────────────────────┤            │ …      │                            │
│Home│Spaces│Commerce│More│ h-16     │Copilot │                            │
└──────────────────────┘            └────────┴────────────────────────────┘
```
- **Phone:** top bar (logo, notifications) + **bottom tab bar** with 3 primary tabs (`mobilePrimaryNavIds`: Home, Spaces, Commerce) + **More** sheet (account, workspace switcher, appearance, all other nav by group, staff link, help, language, sign out).
- **Tablet and desktop:** sidebar 248px, collapsible to 72px (icons only; Copilot chats shrink to one icon). No separate top bar.
- **Page header** (`PageHeader.tsx`): stacked → `sm:flex-row sm:items-end sm:justify-between`. On phones the last action stretches full width.

### B2. Lists and tables
`components/ui/DataTable.tsx`.
| Phone | Tablet / desktop |
|---|---|
| Card list: primary column as title, trailing values right-aligned, other columns as a meta line; filter and sort controls full width (`h-11`) | `<table>`; columns flagged `hideOnMobile` use `hidden md:table-cell` |

`components/ui/MobileSection.tsx`: on phones long settings/detail pages become an **accordion** (one open at a time, 56px headers); from `md` all sections show inline.

### B3. List + detail
| Pattern | Phone | Tablet | Desktop | Used by |
|---|---|---|---|---|
| **Split view** | Detail as full-height bottom sheet | Same as phone | List + sticky detail pane `lg:grid-cols-[0.9fr_1.1fr]` | Forms responses (`ResponsesInbox.tsx`) |
| **Detail sheet** | Full-screen sheet | Right sheet (`max-w-md`/`2xl`) over the list | Same as tablet | Audience contacts, Orders, Bookings, Deliveries, Partners, most modules |

### B4. Home (Overview)
`pages/Overview.tsx`.
| Region | Phone | Tablet | Desktop |
|---|---|---|---|
| Page card (summary + live preview) | Stacked, preview min 360px | Stacked | Side by side `lg:grid-cols-[0.95fr_1.05fr]`, preview min 440px |
| Stats | 2 columns | 4 (`sm`) | 2 inside the card (`lg`), 4 at `xl` |
| Activity + setup checklist | Stacked | Stacked | `lg:grid-cols-[1fr_360px]` with a left rule |

### B5. Settings and forms
- Settings (`pages/settings/Settings.tsx`): `SubNav` tab row at all widths (scrolls horizontally on phones), `max-w-[1100px]`.
- Label/value detail rows: stacked → `sm:grid-cols-[10rem_1fr]`.
- Save actions live in dialog/sheet footers or inline section buttons; there are **no sticky page-level save bars** (autosaving screens show status instead).

### B6. Staff console
`components/admin/AdminShell.tsx`: sidebar 264px / 72px from `md`. Phones get a top bar with a menu button opening a nav **sheet** (no bottom tabs — staff work is desk-based). Page widths set per page.

### B7. Page editor
Desktop editor ≥ 1024 (panels 280 / 340, rails 56); phone editor below 1024 with bottom tabs and sheets. Full detail: `CANVAS_INTERACTION_SPEC.md`.

### B8. Seller public page
`pages/PublicPage.tsx`, `components/blocks/PageSurface.tsx`, `LayoutRow.tsx`, `utils/pageLayout.ts`.

```
Phone                               Desktop
┌───────────────┐                   ┌──────────────────────────────────────┐
│ site nav pills│ (scrolls)         │        site nav pills (560 col)       │
│ column 560→   │                   │          ┌── column 560 ──┐           │
│ full width    │                   │          │ profile, links │           │
│ px-5          │                   │   ┌──────┴── wide 1120 ───┴──────┐    │
│ pairs stacked │                   │   │ text 3fr │ image 2fr (pair)  │    │
│               │                   │   └──────────────────────────────┘    │
│[Sticky action]│ md:hidden         │ ██████████ full-bleed band ██████████ │
└───────────────┘                   └──────────────────────────────────────┘
```
- **Block widths:** Column (page reading width) · Wide (1120) · Full (edge to edge).
- **Side-by-side pairs:** stacked on phones (gap 32), side by side from `md` with ratios equal / 3:2 / 2:3 (gap 64); "second first on phones" reorders.
- **Sticky action bar:** phones only, bottom, 48px button; hides while the cart is open.
- **Multi-page menu** (`SiteNav.tsx`): one horizontally scrolling pill row at every width.
- **Block reflow:**
| Block | Phone | Tablet | Desktop |
|---|---|---|---|
| Hero split / product | 1 column | 2 columns once each side fits 320–340px (`auto-fit`) | 2 columns |
| Hero cover | min 560px | 620 (`sm`) / 720 (`md`) | 720 |
| Headlines | Scale with block width (`cqw`) | ← | ← |
| Columns | Measured by its own width: stacked under 600 (760 for 3+); 4 → 2×2 under 920 | ← | ← |
| Gallery grid | 2 columns | 2 | 2 |
| Gallery masonry | 2 | 3 (`md`) | 3 |
| Gallery carousel | 78% tiles, snap scroll | ← | ← |
| Product grid block | 2 | 2 | 2 |
| Tabs container | Accordion (default) | Tabs | Tabs |

### B9. Shop and product
`components/storefront/StorefrontView.tsx`, `ProductDetailView.tsx`.
| Region | Phone | Tablet | Desktop |
|---|---|---|---|
| Product grid | 2 columns | 2 or 3 (seller's choice) | Up to 4 (`lg`) |
| Row / price-list styles | 1 column | 2 (row style) | 2 |
| Filters | Stacked, collections as a chip row | Inline row | Collections sidebar `lg:grid-cols-[200px_1fr]` |
| Product detail | Stacked, sticky buy bar | Gallery + details `md:grid-cols-[1.1fr_1fr]` | Same |

### B10. Checkout and visitor pages
- **Checkout** (`CheckoutSheet.tsx` in `PageOverlay`): bottom sheet at every width, capped at 512px from `sm`. Steps cart → details → (delivery) → review, one column; the order summary sits inside the cart and review steps.
- **Booking, subscribe, event tickets:** same overlay pattern.
- **Standalone pages** (order, booking, ticket, download, pay link, subscription, buyer protection): 560px column, one column at all widths, h1 per page.

### B11. Public website
`components/marketing/MarketingLayout.tsx`, `MegaMenu.tsx`, `MobileSiteMenu.tsx`.
| Region | Phone | Tablet | Desktop |
|---|---|---|---|
| Header | Floating pill bar (88px area), menu button → accordion panel `max-h-[calc(100dvh−112px)]` | Same as phone | **Mega menu** (`lg`) |
| Pricing plan cards | 1 column | 2 (`sm`) | 5 (`lg`) |
| Plan comparison | Table, horizontal scroll (`min-w-[820px]`) | Same | Full table |
| Footer links | 2 columns | 3 (`sm`) | Brand + 5 columns (`lg`) |

### B12. Copilot
- `/copilot/chat` (`CopilotWeb.tsx`): phone and tablet show **Chat / Preview tabs**, one pane at a time, auto-switching to Preview when a draft is ready; desktop (`lg`) splits `grid-cols-[1fr_minmax(420px,0.8fr)]`.
- `/d/:id`: sticky top bar `max-w-6xl`, then the real page with seller-page rules (B8).

### B13. Sign in and sign up
`components/auth/AuthLayout.tsx`: form only (card max 460) with a short lime banner below `lg`; from `lg` a two-column split with the lime showcase panel on the right.

---

## Part C — Inconsistencies and open layout decisions

These are design decisions, not testing items. Recommended answers are given; none are built yet.

1. **Detail views on desktop.** Only the Forms inbox uses a split view; Audience, Orders and others open a right sheet over the list. *Recommendation:* keep sheets as the standard (consistent with D272) and treat the Forms inbox as the exception for high-volume triage, or move Orders to the split view too. Needs a decision.
2. **Gallery grid and Product grid block stay 2 columns on desktop.** Fine inside the 560 column, sparse when set to Wide. *Recommendation:* 3 columns from `md` when the block width is Wide or Full.
3. **Checkout stays a 512px bottom sheet on desktop.** *Recommendation:* centred dialog from `lg`, with the order summary beside the steps when the screen allows.
4. **Plan comparison scrolls sideways on phones.** *Recommendation:* a plan picker (one plan at a time, swipeable) under `md`.
5. **Settings tab row** can overflow on phones with many tabs. *Recommendation:* a select or list-then-detail pattern under `md`.
6. **Tablet (768–1023) uses the phone editor** while the app shell is already the desktop sidebar. *Recommendation:* keep — the side panels need 1024+ — but say so in the tablet onboarding.
7. **Seller multi-page menu** is a scrolling pill row everywhere. *Recommendation:* keep for ≤5 pages; a "More" menu beyond that.
8. **No shared tokens for content widths.** 1100 vs 1200 vs `7xl` are written per page. *Recommendation:* add `maxWidth` tokens (`page`, `settings`, `site`, `reading`) to the Tailwind config.

Testing still owed (not design): every screen at 320px and 200% zoom, landscape phones, and real tablets — tracked in `ACCESSIBILITY_REPORT.md` and `CLAUDE_HANDOFF.md` §17.
