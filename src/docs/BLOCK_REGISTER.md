# KUBICU block register

Every idea from the Canvas brief (120), and how each one is delivered. Source of truth in code: `data/blockCatalog.ts` (ideas), `data/blockRegistry.ts` + `blockRegistryStory.ts` + `blockRegistryRound2.ts` (blocks).

**Why there are fewer blocks than ideas:** many ideas are the same block set up differently (for example *Waitlist signup* is the Newsletter block with different words). Shipping those as separate blocks would duplicate code, settings and bugs, and make the picker harder to scan. So each idea is one of:

- **Block** – its own block in the picker.
- **Look** – a ready-made setup of a block, listed under "Ready-made looks" in the picker. It inserts the real block with starting settings; everything stays editable.
- **How-to** – an existing feature, explained in the picker.
- **Planned** – shown in the picker as Planned; can't be added (needs an outside provider).

> **Update, D342 (30 Oct 2026):** the two Planned ideas are now delivered. **AI FAQ assistant** is a real block (`faqAssistant`: visitors ask in their own words and get the business's approved answer word for word, or a fallback button — rule-based matching in `utils/faqMatch.ts`, no model). **Voice to content** is a canvas tool, not a block (card at the top of the library → speak or type → paragraph, heading + text, or questions and answers, added in one undo step; browser speech recognition). So the picker now has **one more block and no Planned items**, and the Planned group is hidden. Block names, descriptions and categories are searchable in the screen language (D342) and translated (D293).

Totals at D173 (before the update above): **77 blocks** in the picker (68 of them map directly to an idea — Delivery & returns was split out of Policies in D181; the rest — e.g. Members-only, Subscription, Collection, Hero, Proof — are earlier blocks the brief didn't list), **49 looks**, **1 how-to**, **2 planned**.

Status key: **Built** (works in this prototype) · **Needs app** (works once a free KUBICU app is installed) · **Planned**. Group: A core · B commerce/business · C integration-dependent · D future smart.

| # | Idea | Delivered as | Block | Status | Group |
|---|---|---|---|---|---|
| 1 | Section container | Block | Section | Built | A |
| 2 | Multi-column layout | Block | Columns | Built (Creator) | A |
| 3 | Asymmetric split | Look | Columns 3 : 2 | Built (Creator) | A |
| 4 | Responsive grid | Look | Feature grid, 3 across | Built | A |
| 5 | Vertical spacer | Block | Spacer | Built | A |
| 6 | Divider & separator | Block | Divider | Built | A |
| 7 | Background feature section | Look | Section, wide + tint | Built | A |
| 8 | Tabs & content switcher | Block | Tabs | Built (Creator) | A |
| 9 | Accordion group | Look | FAQ | Built | A |
| 10 | Content carousel | Block | Carousel | Built (Creator) | A |
| 11 | Anchor navigation | Block | Jump links | Built | A |
| 12 | Reusable section | How-to | Your sections | Built | A |
| 13 | Profile identity | Block | Profile | Built | A |
| 14 | Brand header | Block | Brand header | Built | A |
| 15 | Editorial hero | Look | Hero (split) | Built | A |
| 16 | Personal introduction | Look | Text (editorial) | Built | A |
| 17 | Logo & brand mark | Look | Brand header, logo only | Built | A |
| 18 | Announcement banner | Block | Announcement bar | Built | A |
| 19 | Featured CTA | Block | Call to action | Built | A |
| 20 | Simple link list | Look | Link collection (list) | Built | A |
| 21 | Featured link card | Look | Link (featured) | Built | A |
| 22 | Rich link collection | Look | Link collection (grid) | Built | A |
| 23 | Social profile row | Block | Social | Built | A |
| 24 | Featured social channel | Look | Link (featured) | Built | A |
| 25 | Contact action buttons | Block | Contact buttons | Built | A |
| 26 | WhatsApp contact | Block | WhatsApp | Built | A |
| 27 | QR & offline connection | Block | QR code | Built | A |
| 28 | Link collection with categories | Block | Link collection | Built | A |
| 29 | Smart link preview | Look | Link with your own summary (pages aren't fetched) | Built | A |
| 30 | Rich text | Block | Text | Built | A |
| 31 | Pull quote | Block | Pull quote | Built | A |
| 32 | Story timeline | Block | Timeline | Built | A |
| 33 | Process steps | Block | Steps | Built | A |
| 34 | Key benefits | Look | Feature grid | Built | A |
| 35 | Statistics & highlights | Block | Figures | Built | A |
| 36 | FAQ | Block | FAQ | Built | A |
| 37 | Comparison table | Block | Comparison table | Built (Creator) | B |
| 38 | Pricing & packages | Block | Pricing | Built | B |
| 39 | Testimonial collection | Block | Testimonial | Built | A |
| 40 | Single image | Block | Image | Built | A |
| 41 | Image gallery | Block | Gallery | Built (Creator for all photos) | A |
| 42 | Masonry gallery | Look | Gallery (masonry) | Built | A |
| 43 | Before & after | Block | Before & after | Built (Creator) | A |
| 44 | Featured image story | Look | Hero (cover) | Built | A |
| 45 | Brand or client logos | Block | Logo strip | Built | A |
| 46 | Product image showcase | Look | Hero (product) | Built | B |
| 47 | Video player or embed | Block | Video & embed | Built | C |
| 48 | Featured video | Look | Video, wide | Built | C |
| 49 | Audio player | Block | Audio | Built | A |
| 50 | Music release | Look | Media list (tracks) | Built | A |
| 51 | Podcast episode | Look | Audio | Built | A |
| 52 | Playlist / media collection | Block | Playlist | Built | A |
| 53 | Downloadable resource | Block | Download | Built | B |
| 54 | Document preview | Block | Document | Built | A |
| 55 | External media embed | Block | Embed | Built | C |
| 56 | Portfolio project grid | Block | Portfolio | Built | A |
| 57 | Featured case study | Look | Hero (split, "Case study") | Built | A |
| 58 | Services overview | Look | Feature grid | Built | B |
| 59 | Team members | Block | Team | Built | A |
| 60 | Experience & credentials | Block | Credentials & experience | Built | A |
| 61 | Résumé / CV | Look | Credentials (résumé) | Built | A |
| 62 | Publications & press | Block | Press & publications | Built | A |
| 63 | Project process | Look | Steps | Built | A |
| 64 | Availability & enquiry | Look | Lead form | Built | B |
| 65 | Map & location | Block | Location | Built | A |
| 66 | Featured product | Block | Product | Built | B |
| 67 | Product collection | Block | Product grid | Built | B |
| 68 | Product category navigation | Block | Shop categories | Built | B |
| 69 | Digital product offer | Look | Download (paid) | Built | B |
| 70 | Product bundle | Look | Product, "Bundle" | Built | B |
| 71 | Purchase / checkout CTA | Block | Checkout button | Built | B |
| 72 | Service pricing | Look | Pricing | Built | B |
| 73 | Order & delivery info | Block | Delivery & returns (D181) | Built | B |
| 74 | Food menu / catalogue | Block | Menu | Built | B |
| 75 | Property / listing showcase | Block | Listings | Built | B |
| 76 | Donation or support | Block | Support / pay what you want | Built | B |
| 77 | Booking CTA | Block | Booking | Needs app (Bookings) | B |
| 78 | Service menu | Look | Pricing | Built | B |
| 79 | Availability preview | Look | Booking | Needs app (Bookings) | C |
| 80 | Event details | Block | Event | Built | B |
| 81 | Event schedule | Block | Agenda | Built | B |
| 82 | Speakers or performers | Look | Team (speakers) | Built | B |
| 83 | RSVP or registration | Look | Event | Built | B |
| 84 | Ticket or event offer | Look | Event (Commerce tickets) | Built (Pro for paid) | B |
| 85 | Countdown | Block | Countdown | Built | A |
| 86 | Contact form | Block | Lead form | Built | B |
| 87 | Lead capture form | Look | Lead form | Built | B |
| 88 | Newsletter signup | Block | Newsletter | Built | B |
| 89 | Waitlist signup | Look | Newsletter | Built | B |
| 90 | Service enquiry form | Look | Lead form | Built | B |
| 91 | Application form | Block | Form (Forms add-on) | Needs add-on | B |
| 92 | Poll or feedback | Block | Poll (this device only) | Built | B |
| 93 | Community join | Block | Community join | Built | B |
| 94 | Social follow & share | Look | Share this page | Built | A |
| 95 | Download-for-lead | Look | Lead form (file sent by you) | Built | B |
| 96 | Credentials & certifications | Look | Credentials | Built | A |
| 97 | Review summary | Block | Review summary | Needs app (Proof) | B |
| 98 | Verified identity indicator | Block | Trust badge | Needs app (Trust Passport) | B |
| 99 | Client or partner logos | Look | Logo strip | Built | A |
| 100 | Policies & assurance | Block | Policies & assurance | Built | B |
| 101 | Trust information | Look | Policies & assurance | Built | B |
| 102 | Business hours | Block | Business hours | Built | A |
| 103 | Contact information | Block | Contact | Built | A |
| 104 | Location & directions | Look | Location | Built | A |
| 105 | Menu or service catalogue | Look | Menu | Built | B |
| 106 | Calendar or schedule | Look | Agenda | Built | A |
| 107 | Language selector | Block | Language switch | Built | A |
| 108 | Share this page | Block | Share this page | Built | A |
| 109 | Back to top | Block | Back to top | Built | A |
| 110 | Custom embed | Look | Embed (safe list only) | Built | C |
| 111 | AI-assisted content | Look | Heading with "Suggest" (you approve) | Built | D |
| 112 | AI FAQ assistant | Planned | — | Planned | D |
| 113 | Personalised welcome | Look | Smart button (by source) | Built (Creator) | D |
| 114 | Campaign spotlight | Block | Campaign spotlight | Built (Creator) | D |
| 115 | Smart CTA | Block | Smart button | Built (Creator) | D |
| 116 | Recommendation collection | Block | Recommendations | Built | D |
| 117 | Opportunity & contact CTA | Look | Call to action | Built | D |
| 118 | Voice-to-content | Planned | — | Planned | D |
| 119 | Campaign landing section | Look | Section, wide + tint | Built | D |
| 120 | Smart content collection | Look | Recommendations | Built | D |

Phone behaviour, keyboard patterns and settings for each block are described in the block's file header comment and in D166–D173 of the decision register.

## Journey walk-through (by reading the code, D173)

| Journey | Result |
|---|---|
| 1. First page: profile, links, socials, preview, publish | Works. Picker search finds “profile”; Suggested offers Contact once a profile exists. Publish dialog lists any [Add …] placeholders. |
| 2. Freelancer portfolio | Works. “Freelancer hero + portfolio” and “Trust: credentials + testimonial” sections; Width and Spacing in Style; Preview shows Columns side by side. |
| 3. Storefront | Works. Shop categories + Product grid section; Checkout button says “secure checkout on this page” or “You’ll pay on {site}”; without the checkout plan the inspector says so. |
| 4. Booking page | Works with the Bookings app. Without it, the Booking block is marked Needs app with a link; “Appointment + enquiry” keeps an enquiry route. Live vs enquiry is labelled. |
| 5. Creator media + audience | Works. “Podcast + recent episodes”, Newsletter suggestion after media, Community join. |
| 6. Building on a phone | Works. Full-height picker with 44px+ targets; blocks in containers move with arrow buttons (no drag); tabs become an accordion. |
| 7. Insert and edit a section | Works. Inserted as real blocks; remove any inner block; containers keep their blocks; one Undo removes the whole section. |
| 8. Unavailable feature | Works. Needs app / Needs plan / Planned chips; Planned items can’t be added; Review summary shows a setup placeholder until verified reviews exist. |

## Accessibility (by reading the code)

- **Tabs:** WAI-ARIA tabs (roving tabindex, arrows, Home/End); accordion on narrow screens uses buttons with `aria-expanded`.
- **Carousel:** `aria-roledescription` carousel/slide, “n of N”, labelled previous/next and slide buttons, live “Slide n of N”, never auto-advances, reduced motion respected.
- **Before & after:** `role="slider"` with arrow keys/Home/End and value text, plus Before/After buttons — no drag required.
- **Poll:** fieldset + radios, result announced with `role="status"`; ticks have text.
- **Comparison:** real `<table>` with row/column headers; ticks and dashes have screen-reader text; one card per option when narrow.
- **Jump links:** move focus to the target block, not just scroll.
- **Every drag has a button alternative** (page blocks, blocks inside containers, Layers).
- **Known limitation:** on the canvas, a selected container's frame is itself a button that contains the inner blocks' buttons. Mouse, touch and keyboard all work, but screen readers may announce the nesting awkwardly. Needs a real screen-reader pass.
- **Still to test by hand:** VoiceOver/TalkBack on the new blocks, 320px and 200% zoom, and low-end Android scrolling with Columns and Carousel.
