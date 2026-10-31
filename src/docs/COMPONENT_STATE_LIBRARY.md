# KUBICU — Component state library

_Design deliverable 8 of the Master Design Plan (§4.3 component-state requirement). Written 30 Oct 2026 from the code at **D347**. Decision: D348._

A written reference for every shared component: its variants, the states it supports, how each state looks and is announced, and when to use it. The **live** version is the staff console's design system page, `/admin/design-system` (`pages/admin/AdminDesignSystem.tsx` → `components/design-system/ControlGallery.tsx`, `DataGallery.tsx`, `FeedbackGallery.tsx`, plus `Foundations.tsx`, `ColorTokens.tsx`, `AccessibilityRules.tsx`). If this doc and the code disagree, the code wins — update this doc in the same change.

---

## 1. Shared state rules

Every interactive component follows these. A new component isn't finished until it covers each row that applies.

| State | How it looks | How it's announced / behaves |
|---|---|---|
| **Default** | Tokens only (`bg-raised`, `border-line`, `text-fg`) | — |
| **Hover** (pointer only) | One step darker/lighter (`action-hover`, `bg-sunken`). **Never on static containers.** | — |
| **Focus-visible** | `ring-2 ring-focus ring-offset-2` (fields: `ring-action/25` + border) | Visible on keyboard focus only; never removed |
| **Active / pressed** | `active:scale-[0.98]` (buttons), `action-pressed` | Toggle buttons set `aria-pressed` |
| **Selected / checked** | `bg-action-soft` / `border-action` / check icon | `aria-selected`, `aria-checked`, `aria-current` |
| **Disabled** | `opacity-45`–`50`, no pointer events | Native `disabled`; give the reason nearby when it isn't obvious |
| **Loading** | Spinner in place of the icon, label kept; lists use `Skeleton` rows | `aria-busy="true"`; never shorter-lived than ~300 ms flicker; never longer than the content it covers |
| **Error / invalid** | `border-danger`, message below in `text-danger` | `aria-invalid="true"`, `aria-describedby` → `{id}-error`; message `role="alert"` |
| **Empty** | `EmptyState`: icon chip, title, one sentence, one action | Say what will appear and how to add it |
| **Read-only / locked** | Muted, lock icon; plan locks use `PlanLock` | Explain who can change it or which plan unlocks it |
| **Reduced motion** | Transitions drop to opacity only | Global `MotionConfig reducedMotion="user"` + `data-motion=reduce` |

**Sizes:** touch targets ≥ 44px on phones (icon buttons get an invisible 44px hit area). **Motion:** ≤ 160 ms for press feedback, ≤ 250 ms for menus, ≤ 300 ms for sheets, ease-out `cubic-bezier(0.23,1,0.32,1)`, no `transition-all`.

## 2. Colour tokens used by states
From `tailwind.config.js` → CSS variables in `index.css`, re-painted per visual direction (`darkStudio`, `inkCobalt`, `nightMarket`, `kubicuBold`):
- Surfaces: `canvas`, `raised`, `sunken`, `overlay`, `inverse`, `stage`, `field`. Lines: `line`, `line-strong`.
- Text: `fg`, `fg-muted`, `fg-subtle`, `fg-inverse`.
- Action: `action`, `action-hover`, `action-pressed`, `action-fg`, `action-soft`. Accent: `accent`, `accent-soft`. Selection: `select`, `select-fg`. Focus: `focus`.
- Status: `success` / `success-soft`, `warning` / `warning-soft`, `danger` / `danger-soft`, `info` / `info-soft`.
- Radius `sm 6 · md 10 · lg 16`; shadows `1–3`.
- **Open:** soft status colours haven't had contrast measured in every direction (`ACCESSIBILITY_REPORT.md`).

---

## 3. Actions

### Button — `components/ui/Button.tsx`
| Prop | Values |
|---|---|
| `variant` | `primary` · `secondary` · `tertiary` · `destructive` · `ai` · `brand` |
| `size` | `sm` (h-8) · `md` (h-10) · `lg` (h-12) |
| `loading` | spinner + `aria-busy` |
| `disabled` | `opacity-45`, no pointer events |

- **Use:** one `primary` per view region; `secondary` for the alternatives; `tertiary` for low-emphasis inline actions; `destructive` only for irreversible deletion (pair with confirmation or Undo).
- **Reserved:** `ai` (the only gradient in the app, AI surfaces only) and `brand` (public website only).
- On phones the last page-header action stretches full width (`max-sm:`), min 44px.

### IconButton — `components/ui/IconButton.tsx`
`variant`: `ghost` · `outline` · `solid`; `size`: `sm` · `md` · `lg`; `active` → `aria-pressed` + `bg-action-soft`. **`label` is required** (becomes `aria-label` and `title`). Use for toolbars and row actions; never an icon-only button without a label.

### UpgradeButton / PlanLock — `components/ui/PlanLock.tsx`
`kind`: `plan` (lock icon, accent — "Needs Creator") · `planned` (clock icon, muted — "Coming"). An inline label, not a gate: the feature's own button opens the upgrade flow (`CORE_USER_FLOWS.md` §4). Nothing should currently use `planned` for a feature that's been built.

---

## 4. Inputs

### Field + TextInput / TextArea / SelectInput — `Field.tsx`, `TextInput.tsx`, `TextArea.tsx`, `SelectInput.tsx`
Shared `fieldControlClass`: h-10, `border-line-strong bg-field rounded-md`, `focus:ring-action/25`, `aria-[invalid=true]:border-danger`.
| State | Behaviour |
|---|---|
| Label | Always visible above; required fields marked and announced |
| Hint | Below, `{id}-hint`, linked by `aria-describedby` |
| Error | Replaces nothing — appears under the hint, `{id}-error`, `role="alert"`, `aria-invalid` |
| Disabled / read-only | Muted, explain why |
| Character count | Under the field where limits exist (Search & sharing, button labels) |

These components translate the English label, hint and placeholder themselves — pass English.

### Switch — `Switch.tsx`
`role="switch"`, `aria-checked`, 44×44 invisible tap area (`before:`), `disabled:opacity-50`. Use for settings that take effect immediately. Not for choices inside a form that's submitted later (use a checkbox).

### Segmented — `Segmented.tsx`
`role="radiogroup"` / `radio`, arrow keys cycle, `size` `sm`·`md`, `iconOnly` (still labelled). Use for 2–4 mutually exclusive, short options (Phone / Desktop, grid / list).

### Other inputs (feature-level, no shared primitive)
| Need | Where it's done today |
|---|---|
| Date and time | `DateTimeInput.tsx`, `TimezoneSelect.tsx` |
| Slider | `RangeInput.tsx` |
| Checkbox / radio | Native inputs styled per feature; DataTable has its own tri-state checkbox |
| Search box | DataTable filter box; block library and help search |
| File / image upload | Per feature: `kyc/DocUpload.tsx`, `commerce/ProductImagesField.tsx`, media pickers |
| Repeating items | `ItemListEditor` (heading, rows, move, remove, add, limit message) |
| Language | `LanguagePicker.tsx` (below) |

---

## 5. Navigation

### Tabs — `Tabs.tsx`
`role="tablist"`/`tab`, roving tabindex, ←/→/Home/End; selected `border-action text-fg`; `dense` variant; optional count pill. Use for switching views of the same object. Tab labels must not wrap — they truncate.

### SubNav (settings)
Horizontal nav row at all widths (scrolls on phones — see `RESPONSIVE_LAYOUT_SET.md` C5).

### Menu — `Menu.tsx`
Fixed floating panel, auto-flips (D250), min 220 / max `min(340px, 100vw−16px)`. `role="menu"`/`menuitem`, ↑/↓/Home/End/Tab/Escape. Items: `selected` (check), `disabled` (with `reason` subtext), `destructive`. Use for row actions and pickers with ≤ ~12 options.

### LanguagePicker — `LanguagePicker.tsx`
Built on `Menu`. Variants: `row` (sidebar; badge only when collapsed) · `pill` (signed-out pages) · `compact` (editor top bar, language code) · `field` (Account → Preferences, includes English UK, French "Coming later") · `site` (website header). Each language shows its native name and a "Draft" mark; the current one is checked. Seller pages use the themed `VisitorLanguageMenu` instead.

### Tooltip — `Tooltip.tsx`
Shows on hover **and** focus-within, `role="tooltip"`, adds `aria-describedby` to its child. Only for supplementary hints — never the only place important information lives (touch has no hover).

---

## 6. Overlays

### Dialog — `Dialog.tsx`
| Prop | Values |
|---|---|
| `size` | `sm` · `md` (max-w-md) · `lg` (max-w-xl) · `xl` (max-w-3xl) |
| `centered` | Public pages only (D272) |
| `dismissible` | `false` blocks Escape/backdrop (use while something is saving) |
| `onTop` | Stacks above another dialog |

- Workspace: right side sheet ≥ 768, bottom sheet on phones. `role="dialog"`, `aria-modal`, `aria-labelledby`; focus trap; focus returns to the opener.
- Footer: primary last on desktop, first on phones (`flex-col-reverse` → `sm:flex-row`).
- **Confirmations** use Dialog (there's no separate ConfirmDialog): title states the consequence, body says what's kept, destructive button names the action ("Delete page"), Cancel is the safe default focus.

### Sheet — `Sheet.tsx`
`side` `right`·`bottom`, `height` `auto`·`full`, `size` `md`·`lg`. Right sheets go full screen on phones. Use for detail views (contact, order) and phone pickers.

### Toast — `AppToaster.tsx` (sonner)
Bottom centre, 88px offset. Use for confirmation of something that already happened, with **Undo** when reversible. Never for errors that need action (use InlineAlert), never as the only record of something important.

---

## 7. Feedback and status

### InlineAlert — `InlineAlert.tsx`
`tone`: `info` · `success` · `warning` · `danger` (soft background). `danger` → `role="alert"`, others `role="status"`. Use for page- or section-level messages that stay until resolved.

### PrototypeNote — `components/ui/PrototypeNote.tsx`
Dashed-edge note marking simulated behaviour. **Prototype only** — see `NOT_FOR_PRODUCTION.md`.

### Badge — `Badge.tsx`
`tone`: `neutral` · `action` · `accent` · `success` · `warning` · `danger` · `info`; optional `dot` / `icon`. Wrapped by status badges per domain: `commerce/StatusBadges.tsx`, `billing/InvoiceStatusBadge.tsx`, `subscriptions/SubStatusBadge.tsx`, `canvas/PageStatusBadge.tsx`. Status must also be readable from the text (never colour alone).

### EmptyState — `EmptyState.tsx`
Icon chip, title, one sentence, optional action; `framed` for use inside a card. Copy rule: what will appear here + how to get it ("No orders yet — Share your page to get your first one").

### Skeleton — `Skeleton.tsx`
`animate-pulse bg-sunken rounded-md`, `aria-hidden`. Mirror the final layout's shape. Pulse stops under reduced motion.

### Progress / steps (feature-level)
`kyc/KycStepper.tsx`, Copilot draft steps, checkout step header, domain progress. No shared Stepper — don't add "Step 1 of 6" text beside a stepper that already shows it.

---

## 8. Data display

### DataTable — `DataTable.tsx`
Generic `<T extends { id }>`. Filter box, sortable columns (`aria-sort`), bulk select (tri-state `aria-checked="mixed"`), `loading` → Skeleton rows, empty → `EmptyState`, card list under 768 (`hideOnMobile` columns hidden). Use for any list a user scans, sorts or acts on in bulk.

### MobileSection — `MobileSection.tsx`
Accordion only on phones (`aria-expanded`/`aria-controls`, 56px headers, one open); `invalid` turns the header red so errors inside a closed section are still visible.

### Layout primitives — `components/ui/layout/*`
`Card` ("the one bordered container": `rounded-lg border-line bg-raised`, `body` padded/flush, `emphasis` primary/default), `Section`, `ListRow`, `Stat`, `DetailList`, `CardLink`, `AsideNote`. Reach for whitespace and `Section` headings before a `Card`.

### Avatars (feature-level)
`account/AccountAvatar.tsx`, `PartnerAvatar.tsx`, `canvas/PresenceAvatars.tsx` — initials on a token colour when there's no photo.

---

## 9. Consolidation gaps (design decisions)

These patterns are rebuilt per feature. Recommended: promote each to `components/ui/` with the states above.
1. **Checkbox / Radio** — a shared, labelled, 44px-target control.
2. **FileUpload / ImageUpload** — one drop zone with progress, size/type errors, replace and remove.
3. **SearchInput** — clear button, results count announced.
4. **Stepper** — shared step header for KYC, checkout, Copilot and domain setup.
5. **Avatar** — one component with image, initials and presence ring.
6. **ConfirmDialog** — a thin wrapper over Dialog enforcing the confirmation copy rules in §6.
7. **StatusBadge** — one map from domain status → Badge tone + label, replacing the four wrappers.
8. **Pagination** — none exists; long lists scroll. Decide before real data volumes arrive.
