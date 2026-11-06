# KUBICU WhatsApp-first Copilot — Claude Implementation Addendum

**Document status:** Proposed addition to the KUBICU Master Blueprint and Implementation Backlog  
**Review date:** October 28, 2026  
**Purpose:** Give Claude a focused implementation specification for conversational website creation, preview delivery, and secure transfer into the KUBICU app.

## 1. Governing instructions

Treat `KUBICU_MASTER_BLUEPRINT.md` and `KUBICU_IMPLEMENTATION_BACKLOG.md` as the governing product documents. This addendum supplements them; it does not replace other approved requirements. Preserve KUBICU's canonical page document schema, Canvas, block registry, templates, themes, account system, publishing pipeline, tenancy model, and security boundaries.

Do not start by assuming WhatsApp Business Cloud API is the correct integration. First complete ticket KUB-WA-001 and record an Architecture Decision Record (ADR). Meta's WhatsApp Business Solution Terms currently include restrictions for AI Providers whose primary functionality is AI technology, with stated exceptions for phone numbers registered in the EEA or Brazil. KUBICU Copilot's main value is AI-assisted page creation, so Nigerian production eligibility via the Business Platform must be verified with Meta instead of assumed.

Evaluate the official WhatsApp Third-Party Agent Platform as a separate candidate. Its published terms state that access is currently free of charge, while help material says it is available only in limited countries. Confirm Nigeria availability, provider access, end-user connection flow, rate limits, and production terms. The official terms also say third-party-agent chats are not end-to-end encrypted like personal chats; disclose this and design appropriate data minimization, retention, and deletion. Keep a web Copilot as the fallback.

Do not use unofficial WhatsApp Web automation, session scraping, modified clients, or unapproved bridges. If neither official WhatsApp route is approved, ship the website flow first and provide ordinary WhatsApp handoff only where suitable.

## 2. Cost and API usage: do not claim zero cost

Zero API consumption is not realistic for an automated WhatsApp agent and model-based generation. No-fee platform access is not the same as zero API calls, zero model inference, or zero hosting cost.

- Keep WhatsApp/channel transport behind `CopilotChannelAdapter`.
- Keep inference behind `ModelProviderAdapter`.
- Support an approved hosted model provider and evaluate self-hosted inference separately.
- If using a hosted Claude/LLM API, account for input/output token costs. If self-hosting an open-weight model, account for compute/GPU, operations, scaling, monitoring, and quality differences.
- Measure preview screenshot rendering, storage, media delivery, bandwidth, logging, retries and hosting as well as inference.
- Use a structured brief, concise context, deterministic workflow decisions, caching, appropriate model selection, rate limits, per-user quotas, per-session budgets and platform spending alerts.
- Never run a paid model call simply to transition between known workflow states or validate ordinary fields that deterministic code can validate.
- Do not regenerate unchanged previews or resend full conversation histories when compact state is sufficient.
- Provide a template-based fallback if the model provider is unavailable or the budget is exhausted.

As of the review date, Meta's official WhatsApp Business FAQ states that service-message pricing changed on October 1, 2026, with the first 1,000 service messages per business phone number per month free and charges after that according to published rates. Confirm current country/category pricing before any estimate; pricing alone does not establish eligibility under the Business Solution Terms.

## 3. Required user journey

1. A user starts a KUBICU Copilot conversation in a verified, supported WhatsApp agent/channel, or starts in the KUBICU web fallback.
2. The Copilot asks what they want to create and why.
3. It collects only the missing information needed: page goal, audience/market, brand identity, style, content/assets, required sections, primary CTA, and facts such as prices or opening hours when relevant.
4. The Copilot summarizes the brief and allows the user to correct or approve it.
5. Page planning selects an existing template, composition preset, theme, and valid blocks—or composes a draft from the same canonical block primitives.
6. Server-side validation checks the page document, block compatibility, URLs, supported features, and missing required data.
7. The draft is saved against an anonymous Copilot session.
8. The canonical renderer produces a mobile PNG preview and a read-only interactive web preview link. A custom interactive page cannot be executed fully inside a normal WhatsApp chat; use an image and supported buttons/links that open the KUBICU preview.
9. The user follows a preview/continue link and creates an account or signs in.
10. A one-time or otherwise race-safe claim token transfers the draft into the authenticated user's workspace.
11. The user continues in Canvas and explicitly approves publication.

The chat must never silently create an account, claim a draft, connect a domain, enable paid features, or publish a page.

## 4. Adaptive interview design

Capture a versioned `PageBrief` with fields such as:

- `goal`: profile, portfolio, business page, shop, service page, event, or other supported type.
- `primary_outcome`: enquiries, bookings, product sales, lead capture, audience growth, portfolio discovery, event registration, or link sharing.
- `identity`: name, brand name, short description, audience and location/market where relevant.
- `visual_direction`: user-described aesthetic, preferred template/theme, supplied references, and permitted defaults.
- `content_assets`: supplied text, logo, images, videos, links and existing documents.
- `required_sections`: prioritized block/section list.
- `primary_cta`: label and validated destination or supported configuration.
- `business_facts`: supplied price, product, inventory, opening-hours, delivery, booking, contact or policy facts.
- `unknowns`: explicit missing facts that must not be hallucinated.
- `consent_and_preferences`: necessary channel/processing consent and relevant user decisions.
- `status`: collecting, awaiting confirmation, generating, preview ready, claimed, or expired.

Ask one focused question at a time when useful, but do not insist on a fixed number of questions. Allow “skip”, “suggest something”, “not sure”, and corrections. Reuse all already supplied information. Use deterministic state transitions; do not let model text directly set security-sensitive session status.

## 5. Draft-generation contract

The LLM can propose a typed page plan and content, but it cannot directly write arbitrary database records or execute code. Use a bounded tool/action contract. Every proposal goes through server-side validation and authorized domain services.

The generated draft must:

- Use the canonical KUBICU page schema and supported block IDs.
- Preserve stable block IDs and schema versions for editing.
- Reference only existing templates, themes, components and permitted composition presets.
- Mark assumptions and missing information.
- Avoid fabricated prices, inventory, testimonials, verified claims, ratings, policies, guarantees, or contact information.
- Use placeholder copy that is clearly editable when user data is absent.
- Never publish without a separate explicit user action.
- Record source/decision metadata sufficient to reproduce or inspect the generated version where practical.

For natural-language revisions, translate the user's instruction into a limited page-document operation set such as `insert_block`, `update_block_content`, `change_theme`, `reorder_block`, `remove_block`, or `replace_section`. Validate each operation against the current schema and permissions. Reject unsafe or unsupported changes with an explanation instead of silently applying a partial mutation.

## 6. Architecture boundaries

Create/reuse these logical services (adapt names to the existing codebase and document the mapping in the ADR):

- `CopilotChannelAdapter`: messages, supported interactive replies, media, delivery events and channel-specific limits.
- `CopilotSessionService`: session identity, persistence, resumption, deduplication and expiry.
- `PageBriefService`: extraction, validation, summarization, confirmation and corrections.
- `ModelProviderAdapter`: hosted/self-hosted inference, usage reporting, timeouts and fallback.
- `PagePlanningService`: selection of templates, themes, blocks and composition presets.
- `PageSchemaValidator`: schema validation, supported feature checks, URL handling and composition compatibility.
- `DraftPageService`: draft persistence and versioning.
- `PreviewRenderService`: canonical rendering, PNG capture, preview URL creation and cache/expiry.
- `DraftClaimService`: authenticated account handoff and race-safe ownership transfer.
- `QuotaAndCostService`: rate limits, budgets and usage telemetry.
- `AuditAndPrivacyService`: consent, retention, deletion, security events and audit trail.

WhatsApp must not own core page-generation business logic. The web fallback and WhatsApp adapter must call the same services. Do not create a second renderer or a separate WhatsApp-only page schema.

## 7. Preview and account-claim controls

- Preview links grant read-only preview access only.
- Claim tokens are random, time-limited, revocable, scoped to the intended draft and validated server-side.
- Never expose raw IDs, phone numbers or secrets in URLs.
- Use `noindex` and suitable cache headers on drafts.
- Separate preview access from claim authority and authenticated edit/publish permissions.
- Never silently create an account based only on a WhatsApp number.
- Require sign-in or sign-up, then atomically transfer ownership to the authenticated workspace.
- Make claim operations idempotent; handle duplicate callbacks, double clicks, retries, expired/replayed tokens, and conflicting account ownership.
- Expire anonymous drafts under a disclosed policy and provide a way to continue when practical.
- Do not permanently reserve a public handle until the appropriate user-confirmed step.

## 8. Privacy, security and transparency

Before channel launch, document the complete data flow and show a short, understandable notice describing what KUBICU processes, which provider handles the conversation, data retention/deletion, and the encryption limitation applicable to the chosen third-party-agent route. Do not claim WhatsApp third-party-agent chats are end-to-end encrypted.

Collect only necessary information. Do not publish the user's channel phone number by default. Keep credentials and provider tokens server-side. Validate uploads, file sizes, formats, external URLs and media. Defend against prompt injection in messages, pasted links, uploaded files and imported content. Apply abuse controls, rate limits, quota limits, human support escalation and safe response policies. Sensitive external side effects and all publishing require explicit confirmation.

## 9. Required failure handling

Implement and test recovery for channel disconnection, unavailable region, message delivery failure, unsupported upload, incomplete brief, model timeout/rate limit/refusal, malformed page schema, missing assets, screenshot failure, expired preview, expired or reused claim token, account conflict, draft expiration, quota exhaustion and publication validation failure.

Retain user work where safe. Show clear next steps. Only report success after the relevant service confirms completion.

## 10. Release plan and gates

### Phase 0 — Feasibility spike
Verify official channel eligibility and Nigerian availability, read the latest developer manual, establish privacy obligations, prepare the ADR, and measure baseline hosted-model versus self-hosted costs. No production promise until the chosen route is verified.

### Phase 1 — Web vertical slice
Build the conversational brief, confirmation, schema-based draft generation, PNG + interactive preview, and secure account-claim flow on the website. Test it independently of WhatsApp.

### Phase 2 — Supported WhatsApp pilot
Only after the policy gate passes, connect the approved official channel, configure delivery/timeout/retry handling, consent, privacy notices and human escalation, and pilot with invited users.

### Phase 3 — Production scale
Scale only after cost per successful draft, quality, latency, reliability, privacy/security review, account claim correctness and support operations meet agreed thresholds.

## 11. Acceptance checklist

- [ ] Official channel route approved and documented for target region and use case.
- [ ] Web fallback works without WhatsApp.
- [ ] User can pause and resume without losing brief or draft.
- [ ] AI calls are bounded, metered and replaceable.
- [ ] Draft uses canonical page schema and passes server-side validation.
- [ ] No fabricated commercial facts or unsupported functionality.
- [ ] PNG reflects the saved draft version.
- [ ] Interactive preview is read-only and non-indexed.
- [ ] Claim tokens are scoped, time-limited and replay-safe.
- [ ] Sign-up/login and draft ownership transfer are authenticated and idempotent.
- [ ] Publication requires explicit approval.
- [ ] Data handling, third-party-agent encryption limitations, retention and deletion are disclosed.
- [ ] Rate limits, quotas, cost alerts, retries and fallback behavior are tested.
- [ ] Mobile usability, accessibility and core failure paths pass QA.
- [ ] Metrics are available for draft generation, preview, claim, publishing and cost.

## 12. Claude execution prompt

> Implement KUBICU Copilot as a channel-independent, schema-driven website-creation capability governed by `KUBICU_MASTER_BLUEPRINT.md`, `KUBICU_IMPLEMENTATION_BACKLOG.md`, and this addendum. First produce KUB-WA-001's evidence-based ADR and complete the policy/eligibility spike. Do not assume the WhatsApp Business Platform API is permitted for an AI-primary service in Nigeria. Verify the official WhatsApp Third-Party Agent Platform's availability and provider integration; keep the website Copilot as fallback. Do not use unofficial WhatsApp automation.
>
> Build a resumable conversational state machine, a versioned structured page brief, validated generation through the canonical KUBICU block/template/theme system, server-side schema validation, a read-only preview renderer, PNG generation, a secure one-time draft-claim flow, and an authenticated Canvas handoff. All model-generated operations must go through allowlisted domain services and authorization. The model must never directly set account ownership, bypass permissions, execute arbitrary code, or publish the page.
>
> Keep channel transport and inference providers replaceable. Measure model, channel, render, storage and hosting costs; do not promise zero API usage or zero cost. Use deterministic logic, compact context, appropriate models, caching, quotas and a template-based fallback. Disclose the selected channel's data handling and encryption characteristics. Preserve user content during failures. For every phase, report what is implemented, tests and evidence, outstanding issues, cost/latency measurements, privacy/security review, and the next approved increment. Never claim a feature works without validating it end to end.

## 13. Official references to re-check

- WhatsApp Third-Party Agent Terms: https://www.whatsapp.com/legal/third-party-agents-terms
- WhatsApp Help Center: third-party agents: https://faq.whatsapp.com/1050934623978152
- WhatsApp Help Center: AI experiences and third-party agents: https://faq.whatsapp.com/1002544104126998
- WhatsApp Business Solution Terms: https://www.whatsapp.com/legal/business-solution-terms
- WhatsApp Business Messaging Policy: https://whatsappbusiness.com/policy/
- WhatsApp Business FAQ/pricing: https://whatsappbusiness.com/resources/faq/
- WhatsApp Business Developer Hub: https://whatsappbusiness.com/developers/developer-hub/
- WhatsApp Agent Platform developer manual: https://www.whatsapp.com/developer/WhatsApp-Agent-Platform-Developer-Manual.pdf

**Re-check every link, rate, eligibility condition, and policy at implementation time.**
