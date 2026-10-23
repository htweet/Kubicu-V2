# KUBICU — Accessibility report (Batch 7, D76)

_Last updated: 22 Oct 2026. Standard: WCAG 2.1 AA, plus 2.5.7 Dragging movements and 2.5.8 Target size (minimum) from WCAG 2.2._

## 1. Summary

| | |
|---|---|
| Scope | Public pages, storefront, DealRooms, campaigns, cart & checkout, booking, subscriptions, order / ticket / booking / download pages, door check-in, the canvas, every workspace screen, Super admin |
| Method | Code review against WCAG 2.1 AA, one area at a time, then fixes in shared parts first |
| Automated scanners (axe, Lighthouse) | **Not run** — the prototype was audited by reading code only |
| Real assistive technology | **Not tested** — see the manual checklist in section 6 |
| Findings | 27 total: 21 fixed, 6 open (see section 5) |

**This report does not claim WCAG conformance.** It records what was checked, what was fixed and what still needs a real device and a screen reader before launch.

### Already in good shape before Batch 7
- Dialog, tab, menu, segmented and switch roles with arrow-key support.
- Visible focus rings everywhere (`:focus-visible` outline plus component rings).
- Every icon-only button has a label.
- Charts are hidden from screen readers and paired with a written summary.
- Keyboard alternative to dragging blocks (Alt+↑/↓ and toolbar buttons).
- Command palette uses the combobox pattern correctly.
- Text fields wire hints and errors with `aria-describedby` and `aria-invalid`.
- Countdown digits are hidden from screen readers; a static sentence describes the time left.

## 2. Findings and fixes by area

Severity: **Critical** blocks a task · **Serious** makes a task very hard · **Moderate** is confusing or slow · **Minor** is polish.

### 2.1 Shared parts

| # | Finding | WCAG | Severity | Status | Fix |
|---|---|---|---|---|---|
| A1 | Tab could leave open dialogs and sheets into the page behind | 2.1.2, 2.4.3 | Serious | Fixed | `useFocusTrap` in Dialog, Sheet and PageOverlay: focus moves in, Tab wraps, Escape closes, focus returns to the opener. Only the top-most surface reacts. |
| A2 | Sheets didn't return focus to the button that opened them | 2.4.3 | Serious | Fixed | Same hook |
| A3 | Most animations ignored "reduce motion" (only 3 screens checked it) | 2.3.3 (AAA, adopted), 2.2.2 | Moderate | Fixed | `MotionConfig reducedMotion="user"` wraps the app; CSS rule already cut transitions |
| A4 | Dropdown errors and hints weren't linked to the dropdown | 1.3.1, 3.3.1 | Moderate | Fixed | SelectInput sets `aria-invalid` and `aria-describedby` |
| A5 | Tooltips weren't announced on focus | 1.3.1, 4.1.2 | Moderate | Fixed | Trigger gets `aria-describedby` pointing at the tip |
| A6 | No "Skip to content" in the app, canvas, Super admin or public pages with a menu | 2.4.1 | Moderate | Fixed | `SkipLink` + focusable `main` targets |
| A7 | No shared way to announce status changes | 4.1.3 | Moderate | Fixed | `announce()` + `LiveAnnouncer` (polite and assertive regions) |
| A8 | Table checkboxes were 16×16px | 2.5.8 | Moderate | Fixed | 24×24px hit area around the 16px box |
| A9 | Menus lacked Home/End; Tab left the menu open | 2.1.1 | Minor | Fixed | Home/End jump; Tab closes the menu |
| A10 | Tab bars could overflow on phones | 1.4.10 | Moderate | Fixed | Tab bars scroll sideways; Home/End supported |

### 2.2 Public flows

| # | Finding | WCAG | Severity | Status | Fix |
|---|---|---|---|---|---|
| B1 | 10-minute seat hold couldn't be extended | 2.2.1 | Serious | Fixed | "Need more time?" in the last minute adds 10 minutes once, only while seats are still reserved |
| B2 | Seat-hold timer re-announced every second in the last minute | 4.1.3, 2.2.2 | Serious | Fixed | Digits are silent; one assertive warning at one minute; extension announced |
| B3 | A seller's colours could make their live page unreadable | 1.4.3 | Serious | Fixed | `liveReadableTheme` shifts only failing colours to the nearest 4.5:1 shade on live pages; saved theme unchanged; since D108, anything below 3:1 also blocks publishing again |
| B4 | Order, booking, download and subscription pages had no h1 | 1.3.1, 2.4.6 | Moderate | Fixed | `CheckoutHeading level={1}` on standalone pages |
| B5 | No page language on public pages | 3.1.1 | Moderate | Fixed | Page settings → Page language (English default; Pidgin, Yorùbá, Igbo, Hausa, French, Swahili); sets `<html lang>` |
| B6 | Moving between checkout steps left focus behind | 2.4.3 | Moderate | Fixed | Each sheet step's heading takes focus |
| B7 | No way to mark an image as decorative | 1.1.1 | Moderate | Fixed | "Decorative only" switch; publish check asks for a description or the switch |
| B8 | Lead form errors didn't name or focus the field; no autocomplete | 3.3.1, 1.3.5 | Moderate | Fixed | Field marked invalid, linked to the error, focused; name/email/tel autocomplete |
| B9 | Newsletter error not linked to the email field | 3.3.1 | Minor | Fixed | `aria-invalid`, `aria-describedby`, focus |
| B10 | Visitor overlays restored focus but didn't trap Tab | 2.1.2 | Serious | Fixed | PageOverlay uses the shared trap |

### 2.3 Canvas

| # | Finding | WCAG | Severity | Status | Fix |
|---|---|---|---|---|---|
| C1 | Reordering blocks was silent for screen readers | 4.1.3 | Moderate | Fixed | `CanvasAnnouncer` reads "Moved Gallery up — 3 of 8" for Alt+arrows, toolbar buttons and drag |
| C2 | Deleting a block dropped focus to the page body | 2.4.3 | Serious | Fixed | Focus moves to the next block, the previous one, or the empty canvas; Undo focuses the restored block |
| C3 | Delete/Backspace deleted the selected block from any focused button | 2.1.4 | Serious | Fixed | Only when the selected block or its layer row has focus |
| C4 | No list of keyboard shortcuts | 2.1.1 (support) | Minor | Fixed | ⌘/ (Ctrl+/) opens Keyboard shortcuts; no single-character shortcuts exist |
| C5 | Panel-rail counters were 10px and not announced | 1.4.4, 1.3.1 | Minor | Fixed | 11px, included in the button's name ("Layers, 6") |

### 2.4 Workspace app & Super admin

| # | Finding | WCAG | Severity | Status | Fix |
|---|---|---|---|---|---|
| D1 | Analytics and DNS tables had no column scope or caption | 1.3.1 | Moderate | Fixed | `scope="col"` + hidden captions |
| D2 | Usage meters relied on bar colour for "nearly full / full" | 1.4.1 | Moderate | Fixed | Text shows "% used · Nearly full / Full"; meter role with value text |
| D3 | Help was desktop-only | — (parity) | Minor | Fixed | Help in the phone "More" sheet |
| D4 | One hardcoded palette colour (ticket QR placeholder) | — (system) | Minor | Fixed | Neutral overlay instead |

## 3. Contrast check of the four workspace appearances

Spot-calculated for the faintest text token (`text-muted`) and the focus ring:

| Appearance | Faint text on canvas | Focus ring on canvas |
|---|---|---|
| Dark Studio | ≈ 5.6:1 | passes 3:1 |
| Ink & Cobalt | ≈ 4.9:1 | passes 3:1 |
| Ink & Violet | ≈ 4.9:1 | passes 3:1 |
| Navy & Clay | ≈ 4.9:1 | ≈ 3.7:1 |

The AI gradient's lightest stops (orange-700, pink-700) carry white text at ≈ 5.2:1 and ≈ 6.0:1. Soft status fills (warning, success, danger on their tinted backgrounds) were **not** measured — see open item O3.

## 4. Problems that repeated across screens
1. **Overlays built three ways** (Dialog, Sheet, PageOverlay) each handled focus differently → one shared trap.
2. **Motion opt-in per screen** → one app-wide setting.
3. **Errors shown but not linked** → field + error id pattern in shared inputs and public forms.
4. **Status by colour** → badges already carried words; meters now do too.

## 5. Open items

| # | Item | WCAG | Severity | Why open |
|---|---|---|---|---|
| O1 | Drag-reorder in the canvas still uses pointer drag as one option | 2.5.7 | — | Passes: equal keyboard and button alternatives exist. Recorded for clarity. |
| O2 | Video blocks have no captions control | 1.2.2 | Moderate | Captions come from YouTube; KUBICU can't add them. Guidance should tell sellers to upload captioned videos. |
| O3 | Soft status fills not measured in every appearance | 1.4.3 | Moderate | Needs an automated contrast pass in a browser |
| O4 | Screens marked "not visually reviewed" (Products, Orders, Schedule, Automations, IntentFlow, Domains & QR, Media, Templates → Browse, Super admin) were checked in code for headings, labels and tables, not looked at at 320px and 200% zoom | 1.4.10, 1.4.4 | Moderate | Needs a browser |
| O5 | Camera check-in relies on sight of the screen; result card is announced but not yet tested with VoiceOver/TalkBack | 4.1.3 | Moderate | Needs a real phone |
| O6 | Required fields are shown by marking optional ones ("Optional"); no `aria-required` on required ones | 3.3.2 | Minor | Acceptable pattern; revisit with screen-reader testing |

## 6. Manual test checklist (do these before launch)

**Priority 1 — keyboard only**
- [ ] Buy a ticket from a public page using only the keyboard; let the hold reach one minute and choose "Keep my seats".
- [ ] Book a service and subscribe to a plan with the keyboard; confirm focus lands on each step's heading.
- [ ] In the canvas, select, move (Alt+↑/↓), delete and undo a block without a mouse; confirm focus never lands on the page body.
- [ ] Open and close every sheet and dialog in Commerce with Escape; focus returns to the opener.

**Priority 2 — screen readers (VoiceOver on iPhone and Mac, TalkBack on Android)**
- [ ] Public page: language, headings, image descriptions, decorative images skipped.
- [ ] Checkout: step headings, payment results, "those tickets just sold out", seat-hold warning read once.
- [ ] Canvas: move and delete announcements; layer rows read name and state.
- [ ] Check-in: each result card (checked in, already used, refunded, wrong event, unknown) is read out.

**Priority 3 — zoom, reflow and motion**
- [ ] Every app screen at 320px wide and at 200% zoom: no sideways scrolling outside tables, no wrapped buttons.
- [ ] Turn on "Reduce motion": sheets and dialogs fade instead of sliding; nothing bounces.
- [ ] A theme with deliberately poor colours: the live page is still readable; the canvas explains what was adjusted.

**Priority 4 — automated**
- [ ] Run axe-core on the public page, checkout, the canvas and three workspace screens in each appearance; log results against this report.
