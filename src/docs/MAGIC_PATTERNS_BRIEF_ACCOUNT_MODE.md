# KUBICU — Magic Patterns brief: account-mode states for screens that now have a real server

**Date:** 6 November 2026 · **From:** engineering (AI Engine integration) · **For:** Magic Patterns AI, lead designer
**Read with:** `KUBICU_MAGIC_PATTERNS_MASTER_DESIGN_PLAN.md`, `COMPONENT_STATE_LIBRARY.md`, `CLAUDE_HANDOFF.md`, `DESIGN_DECISION_REGISTER.md` (next number **D529**; D523–D528 are taken), `NOT_FOR_PRODUCTION.md`, `COMPONENT_STATE_LIBRARY.md`, `CORE_USER_FLOWS.md`, `PLAN_MATRIX.md`, `COPILOT_AI_INTEGRATION.md`

---

## 0. What this is, and the rules for it

Real sign-in is live on staging. When the app is built with real sign-in (`realAuthEnabled()` in `utils/auth/realAuth.ts` is true), a person's **account workspaces** live on Kubicu's server instead of in the browser. The server already handles team, invites, ownership, workspace settings, sign-out, the activity log and AI credits.

**Every one of these screens already exists in the prototype.** This brief does **not** ask for new screens or a new look. It asks for the **states the real server has and the prototype never drew**, for example:
- "confirm it's you";
- "this invite link is shown once";
- "the log was verified";
- "no seats left".

Engineering then connects them to the server and tests them in a real browser.

**Rules (owner instructions; they override anything else in this brief):**

1. **Do not restyle or re-lay-out any existing screen.**
   - Add states inside the existing components, using the existing primitives in `COMPONENT_STATE_LIBRARY.md` by their real names:
     - `InlineAlert` for notices (there is no Banner);
     - `Dialog` for confirmations (there is no ConfirmDialog), with `onTop` when a dialog opens over another;
     - `Sheet`, `EmptyState`, `Button` and `Field`.
   - There is no Pagination primitive, so "Load older" (§9) is a new pattern: record it as a decision.
   - If you believe a layout change is needed, record it in the Design Decision Register with the existing **"Pending founder"** label, and do not build it.
2. **Browser mode stays exactly as it is.** In the real product, every new state renders only for an account workspace when real sign-in is on (`realAuthEnabled()`). The 8 existing prototype journeys must keep passing unchanged.
3. **No network calls in your work.**
   - **Build:** make the new states presentational variants driven by props.
   - **Sample data:** put it in one new file following the `data/sample*.ts` convention, `src/data/sampleAccountMode.ts`.
   - **Previewing:** prototype builds have real sign-in off, so the Controls panel can't reach these states through `realAuthEnabled()`. Add one explicit simulation switch, **"Account mode (preview)"**, passed through `App.tsx` like the other Controls props, and make each state previewable from it. List that switch and the sample file in `NOT_FOR_PRODUCTION.md` §1 and its release gate.
   - **Engineering:** replaces the samples with the real API, and in account mode takes the role only from the server, never from "Viewing as".
4. **Do not change behaviour the server enforces** (permissions, seat limits, expiry times). Copy the numbers below; they come from the server.
5. **Wording:**
   - Follow §9 of the master plan. Use plain UK English with typographic apostrophes (’).
   - Wrap every new string in `tr()`, **with drafts in all seven other languages**, as `CLAUDE_HANDOFF.md` requires.
   - Write counts as "Label: n" rather than English plurals. For example, write "Expires in (days): 5", not "expires in 5 days", and "Ahead of you: 2", not "2 ahead of you".
   - Never say something was sent, saved or deleted unless it really was.
6. **Accessibility:**
   - **Width:** 390 px is the design target, but every state must also work at **320 px**.
   - **Touch targets:** at least 44 px.
   - **Status changes:** announced to screen readers.
   - **Keyboard:** keyboard-only operation, with visible focus.
   - **Dialogs:** focus moves into each new dialog and returns to the button that opened it.
   - **Errors:** error text is tied to its field.
7. **Record every decision** as D529 onwards. For each state you add, update:
   - `SCREEN_INVENTORY.md` and `DESIGN_TRACEABILITY_MATRIX.md`;
   - `NOT_FOR_PRODUCTION.md` and `COMPONENT_STATE_LIBRARY.md`;
   - `CORE_USER_FLOWS.md` §2 (the existing invite states);
   - `CLAUDE_HANDOFF.md` §10 (Controls);
   - the Help guides and the Copilot topics that describe these screens. For example, `data/help/serveAndRun.ts` tells people about two-step sign-in and device lists.

**Where to push:**
- Push to a new branch, **`design/account-mode`**, on `htweet/Kubicu-V2`.
- Do not push to `main` or to any `eagle/…` branch, and do not merge anything. Engineering pulls the branch in.
- Finish with a short note in `src/docs/ACCOUNT_MODE_HANDOFF.md` that lists each component you touched and the props of each new state.

---

## Batch 1 — the server is live; these states are needed now

### 1. "Confirm it’s you" (shared, new dialog)

**Server behaviour:** some actions need a sign-in from the **last 15 minutes**. Otherwise the server refuses with `step_up_required`:
- changing someone's role or access;
- removing someone;
- inviting an Admin;
- transferring ownership;
- archiving a workspace;
- changing team policies.

**Design:** one reusable dialog, used by every action above.
1. Title: "Confirm it’s you". Body: "For your security, we’ll send a 6-digit code to {email}."
2. Step 2 is the code field, with the same look and behaviour as the existing sign-in code step (`pages/auth/CodeSignIn.tsx`).
3. On success the dialog closes and **the original action runs again by itself**. The person must not have to redo it.

States to draw:
- sending;
- code sent;
- wrong or expired code;
- too many tries (with "try again in about N minutes"; the app already has this wording);
- offline;
- cancelled (nothing changed, and the original dialog is still open).

### 2. Team → Members (`components/settings/TeamTab.tsx`)

**Server behaviour:**
- **The list:** members show name, e-mail or phone, role, space and branch limits, and joined date.
- **Seats per plan:** Free 1, Creator 1, Pro 1, Business 5, Agency 25, Enterprise 100. Pending invites count as seats.
- **Who may manage:** changing a role or removing someone needs `team.manage` and a "confirm it’s you".
- **What the server refuses:**
  - "Ask another Admin or the Owner to change your role or access." Nobody changes their own role.
  - "The Owner’s role changes only through ownership transfer."
  - "The Owner cannot be removed. Transfer ownership first."
  - **Approver** role: "Approver needs a workspace with Workflows."
- **Leaving:** anyone except the Owner can leave a workspace.

States to draw:
- loading the list;
- loaded;
- couldn’t load (with retry);
- saving a change (on the row);
- saved;
- the change failed (the row keeps its old value, with the reason above);
- "This person is no longer in the team" (someone else removed them first);
- you left the workspace (it disappears from your list, with a toast);
- you lost access while on the page (it shows "This workspace isn’t available to you any more", never "forbidden").

### 3. Invite someone (`components/settings/InviteDialog.tsx`)

**Server behaviour (the biggest difference from the prototype):**
- **Nothing is sent.** E-mail and SMS sending is not switched on yet. The server creates the invite and returns a **link that is shown once**: it is stored only in scrambled form, so it can never be shown again.
- **Expiry:** the link expires after **7 days**.
- **Seat check:** inviting is refused when every seat is taken: "No seats left. The {plan} plan includes {n} seat(s), and all are taken or invited."
- **Duplicates:** a contact that already has a pending invite, or is already a member, is refused: "Already invited or a member."
- **Admin invites** need a "confirm it’s you".

**Design:**
1. After "Create invite", show the link with **Copy link** and **Share on WhatsApp**.
2. Add a clear line: "This link is shown only once. Copy it now. If it’s lost, cancel the invite and create a new one."
3. In account mode, replace the prototype's "Prototype: nothing is sent…" note with honest copy: "Kubicu doesn’t send invites yet. Share this link with {contact} yourself."
4. **Pending invites list:** show contact, role and "expires in N days", with a **Cancel invite** action.
5. There is **no "Resend"** in account mode, because the link can’t be shown again. Use "Cancel and invite again" instead.

States to draw:
- creating;
- link shown;
- copied;
- no seats left (offer "Change plan" if the person has `billing.manage`; otherwise "Ask the Owner");
- already invited or a member;
- confirm it’s you (for Admin);
- cancel-invite confirm;
- cancelled;
- the invite list is empty.

### 4. Accept an invite (`pages/AcceptInvite.tsx`, route `/invite/:token`)

**Server behaviour:**
- **Signed in first:** the person must be signed in.
- **Right account:** the e-mail or phone they signed in with must match the invite. Otherwise: "Sign in with the e-mail address this invite was sent to."
- **Expired, cancelled or used:** the server does **not** say which. It says "Invite not found or expired", so one shared state must cover all three.
- **Seats are checked again** at acceptance: "No seats left … Ask the Owner to free a seat or upgrade."
- **Already a member:** "Already a member."
- **Success:** returns the workspace and role.

States to draw:
- signed out ("Sign in to join {workspace}", which returns here after sign-in);
- checking;
- wrong account (offer "Sign out and use another account");
- not found or expired (offer "Ask {inviter} for a new invite"; don’t guess which of the three happened);
- no seats;
- already a member (offer "Open workspace");
- joined (role shown, then "Open workspace").

### 5. Transfer ownership (in Team)

**Server behaviour:**
- **Permission:** only the Owner can transfer (`ownership.transfer`), and it needs a "confirm it’s you".
- **Effect:** the new Owner must already be an active member. The current Owner **becomes an Admin** straight away.
- **Workspace limit:** refused if the new Owner already owns the most workspaces allowed: "The new owner already owns {n} workspaces, the most allowed. They need to archive one first."

States to draw:
- pick a member;
- the confirm dialog states the consequence ("You’ll become an Admin. {name} will be the Owner and the only person who can transfer it again.");
- confirm it’s you;
- transferring;
- done (your role badge changes to Admin);
- refused (the reason above).

### 6. Workspaces (`components/account/WorkspacesTab.tsx`)

**Server behaviour:**
- **The list:** only active account workspaces where you are an active member.
- **Create:** name and **country (required)**. D495 forbids a workspace without a country, and the currency follows the country. Owner name, type and WhatsApp are optional.
- **Workspace limit (decided, D-AI-2):** the server limits how many workspaces one person may own (20 by default), and the approved limit message already exists. The prototype says "unlimited" (D137, `DESIGN_GAP_AUDIT.md`); record that account mode has a limit.
- **Payouts (decided, D-AI-3):** in account mode, the prototype's "password + two-step code" (D92) becomes the same "Confirm it’s you" step as §1: a fresh e-mail code, plus the second factor when one is set up.
- **Remove = archive:** the server **archives**; nothing is deleted. It needs `workspace.delete` (Owner) and a "confirm it’s you". An archived workspace disappears from everyone's list.

**Design:** the prototype says "Remove". In account mode it should say **"Archive workspace"**, with honest copy: "It disappears for everyone in the team. Its data is kept." Don't promise a restore button: there isn't one yet. Browser workspaces keep their current "Remove" behaviour.

States to draw:
- creating;
- created;
- limit reached (existing message);
- archive confirm;
- confirm it’s you;
- archived;
- failed.

### 7. Workspace settings and team policies (Settings → Business / Team)

**Server behaviour:**
- **Workspace details:** name, owner name, country, currency and WhatsApp need `commerce.settings`. Country and currency are edited together, as in the prototype, and the currency locks after the first paid order (D473). Keep that behaviour.
- **Team policies** need `team.manage` and a "confirm it’s you":
  - **Admins can pay out** can be changed **only by the Owner** ("Only Owners can change who may pay out.");
  - **Sales refund limit**;
  - **Publishing needs review**;
  - **Separation of duties**: someone else must approve.

States to draw:
- saving;
- saved;
- couldn’t save (the old value comes back);
- not allowed (with the reason);
- confirm it’s you.

Most of these controls already exist; add only their account-mode states:
- **Sales refund limit:** Settings → Roles (D57).
- **Publishing needs review:** Settings → Approvals (D58).
- **Admins can pay out:** Commerce → Wallet (D92).

Only **separation of duties** is new. Propose where it lives (next to "Publishing needs review" is the obvious place) and record the decision.

### 8. Account → Security (`components/account/SecurityTab.tsx`)

**Server behaviour:**
- The server supports **"Sign out of this device"** and **"Sign out everywhere"** (every session for this person).
- **It cannot list devices yet.**

**Design (account mode only):**
1. Hide the per-device list. Show one row instead: "Sign out everywhere: signs you out on every phone and computer, including this one."
   - The prototype's "Sign out other devices" (D80) keeps this device signed in; the server's version includes this device. The copy must say so, and you should record the difference as a decision.
2. Keep the prototype's device list in browser mode.
3. The prototype's password and two-step settings have no server behind them yet, because account sign-in uses e-mail codes. In account mode, hide them until they do, and record a decision, rather than showing controls that do nothing.

States to draw:
- confirm;
- signing out;
- signed out (back to the sign-in screen);
- failed.

### 9. Activity log (`components/settings/ActivityTab.tsx`)

**Server behaviour:**
- **Events:** newest first, 50 at a time, with **"Load older"**. Each event has an action (for example `member.role_changed`, `invite.created`, `ownership.transferred`, `workspace.archived`, `settings.changed`), who did it, what it affected, and when.
- **Who did it** comes back as an internal id. Engineering resolves it to a name from the member list. Show "Someone no longer in the team" when there's no match, and "Kubicu" for system actions.
- **Integrity check:** each page comes with `chainIntact`: the server re-checks that the log hasn't been altered.
- **Permission:** viewing needs `audit.view`.

**Design:**
- **Integrity line:**
  - when the check passes: "Log verified: no entries have been changed";
  - when it fails: a clear warning, "We couldn’t verify this log. Contact Kubicu support." Never hide the log in that case.
- **Filters and export:** keep the prototype's filters and export. In account mode they apply to the events loaded so far, so say so ("Showing {n} loaded events. Load older to search further back.").

States to draw:
- loading;
- empty;
- loaded;
- load older;
- verified;
- couldn’t verify;
- couldn’t load;
- not allowed.

### 10. AI credits meter (`components/ai/AiUsageMeter.tsx`, `components/billing/UsageMeters.tsx`)

**Server behaviour (per calendar month, UTC):**
- **Figures:** `allowance`, `committed` (used), `held` (reserved by AI work in progress) and `available`.
- **Monthly credits per plan:** Free 10, Creator 60, Pro 200, Business 500, Agency 1,500, Enterprise 5,000.
- **Unsettled charges:** `unsettledCharges` counts runs charged at their full reservation, because they stopped before reporting what they used.

**Design:** add **"On hold"** to the existing meter, so it reads used, on hold and left, with help text: "Held while AI work is running. Anything unused comes back when it finishes." Keep the existing amber at 80% and red at 100% (D65).

**Credit wording: owner decision D-AI-1 (6 Nov 2026).**
- **Change the promise:** wherever the app promises "Declines, errors and timeouts cost nothing" (D211d), it now says **"You're only charged for steps that finished; anything that fails costs nothing."** Change it in all eight languages and record the decision.
- **Unsettled-charges note:** "{n} AI tasks stopped before reporting usage, so they were charged in full." Write it in the "Label: n" form, for example "Charged in full (stopped before reporting): 2 tasks, 14 credits", and keep it quiet: a footnote, not a warning.

Viewing needs `ai.use`. Without it, keep the existing locked or upsell treatment.

### 11. Shared states (every account-mode screen)

Draw each of these once, as reusable patterns. Use existing components; for the limit wording, keep the approved messages.
- offline;
- the server is unavailable (with retry);
- rate limited ("Try again in about N seconds");
- lost access ("This workspace isn’t available to you any more");
- signed out mid-task ("Your session ended. Sign in again to continue", which returns here after sign-in);
- saved toast.

---

## Batch 2 — AI runs and approvals (for M4; the server part is being built now)

The run store is being built (M3.1). The owner decided the AI screens come in **M4**, so treat this batch as early design. **Field names may still change**; engineering will confirm them before wiring.

**Place it inside what already exists:** Automations (execution history, failure detail, approvals), and the Assistant (`/app/assistant`) where a person starts a task.
- **Not Copilot.** Copilot is signed-out by design and must never act on a workspace (`COPILOT_AI_INTEGRATION.md`; D520). It hands workspace jobs to the Assistant.
- **No new top-level area.** If you think one is needed, record it as a proposal for the owner ("Pending founder").
- **Naming:** "Approvals" already means publish reviews (Settings → Approvals, `approvals.review`), so call these **"Workflow approvals"**. Reuse the Automations pattern "Drafts waiting for you" (Approve / Edit / Discard, D137, with its sidebar badge, D251) where it fits.
- **Roles and plans:**
  - The **Approver** role and the `workflows.view` / `run` / `approve` / `admin` permissions are not yet in the prototype's Roles table. Add them as rows and record the decision.
  - Automations is an app that isn't installed by default (D87).
  - `PLAN_MATRIX.md` has no row yet for runs at once and runs waiting: add one with the numbers below.

**What the server will do:**
- **Starting a run:**
  - A person with `workflows.run` starts an AI task. Credits are checked first ("This needs up to {n} credits; {m} are left this month.").
  - The task is then **queued** and runs in the background.
  - Plans run a limited number at once, and the rest wait in a queue:

    | Plan | At once | Queue |
    |---|---|---|
    | Free | 1 | 5 |
    | Creator | 2 | 10 |
    | Pro | 3 | 20 |
    | Business | 5 | 50 |
    | Agency | 10 | 100 |
    | Enterprise | 20 | 200 |

    A full queue is refused.
  - Each run is limited to 15 minutes and 25 steps.
- **Statuses:**
  - Queued
  - Running
  - Waiting for approval
  - Cancelling
  - Succeeded
  - Failed
  - Cancelled
  - Timed out
  - Rejected
- **Live progress:** steps appear as they happen and survive a page reload.
- **Cancelling:** the person who started a run, or anyone with `workflows.admin`, can cancel it. Actions already carried out aren't undone, so the screen must list them.
- **Credits (decided, D-AI-1):** each model step is charged after it answers, and a step that fails costs nothing. When a run fails or is cancelled partway, the steps that already finished stay charged. The run detail shows "Credits used: n" in every end state.
- **Approvals:**
  - **What can be approved:** sensitive actions pause the run for approval (`workflows.approve`). The approval shows **exactly** what will happen, as a plain summary of the real action, not AI-written text.
  - **Who may approve:** with separation of duties on, the requester can’t approve their own request ("Someone else must approve this").
  - **Expiry:** approvals expire after **48 hours**.
  - **Already decided:** if someone else decided first, show "Already decided by {name}" instead of an error.
- **AI switched off:** when AI is temporarily switched off, the run can't start: "AI is temporarily switched off. Nothing was charged."

**Screens and states:**
1. **Start-run confirm:** the credit estimate and "left this month".
2. **Run list:** filter by status. Show queued position ("2 ahead of you").
3. **Run detail:** a live timeline of steps and tool actions, with credits used, and a cancel action with its consequence.
4. **Approval card in the timeline**, plus an **approvals inbox**, with:
   - approve, and reject with a **required note** (the existing convention for rejections, D58 and D129);
   - expired;
   - withdrawn;
   - decided by someone else;
   - "you can’t approve your own request".
5. **Every end state:**
   - succeeded (with a summary and outputs);
   - failed (with the reason);
   - timed out;
   - cancelled (listing what was already done);
   - rejected.
6. Limit and unavailable states, with the wording above.

Everything here is sample data; label it as illustrative (§10 of the master plan).

---

## What engineering does with your branch

1. **Pull in** `design/account-mode`.
2. **Connect** each state to the live API.
3. **Make every action save to the server's database.**
4. **Test it all in a real browser**, against the real server, with the real sign-in.
5. **Keep the 8 prototype journeys passing.**

Anything that can't be connected without changing your design comes back to you as a numbered question. Nothing is restyled on the engineering side.
