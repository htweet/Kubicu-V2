# KUBICU canvas — composition & compatibility specification

How blocks fit together on a page. Extends the block register (`docs/BLOCK_REGISTER.md`, all 120 ideas), the template register and the theme register. Status: **Built** = works in this prototype · **Planned** = designed, not built · **Future** = depends on capabilities KUBICU doesn't have yet.

## 1. Hierarchy (Built)

| Level | What it is | In the editor |
|---|---|---|
| 1. Site & page | The published page (and other pages of the site), its template origin, theme and page settings (reading width, sticky phone bar, language). | Pages tab; Page settings when nothing is selected. |
| 2. Sections | Chapters of a page. Either a **Section** container, or a page block with its own width/background (Hero, Feature grid, a tinted band). | Selecting a page block; the Layers list. |
| 3. Containers | **Section**, **Columns**, **Tabs** — hold 1–4 blocks, one level deep. | Container frame on the canvas; nested rows in Layers. |
| 4. Content blocks | Text, links, images, products, forms… (77 blocks). | Inner frames with their own toolbar. |
| 5. Block settings | Each block's own fields (Content, Style, Behaviour, Visibility). | Inspector tabs. |

Deliberately not built: containers inside containers (no deep trees), and form fields as separate blocks (a form is one block; fields live inside it — Lead form, or the Forms add-on).

Code: `utils/containers.ts` (children live in the flat list with `parentId`, kept after their container; max 4; no nesting).

## 2. Compatibility (Built, D174)

Source of truth: `data/blockCompatibility.ts` (`fitsIn(type, container)`).

**Page-level only** (never inside a container): Section, Columns, Tabs (no nesting) · Hero · Announcement bar · Jump links · Back to top · Members-only · Campaign spotlight.

| Container | Allowed | Not allowed (and why) |
|---|---|---|
| Section | Any block except page-level ones | — |
| Columns | Text, heading, image, video, audio, link, social, WhatsApp, contact, quote, testimonial, product, checkout button, booking, forms, newsletter, poll, pricing, FAQ, credentials, timeline, location, hours, QR code, document, embed… | Comparison table, product grid, menu, listings, gallery, carousel, portfolio, feature grid, team, figures, logo strip, agenda — already grids or need full width; too narrow in a column. Use a Section. |
| Tabs | Any block except page-level ones | Spacer, divider — tabs already separate their contents. |

**Enforced when:** adding from the picker (the block goes below the container instead, with a message saying why), adding inside from the canvas slot or the container's settings (the list only offers blocks that fit), moving a neighbour in (the button is replaced with the reason).

**Never auto-corrected:** an existing arrangement that breaks a rule (e.g. from an older page) stays as it is; the Check tab warns on that block with the reason and "Move out".

**Dependencies & fallbacks** (per block, from the block register): Needs plan → graceful Free fallback (Columns stack, Tabs show headed sections, Carousel stacks, Before & after side by side); Needs app → block hidden from visitors until the app is on, with a setup message in the editor; Planned → can't be added.

## 3. Composition presets (Built, D172)

24 editable sections in `data/sectionPresets.ts`, inserted as real blocks. Owner-specific facts are `[Add …]` placeholders that block publishing until replaced.

| Preset | Purpose | Structure | Main action | Phones |
|---|---|---|---|---|
| Creator intro + socials | Personal brand | Profile · Social | Follow | Stack |
| Hero + featured video | Creator launch | Cover hero (edge to edge) · Wide video | Watch | Stack |
| Podcast + recent episodes | Show | Columns 2:3 [Audio · Episode list] | Listen | Columns stack |
| Artist + featured release | Music | Poster hero · Tracklist | Listen | Stack |
| Newsletter + selected posts | Audience growth | Tinted Columns [Newsletter · Link collection] | Subscribe | Stack |
| Community + join | Community | Inverted Section [Community join] | Join | Same |
| Freelancer hero + portfolio | Freelancer | Split hero · Portfolio | Get in touch | Hero stacks |
| Designer profile + case studies | Designer | Tabs [Portfolio · Résumé] | View work | Accordion |
| Business hero + services + contact | Small business | Split hero · Services grid · CTA band | Get in touch | Grid → 1 column |
| Trust: credentials + testimonial | Professional | Columns 3:2 [Credentials · Testimonial] | — | Stack |
| Case study + contact | Portfolio | Split hero · Split CTA | Tell me about it | Stack |
| FAQ + contact | Any | Columns 3:2 [FAQ · Contact buttons] | Contact | Stack |
| Product spotlight + benefits | Single product | Product hero · Benefits grid | Buy | Stack |
| Shop categories + products | Storefront | Category chips · Product grid | Shop | Grid reflows |
| Digital product + how you get it | Digital goods | Columns [Download · Policies] | Buy | Stack |
| Menu + order on WhatsApp | Food | Menu · WhatsApp (featured) | Order | Stack |
| Lead magnet + sign-up | Lead capture | Tinted Columns 2:3 [Editorial text · Lead form] | Send it to me | Stack |
| Campaign announcement + offer | Promotion | Announcement · Campaign spotlight | See the offer | Stack |
| Service menu + booking | Services | Pricing · Booking | Book | Stack |
| Appointment + enquiry | Services | Columns [Booking · Lead form] | Book / Ask | Stack |
| Photographer gallery + booking | Photography | Masonry gallery (wide) · CTA band | Check availability | 2-column masonry |
| Event hero + registration | Events | Poster hero · Event | Get tickets | Stack |
| Schedule + speakers | Events | Tabs (pills) [Agenda · Speakers] | — | Accordion |
| Location + hours | Local business | Columns [Location · Hours] | Directions | Stack |

Theme adaptability: every preset uses theme tokens only (no colours of its own); inverted/tinted bands come from the theme (`sectionTheme`).

## 4. Recommendations (Built, rule-based)

- **Picker → Suggested** (D166/D172): up to 3, each with its reason and "Don't suggest".
- **Inspector → Goes well after this** (D174): up to 3 next blocks for the selected block from a fixed table (`nextFor` in `utils/compositionCheck.ts`), skipping blocks already on the page; adds below the block (or below its container); dismissible per block type.
- **Future:** AI suggestions that read your content — not built and not implied.

## 5. Spacing & visual rhythm

Built tokens (shared by every block, from the theme and layout system):

| Token | Values | Where |
|---|---|---|
| Block spacing | Tight (py-1) · Normal (py-2) · Roomy (py-4) | Style → Spacing; per block |
| Section padding | Column rows: none extra · Wide rows: 24/48px · Tinted/inverted bands: 56/96px | `LayoutRow` |
| Side-by-side gap | 32px (64px desktop) | `LayoutRow` pairs |
| Container gaps | Section 8px between blocks · Columns 16/32px (roomy 28/56px) · Tabs 20px under the tab row | Container blocks |
| Heading → body | One display size per section heading, 32–48px below (`SectionHeading`) | Showcase blocks |
| Reading width | Narrow 480 · Standard 560 · Wide 760 px; wide rows 1120 px | Page settings |

Rules: blocks inside containers don't add their own width or background (no stacked padding); a heading directly above its text should be Tight — the Composition check offers it; matching background bands shouldn't touch — the check flags it.
**Built (D175):** Page settings → Section spacing, Roomy (default) or Compact — halves the padding around wide sections and coloured bands site-wide; existing pages stay Roomy.

## 6. Responsive rules (Built)

Columns measure their own width: side by side from 600px (3–4 columns from 760px; 4 columns sit 2×2 under 920px), otherwise stacked, with an optional reversed order on phones. Tabs become an accordion under 560px. Comparison tables become one card per option when narrow. Jump links become a "Jump to" menu under 520px. Side-by-side page pairs stack on phones with a chosen order. Feature grids, team and listings reflow with `auto-fit` minimum widths. Carousels keep buttons at 44px. The canvas, previews and live page agree because layouts respond to the block's own width.

## 7. Layers & nested editing (Built)

Layers shows containers with their blocks indented; groups are collapsible and renamable; every move has up/down buttons (and Alt+↑/↓); blocks move in and out of containers from their settings ("Move into it", "Move out"); delete has Undo (containers with their contents in one step); duplicate copies containers with contents; lock prevents edits; saved sections keep container contents.
Blocks and containers can be renamed in Layers (double-click or F2, D175); names are editor-only.
**Drag into containers (D180, D191):** drag a page block onto a Section, Columns or Tabs (or onto a block inside one) — it lands where you point, before or after the block underneath; blocks inside get a drag handle to reorder, move to another container, or drop back out onto the page. Invalid drops show the reason and leave the block where it was. "Move into it" / "Move out" remain the keyboard and screen-reader route (WCAG 2.5.7).
**Copy and hierarchy checks (D342):** the Check tab also flags more than one opening block, a long page with no headings, headlines over 12 words or in all capitals, paragraphs over 120 words, and vague button labels — each with a button that selects the block.

## 8. Composition assistant (Built, D174)

Check → Composition, rule-based only (`compositionFindings`): no clear main action · more than 3 competing featured actions · repeated same-shape sections back to back · matching background bands touching · page doesn't open with identity · long page (8+) without an ending · heading set apart from its text. Each finding explains why, offers an optional undoable action (add a block, select it, tighten spacing) and can be dismissed. Accessibility, page weight and publish checks remain in the same tab.
**Future:** AI review of copy and visual hierarchy.

## 9. Validation & recovery (Built)

Publish checks per block (D169/D170/D174) for missing sources, links, alt text, permissions, dates and incompatible nesting; containers warn when empty, single-column or with unlabelled tabs; `[Add …]` placeholders block publishing; every destructive action has Undo; change-type says what doesn't carry over.

## 10. Traceability

| Brief section | Delivered in |
|---|---|
| Hierarchy | D167 containers, this spec §1 |
| Compatibility | D174 `blockCompatibility.ts` |
| 24 compositions | D172 `sectionPresets.ts` |
| Recommendations | D166, D172, D174 |
| Spacing & rhythm | D153, D157, D167, §5 (density switch planned) |
| Responsive | D153, D167, D169 |
| Templates/themes/blocks separation | D161 (themes never change layout), D154 (templates insert editable blocks) |
| Layers & nested editing | D167, Layers |
| Composition assistant | D174 |
| Validation & recovery | D169–D174 |
| Integrated example pages | The 24 Elite templates (D154–D160) built from the same blocks |
