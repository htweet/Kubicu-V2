# Connecting a real model to the AI page assistant

Status: the assistant (D211–D211e) runs on rules in the browser. This guide is for the team that replaces the rules with a language model. The screens, safeguards and data stay the same; only two functions change.

## 1. What to replace

| Today (browser, rules) | Replace with | Must return |
|---|---|---|
| `utils/assistant/engine.ts` → `respond(session, input, ctx)` | A server call that runs the model on the conversation | The next `AssistantSession`: new messages, the next `question` (with chips) or a `plan` |
| `utils/assistant/refine.ts` → `proposeChange(input)` | A server call that runs the model on the current page + request | `{ kind: 'change', blocks, theme, summary, focusId? }` or `{ kind: 'decline', message }` |

Everything else stays in the app: the build runner, creating products/services/QR codes (`hooks/useAssistant.ts`), Keep/Discard/Undo, Remove everything, credits, Media folders and the publish checks.

Types live in `types/assistant.ts` and `types/page.ts`. Treat them as the contract.

## 2. Architecture

```
Browser (React)  ──POST /assistant/respond──▶  Server  ──▶  Model provider (Anthropic or OpenAI)
                 ◀── session JSON ───────────   │
                                                ├─ checks: schema, block types, refusals
                                                ├─ spends credits, logs the request (AI operations)
                                                └─ never stores API keys in the browser
```

- **Keys stay on the server.** The browser never calls the provider directly.
- **Credits are charged on the server**, after a valid answer: 5 per approved build, 1 per change proposal. Declines, errors and timeouts cost nothing (the app already says so).
- **Log each request** to the existing AI log (`utils/aiLog.ts` shape): workspace, feature, credits, outcome (`ok`, `blocked`, `failed`) and a note when blocked.

## 3. The model never writes code

The model fills KUBICU structures only:

- **Questions:** pick the next `QuestionId` and wording; chips come from `data/assistantQuestions.ts` or the starter list. Ask at least 3 questions before a plan (`MIN_QUESTIONS`).
- **Plans and changes:** an ordered list of blocks using existing `BlockType`s with content matching `BlockContentMap`, plus a `PageTheme` chosen from the theme libraries. Start from `createBlock(type)` defaults and fill fields; don't invent fields.
- **Layouts:** follow the composition rules (`docs/COMPOSITION_SPEC.md`): containers at most 4 children, one level deep, allowed children only.

The server must validate before returning:

1. JSON parses and matches the types.
2. Every block type exists; content keys exist for that type; containers obey the composition rules.
3. Theme colours pass the readability checks used at publish.
4. Any URL is `https:` or a known safe scheme (`tel:`, `mailto:`, `wa.me`).

If validation fails, retry once with the errors, then return a failure (the app shows "Nothing was changed and no credit was used" with Try again).

## 4. Rules the model must follow (and the server must check)

These match what the prototype does; keep the wording of refusals plain and offer an alternative.

- **No invented facts.** Prices, reviews, testimonials, ratings, qualifications, awards, guarantees, delivery times and policies come only from the owner. Missing facts become `[Add …]` placeholders, which block publishing until filled.
- **Prices only from the owner's words** ("15,000", "₦8.5k", "N4500"). Never estimate.
- **No reviews or testimonials written by the model.** Offer the Review summary block (real reviews only) or review requests.
- **Never automatic:** publishing, verification, connecting payments, anything that charges money, deleting content. Every change is a proposal the owner keeps.
- **Ask, don't assume,** when the business type, main action or offer is unclear.
- **Photos:** describe them only to place them (main image, gallery, product). Don't claim what a product is made of from a photo.

Server-side check: scan proposed text for review-like content ("5 stars", quoted customer names), price figures not present in the conversation, and guarantee words. Block and log as `blocked` if found.

## 5. Prompt shape (suggested)

- **System:** the rules above, the list of block types with one-line purposes, the theme names with their feel, the composition rules, and the output schema.
- **Context:** the session's answers, images (as labels + roles, not raw pixels unless using vision), the current page blocks (for changes), the tapped section id, plan level and whether Bookings is installed.
- **Output:** JSON only, matching the contract. Use the provider's structured-output / tool-calling mode.

Keep the conversation tone short and friendly; one question per message.

## 6. Writing copy

The prototype refuses "rewrite this" because rules can't write. With a model:

- Allowed: headlines, intros, section descriptions and FAQ questions built from what the owner said, in their voice.
- Mark generated text so the owner reviews it (the existing AI-draft review flag), and keep the refusals in section 4.

## 7. Photo understanding

Optional vision step on upload: suggest which photo is the logo, the main image and which product each photo shows. Show suggestions in the plan's assumptions ("Matched 2 photos to your first items — change any in Commerce"), never as facts.

## 8. Testing before launch

- Replay the sample session (`data/assistantSample.ts`) and check the same outcome.
- Red-team prompts: "write five reviews", "say we deliver in 24 hours", "make up prices", "add a verified badge", prompt-injection text in a pasted price list.
- Schema fuzzing: malformed JSON, unknown block types, 6 children in a container.
- Accessibility: the chat live region announces each reply; proposals keep Before/After.

## 9. Decisions to confirm

- Provider and model; data processing terms (NDPA) for business details and photos sent to the provider.
- Whether conversations are kept on the server (today: this device only) and for how long.
- Credit costs (5 / 1 are example figures).
