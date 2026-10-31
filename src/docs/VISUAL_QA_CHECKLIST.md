# KUBICU — Visual QA checklist

_Design deliverable 11 of the Master Design Plan. Written 30 Oct 2026 at **D349**. Decision: D350._

The checklist a reviewer runs on **every screen** before it's called done, and on the whole product before a release. It replaces the short checklist in `CLAUDE_HANDOFF.md` §20. Each check says what to look for and how to test it. The rules behind the checks are in `COMPONENT_STATE_LIBRARY.md` (states), `RESPONSIVE_LAYOUT_SET.md` (widths), `CANVAS_INTERACTION_SPEC.md` (editor) and the Design Plan §3 (art direction).

**How to use it**
- Copy §9 (the per-screen record) for each screen you review. Mark each check **Pass**, **Fail** (with a note and screenshot) or **N/A**.
- A screen passes when there's no Fail in §1–§7. §8 is for releases.
- Test in at least: Chrome desktop 1440px, Chrome phone emulation 390px and 320px, Safari iOS, Chrome on a low-end Android, and both app appearances (`darkStudio`, `inkCobalt`). Public pages: test at least three signature themes, one dark.
- Write down what you couldn't test. An untested check is not a Pass.

---

## 1. Purpose and hierarchy
- [ ] **One thing wins.** You can name what the user came for, and it's the largest, highest-contrast or most prominent thing on screen.
- [ ] **Every element earns its place.** Nothing you can't explain the purpose of; no filler shapes, blobs or decorative gradients.
- [ ] **Grouping by space first.** Whitespace, alignment and headings group content; bordered cards only where the content is a genuine object. No wall of identical rounded boxes.
- [ ] **Form matches content.** Sequences use steps or timelines, comparisons use tables, operational data uses lists or tables, unequal importance uses asymmetric layouts.
- [ ] **Progressive disclosure.** Secondary detail is one interaction away (panel, expandable row, second page), not crammed above the fold.
- [ ] **One primary action per region.** Other actions are secondary or tertiary.

## 2. Layout and responsive
- [ ] **Desktop uses its width** (1280–1440): not a stacked phone layout in a narrow column; content max widths match `RESPONSIVE_LAYOUT_SET.md` A2.
- [ ] **390px:** one column, nothing clipped, overlapping or scrolling sideways (except intentional carousels and the plan comparison table).
- [ ] **320px:** still usable; long words and amounts wrap or truncate cleanly.
- [ ] **Breakpoint switches** happen at 768 and 1024 as specified; no awkward in-between state at 767/769 or 1023/1025.
- [ ] **Tablet (768–1023)** checked on its own terms.
- [ ] **Sibling cards share baselines** — headings, body and footers line up (shared grid, footers pushed down).
- [ ] **No label, button, tab or nav item wraps to two lines** — check in English **and** the longest language (usually Hausa or Igbo).
- [ ] **Fixed bars** (bottom tabs, sticky action bar, sticky buy bar) don't cover content or each other; safe areas respected on notched phones.
- [ ] **Toasts** don't cover primary actions or the bottom tab bar.
- [ ] **Landscape phone** doesn't break sheets or the editor.

## 3. Visual system
- [ ] **Tokens only** — no raw palette classes (`slate-500`, `blue-600`), no one-off hex values in app UI.
- [ ] **No gradients** outside the reserved `.ai-*` and brand classes.
- [ ] **Type scale** uses the tokens (display, title, heading, body, label, caption, meta); no ad-hoc sizes; line length ≤ ~75 characters for body text.
- [ ] **Radius and shadow** from the scale (6 / 10 / 16; shadow 1–3); no top-accent borders on rounded cards.
- [ ] **Icons** from lucide-react, consistent stroke and size per context; no emojis as icons; not every label decorated with an icon.
- [ ] **No reflex patterns** without a reason: overline labels, pill badge above the hero, "01/02/03" numbering, checkmark bullet rows, identical stat strips, soft glows.
- [ ] **Images** have the right aspect ratio, aren't stretched, have alt text (or are marked decorative), and sample people and businesses are fictional and labelled.
- [ ] **Both appearances** (`darkStudio`, `inkCobalt`) checked; public pages checked in light and dark signature themes.

## 4. Text and content
- [ ] **Contrast:** body text ≥ 4.5:1, large text and UI parts ≥ 3:1, against the **actual** background (including soft status fills, images and glass). Never light text on a light fill.
- [ ] **Plain language:** sentence case, short sentences, no jargon, verbs on buttons ("Publish page", not "Submit"); no "Click here" / "Learn more".
- [ ] **Honest:** simulated or unavailable things are labelled; nothing implies a real provider, a real customer or a real number that isn't.
- [ ] **Numbers and money:** ₦ formatting consistent, thousands separators, dates in the user's format; counts phrased "Label: number" so they translate.
- [ ] **Empty, error and success copy** says what happened and what to do next.
- [ ] **Translated:** switch to each language — no English left that should be translated; placeholders filled; nothing truncated mid-word that matters. English-on-purpose items (legal, help articles, customer messages) show their notice.

## 5. States
For every interactive part on the screen, see `COMPONENT_STATE_LIBRARY.md` §1.
- [ ] **Hover** only on interactive things; none on static containers.
- [ ] **Focus-visible** ring on every focusable element, never clipped by `overflow-hidden`.
- [ ] **Pressed / selected / checked** visible and announced.
- [ ] **Disabled** looks disabled and says why when it isn't obvious.
- [ ] **Loading** shows a spinner or skeleton shaped like the result; no elaborate loader over content that's already there.
- [ ] **Errors** sit next to the field, are announced, and keep what the user typed.
- [ ] **Empty** state exists for every list, table, inbox and chart.
- [ ] **Locked** (plan, role, kill switch) shows which plan or who can unlock it.
- [ ] **Offline / failed save** handled where data is edited (see the canvas save statuses).
- [ ] **Long content:** very long names, 100+ items, huge amounts and missing images all handled.

## 6. Motion
- [ ] Animations only where they explain, confirm or soften a change; no entrance animation on every section.
- [ ] **Durations:** press 100–160 ms, tooltips 125–200, menus 150–250, sheets and dialogs 200–300; no single element over 300 ms.
- [ ] **Easing:** ease-out for enter and exit (`cubic-bezier(0.23,1,0.32,1)`); no `ease-in`; no `transition-all`.
- [ ] Entering elements start at scale 0.96 + opacity 0, never scale 0; exits mirror entrances.
- [ ] Lists stagger 30–60 ms per item, last item not late.
- [ ] **Reduced motion** (OS setting and Account → Preferences) removes movement; data saver does too.
- [ ] Nothing animates on keyboard-triggered actions.

## 7. Accessibility
- [ ] **Keyboard only:** every action reachable in a sensible order; no trap except inside open dialogs; Escape closes; focus returns to the opener.
- [ ] **Screen reader** (VoiceOver iOS + TalkBack Android, NVDA on desktop for the app): landmarks, one h1, heading order, labelled controls, status changes announced, required fields announced.
- [ ] **Zoom 200%** and **text size large** (`data-text-size=large`): no loss of content or function.
- [ ] **Touch targets** ≥ 44px on phones (40px allowed for editor toolbars).
- [ ] **Colour isn't the only signal** (status, errors, charts).
- [ ] **Language attribute** follows the chosen language; tone-marked text (Yorùbá, Igbo, Hausa hooked letters) renders with the right font and doesn't clip.
- [ ] **Automated scan** (axe or Lighthouse) shows no serious or critical issues.

## 8. Release-level checks
- [ ] Every screen in `SCREEN_INVENTORY.md` has a §9 record with no Fail.
- [ ] The 20 journeys in `CORE_USER_FLOWS.md` walked end to end on phone and desktop, including their failure branches.
- [ ] All 32 templates and every signature theme opened on phone and desktop.
- [ ] Glass and blur effects checked on a low-end Android; data saver lightens them.
- [ ] Theme readability numbers spot-checked on screen against the spec sheet.
- [ ] Performance: public page loads usable on throttled 3G; page weight shown in the Check tab is honest.
- [ ] `ACCESSIBILITY_REPORT.md` §6 manual checklist completed.
- [ ] `NOT_FOR_PRODUCTION.md` §10 release gate passed.

## 9. Per-screen record (copy for each screen)

```
Screen:                    Route / file:
Reviewer:                  Date:            Build / decision: D___
Devices tested:            Appearances / themes:      Languages:

§1 Purpose & hierarchy   Pass / Fail / N/A   Notes:
§2 Layout & responsive   Pass / Fail / N/A   Notes:
§3 Visual system         Pass / Fail / N/A   Notes:
§4 Text & content        Pass / Fail / N/A   Notes:
§5 States                Pass / Fail / N/A   Notes:
§6 Motion                Pass / Fail / N/A   Notes:
§7 Accessibility         Pass / Fail / N/A   Notes:

Not tested (and why):
Screenshots:
Result:  Pass / Fail
```
