# KUBICU — Canvas interaction spec

_Design deliverable of the Master Design Plan (canvas behaviour). Written 30 Oct 2026 from the code at **D345**. Decision: D346._

This describes how the page editor **actually behaves today**: what each interaction does, its states, errors and limits, and the files that own it. Where something is deliberately not built it says so under **Not built**. If this doc and the code disagree, the code wins — update this doc in the same change. Composition rules (hierarchy, presets, spacing tokens) stay in `COMPOSITION_SPEC.md`; block contents stay in `BLOCK_REGISTER.md`.

## Contents
1. Principles
2. Layout and entry
3. Document and state model
4. Saving, offline and conflicts
5. Undo and redo
6. Selecting
7. Adding blocks
8. Moving and reordering
9. Containers
10. Duplicate, delete, lock, hide, rename, group, saved sections
11. Inspector (right panel)
12. Left panel tabs
13. Previewing and viewport
14. Publishing, scheduling, review, unpublishing
15. Version history
16. Assist tools (Voice to content, FAQ assistant, suggestions, AI assistant)
17. Collaboration
18. Keyboard and command menu
19. Phone editor
20. States catalogue (empty, locked, no access, errors)
21. Accessibility rules
22. Motion
23. Not built / open questions

---

## 1. Principles
1. **WYSIWYG on the real renderer.** The artboard renders blocks with the same `BlockRenderer` the live page uses; the editor only adds frames, toolbars and badges.
2. **The draft is never the live page.** Every edit changes the draft; visitors see nothing until Publish (or an approved review / scheduled publish).
3. **Everything is undoable**, so destructive actions use an Undo toast instead of a confirmation — except actions that replace the whole draft (apply template, delete a page), which confirm first.
4. **Explain, don't silently refuse.** Any blocked action (locked block, wrong container, plan limit, missing app) says why and what to do.
5. **One selection, one inspector.** Selecting a block makes the right panel about that block; deselecting returns it to the page.
6. **Keyboard and touch parity.** Every drag has a button alternative; every hover-revealed control is always visible on touch and on keyboard focus.

## 2. Layout and entry
- **Route:** `/app/canvas/:pageId?` → `pages/CanvasPage.tsx`.
- **Who can edit:** roles without `pages.edit` get `CanvasNoAccess.tsx` ("You can't edit {title}", their role, Back to My Spaces / Preview the draft).
- **Breakpoint:** `useMediaQuery('(min-width: 1024px)')` — **≥1024px → `DesktopEditor.tsx`**, below → `MobileEditor.tsx` (§19).
- **Desktop regions:**

```
┌───────────────────────────── Top bar (EditorTopBar) ──────────────────────────────┐
│ Back · Space switcher · title · status · save │ panels · focus · undo/redo │ widths │ search · history · lang · Preview · Publish │
├───────────┬───────────────────────────────────────────────┬──────────────────────┤
│ Left 280px│                Stage (scrolls)                │ Right 340px          │
│ Blocks    │      ┌──── device frame (390–1180px) ────┐     │ Inspector            │
│ Layers    │      │  blocks rendered by BlockRenderer │     │ Page: Theme/Settings │
│ Pages     │      │  + frames, toolbar, badges        │     │ Block: Content/Style │
│ Templates │      └───────────────────────────────────┘     │ Behaviour/Visibility │
│ Check     │                                               │                      │
└───────────┴───────────────────────────────────────────────┴──────────────────────┘
```

- Each side panel collapses to a **56px icon rail** (`PanelRail.tsx`); **focus mode** (⌘\\) hides both. Open/closed state is remembered per device (`kubicu.canvas.panels`, `hooks/useCanvasPanels.ts`).
- **First visit from Copilot:** one-time `CopilotCanvasWelcome.tsx` panel (bottom-right; bottom sheet on phones): what's editable, "Nothing is public yet", and any gaps still to fill. Closes with Escape, ✕ or "Start editing". No other first-run tour exists.

## 3. Document and state model
- **Store:** `hooks/useEditorStore.ts` (`useReducer`), exposed through `contexts/EditorContext.tsx` as `useEditor()` → `{ state, actions, hasUnpublishedChanges }`.
- **Site → pages → blocks.** A space's draft holds `pages: SitePage[]`; `activePageId` picks the page on the artboard. Each page has a **flat** `blocks: Block[]` in order.
- **Containers are flat too:** a child has `parentId` and sits directly after its container (`utils/containers.ts`, `normalizeContainers` repairs invalid arrangements on load).
- **Groups:** contiguous blocks can share a `groupId` (`BlockGroup`: name, locked, hidden) — an editor-only organising tool; groups never affect the live page.
- **Block fields:** `type`, `content` (per type), `layout` (width, spacing, background, side-by-side, phone order), `visibility` (hidden, phases, dates, source rule, A/B), `locked`, `name` (editor label), `a11y` label.
- **Unpublished changes:** `hasUnpublishedChanges` compares draft to published (ignoring editor-only fields such as groups). Per-block "Unpublished" markers are hidden when every block differs (D216).

## 4. Saving, offline and conflicts
| Status (`SaveIndicator.tsx`) | When | What the user can do |
|---|---|---|
| **Saving…** | 650 ms after the last change (`AUTOSAVE_DELAY`) | — |
| **Saved** | Write succeeded | — |
| **Offline** | `navigator.onLine` false | Keep editing; saves resume when back online |
| **Not saved** (`error`) | Storage write threw (full / blocked) | **Retry** (`retrySave`) |
| **Paused** (`conflict`) | Another tab saved a different version | `ConflictBanner.tsx`: **Load other version** or **Keep this version** (force-save) |

- Saves go to localStorage (prototype). Up to **30 versions** kept (`VERSION_LIMIT`).
- Autosave is suspended during a conflict so neither copy is overwritten by accident.

## 5. Undo and redo
- `past` / `future` stacks, **100 steps** (`HISTORY_LIMIT`). Any new edit clears redo.
- **Typing is grouped:** edits with the same key within **900 ms** (`COALESCE_MS`) are one step — keys per field (`content:{id}:{field}`, `meta:…`, `name:{id}`, `theme:{field}`, `page:{field}`) and `reorder`.
- Shortcuts ⌘Z / ⌘⇧Z (⌘Y also redoes); top-bar buttons; disabled when the stack is empty.
- Toasts with **Undo** for: delete, drag/drop moves, block type change, restore version, insert from voice/sections. Undo of a delete restores containers with their children and refocuses the block (§21).
- Undo history is per session; it isn't saved with the draft.

## 6. Selecting
- **Click a block** → selected (`actions.select(id)`). **Click empty stage** or **Escape** → deselect.
- **Hover** (pointer only): dashed outline. **Selected:** solid 2px select-colour ring + name chip (lock icon, group name).
- **Floating toolbar** (`BlockToolbar.tsx`) above the selected block on desktop (below on touch): drag handle · Move up · Move down · (Edit on touch) · Duplicate · Hide/Show · Lock/Unlock · Delete. Move/duplicate/hide/delete are disabled while locked.
- Child blocks inside containers use `ChildFrame.tsx` with the same toolbar plus Move out.
- Selecting from Layers, the Check tab, Publish ("Go to block") or the command menu ("Go to block") scrolls the block into view and selects it.
- **Single selection only.** Multi-select exists only inside Layers "Select" mode for grouping/saving (§10).

## 7. Adding blocks
**Where from:** Blocks tab (`BlockLibrary.tsx`), the container "+" slot (`ContainerAddSlot.tsx`), the command menu, saved sections, section presets, Voice to content, templates.

**Library:** search (matches names, descriptions, categories and everyday words in the screen language — D342/D344), 13 categories, grid or list (remembered), Suggested (with reasons), Favourites and Recently used (per device, `useBlockShelf`), ready-made sections and looks, Your sections. Each block has a **Details** view (preview, what it needs, looks) before Add.

**Placement rule** (`placementFor`, shown live as a caption above the list):
| Selection | New block goes |
|---|---|
| Nothing | End of the page — "Adds to the end of your page" |
| A normal block | Directly below it — "Adds below “X”" |
| A container (or a block inside one) with room, and the type fits | Inside, at the end — "Adds inside “X”" |
| A container that's full or where the type doesn't fit | Below the container, with a toast giving the reason |

After adding, the new block is selected (on phones the block sheet opens).

**Blocked blocks** (`statusOf`):
- **Needs plan** — wrapped in `PlanLock`, opens the upgrade flow.
- **Needs app** — requires a Marketplace extension (e.g. Bookings); add is disabled with "Get {app}".
- **Planned** — none at present (shelf hidden when empty).

## 8. Moving and reordering
| Method | Where | Behaviour |
|---|---|---|
| Drag handle | Block toolbar, Layers row | framer-motion `Reorder` for same-level moves; `useContainerDrop.ts` hit-tests to drop **into** or **out of** containers |
| Move up / down | Toolbar, Layers (always shown on touch) | `moveBlock(id, ±1)`; containers move with their children; children move within siblings |
| Alt + ↑ / ↓ | Focused Layers row | Same as buttons |
| Move into it / Move out | Inspector (`ContainerMembership.tsx`, `ContainerFields.tsx`) | Explicit, non-drag container moves |

**Drop feedback** (`utils/canvasDrop.ts`): valid target → green dashed highlight + "Drop to put X before/at the end of Y"; invalid → red highlight + reason, and nothing changes. Reasons: locked block, type doesn't fit the container (`fitsIn` reason), container full (4).
After a successful drag: toast with Undo; a screen-reader announcement "Moved X up — 3 of 8".
**Library drag (D515):** on desktop, a block can be dragged from the block library onto the framed artboard; a line shows where it lands between top-level blocks, and it's added there and selected. Clicking still adds it in the usual place. D516: hovering a Section, Columns or Tabs (or a block inside one) outlines it with "Drop to add X before Y / at the end of Z", or in red with the reason it can't (doesn't fit, full, locked, containers don't nest); a refused drop changes nothing and says why. Touch screens add by tapping: select where first, and the library says "Adds below…" / "Adds inside…".

## 9. Containers
- **Types:** Section, Columns, Tabs. **One level only** — containers can't go inside containers. **Max 4 children** (`MAX_CHILDREN`).
- **Fit rules** (`data/blockCompatibility.ts`), each with a plain reason:
  - Page-level only: Hero, Announcement, Jump links, Back to top, Members-only, Campaign spotlight, and the containers themselves.
  - Columns also refuses wide or grid blocks (comparison, product grid, menu, listings, gallery, carousel, portfolio, feature grid, team, figures, logo strip, agenda).
  - Tabs refuses spacer and divider.
- **Existing arrangements are never rearranged automatically**; if one breaks a rule the Check tab warns with "Move out".
- **Inside settings:** inner blocks don't add their own width or background — the Style tab says "Set by its container".
- **Unwrap:** "Remove the container, keep its blocks".
- **Phones:** Columns stack (`phoneReverse`: As listed / Reversed; 4 columns become 2×2 on tablets). Tabs become an accordion by default (`phoneStyle`).

## 10. Duplicate, delete, lock, hide, rename, group, saved sections
| Action | Trigger | Behaviour |
|---|---|---|
| **Duplicate** | Toolbar, ⌘D, Layers | Copy placed right after (containers copied with children); new copy selected; one undo step |
| **Delete** | Toolbar, Delete/Backspace (only when the block or its Layers row has focus) | No confirmation; toast with **Undo**; focus moves to the next block (or the empty-page starter). Locked → toast "X is locked — Unlock it to delete" |
| **Lock** | Toolbar, Layers, Inspector | Can't be edited, moved, hidden, deleted or dropped into; inspector fields disabled with an Unlock button |
| **Hide** | Toolbar eye, Layers | Stays in the draft, dimmed to 40% with a "Hidden" badge; not shown on the live page |
| **Rename** | Layers (double-click or F2) | Editor-only label; the live page is unaffected |
| **Group** | Layers → Select → tick 2+ → Group | Contiguous group; rename, lock, hide, move, duplicate, save as section, ungroup, delete (locked members are kept) |
| **Save as section** | Layers Select mode, group menu | `SaveSectionDialog.tsx`: name + block count; available on every page of the workspace (locks and groups stripped) |
| **Insert a saved section** | Library "Your sections", command menu | Copied below the selection; 2+ blocks arrive as a group; one undo step |
| **Change to…** | Inspector header | Curated safe pairs (`utils/blockConvert.ts`, e.g. text↔quote, gallery↔carousel, link↔CTA, steps↔timeline). Keeps id, layout, visibility, schedule and label; toast states exactly what's lost, with Undo |

**Copy and paste (D515):** ⌘C / Ctrl+C copies the selected block (with anything inside it, if it's a container) to a canvas clipboard kept on this device (`utils/blockClipboard.ts`); ⌘V / Ctrl+V pastes fresh copies below the selection on any page or space in the same browser. Ordinary text copying still works when words are selected. D516: the block toolbar has Copy and (once something's copied) Paste buttons, on desktop and touch; paste goes inside the selected container when every pasted block fits and there's room, otherwise below the selection at page level, with Undo. A single block — or a container with its contents — pastes ungrouped; only 2+ page-level blocks form a group.

## 11. Inspector (right panel)
`Inspector.tsx` / `BlockInspector.tsx`. Edits apply to the draft immediately (autosave §4).

**Nothing selected → Page:** "Select a block…" hint, tabs **Theme** (`ThemePanel`: signature/classic themes, mode, colours, readability with suggested fixes, type, buttons, background, saved themes) and **Settings** (`PageSettingsPanel`: name, language, link, domain, layout, sticky phone bar, branding, data saver, Search & sharing, search engines; special-page cards for campaign, event space, fundraiser, pop-up, booking page, members area, co-brand, deal room; AI assistant entry).

**Block selected:** header (icon, name, description, QR shortcut for events/bookings/subscriptions, Change to…, Lock), "In {group}" with Remove from group, then four tabs:
| Tab | Holds |
|---|---|
| **Content** | Type-specific fields (`inspector/*Fields.tsx`), item lists, inline checks with fixes, Look picker, "Goes well after this" (up to 3 suggestions) |
| **Style** | Look → Appearance (align, emphasis, spacing) → On the page (width, background — or "Set by its container") → Advanced (side by side, phone order) → Edit page theme |
| **Behaviour** | Clickable blocks only: open in new tab, count taps, screen-reader label. Others: "nothing to configure" |
| **Visibility** | Campaign phases (min one), Hide, Show between dates (Scheduled / Showing now / Ended), Advanced: visitor-source rule (Everyone / Only / Except, preview as) and A/B test (Pro; version B, goal, minimum visits, Keep A or B) |

Folded sections show a one-line summary of their current settings.

## 12. Left panel tabs
- **Blocks** — §7.
- **Layers** (`LayersList.tsx`) — page-order tree, children indented under containers, groups as collapsible units; per row: drag handle, hide, lock, rename, "needs a fix" dot; Select mode for group / save as section. Empty: "No blocks yet — Blocks you add appear here in page order."
- **Pages** (`PagesPanel.tsx`, main space only; other spaces say they have one page) — Home row + pages; menu: move up/down, duplicate, make home, delete (**confirm**: blocks removed from the draft, old address redirects). Add page (plan limit → upgrade), Add a ready-made site (`SiteKitDialog`). Fields: menu name, address (lowercase, numbers, hyphens; clashes and reserved words refused), show in menu, members only.
- **Templates** (`TemplatesPanel.tsx`) — goal filter, Your templates, premium templates need a licence (`BuyTemplateDialog`). Click → full preview → **confirm** "Replace your draft with this layout?" (snapshot taken first, live page untouched until publish).
- **Check** (`PageCheckPanel.tsx`, `CompositionPanel.tsx`) — tab badge = number of accessibility fixes.

| Level | Meaning | Blocks publish? |
|---|---|---|
| **Error** (publish check) | Broken or missing required content, unreadable contrast | **Yes** |
| **To fix** (accessibility) | WCAG failure | Shown in Publish as an issue |
| **Warning / To improve** | Worth checking | No |
| **Suggestion** (composition) | Layout or copy advice, dismissible per device | No |

Every finding has a reason and a **select block** (or one-tap fix) action. Also: page weight (KB, 3G/4G time, data cost, biggest images, data-saver switch).

## 13. Previewing and viewport
- **Widths** (`Artboard.tsx`): Phone 390 · Wide phone 430 · Tablet 768 · Desktop 1180, in a device frame. No free zoom.
- **Preview** button opens `/p/{handle}?draft=1` in a new tab (adds `&as={source}` when previewing a visitor-source rule). Drafts are never indexed.
- Draft previews never use the seller's data-saver default.

## 14. Publishing, scheduling, review, unpublishing
`PublishDialog.tsx` — phases **review → success | scheduled | failed | sent**.
- **Review:** errors (block; button reads "Fix {n} to publish") and warnings (don't block), each with Go to block, a one-tap theme fix or an upgrade link. "Everything checks out" when clean. Search & sharing opens automatically if the description is empty.
- **Now / Schedule:** scheduled time must be at least 2 minutes ahead; an existing schedule shows with Cancel schedule; a new publish replaces it.
- **Success:** live link + copy, QR code, short link. A **published version** is saved.
- **Failed:** "We couldn't publish" — draft safe, live page unchanged.
- **Approvals on, editor role:** Publish becomes **Send for review** → phase `sent`; top bar shows `ReviewBadge` (In review / Changes requested). See `CORE_USER_FLOWS.md` §5.
- **Top-bar status** (`PageStatusBadge`): Draft · Scheduled · Unpublished changes · Live.
- **Unpublish** lives on My Spaces (`pages/Spaces.tsx`), with a confirmation (shared links stop working; draft, theme, versions and link kept; schedule cancelled). "Put back online" republishes the last live version.

## 15. Version history
`VersionHistory.tsx` (top-bar clock; header icon on phones).
- **Created by:** every publish/schedule (auto), and **Save a snapshot** (name required). Applying a template also snapshots first.
- List: name, relative + exact time, block count, note, **Live** badge on the published one. Empty: "No versions yet".
- **Restore to draft:** immediate, no confirmation, toast with Undo; the live page changes only after publishing.

## 16. Assist tools
- **Voice to content** (`VoiceToContentDialog.tsx`, library card): browser speech-to-text (English, Yorùbá, Hausa, Igbo; quality depends on the browser) or typing → editable transcript → shape (Paragraph / Heading + text / Questions and answers, needs "?") → preview → insert as one undo step. Nothing recorded is kept.
- **FAQ assistant block** (`FaqAssistantFields.tsx`): approved Q&A pairs, copy from FAQ blocks, fallback button. Word-overlap matching; never writes answers; no AI provider called.
- **Goes well after this** and **Suggested** blocks: fixed tables, not AI.
- **Composition checks:** rule-based (`utils/compositionCheck.ts`), including D342's copy and hierarchy checks.
- **AI page assistant** (`AiSuggestEntry.tsx`): opens `/app/assistant`; gated by plan, permission and the `ai_page_setup` kill switch; uses AI credits (`AiUsageMeter.tsx`). Simulated — no provider.

## 17. Collaboration
- **Presence** (`PresenceAvatars.tsx`): other tabs live + simulated teammates; "Also editing: …".
- **Conflicts:** §4.
- **Team review:** §14.
- **Co-brand pages:** `CoBrandSheet.tsx` — both businesses approve before a shared page goes live.
- **Not built:** comments or @mentions on blocks (they exist on contacts, orders, bookings and reviews only); live cursors; real-time co-editing.

## 18. Keyboard and command menu
Canonical list: `ShortcutsDialog.tsx` (⌘/), handled in `hooks/useCanvasShortcuts.ts`. Shortcuts are ignored while typing in a field or while a dialog is open (⌘K still opens when no dialog is open).
| Keys | Action |
|---|---|
| ⌘Z / ⌘⇧Z (⌘Y) | Undo / redo |
| ⌘D | Duplicate selected |
| Delete / Backspace | Delete selected (block or Layers row focused) |
| Esc | Deselect / close panel or dialog |
| Tab / Enter | Move between blocks and controls / select focused block |
| Alt + ↑ / ↓ | Move focused Layers row |
| F2 / double-click | Rename in Layers |
| ⌘K | Command menu |
| ⌘\\ | Focus mode |
| ⌘/ | Shortcuts dialog |

**Command menu** (`CommandPalette.tsx`): Actions (Publish, Preview, Theme, Version history, widths, Undo/Redo, go to Commerce/Audience), Add a block, Your sections, Go to block (when typing). ↑/↓, Enter, Esc. Desktop only.

## 19. Phone editor
`MobileEditor.tsx`, below 1024px.
- **Top bar:** Back, space switcher, title + save status, co-brand chip, Undo/Redo, Preview, Publish/Live, Version history.
- **Artboard** full width, no frame. **Tap a block** → full-height sheet with its inspector (tabs as desktop) and **Done**. Toolbar sits below the block, 40px targets.
- **Floating "Add block"** button above the tab bar (respects the safe area) → library sheet.
- **Bottom tabs:** Blocks · Design (theme) · Layers · Pages · Settings. Tab names truncate rather than wrap.
- **Settings sheet:** status, review badge, presence, **Editor language** ("Changes the editor only, not your page"), page settings, AI assistant entry.
- **Reordering:** Up/Down buttons (always visible) in the toolbar and Layers; drag handles also work.
- **Not on phones:** command menu, width switcher, focus mode, Templates tab, Check tab panel (checks still show in Publish and the inspector), keyboard shortcuts.

## 20. States catalogue
| State | What shows |
|---|---|
| Empty page | Artboard starter area with Add block; Layers "No blocks yet" |
| Block with problems | Red/amber dot on the frame and Layers row; checks in the Content tab |
| Hidden block | 40% opacity + "Hidden" badge |
| Scheduled / ended block | Visibility badge Scheduled / Ended; Check warns when ended |
| Locked block | Lock in the name chip; disabled toolbar actions; inspector banner with Unlock |
| Plan-locked feature | `PlanLock` with the plan needed and Upgrade |
| Needs app | Disabled Add with "Get {app}" |
| No edit permission | `CanvasNoAccess` |
| Offline / not saved / conflict | §4 |
| Publish failed | §14 |
| Unknown block type | Renders nothing (no error panel) — see §23 |

## 21. Accessibility rules
- Focus trap in every dialog and sheet (`hooks/useFocusTrap.ts`): focus in, Tab wraps, Escape closes, focus returns to the opener; nested dialogs stack.
- `CanvasAnnouncer.tsx`: moves from any source announced ("Moved X up — 3 of 8"); after delete focus goes to the neighbour or the starter; after undo-restore "X restored" and focus returns to it.
- Delete only acts on the focused/selected block, never on a stray keypress.
- Skip to content link in the editor; hover-only controls also appear on focus; touch targets ≥40px on phones.
- **Known issue:** a selected container's frame is a button containing the inner blocks' buttons; screen readers may announce the nesting awkwardly (`BLOCK_REGISTER.md`). Needs a real screen-reader pass.

## 22. Motion
- Global `MotionConfig reducedMotion="user"`; data saver forces reduced motion.
- Reorder uses framer-motion layout animation (≤250 ms). Toolbar and drop highlights use colour/opacity transitions ≤150 ms. Sheets and dialogs 200–300 ms, ease-out. Conflict banner slides in once.
- No entrance animation on blocks when the page loads in the editor.

## 23. Not built / open questions
Design decisions still open for the canvas (not testing or provider items):
1. **Multi-select on the artboard** (shift-click) — only Layers Select mode exists. Decide whether bulk hide/delete/move on the artboard is needed.
2. **Block render failure** — no error panel; a broken block disappears silently. Recommended: a contained "This block couldn't be shown — Undo / Remove" frame in the editor, and silent omission on the live page.
3. **Comments on blocks** — none in the canvas.
6. **Zoom** — fixed widths only.
7. **Page density switch** and **renaming containers** — still planned from D174.
8. **Phone editor Check tab** — checks surface in Publish and the inspector, but there's no full Check panel on phones.
