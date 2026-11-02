# KUBICU Copilot — specification

Decisions D262–D266, D284–D290, D339–D340, D374, D420, D518–D522. Copilot is the signed-out way into KUBICU: describe a business in a chat, see a real draft page, and continue into KUBICU only if you like it. In this prototype every reply is rule-based and everything is stored in the browser; the screens are built so a real model and backend can replace the internals without changing them.

## Screens and routes

| Route | What it is |
|---|---|
| `/copilot` | Marketing page: start a chat in the browser, three example starts, "Try it on WhatsApp" (hidden when the channel is unavailable), privacy summary. |
| `/copilot/chat` | Web chat. Chat left, live phone preview right; Chat/Preview tabs on phones. |
| `/copilot/whatsapp` | Simulated WhatsApp chat, labelled "proposed channel". Same conversation, WhatsApp limits (3 reply buttons, lists of up to 10, attachments, link cards). |
| `/d/:id` | Private draft preview. `noindex`, view-only, expires after 7 days. "Continue in KUBICU" only on the device whose chat made it. |
| `/copilot/continue` | Claiming the draft: new account (sign up → email code → prefilled setup) or existing account (sign in → choose workspace → new Page space). |
| `/about/copilot` | Draft privacy/legal notice for legal review. |

Entry points: Home hero ("Not sure where to start? Describe it in a chat"), the announcement bar, footer → Product → Copilot, the `/ai` page and the sign-up page.

## Conversation

Opening: what are you creating (7 choices or free text). The greeting tells beginners what a page is for, that there are no wrong answers, that "you decide" works for anything and that nothing goes live without them.

Then 3–6 counted questions, only for what the first description didn't say, in this order: about → name → main action → look → items (shops and food) → **logo** → **photos** → WhatsApp number → city.

- **Every question carries a plain-language line** (`helps` in `data/copilotQuestions.ts`): what it means, why it's asked, an example.
- **"What do you mean?" / "I don't understand" / "?"** gets a longer, simpler explanation (`helpMore`) and the same question again, without moving on.
- "You decide" / "Skip" work wherever sensible; the name is the only required answer.
- Card numbers, passwords, PINs, BVN and NIN are removed from the chat and never stored.

### Logo and photos (D265)

- The logo is its own question, asked first, taking exactly **one** picture. Whatever the file name, that picture is the logo. "I don't have one" shows initials instead. The logo question doesn't count toward the 3–6.
- Photos follow straight after: up to **5** (one main picture + up to 4 for a gallery). Extra photos beyond 5 are reported in the chat ("the last 2 weren't added"), never dropped silently.
- Photos sent during any other question (WhatsApp lets people attach any time) are kept and given a role; the current question is asked again.
- "Use my logo" / "add more photos" after the brief re-open the right question.
- **Where they go on the page:**
  - Logo → the profile picture (Profile block) and/or the Brand header logo. If the chosen template has neither, a Brand header is added at the top.
  - First photo → the hero image, or an image block under the opening.
  - The rest → the template's gallery, or a new gallery. A single spare photo becomes its own image block.
  - For shops and menus, spare photos are matched to items in order first.
- **Storage:** photos are resized (1080px, logos 512px with transparency kept) and chat bubbles use 200px thumbnails, so a full set fits in browser storage. If storage is still full, old chats and expired drafts are cleared and the save retried; if it still fails the person is warned to continue into KUBICU.

## Brief, generation and preview

Brief card: what, who for, main action, look, template or "a new layout" and why, sections in order, gaps left to fill. Actions: Create my draft / Change something / Add more details. Generation shows five real steps (no percentages). The ready message shows a picture of the page, the private link with expiry, and Open preview / Make changes / Continue to KUBICU.

### Changes (D266)

Typing a change after the brief or the draft shows a short list of exactly what will change ("Look: Warm & natural → Bold", "Logo: removed"), says everything else stays the same, and re-shows the brief. Nothing is rebuilt until "Create my draft". Unclear requests get one focused question instead of a guess.

## Navigation (D266)

Every Copilot screen has a Back control: `/copilot` (→ previous page or Home), `/copilot/chat` (→ previous page or `/copilot`), `/d/:id` (→ previous page or the chat), and each `/copilot/continue` step (→ the previous step; the first step → the chat).

## Limits and failures (example figures)

- 3 drafts and 10 changes a day per WhatsApp number or browser; no credits until claimed.
- Drafts expire after 7 days unclaimed; continue links after 30 minutes.
- Controls panel: `copilotWhatsapp` (available/unavailable) and `copilotFailure` (generation, previewImage, expiredLink, signIn) for review only.

## Claiming

Preview links only view. Claiming needs the one-time code held by the chat that made the draft — never in a URL or on screen. New users: email account (never created from a phone number) → main page of a new workspace. Existing users: new Page space in a chosen workspace. Handled states: missing, expired link, expired draft, code mismatch, already claimed, no permission. After claiming, the chat no longer edits the draft.

## What production needs

| Area | Needs |
|---|---|
| WhatsApp | Meta approval for an AI-primary agent (Third-Party Agent Platform or Business Platform), templates for messages outside the 24-hour window, regional availability checks. |
| AI | A model behind `respond` in `utils/copilot/engine.ts` on a server, filling answers and photo roles while `makePlan` builds the page; full contract in `docs/COPILOT_AI_INTEGRATION.md`. |
| Preview pictures | Server-side rendering of the page to PNG. |
| Drafts & limits | Server storage, expiry jobs, per-number limits, rate limiting. |
| Photos | Real upload storage (not data URLs), image processing and moderation. |
| Claiming | Real accounts, single-use claim codes as signed short-lived links, server-side transfer into the workspace. |
| Privacy | Final legal text for `/about/copilot`; WhatsApp agent chats are not end-to-end encrypted like personal chats. |

## Added after D266

- **Chats in the workspace sidebar (D284, rollback D290):** a Copilot section below the last sidebar item. **Pinned** chats (pinning moves a chat out of Recent; unpinning returns it), **Recent** (up to 5 unpinned chats), then **See all chats (n)**. Hover a chat to pin or unpin; clicking opens it on `/copilot/chat`. Collapsed sidebar shows a single chats icon; with no chats it shows a hint and "Start a chat". Only web chats are listed (not WhatsApp). Stored in this browser (`kubicu.copilot.pins`); pinned chats are never evicted when storage runs low. The pin icon was rebuilt from notes and may differ from version 308.
- **All chats panel:** opened from "See all chats" or the **All chats** button on `/copilot/chat` — search, open, pin, delete, start new; groups Pinned / Recent / Everything else.
- **Translation (D339–D340):** the frame, reply buttons, greeting, questions, help lines and built sentences show in the chosen language. Chats are saved in English and translated on screen, so switching language re-translates older messages. Typed answers are understood in all eight languages (D518): `utils/copilot/understand.ts` turns everyday words (skip, "you decide", "what do you mean?", looks, main action, what they offer, audience, photo/logo edits, "call it …") from `data/copilotUnderstanding.ts` plus the search glossary into English hints the engine matches; names, lists, numbers and places are read as typed. Tone marks are optional. Free-form sentences outside these words fall back to the usual defaults and questions. The WhatsApp simulation follows the chosen language too (D519, `data/translationsCopilotWhatsApp.ts`).

## Questions about KUBICU (D520–D521)

Copilot is KUBICU's front door — a general KUBICU assistant whose main job is building. The Ask bar (`components/shell/AskBar.tsx`) sends any question to `/copilot/chat?start=…`.

- **How a question is recognised** (`utils/copilot/askAnything.ts` → `readQuestion`): a "?", an English question word at the start, or a question word in the screen language. **Asking for a page always builds** ("how do I make a page for my bakery?"); describing a business ("I sell cakes") builds unless it's phrased as a question.
- **Curated answers** (`data/copilotHelpTopics.ts`, 17 topics): what Copilot does (+ the Assistant), payouts, verification and Trust Passport, domains, short links and QR, bookings, products, orders and refunds, analytics, forms, WhatsApp, pricing, team, account and language, Business Coach (advice), Help centre. Each is 1–3 sentences with link buttons (`CopilotMessage.links`) to the screen where the person acts. Keywords in English plus the screen language.
- **Everything else** (`findGuide`): the best-matching Help centre guide by meaningful words (guide question ×3, answer/where/topic ×1, needs enough overlap). Reply: "Here’s what the Help centre guide says:" + the guide's short answer + "Read the full guide" → `/about/help/:id`. New guides become answerable automatically. Guide text stays English; the lead line says so in other languages.
- **Unknown:** only at the opening, an honest "I’m not sure… I’d rather not guess" with the Help centre link.
- **Where it can happen and what follows:** at the start → answer, then "Want a page too?" with the starting choices; mid-interview (clear questions only) → answer, "Back to your page:" and the same question with its buttons; after the brief or draft → answer and the previous buttons again.
- **Never from chat:** moving money, refunds, account or security changes, publishing. Copilot says so and links to the screen.
- **Rendering:** link buttons in `CopilotThread` (pill with ↗) and as link lines in `WaThread`. Drafts for answers, follow-ups and link labels in `data/translationsCopilotHelp.ts` (8 columns).
- **Known limits (until a model):** workspace links assume the person is signed in; matching is by words; the Ask bar doesn't check the AI operations switch.

## Connecting a real model

See **`docs/COPILOT_AI_INTEGRATION.md`** (D522): which files stay and which are replaced, the `respond` contract, tools and the link allowlist, grounding order (live settings → curated topics → guides → the person's words), language handling (model writes in the screen language; add `lang` to messages), the 18-point behaviour list to keep, safety, signed-in handling, limits and logging, WhatsApp, tests and decisions to confirm.

## Manual checks still to do

320px width and 200% zoom on all Copilot routes; VoiceOver/TalkBack on the chat, including whether new messages are announced; keyboard-only path from `/copilot` to the canvas; low-end Android with large photos.
