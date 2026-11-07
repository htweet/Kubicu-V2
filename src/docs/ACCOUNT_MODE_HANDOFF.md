# Account mode — design handoff to engineering

**Date:** 6 November 2026 · **Decisions:** D529–D543 · **Branch:** export this project to `design/account-mode` on `htweet/Kubicu-V2` (don't push to `main` or `eagle/…`, don't merge).

Not checked in a browser. Browser mode is unchanged: every account-mode state renders only when `realAuthEnabled() && isAccountWorkspace(ws)`.

## 1. How it's wired

| Piece | File | What engineering does |
|---|---|---|
| Switch (stub) | `utils/auth/realAuth.ts` | Replace with the real file. `setRealAuthStub` is stub-only; remove its call in `AccountModeContext`. |
| Context + step-up | `contexts/AccountModeContext.tsx` | Keep. `active`, `simulation`, `withStepUp(run)`. Drop `simulation` once the API is in. |
| Simulated server | `utils/accountModeSim.ts` | **Replace** with the API client. Keep the shape: `(action, …) → Promise<AccountResult<T>>`. |
| Types | `types/accountMode.ts` | Keep; align field names with the API. |
| Sample data | `data/accountModeSamples.ts` | Replace with live data. Server figures (seats, credits, 15 min, 7 days, 50 per page) are marked. |
| Controls | `App.tsx` props `authMode` (`browser` · `account`), `accountSimulation` | Prototype only — remove before production (NOT_FOR_PRODUCTION). |

`accountSimulation` values: `normal`, `stepUpRequired`, `stepUpRateLimited`, `offline`, `serverDown`, `rateLimited`, `lostAccess`, `sessionEnded`, `noSeats`, `refused`, `conflict`, `logUnverified`, `unsettledCharges`, `empty`. Loading, sending, saving, saved, copied and transferring appear on their own (700 ms simulated delay). Step-up code `000000` = wrong or expired.

Error codes (`AccountErrorCode`): `step_up_required`, `offline`, `server_unavailable`, `rate_limited` (+`retryAfterSeconds`), `lost_access`, `session_ended`, `no_seats`, `refused` (+server `message`), `conflict`, `cancelled` (client-only: step-up cancelled).

## 2. Components touched

Each existing component became a thin switch: `export function X()` returns the account version when `useAccountMode().active`, otherwise the unchanged original (renamed `XBrowser`, not exported).

| Existing component | Account version | New props |
|---|---|---|
| `components/settings/TeamTab.tsx` | `components/accountMode/TeamTabAccount.tsx` + `useTeamAccount.ts` | none (reads context) |
| — (invite inside Team) | `components/accountMode/InviteDialogAccount.tsx` | `open, onClose, onCreated(invite), existingContacts: string[], seatLimit, planName, initialContact?, onScreenFailure(f)` |
| — (inside Team) | `components/accountMode/TeamPoliciesSection.tsx` | `onScreenFailure(f)` |
| `pages/AcceptInvite.tsx` | `components/accountMode/AcceptInviteAccount.tsx` | `token` |
| `components/account/WorkspacesTab.tsx` | `components/accountMode/WorkspacesTabAccount.tsx` | none |
| `components/account/SecurityTab.tsx` | `components/accountMode/SecurityTabAccount.tsx` | none |
| `components/settings/ActivityTab.tsx` | `components/accountMode/ActivityTabAccount.tsx` | none |
| `components/ai/AiUsageMeter.tsx` | `AiCreditMeterAccount` in `components/accountMode/AiCreditsAccount.tsx` | `cost?, className?` |
| `components/billing/UsageMeters.tsx` | AI row uses `useAccountCredits()` + `AiCreditsNotes` | — |
| New shared | `components/account/StepUpDialog.tsx` | `open, simulation, onDone(ok)` (opened only by `withStepUp`) |
| New shared | `components/account/AccountStates.tsx` | `AccountStateAlert({ failure, onRetry?, className? })`, `accountErrorCopy`, `isScreenFailure`, `toastSaved`, `toastFailure` |

`components/settings/InviteDialog.tsx` is unchanged; account mode uses `InviteDialogAccount` from the Team tab.

## 3. States by screen (Batch 1)

1. **Confirm it's you** — intro, sending, code sent, wrong/expired, too many tries ("about N minutes"), offline, server unavailable, cancelled (returns `cancelled`; the opening dialog stays open). On success `withStepUp` runs the original action again. Guarded: role/access change, remove, Admin invite, transfer, archive, policies.
2. **Team → Members** — loading, loaded, couldn't load (retry), row saving, row saved, row failed (old value kept, server reason), "This person is no longer in the team" (`conflict`), leave (non-Owner; toast, back to Workspaces), lost access / session ended replace the tab.
3. **Invite** — creating, link shown once (Copy link, Share on WhatsApp, shown-once warning, "Kubicu doesn't send invites yet…"), copied, no seats (Change plan with `billing.manage`, otherwise ask the Owner), already invited or a member, step-up for Admin, cancel confirm, cancelled, empty list, "Cancel and invite again" instead of Resend.
4. **Accept invite** — signed out, checking, wrong account, not found or expired (one state), no seats, already a member, joined. Preview: `sessionEnded` → signed out, `refused` → wrong account, `empty` → not found, `conflict` → already a member, `noSeats` → no seats on Join.
5. **Transfer ownership** — pick (Make Owner), consequence line, step-up, transferring, done (badge → Admin), refused (owned-workspace limit).
6. **Workspaces** — creating, created, limit reached (placeholder wording, D542), archive confirm, step-up, archived, failed.
7. **Team policies** — saving, saved, couldn't save (old value returns), not allowed, step-up. Payout switch Owner-only.
8. **Security** — confirm, signing out, signed out (→ `/signin`), failed.
9. **Activity** — loading, empty, loaded, load older, verified, couldn't verify (log still shown), couldn't load, not allowed.
10. **AI credits** — used · on hold · left, on-hold help text, unsettled-charges note.
11. **Shared** — offline, server unavailable, rate limited, lost access, session ended (`/signin?next=…` — real sign-in must honour `next`), saved toast.

## 4. Questions for engineering

1. Approved "workspace limit" wording and the owned-workspace limit figure (D542).
2. Permissions for `audit.view` and `ai.use` (mapped to `team.manage` / everyone for now, D541).
3. Does the member list return space and branch limits as ids? The design shows space names.
4. Who should see "Leave workspace" while a step-up is pending? (Leave isn't guarded in the brief.)

## 5. Existing settings controls (D544)

`components/accountMode/useAccountSave.tsx` gives any existing control the server states: `const save = useAccountSave(); const outcome = await save.run({ action: 'policy.save' | 'settings.save', stepUp?, refusal? })` → `'ok' | 'cancelled' | 'failed' | 'screen'`; render `<SaveStatus state={save.state} />` under the control and `<AccountStateAlert failure={save.screenFailure} />` at the top. Commit the new value only on `'ok'`.

Wired: Roles → Sales refund limit (Save button in account mode), Approvals → Editors need approval to publish, Business → Currency, Business → Country, Business WhatsApp number, and the new account-only **Workspace details** card (`components/accountMode/WorkspaceDetailsCard.tsx`, name + owner name, D545).

## 5b. Batch 2 — AI runs and approvals (built, D549–D552)

**Field names are provisional** (run store M3.1). Rename them in `types/aiRuns.ts` and `data/aiRunSamples.ts`; the screens read only those shapes. `AiRun.script` is prototype-only and must not come from the server.

| Component (`components/accountMode/aiRuns/`) | Props | States |
|---|---|---|
| `AutomationsTabs` | `automations`, `automationsPanel`, `earlierRuns` | tabs, Approvals count, lost access / session ended |
| `RunsTab` | `state`, `onOpen(runId)`, `onStart()`, `earlierRuns` | loading, couldn't load, empty, filters, no-match, no workflows.run |
| `RunRow` | `run`, `onOpen` | queue position, step n of 25, credits used |
| `StartRunDialog` | `open`, `onClose`, `automations`, `state`, `onStarted`, `onScreenFailure` | ready, starting, not enough credits, queue full, AI off, shared failures |
| `RunDetailSheet` | `run`, `state`, `onClose`, `onScreenFailure` | live, cancelling, cancel confirm (done actions), cancel not allowed, every end state |
| `RunTimeline` | `run`, `approvals`, `state` | done, in progress, waiting, failed, skipped, tool actions |
| `ApprovalCard` | `approval`, `state`, `className?` | pending, deciding, approved, rejected, expired, withdrawn, already decided by, someone else must approve, no workflows.approve |
| `ApprovalsTab` | `state`, `onOpenRun` | loading, couldn't load, nothing waiting, decided list |
| `RunEndSummary` | `run` | succeeded, failed, timed out, cancelled, rejected |
| `useAiRuns()` | — | returns runs, approvals, status, failure, load, can, limits, start, cancel, decide, advance, isEnded |

Server calls used (in `utils/accountModeSim.ts`): `runs.load`, `run.start`, `run.cancel` (via `withStepUp`), `approval.decide` (via `withStepUp`). Engineering replaces `advance` with the live step feed so steps survive a reload. Permissions: `workflowPermissions` in `data/permissions.ts`.

## 6. Not done yet (D543)

Translations: Batch 1 wording has drafts in all seven languages (D546–D548). Batch 2 has drafts for its labels and explanations (D552–D553); only sample run names, step summaries and the illustrative-data notes stay in English, because the server replaces them. `/signin?next=` is for engineering's real sign-in.

## 7. Batch 2 — AI runs and approvals (early design, not built)

Lives inside **Automations** (execution history, failure detail, approvals) and Copilot — no new top-level area. Field names may change.

- **Start-run confirm:** "This needs up to {n} credits; {m} are left this month." AI off: "AI is temporarily switched off. Nothing was charged."
- **Run list:** status filter (Queued, Running, Waiting for approval, Cancelling, Succeeded, Failed, Cancelled, Timed out, Rejected); queued rows show "2 ahead of you". Full queue refused.
- **Run detail:** live timeline of steps and tool actions (survives reload), credits used, Cancel with consequence — "Actions already carried out aren't undone:" followed by the list. Limits: 15 minutes, 25 steps.
- **Approval card + inbox:** a plain summary of the real action (not AI-written), Approve / Reject with optional comment, Expired (48 h), Withdrawn, "Already decided by {name}", "Someone else must approve this" with separation of duties.
- **End states:** succeeded (summary, outputs), failed (reason), timed out, cancelled (what was done), rejected.
- **Plan limits (at once / queue):** Free 1/5 · Creator 2/10 · Pro 3/20 · Business 5/50 · Agency 10/100 · Enterprise 20/200.

All sample data is illustrative (master plan §10).
