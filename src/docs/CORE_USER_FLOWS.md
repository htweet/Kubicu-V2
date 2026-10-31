# KUBICU — Core user flows

_Design deliverable 6 of the Master Design Plan (§14). Written 30 Oct 2026 from the code at **D344**. Decision: D345._

Each flow lists **who**, **where it starts**, the **steps** in order, the **branches and failure states** the prototype actually handles, **where it ends**, and the **files** that own it. "Simulated" means the step works in the browser but stands in for a provider (see `CLAUDE_HANDOFF.md` §13). When a flow and this doc disagree, the code wins — update this doc in the same change.

**Conventions used throughout**
- Workspace actions open in a right-side sheet (bottom sheet on phones) — `components/ui/Dialog.tsx`, D272.
- Errors block, warnings inform. Anything that blocks says why and offers the fix.
- Visitor-facing pages follow the visitor's language (`kubicu.visitorLang`); seller wording is never translated.
- Locked features stay visible with the plan they need (`PlanLock`), never hidden.

## Contents
1. [Sign up to first publish](#1-sign-up-to-first-publish)
2. [Accept a team invite](#2-accept-a-team-invite)
3. [Copilot chat to a claimed draft](#3-copilot-chat-to-a-claimed-draft)
4. [Upgrade a plan from a locked feature](#4-upgrade-a-plan-from-a-locked-feature)
5. [Team review before publishing](#5-team-review-before-publishing)
6. [Visitor buys a product](#6-visitor-buys-a-product)
7. [Seller fulfils, refunds or cancels an order](#7-seller-fulfils-refunds-or-cancels-an-order)
8. [Buyer protection (escrow)](#8-buyer-protection-escrow)
9. [Delivery with a rider and a delivery code](#9-delivery-with-a-rider-and-a-delivery-code)
10. [Payment link](#10-payment-link)
11. [Booking an appointment](#11-booking-an-appointment)
12. [Subscription and failed renewal](#12-subscription-and-failed-renewal)
13. [Digital download](#13-digital-download)
14. [Event tickets to door check-in](#14-event-tickets-to-door-check-in)
15. [Lead to automation](#15-lead-to-automation)
16. [Short link and QR](#16-short-link-and-qr)
17. [Business partnership](#17-business-partnership)
18. [Report, takedown and appeal (staff)](#18-report-takedown-and-appeal-staff)
19. [Staff sign-in and second-lead approval](#19-staff-sign-in-and-second-lead-approval)
20. [Support message from the website](#20-support-message-from-the-website)
21. [Flow map — how they connect](#21-flow-map)
22. [Gaps in these flows](#22-gaps-in-these-flows)

---

## 1. Sign up to first publish
**Who:** a new business owner. **Starts:** `/signup` (from the website, a claimed handle, or a Copilot link).

| # | Step | What they see | Branches / failures |
|---|---|---|---|
| 1 | Sign up — `pages/auth/SignUp.tsx` | Name, email, password, terms checkbox | Field errors inline. If a handle was claimed on the website (`utils/handleClaim.ts`): "kub.icu/{handle} held for N more minutes". Otherwise a nudge to try Copilot. |
| 2 | Verify email — `/verify` (`VerifyEmail.tsx`) | The email address, "Start building my page" | Resend has a 30 s cooldown. Publishing works before verifying (prototype note). |
| 3 | Goal — `/start` step 0 (`pages/Onboarding.tsx`, `hooks/useOnboarding.ts`) | What the page is for | Progress saved to `kubicu.onboarding.v1`; leaving and coming back resumes. |
| 4 | Kit — step 1 | Business kit suggestions | Skippable. |
| 5 | Identity — step 2 (`IdentityStep.tsx`) | Name, `kub.icu/` handle with live status, photo, bio, city | Handle statuses: empty, invalid, reserved, taken, available (`utils/handles.ts`); suggestions when unavailable. Next is disabled until there's a name and an available handle. **Skip** assigns a free handle. |
| 6 | First action — step 3 (`ActionStep.tsx`) | WhatsApp, booking, link or form | Per-type validation (`actionError`). Skip leaves no action. |
| 7 | Preview — step 4 (`PreviewStep.tsx`) | Mini preview, gaps list, blocking errors | Gaps (no action, unpriced items, hidden blocks, no photo) are warnings. `validateDocument` errors disable "Publish my page". "Edit in canvas first" is always available. Workspace creation can fail (storage full) → toast, nothing lost. |
| 8a | Publish path → Share — step 5 | Live link, share options | — |
| 8b | Edit path → canvas | `/app/canvas/:pageId` | Onboarding state cleared. |
| 9 | Publish from canvas — `components/canvas/PublishDialog.tsx` | Review → success / scheduled / failed / sent | **Errors** block (button reads "Fix {n} to publish"); **warnings** show but don't block; "Everything checks out" when clean. **Schedule**: time must be ≥2 min ahead. **Team role under approvals** → "Send for review" (flow 5). **Failure** → "We couldn't publish", draft kept. Success shows the live link, copy, QR and short-link shortcuts. |

**Sign-in and reset failures:** SSO-required domains show "Use SSO" (owner override available); unknown SSO domain shows a warning (`SignIn.tsx`, `utils/sso.ts`). Password reset always answers "If an account exists…" (no account discovery), link valid 30 min (`ResetPassword.tsx`).

**Ends:** a live page at `kub.icu/{handle}` (`/p/:handle`).

## 2. Accept a team invite
**Who:** someone invited by an owner or admin. **Starts:** `/invite/:token` (`pages/AcceptInvite.tsx`, `utils/team.ts` `inviteState`).

- **Not found** → "This invite link doesn't work".
- **Expired** (7 days) → ask the inviter to resend. **Cancelled** → ask to be re-invited. **Already used** → Sign in.
- **Valid** → inviter, workspace and role, plus a preview of what the role can do (`permissionRows`) → enter name → **Join {workspace}** → membership created → `/app/settings`.
- **Prototype limit:** if the invite belongs to a different local workspace, Join switches workspace and asks the person to reopen the link.

## 3. Copilot chat to a claimed draft
**Who:** a visitor without an account. **Starts:** `/copilot` → `/copilot/chat` (`pages/copilot/CopilotWeb.tsx`, engine `utils/copilot/engine.ts`, state `hooks/useCopilot.ts`).

1. **Privacy notice** (`CopilotPrivacyNotice.tsx`) before the first message.
2. **Brief questions** in priority order (`nextTopic()`): about → name → main action → look → items (shop/menu only) → logo → photos → phone (if ordering/enquiring) → city. 3–6 questions in total; logo and photos come together. Each has reply buttons; typed answers are understood in English only.
   - Card numbers or PINs are removed from the message with a warning.
   - Photos: 5 MB limit each, downscaled, up to `MAX_PHOTOS`; extras are counted and reported.
   - "I don't have one" skips the logo.
3. **Brief card** → Create my draft / Change something / Add more details.
4. **Drafting** — five progress steps. **Failure** (`copilotFailure="generation"`) → "couldn't finish" + Try again, not counted against the limit. **Daily limit** (3 drafts / 10 changes) → limit card, with "Continue to KUBICU" if a draft exists.
5. **Ready card** → Open preview / Make changes / **Continue to KUBICU**.
6. **Private preview** `/d/:id` (`CopilotPreview.tsx`) — real page, noindex, expiry countdown, gaps list, copy link. "Continue in KUBICU" only on the same device and before claiming; a shared link can only view. **Missing / expired** (`copilotFailure="expiredLink"`) → explanation + back to chat / start a new draft.
7. **Claim** — `startClaim` (`utils/copilot/claim.ts`) stores a one-time code valid 30 min → `/copilot/continue` (`CopilotContinue.tsx`). Statuses: missing, expired link, expired draft, already claimed, invalid, ok — each with its own screen.
8. **New or existing account** — `ClaimNewAccount.tsx` (sign up → verify → setup; `failFirst` simulates a sign-in failure) or `ClaimExisting.tsx` (sign in → choose workspace, added as a space).
9. **Ends:** code spent (`markClaimed`), welcome panel in the canvas (`CopilotCanvasWelcome.tsx`), `/app/canvas/:pageId`. Storage failure → toast, draft kept.

**WhatsApp variant** `/copilot/whatsapp` — same engine, WhatsApp-style UI; more than `MAX_BUTTONS` choices become a list sheet; preview and continue open in a new tab; `copilotWhatsApp="unavailable"` → redirect to the browser chat.

**Coming back:** sidebar Copilot section (`SidebarCopilotChats.tsx`) — Pinned, Recent (5), See all chats → `/copilot/chat?view=chats`. Reopening a claimed chat says to edit in the canvas, with Open in KUBICU / Start over.

## 4. Upgrade a plan from a locked feature
**Who:** owner (others can compare but not change). **Starts:** any `PlanLock` / `UpgradeButton` → `openUpgrade({ plan, feature })` (`contexts/UpgradeContext.tsx`) → `ChangePlanDialog.tsx`.

1. **Choose** — plans with "Unlocks this" on the needed plan; trial offer if eligible. Non-owners: "Only the Owner can change the plan".
2. **Review** — upgrade: quote, coupon, account credit, "Continue to pay {amount}". **Downgrade**: impact list, stays on the current plan until period end, no payment.
3. **Pay** (`PaymentStep.tsx`, simulated) — success, declined, expired card, or 3-D Secure challenge (Approve / Fail). Declined and expired return to the form with the reason.
4. **Done** — new plan active, "{feature} is unlocked", charge or "No charge today". The blocked action is now available.

## 5. Team review before publishing
**Who:** an editor when approvals are on; owner/admin reviewers. **Starts:** Publish in the canvas.

1. Owner turns on approvals — Settings → Approvals (`ApprovalsTab.tsx`).
2. Editor presses Publish → **Send for review** → `TeamReview` pending; live page unchanged (`PublishDialog` phase `sent`).
3. Reviewer opens the request (`ReviewDetail.tsx`) — live vs proposed side by side, changed blocks and settings (`utils/reviews.ts`), comments.
4. **Approve** → publishes (or schedules). If the draft changed since opening → banner, must tick "I've checked the latest". **Request changes** → comment required. Requester can **withdraw**.
5. **Ends:** published, or back to the editor with notes.

## 6. Visitor buys a product
**Who:** a shopper. **Starts:** `/p/:handle` or `/p/:handle/shop[/:productId]` (`pages/PublicPage.tsx`, `ProductDetailView.tsx`).

1. **Product** — variants; unavailable combinations disabled; Sold out / preorder / backorder labels (`utils/commerce/catalog.ts` `isSoldOut`, `canSell`).
2. **Cart** (`contexts/CartContext.tsx`, sessionStorage) — choosing a variant first if needed.
3. **Checkout** (`components/checkout/CheckoutSheet.tsx`): cart → details → delivery (physical only: zones or pickup) → review → paying.
   - Pay options: card, transfer to the seller's account, one-time provider account, USSD (**off** until a provider is chosen — `USSD_AVAILABLE`), plus pay on delivery, instalments, deposit now / balance later, and the buyer-protection notice (`PayWithChooser.tsx`, `EscrowNotice.tsx`).
   - Stock and seat holds (`STOCK_HOLD_MINUTES`, `HOLD_MINUTES`) expire → back to cart with a reason.
   - Test outcomes: success, pending, failed, cancelled, timeout. Failed → "failed" step with retry.
4. **Order page** `/p/:handle/order/:orderId` (`pages/OrderStatus.tsx`) — paid / pending / cancelled / refunded; "I've sent the money" for transfers; balance and instalment cards; links to downloads, tickets, courses; gift-card codes; buyer-protection link.

**Ends:** order placed; seller notified (flow 7).

## 7. Seller fulfils, refunds or cancels an order
**Starts:** Commerce → Orders (`pages/commerce/Orders.tsx`) → `OrderDetail.tsx`.
- Status ladder: new → paid → packing → out for delivery → completed. "Confirm transfer received" for bank transfers.
- **Refund** (`RefundDialog.tsx`) — full or partial; sales role has a limit. **Cancel** — refunds if paid and restocks.
- Delivery orders → flow 9. Escrow and disputes → `EscrowPanel.tsx`, `DisputePanel.tsx` (flow 8).

## 8. Buyer protection (escrow)
**Who:** a buyer who paid with protection. **Starts:** `/p/:handle/protect/:orderId` (`pages/BuyerProtection.tsx`).
1. Unlock with the last 4 digits of the order phone number.
2. By stage — **held** → confirm receipt & release, or report a problem (issue, evidence, full or partial); **delivered**; **disputed** → accept the seller's offer, escalate to KUBICU, or withdraw; **escalated** → KUBICU decision shown; **closed**.
3. Delivery-code match (flow 9) also releases the money. Settlement is simulated.

## 9. Delivery with a rider and a delivery code
**Starts:** Deliveries → "Ready to send" (`pages/Deliveries.tsx`, `utils/fulfilment.ts` `readyOrders`).
1. **Book** (`BookDeliverySheet.tsx`) — courier quotes (simulated, by area) or own rider (name, phone, vehicle); pickup slot 8am–6pm. Blocked with no delivery address. Creates a 4-digit delivery code sent to the customer.
2. **Track** (`DeliveryDetail.tsx`) — booked → assigned → picked up → delivered. Cancel before pickup with no fee.
3. **Hand over** — rider enters the customer's code (3 tries). Match → delivered, releases escrow or records pay-on-delivery cash. Three wrong codes → failed (`wrong_code`), order returns to the seller.
4. **Couldn't deliver** → reason (unreachable, wrong address, refused, other) + note → **Book again**.

## 10. Payment link
**Seller:** `components/money/PaymentLinkEditor.tsx` — fixed / open / items amount, staged payments, methods, payer fields and questions, after-payment message or redirect, unique address.
**Payer:** `/p/:handle/pay/:slug` (`pages/PayLinkPage.tsx`) — details → pay → done / declined / awaiting (waiting for the seller to confirm a transfer to their own account).
**Closed states** (`linkView()`, `utils/money/store.ts`): paused, expired, used up (limit reached or all stages paid), fundraiser blocked, shop paused. Staged links show a stage plan.

## 11. Booking an appointment
**Visitor:** Booking block (`BookingBlock.tsx`; "switched off" placeholder in the editor if the service is off) → `BookingSheet.tsx`: time (service, staff, slot via `SlotPicker` / `StaffPicker`) → details (name, phone, email, intake questions) → confirm (deposit, USSD option) → working.
- **No slots** → message in the slot picker. **Taken slot** (simulated "someone else booked") or failure → problem step → pick another time / retry.
- **Ends:** `/p/:handle/booking/:bookingId` (`BookingStatus.tsx`) — requested / confirmed / declined / cancelled / past; reschedule, cancel (free window vs deposit kept), pay balance, join meeting.

**Seller:** `BookingDetail.tsx` — accept or decline (with reason) requests; cancel or reschedule confirmed; after the time: **No-show** or **Completed**; balance tracking.

## 12. Subscription and failed renewal
**Subscribe:** `SubscribeSheet.tsx` — details → delivery (box plans) → pay or bank → working → problem. Outcomes: success, bank confirmation pending, declined. → `/p/:handle/subscription/:token?welcome=1`.
**Portal** (`pages/SubscriptionPortal.tsx`): active (pause, skip, switch plan, update card, cancel), paused (resume), cancelling (keep / undo), past due (update card & pay now), ended (read-only); payment history.
**Renewal:** `SubscriptionRenewer.tsx` runs on a timer; the `simulateNextRenewal` control makes the next one succeed or fail. Failure → past due with retries every `SUB_RETRY_DAYS`, shown in the portal.

## 13. Digital download
**Starts:** order page → "Go to your downloads" → `/p/:handle/download/:token` (`pages/DownloadPage.tsx`).
- Allowed: downloads left, expiry date, PDF stamp preview (`WatermarkPreview.tsx`, preview only), licence keys.
- Blocked reasons (`checkDownload`): refunded/cancelled, limit used, link expired, seller re-uploading, payment unconfirmed — each with its own message.

## 14. Event tickets to door check-in
1. **Create** — Commerce → Events (`pages/commerce/Events.tsx`, `EventEditor.tsx`, `utils/commerce/tickets.ts`). Each ticket type becomes a product. Cancelling an event refunds paid orders.
2. **Buy** — checkout holds seats; seated events use `SeatPicker.tsx`. One ticket (`KUB-XXXX`) per seat.
3. **Ticket** `/p/:handle/ticket/:ticketId` (`TicketPage.tsx`) — QR, code, add to calendar, share. Banners: refunded/cancelled, unpaid, checked in. Not found → unavailable state.
4. **Guest list** `/app/commerce/events/:eventId/guests` — list or seat map, filters, CSV, add a complimentary guest. Needs `tickets.checkin`.
5. **Check-in** `/app/commerce/events/:eventId/check-in` (`CheckIn.tsx`):
   - Name the door first (`DoorNameForm.tsx`).
   - Camera (`useQrScanner.ts`: BarcodeDetector or jsqr; idle, starting, on, **denied**, **unavailable**) or manual search.
   - Results: **admitted**, **already in** (door and time), **refunded/cancelled**, **unpaid**, **wrong event**, **unknown**.
   - **Offline:** checked against the local copy, queued, replayed on reconnect with conflict review. Multiple doors sync across tabs (`utils/liveChannel.ts`, simulated).
   - A test panel simulates every result.

## 15. Lead to automation
1. **Visitor submits** a form (`FormRunner.tsx`: steps, show-if rules, spam trap, minimum fill time, daily limit — all messages in the visitor's language, D344) → `recordSubmission` (`utils/forms/submit.ts`) creates the contact.
2. **Contact** appears in Audience with stage, source and marketing permission (never auto-subscribed).
3. **Automation** — `AutomationBuilder.tsx`; activation blocked by `automationProblems` (name, at least one action, valid webhook…).
4. **Test run** — sample subject, conditions evaluated ("Condition not met" skips), every step previewed, nothing sent.
5. **Live run** — `useAutomationRunner.ts` every 60 s (max 5 per pass, no duplicates); respects workspace pause.
6. **AI drafts** wait in `PendingDrafts.tsx` for Approve / Edit / Discard — never sent automatically.
7. **Failures** — skipped (condition or paused) shown on the run; repeated failures raise an Opportunity.

## 16. Short link and QR
1. **Create** — `CampaignLinkDialog.tsx`: destination page / website / WhatsApp. Website safety (`utils/linkSafety.ts`): blocks non-URLs, credentials, private IPs, self-loops, block-listed hosts, over-long; upgrades http → https. WhatsApp: Nigerian number check, message ≤1024. Address from the name, can't change after creation. Optional start/end dates. Creation rate limit.
2. **QR** — `QrDesigner.tsx`; contrast and scan checks block download when failing.
3. **Click** `/p/:handle/s/:slug` (`pages/ShortLink.tsx`) — records `link_click` (bot and burst flagged) → redirect. States: scheduled (shows main page), paused, ended, stopped as unsafe, WhatsApp number invalid, not found.
4. **Stats** — `LinkStats.tsx`: clicks, people, orders, revenue, outcomes, sources, devices, hours; pause, edit, destination history, delete click data. Website and WhatsApp clicks count as visits in campaign stats (D343).

## 17. Business partnership
1. **Invite** — `WorkTogetherSheet.tsx`: who (KUBICU business or guest by link) → terms (`AgreementFields.tsx`: split, delivery, customer questions, notice) → sent (WhatsApp / copy). Invite valid 7 days.
2. **Partner opens** `/partner/:token` (`PartnerPortal.tsx`): accept / decline; expired; declined. Guests verify phone (6-digit code) and add a bank account before they can be paid.
3. **Change terms** — proposal banner to the other side, accept or decline.
4. **Sell together** — `PartnerSales.tsx`; split at payment, paid out on delivery (simulated).
5. **End** — immediately (safety) or with notice (ending → ended); notice can be cancelled.

## 18. Report, takedown and appeal (staff)
1. **Visitor reports** — `/about/report` or the report link on a page (`ReportPageDialog.tsx`): address, reason, details, optional email → `PageReport` open.
2. **Staff moderate** — `/admin/moderation`: Open reports, Automatic flags (`utils/admin/autoFlags.ts`), Decided, Taken down. Dismiss or **Take page down** (reason required; closes all reports for that page). Restore from Taken down.
3. **Seller appeals** — banner in the workspace → `AppealDialog.tsx` (statement ≥30 characters) → `/admin/appeals`, decided by a different staff member.

## 19. Staff sign-in and second-lead approval
1. **Sign in** (`StaffSignIn.tsx`): password → two-step code (new staff must enrol) → backup codes shown once and acknowledged. Lost phone → one backup code. Disabled accounts blocked.
2. **Sensitive actions** (role change, disable, two-step reset, workspace suspension, payout release, plan change, credit grant) become a request (`utils/admin/approvals.ts`) that a **different** Platform lead approves within 24 h. Rules re-checked on approval (e.g. never leave no active lead). Rejections need a note. Everything audited.

## 20. Support message from the website
`/about/contact` (`pages/marketing/Contact.tsx`, `data/contactForm.ts`) — topic, name, email, link, WhatsApp, message, in the visitor's language. The ticket is filed with the English topic → `/admin/support` (Needs reply / Waiting / Solved): reply or internal note; open → waiting → solved.

## 21. Flow map

```
Website ──► Sign up (1) ──► Onboarding ──► Canvas ──► Publish ──► Live page
   │                                         ▲          │ (team) ► Review (5)
   └──► Copilot (3) ──► Draft ──► Claim ─────┘          ▼
                                                    Live page
Live page ─┬─► Buy (6) ──► Order (7) ──► Delivery (9) ──► Escrow release (8)
           ├─► Book (11)      ├─► Download (13)
           ├─► Subscribe (12) └─► Ticket ──► Check-in (14)
           ├─► Pay link (10)
           ├─► Form ──► Audience ──► Automation (15)
           └─► Short link / QR (16) ──► Analytics
Locked feature ──► Upgrade (4)        Partner invite (17)
Report (18) ──► Staff moderation ──► Takedown ──► Appeal      Staff actions ──► Second lead (19)
```

## 22. Gaps in these flows
Design questions these flows leave open (not testing or provider items):
- **Invite across workspaces** — Join asks the person to reopen the link (flow 2). Real accounts would join directly.
- **Email verification** never blocks anything (flow 1). Decide what, if anything, should wait for it (payouts?).
- **Copilot typed answers** are understood in English only (flow 3).
- **Downgrade impact** when over a limit after the period ends (flow 4) — what is hidden vs kept read-only is described in the impact list but not walked through end-to-end.

Everything else that is open is provider, data or testing work — see `CLAUDE_HANDOFF.md` §17.
