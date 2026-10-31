# KUBICU — UX/UI master spec

_The UX/UI follow-on document the Master Blueprint (§28) asks for. Written 30 Oct 2026 at **D350**. Decision: D351._

One place that states how KUBICU should look, read and behave, and points to the detailed spec for each part. It's a rollup: when a detail here and a detailed spec disagree, the detailed spec wins; when a spec and the code disagree, the code wins and the spec is updated in the same change. Decisions are in `DESIGN_DECISION_REGISTER.md`; what must not ship is in `NOT_FOR_PRODUCTION.md`.

| Part | Detailed spec |
|---|---|
| Journeys | `CORE_USER_FLOWS.md` |
| Page editor | `CANVAS_INTERACTION_SPEC.md`, `COMPOSITION_SPEC.md`, `BLOCK_REGISTER.md` |
| Layout on each device | `RESPONSIVE_LAYOUT_SET.md` |
| Components and states | `COMPONENT_STATE_LIBRARY.md` (live at `/admin/design-system`) |
| Review | `VISUAL_QA_CHECKLIST.md` |
| Themes and templates | `THEME_REGISTER.md`, `TEMPLATE_REGISTER.md` |
| Screens | `SCREEN_INVENTORY.md`, `DESIGN_TRACEABILITY_MATRIX.md` |
| Plans | `PLAN_MATRIX.md` |
| Copilot and AI | `COPILOT_SPEC.md`, `AI_ASSISTANT_INTEGRATION.md` |
| Accessibility | `ACCESSIBILITY_REPORT.md` |
| Website | `PUBLIC_SITE_REGISTER.md` |

---

## 1. Product in one paragraph
KUBICU lets a Nigerian business or creator build a page that sells — from a link-in-bio to a small multi-page site — on a phone, in their language, and then run what follows: orders, bookings, tickets, deliveries, customers, automations and partners. It has four surfaces: the **public website** (marketing, pricing, templates, Marketplace, Copilot), the **workspace app** (editor and business tools), **visitor pages** (the seller's page and its checkout, order, ticket and download pages) and the **staff console** (operations, trust and safety).

## 2. Design principles
1. **Honest by default.** Never imply a feature, number, review or provider that isn't real. Simulated and unavailable things are labelled. Counts and money are exact.
2. **Phone first, desktop proud.** Every flow works one-handed at 390px on a low-end Android over 3G; desktop layouts use their width rather than stretching a phone stack.
3. **One thing wins.** Each screen has a clear primary purpose and action; everything else is quieter or one step away.
4. **Calm surfaces.** Whitespace, type and alignment do the grouping. Cards only for real objects. No decorative gradients, blobs or glows.
5. **Undo over confirm.** Reversible actions happen immediately with Undo; only irreversible or wide-reaching ones ask first.
6. **Local by design.** Naira, bank transfer, WhatsApp, delivery codes, data cost and Nigerian languages are first-class, without visual stereotypes.
7. **Accessible is the baseline.** WCAG 2.2 AA, keyboard and screen reader complete, reduced motion and text size respected.
8. **Sellers own their words.** What a seller types appears exactly as typed; the product translates its own interface, never their content.

## 3. Information architecture

### 3.1 Workspace navigation (`data/navigation.ts`)
| Group | Screens |
|---|---|
| **Studio** | Overview, My Spaces, Media, Templates |
| **Business** | Commerce, Bookings*, Quotes & jobs*, Deliveries*, Voice-to-Store*, Proof of work*, Analytics, Collaborations* |
| **Customers** | Audience, WhatsApp*, Opportunities*, Forms*, Automations* |
| **Growth** | Short links, IntentFlow*, Domains*, QR codes*, Print kit*, Trust Passport*, Business Coach* |
| **Workspace** | Extensions, Settings |
| Below the menu | Copilot chats (Pinned, Recent, See all chats) |

\* Shown only when its Marketplace app is installed and not paused (`appId`). The editor isn't a menu item — it opens from Overview or My Spaces. Groups open and close like an accordion (D117).

Phones: bottom tabs Overview · My Spaces · Commerce · More (everything else, account, workspace, appearance, help, language, sign out).

### 3.2 Visitor pages
`/p/{handle}` and its pages; shop, product, checkout (overlay), and standalone pages under `/p/{handle}/…` for order, booking, ticket, download, pay link, subscription and buyer protection. Short links `/p/{handle}/s/{slug}`.

### 3.3 Public website
Home, Pricing, Features, Solutions, Templates (collections, themes), Marketplace, Creators, Short Links, Audience, Copilot, AI, Developers, Help, Trust, About, Contact, Roadmap, Legal. Mega menu from 1024px.

### 3.4 Staff console
`/admin/*`: operations overview, tenants and users, plans and billing, feature flags and kill switches, modules and Marketplace, payments, AI, trust and moderation, support, translation review, design system, health. Staff sign-in with approval by a second lead for sensitive actions.

## 4. Visual language

### 4.1 Directions
| Direction | Where |
|---|---|
| `darkStudio` | Default workspace appearance |
| `inkCobalt` | Light workspace appearance |
| `nightMarket` / `kubicuBold` | Public website |
| Signature + classic themes (24 + more) | Sellers' pages, chosen per page |

### 4.2 Tokens
Semantic colours only (surfaces, lines, text, action, accent, select, focus, four status pairs), type scale display → meta, radius 6/10/16, shadows 1–3. Full list: `COMPONENT_STATE_LIBRARY.md` §2. Gradients only on reserved AI and brand surfaces.

### 4.3 Typography
Inter for the product UI. Seller themes pair display faces (Fraunces, Instrument Serif, Newsreader, Archivo, Lora, Cormorant Garamond, Bricolage Grotesque) with readable body faces. Tone-marked Nigerian languages must render in every face used.

### 4.4 Imagery and icons
lucide-react icons, one stroke weight. Photography of real-feeling, fictional, clearly labelled businesses. No emojis as icons; no abstract filler shapes.

### 4.5 Motion
framer-motion; ease-out `cubic-bezier(0.23,1,0.32,1)`; ≤ 300 ms per element; enter from 0.96 scale + opacity 0; stagger 30–60 ms; no `transition-all`; reduced motion and data saver remove movement. Detail: `VISUAL_QA_CHECKLIST.md` §6.

## 5. Interaction patterns
| Need | Pattern |
|---|---|
| Act on an object (edit, settings, create) | **Right side sheet** on tablet/desktop, bottom sheet on phones (Dialog, D272) |
| See an object's details from a list | Right sheet over the list (Forms inbox uses a split view) |
| Confirm something irreversible | Dialog stating the consequence and what's kept; destructive button names the action |
| Confirm something reversible | Toast with **Undo** |
| Row and toolbar actions | Menu |
| Section-level problem | InlineAlert, stays until fixed |
| Field problem | Inline error under the field, announced |
| Locked feature | Visible with `PlanLock`; its button opens the upgrade flow |
| Long settings on phones | Accordion sections (`MobileSection`) |
| Visitor purchase, booking, subscribe | Bottom-sheet overlay on the seller's page, never leaving it |
| Saving | Autosave with a visible status, never a Save button on the editor |

The page editor's own patterns (selection, placement, drag rules, containers, checks, publish) are in `CANVAS_INTERACTION_SPEC.md`.

## 6. Content rules
- **Voice:** warm, direct, plain. Sentence case. Second person. Short sentences.
- **Buttons** say what happens ("Publish page", "Send for review"); never "Submit", "Click here", "Learn more".
- **Numbers:** ₦ with thousands separators; counts as "Label: number" so they translate; never round a count to look bigger.
- **Empty states:** what will appear + how to start.
- **Errors:** what went wrong + what to do; never blame; keep the user's input.
- **Honesty labels:** "Simulated", "Not available yet", "Coming later", "Example figures", "Draft translation".
- **Sample content:** fictional businesses and people, labelled as examples.

## 7. Languages
- Interface languages: English, Naijá, Yorùbá, Hausa, Igbo (all non-English text is an unreviewed draft). French listed as "Coming later".
- Pickers: sidebar, phone More sheet, editor top bar, phone editor settings, sign-in and sign-up, Account → Preferences, website header; sellers' pages have their own visitor language switch.
- Stays English on purpose: legal text, help articles, customer messages (WhatsApp, invoices), partnership agreements, staff console, Copilot's understanding of typed answers.
- Search understands everyday words in each language (`data/searchGlossary.ts`).
- How to add a language: `CLAUDE_HANDOFF.md` §12 and §14.

## 8. Accessibility standard
WCAG 2.2 AA. Landmarks and one h1 per page; labelled inputs with announced errors and required fields; visible focus everywhere; focus trapped in dialogs and returned on close; status changes announced (`LiveAnnouncer`, `CanvasAnnouncer`); ≥ 44px touch targets; colour never the only signal; publishing blocks unreadable contrast on sellers' pages. Status and manual test list: `ACCESSIBILITY_REPORT.md`.

## 9. Responsive rules (summary)
Structure changes only at **768** (sidebar ↔ bottom tabs, tables ↔ cards, right sheets ↔ bottom sheets, side-by-side page blocks) and **1024** (desktop editor, split views, mega menu). Design target 390px, must work at 320px. Detail: `RESPONSIVE_LAYOUT_SET.md`.

## 10. Quality bar
A screen is done when it passes `VISUAL_QA_CHECKLIST.md` §1–§7, its journeys in `CORE_USER_FLOWS.md` work including failure branches, its strings have drafts in every language, and anything simulated is labelled and listed in `NOT_FOR_PRODUCTION.md`.

## 11. Open UX decisions (collected)
From the detailed specs; each has a recommendation there.
- **Journeys** (`CORE_USER_FLOWS.md` §22): invite acceptance asks the person to reopen the link; email verification never gates payouts; Copilot understands English typing only; downgrade-over-limit not walked end to end.
- **Editor** (`CANVAS_INTERACTION_SPEC.md` §23): multi-select on the canvas, copy/paste between pages, drag from the library, broken-block message, comments on blocks, zoom, density switch, Check tab on phones.
- **Layout** (`RESPONSIVE_LAYOUT_SET.md` Part C): split vs sheet details, wide galleries and product grids, desktop checkout, phone plan comparison, settings tabs on phones, tablet editor, seller menu overflow, width tokens.
- **Components** (`COMPONENT_STATE_LIBRARY.md` §9): shared Checkbox/Radio, FileUpload, SearchInput, Stepper, Avatar, ConfirmDialog, StatusBadge, Pagination.
- **Sign-off** (`DECISIONS_FOR_SIGNOFF.md`): prices, legal text, providers, translations, AI provider and data terms.
